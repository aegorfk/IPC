# Deployment record

- Working workbook: https://docs.google.com/spreadsheets/d/1lhAhovg1dRQuDjghunzbjLZ92TKprUhEPZjOEymdd0M
- Drive backup: https://docs.google.com/spreadsheets/d/1TSJT97fRZe99ToiA1q-YHeu5vOoJmlC9ryFuQI-bMvI
- Deployed code commit: `df03d68` (`fix: preserve raw payroll ledger rows`)
- Previous deployed rollback point: `a73b67c` (`fix: use actual payment dates for article 236`)
- Apps Script upload: `clasp push`, completed 2026-07-18 10:35 Europe/Moscow.

## Known review items

- Employer mismatches and missing employer names remain non-blocking and are calculated under the explicit temporary single-employer assumption.
- Premiums remain document-dependent unless their source wording explicitly identifies a one-off Article 191 reward; the applicable PВТР/LNA or award order must still be checked.
- Missing or ambiguous actual payment dates remain visible review items and are not replaced by the payroll-slip month.
- Partial-month calendar values and vacation rows without a reliable source interval/date remain review items rather than blockers.
- The post-deployment working-workbook import and row-by-row smoke check remain pending until the user starts a fresh import with parser `payroll-import-v17-raw-ledger`.

## Rollback

Restore the four Apps Script source files and manifest from Git commit `a73b67c`, run `clasp push`, and continue work in the Drive backup if workbook invariants differ. Do not delete or rebuild the working workbook merely to roll back code.

## Follow-up specification

Normative-document, employment-start, overtime, accumulated-vacation, and premium due-date work is tracked in `add-employment-and-premium-due-date-audit`.
