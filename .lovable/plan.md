

## Cleanup and UX Improvement Plan — 10 Items

This plan addresses usability issues across System Settings, Client Onboarding, Strategy, and Growth Model. No new features — only UX refinements to existing screens.

---

### 1. Save confirmation toast in Admin System Settings

**File:** `src/components/admin/AdminSystemSettings.tsx`

- Add `useState` for form values (currently using uncontrolled `defaultValue`)
- Wire the "Save Settings" button to persist via `repository.settings` and show a `toast()` confirmation ("Settings saved successfully")
- Import `useToast` from the existing sonner/toast system

---

### 2. Expandable text fields in Client Onboarding Discovery

**File:** `src/components/client/ClientOnboardingWizard.tsx`

- Replace the `Field` component's `<input type="text">` with a `<textarea>` that auto-resizes
- Use CSS `resize: vertical` or a controlled `rows` approach so fields start compact (1-2 lines) but expand as content grows
- Apply to all discovery fields where longer text is expected (Products, Revenue Streams, Customer Segments, Growth Priorities, etc.)
- Keep short fields like Close Rate and Sales Cycle Length as single-line inputs

---

### 3. Sales Process — templated guidance for Lead→Qual→Sale field

**File:** `src/components/client/ClientOnboardingWizard.tsx` (DiscoveryStep, section C)

- Add placeholder text with example structures based on business model:
  - Ecommerce: "Ad Click → Product Page → Add to Cart → Purchase"
  - Lead Gen: "Ad/Content → Landing Page → Form Fill → Sales Call → Close"
  - Hybrid: "Ad → Landing Page → Form/Call → Qualification → Proposal → Close"
- Add a small helper dropdown or clickable template chips above the field that pre-fill the value
- Add a hint below the field: "Describe the steps from first touch to closed deal"

---

### 4. Marketing Stack — checkbox-style selection

**File:** `src/components/client/ClientOnboardingWizard.tsx` (DiscoveryStep, section D)

- Replace the 5 free-text fields with checkbox groups for common options + an "Other" text input:
  - **Paid Media:** Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, Microsoft Ads, Other
  - **CRM:** Salesforce, HubSpot, Pipedrive, Zoho, None, Other
  - **Email Platform:** Klaviyo, Mailchimp, ActiveCampaign, HubSpot, Constant Contact, Other
  - **Analytics:** GA4, Adobe Analytics, Mixpanel, Triple Whale, Other
  - **Website:** Shopify, WordPress, Webflow, Squarespace, Custom, Other
- Each renders as a grid of toggleable chips/checkboxes with a conditional "Other" text input
- Store as comma-separated string to maintain the existing `ClientDiscovery` type

---

### 5. Current Performance — guided input with hints

**File:** `src/components/client/ClientOnboardingWizard.tsx` (DiscoveryStep, section E)

- Add placeholder text and hint labels to each field:
  - Current Traffic: placeholder "e.g., 25,000 monthly sessions", hint "Monthly website sessions from all sources"
  - Current Leads/Orders: placeholder "e.g., 500 leads/month", hint "Monthly conversions (leads, orders, or calls)"
  - Current CPA/CAC: placeholder "e.g., $45 CPA", hint "Average cost to acquire a customer or lead"
  - Conversion Rates: placeholder "e.g., 2.5% site-wide", hint "Overall website conversion rate"
  - Known Bottlenecks: placeholder "e.g., Low mobile conversion, high cart abandonment", hint "Key friction points limiting growth"

---

### 6. Competitive Landscape — AI-powered research trigger

**File:** `src/components/client/ClientOnboardingWizard.tsx` (DiscoveryStep, section F)

- Add a "Research Competitors" button that calls `runMarketResearch()` from the existing AI adapter
- Pass industry, geography, and business model from the current discovery data
- On success, auto-populate:
  - `topCompetitors` from `result.topCompetitors` (names + notes)
  - `positioningNotes` from `result.positioningThemes`
  - `differentiators` — leave for user to fill (prompt with a hint)
- Show a loading state and allow the user to review/edit before confirming
- Fields remain editable after AI population

---

### 7. Strategy — auto-scroll to newly added section

**File:** `src/components/client/Strategy.tsx`

- In `handleAddSection`, after updating `client.strategySections`, use a `useEffect` + `useRef` pattern or `setTimeout` + `scrollIntoView` to scroll to the newly created section
- Assign a ref/id to each `StrategySectionCard` based on `section.id` and scroll the new one into view with `behavior: 'smooth'`

---

### 8. AI Strategy Drafts — channel-specific, research-informed content

**File:** `src/lib/ai/aiAdapters.ts` (`fetchStrategyDraft`)

- Enhance the mock to produce channel-differentiated content instead of the current generic template
- Create channel-specific response maps with unique objectives, initiatives, timelines, and metrics per channel:
  - Paid Media: budget allocation, ROAS targets, campaign structure, creative testing
  - SEO/Content: keyword strategy, content calendar, authority building, technical SEO
  - Email Marketing: flow architecture, segmentation, lifecycle stages, deliverability
  - Social Media: platform strategy, content pillars, community engagement, influencer
  - Website: conversion optimization, UX audit, page speed, A/B testing
  - Brand Strategy: positioning framework, messaging hierarchy, visual identity
- Use `req.discoveryContext` to weave in client-specific data (products, segments, bottlenecks)

---

### 9. Revenue Assumptions — editable fields with CTA

**File:** `src/components/client/growth/RevenueModel.tsx`

- Change the `InputField` component from `readOnly` to editable
- On change, update the scenario's `revenueAssumption` and propagate via an `onUpdate` callback (same pattern as InvestmentPlan)
- Update the `RevenueModel` props to accept `onUpdate: (model: GrowthModel) => void`
- Wire from `GrowthModel.tsx` parent where `handleModelUpdate` already exists
- Add a visual "Edit Assumptions" prompt if the values are still at template defaults

---

### 10. Revenue Model table — realistic ramp-up curve

**File:** `src/components/client/growth/RevenueModel.tsx`

- Apply a ramp-up multiplier to the revenue projections:
  - Month 1: 0% (setup/launch)
  - Month 2: 15% (early data)
  - Month 3: 35% (initial optimization)
  - Month 4: 60% (benchmark setting)
  - Month 5: 80% (scaling)
  - Month 6+: 100% (steady state)
- Apply this curve to the `effectiveLeads` or `revenue` calculation in the `revenueTable` memo
- Add a "Ramp Phase" column or visual indicator showing which phase each month is in (Setup → Early Results → Optimization → Steady State)
- This reflects the real-world pattern that results don't appear linearly from month 1

---

### Technical Notes

- All changes use existing patterns: `useToast`, `useClientContext`, AI adapters, repository layer
- No new dependencies required
- No data model changes needed (checkbox selections stored as comma-separated strings in existing `ClientDiscovery` fields)
- Revenue ramp curve is applied at the display/calculation layer, not changing the underlying data model

