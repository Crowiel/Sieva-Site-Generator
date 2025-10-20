/**
 * URL generation utilities for consistent URL building across the site
 */

export interface UrlOptions {
  /**
   * Whether to use absolute paths (starting with /)
   * Default: true for dev server, false for static build
   */
  absolute?: boolean;
  
  /**
   * Whether to append .html extension
   * Default: false for dev server, true for static build
   */
  htmlExt?: boolean;
}

/**
 * Build a URL for a project page
 * @param slug - Project slug
 * @param options - URL options
 * @returns URL string like "/projects/slug" or "projects/slug.html"
 */
export function buildProjectUrl(slug: string, options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  const prefix = absolute ? "/" : "";
  const ext = htmlExt ? ".html" : "";
  return `${prefix}projects/${slug}${ext}`;
}

/**
 * Build a URL for a blog article page
 * @param slug - Article slug
 * @param options - URL options
 * @returns URL string like "/articles/slug" or "articles/slug.html"
 */
export function buildBlogUrl(slug: string, options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  const prefix = absolute ? "/" : "";
  const ext = htmlExt ? ".html" : "";
  return `${prefix}articles/${slug}${ext}`;
}

/**
 * Build a URL for a tag page
 * @param tag - Tag name
 * @param options - URL options
 * @returns URL string like "/topics/tag" or "topics/tag.html"
 */
export function buildTagUrl(tag: string, options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  const prefix = absolute ? "/" : "";
  const ext = htmlExt ? ".html" : "";
  return `${prefix}topics/${encodeURIComponent(tag.toLowerCase())}${ext}`;
}

/**
 * Build a URL for a page (posts list, blog list, about, etc.)
 * @param page - Page name (e.g., "posts", "blog", "about", "tags")
 * @param options - URL options
 * @returns URL string like "/page" or "page.html"
 */
export function buildPageUrl(page: string, options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  const prefix = absolute ? "/" : "";
  const ext = htmlExt ? ".html" : "";
  return `${prefix}${page}${ext}`;
}

/**
 * Build a URL for the homepage
 * @param options - URL options
 * @returns URL string like "/" or "index.html"
 */
export function buildHomeUrl(options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  if (absolute) {
    return "/";
  }
  return htmlExt ? "index.html" : "/";
}

/**
 * Build a relative URL for tag links from within a blog post
 * Used when linking from /articles/slug to /topics/tag
 * @param tag - Tag name
 * @param options - URL options
 * @returns URL string like "../topics/tag.html"
 */
export function buildRelativeTagUrl(tag: string, options: UrlOptions = {}): string {
  const { htmlExt = false } = options;
  const ext = htmlExt ? ".html" : "";
  return `../topics/${encodeURIComponent(tag.toLowerCase())}${ext}`;
}

/**
 * Build a relative URL for going back to blog list from article
 * @param options - URL options
 * @returns URL string like "../blog.html" or "/blog"
 */
export function buildBackToBlogUrl(options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  if (absolute) {
    return "/blog";
  }
  return htmlExt ? "../blog.html" : "/blog";
}

/**
 * Build a relative URL for going back to posts list from project
 * @param options - URL options
 * @returns URL string like "../posts.html" or "/posts"
 */
export function buildBackToPostsUrl(options: UrlOptions = {}): string {
  const { absolute = true, htmlExt = false } = options;
  if (absolute) {
    return "/posts";
  }
  return htmlExt ? "../posts.html" : "/posts";
}
