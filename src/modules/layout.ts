// Base HTML layout for all pages
import type { LayoutOptions } from "./types.ts";

export function renderLayout(
  title: string, 
  content: string, 
  additionalHead: string = "",
  options: LayoutOptions = { showProjects: true, showBlog: true }
): string {
  const { showProjects = true, showBlog = true } = options;
  
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
          <span class="brand-name">Your Name</span>
          <span class="brand-subtitle">Automation & Embedded Systems</span>
        </a>
      </div>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        ${showProjects ? '<li><a href="/posts">Projects</a></li>' : ''}
        ${showBlog ? '<li><a href="/blog">Blog</a></li>' : ''}
        <li><a href="/about">About</a></li>
      </ul>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
        ☰
      </button>
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
      <a href="/" class="floating-btn" title="Home">
        <span class="btn-icon">🏠</span>
        <span class="btn-text">Home</span>
      </a>
      ${showProjects ? `<a href="/posts" class="floating-btn" title="Projects">
        <span class="btn-icon">💼</span>
        <span class="btn-text">Projects</span>
      </a>` : ''}
      ${showBlog ? `<a href="/blog" class="floating-btn" title="Blog">
        <span class="btn-icon">📝</span>
        <span class="btn-text">Blog</span>
      </a>` : ''}
      <a href="/about" class="floating-btn" title="About">
        <span class="btn-icon">👤</span>
        <span class="btn-text">About</span>
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
    <p>&copy; ${new Date().getFullYear()} Your Name. Automation Engineer & Embedded Systems Developer</p>
    <p class="generator-credit">
      Generated with <a href="https://github.com/Crowiel/Sieva-Site-Generator" target="_blank" rel="noopener">Sievä Site Generator</a>
    </p>
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