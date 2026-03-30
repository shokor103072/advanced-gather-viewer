
const els = {
  folderInput: document.getElementById('folder-input'), filesInput: document.getElementById('files-input'),
  chooseFolderBtn: document.getElementById('choose-folder-btn'), chooseFilesBtn: document.getElementById('choose-files-btn'),
  openCurrentBtn: document.getElementById('open-current-btn'), prevBtn: document.getElementById('prev-btn'), nextBtn: document.getElementById('next-btn'),
  autoNext: document.getElementById('auto-next'), batchStatus: document.getElementById('batch-status'), queueList: document.getElementById('queue-list'), queueCount: document.getElementById('queue-count'),
  currentFileBox: document.getElementById('current-file-box'), statTotal: document.getElementById('stat-total'), statEvent: document.getElementById('stat-event'), statNonevent: document.getElementById('stat-nonevent'), statLabeled: document.getElementById('stat-labeled'), labeledTbody: document.getElementById('labeled-tbody'),
  markEventBtn: document.getElementById('mark-event-btn'), markNonEventBtn: document.getElementById('mark-nonevent-btn'), clearLabelBtn: document.getElementById('clear-label-btn'),
  exportEventBtn: document.getElementById('export-event-btn'), exportNonEventBtn: document.getElementById('export-nonevent-btn'), exportAllBtn: document.getElementById('export-all-btn'),
  metaStripText: document.getElementById('meta-strip-text'), presetRefBtn: document.getElementById('preset-ref-btn'), renderStatus: document.getElementById('render-status'), plot: document.getElementById('plot-gather'),
  displayMode: document.getElementById('display-mode'), colorMode: document.getElementById('color-mode'), areaFill: document.getElementById('area-fill'), gainMode: document.getElementById('gain-mode'),
  startChannel: document.getElementById('start-channel'), endChannel: document.getElementById('end-channel'), startMs: document.getElementById('start-ms'), endMs: document.getElementById('end-ms'),
  timeLines: document.getElementById('time-lines'), traceLines: document.getElementById('trace-lines'), invPol: document.getElementById('inv-pol'), topAxis: document.getElementById('top-axis'), useFreqFilter: document.getElementById('use-freq-filter'), agcMs: document.getElementById('agc-ms'), lowCut: document.getElementById('low-cut'), highCut: document.getElementById('high-cut'),
  traceScale: document.getElementById('trace-scale'), timeScale: document.getElementById('time-scale'), colorGain: document.getElementById('color-gain'), wiggleGain: document.getElementById('wiggle-gain'), wiggleClip: document.getElementById('wiggle-clip'),
  traceScaleVal: document.getElementById('trace-scale-val'), timeScaleVal: document.getElementById('time-scale-val'), colorGainVal: document.getElementById('color-gain-val'), wiggleGainVal: document.getElementById('wiggle-gain-val'), wiggleClipVal: document.getElementById('wiggle-clip-val'),
  renderBtn: document.getElementById('render-btn'), resetViewBtn: document.getElementById('reset-view-btn')
};

let batchFiles = [];
let currentIndex = -1;
let currentData = null;
let currentFs = 2000;
let currentTextHeader = '';
let currentFile = null;
let labels = new Map();
let reviewCounter = 0;

function htmlEscape(v){return String(v??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function downloadBlob(filename, content, type='text/plain'){const blob = content instanceof Blob ? content : new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},0);}
function batchKey(file){return file.webkitRelativePath || file.name;}
function formatFs(fs){return Number.isFinite(fs)&&fs>0 ? `${Math.round(fs)} Hz` : 'unknown';}
function updateSliderReadouts(){[['traceScale','traceScaleVal'],['timeScale','timeScaleVal'],['colorGain','colorGainVal'],['wiggleGain','wiggleGainVal'],['wiggleClip','wiggleClipVal']].forEach(([a,b])=>els[b].textContent=Number(els[a].value).toFixed(3));}
function referencePreset(){els.displayMode.value='Image'; els.colorMode.value='Grey scale'; els.areaFill.value='Area +'; els.gainMode.value='Norm'; els.startChannel.value='0'; els.endChannel.value='500'; els.startMs.value='0'; els.endMs.value='1200'; els.timeLines.checked=true; els.traceLines.checked=false; els.invPol.checked=false; els.topAxis.checked=true; els.useFreqFilter.checked=false; els.agcMs.value='250'; els.lowCut.value='10'; els.highCut.value='250'; els.traceScale.value='3.227'; els.timeScale.value='1.051'; els.colorGain.value='1'; els.wiggleGain.value='0.073'; els.wiggleClip.value='1'; updateSliderReadouts(); }
referencePreset();

els.chooseFolderBtn.onclick = ()=>els.folderInput.click();
els.chooseFilesBtn.onclick = ()=>els.filesInput.click();
els.folderInput.onchange = ()=>setBatchFiles(els.folderInput.files||[]);
els.filesInput.onchange = ()=>setBatchFiles(els.filesInput.files||[]);
els.openCurrentBtn.onclick = ()=>openCurrent(); els.prevBtn.onclick=()=>moveCurrent(-1); els.nextBtn.onclick=()=>moveCurrent(1); els.markEventBtn.onclick=()=>setLabel('event'); els.markNonEventBtn.onclick=()=>setLabel('non-event'); els.clearLabelBtn.onclick=()=>clearLabel(); els.exportEventBtn.onclick=()=>exportCsv('event'); els.exportNonEventBtn.onclick=()=>exportCsv('non-event'); els.exportAllBtn.onclick=()=>exportCsv('all'); els.renderBtn.onclick=()=>renderCurrent(); els.resetViewBtn.onclick=()=>{referencePreset(); renderCurrent();}; els.presetRefBtn.onclick=()=>{referencePreset(); renderCurrent();};
['displayMode','colorMode','areaFill','gainMode','startChannel','endChannel','startMs','endMs','timeLines','traceLines','invPol','topAxis','useFreqFilter','agcMs','lowCut','highCut'].forEach(k=>els[k].addEventListener('change', ()=>renderCurrent()));
['traceScale','timeScale','colorGain','wiggleGain','wiggleClip'].forEach(k=>els[k].addEventListener('input', ()=>{updateSliderReadouts(); renderCurrent();}));
window.addEventListener('resize', ()=>{ if(currentData) Plotly.Plots.resize(els.plot); });

document.addEventListener('keydown', e=>{ if(e.target.tagName==='INPUT' || e.target.tagName==='SELECT') return; if(e.key==='ArrowRight') moveCurrent(1); else if(e.key==='ArrowLeft') moveCurrent(-1); else if(e.key.toLowerCase()==='e') setLabel('event'); else if(e.key.toLowerCase()==='n') setLabel('non-event'); });

function setBatchFiles(fileList){
  batchFiles = Array.from(fileList).filter(f=>/\.(sgy|segy)$/i.test(f.name)).sort((a,b)=>batchKey(a).localeCompare(batchKey(b),undefined,{numeric:true,sensitivity:'base'}));
  currentIndex = batchFiles.length ? 0 : -1;
  updateBatchUi();
  if(batchFiles.length) openCurrent();
}

function updateBatchUi(){
  const total=batchFiles.length, eventCount=[...labels.values()].filter(v=>v.label==='event').length, nonEventCount=[...labels.values()].filter(v=>v.label==='non-event').length, labeled=labels.size;
  els.batchStatus.textContent = total ? `Loaded ${total} file(s). Viewing ${Math.max(0,currentIndex)+1} / ${total}.` : 'No batch loaded.';
  els.queueCount.textContent = String(total); els.statTotal.textContent=String(total); els.statEvent.textContent=String(eventCount); els.statNonevent.textContent=String(nonEventCount); els.statLabeled.textContent=String(labeled);
  const cur = batchFiles[currentIndex];
  if(cur){ const key=batchKey(cur); const lab=labels.get(key)?.label; els.currentFileBox.textContent = key + (lab ? ` — ${lab}` : ''); } else els.currentFileBox.textContent='No file selected.';
  renderQueue(); renderLabelTable();
}
function renderQueue(){ if(!batchFiles.length){ els.queueList.innerHTML='<div class="status-box">No files loaded.</div>'; return; } const start=Math.max(0,Math.min(batchFiles.length-1,currentIndex-4)); const end=Math.min(batchFiles.length,start+16); els.queueList.innerHTML=''; for(let i=start;i<end;i++){ const f=batchFiles[i], key=batchKey(f), lab=labels.get(key)?.label; const btn=document.createElement('button'); btn.type='button'; btn.className='queue-item'+(i===currentIndex?' active':''); btn.innerHTML=`<span class="num">${i+1}</span><span style="flex:1; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${htmlEscape(f.name)}</span>${lab?`<span class="badge ${lab==='event'?'badge-event':'badge-nonevent'}">${htmlEscape(lab)}</span>`:''}`; btn.onclick=()=>{currentIndex=i; updateBatchUi(); openCurrent();}; els.queueList.appendChild(btn);} }
function renderLabelTable(){ const rows=[...labels.values()].sort((a,b)=>a.reviewOrder-b.reviewOrder); if(!rows.length){ els.labeledTbody.innerHTML='<tr><td colspan="5">No labeled files yet.</td></tr>'; return;} els.labeledTbody.innerHTML=rows.map((r,idx)=>`<tr><td>${idx+1}</td><td>${htmlEscape(r.name)}</td><td>${htmlEscape(r.label)}</td><td>${htmlEscape(r.relativePath)}</td><td>${(r.size/1024/1024).toFixed(3)}</td></tr>`).join(''); }
function getCurrentFile(){ return currentIndex>=0 && currentIndex<batchFiles.length ? batchFiles[currentIndex] : null; }
function moveCurrent(step){ if(!batchFiles.length) return; currentIndex=Math.max(0,Math.min(batchFiles.length-1,currentIndex+step)); updateBatchUi(); openCurrent(); }
function setLabel(label){ const file=getCurrentFile(); if(!file) return; const key=batchKey(file); const prev=labels.get(key) || {}; labels.set(key,{ name:file.name, relativePath:key, label, size:file.size, reviewOrder: prev.reviewOrder || ++reviewCounter }); updateBatchUi(); if(els.autoNext.checked && currentIndex < batchFiles.length-1){ currentIndex++; updateBatchUi(); openCurrent(); } }
function clearLabel(){ const file=getCurrentFile(); if(!file) return; labels.delete(batchKey(file)); updateBatchUi(); }
function exportCsv(which){ const rows=[...labels.values()].filter(r=>which==='all' || r.label===which).sort((a,b)=>a.reviewOrder-b.reviewOrder); if(!rows.length){ alert('No labeled files to export.'); return; } const header='review_order,label,file,relative_path,size_bytes,size_mb\n'; const body=rows.map(r=>[r.reviewOrder,r.label,escapeCsv(r.name),escapeCsv(r.relativePath),r.size,(r.size/1024/1024).toFixed(6)].join(',')).join('\n'); downloadBlob(which==='all'?'labels_combined.csv':which==='event'?'labels_event.csv':'labels_non_event.csv', header+body+'\n', 'text/csv;charset=utf-8'); }
function escapeCsv(v){ const s=String(v??''); return /[\",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }
async function openCurrent(){ const file=getCurrentFile(); if(!file) return; els.renderStatus.textContent=`Loading ${file.name}...`; currentFile=file; const buffer = await file.arrayBuffer(); const parsed=parseSEGY(buffer); currentData=parsed.data; currentFs=parsed.fs || 2000; currentTextHeader=parsed.textHeader || ''; const maxCh=Math.max(0,currentData.length-1); els.startChannel.max=String(maxCh); els.endChannel.max=String(maxCh); if(+els.endChannel.value>maxCh) els.endChannel.value=String(maxCh); const maxMs=(currentData[0].length/currentFs)*1000; if(+els.endMs.value>maxMs) els.endMs.value=String(Math.floor(maxMs)); updateMeta(); renderCurrent(); }
function updateMeta(){ if(!currentData){ els.metaStripText.textContent='Load a batch and open a file to start.'; return; } const ch0=clampInt(els.startChannel.value,0,currentData.length-1); const ch1=clampInt(els.endChannel.value,ch0,currentData.length-1); const ms0=clampFloat(els.startMs.value,0,1e9); const maxMs=(currentData[0].length/currentFs)*1000; const ms1=clampFloat(els.endMs.value,ms0+1,maxMs); const sample0=Math.floor(ms0*currentFs/1000), sample1=Math.min(currentData[0].length, Math.ceil(ms1*currentFs/1000)); els.metaStripText.innerHTML=`File: <strong>${htmlEscape(batchKey(currentFile))}</strong> &nbsp; | &nbsp; fs: <strong>${formatFs(currentFs)}</strong> &nbsp; | &nbsp; Channels: <strong>${ch0}-${ch1}</strong> (${ch1-ch0+1}) &nbsp; | &nbsp; Window: <strong>${ms0.toFixed(1)}-${ms1.toFixed(1)} ms</strong> &nbsp; | &nbsp; Samples: <strong>${sample1-sample0}</strong> &nbsp; | &nbsp; Display: <strong>${htmlEscape(els.displayMode.value.toLowerCase())}</strong> &nbsp; | &nbsp; Palette: <strong>${htmlEscape(els.colorMode.value.toLowerCase())}</strong> &nbsp; | &nbsp; Orientation: <strong>top axis = channel, left axis = time</strong>`; }
function clampInt(v,min,max){ const n=parseInt(v,10); return Math.max(min, Math.min(max, Number.isFinite(n)?n:min)); }
function clampFloat(v,min,max){ const n=parseFloat(v); return Math.max(min, Math.min(max, Number.isFinite(n)?n:min)); }
function sliceWindow(){ if(!currentData) return null; const ch0=clampInt(els.startChannel.value,0,currentData.length-1); const ch1=clampInt(els.endChannel.value,ch0,currentData.length-1); const maxMs=(currentData[0].length/currentFs)*1000; const ms0=clampFloat(els.startMs.value,0,maxMs); const ms1=clampFloat(els.endMs.value,ms0+0.5,maxMs); const i0=Math.max(0,Math.floor(ms0*currentFs/1000)); const i1=Math.min(currentData[0].length,Math.ceil(ms1*currentFs/1000)); const matrix=currentData.slice(ch0,ch1+1).map(r=>r.slice(i0,i1)); return {matrix,ch0,ch1,ms0,ms1,i0,i1}; }
function percentileAbs(arr,q=0.985){ const vals=[]; for(let i=0;i<arr.length;i++){ const av=Math.abs(arr[i]); if(Number.isFinite(av)) vals.push(av);} if(!vals.length) return 1; vals.sort((a,b)=>a-b); return Math.max(vals[Math.min(vals.length-1,Math.floor(q*(vals.length-1)))],1e-9); }
function buildIndices(length,maxCount){ if(length<=maxCount){ return Array.from({length},(_,i)=>i); } const idx=[]; const step=(length-1)/(maxCount-1); for(let k=0;k<maxCount;k++) idx.push(Math.round(k*step)); idx[0]=0; idx[idx.length-1]=length-1; return [...new Set(idx)]; }
function transpose2D(m){ const rows=m.length, cols=m[0]?.length||0; const out=Array.from({length:cols},()=>new Array(rows)); for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) out[c][r]=m[r][c]; return out; }
function slidingAbsMean(row,half){ const n=row.length; const pref=new Float64Array(n+1); for(let i=0;i<n;i++) pref[i+1]=pref[i]+Math.abs(row[i]||0); const out=new Array(n); for(let i=0;i<n;i++){ const a=Math.max(0,i-half), b=Math.min(n-1,i+half); out[i]=(pref[b+1]-pref[a])/Math.max(1,b-a+1) || 1; } return out; }
function preprocess(matrix){ const gain=els.gainMode.value.toLowerCase(); const inv=els.invPol.checked; const useFreq=els.useFreqFilter.checked; const low=+els.lowCut.value||0, high=+els.highCut.value||0; const agcHalf=Math.max(1,Math.round(((+els.agcMs.value||250)/1000)*currentFs/2)); return matrix.map(row=>{ let out=row.map(v=>inv?-v:v); if(useFreq && high>low && currentFs>0){ out=freqBandpass(out,currentFs,low,Math.min(high,currentFs*0.49)); }
  if(gain==='agc'){ const env=slidingAbsMean(out,agcHalf); out=out.map((v,i)=>v/(env[i]||1)); }
  else if(gain==='norm'){ const s=percentileAbs(out,0.985)||1; out=out.map(v=>v/s); }
  return out; }); }
function fft(re,im,inverse=false){ const n=re.length; const levels=Math.log2(n); if(Math.round(levels)!==levels) throw new Error('FFT length must be power of 2'); for(let i=0,j=0;i<n;i++){ if(j>i){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } let m=n>>1; while(m>=1 && j>=m){ j-=m; m>>=1; } j+=m; } for(let size=2; size<=n; size<<=1){ const half=size>>1, ang=(inverse?2:-2)*Math.PI/size; const wpr=Math.cos(ang), wpi=Math.sin(ang); for(let i=0;i<n;i+=size){ let wr=1, wi=0; for(let j=0;j<half;j++){ const k=i+j, l=k+half; const tr=wr*re[l]-wi*im[l], ti=wr*im[l]+wi*re[l]; re[l]=re[k]-tr; im[l]=im[k]-ti; re[k]+=tr; im[k]+=ti; const nwr=wr*wpr-wi*wpi; wi=wr*wpi+wi*wpr; wr=nwr; } } } if(inverse){ for(let i=0;i<n;i++){ re[i]/=n; im[i]/=n; } } }
function nextPow2(n){ let p=1; while(p<n) p<<=1; return p; }
function freqBandpass(row, fs, low, high){ const n=row.length, N=nextPow2(n); const re=new Array(N).fill(0), im=new Array(N).fill(0); for(let i=0;i<n;i++) re[i]=row[i]; fft(re,im,false); for(let k=0;k<N;k++){ const f=(k<=N/2 ? k : N-k)*fs/N; if(f<low || f>high){ re[k]=0; im[k]=0; } } fft(re,im,true); return re.slice(0,n); }
function renderCurrent(){ if(!currentData){ els.renderStatus.textContent='No file opened yet.'; return; } updateMeta(); const w=sliceWindow(); if(!w || !w.matrix.length || !w.matrix[0]?.length){ els.renderStatus.textContent='No data available in the selected window.'; return; }
  const processed=preprocess(w.matrix);
  const traceIdx=buildIndices(processed.length, 1200);
  const sampleIdx=buildIndices(processed[0].length, 3000);
  const disp=traceIdx.map(r=>sampleIdx.map(c=>processed[r][c]));
  const x=traceIdx.map(r=>w.ch0+r); const y=sampleIdx.map(c=>w.ms0 + c*1000/currentFs);
  const display=els.displayMode.value.toLowerCase(); const color=els.colorMode.value.toLowerCase();
  const data=[];
  if(display!=='wiggle'){
    const vals=[]; for(const row of disp) for(const v of row) vals.push(Math.abs(v)); vals.sort((a,b)=>a-b); const clip=vals[Math.min(vals.length-1, Math.floor(0.992*(vals.length-1)))] || 1; const zMax=Math.max(1e-9, clip/Math.max(0.1,+els.colorGain.value||1));
    const colorscale = color==='color' ? [[0,'rgb(0,43,119)'],[0.15,'rgb(69,117,180)'],[0.5,'rgb(235,235,235)'],[0.85,'rgb(176,64,64)'],[1,'rgb(93,0,0)']] : [[0,'rgb(20,20,20)'],[0.5,'rgb(232,232,232)'],[1,'rgb(20,20,20)']];
    data.push({type:'heatmap', z:transpose2D(disp), x, y, colorscale, zmin:-zMax, zmax:zMax, showscale:false, zsmooth:false, hovertemplate:'idx %{x}<br>t=%{y:.1f} ms<br>amp=%{z:.3g}<extra></extra>'});
  }
  if(display!=='image'){
    const wiggleGain=+els.wiggleGain.value||1, wiggleClip=+els.wiggleClip.value||1, traceScale=+els.traceScale.value||1; const ampScale=Math.max(0.1, 0.14*traceScale); const area=els.areaFill.value;
    for(let r=0;r<disp.length;r++){
      const row=disp[r]; const denom=percentileAbs(row,0.985)||1; const xs=row.map(v=>{ const s=Math.max(-wiggleClip, Math.min(wiggleClip, (v/denom)*wiggleGain)); return x[r] + (s/Math.max(0.1,wiggleClip))*ampScale; });
      data.push({type:'scattergl', mode:'lines', x:xs, y, line:{color:'rgba(25,25,25,0.95)', width:1}, hoverinfo:'skip', showlegend:false});
      if(area!=='None'){
        const fillX=[x[r], ...xs, x[r]]; const fillY=[y[0], ...y, y[y.length-1]]; data.push({type:'scattergl', mode:'lines', x:fillX, y:fillY, line:{color:'rgba(0,0,0,0)'}, fill:'toself', fillcolor:'rgba(20,20,20,0.12)', hoverinfo:'skip', showlegend:false});
      }
    }
  }
  const viewportH = Math.max(window.innerHeight || 700, 700);
  const height=Math.round(Math.max(600, viewportH * 0.72) * Math.max(1, (+els.timeScale.value||1)));
  els.plot.style.height=height+'px';
  const wrap=document.getElementById('plot-wrap');
  if(wrap) wrap.style.minHeight=(height+24)+'px';
  const layout={paper_bgcolor:'#ededed', plot_bgcolor:'#ededed', height:height, margin:{l:78,r:16,t:36,b:12}, autosize:false, font:{family:'Space Mono, monospace', size:11, color:'#5a5a5a'}, xaxis:{title:'idx', side:els.topAxis.checked?'top':'bottom', range:[w.ch0,w.ch1], showgrid:els.traceLines.checked, gridcolor:'rgba(0,0,0,0.1)', zeroline:false}, yaxis:{title:'t [ms]', autorange:'reversed', range:[w.ms1,w.ms0], showgrid:els.timeLines.checked, gridcolor:'rgba(0,0,0,0.1)', zeroline:false}, showlegend:false};
  Plotly.react(els.plot, data, layout, {responsive:true, displayModeBar:true, scrollZoom:true});
  requestAnimationFrame(()=>{
    els.plot.style.height=height+'px';
    els.plot.style.minHeight=height+'px';
    const wrap = document.getElementById('plot-wrap');
    if(wrap){ wrap.style.height=height+'px'; wrap.style.minHeight=height+'px'; }
    els.plot.querySelectorAll('.js-plotly-plot, .plot-container, .svg-container').forEach((node)=>{
      node.style.height=height+'px';
      node.style.minHeight=height+'px';
      node.style.width='100%';
    });
    Plotly.Plots.resize(els.plot);
  });
  els.renderStatus.textContent=`Rendered ${w.ch1-w.ch0+1} trace(s) × ${w.i1-w.i0} sample(s) from ${currentFile.name} using ${display} / ${color}.`;
}


function parseSEGY(buffer){
  const dv = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  const total = buffer.byteLength;
  if (total < 3600) throw new Error('File too small to be a valid SEG-Y (< 3600 bytes)');

  let textHeader = '';
  for (let i = 0; i < 3200; i++) {
    const ch = u8[i];
    textHeader += (ch >= 32 && ch <= 126) ? String.fromCharCode(ch) : ' ';
  }

  const BH = 3200;
  const sampleIntervalUs = dv.getInt16(BH + 16, false);
  const samplesPerTrace  = dv.getInt16(BH + 20, false);
  const formatCode       = dv.getInt16(BH + 24, false);
  const FORMAT_BPS = { 1: 4, 2: 4, 3: 2, 5: 4, 8: 1 };
  const bps = FORMAT_BPS[formatCode] || 4;

  function ibmToIEEE(raw) {
    const sign = (raw >>> 31) ? -1 : 1;
    const exp  = ((raw >>> 24) & 0x7F) - 64;
    const mant = (raw & 0x00FFFFFF) / 16777216.0;
    return sign * mant * Math.pow(16, exp);
  }

  const traces = [];
  let detectedFs = sampleIntervalUs > 0 ? 1e6 / sampleIntervalUs : null;
  let tp = 3600;
  const MAX_TRACES = 20000;

  while (tp + 240 <= total) {
    const tNSamples = dv.getInt16(tp + 114, false) || samplesPerTrace;
    const tSiUs = dv.getInt16(tp + 116, false) || sampleIntervalUs;
    if (!detectedFs && tSiUs > 0) detectedFs = 1e6 / tSiUs;
    const nS = tNSamples > 0 ? tNSamples : samplesPerTrace;
    const dataBytes = nS * bps;
    if (tp + 240 + dataBytes > total) break;

    const row = new Float64Array(nS);
    let dp = tp + 240;
    if (formatCode === 1) {
      for (let i = 0; i < nS; i++) { row[i] = ibmToIEEE(dv.getUint32(dp, false)); dp += 4; }
    } else if (formatCode === 5) {
      for (let i = 0; i < nS; i++) { row[i] = dv.getFloat32(dp, false); dp += 4; }
    } else if (formatCode === 2) {
      for (let i = 0; i < nS; i++) { row[i] = dv.getInt32(dp, false); dp += 4; }
    } else if (formatCode === 3) {
      for (let i = 0; i < nS; i++) { row[i] = dv.getInt16(dp, false); dp += 2; }
    } else if (formatCode === 8) {
      for (let i = 0; i < nS; i++) { row[i] = dv.getInt8(dp); dp += 1; }
    } else {
      for (let i = 0; i < nS; i++) { row[i] = dv.getFloat32(dp, false); dp += 4; }
    }

    traces.push(Array.from(row));
    tp += 240 + dataBytes;
    if (traces.length >= MAX_TRACES) break;
  }

  if (!traces.length) throw new Error('No traces decoded from SEG-Y file.');
  const minLen = Math.min(...traces.map(t => t.length));
  return { data: traces.map(t => t.slice(0, minLen)), fs: detectedFs, textHeader };
}

updateBatchUi(); updateSliderReadouts();
