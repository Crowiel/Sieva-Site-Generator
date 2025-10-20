import { renderLayout } from "./layout-static.ts";
import type { PostData, ProjectData } from "./types.ts";

export function renderPost(post: PostData, project?: ProjectData): string {
  const additionalHead = post.frontmatter.gantt || post.frontmatter.timeline ? `
    <script src="/static/js/gantt.js" defer></script>
    <script src="/static/js/timeline.js" defer></script>
  ` : "";
  
  // Serialize Gantt data if it's an array
  const ganttData = Array.isArray(post.frontmatter.gantt) 
    ? JSON.stringify(post.frontmatter.gantt) 
    : 'null';

  const content = `
    <article class="post">
      <header class="post-header">
        <div class="post-header-main">
          <h1>${post.frontmatter.title}</h1>
        </div>
        ${(post.isIndex && project?.updates && project.updates.length > 0) || post.frontmatter.gantt || post.frontmatter.timeline ? `
          <div class="post-header-controls">
            ${post.frontmatter.gantt ? `
              <div class="gantt-header-controls">
                <button class="gantt-toggle" onclick="toggleGanttDropdown()">Project Schedule</button>
                <div class="gantt-dropdown" id="gantt-dropdown">
                  <div class="gantt-dropdown-header">
                    <h4>Project Timeline & Schedule</h4>
                    <button class="gantt-dropdown-close" onclick="closeGanttDropdown()">×</button>
                  </div>
                  <div class="gantt-chart" id="gantt-chart" data-gantt='${ganttData}'>
                    <!-- Gantt chart will be rendered here by JavaScript -->
                  </div>
                </div>
              </div>
            ` : ""}
            ${post.isIndex && project?.updates && project.updates.length > 0 ? `
              <a href="#update-${project.updates[0].slug}" class="updates-indicator">
                📝 Jump to Latest Update: ${new Date(project.updates[0].frontmatter.date).toLocaleDateString()}
              </a>
            ` : ""}
            ${post.frontmatter.timeline ? `
              <button class="timeline-indicator" onclick="toggleTimelineSidebar()">
                📅 Project Timeline
              </button>
            ` : ""}
          </div>
        ` : ""}
        <div class="post-meta">
          <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
          ${post.frontmatter.tags ? `
            <div class="tags">
              ${post.frontmatter.tags.map((tag: string) => `<a href="/tags/${encodeURIComponent(tag.toLowerCase())}" class="tag">${tag}</a>`).join("")}
            </div>
          ` : ""}
        </div>
        ${post.frontmatter.description ? `<p class="post-description">${post.frontmatter.description}</p>` : ""}
      </header>

      <div class="post-content">
        ${post.html}
      </div>

      ${post.isIndex && project?.updates && project.updates.length > 0 ? `
        <!-- Project Updates Section -->
        <section class="project-updates-section" id="project-updates-section">
          <h2 class="updates-section-title">Project Updates</h2>
          ${project.updates.map((update, index) => `
            <article class="project-update" id="update-${update.slug}">
              <header class="update-header">
                <div class="update-header-main">
                  <h3>${update.frontmatter.title}</h3>
                  <div class="update-meta">
                    <time>${new Date(update.frontmatter.date).toLocaleDateString()}</time>
                    ${update.frontmatter.tags ? `
                      <div class="tags">
                        ${update.frontmatter.tags.map((tag: string) => `<a href="/tags/${encodeURIComponent(tag.toLowerCase())}" class="tag">${tag}</a>`).join("")}
                      </div>
                    ` : ""}
                  </div>
                </div>
              </header>
              <div class="update-content">
                ${update.html}
              </div>
              ${index < project.updates.length - 1 ? '<hr class="update-divider">' : ''}
            </article>
          `).join("")}
        </section>
      ` : ""}

      <nav class="post-nav">
        <a href="/posts" class="btn-secondary">← Back to Projects</a>
      </nav>
    </article>

    ${post.frontmatter.timeline ? `
      <!-- Timeline Sidebar -->
      <div class="timeline-wrapper">
        <div class="timeline-overlay" id="timeline-overlay" onclick="closeTimelineSidebar()"></div>
        <!-- Floating Side Tab Button -->
        <button class="timeline-tab-button" onclick="toggleTimelineSidebar()" aria-label="Toggle Project Timeline">
          <span class="timeline-tab-icon">📅</span>
          <span class="timeline-tab-text">Timeline</span>
        </button>
        <div class="timeline-sidebar" id="timeline-sidebar">
          <div class="timeline-header">
            <h3>Project Timeline</h3>
            <button class="timeline-close" onclick="closeTimelineSidebar()">×</button>
          </div>
          <div class="timeline-content">
            ${post.frontmatter.timeline.map((item: { title: string; date: string; link?: string }, index: number) => `
              <a href="${item.link || '#'}" class="timeline-item" data-index="${index}">
                <div class="timeline-date">${new Date(item.date).toLocaleDateString()}</div>
                <div class="timeline-title">${item.title}</div>
              </a>
            `).join("")}
          </div>
        </div>
      </div>
    ` : ""}
  `;

  return renderLayout(post.frontmatter.title, content, additionalHead);
}