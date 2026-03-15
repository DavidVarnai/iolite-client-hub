

## Plan: Remove duplicate Run MI button from Quick Actions

In `src/components/client/Overview.tsx`:
- Remove the `<RunMIButton />` line from the Quick Actions panel (around line 80)
- Keep the `<RunMIButton variant="compact" />` in the Market Intelligence section below

One-line change, no other files affected.

