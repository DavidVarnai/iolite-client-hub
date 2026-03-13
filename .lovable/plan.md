

## Plan: Enlarge Logo, Remove Text

Replace the sidebar header so it only shows the Iolite logo, larger and centered, with no "Agency OS" or "by Iolite Ventures" text.

### Changes

**`src/components/AppSidebar.tsx`** (lines 38-52)
- Remove the `h1` and `p` text elements
- Replace the entire brand block with a single centered logo image
- Expanded state: logo at `h-10` with padding
- Collapsed state: logo at `h-7` centered

