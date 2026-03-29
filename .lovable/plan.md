

## Plan: Add/Remove Other Cost Line Items in Investment Plan

### Summary
Add inline management of Other Cost rows directly in the Growth Model Investment Plan — add new rows via popover, delete with confirmation when amounts exist.

### Changes (single file)

**`src/components/client/growth/InvestmentPlan.tsx`**

1. **Extend `EditableGrid`** with optional `onDelete?: (rowId: string) => void` prop
   - When provided, render a small `Trash2` icon button as the last column on each row
   - On click: if row total is 0, delete immediately; if > 0, show an `AlertDialog` confirmation

2. **Add "Add Other Cost" button + popover** below the Other Costs grid
   - Uses `Popover` with a compact form: Name input (required) + Billing Type select (monthly / one_time / custom_schedule)
   - On submit, calls a new `handleAddOtherCost(name, billingType)` that appends to `scenario.budgetLineItems`:
     ```
     { id: `bli-other-${Date.now()}`, scenarioId: scenario.id, category: 'other',
       name, billingType, isInternal: false, notes: '', monthlyRecords: [] }
     ```

3. **Add `handleDeleteOtherCost(rowId)`** — filters the line item from `scenario.budgetLineItems` and calls `onUpdate`

4. **Empty state** — if `otherItems.length === 0`, show a muted helper text: "No other costs added yet. Add software, tools, subscriptions, or vendor costs."

5. Pass `onDelete={handleDeleteOtherCost}` only to the Other Costs `EditableGrid`, not Media Budget

### New imports needed
- `Plus, Trash2` from lucide-react
- `Popover, PopoverTrigger, PopoverContent` from ui/popover
- `AlertDialog` components from ui/alert-dialog
- `Select` components from ui/select
- `Button` from ui/button
- `useState` from react

### What stays the same
- Data model (`BudgetLineItem`) — no changes
- Media Budget grid — no add/delete
- Agency Fees summary card — untouched
- All existing grid editing behavior

