

## Hide Agency Services Grid from Non-Admin Users

The "Agency Services" section in the Investment Plan shows internal cost data (Fractional CMO, Paid Media Management, etc.) that should only be visible to admin users.

### Change

**`src/components/client/growth/InvestmentPlan.tsx`**

1. Import `currentUser` from `@/data/seed` and `isAdminUser` from `@/types/admin`
2. Wrap the Agency Services `EditableGrid` (line 160) in an `isAdminUser(currentUser.role)` check
3. Conditionally exclude agency fees from the Investment Summary for non-admin users (adjust `grandTotal` calculation)

The Media Budget, Other Costs, and Investment Summary remain visible to all users. The summary will simply omit the "Total Agency Fees" card for non-admins, keeping the total accurate to what they can see.

### Files changed
| File | Change |
|------|--------|
| `src/components/client/growth/InvestmentPlan.tsx` | Conditionally render Agency Services grid and summary line based on admin role |

