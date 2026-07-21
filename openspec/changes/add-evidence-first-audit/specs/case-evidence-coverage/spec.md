## ADDED Requirements

### Requirement: Evidence-first case summary
The system SHALL derive a case summary from normalized source rows, quality findings, audit results, and calculated claim facts without performing a parallel monetary calculation.

#### Scenario: Payroll slips are audited
- **WHEN** normalized payroll rows and audit results are available
- **THEN** the summary reports the number of independent source rows and periods, missing periods, status counts, and calculated claim total
- **AND** the calculated total equals the sum of existing claim facts rather than a new estimate

#### Scenario: No exact amount can be calculated
- **WHEN** a review direction has signals but lacks required facts
- **THEN** the summary displays `невозможно проверить` or `нужны документы`
- **AND** does not display a zero amount as the result

### Requirement: Distinct review directions
The coverage map SHALL keep wage underpayment, payment-delay compensation, wage-indexation duty, indexation of a recoverable or awarded amount, vacation/average-earnings review, enhanced work/overtime, and forced absence as separate directions with separate evidence requirements.

#### Scenario: Wage indexation is reviewed
- **WHEN** payroll slips contain changing remuneration but no applicable employer indexation mechanism
- **THEN** wage-indexation duty remains a document-dependent direction
- **AND** it is not merged with procedural indexation of an awarded or recoverable amount

#### Scenario: Forced absence is not evidenced
- **WHEN** payroll slips are present but dismissal/restoration chronology and required personnel documents are absent
- **THEN** forced absence is shown as not calculable
- **AND** the requested evidence identifies the dismissal/restoration basis and applicable chronology

### Requirement: Concrete missing-evidence requests
The system SHALL aggregate missing facts into deduplicated, human-readable document requests and connect each request to affected review directions.

#### Scenario: Several delay items lack payment dates
- **WHEN** several audit items require the same bank statement or payment register
- **THEN** the coverage map shows one aggregated document request
- **AND** retains links to every affected direction and underlying audit item

#### Scenario: A document is already evidenced
- **WHEN** a required fact is confirmed by an available source
- **THEN** that fact is not listed as missing merely because another direction requires a different fact

### Requirement: Bounded working-sheet presentation
The system SHALL render `Что найдено`, `Возможные направления проверки`, and `Что нужно загрузить` inside an owned bounded range on `Анкета и требования` and SHALL leave approved calculations and documents unchanged.

#### Scenario: Coverage is refreshed
- **WHEN** the calculation/audit completes
- **THEN** only the owned coverage range is replaced
- **AND** questionnaire answers, claim selections, Docs history, calculation sheets, and unrelated filters remain unchanged

#### Scenario: Later calculation write fails
- **WHEN** coverage was rendered and the same calculation transaction subsequently fails
- **THEN** the previous coverage values, notes, formatting, validations, and named-range ownership are restored

### Requirement: Evidence-aware calculability
Each review direction SHALL state whether it is calculated, calculable with confirmed facts, disputed, or not verifiable and SHALL include its reason, already-calculated amount if any, source count, missing facts, and requested documents.

#### Scenario: Disputed calculated position exists
- **WHEN** a calculated claim fact exists but depends on an explicit assumption or source conflict
- **THEN** the direction shows its amount as already calculated
- **AND** its status remains `probable_or_disputed`
- **AND** the assumption or conflict is visible

