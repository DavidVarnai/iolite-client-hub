

# Fix: New Client Creation Should Persist and Navigate Correctly

## Problem
When creating a new client, the handler discards all form data and hardcodes a redirect to `/clients/c1` (Meridian Commerce). The client list comes from a static `seedClients` array that never gets updated.

## Solution
Add a lightweight client state manager so new clients persist in memory during the session and appear in the client list.

### Changes

**1. `src/data/seed.ts`** — Export a mutable clients store
- Add a `clientsStore` array initialized from `seedClients`
- Export `addClient(client)` function that pushes to the store and returns the new client
- Export `getClients()` function that returns the current array

**2. `src/pages/Clients.tsx`** — Use the store
- Replace `seedClients` reference with `getClients()`
- Use `useState` to hold the client list, initialized from `getClients()`
- In `handleCreate`: build a full `Client` object with a unique ID, default empty arrays for tasks/comments/channels, lifecycle stage "lead", then call `addClient()`, update local state, and navigate to `/clients/{newId}`

**3. `src/pages/ClientHub.tsx`** — Look up from store
- Replace `seedClients.find()` with `getClients().find()` so dynamically-added clients are found

**4. `src/components/AppSidebar.tsx`** — Use store
- Replace `seedClients` references with `getClients()` so new clients appear in the sidebar's "Recent Clients" list

This keeps the architecture simple (in-memory, no backend needed for V1) while making the creation flow actually work. New clients will persist for the duration of the browser session.

