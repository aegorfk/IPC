# zup-import-reading Specification

## Purpose
TBD - created by archiving change improve-zup-import-reading. Update Purpose after archive.
## Requirements
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

#### Scenario: Equal file names belong to different source folders
- **WHEN** payroll-slip files normalize to the same name but have different parent Drive folders
- **THEN** the importer keeps them in separate source groups and imports one canonical variant from each folder

### Requirement: Bounded header extraction
The system SHALL extract organization and employee values without absorbing adjacent header fields or payroll rows.

#### Scenario: OCR merges several header fields into one line
- **WHEN** an OCR row contains organization or employee followed by department, period, position, or another known header label
- **THEN** extraction stops at that next label
- **AND** the employee value excludes a trailing personnel code in parentheses

### Requirement: PDF OCR fallback
The system SHALL attempt to convert PDF payroll slips to Google Docs using Advanced Drive service OCR when no better duplicate exists.

#### Scenario: PDF OCR service is available
- **WHEN** a PDF payroll slip is selected and Advanced Drive service is enabled
- **THEN** the importer creates a temporary OCR Google Doc, parses it, and records OCR usage in quality output

#### Scenario: PDF OCR service is unavailable
- **WHEN** a PDF payroll slip is selected and Advanced Drive service is not enabled
- **THEN** the importer records a clear quality warning and does not abort the whole import

### Requirement: Normalized row metadata
The system SHALL include work-day, factual worked-day, payment-statement, and statement-date fields in normalized import rows.

#### Scenario: Accrual row has day counts
- **WHEN** an accrual row contains period, working days, and factual worked days
- **THEN** `Импорт_1С_ЗУП` records `Рабочие дни` and `Факт. отработано дней`

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
- **AND** `Доплата до оклада` remains a separate import category while being marked as an okладное доначисление for downstream salary-base calculations

#### Scenario: Payment structure JSON is produced
- **WHEN** normalized payroll-slip rows are written after a full import
- **THEN** the system writes `Импорт_1С_СтруктураВыплат` with one row per company, section, category, and accrual/payment kind
- **AND** each structure row includes a JSON object with the calculation role, totals, periods, source files, and `rowPolicy: keep_source_rows_separate`
- **AND** `Доплата до оклада` receives `calculationRole: salary_top_up`

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
- **AND** the system fills `Из_1С_Оклад` with period, payroll-slip factual worked days from salary rows, Consultant production-calendar month workdays, and imported salary accruals including separately parsed `Доплата до оклада`
- **AND** the system fills premium reconstruction sheets with accrued premium amounts matched to accrual periods while leaving unmatched rows blank
- **AND** the system fills `Из_1С_Отпуска` from accrued vacation rows, matching payment dates from vacation payment rows in the same file when possible
- **AND** formulas inside `Из_1С_*` sheets reference other `Из_1С_*` sheets instead of the original target sheets
- **AND** the system recalculates `Из_1С_*` sheets after filling them so indexation, vacation annual salary, and Art. 236 columns do not remain stale

#### Scenario: Import rows pass global quality gates
- **WHEN** payroll-slip rows are imported
- **THEN** each row stores organization, employee, period, accrual date, year, and month
- **AND** the quality sheet reports organization, employee, and missing-month checks as warnings instead of blocking import
- **AND** `Импорт_1С_QG` lists company mismatches, blank company periods, employee raw-name variants, file warnings, data-completeness metrics, and partial salary month explanations for manual review
- **AND** reconstruction cells for periods with company or employee quality issues are highlighted with orange fill

### Requirement: Polza VLM extraction fallback
The system SHALL optionally use Polza.ai multimodal extraction when deterministic payroll-slip parsing produces no normalized rows.

#### Scenario: Deterministic parser cannot read a supported source
- **WHEN** a selected PDF, image, HTML, CSV, Google Doc, or Google Sheet source is read but no import rows are recognized
- **AND** `POLZA_API_KEY` is configured in Apps Script script properties
- **THEN** the importer sends the source content to Polza.ai using a cost-optimized default model that supports file/image input and structured outputs
- **AND** the model response is constrained by a strict JSON Schema for organization, employee, period, accrual date, totals, row category, row kind, day counts, dates, amounts, evidence text, and confidence
- **AND** recognized VLM rows are normalized into the same `Импорт_1С_ЗУП` schema as deterministic rows

#### Scenario: VLM fallback is unavailable or risky
- **WHEN** the API key is missing, the file is larger than the configured VLM byte limit, or Polza.ai returns an error
- **THEN** the import does not abort
- **AND** the quality report and VLM audit log explain why the fallback did not produce rows

#### Scenario: VLM fallback is used
- **WHEN** Polza.ai returns structured extraction data
- **THEN** the system writes a row to `Импорт_1С_VLM` with file, MIME, model, status, row count, usage/cost when supplied, Langfuse trace id when configured, warnings, and the raw structured JSON
- **AND** a new normal or forced batch import clears the previous VLM audit rows before writing current-run rows
- **AND** quality warnings mark the rows as VLM-derived and require review against `sourceText` and section-total validation

#### Scenario: Optional Langfuse tracing is configured
- **WHEN** Script properties contain `LANGFUSE_BASE_URL`, `LANGFUSE_PUBLIC_KEY`, and `LANGFUSE_SECRET_KEY`
- **THEN** every VLM extraction emits a Langfuse trace/generation with file metadata, model, token usage, cost, warnings, and structured output preview
- **AND** every quality-gate write emits a compact Langfuse trace with issue counts by check and severity
- **AND** Langfuse delivery failures are logged but do not abort import or reconstruction

#### Scenario: VLM import exceeds one Apps Script execution
- **WHEN** the user starts normal or forced payroll-slip import and the folder requires slow VLM/PDF processing
- **THEN** the importer processes a bounded batch of files, persists the next group index in script properties, writes partial import/quality/state output, and schedules a time-driven trigger to continue
- **AND** the quality sheet reports `QUALITY_GATE:Пакетный импорт` as `В работе` until all selected groups are processed
- **AND** summary and diagnostics are refreshed after the final batch completes
- **AND** the user can manually continue or cancel the active batch import from the menu

#### Scenario: User forces VLM for selected files
- **WHEN** `ZUP_IMPORT_SETTINGS.VLM_FORCE_PATTERN` or `ZUP_VLM_FORCE_PATTERN` contains a file-name fragment or `*`
- **THEN** matching selected files are extracted through VLM even if deterministic parsing produced rows
- **AND** forced VLM uses `ZUP_IMPORT_SETTINGS.VLM_FORCE_MODEL` unless `ZUP_VLM_MODEL` is explicitly configured
- **AND** the importer uses deterministic rows as fallback if the forced VLM request fails

#### Scenario: Parsed totals do not reconcile
- **WHEN** deterministic parsing returns rows but recognized totals differ from source section totals
- **THEN** the importer retries that file through the stronger VLM model
- **AND** the importer keeps the VLM rows only if they improve reconciliation against the source totals

#### Scenario: Import output contains disputed rows
- **WHEN** rows are VLM-derived, quality warnings exist, or diagnostics do not match
- **THEN** the corresponding service-sheet rows are highlighted with orange fill for manual review

#### Scenario: Reconstruction sheets contain disputed source cells
- **WHEN** `Из_1С_*` sheets are populated from import rows
- **THEN** missing imported amounts, dates, and day counts are highlighted with orange fill
- **AND** cells populated from VLM rows are highlighted with notes naming the source
- **AND** cells populated from payroll slips or trusted reference data are highlighted with green fill unless an orange review condition applies
- **AND** payment statement names and statement dates are populated in auxiliary columns so Art. 236 compensation uses the actual statement payment date when available
- **AND** organization/employee quality issues for a period are highlighted on the relevant reconstruction row without stopping calculation

