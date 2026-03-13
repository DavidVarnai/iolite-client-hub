

# Revised Stabilization Plan

## 1. Persistence — Repository Abstraction with localStorage V1

Create a **repository pattern** that decouples all data access from the storage mechanism. Components never touch localStorage directly.

**New files:**

- `src/lib/repository/types.ts` — Repository interfaces (`ClientRepository`, `OnboardingRepository`, `GrowthModelRepository`, `AiArtifactRepository`)
- `src/lib/repository/localStorageRepo.ts` — localStorage implementation of all repository interfaces, hydrating from seed on first load
- `src/lib/repository/index.ts` — Exports a singleton instance; swap this one file to switch backends

**Pattern:**
```text
Component → useClientContext() → repository.saveClient(client)
                                    │
                              ┌─────┴─────┐
                              │ Repository │  (interface)
                              │  Interface │
                              └─────┬─────┘
                                    │
                         ┌──────────┴──────────┐
                         │ localStorageRepo.ts  │  (V1)
                         │ supabaseRepo.ts      │  (future)
                         └─────────────────────┘
```

Repository interface shape:
```
getClients(): Client[]
getClient(id): Client | null
saveClient(client): void
deleteClient(id): void
getOnboarding(clientId): OnboardingData
saveOnboarding(clientId, data): void
getGrowthModel(clientId): GrowthModel | undefined
saveGrowthModel(model): void
getAiArtifacts(clientId): AiArtifact[]
saveAiArtifact(artifact): void
```

No component ever imports `localStorage` directly. When ready, replace `localStorageRepo` with `supabaseRepo` and nothing else changes.

---

## 2. Performance Data — Source of Truth Architecture

Two distinct data systems, clearly separated:

| Concern | Source of Truth | Location | Purpose |
|---|---|---|---|
| **Forecast vs Actual tracking** | `GrowthModel.actuals[]` + calculated forecasts from `channelAssumptions` | `growthModelCalculations.ts` | Quantitative, channel-level, monthly numbers |
| **Narrative performance summaries** | `Client.performance[]` (`PerformanceReport`) | Client entity | Human-authored (or AI-drafted) narrative with curated metrics, wins, risks |

**Relationship:** `PerformanceReport` is a *synthesis layer* on top of Growth Model data. It references the same time periods but adds editorial narrative. The `ForecastVsActual` tab in Growth Model shows raw data; `Performance` tab shows the narrative report.

**Implementation:**
- Performance AI will pull quantitative inputs from `GrowthModel.actuals` (real data) to generate narrative drafts
- AI-generated performance summaries are saved as `AiArtifact` (type: `performance_summary`) and can be "inserted" into `PerformanceReport`
- No duplication: raw numbers live only in Growth Model; narratives live only in PerformanceReport

---

## 3. AI Output Persistence — Typed Artifacts

**New type:** `src/types/ai.ts` — add `AiArtifact`:

```
export type AiArtifactType =
  | 'market_research'
  | 'strategy_draft'
  | 'benchmark_suggestion'
  | 'performance_summary'
  | 'proposal_summary';

export interface AiArtifact {
  id: string;
  clientId: string;
  type: AiArtifactType;
  sourceModule: string;       // e.g. 'strategy', 'growth_model', 'performance'
  contextId?: string;         // e.g. strategy section ID, channel name
  content: Record<string, any>; // typed payload (the AI result object)
  status: 'draft' | 'accepted' | 'discarded';
  createdAt: string;
  acceptedAt?: string;
}
```

Each AI tool's "Approve" action:
- Creates an `AiArtifact` with `status: 'accepted'`
- Applies the content to the target record (e.g., strategy draft → updates `StrategySection.clientSummary`)
- Persists both the artifact and the updated record via repository

"Discard" sets `status: 'discarded'` and persists the artifact (for audit trail).

Artifacts are stored per-client via `repository.saveAiArtifact()` and `repository.getAiArtifacts(clientId)`.

---

## 4. State Architecture — ClientContext

**New file:** `src/contexts/ClientContext.tsx`

Provides:
- `client` / `updateClient` — reads/writes via repository
- `onboarding` / `updateOnboarding` — reads/writes via repository
- `growthModel` / `updateGrowthModel` — reads/writes via repository
- `aiArtifacts` / `saveAiArtifact`

`ClientHub.tsx` wraps children in `<ClientProvider>`. All tabs consume `useClientContext()` instead of props. ClientHub becomes a thin shell: header bar, lifecycle bar, tab router.

---

## 5. Data Model Cleanup

**Stage reconciliation:**
- Remove `EngagementStage` from `Client.stage`
- Replace with computed `displayStage` derived from `onboarding.lifecycleStage` via a mapping function in `src/types/onboarding.ts`
- `Clients.tsx` list page shows only the lifecycle label (already partially done)

**Remove `stageProgress` from `OnboardingData`:**
- Already computed dynamically by `computeStageReadiness()` — the stored copy in seed data is redundant
- Remove from interface; remove from seed data; always compute on the fly

---

## 6. CRUD Scope

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Client | Existing modal → wire to repo | Via repo | Settings tab: name, company, industry, contacts, notes | Settings tab with confirmation |
| Onboarding | Auto-created with client | Via context | Wizard updates persist via context | N/A (tied to client) |
| Strategy Sections | "Add Section" button with channel picker | Via context | Inline edit: objective, priorities, plan, outcomes | Delete with confirmation |
| Growth Model | Template creation already works → persist | Via context | All edits already flow through `onUpdate` → persist | N/A for V1 |
| Tasks | "New Task" form (title, owner, due, status) | Via context | Status toggle, inline edit | Delete |
| Comments | "New Comment" form (content, internal flag) | Via context | Status toggle (open → resolved) | N/A for V1 |
| AI Artifacts | Created on approve/discard | Queryable by client + type | Status updates | N/A |

---

## 7. AI Wiring Fixes

**Strategy Draft** (`Strategy.tsx`):
- Pull `onboarding` from context
- Pass `businessModel`, `growthGoals`, `geography`, `discoveryContext` from `onboarding.discovery`
- On approve: update `StrategySection.clientSummary` fields, save artifact, persist client

**Benchmark AI** (`ChannelAssumptions.tsx`):
- Already partially wired — pass `client.industry` from context instead of hardcoded `'General'`
- "Apply mid" already works — just persist the model update

**Performance AI** (`Performance.tsx`):
- Pull `growthModel` from context
- Build `PerformanceAnalysisRequest.months` from `growthModel.actuals` matched against forecast calculations
- On approve: save as `AiArtifact` type `performance_summary`, optionally insert into `PerformanceReport`

**Summary Writer** (Proposal mode):
- On approve: save as `AiArtifact` type `proposal_summary`

---

## 8. Files Changed Summary

| File | Action |
|---|---|
| `src/lib/repository/types.ts` | **New** — repository interfaces |
| `src/lib/repository/localStorageRepo.ts` | **New** — localStorage implementation |
| `src/lib/repository/index.ts` | **New** — singleton export |
| `src/contexts/ClientContext.tsx` | **New** — context provider + hook |
| `src/types/ai.ts` | Add `AiArtifact` type |
| `src/types/index.ts` | Remove `EngagementStage`, add stage mapping |
| `src/types/onboarding.ts` | Remove `stageProgress` from `OnboardingData` |
| `src/data/seed.ts` | Remove `addClient`, simplify to pure seed data |
| `src/data/onboardingSeed.ts` | Remove `stageProgress` from seeds |
| `src/data/growthModelSeed.ts` | Pure seed data only |
| `src/pages/ClientHub.tsx` | Wrap with `ClientProvider`, remove prop drilling |
| `src/pages/Clients.tsx` | Use repository, remove `EngagementStage` display |
| `src/components/client/Strategy.tsx` | Use context, AI wiring, CRUD |
| `src/components/client/Tasks.tsx` | Add create/update/delete via context |
| `src/components/client/Comments.tsx` | Add create, status toggle via context |
| `src/components/client/Performance.tsx` | Pass real data to AI, approve wiring |
| `src/components/client/GrowthModel.tsx` | Persist via context |
| `src/components/client/growth/ChannelAssumptions.tsx` | Pass real industry to benchmarks |
| `src/components/client/ClientSettings.tsx` | Client update + delete |
| `src/components/client/Overview.tsx` | Use context |
| `src/components/client/ClientOnboardingWizard.tsx` | Use context |

---

## What This Does NOT Include
- No new product modules
- No external integrations or Supabase setup
- No new AI tools
- No auth or user roles
- No scope expansion beyond stabilization

