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

## 3. Persistent Run State and Dashboard Reporting

- [ ] 3.1 Define and test the constructor run-state schema, phase transitions, run-id generation, serialization, persistence, and completed-phase idempotency guards.
- [ ] 3.2 Implement and concurrency-test a single-active-run policy using a fake/document `LockService`, active run-id comparison, expected-phase compare-and-advance, six-hour stale/orphaned-session detection including missing live triggers, and stale continuation no-ops.
- [ ] 3.3 Implement and test constructor progress/status writes for running, complete, complete-with-warnings, and fatal states without modal technical alerts.
- [ ] 3.4 Define and test normalized constructor issues with phase, source kind, source, reason, review/confidence status, known impact, and suggested action.
- [ ] 3.5 Implement and test aggregation of existing quality-gate, VLM, diagnostic, reconstruction, and skipped-calculation signals while preserving their source rows.
- [ ] 3.6 Implement and test dashboard result rendering that reads totals and output links from completed Sheets/Docs results and never calculates duplicate totals.
- [ ] 3.7 Implement and test `onOpen()` hydration of an existing constructor from persisted run state and reapplication of persisted visibility mode without starting pipeline work.

## 4. Reusable Non-UI Pipeline Entry Points

- [ ] 4.1 Characterize and extract a non-modal reconstruction function from `populateZupReconstructionSheets()` that returns structured fill and recalculation results while preserving the legacy wrapper.
- [ ] 4.2 Characterize and expose structured calculation results needed by the constructor without changing existing calculation-sheet formulas, layouts, or public wrappers.
- [ ] 4.3 Characterize and extract a non-modal best-effort Docs handoff that returns written/skipped sections and issues while preserving bounded marker replacement and the legacy wrapper.
- [ ] 4.4 Verify that all legacy entry points retain their existing externally observable behavior after extraction.

## 5. One-Action Orchestration and Automatic Continuation

- [ ] 5.1 Define and test the minimal vendor-neutral adapter result contract (`sourceKind`, normalized result references, quality issues, completion/continuation status) and wrap the existing 1C:ZUP import as the only phase-one adapter with source kind `payroll_slips`.
- [ ] 5.2 Implement and test `Собрать расчет` startup: preflight inputs, atomically create or join the active run, update dashboard, and start the existing incremental import through the adapter with the constructor run id.
- [ ] 5.3 Extend and test the persisted import-batch session with optional constructor continuation metadata without changing standalone import behavior.
- [ ] 5.4 Add and concurrency-test the final-batch continuation hook that advances the matching active run automatically from import to reconstruction exactly once.
- [ ] 5.5 Implement and test reconstruction, calculation, and Docs phase sequencing through the structured non-UI entry points.
- [ ] 5.6 Implement and test automatic continuation through review issues, ending as `Готово с замечаниями` while retaining all calculable results.
- [ ] 5.7 Implement and test fatal handling when import yields zero calculable rows, preserving diagnostics and skipping calculation/Docs mutation.
- [ ] 5.8 Implement and test `Повторить последний запуск` as a successor run with a new run id, `parentRunId`, copied valid completed-phase markers, and restart at the first incomplete phase.
- [ ] 5.9 Test retry behavior separately for validation/import, reconstruction, calculation, and Docs failures, proving completed phases and durable results are not repeated or cleared.
- [ ] 5.10 Test repeated build, trigger, retry, and manual continuation interleavings to prove locking, run-id rejection, phase idempotency, and absence of duplicate output.

## 6. Sheet Visibility and Menu Simplification

- [ ] 6.1 Implement and test sheet classification into constructor, primary calculation, reconstruction, and technical import/diagnostic groups without depending exclusively on 1C source names.
- [ ] 6.2 Implement and test normal mode so the constructor is shown before every other existing sheet is hidden.
- [ ] 6.3 Implement and test calculation-detail mode so only the constructor and five primary calculation sheets are visible.
- [ ] 6.4 Implement and test technical mode so every existing sheet is visible.
- [ ] 6.5 Verify all visibility operations preserve values, formulas, formatting, dimensions, ordering, and sheet identifiers.
- [ ] 6.6 Replace the two top-level menus with `Конструктор требований`, direct constructor/visibility actions, and a technical submenu while preserving legacy callable function names.
- [ ] 6.7 Add and test persisted visibility-mode restoration from `onOpen()` when the constructor already exists.

## 7. Regression, Deployment, and Workbook Smoke Test

- [ ] 7.1 Run the constructor test through RED/GREEN cycles and run all existing Node test files after every implementation group.
- [ ] 7.2 Run `git diff --check`, review the diff for unrelated changes, and verify `.clasp.json`, calculation methodology, category rules, VLM prompts, and worksheet formulas were not changed unintentionally.
- [ ] 7.3 Push the verified Apps Script files with `clasp push` and record the deployed Git commit in the handoff.
- [ ] 7.4 In the working spreadsheet, create/update `Конструктор`, preserve the two current links, and verify normal mode leaves only the constructor visible.
- [ ] 7.5 Run a constructor smoke calculation and verify automatic batch continuation, Sheets-first updates, final status/totals, and non-blocking issue reporting.
- [ ] 7.6 Verify calculation-detail and technical visibility modes against the Drive backup and confirm no sheet data, order, or identifiers changed.
- [ ] 7.7 Verify Docs content outside the managed markers is unchanged and record any unavailable optional claim facts as constructor issues.
- [ ] 7.8 Prepare the final report with backup URL, tests, deployed commit, workflow behavior, known warnings, and rollback instructions.
