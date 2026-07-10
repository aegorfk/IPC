# ZUP VLM Response Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the responsibilities and branching of `parseZupWithPolzaVlm_` without changing requests, warnings, traces, logs, or normalized payroll output.

**Architecture:** Keep `parseZupWithPolzaVlm_` as the coordinator in `ZupImport.gs`. Introduce a pure response decoder that returns an explicit success/failure result and a single post-request failure handler that preserves current Langfuse tracing and empty-result behavior. Lock all current branches with a dedicated Node `vm` characterization test before editing production code.

**Tech Stack:** Google Apps Script JavaScript, Node.js `assert`/`vm`, Git.

---

## File Map

- Create `tests/zup-vlm-response.test.js`: focused characterization of the VLM request/response orchestration boundary.
- Modify `google-apps-script/ZupImport.gs`: extract response decoding and handled post-request failure construction from `parseZupWithPolzaVlm_`.
- Modify `docs/superpowers/plans/2026-07-10-zup-vlm-response-refactoring.md`: mark completed steps during execution.

### Task 1: Characterize the current VLM response behavior

**Files:**
- Create: `tests/zup-vlm-response.test.js`
- Reference: `tests/zup-vlm-multi-slip.test.js`
- Reference: `google-apps-script/ZupImport.gs:2813-2923`

- [x] **Step 1: Create a focused Apps Script test context**

Load `SalaryIndexation.gs` and `ZupImport.gs` into a Node `vm` context. Provide minimal `DocumentApp`, `PropertiesService`, `Session`, `Utilities`, and `UrlFetchApp` fakes. Override these global seams after loading:

```js
context.getZupPolzaApiKey_ = () => apiKey;
context.getZupVlmModel_ = () => 'test-model';
context.buildZupVlmRequest_ = () => requestResult;
context.createZupLangfuseTraceContext_ = () => ({ traceId: 'trace-1' });
context.sendZupLangfuseVlmTrace_ = (trace, data) => traces.push({ trace, data });
context.UrlFetchApp.fetch = (url, options) => {
  fetches.push({ url, options });
  return currentResponse;
};
```

Use a fake file exposing `getName`, `getMimeType`, `getBlob`, and `getSize`. Use a minimal valid extracted payload with one salary row so the real conversion path remains covered.

- [x] **Step 2: Add assertions for the two pre-request early returns**

Cover missing API key and `{ warning }` returned by `buildZupVlmRequest_`. Assert the exact warning, zero fetches, and zero traces.

- [x] **Step 3: Add assertions for successful content**

Cover both JSON-string and object-valued `message.content`. Assert one normalized row, an `OK` VLM log entry, one `OK` trace, the same request payload, and the expected trace id.

- [x] **Step 4: Add assertions for four handled post-request failures**

Cover non-2xx status, invalid outer JSON, absent `message.content`, and invalid nested JSON. For every case assert the complete warning text, empty rows, an error VLM log row, and one `ERROR` trace. Also assert the exact branch-specific values passed to tracing and stored in the VLM log:

```js
assert.strictEqual(traces[0].data.status, 'ERROR');
assert.deepStrictEqual(traces[0].data.request, requestResult.payload);
assert.strictEqual(parsed.rows.length, 0);
assert.strictEqual(parsed.vlmRows[0][3], 'Ошибка');
```

The case table must lock these mappings:

```js
// case name            trace response       VLM log payload
// non-2xx              raw body             raw body
// invalid outer JSON   raw body             raw body
// missing content      parsed envelope      raw body
// invalid content JSON message.content      message.content
```

For each case assert `traces[0].data.response` against the expected trace value and `parsed.vlmRows[0][11]` against the exact expected serialized/raw log payload. This prevents the shared failure handler from swapping the two diagnostics while preserving superficial status assertions.

- [x] **Step 5: Run the new characterization test against the unmodified implementation**

Run:

```bash
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/zup-vlm-response.test.js
```

Expected: PASS with a final `vlm response logic ok` line. If an assertion fails because current behavior differs from the spec, update the spec before production code.

- [x] **Step 6: Run the existing baseline tests**

Run:

```bash
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/salary-indexation-date-logic.test.js
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/zup-vlm-multi-slip.test.js
```

Expected: PASS; the first command prints `date logic ok` and both exit with code 0.

- [x] **Step 7: Commit the characterization safety net**

```bash
git add tests/zup-vlm-response.test.js docs/superpowers/plans/2026-07-10-zup-vlm-response-refactoring.md
git commit -m "test: characterize ZUP VLM responses"
```

### Task 2: Extract response decoding and failure handling

**Files:**
- Modify: `google-apps-script/ZupImport.gs:2813-2923`
- Test: `tests/zup-vlm-response.test.js`

- [x] **Step 1: Extract a response decoder**

Add `decodeZupVlmResponse_(response)` near `parseZupWithPolzaVlm_`. It reads the response status/body and returns one of these stable shapes:

```js
// Success
{ ok: true, envelope, extracted }

// Failure
{
  ok: false,
  warning,
  traceResponse, // exact value currently passed to Langfuse
  logPayload,    // exact value currently stored in the VLM log
}
```

The helper must preserve these cases exactly:

```js
if (code < 200 || code >= 300) {
  return failure(`Polza VLM вернула HTTP ${code}: ${body.slice(0, 500)}`, body, body);
}

// Outer JSON parse failure: traceResponse/body and logPayload/body.
// Missing content: traceResponse/envelope and logPayload/body.
// Nested JSON failure: traceResponse/content and logPayload/content.
// Object-valued content: return it unchanged as extracted.
```

Use a small local construction pattern or helper only if it makes these fields clearer; do not add classes, new files, or generic abstractions.

- [x] **Step 2: Extract the post-request failure handler**

Add `buildZupVlmResponseFailure_(file, model, trace, requestPayload, startedAt, failure)`. It must:

```js
sendZupLangfuseVlmTrace_(trace, {
  status: 'ERROR',
  statusMessage: failure.warning,
  request: requestPayload,
  response: failure.traceResponse,
  startedAt,
  endedAt: new Date(),
  warnings: [failure.warning],
});

return buildEmptyZupVlmParsed_(
  file,
  failure.warning,
  model,
  failure.logPayload,
  trace.traceId
);
```

- [x] **Step 3: Simplify `parseZupWithPolzaVlm_`**

Keep the API-key and request-warning early returns unchanged. After `UrlFetchApp.fetch`, replace the duplicated branches with:

```js
const decoded = decodeZupVlmResponse_(response);
if (!decoded.ok) {
  return buildZupVlmResponseFailure_(
    file,
    model,
    trace,
    request.payload,
    startedAt,
    decoded
  );
}

const envelope = decoded.envelope;
const extracted = decoded.extracted;
```

Leave force metadata, conversion, success tracing, and VLM log construction unchanged.

- [x] **Step 4: Run the focused characterization test**

Run:

```bash
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/zup-vlm-response.test.js
```

Expected: PASS and `vlm response logic ok`.

- [x] **Step 5: Run all regression tests**

Run:

```bash
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/salary-indexation-date-logic.test.js
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/zup-vlm-multi-slip.test.js
/Users/aegorfk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/zup-vlm-response.test.js
```

Expected: all exit with code 0.

- [x] **Step 6: Review the production diff for semantic drift**

Confirm exact warning strings, trace payload fields, raw log payloads, force metadata, success path, and fetch options are unchanged. Confirm no unrelated source files changed.

- [x] **Step 7: Commit the production refactoring**

```bash
git add google-apps-script/ZupImport.gs docs/superpowers/plans/2026-07-10-zup-vlm-response-refactoring.md
git commit -m "refactor(zup): extract VLM response handling"
```

### Task 3: Final verification and handoff

**Files:**
- Verify: `google-apps-script/ZupImport.gs`
- Verify: `tests/zup-vlm-response.test.js`
- Verify: `docs/superpowers/specs/2026-07-10-zup-vlm-response-refactoring-design.md`

- [ ] **Step 1: Run the complete test suite from a clean shell invocation**

Run all three Node commands from Task 2 Step 5. Expected: all pass.

- [ ] **Step 2: Check formatting and repository state**

Run:

```bash
git diff --check HEAD~2..HEAD
git status --short
```

Expected: no whitespace errors; only the pre-existing untracked `google-apps-script/.clasp.json` may remain.

- [ ] **Step 3: Review commit scope**

Run:

```bash
git log -3 --oneline --decorate
git diff main...HEAD --stat
```

Expected: one design commit, one characterization-test commit, and one production-refactoring commit; scope limited to the spec, plan, focused test, and `ZupImport.gs`.

- [ ] **Step 4: Prepare the handoff report**

Report the extracted responsibilities, test evidence, exact branch name, commits, and the untouched `.clasp.json`. Do not claim behavior preservation without fresh command output.
