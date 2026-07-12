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

The audit SHALL grow to the realistic number of normalized claim facts without a fixed row limit. Its dynamic area SHALL remain below the fixed questionnaire, partial-recovery, and generated-Docs-history blocks. `CLAIM_INTAKE_CLAIM_SELECTIONS` SHALL be the sole authority for the previous audit extent. A missing, malformed, or wrong-sheet named range SHALL initialize a one-row audit extent at the configured first row without scanning other sheet rows.

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

#### Scenario: Audit exceeds the former fixed capacity
- **WHEN** six periods produce items in each of four claim families
- **THEN** all 24 items and four family headings are rendered
- **AND** the claim-selection named range covers the full dynamic audit extent
- **AND** the generated Docs history, questionnaire answers, partial recoveries, and user-unchecked selections remain unchanged

#### Scenario: Audit becomes smaller or empty
- **WHEN** a rerun produces fewer items or no items
- **THEN** the system clears only the authoritative previous range and the new target range
- **AND** resizes the claim-selection named range to the current rendered extent
- **AND** shows the empty-state row when no items remain

#### Scenario: Unrelated rows remain outside audit ownership
- **WHEN** setup or rerender encounters unrelated content outside the authoritative claim-selection named range, including rows above the audit and distant rows below it
- **THEN** it does not inspect, move, clear, or reinterpret that content as audit state

#### Scenario: Checkbox rendering is bounded
- **WHEN** the number of selectable audit items grows substantially
- **THEN** checkbox validation and value writes use a constant number of batches bounded by the supported claim families
- **AND** family-heading rows do not receive checkbox validation

### Requirement: Claim selection defaults and persistence
The system MUST include newly discovered claim items by default, including disputed items, while preserving user-unchecked selections across reruns.

#### Scenario: New disputed item is checked
- **WHEN** a disputed claim item first appears in the audit
- **THEN** it is selected by default
- **AND** displays the badge `спорное`

#### Scenario: User unchecks item
- **WHEN** the user unchecks a claim item
- **THEN** the system persists that decision by its full five-part stable claim key in workbook-scoped selection metadata
- **AND** keeps the item unchecked after recalculation if the same claim key is still present

#### Scenario: Temporarily missing item returns
- **WHEN** a user-unchecked item disappears because a calculation temporarily fails and a later successful calculation produces the same five-part key
- **THEN** the returned item remains unchecked
- **AND** no stale monetary fact or total is restored from selection metadata

#### Scenario: User explicitly rechecks item
- **WHEN** the user explicitly checks a previously unchecked item
- **THEN** the system removes that key from workbook-scoped selection metadata

#### Scenario: New item after rerun is checked
- **WHEN** a repeated calculation discovers a new claim item
- **THEN** the new item is selected by default even if other items were previously unchecked

### Requirement: Vendor-neutral claim identity
The system SHALL derive audit facts, grouping, and stable claim keys from exactly five normalized calculation dimensions: claim family, canonical normalized layout identifier, normalized base kind/payment semantics, period, and calculation item. Layout and base kind SHALL remain independent; missing values SHALL use explicit deterministic sentinels. No earlier key shape or alias SHALL be accepted for selection persistence. Employer identity, organization label, source file or sheet name, and payroll-system-specific display labels MUST NOT affect claim identity or grouping. A source sheet name MAY remain in `sourceRef` only for traceability. 1C:ZUP SHALL remain the priority adapter and test scenario, not the domain model.

#### Scenario: Equivalent normalized sources have identical identity
- **WHEN** different sheet names, employer labels, or payroll-system labels are normalized by the same adapter and layout
- **THEN** their claim facts have equivalent normalized semantics
- **AND** their stable claim keys are identical
- **AND** their `sourceRef` values may differ for traceability

#### Scenario: Different supported layouts remain distinct
- **WHEN** two facts have the same period, family, and calculation item but originate from different normalized supported layouts or base kinds
- **THEN** their stable claim keys remain distinct

#### Scenario: Layout and base kind cannot collide
- **WHEN** facts share a normalized layout but have different normalized base kinds, or share a normalized base kind but have different normalized layouts
- **THEN** their stable claim keys remain distinct
- **AND** audit grouping does not merge their amounts

#### Scenario: Unknown normalized layout is organization-neutral
- **WHEN** an adapter supplies an unknown but normalized layout identifier
- **THEN** the fallback fact uses that normalized identifier and a generic display label
- **AND** does not hardcode any employer, organization, workbook sheet title, or payroll vendor

#### Scenario: Salary indexation uses explicit adapter semantics
- **WHEN** a salary adapter maps corrected salary and pre-indexation salary to reordered physical columns
- **THEN** the generated salary-indexation fact uses those explicit semantic mappings
- **AND** does not infer the pre-indexation amount from an adjacent cell

#### Scenario: Salary indexation mapping is unavailable
- **WHEN** the adapter provides no pre-indexation salary or direct indexation amount mapping
- **THEN** no salary-indexation fact is fabricated

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

#### Scenario: Recovery writeback uses explicit adapter ownership
- **WHEN** a recovery changes a principal or material-liability amount
- **THEN** the system writes only to the normalized adapter's explicit destination
- **AND** preserves a formula unless that destination is declared an adapter-owned calculation output
- **AND** source sheet and cell coordinates remain traceability metadata outside the five-part claim key

#### Scenario: Salary recovery preserves split liability schedule
- **WHEN** a salary debt period has distinct first-half and second-half due dates and a partial recovery is allocated to that period
- **THEN** recovery metadata uses the same principal shares and due dates as the existing salary debt schedule
- **AND** allocates the recovery deterministically across outstanding schedule segments
- **AND** calculates recovered shares through the recovery date and remaining shares through the calculation end date
- **AND** does not collapse the result to one due date

#### Scenario: Single due date requires adapter declaration
- **WHEN** a normalized layout declares `single_due_date` liability timing
- **THEN** the system may calculate recovery effects from that declared due date
- **AND** otherwise does not invent a single-date financial mapping

#### Scenario: Formula ownership is explicit for every output family
- **WHEN** a principal, material-liability, indexation, or derivative destination contains a formula
- **THEN** replacement occurs only if that layout explicitly declares the corresponding output adapter-owned
- **AND** otherwise the formula and amount are preserved and a review warning is surfaced

#### Scenario: Unsupported recovery timing leaves indexation unchanged
- **WHEN** a recovery affects a target whose indexation methodology does not declare recovery-timing support
- **THEN** indexation remains unchanged
- **AND** one clear methodology warning is emitted per affected stable target
- **AND** the issue is surfaced in constructor issues and the audit position is marked disputed

### Requirement: Semantic calculation-sheet discovery
The system SHALL discover calculation layouts from normalized header/content semantics before using a sheet-name hint and SHALL process every matching sheet.

#### Scenario: Alternate names use semantic headers
- **WHEN** a calculation sheet has an arbitrary vendor-neutral name and sufficient recognized headers for a supported layout
- **THEN** the corresponding normalized adapter processes it

#### Scenario: Multiple sheets share one layout
- **WHEN** two or more sheets normalize to the same supported layout
- **THEN** every matching sheet is processed independently

#### Scenario: Salary does not claim unrelated content
- **WHEN** a sheet name does not identify salary and its content lacks the required salary calculation headers
- **THEN** the salary adapter does not process it

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
