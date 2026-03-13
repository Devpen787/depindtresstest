# DTSE Deploy Guide

**Purpose:** Ship the DTSE tab (Phases 1–7) to preview or production.

## Prerequisites

- `npm run build` passes
- `npm run test` passes
- `npm run test:e2e` passes (optional but recommended)

## Deploy to Vercel (preview)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Deploy via Vercel CLI:**
   ```bash
   npx vercel          # preview
   npx vercel --prod   # production (when ready)
   ```
   Or use the vercel-deploy skill (`bash scripts/deploy.sh` from the skill bundle) for a claimable preview URL.

3. **Output:** Preview URL. Share for feedback; claim to your Vercel account if using the deploy script.

## Post-deploy

1. Open the Preview URL and run the [Live checking](./DTSE_IMPROVEMENT_PLAN.md#9-live-checking) steps.
2. Start Phase 8: log feedback in [DTSE_FEEDBACK_LOG.md](./DTSE_FEEDBACK_LOG.md).
