---
date: 2025-10-25T04:35:00+0000
researcher: Rakshan Shetty
git_commit: f677b50607a4bb06acc208edafdd703db1a8f95a
branch: main
repository: rakshans1/rakshanshetty.in
topic: "How to resolve Obsidian-style image paths from cover frontmatter for OG images in LDMeta.tsx"
tags: [research, codebase, quartz, obsidian, images, frontmatter, og-image, ldmeta]
status: complete
last_updated: 2025-10-25
last_updated_by: Rakshan Shetty
last_updated_note: "Restructured solution section to put assets directory structure first, removed contradictory implementation, added implementation status section"
---

# Research: Resolving Obsidian Image Paths for OG Images

## Research Question

How can we properly resolve Obsidian wikilink syntax image paths (e.g., `cover: "![[image.png]]"`) from frontmatter to use as OG images in the LDMeta.tsx component?

## Summary

**Problem**: Blog posts use Obsidian wikilink syntax in the `cover` frontmatter field (`![[filename.png]]`), but LDMeta.tsx expects a plain URL path for OG images.

**Solution**:
1. Parse the Obsidian wikilink syntax to extract the filename using regex
2. Use Quartz's `slugifyFilePath()` utility to convert the path to a URL-safe format
3. Extract the directory from the page slug (e.g., `blog` from `blog/post-name`)
4. Construct the asset path as `{directory}/assets/{filename}` to match the content sync structure
5. Build the absolute URL by combining with the site's base URL
6. Leverage the existing frontmatter transformer's `coalesceAliases` feature which already maps `cover` → `socialImage`

**Key Discoveries**:
1. Quartz's frontmatter transformer already normalizes multiple image field names (`socialImage`, `image`, `cover`) into `fileData.frontmatter.socialImage`
2. The custom content sync script (`utils/content-sync/index.js`) copies images to an `assets/` subdirectory alongside each markdown file, NOT to a global `/static/` directory. This means URLs must be constructed as `{directory}/assets/{filename}`, not simply `{filename}`.

## Detailed Findings

### Current Implementation Issues

**Current LDMeta.tsx code** (`quartz-custom/components/LDMeta.tsx:33-34`):
```typescript
const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`;
const ogImage = fileData.frontmatter?.image || ogImageDefaultPath;
```

**Issues**:
- Only checks `frontmatter.image`, not `frontmatter.cover`
- Doesn't handle Obsidian wikilink syntax (`![[...]]`)
- Blog posts use `cover: "![[quartz-obsidian-multi-site-publishing.png]]"` format

### How Quartz Processes Images

#### 1. Frontmatter Coalescing

**File**: `quartz/plugins/transformers/frontmatter.ts:101-119`

The frontmatter transformer automatically coalesces multiple field names:

```typescript
const socialImage = coalesceAliases(data, ["socialImage", "image", "cover"])
if (socialImage) data.socialImage = socialImage
```

**Implication**: We can access `fileData.frontmatter.socialImage` and it will contain the value from whichever field exists first (`socialImage` → `image` → `cover`).

#### 2. Obsidian Wikilink Processing

**File**: `quartz/plugins/transformers/ofm.ts:147-248`

Quartz uses regex to parse Obsidian wikilinks:

```typescript
const wikilinkImageEmbedRegex = new RegExp(
  /^(?<alt>(?!^\d*x?\d*$).*?)?(\|?\s*?(?<width>\d+)(x(?<height>\d+))?)?$/,
)

// Main wikilink pattern
const wikilinkRegex = new RegExp(
  /!?\[\[([^\[\]\|\#\\]+)?(#+[^\[\]\|\#\\]+)?(\\?\|[^\[\]\#]*)?\]\]/g,
)
```

**Pattern breakdown**:
- `!?` - Optional `!` prefix for embeds
- `\[\[` - Opening brackets
- `([^\[\]\|\#\\]+)?` - Capture group 1: File path
- `(#+[^\[\]\|\#\\]+)?` - Capture group 2: Optional anchor
- `(\\?\|[^\[\]\#]*)?` - Capture group 3: Optional alias
- `\]\]` - Closing brackets

**Example**: `![[nodejs-http-keep-alive-alb-new-connections.png| Downstream New Connections ]]`
- Capture 1: `nodejs-http-keep-alive-alb-new-connections.png`
- Capture 2: `undefined`
- Capture 3: `| Downstream New Connections `

#### 3. Path Slugification

**File**: `quartz/util/path.ts:72-88`

Quartz uses `slugifyFilePath()` to convert file paths to URL-safe slugs:

```typescript
export function slugifyFilePath(fp: FilePath, excludeExt?: boolean): FullSlug {
  fp = stripSlashes(fp) as FilePath
  let ext = getFileExtension(fp)
  const withoutFileExt = fp.replace(new RegExp(ext + "$"), "")

  // For images, preserve extension
  if (excludeExt || [".md", ".html", undefined].includes(ext)) {
    ext = ""
  }

  let slug = sluggify(withoutFileExt)

  // treat _index as index
  if (endsWith(slug, "_index")) {
    slug = slug.replace(/_index$/, "index")
  }

  return (slug + ext) as FullSlug
}

function sluggify(s: string): string {
  return s
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")        // spaces → hyphens
        .replace(/&/g, "-and-")     // ampersands → "-and-"
        .replace(/%/g, "-percent")  // percent → "-percent"
        .replace(/\?/g, "")         // remove question marks
        .replace(/#/g, ""),         // remove hashes
    )
    .join("/")
    .replace(/\/$/, "")
}
```

**Key behavior**:
- Preserves image file extensions (unlike `.md` files)
- Handles special characters (spaces, &, %, ?, #)
- Transforms `my photo.png` → `my-photo.png`

#### 4. Similar Pattern in OG Image Emitter

**File**: `quartz/plugins/emitters/ogImage.tsx:146-161`

Quartz's OG image emitter shows how to resolve frontmatter images:

```typescript
let userDefinedOgImagePath = pageData.frontmatter?.socialImage

if (userDefinedOgImagePath) {
  userDefinedOgImagePath = isAbsoluteURL(userDefinedOgImagePath)
    ? userDefinedOgImagePath  // Already absolute
    : `https://${baseUrl}/static/${userDefinedOgImagePath}`  // Make absolute
}

const ogImagePath = userDefinedOgImagePath ?? generatedOgImagePath ?? defaultOgImagePath
```

**Pattern**:
1. Get image from `frontmatter.socialImage`
2. Check if already absolute URL
3. If relative, prefix with `https://${baseUrl}/static/`
4. Fall back to generated or default image

### Complete Image Processing Pipeline

When an image appears in markdown as `![[image.png]]`:

1. **Text Transform** (`ofm.ts:176-207`) - Normalizes wikilink syntax
2. **MDAST Transform** (`ofm.ts:220-248`) - Converts to image node with slugified URL
3. **HAST Transform** (`remarkRehype`) - Converts to `<img>` element
4. **Path Resolution** (`links.ts:138-157`) - Makes URLs relative to current page
5. **Asset Copying** (`assets.ts:14-26`) - Copies physical files with matching slug-based paths

**Critical**: `slugifyFilePath()` is used in both URL generation (step 2) and file copying (step 5), ensuring consistency.

## Recommended Solution

### Understanding the Assets Directory Structure

**Critical Foundation**: Before implementing the solution, understand that images in this project are NOT stored in a global `/static/` directory. The custom content sync script (`utils/content-sync/index.js:112-149`) copies images to an `assets/` subdirectory alongside each markdown file, maintaining the directory structure from the Obsidian vault.

**Why this matters**: The URL construction must account for this structure. A simple `baseUrl + filename` approach will fail because the actual image path is `{directory}/assets/{filename}`.

**Content sync behavior**:
- Source vault: `~/vault/blog/my-post.md` + `~/vault/blog/assets/image.png`
- Synced to: `content/blog/my-post.md` + `content/blog/assets/image.png`
- Built to: `public/blog/my-post/index.html` + `public/blog/assets/image.png`
- Final URL: `blog/assets/image.png`

This design keeps images colocated with their content, making the vault portable and maintaining logical organization.

### Implementation

Add a helper function to parse Obsidian wikilink syntax and construct the correct asset path:

```typescript
import { slugifyFilePath } from "../../quartz/util/path";

// Helper function to parse Obsidian image syntax from frontmatter
const parseObsidianImage = (imageField: string | undefined): string | undefined => {
  if (!imageField) return undefined;

  // Match: ![[filename.png]] or ![[filename.png|alt text]] or [[filename.png]]
  const wikilinkMatch = imageField.match(/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/);

  if (wikilinkMatch) {
    const filename = wikilinkMatch[1].trim();
    // Slugify the path to match how Quartz processes it
    return slugifyFilePath(filename as any);
  }

  // If already a URL or plain path, return as-is
  return imageField;
};

// In the component:
const parsedImagePath = parseObsidianImage(fileData.frontmatter?.socialImage);
const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`;

let ogImage = ogImageDefaultPath;
if (parsedImagePath) {
  if (parsedImagePath.startsWith('http')) {
    // Already an absolute URL
    ogImage = parsedImagePath;
  } else {
    // Construct path: images are in assets/ directory alongside the markdown file
    // Extract directory from slug (e.g., "blog" from "blog/post-name")
    const slugParts = fileData.slug!.split('/');
    const directory = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : '';
    const imagePath = directory ? `${directory}/assets/${parsedImagePath}` : `assets/${parsedImagePath}`;
    ogImage = `https://${cfg.baseUrl}/${imagePath}`;
  }
}
```

### How It Works

**Step-by-step transformation**:

1. **Frontmatter coalescing**: Quartz's transformer automatically coalesces `cover` → `socialImage`
2. **Wikilink parsing**: `parseObsidianImage()` extracts filename from `![[quartz-obsidian-multi-site-publishing.png]]` → `quartz-obsidian-multi-site-publishing.png`
3. **Path slugification**: `slugifyFilePath()` converts to URL-safe format (handles spaces, special chars)
4. **Directory extraction**: Extract parent directory from slug (`blog/quartz-obsidian-multi-site-publishing` → `blog`)
5. **Asset path construction**: Combine `{directory}/assets/{filename}` → `blog/assets/quartz-obsidian-multi-site-publishing.png`
6. **Absolute URL**: Prefix with base URL → `https://rakshanshetty.in/blog/assets/quartz-obsidian-multi-site-publishing.png`

**Complete example transformation**:
- Input frontmatter: `cover: "![[quartz-obsidian-multi-site-publishing.png]]"`
- File slug: `blog/quartz-obsidian-multi-site-publishing`
- Parsed filename: `quartz-obsidian-multi-site-publishing.png`
- Extracted directory: `blog`
- Constructed path: `blog/assets/quartz-obsidian-multi-site-publishing.png`
- Final OG image URL: `https://rakshanshetty.in/blog/assets/quartz-obsidian-multi-site-publishing.png`

### Regex Pattern Explanation

Pattern: `/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/`

**Components**:
- `^!?` - Optional `!` at start (embed indicator)
- `\[\[` - Opening double brackets
- `([^\[\]\|]+)` - **Capture group 1**: Filename (anything except brackets or pipes)
- `(\|[^\]]+)?` - **Capture group 2**: Optional pipe and alt text
- `\]\]$` - Closing double brackets at end

**Handles all Obsidian wikilink formats**:
- `![[image.png]]` → extracts `image.png`
- `[[image.png]]` → extracts `image.png` (no embed prefix)
- `![[image.png|Alt text]]` → extracts `image.png` (ignores alt text)
- `![[subfolder/image.png]]` → extracts `subfolder/image.png` (preserves path)

## Code References

### Key Files

- `quartz-custom/components/LDMeta.tsx:33-34` - **Original OG image implementation (before fix)** - showed the problematic code that didn't handle Obsidian wikilinks
- `quartz-custom/components/LDMeta.tsx:11-68` - **Updated implementation (after fix)** - includes `parseObsidianImage()` helper and correct asset path construction
- `content/blog/quartz-obsidian-multi-site-publishing.md:11` - Example of `cover` frontmatter usage with Obsidian wikilink syntax
- `utils/content-sync/index.js:112-149` - **Content sync script that copies assets to `assets/` directory** - critical for understanding URL structure
- `quartz/plugins/transformers/frontmatter.ts:101-119` - Frontmatter field coalescing (`cover` → `socialImage`)
- `quartz/plugins/transformers/ofm.ts:147-248` - Obsidian wikilink processing for markdown content
- `quartz/util/path.ts:72-88` - `slugifyFilePath()` implementation
- `quartz/util/path.ts:57-70` - `sluggify()` implementation
- `quartz/plugins/emitters/ogImage.tsx:146-161` - Reference pattern for OG image path resolution
- `quartz/plugins/emitters/assets.ts:14-26` - Asset file copying logic

### Utility Functions

**Path utilities** (`quartz/util/path.ts`):
- `slugifyFilePath(fp: FilePath, excludeExt?: boolean): FullSlug` - Convert file path to slug
- `joinSegments(...args: string[]): string` - Join path segments safely
- `resolveRelative(current: FullSlug, target: FullSlug): RelativeURL` - Resolve relative URLs
- `isAbsoluteURL(s: string): boolean` - Check if URL is absolute
- `getFileExtension(s: string): string | undefined` - Extract file extension

## Architecture Insights

### Design Patterns Discovered

1. **Field Name Coalescing**: Quartz normalizes multiple frontmatter field names (`socialImage`, `image`, `cover`) into a single canonical field (`socialImage`). This allows flexibility in authoring while maintaining a consistent API.

2. **Two-Phase Path Resolution**:
   - **Phase 1**: Wikilink syntax → slugified path in MDAST
   - **Phase 2**: Absolute/relative resolution in HAST
   - Both phases use the same `slugifyFilePath()` ensuring consistency

3. **Separation of Concerns**:
   - **Transformers**: Process markdown/HTML AST (in-memory)
   - **Emitters**: Write physical files to disk
   - This ensures URLs generated during transformation match actual file locations

4. **Unified Plugin System**: Uses `unified` ecosystem with `remark` (markdown) and `rehype` (HTML) processors for consistent AST transformations

### Key Architectural Decisions

1. **Extension Preservation**: Unlike markdown files (`.md` → no extension), image extensions are preserved during slugification. This matches standard web server expectations.

2. **Wikilink Flexibility**: Obsidian wikilinks support multiple formats (with/without `!`, with/without alt text, with/without dimensions). The regex patterns are permissive to handle all variations.

3. **Fallback Chain**: OG images follow a clear fallback hierarchy:
   ```
   frontmatter.socialImage → auto-generated → default
   ```

4. **URL-Safe Transformations**: Special characters in filenames are transformed to web-safe equivalents:
   - Spaces → hyphens
   - `&` → `-and-`
   - `%` → `-percent`
   - `?`, `#` → removed

5. **Assets Directory Convention**: This project uses a custom content sync workflow (`utils/content-sync/index.js`) that copies images to an `assets/` subdirectory alongside each markdown file, rather than a global `/static/` directory. This maintains the directory structure from the Obsidian vault and ensures images are colocated with their content.

### Best Practices Observed

1. **Type Safety**: Use TypeScript type assertions when calling utilities (e.g., `as FilePath`)
2. **Absolute URLs for Meta Tags**: Always use absolute URLs for OG images (required by social media platforms)
3. **Defensive Parsing**: Check for both Obsidian syntax and plain paths to handle migration scenarios
4. **Consistent Slugification**: Use the same slugification function across all path operations to prevent mismatches

### Reusable Patterns

The Obsidian wikilink parsing pattern can be reused for other frontmatter fields:

```typescript
// Generic wikilink parser
const parseWikilink = (field: string | undefined): string | undefined => {
  if (!field) return undefined;
  const match = field.match(/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/);
  return match ? match[1].trim() : field;
};
```

This could be useful for parsing other Obsidian-specific syntax in frontmatter (e.g., banner images, thumbnails, related notes).

## Implementation Status

✅ **COMPLETED**: The solution has been implemented in `quartz-custom/components/LDMeta.tsx`.

**Changes made**:
1. Added `parseObsidianImage()` helper function to parse wikilink syntax from frontmatter
2. Updated OG image resolution logic to:
   - Extract filename from Obsidian wikilinks (`![[image.png]]`)
   - Construct correct asset path using slug directory + `/assets/`
   - Handle absolute URLs and fallback to default image
3. Uses `fileData.frontmatter?.socialImage` which is auto-coalesced from `cover`, `image`, or `socialImage` fields

**Expected behavior**:
- Blog posts with `cover: "![[image.png]]"` will now generate correct OG image URLs
- Example: `cover: "![[quartz-obsidian-multi-site-publishing.png]]"` in file at `blog/my-post.md` → `https://rakshanshetty.in/blog/assets/quartz-obsidian-multi-site-publishing.png`
- Falls back to default OG image (`/static/og-image.png`) if no cover specified

**Testing**: Build the site with `npx quartz build` and inspect the `<script type="application/ld+json">` tags in the HTML to verify the `image` field contains the correct URL.
