## Context

The Apps Script project has three relevant but only loosely connected flows:

1. `ZupImport.gs` produces provider-neutral normalized payroll rows and deliberately keeps every source position.
2. `SalaryIndexation.gs` reconstructs values in the existing calculation sheets and produces claim facts and warnings.
3. `ClaimIntakeRequirements.gs` contains provenance-aware facts, a metadata-only audit catalog, selectable claims, and the `Анкета и требования` UI.

The audit catalog already uses four statuses, but rules contain only a version and minimum source names. Audit signals are converted into constructor warnings, while the selectable claim table contains only monetary claim facts. This separation is directionally correct, yet neither side exposes a unified explanation of what is established, what was calculated, what legal rule was used, and which exact fact or document prevents a stronger conclusion.

The working Google Sheet must remain the monetary source of truth. The canonical Google Docs template and its managed markers cannot be restructured. Normalized payroll rows cannot be grouped merely because labels, amounts, or periods match.

## Goals / Non-Goals

**Goals:**

- Make the existing separation between source fact, calculation, and claim qualification explicit and machine-testable.
- Turn the audit-rule catalog into a versioned legal/rule registry with temporal applicability and legal-review lifecycle metadata.
- Fail closed for missing facts and stale legal review without suppressing factual observations or unrelated calculations.
- Give the worker or lawyer a compact case-coverage map with concrete missing-document requests.
- Preserve the source-row identity of every item and expose a trace from a coverage/audit item back to the normalized source.
- Add the UI without moving or redesigning the approved judicial calculation structure.

**Non-Goals:**

- Automatically proving a contractual salary, bonus entitlement, payment due date, or legality of a withholding from payroll slips alone.
- Importing bank statements or adding a complete forced-absence/average-earnings product in this change.
- Replacing existing calculation methodologies, calculation sheets, or selected-claim totals.
- Reclassifying every premium as a remuneration-system component.
- Sending documents to a new OCR, VLM, or external service.
- Generating an originating pleading automatically from preliminary audit signals.

## Decisions

### 1. Extend the current catalog instead of introducing a parallel rule engine

`PAYROLL_AUDIT_RULE_CATALOG_V1` becomes the single registry used by existing audit builders. Each entry declares `id`, `version`, `title`, `legalBasis`, `effectiveFrom`, optional `effectiveTo`, `requiredFacts`, `missingFactBehavior`, `formulaVersion`, `owner`, `lastLegalReview`, `legalReviewValidUntil`, and `claimFamily`.

`getPayrollAuditRuleCatalog_()` keeps returning a defensive clone. A validator rejects missing or contradictory metadata. A resolver accepts the event date and calculation/review date and reports `applicable`, `not_yet_effective`, `expired`, or `stale_review` without mutating the registry.

Alternative considered: a second JSON file or hidden worksheet. That would make Apps Script deployment and test harness loading more complex and would create two sources of truth while the registry is still small. The public clone and schema make a later external registry migration possible.

### 2. A stale rule disables automatic legal calculation, not factual audit

When `legalReviewValidUntil` is before the evaluation date, an audit item remains visible but becomes `cannot_verify`; `automaticCalculationAllowed` is false and the missing-evidence reason explicitly requests legal review. Factual checks that carry no legal calculation formula use an `observation-v1` formula version and remain informational/warning signals, but they still expose the stale registry state.

This avoids silently applying outdated law while preserving useful document and arithmetic findings. It also avoids treating a local uncertainty as a reason to stop unrelated sheets.

### 3. Evidence references are provider-neutral immutable value objects

`createPayrollEvidenceReference_()` maps an existing normalized row to a reference with source document label/id/url/signature when available, sheet/page/source row, persisted source ordinal, recognition version/confidence, and event/period identifiers. The reference does not contain a vendor name and does not aggregate values.

The source ordinal is part of the evidence-reference identity. Therefore two equal-looking rows remain two evidence references unless an independently proven technical duplicate is explicitly linked by a later decision.

Alternative considered: use only a formatted `file → row` string. It is readable but cannot support stable conflict handling, document hashes, or later navigation.

### 4. Build one evidence chain without collapsing the three layers

An audit/calculation chain contains:

- `sourceFacts`: immutable evidence references and extracted values;
- `calculation`: rule id/version, formula version, inputs, amount or `null`, assumptions, and status;
- `qualification`: claim family or candidate direction, status, reason, missing facts/documents, and whether automatic claim inclusion is allowed.

Existing monetary claim facts remain the only input to `Аудит и требования` totals. An audit signal with `moneyImpact` does not become a claim merely because it has a numeric value. Conversely, calculated claim facts can be connected to their source references and rule metadata when those fields are available.

### 5. Coverage is a derived projection, never a second calculation

`buildCaseEvidenceCoverage_()` consumes the audit catalog, monetary claim facts, normalized rows, and reconstruction quality. It emits:

- high-level findings (documents/periods/source rows/missing periods/status counts);
- fixed provider-neutral review directions;
- each direction's status, already-calculated amount, calculability, reason, and source count;
- a deduplicated, prioritized missing-document list.

The coverage model never calculates a legal amount. It only reports amounts already present in claim facts. `cannot_verify` is rendered as unavailable, never as zero.

### 6. Render a bounded coverage block in the existing intake sheet

The block occupies a fixed `G8:L44` area above the existing Docs history. It contains `Что найдено`, `Возможные направления проверки`, and `Что нужно загрузить`, followed by compact direction rows. A named range records ownership. Rendering clears only that bounded range and does not touch the claim selection block, user questionnaire fields, Docs history, calculation sheets, or Google Docs.

The calculation transaction snapshots this range and its named-range state so a later write failure restores the previous coverage view.

Alternative considered: a new dashboard sheet. The requested route is already centered on `Анкета и требования`, and a parallel sheet would make the core evidence state harder to discover.

### 7. Keep claim directions legally distinct

Coverage definitions keep wage underpayment, Article 236 delay compensation, wage indexation duty, indexation of an awarded/recoverable amount, vacation/average-earnings review, enhanced work/overtime, and forced absence as separate directions. They have different required facts and requested documents. A payroll month is never mapped to an actual payment date or contractual due date.

## Risks / Trade-offs

- [Registry dates can themselves become stale] → every rule has an owner and legal-review deadline; stale rules fail closed and remain visible.
- [Existing audit builders do not tag every evidence fact semantically] → preserve their explicit status and record required/missing facts; add richer fact tags incrementally without fabricating availability.
- [A fixed UI range limits verbosity] → show concise aggregated requests in the sheet and keep complete item-level detail in the catalog/warnings and source notes.
- [Claim facts have uneven provenance depth] → build chains opportunistically from existing `sourceRef` and `auditDetails`; never invent missing row references.
- [Many legacy tests load all files into one VM] → implement pure ES-compatible helpers without modules or new dependencies and add targeted fake-Sheets tests.
- [Concurrent changes touch the same files] → keep edits localized around the registry, intake layout, audit orchestration, and tests; do not rewrite unrelated functions.

## Migration Plan

1. Add registry metadata, validation, temporal resolution, evidence-reference, chain, and coverage pure helpers behind the existing function surface.
2. Update audit result construction to attach a defensive rule snapshot, required/missing facts, automatic-calculation permission, and evidence chain while preserving existing callers.
3. Add the fixed coverage layout and named range; existing workbooks are repaired in place without moving current questionnaire or claim ranges.
4. Integrate coverage rendering after audit catalog construction and include it in the existing calculation transaction snapshot/rollback.
5. Run all Node regression suites and strict OpenSpec validation.
6. On rollback, deploy the previous Apps Script revision; the bounded range can remain as inert values and does not affect calculations or selected claims.

## Open Questions

- The organization and cadence for production legal review are represented in metadata but require an operational owner outside code.
- Bank-statement import and document-level access/audit logging remain separate future changes.
- A future rules service may replace the in-code registry after its persistence, signature, and approval workflow are specified.
