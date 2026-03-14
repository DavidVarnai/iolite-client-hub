

## Fix: "Begin Discovery" and "Continue Discovery" buttons open the Onboarding Wizard

**Problem**: When lifecycle stage is `lead` or `discovery` (incomplete), the NextStepCard's `targetTab` is `'overview'` — but the card is already on the overview tab, so clicking it does nothing.

**Fix** (two files):

### 1. `src/types/onboarding.ts` — add a new action type
- Extend the return type to include an optional `action type` field: `openWizard?: boolean`
- Set `openWizard: true` for `lead` and `discovery` (incomplete) cases instead of `targetTab: 'overview'`
- For `growth_model` and `proposal_ready`, keep `targetTab: 'overview'` (these prompt actions like "Check Proposal" / "Activate Client" which are on the overview page)

### 2. `src/pages/ClientHub.tsx` — handle wizard action
- Update the `onAction` handler on `NextStepCard` (line 153):
  - If `nextStep.openWizard` → call `setShowWizard(true)`
  - Else if `nextStep.targetTab` → call `setTab(nextStep.targetTab)`

Two lines changed, clean fix.

