---
title: "Building a Zero-Bloat Static Site Generator in Go"
date: "2026-10-16"
description: "Why an embedded systems architect replaced client-side chart libraries, multi-stage compilation pipelines, and heavy web frameworks with a deterministic, sub-150ms static site builder in Go."
tags: ["Go", "Architecture", "Performance", "Web Development", "Minimalism"]
featured: true
---

# Building a Zero-Bloat Static Site Generator in Go

In the embedded and bare-metal worlds, every byte of memory, every clock cycle, and every bus transaction is intentional. When designing firmware for microcontrollers or deterministically constrained industrial controllers, computational waste isn't merely an annoyance—it's a system failure.

Yet, when we look at contemporary web development, that engineering discipline is frequently abandoned. Portfolios consisting of static text and technical diagrams regularly load megabytes of JavaScript, complex hydration routines, and client-side visualization frameworks just to draw a few rectangles on a screen.

When updating my personal portfolio, I decided to apply embedded systems principles to my web toolchain: **Sieva Site Generator (v2)** was born.

---

## 1. The Flaw of Client-Side Static Visualization

One of the distinctive features of an engineering portfolio is the project execution schedule: visualizing milestones, hardware revision phases, and firmware sprints using Gantt charts and progress indicators.

In version 1 of my site, this was accomplished using a popular approach:
1. Markdown frontmatter contained a JSON list of tasks.
2. The HTML renderer serialized that data into DOM data attributes: `<div data-gantt='[{"name":"Hardware",...}]'>`.
3. A 16 KB client script (`gantt.js`) loaded after `DOMContentLoaded`, traversed the DOM, calculated calendar coordinates, dynamically created `<svg>` nodes, and injected them into the page.

Consider what this actually means:
* The milestone dates and percentages are completely static and known when the author writes the article.
* Yet every visitor's laptop or mobile phone was forced to expend battery and CPU cycles recalculating the exact same pixel offsets and re-instantiating DOM elements.

### The Fix: Pre-rendering Vector SVG at Build Time

In v2, the Go build pipeline takes that task array and computes the entire SVG coordinate system during compilation.

```go
// Direct build-time calculation of SVG elements in Go:
xStart := labelWidth + (startDiff / totalDuration) * chartWidth
xEnd   := labelWidth + (endDiff / totalDuration) * chartWidth

// Emits standard SVG rects directly into static HTML:
sb.WriteString(fmt.Sprintf(
    `<rect x="%.1f" y="%d" width="%.1f" height="%d" rx="5" fill="%s" />`,
    xStart, yBar, progW, barHeight, task.Color,
))
```

The output is clean, standard, semantic SVG inlined directly in the static HTML:
* **0ms Client Execution**: The visitor's device simply paints the vector paths.
* **Zero Dependencies**: No client charting library, no canvas Polyfills, no client-side resize watchers.
* **Print & High-DPI Friendly**: Vector precision at every resolution.
* **Click to Enlarge**: A native `<dialog id="gantt-dialog">` with dark backdrop blur allows visitors to inspect dense schedules at full resolution without third-party modal libraries.

---

## 2. Single-Pass Compilation vs. Multi-Stage Pipelines

The previous generator utilized Deno and the unified/remark ecosystem. While versatile, it used a two-stage compilation where Markdown was converted into an intermediate 168 KB TypeScript file (`posts.ts`), which was then re-imported by a second script to generate static HTML.

This two-stage approach introduced subtle synchronization issues, slow build times (2.8 to 4.2 seconds), and dependency bloat.

By contrast, the Go implementation operates as a single-pass streaming pipeline:
1. Read configuration through an upstream-safe loader.
2. Walk `content/`, extracting YAML frontmatter and rendering Markdown AST via `goldmark`.
3. Interpolate memory structures directly into type-safe Go templates (`html/template`).
4. Write symmetric directory trees (`dist/projects/slug/index.html`).

The entire production site now builds in **~104 milliseconds**—roughly a 30x speedup.

---

## 3. Dual Build Targets: Clean Production vs. Demo Fixtures

A common flaw in portfolio templates is the leakage of example content into production builds. To solve this, the generator enforces strict prefix-based isolation:

* **Production Release (`sieva-ssg build`)**: Strictly excludes any file with a `demo-` prefix. It processes only real, verified projects and articles, producing a pristine production directory.
* **Demo Suite (`sieva-ssg build-demo`)**: Ingests test fixtures, living syntax manuals, and reference projects for local preview or public sandbox deployments.

Visitors can explore the full demo suite, interactive shortcodes, and component reference at [demo.mattisievanen.fi](https://demo.mattisievanen.fi).

---

## 4. Upstream Git Safety: Two-Tier Configuration

When open-sourcing or forking an SSG, updating the engine from upstream often results in painful git merge conflicts over personal configuration files.

We solved this with a two-tier configuration model:
* **`config-default.json`**: Tracked in git as the canonical schema and baseline defaults.
* **`config.json`**: Ignored in `.gitignore` to store personal overrides (name, bio, contact handles, domain).

At runtime, Go unmarshals `config-default.json` first, then overlays `config.json`. An author can run `git pull upstream main` at any time to receive core engine updates without ever overwriting their portfolio metadata.

---

## 5. The Verified Results: Less is Truly More

Here is the asset footprint and audit comparison of the v2 redesign:

| Metric | Legacy v1 (Deno) | Sieva Site Generator (v2) | Delta |
| :--- | :--- | :--- | :--- |
| **Client JavaScript** | 46.2 KB | **2.3 KB** | **-95.0%** |
| **Client Stylesheets** | 51.5 KB | **12.8 KB** | **-75.1%** |
| **Build Time (Production)** | 2.8s – 4.2s | **104.1 ms** | **~30x faster** |
| **Largest Contentful Paint (LCP)** | ~1.1s | **0.11 s** | **Instant paint** |
| **Cumulative Layout Shift (CLS)** | 0.045 | **0.000** | **Zero jitter** |
| **Interaction to Next Paint (INP)** | ~40 ms | **0 ms** | **Instant response** |

---

## 6. Engineering Takeaway

Software craftsmanship is defined not by how much you can add, but by how much you can strip away while preserving full utility, elegance, and reliability. 

Whether programming an ARM Cortex-M4 microcontroller or generating a static engineering portfolio, mechanical sympathy and deterministic simplicity remain the gold standard.
