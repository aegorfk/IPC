## ADDED Requirements

### Requirement: Period-level claim source of truth
The system SHALL derive constructor claim totals and the selectable audit from the same complete set of normalized period-level claim facts.

#### Scenario: Detail and summary rows coexist
- **WHEN** a calculation output contains period detail rows followed by subtotal, grand-total, or claim-price rows
- **THEN** each period detail amount is counted exactly once
- **AND** summary rows are excluded from constructor totals and selectable claim facts

#### Scenario: Constructor and audit reconcile
- **WHEN** a calculation completes successfully
- **THEN** each constructor family amount equals the sum of its period-level audit items
- **AND** `Итого требований` equals the sum of all included calculated claim families

#### Scenario: Positive detail has no period
- **WHEN** a non-summary row contains a positive claim amount but no normalized period
- **THEN** the calculation fails with a targeted reconciliation error
- **AND** the amount is not silently included in the constructor or omitted from the audit

### Requirement: Universal composite-period normalization
The system SHALL normalize payment or claim periods from semantic monthly, quarterly, and annual period columns without depending on a payroll vendor or sheet name.

#### Scenario: Quarterly calculation and payment month share one cell
- **WHEN** a row describes a quarter and also names its payment month and year
- **THEN** the audit item uses the named payment month and year as its visible period
- **AND** retains quarterly-premium semantics in its normalized basis

#### Scenario: Annual calculation and payment month share one cell
- **WHEN** a row describes an annual premium and also names its payment month and year
- **THEN** the audit item uses the named payment month and year as its visible period
- **AND** retains annual-premium semantics in its normalized basis

#### Scenario: Equivalent vendor-neutral header is used
- **WHEN** a supported source uses a semantically equivalent compound period/payment header
- **THEN** the system discovers the period column from header meaning
- **AND** does not require a 1C-specific title or a fixed sheet name

### Requirement: Human-readable selectable breakdown
The system SHALL show every selectable monetary item using only the information needed for a legal choice: violation essence, period, amount, disputed status, and selection state.

#### Scenario: Underpayment item is rendered
- **WHEN** a normalized underpayment fact is available
- **THEN** the visible row states the underpayment basis in human language
- **AND** shows its period and amount in separate columns
- **AND** provides an independent checkbox

#### Scenario: Derivative claim item is rendered
- **WHEN** an indexation or Article 236 fact is available
- **THEN** the visible row identifies the derivative claim and its underlying basis
- **AND** shows the affected period and amount

#### Scenario: Technical trace is retained but hidden
- **WHEN** an audit item is rendered
- **THEN** its stable key and source trace remain available to the system for selection persistence and diagnostics
- **AND** source sheet names, row numbers, and cell coordinates are not shown in the user-facing breakdown

#### Scenario: Disputed item is rendered
- **WHEN** an item is disputed
- **THEN** it is selected by default unless the user previously unchecked the same stable key
- **AND** its visible status is `спорное`

### Requirement: Selected narrative follows detail choices
The system SHALL write only the checked period-level audit items into the generated Google Docs narrative.

#### Scenario: User excludes one period
- **WHEN** the user unchecks one period-level item and invokes `Расписать выбранные требования`
- **THEN** the new Doc excludes that item and its amount
- **AND** retains other selected periods from the same claim family

#### Scenario: Selected payload is malformed or unreconciled
- **WHEN** selected audit rows contain an invalid amount, missing stable key, or inconsistent grouping
- **THEN** Docs generation fails with corrective guidance
- **AND** does not create a document with an unexplained total

#### Scenario: User excludes a derivative item
- **WHEN** an underpayment remains checked but its indexation or Article 236 item is unchecked
- **THEN** the generated basis table includes only the checked monetary components
- **AND** its row, section, summary, and document totals exclude the unchecked derivative amount

### Requirement: Approved court-calculation document contract
The system SHALL preserve the structure and formatting of the user-approved court-calculation reference and SHALL NOT introduce layout changes without explicit approval.

#### Scenario: A new selected-requirements document is generated
- **WHEN** the user invokes `Расписать выбранные требования`
- **THEN** the system creates a new Google Doc in the same Drive folder by copying the approved calculation document
- **AND** the copied source is the configured canonical approved document rather than a previously generated report
- **AND** preserves its page setup, heading hierarchy, footer/page numbering, table header treatment, borders, number formats, and emphasized total rows
- **AND** uses the approved order of summary and detailed calculation sections

#### Scenario: A functional change needs a new visual structure
- **WHEN** a requested calculation cannot be expressed in the approved document layout
- **THEN** implementation does not silently add, remove, rename, reorder, or restyle user-facing sections
- **AND** requires an updated specification and explicit user approval of the proposed layout

#### Scenario: Generated document totals are reconciled
- **WHEN** the new document has been populated from selected stable keys
- **THEN** every basis and family total equals the sum of its selected period-level components
- **AND** the final document total equals the exact selected audit total
- **AND** a mismatch aborts registration and removes the incomplete generated copy

#### Scenario: Constructor totals follow the final selection
- **WHEN** a selected-requirements document is generated successfully
- **THEN** the constructor underpayment, indexation, Article 236, and final totals are synchronized from the same checked stable keys
- **AND** a calculated component without a selectable audit key is excluded from the selected claim price until it becomes independently selectable

### Requirement: Lossless payroll-position normalization
The system SHALL preserve each recognized payroll-slip position as an independent normalized record before calculation-layer aggregation.

#### Scenario: Similar positions occur in one payroll slip
- **WHEN** two or more positions share a label, category, period, amount, or payment date
- **THEN** each source position remains a separate normalized record
- **AND** no recognition-time summation or merging occurs

#### Scenario: Explicit summary is calculated
- **WHEN** a later calculation or court-report section groups normalized positions by legal basis and period
- **THEN** the aggregate retains traceability to every contributing source position
- **AND** the normalized source ledger remains unchanged

#### Scenario: Duplicate extraction is suspected
- **WHEN** two recognized records appear identical
- **THEN** the system may suppress one only after proving both refer to the same source position
- **AND** the deduplication rule and source identity are retained for diagnostics and covered by a regression test
