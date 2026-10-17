---
title: "Sieva Site Generator (v2)"
date: "2026-10-16"
description: "A deterministic, high-performance static site generator written in Go. Features sub-150ms builds, build-time vector SVG Gantt pre-rendering, an upstream-safe configuration system, and a zero-framework vanilla client stack."
tags: ["Go", "Static Site Generator", "Web Architecture", "SVG Pre-rendering", "Performance", "Minimalism"]
featured: true
isIndex: true
projectSlug: "sieva-site-generator"
gantt:
  - name: "Architecture & Design"
    start: "2026-10-01"
    end: "2026-10-05"
    progress: 100
    color: "#4CAF50"
  - name: "Go Engine & AST Parser"
    start: "2026-10-05"
    end: "2026-10-10"
    progress: 100
    color: "#2196F3"
  - name: "Build-Time SVG Gantt Generator"
    start: "2026-10-08"
    end: "2026-10-12"
    progress: 100
    color: "#FF9800"
  - name: "Interactive Pullout Timeline"
    start: "2026-10-11"
    end: "2026-10-14"
    progress: 100
    color: "#9C27B0"
  - name: "Benchmarking & Verification"
    start: "2026-10-14"
    end: "2026-10-16"
    progress: 100
    color: "#00BCD4"
timeline:
  - title: "Problem Definition & Architecture"
    date: "2026-10-01"
    link: "#problem-definition"
  - title: "Replacing Client JS with Build-time SVG"
    date: "2026-10-08"
    link: "#svg-gantt"
  - title: "Single-Pass Direct Compilation"
    date: "2026-10-10"
    link: "#single-pass"
  - title: "Upstream-Safe Two-Tier Configuration"
    date: "2026-10-11"
    link: "#upstream-config"
  - title: "Symmetric Directory Clean URLs"
    date: "2026-10-12"
    link: "#clean-urls"
  - title: "Benchmark Results & Footprint"
    date: "2026-10-16"
    link: "#benchmarks"
  - title: "Interactive Demo Showcase"
    link: "#demo-showcase"
---

# Sieva Site Generator (v2)

Sieva Site Generator is a bespoke static site generator built specifically to power `mattisievanen.fi`. Engineered with a systems architect mindset, it rejects the runtime bloat of modern JavaScript frameworks in favor of mechanical sympathy, deterministic execution, and razor-sharp performance.

---

## <a id="problem-definition"></a>Problem Definition & Architecture

Most modern developer portfolios and static generators carry heavy runtime baggage: sprawling node_modules trees, client-side chart libraries that parse data attributes on the visitor's CPU, and multi-megabyte JavaScript bundles just to display text and code.

The previous v1 version of this portfolio relied on Deno and a fragile two-stage build pipeline:
1. **Stage 1 (`scripts/build-mdx.ts`)**: Walked Markdown files, extracted frontmatter, and serialized the content into a massive 168 KB intermediate TypeScript file (`posts.ts`) where HTML fragments were embedded as escaped strings.
2. **Stage 2 (`scripts/build-static.ts`)**: Imported that generated TypeScript file, evaluated template functions, and wrote static files to disk.
3. **Client-side Overhead**: The browser loaded over **46 KB** of JavaScript (including a client-side SVG Gantt renderer, timeline listeners, and DOM mutators) and **51 KB** of split CSS files.
4. **Asymmetric URLs**: URLs were inconsistent (`/blog.html` vs `/projects/<slug>/`), requiring web server rewrite gymnastics.

For an **Embedded Systems Architect**, having a portfolio that requires client-side computation to render static charts is fundamentally misaligned with bare-metal engineering values.

### Engineering Goals for v2

* **Zero Client Runtime Bloat**: The site must be 100% readable, accessible, and responsive even with JavaScript completely disabled.
* **Sub-150ms Deterministic Builds**: The entire site—Markdown parsing, syntax highlighting, image copying, sitemap generation, and chart vector calculation—must compile in less than a blink of an eye.
* **Single Self-Contained Binary**: Written in **Go**, compiling to a single statically linked executable (`sieva-ssg.exe`) with zero runtime dependencies.
* **Build-Time Graphics Generation**: Dynamic project scheduling charts are computed and emitted directly as scalable vector graphics (`<svg>`) during the build.
* **Upstream Git Safety**: Structured so users can fork the repository, pull upstream engine upgrades, and never worry about merge conflicts destroying personal portfolio data.

---

## <a id="svg-gantt"></a>Replacing Client JS with Build-Time SVG

In v1, project schedules were rendered using `gantt.js` (16 KB), which ran on every visitor's browser:

```javascript
// Old v1: Client executes canvas/SVG math on page load
class GanttChart {
  constructor(container, data) {
    this.width = Math.max(600, container.getBoundingClientRect().width);
    this.render(); // Client-side DOM mutation
  }
}
```

In v2, the Go engine calculates time intervals, month dividers, task coordinates, and completion percentages at compile time:

```go
// New v2: Pure Go build-time SVG pre-rendering
func RenderGanttSVG(tasks []GanttTask) template.HTML {
    // Calculates timeline bounds, scale factors, and SVG elements directly
    // Emits standard, accessible <svg> markup directly into the static HTML
}
```

### Advantages
* **0ms Client Execution**: Zero JavaScript execution cost on the client device.
* **Crisp & Responsive**: The SVG scales fluidly via `viewBox="0 0 1040 H"` across phones, high-DPI displays, and print media.
* **Click to Enlarge**: Clicking the chart or header button opens a native HTML5 modal dialog (`<dialog id="gantt-dialog">`) with dark backdrop blur (`backdrop-filter: blur(6px)`), allowing visitors to inspect dense schedules at full resolution.

---

## <a id="single-pass"></a>Single-Pass Direct Compilation

The compilation engine eliminates intermediate TypeScript generation entirely. The build operates as a single-pass streaming pipeline:

```text
content/ (*.md, *.mdx) 
  + config.json 
  + templates/ (*.html)
      │
      ▼  [Goldmark AST + YAML v3 + html/template]
  dist/ (Pure static HTML, CSS, assets)
```

No temporary code files are written to disk. Type safety and template validation happen in memory using Go's standard `html/template` package, preventing XSS vulnerabilities by default.

### Dual Build Targets: Production vs. Demo Isolation
The generator strictly isolates production content from demonstration fixtures via file prefixes:
* **Production Build (`.\sieva-ssg.exe build`)**: Strictly ignores any file starting with `demo-`. Currently processes 1 real showcase project, 1 real deep-dive essay, and 8 tags (~104ms).
* **Demo Build (`.\sieva-ssg.exe build-demo` or `--demo`)**: Ingests all demo fixtures, syntax manuals, and reference projects (5 projects, 7 posts, 43 tags, ~140ms).

---

## <a id="upstream-config"></a>Upstream-Safe Two-Tier Configuration

A recurring issue when maintaining open-source static generator templates is upstream drift: when a user forks or clones the project to build their personal site, pulling subsequent engine updates often causes merge conflicts with personal configuration files.

Sieva Site Generator solves this with a two-tier configuration hierarchy:
* **`config-default.json`**: Tracked in git. Contains upstream baseline configuration, default navigation labels, and standard schema definitions.
* **`config.json`**: Ignored in `.gitignore`. Contains the author's personal overrides (name, domain, contact links, descriptions).

At startup, the Go loader reads `config-default.json` as the base model and overlays `config.json` on top. Running `git pull upstream main` cleanly updates engine features and new default keys without ever touching or overwriting the user's private configuration.

---

## <a id="clean-urls"></a>Symmetric Directory Clean URLs

Many static generators produce asymmetric URLs that rely on Apache `.htaccess` rewrite rules to hide `.html` extensions. This causes routing brittleness when shifting between Apache, Nginx, Caddy, or GitHub Pages.

Sieva Site Generator standardizes on directory-based clean URLs:
* Source: `content/projects/sieva-site-generator/index.md` &rarr; Output: `dist/projects/sieva-site-generator/index.html` (Accessible as `/projects/sieva-site-generator/`)
* Source: `content/blog/my-post.md` &rarr; Output: `dist/blog/my-post/index.html` (Accessible as `/blog/my-post/`)
* Source: `content/about.md` &rarr; Output: `dist/about/index.html` (Accessible as `/about/`)

This structure works natively out of the box on **any static web server** without requiring custom URL rewriting modules.

---

## <a id="benchmarks"></a>Benchmark Results & Footprint

| Metric | Legacy v1 (Deno + Unified) | Sieva Site Generator (v2 Go) | Delta |
| :--- | :--- | :--- | :--- |
| **Total Build Time (Prod)** | 2,800 ms – 4,200 ms | **104.1 ms** | **~30x faster** |
| **Total Build Time (Demo)** | 3,200 ms – 4,800 ms | **140.1 ms** | **~25x faster** |
| **Client JavaScript** | 46.2 KB | **2.3 KB** | **-95.0%** |
| **Client Stylesheets** | 51.5 KB | **12.8 KB** | **-75.1%** |
| **Runtime Dependencies** | Deno runtime + Node/NPM tree | **None** (Single static binary) | **100% portable** |
| **Gantt Chart Client Cost** | 16 KB script + DOM mutations | **0 KB script / 0ms CPU** | Instant render |

### Chrome DevTools Performance Audit
* **Largest Contentful Paint (LCP)**: `0.11 s`
* **Cumulative Layout Shift (CLS)**: `0.000`
* **Interaction to Next Paint (INP)**: `0 ms`
* **Total Blocking Time (TBT)**: `0 ms`

---

## <a id="demo-showcase"></a>Interactive Demo Showcase

To explore all interactive components, living syntax guides, and reference projects in their native browser environment, visit the live demonstration deployment:

* **Live Demo Deployment**: [demo.mattisievanen.fi](https://demo.mattisievanen.fi)
* **Interactive Syntax Manual**: `/blog/demo-ssg-features-and-syntax-guide/`
* **Reference Project Showcase**: `/projects/demo-feature-showcase/`

Sieva Site Generator demonstrates that high engineering rigour, mechanical sympathy, and zero-bloat principles apply just as effectively to modern web architecture as they do to embedded systems firmware.
