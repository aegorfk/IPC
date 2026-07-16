## ADDED Requirements

### Requirement: Recognition-quality rollout gate
The system MUST keep VLM worker concurrency at one until an approved, versioned, multi-format recognition corpus and sequential reference results exist.

#### Scenario: Quality baseline is not approved
- **WHEN** the recognition corpus or its sequential reference results are missing, outdated, or failing
- **THEN** production configuration remains limited to one VLM worker
- **AND** performance rollout does not bypass or weaken any recognition-quality check

#### Scenario: Parallel dry run matches the reference
- **WHEN** a two-worker dry run is evaluated for rollout
- **THEN** its normalized rows, source evidence, totals, reconciliation outcomes, confidence/review flags, and terminal source dispositions match the sequential reference for every corpus source
- **AND** any mismatch blocks rollout as a recognition-quality defect

### Requirement: Idempotent concurrent VLM result commitment
The system MUST accept at most one normalized VLM result for each active run, source signature, and recognition-contract version while preserving the existing fallback and quality rules.

#### Scenario: Provider request is retried
- **WHEN** two attempts for the same source both eventually return acceptable structured output
- **THEN** exactly one result is committed to normalized import rows and VLM audit output
- **AND** total reconciliation and quality gates run once against the accepted result

#### Scenario: Concurrency is disabled
- **WHEN** the worker limit is one
- **THEN** the queue produces the same externally observable normalized and quality outputs as the existing sequential recognizer

### Requirement: Source-independent parallel recognition
The system SHALL schedule recognition using the unified source-group identity and normalized extraction contract rather than employer, accounting-system, or layout-specific assumptions.

#### Scenario: Different payroll systems are present
- **WHEN** independent supported payroll slips from 1C:ZUP and another source system both require VLM extraction
- **THEN** both can enter the same bounded queue
- **AND** each result is normalized and quality-checked through the same provider-independent contract
