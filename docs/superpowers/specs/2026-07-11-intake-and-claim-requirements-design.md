# Intake And Claim Requirements Design

## Source Of Truth

This design is specified in OpenSpec change `add-intake-and-claim-requirements`:

- `openspec/changes/add-intake-and-claim-requirements/proposal.md`
- `openspec/changes/add-intake-and-claim-requirements/design.md`
- `openspec/changes/add-intake-and-claim-requirements/specs/intake-and-claim-requirements/spec.md`
- `openspec/changes/add-intake-and-claim-requirements/specs/claim-constructor-workflow/spec.md`
- `openspec/changes/add-intake-and-claim-requirements/tasks.md`

OpenSpec remains the authoritative implementation contract. This document exists to satisfy the brainstorming review workflow and to summarize the approved design in one readable place.

## Approved User Decisions

- Normal mode shows exactly two workflow sheets: `Конструктор` and `Анкета и требования`.
- `Конструктор` keeps the payroll-slip folder, calculation progress, totals, and Docs handoff.
- `Нормативные документы` is one Google Drive folder input because it may contain LNA, the employment contract, and addenda. It is marked `пока не анализируется`.
- First version analyzes only payroll slips. Normative documents, labor contract/addenda analysis, statutes, FNS charter lookup, and case-law employer classification are deferred.
- Employer sector is a dropdown with private organization, budget sector/public debtor, and unknown.
- Partial recoveries support multiple date/amount/allocation rows.
- Average earnings keeps both system-calculated and user-entered scenarios. The user chooses which scenario is final.
- Audit items are grouped under `Взыскать недоплату`, `Материальная ответственность`, `Индексация заработной платы`, and `Индексация недоплаты`.
- Disputed items are checked by default and marked `спорное`.
- User-unchecked claim items persist across reruns; newly discovered items are checked by default.
- Derived payments affected by changed bases are recalculated where supported, highlighted with fill, and explained without blocking other calculations.
- `Расписать выбранные требования` creates a new Google Docs file on every run, in the same Google Drive folder as the current or previously generated calculation document.

## Implementation Boundary

The implementation must reuse the existing payroll-slip import, reconstruction, calculation, and Docs methodology. Google Sheets remains the system of record; Google Docs explains selected results after Sheets calculations complete.

The change must not introduce normative-document analysis, full statement-of-claim drafting, or a parallel calculation engine.

## Review Status

OpenSpec strict validation passed for `add-intake-and-claim-requirements`.
