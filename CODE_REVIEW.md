# Code Review & Refactoring Plan

**Date:** October 20, 2025  
**Status:** Pre-refactor Analysis

## Executive Summary

The codebase is well-structured and functional, but has significant code duplication (estimated 30-40% redundancy). The main issue is the dual module system (static vs dynamic) and repeated type definitions across files. This review identifies opportunities to reduce the codebase size by ~500-700 lines while improving maintainability.

## Critical Issues

### 1. 🔴 **Massive Type Duplication** (Priority: HIGH)

**Problem:** Core interfaces are duplicated across 8+ files:
- `PostData`: Defined in 6 files (homepage.ts, post.ts, tags.ts, and their -static variants)
- `BlogPost`: Defined in 4 files (blog.ts, homepage.ts, and their -static variants)
- `ProjectData`: Defined in 2 files (post.ts, post-static.ts)
- `TagData`: Defined in 2 files (tags.ts, tags-static.ts)
- `SiteConfig`: Defined in 2 files (config.ts, layout-static.ts)

**Impact:** 
- ~150 lines of duplicate type definitions
- Type mismatches when interfaces evolve
- Maintenance nightmare

**Solution:**
```typescript
// Create src/modules/types.ts
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

export interface ProjectData {
  slug: string;
  indexPost: PostData;
  updates: PostData[];
  latestUpdate?: PostData;
}

export interface TagData {
  name: string;
  count: number;
  posts: TagPostData[];
}

export interface GanttTask {
  name: string;
  start: string;
  end: string;
  progress?: number;
  color?: string;
}

export interface TimelineEvent {
  title: string;
  date: string;
  link?: string;
}

export interface TagPostData {
  slug: string;
  projectSlug?: string;
  title: string;
  date: string;
  description?: string;
  tags: string[];
}
```

Then replace all duplicates with:
```typescript
import type { PostData, BlogPost, ProjectData } from "./types.ts";
```

**Estimated Savings:** ~150 lines removed, significantly improved type safety

---

### 2. 🟡 **Dual Module System** (Priority: MEDIUM-HIGH)

**Problem:** Every rendering module has two versions:
- `layout.ts` + `layout-static.ts` (131 lines each = 262 lines)
- `blog.ts` + `blog-static.ts` (~80 lines each = 160 lines)
- `homepage.ts` + `homepage-static.ts` (~112 lines each = 224 lines)
- `post.ts` + `post-static.ts` (~157 lines each = 314 lines)
- `tags.ts` + `tags-static.ts` (~150 lines each = 300 lines)
- `about.ts` + `about-static.ts` (~94 lines each = 188 lines)

**Total Duplication:** ~1,450 lines with 90-95% overlap

**Key Differences:**
1. Static versions use relative paths in some places (now actually absolute paths after our fix)
2. Static versions accept `config?: SiteConfig` parameter
3. URL generation differs:
   - Dev: `/articles/${slug}` (no .html)
   - Static: `articles/${slug}.html` (with .html)

**Solution Pattern:**

```typescript
// Unified approach with path builder
interface RenderOptions {
  basePath?: string;  // "/" for dev, "./" for static
  useHtmlExt?: boolean;  // false for dev, true for static
  config?: SiteConfig;
}

function buildUrl(path: string, options: RenderOptions): string {
  const base = options.basePath || "/";
  const ext = options.useHtmlExt ? ".html" : "";
  return `${base}${path}${ext}`;
}

// Example usage
export function renderBlogList(
  blogPosts: BlogPost[], 
  projectCount = 0,
  options: RenderOptions = {}
): string {
  const { config } = options;
  
  const content = `
    <article class="blog-post-card">
      <h2>
        <a href="${buildUrl(`articles/${post.slug}`, options)}">
          ${post.frontmatter.title}
        </a>
      </h2>
      <a href="${buildUrl(`topics/${tag}`, options)}" class="tag">
        ${tag}
      </a>
    </article>
  `;
  
  return renderLayout("Blog", content, "", {}, options);
}
```

**Alternative Approach (Simpler):**
Since our current static build actually uses absolute paths (after Apache fixes), we could:
1. Keep only the `-static.ts` versions
2. Delete the non-static versions
3. Update dev server to import from `-static.ts` files

**Estimated Savings:** 6 files deleted, ~700 lines removed

---

### 3. 🟢 **URL Generation Duplication** (Priority: MEDIUM)

**Problem:** URL patterns repeated throughout:
```typescript
// Repeated in multiple files
`articles/${post.slug}.html`
`projects/${post.projectSlug}.html`
`topics/${tag.toLowerCase()}.html`
`../tags/${tag}.html`  // Relative paths
```

**Solution:**
```typescript
// src/modules/url-utils.ts
export interface UrlOptions {
  absolute?: boolean;
  htmlExt?: boolean;
}

export function buildProjectUrl(slug: string, options: UrlOptions = {}): string {
  const prefix = options.absolute ? "/" : "";
  const ext = options.htmlExt ? ".html" : "";
  return `${prefix}projects/${slug}${ext}`;
}

export function buildBlogUrl(slug: string, options: UrlOptions = {}): string {
  const prefix = options.absolute ? "/" : "";
  const ext = options.htmlExt ? ".html" : "";
  return `${prefix}articles/${slug}${ext}`;
}

export function buildTagUrl(tag: string, options: UrlOptions = {}): string {
  const prefix = options.absolute ? "/" : "";
  const ext = options.htmlExt ? ".html" : "";
  return `${prefix}topics/${encodeURIComponent(tag.toLowerCase())}${ext}`;
}
```

**Estimated Savings:** ~30 lines, but significantly improved maintainability

---

## Dead Code & Files

### Files to Delete:

1. **`src/styles/main.css.bak`** - Old backup file (577 lines)
   - Status: Safe to delete
   - Reason: We have git history, no need for .bak files

2. **`main_test.ts`** - Empty test file
   - Status: Delete or implement
   - Decision needed: Are you planning to write tests?

3. **Duplicate dist files** - The file search shows duplicates:
   ```
   dist/static/js/timeline.js (appears 2x)
   dist/static/js/gantt.js (appears 2x)
   dist/static/js/gallery.js (appears 2x)
   dist/static/js/components.js (appears 2x)
   ```
   - Reason: These are build artifacts, fine as-is

### Unused CSS Classes (Needs Verification):

Run this check to find potentially unused CSS:
```bash
# Find CSS classes defined but not used
grep -o '\.[a-z-]*' src/styles/*.css | sort -u > css-classes.txt
grep -ro 'class="[^"]*"' src/modules/*.ts | sort -u > html-classes.txt
# Compare the two files
```

---

## Configuration Duplication

**Problem:** `SiteConfig` interface exists in two places:
- `src/modules/config.ts` (definitive version)
- `src/modules/layout-static.ts` (copy)

**Solution:**
```typescript
// layout-static.ts
import type { SiteConfig } from "./config.ts";
export { SiteConfig }; // Re-export for convenience
```

Remove the duplicate interface definition.

**Estimated Savings:** ~20 lines

---

## Refactoring Strategy

### Phase 1: Type Consolidation (Low Risk) 🟢
1. Create `src/modules/types.ts`
2. Move all interfaces to it
3. Update all imports
4. Test: `deno task build-static-dev`

**Estimated Time:** 30 minutes  
**Risk Level:** Low  
**Lines Removed:** ~150

### Phase 2: URL Utilities (Low Risk) 🟢
1. Create `src/modules/url-utils.ts`
2. Extract URL building functions
3. Replace inline URL construction
4. Test both dev server and static build

**Estimated Time:** 20 minutes  
**Risk Level:** Low  
**Lines Removed:** ~30

### Phase 3: Config Consolidation (Low Risk) 🟢
1. Remove `SiteConfig` from `layout-static.ts`
2. Import from `config.ts` instead
3. Test

**Estimated Time:** 5 minutes  
**Risk Level:** Very Low  
**Lines Removed:** ~20

### Phase 4: Remove Dead Files (Low Risk) 🟢
1. Delete `main.css.bak`
2. Delete or implement `main_test.ts`
3. Commit

**Estimated Time:** 2 minutes  
**Risk Level:** Very Low  
**Lines Removed:** ~577

### Phase 5: Module Consolidation (Medium Risk) 🟡
**Decision Point:** Two approaches:

#### Option A: Unified Module with isStatic flag
- Merge all paired modules
- Use `RenderOptions` pattern
- Keep both dev server and static build

**Pros:** Maximum code reuse, single source of truth  
**Cons:** More complex logic, harder to debug  
**Estimated Time:** 2-3 hours  
**Lines Removed:** ~700

#### Option B: Remove Dynamic Modules
- Delete all non-static versions
- Update dev server to use static versions
- Simplify

**Pros:** Simpler, less abstraction  
**Cons:** Dev server relies on static build code  
**Estimated Time:** 1 hour  
**Lines Removed:** ~700

**Recommendation:** Start with Phases 1-4, then evaluate whether Phase 5 is needed. The type consolidation alone will make the codebase much more maintainable.

---

## Code Quality Improvements

### JavaScript Modules

**Current State:** `src/static/js/components.js` is well-organized

**Suggestions:**
1. Consider splitting into separate concerns:
   - `navigation.js` - Nav and floating nav
   - `theme.js` - Theme toggle
   - `utils.js` - Copy buttons, lazy loading
   - `scroll.js` - Smooth scrolling

2. Or keep as-is if you prefer single bundle (current approach is fine for this scale)

### CSS Organization

**Current State:** Good separation between `main.css` and `components.css`

**Suggestions:**
1. Consider CSS custom properties for component-specific values
2. Current structure is actually quite good for a single-developer project

---

## Metrics

### Current State:
- **Total TS files:** 16 modules + 2 scripts + generated files
- **Duplicate code:** ~30-40% (estimated)
- **CSS files:** 2 (+ 1 .bak to delete)
- **JS files:** 4 (gallery, gantt, timeline, components)

### After Phase 1-4 (Low-hanging fruit):
- **Lines removed:** ~780
- **Duplicate code:** ~25%
- **Improved type safety:** ✅
- **Build time:** No change
- **Maintenance complexity:** Significantly reduced

### After Phase 5 (Complete refactor):
- **Files deleted:** 6 modules
- **Lines removed:** ~1,480
- **Duplicate code:** <10%
- **Maintainability:** Excellent

---

## Recommendations Priority

1. ✅ **Do Now:** Phases 1-4 (Type consolidation, URL utils, config, dead files)
2. 🤔 **Consider:** Phase 5 if you plan to actively maintain and extend the site
3. ⏸️ **Skip:** Phase 5 if the site is "done" and you just need occasional content updates

---

## Questions for Decision

1. **Tests:** Do you want to keep `main_test.ts` and add tests, or delete it?
2. **Module Strategy:** Option A (unified) or Option B (static-only)?
3. **CSS Audit:** Should we verify unused CSS classes?
4. **Documentation:** Should we document the new architecture in README?

---

## Next Steps

Let me know which phases you want to tackle, and I'll implement them one by one with proper testing between each phase.
