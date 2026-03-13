

# Fix Sidebar Text Colors

## Problem
The sidebar has a dark blue background (`#243D87`), but text elements use light-theme tokens (`text-foreground`, `text-muted-foreground`, `text-primary`) which are dark colors meant for white backgrounds. This makes text hard to read or invisible.

## Solution
Replace all light-theme color classes in `AppSidebar.tsx` with sidebar-specific colors, and introduce `#fc7700` as a sidebar accent/highlight color.

### CSS Changes (`src/index.css`)
- Add a new token: `--sidebar-highlight: 28 100% 49%` (HSL for `#fc7700`)
- This will be used for section labels and active state accents

### Tailwind Config (`tailwind.config.ts`)
- Add `highlight: "hsl(var(--sidebar-highlight))"` under `sidebar` colors

### Sidebar Component (`src/components/AppSidebar.tsx`)
Replace color classes throughout:

| Element | Current (broken) | Fixed |
|---|---|---|
| Section labels (NAVIGATION, SYSTEM, etc.) | `text-muted-foreground` | `text-sidebar-foreground/50` or use `#fc7700` for labels |
| Nav link text | inherits dark color | `text-sidebar-foreground` |
| Nav link hover | `hover:bg-sidebar-accent` (ok) | keep, ensure text stays white |
| Active nav link | `text-primary` (dark blue on dark blue) | `text-[#fc7700]` or `text-sidebar-foreground font-medium` |
| Active client name | `text-foreground` | `text-sidebar-foreground` |
| Active client stage | `text-muted-foreground` | `text-sidebar-foreground/60` |
| Client initials badge bg | `bg-primary/10 text-primary` | `bg-sidebar-foreground/10 text-sidebar-foreground` or `bg-[#fc7700]/20 text-[#fc7700]` |
| Recent client names | inherits dark | `text-sidebar-foreground` |
| Recent client initials | `text-primary bg-primary/10` | `text-[#fc7700] bg-[#fc7700]/15` |

### Color Strategy
- **`#fc7700`** — used for section group labels (NAVIGATION, ACTIVE CLIENT, SYSTEM, RECENT CLIENTS) and active-state highlights, giving the sidebar visual hierarchy and brand accent
- **`text-sidebar-foreground`** (white) — all regular nav text
- **`text-sidebar-foreground/60`** — secondary/muted text within sidebar
- **Active state** — `bg-sidebar-accent` background + `text-[#fc7700]` text for clear active indication

### Files Changed
| File | Change |
|---|---|
| `src/components/AppSidebar.tsx` | Replace all light-theme color classes with sidebar-aware colors |
| `src/index.css` | Optional: add `--sidebar-highlight` token |

