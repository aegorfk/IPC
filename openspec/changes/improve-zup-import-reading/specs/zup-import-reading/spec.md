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
