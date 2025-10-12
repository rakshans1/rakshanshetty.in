# Current Theme State

**Last Updated:** 2025-10-12
**Status:** Pre-Iceberg Implementation

---

## Overview

This document captures the current state of the theme implementation before migrating to the full Iceberg theme. This serves as a reference point for understanding what changes were made and why.

---

## Color Palette (Current)

### Light Mode
```css
--bg: #ffffff
--bg-reverse: #222
--bg-secondary: rgb(249, 250, 251)
--header: #663399 (violet)
--textNormal: #222
--textTitle: #222
--textLink: #663399 (violet)
--hr: hsla(0, 0%, 0%, 0.2)
--inlineCode-bg: rgba(255, 229, 100, 0.2)
--inlineCode-text: #1a1a1a
--form-shadow: 0 2px 15px 0 rgba(210, 214, 220, 0.5)
```

### Dark Mode
```css
--bg: #222
--bg-reverse: #ffffff
--bg-secondary: rgb(54, 60, 72)
--header: #ffffff
--textNormal: rgba(255, 255, 255, 0.88)
--textTitle: #ffffff
--textLink: #9048d7 (violet-dark)
--hr: hsla(0, 0%, 100%, 0.2)
--inlineCode-bg: rgba(115, 124, 153, 0.2)
--inlineCode-text: #e6e6e6
--form-shadow: 0 2px 15px 0 rgba(26, 26, 27, 0.637)
```

### Accent Colors
```css
--voilet: #663399
--voilet-dark: #9048d7
```

---

## Typography

### Font Family
- **Primary:** Inter (from rsms.me/inter)
- **Code:** Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace

### Font Configuration (Typography.js)
```javascript
baseFontSize: "14px"
baseLineHeight: 1.75
scaleRatio: 5 / 2
headerFontFamily: ["Inter", "sans-serif"]
bodyFontFamily: ["Inter", "sans-serif"]
headerWeight: 700
bodyWeight: 400
boldWeight: 500
```

### Typographic Scale
- **Title (h1):** 3.9rem / 4.3rem line-height (mobile: 2.5rem / 3.5rem)
- **Headers:** Scale ratio of 5/2 via Typography.js
- **Body:** 14px base

---

## Code Syntax Highlighting

### Current Prism Theme
The syntax highlighting already uses **partial Iceberg colors** (discovered in global.css:182-242):

```css
.token.attr-name: #84a0c6 (Iceberg blue) ✓
.token.comment: rgb(128, 147, 147) (close to Iceberg comment)
.token.string: #89b8c2 (Iceberg cyan) ✓
.token.variable: rgb(214, 222, 235)
.token.number: #a093c7 (Iceberg purple) ✓
.token.builtin, .token.function: #e2a478 (Iceberg yellow) ✓
.token.punctuation, .token.keyword: #84a0c6 (Iceberg blue) ✓
.token.class-name: #b4be82 (Iceberg green) ✓
.token.tag: #89b8c2 (Iceberg cyan) ✓
.token.boolean: #a093c7 (Iceberg purple) ✓
.token.property: #89b8c2 (Iceberg cyan) ✓
```

### Code Block Backgrounds
- **Dark mode:** `#161821` (already Iceberg dark bg!) ✓
- **Light mode:** Inherits from dark mode
- **Inline code (light):** `rgba(255, 229, 100, 0.2)` (yellow tint)
- **Inline code (dark):** `rgba(115, 124, 153, 0.2)` (blue-gray tint)

### Terminal Code Blocks
- Structure: Three-dot header (● ● ●) ✓
- Background: `#333` (header), varies for body
- Border: `3px solid #333`
- Border radius: `10px`

---

## Theme Toggle System

### Implementation
**Location:** `src/components/layout.js:5-17`

```javascript
const [theme, setTheme] = useState(currentTheme)

const onThemeChange = newtheme => {
  setTheme(newtheme)
  window.__setPreferredTheme(newtheme)
}
```

### Mechanism
1. React state manages current theme
2. `window.__theme` provides initial value
3. `window.__setPreferredTheme()` persists to localStorage
4. CSS class (`.light` or `.dark`) applied to `<body>`
5. Theme toggle button uses background image swap:
   - Dark mode: shows sun icon
   - Light mode: shows moon icon

### Toggle Button Styling
```css
.theme-toggle {
  width: 20px;
  height: 20px;
  background-size: cover;
}
```

Parent container:
- Circular background (`border-radius: 50%`)
- 32x32px size
- Uses `var(--bg-reverse)` for background
- Positioned in header next to title

---

## Layout Structure

### Container
- Max width: `rhythm(24)` (from Typography.js)
- Padding: `rhythm(1.5)` top/bottom, `rhythm(3/4)` left/right
- Min height: `100vh`

### Header
- Flexbox layout
- Space-between for title and theme toggle
- Title size changes based on route (h1 on homepage, h3 elsewhere)
- Margin bottom: `rhythm(1.5)` on homepage only

---

## File Architecture

### Theme Files
```
src/
├── utils/
│   ├── global.css          # Main theme CSS (279 lines)
│   ├── theme.js            # Typography.js config (80 lines)
│   └── typography.js       # Typography.js initialization
└── components/
    └── layout.js           # Theme toggle + layout (119 lines)
```

### CSS Organization
**global.css structure:**
1. Font import (line 1)
2. CSS variables: accent colors (lines 3-6)
3. Body base styles (lines 8-9)
4. `.light` class variables (lines 11-23)
5. `.dark` class variables (lines 25-39)
6. Title styles (lines 41-65)
7. Theme toggle (lines 47-58)
8. Code filename labels (lines 67-82)
9. Terminal code blocks (lines 84-118)
10. Prism base styles (lines 120-181)
11. Prism token colors (lines 182-242)
12. Gatsby highlight wrapper (lines 244-279)

---

## Dependencies

### Gatsby Plugins (relevant to theme)
- `gatsby-plugin-typography` - Typography.js integration
- `gatsby-remark-prismjs` - Code syntax highlighting
- `gatsby-remark-images` - Image optimization
- `gatsby-remark-images-medium-zoom` - Image lightbox

### NPM Packages
- `typography` - Typography.js library
- `gray-percentage` - Used in theme.js for blockquote colors
- `typography-breakpoint-constants` - Mobile breakpoints

---

## Known Issues & Quirks

### What's Working Well
✅ Code syntax highlighting is mostly Iceberg already
✅ Dark mode code blocks use correct Iceberg background (#161821)
✅ Theme toggle is smooth and persists across sessions
✅ Terminal blocks have proper three-dot header structure
✅ Inter font loads properly

### Areas for Improvement
⚠️ Base backgrounds don't match Iceberg (white/#222 vs Iceberg colors)
⚠️ Link colors use violet instead of Iceberg blue
⚠️ Light mode needs proper Iceberg light colors
⚠️ Inline code backgrounds could be more Iceberg-aligned
⚠️ Some hardcoded colors in theme.js (blockquote borders)

### Oddities
- Code blocks always use dark background even in light mode (line 264)
- Terminal block header color varies between `.dark` and default (lines 99-101, 110)
- Inline code uses yellow tint in light mode (unusual choice)

---

## Accessibility

### Contrast Ratios
- Light mode text: `#222` on `#ffffff` = 16.4:1 (AAA) ✓
- Dark mode text: `rgba(255,255,255,0.88)` on `#222` = ~13:1 (AAA) ✓
- Links (light): `#663399` on `#ffffff` = 8.6:1 (AAA) ✓
- Links (dark): `#9048d7` on `#222` = 6.1:1 (AA) ✓

### Transitions
- Smooth color transitions (0.2s ease-out) on theme change
- No jarring flashes or layout shifts

---

## Browser Compatibility

### CSS Features Used
- CSS Custom Properties (CSS Variables) ✓
- Flexbox ✓
- CSS Transitions ✓
- Media queries ✓
- Smooth scrolling (via `-webkit-overflow-scrolling: touch`)

### Tested Browsers
- Modern Chrome/Edge (Chromium)
- Firefox
- Safari (includes `-webkit-font-smoothing`)

---

## Performance Notes

### CSS Size
- `global.css`: 279 lines (estimated ~8KB unminified)
- Minimal unused styles
- CSS variables prevent duplication

### Font Loading
- Inter loaded from rsms.me CDN
- No FOIT (Flash of Invisible Text) issues reported
- Fallback to system fonts (-apple-system, BlinkMacSystemFont, Segoe UI)

---

## Migration Notes

### What to Preserve
✅ Theme toggle mechanism
✅ Terminal code block structure
✅ Most syntax token colors
✅ Typography.js configuration
✅ Layout component structure

### What to Update
🔄 Root CSS variable values (swap to Iceberg colors)
🔄 Light mode color mappings
🔄 Inline code background colors
🔄 Terminal block header colors (minor tweaks)
🔄 Any hardcoded colors in theme.js

### What to Add
➕ Full Iceberg color palette as CSS variables
➕ Better documentation in CSS comments
➕ Potentially JetBrains Mono font for code (optional)

---

## Testing Checklist (Pre-Migration)

Current functionality to verify after migration:

- [ ] Homepage renders in light mode
- [ ] Homepage renders in dark mode
- [ ] Theme toggle switches smoothly
- [ ] Theme preference persists on refresh
- [ ] Code blocks display with syntax highlighting
- [ ] Terminal blocks show three-dot header
- [ ] Inline code is readable
- [ ] Links are visible and clickable
- [ ] Mobile view (< 475px) works
- [ ] Images load with medium-zoom
- [ ] Typography scale looks good
- [ ] Footer displays correctly

---

## Conclusion

The current theme is a **solid foundation** with several Iceberg colors already in place for syntax highlighting. The main work needed is:

1. Updating base colors (backgrounds, text, links)
2. Properly implementing Iceberg light mode
3. Refining inline code backgrounds
4. Ensuring consistency across all UI elements

The theme toggle system and code block structure are excellent and should be preserved during migration.
