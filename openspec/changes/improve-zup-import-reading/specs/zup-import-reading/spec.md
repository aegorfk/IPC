## ADDED Requirements

### Requirement: Source folder fallback
The system SHALL import from a configured Drive folder URL when no source folder link is found in the spreadsheet.

#### Scenario: Configured folder is used
- **WHEN** the spreadsheet does not contain a Drive folder link
- **THEN** the import uses `ZUP_IMPORT_SETTINGS.SOURCE_FOLDER_URL`

### Requirement: Source variant selection
The system SHALL group source variants of the same payroll slip and import only one canonical variant.

#### Scenario: Google Docs and HTML duplicate exist
- **WHEN** a Google Docs file and `.html` file normalize to the same payroll-slip key
- **THEN** the importer reads one canonical file and records the skipped duplicate variants in quality output

### Requirement: PDF OCR fallback
The system SHALL attempt to convert PDF payroll slips to Google Docs using Advanced Drive service OCR when no better duplicate exists.

#### Scenario: PDF OCR service is available
- **WHEN** a PDF payroll slip is selected and Advanced Drive service is enabled
- **THEN** the importer creates a temporary OCR Google Doc, parses it, and records OCR usage in quality output

#### Scenario: PDF OCR service is unavailable
- **WHEN** a PDF payroll slip is selected and Advanced Drive service is not enabled
- **THEN** the importer records a clear quality warning and does not abort the whole import

### Requirement: Normalized row metadata
The system SHALL include work-day, paid-day, payment-statement, and statement-date fields in normalized import rows.

#### Scenario: Accrual row has day counts
- **WHEN** an accrual row contains period, working days, and paid days
- **THEN** `Импорт_1С_ЗУП` records `Рабочие дни` and `Оплачено дней`

#### Scenario: Payment row has statement text
- **WHEN** a payment row contains a bank statement number and date
- **THEN** `Импорт_1С_ЗУП` records `Ведомость` and `Дата ведомости` separately from the row label

### Requirement: Import quality report
The system SHALL write an import quality sheet with one row per selected source group.

#### Scenario: Import completes
- **WHEN** import processing finishes
- **THEN** `Импорт_1С_Качество` lists source file, selected variant, duplicates, row count, totals, parsed totals, status, and warnings

### Requirement: Section total validation
The system SHALL compare parsed rows with payroll-slip totals for `Начислено`, `Удержано`, and `Выплачено`.

#### Scenario: Parsed total differs from source total
- **WHEN** a section parsed total differs from the source section total by more than one kopeck
- **THEN** the quality report marks the section mismatch as a warning

### Requirement: Dry-run import
The system SHALL provide a dry-run import command that does not overwrite main import outputs.

#### Scenario: Dry-run command is used
- **WHEN** the user runs dry-run import
- **THEN** only preview/quality output is written and `Импорт_1С_ЗУП`, `Импорт_1С_Свод`, and `Импорт_1С_Диагностика` remain untouched

### Requirement: Incremental import state
The system SHALL persist import state and detect unchanged selected source files.

#### Scenario: File is unchanged
- **WHEN** a selected source file has the same id, updated timestamp, size, and parser version as the previous import
- **THEN** quality output marks the file as unchanged and preserves its state metadata

### Requirement: Classification coverage
The system SHALL classify salary, premium, vacation, top-up, business trip, sick leave, material aid, severance, unpaid vacation, and withholding rows.

#### Scenario: Special accrual text is parsed
- **WHEN** a row text contains a known special accrual phrase such as `Командировка`, `Доплата до оклада`, or `НДФЛ`
- **THEN** the row receives the matching category instead of falling back to salary

### Requirement: Reconstruction target sheets
The system SHALL create adjacent structural sheets that mirror the target calculation tabs for payroll-slip reconstruction.

#### Scenario: User creates reconstruction sheets
- **WHEN** the user runs the reconstruction-sheet command
- **THEN** the system creates `Из_1С_Оклад`, `Из_1С_Ежемесячные`, `Из_1С_Ежеквартальные`, `Из_1С_Ежегодные`, and `Из_1С_Отпуска` next to their source sheets
- **AND** the created sheets preserve headers, formatting, and formulas from the actually populated source range
- **AND** fields intended to be filled from payroll slips or recalculated after reconstruction are blank

#### Scenario: User creates one reconstruction sheet
- **WHEN** the full reconstruction-sheet command exceeds Apps Script time limits
- **THEN** the user can create any single `Из_1С_*` sheet from a dedicated menu command

### Requirement: Reconstruction sheet population
The system SHALL populate `Из_1С_*` sheets from normalized payroll-slip import rows without modifying the original target sheets.

#### Scenario: User populates reconstruction sheets
- **WHEN** normalized rows exist in `Импорт_1С_ЗУП`
- **THEN** the system preserves the target sheets' row/period structure as the recalculation scaffold
- **AND** the system fills `Из_1С_Оклад` with period, day counts, and imported salary accruals
- **AND** the system fills premium reconstruction sheets with paid amounts matched to scaffold periods while leaving unmatched rows blank
- **AND** the system fills `Из_1С_Отпуска` with vacation dates, day counts, and imported vacation amounts
- **AND** formulas inside `Из_1С_*` sheets reference other `Из_1С_*` sheets instead of the original target sheets

### Requirement: Polza VLM extraction fallback
The system SHALL optionally use Polza.ai multimodal extraction when deterministic payroll-slip parsing produces no normalized rows.

#### Scenario: Deterministic parser cannot read a supported source
- **WHEN** a selected PDF, image, HTML, CSV, Google Doc, or Google Sheet source is read but no import rows are recognized
- **AND** `POLZA_API_KEY` is configured in Apps Script script properties
- **THEN** the importer sends the source content to Polza.ai using a cost-optimized default model that supports file/image input and structured outputs
- **AND** the model response is constrained by a strict JSON Schema for employee, period, totals, row category, row kind, day counts, dates, amounts, evidence text, and confidence
- **AND** recognized VLM rows are normalized into the same `Импорт_1С_ЗУП` schema as deterministic rows

#### Scenario: VLM fallback is unavailable or risky
- **WHEN** the API key is missing, the file is larger than the configured VLM byte limit, or Polza.ai returns an error
- **THEN** the import does not abort
- **AND** the quality report and VLM audit log explain why the fallback did not produce rows

#### Scenario: VLM fallback is used
- **WHEN** Polza.ai returns structured extraction data
- **THEN** the system writes a row to `Импорт_1С_VLM` with file, MIME, model, status, row count, usage/cost when supplied, warnings, and the raw structured JSON
- **AND** quality warnings mark the rows as VLM-derived and require review against `sourceText` and section-total validation
