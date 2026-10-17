package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"sieva-ssg/internal/config"
	"sieva-ssg/internal/content"
	"sieva-ssg/internal/render"
	"sieva-ssg/internal/server"
)

func main() {
	configPath := flag.String("config", "", "Path to configuration file (default: config.json)")
	port := flag.Int("port", 0, "Server port (overrides config port)")
	demoFlag := flag.Bool("demo", false, "Include demo content (files starting with demo-)")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	if *port > 0 {
		cfg.Server.Port = *port
	}

	args := flag.Args()
	cmd := "build"
	if len(args) > 0 {
		cmd = args[0]
	}

	// Check for demo commands or flags
	includeDemo := *demoFlag
	if cmd == "build-demo" {
		includeDemo = true
	} else if cmd == "dev" {
		includeDemo = true
	}

	templateDir := "templates"
	distDir := "dist"
	contentDir := "content"

	engine := render.NewEngine(cfg, templateDir, distDir)

	switch cmd {
	case "serve", "dev":
		srv := server.NewServer(cfg, engine, distDir, cfg.Server.Port, includeDemo)
		if err := srv.Start(); err != nil {
			log.Fatalf("❌ Server error: %v", err)
		}

	case "build", "build-demo":
		start := time.Now()
		modeStr := "Production (excluding demo- files)"
		if includeDemo {
			modeStr = "Demo (including demo- files)"
		}
		fmt.Printf("🔨 Building static site for %s (%s)...\n", cfg.Site.Name, cfg.Site.Domain)
		fmt.Printf("   • Build Mode: %s\n", modeStr)

		site, err := content.LoadAll(contentDir, cfg, includeDemo)
		if err != nil {
			log.Fatalf("❌ Failed to load content: %v", err)
		}

		if err := engine.Build(site); err != nil {
			log.Fatalf("❌ Build error: %v", err)
		}

		fmt.Printf("✅ Build completed in %v\n", time.Since(start))
		fmt.Printf("   • %d Projects processed\n", len(site.Projects))
		fmt.Printf("   • %d Blog posts processed\n", len(site.BlogPosts))
		fmt.Printf("   • %d Tags indexed\n", len(site.Tags))
		fmt.Printf("   • Output written to ./%s/\n", distDir)

	case "clean":
		_ = os.RemoveAll(distDir)
		fmt.Println("🧹 Dist directory cleaned.")

	default:
		fmt.Printf("Unknown command: %s\nUsage: sieva-ssg [build|build-demo|serve|dev|clean] [--demo] [--port 8000]\n", cmd)
		os.Exit(1)
	}
}
