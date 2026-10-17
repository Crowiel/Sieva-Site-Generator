package render

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"sieva-ssg/internal/config"
	"sieva-ssg/internal/content"
)

type PageContext struct {
	Title        string
	Description  string
	CanonicalURL string
	ActiveNav    string
	Year         int
	Site         config.SiteConfig
	Contact      map[string]string
	SiteData     *content.SiteData
	PageMeta     config.PageMeta
	Post         *content.Post
	Tag          *content.TagGroup
	HasMath      bool
	HasMermaid   bool
}

var tagSanitizeRegex = regexp.MustCompile(`[^a-zA-Z0-9_-]+`)

func SanitizeTag(tag string) string {
	return strings.ToLower(tagSanitizeRegex.ReplaceAllString(tag, "-"))
}

type Engine struct {
	cfg         *config.Config
	templateDir string
	distDir     string
	funcMap     template.FuncMap
}

func NewEngine(cfg *config.Config, templateDir, distDir string) *Engine {
	e := &Engine{
		cfg:         cfg,
		templateDir: templateDir,
		distDir:     distDir,
	}
	e.funcMap = template.FuncMap{
		"sanitizeTag": SanitizeTag,
		"formatDate": func(t time.Time, layout string) string {
			return t.Format(layout)
		},
		"safeHTML": func(s string) template.HTML {
			return template.HTML(s)
		},
	}
	return e
}

func (e *Engine) SetConfig(cfg *config.Config) {
	e.cfg = cfg
}

func (e *Engine) renderTemplate(pageTpl string, ctx PageContext) ([]byte, error) {
	basePath := filepath.Join(e.templateDir, "base.html")
	pagePath := filepath.Join(e.templateDir, pageTpl)

	t, err := template.New("base.html").Funcs(e.funcMap).ParseFiles(basePath, pagePath)
	if err != nil {
		return nil, fmt.Errorf("error parsing template %s: %w", pageTpl, err)
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, ctx); err != nil {
		return nil, fmt.Errorf("error executing template %s: %w", pageTpl, err)
	}
	return buf.Bytes(), nil
}

func (e *Engine) writePage(relPath string, data []byte) error {
	fullPath := filepath.Join(e.distDir, relPath)
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return err
	}
	return os.WriteFile(fullPath, data, 0644)
}

func (e *Engine) Build(site *content.SiteData) error {
	_ = os.RemoveAll(e.distDir)
	if err := os.MkdirAll(e.distDir, 0755); err != nil {
		return err
	}

	currentYear := time.Now().Year()
	baseURL := strings.TrimRight(e.cfg.Site.Domain, "/")
	if baseURL == "" {
		baseURL = "https://example.com"
	}

	baseCtx := PageContext{
		Site:     e.cfg.Site,
		Contact:  e.cfg.Contact,
		SiteData: site,
		Year:     currentYear,
	}

	// 1. Render Homepage -> dist/index.html
	homeCtx := baseCtx
	homeCtx.ActiveNav = "home"
	homeCtx.Title = e.cfg.Site.Name + " — " + e.cfg.Site.Subtitle
	homeCtx.Description = e.cfg.Site.Subtitle
	homeCtx.CanonicalURL = baseURL + "/"
	homeHTML, err := e.renderTemplate("index.html", homeCtx)
	if err != nil {
		return err
	}
	if err := e.writePage("index.html", homeHTML); err != nil {
		return err
	}

	// 2. Render Projects List -> dist/projects/index.html
	projListCtx := baseCtx
	projListCtx.ActiveNav = "projects"
	projListCtx.Title = e.cfg.Pages.Projects.Title
	projListCtx.Description = e.cfg.Pages.Projects.Description
	projListCtx.PageMeta = e.cfg.Pages.Projects
	projListCtx.CanonicalURL = baseURL + "/projects/"
	projListHTML, err := e.renderTemplate("project-list.html", projListCtx)
	if err != nil {
		return err
	}
	if err := e.writePage("projects/index.html", projListHTML); err != nil {
		return err
	}

	// 3. Render Individual Projects -> dist/projects/<slug>/index.html
	for _, proj := range site.Projects {
		pCtx := baseCtx
		pCtx.ActiveNav = "projects"
		pCtx.Title = proj.Title
		pCtx.Description = proj.Description
		pCtx.Post = proj
		pCtx.HasMath = proj.HasMath
		pCtx.HasMermaid = proj.HasMermaid
		pCtx.CanonicalURL = baseURL + proj.URL
		html, err := e.renderTemplate("project-single.html", pCtx)
		if err != nil {
			return err
		}
		if err := e.writePage(fmt.Sprintf("projects/%s/index.html", proj.Slug), html); err != nil {
			return err
		}
	}

	// 4. Render Blog List -> dist/blog/index.html
	blogListCtx := baseCtx
	blogListCtx.ActiveNav = "blog"
	blogListCtx.Title = e.cfg.Pages.Blog.Title
	blogListCtx.Description = e.cfg.Pages.Blog.Description
	blogListCtx.PageMeta = e.cfg.Pages.Blog
	blogListCtx.CanonicalURL = baseURL + "/blog/"
	blogListHTML, err := e.renderTemplate("blog-list.html", blogListCtx)
	if err != nil {
		return err
	}
	if err := e.writePage("blog/index.html", blogListHTML); err != nil {
		return err
	}

	// 5. Render Individual Blog Posts -> dist/blog/<slug>/index.html
	for _, post := range site.BlogPosts {
		bCtx := baseCtx
		bCtx.ActiveNav = "blog"
		bCtx.Title = post.Title
		bCtx.Description = post.Description
		bCtx.Post = post
		bCtx.HasMath = post.HasMath
		bCtx.HasMermaid = post.HasMermaid
		bCtx.CanonicalURL = baseURL + post.URL
		html, err := e.renderTemplate("blog-single.html", bCtx)
		if err != nil {
			return err
		}
		// Strip leading/trailing slashes for path
		cleanURL := strings.Trim(post.URL, "/")
		if err := e.writePage(fmt.Sprintf("%s/index.html", cleanURL), html); err != nil {
			return err
		}
	}

	// 6. Render Tags List -> dist/tags/index.html
	tagListCtx := baseCtx
	tagListCtx.Title = e.cfg.Pages.Tags.Title
	tagListCtx.Description = e.cfg.Pages.Tags.Description
	tagListCtx.PageMeta = e.cfg.Pages.Tags
	tagListCtx.CanonicalURL = baseURL + "/tags/"
	tagListHTML, err := e.renderTemplate("tag-list.html", tagListCtx)
	if err != nil {
		return err
	}
	if err := e.writePage("tags/index.html", tagListHTML); err != nil {
		return err
	}

	// 7. Render Individual Tag Archives -> dist/tags/<slug>/index.html
	for _, tag := range site.Tags {
		tCtx := baseCtx
		tCtx.Title = tag.Name + " Archives"
		tCtx.Description = fmt.Sprintf("Projects and articles tagged with %s", tag.Name)
		tCtx.Tag = tag
		tCtx.CanonicalURL = baseURL + tag.URL
		html, err := e.renderTemplate("tag-single.html", tCtx)
		if err != nil {
			return err
		}
		if err := e.writePage(fmt.Sprintf("tags/%s/index.html", tag.Slug), html); err != nil {
			return err
		}
	}

	// 8. Render Standalone Pages (e.g. About, Privacy, etc.) -> dist/<slug>/index.html
	for slug, page := range site.Pages {
		pCtx := baseCtx
		pCtx.ActiveNav = slug
		pCtx.Title = page.Title
		pCtx.Description = page.Description
		pCtx.Post = page
		pCtx.HasMath = page.HasMath
		pCtx.HasMermaid = page.HasMermaid
		cleanSlug := strings.Trim(page.URL, "/")
		pCtx.CanonicalURL = fmt.Sprintf("%s/%s/", baseURL, cleanSlug)
		html, err := e.renderTemplate("page.html", pCtx)
		if err != nil {
			return err
		}
		if err := e.writePage(fmt.Sprintf("%s/index.html", cleanSlug), html); err != nil {
			return err
		}
	}

	// 8b. Render 404 Page -> dist/404.html
	notFoundCtx := baseCtx
	notFoundCtx.Title = "404 Not Found"
	notFoundCtx.Description = "Resource not found on this system"
	if notFoundHTML, err := e.renderTemplate("404.html", notFoundCtx); err == nil {
		_ = e.writePage("404.html", notFoundHTML)
	}

	// 9. Copy Static Assets
	if err := copyDir("static", filepath.Join(e.distDir, "static")); err != nil {
		// Log warning but continue if empty
	}
	// Copy favicon to root of dist as well
	if favData, err := os.ReadFile("static/favicon.svg"); err == nil {
		_ = e.writePage("favicon.svg", favData)
	}

	// 10. Copy Content Images to dist/media/
	e.copyContentMedia()

	// 11. Generate Sitemap, Robots.txt, .htaccess & Nginx snippet
	e.generateMetaFiles(site)

	return nil
}

func (e *Engine) copyContentMedia() {
	// Project images: content/projects/<slug>/img/ -> dist/media/projects/<slug>/
	projDir := filepath.Join("content", "projects")
	if entries, err := os.ReadDir(projDir); err == nil {
		for _, entry := range entries {
			if entry.IsDir() {
				srcImg := filepath.Join(projDir, entry.Name(), "img")
				if fi, err := os.Stat(srcImg); err == nil && fi.IsDir() {
					destImg := filepath.Join(e.distDir, "media", "projects", entry.Name())
					_ = copyDir(srcImg, destImg)
				}
			}
		}
	}

	// Blog root images: content/blog/img/ -> dist/media/blog/
	blogImg := filepath.Join("content", "blog", "img")
	if fi, err := os.Stat(blogImg); err == nil && fi.IsDir() {
		destImg := filepath.Join(e.distDir, "media", "blog")
		_ = copyDir(blogImg, destImg)
	}

	// Bundle blog post images: content/blog/<slug>/img/ -> dist/media/blog/<slug>/
	blogDir := filepath.Join("content", "blog")
	if entries, err := os.ReadDir(blogDir); err == nil {
		for _, entry := range entries {
			if entry.IsDir() && entry.Name() != "img" {
				srcImg := filepath.Join(blogDir, entry.Name(), "img")
				if fi, err := os.Stat(srcImg); err == nil && fi.IsDir() {
					destImg := filepath.Join(e.distDir, "media", "blog", entry.Name())
					_ = copyDir(srcImg, destImg)
				}
			}
		}
	}
}

func (e *Engine) generateMetaFiles(site *content.SiteData) {
	// 1. Robots.txt
	robotsContent := fmt.Sprintf("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n", e.cfg.Site.Domain)
	_ = e.writePage("robots.txt", []byte(robotsContent))

	// 2. Sitemap.xml
	var sm strings.Builder
	sm.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	sm.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + "\n")

	domain := strings.TrimRight(e.cfg.Site.Domain, "/")
	addURL := func(loc string, prio string) {
		sm.WriteString("  <url>\n")
		sm.WriteString(fmt.Sprintf("    <loc>%s%s</loc>\n", domain, loc))
		sm.WriteString("    <changefreq>weekly</changefreq>\n")
		sm.WriteString(fmt.Sprintf("    <priority>%s</priority>\n", prio))
		sm.WriteString("  </url>\n")
	}

	addURL("/", "1.0")
	addURL("/projects/", "0.9")
	addURL("/blog/", "0.8")
	addURL("/tags/", "0.6")

	for _, page := range site.Pages {
		addURL(page.URL, "0.7")
	}

	for _, p := range site.Projects {
		addURL(p.URL, "0.9")
	}
	for _, b := range site.BlogPosts {
		addURL(b.URL, "0.8")
	}
	for _, t := range site.Tags {
		addURL(t.URL, "0.5")
	}

	sm.WriteString(`</urlset>`)
	_ = e.writePage("sitemap.xml", []byte(sm.String()))

	// Extract clean hostname for server configurations
	host := domain
	if u, err := url.Parse(domain); err == nil && u.Host != "" {
		host = u.Host
	} else {
		host = strings.TrimPrefix(host, "https://")
		host = strings.TrimPrefix(host, "http://")
		host = strings.Split(host, "/")[0]
	}
	hostName := strings.Split(host, ":")[0]
	if hostName == "" {
		hostName = "example.com"
	}

	serverNames := hostName
	if hostName != "localhost" && !strings.HasPrefix(hostName, "www.") && !strings.Contains(hostName, "127.0.0.1") {
		serverNames = fmt.Sprintf("%s www.%s", hostName, hostName)
	}

	// 3. Apache .htaccess
	htaccess := fmt.Sprintf(`# Apache 2.4+ Configuration for %s
Options -Indexes
DirectorySlash On

<IfModule mod_mime.c>
  AddType image/svg+xml .svg
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

ErrorDocument 404 /404.html
`, hostName)
	_ = e.writePage(".htaccess", []byte(htaccess))

	// 4. Reference nginx.conf snippet
	nginxSnippet := fmt.Sprintf(`# Nginx server block snippet for %s
server {
    listen 80;
    server_name %s;
    root /var/www/%s;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;

    # Caching for static assets
    location ~* \.(css|js|svg|png|jpg|jpeg|gif|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
`, hostName, serverNames, hostName)
	_ = e.writePage("nginx.conf", []byte(nginxSnippet))
}

func copyDir(src, dst string) error {
	srcInfo, err := os.Stat(src)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(dst, srcInfo.Mode()); err != nil {
		return err
	}

	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			if err := copyFile(srcPath, dstPath); err != nil {
				return err
			}
		}
	}
	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
