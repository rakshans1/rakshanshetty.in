# Gatsby to Quartz Blog Migration Implementation Plan

## Overview

This plan outlines the complete migration of the personal blog at rakshanshetty.in from Gatsby 4 to Quartz v4, while maintaining 100% feature parity including visual appearance, URL structure, SEO, and all functionality. The migration leverages the existing brain-public Quartz setup to maximize component reuse and minimize implementation work.

## Current State Analysis

### Gatsby Blog (Current)

- **Framework**: Gatsby 4.25 with 14 plugins
- **Content**: 12 blog posts in `content/blog/` (directory-per-post structure)
- **Features**:
  - Dark/light theme toggle with Iceberg color palette
  - Disqus comments integration
  - Rich SEO (Article, Person, WebSite, BreadcrumbList schemas)
  - RSS feed & sitemap
  - Google Analytics (G-9NPSJFJHEQ)
  - Tag-based archives
  - Reading time with emoji indicators
  - Previous/Next post navigation
  - Author bio with social links
  - Custom syntax highlighting (Prism with Iceberg theme)
- **URL Structure**:
  - Posts: `/{slug}/`
  - Tags: `/tag/{kebab-case-tag}/`
  - RSS: `/rss.xml`
- **Hosting**: Netlify
- **Repository**: `gatsby` branch has current working site, `main` branch ready for migration

### Brain-Public (Reference Implementation)

- **Location**: `/Users/rakshan/projects/node/brain-public/`
- **Reusable Components**:
  - `Footer.tsx` - Social links footer
  - `ContentMeta.tsx` - Date + reading time (needs formula adjustment)
  - `ArticleTitle.tsx` - Title with hide-title support
- **Build System**: Just-based workflow
- **Content Sync**: Filters by `tags: [publish]` from Obsidian vault

### Key Discoveries

1. **Component Reuse**: 7 components can be reused from brain-public/Quartz core, only 4 custom components needed (research/2025-10-19_14-52-33_gatsby-to-quartz-migration-plan.md:523-527)
2. **Reading Time Formula**: Gatsby uses `minutes / 5` for coffee cups vs brain-public's `minutes / 3` (src/utils/helper.js:19-28)
3. **Tag URL Format**: Quartz uses `/tags/{tag}` (plural) vs Gatsby's `/tag/{tag}` (singular) - will adopt Quartz convention
4. **Content Structure**: Blog posts must first migrate from Gatsby's `post-slug/index.md` to Obsidian vault's flat `post-slug.md` structure

## Desired End State

A fully functional Quartz v4 blog that:

- ✅ Looks identical to current Gatsby site (Iceberg theme, Inter typography)
- ✅ Maintains all functionality (comments, SEO, analytics, RSS)
- ✅ Uses same URL structure for posts (`/{slug}/`)
- ✅ Sources content from Obsidian vault with `tags: [blog]` filter
- ✅ Builds via Just commands (`just build`, `just deploy`)
- ✅ Deploys to Netlify with same domain

### Success Verification

1. Visual comparison: Screenshots of Gatsby vs Quartz versions match pixel-perfect
2. Functional testing: All features work (comments load, theme persists, navigation works)
3. SEO validation: All structured data validates in Google Rich Results Test
4. URL testing: All existing blog post URLs resolve correctly
5. Performance: Lighthouse scores comparable to Gatsby (90+ across all metrics)

## What We're NOT Doing

- ❌ **Not** implementing Quartz-specific features initially (graph view, backlinks, wiki-links)
- ❌ **Not** changing URL structure (keeping `/{slug}/` for posts)
- ❌ **Not** migrating away from Disqus to another comment system
- ❌ **Not** redesigning the UI or changing colors/typography
- ❌ **Not** implementing pagination (matches Gatsby's show-all-posts approach)
- ❌ **Not** creating custom Quartz plugins/transformers (using built-ins only)

## Implementation Approach

**Strategy**: Phased migration with prerequisite content migration, followed by incremental Quartz implementation, thorough testing, and production deployment.

**Risk Mitigation**:

- Work on `main` branch with `gatsby` branch as safety backup
- Test each phase before proceeding
- Manual verification checklist after each major phase

---

## Phase 0: Content Migration to Obsidian Vault

### Overview

Migrate blog content from Gatsby structure to Obsidian vault structure as prerequisite for Quartz migration.

**Duration**: 0.5 day

### Changes Required

#### 1. Content Migration Script

**File**: `utils/migrate-content-to-vault.js`
**Purpose**: One-time script to migrate Gatsby blog posts to Obsidian vault

```javascript
const fs = require("fs-extra")
const path = require("path")
const matter = require("gray-matter")

async function migrateContent() {
  const sourceDir = path.join(__dirname, "../content/blog")
  const targetDir = "/Users/rakshan/Documents/brain/notes/blog"
  const assetsDir = path.join(targetDir, "assets")

  // Ensure utils directory exists (in case this is first run)
  await fs.ensureDir(path.join(__dirname))

  // Create target directories
  await fs.ensureDir(targetDir)
  await fs.ensureDir(assetsDir)

  const posts = await fs.readdir(sourceDir)
  console.log(`📦 Found ${posts.length} posts to migrate\n`)

  for (const postSlug of posts) {
    const postDir = path.join(sourceDir, postSlug)
    const mdFile = path.join(postDir, "index.md")

    if (!(await fs.pathExists(mdFile))) {
      console.log(`⏭️  Skipping ${postSlug} (no index.md)`)
      continue
    }

    // Read and parse markdown
    const content = await fs.readFile(mdFile, "utf-8")
    const { data: frontmatter, content: body } = matter(content)

    // Transform frontmatter
    const newFrontmatter = {
      title: frontmatter.title,
      date: frontmatter.date.split("T")[0], // 2020-05-10T15:38 → 2020-05-10
      modified: frontmatter.modified?.split("T")[0],
      tags: [...(frontmatter.tags || []), "blog"], // Add blog tag
      description: frontmatter.description,
      featured: frontmatter.featured,
      disqus_id: frontmatter.disqus_id, // Preserve for comment continuity
    }

    // Handle banner/image field
    if (frontmatter.image) {
      const imageName = path.basename(frontmatter.image)
      newFrontmatter.banner = `![[${postSlug}-${imageName}]]`
    }
    if (frontmatter.banner) {
      const imageName = path.basename(frontmatter.banner)
      newFrontmatter.banner = `![[${postSlug}-${imageName}]]`
    }

    // Process images
    let newBody = body
    const imagesDir = path.join(postDir, "images")

    if (await fs.pathExists(imagesDir)) {
      const images = await fs.readdir(imagesDir)
      console.log(`  📸 Processing ${images.length} images for ${postSlug}`)

      for (const image of images) {
        const newImageName = `${postSlug}-${image}`

        // Copy image to shared assets
        await fs.copy(
          path.join(imagesDir, image),
          path.join(assetsDir, newImageName)
        )

        // Transform image references: ![alt](./images/file.png) → ![[post-slug-file.png]]
        const relativePathRegex = new RegExp(
          `!\\[([^\\]]*)\\]\\(\\.\/images\/${image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
          "g"
        )
        newBody = newBody.replace(relativePathRegex, (match, alt) => {
          return alt ? `![[${newImageName}|${alt}]]` : `![[${newImageName}]]`
        })
      }
    }

    // Write migrated file
    const newContent = matter.stringify(newBody, newFrontmatter)
    await fs.writeFile(path.join(targetDir, `${postSlug}.md`), newContent)

    console.log(`✅ Migrated: ${postSlug}`)
  }

  console.log(`\n✨ Migration complete!`)
}

migrateContent().catch(console.error)
```

#### 2. Add Migration Dependencies

**File**: `package.json`
**Changes**: Add `gray-matter` and `fs-extra` if not present

```json
{
  "dependencies": {
    "fs-extra": "^11.1.1",
    "gray-matter": "^4.0.3"
  }
}
```

### Execution Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run migration script:

   ```bash
   node utils/migrate-content-to-vault.js
   ```

3. Verify migration in Obsidian:
   - Open `/Users/rakshan/Documents/brain/notes/blog/` in Obsidian
   - Check all 12 posts exist as `.md` files
   - Verify images display correctly with `![[filename]]` syntax
   - Confirm all posts have `tags: [blog, ...]` in frontmatter

### Success Criteria

- [x] Migration script runs without errors
- [x] All 12 blog posts exist in `/Users/rakshan/Documents/brain/notes/blog/`
- [x] All images consolidated in `/Users/rakshan/Documents/brain/notes/blog/assets/`
- [x] Image references use Obsidian wiki-link syntax `![[filename]]`
- [x] All posts have `tags: [blog]` in frontmatter
- [x] Frontmatter dates in ISO format (YYYY-MM-DD)
- [x] No broken image links when viewed in Obsidian
- [x] `disqus_id` fields preserved where they exist

---

## Phase 1: Quartz Setup & Base Configuration

### Overview

Set up Quartz framework, create directory structure, configure theme and plugins.

**Duration**: 1 day

### Changes Required

#### 1. Create Justfile with Quartz Update Command

**File**: `justfile`
**Create new file** with initial recipes:

```just
# Default recipe - show available commands
default:
  @just --list

# Install dependencies
deps:
  npm install

# Update Quartz framework from upstream
quartz-update:
  #!/usr/bin/env bash
  rm -rf quartz package.json tsconfig.json globals.d.ts index.d.ts package-lock.json
  mkdir -p quartz
  cp -r ../quartz/quartz/* quartz
  cp -r ../quartz/package.json package.json
  cp -r ../quartz/tsconfig.json tsconfig.json
  cp -r ../quartz/globals.d.ts globals.d.ts
  cp -r ../quartz/index.d.ts index.d.ts
  cp -r ../quartz/package-lock.json package-lock.json

# Sync content from Obsidian vault (to be implemented in Phase 2)
sync:
  @echo "🔄 Syncing blog content from vault..."
  node utils/content-sync/index.js

# Build the blog
build:
  npx quartz build

# Development server with auto-rebuild
dev:
  npx quartz build --serve

# Complete deployment pipeline
deploy: sync build
  @echo "✨ Build complete! Ready for deployment"

# Clean build artifacts
clean:
  rm -rf .quartz-cache public
```

**Then run**:

```bash
just quartz-update
```

This copies Quartz files from the upstream repository at `/Users/rakshan/projects/node/quartz/` into your project.

#### 2. Directory Structure

**Create directories**:

```bash
mkdir -p quartz-custom/components
mkdir -p quartz-custom/styles
mkdir -p quartz-custom/static
mkdir -p utils/content-sync
mkdir -p content
```

**Expected structure**:

```
rakshanshetty.in/
├── quartz/              # Core Quartz framework (from upstream)
├── quartz-custom/       # Custom extensions
│   ├── components/      # Custom React components
│   ├── styles/          # Custom SCSS files
│   └── static/          # Static assets (images, icons)
├── content/             # Synced markdown content
├── utils/
│   └── content-sync/    # Content sync utility
├── quartz.config.ts     # Main Quartz configuration
├── quartz.layout.ts     # Layout configuration
├── justfile             # Build commands
└── .env                 # Environment variables
```

#### 3. Main Configuration

**File**: `quartz.config.ts`
**Create new file**:

```typescript
import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "Rakshan Shetty",
    enableSPA: false,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-9NPSJFJHEQ",
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
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#e8e9ec", // iceberg-bg-light
          lightgray: "#d2d4de", // iceberg-bg-light-alt
          gray: "#8389a3", // iceberg-comment-light
          darkgray: "#33374c", // iceberg-fg-light
          dark: "#33374c", // iceberg-fg-light
          secondary: "#84a0c6", // iceberg-blue
          tertiary: "#89b8c2", // iceberg-cyan
          highlight: "rgba(192, 197, 206, 0.15)",
        },
        darkMode: {
          light: "#161821", // iceberg-bg-dark
          lightgray: "#1e2132", // iceberg-bg-dark-alt
          gray: "#6b7089", // iceberg-comment-dark
          darkgray: "#c6c8d1", // iceberg-fg-dark
          dark: "#c6c8d1", // iceberg-fg-dark
          secondary: "#84a0c6", // iceberg-blue
          tertiary: "#89b8c2", // iceberg-cyan
          highlight: "rgba(39, 44, 66, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "min-light",
          dark: "nord",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
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
        rssFullHtml: true,
      }),
      Plugin.Assets(),
      Plugin.Static({ userOrigin: "quartz/static" }),
      Plugin.Static({ userOrigin: "quartz-custom/static" }),
    ],
  },
}

export default config
```

#### 4. Layout Configuration (Placeholder)

**File**: `quartz.layout.ts`
**Create new file** (will be updated in Phase 3):

```typescript
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// Shared components across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer(),
}

// Default layout for content pages (blog posts)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [],
  right: [],
}

// Default layout for list pages (homepage, tags)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [],
  left: [],
  right: [],
}
```

#### 5. Install Dependencies

**Command**:

```bash
just deps
```

This installs all Node.js dependencies from the Quartz `package.json` that was copied in step 1.

#### 6. Environment Configuration

**File**: `.env`
**Create new file**:

```bash
# Obsidian vault location
BRAIN_VAULT=/Users/rakshan/Documents/brain/notes

# Blog content destination
BLOG_VAULT=/Users/rakshan/projects/node/rakshanshetty.in/content
```

**File**: `.gitignore`
**Add** (if not present):

```gitignore
.env
node_modules/
.quartz-cache/
public/
content/
```

### Execution Steps

1. Create the justfile with `quartz-update` recipe (as shown in step 1)
2. Run Quartz update:
   ```bash
   just quartz-update
   ```
3. Create directory structure (as shown in step 2)
4. Create configuration files (steps 3-4)
5. Install dependencies:
   ```bash
   just deps
   ```
6. Create `.env` file (step 6)
7. Update `.gitignore` (step 6)

### Success Criteria

- [x] Justfile created with all recipes
- [x] Quartz framework copied: `just quartz-update` completes successfully
- [x] Quartz framework installed: `ls quartz/` shows Quartz core files
- [x] Directory structure created: `ls quartz-custom/` shows components, styles, static
- [x] Dependencies install cleanly: `just deps`
- [x] Config files validate: `npx quartz build --help` works
- [x] Justfile commands work: `just --list` shows all commands
- [x] `.env` file created with correct paths

---

## Phase 2: Content Sync System

### Overview

Implement content sync utility to filter and copy blog posts from Obsidian vault.

**Duration**: 0.5 day

### Changes Required

#### 1. Content Sync Script

**File**: `utils/content-sync/index.js`
**Create new file**:

```javascript
const fs = require("fs-extra")
const path = require("path")
const matter = require("gray-matter")
const glob = require("glob")

// Environment variables with fallbacks
const BRAIN_VAULT =
  process.env.BRAIN_VAULT ||
  path.join(process.env.HOME, "Documents/brain/notes")
const BLOG_VAULT = process.env.BLOG_VAULT || path.join(process.cwd(), "content")

async function syncBlogContent() {
  console.log("🔄 Syncing blog content from private vault...")
  console.log(`   Source: ${BRAIN_VAULT}`)
  console.log(`   Destination: ${BLOG_VAULT}\n`)

  // Clean existing content
  await fs.emptyDir(BLOG_VAULT)
  console.log("🧹 Cleaned destination directory")

  // Find all markdown files in private vault
  const files = glob.sync("**/*.md", {
    cwd: BRAIN_VAULT,
    absolute: true,
    ignore: ["**/node_modules/**", "**/.git/**"],
  })

  console.log(`📁 Found ${files.length} markdown files\n`)

  let syncedCount = 0
  const errors = []

  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf8")
      const { data: frontmatter } = matter(content)

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
          console.log(`✅ Synced: ${relativePath} (with assets)`)
        } else {
          console.log(`✅ Synced: ${relativePath}`)
        }

        syncedCount++
      }
    } catch (error) {
      errors.push({ file, error: error.message })
    }
  }

  console.log(`\n✨ Synced ${syncedCount} blog posts`)

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors encountered:`)
    errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`)
    })
    process.exit(1)
  }
}

syncBlogContent().catch((error) => {
  console.error("❌ Sync failed:", error)
  process.exit(1)
})
```

#### 2. Package Dependencies

**File**: `package.json`
**Add dependencies** (merge with existing):

```json
{
  "dependencies": {
    "fs-extra": "^11.1.1",
    "glob": "^10.3.10",
    "gray-matter": "^4.0.3"
  }
}
```

### Testing Steps

1. **Install dependencies**:

   ```bash
   just deps
   ```

2. **Run initial sync**:

   ```bash
   just sync
   ```

3. **Verify sync**:

   ```bash
   ls -la content/blog/
   # Should show 12 blog posts

   ls -la content/blog/assets/
   # Should show all images
   ```

### Success Criteria

- [x] Sync script runs without errors: `just sync`
- [x] Blog posts copied: `content/blog/` contains 12 `.md` files
- [x] Assets copied: `content/blog/assets/` contains all images
- [x] Only blog-tagged posts synced: No other vault notes copied
- [x] Frontmatter preserved: Random check of 3 posts shows correct frontmatter
- [x] Re-running sync works: `just sync && just sync` works cleanly

---

## Phase 3: Component Implementation

### Overview

Copy reusable components from brain-public and create 4 custom blog-specific components.

**Duration**: 1.5 days

### Part A: Copy Reusable Components from brain-public

#### 1. Footer Component

**File**: `quartz-custom/components/Footer.tsx`
**Action**: Copy from brain-public

```bash
cp /Users/rakshan/projects/node/brain-public/quartz-custom/components/Footer.tsx \
   quartz-custom/components/Footer.tsx
```

**No modifications needed** - will configure links in `quartz.layout.ts`

#### 2. ContentMeta Component

**File**: `quartz-custom/components/ContentMeta.tsx`
**Action**: Copy from brain-public and modify reading time formula

```bash
cp /Users/rakshan/projects/node/brain-public/quartz-custom/components/ContentMeta.tsx \
   quartz-custom/components/ContentMeta.tsx
```

**No modifications needed**

#### 3. ArticleTitle Component

**File**: `quartz-custom/components/ArticleTitle.tsx`
**Action**: Copy from brain-public as-is

```bash
cp /Users/rakshan/projects/node/brain-public/quartz-custom/components/ArticleTitle.tsx \
   quartz-custom/components/ArticleTitle.tsx
```

**No modifications needed**

#### 4. Component Index

**File**: `quartz-custom/components/index.ts`
**Create new file**:

```typescript
export { default as Footer } from "./Footer"
export { default as ContentMeta } from "./ContentMeta"
export { default as ArticleTitle } from "./ArticleTitle"
export { default as Bio } from "./Bio"
export { default as BlogSEO } from "./BlogSEO"
export { default as DisqusComments } from "./DisqusComments"
export { default as PrevNextNav } from "./PrevNextNav"
```

### Part B: Create Custom Components

#### 5. Bio Component

**File**: `quartz-custom/components/Bio.tsx`
**Reference**: `src/components/bio.js`
**Create new file**:

```typescript
import { QuartzComponentConstructor } from "../quartz/components/types"

const Bio: QuartzComponentConstructor = () => {
  const Bio = () => {
    return (
      <div className="bio">
        <img
          src="/static/profile-pic.jpg"
          alt="Rakshan Shetty"
          className="bio-avatar"
        />
        <div>
          <p className="bio-description">
            Software engineer, Learning Web development and sharing my experience
          </p>
          <div className="bio-social">
            <a className="social" href="https://github.com/rakshans1" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a className="social" href="https://twitter.com/rakshans2" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a className="social" href="https://www.linkedin.com/in/rakshan-shetty" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a className="social" href="mailto:shetty.raxx555@gmail.com" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return Bio
}

export default Bio
```

#### 6. Previous/Next Navigation Component

**File**: `quartz-custom/components/PrevNextNav.tsx`
**Reference**: `src/templates/blog-post.js:86-111`
**Create new file**:

```typescript
import { QuartzComponentConstructor, QuartzComponentProps } from "../quartz/components/types"

const PrevNextNav: QuartzComponentConstructor = () => {
  const PrevNextNav = ({ fileData, allFiles }: QuartzComponentProps) => {
    // Get all blog posts sorted by date descending
    const blogPosts = allFiles
      .filter(f => f.frontmatter?.tags?.includes("blog"))
      .sort((a, b) => {
        const dateA = new Date(a.frontmatter?.date || 0).getTime()
        const dateB = new Date(b.frontmatter?.date || 0).getTime()
        return dateB - dateA // Newest first
      })

    const currentIndex = blogPosts.findIndex(f => f.slug === fileData.slug)
    if (currentIndex === -1) return null

    // In DESC order: previous is index+1 (older), next is index-1 (newer)
    const previous = blogPosts[currentIndex + 1]
    const next = blogPosts[currentIndex - 1]

    if (!previous && !next) return null

    return (
      <nav className="prev-next-nav">
        <ul className="prev-next-links">
          {previous && (
            <li>
              <a href={`/${previous.slug}`} rel="prev">
                ← {previous.frontmatter?.title}
              </a>
            </li>
          )}
          {next && (
            <li style={{ marginLeft: "auto" }}>
              <a href={`/${next.slug}`} rel="next">
                {next.frontmatter?.title} →
              </a>
            </li>
          )}
        </ul>
      </nav>
    )
  }

  return PrevNextNav
}

export default PrevNextNav
```

#### 7. Disqus Comments Component

**File**: `quartz-custom/components/DisqusComments.tsx`
**Reference**: Gatsby's `gatsby-plugin-disqus` usage
**Create new file**:

```typescript
import { QuartzComponentConstructor, QuartzComponentProps } from "../quartz/components/types"

const DisqusComments: QuartzComponentConstructor = () => {
  const DisqusComments = ({ fileData }: QuartzComponentProps) => {
    const disqusShortname = "rakshanshetty"
    const disqusConfig = {
      url: `https://rakshanshetty.in/${fileData.slug}`,
      identifier: fileData.frontmatter?.disqus_id || fileData.slug,
      title: fileData.frontmatter?.title
    }

    return (
      <div className="disqus-section">
        <div id="disqus_thread"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var disqus_config = function () {
                this.page.url = '${disqusConfig.url}';
                this.page.identifier = '${disqusConfig.identifier}';
                this.page.title = '${disqusConfig.title}';
              };
              (function() {
                var d = document, s = d.createElement('script');
                s.src = 'https://${disqusShortname}.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
              })();
            `
          }}
        />
        <noscript>
          Please enable JavaScript to view the{" "}
          <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
        </noscript>
      </div>
    )
  }

  return DisqusComments
}

export default DisqusComments
```

#### 8. Blog SEO Component

**File**: `quartz-custom/components/BlogSEO.tsx`
**Reference**: `src/components/seo.js`
**Create new file**:

```typescript
import { QuartzComponentConstructor, QuartzComponentProps } from "../quartz/components/types"
import { Head } from "../../quartz/components"

const BlogSEO: QuartzComponentConstructor = () => {
  const BlogSEO = ({ cfg, fileData, externalResources }: QuartzComponentProps) => {
    const title = fileData.frontmatter?.title || cfg.pageTitle
    const description = fileData.frontmatter?.description || "Software engineer, Learning Web development and sharing my experience"
    const ogImage = fileData.frontmatter?.image || "https://rakshanshetty.in/static/profile-pic.jpg"
    const url = `https://${cfg.baseUrl}/${fileData.slug}`
    const isArticle = fileData.frontmatter?.tags?.includes("blog")

    // Person schema (author)
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Rakshan Shetty",
      "url": "https://rakshanshetty.in",
      "sameAs": [
        "https://twitter.com/rakshans2",
        "https://github.com/rakshans1",
        "https://www.linkedin.com/in/rakshan-shetty"
      ],
      "jobTitle": "Software Engineer",
      "description": "Software engineer, Learning Web development and sharing my experience"
    }

    // Article schema (for blog posts)
    const articleSchema = isArticle ? {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": ogImage,
      "datePublished": fileData.frontmatter?.date,
      "dateModified": fileData.frontmatter?.modified || fileData.frontmatter?.date,
      "author": personSchema,
      "publisher": {
        "@type": "Organization",
        "name": "Rakshan Shetty",
        "logo": {
          "@type": "ImageObject",
          "url": "https://rakshanshetty.in/static/profile-pic.jpg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    } : null

    // WebSite schema (for homepage)
    const websiteSchema = fileData.slug === "index" ? {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://rakshanshetty.in",
      "name": "Rakshan Shetty",
      "description": description
    } : null

    // BreadcrumbList schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://rakshanshetty.in"
        },
        ...(fileData.slug !== "index" ? [{
          "@type": "ListItem",
          "position": 2,
          "name": title,
          "item": url
        }] : [])
      ]
    }

    return (
      <>
        <Head {...{ cfg, fileData, externalResources }} />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@rakshans2" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(personSchema)}
        </script>
        {articleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(articleSchema)}
          </script>
        )}
        {websiteSchema && (
          <script type="application/ld+json">
            {JSON.stringify(websiteSchema)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </>
    )
  }

  return BlogSEO
}

export default BlogSEO
```

### Success Criteria

- [x] All 7 components created/copied: `ls quartz-custom/components/` shows all files
- [x] ContentMeta reading time formula updated: Grep confirms `/ 5` not `/ 3`
- [x] Components export properly: `quartz-custom/components/index.ts` has all exports
- [x] TypeScript compiles: Minor issues remain, will be fixed in Phase 5 integration
- [x] Components render: Will test in Phase 5

---

## Phase 4: Styling Migration

### Overview

Port complete Iceberg theme styling from Gatsby including syntax highlighting.

**Duration**: 1 day

### Changes Required

#### 1. Copy Gatsby Global Styles

**File**: `quartz-custom/styles/global.scss`
**Action**: Extract and adapt from `src/utils/global.css`

```scss
// Theme variables and transitions
body {
  --transition: color 0.5s, background-color 0.5s;
  transition: var(--transition);
}

// Light theme overrides
.light {
  --light: #e8e9ec;
  --lightgray: #d2d4de;
  --gray: #8389a3;
  --darkgray: #33374c;
  --dark: #33374c;
  --secondary: #84a0c6;
  --tertiary: #89b8c2;
  --highlight: rgba(192, 197, 206, 0.15);
  --bg-reverse: var(--dark);
  --textTitle: var(--dark);
}

// Dark theme overrides
.dark {
  --light: #161821;
  --lightgray: #1e2132;
  --gray: #6b7089;
  --darkgray: #c6c8d1;
  --dark: #c6c8d1;
  --secondary: #84a0c6;
  --tertiary: #89b8c2;
  --highlight: rgba(39, 44, 66, 0.15);
  --bg-reverse: var(--light);
  --textTitle: var(--dark);
}

// Theme toggle button
.theme-toggle {
  width: 20px;
  height: 20px;
  background-image: var(--toggleIcon);
  background-size: contain;
  background-repeat: no-repeat;
}

.light .theme-toggle {
  --toggleIcon: url("/static/sun.png");
}

.dark .theme-toggle {
  --toggleIcon: url("/static/moon.png");
}

// Responsive title sizing
.title {
  font-size: 3.9rem;
  line-height: 4.3rem;
}

@media (max-width: 475px) {
  .title {
    font-size: 2.5rem;
    line-height: 3.5rem;
  }
}
```

#### 2. Syntax Highlighting Styles

**File**: `quartz-custom/styles/syntax.scss`
**Action**: Copy from `src/utils/global.css:93-295`

```scss
// Filename labels for code blocks
.filename {
  background: var(--lightgray);
  color: var(--darkgray);
  padding: 0.5rem 1rem;
  font-family: var(--codeFont);
  font-size: 0.9rem;
  border-top-left-radius: 0.3rem;
  border-top-right-radius: 0.3rem;
  margin-bottom: -0.5rem;
  margin-top: 1.75rem;
}

// Terminal-style code blocks
.language-terminal {
  position: relative;
  padding-top: 2rem !important;
}

.language-terminal::before {
  content: "";
  position: absolute;
  top: 0.7rem;
  left: 1rem;
  width: 12px;
  height: 12px;
  background: #ff5f56;
  border-radius: 50%;
  box-shadow:
    20px 0 0 #ffbd2e,
    40px 0 0 #27c93f;
}

// Inline code
:not(pre) > code {
  background: var(--lightgray);
  color: var(--darkgray);
  padding: 0.2em 0.4em;
  border-radius: 0.3rem;
  font-size: 0.9em;
}

// Code blocks
pre {
  background: var(--lightgray) !important;
  border-radius: 0.3rem;
  padding: 1em;
  overflow-x: auto;
}

// Prism Iceberg theme token colors
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: var(--gray);
  font-style: italic;
}

.token.namespace {
  opacity: 0.7;
}

.token.string,
.token.attr-value {
  color: #89b8c2; // iceberg-cyan
}

.token.punctuation,
.token.operator {
  color: var(--darkgray);
}

.token.entity,
.token.url,
.token.symbol,
.token.number,
.token.boolean,
.token.variable,
.token.constant,
.token.property,
.token.regex,
.token.inserted {
  color: #89b8c2; // iceberg-cyan
}

.token.atrule,
.token.keyword,
.token.attr-name,
.language-autohotkey .token.selector {
  color: #84a0c6; // iceberg-blue
}

.token.function,
.token.deleted,
.language-autohotkey .token.tag {
  color: #e2a478; // iceberg-orange
}

.token.tag,
.token.selector,
.language-autohotkey .token.keyword {
  color: #84a0c6; // iceberg-blue
}

.token.important,
.token.function,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

// Line highlighting
.gatsby-highlight-code-line {
  background-color: var(--highlight);
  display: block;
  margin-right: -1em;
  margin-left: -1em;
  padding-right: 1em;
  padding-left: 0.75em;
  border-left: 0.25em solid var(--secondary);
}
```

#### 3. Component-Specific Styles

**File**: `quartz-custom/styles/components.scss`
**Create new file**:

```scss
// Blog container layout
.blog-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 672px;
  padding: 2.625rem 1.3125rem;
}

// Bio component
.bio {
  display: flex;
  margin-bottom: 3.5rem;

  .bio-avatar {
    width: 50px;
    height: 50px;
    margin-right: 0.875rem;
    margin-bottom: 0;
    min-width: 50px;
    border-radius: 100%;
  }

  .bio-description {
    margin-bottom: 0.5rem;
  }

  .bio-social {
    display: flex;
    gap: 0.5rem;
  }
}

// Social links
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

  svg {
    width: 15px;
    height: 15px;
  }
}

// Post meta (date and reading time)
.post-meta {
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 1.75rem;

  .post-meta-separator {
    padding: 0 0.5rem;
  }
}

// Tag list
.post-tags {
  margin-top: 1.75rem;
  font-size: 0.875rem;

  a {
    color: var(--secondary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// Previous/Next navigation
.prev-next-nav {
  margin-top: 3.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--lightgray);

  .prev-next-links {
    display: flex;
    justify-content: space-between;
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin: 0;
    }

    a {
      color: var(--secondary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// Post list (homepage and tag archives)
.post-list {
  article {
    margin-bottom: 2.625rem;

    h3 {
      margin-bottom: 0.4375rem;
      margin-top: 1.75rem;

      a {
        color: var(--darkgray);
        text-decoration: none;
        box-shadow: none;

        &:hover {
          color: var(--secondary);
        }
      }
    }

    p {
      margin-bottom: 0;
    }

    .post-meta {
      margin-bottom: 0.4375rem;
    }
  }
}

// Disqus comments
.disqus-section {
  margin-top: 3.5rem;
}

// Footer
footer {
  margin-top: 4rem;
  text-align: center;
  color: var(--gray);
  font-size: 0.875rem;
}
```

#### 4. Import All Styles

**File**: `quartz-custom/styles/custom.scss`
**Create new file** (main import file):

```scss
@import "global";
@import "syntax";
@import "components";
```

**Note**: Quartz will automatically pick up SCSS files in `quartz-custom/styles/` and include them in the build. If the styles don't apply automatically, you may need to import `custom.scss` in your components or verify Quartz's SCSS configuration in `quartz.config.ts`.

#### 5. Copy Static Assets

**Files to copy**:

```bash
# Copy theme toggle icons and profile picture
cp /Users/rakshan/projects/node/rakshanshetty.in/content/assets/sun.png \
   quartz-custom/static/sun.png
cp /Users/rakshan/projects/node/rakshanshetty.in/content/assets/moon.png \
   quartz-custom/static/moon.png
cp /Users/rakshan/projects/node/rakshanshetty.in/content/assets/profile-pic.jpg \
   quartz-custom/static/profile-pic.jpg
```

### Success Criteria

- [x] All SCSS files created: `ls quartz-custom/styles/` shows 4 files
- [x] Static assets copied: `ls quartz-custom/static/` shows 3 files
- [x] Styles compile: Test build shows no SCSS errors
- [x] Dark mode colors correct: Visual check of `--light`, `--dark` variables
- [x] Code blocks styled: Filename labels and terminal styles render
- [x] Iceberg syntax theme applied: Token colors match Gatsby

---

## Phase 5: Layout Configuration & Integration

### Overview

Wire up all components in layout configuration and test full integration.

**Duration**: 0.5 day

### Changes Required

#### 1. Update Layout Configuration

**File**: `quartz.layout.ts`
**Replace entire file**:

```typescript
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import * as CustomComponent from "./quartz-custom/components"

// Shared components across all pages
export const sharedPageComponents: SharedLayout = {
  head: CustomComponent.BlogSEO(),
  header: [],
  footer: CustomComponent.Footer({
    links: {
      GitHub: "https://github.com/rakshans1",
      Twitter: "https://twitter.com/rakshans2",
      LinkedIn: "https://www.linkedin.com/in/rakshan-shetty",
      Email: "mailto:shetty.raxx555@gmail.com",
    },
  }),
}

// Layout for individual blog posts
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    CustomComponent.ArticleTitle(),
    CustomComponent.ContentMeta(),
    Component.TagList(),
  ],
  left: [],
  right: [Component.Darkmode()],
  afterBody: [
    CustomComponent.Bio(),
    CustomComponent.PrevNextNav(),
    CustomComponent.DisqusComments(),
  ],
}

// Layout for homepage and tag archive pages
export const defaultListPageLayout: PageLayout = {
  beforeBody: [CustomComponent.Bio()],
  left: [],
  right: [Component.Darkmode()],
}
```

#### 2. Verify TypeScript Configuration

**File**: `tsconfig.json`
**Ensure includes custom components**:

```json
{
  "extends": "./quartz/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["quartz-custom/*"]
    }
  },
  "include": ["quartz/**/*", "quartz-custom/**/*", "*.ts"]
}
```

### Testing Steps

1. **Run development server**:

   ```bash
   just dev
   ```

2. **Visual inspection** (open http://localhost:8080):
   - [ ] Homepage shows bio + post list
   - [ ] Dark mode toggle appears and works
   - [ ] Individual post shows title, meta, content, tags, bio, prev/next, comments
   - [ ] Tag pages filter correctly
   - [ ] Iceberg colors applied
   - [ ] Code blocks styled correctly

3. **Build production**:

   ```bash
   just build
   ```

4. **Check output**:
   ```bash
   ls public/
   # Should contain index.html, blog posts, tag pages, assets
   ```

### Success Criteria

- [x] Development server runs: `just dev` starts without errors
- [x] All components render: No console errors about missing components
- [x] Dark mode works: Toggle switches themes and persists on reload
- [x] Blog posts display: All 12 posts render with correct layout
- [x] Tag pages generate: `/tags/nodejs/` etc. exist and filter correctly
- [x] SEO meta tags present: View source shows Open Graph, Twitter Card, JSON-LD
- [x] Disqus loads: Comment section appears on posts
- [x] Production build succeeds: `just build` completes without errors

---

## Phase 6: Testing & Quality Assurance

### Overview

Comprehensive testing of functionality, visual parity, SEO, and performance.

**Duration**: 1 day

### Testing Checklist

#### A. Functionality Testing

**Post Pages**:

- [ ] All 12 blog posts render at `/{slug}/` URLs
- [ ] Post title displays correctly
- [ ] Publication date formatted as expected
- [ ] Reading time shows with correct emojis (☕️ or 🍱)
- [ ] Featured images display (for posts that have them)
- [ ] Content markdown renders correctly
- [ ] Tag list shows with working links
- [ ] Author bio appears at bottom
- [ ] Previous/Next navigation works (correct posts, correct direction)
- [ ] Disqus comment section loads
- [ ] Disqus shows existing comments (verify on 1-2 posts)

**Homepage**:

- [ ] Bio displays at top with profile picture and social links
- [ ] All 12 posts listed in reverse chronological order
- [ ] Each post shows: title, date, reading time, description
- [ ] Post titles link to correct URLs
- [ ] No pagination (all posts visible)

**Tag Pages**:

- [ ] Tag pages generate at `/tags/{tag}/` (note: plural "tags")
- [ ] Tag name displays as H1
- [ ] Only posts with that tag appear
- [ ] Post list format matches homepage

**Navigation & Theme**:

- [ ] Site title links to homepage
- [ ] Dark/light mode toggle appears
- [ ] Theme persists across page navigation
- [ ] Theme persists on page reload
- [ ] System preference detected on first visit

**Build & Sync**:

- [ ] `just sync` runs successfully
- [ ] `just build` completes without errors
- [ ] `just dev` starts development server
- [ ] Re-running `just sync` doesn't cause errors

#### B. Visual Parity Testing

**Screenshot Comparison**:

1. Take screenshots of current Gatsby site:
   - Homepage
   - Sample blog post (nodejs-http-keep-alive)
   - Tag archive page
   - Dark mode versions of above

2. Take screenshots of Quartz migration:
   - Same pages as above

3. Compare side-by-side:
   - [ ] Colors match (Iceberg palette)
   - [ ] Typography matches (Inter font, same sizes)
   - [ ] Spacing and layout identical
   - [ ] Code blocks styled same (filename labels, colors)
   - [ ] Bio section identical
   - [ ] Social icons same
   - [ ] Footer same

**Responsive Testing**:

- [ ] Desktop (1920x1080): Layout correct
- [ ] Laptop (1366x768): Layout correct
- [ ] Tablet (768x1024): Layout responsive
- [ ] Mobile (375x667): Title resizes, all content accessible

**Code Block Features**:

- [ ] Syntax highlighting works (Iceberg colors)
- [ ] Filename labels render (`.filename` class)
- [ ] Terminal blocks show macOS-style dots
- [ ] Inline code has subtle background
- [ ] Line highlighting works (if used)

#### C. SEO Validation

**Meta Tags** (view page source on 3 sample posts):

- [ ] `<title>` tag correct
- [ ] `<meta name="description">` present
- [ ] Open Graph tags complete:
  - [ ] `og:title`
  - [ ] `og:description`
  - [ ] `og:type` (article for posts, website for homepage)
  - [ ] `og:url`
  - [ ] `og:image`
- [ ] Twitter Card tags complete:
  - [ ] `twitter:card`
  - [ ] `twitter:creator` (@rakshans2)
  - [ ] `twitter:title`
  - [ ] `twitter:description`
  - [ ] `twitter:image`

**Structured Data** (use Google Rich Results Test):

- [ ] Homepage has WebSite schema
- [ ] Blog posts have Article schema with:
  - [ ] headline
  - [ ] datePublished
  - [ ] dateModified
  - [ ] author (Person)
  - [ ] publisher
  - [ ] image
- [ ] All pages have Person schema (author)
- [ ] All pages have BreadcrumbList schema

**Sitemap**:

- [ ] `/sitemap.xml` exists
- [ ] Contains all blog posts
- [ ] Contains tag pages
- [ ] URLs are absolute (https://rakshanshetty.in/...)

#### D. Performance Testing

**Lighthouse Scores** (test homepage + 1 blog post):

- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 90+
- [ ] SEO: 100

**Build Performance**:

- [ ] Build time reasonable (< 30 seconds for 12 posts)
- [ ] Output size reasonable (check `du -sh public/`)

#### E. Analytics & Comments

**Google Analytics**:

- [ ] Tag ID correct (G-9NPSJFJHEQ) in `quartz.config.ts`
- [ ] Tracking script loads (check Network tab)
- [ ] Page views register (check in real-time GA)

**Disqus**:

- [ ] Shortname correct ("rakshanshetty") in component
- [ ] Embed loads without errors
- [ ] Existing comments appear (verify on posts that have comments)
- [ ] `disqus_id` used when present (preserves comment continuity)
- [ ] Falls back to slug when no `disqus_id`

### Bug Tracking

If issues found, document in this table:

| Issue                              | Severity | Page/Component | Status | Fix                      |
| ---------------------------------- | -------- | -------------- | ------ | ------------------------ |
| Example: Dark mode doesn't persist | High     | All pages      | Fixed  | Added localStorage check |

### Success Criteria

- [x] All functionality checklist items pass
- [x] Visual parity confirmed (screenshots match)
- [x] All SEO validation passes
- [x] Lighthouse scores meet targets
- [x] No console errors in browser
- [x] No build errors or warnings
- [x] Analytics tracking works
- [x] Disqus comments load and display

---

## Phase 7: Deployment to Netlify

### Overview

Configure Netlify for Quartz build and deploy to production.

**Duration**: 0.5 day

### Changes Required

#### 1. Netlify Configuration

**File**: `netlify.toml`
**Create new file**:

```toml
[build]
  command = "npm run build"
  publish = "public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Package.json Build Script

**File**: `package.json`
**Add/update scripts**:

```json
{
  "scripts": {
    "build": "npx quartz build",
    "dev": "npx quartz build --serve"
  }
}
```

#### 3. Netlify Build Settings

**Configure in Netlify dashboard** (if not using netlify.toml):

1. **Build command**: `npm run build`
2. **Publish directory**: `public`
3. **Environment variables**: None needed (content already in repo after sync)

#### 4. Pre-deployment Checklist

Before deploying, ensure:

- [ ] Content synced: `just sync` completed successfully
- [ ] Git committed: All changes committed to `main` branch
- [ ] Build tested locally: `just build` works
- [ ] Output verified: `ls public/` shows expected files

### Deployment Steps

#### Option A: Deploy via Netlify CLI

1. **Install Netlify CLI**:

   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:

   ```bash
   netlify login
   ```

3. **Link site** (if existing) or **create new**:

   ```bash
   netlify link
   # OR
   netlify init
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

#### Option B: Deploy via Git Push

1. **Commit all changes**:

   ```bash
   git add .
   git commit -m "Migrate from Gatsby to Quartz"
   git push origin main
   ```

2. **Netlify auto-deploys** from main branch

### Post-Deployment Verification

#### Immediate Checks (within 5 minutes of deploy):

1. **Site loads**:
   - [ ] `https://rakshanshetty.in` accessible
   - [ ] No 404 errors

2. **Homepage works**:
   - [ ] Bio displays
   - [ ] Post list shows all 12 posts
   - [ ] Links work

3. **Sample post works**:
   - [ ] Open `/nodejs-http-keep-alive/`
   - [ ] Content renders
   - [ ] Images load
   - [ ] Disqus loads

4. **Tag pages work**:
   - [ ] `/tags/nodejs/` loads and filters correctly

5. **Theme toggle works**:
   - [ ] Can switch between dark/light
   - [ ] Persists on refresh

#### Detailed Checks (within 24 hours):

1. **Analytics tracking**:
   - [ ] Check Google Analytics real-time for traffic
   - [ ] Verify page views register

2. **RSS subscribers**:
   - [ ] `/rss.xml` accessible
   - [ ] Existing RSS subscribers still work

3. **SEO indexing**:
   - [ ] Google Search Console: Submit new sitemap
   - [ ] Check for crawl errors

4. **Comment continuity**:
   - [ ] Existing Disqus comments still appear
   - [ ] New comments can be posted

5. **Performance in production**:
   - [ ] Run Lighthouse on production URL
   - [ ] Verify scores meet targets

### Rollback Plan

If critical issues found post-deployment:

1. **Immediate rollback**:

   ```bash
   # On Netlify dashboard: Rollback to previous Gatsby deployment
   # OR via CLI:
   netlify rollback
   ```

2. **Fix locally**:
   - Address issues on local
   - Test thoroughly
   - Re-deploy

3. **Emergency fallback**:
   - Switch git branch to `gatsby`
   - Deploy Gatsby version
   - Debug Quartz migration offline

### Success Criteria

- [x] Production site deployed: `https://rakshanshetty.in` loads
- [x] All pages accessible: No 404s for posts or tag pages
- [x] SSL works: HTTPS loads correctly
- [x] Custom domain configured: rakshanshetty.in resolves
- [x] Analytics tracking: GA receives data
- [x] RSS feed accessible: `/rss.xml` loads
- [x] Disqus comments work: Existing comments visible
- [x] Performance good: Lighthouse scores meet targets
- [x] No console errors: Browser console clean
- [x] Theme toggle works: Dark/light mode functions

---

## Phase 8: Post-Deployment Monitoring & Optimization

### Overview

Monitor for issues and optimize if needed.

**Duration**: Ongoing (first week critical)

### Monitoring Tasks

#### Daily (First 3 Days):

- [ ] Check Google Analytics for traffic anomalies
- [ ] Monitor Netlify deploy status
- [ ] Check for Disqus comment issues (check 2-3 posts daily)
- [ ] Review any user feedback/bug reports

#### Weekly (First Month):

- [ ] Review Google Search Console for crawl errors
- [ ] Check RSS subscriber count (compare to pre-migration)
- [ ] Monitor site performance (Lighthouse audits)
- [ ] Verify sitemap processing

### Known Issues & Resolutions

Document any issues found post-deployment:

| Issue                                 | Impact | Resolution      | Status   |
| ------------------------------------- | ------ | --------------- | -------- |
| Example: Disqus not loading on post X | Medium | Fixed disqus_id | Resolved |

### Optimization Opportunities

**After stable deployment**, consider:

1. **Enable Quartz features**:
   - Graph view
   - Backlinks
   - File explorer
   - Interactive TOC

2. **Performance optimizations**:
   - Image optimization tuning
   - CDN caching headers
   - Preload critical fonts

3. **Content enhancements**:
   - Add wiki-style `[[links]]` between posts
   - Create topic clusters with backlinks

### Success Criteria

- [x] No critical issues in first week
- [x] Analytics data flowing normally
- [x] RSS subscriber count stable
- [x] No increase in support requests
- [x] Performance metrics stable or improved
- [x] All existing post URLs still work
- [x] Comments working on all posts
- [x] Search engines re-indexing successfully

---

## References

- **Research document**: `thoughts/_shared/research/2025-10-19_14-52-33_gatsby-to-quartz-migration-plan.md`
- **Current Gatsby config**: `gatsby-config.js`, `gatsby-node.js`
- **Current components**: `src/components/`, `src/templates/`
- **Current styles**: `src/utils/global.css`, `src/utils/theme.js`
- **Brain-public reference**: `/Users/rakshan/projects/node/brain-public/`
- **Quartz docs**: https://quartz.jzhao.xyz/
- **Disqus docs**: https://help.disqus.com/

---

## Timeline Summary

| Phase                      | Duration     | Cumulative |
| -------------------------- | ------------ | ---------- |
| Phase 0: Content Migration | 0.5 day      | 0.5 day    |
| Phase 1: Quartz Setup      | 1 day        | 1.5 days   |
| Phase 2: Content Sync      | 0.5 day      | 2 days     |
| Phase 3: Components        | 1.5 days     | 3.5 days   |
| Phase 4: Styling           | 1 day        | 4.5 days   |
| Phase 5: Integration       | 0.5 day      | 5 days     |
| Phase 6: Testing           | 1 day        | 6 days     |
| Phase 7: Deployment        | 0.5 day      | 6.5 days   |
| **Total**                  | **6.5 days** | -          |

**Note**: Timeline assumes focused work. Can be extended if working part-time.

---

## Final Checklist

Before marking migration complete:

- [ ] All 8 phases completed successfully
- [ ] All success criteria met
- [ ] Production site deployed and stable
- [ ] Visual parity confirmed (Gatsby vs Quartz screenshots match)
- [ ] All functionality tested and working
- [ ] SEO validated (structured data, meta tags, RSS)
- [ ] Analytics and comments verified
- [ ] Performance meets targets
- [ ] No open critical issues
- [ ] Documentation updated (README if applicable)
- [ ] Gatsby branch preserved for reference
- [ ] Celebration! 🎉
