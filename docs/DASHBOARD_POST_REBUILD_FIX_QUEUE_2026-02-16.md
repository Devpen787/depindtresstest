# Dashboard Post-Rebuild Fix Queue (Reference)

Date: 2026-02-16
Workspace: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test`

## Purpose
Use this after the current rebuild jobs finish. It captures the next UI quality fixes in collision-safe order.

## Start Gate (Do This First)
1. Confirm current rebuild jobs are complete.
2. Create a checkpoint commit on your rebuild branch.
3. Re-run baseline checks:
   - `npm run build`
   - `npm run test:e2e`
   - `npm run acceptance:generate -- --profile ono_v3_calibrated --mode quick`
   - `npm run ci:dashboard:acceptance:gate -- --require-section-pass --exclude-sections 'I Onocoy Inputs'`

## Collision Map
### High overlap with active rebuild (edit later)
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx`
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SandboxView.tsx`
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SimulatorSidebar.tsx`

### Lower overlap (safe first pass)
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/HeaderDropdown.tsx`
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/CollapsibleSection.tsx`
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/BaseChartBox.tsx`
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/ComparisonView.tsx`

## Phase 1 (Low-Collision Fixes First)
1. Accessibility semantics in shared UI primitives.
   - Add `aria-expanded` + `aria-controls` for collapsibles in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/CollapsibleSection.tsx`.
   - Add dropdown trigger/menu semantics in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/HeaderDropdown.tsx`.
2. Replace brittle dynamic Tailwind color strings with explicit maps.
   - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/BaseChartBox.tsx`
   - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/ComparisonView.tsx`
3. Fix invalid utility class typo.
   - Replace `text-slate-606` in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/CollapsibleSection.tsx`.

## Phase 2 (After Rebuild Merge)
1. Apply the same static color-map cleanup in overlap files.
   - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SandboxView.tsx`
   - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SimulatorSidebar.tsx`
2. Improve top-level nav semantics in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx`.
   - Primary tabs: `role="tablist"` + `role="tab"` + `aria-selected` + panel IDs.
   - Simulator mode switch: same pattern.
3. Increase minimum readable text size in high-traffic controls (9px/10px -> 11px/12px where practical).

## Phase 3 (Performance and Build Hygiene)
1. Reduce initial JS bundle size (`dist/assets/index-*.js` currently large).
   - Convert heavyweight views to lazy routes/components (benchmark, diagnostic, decision tree).
2. Remove/align legacy HTML delivery artifacts in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.html`.
   - Tailwind CDN and importmap should not conflict with Vite-bundled app.
3. Ensure a real CSS entry import exists in app entrypoint so design tokens/utilities are bundled consistently.

## Verification Checklist (After Each Phase)
1. `npm run build`
2. `npm run test:e2e`
3. `npm run acceptance:generate -- --profile ono_v3_calibrated --mode quick`
4. `npm run ci:dashboard:acceptance:gate -- --require-section-pass --exclude-sections 'I Onocoy Inputs'`
5. Manual keyboard pass:
   - Header dropdown open/close from keyboard.
   - Sidebar collapsibles announce expanded/collapsed state.
   - Primary tab and simulator mode focus order/selection state.

## Definition Of Done
- No dynamic Tailwind classes in target dashboard surfaces.
- Core controls expose proper ARIA semantics.
- No invalid utility classes remain.
- E2E and acceptance gate stay green.
- Bundle size trend is reduced or explicitly accepted with rationale.

## Notes
- IDE tabs referenced but not currently present in this workspace snapshot:
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/hooks/useStoryGenerator.ts`
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Story/VisualContext.tsx`
