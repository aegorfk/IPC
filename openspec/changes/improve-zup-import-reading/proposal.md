## Why

The current 1C ZUP import can read many Google Docs and HTML payroll slips, but it still loses quality signals: PDFs are skipped, duplicate source variants are opaque, section totals are not validated, payment statement metadata is mixed into row labels, and repeated imports always rewrite everything. This change makes the import layer auditable enough to trust before using it to reconstruct working sheets.

## What Changes

- Add OCR/conversion support for PDF payroll slips through the Advanced Drive service, with a clear diagnostic when the service is not enabled.
- Add Polza.ai VLM extraction fallback for supported files that deterministic parsing/OCR cannot turn into normalized rows, using strict JSON Schema output and a separate audit log.
- Add an import quality sheet that reports selected source variant, duplicate variants, row counts, section totals, parsed totals, missing employee/period, and warnings per file.
- Validate parsed section rows against payroll-slip section totals for `Начислено`, `Удержано`, and `Выплачено`.
- Split payment statement metadata into separate `Ведомость` and `Дата ведомости` fields instead of keeping it only inside `Вид начисления`.
- Tighten premium and special accrual classification by period and text: monthly, quarterly, annual, vacation, unpaid vacation, salary top-up, business trips, sick leave, material aid, severance, and withholdings.
- Add incremental import state keyed by Drive file id, updated timestamp, size, and selected variant, while preserving a force-full-import path.
- Add a dry-run import command that writes only quality/preview output and does not overwrite the main import, summary, or diagnostics sheets.
- Add a model/settings check command and document the required `POLZA_API_KEY` script property.
- Keep the import specification in OpenSpec and reflect the active contract there.

## Capabilities

### New Capabilities
- `zup-import-reading`: Reading, parsing, validating, and reporting 1C ZUP payroll-slip imports from Drive sources.

### Modified Capabilities
- None.

## Impact

- Apps Script files: `google-apps-script/ZupImport.gs`, `google-apps-script/SalaryIndexation.gs`, `google-apps-script/appsscript.json`.
- Tests: `tests/salary-indexation-date-logic.test.js`.
- Docs/specs: `openspec/changes/improve-zup-import-reading/**`, `salary-indexation-spec.md`.
- Google Apps Script deployment will require enabling the Advanced Drive service for PDF OCR and reauthorizing any new Drive scopes.
