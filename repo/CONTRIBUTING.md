# Contributing to Advanced Gather Viewer

Thank you for your interest in contributing! 🎉

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/advanced-gather-viewer.git
   cd advanced-gather-viewer
   ```
3. Set up the project:
   ```bash
   python scripts/download_plotly.py   # download Plotly.js once
   go build .                          # verify it builds
   ```

## Making Changes

- For **bug fixes**: open a PR directly
- For **new features**: open an Issue first to discuss before coding
- For **UI/CSS changes**: include a before/after screenshot in your PR

## Code Style

- Go code: run `gofmt -w .` before committing
- JavaScript: keep changes minimal; the viewer logic is in `frontend/advanced_gather_review.js`
- CSS: variables are defined in `:root` — use them instead of hardcoded colors

## Reporting Bugs

Please include:
- Your OS and browser
- The SGY file characteristics (if relevant)
- Steps to reproduce
- A screenshot if the issue is visual

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
