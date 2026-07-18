## Context

The live workbook exposes a concrete accounting defect. `Конструктор` currently sums every numeric cell below each calculation header, including detail rows, `ИТОГО` rows, and `ВСЕГО`/claim-price rows. That produces 41,448,609.53 rubles of underpayment and doubles some derivative totals. At the same time, the audit is built from rows with a parsed period and currently totals only 8,579,406.48 rubles of underpayment because composite quarterly and annual period headers are not normalized correctly.

Google Sheets must remain the calculation source of truth. The user needs a compact legal view, not technical coordinates: violation essence, period, amount, disputed status, and an independent checkbox. Source sheet/row metadata remains internal for diagnostics and writeback.

## Goals / Non-Goals

**Goals:**

- Make every displayed constructor total equal the sum of normalized selectable claim facts.
- Exclude calculation-sheet subtotal and grand-total rows from all claim totals.
- Normalize composite monthly, quarterly, and annual payment-period labels.
- Show one human-readable selectable audit item per claim family, basis, and period.
- Preserve existing five-part selection keys and user-unchecked choices.
- Prevent Docs generation when the selected/detail totals cannot be reconciled.
- Reuse the approved court-calculation hierarchy and visual system captured in `/Users/aegorfk/Desktop/Расчеты.docx`.
- Preserve every recognized payroll-slip position before any explicit calculation-layer aggregation.

**Non-Goals:**

- Display source row numbers or technical cell coordinates to the user.
- Recalculate legal entitlement from a second audit-only model.
- Analyze LNA, employment contracts, or other normative documents.
- Merge distinct periods or legal claim families for presentation convenience.
- Redesign the approved court-calculation document or replace it with a new generic selected-items table.

## Decisions

### 1. Normalized claim facts are the only total source

After each calculation adapter produces period-level facts, constructor totals are derived by claim-family mapping from those facts. Raw output columns are not summed to obtain user-facing totals because calculation sheets may legitimately contain subtotals, grand totals, and claim-price rows.

Alternative considered: identify and subtract known summary formulas from the raw sum. This is rejected because it is layout-specific and fails for new payroll/calculation layouts.

### 2. Positive unperiodized detail is an error, not an implicit omission

A row with a positive claim output and no normalized period is allowed only when it is explicitly recognized as a summary row (`ИТОГО`, `ВСЕГО`, or equivalent claim total). Any other positive unperiodized row fails reconciliation. This prevents a future adapter from silently producing a constructor total that the audit cannot explain.

Alternative considered: preserve the current partial result and add a warning. This is rejected because the user cannot safely select or plead a monetary amount that has no period.

### 3. Compact visible audit, hidden technical trace

The audit uses six columns: selection, violation essence, period, amount, disputed status, and hidden stable key. Source references stay in the in-memory fact/model and diagnostic metadata; they are not rendered. Group headings show family subtotals, while every item remains independently selectable.

The visible violation text combines family and normalized basis, for example `Недоплата по ежемесячной премии` or `Материальная ответственность за недоплату по окладу`. The period is a separate value such as `11.2025`.

### 4. Reconciliation is checked at adapter, audit, and Docs boundaries

- Adapter boundary: positive detail outputs must have normalized periods.
- Audit boundary: family totals and the overall total are recomputed from rendered items.
- Docs boundary: the selected payload is recomputed from selected item rows and rejected if its grouping or monetary cells are malformed.

The constructor receives totals from the same complete fact set that is passed to the audit. This guarantees that the headline and the selectable breakdown share one source.

### 5. Composite period semantics are normalized by headers and values

Semantic column discovery recognizes compound headers such as a quarter/year calculation period plus payment month. The value parser uses the last explicit month as the payment/accrual claim period while retaining the normalized base kind (`quarterly_premium` or `annual_premium`) in the five-part key. This remains vendor-neutral because it depends on semantics, not a sheet name or a 1C-only label.

### 6. The approved court-calculation document is a golden presentation contract

The retained reference `/Users/aegorfk/Desktop/Расчеты.docx` (SHA-256 `f59e6c85ea0c482fe44e159a21e1b3d22f0429008e9adafd7005b69a4d98b298`) controls the document hierarchy, section order, heading levels, table column order, page setup, color treatment, borders, number formatting, and total-row emphasis. The distilled contract is recorded in `approved-court-calculation-template.md`.

Selected-document generation always copies the canonical approved Google Doc `1qwMjRD99FNWnF2Wu8T7wbkSuvDOiH5tu82aSxovxArE` into the same Drive folder so page setup, named styles, and footer/page-number configuration are retained. A previous generated report is never promoted to the template merely because its link is current in the constructor. Only the new copy may be rebuilt. The source document is never cleared or repurposed. The generated body uses the approved hierarchy: title and calculation date, summary, basis-specific period tables, average earnings, forced-absence calculation when applicable, and Article 236 detail when available.

Alternative considered: create a blank Doc containing a four-column selected-items table. This is rejected because it loses the judicial calculation structure, weakens traceability of totals, and changes an approved user-facing format without consent.

### 7. User selection is the final narrative authority

The selected stable keys are captured once and all generated summary rows, basis tables, derivative columns, and the final total are derived from that exact selected set. A generated document must satisfy both of these equalities before it is saved and registered:

- document final total = sum of selected period-level items;
- document component totals by family/basis = corresponding sums of selected period-level items.

Unchecked facts remain in Sheets for audit but are absent from the new Doc. A mismatch aborts generation and trashes the incomplete copy.

Constructor headline totals are synchronized to the same selected payload when the document is generated. A calculated component that has no selectable stable key, including the current forced-absence output, is excluded from the selected claim price until it is represented in the audit; otherwise the headline could not be reproduced from the user's choices.

### 8. Recognition is lossless and aggregation is a separate layer

The normalized payroll ledger keeps one record for each source position. Matching labels, periods, amounts, or payment dates do not authorize recognition-time merging. Explicit calculation views may group those records by legal basis and period, but every aggregate retains traceability back to all contributing source identities. Only a proven duplicate extraction of the same source position may be suppressed, and that rule must be explicit and tested.

## Risks / Trade-offs

- **Previously displayed totals will drop materially** → Surface the corrected breakdown and exact reconciliation; do not preserve mathematically duplicated totals for compatibility.
- **A new layout may contain an unfamiliar summary label** → Fail with a targeted period/reconciliation error instead of silently including or excluding the amount.
- **Six audit columns enlarge the owned range** → Keep the technical key in hidden column F and retain the existing dynamic named-range ownership rules.
- **Period-level rows can be numerous** → Keep batched writes and checkbox validation bounded by claim family.
- **The approved reference contains case-specific values** → Reuse its presentation contract, not its amounts; every generated value comes from the current selected fact set.
- **A copied template may contain stale body content** → Clear only the newly created copy, rebuild it immediately, reconcile it before registration, and trash it on any failure.

## Migration Plan

1. Extend tests with the live defect shape: detail rows plus `ИТОГО` and `ВСЕГО`, and composite quarterly/annual periods.
2. Change fact/total construction and audit rendering together so no intermediate version writes inconsistent totals.
3. Push Apps Script and run a full live recalculation.
4. Verify that constructor totals equal audit family totals and that quarterly/annual items appear.
5. Verify a newly generated selected-requirements Doc against the retained reference and confirm that its final total equals the checked audit items exactly.
6. If live reconciliation fails, rollback the Apps Script source and preserve the prior workbook state through the existing calculation transaction.

## Open Questions

None. The user explicitly chose a compact visible breakdown without source rows.
