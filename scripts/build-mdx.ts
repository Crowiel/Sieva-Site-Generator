import { walk } from "@std/fs/walk";
import { parse, join, basename, dirname, relative } from "@std/path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { renderGallery, parseGalleryString } from "../src/modules/gallery.ts";

interface PostFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  isIndex?: boolean;
  projectSlug?: string;
  gantt?: boolean;
  timeline?: Array<{
    title: string;
    date: string;
    link?: string;
  }>;
}

interface PostData {
  slug: string;
  projectSlug?: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
  isIndex: boolean;
  type: 'project' | 'blog';
}

interface ProjectData {
  slug: string;
  indexPost: PostData;
  updates: PostData[];
  latestUpdate?: PostData;
}

interface BlogPost {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
}

/**
 * Process gallery tags in markdown content
 * Looks for lines like "Gallery: image1.png, image2.png, image3.png"
 * and replaces them with rendered gallery HTML
 */
function processGalleryTags(markdownContent: string, basePath: string, contentType: 'project' | 'blog', projectSlug?: string): string {
  const lines = markdownContent.split('\n');
  const processedLines: string[] = [];
  let galleryCounter = 0;
  
  for (const line of lines) {
    // Check if line starts with "Gallery:"
    if (line.trim().startsWith('Gallery:')) {
      const galleryStr = line.trim().substring(8).trim(); // Remove "Gallery:" prefix
      
      // Determine the base path for images
      let imgBasePath: string;
      if (contentType === 'project' && projectSlug) {
        imgBasePath = `/media/projects/${projectSlug}`;
      } else if (contentType === 'blog') {
        imgBasePath = `/media/blog`;
      } else {
        imgBasePath = `/media`;
      }
      
      // Parse gallery images
      const images = parseGalleryString(galleryStr, imgBasePath);
      
      // Generate unique gallery ID
      const galleryId = `gallery-${galleryCounter++}`;
      
      // Render gallery HTML
      const galleryHtml = renderGallery(images, galleryId);
      
      // Add the gallery HTML as a raw HTML block (markdown processors preserve raw HTML)
      processedLines.push(galleryHtml);
    } else {
      processedLines.push(line);
    }
  }
  
  return processedLines.join('\n');
}

async function buildMdxFiles(mode: 'dev' | 'release' = 'dev') {
  console.log(`Building MDX files in ${mode} mode...`);
  
  const projectPosts: PostData[] = [];
  const blogPosts: BlogPost[] = [];
  const projects: ProjectData[] = [];
  const contentDir = "./src/content";
  const outputDir = "./src/generated";

  // Ensure output directory exists
  try {
    await Deno.mkdir(outputDir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }

  // Helper function to check if file should be processed
  const shouldProcessFile = (filename: string): boolean => {
    const isDemo = filename.startsWith('demo-');
    if (mode === 'dev') {
      return true; // Include all files in dev mode
    }
    return !isDemo; // Exclude demo files in release mode
  };

  // Process all .mdx files in projects folder
  const projectsDir = join(contentDir, "projects");
  try {
    for await (const entry of walk(projectsDir, { 
      exts: [".mdx", ".md"], 
      includeDirs: false 
    })) {
      const filename = basename(entry.path);
      
      // Skip demo files in release mode
      if (!shouldProcessFile(filename)) {
        console.log(`Skipping demo file: ${entry.path}`);
        continue;
      }
      
      console.log(`Processing project: ${entry.path}`);
      
      const content = await Deno.readTextFile(entry.path);
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Generate slug from filename
      const slug = basename(entry.path, parse(entry.path).ext);
      
      // Determine project slug from folder structure or frontmatter
      const pathParts = entry.path.split(/[\/\\]/);
      const projectSlug = frontmatter.projectSlug || pathParts[pathParts.length - 2];
      
      // Process gallery tags in markdown content
      const processedContent = processGalleryTags(markdownContent, entry.path, 'project', projectSlug);
      
      // Convert markdown to HTML
      const processor = unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeStringify, { allowDangerousHtml: true });
      
      const result = await processor.process(processedContent);
      const html = String(result);
      
      const postData: PostData = {
        slug,
        projectSlug,
        frontmatter: frontmatter as PostFrontmatter,
        content: markdownContent,
        html,
        isIndex: Boolean(frontmatter.isIndex),
        type: 'project'
      };
      
      projectPosts.push(postData);
      
      // Generate TypeScript module for each project post
      const tsContent = `// Generated from ${entry.path}
export const frontmatter = ${JSON.stringify(postData.frontmatter, null, 2)};
export const content = ${JSON.stringify(postData.content)};
export const html = ${JSON.stringify(postData.html)};
export const slug = "${slug}";
export const projectSlug = "${projectSlug}";
export const isIndex = ${postData.isIndex};
export const type = "project";

export default {
  frontmatter,
  content,
  html,
  slug,
  projectSlug,
  isIndex,
  type
};
`;
      
      const outputPath = join(outputDir, `${slug}.ts`);
      await Deno.writeTextFile(outputPath, tsContent);
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    console.log("No projects directory found");
  }

  // Process all .mdx files in blog folder
  const blogDir = join(contentDir, "blog");
  try {
    for await (const entry of walk(blogDir, { 
      exts: [".mdx", ".md"], 
      includeDirs: false 
    })) {
      const filename = basename(entry.path);
      
      // Skip demo files in release mode
      if (!shouldProcessFile(filename)) {
        console.log(`Skipping demo file: ${entry.path}`);
        continue;
      }
      
      console.log(`Processing blog post: ${entry.path}`);
      
      const content = await Deno.readTextFile(entry.path);
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Generate slug from filename
      const slug = basename(entry.path, parse(entry.path).ext);
      
      // Process gallery tags in markdown content
      const processedContent = processGalleryTags(markdownContent, entry.path, 'blog');
      
      // Convert markdown to HTML
      const processor = unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeStringify, { allowDangerousHtml: true });
      
      const result = await processor.process(processedContent);
      const html = String(result);
      
      const blogPost: BlogPost = {
        slug,
        frontmatter: frontmatter as PostFrontmatter,
        content: markdownContent,
        html
      };
      
      blogPosts.push(blogPost);
      
      // Generate TypeScript module for each blog post
      const tsContent = `// Generated from ${entry.path}
export const frontmatter = ${JSON.stringify(blogPost.frontmatter, null, 2)};
export const content = ${JSON.stringify(blogPost.content)};
export const html = ${JSON.stringify(blogPost.html)};
export const slug = "${slug}";
export const type = "blog";

export default {
  frontmatter,
  content,
  html,
  slug,
  type
};
`;
      
      const outputPath = join(outputDir, `blog-${slug}.ts`);
      await Deno.writeTextFile(outputPath, tsContent);
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    console.log("No blog directory found");
  }

  // Group posts by projects
  const projectsMap = new Map<string, ProjectData>();
  
  for (const post of projectPosts) {
    if (!post.projectSlug) continue;
    
    if (!projectsMap.has(post.projectSlug)) {
      projectsMap.set(post.projectSlug, {
        slug: post.projectSlug,
        indexPost: post, // Will be replaced if not index
        updates: []
      });
    }
    
    const project = projectsMap.get(post.projectSlug)!;
    
    if (post.isIndex) {
      project.indexPost = post;
    } else {
      project.updates.push(post);
    }
  }

  // Sort updates within each project by date (newest first)
  for (const project of projectsMap.values()) {
    project.updates.sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
    
    // Set latest update
    if (project.updates.length > 0) {
      project.latestUpdate = project.updates[0];
    }
    
    projects.push(project);
  }

  // Sort projects by index post date (newest first)
  projects.sort((a, b) => 
    new Date(b.indexPost.frontmatter.date).getTime() - 
    new Date(a.indexPost.frontmatter.date).getTime()
  );

  // Sort blog posts by date (newest first)
  blogPosts.sort((a, b) =>
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );

  // Generate posts index
  const indexContent = `// Generated posts and projects index
export interface PostFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  isIndex?: boolean;
  projectSlug?: string;
  gantt?: boolean;
  timeline?: Array<{
    title: string;
    date: string;
    link?: string;
  }>;
}

export interface PostData {
  slug: string;
  projectSlug?: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
  isIndex: boolean;
  type: 'project' | 'blog';
}

export interface BlogPost {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
}

export interface ProjectData {
  slug: string;
  indexPost: PostData;
  updates: PostData[];
  latestUpdate?: PostData;
}

export const projectPosts: PostData[] = ${JSON.stringify(projectPosts, null, 2)};
export const blogPosts: BlogPost[] = ${JSON.stringify(blogPosts, null, 2)};
export const projects: ProjectData[] = ${JSON.stringify(projects, null, 2)};

export const featuredProjects = projects.filter(project => project.indexPost.frontmatter.featured);
export const recentProjects = projects.slice(0, 5);
export const recentBlogPosts = blogPosts.slice(0, 5);

export function getProjectBySlug(slug: string): ProjectData | undefined {
  return projects.find(project => project.slug === slug);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getPostBySlug(slug: string): PostData | undefined {
  return projectPosts.find(post => post.slug === slug);
}

export function getProjectsByTag(tag: string): ProjectData[] {
  return projects.filter(project => 
    project.indexPost.frontmatter.tags && project.indexPost.frontmatter.tags.includes(tag)
  );
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post =>
    post.frontmatter.tags && post.frontmatter.tags.includes(tag)
  );
}

export function getAllUpdates(): PostData[] {
  return projects.flatMap(project => project.updates)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export function getAllTags(): string[] {
  const projectTags = projects.flatMap(project => project.indexPost.frontmatter.tags || []);
  const blogTags = blogPosts.flatMap(post => post.frontmatter.tags || []);
  return Array.from(new Set([...projectTags, ...blogTags])).sort();
}
`;

  await Deno.writeTextFile(join(outputDir, "posts.ts"), indexContent);
  
  const modeLabel = mode === 'dev' ? '(including demo content)' : '(production content only)';
  console.log(`✅ Built ${projects.length} projects with ${projectPosts.length} total project posts and ${blogPosts.length} blog posts successfully! ${modeLabel}`);
}

if (import.meta.main) {
  // Get mode from command line argument
  const mode = Deno.args[0] as 'dev' | 'release' || 'dev';
  await buildMdxFiles(mode);
}