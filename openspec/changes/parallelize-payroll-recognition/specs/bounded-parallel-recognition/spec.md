## ADDED Requirements

### Requirement: Durable bounded recognition queue
The system SHALL schedule independent VLM recognition candidates through a durable queue and SHALL run no more than the configured bounded number of workers concurrently.

#### Scenario: Two workers are enabled
- **WHEN** the approved worker limit is two and at least two independent VLM candidates are pending
- **THEN** the scheduler allows at most two active recognition leases
- **AND** it does not create one trigger per source or exceed the configured limit

#### Scenario: Deterministic parsing succeeds
- **WHEN** a source produces an acceptable deterministic normalized result
- **THEN** the source is not added to the VLM recognition queue

### Requirement: Atomic source lease
The system MUST claim and commit each queued source through an atomic lease bound to the active run, source signature, recognition-contract version, and worker token.

#### Scenario: Two workers attempt the same source
- **WHEN** concurrent workers attempt to claim one pending source
- **THEN** exactly one worker receives the active lease
- **AND** the other worker claims a different source or exits without issuing a duplicate request

#### Scenario: Stale worker returns late
- **WHEN** a worker returns after its lease expired or after another attempt committed the source
- **THEN** its response does not overwrite or duplicate the accepted result

### Requirement: Isolated retry and continuation
The system SHALL allow unrelated recognition work to continue when one provider request is slow, terminated, rate-limited, or fails.

#### Scenario: Worker execution is terminated
- **WHEN** an Apps Script execution ends before its leased request is committed
- **THEN** the lease becomes reclaimable after its expiry
- **AND** another worker retries the same source without clearing successful results from other sources

#### Scenario: Retryable provider failure occurs
- **WHEN** Polza or another compatible provider returns a retryable timeout, rate-limit, or availability failure
- **THEN** the item is retried with bounded exponential backoff and jitter
- **AND** other pending items remain eligible for workers

#### Scenario: Retry budget is exhausted
- **WHEN** a source reaches the configured retry limit without an acceptable result
- **THEN** it becomes `failed_review`
- **AND** the overall import continues with other calculable sources
- **AND** the constructor reports an actionable review issue for that source

### Requirement: Deterministic materialization
The system MUST materialize committed recognition results in canonical source order regardless of worker completion order.

#### Scenario: Later source finishes first
- **WHEN** concurrent workers complete sources in an order different from the source queue
- **THEN** normalized rows, VLM audit rows, quality outputs, and final summaries are written in canonical deterministic order

### Requirement: Observable worker progress
The system SHALL persist enough worker state to distinguish healthy progress from a stalled or repeatedly failing source without requiring user actions.

#### Scenario: Recognition is active
- **WHEN** one or more workers hold valid leases
- **THEN** technical diagnostics expose pending, active, retrying, succeeded, and failed-review counts
- **AND** the constructor progress remains monotonic and updates after each committed source or terminal failure

