## 1. Characterization and Safety Net

- [x] 1.1 Run the full pre-change Node test baseline and record the bundled runtime command.
- [x] 1.2 Add failing tests for stable chronological row ordering, contiguous month groups, null-date ordering, and persisted source ordinals.
- [x] 1.3 Add failing fake-Sheets tests for idempotent table filters and skipped-file rows outside the import filter.
- [x] 1.4 Add failing tests proving multi-employer rows remain calculable and publish the explicit one-employer assumption.

## 2. Provider-Neutral Workbook Migration

- [x] 2.1 Centralize canonical import, quality, diagnostic, state, VLM, payment-structure, and reconstruction sheet names.
- [x] 2.2 Implement and test an idempotent in-place rename/formula-reference migration that preserves sheet ids, order, values, formatting, notes, and hidden state.
- [x] 2.3 Replace stale hardcoded provider-specific sheet readers, visibility classifiers, menu captions, progress text, notes, and warnings in all Apps Script modules.
- [x] 2.4 Update tests, README, and current OpenSpec wording so normal and technical workbook surfaces contain no `1С`/`ЗУП` worksheet titles.

## 3. Chronological and Filterable Payroll Ledger

- [x] 3.1 Implement the stable normalized-row comparator and sort before durable import/summary writes.
- [x] 3.2 Persist or derive a deterministic original-row ordinal for every normalized row and retry path.
- [x] 3.3 Implement bounded idempotent filters for the canonical import, summary, quality, checks, state, VLM, payment-structure, and diagnostic tables.
- [x] 3.4 Verify filters do not modify constructor, questionnaire, calculation sheets, skipped-file diagnostics, or unrelated user filters.

## 4. Legal Classification and Employer Review

- [x] 4.1 Add failing tests for legal categories, legal source/confidence/status, and preservation of raw source labels and internal calculation roles.
- [x] 4.2 Make `За первую половину месяца` and `Зарплата за месяц` payment events rather than `Оклад` accruals in deterministic and VLM normalization.
- [x] 4.3 Implement Article 129/135/191-aligned legal classification, including document-dependent premium status and Article 123 non-applicability to wage classification.
- [x] 4.4 Render legal classification columns and payment-structure JSON without breaking downstream category routing.
- [x] 4.5 Rewrite employer mismatch/missing-employer issues to state that all rows remain included under a temporary single-employer assumption.

## 5. Period, Payment Date, and Production Calendar

- [x] 5.1 Add failing tests separating payroll-slip period, accrual date, legal due date, and factual payment dates, including partial payments.
- [x] 5.2 Replace ambiguous `Год`/`Месяц` presentation with understandable accrual-period semantics and one factual `Дата выплаты` field.
- [x] 5.3 Prevent Article 236 logic from using the actual payment date as the legal due date; preserve paid-share and unpaid-remainder intervals.
- [x] 5.4 Add failing October 2023 tests for 22 reference workdays, split-row totals, partial-period exemptions, and discrepancy warnings.
- [x] 5.5 Implement production-calendar provenance/status and non-blocking month-level validation without summing repeated source rows.
- [x] 5.6 Record employment start date and first-month schedule facts as later questionnaire/document scope without inferring them from the first slip.

## 6. Vacation Timing Audit and Claim Selection

- [x] 6.1 Add failing tests for vacation-start extraction with provenance, the Article 136 three-full-calendar-day threshold, and missing-date outcomes.
- [x] 6.2 Implement `on_time`, `late_paid`, `unpaid_or_underpaid`, and `cannot_verify` vacation timing results.
- [x] 6.3 Add the stable `vacation_payment_delay` audit fact and grouped selectable requirement with disputed items selected by default and persisted by the five-part key.
- [x] 6.4 Calculate Article 236 only for the late interval/outstanding balance and prove a fully paid but late vacation does not recreate vacation principal.
- [x] 6.5 Publish human-readable vacation timing findings to `Требует внимания`, `Аудит и требования`, and the bounded Docs handoff.

## 7. Verification, Deployment, and Working Workbook

- [x] 7.1 Run every focused test through RED/GREEN, then run the complete Node suite and `git diff --check`.
- [x] 7.2 Run strict OpenSpec validation for `enhance-payroll-ledger-audit` and review the diff for unintended methodology changes.
- [x] 7.3 Push the verified Apps Script with `clasp`, migrate the working workbook, and verify sheet ids/order/formulas/filters against the Drive backup.
- [ ] 7.4 Run a constructor smoke calculation and verify chronological rows, employer warning, legal categories, October 2023 workdays, vacation timing, detailed audit checkboxes, and Docs preservation.
- [ ] 7.5 Record deployed Git commit, workbook/backup links, known disputed items, rollback instructions, and follow-up premium/LNA change.
