import { renderLayout, LayoutOptions } from "./layout.ts";

interface PostData {
  slug: string;
  projectSlug?: string;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    featured?: boolean;
    gantt?: boolean;
    timeline?: Array<{
      title: string;
      date: string;
      link?: string;
    }>;
  };
  html: string;
  isIndex: boolean;
}

interface BlogPost {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
  };
  html: string;
}

export function renderHomepage(recentProjects: PostData[], recentBlogPosts: BlogPost[]): string {
  // Smart budget system: max 4 posts total, prefer 2 blog + 2 projects
  const MAX_TOTAL = 4;
  const PREFERRED_BLOG = 2;
  const PREFERRED_PROJECTS = 2;
  
  let blogCount = Math.min(recentBlogPosts.length, PREFERRED_BLOG);
  let projectCount = Math.min(recentProjects.length, PREFERRED_PROJECTS);
  
  // If we have unused budget, allocate to the other type
  const usedBudget = blogCount + projectCount;
  if (usedBudget < MAX_TOTAL) {
    const remainingBudget = MAX_TOTAL - usedBudget;
    
    if (blogCount < PREFERRED_BLOG && recentBlogPosts.length > blogCount) {
      const blogIncrease = Math.min(remainingBudget, recentBlogPosts.length - blogCount);
      blogCount += blogIncrease;
    } else if (projectCount < PREFERRED_PROJECTS && recentProjects.length > projectCount) {
      const projectIncrease = Math.min(remainingBudget, recentProjects.length - projectCount);
      projectCount += projectIncrease;
    }
  }
  
  const displayProjects = recentProjects.slice(0, projectCount);
  const displayBlogPosts = recentBlogPosts.slice(0, blogCount);
  const content = `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Automation Engineer & Embedded Systems Developer</h1>
          <p>Welcome to my portfolio showcasing projects in C++, embedded systems, electronics design, and automation engineering.</p>
        </div>
      </div>
    </section>

    ${displayProjects.length > 0 || displayBlogPosts.length > 0 ? `
    <section class="recent-posts">
      <div class="container">
        <h2>Recent Content</h2>
        <div class="posts-grid">
          ${displayProjects.map((post: PostData) => `
            <article class="post-card post-card-minimal">
              <div class="post-card-type">Project</div>
              <h3><a href="/posts/${post.projectSlug || post.slug}">${post.frontmatter.title}</a></h3>
              <p>${post.frontmatter.description || ""}</p>
              <div class="post-card-meta">
                <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
              </div>
            </article>
          `).join("")}
          
          ${displayBlogPosts.map((post: BlogPost) => `
            <article class="post-card post-card-minimal">
              <div class="post-card-type">Blog</div>
              <h3><a href="/blog/${post.slug}">${post.frontmatter.title}</a></h3>
              <p>${post.frontmatter.description || ""}</p>
              <div class="post-card-meta">
                <time>${new Date(post.frontmatter.date).toLocaleDateString()}</time>
              </div>
            </article>
          `).join("")}
        </div>
        
        <div class="recent-posts-actions">
          ${displayProjects.length > 0 ? '<a href="/posts" class="btn-secondary">All Projects →</a>' : ''}
          ${displayBlogPosts.length > 0 ? '<a href="/blog" class="btn-secondary">All Blog Posts →</a>' : ''}
        </div>
      </div>
    </section>
    ` : ""}
  `;

  const layoutOptions = {
    showProjects: recentProjects.length > 0,
    showBlog: recentBlogPosts.length > 0,
  };

  return renderLayout("Home", content, "", layoutOptions);
}