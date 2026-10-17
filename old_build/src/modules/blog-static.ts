import { renderLayout } from "./layout-static.ts";
import type { BlogPost, SiteConfig, UrlOptions } from "./types.ts";
import { buildBlogUrl, buildTagUrl, buildBackToBlogUrl, buildRelativeTagUrl } from "./url-utils.ts";

export function renderBlogList(
  blogPosts: BlogPost[], 
  projectCount = 0, 
  config?: SiteConfig,
  urlOpts: UrlOptions = { absolute: false, htmlExt: true }
): string {
  const content = `
    <div class="container">
      <header class="page-header">
        <h1>Blog</h1>
        <p class="page-description">Thoughts, tutorials, and insights on software development, embedded systems, and technology.</p>
      </header>

      <section class="posts-grid">
        <div class="posts-list">
        ${blogPosts.length === 0 ? `
          <div class="no-posts">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        ` : blogPosts.map(post => `
          <article class="post-card">
            <header class="post-card-header">
              <h2><a href="${buildBlogUrl(post.slug, urlOpts)}">${post.frontmatter.title}</a></h2>
              <time class="post-date">${new Date(post.frontmatter.date).toLocaleDateString()}</time>
            </header>
            ${post.frontmatter.description ? `
              <p class="post-card-description">${post.frontmatter.description}</p>
            ` : ""}
            <footer class="post-card-footer">
              ${post.frontmatter.tags ? `
                <div class="tags">
                  ${post.frontmatter.tags.map((tag: string) => 
                    `<a href="${buildTagUrl(tag, urlOpts)}" class="tag">${tag}</a>`
                  ).join("")}
                </div>
              ` : ""}
            </footer>
          </article>
        `).join("")}
        </div>
      </section>
    </div>
  `;

  const layoutOptions = {
    showProjects: projectCount > 0,
    showBlog: blogPosts.length > 0,
  };

  return renderLayout("Blog", content, "", layoutOptions, config);
}

export function renderBlogPost(
  post: BlogPost, 
  config?: SiteConfig,
  urlOpts: UrlOptions = { absolute: false, htmlExt: true }
): string {
  const content = `
    <article class="blog-post">
      <header class="post-header">
        <div class="post-header-main">
          <h1>${post.frontmatter.title}</h1>
        </div>
        <div class="post-meta">
          <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
          ${post.frontmatter.tags ? `
            <div class="tags">
              ${post.frontmatter.tags.map((tag: string) => 
                `<a href="${buildRelativeTagUrl(tag, urlOpts)}" class="tag">${tag}</a>`
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
        <a href="${buildBackToBlogUrl(urlOpts)}" class="back-link">← Back to Blog</a>
      </footer>
    </article>
  `;

  return renderLayout(post.frontmatter.title, content, "", {}, config);
}
