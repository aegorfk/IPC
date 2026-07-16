## 1. Recognition-quality prerequisite

- [ ] 1.1 Assemble and version a representative corpus with priority 1C:ZUP examples plus materially different payroll-slip layouts and supported MIME types.
- [ ] 1.2 Define the canonical expected organization, employee, period, row kind/category, dates, day counts, amounts, source evidence, and section totals for every corpus source.
- [ ] 1.3 Capture sequential recognizer snapshots containing normalized rows, reconciliation results, confidence/review flags, skipped-source dispositions, and VLM audit data.
- [ ] 1.4 Add automated corpus comparison tests that fail on missing/extra rows, changed amounts/dates/categories, weaker evidence, or changed quality decisions.
- [ ] 1.5 Review and approve the sequential quality baseline; keep `ZUP_VLM_MAX_WORKERS=1` until every baseline check passes.

## 2. Durable queue model

- [ ] 2.1 Add characterization tests for queue creation from provider-independent source-group identities after deterministic parsing.
- [ ] 2.2 Add an auditable technical queue schema with run id, source signature, recognition-contract version, status, attempts, lease fields, result identity, timing, error, usage, and cost fields.
- [ ] 2.3 Implement atomic claim and commit transactions under a short-held `ScriptLock` without holding the lock during provider calls.
- [ ] 2.4 Implement deterministic accepted-result identities and canonical materialization order.
- [ ] 2.5 Preserve sequentially equivalent behavior when the configured worker limit is one.

## 3. Bounded worker pool

- [ ] 3.1 Add tests proving that concurrent claim attempts cannot lease the same source and that the configured active-worker limit is enforced.
- [ ] 3.2 Implement a deduplicated fixed worker pool controlled by `ZUP_VLM_MAX_WORKERS`, defaulting to one and capped at the approved safe maximum.
- [ ] 3.3 Refactor VLM candidate preparation so independent remote requests run outside coordinator and Sheet-write critical sections.
- [ ] 3.4 Implement worker result decoding, normalization, audit logging, and idempotent commit through the existing provider-independent extraction contract.
- [ ] 3.5 Make import finalization wait for terminal queue items without blocking successful deterministic or VLM-derived results.

## 4. Failure isolation and recovery

- [ ] 4.1 Add fault-injection tests for hard Apps Script termination, expired lease, late duplicate response, stale run id, corrupt JSON, and provider 408/429/5xx responses.
- [ ] 4.2 Implement lease expiry and safe reclamation without clearing already committed sources.
- [ ] 4.3 Implement bounded exponential backoff with jitter for retryable failures and immediate `failed_review` disposition for non-retryable failures.
- [ ] 4.4 Publish an actionable constructor review issue when the retry budget is exhausted while allowing other calculable sources to finish.
- [ ] 4.5 Verify cancellation and successor runs cannot accept results from workers belonging to an older run.

## 5. Progress and diagnostics

- [ ] 5.1 Add technical queue diagnostics for pending, leased, retrying, succeeded, failed-review, oldest lease, durations, attempts, provider ids, usage, and cost.
- [ ] 5.2 Update the single constructor progress bar after every committed source or terminal failure while keeping progress monotonic.
- [ ] 5.3 Verify that users never need to press a manual resume action when a worker times out or a lease expires.

## 6. Quality equivalence and staged rollout

- [ ] 6.1 Run the new queue with one worker against the corpus and prove exact externally observable equivalence to the approved sequential snapshots.
- [ ] 6.2 Run two-worker dry tests with deliberately reversed completion order and prove canonical normalized/audit/quality output equality.
- [ ] 6.3 Confirm the Polza account request-rate ceiling and record the approved worker cap and cost guardrails.
- [ ] 6.4 Deploy two workers only to the test spreadsheet and compare corpus quality, elapsed duration, retries, timeouts, and cost against the sequential baseline.
- [ ] 6.5 Run a live multi-format folder smoke test and confirm automatic terminal completion, correct totals, visible review issues, and no duplicate rows.
- [ ] 6.6 Enable two workers in the working spreadsheet only after quality approval; document rollback to one worker and verify pending leases remain recoverable.
