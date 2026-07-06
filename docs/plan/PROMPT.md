# Implementation prompt (paste into a fresh Claude Code session)

Implement the execution plan in `docs/plan/` for this repo, phase by phase, in order:

1. Read `docs/plan/README.md` in full first — it has the vision, the global conventions, and a snapshot of the current code. The conventions there (strict TS, all year↔pixel math through `coords.ts`, magic numbers in `constants.ts`, no year 0, `dir="rtl"` for Farsi) are hard requirements for every phase.

2. Then work through the phase files in order: `phase-1-scroll-pan-zoom.md`, `phase-2-kings-lod.md`, `phase-3-eras-atmosphere.md`, `phase-4-design-pass.md`, `phase-5-portfolio-polish.md`. Do not start a phase until the previous one is complete and committed.

For each phase:
- Read the entire phase doc before writing code. Follow its file paths, atom shapes, formulas, and tables exactly — they are the spec, not suggestions. Where a doc offers an explicit either/or choice, pick one and note it in the commit message.
- After implementing, run `npm run build` and `npm run lint` — both must pass with zero errors before moving on (plus `npm run test` once it exists in Phase 5).
- Verify every checkbox in the phase's **Acceptance** section against the running app (`npm run dev`). If you cannot verify one in a headless environment, say so explicitly rather than checking it off silently.
- Commit the phase as one commit (or a small series) with a message naming the phase, e.g. `Phase 1: native scroll/pan/zoom viewport`.

Rules:
- This is a portfolio project — code quality and visual polish are graded. No `any`, no dead code left behind (delete the slider/playhead remnants Phase 1 says to delete).
- Don't refactor beyond what a phase asks for, and don't add features the plan doesn't mention. If something in the plan contradicts the actual code, stop and flag it instead of improvising.
- Skip items only where the plan explicitly marks them as stretch/optional, and report anything skipped in your final summary.
- Phase 4 installs fontsource packages and Phase 5 installs vitest — those are the only new dependencies allowed.

When all phases are done, give a summary of what was built per phase, all deviations from the plan, and any acceptance criteria you could not verify.
