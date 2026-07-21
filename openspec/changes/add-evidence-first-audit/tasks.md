## 1. Rule registry and evidence contract

- [x] 1.1 Expand the audit rule registry with schema, legal basis, applicability, required facts, formula, owner, and legal-review lifecycle metadata.
- [x] 1.2 Implement registry validation, defensive reads, temporal resolution, and stale-rule fail-closed evaluation.
- [x] 1.3 Implement provider-neutral source-row evidence references that preserve ordinals and report incomplete traceability without inventing coordinates.
- [x] 1.4 Extend audit results with rule snapshots, required/missing facts, automatic-calculation permission, and the separated evidence/calculation/qualification chain.

## 2. Case coverage model

- [x] 2.1 Define distinct evidence requirements for wage underpayment, Article 236 delay, wage indexation, recoverable-sum indexation, vacation/average earnings, enhanced work/overtime, and forced absence.
- [x] 2.2 Implement the pure case-coverage projection from normalized rows, quality, audit results, and existing claim facts.
- [x] 2.3 Deduplicate missing-document requests while retaining affected directions and underlying audit item identities.
- [x] 2.4 Ensure audit signals with numeric impact never enter claim totals and unavailable amounts remain `null` rather than zero.

## 3. Bounded Google Sheets presentation

- [x] 3.1 Add the owned `G8:L44` case-coverage layout and named range without moving existing questionnaire, claims, or Docs-history ranges.
- [x] 3.2 Render `Что найдено`, review directions, statuses, existing calculated amounts, and `Что нужно загрузить` only inside the owned range.
- [x] 3.3 Integrate coverage rendering after the audit catalog is built and keep the existing claim-selection renderer sourced only from calculated claim facts.
- [x] 3.4 Include coverage values, formatting, validations, notes, and named-range ownership in calculation transaction rollback.

## 4. Verification and documentation

- [x] 4.1 Add registry/evidence tests for defensive copies, invalid metadata, applicability, stale review, missing facts, and distinct equal-looking source rows.
- [x] 4.2 Add coverage-model tests for separate legal directions, disputed calculated positions, null unavailable amounts, and deduplicated document requests.
- [x] 4.3 Add fake-Sheets rendering/orchestration/rollback tests proving the bounded block does not alter claim selections or Docs history.
- [x] 4.4 Update README product positioning and user workflow to explain evidence-first statuses, coverage, and limits of payroll-slip-only conclusions.
- [x] 4.5 Run all Node regression suites and strict OpenSpec validation for `add-evidence-first-audit`.
