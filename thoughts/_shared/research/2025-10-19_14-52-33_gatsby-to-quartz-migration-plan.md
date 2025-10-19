---
date: 2025-10-19T14:52:33+0000
researcher: Rakshan Shetty
git_commit: c4c1d553c7795c37e754ea8eb8818a5d3b823702
branch: main
repository: rakshanshetty.in
topic: "Migrating Gatsby blog to Quartz with full feature parity"
tags: [research, migration, gatsby, quartz, static-site-generator, blog]
status: complete
last_updated: 2025-10-19
last_updated_by: Rakshan Shetty
---

# Research: Migrating Gatsby Blog to Quartz with Full Feature Parity

## Research Question

What is required to migrate the existing Gatsby 4-based personal blog (rakshanshetty.in) to Quartz v4, maintaining the same setup as brain-public where content is sourced from markdown files with `tags: [blog]`, while preserving the current UI and all features?

## Summary

**Migration Strategy**: Use brain-public setup as-is initially, then customize only after getting a working implementation. This minimizes initial changes and allows iterative refinement.

**Repository Setup**: The blog repository already has a snapshot of the current Gatsby site in the `gatsby` branch, with `main` branch available for migration work. This allows making destructive changes safely on the `main` branch while preserving the working Gatsby implementation in the `gatsby` branch for reference and comparison during migration.

Migrating the Gatsby blog to Quartz requires implementing **4 custom components** (reusing 7 from brain-public/Quartz core) to achieve full feature parity. The migration involves:

1. **Content Sync System**: Adapting brain-public's content-sync utility to filter posts with `tags: [blog]` instead of just `[publish]`
2. **Reusable Components** (from brain-public/Quartz core with minor tweaks):
   - Footer (from brain-public) - just configure different links
   - ContentMeta (from brain-public) - change reading time formula from `/ 3` to `/ 5`
   - ArticleTitle (from brain-public) - use as-is
   - TagList (Quartz built-in) - modify URL format for kebab-case
   - PageList (Quartz built-in) - extend with reading time
   - Darkmode (Quartz built-in) - use as-is
   - Date (Quartz built-in) - use as-is
3. **New Custom Components** (only 4 needed):
   - CustomHomepage - Custom homepage with bio + filtered posts (`tags: [blog]`)
   - TagArchive - Tag-specific listing
   - DisqusComments - Comment integration
   - BlogSEO - Rich SEO metadata
4. **Styling Migration**: Complete port of Iceberg theme with dark/light mode, Inter typography, and custom Prism syntax highlighting
5. **SEO Preservation**: Rich structured data (Article, Person, WebPage, BreadcrumbList schemas), Open Graph, Twitter Cards
6. **Build Integration**: Just-based workflow similar to brain-public

The migration maintains the exact same visual appearance, URL structure, and functionality while gaining Quartz's graph view, bidirectional links, and improved markdown processing.

## Content Migration to Obsidian Brain Vault

Before migrating to Quartz, the blog content must first be migrated from the Gatsby repository structure to the Obsidian brain vault. This section outlines the structural differences and migration strategy.

### Current Gatsby Blog Structure

**Location**: `/Users/rakshan/projects/node/rakshanshetty.in/content/blog/`

```
content/blog/
├── my-college-projects/
│   ├── index.md
│   └── images/
│       ├── l3l2guqp8anhsszqw7lj.jpg
│       ├── screenshot.png
│       └── screenshot-1.png
├── native-lazy-loading-image-with-react/
│   └── index.md  (no images)
├── nodejs-http-keep-alive/
│   └── index.md
...
```

**Characteristics**:
- Each post in its own directory
- Main content in `index.md`
- Images in `images/` subdirectory (if present)
- Image references: `![alt](./images/screenshot.png)`

### Target Brain Vault Structure

**Location**: `/Users/rakshan/Documents/brain/notes/`

**Pattern Analysis** (based on existing brain vault):
```
notes/
├── productivity/
│   ├── Getting Things Done.md
│   ├── Touch Typing.md
│   └── assets/
│       ├── gtd-workflow.webp
│       └── Pasted image 20221114172003.webp
├── articles/
│   ├── [article files].md
│   └── assets/
```

**Characteristics**:
- Flat markdown files at category level
- **Shared `assets/` folder at category level** (not per-post)
- Multiple posts share same assets directory
- Image references: `![[filename.webp]]` (Obsidian wiki-links) or `![](filename.webp)`

### Proposed Migration Structure

**Target**: `/Users/rakshan/Documents/brain/notes/blog/`

```
notes/blog/
├── my-college-projects.md
├── native-lazy-loading-image-with-react.md
├── nodejs-http-keep-alive.md
├── debugging-wordpress-php-with-vs-code-and-lamp.md
└── assets/
    ├── my-college-projects-banner.jpg
    ├── my-college-projects-screenshot.png
    ├── my-college-projects-screenshot-1.png
    └── [other post images]
```

### Key Structural Changes

| Aspect | Gatsby Blog | Brain Vault |
|--------|-------------|-------------|
| **File naming** | `post-slug/index.md` | `post-slug.md` |
| **Directory structure** | One folder per post | Flat files in category |
| **Image location** | `post-slug/images/` | Shared `blog/assets/` |
| **Image reference syntax** | `![alt](./images/file.png)` | `![[file.png]]` |
| **Frontmatter** | Gatsby-specific | Add `tags: [blog]` |

### Migration Script Requirements

The content migration script needs to:

1. **Flatten structure**: Convert `post-slug/index.md` → `post-slug.md`
2. **Consolidate images**: Move all images from `post-slug/images/` → `blog/assets/`
3. **Transform image references**:
   ```markdown
   # FROM (Gatsby)
   ![Docstash](./images/screenshot.png)

   # TO (Obsidian)
   ![[my-college-projects-screenshot.png]]
   ```
4. **Add blog tag**: Ensure frontmatter includes `tags: [blog]` (or append to existing tags)
5. **Convert frontmatter**: Transform Gatsby frontmatter to Quartz-compatible format
   ```yaml
   # FROM (Gatsby)
   ---
   title: "My College Projects"
   date: "2016-10-29T02:08:00.000Z"
   modified: "2020-02-22T02:08:00.000Z"
   tags: ["Projects"]
   image: "./images/l3l2guqp8anhsszqw7lj.jpg"
   ---

   # TO (Brain/Quartz)
   ---
   title: "My College Projects"
   date: 2016-10-29
   modified: 2020-02-22
   tags: [blog, Projects]
   banner: "![[my-college-projects-banner.jpg]]"
   ---
   ```
6. **Rename images with prefixes**: To avoid collisions in shared assets folder, prefix with post slug
   ```
   ./images/screenshot.png → my-college-projects-screenshot.png
   ./images/featured.jpg → nodejs-http-keep-alive-featured.jpg
   ```

### Migration Script Pseudocode

```javascript
const fs = require('fs-extra')
const path = require('path')
const matter = require('gray-matter')

async function migrateContent() {
  const sourceDir = '/Users/rakshan/projects/node/rakshanshetty.in/content/blog'
  const targetDir = '/Users/rakshan/Documents/brain/notes/blog'
  const assetsDir = path.join(targetDir, 'assets')

  // Create target directories
  await fs.ensureDir(targetDir)
  await fs.ensureDir(assetsDir)

  const posts = await fs.readdir(sourceDir)

  for (const postSlug of posts) {
    const postDir = path.join(sourceDir, postSlug)
    const mdFile = path.join(postDir, 'index.md')

    if (!await fs.pathExists(mdFile)) continue

    // Read and parse markdown
    const content = await fs.readFile(mdFile, 'utf-8')
    const { data: frontmatter, content: body } = matter(content)

    // Transform frontmatter
    const newFrontmatter = {
      title: frontmatter.title,
      date: frontmatter.date.split('T')[0],
      modified: frontmatter.modified?.split('T')[0],
      tags: [...(frontmatter.tags || []), 'blog'],
      description: frontmatter.description
    }

    // Process images
    let newBody = body
    const imagesDir = path.join(postDir, 'images')

    if (await fs.pathExists(imagesDir)) {
      const images = await fs.readdir(imagesDir)

      for (const image of images) {
        const newImageName = `${postSlug}-${image}`

        // Copy image to shared assets
        await fs.copy(
          path.join(imagesDir, image),
          path.join(assetsDir, newImageName)
        )

        // Transform image references
        newBody = newBody.replace(
          new RegExp(`!\\[([^\\]]*)\\]\\(\\.\\/images\\/${image}\\)`, 'g'),
          `![[$1|${newImageName}]]`
        )
      }
    }

    // Write migrated file
    const newContent = matter.stringify(newBody, newFrontmatter)
    await fs.writeFile(
      path.join(targetDir, `${postSlug}.md`),
      newContent
    )
  }
}
```

### Post-Migration Verification

After migration, verify:
1. All 12 blog posts exist as `.md` files in `/notes/blog/`
2. All images consolidated in `/notes/blog/assets/`
3. Image references use Obsidian wiki-link syntax `![[filename]]`
4. All posts have `tags: [blog]` in frontmatter
5. Frontmatter dates converted to ISO format (YYYY-MM-DD)
6. No broken image links when opened in Obsidian

### Timeline Impact

This content migration should be completed **before** starting the Quartz migration. Estimated time:
- **Script development**: 2-3 hours
- **Migration execution**: 15-30 minutes
- **Manual verification**: 1-2 hours

This does not affect the 6-8 day Quartz migration timeline as it's a prerequisite step.

## Detailed Findings

### 1. Current Gatsby Architecture Overview

#### Build System
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/gatsby-config.js`, `gatsby-node.js`, `package.json`

The current blog is built with:
- **Gatsby 4.25** with 14 plugins
- **Content source**: Markdown files in `content/blog/` (one directory per post)
- **Dynamic page generation**: Blog posts + tag archive pages via `createPages` API
- **Image processing**: gatsby-plugin-image with Sharp transformers
- **SEO**: Comprehensive with sitemap, RSS, manifest, structured data
- **Analytics**: Google Analytics (G-9NPSJFJHEQ)
- **Comments**: Disqus (shortname: "rakshanshetty")
- **Hosting**: Netlify
- **Build command**: `gatsby build`

#### Content Structure
**Source**: Sample from `/Users/rakshan/projects/node/rakshanshetty.in/content/blog/nodejs-http-keep-alive/index.md`

```
content/blog/
├── post-slug-1/
│   ├── index.md
│   └── images/
│       └── diagram.png
├── post-slug-2/
│   └── index.md
...
```

**Frontmatter schema**:
```yaml
---
title: "Post Title"
date: "2020-05-10T15:38"
modified: "2023-03-15T10:20"
description: "Meta description"
tags: ["Tutorials", "Nodejs"]
featured: false
disqus_id: "custom-disqus-identifier"  # Optional
image: "./images/featured.png"         # Optional
banner: "./images/banner.png"          # Optional
---
```

#### URL Structure
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/gatsby-node.js:80-91,46-58,69-77`

- **Blog posts**: `/{slug}/` (derived from directory name)
  - Example: `content/blog/my-post/index.md` → `/my-post/`
- **Tag pages**: `/tag/{kebab-case-tag}/`
  - Example: Tag "Web Development" → `/tag/web-development/`
- **Homepage**: `/` (lists all posts)
- **RSS feed**: `/rss.xml`
- **Sitemap**: `/sitemap/sitemap-index.xml`

### 2. Complete Feature Inventory

#### 2.1 Blog Post Page Features
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/templates/blog-post.js`

| Feature | Implementation | Location |
|---------|---------------|----------|
| Post title (H1) | GraphQL `frontmatter.title` | `blog-post.js:39` |
| Publication date | Formatted as "MMMM DD, YYYY" | `blog-post.js:42` |
| Reading time | Coffee ☕️ (<25 min) or Bento 🍱 (≥25 min) | `blog-post.js:44-57` |
| Featured image | GatsbyImage component | `blog-post.js:59-65` |
| HTML content | Processed markdown with plugins | `blog-post.js:66` |
| Tag list | Comma-separated with links | `blog-post.js:72-80` |
| Disqus comments | gatsby-plugin-disqus | `blog-post.js:81` |
| Author bio | Profile pic + description + social | `blog-post.js:83` |
| Prev/Next nav | Bidirectional post links | `blog-post.js:86-111` |
| SEO metadata | Full Article schema | `blog-post.js:28-36` |

**Reading Time Formula** (`/Users/rakshan/projects/node/rakshanshetty.in/src/utils/helper.js:19-28`):
```javascript
formatReadingTime(minutes) {
  let cups = Math.round(minutes / 5)
  if (cups > 5) {
    return `${new Array(Math.round(cups / Math.E)).fill("🍱").join("")} ${minutes} min read`
  } else {
    return `${new Array(cups || 1).fill("☕️").join("")} ${minutes} min read`
  }
}
```

#### 2.2 Homepage Features
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/pages/index.js`

- Author bio at top
- Chronological post list (newest first) - **no pagination, all posts displayed**
- Each post shows: title, date, reading time, description/excerpt
- No featured images on homepage
- WebSite schema for root page

#### 2.3 Tag Archive Features
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/templates/tags.js`

- H1 with tag name
- Filtered post list (same format as homepage) - **no pagination, all matching posts displayed**
- Tag-specific SEO with breadcrumb schema
- GraphQL filter: `frontmatter: { tags: { in: [$tag] } }`

#### 2.4 Layout & Theme Features
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/components/layout.js`, `src/utils/global.css`

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Dark/light toggle | Circular button with icon | `layout.js:87-105` |
| Theme persistence | localStorage + system pref | `gatsby-ssr.js:14-37` |
| Iceberg palette | 27 CSS variables | `global.css:3-27` |
| Inter typography | 14px base, 1.75 line-height | `theme.js:5-77` |
| Max width | 672px centered container | `layout.js:74` |
| Responsive header | H1 on home, H3 elsewhere | `layout.js:19-63` |
| Custom footer | Copyright + "Built with Gatsby" | `layout.js:108-112` |

#### 2.5 SEO Features
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/components/seo.js`

**Schema.org Structured Data**:
1. **WebSite** schema (`seo.js:69-74,280-283`) - Homepage only
2. **Article** schema (`seo.js:145-191,295-298`) - Blog posts with author, publisher, dates, images
3. **Person** schema (`seo.js:113-134,285-288`) - Author details with social links, job title, location
4. **WebPage** schema (`seo.js:76-111,290-293`) - Non-blog pages
5. **BreadcrumbList** schema (`seo.js:203-209,300`) - All pages

**Meta Tags**:
- Open Graph: title, description, type, url, image
- Twitter Card: summary, creator (@rakshans2), title, description, image
- Standard meta description

**Dynamic Images**:
- Homepage: Uses profile pic (`profile-pic.jpg`)
- Blog posts: Uses `image.publicURL` from frontmatter
- URLs prepend siteUrl to relative paths

#### 2.6 Syntax Highlighting Features
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/utils/global.css:93-295`

| Feature | Description | CSS Lines |
|---------|-------------|-----------|
| Iceberg Prism theme | Custom token colors | 196-257 |
| Filename labels | `.filename` class for file headers | 93-108 |
| Terminal blocks | macOS-style window with dots | 110-143 |
| Line highlighting | Blue left border for highlighted lines | 264-272 |
| Inline code | Subtle background with theme colors | 188-194 |
| Code block container | Dark background with border radius | 145-187 |

#### 2.7 Social Integration
**Source**: `/Users/rakshan/projects/node/rakshanshetty.in/src/components/bio.js`, `src/components/social.css`

**Bio Component** includes:
- Profile picture (50x50px, circular)
- Author description from site metadata
- 4 social links with SVG icons:
  - GitHub: `https://github.com/rakshans1`
  - Twitter: `https://twitter.com/rakshans2`
  - LinkedIn: `https://www.linkedin.com/in/rakshan-shetty`
  - Email: `mailto:shetty.raxx555@gmail.com`

**Social Link Styling** (`social.css:1-16`):
- 48x48px clickable area
- Hover effect with color change and underline
- SVG icons sized appropriately

### 3. Gatsby to Quartz Feature Mapping

Based on the brain-public Quartz implementation research, here's how each Gatsby feature maps to Quartz:

| Gatsby Feature | Quartz Equivalent | Implementation Type |
|----------------|-------------------|---------------------|
| **Content Processing** | | |
| gatsby-source-filesystem | Quartz's built-in markdown sourcing | Native |
| gatsby-transformer-remark | Quartz transformer pipeline | Native |
| GraphQL queries | Direct file access in components | Native |
| **Markdown Extensions** | | |
| gatsby-remark-images | Plugin.CrawlLinks() + Plugin.Latex() | Native |
| gatsby-remark-prismjs | Plugin.SyntaxHighlighting() | Native + Custom CSS |
| gatsby-remark-images-medium-zoom | Custom ImageZoom plugin | **Custom Plugin** |
| gatsby-remark-responsive-iframe | HTML plugin in transformer | **Custom Plugin** |
| gatsby-remark-smartypants | Remark plugin | **Custom Plugin** |
| **Page Generation** | | |
| Blog post pages | Content pages with custom template | **Custom Component** |
| Tag pages | FolderPage emitter + custom template | **Custom Emitter + Component** |
| Homepage listing | Custom index page component | **Custom Component** |
| Previous/Next links | Custom navigation component | **Custom Component** |
| **SEO & Feeds** | | |
| gatsby-plugin-feed | Plugin.ContentIndex() for RSS | Native + Custom Config |
| gatsby-plugin-sitemap | Plugin.Assets() | Native |
| gatsby-plugin-manifest | Static files in quartz/static/ | Native |
| React Helmet meta tags | Custom SEO component in layout | **Custom Component** |
| Structured data | Custom JSON-LD in head | **Custom Component** |
| **Styling & Theme** | | |
| Typography.js | Quartz theme config in quartz.config.ts | Native Config |
| Dark mode toggle | Quartz's built-in Component.Darkmode() | Native + Custom CSS |
| Global CSS | Custom SCSS in quartz-custom/styles/ | **Custom Styles** |
| Iceberg colors | CSS variables in custom theme | **Custom Styles** |
| **Comments & Analytics** | | |
| gatsby-plugin-disqus | Custom Disqus emitter/component | **Custom Plugin** |
| gatsby-plugin-google-gtag | Analytics in quartz.config.ts | Native Config |
| **Images** | | |
| gatsby-plugin-image | Quartz image optimization | Native |
| gatsby-plugin-sharp | Built-in image processing | Native |
| **Build & Deploy** | | |
| Build script | Just commands (similar to brain-public) | Custom Justfile |
| **Components** | | |
| Layout component | Custom Layout in quartz-custom/components/ | **Custom Component** |
| Bio component | Custom Bio component | **Custom Component** |
| SEO component | Custom Head/SEO component | **Custom Component** |

**Summary**:
- **Native/Config**: 12 features
- **Custom Implementation Required**: 14 features

### 4. Component Reusability from brain-public

Before creating custom components, let's identify what can be reused from brain-public:

#### 4.0 Reusable Components Analysis

**✅ Can Reuse Directly (from brain-public or Quartz core):**

1. **Footer** (`quartz-custom/components/Footer.tsx`)
   - ✅ Already exists in brain-public
   - ✅ Supports custom social links
   - **Action**: Use as-is, just configure different links in `quartz.layout.ts`

2. **ContentMeta** (`quartz-custom/components/ContentMeta.tsx`)
   - ✅ Already has date + reading time with emojis
   - ⚠️ Uses `minutes / 3` formula (need to change to `/ 5`)
   - **Action**: Update line 20 from `/ 3` to `/ 5` to match blog behavior

3. **ArticleTitle** (`quartz-custom/components/ArticleTitle.tsx`)
   - ✅ Already supports `hide-title` frontmatter flag
   - **Action**: Use as-is

4. **TagList** (`quartz/components/TagList.tsx`)
   - ✅ Built-in Quartz component
   - ⚠️ Uses `/tags/{tag}` URL format (need `/tag/{kebab-case}`)
   - **Action**: Either modify or create custom wrapper

5. **PageList** (`quartz/components/PageList.tsx`)
   - ✅ Built-in component for listing posts
   - ✅ Has date, title, tags
   - ⚠️ Missing: reading time, description/excerpt display
   - **Action**: Extend with reading time display

6. **Darkmode** (`quartz/components/Darkmode.tsx`)
   - ✅ Built-in Quartz component
   - **Action**: Use as-is

7. **Date** (`quartz/components/Date.tsx`)
   - ✅ Built-in component for date formatting
   - **Action**: Use as-is

**❌ Need to Create Custom:**

8. **CustomHomepage** - Custom homepage with bio + filtered posts (single page component)
9. **TagArchive** - Tag-specific listing pages
10. **DisqusComments** - Comment integration
11. **BlogSEO** - Rich SEO metadata

**Summary**:
- **Reusable**: 7 components (with minor modifications)
- **Custom needed**: 4 components
- **Original estimate**: 14 components
- **Actual work**: ~4 components (71% reduction!)

### 4. Required Custom Quartz Components

Based on the reusability analysis above, here are the 4 truly custom components needed:

#### Component 1: CustomHomepage
- Custom homepage page component with bio section + filtered post list (`tags: [blog]`)
- Bio includes: profile picture, description, 4 social links (GitHub, Twitter, LinkedIn, Email)
- Post list shows: title, date, reading time, description/excerpt
- Reference: `src/pages/index.js` + `src/components/bio.js`

#### Component 2: TagArchive
- Tag-specific post listing with tag name as H1
- Similar to CustomHomepage but filtered by single tag (no bio section)
- Reference: `src/templates/tags.js`

#### Component 3: DisqusComments
- Load Disqus with custom identifier support (`disqus_id` frontmatter or slug fallback)
- Reference: `gatsby-plugin-disqus` usage in `blog-post.js:81`

#### Component 4: BlogSEO
- Schema.org JSON-LD: WebSite, Article, Person, BreadcrumbList schemas
- Open Graph + Twitter Card meta tags
- Reference: `src/components/seo.js`

### 5. Tag Page URLs

Quartz has built-in `Plugin.TagPage()` emitter that generates URLs at `/tags/{tag}` (plural). The current Gatsby blog uses `/tag/{tag}` (singular). Since redirects are not needed, simply use Quartz's built-in `/tags/` URL structure.

### 6. Content Sync Strategy

**Based on**: brain-public's content-sync utility (`/Users/rakshan/projects/node/brain-public/utils/content-sync/index.js`)

#### 6.1 Two-Repository Pattern

```
Private Obsidian Vault (~/Documents/brain/notes)
├── blog/
│   ├── published-post-1.md  (tags: [blog])
│   ├── draft-post.md         (tags: [draft])
│   └── other-note.md         (tags: [note])
└── ...

                ↓ (sync with filter)

Public Blog Vault (rakshanshetty.in/content)
└── blog/
    └── published-post-1.md   (only posts with [blog] tag)
```

#### 6.2 Content Sync Implementation

**File**: `rakshanshetty.in/utils/content-sync/index.js`

```javascript
const fs = require("fs-extra")
const path = require("path")
const matter = require("gray-matter")
const glob = require("glob")

const BRAIN_VAULT = process.env.BRAIN_VAULT || path.join(process.env.HOME, "Documents/brain/notes")
const BLOG_VAULT = process.env.BLOG_VAULT || path.join(process.cwd(), "content")

async function syncBlogContent() {
  console.log("🔄 Syncing blog content from private vault...")

  // Clean existing content
  await fs.emptyDir(BLOG_VAULT)

  // Find all markdown files in private vault
  const files = glob.sync("**/*.md", { cwd: BRAIN_VAULT, absolute: true })

  let syncedCount = 0

  for (const file of files) {
    const content = await fs.readFile(file, "utf8")
    const { data: frontmatter, content: body } = matter(content)

    // Filter: only sync files with "blog" tag
    const tags = frontmatter.tags || []
    if (tags.includes("blog")) {
      const relativePath = path.relative(BRAIN_VAULT, file)
      const destPath = path.join(BLOG_VAULT, relativePath)

      // Copy markdown file
      await fs.ensureDir(path.dirname(destPath))
      await fs.copyFile(file, destPath)

      // Copy associated assets directory if exists
      const assetsDir = path.join(path.dirname(file), "assets")
      if (await fs.pathExists(assetsDir)) {
        const destAssetsDir = path.join(path.dirname(destPath), "assets")
        await fs.copy(assetsDir, destAssetsDir)
      }

      syncedCount++
      console.log(`✅ Synced: ${relativePath}`)
    }
  }

  console.log(`\n✨ Synced ${syncedCount} blog posts`)
}

syncBlogContent().catch(console.error)
```

#### 6.3 Justfile Integration

**File**: `rakshanshetty.in/justfile`

```just
# Default recipe
default:
  @just --list

# Install dependencies
deps:
  npm i

# Sync content from private Obsidian vault
sync:
  @echo "🔄 Syncing blog content..."
  node utils/content-sync/index.js

# Build the blog
build:
  npx quartz build

# Publish to git
publish:
  cd content && git add . && git commit -m "Update blog content" && git push || true
  git add . && git commit -m "Update blog" && git push

# Complete deployment pipeline
deploy: sync build publish
  @echo "✨ Blog deployed successfully!"

# Development server
dev:
  npx quartz build --serve

# Update Quartz from upstream
quartz-update:
  @echo "⬆️  Updating Quartz framework..."
  rm -rf quartz/ docs/ package.json package-lock.json tsconfig.json
  cp -r ../quartz/quartz ./quartz
  cp -r ../quartz/docs ./docs/quartz
  cp ../quartz/package.json ../quartz/package-lock.json ../quartz/tsconfig.json ../quartz/globals.d.ts ../quartz/index.d.ts .
  @echo "✅ Quartz updated!"
```

#### 6.4 Environment Configuration

**File**: `.env`

```bash
BRAIN_VAULT=/Users/rakshan/Documents/brain/notes
BLOG_VAULT=/Users/rakshan/projects/node/rakshanshetty.in/content
```

### 7. Styling Migration

#### 7.1 Iceberg Theme Configuration

**File**: `rakshanshetty.in/quartz.config.ts`

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Rakshan Shetty",
    // ... other config

    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "JetBrains Mono"
      },
      colors: {
        lightMode: {
          light: "#e8e9ec",           // iceberg-bg-light
          lightgray: "#d2d4de",       // iceberg-bg-light-alt
          gray: "#8389a3",            // iceberg-comment-light
          darkgray: "#33374c",        // iceberg-fg-light
          dark: "#33374c",            // iceberg-fg-light
          secondary: "#84a0c6",       // iceberg-blue
          tertiary: "#89b8c2",        // iceberg-cyan
          highlight: "rgba(192, 197, 206, 0.15)" // iceberg-selection-light
        },
        darkMode: {
          light: "#161821",           // iceberg-bg-dark
          lightgray: "#1e2132",       // iceberg-bg-dark-alt
          gray: "#6b7089",            // iceberg-comment-dark
          darkgray: "#c6c8d1",        // iceberg-fg-dark
          dark: "#c6c8d1",            // iceberg-fg-dark
          secondary: "#84a0c6",       // iceberg-blue
          tertiary: "#89b8c2",        // iceberg-cyan
          highlight: "rgba(39, 44, 66, 0.15)" // iceberg-selection-dark
        }
      }
    }
  }
}
```

#### 7.2 Custom Global Styles

**File**: `rakshanshetty.in/quartz-custom/styles/global.scss`

Copy complete styles from:
- `/Users/rakshan/projects/node/rakshanshetty.in/src/utils/global.css` (lines 29-91)

Key sections:
- Body transition styles
- `.light` and `.dark` class definitions with CSS variables
- Theme toggle button styles
- Responsive title sizing

#### 7.3 Syntax Highlighting Styles

**File**: `rakshanshetty.in/quartz-custom/styles/iceberg-syntax.scss`

Copy complete Prism theme from:
- `/Users/rakshan/projects/node/rakshanshetty.in/src/utils/global.css` (lines 93-295)

Includes:
- Filename labels (`.filename`)
- Terminal code blocks (`.language-terminal`)
- Token colors (`.token.*`)
- Line highlighting
- Inline code styling

#### 7.4 Component Styles

**File**: `rakshanshetty.in/quartz-custom/styles/components.scss`

```scss
// Blog Layout
.blog-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 672px;
  padding: 2.625rem 1.3125rem; // rhythm(1.5) rhythm(3/4)
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.625rem;

  h1, h3 {
    margin: 0;
    font-size: 3.9rem;
    line-height: 4.3rem;

    @media (max-width: 475px) {
      font-size: 2.5rem;
      line-height: 3.5rem;
    }

    a {
      box-shadow: none;
      text-decoration: none;
      color: var(--darkgray);
    }
  }
}

.blog-footer {
  margin-top: 4rem;
  text-align: center;
  color: var(--gray);
}

// Bio Component
.bio {
  display: flex;
  margin-bottom: 3.5rem;

  .bio-avatar {
    margin-right: 0.875rem;
    margin-bottom: 0;
    min-width: 50px;
    border-radius: 100%;
  }

  .bio-social {
    display: flex;
    gap: 0.5rem;
  }
}

.social {
  color: var(--darkgray);
  text-decoration: none;
  box-shadow: none;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    color: var(--secondary);
    box-shadow: 0 1px 0 0 currentColor;
  }
}

// Post Meta
.post-meta {
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 1.75rem;

  .post-meta-separator {
    padding: 0 0.5rem;
  }
}

// Tag List
.post-tags {
  margin-top: 1.75rem;
  font-size: 0.875rem;

  a {
    color: var(--secondary);
  }
}

// Previous/Next Navigation
.prev-next-nav {
  margin-top: 3.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--lightgray);

  .prev-next-links {
    display: flex;
    justify-content: space-between;

    a {
      &[rel="next"] {
        margin-left: auto;
      }
    }
  }
}

// Post List
.post-list {
  article {
    margin-bottom: 2.625rem;

    h3 {
      margin-bottom: 0.4375rem;
      margin-top: 1.75rem;
    }

    p {
      margin-bottom: 0;
    }
  }
}

// Disqus
.disqus-section {
  margin-top: 3.5rem;
}
```

### 8. Quartz Configuration Files

#### 8.1 Main Configuration

**File**: `rakshanshetty.in/quartz.config.ts`

```typescript
import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import * as CustomPlugins from "./quartz-custom/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "Rakshan Shetty",
    enableSPA: false,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-9NPSJFJHEQ"
    },
    locale: "en-US",
    baseUrl: "rakshanshetty.in",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "JetBrains Mono"
      },
      colors: {
        lightMode: {
          light: "#e8e9ec",
          lightgray: "#d2d4de",
          gray: "#8389a3",
          darkgray: "#33374c",
          dark: "#33374c",
          secondary: "#84a0c6",
          tertiary: "#89b8c2",
          highlight: "rgba(192, 197, 206, 0.15)"
        },
        darkMode: {
          light: "#161821",
          lightgray: "#1e2132",
          gray: "#6b7089",
          darkgray: "#c6c8d1",
          dark: "#c6c8d1",
          secondary: "#84a0c6",
          tertiary: "#89b8c2",
          highlight: "rgba(39, 44, 66, 0.15)"
        }
      }
    }
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"]
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "min-light",
          dark: "nord"
        },
        keepBackground: false
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" })
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        rssTitle: "Rakshan Shetty's RSS Feed",
        rssFullHtml: true
      }),
      Plugin.Assets(),
      Plugin.Static({ userOrigin: "quartz/static" }),

      // Custom emitters
      CustomPlugins.TagPages(),
      CustomPlugins.Static({ userOrigin: "quartz-custom/static" })
    ]
  }
}

export default config
```

#### 8.2 Layout Configuration

**File**: `rakshanshetty.in/quartz.layout.ts`

```typescript
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import * as CustomComponent from "./quartz-custom/components"

// Shared components
export const sharedPageComponents: SharedLayout = {
  head: CustomComponent.BlogSEO(),
  header: [],
  footer: CustomComponent.Footer({
    links: {
      GitHub: "https://github.com/rakshans1",
      Twitter: "https://twitter.com/rakshans2",
      LinkedIn: "https://www.linkedin.com/in/rakshan-shetty",
      Email: "mailto:shetty.raxx555@gmail.com"
    }
  })
}

// Blog post page layout
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    CustomComponent.BlogPostMeta(),
    Component.TagList()
  ],
  left: [],
  right: []
}

// Homepage and list page layout
export const defaultListPageLayout: PageLayout = {
  beforeBody: [CustomComponent.Bio()],
  left: [],
  right: []
}
```

### 9. Migration Implementation Plan

#### Phase 1: Setup & Configuration (2-3 days)

**Tasks**:
1. ✅ Create new Quartz project structure
   ```bash
   git clone https://github.com/jackyzha0/quartz.git temp-quartz
   cp -r temp-quartz/quartz rakshanshetty.in/quartz
   cp temp-quartz/package.json rakshanshetty.in/
   cp temp-quartz/tsconfig.json rakshanshetty.in/
   rm -rf temp-quartz
   ```

2. ✅ Set up directory structure
   ```
   rakshanshetty.in/
   ├── quartz/              # Core Quartz framework
   ├── quartz-custom/       # Custom extensions
   │   ├── components/
   │   ├── styles/
   │   └── static/
   ├── content/             # Markdown content (git submodule)
   ├── utils/
   │   └── content-sync/
   ├── quartz.config.ts
   ├── quartz.layout.ts
   └── justfile
   ```

3. ✅ Configure `quartz.config.ts` with Iceberg theme
4. ✅ Configure `quartz.layout.ts` with custom components
5. ✅ Create `justfile` with sync/build/deploy commands
6. ✅ Set up environment variables in `.env`

#### Phase 2: Component Setup & Customization (1-2 days)

**Day 1 - Reuse existing components**:
1. ✅ Copy `Footer.tsx` from brain-public, update links in config
2. ✅ Copy `ContentMeta.tsx` from brain-public, change `/ 3` to `/ 5` (line 20)
3. ✅ Copy `ArticleTitle.tsx` from brain-public as-is
4. ✅ Use built-in `Darkmode`, `Date` components

**Day 2 - Create 6 custom components**:
5. ✅ `Bio.tsx` - Author bio with social links
6. ✅ `PreviousNextNav.tsx` - Bidirectional navigation
7. ✅ `BlogIndex.tsx` - Homepage with filtered posts
8. ✅ `TagArchive.tsx` - Tag-specific listing
9. ✅ `DisqusComments.tsx` - Comment integration
10. ✅ `BlogSEO.tsx` - Rich SEO metadata

#### Phase 3: Configuration & Setup (0.5 days)

1. ✅ Finalize quartz.config.ts configuration
2. ✅ Finalize quartz.layout.ts with all components

#### Phase 4: Styling Migration (2 days)

**Day 1**:
1. ✅ Copy and adapt Iceberg color palette
2. ✅ Set up typography with Inter font
3. ✅ Implement dark/light mode CSS
4. ✅ Create component-specific styles

**Day 2**:
5. ✅ Copy syntax highlighting styles
6. ✅ Copy code block styles (filename labels, terminal)
7. ✅ Test responsive breakpoints
8. ✅ Verify theme toggle functionality

#### Phase 5: Content Sync (1 day)

1. ✅ Create `utils/content-sync/index.js`
2. ✅ Implement single-tag filtering (`blog`)
3. ✅ Test sync with sample posts
4. ✅ Verify asset copying
5. ✅ Integrate with `justfile`

#### Phase 6: Testing & Validation (2-3 days)

**Functionality Testing**:
- [ ] All blog posts render correctly
- [ ] Tag pages generate and display properly
- [ ] Previous/Next navigation works
- [ ] Disqus comments load correctly
- [ ] Search functionality works
- [ ] RSS feed validates
- [ ] Sitemap generates correctly

**Visual Testing**:
- [ ] Dark mode toggle works smoothly
- [ ] Iceberg colors match exactly
- [ ] Typography matches Gatsby version
- [ ] Code blocks render correctly (filename labels, terminal style)
- [ ] Responsive layout works on mobile
- [ ] Social links display and function

**SEO Testing**:
- [ ] Structured data validates (Google Rich Results Test)
- [ ] Open Graph tags correct (Facebook Debugger)
- [ ] Twitter Cards render (Twitter Card Validator)
- [ ] Meta descriptions present
- [ ] Canonical URLs correct

**URL Testing**:
- [ ] All post URLs work correctly
- [ ] Tag pages accessible at `/tags/{tag}`

#### Phase 7: Deployment (1 day)

1. [ ] Set up Netlify site
2. [ ] Configure build command: `npx quartz build`
3. [ ] Configure publish directory: `public/`
4. [ ] Set up environment variables on Netlify
5. [ ] Test build on Netlify
6. [ ] Configure custom domain
7. [ ] Test production deployment

#### Phase 8: Content Migration (1 day)

1. [ ] Add `blog` tag to all existing posts in private vault
2. [ ] Run `just sync` to copy content
3. [ ] Verify all posts synced correctly
4. [ ] Check frontmatter compatibility
5. [ ] Verify image paths resolve
6. [ ] Test Disqus comment continuity (verify disqus_id fields)

### 11. Testing Checklist

#### Visual Parity Checklist
- [ ] **Homepage**: Matches Gatsby version exactly
  - [ ] Bio placement and styling
  - [ ] Post list format
  - [ ] Typography and spacing
  - [ ] Dark/light mode colors

- [ ] **Blog Post Page**: All elements present and styled correctly
  - [ ] Title, date, reading time format
  - [ ] Featured image display
  - [ ] Content typography
  - [ ] Code block styling (filename labels, terminal blocks)
  - [ ] Tag list
  - [ ] Author bio
  - [ ] Previous/Next navigation
  - [ ] Disqus comments

- [ ] **Tag Archive**: Matches Gatsby tag pages
  - [ ] Tag name display
  - [ ] Filtered post list
  - [ ] Post preview format

- [ ] **Theme Toggle**: Dark/light mode works flawlessly
  - [ ] Smooth transitions
  - [ ] Iceberg colors accurate
  - [ ] Persistence across page loads
  - [ ] System preference detection

#### Functionality Checklist
- [ ] **Content Sync**: Posts with `[blog]` tag sync correctly
- [ ] **URL Preservation**: All URLs match Gatsby structure
- [ ] **RSS Feed**: Validates and includes full content
- [ ] **Sitemap**: Generates correctly
- [ ] **Search**: Client-side search works
- [ ] **Analytics**: Google Analytics tracking active
- [ ] **Comments**: Disqus loads and displays existing comments

#### SEO Checklist
- [ ] **Structured Data**: All schemas validate
  - [ ] WebSite schema on homepage
  - [ ] Article schema on blog posts
  - [ ] Person schema on all pages
  - [ ] BreadcrumbList schema correct

- [ ] **Meta Tags**: Complete coverage
  - [ ] Open Graph tags
  - [ ] Twitter Cards
  - [ ] Descriptions
  - [ ] Images

- [ ] **Performance**: Lighthouse scores comparable to Gatsby
  - [ ] Performance: 90+
  - [ ] Accessibility: 100
  - [ ] Best Practices: 100
  - [ ] SEO: 100

### 12. Key Implementation Notes

- **Disqus continuity**: Preserve `disqus_id` frontmatter field during sync, fallback to slug
- **Reading time formula**: Change ContentMeta from `/ 3` to `/ 5` to match blog
- **Kebab-case tags**: Implement same transformation as Gatsby (`helper.js:13-17`)
- **Prev/Next logic**: Sort DESC by date, `previous = posts[index + 1]`, `next = posts[index - 1]`

### 13. Post-Migration Enhancements

Optional Quartz-specific features to add after achieving parity:
- Graph view, backlinks, wiki-style `[[links]]`, floating TOC, file explorer, link hover previews

## Code References

### Current Gatsby Implementation

**Core Configuration**:
- `gatsby-config.js` - Plugin configuration and site metadata
- `gatsby-node.js:4-78` - Page generation logic (posts + tags)
- `gatsby-node.js:80-91` - Slug creation from file paths

**Components**:
- `src/components/layout.js:19-105` - Main layout with theme toggle
- `src/components/bio.js:27-96` - Author bio with social links
- `src/components/seo.js` - SEO with structured data

**Templates**:
- `src/templates/blog-post.js` - Individual post template with all features
- `src/templates/tags.js` - Tag archive template
- `src/pages/index.js` - Homepage listing

**Styling**:
- `src/utils/global.css` - Complete global styles including Iceberg theme
- `src/utils/theme.js` - Typography.js configuration
- `src/components/social.css` - Social link styles
- `gatsby-ssr.js:9-42` - Theme initialization script

**Utilities**:
- `src/utils/helper.js:13-17` - kebabCase function
- `src/utils/helper.js:19-28` - formatReadingTime function

**Content**:
- `content/blog/*/index.md` - Individual blog posts

### Required Quartz Implementation

**Configuration**:
- `quartz.config.ts` - Main configuration with Iceberg theme
- `quartz.layout.ts` - Layout configuration with custom components
- `justfile` - Build commands
- `.env` - Environment variables

**Reusable Components** (from brain-public):
- `Footer.tsx` - Reuse from brain-public
- `ContentMeta.tsx` - Copy from brain-public, change line 20: `/ 3` → `/ 5`
- `ArticleTitle.tsx` - Copy from brain-public as-is

**Custom Components** (4 new ones in `quartz-custom/components/`):
- `CustomHomepage.tsx` - Homepage with bio + posts
- `TagArchive.tsx` - Tag pages
- `DisqusComments.tsx` - Comments
- `BlogSEO.tsx` - SEO metadata

**No Custom Plugins Needed** - Using Quartz built-ins only

**Styling** (all in `quartz-custom/styles/`):
- `global.scss` - Global styles and theme
- `iceberg-syntax.scss` - Syntax highlighting
- `code-blocks.scss` - Code block styles
- `components.scss` - Component-specific styles

**Content Sync**:
- `utils/content-sync/index.js` - Content sync utility

**Static Assets** (in `quartz-custom/static/`):
- `profile-pic.jpg` - Profile picture
- `sun.png` - Light mode icon
- `moon.png` - Dark mode icon

### Reference Quartz Implementation

**brain-public** (for comparison and patterns):
- `/Users/rakshan/projects/node/brain-public/quartz.config.ts` - Config example
- `/Users/rakshan/projects/node/brain-public/quartz.layout.ts` - Layout example
- `/Users/rakshan/projects/node/brain-public/quartz-custom/` - Custom extensions examples
- `/Users/rakshan/projects/node/brain-public/justfile` - Build workflow example
- `/Users/rakshan/projects/node/brain-public/utils/content-sync/index.js` - Content sync example

## Conclusion

Migrating the Gatsby blog to Quartz with full feature parity is achievable by **maximizing component reuse** from brain-public and Quartz core. The migration involves:

- **4 custom React/Preact components** (down from 14 by reusing 7 existing components - 71% reduction!)
- **No custom plugins needed** - using Quartz built-ins only
- **Complete styling port** of Iceberg theme with dark/light modes
- **Content sync system** adapted from brain-public with single-tag filtering (`blog`)
- **Preservation of all SEO** and core URLs

**Estimated timeline**: 4-6 days of focused development (reduced from 12-15 days due to component reuse and no custom transformers needed)

**Key benefits of migration**:
1. **Unified platform** for blog and brain-public with **shared component library**
2. **Maximum code reuse** - 7 components reused, only 4 new components needed
3. Better markdown processing with Quartz's extensible pipeline
4. Graph view and bidirectional linking capabilities
5. Simplified build process with Just commands
6. Single content source (Obsidian vault) for both sites
7. **Consistent reading time display** across both sites (after updating ContentMeta formula)

**Recommended approach**: Implement in phases as outlined, testing thoroughly at each stage to ensure no functionality is lost during migration. Start by copying reusable components from brain-public, then create only the 4 truly custom components needed.
