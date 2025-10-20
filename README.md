# WIP: README IS STILL SUSPECT TO REVIEW


# Sievä Site Generator# Portfolio SSG - Deno + TypeScript + MDX



[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)A modern, fast static site generator (SSG) built with Deno, TypeScript, and MDX for content management. Perfect for showcasing automation engineering and embedded systems projects with interactive components like Gantt charts and project timelines.

[![Deno](https://img.shields.io/badge/deno-2.0+-black.svg)](https://deno.land/)

[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)**🔧 Designed as an upstream template:** This repository is structured to be forked for private portfolios. All example content is prefixed with `demo-` and automatically excluded from production builds.



A modern, lightweight static site generator built with Deno, TypeScript, and MDX. Perfect for portfolios, blogs, and project showcases with interactive components.## Features



## ✨ Features- 📝 **MDX Content**: Write posts in Markdown with frontmatter and custom components

- 🎯 **Interactive Components**: Gantt charts and project timelines for project visualization

- **📝 MDX-Based Content** - Write in Markdown with React-like components- 🚀 **Dual Build Modes**: Dev mode with demos, release mode for production

- **🎨 Interactive Components**- 📱 **Responsive Design**: Modern CSS with mobile-first approach, Nordic theme

  - Gantt charts for project timelines- 🔧 **Type Safety**: Full TypeScript support throughout the codebase

  - Project timeline navigation with anchor links- 🎨 **Modern UI**: Clean, professional design with floating navigation

  - Image galleries with lightbox- 🌓 **Theme Toggle**: Light/dark mode with crescent moon slider

  - Code syntax highlighting- 🏗️ **DevOps Ready**: Upstream framework + private content fork workflow

- **🌓 Theme Support** - Beautiful light/dark mode with smooth transitions- 📊 **Content Separation**: Projects and blog posts with smart budget system

- **📱 Fully Responsive** - Mobile-first design with floating navigation- ⚙️ **Configuration System**: Easy customization via config files, survives upstream updates

- **⚡️ Fast & Lightweight** - No JavaScript frameworks, pure TypeScript

- **🔧 Developer-Friendly**## Quick Start for Your Portfolio

  - Hot reload dev server

  - TypeScript throughout1. **Fork or clone** this repository

  - Easy configuration system2. **Copy the default config** to create your customization:

  - Static build for Apache/Nginx   ```bash

- **🎯 Content Management**   cp config-default.json config-user.json

  - Projects with updates   ```

  - Blog posts3. **Edit `config-user.json`** with your name, subtitle, and navigation labels

  - Tag system4. **Add your content** to `src/content/` (or keep demo content for dev mode)

  - Demo content filtering5. **Build and deploy**:

   ```bash

## 🚀 Quick Start   deno task build-static-release  # Excludes demo- content

   ```

### Prerequisites

Your `config-user.json` is gitignored and safe from upstream updates!

- [Deno](https://deno.land/) 2.0 or higher

See [CONFIG.md](CONFIG.md) for full configuration documentation.

### Installation

## Project Structure

```bash

# Clone the repository```

git clone https://github.com/Crowiel/Sieva-Site-Generator.git├── config-default.json      # Default template configuration

cd Sieva-Site-Generator├── config-user.json         # Your custom config (gitignored)

├── deno.json               # Deno configuration and dependencies

# Copy the default configuration├── main.ts                 # Main server file with routing

cp config-default.json config-user.json├── scripts/

│   └── build-mdx.ts        # MDX to TypeScript build script

# Start the development server│   └── build-static.ts     # Static site builder for Apache

deno task dev├── src/

```│   ├── content/            # MDX content files (your blog posts/projects)

│   ├── generated/          # Auto-generated TypeScript from MDX

Visit `http://localhost:8000` to see your site!│   ├── modules/            # Page rendering modules

│   │   ├── config.ts       # Configuration loader

### Configuration│   │   ├── about.ts

│   │   ├── homepage.ts

Edit `config-user.json` to customize your site:│   │   ├── layout.ts

│   │   └── post.ts

```json│   ├── static/             # Static assets

{│   │   └── js/             # JavaScript components

  "siteName": "Your Name",│   │       ├── components.js

  "siteSubtitle": "Your Subtitle",│   │       ├── gantt.js

  "siteUrl": "https://your-domain.com",│   │       └── timeline.js

  "homeLabel": "Home",│   └── styles/             # CSS stylesheets

  "projectsLabel": "Projects",│       ├── main.css

  "aboutLabel": "About",│       └── components.css

  "blogLabel": "Blog"└── README.md

}```

```

## Getting Started

## 📁 Project Structure

### Prerequisites

```

├── config-default.json      # Default configuration- [Deno](https://deno.land/) installed on your system

├── config-user.json         # Your custom config (gitignored)

├── deno.json               # Deno configuration## Quick Start

├── main.ts                 # Dev server

├── scripts/### As a Template (Recommended)

│   ├── build-mdx.ts        # MDX to TypeScript compiler

│   └── build-static.ts     # Static site builderThis repository is designed to be used as an **upstream template** for your private portfolio:

├── src/

│   ├── content/            # Your content (MDX files)1. **Fork this repository to your private repo**

│   │   ├── blog/           # Blog posts2. **Add your content** (without `demo-` prefix)

│   │   │   └── img/        # Blog images3. **Pull upstream updates** when the framework improves

│   │   └── projects/       # Project pages

│   │       └── {project}/  👉 **See [DEVOPS-WORKFLOW.md](DEVOPS-WORKFLOW.md) for complete setup guide**

│   │           └── img/    # Project images

│   ├── modules/            # Page rendering modules### Direct Installation

│   ├── static/             # Static assets (JS)

│   ├── styles/             # CSS files1. **Clone the repository**:

│   └── generated/          # Auto-generated from MDX   ```bash

└── dist/                   # Built static site   git clone https://github.com/Crowiel/insmsievanen.fi.git

```   cd insmsievanen.fi

   ```

## 📝 Writing Content

2. **Install dependencies** (automatically cached on first run):

### Creating a Blog Post   ```bash

   deno cache main.ts

Create a file in `src/content/blog/my-post.mdx`:   ```



```mdx3. **Build with demo content**:

---   ```bash

title: "My First Post"   deno task build-dev

date: "2025-01-01"   ```

description: "A great blog post"

tags: ["typescript", "deno"]4. **Start development server**:

---   ```bash

   deno task dev

# Hello World   ```



This is my first blog post with **MDX**!5. **Visit**: http://localhost:8000



\`\`\`typescript### Creating Your Content

const greeting = "Hello, Deno!";

console.log(greeting);Create blog posts in `src/content/blog/` or projects in `src/content/projects/`:

\`\`\`

```**Example blog post** `src/content/blog/my-first-post.mdx`:

   ```mdx

### Creating a Project   ---

   title: "My First Project"

Create a folder in `src/content/projects/my-project/` with an index file `my-project-index.mdx`:   date: "2024-01-15"

   description: "Description of my amazing project"

```mdx   tags: ["C++", "Embedded Systems", "IoT"]

---   featured: true

title: "My Project"   gantt: true

date: "2025-01-01"   timeline:

description: "An awesome project"     - title: "Planning Phase"

tags: ["web", "typescript"]       date: "2024-01-01"

isIndex: true       link: "#planning"

projectSlug: "my-project"     - title: "Development"

gantt:       date: "2024-01-15"

  - name: "Planning"       link: "#development"

    start: "2025-01-01"   ---

    end: "2025-01-15"

    progress: 100   # My First Project

  - name: "Development"

    start: "2025-01-10"   This is the content of your project post written in Markdown.

    end: "2025-02-01"

    progress: 60   ## Planning Phase {#planning}

---

   Details about the planning phase...

# My Project

   ## Development {#development}

Project description here...

```   Details about development...

   ```

### Adding Image Galleries

4. **Build the MDX content**:

Place images in `src/content/projects/{project}/img/` or `src/content/blog/img/`, then add to your MDX:   ```bash

   deno task build

```mdx   ```

Gallery: image1.png, image2.png, image3.png

```5. **Start the development server**:

   ```bash

The gallery will display as a responsive grid with lightbox functionality.   deno task dev

   ```

## 🎯 Interactive Components

6. **Visit your site**: Open http://localhost:8000

### Gantt Chart

## Build Modes

Add to frontmatter:

This SSG supports two build modes to separate demo content from production:

```yaml

gantt:### Development Mode (Includes Demo Content)

  - name: "Task Name"

    start: "2025-01-01"```bash

    end: "2025-01-31"deno task build-dev          # Build with demo- files

    progress: 75deno task build-static-dev   # Static site with demo- files

    color: "#4CAF50"deno task dev                # Start dev server

``````



### Project Timeline### Production Mode (Excludes Demo Content)



Add to frontmatter:```bash

deno task build-release      # Build production site (no demo- files)

```yamldeno task release           # Alias for build-release

timeline:```

  - title: "Milestone 1"

    date: "2025-01-01"**File Naming Convention:**

    link: "#section-1"- `demo-*.mdx` - Demo/example content (excluded from production)

  - title: "Milestone 2"- `*.mdx` - Production content (always included)

    date: "2025-02-01"

    link: "#section-2"👉 **See [BUILD-MODES.md](BUILD-MODES.md) for detailed build documentation**

```

## Content Management

## 🛠️ Development

### Writing Posts

### Available Commands

Posts are written in MDX format in the `src/content/blog/` or `src/content/projects/` directories:

```bash

# Development server with hot reload#### Frontmatter Options

deno task dev

```yaml

# Build MDX files (development mode - includes demo content)---

deno task build-devtitle: "Post Title"                    # Required: Post title

date: "2024-01-15"                    # Required: Publication date (YYYY-MM-DD)

# Build static site for deployment (development mode)description: "Brief description"       # Optional: Post description for previews

deno task build-static-devtags: ["Tag1", "Tag2", "Tag3"]        # Optional: Array of tags

featured: true                        # Optional: Show on homepage as featured

# Build for production (excludes demo-* files)gantt: true                           # Optional: Enable Gantt chart component

deno task build-releasetimeline:                             # Optional: Project timeline

  - title: "Phase 1"

# Build and start dev server    date: "2024-01-01"

deno task build-and-serve    link: "#phase1"                   # Optional: Link to section or external URL

```  - title: "Phase 2"

    date: "2024-02-01"

### Development vs Production---

```

- **Dev mode**: Includes all `demo-*` files for testing

- **Release mode**: Excludes `demo-*` files for clean production build#### Content Guidelines



## 🚀 Deployment- Use standard Markdown syntax

- Add `{#anchor-id}` to headings for timeline linking

### Build for Production- Include code blocks with language specification for syntax highlighting

- Use relative paths for images stored in `src/static/`

```bash

deno task build-release### Interactive Components

```

#### Timeline Component

This creates a `dist/` folder with:

- Static HTML filesAutomatically generated from frontmatter. Features:

- CSS and JavaScript- Clickable timeline items

- Images and assets- Smooth scrolling to linked sections

- `.htaccess` for clean URLs (Apache)- Hover previews

- `robots.txt` and `sitemap.xml`- Keyboard navigation



### Deploy to Apache/Nginx#### Gantt Chart Component



1. Upload the entire `dist/` folder to your web serverEnable with `gantt: true` in frontmatter. Features:

2. Point your domain to the upload directory- Interactive project timeline visualization

3. Ensure mod_rewrite is enabled (Apache) or configure URL rewriting (Nginx)- Collapsible/expandable display

- Sample data included (customize in `gantt.js`)

### Example Nginx Configuration

### Building and Deployment

```nginx

location / {#### Development Workflow

    try_files $uri $uri/ $uri.html =404;

}```bash

```# 1. Create/edit MDX files in src/content/

# 2. Build the content

## ⚙️ Configurationdeno task build



### Site Settings# 3. Start development server

deno task dev

```json

{# 4. Build and serve in one command

  "siteName": "Your Name",deno task build-and-serve

  "siteSubtitle": "Tagline",```

  "siteUrl": "https://example.com",

  "footerText": "All rights reserved.",## Available Tasks

  "showGeneratorCredit": true

}| Command | Description | Use Case |

```|---------|-------------|----------|

| `deno task dev` | Start dev server | Local development |

### Navigation Labels| `deno task build-dev` | Build with demo content | Development/testing |

| `deno task build-static-dev` | Static site with demos | Test full static site |

```json| `deno task build-release` | Production build | Deploy to production |

{| `deno task build` | Alias for build-dev | Quick dev build |

  "homeLabel": "Home",| `deno task build-and-serve` | Build + start server | All-in-one dev |

  "projectsLabel": "Projects",| `deno task release` | Alias for build-release | Quick prod build |

  "aboutLabel": "About",

  "blogLabel": "Blog"## Deployment Options

}

```### Recommended: Static Apache Hosting



### Content Budget```bash

# Build production site (excludes demo- files)

Control how many items appear on the homepage:deno task build-release



```json# Upload dist/ folder contents to your Apache server

{# Includes .htaccess for clean URLs

  "maxRecentProjects": 3,```

  "maxRecentBlogPosts": 3

}**Perfect for:**

```- Shared hosting

- VPS with Apache

## 🎨 Customization- Fast, cached delivery

- No runtime dependencies

### Styling

### Alternative: Deno Deploy

Edit `src/styles/main.css` for global styles or `src/styles/components.css` for component-specific styles.

```bash

CSS variables for easy theming:# Push to GitHub

git push

```css

:root {# Connect repo to Deno Deploy

  --color-primary: #1a1a1a;# Set entry point: main.ts

  --color-secondary: #2471a3;# Auto-deploys on push

  --color-accent: #f39c12;```

  /* ... more variables */

}**Perfect for:**

```- Dynamic content

- Edge computing

### Adding Custom Components- Instant global CDN



1. Create a module in `src/modules/`### CI/CD Setup

2. Import and use in your MDX files

3. Rebuild with `deno task build-dev`See [DEVOPS-WORKFLOW.md](DEVOPS-WORKFLOW.md) for:

- GitHub Actions example

## 🤝 Contributing- GitLab CI configuration

- Automated deployment pipelines

Contributions are welcome! Please feel free to submit a Pull Request.

## DevOps Workflow: Upstream + Private Fork

1. Fork the repository

2. Create your feature branch (`git checkout -b feature/amazing-feature`)This repository is designed to serve as an **upstream template** for your private content fork:

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)### The Strategy

5. Open a Pull Request

1. **Public Upstream** (this repo): SSG framework with demo content

## 📄 License2. **Private Fork**: Your actual portfolio content



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.### Benefits



## 🙏 Acknowledgments✅ Framework improvements from upstream  

✅ Keep content private  

- Built with [Deno](https://deno.land/)✅ Demo files never leak to production  

- Powered by [MDX](https://mdxjs.com/)✅ Clean separation of concerns  

- Icons and styling inspired by modern web design

### Quick Setup

## 📞 Support

```bash

- 📧 Open an issue for bug reports# 1. Fork this repository (keep public or make private)

- 💡 Start a discussion for feature requests# 2. Clone your fork

- ⭐ Star the repo if you find it useful!git clone https://github.com/yourusername/your-portfolio.git



---# 3. Add upstream remote

git remote add upstream https://github.com/original/repo.git

**Made with ❤️ using Deno and TypeScript**

# 4. Create your content (without demo- prefix)
# Edit src/content/blog/my-post.mdx

# 5. Build for production (excludes demo- files)
deno task build-release

# 6. Pull upstream improvements anytime
git fetch upstream
git merge upstream/main
```

**👉 Full guide: [DEVOPS-WORKFLOW.md](DEVOPS-WORKFLOW.md)**

Topics covered:
- Initial fork setup
- Content management strategy
- Pulling upstream updates
- Handling merge conflicts
- CI/CD automation
- Branch strategies
- Security best practices

## Customization

### Branding

- **Site Name & Subtitle**: Edit `src/modules/layout.ts` and `src/modules/layout-static.ts`
  ```html
  <span class="brand-name">Your Name</span>
  <span class="brand-subtitle">Your Professional Title</span>
  ```

### Styling

- **Main styles**: Edit `src/styles/main.css`
- **Component styles**: Edit `src/styles/components.css`
- **CSS Variables**: Modify colors, fonts, and spacing in `:root` section

### Components

- **Gantt Chart**: Customize `src/static/js/gantt.js`
- **Timeline**: Modify `src/static/js/timeline.js`
- **General UI**: Update `src/static/js/components.js`

### Layout

- **Homepage**: Edit `src/modules/homepage.ts`
- **About Page**: Edit `src/modules/about.ts`
- **Post Layout**: Edit `src/modules/post.ts`
- **Site Layout**: Edit `src/modules/layout.ts`

### Content Organization

- **Posts per page**: Modify `recentPosts` logic in `scripts/build-mdx.ts`
- **Featured posts**: Set `featured: true` in post frontmatter
- **Post sorting**: Customize sorting in `build-mdx.ts`

## Performance

- **Build time**: MDX compilation happens at build time, not runtime
- **Serving**: Static files served efficiently with Deno's built-in file server
- **Caching**: Browser caching headers included for static assets
- **Bundle size**: No client-side JavaScript framework - vanilla JS only

### Deployment Examples

### Apache Hosting (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Apache hosting guide.

```bash
# Quick Apache deployment
deno task build-release
# Upload dist/ contents to your web root
```

### Deno Deploy (Dynamic)

1. Push to GitHub repository
2. Connect to Deno Deploy
3. Set entry point to `main.ts`
4. Deploy automatically

### Docker

```dockerfile
FROM denoland/deno:alpine
WORKDIR /app
COPY . .
RUN deno cache main.ts
RUN deno task build
EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-read", "main.ts"]
```

### Manual Server Setup

```bash
# On your server
git clone <your-repo>
cd portfolio
deno task build
deno run --allow-net --allow-read main.ts
```

## Troubleshooting

### Common Issues

1. **MDX build fails**: Check frontmatter syntax and ensure all required fields are present
2. **Images not loading**: Verify image paths are relative to `src/static/`
3. **Styles not applying**: Ensure CSS files are properly linked in layout.ts
4. **Timeline links not working**: Check anchor IDs match timeline link targets

### Debug Mode

Enable verbose logging by adding to `main.ts`:
```typescript
console.log('Debug: Request for', url.pathname);
```

## Documentation

- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - ⚡ Essential commands & patterns
- **[BUILD-MODES.md](BUILD-MODES.md)** - Development vs Production builds
- **[DEVOPS-WORKFLOW.md](DEVOPS-WORKFLOW.md)** - Upstream/fork workflow guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Apache hosting guide
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Detailed setup guide
- **[CONTENT-STRUCTURE.md](CONTENT-STRUCTURE.md)** - Content organization
- **[CSS-REFACTORING.md](CSS-REFACTORING.md)** - CSS architecture notes
- **[NAVIGATION-ENHANCEMENT.md](NAVIGATION-ENHANCEMENT.md)** - Adaptive navigation system
- **[LAYOUT-CENTERING-FIX.md](LAYOUT-CENTERING-FIX.md)** - Content centering fix
- **[TWO-LINE-BRAND.md](TWO-LINE-BRAND.md)** - Two-line header branding

## License

MIT License - feel free to use this as a base for your own portfolio!

## Contributing

This repository serves as an **upstream SSG template**. Contributions are welcome!

### Framework Improvements

Found a bug or have an enhancement for the SSG itself?
- Open an issue describing the problem/improvement
- Submit a PR with your fix/feature
- Framework improvements benefit all users

### Your Content

Keep your actual portfolio content in a **private fork**:
- This repo: Public SSG framework + demo files
- Your fork: Real content without `demo-` prefix
- Pull upstream improvements anytime

See [DEVOPS-WORKFLOW.md](DEVOPS-WORKFLOW.md) for the complete strategy.

---

**Built with 💙 using Deno, TypeScript, and MDX**