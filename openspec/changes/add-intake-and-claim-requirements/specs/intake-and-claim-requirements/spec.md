## ADDED Requirements

### Requirement: Two-tab normal workspace
The system SHALL make `Анкета и требования` the second normal-mode user sheet alongside `Конструктор`.

#### Scenario: Normal mode shows constructor and questionnaire
- **WHEN** the user selects normal mode
- **THEN** the system shows exactly `Конструктор` and `Анкета и требования` as normal workflow sheets
- **AND** hides calculation-detail, reconstruction, import, VLM, and diagnostic sheets

#### Scenario: Setup preserves existing data
- **WHEN** the constructor setup repairs an existing workbook
- **THEN** the system creates or repairs `Анкета и требования`
- **AND** preserves existing constructor links, questionnaire answers, claim selections, partial recoveries, and generated Docs links

### Requirement: Normative document intake placeholder
The system SHALL show a single `Нормативные документы` Google Drive folder input while clearly marking that the folder is not analyzed in the first version.

#### Scenario: Placeholder appears on constructor
- **WHEN** the constructor sheet is created or repaired
- **THEN** it contains a `Нормативные документы` label
- **AND** the link input is available in the corresponding value cell
- **AND** the text `пока не анализируется` appears in the left column under the label

#### Scenario: Normative link is stored but not analyzed
- **WHEN** the user supplies a normative-document folder link and starts calculation
- **THEN** the system stores or preserves the link
- **AND** does not parse, classify, extract, calculate from, or send those documents to VLM in this change
- **AND** payroll-slip calculations continue without requiring the normative-document folder

### Requirement: Payroll-slip-only first version backlog
The system SHALL explicitly preserve the later-stage scope for normative documents, employment contracts, addenda, statutes, and case-law employer classification without implementing that analysis in this change.

#### Scenario: Deferred scope is visible to maintainers
- **WHEN** maintainers inspect the change tasks or design notes
- **THEN** the follow-up backlog identifies normative-document analysis, labor-contract/addenda analysis, statutory/legal mode calculation, and FNS/case-law employer classification as later-stage work

#### Scenario: Deferred sources do not affect first-version totals
- **WHEN** a payroll-slip calculation completes
- **THEN** every audit item and claim total is derived from payroll-slip import, reconstruction, user questionnaire answers, or existing calculation methodology
- **AND** no total depends on unimplemented normative-document or contract analysis

### Requirement: Employer sector questionnaire
The system SHALL capture employer sector as a dropdown field on `Анкета и требования`.

#### Scenario: User selects employer sector
- **WHEN** the user opens the employer-sector field
- **THEN** the available values are private organization, budget sector/public debtor, and unknown
- **AND** the selected value is persisted for subsequent calculations and Docs write-outs

#### Scenario: Unknown sector remains calculable
- **WHEN** employer sector is unknown
- **THEN** the system continues payroll-slip calculations
- **AND** marks sector-dependent items as needing review where the existing methodology cannot safely decide them

### Requirement: Average earnings scenario selection
The system SHALL preserve both system-calculated and user-entered average earnings scenarios and SHALL let the user choose which scenario is used in selected requirements.

#### Scenario: System scenario is shown
- **WHEN** average earnings can be calculated from existing data
- **THEN** the system displays the calculated amount, period or date context, and the label `рассчитано`

#### Scenario: User scenario is entered
- **WHEN** the user uses `Задать вручную средний заработок`
- **THEN** the system stores the user amount and date or period context
- **AND** displays `источник: пользователь` inline after the date or period context

#### Scenario: User chooses final scenario
- **WHEN** both calculated and user-entered scenarios exist
- **THEN** the user can choose the final scenario through a radio button or equivalent selector
- **AND** the chosen scenario is used for claim totals and Docs write-out
- **AND** the non-selected scenario remains visible for comparison

### Requirement: Multiple partial recoveries
The system SHALL support multiple partial recovery rows, each with date, amount, and allocation target.

#### Scenario: User adds recovery row
- **WHEN** the user clicks `Добавить` in the partial recoveries section
- **THEN** the system adds a new recovery row with editable date, amount, and allocation target fields

#### Scenario: Valid recovery reduces affected calculations
- **WHEN** a partial recovery row has a valid date, amount, and allocation target
- **THEN** the system applies it to the selected base or claim family according to the calculation methodology
- **AND** reflects the effect in material liability and other affected totals

#### Scenario: Invalid recovery is highlighted
- **WHEN** a partial recovery row has an invalid date or amount
- **THEN** the system highlights the row
- **AND** excludes that row from calculations until corrected
- **AND** does not block unrelated calculable results

#### Scenario: Unknown recovery allocation is disputed
- **WHEN** a partial recovery has a valid date and amount but no reliable allocation target
- **THEN** the system places the row in a disputed unallocated-recovery bucket
- **AND** does not reduce any specific principal, material-liability, or indexation total with that row
- **AND** surfaces the unallocated recovery in audit and Docs output for later allocation
- **AND** continues other calculations

### Requirement: Audit and requirements checklist
The system SHALL render a section named `Аудит и требования` with grouped, user-readable claim items built from existing payroll-slip calculations.

#### Scenario: Audit section is rendered
- **WHEN** payroll-slip calculation results are available
- **THEN** the system renders `Аудит и требования`
- **AND** does not render the removed captions `Все позиции включены по умолчанию`, `6 оснований`, `по базам`, or a duplicate material-liability subtotal row

#### Scenario: Underpayment is grouped by basis
- **WHEN** underpayment items are available
- **THEN** the system groups them under `Взыскать недоплату`
- **AND** provides second-level selectable items by basis and period so the user can see why each underpayment arose

#### Scenario: Material liability is grouped by base
- **WHEN** Article 236 material-liability items are available
- **THEN** the system groups them under `Материальная ответственность`
- **AND** ties each second-level item to the underlying principal base
- **AND** shows the family total in the group heading

#### Scenario: Indexation groups are separated
- **WHEN** indexation items are available
- **THEN** the system separates `Индексация заработной платы` from `Индексация недоплаты`
- **AND** nests `Индексация недоплаты` by affected base and period

### Requirement: Claim selection defaults and persistence
The system MUST include newly discovered claim items by default, including disputed items, while preserving user-unchecked selections across reruns.

#### Scenario: New disputed item is checked
- **WHEN** a disputed claim item first appears in the audit
- **THEN** it is selected by default
- **AND** displays the badge `спорное`

#### Scenario: User unchecks item
- **WHEN** the user unchecks a claim item
- **THEN** the system persists that decision by stable claim key
- **AND** keeps the item unchecked after recalculation if the same claim key is still present

#### Scenario: New item after rerun is checked
- **WHEN** a repeated calculation discovers a new claim item
- **THEN** the new item is selected by default even if other items were previously unchecked

### Requirement: Derived payment recalculation warnings
The system SHALL recalculate supported derivative payments affected by changed bases and visually highlight affected rows without blocking unrelated calculations.

#### Scenario: Base change affects derivative payment
- **WHEN** a recalculated base affects a supported derivative payment
- **THEN** the system recalculates the derivative payment using the existing methodology
- **AND** applies a fill highlight to the affected row or item
- **AND** displays an explanation that the derivative payment changed because its base changed

#### Scenario: Unsupported derivative dependency is flagged
- **WHEN** a base may affect a derivative payment but the dependency cannot be safely recalculated
- **THEN** the system marks the item for review
- **AND** continues unrelated calculations

### Requirement: Selected claim write-out
The system SHALL provide the final action `Расписать выбранные требования` and SHALL write only selected claim items into a new Google Docs calculation narrative.

#### Scenario: User writes selected requirements
- **WHEN** the user invokes `Расписать выбранные требования`
- **THEN** the system reads selected claim items, disputed flags, partial recoveries, chosen average earnings scenario, and affected derivative-payment warnings
- **AND** creates a new Google Docs file containing the selected calculation narrative

#### Scenario: Repeated write-out creates new Doc
- **WHEN** the user invokes `Расписать выбранные требования` more than once
- **THEN** each invocation creates a new Google Docs file
- **AND** leaves previously generated Docs unchanged

#### Scenario: New Doc is created in same Drive folder
- **WHEN** the system creates the new Google Docs file
- **THEN** it places the file in the same Google Drive folder as the current or previously generated calculation document
- **AND** stores the new Doc link in the workbook history or handoff area

#### Scenario: Current Doc folder cannot be resolved
- **WHEN** the system cannot determine the Drive folder for the current or previous calculation document
- **THEN** the write-out fails with a specific corrective message
- **AND** does not create a document in an arbitrary fallback folder
