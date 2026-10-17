package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"sieva-ssg/internal/config"
	"sieva-ssg/internal/content"
	"sieva-ssg/internal/render"
)

type Server struct {
	cfg         *config.Config
	engine      *render.Engine
	distDir     string
	port        int
	includeDemo bool
	mu          sync.Mutex
}

func NewServer(cfg *config.Config, engine *render.Engine, distDir string, port int, includeDemo bool) *Server {
	return &Server{
		cfg:         cfg,
		engine:      engine,
		distDir:     distDir,
		port:        port,
		includeDemo: includeDemo,
	}
}

func (s *Server) Rebuild() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	start := time.Now()

	// Hot reload configuration if config files changed
	if updatedCfg, err := config.Load(""); err == nil {
		s.cfg = updatedCfg
		s.engine.SetConfig(updatedCfg)
	}

	site, err := content.LoadAll("content", s.cfg, s.includeDemo)
	if err != nil {
		return fmt.Errorf("content load error: %w", err)
	}

	if err := s.engine.Build(site); err != nil {
		return fmt.Errorf("render error: %w", err)
	}

	log.Printf("⚡ Rebuilt site in %v (%d projects, %d posts)", time.Since(start), len(site.Projects), len(site.BlogPosts))
	return nil
}

func (s *Server) Start() error {
	// Initial build
	if err := s.Rebuild(); err != nil {
		return err
	}

	// Start file watcher in background
	go s.watchFiles()

	fs := http.FileServer(http.Dir(s.distDir))
	mux := http.NewServeMux()
	mux.Handle("/", fs)

	addr := fmt.Sprintf(":%d", s.port)
	log.Printf("🚀 Dev server listening at http://localhost:%d", s.port)
	log.Printf("📁 Serving directory: %s", s.distDir)
	log.Printf("👀 Watching content/, templates/, static/, config*.json for changes...")

	return http.ListenAndServe(addr, mux)
}

func (s *Server) watchFiles() {
	var lastModified time.Time
	checkDirs := []string{"content", "templates", "static", "config.json", "config-default.json"}

	for {
		time.Sleep(500 * time.Millisecond)

		var latest time.Time
		for _, target := range checkDirs {
			_ = filepath.Walk(target, func(path string, info os.FileInfo, err error) error {
				if err == nil && info != nil {
					if info.ModTime().After(latest) {
						latest = info.ModTime()
					}
				}
				return nil
			})
		}

		if lastModified.IsZero() {
			lastModified = latest
			continue
		}

		if latest.After(lastModified) {
			lastModified = latest
			log.Println("🔄 Detected changes, rebuilding...")
			if err := s.Rebuild(); err != nil {
				log.Printf("❌ Rebuild error: %v", err)
			}
		}
	}
}
