## 1. Characterization Safety Net

- [x] 1.1 Create `tests/claim-constructor-workflow.test.js` with a reusable Node `vm` Apps Script harness and fake spreadsheet, sheet, range, properties, Drive folder, and Docs boundaries.
- [x] 1.2 Add characterization tests for the existing source-folder and Docs-link label resolvers using `Исходные данные:` and `Расписанный расчет:` before changing UI code.
- [x] 1.3 Add characterization tests for existing public import, reconstruction, recalculation, and Docs entry-point availability and run the complete pre-change test baseline.

## 2. Constructor Sheet Facade

- [x] 2.1 Define constructor sheet/layout constants and pure helpers for required labels, named ranges, phase labels, result fields, and issue columns.
- [x] 2.2 Implement and test idempotent constructor-sheet creation that preserves existing input links, status, totals, issues, sheet id, and sheet position on repeated setup.
- [x] 2.3 Implement and test constructor input reading with named-range preference and label-based compatibility fallback.
- [x] 2.4 Implement and test preflight validation for Drive-folder and Google-Doc syntax, resource kind, and access, with no calculation mutation on failure.
- [x] 2.5 Add focused formatting and activation of the constructor sheet without creating a parallel calculation table.
- [x] 2.6 Remove redundant Docs/current-spreadsheet output rows and reuse the Docs input as the single handoff link without clearing existing issues.

## 3. Persistent Run State and Dashboard Reporting

- [x] 3.1 Define and test the constructor run-state schema, phase transitions, run-id generation, serialization, persistence, and completed-phase idempotency guards.
- [x] 3.2 Implement and concurrency-test a single-active-run policy using a fake/document `LockService`, active run-id comparison, expected-phase compare-and-advance, six-hour stale/orphaned-session detection including missing live triggers, and stale continuation no-ops.
- [x] 3.3 Implement and test constructor progress/status writes for running, complete, complete-with-warnings, and fatal states without modal technical alerts.
- [x] 3.4 Define and test normalized constructor issues with phase, source kind, source, reason, review/confidence status, known impact, and suggested action.
- [x] 3.5 Implement and test aggregation of existing quality-gate, VLM, diagnostic, reconstruction, and skipped-calculation signals while preserving their source rows.
- [x] 3.6 Implement and test dashboard result rendering that reads totals and output links from completed Sheets/Docs results and never calculates duplicate totals.
- [x] 3.7 Implement and test `onOpen()` hydration of an existing constructor from persisted run state and reapplication of persisted visibility mode without starting pipeline work.
- [x] 3.8 Persist processed/total import-batch progress and render its percentage, visual bar, and last-update time on `Конструктор` after every batch.
- [x] 3.9 Render readable Moscow timestamps, overall phase progress after import, the explicit post-import reconstruction status, and the stable `Материальная ответственность` result label.

## 4. Reusable Non-UI Pipeline Entry Points

- [x] 4.1 Characterize and extract a non-modal reconstruction function from `populateZupReconstructionSheets()` that returns structured fill and recalculation results while preserving the legacy wrapper.
- [x] 4.2 Characterize and expose structured calculation results needed by the constructor without changing existing calculation-sheet formulas, layouts, or public wrappers.
- [x] 4.3 Characterize and extract a non-modal best-effort Docs handoff that returns written/skipped sections and issues while preserving bounded marker replacement and the legacy wrapper.
- [x] 4.4 Verify that all legacy entry points retain their existing externally observable behavior after extraction.

## 5. One-Action Orchestration and Automatic Continuation

- [x] 5.1 Define and test the minimal vendor-neutral adapter result contract (`sourceKind`, normalized result references, quality issues, completion/continuation status) and wrap the existing 1C:ZUP import as the only phase-one adapter with source kind `payroll_slips`.
- [x] 5.2 Implement and test `Собрать расчет` startup: preflight inputs, atomically create or join the active run, update dashboard, and start the existing incremental import through the adapter with the constructor run id.
- [x] 5.3 Extend and test the persisted import-batch session with optional constructor continuation metadata without changing standalone import behavior.
- [x] 5.4 Add and concurrency-test the final-batch continuation hook that advances the matching active run automatically from import to reconstruction exactly once.
- [x] 5.5 Implement and test reconstruction, calculation, and Docs phase sequencing through the structured non-UI entry points.
- [x] 5.6 Implement and test automatic continuation through review issues, ending as `Готово с замечаниями` while retaining all calculable results.
- [x] 5.7 Implement and test fatal handling when import yields zero calculable rows, preserving diagnostics and skipping calculation/Docs mutation.
- [x] 5.8 Implement and test `Повторить последний запуск` as a successor run with a new run id, `parentRunId`, copied valid completed-phase markers, and restart at the first incomplete phase.
- [x] 5.9 Test retry behavior separately for validation/import, reconstruction, calculation, and Docs failures, proving completed phases and durable results are not repeated or cleared.
- [x] 5.10 Test repeated build, trigger, retry, and manual continuation interleavings to prove locking, run-id rejection, phase idempotency, and absence of duplicate output.
- [x] 5.11 Add and test a deduplicated five-minute watchdog that resumes the same persisted import/post-import run when a one-shot trigger is lost and removes itself after terminal completion.
- [x] 5.12 Split recognition completion from derived import-sheet materialization, persist an explicit import stage/finalization checkpoint, and prove a timeout after the last source resumes finalization without recognizing that source again.
- [x] 5.13 Add a persisted per-target reconstruction checkpoint with step duration/heartbeat reporting, execute one bounded reconstruction target per continuation, and preserve the legacy synchronous wrapper.
- [x] 5.14 Publish source-level provisional review issues after every durably committed recognition result, reconcile them by stable issue identity during retries/final audit, and test that automatic continuations never duplicate or hide unresolved issues.
- [x] 5.15 Split final diagnostic audit into idempotent family-specific and row-chunk checkpoints so one large calculation sheet cannot restart the whole audit.
- [x] 5.16 Remove optional cross-sheet diagnostics from the constructor's critical path while preserving the resumable technical diagnostic operation.
- [x] 5.17 Classify transient Google service failures, release only the current phase lease, and automatically retry the same persisted checkpoint up to a bounded limit before failing the run.
- [x] 5.18 Recognize the existing vacation/average-earnings sheet semantically, synchronize the reconstructed system average into the questionnaire, and keep manual average earnings as an explicitly selected exception.

## 6. Sheet Visibility and Menu Simplification

- [x] 6.1 Implement and test sheet classification into constructor, primary calculation, reconstruction, and technical import/diagnostic groups without depending exclusively on 1C source names.
- [x] 6.2 Implement and test normal mode so the constructor is shown before every other existing sheet is hidden.
- [x] 6.3 Implement and test calculation-detail mode so only the constructor and five primary calculation sheets are visible.
- [x] 6.4 Implement and test technical mode so every existing sheet is visible.
- [x] 6.5 Verify all visibility operations preserve values, formulas, formatting, dimensions, ordering, and sheet identifiers.
- [x] 6.6 Replace the two top-level menus with `Конструктор требований`, direct constructor/visibility actions, and a technical submenu while preserving legacy callable function names.
- [x] 6.7 Add and test persisted visibility-mode restoration from `onOpen()` when the constructor already exists.

## 7. Regression, Deployment, and Workbook Smoke Test

- [x] 7.1 Run the constructor test through RED/GREEN cycles and run all existing Node test files after every implementation group.
- [x] 7.2 Run `git diff --check`, review the diff for unrelated changes, and verify `.clasp.json`, calculation methodology, category rules, VLM prompts, and worksheet formulas were not changed unintentionally.
- [x] 7.3 Push the verified Apps Script files with `clasp push` and record the deployed Git commit in the handoff.
- [x] 7.4 In the working spreadsheet, create/update `Конструктор`, preserve the two current links, and verify normal mode leaves only the constructor visible.
- [x] 7.5 Run a constructor smoke calculation and verify automatic batch continuation, Sheets-first updates, final status/totals, and non-blocking issue reporting.
- [x] 7.6 Verify calculation-detail and technical visibility modes against the Drive backup and confirm no sheet data, order, or identifiers changed.
- [x] 7.7 Verify Docs content outside the managed markers is unchanged and record any unavailable optional claim facts as constructor issues.
- [x] 7.8 Prepare the final report with backup URL, tests, deployed commit, workflow behavior, known warnings, and rollback instructions.

## 8. Property-safe constructor state

- [x] 8.1 Add RED tests that reproduce a run with dozens of Russian-language recognition issues and results whose JSON exceeds one Document Property value.
- [x] 8.2 Implement UTF-8-aware bounded chunks, a versioned atomic manifest, exact load/round-trip verification, and cleanup of obsolete generations while retaining direct storage for small states.
- [x] 8.3 Add regression coverage proving an interrupted large-state write does not replace the previously committed state and every stored value remains below the safety limit.
- [x] 8.4 Reconcile quality/VLM/skipped-file observations by stable source identity so a technical `OK` row cannot duplicate a source warning.
- [x] 8.5 Keep completed row-level calculation facts and derivative dependencies in authoritative Sheets, persist only compact durable summaries/references, and cover the aggregate Document Properties quota with a regression test.
- [x] 8.6 Run the full Apps Script test suite, strict OpenSpec validation, deploy to the bound project, and verify retry/continuation in the working spreadsheet.

## Deployment handoff — 2026-07-18

- Working spreadsheet: https://docs.google.com/spreadsheets/d/1lhAhovg1dRQuDjghunzbjLZ92TKprUhEPZjOEymdd0M/edit
- Drive backup: https://docs.google.com/spreadsheets/d/1TSJT97fRZe99ToiA1q-YHeu5vOoJmlC9ryFuQI-bMvI/edit
- Generated calculation Doc: https://docs.google.com/document/d/1qwMjRD99FNWnF2Wu8T7wbkSuvDOiH5tu82aSxovxArE/edit
- Deployed commits: `1465171` (aggregate Script Properties quota), `9cd72d9` (provisional/final issue reconciliation).
- Verification: all four Node Apps Script tests pass; `openspec validate simplify-constructor-workflow --strict` passes; direct Apps Script API retry resumed at `calculating`, completed `writing_doc`, and ended as `complete_with_warnings`.
- Final live totals: underpayment 41,448,609.53 RUB; indexation 1,809,050.14 RUB; material liability 214,432.30 RUB; total claims 43,472,091.97 RUB.
- Review issues: 138 after replacing legacy provisional source observations with final audit observations. Distinct substantive checks for the same payroll slip remain separate by design.
- Docs preservation: the prior input Doc `1Uy_r1TuOS-l8SPlvCtRSeMYEYK0ydYPugwKJJJwnAjE` retained its pre-run modified time (2026-07-16); the repeated calculation created a new Doc in the same Drive parent `1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm`.
- Rollback: restore the Drive backup for workbook state; for script code, switch to commit `067164a` and run `clasp push --force`. OAuth credentials and `.clasp.json` remain local and are not committed.

## 9. Pre-production review corrections

- [x] 9.1 Move constructor run/chunk state and ZUP batch sessions to Document Properties while keeping global configuration in Script Properties; add two-spreadsheet state and trigger isolation coverage.
- [x] 9.2 Replace whole-body rebuilding of approved Docs with strict paired-marker replacement and add structural preservation/malformed-marker tests.
- [x] 9.3 Protect audit columns B:F, persist the authoritative calculated claim snapshot separately, and build selected Docs from snapshot values keyed only by checkbox selections; test manual D/F mutations.
- [x] 9.4 Add Advanced Sheets v4 and a concise Drive/Sheets/scopes/API-key checklist to the installation documentation, then run the complete Apps Script test suite and diff validation.
