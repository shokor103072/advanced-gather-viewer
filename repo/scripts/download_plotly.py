#!/usr/bin/env python3
"""
Download Plotly.js for offline bundling.
Run this once before building: python scripts/download_plotly.py
"""
import urllib.request
import os
import sys

PLOTLY_VERSION = "2.35.2"
URL = f"https://cdn.plot.ly/plotly-{PLOTLY_VERSION}.min.js"
OUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "plotly.min.js")
OUT = os.path.normpath(OUT)

def main():
    print(f"Downloading Plotly.js v{PLOTLY_VERSION}...")
    try:
        urllib.request.urlretrieve(URL, OUT)
        size_mb = os.path.getsize(OUT) / 1_000_000
        print(f"✓ Saved to {OUT} ({size_mb:.1f} MB)")
    except Exception as e:
        print(f"✗ Download failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
