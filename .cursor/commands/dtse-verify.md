# DTSE Verify

Run the full DTSE verification suite and report results. Do not claim any phase or checklist item is done until all pass.

1. **Unit tests:** Run `npm run test`. Report exit status and pass/fail counts.
2. **Build:** Run `npm run build`. Report exit status; fix any TypeScript or build errors.
3. **E2E:** Run `npm run test:e2e`. Report exit status and pass count (expect 22, including review-rehearsal).

If any step fails, fix before proceeding. Use **depin-systematic-debugging** for test failures; **check-compiler-errors** for build failures; **fix-ci** for CI-specific issues.
