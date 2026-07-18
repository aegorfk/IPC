## MODIFIED Requirements

### Requirement: Normalized row metadata
The system SHALL include payroll-slip period, source accrual interval, accrual date, independently sourced actual payment date, work-day, factual worked-day, payment-statement, original-row ordinal, calculation-category, and legal-classification fields in normalized import rows.

#### Scenario: Accrual row has day counts
- **WHEN** an accrual row contains period, working days, and factual worked days
- **THEN** `Расчетные_листы` records `Период начисления`, `Рабочие дни по расчетному листку`, and `Фактически отработано дней`
- **AND** preserves the original payroll-slip period separately from any derived accrual date

#### Scenario: Payment row has statement text
- **WHEN** a payment row contains a bank statement number and date
- **THEN** `Расчетные_листы` records `Ведомость` and `Дата выплаты` separately from the source label
- **AND** stores the date as an actual-payment fact with source provenance
- **AND** does not relabel the accrual-period year/month as payment-date components

#### Scenario: Row is persisted for deterministic display
- **WHEN** a normalized row is written durably
- **THEN** it includes its source file, source sheet, and original-row ordinal
- **AND** later sorting and retry produce the same order for equivalent inputs

#### Scenario: Source row contains an accrual interval
- **WHEN** an accrual source fragment contains a date or date range such as `01.10-05.10`
- **THEN** the normalized row records that interval in `Период начисления из источника`
- **AND** keeps it separate from the payroll-slip month, accrual date, and actual payment date
- **AND** leaves the interval blank rather than deriving it from the slip month when the source has no interval

### Requirement: Classification coverage
The system SHALL classify salary base, compensatory salary components, premium candidates, vacation/average-earnings guarantees, sick leave, social/other payments, severance, unpaid vacation, withholdings, and payment events without treating the payroll provider as part of the domain category.

#### Scenario: Special accrual text is parsed
- **WHEN** an accrual row contains a known phrase such as `Командировка`, `Доплата до оклада`, night work, overtime, or holiday work
- **THEN** the row receives the matching internal calculation category
- **AND** receives a separate visible legal category and classification status
- **AND** `Доплата до оклада` remains a separate calculation category while being marked as an salary-base top-up for downstream calculations

#### Scenario: Aggregate payment text is parsed
- **WHEN** a row in the `Выплачено` event contains `За первую половину месяца`, `Зарплата за месяц`, or a similar aggregate transfer label
- **THEN** its internal category is `Выплаты`
- **AND** its visible legal category is `Выплата ранее начисленных сумм` or `Смешанная выплата — состав не раскрыт`
- **AND** it is not classified as an accrual of `Оклад`

#### Scenario: Premium text is parsed without normative documents
- **WHEN** a row contains a monthly, quarterly, annual, or other premium label but no applicable remuneration-system document is available
- **THEN** its periodic calculation category remains available to reconstruction
- **AND** the visible legal category is `Премия/поощрение — требуются документы`
- **AND** the disputed status does not block calculations

#### Scenario: Source wording identifies a one-off reward
- **WHEN** an accrual label explicitly describes a birthday, anniversary, exceptional-achievement, or similar one-off premium
- **THEN** its calculation category is `Разовая премия`
- **AND** its visible legal hypothesis references Article 191 of the Labor Code
- **AND** the row remains reviewable against the applicable local act or award order without being routed as a guaranteed periodic premium

#### Scenario: Payment structure JSON is produced
- **WHEN** normalized payroll-slip rows are written after a full import
- **THEN** the system writes `Расчетные_листы_СтруктураВыплат` with one row per company, event, legal category, calculation category, and source kind
- **AND** each structure row includes a JSON object with calculation role, legal category/status, totals, periods, source files, and `rowPolicy: keep_source_rows_separate`
- **AND** `Доплата до оклада` receives `calculationRole: salary_top_up`

### Requirement: Reconstruction target sheets
The system SHALL create adjacent provider-neutral structural sheets that mirror the target calculation tabs for payroll-slip reconstruction.

#### Scenario: User creates reconstruction sheets
- **WHEN** the user runs the reconstruction-sheet command
- **THEN** the system creates `Реконструкция_Оклад`, `Реконструкция_Ежемесячные`, `Реконструкция_Ежеквартальные`, `Реконструкция_Ежегодные`, and `Реконструкция_Отпуска` next to their source sheets
- **AND** the created sheets preserve headers, formatting, and formulas from the actually populated source range
- **AND** fields intended to be filled from payroll slips or recalculated after reconstruction are blank

#### Scenario: User creates one reconstruction sheet
- **WHEN** the full reconstruction-sheet command exceeds Apps Script time limits
- **THEN** the user can create any single `Реконструкция_*` sheet from a dedicated technical command

#### Scenario: Existing provider-specific reconstruction sheet is found
- **WHEN** setup encounters an obsolete reconstruction title containing `Из_1С_`
- **THEN** it renames the same sheet in place to `Реконструкция_*`
- **AND** does not create a duplicate reconstruction sheet

### Requirement: Reconstruction sheet population
The system SHALL populate `Реконструкция_*` sheets from normalized payroll-slip import rows without modifying the original target sheets.

#### Scenario: User populates reconstruction sheets
- **WHEN** normalized rows exist in `Расчетные_листы`
- **THEN** the system preserves the target sheets' row/period structure as the recalculation scaffold
- **AND** fills `Реконструкция_Оклад` with period, payroll-slip factual worked days from salary rows, reference production-calendar month workdays, and imported salary accruals including separately parsed `Доплата до оклада`
- **AND** fills premium reconstruction sheets with accrued premium amounts matched to accrual periods while leaving unmatched rows blank
- **AND** fills `Реконструкция_Отпуска` from accrued vacation rows, matching actual payment dates and vacation-start dates when recognized
- **AND** formulas inside `Реконструкция_*` sheets reference other `Реконструкция_*` sheets instead of the original target sheets
- **AND** recalculates `Реконструкция_*` sheets after filling so indexation, vacation annual salary, and Article 236 columns do not remain stale

#### Scenario: Import rows pass global quality gates
- **WHEN** payroll-slip rows are imported
- **THEN** each row stores organization, employee, payroll-slip period, accrual date, actual payment date when available, and legal classification status
- **AND** `Расчетные_листы_Качество` reports organization, employee, missing-month, workday-calendar, missing-payment-date, and document-dependent classification checks as warnings instead of blocking import
- **AND** `Расчетные_листы_Проверки` lists company mismatches, blank company periods, employee raw-name variants, file warnings, data-completeness metrics, calendar conflicts, and partial salary month explanations for manual review
- **AND** reconstruction cells for periods with company, employee, calendar, date, or classification issues are highlighted with orange fill

#### Scenario: Multiple employers are present
- **WHEN** normalized rows contain more than one employer
- **THEN** reconstruction includes every otherwise valid row in one combined calculation
- **AND** identifies the most frequent employer as the temporary primary employer
- **AND** states that the calculation currently assumes one employer and may need to be split by debtor after review
