

## Fix: Preserve user-created clients across rebuilds

**Problem**: The `createClientRepo` checks `if (!localStorage.getItem(key))` before seeding. This works fine normally — but when the preview rebuilds and localStorage is cleared, all user-created clients are lost because only the 3 hardcoded seeds get restored.

**Immediate action**: You'll need to re-create "Hiba Academy" via the New Client button.

**Preventive fix** (1 file): `src/lib/repository/clientsRepo.ts`

- Change the seeding logic from "overwrite if missing" to "merge seeds with existing data"
- On init, load existing clients; if any seed client IDs (`c1`, `c2`, `c3`) are missing, add them back — but never remove user-created clients
- Same pattern for onboarding repo

```typescript
// Before (loses user data):
if (!localStorage.getItem(key)) persist(key, seedClients);

// After (preserves user data):
const existing = load<Client[]>(key) || [];
const seedIds = seedClients.map(c => c.id);
const missing = seedClients.filter(s => !existing.find(e => e.id === s.id));
if (missing.length || !existing.length) {
  persist(key, [...existing, ...missing]);
}
```

This ensures user-created clients survive even if the seed check fires again after a storage reset.

