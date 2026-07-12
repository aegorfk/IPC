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

### Requirement: Atomic semantic calculation refresh
The system SHALL perform the all-sheets claim refresh from one semantic discovery and one failure-safe transaction while keeping Google Sheets authoritative.

#### Scenario: Semantically reordered calculation sheet
- **WHEN** a calculation sheet has a recognized vendor-neutral header contract on any scanned header row with columns in an arbitrary order
- **THEN** discovery returns one descriptor containing its normalized layout, actual header row, semantic columns, and sheet
- **AND** calculation reads and writes those semantic columns rather than fixed legacy positions or sheet-name adjacency assumptions

#### Scenario: Full recovery is reversible
- **WHEN** a recovery reduces an adapter-owned principal output to zero
- **THEN** the recovery registry retains source and destination identity, baseline principal, last adjusted principal, and fingerprint
- **AND** a later unchanged run applies the recovery exactly once
- **AND** changing or removing the recovery recomputes from the retained baseline and restores the appropriate audit item

#### Scenario: Fatal transaction failure
- **WHEN** an owned calculation write, derivative write, audit render, flush, or relevant property write fails
- **THEN** all snapshotted values, formulas, notes, backgrounds, number formats, audit cells and extent, and relevant properties are restored
- **AND** the lock is released and the fatal error is rethrown

#### Scenario: Vacation uses successful current-run sources
- **WHEN** non-vacation calculation sources succeed
- **THEN** vacation annual earnings are reconstructed from one normalized in-memory snapshot of those current-run results
- **AND** indexes, calendar, and rates are loaded no more than once for the run
- **WHEN** a required source fails or is ambiguous
- **THEN** affected vacation outputs remain unchanged and a source-aware disputed review warning is exposed while unrelated sheets continue
