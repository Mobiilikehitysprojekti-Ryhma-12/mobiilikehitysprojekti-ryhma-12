# Pull Request Template — QuoteFlow 🚀

Use this template to make PRs consistent and to ensure the mini-checklist from `BestPractices.md` is satisfied.

## Summary
- **What** did you change? (Short description)
- **Why** did you change it? (Reason / motivation)

## How to test
- Steps to reproduce and verify changes locally (include commands, e.g. `npm start`, device/emulator)
- If applicable, include steps to demo error/loading/empty states (e.g. `SIMULATE_ERROR = true` + API repo)

## Checklist — MUST be completed before requesting review ✅
- [ ] The change is small and single-responsibility (split if too large).
- [ ] Files are not > ~150 lines where they do multiple concerns (split if needed).
- [ ] No UI code calls `services/apiClient.ts` directly; uses repository from `RepoProvider` / `useLeadsRepo()`.
- [ ] All modified/added files include Finnish comments explaining *why* (file header + key functions).
- [ ] All affected screens have loading / error / empty / ready states implemented where relevant.
- [ ] Pure helpers (e.g. filter/formatter) are extracted and have unit tests (or a note why not)
- [ ] TypeScript strictness preserved (no `any` unless justified with a comment)
- [ ] Lint passes: `npm run lint` (fix or document any exceptions)
- [ ] Manual smoke test performed:
  - app starts (`npm start`) and Inbox shows skeleton -> list
  - search/filter works
  - navigate to detail route
  - error state + retry can be triggered (if applicable)
- [ ] Documentation updated if behavior or API changed (README / BestPractices / copilot-instructions)
- [ ] Attach screenshots or a short recording showing key UI states (loading/error/empty/ready) when UI changes

## Reviewer notes
- Areas to pay attention to / potential risks
- Any follow-up tasks required after merge

---

Thanks — please mark any unchecked items with rationale in the PR body so reviewers can make an informed decision.