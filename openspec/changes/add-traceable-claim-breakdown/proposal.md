## Why

The constructor currently shows an unexplained claim total: the live workbook reports about 43.47 million rubles, while the visible underpayment audit accounts for only about 8.58 million rubles. Summary rows are being counted together with their underlying detail rows, and some quarterly and annual periods are not converted into selectable audit items, so the user cannot verify or safely choose what should be written into the claim narrative.

## What Changes

- Calculate constructor family totals only from normalized period-level claim facts, excluding subtotal and grand-total rows from calculation sheets.
- Recognize monthly, quarterly, and annual period labels well enough to create one selectable claim item for every substantive calculation period.
- Render a human-readable checklist with separate visible columns for the essence of the violation, period, amount, and disputed status; keep technical source coordinates and stable keys hidden.
- Reconcile every family subtotal and the overall constructor total against the rendered period-level facts, and surface a blocking calculation error when the amounts do not match.
- Generate Docs narratives only from the detailed items selected by the user.
- Restore the approved court-calculation document structure and formatting from the retained `Расчеты.docx` reference instead of generating a parallel simplified report.
- Create each selected-requirements Doc as a new copy in the same Drive folder, preserve the approved page/style system, and populate it only from currently checked claim facts.
- Preserve payroll-slip source positions one-for-one during recognition and normalization; aggregation is allowed only in later explicit summary/calculation views.

## Capabilities

### New Capabilities

- `traceable-claim-breakdown`: Period-level, selectable, human-readable claim breakdown with source-of-truth reconciliation and hidden technical traceability.

### Modified Capabilities

None.

## Impact

- Apps Script calculation totals and audit rendering in `SalaryIndexation.gs` and `ClaimIntakeRequirements.gs`.
- Claim-selection layout and payload parsing on `Анкета и требования`.
- Constructor workflow tests and live Google Sheets deployment.
- Existing five-part selection keys remain authoritative; no compatibility alias or duplicate calculation store is introduced.
- The approved court-calculation layout is a change-controlled interface: layout or style changes require explicit user approval and an updated specification/mockup.
