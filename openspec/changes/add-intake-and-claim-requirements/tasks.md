## 1. Sheet Layout And State

- [x] 1.1 Extend constructor setup to create or repair `Анкета и требования` without clearing existing workbook data.
- [x] 1.2 Update normal/detail/technical visibility modes so normal mode shows `Конструктор` and `Анкета и требования`.
- [x] 1.3 Add the `Нормативные документы` folder input to `Конструктор` with `пока не анализируется` in the left column under the label.
- [x] 1.4 Add stable named ranges or label resolvers for questionnaire fields, partial recoveries, claim selections, and generated Docs history.
- [x] 1.5 Record the deferred next-stage backlog for LNA, labor contract, addenda, statutes, FNS charter lookup, and case-law employer classification.

## 2. Questionnaire

- [x] 2.1 Implement employer-sector dropdown with private organization, budget sector/public debtor, and unknown values.
- [x] 2.2 Implement average earnings section with calculated scenario, `Задать вручную средний заработок`, user source label, and final scenario selector.
- [x] 2.3 Implement multiple partial recovery rows with `Добавить`, date, amount, and allocation target fields.
- [x] 2.4 Validate partial recovery dates and amounts, highlight invalid rows, and exclude invalid rows without blocking unrelated calculations.
- [x] 2.5 Persist questionnaire state across constructor repair, recalculation, and workbook reopen.

## 3. Audit And Requirements

- [x] 3.1 Build `Аудит и требования` groups from existing payroll-slip import, reconstruction, and calculation results.
- [x] 3.2 Render `Взыскать недоплату` with second-level basis and period items.
- [x] 3.3 Render `Материальная ответственность` with second-level items tied to underlying principal bases and group total in the heading.
- [x] 3.4 Render separate `Индексация заработной платы` and `Индексация недоплаты` groups.
- [x] 3.5 Generate stable claim keys and preserve user-unchecked selections across reruns.
- [x] 3.6 Select newly discovered claim items by default, including disputed items, and show disputed items with the `спорное` badge.
- [x] 3.7 Remove obsolete audit captions and duplicate subtotal rows from the generated layout.
- [x] 3.8 Make the audit dynamically grow below fixed blocks with the claim-selection named range as its sole extent authority; leave all unrelated cells untouched; batch checkbox rendering by family; use only five-part normalized claim keys; preserve unchecked keys through temporary item disappearance in workbook-scoped metadata; resolve salary indexation from explicit adapter semantics; and prove that employer identity, source file name, sheet name, and vendor/payroll-system labels are excluded from fact grouping and key identity.

## 4. Calculation Effects

- [ ] 4.1 Apply valid partial recoveries to the selected bases and affected material-liability calculations.
- [ ] 4.2 Place unknown-allocation partial recoveries in a disputed unallocated bucket without reducing allocated totals.
- [ ] 4.3 Recalculate supported derivative payments when their base changes.
- [ ] 4.4 Highlight affected derivative-payment rows with fill and explanation without blocking other calculations.

## 5. Docs Write-Out

- [ ] 5.1 Rename the final action to `Расписать выбранные требования`.
- [ ] 5.2 Implement selected-claim payload generation including selections, disputed flags, partial recoveries, chosen average earnings scenario, and derivative-payment warnings.
- [ ] 5.3 Create a new Google Docs file on every write-out run.
- [ ] 5.4 Place each new Docs file in the same Google Drive folder as the current or previously generated calculation document.
- [ ] 5.5 Fail with a corrective message if the current or previous calculation-document folder cannot be resolved.
- [ ] 5.6 Store generated Docs history without overwriting previous document links.

## 6. Tests And Validation

- [ ] 6.1 Add layout tests for two normal sheets, normative placeholder placement, and preserved values.
- [ ] 6.2 Add questionnaire persistence and validation tests.
- [ ] 6.3 Add audit grouping, disputed-default, and unchecked-selection persistence tests.
- [ ] 6.4 Add partial recovery and derivative-payment warning tests.
- [ ] 6.5 Add Docs write-out tests for new-document creation in the same Drive folder.
- [x] 6.6 Run local tests and strict OpenSpec validation.
- [ ] 6.7 Push Apps Script changes and smoke-test the working Google Sheet after implementation.
