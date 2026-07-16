## Why

VLM recognition is currently the longest stage of payroll-slip import because independent sources are processed serially and one slow provider response delays the whole queue. Parallelism should be introduced only after the current quality baseline is accepted, so performance work cannot mask recognition regressions or multiply incorrect results.

## What Changes

- Add a durable provider-independent work queue for payroll-slip sources that can run a small, configurable number of recognition workers concurrently.
- Start with a default concurrency of two workers; do not fan out all sources or depend on one employer, payroll system, or source layout.
- Give every source attempt an atomic lease, idempotent result key, heartbeat, retry counter, and terminal review outcome so a timeout or worker failure cannot block other sources or duplicate accepted rows.
- Preserve deterministic parsing as the first choice and parallelize only independent VLM recognition work.
- Keep normalization, quality gates, reconciliation, reconstruction, and finalization deterministic and checkpointed after worker results are committed.
- Add operational metrics for queue depth, active workers, per-source duration, retries, timeouts, provider errors, and cost.
- Gate implementation and rollout on an approved recognition-quality baseline covering multiple source formats; quality failures must be fixed before concurrency is enabled.

## Capabilities

### New Capabilities

- `bounded-parallel-recognition`: Durable bounded-concurrency scheduling, source leases, isolated retries, and observable worker progress for independent payroll-slip recognition jobs.

### Modified Capabilities

- `zup-import-reading`: Extend resumable VLM import requirements so accepted source results remain idempotent, provider failures are isolated, and parallel execution cannot change normalized results or quality decisions.

## Impact

- Affects the payroll-slip import scheduler and VLM adapter in `google-apps-script/ZupImport.gs`, constructor progress reporting in `google-apps-script/ClaimConstructor.gs`, Apps Script triggers/properties/locks, and characterization tests.
- Uses the existing Polza.ai/OpenAI-compatible extraction contract and unified normalized row model; no source-vendor-specific workflow is introduced.
- May increase simultaneous provider requests and therefore must respect account rate limits, Apps Script quotas, and cost controls.
- Does not change the current production workflow until the quality gate and staged rollout tasks are complete.
