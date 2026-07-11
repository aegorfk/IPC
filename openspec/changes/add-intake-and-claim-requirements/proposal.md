## Why

The constructor now hides most technical sheets, but the user still lacks a clear intake surface for legally relevant facts and a human-readable checklist of claims to carry into the final lawsuit narrative. This change turns the spreadsheet into a two-tab normal workspace: inputs and calculation progress stay in `Конструктор`, while questionnaire answers and claim selection live in `Анкета и требования`.

## What Changes

- Add a visible normal-mode sheet `Анкета и требования` beside `Конструктор`.
- Add intake fields for employer sector, normative-document folder, partial recoveries, and average earnings scenarios.
- Keep first-version analysis based only on payroll slips; normative documents, labor contracts, addenda, statutes, and case-law classification are recorded as a later-stage backlog and marked `пока не анализируется`.
- Add an audit and claim-selection surface with grouped, user-readable requirements, disputed-item markings, default inclusion, persistent unchecked choices, and dependent-payment warnings.
- Generate a new Google Docs calculation narrative for every repeated claim write-out, in the same Google Drive folder as the existing/current calculation document, while preserving earlier Docs.
- Rename the final action to `Расписать выбранные требования`.

## Capabilities

### New Capabilities

- `intake-and-claim-requirements`: Questionnaire, audit, claim selection, repeated Docs write-out, and first-version payroll-slip-only scope for the two-tab constructor workflow.

### Modified Capabilities

- `claim-constructor-workflow`: Normal visibility mode and constructor intake layout now include the second visible sheet and normative-document folder placeholder.

## Impact

- Apps Script sheet layout and menu/orchestration code for constructor setup, visibility modes, and generated sections.
- Existing normalized payroll-slip/reconstruction/calculation outputs, reused as the authoritative source for audit groups and claim totals.
- Google Docs handoff code: repeated write-outs create new Docs in the same Drive folder rather than overwriting the previous calculation document.
- OpenSpec and tests for sheet layout, state persistence, claim selection defaults, partial-recovery validation, derived-payment warnings, and Docs creation behavior.
