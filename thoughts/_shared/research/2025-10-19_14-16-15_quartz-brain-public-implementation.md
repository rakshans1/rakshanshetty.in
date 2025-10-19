---
date: 2025-10-19T14:16:15+0000
researcher: rakshan
git_commit: 6dee0035b8ea737248457e42a0c965e0fcec1a6b
branch: main
repository: brain-public
topic: "How brain-public is implemented using Quartz"
tags: [research, codebase, quartz, digital-garden, static-site-generator, markdown]
status: complete
last_updated: 2025-10-19
last_updated_by: rakshan
---

# Research: How brain-public is implemented using Quartz

## Research Question

How is the brain-public project implemented using the Quartz static site generator framework? What are the core components, customizations, and architectural decisions that power this digital garden?

## Summary

**brain-public** is a personal digital garden built on **Quartz v4** (jackyzha0/quartz), a modern static site generator designed specifically for publishing Obsidian-style markdown notes as a website. The implementation consists of:

1. **Core Framework**: Quartz v4.5.2 provides the base SSG infrastructure with a plugin-based architecture
2. **Custom Extensions**: 3 custom plugins (Img, RemoveTags, Static) and 3 custom components (ArticleTitle, Footer, ContentMeta) that add site-specific functionality
3. **Content Structure**: 137 markdown files organized hierarchically with wiki-style links, frontmatter-driven publishing, and temporal organization through "almanac" journaling
4. **Build System**: Just-based workflow orchestrating content sync from private Obsidian vault, Quartz CLI build, and deployment to git
5. **Content Filtering**: Two-level filtering system (topicFilter for navigation, notesFilter for indexes) that controls content visibility based on frontmatter flags

The implementation demonstrates sophisticated use of Quartz's extensibility while maintaining clean separation between framework code and custom logic.

## Detailed Findings

### 1. Quartz Framework Architecture

#### What is Quartz?

Quartz is a fast, batteries-included static site generator specifically designed for publishing digital gardens and notes. It transforms markdown content (particularly Obsidian-flavored markdown) into a fully interactive website with bidirectional links, graph view, search, and more.

**Key characteristics:**
- Built with TypeScript on Node.js (v22+)
- Uses unified/remark/rehype ecosystem for markdown processing
- Plugin-based architecture with three plugin types: transformers, filters, and emitters
- Preact for component rendering
- esbuild for bundling and hot module replacement

**Project structure:**
```
brain-public/
├── quartz/              # Core Quartz framework (v4.5.2)
├── quartz-custom/       # Custom extensions
├── content/             # Markdown content (git submodule)
├── public/              # Build output
├── quartz.config.ts     # Site configuration
├── quartz.layout.ts     # Component layout
└── justfile             # Build commands
```

#### Core Configuration Files

##### quartz.config.ts (`/Users/rakshan/projects/node/brain-public/quartz.config.ts`)

This is the central configuration file that defines:

**Site Metadata** (lines 11-24):
- Page title: "🧠"
- Base URL: brain.rakshanshetty.in
- Analytics: Google Analytics (G-9NPSJFJHEQ)
- Ignore patterns: `["private", "templates", ".obsidian"]`
- SPA mode disabled, popovers enabled

**Theme Configuration** (lines 25-57):
- Typography: Inter for headers/body, JetBrains Mono for code
- Custom color scheme using Iceberg theme colors
- Light/dark mode support with distinct color palettes

**Plugin Pipeline** (lines 59-102):
- **Transformers** (15 plugins): Process markdown to HTML
  - FrontMatter parsing
  - Syntax highlighting (min-light/nord themes)
  - Obsidian Flavored Markdown support
  - GitHub Flavored Markdown
  - LaTeX rendering with KaTeX
  - Custom: RemoveTags, Img
- **Filters** (1 plugin): Remove draft files
- **Emitters** (9 plugins): Generate output files
  - Content pages, folder pages, tag pages
  - RSS feed, sitemap
  - Custom: Static file copying

##### quartz.layout.ts (`/Users/rakshan/projects/node/brain-public/quartz.layout.ts`)

Defines the page layout structure:

**Shared Components** (lines 8-21):
- Custom Footer with social links (GitHub, Twitter, LinkedIn, Instagram, Email)
- No header components

**Content Page Layout** (lines 24-46):
- **Before body**: Breadcrumbs, custom ArticleTitle, custom ContentMeta, TagList
- **Left sidebar**: PageTitle, Search, Darkmode, Explorer (with topicFilter)
- **Right sidebar**: Graph, TableOfContents, Backlinks, RecentNotes (with notesFilter)

**List Page Layout** (lines 49-68):
- Simplified version without right sidebar
- Same left sidebar and before-body components

### 2. Custom Plugins

The brain-public implementation extends Quartz with three custom plugins located in `/Users/rakshan/projects/node/brain-public/quartz-custom/plugins/`.

#### Plugin 1: Image Zoom Transformer

**File**: `quartz-custom/plugins/transformers/img.ts`

**Purpose**: Adds click-to-zoom functionality to images when pages have `cssclasses: [img-zoom]` in frontmatter.

**Implementation**:
- Uses `unist-util-visit` to traverse HTML AST
- Checks frontmatter for 'img-zoom' in cssclasses array
- Adds 'img-zoom' class to matching images
- Injects JavaScript (`img-zoom.inline.ts`) that creates fullscreen overlay on click
- Injects CSS (`image-zoom.inline.scss`, `image-grid.inline.scss`) for styling

**Client-side behavior**:
- Listens for clicks on `img.img-zoom` elements
- Creates overlay div with zoomed clone of image
- ESC key dismisses overlay

**Integration point**: `quartz.config.ts:82` - `CustomPlugins.Img()`

#### Plugin 2: RemoveTags Transformer

**File**: `quartz-custom/plugins/transformers/removeTags.ts`

**Purpose**: Filters out specified tags from frontmatter before content processing.

**Configuration**: `{ tags: ["publish", "almanac"] }`

**Implementation**:
- Operates during markdown processing phase
- Accesses `file.data.frontmatter.tags`
- Filters out tags matching the configured list
- Prevents internal organization tags from appearing in final site

**Why needed**: The "publish" and "almanac" tags are used for content organization in Obsidian but shouldn't be visible on the public website.

**Integration point**: `quartz.config.ts:81` - `CustomPlugins.RemoveTags({ tags: ["publish", "almanac"] })`

#### Plugin 3: Custom Static Emitter

**File**: `quartz-custom/plugins/emitters/static.ts`

**Purpose**: Copies static files from `quartz-custom/static/` to build output.

**Implementation**:
- Uses 100ms delay to avoid race condition with built-in Static plugin
- Discovers files using glob pattern `"**"`
- Copies to `{output}/static/` directory
- Creates parent directories recursively
- Uses async generator pattern to report progress

**Why needed**: Extends Quartz's built-in static file handling to support custom static assets specific to this site.

**Integration point**: `quartz.config.ts:99` - `CustomPlugins.Static()` (placed after `Plugin.Static()`)

### 3. Custom Components

The brain-public implementation includes three custom React components located in `/Users/rakshan/projects/node/brain-public/quartz-custom/components/`.

#### Component 1: ArticleTitle

**File**: `quartz-custom/components/ArticleTitle.tsx`

**Purpose**: Conditionally renders article titles based on frontmatter.

**Key feature**: Adds support for `hide-title` frontmatter flag.

**Implementation**:
- Wraps default Quartz ArticleTitle component
- Checks for `frontmatter.hide-title`
- Returns `null` if title should be hidden
- Otherwise delegates to original component

**Use case**: Allows pages like the homepage to suppress title rendering even when title exists in frontmatter.

**Integration points**:
- `quartz.layout.ts:27` - defaultContentPageLayout.beforeBody
- `quartz.layout.ts:52` - defaultListPageLayout.beforeBody

#### Component 2: Footer

**File**: `quartz-custom/components/Footer.tsx`

**Purpose**: Custom footer with social links and simplified branding.

**Configuration**:
```typescript
{
  links: {
    GitHub: "https://github.com/rakshans1",
    Twitter: "https://twitter.com/rakshans2",
    LinkedIn: "https://www.linkedin.com/in/rakshan-shetty",
    Instagram: "https://instagram.com/rakshans2",
    Email: "mailto:shetty.raxx555@gmail.com"
  }
}
```

**Key difference from default**: Removes "Created with Quartz v{version}" branding, shows only "🧠 © {year}".

**Styling**: Left-aligned, flex layout with 1rem gap, 70% opacity (defined in `footer.scss`).

**Integration point**: `quartz.layout.ts:12-20` - sharedPageComponents.footer

#### Component 3: ContentMeta

**File**: `quartz-custom/components/ContentMeta.tsx`

**Purpose**: Displays article metadata (date and reading time) with custom formatting.

**Key features**:
1. Custom emoji-based reading time format:
   - **Coffee cups (☕️)**: For <15 min reads - `cups = Math.round(minutes / 3)`
   - **Bento boxes (🍱)**: For ≥15 min reads - `Math.round(cups / Math.E)` boxes
2. Support for `hide-meta` frontmatter flag
3. Configurable comma separator between segments

**Implementation**:
- Uses Quartz's Date component for date display
- Calculates reading time using `reading-time` library
- Formats output with custom `formatReadingTime()` function
- Conditionally hides entire metadata section if `hide-meta: true`

**Styling**: Gray color, zero top margin, conditional comma insertion via `[show-comma="true"]` attribute selector.

**Integration points**:
- `quartz.layout.ts:28` - defaultContentPageLayout.beforeBody
- `quartz.layout.ts:53` - defaultListPageLayout.beforeBody

### 4. Content Filtering System

The digital garden uses a sophisticated two-level filtering system to control content visibility.

#### Level 1: notesFilter (File-level filtering)

**File**: `/Users/rakshan/projects/node/brain-public/quartz-custom/utils/filter.ts:11-13`

**Function signature**: `(file: QuartzPluginData) => boolean`

**Logic**:
```typescript
export const notesFilterForIndex = (file: QuartzPluginData) => {
  if (file.frontmatter && file.frontmatter["disable-index"]) {
    return file.frontmatter["disable-index"] !== true;
  }
  return true;
};
```

**Purpose**: Filters individual content files from appearing in the RecentNotes component.

**Mechanism**: Checks for `disable-index: true` in frontmatter. If present, excludes file from index listings.

**Use case**: Almanac weekly entries have `disable-index: true` (e.g., `/content/almanac/weekly/2023/01/2023-W04.md:7`) to prevent cluttering the recent notes widget with journal-style entries.

**Integration**: `quartz.layout.ts:44` - `Component.RecentNotes({ limit: 5, showTags: false, filter: notesFilter })`

#### Level 2: topicFilter (Tree-level filtering)

**File**: `/Users/rakshan/projects/node/brain-public/quartz-custom/utils/filter.ts:15-20`

**Function signature**: `(fileNode: FileTrieNode) => boolean`

**Logic**:
```typescript
export const topicFilter = (fileNode: FileTrieNode) => {
  if (fileNode.slugSegment === "almanac") {
    return false;
  }
  return true;
};
```

**Purpose**: Filters entire directory structures from appearing in the Explorer navigation.

**Mechanism**: Checks if a file tree node's `slugSegment` (last path segment) equals "almanac". If so, excludes entire folder hierarchy.

**Use case**: Completely hides the almanac folder from the Topics navigation sidebar, treating it as archive content.

**Integration**: `quartz.layout.ts:37` - `Component.Explorer({ title: "Topics", filterFn: topicFilter })`

**Data flow**:
1. Filter serialized to string and embedded in DOM (`Explorer.tsx:75`)
2. Deserialized client-side as function (`explorer.inline.ts:164`)
3. Applied to FileTrieNode tree structure (`explorer.inline.ts:183`)
4. Recursively filters all children (`fileTrie.ts:122-123`)

#### Combined Effect

- **topicFilter**: Hides almanac directory from navigation (user can't browse to it via sidebar)
- **notesFilter**: Hides individual entries with `disable-index: true` from recent notes listing
- **Result**: Clean, curated public interface while preserving all content (still accessible via direct links/search)

### 5. Content Structure

#### Overview

The content directory contains **137 markdown files** organized in a hierarchical structure following Obsidian conventions with wiki-style links.

**Location**: `/Users/rakshan/projects/node/brain-public/content/` (git submodule)

#### Directory Organization

```
content/
├── almanac/          - Time-based journaling (weekly/monthly entries)
│   ├── weekly/       - YYYY/MM/YYYY-WWW.md format
│   └── monthly/      - YYYY/MM/YYYY-MM.md format
├── articles/         - Curated external article summaries
├── digital-garden/   - PKM methodology and concepts
├── fashion/          - Fashion-related notes
├── management/       - Management and leadership topics
├── personal/         - Personal development content
├── productivity/     - Productivity systems (GTD, time management)
├── tech/             - Technical content (programming, tools)
│   └── programming/
│       ├── languages/  - Language-specific (Elixir, etc.)
│       ├── architecture/
│       └── concepts/
└── til/              - Today I Learned entries
```

#### Frontmatter Structure

**Core pattern** (all files):
```yaml
---
date: YYYY-MM-DD
tags:
  - publish         # Publishing control flag
  - [topic-tags]    # Categorization
---
```

**Almanac entries**:
```yaml
---
journal: almanac weekly
journal-date: 2022-11-14
disable-index: true    # Exclude from index
tags:
  - almanac
  - publish
---
```

**Special pages** (like `/content/index.md`):
```yaml
---
index: "true"
hide-meta: true       # Hide date/reading time
hide-title: true      # Hide title display
title: Home
disable-index: true
tags:
  - publish
---
```

**TIL posts**:
```yaml
---
title: Running a Terminal Inside Obsidian
cssclasses:
  - img-zoom         # Enable image zoom
  - img-center       # Center images
tags:
  - til
  - publish
---
```

#### Content Patterns

**1. Wiki-Style Linking** (Obsidian convention):
- Internal links: `[[Digital Garden]]`
- Links with aliases: `[[Software Tools I Use#^163df8|Obsidian]]`
- Block references: `[[Software Tools I Use#^62ccb1|Code]]`

**2. Hub Pages** (Map of Content pattern):
- Main hub: `/content/index.md:11-18` - Table linking to all major categories
- Topic hubs: `/content/tech/programming/languages/elixir/Elixir.md:8-13` - Links to subtopics (Learning, Security, Database, etc.)

**3. Temporal Navigation**:
- Weekly: `[[2022-W44]] <- • -> [[2022-W50]]`
- Monthly: `[[2025-02]] <- • -> [[2025-04]]`

**4. Asset Management**:
- Each directory has `assets/` subdirectory for images
- Images referenced with: `![[image-name.webp]]`
- Sizing: `![[elixir-logo.webp| 100]]`

#### Special Content Types

**Article Summaries** (`/content/articles/`):
- Always include `url:` field with original source
- Structured with headings and visual diagrams
- Example: "Building effective agents" includes diagrams and structured notes

**Almanac Monthly** (`/content/almanac/monthly/`):
- Sections: Saw (Shows/Movies), Songs (Albums/Artists), Photos, Weekly links
- Rich media with Trakt.tv and YouTube embeds

**TIL Posts** (`/content/til/`):
- Date-stamped learning notes
- Often include code snippets and screenshots
- More detailed than standard notes

### 6. Build System

#### Build Orchestration

**File**: `/Users/rakshan/projects/node/brain-public/justfile`

The project uses Just (a modern command runner, alternative to Make) to orchestrate the build workflow.

**Available commands**:

```bash
# Install dependencies
just deps          # npm i

# Build the site
just build         # npx quartz build

# Sync content from private Obsidian vault
just sync          # Runs content-sync utility

# Publish to git
just publish       # Commits and pushes content + site

# Complete deployment pipeline
just deploy        # sync -> build -> publish

# Update Quartz from upstream
just quartz-update # Copies from ../quartz/
```

#### Content Sync Workflow

**Command**: `just sync`

**Environment variables**:
```bash
BRAIN_VAULT="$HOME/Documents/brain/notes"
BRAIN_PUBLIC_VAULT="$HOME/projects/node/brain-public/content"
```

**Implementation**: `utils/content-sync/index.js`

**Purpose**: Syncs content from private Obsidian vault to public repository, filtering based on `publish` tag in frontmatter.

**Flow**:
1. Reads all markdown files from private vault (`~/Documents/brain/notes`)
2. Parses frontmatter with `gray-matter`
3. Filters files with `tags: [publish]`
4. Copies to public vault (`brain-public/content/`)
5. Maintains directory structure and assets

#### Quartz CLI

**Entry point**: `/Users/rakshan/projects/node/brain-public/quartz/bootstrap-cli.mjs`

**Main command**: `npx quartz build`

**Build flow**:
1. `bootstrap-cli.mjs` initializes CLI
2. `quartz/cli/handlers.js` processes build command
3. `quartz/build.ts` orchestrates build using processors:
   - **Parse** (`processors/parse.ts`): Reads and parses markdown files
   - **Filter** (`processors/filter.ts`): Applies filter plugins (RemoveDrafts)
   - **Emit** (`processors/emit.ts`): Generates output files via emitter plugins
4. `quartz/worker.ts` handles parallel processing via worker threads
5. esbuild bundles JavaScript and CSS
6. Output written to `public/` directory

**Processor pipeline**:
```
Markdown files → Parse → Transform → Filter → Emit → HTML/CSS/JS
                         ↓
                    Custom plugins apply here
                    (RemoveTags, Img)
```

#### Deployment Workflow

**Command**: `just deploy`

**Steps**:
1. **Sync** (`just sync`):
   - Copies published content from private Obsidian vault
   - Filters based on frontmatter tags
   - Maintains directory structure

2. **Build** (`just build`):
   - Runs Quartz CLI: `npx quartz build`
   - Processes 137 markdown files
   - Applies transformers (syntax highlighting, Obsidian markdown, custom plugins)
   - Generates static HTML/CSS/JS
   - Creates graph data, search index, RSS feed, sitemap
   - Outputs to `public/` directory

3. **Publish** (`just publish`):
   - Commits content submodule: `cd content && git add . && git commit -m "Update" && git push`
   - Commits main repo: `git add . && git commit -m "Update content" && git push`

**Result**: Updated digital garden deployed to hosting platform (likely Netlify or Vercel, based on typical Quartz deployments).

#### Quartz Update Workflow

**Command**: `just quartz-update`

**Purpose**: Updates Quartz framework from upstream repository.

**Steps**:
1. Removes old framework files: `quartz/`, `docs/`, package files
2. Copies from `../quartz/` (presumably a clone of jackyzha0/quartz):
   - `quartz/*` → `quartz/`
   - `docs/*` → `docs/quartz/`
   - `package.json`, `tsconfig.json`, `globals.d.ts`, `index.d.ts`, `package-lock.json`

**Pattern**: Vendored framework approach - Quartz is copied into the project rather than used as a dependency, allowing for easier customization.

### 7. Type Safety and TypeScript

#### Configuration

**File**: `/Users/rakshan/projects/node/brain-public/tsconfig.json`

**Compiler options**:
- Target: ES2022
- Module: ESNext
- Module resolution: Bundler
- Strict type checking enabled
- JSX: react-jsx with Preact

**Global type definitions**:
- `/Users/rakshan/projects/node/brain-public/globals.d.ts` - Global TypeScript declarations
- `/Users/rakshan/projects/node/brain-public/index.d.ts` - Main type definitions

#### Plugin Type Safety

All custom plugins implement Quartz's core interfaces from `/Users/rakshan/projects/node/brain-public/quartz/plugins/types.ts`:

**Transformer plugins**:
```typescript
interface QuartzTransformerPluginInstance {
  name: string
  htmlPlugins?: () => PluggableList
  markdownPlugins?: () => PluggableList
  externalResources?: () => Partial<StaticResources>
}
```

**Emitter plugins**:
```typescript
interface QuartzEmitterPluginInstance {
  name: string
  emit(ctx: BuildCtx, content: ProcessedContent[], resources: StaticResources): Promise<FilePath[]>
  partialEmit?(ctx: BuildCtx, content: ProcessedContent[], resources: StaticResources): Promise<FilePath[]>
}
```

#### Component Type Safety

All custom components use `QuartzComponent` type from `/Users/rakshan/projects/node/brain-public/quartz/components/types.ts`:

```typescript
interface QuartzComponentProps {
  ctx: BuildCtx
  fileData: QuartzPluginData
  cfg: GlobalConfiguration
  displayClass?: "mobile-only" | "desktop-only"
  tree: Node
  allFiles: QuartzPluginData[]
}

type QuartzComponent = (props: QuartzComponentProps) => JSX.Element | null
type QuartzComponentConstructor<Options> = (opts?: Options) => QuartzComponent
```

## Architecture Insights

### 1. Plugin-Based Extensibility

Quartz uses a three-phase plugin architecture:
- **Transformers**: Process content during markdown → HTML transformation
- **Filters**: Decide which content to include/exclude
- **Emitters**: Generate output files (HTML, RSS, sitemap, etc.)

Custom plugins integrate seamlessly by implementing standard interfaces. This allows brain-public to extend Quartz without modifying core framework code.

### 2. Frontmatter-Driven Configuration

The implementation heavily relies on frontmatter for feature flags and content control:
- `publish`: Controls whether content is synced from private vault
- `hide-title`, `hide-meta`: UI customization per page
- `disable-index`: Exclude from listings
- `cssclasses`: Enable features like image zoom
- `journal`, `journal-date`: Temporal organization

This approach provides fine-grained control without requiring code changes.

### 3. Separation of Concerns

The project maintains clear boundaries:
- **Core framework**: `quartz/` directory (vendored, updated via `just quartz-update`)
- **Custom extensions**: `quartz-custom/` directory (site-specific)
- **Content**: `content/` directory (git submodule, synced from private vault)
- **Configuration**: Root-level `*.config.ts` and `*.layout.ts` files

This separation allows framework updates without losing customizations.

### 4. Content Sync Pattern

The two-repository pattern is notable:
- **Private vault**: Full Obsidian vault with unpublished notes
- **Public vault**: Filtered subset with `publish` tag

Benefits:
- Keep private notes in same vault as public ones
- Single source of truth for all content
- Selective publishing via frontmatter
- Maintains Obsidian's bidirectional linking even for unpublished notes

### 5. Progressive Enhancement

The digital garden uses progressive enhancement:
- **Base layer**: Semantic HTML with inline CSS
- **Enhancement layer**: JavaScript for interactivity (search, graph, image zoom)
- **Optional features**: Popovers, dark mode, zoom - all degrade gracefully

SPA mode is disabled (`enableSPA: false` in config), ensuring content is accessible without JavaScript.

### 6. Performance Optimizations

- **Worker threads**: `quartz/worker.ts` uses workerpool for parallel builds
- **Incremental builds**: `partialEmit()` hook for partial rebuilds during development
- **Resource management**: Quartz's `externalResources()` hook allows plugins to inject CSS/JS efficiently
- **CDN caching**: `cdnCaching: true` for Google Fonts

### 7. Obsidian Compatibility

Full support for Obsidian markdown syntax:
- Wiki-style links: `[[Page Name]]`
- Aliases: `[[Page Name|Display Text]]`
- Block references: `[[Page#^block-id]]`
- Image embeds: `![[image.png]]` with sizing: `![[image.png|100]]`
- Frontmatter: YAML metadata

This allows seamless workflow: write in Obsidian, publish to web with zero markdown conversion.

### 8. Modern Web Stack

- **TypeScript**: Full type safety across plugins and components
- **Preact**: Lightweight React alternative (3KB vs 40KB)
- **esbuild**: Fast bundling and transpilation
- **unified ecosystem**: Extensible markdown/HTML processing
- **Shiki**: Modern syntax highlighting (vs Prism)
- **Flexsearch**: Client-side full-text search

## Code References

### Core Configuration
- Main config: `/Users/rakshan/projects/node/brain-public/quartz.config.ts`
- Layout config: `/Users/rakshan/projects/node/brain-public/quartz.layout.ts`
- Package manifest: `/Users/rakshan/projects/node/brain-public/package.json`

### Custom Plugins
- Image zoom: `/Users/rakshan/projects/node/brain-public/quartz-custom/plugins/transformers/img.ts`
- Remove tags: `/Users/rakshan/projects/node/brain-public/quartz-custom/plugins/transformers/removeTags.ts`
- Custom static: `/Users/rakshan/projects/node/brain-public/quartz-custom/plugins/emitters/static.ts`
- Plugin index: `/Users/rakshan/projects/node/brain-public/quartz-custom/plugins/index.ts`

### Custom Components
- Article title: `/Users/rakshan/projects/node/brain-public/quartz-custom/components/ArticleTitle.tsx`
- Footer: `/Users/rakshan/projects/node/brain-public/quartz-custom/components/Footer.tsx`
- Content meta: `/Users/rakshan/projects/node/brain-public/quartz-custom/components/ContentMeta.tsx`
- Image zoom script: `/Users/rakshan/projects/node/brain-public/quartz-custom/components/scripts/img-zoom.inline.ts`
- Component index: `/Users/rakshan/projects/node/brain-public/quartz-custom/components/index.ts`

### Filter Utilities
- Filters: `/Users/rakshan/projects/node/brain-public/quartz-custom/utils/filter.ts`

### Build System
- Just commands: `/Users/rakshan/projects/node/brain-public/justfile`
- Quartz CLI: `/Users/rakshan/projects/node/brain-public/quartz/bootstrap-cli.mjs`
- Build logic: `/Users/rakshan/projects/node/brain-public/quartz/build.ts`
- Content sync: `/Users/rakshan/projects/node/brain-public/utils/content-sync/index.js`

### Content Structure
- Content root: `/Users/rakshan/projects/node/brain-public/content/`
- Homepage: `/Users/rakshan/projects/node/brain-public/content/index.md`
- Example almanac: `/Users/rakshan/projects/node/brain-public/content/almanac/weekly/2022/11/2022-W46.md`
- Example tech: `/Users/rakshan/projects/node/brain-public/content/tech/programming/languages/elixir/Elixir.md`

### Framework Core
- Plugin types: `/Users/rakshan/projects/node/brain-public/quartz/plugins/types.ts`
- Component types: `/Users/rakshan/projects/node/brain-public/quartz/components/types.ts`
- File trie: `/Users/rakshan/projects/node/brain-public/quartz/util/fileTrie.ts`
- Config types: `/Users/rakshan/projects/node/brain-public/quartz/cfg.ts`

## Conclusion

The brain-public digital garden demonstrates sophisticated use of the Quartz framework while maintaining clean architecture through:

1. **Minimal framework modification**: All customizations live in `quartz-custom/` directory
2. **Standards compliance**: Custom plugins/components follow Quartz interfaces exactly
3. **Frontmatter-driven features**: Configuration via metadata rather than code
4. **Content/code separation**: Content is git submodule, synced from private vault
5. **Type safety**: Full TypeScript coverage across all custom code

This implementation serves as an excellent reference for building production-ready digital gardens with Quartz v4.
