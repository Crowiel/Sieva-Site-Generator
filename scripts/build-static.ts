import { ensureDir, copy } from "@std/fs";
import { join } from "@std/path";
import { 
  projects, 
  projectPosts,
  blogPosts,
  recentProjects,
  recentBlogPosts,
  getProjectBySlug,
  type ProjectData,
  type PostData,
  type BlogPost
} from "../src/generated/posts.ts";
import { renderLayout } from "../src/modules/layout-static.ts";
import { renderHomepage } from "../src/modules/homepage-static.ts";
import { renderPost } from "../src/modules/post-static.ts";
import { renderAbout } from "../src/modules/about-static.ts";
import { renderTagsPage, renderTagPage } from "../src/modules/tags-static.ts";
import { renderBlogList, renderBlogPost } from "../src/modules/blog-static.ts";
import { loadConfig } from "../src/modules/config.ts";

const DIST_DIR = "./dist";

async function buildStaticSite() {
  console.log("🏗️  Building static site for Apache hosting...");
  
  // Load configuration
  const config = await loadConfig();
  
  // Clean and create dist directory
  try {
    await Deno.remove(DIST_DIR, { recursive: true });
  } catch {
    // Directory doesn't exist, that's fine
  }
  await ensureDir(DIST_DIR);
  
  // Create necessary subdirectories
  await ensureDir(join(DIST_DIR, "posts"));
  await ensureDir(join(DIST_DIR, "blog"));
  await ensureDir(join(DIST_DIR, "tags"));
  await ensureDir(join(DIST_DIR, "styles"));
  await ensureDir(join(DIST_DIR, "static", "js"));

  // Copy static assets
  console.log("📁 Copying static assets...");
  try {
    await copy("./src/styles", join(DIST_DIR, "styles"), { overwrite: true });
    await copy("./src/static", join(DIST_DIR, "static"), { overwrite: true });
  } catch (error) {
    console.warn("⚠️  Warning: Could not copy all static assets:", (error as Error).message);
  }

  // Copy image folders from content
  console.log("🖼️  Copying content images...");
  try {
    // Copy project images
    const projectsDir = "./src/content/projects";
    try {
      for await (const entry of Deno.readDir(projectsDir)) {
        if (entry.isDirectory) {
          const imgDir = join(projectsDir, entry.name, "img");
          try {
            await Deno.stat(imgDir);
            const destDir = join(DIST_DIR, "posts", entry.name, "img");
            await ensureDir(destDir);
            await copy(imgDir, destDir, { overwrite: true });
            console.log(`  ✓ Copied images for project: ${entry.name}`);
          } catch {
            // No img directory for this project, skip
          }
        }
      }
    } catch (error) {
      console.warn("⚠️  No projects directory found");
    }

    // Copy blog images
    const blogImgDir = "./src/content/blog/img";
    try {
      await Deno.stat(blogImgDir);
      const destDir = join(DIST_DIR, "blog", "img");
      await ensureDir(destDir);
      await copy(blogImgDir, destDir, { overwrite: true });
      console.log("  ✓ Copied blog images");
    } catch {
      // No blog img directory, skip
    }
  } catch (error) {
    console.warn("⚠️  Warning: Could not copy all content images:", (error as Error).message);
  }

  // Generate homepage
  console.log("🏠 Generating homepage...");
  const homepageContent = renderHomepage(recentProjects.map(p => p.indexPost), recentBlogPosts, config);
  await Deno.writeTextFile(join(DIST_DIR, "index.html"), homepageContent);

  // Generate about page
  console.log("👤 Generating about page...");
  const aboutContent = renderAbout(projects.length, blogPosts.length, config);
  await Deno.writeTextFile(join(DIST_DIR, "about.html"), aboutContent);

  // Generate posts index page
  console.log("📚 Generating posts index...");
  const layoutOptions = {
    showProjects: projects.length > 0,
    showBlog: blogPosts.length > 0,
  };
  const postsIndexContent = renderLayout("All Projects", `
    <div class="posts-grid">
      <h1>All Projects</h1>
      <div class="posts-list">
        ${projects.map((project: ProjectData) => `
          <article class="post-card ${project.indexPost.frontmatter.featured ? 'featured' : ''}">
            <h2><a href="posts/${project.slug}.html">${project.indexPost.frontmatter.title}</a></h2>
            <div class="post-meta">
              <time>${new Date(project.indexPost.frontmatter.date).toLocaleDateString()}</time>
              ${project.updates.length > 0 ? `<p class="update-count">${project.updates.length} update${project.updates.length !== 1 ? 's' : ''}</p>` : ''}
              ${project.latestUpdate ? `<p class="latest-update">Latest: ${new Date(project.latestUpdate.frontmatter.date).toLocaleDateString()}</p>` : ''}
              ${project.indexPost.frontmatter.tags ? `
                <div class="tags">
                  ${project.indexPost.frontmatter.tags.map((tag: string) => `<a href="tags/${encodeURIComponent(tag.toLowerCase())}.html" class="tag">${tag}</a>`).join("")}
                </div>
              ` : ""}
            </div>
            <p>${project.indexPost.frontmatter.description || ""}</p>
            ${project.indexPost.frontmatter.gantt ? '<div class="post-indicator">📊 Interactive Gantt Chart</div>' : ''}
            ${project.indexPost.frontmatter.timeline ? '<div class="post-indicator">📅 Project Timeline</div>' : ''}
          </article>
        `).join("")}
      </div>
    </div>
  `, "", layoutOptions, config);
  await Deno.writeTextFile(join(DIST_DIR, "posts.html"), postsIndexContent);

  // Generate project pages (with updates included)
  console.log("📝 Generating project pages...");
  
  // Generate combined project pages with all updates on same page
  for (const project of projects) {
    // Generate project page with all updates included (accessible via /posts/project-slug)
    const projectContent = renderPost(project.indexPost, project, config);
    await Deno.writeTextFile(join(DIST_DIR, "posts", `${project.slug}.html`), projectContent);
    console.log(`   ✅ Generated: posts/${project.slug}.html (with ${project.updates.length} updates)`);
  }

  // Generate blog list page
  console.log("📝 Generating blog pages...");
  const blogListContent = renderBlogList(blogPosts, projects.length, config);
  await Deno.writeTextFile(join(DIST_DIR, "blog.html"), blogListContent);
  console.log("   ✅ Generated: blog.html");

  // Generate individual blog post pages
  for (const post of blogPosts) {
    const blogPostContent = renderBlogPost(post, config);
    await Deno.writeTextFile(join(DIST_DIR, "blog", `${post.slug}.html`), blogPostContent);
    console.log(`   ✅ Generated: blog/${post.slug}.html`);
  }

  // Generate tag pages
  console.log("🏷️  Generating tag pages...");
  
  // Combine project posts and blog posts for tags
  const allPosts = [...projectPosts, ...blogPosts.map(bp => ({
    ...bp,
    projectSlug: undefined,
    isIndex: false,
    type: 'blog' as const
  }))];
  
  // Generate main tags page
  const tagsPageContent = renderTagsPage(allPosts, projects.length, blogPosts.length, config);
  await Deno.writeTextFile(join(DIST_DIR, "tags.html"), tagsPageContent);
  console.log("   ✅ Generated: tags.html");
  
  // Generate individual tag pages
  const allTags = new Set<string>();
  allPosts.forEach(post => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  
  for (const tag of allTags) {
    const tagPageContent = renderTagPage(tag, allPosts, config);
    const fileName = `${tag.toLowerCase()}.html`;
    await Deno.writeTextFile(join(DIST_DIR, "tags", fileName), tagPageContent);
    console.log(`   ✅ Generated: tags/${fileName}`);
  }

  // Generate .htaccess for clean URLs
  console.log("🔧 Generating .htaccess for clean URLs...");
  const htaccessContent = `# Portfolio Website - Clean URLs and Apache Configuration
RewriteEngine On

# Remove .html extension from URLs
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([^.]+)$ $1.html [NC,L]

# Redirect .html URLs to clean URLs (optional - for SEO)
RewriteCond %{THE_REQUEST} /([^.]+)\\.html [NC]
RewriteRule ^ /%1 [NC,L,R=301]

# Handle posts directory
RewriteRule ^posts/([^/]+)/?$ posts/$1.html [NC,L]

# Handle tags directory
RewriteRule ^tags/([^/]+)/?$ tags/$1.html [NC,L]

# Custom error pages (optional)
ErrorDocument 404 /404.html

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 6 months"
    ExpiresByType image/jpg "access plus 6 months"
    ExpiresByType image/jpeg "access plus 6 months"
    ExpiresByType image/gif "access plus 6 months"
    ExpiresByType image/svg+xml "access plus 6 months"
    ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
`;
  await Deno.writeTextFile(join(DIST_DIR, ".htaccess"), htaccessContent);

  // Generate a simple 404 page
  console.log("❌ Generating 404 page...");
  const notFoundContent = renderLayout("Page Not Found", `
    <div style="text-align: center; padding: 4rem 0;">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <div style="margin-top: 2rem;">
        <a href="/" class="btn-primary">Go Home</a>
        <a href="/posts" class="btn-secondary">View Projects</a>
      </div>
    </div>
  `, "", {}, config);
  await Deno.writeTextFile(join(DIST_DIR, "404.html"), notFoundContent);

  // Generate robots.txt
  console.log("🤖 Generating robots.txt...");
  const domain = config.site.domain || "https://yourdomain.com";
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${domain}/sitemap.xml
`;
  await Deno.writeTextFile(join(DIST_DIR, "robots.txt"), robotsTxt);

  // Generate basic sitemap.xml
  console.log("🗺️  Generating sitemap.xml...");
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/posts</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  ${projectPosts.map((post: PostData) => `
  <url>
    <loc>${domain}/posts/${post.slug}</loc>
    <lastmod>${new Date(post.frontmatter.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${blogPosts.map((post: BlogPost) => `
  <url>
    <loc>${domain}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.frontmatter.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>
`;
  await Deno.writeTextFile(join(DIST_DIR, "sitemap.xml"), sitemapContent);

  // Update JavaScript files to work with static serving
  console.log("🔧 Updating JavaScript for static serving...");
  await updateJavaScriptForStatic();

  // Generate deployment information
  const deployInfo = {
    buildDate: new Date().toISOString(),
    projectPostsCount: projectPosts.length,
    blogPostsCount: blogPosts.length,
    projectsCount: projects.length,
    buildType: "static",
    version: "1.0.0"
  };
  await Deno.writeTextFile(join(DIST_DIR, "build-info.json"), JSON.stringify(deployInfo, null, 2));

  console.log("\n✅ Static site build complete!");
  console.log(`📁 Generated ${projects.length} projects with ${projectPosts.length} total posts`);
  console.log(`📰 Generated ${blogPosts.length} blog posts`);
  console.log(`📂 Output directory: ${DIST_DIR}`);
  console.log("\n🚀 Deployment Instructions:");
  console.log("1. Upload the entire 'dist' folder contents to your Apache web root");
  console.log("2. Ensure mod_rewrite is enabled on your Apache server");
  console.log(`3. ${config.site.domain === "https://yourdomain.com" ? "⚠️  Update your domain in config-user.json (site.domain)" : `✅ Domain configured: ${config.site.domain}`}`);
  console.log("4. Your site will be available at your domain!");
}

async function updateJavaScriptForStatic() {
  // Read the components.js file and update any server-dependent paths
  try {
    const componentsPath = join(DIST_DIR, "static", "js", "components.js");
    const componentsContent = await Deno.readTextFile(componentsPath);
    
    // Update any API calls or server-dependent code for static serving
    // (In this case, our JS is already static-friendly, but this is where you'd make changes)
    
    await Deno.writeTextFile(componentsPath, componentsContent);
  } catch (error) {
    console.warn("⚠️  Could not update JavaScript files:", (error as Error).message);
  }
}

if (import.meta.main) {
  try {
    await buildStaticSite();
  } catch (error) {
    console.error("❌ Build failed:", error);
    Deno.exit(1);
  }
}