import { renderLayout } from "./layout-static.ts";
import type { TagData, PostData, SiteConfig, UrlOptions } from "./types.ts";
import { buildTagUrl, buildProjectUrl, buildPageUrl } from "./url-utils.ts";

// Generate all tags page (static)
export function renderTagsPage(
  posts: PostData[], 
  projectCount = 0, 
  blogCount = 0, 
  config?: SiteConfig,
  urlOpts: UrlOptions = { absolute: false, htmlExt: true }
): string {
  const tagMap = new Map<string, TagData>();
  
  // Collect all tags and their associated posts
  posts.forEach(post => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, {
            name: tag,
            count: 0,
            posts: []
          });
        }
        
        const tagData = tagMap.get(tag)!;
        tagData.count++;
        tagData.posts.push({
          slug: post.slug,
          projectSlug: post.projectSlug,
          title: post.frontmatter.title,
          date: post.frontmatter.date,
          description: post.frontmatter.description,
          tags: post.frontmatter.tags || []
        });
      });
    }
  });
  
  // Sort tags by count (most used first)
  const sortedTags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
  
  const content = `
    <div class="container">
      <header class="page-header">
        <h1>Tags</h1>
        <p class="page-description">Browse projects and posts by topic</p>
      </header>
      
      <div class="tag-grid">
        ${sortedTags.map(tag => `
          <a href="${buildTagUrl(tag.name, urlOpts)}" class="tag-card">
            <div class="tag-card-header">
              <h3 class="tag-card-name">${tag.name}</h3>
              <span class="tag-card-count">${tag.count} post${tag.count !== 1 ? 's' : ''}</span>
            </div>
          </a>
        `).join('')}
      </div>
      
      <nav class="page-nav">
        <a href="${buildPageUrl('posts', urlOpts)}" class="btn-secondary">← Back to Projects</a>
      </nav>
    </div>
  `;

  const layoutOptions = {
    showProjects: projectCount > 0,
    showBlog: blogCount > 0,
  };
  
  return renderLayout("Tags", content, "", layoutOptions, config);
}

// Generate individual tag page (static)
export function renderTagPage(
  tagName: string, 
  posts: PostData[], 
  config?: SiteConfig,
  urlOpts: UrlOptions = { absolute: false, htmlExt: true }
): string {
  const tagPosts = posts.filter(post => 
    post.frontmatter.tags?.map(t => t.toLowerCase()).includes(tagName.toLowerCase())
  );
  
  // Sort by date (newest first)
  tagPosts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
  
  // Get the properly capitalized tag name from the posts
  const properTagName = tagPosts.length > 0 
    ? tagPosts[0].frontmatter.tags?.find(t => t.toLowerCase() === tagName.toLowerCase()) || tagName
    : tagName;
  
  const content = `
    <div class="container">
      <header class="page-header">
        <h1>Posts tagged with "${properTagName}"</h1>
        <p class="page-description">${tagPosts.length} post${tagPosts.length !== 1 ? 's' : ''} found</p>
      </header>
      
      ${tagPosts.length > 0 ? `
        <div class="posts-grid">
          ${tagPosts.map(post => `
            <article class="post-card">
              <header class="post-card-header">
                <h2><a href="../${buildProjectUrl(post.projectSlug || post.slug, urlOpts)}">${post.frontmatter.title}</a></h2>
                <time class="post-date">${new Date(post.frontmatter.date).toLocaleDateString()}</time>
              </header>
              ${post.frontmatter.description ? `
                <p class="post-card-description">${post.frontmatter.description}</p>
              ` : ''}
              <footer class="post-card-footer">
                <div class="tags">
                  ${post.frontmatter.tags?.map(tag => `
                    <a href="${buildTagUrl(tag, { absolute: false, htmlExt: true })}" class="tag">${tag}</a>
                  `).join('') || ''}
                </div>
              </footer>
            </article>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <h2>No posts found</h2>
          <p>There are no posts tagged with "${properTagName}".</p>
        </div>
      `}
      
      <nav class="page-nav">
        <a href="../${buildPageUrl('tags', urlOpts)}" class="btn-secondary">← All Tags</a>
        <a href="../${buildPageUrl('posts', urlOpts)}" class="btn-secondary">← Back to Projects</a>
      </nav>
    </div>
  `;

  return renderLayout(`${properTagName} - Tags`, content, "", {}, config);
}