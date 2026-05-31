## 1. OpenSpec And Contract

- [x] 1.1 Create OpenSpec change artifacts for the ZUP import-reading capability
- [x] 1.2 Update the markdown project specification to mirror the OpenSpec contract

## 2. Output Schema

- [x] 2.1 Add payment statement and statement-date columns to normalized import rows and summary output
- [x] 2.2 Add import quality and import state sheet definitions
- [x] 2.3 Update diagnostics and summary indexes after schema expansion

## 3. Parser Quality

- [x] 3.1 Extract section totals from payroll slips
- [x] 3.2 Compare parsed section totals with source section totals and emit warnings
- [x] 3.3 Tighten premium and special accrual classification by period and row text

## 4. File Reading

- [x] 4.1 Record duplicate source variants and selected canonical variant in quality output
- [x] 4.2 Add PDF OCR conversion through Advanced Drive service with graceful fallback
- [x] 4.3 Add incremental import state keyed by file metadata and parser version

## 5. User Workflows

- [x] 5.1 Add dry-run import menu/function that writes preview quality output only
- [x] 5.2 Preserve full import behavior for normal imports and force refreshes

## 6. Verification And Publish

- [x] 6.1 Add or update local tests for new parser fields, quality warnings, and dry-run behavior
- [x] 6.2 Run local tests and OpenSpec validation
- [x] 6.3 Commit and push the completed implementation

## 7. Reconstruction Sheet Structure

- [x] 7.1 Add a menu command that creates adjacent `Из_1С_*` sheets from target tabs
- [x] 7.2 Preserve headers, formatting, and formulas while clearing fields sourced from payroll slips
- [x] 7.3 Run local tests and OpenSpec validation, then commit and push

## 8. Reconstruction Sheet Population

- [x] 8.1 Read normalized `Импорт_1С_ЗУП` rows into a reconstruction model
- [x] 8.2 Fill `Из_1С_Оклад`, premium sheets, and `Из_1С_Отпуска` from imported rows
- [x] 8.3 Retarget formulas inside `Из_1С_*` sheets to other reconstruction sheets
- [x] 8.4 Run local tests and OpenSpec validation, then commit and push

## 9. VLM Extraction Fallback

- [x] 9.1 Select a default Polza model for payroll-slip extraction by quality/cost criteria
- [x] 9.2 Add Polza VLM fallback with strict JSON Schema output for PDF/image/text sources that deterministic parsing cannot read
- [x] 9.3 Add VLM audit output, model/settings visibility, and documentation
- [x] 9.4 Run local tests and OpenSpec validation, then commit and push
- [x] 9.5 Add forced VLM trial mode and orange highlighting for disputed import rows
- [x] 9.6 Add resumable batch import for slow VLM/PDF recognition and Art. 236 payment-statement date wiring
- [x] 9.7 Add non-blocking QG review sheet, current-run VLM audit reset, and automatic `Из_1С_*` recalculation
- [x] 9.8 Add optional Langfuse traces for VLM extraction and quality-gate output
