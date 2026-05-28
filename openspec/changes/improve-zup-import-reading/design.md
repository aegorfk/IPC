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

## Risks / Trade-offs

- Advanced Drive service may not be enabled → Catch the failure and show a clear PDF OCR warning instead of aborting the import.
- Google Drive OCR can be imperfect or slow → Keep original PDF skipped/quality status visible and prefer existing Google Docs/HTML duplicates when available.
- Incremental state can become stale after parser changes → Include parser version in state signatures and support full-force import.
- Additional columns change downstream indices → Update all summary, diagnostics, and tests in the same change.
