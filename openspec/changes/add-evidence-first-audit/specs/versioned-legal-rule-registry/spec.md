## ADDED Requirements

### Requirement: Versioned rule schema
Every audit or legal calculation rule SHALL declare a stable id, version, title, effective dates, required facts, missing-fact behavior, formula version, legal basis, responsible owner, last legal-review date, legal-review expiry date, and claim family if applicable.

#### Scenario: Registry is loaded
- **WHEN** the rule registry is requested
- **THEN** the system validates every entry against the required schema
- **AND** returns a defensive copy that cannot mutate the canonical registry

#### Scenario: Rule metadata is invalid
- **WHEN** a rule omits required metadata or has contradictory effective/review dates
- **THEN** registry validation fails with the rule id and invalid field
- **AND** the invalid rule is not silently used

### Requirement: Official and explainable legal basis
A legal rule SHALL retain one or more citations and official source URLs and SHALL distinguish legislation from judicial or methodological material.

#### Scenario: User inspects a legal audit result
- **WHEN** an audit result is based on a legal rule
- **THEN** its rule snapshot contains the citation, source type, and official URL
- **AND** the result identifies the exact rule and formula version used

### Requirement: Temporal applicability
The system SHALL resolve a rule against both the event date and the calculation/legal-review date.

#### Scenario: Event predates a rule
- **WHEN** an event falls before `effectiveFrom` or after `effectiveTo`
- **THEN** the rule is reported as not applicable for that event
- **AND** no amount is calculated under that rule

#### Scenario: No event date is known
- **WHEN** temporal applicability requires an event date that is missing
- **THEN** the result is `cannot_verify`
- **AND** the event date is listed as a missing fact

### Requirement: Stale-rule fail-closed behavior
The system SHALL disable automatic legal calculation when the rule's legal-review expiry date has passed while retaining factual audit output and independent calculations.

#### Scenario: Legal review has expired
- **WHEN** the evaluation date is later than `legalReviewValidUntil`
- **THEN** `automaticCalculationAllowed` is false
- **AND** the legal result becomes `cannot_verify`
- **AND** the reason identifies the stale rule and requests legal review

#### Scenario: Unrelated rule remains current
- **WHEN** one rule is stale and another applicable rule is current
- **THEN** only the stale rule is disabled
- **AND** the current rule and unrelated sheet calculations continue

### Requirement: Missing facts fail closed
The registry evaluator SHALL compare required facts with explicitly available facts and SHALL follow `missingFactBehavior` without inventing source values.

#### Scenario: Due date is absent
- **WHEN** an Article 236 rule has a payable amount and payment event but no independently established legal due date
- **THEN** the evaluator returns `cannot_verify`
- **AND** records `legal_due_date` as missing
- **AND** does not substitute the payroll-slip period or factual payment date

