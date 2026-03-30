# Advanced Gather Viewer & Batch Review

A lightweight, fully offline desktop application for SEG-Y / SGY seismic gather visualization, manual event labeling, and batch review export.

> **Created by [Shokor A Rahaman](https://github.com/shokor)**

---

## ✨ Features

- 📂 **Batch file queue** — load an entire folder of SGY/SEG-Y files and navigate with Prev / Next
- 🖼️ **Seismic rendering** — Image, Wiggle, and Image+Wiggle display modes with grey scale / color palettes
- 🎛️ **Full display controls** — gain, AGC, frequency filter (low-cut / high-cut), trace scale, time scale, wiggle gain/clip
- 🏷️ **Manual labeling** — mark each gather as *event* or *non-event* with optional auto-advance
- 📊 **Live stats** — total files, events, non-events, labeled count
- 💾 **CSV export** — export events, non-events, or combined with filename, path, label, size, and review order
- 🔖 **Reference view preset** — save and restore your preferred display settings
- ⚡ **100% offline** — no internet required after install; Plotly.js is bundled inside the executable

---

## 🚀 Download & Run (Windows)

1. Go to the [**Releases**](../../releases) page
2. Download `AdvancedGatherViewer.exe`
3. Double-click — your browser opens the viewer automatically
4. Close the terminal window to stop

> **Windows SmartScreen note:** Because the app is unsigned, Windows may show a warning the first time.  
> Click **"More info" → "Run anyway"** to proceed. This is normal for open-source unsigned apps.

---

## 🛠️ Build from Source

### Requirements
- [Go 1.21+](https://go.dev/dl/)
- Python 3 (to download Plotly.js — one-time only)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/advanced-gather-viewer.git
cd advanced-gather-viewer

# 2. Download Plotly.js into frontend/ (bundled offline)
python scripts/download_plotly.py

# 3. Build for Windows (from any OS)
GOOS=windows GOARCH=amd64 go build -ldflags="-H windowsgui" -o AdvancedGatherViewer.exe .

# 4. Build for Linux
go build -o AdvancedGatherViewer .

# 5. Build for macOS
GOOS=darwin GOARCH=amd64 go build -o AdvancedGatherViewer_mac .
```

---

## 📁 Project Structure

```
advanced-gather-viewer/
├── main.go                          # Go launcher — embeds frontend, starts local server
├── go.mod
├── frontend/
│   ├── advanced_gather_review.html  # Main UI
│   ├── advanced_gather_review.css   # Styling
│   ├── advanced_gather_review.js    # SEG-Y parser + Plotly renderer
│   └── plotly.min.js                # Bundled offline (downloaded by script, not in git)
├── scripts/
│   └── download_plotly.py           # Helper to fetch Plotly.js for local builds
└── .github/
    └── workflows/
        └── release.yml              # Auto-builds .exe on GitHub Release
```

---

## 🔧 How It Works

The app is a single Go binary that:
1. Finds a free local port (starting at 5200)
2. Starts a minimal HTTP server serving the embedded frontend files
3. Opens the user's default browser to the local URL
4. The browser-based UI reads SGY/SEG-Y files directly via the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) — no files are uploaded anywhere

---

## 📋 Supported File Formats

| Format | Extensions |
|--------|-----------|
| SEG-Y rev 1 / rev 2 | `.sgy`, `.segy`, `.SGY`, `.SEGY` |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss any major changes.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request
