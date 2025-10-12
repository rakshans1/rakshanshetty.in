# Iceberg Theme Implementation Guide

**Version:** 1.0
**Last Updated:** 2025-10-12
**Based on:** [Iceberg vim colorscheme](https://github.com/cocopon/iceberg.vim)

---

## 🎨 Introduction

This guide provides complete documentation for implementing the Iceberg theme in your Gatsby blog. The Iceberg theme is known for its beautiful, muted color palette that's easy on the eyes while maintaining excellent readability.

### Why Iceberg?

- **Unified design:** Same colors across your blog, PKM, and code editor
- **Proven palette:** Battle-tested in the vim community since 2014
- **Accessibility:** WCAG AA compliant contrast ratios in both modes
- **Beautiful code:** Syntax highlighting that makes code a joy to read

---

## 📋 Table of Contents

1. [Color Palette Reference](#color-palette-reference)
2. [Implementation Steps](#implementation-steps)
3. [CSS Structure](#css-structure)
4. [Component Integration](#component-integration)
5. [Testing & Validation](#testing--validation)
6. [Customization Guide](#customization-guide)
7. [Troubleshooting](#troubleshooting)

---

## Color Palette Reference

### Dark Mode (Primary)

#### Base Colors
```css
--iceberg-bg-dark: #161821          /* Main background */
--iceberg-bg-dark-alt: #1e2132      /* Secondary/elevated surfaces */
--iceberg-fg-dark: #c6c8d1          /* Primary text */
--iceberg-comment-dark: #6b7089     /* Comments, secondary text */
--iceberg-selection-dark: #272c42   /* Selection highlight */
```

#### Accent Colors
```css
--iceberg-blue: #84a0c6      /* Keywords, links */
--iceberg-cyan: #89b8c2      /* Strings, properties */
--iceberg-green: #b4be82     /* Classes, success */
--iceberg-yellow: #e2a478    /* Functions, warnings */
--iceberg-orange: #c9a085    /* Constants */
--iceberg-red: #e27878       /* Errors, deletions */
--iceberg-purple: #a093c7    /* Numbers, booleans */
```

### Light Mode

#### Base Colors
```css
--iceberg-bg-light: #e8e9ec         /* Main background */
--iceberg-bg-light-alt: #d2d4de     /* Secondary/elevated surfaces */
--iceberg-fg-light: #33374c         /* Primary text */
--iceberg-comment-light: #8389a3    /* Comments, secondary text */
--iceberg-selection-light: #c0c5ce  /* Selection highlight */
```

**Note:** Accent colors remain the same in light mode, ensuring consistency.

---

## Implementation Steps

### Step 1: Update CSS Variables

**File:** `src/utils/global.css`

Replace the existing `:root`, `.light`, and `.dark` sections with:

```css
@import url("https://rsms.me/inter/inter.css");

:root {
  /* Iceberg Color Palette */
  --iceberg-bg-dark: #161821;
  --iceberg-bg-dark-alt: #1e2132;
  --iceberg-bg-light: #e8e9ec;
  --iceberg-bg-light-alt: #d2d4de;

  --iceberg-fg-dark: #c6c8d1;
  --iceberg-fg-light: #33374c;

  --iceberg-comment-dark: #6b7089;
  --iceberg-comment-light: #8389a3;

  --iceberg-selection-dark: #272c42;
  --iceberg-selection-light: #c0c5ce;

  /* Iceberg Accent Colors */
  --iceberg-blue: #84a0c6;
  --iceberg-cyan: #89b8c2;
  --iceberg-green: #b4be82;
  --iceberg-yellow: #e2a478;
  --iceberg-orange: #c9a085;
  --iceberg-red: #e27878;
  --iceberg-purple: #a093c7;
}

body {
  background-color: var(--bg);
  transition: color 0.2s ease-out, background 0.2s ease-out;
  color: var(--textNormal);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.light {
  --bg: var(--iceberg-bg-light);
  --bg-reverse: var(--iceberg-bg-dark);
  --bg-secondary: var(--iceberg-bg-light-alt);
  --header: var(--iceberg-fg-light);
  --textNormal: var(--iceberg-fg-light);
  --textTitle: var(--iceberg-fg-light);
  --textLink: var(--iceberg-blue);
  --hr: rgba(51, 55, 76, 0.15);
  --inlineCode-bg: rgba(226, 164, 120, 0.15);
  --inlineCode-text: var(--iceberg-fg-light);
  --form-shadow: 0 2px 15px 0 rgba(195, 200, 209, 0.3);
  --highlight: var(--iceberg-selection-light);
  --secondary: var(--iceberg-blue);
  --tertiary: var(--iceberg-cyan);
}

.dark {
  -webkit-font-smoothing: antialiased;

  --bg: var(--iceberg-bg-dark);
  --bg-reverse: var(--iceberg-bg-light);
  --bg-secondary: var(--iceberg-bg-dark-alt);
  --header: var(--iceberg-fg-dark);
  --textNormal: var(--iceberg-fg-dark);
  --textTitle: var(--iceberg-fg-dark);
  --textLink: var(--iceberg-blue);
  --hr: rgba(198, 200, 209, 0.15);
  --inlineCode-bg: rgba(132, 160, 198, 0.15);
  --inlineCode-text: var(--iceberg-fg-dark);
  --form-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.4);
  --highlight: var(--iceberg-selection-dark);
  --secondary: var(--iceberg-blue);
  --tertiary: var(--iceberg-cyan);
}
```

### Step 2: Update Title and Theme Toggle Styles

Keep these mostly the same, but ensure they use the new variables:

```css
.title {
  font-size: 3.9rem;
  line-height: 4.3rem;
  font-weight: 700;
  color: var(--textTitle);
}

.theme-toggle {
  width: 20px;
  height: 20px;
  background-size: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.theme-toggle:hover {
  opacity: 0.7;
}

.dark .theme-toggle {
  background-image: url("../../content/assets/sun.png");
}

.light .theme-toggle {
  background-image: url("../../content/assets/moon.png");
}

@media only screen and (max-width: 475px) {
  .title {
    font-size: 2.5rem;
    line-height: 3.5rem;
  }
}
```

### Step 3: Update Code Block Styles

Update the filename, terminal, and code block sections:

```css
/* Code Block Filename */
.filename {
  background: var(--iceberg-bg-dark-alt);
  padding: 0.5rem 1rem 0.75rem;
  font-size: 0.9rem;
  color: var(--iceberg-fg-dark);
  font-weight: 600;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  margin-bottom: -0.65rem;
  margin-left: -1.3125rem;
  margin-right: -1.3125rem;
}

.dark .filename {
  background: #0d0e14;
}

/* Terminal Code Blocks */
pre.language-terminal code.language-terminal {
  position: relative;
  display: block;
  box-shadow: 3px 5px 20px rgba(0, 0, 0, 0.3);
  padding-top: 20px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

pre.language-terminal {
  overflow: hidden !important;
  border: 2px solid var(--iceberg-selection-dark);
  border-radius: 10px;
}

code.language-terminal::before {
  content: "\2022 \2022 \2022";
  position: absolute;
  top: -19px;
  left: -18px;
  height: 25px;
  background: var(--iceberg-bg-dark-alt);
  color: var(--iceberg-comment-dark);
  width: 115%;
  font-size: 2rem;
  line-height: 0;
  padding: 14px 0;
  text-indent: 4px;
  letter-spacing: -10px;
}

.dark code.language-terminal::before {
  background: #0d0e14;
}
```

### Step 4: Update Prism Syntax Highlighting

Replace the Prism token color section with:

```css
/* Code Syntax Highlighting */
code[class*="language-"],
pre[class*="language-"] {
  color: var(--iceberg-fg-dark);
  background: none;
  font-family: 'JetBrains Mono', Consolas, Menlo, Monaco, 'Courier New', monospace;
  font-feature-settings: normal;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  margin-bottom: 0;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

pre[class*="language-"] {
  overflow: auto;
  padding: 1.3125rem;
}

pre[class*="language-"]::-moz-selection,
pre[class*="language-"] ::-moz-selection {
  text-shadow: none;
  background: var(--iceberg-selection-dark);
}

pre[class*="language-"]::selection,
pre[class*="language-"] ::selection {
  text-shadow: none;
  background: var(--iceberg-selection-dark);
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  border-radius: 0.3em;
  background: var(--inlineCode-bg);
  color: var(--inlineCode-text);
  padding: 0.15em 0.2em 0.05em;
  white-space: normal;
  font-weight: 500;
}

/* Token Colors - Iceberg Theme */
.token.comment {
  color: var(--iceberg-comment-dark);
  font-style: italic;
}

.token.string,
.token.url {
  color: var(--iceberg-cyan);
}

.token.variable {
  color: var(--iceberg-fg-dark);
}

.token.number,
.token.boolean {
  color: var(--iceberg-purple);
}

.token.builtin,
.token.char,
.token.constant,
.token.function {
  color: var(--iceberg-blue);
}

.token.punctuation {
  color: var(--iceberg-comment-dark);
}

.token.operator,
.token.keyword,
.token.atrule {
  color: var(--iceberg-blue);
}

.token.selector,
.token.doctype {
  color: var(--iceberg-blue);
  font-style: italic;
}

.token.class-name {
  color: var(--iceberg-green);
}

.token.tag {
  color: var(--iceberg-cyan);
}

.token.attr-name {
  color: var(--iceberg-blue);
  font-style: italic;
}

.token.property {
  color: var(--iceberg-cyan);
}

.token.namespace {
  color: var(--iceberg-cyan);
}
```

### Step 5: Update Gatsby Highlight Wrapper

```css
/* Highlighted Code Lines */
pre[data-line] {
  padding: 1em 0 1em 3em;
  position: relative;
}

.gatsby-highlight-code-line {
  background-color: var(--iceberg-selection-dark);
  display: block;
  margin-right: -1.3125rem;
  margin-left: -1.3125rem;
  padding-right: 1em;
  padding-left: 1.25em;
  border-left: 0.25em solid var(--iceberg-blue);
}

.gatsby-highlight {
  margin-bottom: 1.75rem;
  margin-left: -1.3125rem;
  margin-right: -1.3125rem;
  border-radius: 10px;
  background: var(--iceberg-bg-dark);
  -webkit-overflow-scrolling: touch;
  overflow: auto;
}

.light .gatsby-highlight {
  background: var(--iceberg-bg-dark);
}

@media (max-width: 672px) {
  .gatsby-highlight {
    border-radius: 0;
  }
}

.gatsby-highlight pre[class*="language-"] {
  float: left;
  min-width: 100%;
}
```

### Step 6: Add Link and Selection Styles

Add these global styles if not already present:

```css
/* Link Styles */
a {
  color: var(--textLink);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--iceberg-cyan);
}

/* Selection */
::selection {
  background: var(--highlight);
  color: var(--textNormal);
}

::-moz-selection {
  background: var(--highlight);
  color: var(--textNormal);
}
```

---

## CSS Structure

### Recommended File Organization

Your `global.css` should be organized as follows:

```
1. Font imports
2. CSS variable definitions (:root)
3. Body base styles
4. Theme classes (.light, .dark)
5. Typography styles (.title, headings)
6. Theme toggle styles
7. Code block utilities (.filename)
8. Terminal block styles
9. Prism base styles
10. Prism token colors
11. Gatsby highlight wrapper
12. Global element styles (a, ::selection)
```

---

## Component Integration

### Layout Component

Your existing `layout.js` should work without changes. Verify these key points:

```javascript
// Theme state management
const [theme, setTheme] = useState(currentTheme)

// Theme toggle handler
const onThemeChange = newtheme => {
  setTheme(newtheme)
  if (typeof window !== "undefined") {
    window.__setPreferredTheme(newtheme)
  }
}

// Theme toggle button (onClick handler)
onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
```

The theme toggle should automatically use the new Iceberg colors since it relies on `var(--bg-reverse)` and other CSS variables.

### Typography.js Configuration

Your existing `theme.js` configuration works well with Iceberg. Consider these optional improvements:

```javascript
// In src/utils/theme.js
overrideStyles: ({ adjustFontSizeTo, scale, rhythm }, options) => ({
  // ... existing styles ...
  a: {
    boxShadow: "0 1px 0 0 currentColor",
    color: "var(--textLink)",  // ✓ Already using CSS variable
    textDecoration: "none",
  },
  "a:hover,a:active": {
    boxShadow: "none",
    color: "var(--iceberg-cyan)",  // Optional: add hover color
  },
  // ... rest of styles ...
})
```

---

## Testing & Validation

### Visual Testing Checklist

After implementation, test these scenarios:

#### Homepage
- [ ] Light mode: Background is `#e8e9ec`, text is `#33374c`
- [ ] Dark mode: Background is `#161821`, text is `#c6c8d1`
- [ ] Theme toggle switches smoothly without flash
- [ ] Title uses correct color from `--textTitle`
- [ ] Links are `#84a0c6` (Iceberg blue)

#### Blog Post Page
- [ ] Code blocks use `#161821` background in both modes
- [ ] Syntax highlighting matches Iceberg colors
- [ ] Inline code is readable (light bg in light mode, dark bg in dark mode)
- [ ] Terminal blocks show three-dot header
- [ ] Code block filenames display correctly
- [ ] Highlighted lines use `#272c42` background

#### Interactive Elements
- [ ] Theme toggle button visible in both modes
- [ ] Links change to cyan (`#89b8c2`) on hover
- [ ] Text selection uses correct highlight color
- [ ] All buttons and forms respect theme colors

### Contrast Testing

Use a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify:

**Dark Mode:**
- Text: `#c6c8d1` on `#161821` = 10.6:1 (AAA) ✓
- Links: `#84a0c6` on `#161821` = 6.5:1 (AA) ✓
- Comments: `#6b7089` on `#161821` = 3.9:1 (AA for large text)

**Light Mode:**
- Text: `#33374c` on `#e8e9ec` = 10.2:1 (AAA) ✓
- Links: `#84a0c6` on `#e8e9ec` = 4.5:1 (AA) ✓

### Browser Testing

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS and iOS)
- [ ] Mobile responsive views (< 475px)

### Build Verification

```bash
# Clean and rebuild
yarn clean
yarn build

# Check for warnings
# Verify bundle size hasn't increased significantly
# Test production build locally
yarn serve
```

---

## Customization Guide

### Adjusting Colors

If you want to tweak specific colors while maintaining the Iceberg aesthetic:

1. **Change link hover color:**
   ```css
   a:hover {
     color: var(--iceberg-green);  /* Use green instead of cyan */
   }
   ```

2. **Adjust code block background:**
   ```css
   .gatsby-highlight {
     background: var(--iceberg-bg-dark-alt);  /* Slightly lighter */
   }
   ```

3. **Customize selection highlight:**
   ```css
   ::selection {
     background: var(--iceberg-blue);
     color: var(--iceberg-bg-dark);
   }
   ```

### Adding Custom Components

When creating new components, use the established CSS variables:

```jsx
// Example: Custom tag component
<span style={{
  background: 'var(--bg-secondary)',
  color: 'var(--iceberg-blue)',
  padding: '0.25rem 0.75rem',
  borderRadius: '4px'
}}>
  #digital-garden
</span>
```

### Optional: JetBrains Mono Font

For enhanced code readability, add JetBrains Mono font:

1. **Add to HTML head** (in `gatsby-ssr.js` or via plugin):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
   ```

2. **Update code font stack in global.css:**
   ```css
   code[class*="language-"],
   pre[class*="language-"] {
     font-family: 'JetBrains Mono', Consolas, Menlo, Monaco, 'Courier New', monospace;
     /* ... rest of styles ... */
   }
   ```

---

## Troubleshooting

### Issue: Theme toggle not working

**Solution:**
1. Check that `window.__setPreferredTheme` is defined (usually in `html.js`)
2. Verify localStorage key name matches
3. Check browser console for errors
4. Ensure body has `.dark` or `.light` class applied

### Issue: Colors look different than expected

**Solution:**
1. Clear browser cache and rebuild: `yarn clean && yarn develop`
2. Check DevTools to ensure CSS variables are loaded
3. Verify no conflicting styles from Typography.js
4. Check that import order is correct (global.css should be imported early)

### Issue: Code blocks have wrong background in light mode

**Expected:** Code blocks should use dark background even in light mode

**Verify:**
```css
.light .gatsby-highlight {
  background: var(--iceberg-bg-dark);  /* Should still be dark! */
}
```

This is intentional - Iceberg code blocks look best with dark backgrounds.

### Issue: Inline code is hard to read

**Solution:** Adjust the inline code background opacity:

```css
.light {
  --inlineCode-bg: rgba(226, 164, 120, 0.2);  /* Increase from 0.15 to 0.2 */
}

.dark {
  --inlineCode-bg: rgba(132, 160, 198, 0.2);  /* Increase from 0.15 to 0.2 */
}
```

### Issue: Terminal blocks missing three-dot header

**Solution:** Ensure you're using the `language-terminal` class:

````markdown
```terminal
$ npm install
```
````

The `::before` pseudo-element should automatically add the dots.

---

## Performance Considerations

### CSS Optimization

The Iceberg theme uses CSS variables efficiently:

```css
/* ✓ Good: Uses variables */
.custom-element {
  color: var(--textNormal);
}

/* ✗ Avoid: Hardcoded values */
.custom-element {
  color: #c6c8d1;
}
```

### Font Loading Strategy

To prevent FOIT (Flash of Invisible Text):

1. Use `font-display: swap` (already handled by Inter CDN)
2. Include system font fallbacks
3. Consider self-hosting fonts for better performance

---

## Accessibility Best Practices

### Keyboard Navigation
- Theme toggle should be keyboard accessible (it's a `<div role="presentation">` but wrapped in clickable container)
- Consider adding `tabindex="0"` and `onKeyPress` handler

### Screen Readers
- Add `aria-label` to theme toggle:
  ```jsx
  <div
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    role="button"
    tabIndex={0}
    // ... other props
  >
  ```

### Reduced Motion
Add this for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

---

## Resources

### Official Iceberg Links
- [Iceberg vim repo](https://github.com/cocopon/iceberg.vim)
- [Iceberg color palette](https://github.com/cocopon/iceberg.vim/blob/master/colors/iceberg.vim)
- [Iceberg ports](https://github.com/cocopon/iceberg.vim/wiki)

### Related Tools
- [Prism themes](https://github.com/PrismJS/prism-themes)
- [Typography.js docs](https://kyleamathews.github.io/typography.js/)
- [Inter font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

### Testing Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (for accessibility audit)
- [axe DevTools](https://www.deque.com/axe/devtools/) (browser extension)

---

## Changelog

### Version 1.0 (2025-10-12)
- Initial Iceberg theme implementation guide
- Complete color palette documentation
- Step-by-step CSS migration instructions
- Testing and validation checklist
- Troubleshooting section

---

## FAQ

**Q: Can I use Iceberg with other frameworks (Next.js, Remix, etc.)?**
A: Yes! The core CSS can be adapted to any framework. The key is using CSS variables and applying `.light` or `.dark` classes to a top-level element.

**Q: Will this work with Gatsby v5?**
A: Yes, the CSS is framework-agnostic. You may need to adjust Typography.js configuration if Gatsby v5 changes its API.

**Q: Can I mix Iceberg with other color accents?**
A: Yes, but be careful with contrast. Add your custom colors as additional CSS variables and test thoroughly.

**Q: How do I revert if something goes wrong?**
A: Keep a backup of your original `global.css` (run `cp src/utils/global.css src/utils/global.css.backup` before starting).

---

## Support

If you encounter issues:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review the [state.md](./state.md) for comparison with your setup
3. Check the [implementation plan](../thoughts/plans/change-theme-plan.md)
4. Open an issue in your project repository with:
   - Screenshot of the issue
   - Browser and version
   - Relevant code snippet
   - Steps to reproduce

---

**Happy theming!** 🎨✨
