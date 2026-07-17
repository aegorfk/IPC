## Context

The payroll importer already normalizes deterministic and VLM extraction into a fixed row schema and feeds reconstruction, calculation, constructor issues, and claim facts. The domain layer is partly vendor-neutral, but the persisted worksheet names and several captions still expose `1С`/`ЗУП`. The row schema also uses one calculation category for both accrual meaning and payment-event routing, which is why aggregate payment labels can appear as `Оклад`.

The first-version evidence boundary remains payroll slips plus user-entered questionnaire facts. Payroll slips can show a period, source label, amount, employer, vacation interval, and sometimes an actual bank-statement date. They generally cannot prove the contractual due date of a bonus, whether a bonus belongs to the remuneration system, the higher Article 236 coefficient, or the employee's exact hire date.

## Goals / Non-Goals

**Goals:**

- Provide a provider-neutral, chronological, filterable payroll ledger without replacing the current parser or calculation methodology.
- Preserve separate meanings for source label, event type, calculation role, legal category, accrual period, due date, and actual payment date.
- Treat employer mismatches, calendar conflicts, missing dates, and document-dependent legal classification as visible non-blocking review issues.
- Correctly distinguish late-paid vacation pay from unpaid/underpaid vacation principal.
- Make every automatic legal inference traceable and conservative while continuing the user's preferred maximum-claim workflow for disputed items.

**Non-Goals:**

- Determining employer legal status through FNS/case-law sources.
- Parsing employment contracts, addenda, collective agreements, or local normative acts.
- Inventing a quarterly-premium due date from the quarter end alone.
- Treating every item called `премия` as a vested component of salary without supporting remuneration-system documents.
- Replacing the current calculation sheets or changing unrelated indexation methodology.

## Decisions

### 1. Keep the existing parser adapter but remove provider names from the workbook contract

Internal function names may remain `Zup*` to limit risky code churn, but every user-visible service/reconstruction sheet name, header, note, warning, and menu caption SHALL be provider-neutral. A centralized name map will define canonical names such as `Расчетные_листы`, `Расчетные_листы_Качество`, and `Реконструкция_*`.

Existing sheets will be renamed in place before lookup. Formulas containing old sheet references will be rewritten as part of the same migration, preserving sheet ids, order, data, formatting, and notes. Name lookup during the migration may recognize the old name once; normal post-migration behavior uses only canonical names.

Alternative rejected: creating duplicate neutral sheets. It would split the system of record and risk divergent calculations.

### 2. Use a two-axis classification instead of overloading `Категория`

The existing calculation category remains an internal routing field. The ledger adds an explicit legal category and classification status:

- `Оплата труда — основная часть`;
- `Оплата труда — компенсационная выплата`;
- `Оплата труда — стимулирующая выплата`;
- `Премия/поощрение — требуются документы`;
- `Гарантийная выплата / средний заработок`;
- `Социальная или иная выплата`;
- `Удержание`;
- `Выплата ранее начисленных сумм`;
- `Смешанная выплата — состав не раскрыт`;
- `Не определено`.

`Вид начисления / выплаты` preserves the source label. `Событие` identifies `Начислено`, `Выплачено`, or `Удержано`. Payment labels `За первую половину месяца` and `Зарплата за месяц` are payment events with mixed/unknown composition and never become an accrual of `Оклад` merely because of their text.

Premium classification is explicitly document-dependent unless the evidence safely establishes its role. This follows the distinction between Articles 129/135 and Article 191 and prevents a probabilistic label from becoming a hard entitlement conclusion.

### 3. Keep event dates separate and show only understandable time dimensions

The canonical ledger stores:

- `Период начисления` (month/year);
- `Дата начисления`, when present or safely derived;
- `Дата выплаты`, only when recognized from an actual payment/statement event;
- an internal future `Срок выплаты` field, which remains blank unless supplied by statute, questionnaire, or later document analysis.

The old `Год`/`Месяц` technical columns remain available internally if needed for formulas but are not presented as payment components. They are labeled as accrual-period components or hidden from the normal ledger view. Article 236 uses the actual payment date and partial-payment schedule when available; a payroll-period month is never substituted for a factual day.

### 4. Sort before every durable ledger write and apply filters idempotently

Rows are stably sorted by accrual period, then factual payment date, event order, source file, and original source-row order. This keeps all rows for one month together while preserving deterministic ordering inside that month. Every canonical table write removes an obsolete filter if necessary and creates one filter covering exactly its current header and data rows; appended skipped-file diagnostics remain outside the ledger filter.

### 5. Validate workdays against the loaded production calendar

The calendar workday count is calculated from the same production-calendar source used by downstream computations. A month-level validation compares the reference value with any imported `Рабочие дни`. Reference values are never summed across multiple accrual rows. When an imported count reflects only a partial period, the system preserves it as factual source data and labels it `частичный период`; otherwise a conflict becomes a review issue.

October 2023 is a regression fixture with 22 reference working days. If the calendar service is unavailable, weekend-only fallback is marked as lower-confidence and does not overwrite a source value silently.

Employment start date is not guessed from the first payroll slip. A later questionnaire/document capability will bound expected working days for the first employment month.

### 6. Employer mismatch means one calculation assumption plus a visible warning

The most frequent recognized employer remains the temporary primary employer for the current combined calculation. Every mismatched or missing employer period is highlighted and published to `Требует внимания` with explicit text: calculations currently combine the rows as if they belonged to one employer; the user must review whether separate debtors/calculations are required. No row is dropped and no calculation blocks solely because of this mismatch.

### 7. Vacation timing is a factual audit; principal and delay consequences stay separate

The importer derives `vacationStartDate` only from a recognized vacation interval/start date and `actualPaymentDate` from the payment/statement row. The due threshold is three full calendar days before the vacation begins. Results are:

- `on_time`;
- `late_paid` with delay days and Article 236 base;
- `unpaid_or_underpaid` with outstanding principal plus Article 236;
- `cannot_verify` when either required date is missing.

A `late_paid` result SHALL NOT recreate the already-paid vacation principal as an underpayment. It creates a selectable disputed claim/audit fact for Article 236 and a human-readable recommendation. An actually unpaid/underpaid amount creates separate principal and liability facts.

### 8. Premium-delay detection is staged

Version one records a candidate when the premium accrual period and factual payment period are materially separated, for example a first-quarter premium paid in July. It does not assume March as the due date. The candidate is selected by default as disputed, requests the remuneration-system document or user-entered due date, and has no fabricated Article 236 amount.

The follow-up stage will extract or ask for the relevant LNA/contract due date, determine whether the premium is part of the remuneration system, and then calculate delay and compensation.

## Risks / Trade-offs

- **Renaming service sheets can break literal formulas** → migrate in place, rewrite formulas from a centralized map, snapshot names/formulas before deployment, and rollback from the Drive backup if verification differs.
- **Legal categories appear more complex than old labels** → keep the raw source label visible and add short human-readable statuses rather than hiding uncertainty.
- **Payroll slips do not prove the due date** → never fabricate a date; publish a selected disputed candidate with a document request.
- **Calendar source may be unavailable or malformed** → use weekend fallback only with an explicit lower-confidence issue and regression-test known months.
- **A payment may aggregate several accrual categories** → classify the event as mixed and keep source traceability; do not force an `Оклад` split without evidence.
- **A late vacation payment might be mistaken for unpaid principal** → use separate violation kinds and separate claim keys for principal versus Article 236 consequences.

## Migration Plan

1. Add characterization tests for existing canonical rows and snapshot the workbook's current sheet ids, order, formulas, named ranges, and filter state.
2. Add failing tests for neutral names, chronological sorting, filter bounds, employer-assumption warnings, payment-event classification, October 2023 workdays, and vacation timing.
3. Introduce centralized canonical names and an idempotent in-place migration.
4. Add legal-classification metadata without removing the internal calculation role.
5. Add calendar/employer/vacation audit facts and integrate them into constructor issues and selectable requirements.
6. Run the full local suite and strict OpenSpec validation.
7. Push with `clasp`, open the working workbook, run migration/setup, and verify sheet ids/order/formulas before a smoke calculation.
8. Roll back by redeploying the prior Git commit and using the existing Drive backup if invariant checks fail.

## Open Questions

- The exact premium due date and whether the premium belongs to the remuneration system remain document/user-fact questions by design.
- The employment start date and first-month expected workdays remain a questionnaire/LNA follow-up and SHALL NOT be inferred from an incomplete payroll history.
