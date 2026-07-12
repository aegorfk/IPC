## Context

The current constructor change already makes `Конструктор` the normal user entry point and keeps Google Sheets authoritative for calculation. The next step is not a new calculator engine, but a second normal-mode surface where the user can supply case facts and select which calculated claims should be written into a narrative calculation document.

The first implementation remains payroll-slip-only. Links to local normative acts, employment contracts, addenda, statutory materials, and employer classification research are kept visible as future inputs, but are explicitly marked as not analyzed in this version.

## Goals / Non-Goals

**Goals:**

- Show exactly two normal-mode tabs: `Конструктор` and `Анкета и требования`.
- Keep payroll-slip intake on `Конструктор` and add a normative-documents Drive folder placeholder marked `пока не анализируется`.
- Capture employer sector, multiple partial recoveries, and average earnings source selection.
- Preserve both system-calculated and user-entered average earnings scenarios and let the user select which scenario is final.
- Build a human-readable audit and requirements checklist from existing reconstructed payroll-slip calculations.
- Include disputed findings by default, visually mark them as disputed, and preserve user-unchecked choices across reruns.
- Recalculate and highlight derived payments affected by changed bases without blocking unrelated results.
- Create a new Google Docs file for every repeated `Расписать выбранные требования` run, in the same Google Drive folder as the current calculation document.

**Non-Goals:**

- Do not analyze normative documents, labor contracts, addenda, statutes, or case law in this change.
- Do not classify employer legal status from FNS or court practice in this change.
- Do not generate a full statement of claim in this change.
- Do not replace the existing calculation methodology or duplicate Sheets formulas inside Docs generation.
- Do not introduce a separate web application or database.

## Decisions

### 1. Two visible normal sheets

Normal mode will show `Конструктор` and `Анкета и требования`. Detail and technical modes continue to reveal calculation and service sheets as already specified by the constructor workflow.

`Конструктор` remains the operational page: payroll-slip folder, normative-documents placeholder, Docs handoff link, progress, totals, and high-level issues. `Анкета и требования` becomes the case-fact and claim-selection page.

### 2. Normative documents are one folder and a backlog marker

The normative-document input is one Google Drive folder because employment contracts may include addenda that are legally inseparable from the base contract. The label is `Нормативные документы`, and the status text `пока не анализируется` is displayed in the left column under the label, while the link value stays in the right cell.

The implementation stores the folder link for future use but does not read, classify, parse, or calculate from those documents in this change.

### 3. Questionnaire data is structured state, not decorative layout

The questionnaire will be backed by stable named ranges or equivalent label resolvers. Employer sector is a dropdown with three values: private organization, budget sector/public debtor, and unknown. Partial recoveries are a repeated table with date, amount, and allocation target. Invalid dates or amounts are highlighted and excluded until corrected.

Average earnings keeps two scenarios: calculated by the system and entered by the user. The user-facing control `Задать вручную средний заработок` stores amount and period/date context, and a radio/selector chooses which scenario is final. Both scenarios are retained for review.

### 4. Audit groups come from existing calculated facts

The audit and requirement checklist uses existing payroll-slip import, reconstruction, and calculation outputs as the source of truth. It does not infer new legal bases from normative documents in this version.

Underpayment, material liability, and indexation are displayed as two-level groups. The top level is the claim family and base, and the second level is the period or calculation item. Every selectable item has a stable key so reruns can preserve user-unchecked selections.

The generated-Docs history remains a fixed block above the audit. The audit starts below all fixed blocks and owns only the cells identified by `CLAIM_INTAKE_CLAIM_SELECTIONS`. That named range is the sole authority for the previously rendered extent. A missing, malformed, or wrong-sheet named range initializes a one-row extent at the configured first row; setup and rendering never inspect surrounding rows to infer ownership. Rendering expands the sheet only when required, clears only the authoritative previous range and the new target range, batches checkbox validation by claim family, and then resizes the named range. Unrelated cells above, below, or beside the named range are never migration candidates.

Claim identity is vendor- and employer-neutral. Facts and stable keys use exactly five dimensions: claim family, canonical normalized `layout.id`, normalized base kind/payment semantics, period, and calculation item. Layout and base kind remain independent. Missing dimensions use explicit deterministic sentinels (`unknown_layout` and `unknown_base_kind`). No earlier key shape or alias is recognized. Employer identity, organization labels, source filenames/sheet names, and payroll-system display labels are excluded from identity and grouping. A sheet name may be retained only in `sourceRef` for traceability. 1C:ZUP remains the priority adapter and fixture source, not the domain model; an unknown normalized layout uses its normalized identifier and a generic label.

Salary-indexation facts use an explicit normalized adapter field for the pre-indexation salary column (or an equivalent direct indexation amount source). The resolver places that semantic field in `table.columns`; fact generation never assumes that the cell immediately left of the corrected amount has this meaning. If the adapter cannot provide the semantic mapping, no salary-indexation fact is fabricated.

Recovery-capable facts also carry adapter-provided source coordinates, the legal due date, the calculation end date, and explicit principal/indexation/material-liability destinations. These fields are traceability and writeback metadata only and never enter the five-part stable key. A destination may replace a formula only when the normalized layout explicitly declares that cell an adapter-owned calculation output; otherwise the formula is preserved and a review warning is emitted. Recovery timing does not alter indexation unless an existing methodology explicitly declares that dependency.

For salary, Article 236 metadata carries the same first-half/second-half debt schedule produced by `buildSalaryDebtSchedule_`, including each segment's legal due date and principal share. Recoveries are allocated chronologically across those outstanding segments in deterministic due-date/order sequence; recovered shares accrue through the recovery date and remaining shares through the calculation end date. A single due date is used only by layouts whose adapter explicitly declares `single_due_date` timing.

Calculation-layout discovery is semantic-first: recognized header/content semantics select the normalized adapter, while a sheet-name pattern is only a narrow hint/fallback. Every matching sheet is processed, including multiple sheets normalized to the same layout. The salary adapter is not a catch-all and cannot claim a sheet that lacks the required salary calculation semantics. 1C:ZUP retains adapter priority without entering the normalized domain identity.

### 5. Disputed items are included by default

Newly discovered items, including disputed ones, are checked by default. Disputed items show the badge `спорное`. Before each rerender, unchecked five-part keys are captured in a workbook-scoped metadata registry. This preserves the user's choice if a temporary calculation failure makes an item disappear and the same key later returns. Explicitly checking an item removes its key from the registry. Monetary facts and totals are never retained there. New keys after rerun are checked automatically.

This follows the chosen litigation posture: claim broadly, mark uncertainty, and let the court reduce if necessary.

### 6. Derived payments are recalculated and highlighted

When a changed base affects derivative payments, the system recalculates those dependent amounts where existing methodology supports it. The affected rows are highlighted with a fill and an explanation. The warning does not block other calculations.

Examples include vacation, average-earnings-based payments, and premium calculations whose base depends on corrected salary or underpayment values.

Partial recoveries with a valid date and amount but no reliable allocation target are not applied to any specific principal, material-liability, or indexation total. They are stored in a disputed unallocated-recovery bucket and shown in audit/Docs so the user can allocate them later without silently distorting a base.

The unallocated bucket is rendered as its own selected-by-default audit family with stable five-part keys and the badge `спорное`; it is excluded from the four calculated claim-family totals. Unsupported recovery-timing adjustment of indexation leaves the indexation amount unchanged, marks the existing audit position disputed, and emits one deduplicated methodology warning per affected target.

After base and recovery writebacks, the all-sheets workflow detects semantic derivative dependencies, applies the registry, writes supported effects, and only then performs the final rescan and audit render. Vacation uses the existing reconstructed annual/average-earnings methodology and an explicitly adapter-owned output. Premium derivatives require an explicit existing base/output formula mapping; absent that mapping, the workflow preserves the amount, highlights the review target, and emits a nonblocking warning.

The all-sheets workflow is one coordinated calculation transaction. While holding the document lock (falling back to the script lock), it first completes the idempotent constructor/intake workspace setup. That stable structure intentionally remains after a later financial failure. Only then does the financial transaction resolve every calculation sheet once into a descriptor containing the normalized layout, actual header row, semantic columns, and sheet, and snapshot every adapter-owned output plus the authoritative audit extent and relevant document properties. Legacy generated-sheet deletion is never part of this workflow and remains an explicit maintenance operation. The initial table mapping is cached on each result and reused by final rescan; the same run never invokes semantic discovery or `findTable_` again for that sheet. Base restoration, base calculations, recovery and derivative writes, final rescan, audit rendering, flush, and registry/selection persistence execute inside that boundary. Owned output columns and audit rows are grouped into contiguous rectangular ranges; values, formulas, notes, backgrounds, number formats, and validations are read and restored with bulk range calls. Exact user-entered values for every restore set are sent through one Advanced Sheets v4 `batchUpdate` containing one `UpdateCellsRequest` per rectangle with `fields: userEnteredValue`: formulas use `formulaValue`, strings (including leading `=`) use `stringValue`, numbers and booleans use their typed fields, blanks use an empty value, and Dates use a spreadsheet-timezone serial with milliseconds. Notes, backgrounds, number formats, and validations remain bounded range writes. The Advanced Sheets service is mandatory for rollback and its absence is a fatal error before restore writes. Before audit rendering, the transaction computes the planned target extent and extends its snapshot to the union of that target and the prior named-range extent. Any unexpected exception from a mutating calculation core is fatal by default and restores the exact financial/audit/property state before being rethrown. An explicitly typed or flagged data-quality issue may become a per-sheet warning even after a partial financial mutation only after that descriptor's snapshotted financial ranges are restored, flushed under the transaction lock, and verified; restore, flush, or verification failure escalates to a fatal full transaction rollback. A formula in a destination not declared adapter-owned is also a nonfatal contextual warning: that formula is preserved, unrelated destinations continue, and recovery baselines persist only for destinations actually written.

Recovery registry entries retain the explicit source and principal destination together with baseline principal, last adjusted principal, and recovery fingerprint. At the beginning of a later transaction, an adapter-owned destination that still equals the registered last-adjusted value is restored to its baseline before positive-fact filtering and base recalculation. This makes a full recovery to zero reversible and permits the regenerated source fact to receive the current recovery exactly once. Every concrete source and liability-schedule segment retains its own calculation-end date. A recovery is allocated only to segments whose due-date/end-date window contains the recovery date; debt outside that temporal window remains unchanged and accrues only through its own end date. Any unapplied amount backed by such out-of-period debt is reported as deferred/contextual rather than as an overpayment. Registry cleanup is committed only after the calculation and audit transaction succeeds.

External indexes, production calendar, and Article 236 rates are loaded once into a run context. Non-vacation descriptors are processed before vacation descriptors, and each successful source contributes once to a normalized in-memory current-run earnings snapshot. Vacation reconstruction consumes that snapshot rather than rescanning workbook or stale failed outputs. If a required source is failed or ambiguous, existing vacation outputs are preserved and a source-aware disputed review warning is emitted while unrelated sheets continue.

### 7. Docs write-out creates a new document in the same folder

`Расписать выбранные требования` creates a new Google Docs file on every run. The file is created in the same Google Drive folder as the currently linked or previously generated calculation document. If the current Doc folder cannot be resolved, the operation fails with a specific corrective message rather than silently creating a Doc elsewhere.

The new Doc includes selected claims, chosen average earnings scenario, partial recoveries applied, disputed flags, affected derivative-payment warnings, and a bounded calculation narrative. Older Docs remain unchanged.

## Risks / Trade-offs

- **Normative-document link looks usable before analysis exists** -> Display `пока не анализируется` next to the input and record normative analysis in the follow-up backlog.
- **User selections are lost when recognition changes labels** -> Use stable claim keys derived from source kind, base, period, claim family, and calculation item rather than display text only.
- **Unknown partial-recovery allocation changes Article 236 totals** -> Do not reduce allocated totals; place the row in a disputed unallocated-recovery bucket and surface it in audit/Docs for later allocation.
- **Repeated Docs creation can clutter Drive** -> Keep every generated Doc in the same folder and title it with run timestamp and selected scenario so history is traceable.
- **Derived-payment dependencies can be incomplete** -> Highlight affected rows and keep the explanation visible instead of blocking unrelated calculations.

## Migration Plan

1. Extend the constructor setup to create/repair `Анкета и требования` and the normative-documents placeholder without clearing existing constructor values.
2. Add named ranges/resolvers and persistence for questionnaire and claim-selection state.
3. Build audit groups from existing payroll-slip reconstruction/calculation outputs.
4. Add selection preservation, disputed defaults, partial-recovery validation, derived-payment highlighting, and Docs write-out state.
5. Update normal visibility mode to show both normal sheets.
6. Add focused tests, run OpenSpec validation, deploy with `clasp push`, and smoke-test the working Google Sheet.

## Open Questions

None blocking implementation. Normative-document analysis, employer status research through FNS/case law, and full statement-of-claim drafting are explicitly deferred to later OpenSpec changes.
