## 1. Regression Tests

- [x] 1.1 Add a calculation-total regression covering period detail plus `ИТОГО`, `ВСЕГО`, and claim-price rows.
- [x] 1.2 Add quarterly and annual composite-period discovery and fact-generation tests.
- [x] 1.3 Add audit-layout tests for separate violation, period, amount, status, hidden key, and preserved unchecked selections.
- [x] 1.4 Add selected-Docs payload tests proving one unchecked period is excluded and malformed items are rejected.

## 2. Period Facts And Reconciliation

- [x] 2.1 Recognize vendor-neutral compound calculation-period/payment-period headers and values.
- [x] 2.2 Detect summary rows separately from positive unperiodized detail rows.
- [x] 2.3 Derive constructor underpayment, indexation, material-liability, and total amounts only from normalized claim facts.
- [x] 2.4 Fail the calculation transaction on an unexplained positive non-summary output.
- [x] 2.5 Reconcile family and overall totals before constructor writeback and audit rendering.

## 3. Human-Readable Audit And Selection

- [x] 3.1 Expand the owned audit range to six columns and keep the technical stable key in hidden column F.
- [x] 3.2 Render separate visible violation essence, period, amount, and disputed-status values without source row coordinates.
- [x] 3.3 Preserve five-part keys, disputed-by-default behavior, and durable unchecked selections.
- [x] 3.4 Update selected-claim payload parsing and Docs grouping for the six-column detail layout.

## 4. Validation And Deployment

- [x] 4.1 Run all Apps Script Node regression suites and strict OpenSpec validation.
- [x] 4.2 Push Apps Script and run a full calculation against the working Google Sheet.
- [x] 4.3 Verify live constructor totals equal audit subtotals and quarterly/annual items are selectable.
- [x] 4.4 Commit the specification, implementation, tests, and deployment handoff.

## 5. Approved Court-Calculation Document

- [x] 5.1 Locate, hash, render, and distill the retained `Расчеты.docx` reference.
- [x] 5.2 Replace blank generic selected-Doc creation with a copy of the approved Google Doc in the same Drive folder.
- [x] 5.3 Rebuild the new copy with the approved title, summary, basis-specific period tables, average-earnings section, applicable forced-absence section, and Article 236 detail hierarchy.
- [x] 5.4 Derive every generated component and total only from checked stable keys and abort/clean up on any mismatch.
- [x] 5.5 Add structural/style-contract and selected-total reconciliation regression tests.
- [x] 5.6 Generate a live selected-requirements Doc and visually compare every rendered page with the retained reference.
- [x] 5.7 Pin the approved Google Doc as the canonical source and prevent a prior generated report from becoming the next template.

## 6. Lossless Payroll Recognition

- [x] 6.1 Audit the recognition/normalization path for implicit grouping or summation before the normalized ledger.
- [x] 6.2 Add regression coverage proving similar source positions remain separate, including same-name vacation or premium rows with different payment dates.
- [x] 6.3 Keep aggregation confined to explicit calculation/report layers with contributing source identities retained.
