package config

import (
	"encoding/json"
	"os"
)

type SiteConfig struct {
	Name                string `json:"name"`
	Subtitle            string `json:"subtitle"`
	Footer              string `json:"footer"`
	ShowGeneratorCredit bool   `json:"showGeneratorCredit"`
	ShowPrivacyPolicy   bool   `json:"showPrivacyPolicy"`
	Domain              string `json:"domain"`
}

type NavigationConfig struct {
	Home         string `json:"home"`
	Projects     string `json:"projects"`
	Blog         string `json:"blog"`
	About        string `json:"about"`
	FloatingNav  bool   `json:"floatingNav"`
	StickyHeader bool   `json:"stickyHeader"`
}

type PageMeta struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type PagesConfig struct {
	Blog     PageMeta `json:"blog"`
	Projects PageMeta `json:"projects"`
	About    PageMeta `json:"about"`
	Tags     PageMeta `json:"tags"`
}

type ServerConfig struct {
	Port int `json:"port"`
}

type Config struct {
	Site       SiteConfig             `json:"site"`
	Navigation NavigationConfig       `json:"navigation"`
	Pages      PagesConfig            `json:"pages"`
	Server     ServerConfig           `json:"server"`
	Contact    map[string]string      `json:"contact"`
}

// Load loads site configuration. If path is empty, it automatically starts from
// config-default.json (if present) and overlays config.json (if present).
func Load(path string) (*Config, error) {
	cfg := &Config{
		Server: ServerConfig{Port: 8000},
	}

	if path != "" {
		data, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(data, cfg); err != nil {
			return nil, err
		}
		if cfg.Server.Port == 0 {
			cfg.Server.Port = 8000
		}
		return cfg, nil
	}

	// 1. Try loading base defaults
	hasDefault := false
	if data, err := os.ReadFile("config-default.json"); err == nil {
		_ = json.Unmarshal(data, cfg)
		hasDefault = true
	}

	// 2. Try loading user config override
	hasUserConfig := false
	if data, err := os.ReadFile("config.json"); err == nil {
		if err := json.Unmarshal(data, cfg); err != nil {
			return nil, err
		}
		hasUserConfig = true
	}

	if !hasDefault && !hasUserConfig {
		return nil, os.ErrNotExist
	}

	if cfg.Server.Port == 0 {
		cfg.Server.Port = 8000
	}
	return cfg, nil
}
