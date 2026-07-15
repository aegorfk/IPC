## Context

The bound Google Sheets workbook is both the calculation system of record and the current user interface. Its normal view exposes 16 tabs: five primary calculation tabs, five `Из_1С_*` reconstruction tabs, and multiple `Импорт_1С_*` audit/diagnostic tabs. `onOpen()` also exposes two menus whose commands mirror internal implementation steps.

The existing implementation already contains the required domain pipeline:

- Drive folder discovery from the label `Расчетные листы:`;
- deterministic/OCR/VLM payroll-slip import with resumable batches;
- normalized import rows, quality gates, and audit logs;
- reconstruction of salary, premium, and vacation calculation sheets;
- indexation and Article 236 calculations written into Sheets;
- bounded Google Docs generation using auto-generated block markers.

The change must make that pipeline usable through one action without replacing it. Google Sheets remains authoritative for calculations, while Google Docs explains results already calculated in Sheets. Ambiguous recognition is expected and must remain auditable without blocking every calculable result.

## Goals / Non-Goals

**Goals:**

- Give a normal user one visible `Конструктор` sheet with two link inputs, one primary action, durable progress, totals, and a concise review list; the Docs input doubles as the handoff link, with no redundant link rows.
- Reuse existing import, reconstruction, calculation, and Docs functions through non-UI entry points.
- Automatically resume the workflow after Apps Script batch/import continuation triggers.
- Continue through disputed or incomplete source rows and finish with warnings whenever a partial but meaningful result is possible.
- Hide internal sheets by default without deleting, recreating, or bypassing them.
- Keep detailed calculation and technical modes reversible.
- Preserve existing callable entry points and current worksheet structures.
- Keep the orchestration vendor-neutral above the payroll adapter boundary, with 1C:ZUP as the priority source adapter.

**Non-Goals:**

- Do not calculate entitlements from employment contracts or local normative acts in this change.
- Do not generate a complete statement of claim in this change.
- Do not replace Google Sheets calculations with Docs-only or in-memory calculations.
- Do not redesign formulas, layouts, category rules, VLM prompts, or legal calculation methodology unrelated to orchestration.
- Do not delete service sheets or remove audit data.
- Do not introduce a separate web application, database, or new external dependency.

## Decisions

### 1. Use a worksheet facade rather than a sidebar or web app

The system SHALL create or update one `Конструктор` sheet. It will contain the source labels `Расчетные листы:` and `Расписанный расчет:`. Stable named ranges may point to the input and status cells, but label-based fallback remains available for workbooks using the current labels.

This approach keeps the user inside the existing system of record, supports persistent progress across long Apps Script runs, and avoids a parallel HTML UI. A sidebar was rejected because its narrow transient state is a poor fit for long resumable imports. A separate web app remains a possible future facade after the workflow stabilizes.

The setup operation is idempotent. Re-running it updates formatting and missing structural elements without clearing user links or prior result data.

### 2. Add a state-machine orchestrator above existing core functions

The constructor will use explicit phases:

1. `validating`
2. `importing`
3. `reconstructing`
4. `calculating`
5. `writing_doc`
6. `complete` or `complete_with_warnings`
7. `failed` only for fatal infrastructure/input failures

Run state contains a run id, timestamps, current phase, progress text, structured batch progress (`processed`, `total`, and percentage), source references, and accumulated issues. State is persisted in Script Properties so scheduled batch continuations can resume without user action. The dashboard renders structured progress as a compact text-and-block bar and is a presentation of that state, not the only state store.

Only one constructor run may be active for a spreadsheet. Start, retry, manual continuation, and scheduled continuation acquire `LockService.getDocumentLock()` and perform compare-and-advance updates against the active run id and expected phase. A second `Собрать расчет` invocation while the active run is fresh returns that run and displays its current status; it MUST NOT create another run or repeat a phase. A continuation carrying an old run id is a no-op.

An active run is stale only when its last update is older than six hours and there is no fresh matching import continuation: either no matching batch session/trigger remains, or the matching batch session itself has not updated for six hours and has no live continuation trigger. Starting again after that condition marks the stale run failed and creates a new run linked by `parentRunId`. Every phase records `pending`, `running`, or `done`; code checks the phase state under the document lock before entering side effects and records completion under the same run id.

Existing UI wrappers show modal alerts and combine computation with presentation. The implementation will preserve them for legacy callers but add or reuse focused non-UI functions that return structured results. The constructor orchestrator calls those functions in sequence.

### 3. Continue automatically after resumable import

`startZupFolderImportBatch_()` already schedules continuation when the import cannot finish in one execution. The constructor will attach its run id and next phase to the persisted batch session. When the final batch writes import outputs, it invokes a small continuation hook that advances the constructor to reconstruction and calculations.

Because an Apps Script one-shot clock trigger may be delayed or disappear before the next batch runs, an active constructor run also owns one deduplicated recurring watchdog trigger. The watchdog runs every five minutes, joins the persisted run id, and invokes the same idempotent import or post-import continuation under the existing locks. It never creates a successor run and never resets `nextIndex`. The watchdog is deleted when the run reaches a terminal state, so it is a recovery path rather than a parallel scheduler.

Manual `Продолжить пакетный импорт` remains callable in technical mode, but it is not part of the normal workflow. Repeated continuation calls MUST be idempotent for a completed phase.

Import completion with zero calculable normalized rows is fatal. The constructor retains import diagnostics and issues but does not publish a successful zero-value calculation or update Docs.

### 4. Distinguish fatal failures from review issues

A missing/invalid Drive folder link, missing/invalid Google Doc link, inaccessible required resource, or unrecoverable state corruption is fatal because the requested workflow cannot start or safely continue.

Recognition mismatches, VLM-derived rows, unknown categories, missing optional dates, mixed companies/employees, partial periods, skipped calculation rows, and unavailable optional claim parameters are review issues. They do not stop other phases. The run finishes as `complete_with_warnings` and publishes the calculable result.

Issues use one normalized shape:

- severity (`warning` or `error` for display; fatality is a separate workflow decision);
- phase;
- source kind (for phase one, `payroll_slips` supplied by the 1C:ZUP adapter);
- source file/sheet/row when available;
- concise reason;
- confidence or review status when available;
- known numerical impact, or `не определено`;
- suggested user action.

The orchestrator aggregates existing quality-gate, VLM, diagnostic, and skipped-row signals rather than inventing a second recognition-quality system.

### 5. Keep Sheets as the calculation system of record

The orchestrator SHALL first write normalized/reconstructed data to the existing `Из_1С_*` and calculation structures and then call the current recalculation functions. Dashboard totals are read from structured calculation results or the already updated worksheets. They are not independently recomputed in the constructor sheet.

Google Docs generation runs only after Sheets calculations complete. It updates only the bounded auto-generated block. If a Docs subsection cannot be generated because optional legal facts are missing, that subsection becomes a review issue while other calculated content remains available.

### 6. Provide three reversible visibility modes

- **Normal mode:** only `Конструктор` is visible.
- **Calculation detail mode:** `Конструктор` plus the five primary calculation sheets are visible.
- **Technical mode:** all sheets are visible, including `Из_1С_*` and `Импорт_1С_*` audit sheets.

Visibility changes call `hideSheet()`/`showSheet()` only. They MUST NOT delete, clear, reorder, or recreate existing calculation/service sheets. The constructor sheet is shown before any hide operation so the workbook always retains at least one visible sheet. The selected mode is stored as a document-level property and re-applied only when needed.

When the workbook opens and a constructor sheet already exists, `onOpen()` reads the persisted run and visibility mode, refreshes the dashboard from that state, and reapplies the visibility mode. It does not start or repeat calculation phases and does not create a constructor sheet implicitly.

### 7. Replace menu complexity while preserving legacy functions

`onOpen()` will expose one `Конструктор требований` menu with:

- `Открыть конструктор`;
- `Собрать расчет`;
- `Показать детализацию`;
- `Обычный режим`;
- a `Технические операции` submenu containing diagnostic/import maintenance actions.

Existing public function names remain callable from Apps Script and tests. Normal constructor execution uses non-modal status writes and toasts; modal technical settings such as VLM configuration are available only through the technical submenu.

### 8. Preserve an adapter boundary for future legal sources

The constructor orchestrates normalized facts and calculation capabilities, not 1C-specific labels. Payroll import remains the only implemented source adapter in this change. The run result records source kinds so later employment-contract and local-act adapters can contribute normalized entitlement facts without changing the constructor UI or calculation/Docs sequencing.

The minimal adapter result contract contains `sourceKind`, normalized row/result references, quality issues, and import completion/continuation status. A payroll adapter wraps the existing 1C:ZUP incremental import and is the only registered implementation. The orchestrator consumes this contract rather than reading 1C service-sheet presentation names directly.

No speculative contract/LNA parser interface is added until a concrete adapter is implemented; the current design only avoids coupling the orchestrator to `Импорт_1С_*` presentation names where a normalized return value is available.

### 9. Define retry as a successor run

`Повторить последний запуск` creates a new run id with `parentRunId` pointing to the failed/stale run. It copies completed-phase markers and durable issues/results that remain valid, then starts at the first incomplete phase:

- validation/import failure restarts at validation/import and reuses existing incremental file state with `force: false`;
- reconstruction failure restarts at reconstruction without repeating a completed import;
- calculation failure restarts at calculation without repeating import/reconstruction;
- Docs failure restarts only the bounded Docs handoff.

Old scheduled triggers remain harmless because their run id no longer matches the active successor. Retry never clears completed calculation sheets or audit data before it knows which phase must repeat.

### 10. Test through characterization and fake Apps Script boundaries

Node `vm` tests will characterize the existing core calls before orchestration edits. Focused tests will cover phase ordering, asynchronous continuation, idempotent setup/resume, soft-warning completion, fatal validation, issue aggregation, visibility modes, link preservation, menu structure, and bounded Docs handoff. Google APIs are mocked only at external boundaries.

Concurrency tests will interleave duplicate build requests, matching/stale scheduled continuations, and retry requests against a fake document lock. Reopen tests will call `onOpen()` with persisted run/visibility state and verify that presentation is restored without invoking pipeline work.

## Risks / Trade-offs

- **Apps Script execution limits interrupt a one-click run** → Persist phase/run state and automatically continue after the existing batch trigger completes.
- **Hidden tabs make debugging harder** → Provide reversible calculation-detail and technical modes; never delete audit sheets.
- **A warning can materially affect totals** → Show impact as unknown when it cannot be quantified and always retain source/audit links.
- **Legacy UI wrappers emit modal alerts** → Keep wrappers for compatibility but route constructor execution through structured non-UI functions.
- **Dashboard totals drift from calculation sheets** → Read results after Sheets recalculation; never maintain parallel formulas.
- **Docs generation lacks optional case facts** → Generate available sections, record missing facts as issues, and keep the Sheets result complete.
- **Re-running after a partial failure duplicates data** → Use run ids and idempotent phase guards; reuse existing incremental import state.
- **Two executions race on shared state** → Enforce a single active run with document locking, expected-phase compare-and-advance, and stale run-id rejection.
- **Future LNA/contract scope leaks into phase one** → Limit phase one to source-kind metadata and vendor-neutral orchestration; no new legal parser.

## Migration Plan

1. Keep the Drive backup `Расчет индексации — BACKUP до конструктора — 2026-07-10` as the manual rollback copy.
2. Add characterization tests and the constructor sheet/setup functions without changing default visibility.
3. Add orchestrator state and soft-warning aggregation behind a new constructor entry point.
4. Wire automatic continuation from the existing batch-import completion path.
5. Add visibility modes and the simplified menu after calculation regression tests are green.
6. Deploy to the bound Apps Script project and run against the backed-up working workbook data.
7. Verify normal, detail, and technical modes; verify existing calculation values and Docs bounded block against the backup.
8. Roll back by restoring the prior Git commit and `clasp push`, or continue work in the Drive backup if workbook state was unexpectedly changed.

## Open Questions

None blocking implementation. Layout coordinates, colors, and wording may be adjusted during implementation as long as the named inputs, persistent status, totals, issues, and visibility behavior remain compliant with the capability spec.
