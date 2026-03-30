<div align="center">

# 🌊 Advanced Gather Viewer & Batch Review

**A lightweight, fully offline desktop app for SEG-Y / SGY seismic gather visualization, manual event labeling, and batch review export.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-informational?logo=windows)](../../releases/latest)
[![Release](https://img.shields.io/github/v/release/shokor/advanced-gather-viewer?include_prereleases&label=latest)](../../releases/latest)

**Created by [Shokor A Rahaman](https://github.com/shokor)**

</div>

---

## ⬇️ Download & Run (Windows — No Install Needed)

> **Just download and double-click. No Python, no Node.js, no dependencies.**

<div align="center">

### [📥 Download AdvancedGatherViewer_Shokor.exe](../../releases/latest)

</div>

1. Go to the [**Releases**](../../releases/latest) page
2. Download **`AdvancedGatherViewer_Shokor.exe`**
3. Double-click it — your browser opens the viewer automatically
4. Close the terminal window to stop the app

> **⚠️ Windows SmartScreen warning?**  
> Click **"More info" → "Run anyway"**. This is normal for unsigned open-source apps not distributed through the Microsoft Store.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📂 **Batch file queue** | Load an entire folder of SGY/SEG-Y files, navigate with Prev / Next |
| 🖼️ **Seismic rendering** | Image, Wiggle, and Image+Wiggle display modes |
| 🎨 **Color palettes** | Grey scale and color modes |
| 🎛️ **Full display controls** | Gain, AGC, frequency filter, trace/time/wiggle scale |
| 🏷️ **Manual labeling** | Mark each gather as *event* or *non-event* with auto-advance |
| 📊 **Live stats** | Total files, events, non-events, labeled count |
| 💾 **CSV export** | Export events, non-events, or combined CSV with full metadata |
| 🔖 **Reference preset** | Save and restore your preferred display settings |
| ⚡ **100% offline** | Plotly.js bundled inside — no internet required |

---

## 🖼️ Screenshot

> *Load a folder of SGY files, render gathers, label events, export CSV — all in one window.*

---

## 🛠️ Build from Source

### Requirements
- [Go 1.21+](https://go.dev/dl/)
- Python 3 (to download Plotly.js — one-time only)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/shokor/advanced-gather-viewer.git
cd advanced-gather-viewer

# 2. Download Plotly.js (bundled offline, not stored in git)
python scripts/download_plotly.py

# 3. Build for Windows
GOOS=windows GOARCH=amd64 go build -ldflags="-H windowsgui" -o AdvancedGatherViewer_Shokor.exe .

# 4. Build for Linux
go build -o AdvancedGatherViewer_linux .

# 5. Build for macOS
GOOS=darwin GOARCH=amd64 go build -o AdvancedGatherViewer_mac .
```

---

## 📁 Project Structure

```
advanced-gather-viewer/
├── main.go                          # Go launcher — embeds frontend, starts local HTTP server
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
        ├── release.yml              # Auto-builds .exe on GitHub Release
        └── ci.yml                   # Build check on every push / PR
```

---

## 🔧 How It Works

The app is a single Go binary that:
1. Finds a free local port (starting at 5200)
2. Starts a minimal HTTP server serving the embedded frontend files
3. Opens your default browser to `http://127.0.0.1:<port>`
4. The browser reads SGY/SEG-Y files via the File System Access API — **no files leave your machine**

---

## 📋 Supported Formats

| Format | Extensions |
|--------|-----------|
| SEG-Y rev 1 / rev 2 | `.sgy` `.segy` `.SGY` `.SEGY` |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.  
See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

<div align="center">
Made with ❤️ by <strong>Shokor A Rahaman</strong>
</div>
