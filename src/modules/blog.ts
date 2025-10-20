import { renderLayout } from "./layout-static.ts";
import type { BlogPost } from "./types.ts";
import { buildBlogUrl, buildTagUrl } from "./url-utils.ts";

export function renderBlogList(blogPosts: BlogPost[]): string {
  const content = `
    <div class="container">
      <header class="page-header">
        <h1>Blog</h1>
        <p class="page-description">Thoughts, tutorials, and insights on software development, embedded systems, and technology.</p>
      </header>

      <section class="blog-posts">
        ${blogPosts.length === 0 ? `
          <div class="no-posts">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        ` : blogPosts.map(post => `
          <article class="blog-post-card">
            <h2><a href="${buildBlogUrl(post.slug)}">${post.frontmatter.title}</a></h2>
            <div class="post-meta">
              <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
              ${post.frontmatter.tags ? `
                <div class="tags">
                  ${post.frontmatter.tags.map((tag: string) => 
                    `<a href="${buildTagUrl(tag)}" class="tag">${tag}</a>`
                  ).join("")}
                </div>
              ` : ""}
            </div>
            ${post.frontmatter.description ? `
              <p class="post-excerpt">${post.frontmatter.description}</p>
            ` : ""}
            <a href="${buildBlogUrl(post.slug)}" class="read-more">Read more →</a>
          </article>
        `).join("")}
      </section>
    </div>
  `;

  return renderLayout("Blog", content);
}

export function renderBlogPost(post: BlogPost): string {
  const content = `
    <article class="blog-post">
      <header class="post-header">
        <h1>${post.frontmatter.title}</h1>
        <div class="post-meta">
          <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
          ${post.frontmatter.tags ? `
            <div class="tags">
              ${post.frontmatter.tags.map((tag: string) => 
                `<a href="${buildTagUrl(tag)}" class="tag">${tag}</a>`
              ).join("")}
            </div>
          ` : ""}
        </div>
        ${post.frontmatter.description ? `
          <p class="post-description">${post.frontmatter.description}</p>
        ` : ""}
      </header>

      <div class="post-content">
        ${post.html}
      </div>

      <footer class="post-footer">
        <a href="/blog" class="back-link">← Back to Blog</a>
      </footer>
    </article>
  `;

  return renderLayout(post.frontmatter.title, content);
}
