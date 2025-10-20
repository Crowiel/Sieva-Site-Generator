// Static layout for Apache hosting - generates proper relative paths
export interface LayoutOptions {
  showProjects?: boolean;
  showBlog?: boolean;
}

export interface SiteConfig {
  site: {
    name: string;
    subtitle: string;
    footer: string;
    showGeneratorCredit?: boolean;
    domain?: string;
  };
  navigation: {
    home: string;
    projects: string;
    blog: string;
    about: string;
  };
}

export function renderLayout(
  title: string, 
  content: string, 
  additionalHead: string = "",
  options: LayoutOptions = { showProjects: true, showBlog: true },
  config?: SiteConfig
): string {
  const { showProjects = true, showBlog = true } = options;
  
  // Use config values or fallback to defaults
  const siteName = config?.site.name || "Your Name";
  const siteSubtitle = config?.site.subtitle || "Automation & Embedded Systems";
  const footerText = config?.site.footer || "Automation Engineer & Embedded Systems Developer";
  const showGeneratorCredit = config?.site.showGeneratorCredit !== false; // Default to true
  const navHome = config?.navigation.home || "Home";
  const navProjects = config?.navigation.projects || "Projects";
  const navBlog = config?.navigation.blog || "Blog";
  const navAbout = config?.navigation.about || "About";
  
  // Always use absolute paths for assets to avoid path issues
  const basePath = "/";
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="/styles/main.css">
  <link rel="stylesheet" href="/styles/components.css">
  ${additionalHead}
</head>
<body>
  <header class="site-header">
    <nav class="nav">
      <div class="nav-brand">
        <a href="/">
          <span class="brand-name">${siteName}</span>
          <span class="brand-subtitle">${siteSubtitle}</span>
        </a>
      </div>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
        <span class="hamburger"></span>
        <span class="hamburger"></span>
        <span class="hamburger"></span>
      </button>
      <ul class="nav-links">
        <li><a href="/">${navHome}</a></li>
        ${showProjects ? `<li><a href="/posts">${navProjects}</a></li>` : ''}
        ${showBlog ? `<li><a href="/blog">${navBlog}</a></li>` : ''}
        <li><a href="/about">${navAbout}</a></li>
      </ul>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <div class="theme-toggle-track">
          <div class="theme-toggle-thumb"></div>
        </div>
      </button>
    </nav>
  </header>

  <!-- Floating Navigation (appears when scrolling) -->
  <nav class="floating-nav" id="floatingNav">
    <div class="floating-nav-buttons">
      <a href="/" class="floating-btn" title="${navHome}">
        <span class="btn-icon">🏠</span>
        <span class="btn-text">${navHome}</span>
      </a>
      ${showProjects ? `<a href="/posts" class="floating-btn" title="${navProjects}">
        <span class="btn-icon">💼</span>
        <span class="btn-text">${navProjects}</span>
      </a>` : ''}
      ${showBlog ? `<a href="/blog" class="floating-btn" title="${navBlog}">
        <span class="btn-icon">📝</span>
        <span class="btn-text">${navBlog}</span>
      </a>` : ''}
      <a href="/about" class="floating-btn" title="${navAbout}">
        <span class="btn-icon">👤</span>
        <span class="btn-text">${navAbout}</span>
      </a>
      <button class="floating-btn theme-toggle" id="floatingThemeToggle" title="Toggle theme">
        <div class="theme-toggle-track">
          <div class="theme-toggle-thumb"></div>
        </div>
      </button>
    </div>
  </nav>

  <main class="main-content">
    ${content}
  </main>

  <footer class="site-footer">
    <p>&copy; ${new Date().getFullYear()} ${siteName}. ${footerText}</p>
    ${showGeneratorCredit ? `<p class="generator-credit">
      Generated with <a href="https://github.com/Crowiel/Sieva-Site-Generator" target="_blank" rel="noopener">Sievä Site Generator</a>
    </p>` : ''}
  </footer>

  <script src="/static/js/components.js"></script>
  <script src="/static/js/gallery.js"></script>
</body>
</html>

<!-- 
  Generated with Sievä Site Generator
  https://github.com/Crowiel/Sieva-Site-Generator
  A modern static site generator built with Deno, TypeScript, and MDX
-->`;
}