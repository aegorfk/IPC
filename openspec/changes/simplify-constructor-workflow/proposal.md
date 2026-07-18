## Why

The workbook exposes its internal import, reconstruction, quality, and calculation pipeline as 16 visible tabs and two technical menus. A normal user should instead provide source and output links once, start one operation, and receive a completed calculation plus clearly marked uncertainties without learning the implementation structure.

## What Changes

- Add one user-facing `Конструктор` sheet with fields for a Google Drive source folder and an empty Google Doc, one primary `Собрать расчет` action, progress, totals, and a compact `Требует внимания` section. Reuse the Google Doc input as the handoff link instead of duplicating output links.
- Add a top-level constructor orchestrator that reuses the existing payroll import, normalization, reconstruction, indexation, material-liability, vacation, and Docs-writing functions in their required order.
- Continue the workflow automatically when source data is ambiguous or incomplete; preserve calculable results and publish every disputed item with its source, reason, confidence/review status, and known impact instead of blocking the whole run.
- Keep Google Sheets as the calculation system of record: the orchestrator writes into the existing calculation and reconstruction sheets before generating the Google Docs explanation.
- Hide calculation, reconstruction, import, VLM, and diagnostic sheets during normal use. Provide separate `Показать детализацию` and `Технический режим` actions for reversible access without deleting or rebuilding the sheets.
- Replace the two implementation-oriented menus with one concise `Конструктор требований` menu. Keep legacy entry points callable for compatibility and expose diagnostic operations only in technical mode.
- Replace intermediate technical alerts with persistent status on `Конструктор` and lightweight progress notifications. Reserve a compact completion/error message for the end of a run.
- Persist long constructor runs through a small atomic manifest and bounded Script Property chunks so detailed issues and phase checkpoints cannot exceed Google's per-property value limit.
- Reconcile provisional recognition signals by source so one payroll slip does not produce duplicate `Предупреждение` and `OK` rows for the same underlying observation.
- Design source classification and orchestration around the normalized internal model rather than 1C-specific sheet names, retaining 1C:ZUP as the priority payroll-slip adapter.
- Leave extension points for later adapters that read employment contracts and local normative acts and for later generation of a draft statement of claim; those legal-document capabilities are not implemented in this change.

## Capabilities

### New Capabilities
- `claim-constructor-workflow`: One-screen intake, automatic orchestration, soft-warning reporting, result presentation, sheet visibility modes, and Docs handoff for the claim calculation workflow.

### Modified Capabilities
- None.

## Impact

- Apps Script UI and orchestration: `google-apps-script/SalaryIndexation.gs` and a focused constructor module if file extraction improves maintainability.
- Existing import/reconstruction pipeline: `google-apps-script/ZupImport.gs` remains the calculation input layer and may receive narrow reusable, non-UI entry points without changing normalized outputs.
- Existing Sheets: all current calculation and service tabs remain available and retain their structures; their default visibility and orchestration change.
- Google Docs: only the existing bounded auto-generated calculation block is updated after Sheets calculations complete.
- Tests: Node `vm` characterization tests for orchestration order, non-blocking disputed data, visibility modes, dashboard state, and legacy compatibility.
- Deployment: the bound Apps Script project and its Google Sheets UI; no new external service or OAuth scope is required for the first phase.
