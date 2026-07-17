## Why

The recognized payroll ledger is still organized as a technical import: it exposes provider-specific sheet names, mixes accrual semantics with payment labels, does not guarantee chronological/filterable presentation, and can silently suggest that every slip belongs to one employer. This makes legal review harder and can distort downstream Article 236 and vacation-payment analysis even when recognition itself succeeded.

## What Changes

- Replace user-visible `1С`/`ЗУП` worksheet names and captions with payroll-provider-neutral names while keeping the current parser as an implementation adapter.
- Present normalized payroll rows in chronological order, grouped by payroll period, with filters on every tabular output.
- Make employer mismatches and missing employers visible as non-blocking review issues; calculations continue under an explicit single-employer assumption until the user resolves the issue.
- Separate the accrual period from the actual payment date and expose one understandable `Дата выплаты` field instead of treating period year/month as payment components.
- Align legal classification with Articles 129, 135, and 191 of the Labor Code: salary components, compensatory components, incentive components included in the remuneration system, non-remuneration incentives, guarantees/average earnings, withholdings, and payment events remain distinguishable from source labels.
- Stop classifying payment-event labels such as `За первую половину месяца` and `Зарплата за месяц` as `Оклад` merely because the payment may include salary components.
- Validate production-calendar workdays by month, retain factual days separately, and raise a review issue instead of silently using a conflicting number.
- Use actual payment dates, when reliably recognized, as the factual basis for Article 236 calculations; absent or ambiguous dates remain non-blocking review issues.
- Detect vacation payments made later than three calendar days before vacation starts, create a selectable audit item for the delayed vacation payment and its Article 236 consequence, and avoid treating the whole vacation principal as unpaid when it was merely paid late.
- Record follow-up scope for employment start date, employment contract/LNA payment rules, quarterly-premium due-date determination, delayed-premium claims, and richer monetary assessment when the legal due date cannot be inferred from payroll slips alone.

## Capabilities

### New Capabilities
- `payroll-ledger-audit`: Provider-neutral ledger presentation, legal classification, chronology, employer review, payment-date provenance, calendar validation, and payroll-slip-only timing violations.

### Modified Capabilities
- `zup-import-reading`: Normalized import output and reconstruction requirements become provider-neutral at the worksheet boundary and preserve distinct accrual-period/payment-date semantics.

## Impact

- Main implementation: `google-apps-script/ZupImport.gs`, with narrow integrations in `ClaimConstructor.gs`, `ClaimIntakeRequirements.gs`, and `SalaryIndexation.gs` where audit facts or Article 236 dates are consumed.
- Tests: `tests/salary-indexation-date-logic.test.js`, `tests/claim-constructor-workflow.test.js`, and focused new characterization cases for chronology, filters, legal categories, calendar conflicts, employer mismatch, and vacation timing.
- Existing workbook: service and reconstruction sheets are renamed in place so sheet ids, values, formulas, order, and audit history are preserved; formulas and named references are migrated before calculations resume.
- No new external API or OAuth scope is required. Normative-document parsing, employer legal-status research, and complete premium due-date adjudication remain outside this change.
