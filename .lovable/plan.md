

## Plan: Editable Ramp-Up Percentages

### Problem
The ramp curve is hardcoded (`[0, 0.15, 0.35, 0.60, 0.80, 1.0]`). Users can't adjust it to match their client's realistic timeline.

### Approach
Store the ramp curve on the `GrowthModel` and let users edit each month's percentage inline.

### Changes

**`src/types/growthModel.ts`** — Add optional field to `GrowthModel`
- `rampCurve?: number[]` — array of decimals (0–1) per month. Falls back to the current default if missing.

**`src/components/client/growth/RevenueModel.tsx`**
1. Read `model.rampCurve` (fallback to current hardcoded default if undefined)
2. Replace the static ramp visualization with **editable percentage inputs** per month — small number inputs (0–100) inside the existing ramp bar UI
3. On change, call `onUpdate` with the updated `rampCurve` array
4. When `monthCount` changes (more months than ramp entries), pad with `1.0`; when fewer, trim
5. Keep labels auto-derived: 0% = "Setup", <60% = early phases, <100% = scaling, 100% = "Steady State"
6. Add a "Reset to Default" link that restores the hardcoded curve

**No other files change.** The `revenueTable` useMemo already reads ramp per index — it will just read from the model field instead of the constant.

### UI
The existing ramp visualization bars become interactive — each bar gets a small `%` input at the bottom. Compact, consistent with current styling.

