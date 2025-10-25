# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Quartz 4, hosted on Netlify. The blog features markdown-based content with support for tags, Disqus comments, and is optimized for digital garden/second brain workflows.

## Development Commands

- `npx quartz build --serve` - Start development server with live preview
- `npx quartz build` - Build for production
- `npx quartz sync` - Sync content from Git submodule
- `npx quartz create` - Initialize new Quartz project (rarely needed)

## Code Style

- TypeScript/TSX for components
- SCSS for styling
- Follow existing code patterns in `quartz-custom/` directory

## Architecture

### Content Structure

- Blog posts live in `content/` as markdown files with frontmatter
- Content is managed as a Git submodule
- Frontmatter fields: `title`, `date`, `modified`, `description`, `tags`, `disqus_id`
- Static assets are in `quartz/static/`

### Layout Configuration (quartz.layout.ts)

- **Shared layout**: Components that appear on all pages (header, footer)
- **Content page layout**: Layout for individual blog posts
- **List page layout**: Layout for homepage and tag archive pages
- Uses Quartz's layout composition system with components like `ConditionalRender`, `DesktopOnly`, `MobileOnly`

### Custom Components (quartz-custom/components/)

- `Bio.tsx` - Author bio component (shown only on index page)
- `ArticleTitle.tsx` - Blog post title component
- `ContentMeta.tsx` - Post metadata (date, reading time)
- `BlogList.tsx` - List of blog posts
- `DisqusComments.tsx` - Disqus integration
- `Footer.tsx` - Site footer with social links
- `LDMeta.tsx` - JSON-LD structured data
- `PrevNextNav.tsx` - Previous/next post navigation

### Styling

- Custom styles in `quartz-custom/components/styles/`
- Uses SCSS modules
- Dark mode support built into Quartz

### Quartz Components

Quartz provides built-in components:
- `Component.PageTitle()` - Page title
- `Component.Search()` - Full-text search
- `Component.Darkmode()` - Dark mode toggle
- `Component.TableOfContents()` - TOC for articles
- `Component.Backlinks()` - Shows pages linking to current page
- `Component.RecentNotes()` - Recent posts list
- `Component.Breadcrumbs()` - Breadcrumb navigation
- `Component.TagList()` - Tags for posts

### Higher-Order Components

- `Component.ConditionalRender()` - Conditionally show components based on page properties
- `Component.DesktopOnly()` - Only show on desktop
- `Component.MobileOnly()` - Only show on mobile

## Important Files

- `quartz.config.ts` - Site configuration and metadata
- `quartz.layout.ts` - Layout configuration (where components are placed)
- `quartz-custom/` - Custom components and utilities
- `content/` - Git submodule containing markdown content
- `docs/quartz/` - Quartz documentation

## Adding New Posts

1. Navigate to the `content/` directory (Git submodule)
2. Add `your-post-name.md` with required frontmatter (title, date, tags, description)
3. Run `npx quartz build --serve` to preview locally
4. Commit and push to the content repository
5. Run `npx quartz sync` to update the submodule
