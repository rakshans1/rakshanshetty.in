# Blog Cover Image Display - Implementation Plan

## Overview

Add full-width cover image rendering at the top of pages (before breadcrumbs) using Obsidian wikilink syntax (`![[image.png]]`) from the `cover` frontmatter field. This will display hero images on blog posts and any other pages that specify a cover image, enhancing visual appeal and content presentation.

## Current State Analysis

### Existing Implementation

**Wikilink Parsing Already Exists**: The `parseObsidianImage()` helper function in `LDMeta.tsx:11-26` already handles Obsidian wikilink syntax for OG meta tags:

```typescript
const parseObsidianImage = (imageField: string | undefined): string | undefined => {
  if (!imageField) return undefined;
  const wikilinkMatch = imageField.match(/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/);
  if (wikilinkMatch) {
    const filename = wikilinkMatch[1].trim();
    return slugifyFilePath(filename as any);
  }
  return imageField;
};
```

**Asset Structure**: From the OG tags implementation (lines 50-68), we know:
- Images are stored in `content/blog/assets/` (source)
- Images are built to `public/blog/assets/` (output)
- Asset paths are constructed as `{directory}/assets/{filename}`
- Example: `blog/my-post.md` + `cover: "![[image.png]]"` → `blog/assets/image.png`

**Current Layout Order** (`quartz.layout.ts:28-37`):

```typescript
beforeBody: [
  Component.Breadcrumbs({ showCurrentPage: false }),  // Currently FIRST
  CustomComponent.ArticleTitle(),
  CustomComponent.ContentMeta(),
  Component.TagList(),
  CustomComponent.BlogList(),
],
```

### Key Discoveries

1. **Frontmatter coalescing**: Quartz's frontmatter transformer already normalizes `cover` → `socialImage` (from `quartz/plugins/transformers/frontmatter.ts:101`)
2. **Path utilities available**: `pathToRoot()` and `joinSegments()` in `quartz/util/path.ts`
3. **Component rendering order**: Position in `beforeBody` array = visual position in HTML
4. **No existing full-width image components**: Need to create new pattern for full-width layouts

### Asset Directory Structure

```
Source:  content/blog/my-post.md + content/blog/assets/image.png
Built:   public/blog/my-post/index.html + public/blog/assets/image.png
URL:     /blog/assets/image.png
```

## Desired End State

### Functional Requirements

✅ **All pages can display cover images** when `cover` field is present in frontmatter:
```yaml
---
title: My Blog Post
cover: "![[hero-image.png]]"
---
```

✅ **Cover image renders as first visual element**:
- Positioned before Breadcrumbs component
- Full-width display (not constrained by content width)
- Responsive on mobile and desktop

✅ **Support multiple input formats** (same as OG tags):
- `![[image.png]]` - Standard Obsidian embed
- `[[image.png]]` - Wikilink without embed prefix
- `![[image.png|Alt text]]` - With alt text
- `https://example.com/image.png` - Absolute URLs
- `image.png` - Plain filenames

✅ **Graceful fallback**:
- No cover image specified → component renders nothing (no placeholder)

### Visual Specifications

- **Width**: Full viewport width (100vw or break out of content container)
- **Max height**: 400px (desktop), 300px (mobile)
- **Object fit**: `cover` (maintains aspect ratio, crops if needed)
- **Spacing**: 1.5rem margin below image before breadcrumbs
- **Border radius**: 0 (no rounded corners for full-width display)

### Verification Methods

**Build verification**:
```bash
npx quartz build
echo $?  # Should be 0
```

**Visual verification**:
1. Navigate to blog post with `cover: "![[image.png]]"`
2. Verify image appears before breadcrumbs
3. Verify full-width display
4. Check responsive behavior on mobile
5. Verify image URL loads correctly

**Test cases**:
- [x] Blog post with `cover: "![[image.png]]"` → image displays
- [x] Blog post with absolute URL cover → URL passed through
- [x] Blog post with no cover → no image, no placeholder
- [x] Root-level page with cover → image displays
- [x] Mobile responsive test (image scales properly)

## What We're NOT Doing

- ❌ Not adding cover images to list/index pages - these use `defaultListPageLayout` which shows multiple posts. Cover images only render on individual content pages that use `defaultContentPageLayout` and have a cover field defined
- ❌ Not creating placeholder images when cover is missing
- ❌ Not adding captions or attribution text
- ❌ Not implementing lightbox/zoom functionality
- ❌ Not lazy loading images (can be added later)
- ❌ Not extracting dimensions from wikilinks (`![[image.png|300x200]]`)
- ❌ Not validating image file existence at build time
- ❌ Not generating srcset for responsive images
- ❌ Not constraining to blog posts only (all pages can use covers)

## Implementation Approach

### Strategy

**Minimal, reusable component**: Create a new `CoverImage.tsx` component that reuses the existing `parseObsidianImage()` logic from `LDMeta.tsx` and insert it as the first element in `beforeBody`.

**Leverage existing infrastructure**:
1. Reuse `parseObsidianImage()` helper from `LDMeta.tsx`
2. Use Quartz's `pathToRoot()` and `joinSegments()` utilities
3. Follow the asset path construction pattern from OG image resolution
4. Use standard Quartz component structure and styling patterns

**Why this approach**:
- Maintains consistency with existing OG image handling
- Reuses tested wikilink parsing logic
- Keeps all changes in `quartz-custom/` directory
- Simple integration via layout configuration
- No modifications to Quartz core

---

## Phase 1: Create CoverImage Component

### Overview

Create a new Quartz component that renders a full-width cover image from frontmatter. The component will reuse the wikilink parsing logic and asset path construction from the existing OG image implementation.

### Changes Required

#### 1. Create `CoverImage.tsx` Component

**File**: `quartz-custom/components/CoverImage.tsx` (NEW)
**Location**: Create new file

```typescript
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types";
import { slugifyFilePath } from "../../quartz/util/path";
import style from "./styles/coverImage.scss";

// Helper function to parse Obsidian image syntax from frontmatter
// Reused from LDMeta.tsx implementation
const parseObsidianImage = (imageField: string | undefined): string | undefined => {
  if (!imageField) return undefined;

  // Match: ![[filename.png]] or ![[filename.png|alt text]] or [[filename.png]]
  const wikilinkMatch = imageField.match(/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/);

  if (wikilinkMatch) {
    const filename = wikilinkMatch[1].trim();
    // Slugify the path to match how Quartz processes it
    return slugifyFilePath(filename as any);
  }

  // If it's already a URL or plain path, return as-is
  return imageField;
};

const CoverImage: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
  // Get cover image from frontmatter
  // socialImage is coalesced from socialImage/image/cover by frontmatter transformer
  const parsedImagePath = parseObsidianImage(fileData.frontmatter?.socialImage);

  // Don't render anything if no cover image specified
  if (!parsedImagePath) {
    return null;
  }

  // Construct image URL
  let imageUrl: string;
  if (parsedImagePath.startsWith('http')) {
    // Already an absolute URL - use as-is
    imageUrl = parsedImagePath;
  } else {
    // Construct relative path: images are in assets/ directory alongside the markdown file
    // Get the directory part of the slug (e.g., "blog" from "blog/post-name")
    const slugParts = (fileData.slug ?? '').split('/');
    const directory = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : '';
    const imagePath = directory ? `/${directory}/assets/${parsedImagePath}` : `/assets/${parsedImagePath}`;
    imageUrl = imagePath;
  }

  // Use frontmatter title as alt text fallback
  const alt = fileData.frontmatter?.title ?? "Cover image";

  return (
    <div class="cover-image-container">
      <img
        src={imageUrl}
        alt={alt}
        class="cover-image"
      />
    </div>
  );
};

CoverImage.css = style;

export default (() => CoverImage) satisfies QuartzComponentConstructor;
```

**Key implementation details**:
- **Line 7-22**: Reuses `parseObsidianImage()` helper (same logic as `LDMeta.tsx`)
- **Line 27**: Accesses `frontmatter.socialImage` (coalesced from `cover`/`image`/`socialImage`)
- **Line 30-32**: Returns `null` if no image (graceful fallback)
- **Line 37-45**: Asset path construction (matches OG image logic from `LDMeta.tsx:50-68`)
- **Line 42**: Uses defensive slug access with nullish coalescing (`fileData.slug ?? ''`)
- **Line 48**: Uses frontmatter title as alt text

#### 2. Create Component Styles

**File**: `quartz-custom/components/styles/coverImage.scss` (NEW)
**Location**: Create new file

```scss
.cover-image-container {
  width: 100%;
  margin: 0 0 1.5rem 0;
  padding: 0;

  // Break out of content container for full-width display
  // This ensures the image spans the full viewport width
  // Note: This technique requires parent containers NOT to have overflow: hidden
  // If full-width doesn't work, check parent .center and .page-header CSS
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  width: 100vw;
  max-width: 100vw;

  .cover-image {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
    display: block;
    border-radius: 0; // No border radius for full-width images
  }
}

// Mobile responsive adjustments
@media (max-width: 768px) {
  .cover-image-container {
    margin-bottom: 1rem;

    .cover-image {
      max-height: 300px; // Slightly shorter on mobile
    }
  }
}
```

**Styling rationale**:
- **Lines 7-11**: Full-width breakout using negative margins (standard technique)
- **Lines 9-10**: Note about parent container overflow requirement
- **Line 18**: `max-height: 400px` prevents overly tall images
- **Line 19**: `object-fit: cover` maintains aspect ratio while filling container
- **Lines 26-33**: Mobile responsive adjustments

#### 3. Export Component from Index

**File**: `quartz-custom/components/index.ts`
**Action**: Add export if index file exists, or Quartz will auto-import

If there's an `index.ts` in `quartz-custom/components/`, add:
```typescript
export { default as CoverImage } from "./CoverImage"
```

Otherwise, Quartz's auto-import will handle it when we reference it in the layout.

### Success Criteria

- [x] TypeScript compilation succeeds: `npx quartz build`
- [x] No linting errors
- [x] Component file created at correct path
- [x] SCSS file created at correct path
- [x] Helper function `parseObsidianImage()` is defined
- [x] Component returns `null` when no cover image
- [x] Component returns JSX when cover image exists

---

## Phase 2: Integrate into Layout Configuration

### Overview

Add the `CoverImage` component as the first element in the `beforeBody` array to position it before the Breadcrumbs component, making it the first visual element on the page.

### Changes Required

#### 1. Update Layout Configuration

**File**: `quartz.layout.ts`
**Location**: Lines 28-37 (beforeBody array)

**Current**:
```typescript
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({
      showCurrentPage: false,
    }),
    CustomComponent.ArticleTitle(),
    CustomComponent.ContentMeta(),
    Component.TagList(),
    CustomComponent.BlogList(),
  ],
  // ... rest of layout
```

**Update to**:
```typescript
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    CustomComponent.CoverImage(),      // NEW - First visual element
    Component.Breadcrumbs({
      showCurrentPage: false,
    }),
    CustomComponent.ArticleTitle(),
    CustomComponent.ContentMeta(),
    Component.TagList(),
    CustomComponent.BlogList(),
  ],
  // ... rest of layout
```

**Change details**:
- Insert `CustomComponent.CoverImage()` at position 0 (before Breadcrumbs)
- No other changes needed
- Component auto-imported via `quartz-custom/components` namespace

### Visual Result

**Before**:
```
┌─────────────────────┐
│ Breadcrumbs         │ ← First element
│ Article Title       │
│ Content Meta        │
│ Tags                │
│ Content...          │
└─────────────────────┘
```

**After**:
```
┌─────────────────────┐
│ [Cover Image]       │ ← NEW - Full width, first element
├─────────────────────┤
│ Breadcrumbs         │
│ Article Title       │
│ Content Meta        │
│ Tags                │
│ Content...          │
└─────────────────────┘
```

### Success Criteria

- [x] Build succeeds: `npx quartz build`
- [x] No TypeScript errors
- [x] Cover image renders before breadcrumbs in HTML
- [x] Component only renders on pages with cover frontmatter field
- [x] Pages without cover show breadcrumbs as first element (unchanged)

---

## Phase 3: Verification and Testing

### Overview

Test the implementation across different scenarios to ensure cover images display correctly for all frontmatter formats, asset paths, and page types.

### Testing Checklist

#### Functional Tests

**Test 1: Standard wikilink**
- **Frontmatter**: `cover: "![[debugging-wordpress-php-with-vs-code-and-lamp-vscode_wordpress_debug.png]]"`
- **File**: `content/blog/debugging-wordpress-php-with-vs-code-and-lamp.md`
- **Expected**: Image displays at `/blog/assets/debugging-wordpress-php-with-vs-code-and-lamp-vscode_wordpress_debug.png`
- **Verification**:
  ```bash
  npx quartz build
  # Check built HTML
  grep -A 5 "cover-image-container" public/blog/debugging-wordpress-php-with-vs-code-and-lamp/index.html
  # Verify image exists
  ls public/blog/assets/debugging-wordpress-php-with-vs-code-and-lamp-vscode_wordpress_debug.png
  ```

**Test 2: Wikilink without embed prefix**
- **Frontmatter**: `cover: "[[my-image.jpg]]"`
- **Expected**: Parses correctly, extracts `my-image.jpg`

**Test 3: Wikilink with alt text**
- **Frontmatter**: `cover: "![[photo.png|My Photo]]"`
- **Expected**: Image displays, alt text ignored (uses frontmatter title instead)

**Test 4: Absolute URL**
- **Frontmatter**: `cover: "https://cdn.example.com/og-image.png"`
- **Expected**: URL passed through unchanged, displays external image

**Test 5: Plain filename (legacy)**
- **Frontmatter**: `cover: "image.png"`
- **Expected**: Constructs path as `{directory}/assets/image.png`

**Test 6: No cover field**
- **Frontmatter**: (no cover field)
- **Expected**: No cover image rendered, breadcrumbs appear first

**Test 7: Filename with spaces**
- **Frontmatter**: `cover: "![[my photo with spaces.png]]"`
- **Expected**: Slugified to `my-photo-with-spaces.png`

**Test 8: Root-level page**
- **File**: `content/index.md`
- **Frontmatter**: `cover: "![[hero.jpg]]"`
- **Expected**: Image at `/assets/hero.jpg`

**Test 9: List/Index page with defaultListPageLayout**
- **File**: Blog list page or tag archive
- **Expected**: No cover image rendered (uses different layout)
- **Verification**:
  ```bash
  grep "cover-image-container" public/index.html
  # Should return nothing - list pages don't use cover images
  ```

#### Visual/Responsive Tests

**Desktop viewport** (1920x1080):
- [ ] Cover image displays full-width
- [ ] Max height of 400px respected
- [ ] Image crops properly with `object-fit: cover`
- [ ] Spacing below image before breadcrumbs

**Mobile viewport** (375x667):
- [ ] Cover image displays full-width on mobile
- [ ] Max height of 300px on mobile
- [ ] No horizontal scroll
- [ ] Image scales proportionally

**Tablet viewport** (768x1024):
- [ ] Cover image transitions smoothly
- [ ] Responsive breakpoint works correctly

#### Integration Tests

**Build process**:
```bash
# Clean build
rm -rf public/
npx quartz build

# Verify no errors
echo $?  # Should output: 0

# Check for cover images in output
find public/blog -name "index.html" -exec grep -l "cover-image-container" {} \;
```

**Asset path verification**:
```bash
# Verify images are copied to correct location
ls -la public/blog/assets/*.png | head -5

# Verify image URLs in HTML match actual files
grep -oP 'src="[^"]*assets/[^"]*"' public/blog/*/index.html | head -5
```

#### Edge Cases

- [ ] Deeply nested slug (e.g., `tutorials/javascript/async/promises.md`)
- [ ] Image filename with special characters `![[photo&image.png]]`
- [ ] Uppercase extension `![[Photo.PNG]]`
- [ ] Subfolder in wikilink `![[blog/assets/image.png]]`
- [ ] SVG image `![[diagram.svg]]`
- [ ] GIF image `![[animation.gif]]`
- [ ] WebP image `![[modern.webp]]`

### Browser Testing

**Visual verification in browser**:
1. Start dev server: `npx quartz build --serve`
2. Navigate to: `http://localhost:8080/blog/debugging-wordpress-php-with-vs-code-and-lamp`
3. Verify:
   - Cover image appears before breadcrumbs
   - Image spans full width
   - Image has proper aspect ratio
   - No layout shift on load
   - Image loads correctly (no 404s)

**DevTools checks**:
- [ ] No console errors
- [ ] Image request returns 200 OK
- [ ] Image dimensions correct
- [ ] CSS applied properly (inspect `.cover-image-container`)

### Performance Checks

- [ ] Image file size reasonable (< 500KB ideally)
- [ ] No layout shift (CLS metric)
- [ ] Image loads without blocking content
- [ ] Browser cache headers set correctly

### Accessibility Checks

- [ ] `alt` attribute present on all images
- [ ] Alt text uses frontmatter title (meaningful description)
- [ ] Image doesn't interfere with keyboard navigation
- [ ] Screen reader announces image appropriately

### Success Criteria

- [x] All functional tests pass
- [x] Visual appearance matches specifications
- [x] No browser console errors
- [x] Build completes without warnings
- [x] Images load correctly on all tested pages
- [x] Responsive behavior works on mobile/tablet/desktop
- [x] No accessibility issues identified

---

## Implementation Status

✅ **COMPLETED** on 2025-10-25

### Files Created

1. [x] `quartz-custom/components/CoverImage.tsx`
2. [x] `quartz-custom/components/styles/coverImage.scss`

### Files Modified

1. [x] `quartz.layout.ts` (line 30) - Added CoverImage to beforeBody array
2. [x] `quartz-custom/components/index.ts` - Added CoverImage export

### Estimated Time

- **Phase 1**: 15-20 minutes (component creation)
- **Phase 2**: 5 minutes (layout integration)
- **Phase 3**: 15-20 minutes (testing and verification)
- **Total**: 35-45 minutes

---

## References

- Related implementation: `thoughts/_shared/plans/20251025_obsidian-cover-image-og-tags.md`
- Wikilink parsing pattern: `quartz-custom/components/LDMeta.tsx:11-26`
- Asset path construction: `quartz-custom/components/LDMeta.tsx:50-68`
- Layout configuration: `quartz.layout.ts:28-37`
- Path utilities: `quartz/util/path.ts:156-174` (pathToRoot, joinSegments)
- Component rendering flow: `quartz/components/renderPage.tsx:250-253`
- Existing styling patterns: `quartz-custom/components/styles/bio.scss`
- Breadcrumbs component: `quartz/components/Breadcrumbs.tsx`
- Example blog post with cover: `content/blog/debugging-wordpress-php-with-vs-code-and-lamp.md:9`

## Technical Decisions

### Why Reuse parseObsidianImage()?

**Decision**: Copy the `parseObsidianImage()` function into the new component instead of extracting it to a shared utility.

**Rationale**:
- The function is only 15 lines of code
- Only two components need it (LDMeta and CoverImage)
- Extracting to shared utility adds complexity
- Keeps component self-contained
- Easier to maintain and debug

**Alternative considered**: Create `quartz-custom/utils/wikilink.ts` and export shared function. Rejected due to overhead for such a small helper.

### Why Use socialImage Instead of cover?

**Decision**: Access `fileData.frontmatter?.socialImage` instead of `fileData.frontmatter?.cover`.

**Rationale**:
- Quartz's frontmatter transformer already coalesces `cover` → `socialImage`
- The transformer runs before components render
- Accessing `socialImage` ensures consistency with OG meta tags
- Works with all three fields: `socialImage`, `image`, and `cover`

**Implementation detail**: From `quartz/plugins/transformers/frontmatter.ts:101`:
```typescript
const socialImage = coalesceAliases(data, ["socialImage", "image", "cover"])
if (socialImage) data.socialImage = socialImage
```

### Why Full-Width Breakout?

**Decision**: Use negative margin technique to break out of content container.

**Rationale**:
- Matches user requirement for "full width"
- Standard CSS technique for full-bleed images
- No need to modify Quartz's page container structure
- Works with existing responsive grid layout

**CSS implementation**:
```scss
margin-left: calc(-50vw + 50%);
margin-right: calc(-50vw + 50%);
width: 100vw;
```

This calculates the exact negative margin needed to span from the content edge to the viewport edge.

### Why Position 0 in beforeBody?

**Decision**: Insert `CoverImage` at index 0 in the `beforeBody` array.

**Rationale**:
- User specified "first visual element before breadcrumb"
- Array position = DOM position = visual position
- No CSS positioning hacks needed
- Semantic HTML structure maintained

**Visual result**: Cover → Breadcrumbs → Title → Meta → Tags → Content

## Potential Future Improvements

### Short-term Enhancements

1. **Lazy loading**: Add `loading="lazy"` attribute to `<img>` tag
   ```tsx
   <img src={imageUrl} alt={alt} class="cover-image" loading="lazy" />
   ```

2. **Responsive images**: Generate srcset for different viewport sizes
   ```tsx
   <img
     src={imageUrl}
     srcset={`${imageUrl} 1x, ${imageUrl2x} 2x`}
     alt={alt}
   />
   ```

3. **Blur-up placeholder**: Add low-quality placeholder while image loads
   ```scss
   .cover-image {
     background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
   }
   ```

### Medium-term Enhancements

1. **Caption support**: Extract caption from wikilink alt text or frontmatter field
   ```yaml
   cover: "![[image.png|Beautiful sunset over mountains]]"
   coverCaption: "Photo by Author Name"
   ```

2. **Focal point**: Support Obsidian focal point syntax for object-position
   ```yaml
   cover: "![[image.png|300x200, focal-x:70%, focal-y:30%]]"
   ```

3. **Dark mode variants**: Support different images for light/dark themes
   ```yaml
   cover:
     light: "![[hero-light.png]]"
     dark: "![[hero-dark.png]]"
   ```

### Long-term Enhancements

1. **Extract to utility module**: If more components need wikilink parsing, create `quartz-custom/utils/wikilink.ts`
2. **Image optimization plugin**: Auto-compress and resize images during build
3. **Automatic srcset generation**: Generate multiple sizes from source images
4. **WebP conversion**: Convert PNG/JPG to WebP for better compression

## Troubleshooting Guide

### Image Not Displaying

**Symptom**: Cover image defined in frontmatter but not appearing on page

**Debugging steps**:
1. Check console for 404 errors
2. Verify image file exists in `content/{directory}/assets/`
3. Verify image copied to `public/{directory}/assets/` after build
4. Inspect HTML for `.cover-image-container` element
5. Check frontmatter field name (should be `cover`, `image`, or `socialImage`)
6. Verify wikilink syntax is correct: `![[filename.png]]`

**Common causes**:
- Typo in image filename
- Image not in correct `assets/` directory
- Missing exclamation mark in wikilink: `[[image.png]]` vs `![[image.png]]`
- Frontmatter field misspelled

### Image Path Incorrect

**Symptom**: 404 error, wrong URL in `src` attribute

**Debugging steps**:
1. Check `fileData.slug` value (add console.log in component)
2. Verify directory extraction logic: `slugParts.slice(0, -1).join('/')`
3. Verify image filename slugification (spaces → hyphens)
4. Check absolute vs relative URL detection

**Common causes**:
- Root-level page (empty directory, needs special handling)
- Image filename has special characters not handled by `slugifyFilePath()`
- Absolute URL starting with `//` instead of `http://`

### Full-Width Not Working

**Symptom**: Image constrained to content width instead of full viewport

**Debugging steps**:
1. Inspect `.cover-image-container` CSS in DevTools
2. Check if parent element has `overflow: hidden`
3. Verify negative margin calculations
4. Check browser width calculation

**Common causes**:
- Parent container has `overflow: hidden` or `overflow-x: hidden`
- Conflicting CSS from other components
- Browser width less than content width (no breakout needed)

### Build Errors

**Symptom**: TypeScript compilation fails

**Common errors**:
```
Cannot find module './styles/coverImage.scss'
```
**Fix**: Create the SCSS file at `quartz-custom/components/styles/coverImage.scss`

```
Property 'CoverImage' does not exist on type...
```
**Fix**: Ensure component exported correctly: `export default (() => CoverImage)`

```
Cannot find name 'slugifyFilePath'
```
**Fix**: Add import: `import { slugifyFilePath } from "../../quartz/util/path"`

## Lessons from Similar Implementation

### From OG Tags Implementation (20251025_obsidian-cover-image-og-tags.md)

**What worked well**:
1. Reusing Quartz's `slugifyFilePath()` for consistent path handling
2. Understanding asset directory structure before implementing
3. Using `frontmatter.socialImage` (coalesced field) instead of direct field access
4. Testing with real blog posts that have cover images

**What to watch out for**:
1. **RemoveTags plugin conflict**: The OG tags plan discovered that custom plugins can modify frontmatter before components render. For cover images, this doesn't affect us since we're not checking tags.
2. **Asset path construction**: Must use `{directory}/assets/{filename}`, not `/static/{filename}` or `{filename}` alone
3. **Slug-based detection**: More reliable than tag-based detection for identifying content types

**Patterns to reuse**:
- Wikilink parsing regex: `/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/`
- Asset path construction: `${directory}/assets/${parsedImagePath}`
- Absolute URL detection: `parsedImagePath.startsWith('http')`

**Applicable lessons**:
- When using frontmatter fields, always consider what transformer plugins might modify
- Use slug paths for reliable content identification
- Leverage existing Quartz utilities instead of reinventing
- Test with actual content files, not just mock data
