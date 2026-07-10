# ZUP VLM Response Refactoring Design

## Context

`google-apps-script/ZupImport.gs` is the main repository hotspot: it contains about 5,500 lines and has changed frequently. Within it, `parseZupWithPolzaVlm_` is a 111-line orchestration function that currently performs several jobs at once:

- obtains configuration and builds a Polza request;
- sends the HTTP request;
- validates the HTTP status;
- decodes the outer response envelope and nested `message.content` payload;
- builds failure results and Langfuse traces;
- converts a successful payload into normalized payroll rows.

Both existing Node-based test files pass before the refactoring. The VLM payload conversion has direct coverage, but the response-decoding and error branches in `parseZupWithPolzaVlm_` do not.

## Goal

Reduce the responsibility and branching of `parseZupWithPolzaVlm_` while preserving all externally observable behavior, including request shape, warning text, normalized output, VLM log rows, and Langfuse trace data.

## Non-goals

- No change to the Polza endpoint, models, request schema, timeouts, or retry policy.
- No change to payroll recognition or normalization rules.
- No change to public Apps Script menu functions.
- No split of `ZupImport.gs` into additional `.gs` files.
- No cleanup of unrelated functions or tests.
- No modification of `google-apps-script/.clasp.json`.

## Approaches Considered

### 1. Extract the VLM response pipeline inside `ZupImport.gs` — selected

Add characterization tests for the current success and failure paths, then extract response decoding and failure construction into focused helpers. This improves the highest-risk orchestration code without changing deployment structure.

### 2. Refactor only VLM payload-to-row conversion

This is lower risk because the conversion code is pure and already tested, but it leaves the HTTP, nested JSON, error, and tracing responsibilities combined in the hotspot function.

### 3. Extract a separate VLM adapter `.gs` file

This would create a clearer architectural boundary, but it expands the change surface and introduces Apps Script file-loading/deployment concerns that are unnecessary for the immediate goal.

## Design

`parseZupWithPolzaVlm_` remains the top-level coordinator. It will continue to:

1. resolve the API key and model;
2. build the request;
3. create trace context and timestamps;
4. invoke the HTTP boundary;
5. delegate decoding of the HTTP response;
6. convert a decoded payload;
7. emit the success trace and attach the VLM log row.

Focused helpers will encapsulate:

- extraction of response code and UTF-8 body;
- validation and parsing of the outer Polza envelope;
- extraction and parsing of `choices[0].message.content`;
- construction of the existing empty parsed result and error trace for handled failures after trace creation.

Helpers will return explicit result objects rather than throw for currently handled response failures. Unexpected exceptions from `UrlFetchApp.fetch` will retain their current behavior and propagate.

The missing-API-key and request-building-warning branches occur before trace creation. They will continue to return an empty parsed result without emitting a Langfuse trace.

All helper names will follow the existing Apps Script convention: descriptive camelCase names ending in `_` for internal functions. They will remain global functions in `ZupImport.gs`, matching the repository's current style.

## Data Flow

```text
file + options
  -> build request
  -> UrlFetchApp.fetch
  -> HTTP code/body
  -> decode envelope
  -> decode message.content
  -> convert payload to normalized ZUP rows
  -> trace + VLM log row
  -> parsed import result
```

At a handled failure point, the decoding pipeline returns the same empty parsed result and emits the same error trace as the current implementation.

## Error Handling Invariants

The following paths must retain their current warning strings and result shapes:

- missing API key;
- request-building warning;
- non-2xx HTTP response;
- invalid outer JSON;
- missing `message.content`;
- invalid JSON inside string `message.content`.

Object-valued `message.content` remains accepted without reparsing. Trace status, request/response payload, timestamps, warnings, and trace id must remain equivalent to the current behavior.

Missing API key and request-building warnings remain untraced. Non-2xx responses and all subsequent response-decoding failures continue to emit an error trace.

## Testing

Add `tests/zup-vlm-response.test.js` with focused characterization coverage and fake Apps Script boundaries for:

1. missing API key without a trace;
2. request-building warning without a trace;
3. successful string-valued content;
4. successful object-valued content;
5. non-2xx HTTP response with an error trace;
6. invalid outer JSON with an error trace;
7. missing `message.content` with an error trace;
8. invalid nested content JSON with an error trace.

Assertions will cover returned rows or warnings, log status, and trace status/payload where relevant. Existing multi-slip and date/import tests remain unchanged unless a minimal shared test fixture is required.

Verification commands:

```bash
node tests/salary-indexation-date-logic.test.js
node tests/zup-vlm-multi-slip.test.js
node tests/zup-vlm-response.test.js
git diff --check
```

## Safety and Scope Controls

- Apply Red-Green-Refactor: characterize each branch before extraction.
- Keep each extraction behavior-preserving and rerun all three test files after every coherent step.
- Preserve the untracked `.clasp.json` file.
- Do not change parser output fixtures or warning text to make tests pass.
- If characterization reveals undocumented behavior that conflicts with this design, stop and revise the design rather than silently changing behavior.

## Acceptance Criteria

- `parseZupWithPolzaVlm_` delegates response decoding and handled failure construction to focused helpers.
- All listed success and failure paths have automated characterization coverage in `tests/zup-vlm-response.test.js`.
- Both pre-existing test commands pass.
- `git diff --check` passes.
- No external behavior, unrelated source file, or deployment configuration changes.
