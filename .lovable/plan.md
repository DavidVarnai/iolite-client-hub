

## Update Close Button Label

The footer already says "Pause Onboarding" — good. The issue is the **top-right X button** (line 975-977) which is a bare icon with no label.

### Change

**`src/components/client/ClientOnboardingWizard.tsx`** — Replace the top-right `X` icon button with a labeled text button:

```tsx
// BEFORE (line 975-977)
<button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
  <X className="h-4 w-4 text-muted-foreground" />
</button>

// AFTER
<button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
  <Pause className="h-3 w-3" />
  Save & Exit
</button>
```

Import `Pause` from lucide-react (already used in `OnboardingContinuityPanel`). This gives a clear, reassuring label that progress is saved, paired with the existing "Pause Onboarding" in the footer for consistency.

Single file, ~3 lines changed.

