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
- **OR WHEN** an unexpected exception escapes a mutating calculation core
- **THEN** the audit snapshot covers the union of the prior named-range extent and the planned target extent before render mutation
- **AND** all snapshotted values or formulas, notes, backgrounds, number formats, data validations, audit cells and prior named-range extent, and relevant properties are restored exactly
- **AND** the lock is released and the fatal error is rethrown

#### Scenario: Explicit data-quality issue is nonfatal
- **WHEN** a calculation core returns or throws an explicitly typed or flagged data-quality issue before financial mutation
- **THEN** that sheet is surfaced as a source-aware review warning
- **AND** unrelated sheets continue
- **AND** no message-text, locale, or exception-class heuristic makes an unexpected exception nonfatal

#### Scenario: Stable setup precedes financial transaction
- **WHEN** the all-sheets financial workflow starts
- **THEN** idempotent constructor/intake setup completes before financial discovery and snapshot
- **AND** this completed structure remains valid after a later financial rollback
- **AND** the financial workflow never automatically deletes legacy generated sheets

#### Scenario: Large owned surfaces are snapshotted in batches
- **WHEN** an adapter owns many rows across one or more contiguous output-column ranges
- **THEN** values, formulas, notes, backgrounds, number formats, and validations are snapshotted and restored with a bounded number of bulk range calls proportional to ranges, not cells
- **AND** formula runs are restored only where formulas originally existed without clobbering neighboring nonformula values

#### Scenario: Protected formula is nonfatal
- **WHEN** recovery targets a formula cell that the semantic adapter does not declare as its owned output
- **THEN** the formula is preserved and a source-aware `formula_writeback_blocked` review warning is emitted
- **AND** unrelated authorized writes and calculations continue
- **AND** recovery baseline state is persisted only for destinations that were actually written

#### Scenario: Final rescan uses cached semantics
- **WHEN** recovery or derivative writes require a final rescan
- **THEN** the rescan uses the descriptor and table mapping cached during initial discovery
- **AND** semantic resolution and table discovery occur exactly once per sheet for the run

#### Scenario: Recovery respects each source calculation end
- **WHEN** multiple concrete sources share a claim key but have different calculation-end dates
- **AND** a recovery date falls after one source end and within another source window
- **THEN** only temporally eligible source segments are reduced and accrued through the recovery date
- **AND** the earlier-ended source remains unchanged and accrues only through its own end date
- **AND** an unapplied amount backed by out-of-period debt is a contextual deferred warning rather than an overpayment

#### Scenario: Vacation uses successful current-run sources
- **WHEN** non-vacation calculation sources succeed
- **THEN** vacation annual earnings are reconstructed from one normalized in-memory snapshot of those current-run results
- **AND** indexes, calendar, and rates are loaded no more than once for the run
- **WHEN** a required source fails or is ambiguous
- **THEN** affected vacation outputs remain unchanged and a source-aware disputed review warning is exposed while unrelated sheets continue
