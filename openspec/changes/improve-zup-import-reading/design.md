## Context

The project is a Google Apps Script automation for a Google Sheets workbook. `ZupImport.gs` reads payroll slips from a Google Drive folder, normalizes rows into `Импорт_1С_ЗУП`, aggregates them into `Импорт_1С_Свод`, and compares imported values with working tabs in `Импорт_1С_Диагностика`.

The current parser now handles real 1C HTML table structure, but the import still needs production-grade observability and controls: PDF OCR, source variant selection visibility, section-total checks, dry-run mode, and incremental state.

## Goals / Non-Goals

**Goals:**
- Make every file outcome visible in an import quality sheet.
- Parse PDF files when the Advanced Drive service is enabled.
- Preserve row-level payment statement metadata in separate columns.
- Avoid duplicate rows from Google Docs/HTML/PDF variants of the same payroll slip.
- Allow safe dry-run inspection before overwriting import output.
- Make repeated imports faster and more explicit through a persistent import-state sheet.
- Use Polza.ai VLM extraction as an auditable fallback when deterministic parsing cannot read a source.

**Non-Goals:**
- Do not implement external OCR services outside Google Drive.
- Do not mutate working calculation tabs from imported data.
- Do not guarantee perfect legal classification of every possible 1C accrual name; ambiguous rows remain visible in quality output.

## Decisions

1. **Use Advanced Drive service for PDF OCR.**
   - Rationale: Apps Script `DriveApp` cannot OCR PDF content directly; Advanced Drive service exposes Drive API conversion/OCR behavior.
   - Alternative considered: require users to manually provide Google Docs duplicates. This remains a fallback, but not the only path.

2. **Keep source variants grouped by normalized file name and choose one canonical variant.**
   - Priority: Google Docs, HTML, Google Sheets, CSV, PDF, Excel/other.
   - Rationale: Google Docs exports are generally easiest to parse, HTML is next-best, PDF is slower and OCR-dependent.

3. **Add `Импорт_1С_Качество` and `Импорт_1С_Состояние` sheets.**
   - Quality sheet is user-facing and summarizes correctness signals.
   - State sheet is machine-facing and stores file ids, modified timestamps, size, selected variant, row count, and signature.

4. **Dry-run writes preview/quality only.**
   - Rationale: users can inspect parser quality without destroying the last accepted import.

5. **Section totals are diagnostic, not blocking.**
   - Rationale: partial OCR or ambiguous layout should still expose parsed rows; mismatches are warnings in quality output.

6. **Use a hybrid deterministic + VLM pipeline.**
   - Default: deterministic parsing for Google Docs/HTML/CSV/Sheets and Drive OCR for PDF.
   - Fallback: if no normalized rows are found, call Polza.ai Chat Completions with a strict JSON Schema.
   - Default model: `google/gemini-3.1-flash-lite`, because the live Polza catalog lists file/image input, structured outputs, long context, and a low prompt/completion price relative to stronger file-capable models.
   - Override: set the Apps Script property `ZUP_VLM_MODEL` to a stronger model such as `google/gemini-3.5-flash` when quality is more important than cost.
   - Trial/repair mode: if deterministic rows do not reconcile with source section totals, the importer retries the file through `ZUP_IMPORT_SETTINGS.VLM_FORCE_MODEL` (`google/gemini-3.5-flash`) and keeps the VLM result only when it improves total validation. A script property can still force specific file-name fragments, and `off` disables that manual force pattern.
   - Runtime control: normal and forced imports run through a resumable batch wrapper. Each execution handles a small bounded file batch, persists progress in script properties, writes partial import/quality/state output, and schedules a time-driven trigger for the next batch so slow VLM/PDF recognition does not hit the Apps Script execution limit.
   - Quality gates: extracted rows carry organization, employee, accrual date, and period; quality output verifies organization, employee, and contiguous monthly coverage without blocking the pipeline. Mismatches, blank organization, raw employee variants, file warnings, and data-completeness metrics are written to `Импорт_1С_QG` for manual verification.
   - Reconstruction semantics: salary uses payroll-slip factual worked days and Consultant production-calendar month workdays; premium sheets use accrued premiums by accrual period; vacation rows are built from accrued vacation rows and matched to vacation payment rows within the same source file. Payment statement names/dates are written to auxiliary columns so Art. 236 compensation can use the actual statement date. After reconstruction fill, `Из_1С_*` sheets are recalculated through the same indexation engine.
   - Rationale: VLM extraction helps with bad OCR and scanned documents, while deterministic parsing remains cheaper and more reproducible for sources that already expose tables/text.

## Risks / Trade-offs

- Advanced Drive service may not be enabled → Catch the failure and show a clear PDF OCR warning instead of aborting the import.
- Google Drive OCR can be imperfect or slow → Keep original PDF skipped/quality status visible and prefer existing Google Docs/HTML duplicates when available.
- Incremental state can become stale after parser changes → Include parser version in state signatures and support full-force import.
- Additional columns change downstream indices → Update all summary, diagnostics, and tests in the same change.
- VLM can misread payroll amounts → Require strict schema output, preserve `sourceText`, log raw JSON/usage in `Импорт_1С_VLM`, and keep section-total warnings in quality output.
- VLM cost can grow on large PDFs → Limit direct file payload size, default to a low-cost file-capable model, and allow model override through script properties.
- Manual review can miss disputed rows → Highlight VLM-derived rows, quality warnings, QG issues, and diagnostic mismatches with orange fill in the service sheets.
- Reconstructed target structures can hide missing source fields → Highlight only the disputed input cells in `Из_1С_*` sheets: missing imported amounts/days/dates, VLM-derived values, and periods whose organization/employee needs review.
- Trusted automatic fills can be hard to distinguish from formulas → Highlight imported/source-backed cells with green fill, while orange review marks override green.
