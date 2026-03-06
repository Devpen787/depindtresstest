# DTSE Phase

Execute the checklist for a given DTSE improvement phase. The user will specify the phase number (1–8).

1. Open `docs/DTSE_IMPROVEMENT_PLAN.md` and locate the checklist for the specified phase.
2. For each unchecked item:
   - Implement the change (small, focused).
   - Run `npm run test` after each item.
   - Run the 4-question test on the changed element: Would user miss it? Duplicate? Need explanation? Help next step?
   - Commit with message: `dtse: phase{N} {item}` (e.g. `dtse: phase1 price compression clamp`).
3. After all items in the phase:
   - Run `npm run build` and `npm run test:e2e`.
   - Complete the Live check for that phase (see §9 in the plan).
   - Update `docs/DTSE_NOISE_VS_SIGNAL_AUDIT.md` Completed section.

Use **verification-before-completion** before claiming the phase is done.
