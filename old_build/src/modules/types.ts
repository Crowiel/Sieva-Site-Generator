/**
 * Shared TypeScript type definitions for the site generator
 * All interfaces used across multiple modules are centralized here
 */

// Gantt chart task definition
export interface GanttTask {
  name: string;
  start: string;
  end: string;
  progress?: number;
  color?: string;
}

// Timeline event definition
export interface TimelineEvent {
  title: string;
  date: string;
  link?: string;
}

// Post/Project frontmatter and data
export interface PostData {
  slug: string;
  projectSlug?: string;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    featured?: boolean;
    gantt?: boolean | GanttTask[];
    isIndex?: boolean;
    timeline?: TimelineEvent[];
  };
  html: string;
  isIndex: boolean;
}

// Project data with index post and updates
export interface ProjectData {
  slug: string;
  indexPost: PostData;
  updates: PostData[];
  latestUpdate?: PostData;
}

// Blog post data
export interface BlogPost {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
  };
  html: string;
}

// Tag data for tag pages
export interface TagData {
  name: string;
  count: number;
  posts: TagPostData[];
}

// Simplified post data for tag listings
export interface TagPostData {
  slug: string;
  projectSlug?: string;
  title: string;
  date: string;
  description?: string;
  tags: string[];
}

// Site configuration
export interface SiteConfig {
  site: {
    name: string;
    subtitle: string;
    footer: string;
    showGeneratorCredit?: boolean;
    domain?: string;
  };
  navigation: {
    home: string;
    projects: string;
    blog: string;
    about: string;
    floatingNav?: boolean;
    stickyHeader?: boolean;
  };
  pages: {
    blog: {
      title: string;
      description: string;
    };
    projects: {
      title: string;
      description: string;
    };
    about: {
      title: string;
    };
  };
  server?: {
    port?: number;
  };
  contact?: {
    email?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
}

// Layout options for conditional rendering
export interface LayoutOptions {
  showProjects?: boolean;
  showBlog?: boolean;
  showAbout?: boolean;
}

// URL generation options
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
