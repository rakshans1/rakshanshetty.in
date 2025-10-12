# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Gatsby 4, hosted on Netlify. The blog features markdown-based content with support for tags, Disqus comments, RSS feed, and Google Analytics tracking.

## Development Commands

- `yarn develop` or `npm start` - Start development server (typically on http://localhost:8000)
- `yarn build` or `npm run build` - Build for production (also copies _redirects file to public/)
- `yarn serve` - Serve the production build locally
- `yarn clean` - Clean Gatsby cache and public directory
- `yarn format` - Format all JS, JSX, JSON, and MD files with Prettier

## Code Style

- Prettier is configured and runs on pre-commit via husky + lint-staged
- Code style: no semicolons, double quotes, 2-space tabs, LF line endings, ES5 trailing commas
- **Never commit without formatting** - the pre-commit hook will auto-format staged files

## Architecture

### Content Structure

- Blog posts live in `content/blog/` as markdown files with frontmatter
- Each post is in its own directory (e.g., `content/blog/my-post/index.md`)
- Frontmatter fields: `title`, `date`, `modified`, `description`, `tags`, `image`, `banner`, `disqus_id`
- Static assets are in `content/assets/`

### Page Generation (gatsby-node.js)

- **Blog posts**: Dynamically created from markdown files using `src/templates/blog-post.js`
- **Tag pages**: Automatically created for each unique tag using `src/templates/tags.js`
- URL structure: Posts use their directory name as slug, tags use `/tag/kebab-case-tag/`
- Navigation: Each post page includes previous/next post links

### Key Components

- `src/components/layout.js` - Main layout wrapper with theme toggle
- `src/components/bio.js` - Author bio component
- `src/components/seo.js` - SEO/meta tags component with structured data
- `src/pages/index.js` - Homepage listing all posts
- `src/templates/blog-post.js` - Individual post template with Disqus integration
- `src/templates/tags.js` - Tag archive pages

### Styling & Theme

- Typography powered by Typography.js with Inter font (configured in `src/utils/theme.js`)
- Global styles in `src/utils/global.css`
- Dark mode support via CSS custom properties (theme toggle in layout)

### Plugins & Features

- **Images**: gatsby-plugin-image with gatsby-remark-images for optimized images, medium-zoom for image lightbox
- **Syntax highlighting**: gatsby-remark-prismjs for code blocks
- **SEO**: Sitemap, RSS feed, manifest, Google Analytics
- **Comments**: Disqus integration
- **Offline support**: gatsby-plugin-offline for PWA functionality

## Important Files

- `gatsby-config.js` - Site metadata and plugin configuration
- `gatsby-node.js` - Dynamic page generation logic
- `_redirects` - Netlify redirect rules (copied to public/ during build)

## Adding New Posts

1. Create a new directory under `content/blog/your-post-name/`
2. Add `index.md` with required frontmatter (title, date, tags, description)
3. Images go in the same directory and are referenced relatively
4. Run `yarn develop` to preview locally
