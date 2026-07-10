# ZUP Source Isolation And OCR Headers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent same-named payroll slips from different Drive folders from being merged and keep OCR header values free of adjacent fields.

**Architecture:** Extend the existing source-group key with stable parent-folder identity while retaining the current normalized filename and variant preference. Replace greedy whole-row header matching with a shared bounded label extractor used by organization and employee parsing.

**Tech Stack:** Google Apps Script JavaScript, Node.js `vm` regression tests, OpenSpec.

---

### Task 1: Parent-scoped source grouping

**Files:**
- Modify: `google-apps-script/ZupImport.gs`
- Test: `tests/salary-indexation-date-logic.test.js`

- [ ] Add a failing test with equal filenames in two fake parent folders and verify two groups are returned.
- [ ] Run `node tests/salary-indexation-date-logic.test.js` and confirm the group-count assertion fails.
- [ ] Add a parent-folder key helper and compose it with `normalizeZupSourceFileKey_`.
- [ ] Re-run the test and confirm it passes while same-folder variants still collapse to one group.

### Task 2: Bounded OCR header extraction

**Files:**
- Modify: `google-apps-script/ZupImport.gs`
- Test: `tests/salary-indexation-date-logic.test.js`

- [ ] Add failing tests for merged organization/employee OCR lines and a misleading early data row.
- [ ] Run the focused test and confirm the extracted values contain unwanted trailing text.
- [ ] Add a shared bounded header-value extractor and use it in `extractZupCompany_` and `extractZupEmployee_`.
- [ ] Re-run the focused and multi-slip tests and confirm all pass.

### Task 3: Contract and verification

**Files:**
- Modify: `openspec/changes/improve-zup-import-reading/tasks.md`

- [ ] Mark tasks 10.1-10.3 complete.
- [ ] Run both local test files and `git diff --check`.
- [ ] Review the diff for unrelated files and leave `google-apps-script/.clasp.json` untouched.
