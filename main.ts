// Deno development server
import { serveDir } from "@std/http/file-server";
import { 
  projects, 
  blogPosts,
  getProjectBySlug,
  getBlogPostBySlug,
  recentProjects,
  recentBlogPosts,
  type ProjectData,
  type BlogPost
} from "./src/generated/posts.ts";
import { renderLayout } from "./src/modules/layout-static.ts";
import { renderHomepage } from "./src/modules/homepage-static.ts";
import { renderPost } from "./src/modules/post-static.ts";
import { renderAbout } from "./src/modules/about-static.ts";
import { renderTagsPage, renderTagPage } from "./src/modules/tags-static.ts";
import { renderBlogList, renderBlogPost } from "./src/modules/blog-static.ts";

const PORT = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Serve static files
  if (pathname.startsWith("/static/") || pathname.startsWith("/styles/")) {
    return serveDir(req, {
      fsRoot: "./src",
      urlRoot: "",
    });
  }

  // Serve content images from projects
  if (pathname.match(/^\/media\/projects\/([^\/]+)\/(.+)$/)) {
    const match = pathname.match(/^\/media\/projects\/([^\/]+)\/(.+)$/);
    if (match) {
      const projectSlug = match[1];
      const imagePath = match[2];
      const filePath = `./src/content/projects/${projectSlug}/img/${imagePath}`;
      
      try {
        const file = await Deno.readFile(filePath);
        const ext = imagePath.split('.').pop()?.toLowerCase() || '';
        const contentType = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
        }[ext] || 'application/octet-stream';
        
        return new Response(file, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      } catch {
        return new Response('Image not found', { status: 404 });
      }
    }
  }

  // Serve blog images
  if (pathname.startsWith("/media/blog/")) {
    const imagePath = pathname.substring(12); // Remove "/media/blog/"
    const filePath = `./src/content/blog/img/${imagePath}`;
    
    try {
      const file = await Deno.readFile(filePath);
      const ext = imagePath.split('.').pop()?.toLowerCase() || '';
      const contentType = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream';
      
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch {
      return new Response('Image not found', { status: 404 });
    }
  }

  // Routes
  try {
    let content: string;

    if (pathname === "/") {
      // Homepage - show recent projects and blog posts
      content = renderHomepage(recentProjects.map(p => p.indexPost), recentBlogPosts);
    } else if (pathname === "/about") {
      // About page
      content = renderAbout(projects.length, blogPosts.length);
    } else if (pathname.startsWith("/projects/")) {
      // Handle project pages (all updates included on same page)
      const slug = pathname.slice(10); // Remove "/projects/"
      
      // Try to find a project by slug
      const project = getProjectBySlug(slug);
      if (project) {
        // Show project page with all updates included
        content = renderPost(project.indexPost, project);
      } else {
        // 404 for project not found
        content = renderLayout("Page Not Found", `
          <div style="text-align: center; padding: 4rem 0;">
            <h1>404 - Project Not Found</h1>
            <p>The project you're looking for doesn't exist.</p>
            <div style="margin-top: 2rem;">
              <a href="/" class="btn-primary">Go Home</a>
              <a href="/posts" class="btn-secondary">View Projects</a>
            </div>
          </div>
        `);
        return new Response(content, {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    } else if (pathname === "/posts") {
      // Projects index page
      const layoutOptions = {
        showProjects: projects.length > 0,
        showBlog: blogPosts.length > 0,
      };
      content = renderLayout("All Projects", `
        <div class="container">
          <div class="posts-grid">
            <h1>All Projects</h1>
            <div class="posts-list">
            ${projects.map((project: ProjectData) => `
              <article class="post-card ${project.indexPost.frontmatter.featured ? 'featured' : ''}">
                <h2><a href="/projects/${project.slug}">${project.indexPost.frontmatter.title}</a></h2>
                <time>${new Date(project.indexPost.frontmatter.date).toLocaleDateString()}</time>
                <p>${project.indexPost.frontmatter.description || ""}</p>
                ${project.updates.length > 0 ? `<p class="update-count">${project.updates.length} update${project.updates.length !== 1 ? 's' : ''}</p>` : ''}
                ${project.latestUpdate ? `<p class="latest-update">Latest: ${new Date(project.latestUpdate.frontmatter.date).toLocaleDateString()}</p>` : ''}
                ${project.indexPost.frontmatter.tags ? `
                  <div class="tags">
                    ${project.indexPost.frontmatter.tags.map((tag: string) => `<a href="/tags/${encodeURIComponent(tag.toLowerCase())}" class="tag">${tag}</a>`).join("")}
                  </div>
                ` : ""}
              </article>
            `).join("")}
            </div>
          </div>
        </div>
      `, "", layoutOptions);
    } else if (pathname === "/tags") {
      // Tags index page
      const allPosts = projects.flatMap(p => [p.indexPost, ...p.updates]);
      content = renderTagsPage(allPosts);
    } else if (pathname.startsWith("/topics/")) {
      // Individual tag page
      const tagName = decodeURIComponent(pathname.slice(8)); // Remove "/topics/" and decode URL
      const allPosts = projects.flatMap(p => [p.indexPost, ...p.updates]);
      content = renderTagPage(tagName, allPosts);
    } else if (pathname === "/blog") {
      // Blog index page
      content = renderBlogList(blogPosts);
    } else if (pathname.startsWith("/articles/")) {
      // Individual blog post
      const slug = pathname.slice(10); // Remove "/articles/"
      const post = getBlogPostBySlug(slug);
      if (post) {
        content = renderBlogPost(post);
      } else {
        // 404 for blog post not found
        content = renderLayout("Page Not Found", `
          <div style="text-align: center; padding: 4rem 0;">
            <h1>404 - Blog Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist.</p>
            <div style="margin-top: 2rem;">
              <a href="/" class="btn-primary">Go Home</a>
              <a href="/blog" class="btn-secondary">View Blog</a>
            </div>
          </div>
        `);
        return new Response(content, {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    } else {
      // 404 for any other route
      content = renderLayout("Page Not Found", `
        <div style="text-align: center; padding: 4rem 0;">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <div style="margin-top: 2rem;">
            <a href="/" class="btn-primary">Go Home</a>
            <a href="/posts" class="btn-secondary">View Projects</a>
          </div>
        </div>
      `);
      return new Response(content, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response(content, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { 
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}

console.log(`Server running at http://localhost:${PORT}`);
Deno.serve({ port: PORT }, handler);