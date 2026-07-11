## MODIFIED Requirements

### Requirement: Single constructor workspace
The system SHALL provide an idempotently created `Конструктор` sheet as the primary operational workspace, containing a payroll-slip Drive source-folder input, a normative-documents Drive-folder placeholder, a Google Docs output input, one primary build action, persistent progress, calculated totals, and a review-issues section. The Google Docs input remains the visible handoff link after completion; the constructor MUST NOT add duplicate Docs or current-spreadsheet output rows.

#### Scenario: First-time setup
- **WHEN** the user invokes `Открыть конструктор` and the constructor sheet does not exist
- **THEN** the system creates and activates the sheet with all required labeled sections
- **AND** the source label is compatible with the existing Drive-folder resolver
- **AND** displays and resolves the source label as `Расчетные листы:`
- **AND** displays `Нормативные документы` with the status text `пока не анализируется` in the left column under that label
- **AND** the Docs label is compatible with the existing calculation-document resolver

#### Scenario: Repeated setup preserves user data
- **WHEN** the user invokes `Открыть конструктор` for an existing constructor sheet
- **THEN** the system repairs missing layout elements without clearing source links, normative-document links, run status, totals, or review issues

### Requirement: Reversible sheet visibility modes
The system SHALL provide normal, calculation-detail, and technical visibility modes by hiding or showing existing sheets without deleting, clearing, recreating, or reordering them.

#### Scenario: Normal mode
- **WHEN** the user selects `Обычный режим`
- **THEN** the constructor sheet and `Анкета и требования` sheet are visible
- **AND** all primary calculation, reconstruction, import, VLM, and diagnostic sheets are hidden

#### Scenario: Calculation detail mode
- **WHEN** the user selects `Показать детализацию`
- **THEN** the constructor, `Анкета и требования`, and primary salary, premium, and vacation calculation sheets are visible
- **AND** reconstruction/import diagnostic sheets remain hidden

#### Scenario: Technical mode
- **WHEN** the user selects `Технический режим`
- **THEN** all existing sheets are visible

#### Scenario: Visibility change preserves workbook content
- **WHEN** the visibility mode changes
- **THEN** no sheet values, formulas, formatting, dimensions, order, or identifiers are changed by the visibility operation
