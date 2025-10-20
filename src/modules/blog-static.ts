import { renderLayout } from "./layout-static.ts";
import type { BlogPost, SiteConfig } from "./types.ts";
import { buildBlogUrl, buildTagUrl, buildBackToBlogUrl, buildRelativeTagUrl } from "./url-utils.ts";

const staticUrlOpts = { absolute: false, htmlExt: true };

export function renderBlogList(blogPosts: BlogPost[], projectCount = 0, config?: SiteConfig): string {
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
            <h2><a href="${buildBlogUrl(post.slug, staticUrlOpts)}">${post.frontmatter.title}</a></h2>
            <div class="post-meta">
              <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
              ${post.frontmatter.tags ? `
                <div class="tags">
                  ${post.frontmatter.tags.map((tag: string) => 
                    `<a href="${buildTagUrl(tag, staticUrlOpts)}" class="tag">${tag}</a>`
                  ).join("")}
                </div>
              ` : ""}
            </div>
            ${post.frontmatter.description ? `
              <p class="post-excerpt">${post.frontmatter.description}</p>
            ` : ""}
            <a href="${buildBlogUrl(post.slug, staticUrlOpts)}" class="read-more">Read more →</a>
          </article>
        `).join("")}
      </section>
    </div>
  `;

  const layoutOptions = {
    showProjects: projectCount > 0,
    showBlog: blogPosts.length > 0,
  };

  return renderLayout("Blog", content, "", layoutOptions, config);
}

export function renderBlogPost(post: BlogPost, config?: SiteConfig): string {
  const content = `
    <article class="blog-post">
      <header class="post-header">
        <h1>${post.frontmatter.title}</h1>
        <div class="post-meta">
          <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
          ${post.frontmatter.tags ? `
            <div class="tags">
              ${post.frontmatter.tags.map((tag: string) => 
                `<a href="${buildRelativeTagUrl(tag, staticUrlOpts)}" class="tag">${tag}</a>`
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
        <a href="${buildBackToBlogUrl(staticUrlOpts)}" class="back-link">← Back to Blog</a>
      </footer>
    </article>
  `;

  return renderLayout(post.frontmatter.title, content, "", {}, config);
}
