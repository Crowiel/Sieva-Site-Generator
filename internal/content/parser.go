package content

import (
	"bytes"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"sieva-ssg/internal/config"

	mathjax "github.com/litao91/goldmark-mathjax"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/renderer/html"
	"gopkg.in/yaml.v3"
)

var (
	frontmatterRegex = regexp.MustCompile(`(?s)^---\r?\n(.*?)\r?\n---\r?\n(.*)$`)
	mermaidRegex     = regexp.MustCompile(`(?s)<pre><code class="language-mermaid">([\s\S]*?)</code></pre>`)
	mdRenderer       = goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			extension.Table,
			extension.Strikethrough,
			extension.TaskList,
			mathjax.MathJax,
		),
		goldmark.WithRendererOptions(
			html.WithUnsafe(),
		),
	)
	placeholderRegex = regexp.MustCompile(`\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}`)
	headingIDRegex   = regexp.MustCompile(`(?i)<h([1-6])>(.*?)\s*\{#([a-zA-Z0-9_-]+)\}</h[1-6]>`)
	calloutRegex     = regexp.MustCompile(`(?s)<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:</p>|<br\s*/?>|\n)?([\s\S]*?)</blockquote>`)
)

func replaceConfigPlaceholders(text string, cfg *config.Config) string {
	if cfg == nil {
		return text
	}

	return placeholderRegex.ReplaceAllStringFunc(text, func(m string) string {
		sub := placeholderRegex.FindStringSubmatch(m)
		if len(sub) < 2 {
			return m
		}
		rawKey := strings.TrimSpace(sub[1])
		cleanKey := strings.ToLower(strings.TrimPrefix(rawKey, "."))

		switch cleanKey {
		case "site.name", "sitename":
			return cfg.Site.Name
		case "site.domain", "sitedomain", "domain":
			return cfg.Site.Domain
		case "site.subtitle":
			return cfg.Site.Subtitle
		case "site.footer":
			return cfg.Site.Footer
		case "year":
			return fmt.Sprintf("%d", time.Now().Year())
		default:
			if strings.HasPrefix(cleanKey, "contact.") {
				field := strings.TrimPrefix(cleanKey, "contact.")
				if cfg.Contact != nil {
					for k, v := range cfg.Contact {
						if strings.EqualFold(k, field) {
							return v
						}
					}
				}
			}
		}
		return m
	})
}

func transformMermaidBlocks(renderedHTML string) string {
	return mermaidRegex.ReplaceAllStringFunc(renderedHTML, func(m string) string {
		sub := mermaidRegex.FindStringSubmatch(m)
		if len(sub) < 2 {
			return m
		}
		raw := sub[1]
		raw = strings.ReplaceAll(raw, "&gt;", ">")
		raw = strings.ReplaceAll(raw, "&lt;", "<")
		raw = strings.ReplaceAll(raw, "&amp;", "&")
		raw = strings.ReplaceAll(raw, "&#39;", "'")
		raw = strings.ReplaceAll(raw, "&quot;", "\"")
		return fmt.Sprintf(`<div class="mermaid-container"><pre class="mermaid">%s</pre></div>`, strings.TrimSpace(raw))
	})
}

func transformCallouts(html string) string {
	return calloutRegex.ReplaceAllStringFunc(html, func(m string) string {
		sub := calloutRegex.FindStringSubmatch(m)
		if len(sub) < 3 {
			return m
		}
		alertType := strings.ToUpper(sub[1])
		body := strings.TrimSpace(sub[2])
		if !strings.HasPrefix(body, "<p") && !strings.HasPrefix(body, "<h") {
			body = "<p>" + body
		}

		var icon string
		switch alertType {
		case "NOTE":
			icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
		case "TIP":
			icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`
		case "WARNING":
			icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
		case "IMPORTANT":
			icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
		case "CAUTION":
			icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
		}

		return fmt.Sprintf(`<div class="callout callout-%s"><div class="callout-header"><span class="callout-icon">%s</span><span class="callout-title">%s</span></div><div class="callout-body">%s</div></div>`,
			strings.ToLower(alertType), icon, alertType, body)
	})
}

func ParseFile(path string, cfg *config.Config, projectSlug string, contentType PostType) (*Post, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	raw := replaceConfigPlaceholders(string(data), cfg)
	var fm Frontmatter
	body := raw

	matches := frontmatterRegex.FindStringSubmatch(raw)
	if len(matches) == 3 {
		yamlContent := matches[1]
		body = matches[2]
		if err := yaml.Unmarshal([]byte(yamlContent), &fm); err != nil {
			return nil, fmt.Errorf("error parsing frontmatter in %s: %w", path, err)
		}
	}

	// Determine slug
	base := filepath.Base(path)
	ext := filepath.Ext(base)
	fileSlug := strings.TrimSuffix(base, ext)
	// Clean demo- prefix if desired or keep clean
	slug := fileSlug
	if fm.ProjectSlug != "" {
		slug = fm.ProjectSlug
	} else if projectSlug != "" {
		slug = projectSlug
	}

	// Normalize date
	var parsedDate time.Time
	if fm.Date != "" {
		t, err := time.Parse("2006-01-02", strings.TrimSpace(fm.Date))
		if err == nil {
			parsedDate = t
		}
	}
	if parsedDate.IsZero() {
		fi, _ := os.Stat(path)
		if fi != nil {
			parsedDate = fi.ModTime()
		} else {
			parsedDate = time.Now()
		}
	}

	// Process shortcodes in body
	processedBody := processCustomDirectives(body, cfg, contentType, slug)

	// Render Markdown to HTML
	var buf bytes.Buffer
	if err := mdRenderer.Convert([]byte(processedBody), &buf); err != nil {
		return nil, fmt.Errorf("markdown conversion error in %s: %w", path, err)
	}

	htmlContent := buf.String()
	hasMermaid := strings.Contains(body, "```mermaid") || strings.Contains(htmlContent, "language-mermaid")
	if hasMermaid {
		htmlContent = transformMermaidBlocks(htmlContent)
	}

	// Transform custom heading IDs: <hN>Title {#my-id}</hN> -> <hN id="my-id">Title</hN>
	htmlContent = headingIDRegex.ReplaceAllString(htmlContent, `<h$1 id="$3">$2</h$1>`)

	// Transform semantic callout alert blocks: > [!NOTE] / [!TIP] / etc.
	if strings.Contains(htmlContent, "[!") {
		htmlContent = transformCallouts(htmlContent)
	}

	hasMath := strings.Contains(body, "$$") ||
		strings.Contains(body, `\[`) ||
		strings.Contains(htmlContent, `\(`) ||
		strings.Contains(htmlContent, `\[`) ||
		strings.Contains(htmlContent, "class=\"math")

	// Parse Gantt tasks if present
	var ganttTasks []GanttTask
	if fm.Gantt != nil {
		if rawSlice, ok := fm.Gantt.([]any); ok {
			rawYaml, err := yaml.Marshal(rawSlice)
			if err == nil {
				_ = yaml.Unmarshal(rawYaml, &ganttTasks)
			}
		}
	}

	ganttSVG := RenderGanttSVG(ganttTasks)

	// Build URL
	var pageURL string
	switch contentType {
	case TypeProject:
		pageURL = fmt.Sprintf("/projects/%s/", slug)
	case TypeBlog:
		// Strip demo- prefix from URL for clean URLs
		urlSlug := strings.TrimPrefix(slug, "demo-")
		pageURL = fmt.Sprintf("/blog/%s/", urlSlug)
	case TypePage:
		pageURL = fmt.Sprintf("/%s/", slug)
	default:
		pageURL = fmt.Sprintf("/%s/", slug)
	}

	post := &Post{
		Slug:          slug,
		URL:           pageURL,
		Title:         fm.Title,
		Date:          parsedDate,
		DateFormatted: parsedDate.Format("January 2, 2006"),
		Description:   fm.Description,
		Tags:          fm.Tags,
		ContentHTML:   template.HTML(htmlContent),
		RawContent:    body,
		Frontmatter:   fm,
		Type:          contentType,
		ProjectSlug:   projectSlug,
		GanttTasks:    ganttTasks,
		GanttSVG:      ganttSVG,
		HasMath:       hasMath,
		HasMermaid:    hasMermaid,
	}

	if post.Title == "" {
		post.Title = strings.Title(strings.ReplaceAll(slug, "-", " "))
	}

	return post, nil
}

func processCustomDirectives(content string, cfg *config.Config, contentType PostType, projectSlug string) string {
	lines := strings.Split(content, "\n")
	var out []string
	i := 0

	for i < len(lines) {
		line := lines[i]
		trimmed := strings.TrimSpace(line)

		// Normalize single-line display math: "$$formula$$" -> "$$\nformula\n$$"
		// Goldmark-MathJax requires opening and closing $$ to be on their own separate lines.
		if strings.HasPrefix(trimmed, "$$") && strings.HasSuffix(trimmed, "$$") && len(trimmed) > 4 {
			mathContent := strings.TrimSpace(trimmed[2 : len(trimmed)-2])
			out = append(out, "$$", mathContent, "$$")
			i++
			continue
		}

		// 1. Gallery Directive: Gallery: img1.png, subfolder/img2.png (Optional Caption)
		if strings.HasPrefix(trimmed, "Gallery:") {
			galleryStr := strings.TrimPrefix(trimmed, "Gallery:")
			imgs := strings.Split(galleryStr, ",")
			var validImgs []string
			for _, img := range imgs {
				if t := strings.TrimSpace(img); t != "" {
					validImgs = append(validImgs, t)
				}
			}

			countClass := fmt.Sprintf("gallery-count-%d", len(validImgs))
			var galleryHTML strings.Builder
			galleryHTML.WriteString(fmt.Sprintf(`<div class="gallery-grid %s" role="region" aria-label="Image Gallery">`, countClass))

			for _, img := range validImgs {
				rawItem := strings.TrimSpace(img)
				if rawItem == "" {
					continue
				}

				// Check for optional caption: "folder/img.png (My Caption)"
				var imgPath, caption string
				if openParen := strings.Index(rawItem, "("); openParen != -1 && strings.HasSuffix(rawItem, ")") {
					imgPath = strings.TrimSpace(rawItem[:openParen])
					caption = strings.TrimSpace(rawItem[openParen+1 : len(rawItem)-1])
				} else {
					imgPath = rawItem
					caption = filepath.Base(rawItem)
				}

				// Normalize slashes and clean leading slashes
				cleanPath := filepath.ToSlash(strings.TrimPrefix(imgPath, "/"))

				var src string
				if strings.HasPrefix(cleanPath, "http://") || strings.HasPrefix(cleanPath, "https://") || strings.HasPrefix(cleanPath, "data:") {
					src = cleanPath
				} else if strings.HasPrefix(cleanPath, "media/") {
					src = "/" + cleanPath
				} else if (contentType == TypeProject || contentType == TypeProjectUpdate) && projectSlug != "" {
					src = fmt.Sprintf("/media/projects/%s/%s", projectSlug, cleanPath)
				} else if contentType == TypeBlog && projectSlug != "" {
					bundleImgPath := filepath.Join("content", "blog", projectSlug, "img", filepath.FromSlash(cleanPath))
					if _, err := os.Stat(bundleImgPath); err == nil {
						src = fmt.Sprintf("/media/blog/%s/%s", projectSlug, cleanPath)
					} else {
						src = fmt.Sprintf("/media/blog/%s", cleanPath)
					}
				} else if contentType == TypeBlog {
					src = fmt.Sprintf("/media/blog/%s", cleanPath)
				} else {
					src = fmt.Sprintf("/media/%s", cleanPath)
				}

				galleryHTML.WriteString(fmt.Sprintf(`
  <figure class="gallery-item">
    <img src="%s" alt="%s" loading="lazy" onclick="openLightbox(this.src, this.alt)" />
  </figure>`, src, template.HTMLEscapeString(caption)))
			}
			galleryHTML.WriteString(`</div>`)
			out = append(out, galleryHTML.String())
			i++
			continue
		}

		// 2. SkillCards Directive:
		// SkillCards:
		//   Title: Programming | Items: C++, Go, Python
		if trimmed == "SkillCards:" {
			var cardsHTML strings.Builder
			cardsHTML.WriteString(`<div class="skills-grid">`)
			i++

			for i < len(lines) {
				cLine := lines[i]
				if !strings.HasPrefix(cLine, "  ") || strings.TrimSpace(cLine) == "" {
					break
				}
				sub := strings.TrimSpace(cLine)
				// Format: Title: X | Items: Y, Z
				if strings.HasPrefix(sub, "Title:") && strings.Contains(sub, "| Items:") {
					parts := strings.SplitN(sub, "| Items:", 2)
					title := strings.TrimSpace(strings.TrimPrefix(parts[0], "Title:"))
					itemsStr := strings.TrimSpace(parts[1])

					// Parse items respecting parentheses
					var items []string
					var currentItem strings.Builder
					parenDepth := 0

					for _, r := range itemsStr {
						if r == '(' {
							parenDepth++
						} else if r == ')' {
							parenDepth--
						}

						if r == ',' && parenDepth == 0 {
							it := strings.TrimSpace(currentItem.String())
							if it != "" {
								items = append(items, it)
							}
							currentItem.Reset()
						} else {
							currentItem.WriteRune(r)
						}
					}
					if currentItem.Len() > 0 {
						it := strings.TrimSpace(currentItem.String())
						if it != "" {
							items = append(items, it)
						}
					}

					cardsHTML.WriteString(fmt.Sprintf(`
  <div class="skill-category">
    <h3>%s</h3>
    <ul>`, template.HTMLEscapeString(title)))

					for _, it := range items {
						cardsHTML.WriteString(fmt.Sprintf(`
      <li>%s</li>`, template.HTMLEscapeString(it)))
					}
					cardsHTML.WriteString(`
    </ul>
  </div>`)
				}
				i++
			}
			cardsHTML.WriteString(`</div>`)
			out = append(out, cardsHTML.String())
			continue
		}

		// 3. ContactButtons Directive: ContactButtons: Email Me | GitHub | LinkedIn
		if strings.HasPrefix(trimmed, "ContactButtons:") {
			buttonsStr := strings.TrimPrefix(trimmed, "ContactButtons:")
			buttons := strings.Split(buttonsStr, "|")
			var btnHTML strings.Builder
			btnHTML.WriteString(`<div class="contact-buttons">`)

			for _, b := range buttons {
				btnName := strings.TrimSpace(b)
				lower := strings.ToLower(btnName)
				var href string
				targetBlank := true

				switch lower {
				case "email me", "email":
					href = "mailto:" + cfg.Contact["email"]
					targetBlank = false
				case "github":
					href = cfg.Contact["github"]
				case "linkedin":
					href = cfg.Contact["linkedin"]
				case "discord":
					href = cfg.Contact["discord"]
				case "twitter":
					href = cfg.Contact["twitter"]
				default:
					if val, ok := cfg.Contact[lower]; ok {
						href = val
					} else {
						href = "#"
					}
				}

				if href == "" {
					href = "#"
				}

				rel := ""
				target := ""
				if targetBlank {
					target = ` target="_blank"`
					rel = ` rel="noopener noreferrer"`
				}

				btnHTML.WriteString(fmt.Sprintf(`
  <a href="%s" class="contact-btn"%s%s>%s</a>`, href, target, rel, template.HTMLEscapeString(btnName)))
			}
			btnHTML.WriteString(`</div>`)
			out = append(out, btnHTML.String())
			i++
			continue
		}

		out = append(out, line)
		i++
	}

	return strings.Join(out, "\n")
}

// LoadAll scans the content directory and builds the full SiteData graph
func LoadAll(contentDir string, cfg *config.Config, includeDemo bool) (*SiteData, error) {
	site := &SiteData{
		Pages: make(map[string]*Post),
	}

	// 1. Load Standalone Pages (about.mdx, privacy.md, etc.)
	if entries, err := os.ReadDir(contentDir); err == nil {
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			name := entry.Name()
			if !strings.HasSuffix(name, ".md") && !strings.HasSuffix(name, ".mdx") {
				continue
			}
			if !includeDemo && strings.HasPrefix(name, "demo-") {
				continue
			}
			ext := filepath.Ext(name)
			slug := strings.TrimSuffix(name, ext)
			filePath := filepath.Join(contentDir, name)
			p, err := ParseFile(filePath, cfg, "", TypePage)
			if err == nil {
				urlSlug := strings.TrimPrefix(slug, "demo-")
				p.Slug = slug
				p.URL = fmt.Sprintf("/%s/", urlSlug)
				site.Pages[urlSlug] = p
			}
		}
	}

	// 2. Load Projects
	projectsDir := filepath.Join(contentDir, "projects")
	if entries, err := os.ReadDir(projectsDir); err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			projSlug := entry.Name()
			projPath := filepath.Join(projectsDir, projSlug)

			var indexPost *Post
			var updates []*Post

			files, _ := os.ReadDir(projPath)
			for _, file := range files {
				if file.IsDir() {
					continue
				}
				name := file.Name()
				if !strings.HasSuffix(name, ".md") && !strings.HasSuffix(name, ".mdx") {
					continue
				}

				// Skip demo files if not in includeDemo mode
				if !includeDemo && strings.HasPrefix(name, "demo-") {
					continue
				}

				filePath := filepath.Join(projPath, name)
				isIndex := strings.Contains(name, "-index.") || name == "index.md" || name == "index.mdx"

				if isIndex {
					p, err := ParseFile(filePath, cfg, projSlug, TypeProject)
					if err == nil {
						p.Slug = projSlug
						p.URL = fmt.Sprintf("/projects/%s/", projSlug)
						indexPost = p
					}
				} else {
					p, err := ParseFile(filePath, cfg, projSlug, TypeProjectUpdate)
					if err == nil {
						updates = append(updates, p)
					}
				}
			}

			if indexPost != nil {
				// Sort updates by date descending
				sort.Slice(updates, func(i, j int) bool {
					return updates[i].Date.After(updates[j].Date)
				})
				indexPost.Updates = updates
				if len(updates) > 0 {
					indexPost.LatestUpdate = updates[0]
				}
				site.Projects = append(site.Projects, indexPost)
			}
		}
	}

	// Sort projects by date descending
	sort.Slice(site.Projects, func(i, j int) bool {
		return site.Projects[i].Date.After(site.Projects[j].Date)
	})
	if len(site.Projects) > 6 {
		site.RecentProjects = site.Projects[:6]
	} else {
		site.RecentProjects = site.Projects
	}

	// 3. Load Blog Posts (supports both single file posts and directory bundles)
	blogDir := filepath.Join(contentDir, "blog")
	if entries, err := os.ReadDir(blogDir); err == nil {
		for _, entry := range entries {
			name := entry.Name()
			if entry.IsDir() {
				// Check for directory-based blog post: content/blog/<slug>/index.md
				if name == "img" {
					continue
				}
				if !includeDemo && strings.HasPrefix(name, "demo-") {
					continue
				}
				bundlePath := filepath.Join(blogDir, name)
				bundleEntries, err := os.ReadDir(bundlePath)
				if err != nil {
					continue
				}
				for _, be := range bundleEntries {
					if be.IsDir() {
						continue
					}
					bName := be.Name()
					if !strings.HasSuffix(bName, ".md") && !strings.HasSuffix(bName, ".mdx") {
						continue
					}
					isIndex := strings.HasPrefix(bName, "index.") || strings.Contains(bName, "-index.") || strings.TrimSuffix(strings.TrimSuffix(bName, ".mdx"), ".md") == name
					if isIndex {
						filePath := filepath.Join(bundlePath, bName)
						p, err := ParseFile(filePath, cfg, name, TypeBlog)
						if err == nil {
							site.BlogPosts = append(site.BlogPosts, p)
						}
						break
					}
				}
				continue
			}

			if !strings.HasSuffix(name, ".md") && !strings.HasSuffix(name, ".mdx") {
				continue
			}
			// Skip demo files if not in includeDemo mode
			if !includeDemo && strings.HasPrefix(name, "demo-") {
				continue
			}

			filePath := filepath.Join(blogDir, name)
			p, err := ParseFile(filePath, cfg, "", TypeBlog)
			if err == nil {
				site.BlogPosts = append(site.BlogPosts, p)
			}
		}
	}

	// Sort blog posts by date descending
	sort.Slice(site.BlogPosts, func(i, j int) bool {
		return site.BlogPosts[i].Date.After(site.BlogPosts[j].Date)
	})
	if len(site.BlogPosts) > 5 {
		site.RecentBlog = site.BlogPosts[:5]
	} else {
		site.RecentBlog = site.BlogPosts
	}

	// Combine all posts for tags
	site.AllPosts = append(site.AllPosts, site.Projects...)
	site.AllPosts = append(site.AllPosts, site.BlogPosts...)

	// 4. Aggregate Tags
	tagMap := make(map[string][]*Post)
	for _, p := range site.AllPosts {
		for _, tag := range p.Tags {
			cleaned := strings.TrimSpace(tag)
			if cleaned != "" {
				tagMap[cleaned] = append(tagMap[cleaned], p)
			}
		}
	}

	for tagName, posts := range tagMap {
		tagSlug := strings.ToLower(regexp.MustCompile(`[^a-zA-Z0-9_-]+`).ReplaceAllString(tagName, "-"))
		site.Tags = append(site.Tags, &TagGroup{
			Name:  tagName,
			Slug:  tagSlug,
			URL:   fmt.Sprintf("/tags/%s/", tagSlug),
			Count: len(posts),
			Posts: posts,
		})
	}

	// Sort tags by count descending, then alphabetical
	sort.Slice(site.Tags, func(i, j int) bool {
		if site.Tags[i].Count != site.Tags[j].Count {
			return site.Tags[i].Count > site.Tags[j].Count
		}
		return site.Tags[i].Name < site.Tags[j].Name
	})

	return site, nil
}
