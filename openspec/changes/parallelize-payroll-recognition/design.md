## Context

The current importer groups source variants, prefers deterministic parsing, and invokes Polza VLM only when the deterministic result is absent or fails reconciliation. Import state is resumable, but remote recognition remains serial: one slow request holds the active Apps Script execution and delays all later sources.

The change crosses the import scheduler, VLM adapter, technical state sheets, constructor progress, and tests. Google Apps Script limits a normal execution to six minutes, while the Polza API documents a request timeout of up to 600 seconds. The design therefore cannot assume that a remote request will finish inside one Apps Script execution. It must also preserve the project's source-independent normalized model and keep 1C:ZUP as a priority test source rather than a hard-coded workflow.

Quality has priority over throughput. The current sequential recognizer and a versioned multi-format corpus will define the reference behavior before concurrency is enabled.

## Goals / Non-Goals

**Goals:**

- Reduce elapsed VLM recognition time with a bounded default of two concurrent workers.
- Isolate slow, failed, and retried sources so they cannot block unrelated sources.
- Commit each accepted source result exactly once and preserve deterministic final output ordering.
- Keep deterministic parsing first and send only independent VLM candidates to workers.
- Make queue state, leases, retries, provider errors, durations, and cost observable.
- Prove that enabling concurrency does not change normalized rows, reconciliation, or quality decisions on the approved recognition corpus.

**Non-Goals:**

- Increasing concurrency without an approved quality baseline.
- Starting one worker per source or consuming all available Apps Script concurrency.
- Changing prompts, schemas, normalization rules, calculation methodology, or source-specific adapters as part of the performance rollout.
- Parallelizing Sheets reconstruction, formulas, quality aggregation, or Docs generation.
- Binding the queue to one employer, payroll system, file name convention, or payroll-slip layout.

## Decisions

### 1. Use independent leased workers, not one `UrlFetchApp.fetchAll` batch

The scheduler will create at most the configured number of worker continuations. Each worker atomically leases one pending source under `ScriptLock`, releases the lock before the network call, and later reacquires the lock to commit the result.

`fetchAll` was considered because it can issue several requests simultaneously. It was rejected for this workflow because the Apps Script invocation still waits for the slowest response; if the six-minute execution is terminated, already completed responses in that batch cannot be committed independently. Separate workers isolate that failure boundary.

### 2. Separate candidate preparation from remote recognition

The coordinator will continue to enumerate and group source variants and run deterministic adapters first. A source becomes a VLM queue item only when existing fallback or reconciliation rules require remote extraction. The queue stores a source-group key and source signature, not 1C-specific labels.

Final import materialization waits until every queue item is terminal (`succeeded` or `failed_review`). Successful worker results enter the existing normalized row schema and quality pipeline.

### 3. Persist queue rows and use short-lived leases

Durable queue state will live in a technical sheet or another existing auditable import-state structure, rather than one growing Script Property value. Script Properties will hold only compact scheduler metadata when needed.

Each item records at least run id, source-group key, source signature, parser/prompt version, status, attempt count, lease owner, lease expiry, started/finished timestamps, result identity, error class, provider generation id when available, usage/cost, and review disposition.

A worker may commit only when its run id, source signature, and lease token still match. The accepted result key is deterministic from run id, source signature, and recognition contract version. Repeated or late responses therefore cannot append duplicate normalized rows.

### 4. Start with two workers and adaptive backoff

`ZUP_VLM_MAX_WORKERS` will default to `1` until rollout approval, then be set to `2` for the tested spreadsheet. Values above the documented safe project setting will be rejected or capped.

HTTP 429, 408, 5xx, provider-unavailable responses, and abandoned leases receive bounded retries with exponential backoff and jitter. Non-retryable schema/authentication/size errors become `failed_review` immediately. Repeated failure becomes a visible review issue but does not stop calculable sources.

### 5. Preserve deterministic output and quality equivalence

Workers may finish out of order, but committed rows and audit output are materialized in canonical source-group and source-row order. Parallel execution must not affect prompt inputs, JSON validation, normalization, total reconciliation, confidence/review flags, or chosen deterministic fallback.

A versioned recognition corpus will include 1C:ZUP examples plus materially different layouts and MIME types from other sources. Before concurrency can be raised above one, a parallel dry run must match the sequential reference for normalized rows and quality decisions across the corpus. Any mismatch blocks rollout and is investigated as a quality defect.

### 6. Expose queue progress without adding user actions

The constructor will keep one progress bar and show completed/total sources. Internal diagnostics will additionally show pending, leased, retrying, succeeded, and failed-review counts plus the oldest active lease. Users will not need to resume workers manually.

## Risks / Trade-offs

- **Provider rate limiting or higher burst cost** → Start at two workers, cap configuration, use retry backoff, and report per-run usage/cost.
- **Worker termination after the provider accepted a request** → Expiring lease and deterministic result identity allow safe retry; late responses cannot overwrite an accepted result.
- **Concurrent Sheet writes race** → Hold `ScriptLock` only for claim/commit transactions and batch the actual technical-sheet update inside that transaction.
- **Out-of-order completion changes results** → Canonically sort committed source results before quality aggregation and final output writes.
- **More scheduler state obscures recognition defects** → Keep raw VLM audit records and require sequential/parallel equality before rollout.
- **Apps Script trigger quotas** → Maintain a fixed worker pool, deduplicate one-shot triggers, and never create a trigger per source.

## Migration Plan

1. Build and approve the multi-format recognition corpus and sequential reference snapshots while production concurrency remains one.
2. Introduce queue/lease storage and worker logic behind `ZUP_VLM_MAX_WORKERS=1`; verify that behavior remains sequentially equivalent.
3. Run fault-injection tests for hard termination, expired lease, duplicate response, 408/429/5xx, corrupt JSON, and stale run ids.
4. Enable two workers only in the test copy and compare every normalized row and quality decision with the reference snapshots.
5. Run a live test-folder smoke test, record duration/cost/quality, then enable two workers in the working spreadsheet.
6. Roll back immediately by setting the worker count to one. Existing pending/leased items remain recoverable; no normalized-data migration is required.

## Open Questions

- Confirm the provider/account-specific request-per-minute ceiling before production rollout; until confirmed, the hard cap remains two.
- Select and version the representative non-1C corpus files during the recognition-quality work that precedes this change.
