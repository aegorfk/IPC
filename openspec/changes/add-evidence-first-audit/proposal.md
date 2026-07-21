## Why

The project already preserves payroll-slip rows and produces calculations, warnings, and selectable claims, but these outputs do not yet share one explicit evidence contract. A user can therefore see a warning or amount without a single place that explains whether it is a source fact, a calculation hypothesis, a legally qualified claim, or an item that cannot be verified until a particular document is supplied.

## Source specification alignment

This change is the implementation slice of `/Users/aegorfk/Desktop/ТЗ_сервис_аудита_трудовых_выплат.md` (SHA-256 `009e11a2ca835726e60ed79e8cf809486ec09a7ecb9dd0cc1a8c9ccc27a401eb`, received 21.07.2026). The source specification is broader than the current Apps Script adapter; this change brings its P0/P1 evidence-first contract into the existing workbook without pretending that the future Case/Document/Queue services already exist.

| Source requirements | Implemented in this change |
| --- | --- |
| FR-PAYROLL-001/002, FR-QA-001/002/003 | Provider-neutral source references, persisted ordinals, row-level quality signals, and no silent normalization changes. |
| FR-FACT-001–005 | Fact candidates retain source, priority, confidence, conflict status, and concrete evidence requests. |
| FR-RULE-001/004/005 | Versioned rule registry with official sources, applicability, legal-review expiry, and fail-closed evaluation. |
| FR-CALC-002/004/005/008 | Separate calculation/qualification layers, independent payment dates, distinct indexation directions, and transactional publication. |
| FR-CLAIM-001–004 | Stable claim keys, immutable calculated snapshot, and selection-only user editing. |
| FR-EVID-001/002 and FR-EXPORT-003 | Bounded `G8:L44` coverage map, deduplicated document requests, and approved Docs marker boundaries. |
| §14, §15 and MVP criteria 2–9 | Regression coverage for equal-looking rows, missing facts, stale rules, null unavailable amounts, claim-total exclusion, and rollback. |

Case access control, object storage, external OCR consent, queue workers, API endpoints, and security operations from the target architecture remain separately deployable bounded contexts; the workbook adapter does not claim to implement them.

## What Changes

- Introduce an evidence-chain model that keeps source facts, calculated positions, and legal/claim qualification separate while preserving traceability to every source row.
- Replace the metadata-only audit catalog with a validated, versioned rule registry containing applicability dates, legal sources, required facts, formula version, legal-review ownership, and a fail-closed stale-rule state.
- Evaluate every audit result against its rule and available evidence; missing facts produce `cannot_verify` plus a concrete question/document request rather than a zero amount or an inferred legal conclusion.
- Add an evidence-first case-coverage model and a bounded block on `Анкета и требования` showing what was found, which claim directions are merely candidates, which evidence is missing, and whether an amount may be calculated.
- Keep the four proof statuses consistent across facts, audit results, calculated positions, and coverage rows: `confirmed`, `probable_or_disputed`, `cannot_verify`, and `informational`.
- Preserve the existing Google Sheets calculation as the monetary source of truth and the approved Google Docs court-calculation template unchanged.
- Do not aggregate or deduplicate normalized payroll rows; evidence summaries contain references to independent source positions rather than replacing them.

## Capabilities

### New Capabilities

- `evidence-chain-model`: Separation and traceability of document facts, calculation interpretation, and legal/claim qualification.
- `versioned-legal-rule-registry`: Reproducible, time-applicable, legally reviewable rules with conservative behavior when facts or legal review are missing.
- `case-evidence-coverage`: User-facing coverage map that distinguishes findings, possible review directions, calculability, and concrete missing-evidence requests.

### Modified Capabilities

- `zup-import-reading`: Normalized source rows expose provider-neutral evidence references sufficient to trace audit results without grouping otherwise identical rows.

## Impact

- Primary implementation: `google-apps-script/ClaimIntakeRequirements.gs` and the calculation orchestration in `google-apps-script/SalaryIndexation.gs`.
- Import integration: provider-neutral evidence-reference construction from the existing normalized row contract in `google-apps-script/ZupImport.gs` without changing parsers or worksheet aggregation rules.
- UI: a bounded, named coverage range on `Анкета и требования`; the approved judicial calculation layout and canonical Docs template are not changed.
- Tests: pure rule/evidence/coverage tests plus fake-Sheets rendering and orchestration regression coverage in `tests/claim-constructor-workflow.test.js`.
- No new runtime dependency or external data transfer is introduced.
