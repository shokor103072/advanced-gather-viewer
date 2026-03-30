package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"
)

//go:embed frontend/*
var frontendFiles embed.FS

func findFreePort(start, end int) int {
	for port := start; port <= end; port++ {
		addr := fmt.Sprintf("127.0.0.1:%d", port)
		ln, err := net.Listen("tcp", addr)
		if err == nil {
			ln.Close()
			return port
		}
	}
	return start
}

func openBrowser(url string) {
	time.Sleep(800 * time.Millisecond)
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default:
		cmd = "xdg-open"
		args = []string{url}
	}
	exec.Command(cmd, args...).Start()
}

func main() {
	port := findFreePort(5200, 5300)
	url := fmt.Sprintf("http://127.0.0.1:%d", port)

	sub, err := fs.Sub(frontendFiles, "frontend")
	if err != nil {
		fmt.Fprintln(os.Stderr, "Failed to load frontend files:", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()

	// Serve the advanced gather viewer as root
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path == "/" || path == "/index.html" {
			path = "/advanced_gather_review.html"
		}
		// Strip leading slash for fs.FS
		if len(path) > 0 && path[0] == '/' {
			path = path[1:]
		}
		http.ServeFileFS(w, r, sub, path)
	})

	go openBrowser(url)

	fmt.Printf("Advanced Gather Viewer running at %s\n", url)
	fmt.Println("Close this window to stop.")

	srv := &http.Server{
		Addr:    fmt.Sprintf("127.0.0.1:%d", port),
		Handler: mux,
	}
	if err := srv.ListenAndServe(); err != nil {
		fmt.Fprintln(os.Stderr, "Server error:", err)
		os.Exit(1)
	}
}
