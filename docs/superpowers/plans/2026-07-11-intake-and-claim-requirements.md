# Intake And Claim Requirements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved two-sheet intake and claim-selection workflow, apply questionnaire facts to calculations, and create a new calculation Doc in the same Drive folder for each write-out.

**Architecture:** Keep `Конструктор` as the orchestration dashboard and add a focused Apps Script module for the `Анкета и требования` sheet, its persisted state, audit model, partial recoveries, and Docs history. Reuse reconstructed payroll-slip and existing calculation results as the only v1 source of claim facts. Extend the current calculation/Docs handoff through explicit payloads and injectable Drive/Docs collaborators so behavior can be tested locally before deployment.

**Tech Stack:** Google Apps Script (V8), Google Sheets/Drive/Docs services, Node.js `vm` test harness with `assert`, OpenSpec, clasp.

---

## File structure

- Create `google-apps-script/ClaimIntakeRequirements.gs`: questionnaire layout, stable field resolvers, state capture/repair, audit model/rendering, recovery allocation, derived-payment warnings, selected-claim payload, Docs creation/history.
- Modify `google-apps-script/ClaimConstructor.gs`: constructor placeholder, two-sheet setup/visibility, pipeline hooks, menu-facing action, dashboard synchronization.
- Modify `google-apps-script/SalaryIndexation.gs`: expose existing calculation rows as normalized claim facts and render a bounded narrative into a newly created Doc without changing calculation authority.
- Modify `tests/claim-constructor-workflow.test.js`: extend fake Sheets/Drive/Docs services and add end-to-end workflow regression cases.
- Modify `openspec/changes/add-intake-and-claim-requirements/tasks.md`: mark each requirement complete immediately after its implementation and verification.

### Task 1: Two-sheet layout and stable inputs

**Files:**
- Create: `google-apps-script/ClaimIntakeRequirements.gs`
- Modify: `google-apps-script/ClaimConstructor.gs:1-170`
- Test: `tests/claim-constructor-workflow.test.js`

- [ ] **Step 1: Add failing layout and preservation tests**

Add `ClaimIntakeRequirements.gs` to `SOURCE_FILES`, then test that setup creates `Анкета и требования`, normal mode shows exactly the two user sheets, detail mode also shows primary calculations, and repeated repair preserves constructor links and questionnaire values. Extend `FakeRange` only with the formatting/validation methods actually exercised (`setDataValidation`, `getDataValidation`, `insertCheckboxes`, `setBackgrounds`, `getBackgrounds`).

```js
const first = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
first.questionnaire.getRange('B4').setValue('Частная организация');
first.constructor.getRange('B6').setValue(normativeUrl);
const repaired = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
assert.strictEqual(repaired.questionnaire.getRange('B4').getValue(), 'Частная организация');
assert.strictEqual(repaired.constructor.getRange('B6').getValue(), normativeUrl);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: FAIL because `ensureClaimConstructorWorkspace_` and the questionnaire sheet do not exist.

- [ ] **Step 3: Implement the minimal idempotent layout**

Define settings and layout functions in the new module:

```js
const CLAIM_INTAKE_SETTINGS = {
  SHEET_NAME: 'Анкета и требования',
  NORMAL_SHEET_NAMES: ['Конструктор', 'Анкета и требования'],
  SECTOR_VALUES: ['Частная организация', 'Бюджетный сектор / публичный должник', 'Неизвестно'],
  HISTORY_PROPERTY: 'CLAIM_GENERATED_DOCS_HISTORY',
};

function ensureClaimConstructorWorkspace_(spreadsheet) {
  const constructor = ensureClaimConstructorSheet_(spreadsheet);
  const questionnaire = ensureClaimIntakeSheet_(spreadsheet);
  return { constructor, questionnaire };
}
```

Add `Нормативные документы` to `Конструктор`: label in `A6`, `пока не анализируется` in `A7`, folder link in `B6`, and move the Docs/status/totals/issues blocks down without clearing old values. Before assigning the new meaning to `B6`, detect the legacy `Расписанный расчет:` label/value pair and copy its Doc URL to the new Docs value cell; only clear the old label after the destination has been verified. Register named ranges for payroll slips, normative folder, current output Doc, questionnaire fields, recovery table, and Docs history anchors. Treat `Анкета и требования` as `questionnaire` in `classifyClaimConstructorSheet_` and show it in normal/detail modes.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: PASS, including existing constructor regressions.

- [ ] **Step 5: Mark OpenSpec tasks 1.1-1.5 and commit**

```bash
git add google-apps-script/ClaimIntakeRequirements.gs google-apps-script/ClaimConstructor.gs tests/claim-constructor-workflow.test.js openspec/changes/add-intake-and-claim-requirements/tasks.md
git commit -m "feat: add claim intake workspace"
```

### Task 2: Questionnaire state and partial-recovery validation

**Files:**
- Modify: `google-apps-script/ClaimIntakeRequirements.gs`
- Test: `tests/claim-constructor-workflow.test.js`

- [ ] **Step 1: Add failing questionnaire tests**

Cover sector dropdown, both retained average-earnings scenarios, final scenario selector, inline `источник: пользователь`, calculated badge, multiple recovery rows, `Добавить`, and persistence through repair/reopen. Test valid, invalid, and valid-but-unallocated recoveries.

```js
const parsed = harness.context.normalizePartialRecoveries_([
  { date: new Date('2026-02-01'), amount: 10000, allocationKey: 'underpayment:salary:2026-01' },
  { date: 'ошибка', amount: 5000, allocationKey: 'underpayment:salary:2026-01' },
  { date: new Date('2026-03-01'), amount: 3000, allocationKey: '' },
]);
assert.strictEqual(parsed.valid.length, 1);
assert.strictEqual(parsed.invalid.length, 1);
assert.strictEqual(parsed.unallocated.length, 1);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: FAIL because questionnaire state and recovery normalization are missing.

- [ ] **Step 3: Implement capture, validation, and persistence**

Use sheet cells/named ranges as durable state; do not duplicate ordinary answers into script properties. Implement:

```js
function normalizePartialRecoveries_(rows) {
  return (rows || []).reduce((state, row, index) => {
    const date = parseDateValue_(row.date);
    const amount = parseMoney_(row.amount);
    const normalized = Object.assign({ rowIndex: index }, row, { date, amount });
    if (!date || !(amount > 0)) state.invalid.push(normalized);
    else if (!String(row.allocationKey || '').trim()) state.unallocated.push(Object.assign(normalized, { disputed: true }));
    else state.valid.push(normalized);
    return state;
  }, { valid: [], invalid: [], unallocated: [] });
}
```

The final average-earnings selector must return either `{source:'calculated', ...}` or `{source:'user', ...}` while retaining both rows. Invalid recovery rows receive error fill/note and are excluded without throwing.

- [ ] **Step 4: Run focused test and verify GREEN**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: PASS.

- [ ] **Step 5: Mark OpenSpec tasks 2.1-2.5 and commit**

```bash
git add google-apps-script/ClaimIntakeRequirements.gs tests/claim-constructor-workflow.test.js openspec/changes/add-intake-and-claim-requirements/tasks.md
git commit -m "feat: persist claim questionnaire state"
```

### Task 3: Audit model, stable keys, and selection persistence

**Files:**
- Modify: `google-apps-script/ClaimIntakeRequirements.gs`
- Modify: `google-apps-script/SalaryIndexation.gs:260-306,973-984,2459-2491`
- Test: `tests/claim-constructor-workflow.test.js`

- [ ] **Step 1: Add failing claim-model tests**

Build fixtures for salary, premium, vacation, indexation, and Article 236 rows. Assert two-level grouping, separate salary/underpayment indexation families, family totals, `спорное` badge, disputed default checked, stable keys, persisted unchecked items, and newly discovered default-checked items. Assert removed captions and duplicate subtotals never render.

```js
const rerun = mergeClaimSelections_(
  [{ key: 'underpayment|salary|2026-01', selected: false }],
  [{ key: 'underpayment|salary|2026-01' }, { key: 'liability|salary|2026-01', disputed: true }]
);
assert.strictEqual(rerun[0].selected, false);
assert.strictEqual(rerun[1].selected, true);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: FAIL because normalized claim facts and audit rendering do not exist.

- [ ] **Step 3: Expose normalized payroll-slip calculation facts**

Extend calculation results with `claimFacts` only; keep existing totals unchanged. Each fact must carry `family`, `baseKind`, `baseLabel`, `periodKey`, `periodLabel`, `calculationItem`, `amount`, `disputed`, and `sourceRef`. Generate a stable key from identifiers, never display text alone:

```js
function buildStableClaimKey_(item) {
  return [item.family, item.baseKind, item.periodKey, item.calculationItem]
    .map((value) => normalizeText_(value).replace(/\|/g, '/'))
    .join('|');
}
```

- [ ] **Step 4: Render the approved two-level audit**

Implement `buildClaimAuditModel_`, `readExistingClaimSelections_`, `mergeClaimSelections_`, and `renderClaimAudit_`. Render exactly these families where data exists: `Взыскать недоплату`, `Материальная ответственность`, `Индексация заработной платы`, `Индексация недоплаты`. Store stable keys in a hidden technical column and checkbox values in visible rows.

- [ ] **Step 5: Run focused test and verify GREEN**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: PASS.

- [ ] **Step 6: Mark OpenSpec tasks 3.1-3.7 and commit**

```bash
git add google-apps-script/ClaimIntakeRequirements.gs google-apps-script/SalaryIndexation.gs tests/claim-constructor-workflow.test.js openspec/changes/add-intake-and-claim-requirements/tasks.md
git commit -m "feat: render persistent claim audit"
```

### Task 4: Partial recoveries and derived-payment effects

**Files:**
- Modify: `google-apps-script/ClaimIntakeRequirements.gs`
- Modify: `google-apps-script/SalaryIndexation.gs:576-972`
- Test: `tests/claim-constructor-workflow.test.js`

- [ ] **Step 1: Add failing calculation-effect tests**

Test chronological allocation of multiple valid recoveries to the chosen principal, the resulting Article 236 base segments, and the rule that unknown allocation changes no allocated total. Add supported derivative fixtures (vacation/average-earnings/premium) and unsupported dependency fixtures; assert recalculated values or review warnings and non-blocking behavior.

- [ ] **Step 2: Run focused test and verify RED**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: FAIL because recoveries and dependency effects are not applied.

- [ ] **Step 3: Implement recovery application as pure functions**

```js
function applyPartialRecoveries_(claimFacts, recoveryState) {
  const allocated = allocateRecoveriesChronologically_(claimFacts, recoveryState.valid);
  return {
    claimFacts: allocated.claimFacts,
    liabilitySegments: allocated.liabilitySegments,
    unallocated: recoveryState.unallocated,
    invalid: recoveryState.invalid,
  };
}
```

Only valid targeted recoveries reduce a principal from their dates and feed the existing material-liability methodology. Add `writeRecoveryAdjustedResultsToSheets_` that uses each fact's `sourceRef`/existing table layout to write the adjusted principal, indexation, and material-liability values and explanatory notes back to the corresponding existing calculation-sheet cells before dashboard/audit/Docs totals are collected. Unallocated recoveries remain disputed audit/Docs records and must not reduce principal, material liability, or indexation.

- [ ] **Step 4: Implement derivative impact registry and highlighting**

Represent supported dependencies with a small registry keyed by normalized calculation layout (`vacation`, average-earnings-based rows, and supported premiums). Return `{updatedFacts,warnings,writeBacks}` and apply every supported `writeBack` to the existing derivative calculation cells, including value/formula-compatible note and highlight, before collecting dashboard/audit totals. Unsupported dependencies create `needs_review` warnings and never stop unrelated results. Add assertions that the existing Sheets cells, dashboard totals, audit totals, and payload totals all reflect the same adjusted values.

- [ ] **Step 5: Run focused test and verify GREEN**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: PASS.

- [ ] **Step 6: Mark OpenSpec tasks 4.1-4.4 and commit**

```bash
git add google-apps-script/ClaimIntakeRequirements.gs google-apps-script/SalaryIndexation.gs tests/claim-constructor-workflow.test.js openspec/changes/add-intake-and-claim-requirements/tasks.md
git commit -m "feat: apply recovery and derivative effects"
```

### Task 5: Selected-requirements payload and immutable Docs history

**Files:**
- Modify: `google-apps-script/ClaimIntakeRequirements.gs`
- Modify: `google-apps-script/SalaryIndexation.gs:353-421,2215-2276`
- Test: `tests/claim-constructor-workflow.test.js`

- [ ] **Step 1: Add failing payload and Drive tests**

Extend fake Drive files/folders to model parents, file creation/move, URL/name, and history. Assert the payload includes only selected claims plus disputed flags, selected average earnings, applied/invalid/unallocated recoveries, and derived warnings. Assert every run creates a distinct Doc in the current Doc's folder, never mutates the previous Doc, appends history, and fails before creation when no folder can be resolved.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: FAIL because new-document creation and history are missing.

- [ ] **Step 3: Implement payload and folder resolution**

```js
function resolveClaimDocsFolder_(currentDocId, drive) {
  const parents = drive.getFileById(currentDocId).getParents();
  if (!parents.hasNext()) {
    throw new Error('Не удалось определить папку текущего расчета. Переместите исходный Google Doc в рабочую папку и повторите.');
  }
  return parents.next();
}
```

Resolve from the current visible Doc first, then the latest valid history entry. Do not use My Drive/root as fallback. Name the new file with a readable timestamp and selected scenario.

- [ ] **Step 4: Create and populate a fresh Doc**

Create a blank Doc, move its Drive file into the resolved folder, and render a bounded narrative from the selected payload. Reuse existing money/date/table helpers and calculation methodology, but do not call `replaceClaimCalculationAutoBlock_` on the previous document. Return `{docId,docUrl,folderId,title}`.

- [ ] **Step 5: Append Docs history and update current link**

Store a JSON history in document properties and render a compact link history on `Анкета и требования`. Append entries; never replace the array. Update the visible current output link to the newly generated Doc only after successful population.

- [ ] **Step 6: Run focused test and verify GREEN**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: PASS.

- [ ] **Step 7: Mark OpenSpec tasks 5.1-5.6 and commit**

```bash
git add google-apps-script/ClaimIntakeRequirements.gs google-apps-script/SalaryIndexation.gs tests/claim-constructor-workflow.test.js openspec/changes/add-intake-and-claim-requirements/tasks.md
git commit -m "feat: create versioned claim documents"
```

### Task 6: Pipeline integration and user action

**Files:**
- Modify: `google-apps-script/ClaimConstructor.gs:747-1013,1137-1166`
- Modify: `google-apps-script/SalaryIndexation.gs:197-242`
- Test: `tests/claim-constructor-workflow.test.js`

- [ ] **Step 1: Add failing orchestration tests**

Test that questionnaire state is read before the claim calculation, the selected average-earnings scenario is injected into calculation parameters and written back to existing Sheets result cells, and audit refresh happens after Sheets results. Also test that normative files are never opened or sent to VLM, that `Расписать выбранные требования` invokes only the write-out action, and that repeated full calculation leaves previous Docs untouched while generating a new one.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: FAIL because the approved action and audit refresh are not wired.

- [ ] **Step 3: Wire calculation state into audit rendering**

Capture questionnaire state before `runClaimSheetCalculation_`. Resolve the selected average-earnings scenario and pass it explicitly into `runClaimSheetCalculation_`/`calculateClaimCalculationResult_`; write the resulting selected-scenario values into the existing calculation-sheet result cells. Then run existing sheet indexation, apply recovery and derivative write-backs to their existing calculation cells, rescan normalized claim facts from Sheets, and only then build/render the audit and finalize dashboard totals. Preserve current progress/status behavior and record warnings as constructor issues. The audit and Docs payload must consume the post-write-back Sheets facts, not a parallel in-memory total.

- [ ] **Step 4: Wire the final action and menu**

Add the menu item `Расписать выбранные требования` pointing to a public `writeSelectedClaimRequirements()` function. The function reads the latest Sheets-backed state, creates the selected payload, creates the fresh Doc, records history, updates the visible current link, and reports a corrective message on resolvable user errors.

- [ ] **Step 5: Run focused test and verify GREEN**

Run: `node tests/claim-constructor-workflow.test.js`

Expected: PASS.

- [ ] **Step 6: Run all local tests**

Run each file with Node: `tests/claim-constructor-workflow.test.js`, `tests/zup-vlm-multi-slip.test.js`, `tests/salary-indexation-date-logic.test.js`, and `tests/zup-vlm-response.test.js`.

Expected: all exit 0 with no regression output.

- [ ] **Step 7: Commit pipeline integration**

```bash
git add google-apps-script/ClaimConstructor.gs google-apps-script/SalaryIndexation.gs tests/claim-constructor-workflow.test.js
git commit -m "feat: integrate claim audit workflow"
```

### Task 7: Specification validation, deployment, and live smoke test

**Files:**
- Modify: `openspec/changes/add-intake-and-claim-requirements/tasks.md`
- Modify if needed: `README.md`

- [ ] **Step 1: Run strict specification validation**

Run:

```bash
PATH=/Users/aegorfk/.local/node-v20.19.0-darwin-arm64/bin:/Users/aegorfk/.nvm/versions/node/v24.14.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin openspec validate add-intake-and-claim-requirements --strict
```

Expected: `Change 'add-intake-and-claim-requirements' is valid` (telemetry network warnings are non-fatal).

- [ ] **Step 2: Run final regression suite and inspect diff**

Run all four Node test files, then `git diff --check` and `git status --short`.

Expected: tests exit 0; no whitespace errors; only intended files are modified.

- [ ] **Step 3: Mark OpenSpec tasks 6.1-6.6 complete and commit**

```bash
git add openspec/changes/add-intake-and-claim-requirements/tasks.md README.md
git commit -m "docs: complete claim intake specification"
```

- [ ] **Step 4: Push Apps Script**

Run from `google-apps-script` with the project Node path: `clasp push --force`.

Expected: Apps Script reports all project files pushed successfully.

- [ ] **Step 5: Smoke-test the working Google Sheet**

Open the working spreadsheet and verify:

1. Normal mode shows only `Конструктор` and `Анкета и требования`.
2. Existing payroll-slip and Docs links remain intact; normative placeholder is visible and not analyzed.
3. Sector, average-earnings selector, and multiple recoveries persist after reopen/recalculation.
4. Audit groups and disputed defaults match the approved layout; an unchecked item remains unchecked after rerun.
5. `Расписать выбранные требования` creates a new Doc in the same Drive folder, updates history/current link, and leaves the prior Doc unchanged.
6. Invalid recovery and derivative warnings are highlighted while unrelated calculations finish.

- [ ] **Step 6: Mark OpenSpec task 6.7 complete and commit smoke evidence**

Record the tested Apps Script version, spreadsheet URL/gid, generated Doc URL, and smoke outcome in `openspec/changes/add-intake-and-claim-requirements/tasks.md`, then commit.

```bash
git add openspec/changes/add-intake-and-claim-requirements/tasks.md
git commit -m "test: record claim intake smoke test"
```
