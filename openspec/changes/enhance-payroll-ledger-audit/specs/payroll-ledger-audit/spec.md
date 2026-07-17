## ADDED Requirements

### Requirement: Provider-neutral payroll workbook
The system SHALL use provider-neutral names and captions for every user-visible import, quality, diagnostic, payment-structure, and reconstruction worksheet while retaining payroll-system-specific parsers only behind the adapter boundary.

#### Scenario: Existing workbook is migrated
- **WHEN** setup or import encounters a worksheet with an obsolete `1С` or `ЗУП` presentation name
- **THEN** the system renames that worksheet in place to its canonical provider-neutral name
- **AND** preserves the worksheet id, order, values, formulas, formatting, notes, hidden state, and audit history
- **AND** rewrites any formula or named reference that contains the obsolete sheet name

#### Scenario: New workbook is initialized
- **WHEN** import or reconstruction creates a service worksheet
- **THEN** its title and user-visible captions contain neither `1С` nor `ЗУП`
- **AND** the source adapter remains available as traceability metadata rather than the domain model

### Requirement: Chronological and filterable ledger
The system SHALL present normalized payroll rows in a deterministic chronological order and SHALL apply a filter to every canonical tabular output.

#### Scenario: Multiple rows belong to the same month
- **WHEN** normalized rows span multiple periods and contain several accrual, withholding, and payment events in one period
- **THEN** the system orders periods from earliest to latest
- **AND** keeps every row for one period contiguous
- **AND** orders rows inside the period by available accrual/payment event date, with undated rows after dated rows of the same event type
- **AND** uses event type, source file, source sheet, and a persisted original-row ordinal as deterministic tie-breakers

#### Scenario: Ledger is rewritten
- **WHEN** an import rerun replaces the current ledger contents
- **THEN** the system creates exactly one filter over the current header and ledger data rows
- **AND** excludes appended skipped-file diagnostics from that filter
- **AND** does not fail when a prior filter already exists

#### Scenario: Other canonical tables are rewritten
- **WHEN** the system rewrites `Расчетные_листы_Свод`, `Расчетные_листы_Качество`, `Расчетные_листы_Проверки`, `Расчетные_листы_Состояние`, `Расчетные_листы_VLM`, `Расчетные_листы_СтруктураВыплат`, or `Расчетные_листы_Диагностика`
- **THEN** it applies one filter to that table's current header and data rows when at least one data row exists
- **AND** leaves `Конструктор`, `Анкета и требования`, calculation sheets, and unrelated user filters unchanged

### Requirement: Non-blocking employer assumption
The system SHALL identify missing or differing employers and continue the combined calculation under an explicit temporary single-employer assumption.

#### Scenario: Payroll slips contain different employers
- **WHEN** recognized payroll rows contain more than one normalized employer
- **THEN** the system preserves and calculates every otherwise valid row
- **AND** highlights each affected period
- **AND** publishes a review issue stating which employer is treated as primary and that all rows are currently combined as if they belonged to one employer
- **AND** tells the user to review whether separate debtors and calculations are required

#### Scenario: Employer is missing for one period
- **WHEN** an otherwise calculable period has no recognized employer
- **THEN** the system calculates that period under the same temporary assumption
- **AND** publishes the missing employer as a non-blocking issue

### Requirement: Legally meaningful payroll classification
The system SHALL keep source label, event type, hidden internal calculation role, visible legal category, legal source, confidence, and classification status as distinct fields. Articles 129 and 135 govern remuneration-system components; Article 191 is used only to flag that a premium may instead be a separate reward. Article 123 governs vacation scheduling and notice, not wage-component classification.

#### Scenario: Base remuneration is recognized
- **WHEN** an accrual explicitly describes an salary rate, tariff rate, or remuneration for work
- **THEN** its legal category is `Оплата труда — основная часть`
- **AND** the source label remains visible as `Вид начисления / выплаты`

#### Scenario: Compensatory salary component is recognized
- **WHEN** an accrual explicitly describes work in conditions deviating from normal, special climatic conditions, night work, overtime, holiday work, or another compensatory salary component
- **THEN** its legal category is `Оплата труда — компенсационная выплата`

#### Scenario: Premium requires remuneration-system documents
- **WHEN** a payroll row is described as a premium but payroll slips alone do not establish whether it belongs to the remuneration system or is a one-off reward
- **THEN** its legal category is `Премия/поощрение — требуются документы`
- **AND** its classification is disputed without blocking calculations
- **AND** the issue requests the employment contract, collective agreement, applicable local normative act, or award order

#### Scenario: Evidence establishes a separate reward
- **WHEN** available evidence identifies a premium as a one-off Article 191 reward outside the remuneration system
- **THEN** its legal category is `Социальная или иная выплата` with legal source `статья 191 ТК РФ`
- **AND** the system does not silently treat it as a guaranteed Article 129/135 salary component

#### Scenario: Aggregate salary payment is recognized
- **WHEN** a payment event is labeled `За первую половину месяца`, `Зарплата за месяц`, or another aggregate salary transfer
- **THEN** the event is classified as `Выплата ранее начисленных сумм` or `Смешанная выплата — состав не раскрыт`
- **AND** it is not classified as an accrual of `Оклад`

#### Scenario: Vacation payment is recognized
- **WHEN** an accrual represents vacation pay or another preserved average-earnings guarantee
- **THEN** its legal category is `Гарантийная выплата / средний заработок`
- **AND** it is not treated as a compensatory salary supplement under Article 129

### Requirement: Distinct accrual and payment time semantics
The system SHALL preserve the accrual period, independently established legal due date, and every actual payment date as separate facts and SHALL never infer an actual payment day solely from the payroll month.

#### Scenario: Accrual has no factual payment day
- **WHEN** an accrual row contains only a payroll period
- **THEN** the ledger shows its `Период начисления`
- **AND** leaves `Дата выплаты` blank
- **AND** does not present the period year or month as payment-date components

#### Scenario: Statement date is recognized
- **WHEN** a payment row contains a bank-statement or transfer date
- **THEN** the ledger records that calendar day in `Дата выплаты`
- **AND** Article 236 and partial-payment calculations consume that factual date with source provenance

#### Scenario: Payment date is unavailable
- **WHEN** a calculation requires an actual payment date that cannot be recognized reliably
- **THEN** the system publishes a non-blocking review issue
- **AND** does not substitute the accrual date or period month as a purported actual payment date

#### Scenario: Article 236 interval is calculated
- **WHEN** a legal due date and one or more factual payment dates are available
- **THEN** Article 236 material liability starts on the day after the independently established due date
- **AND** ends on the factual payment date inclusive for each paid share
- **AND** continues through the calculation end date for an unpaid remainder
- **AND** never uses the factual payment date as the legal due date

#### Scenario: Legal due date is not established
- **WHEN** a payment event is recognized but the applicable statutory, contractual, collective, or local due date is unavailable
- **THEN** the system preserves the factual payment date
- **AND** marks the Article 236 start date as requiring documents or user input
- **AND** does not fabricate a due date from the accrual period

### Requirement: Production-calendar validation
The system SHALL calculate one reference working-day count per calendar month and validate imported working-day values without summing repeated payroll rows.

#### Scenario: October 2023 is validated
- **WHEN** the reference production calendar is loaded for October 2023
- **THEN** the reference count is 22 working days
- **AND** a conflicting full-month imported value is marked for review

#### Scenario: Source row is a partial period
- **WHEN** the imported workday count belongs to a partial employment, vacation, sickness, or other partial-month interval
- **THEN** the system preserves the source count as factual row data
- **AND** does not report it as a full-month production-calendar error

#### Scenario: Production calendar is unavailable
- **WHEN** the external production-calendar source cannot be loaded or parsed
- **THEN** the system may compute a weekend-only fallback
- **AND** labels the fallback lower-confidence
- **AND** does not silently overwrite a conflicting source value

#### Scenario: Employment start date is unknown
- **WHEN** the first recognized month may be a partial employment month and no employment start date is available
- **THEN** the system does not infer the start date from the first payroll slip
- **AND** records a follow-up questionnaire/document requirement for the employment start date

### Requirement: Vacation payment timing audit
The system SHALL compare the actual vacation-payment date with the start of vacation under Article 136 of the Labor Code and SHALL distinguish late payment from unpaid or underpaid vacation principal. Article 123 scheduling/notice facts MAY be shown separately but SHALL NOT replace the Article 136 payment deadline.

#### Scenario: Vacation pay is timely
- **WHEN** both dates are known and vacation pay was received no later than three full calendar days before vacation began
- **THEN** the timing audit reports `своевременно`
- **AND** creates no delay claim item

#### Scenario: Vacation pay is late but fully paid
- **WHEN** vacation pay was fully received later than three full calendar days before vacation began
- **THEN** the audit creates a selectable disputed item for late vacation payment
- **AND** calculates Article 236 material liability from the statutory due threshold through the actual payment date
- **AND** does not create a duplicate claim for the already-paid vacation principal
- **AND** uses the five-part stable claim identity with family `vacation_payment_delay`, the vacation layout, vacation-payment base semantics, vacation period, and item `article_236`
- **AND** preserves the user's checked or unchecked selection across reruns

#### Scenario: Vacation pay remains unpaid or underpaid
- **WHEN** the recognized vacation entitlement exceeds the amount actually paid by the calculation date
- **THEN** the audit creates a principal item for only the outstanding amount
- **AND** creates a linked Article 236 item using the outstanding balance schedule

#### Scenario: Required date is missing
- **WHEN** either the vacation start date or actual payment date is unavailable
- **THEN** the audit reports `невозможно проверить срок`
- **AND** asks the user for the missing fact
- **AND** continues unrelated calculations
