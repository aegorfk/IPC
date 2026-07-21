## ADDED Requirements

### Requirement: Independent evidence layers
The system SHALL keep a source-document fact, a calculation interpretation, and a legal or claim qualification as independent objects and SHALL NOT promote a source fact directly into a debt conclusion.

#### Scenario: Payroll arithmetic suggests a difference
- **WHEN** a payroll slip contains accrual and payment values that produce an arithmetic difference
- **THEN** the source values remain document facts
- **AND** the difference is recorded as a calculation or audit interpretation with its formula and assumptions
- **AND** no claim that the employer owes that amount is created unless a separate qualified claim position has sufficient facts

#### Scenario: Numeric audit signal is not a claim
- **WHEN** an audit result contains a numeric money impact but lacks a qualified entitlement or due-date fact
- **THEN** the system keeps the signal outside selected claim totals
- **AND** marks the missing fact and required document

### Requirement: Four proof statuses
The system SHALL use `confirmed`, `probable_or_disputed`, `cannot_verify`, and `informational` consistently for facts, audit results, calculation positions, and coverage directions.

#### Scenario: Required evidence is missing
- **WHEN** a rule requires a fact that is not available
- **THEN** the result status is `cannot_verify`
- **AND** the amount is `null` rather than zero unless zero is an independently established value
- **AND** the result contains a concrete question or document request

#### Scenario: Conflicting sources exist
- **WHEN** two source candidates provide different values for the same case fact
- **THEN** the system retains both candidates and the conflict
- **AND** selects an effective value only according to declared source priority
- **AND** marks any calculation affected by the unresolved conflict as `probable_or_disputed`

### Requirement: Traceable calculation position
Every calculated position SHALL identify its rule and rule version, formula version, input facts, assumptions, status, amount, period, and evidence references.

#### Scenario: Calculated position is reproduced
- **WHEN** a previously generated calculation position is inspected
- **THEN** its stored rule version, formula version, inputs, period, and assumptions are sufficient to explain the calculation
- **AND** every available source reference remains addressable without relying on a grouped summary row

#### Scenario: Traceability is incomplete
- **WHEN** a legacy calculated claim fact lacks a source row or formula reference
- **THEN** the system preserves the available claim fact
- **AND** marks traceability as incomplete
- **AND** does not fabricate a document, page, row, or formula

### Requirement: Claim qualification gate
A selectable claim SHALL be composed only from calculated claim positions that are independently qualified for that claim family; preliminary audit observations SHALL remain review directions.

#### Scenario: Article 236 facts are incomplete
- **WHEN** the payable amount is known but the independent legal due date or factual payment date is missing
- **THEN** the system does not produce an exact Article 236 claim amount from the payroll month
- **AND** asks for the payment rule and factual payment evidence

#### Scenario: Claim is calculated in the Sheet
- **WHEN** a qualified calculated claim fact is written by the existing Google Sheets calculation
- **THEN** it may appear in `Аудит и требования` with its proof status and evidence chain
- **AND** Google Docs only explains selected positions already present in the Sheet

