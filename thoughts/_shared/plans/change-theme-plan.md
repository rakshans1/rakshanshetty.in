# Iceberg Theme Implementation Plan

**Date:** 2025-10-12
**Status:** Planning
**Goal:** Transition blog from current violet/gray theme to unified Iceberg theme

---

## Current State Analysis

### Existing Theme Setup
- **Current colors:** Violet accent (#663399, #9048d7) with basic light/dark backgrounds
- **Typography:** Inter font via Typography.js
- **Theme toggle:** React state-based system with localStorage persistence
- **Code highlighting:** Already uses partial Iceberg colors (identified in global.css:182-242)
- **Files involved:**
  - `src/utils/global.css` - Main theme CSS with CSS variables
  - `src/utils/theme.js` - Typography.js configuration
  - `src/components/layout.js` - Theme toggle component

### What's Working Well
✅ Code syntax highlighting already uses some Iceberg colors
✅ Theme toggle mechanism is functional
✅ CSS custom properties for easy theme switching
✅ Inter font is consistent with Iceberg theme goals

### What Needs Updating
❌ Base colors (background, foreground) don't match Iceberg
❌ Link colors still use violet instead of Iceberg blue
❌ Missing proper Iceberg light mode colors
❌ Terminal code blocks need refinement
❌ Inline code background colors need adjustment

---

## Proposed Changes

### Phase 1: Color System Update
**File:** `src/utils/global.css`

1. **Add Iceberg CSS Variables** (lines 1-20)
   - Add all Iceberg color definitions to `:root`
   - Keep existing structure but swap values

2. **Update `.light` class** (lines 11-23)
   ```css
   --bg: #e8e9ec (was #ffffff)
   --textNormal: #33374c (was #222)
   --textLink: #84a0c6 (was violet)
   --inlineCode-bg: rgba(226, 164, 120, 0.15)
   ```

3. **Update `.dark` class** (lines 25-39)
   ```css
   --bg: #161821 (was #222)
   --bg-secondary: #1e2132 (was rgb(54, 60, 72))
   --textNormal: #c6c8d1 (was rgba(255, 255, 255, 0.88))
   --textLink: #84a0c6 (was violet-dark)
   ```

### Phase 2: Code Block Refinement
**File:** `src/utils/global.css` (lines 67-279)

1. **Terminal blocks** - Already good structure, update colors to exact Iceberg
2. **Syntax tokens** - Already mostly Iceberg, ensure consistency
3. **Code block backgrounds** - Use `#161821` for dark mode consistently
4. **Selection highlights** - Use `#272c42` for dark, `#c0c5ce` for light

### Phase 3: Typography Adjustments
**File:** `src/utils/theme.js`

- Keep Inter font (✓ compatible with Iceberg)
- Ensure link colors use `var(--textLink)`
- Update any hardcoded colors to use CSS variables

### Phase 4: Layout Component
**File:** `src/components/layout.js`

- Verify theme toggle still works
- Test that CSS variables update properly
- Ensure smooth transitions

---

## Implementation Strategy

### Step-by-Step Execution

1. **Create documentation** ✓
   - [ ] Create `docs/state.md` - Document current theme state
   - [ ] Create `docs/theme-guide.md` - Implementation guide from HTML artifact

2. **Backup current theme**
   ```bash
   cp src/utils/global.css src/utils/global.css.backup
   ```

3. **Update global.css**
   - Add Iceberg color palette variables
   - Update light/dark mode mappings
   - Refine code block styles
   - Test after each section

4. **Visual testing checklist**
   - [ ] Homepage in light mode
   - [ ] Homepage in dark mode
   - [ ] Blog post with code blocks in both modes
   - [ ] Theme toggle works smoothly
   - [ ] Terminal code blocks render correctly
   - [ ] Inline code is readable
   - [ ] Links are visible and match Iceberg blue

5. **Cross-browser testing**
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari

6. **Performance check**
   - [ ] Run `yarn build`
   - [ ] Check for CSS bloat
   - [ ] Verify no console errors

---

## Risk Assessment

### Low Risk ✅
- Code syntax colors (already partially Iceberg)
- Typography (Inter font is compatible)
- Theme toggle mechanism (no structural changes)

### Medium Risk ⚠️
- Link contrast in light mode (need to test readability)
- Inline code backgrounds (visibility on new backgrounds)
- Terminal block colors (must match three-dot header design)

### Mitigation Strategy
- Test each color update in isolation
- Keep git commits small and focused
- Use browser DevTools to test colors before committing
- Reference the provided HTML artifact for color accuracy

---

## Success Criteria

✅ Both light and dark modes match Iceberg color palette
✅ All text has WCAG AA contrast ratios
✅ Code blocks look identical to HTML artifact
✅ Theme toggle works without flashing
✅ No regressions in existing features
✅ Documentation is complete and accurate

---

## Timeline Estimate

- **Documentation:** 15 minutes (this file + state.md + theme-guide.md)
- **CSS updates:** 30 minutes
- **Testing:** 20 minutes
- **Refinements:** 15 minutes
- **Total:** ~1.5 hours

---

## Rollback Plan

If issues arise:
1. Restore from `global.css.backup`
2. Run `yarn clean && yarn develop`
3. Document what went wrong in this file
4. Adjust plan and retry

---

## Notes

- The provided HTML artifact serves as the source of truth for colors
- Existing code has some Iceberg colors already (lines 182-242 in global.css)
- Terminal blocks have good structure, just need color refinement
- Prism syntax highlighting is already configured (gatsby-remark-prismjs)
- **Browser MCP available:** Use browser MCP tools to navigate to http://localhost:8000/ and take screenshots during visual testing for accurate comparison against the HTML artifact

---

## Next Steps

1. ✅ Complete this plan document
2. ⏭️ Create `docs/state.md` with current theme analysis
3. ⏭️ Create `docs/theme-guide.md` from HTML artifact
4. ⏭️ Begin implementation in global.css
