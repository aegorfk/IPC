## ADDED Requirements

### Requirement: Single constructor workspace
The system SHALL provide an idempotently created `Конструктор` sheet as the normal user workspace, containing a Drive source-folder input, a Google Docs output input, one primary build action, persistent progress, calculated totals, and a review-issues section. The Google Docs input remains the visible handoff link after completion; the constructor MUST NOT add duplicate Docs or current-spreadsheet output rows.

#### Scenario: First-time setup
- **WHEN** the user invokes `Открыть конструктор` and the constructor sheet does not exist
- **THEN** the system creates and activates the sheet with all required labeled sections
- **AND** the source label is compatible with the existing Drive-folder resolver
- **AND** displays and resolves the source label as `Расчетные листы:`
- **AND** the Docs label is compatible with the existing calculation-document resolver

#### Scenario: Repeated setup preserves user data
- **WHEN** the user invokes `Открыть конструктор` for an existing constructor sheet
- **THEN** the system repairs missing layout elements without clearing source links, run status, totals, or review issues

### Requirement: Two-link intake validation
The system SHALL use the Drive folder and Google Doc links stored on the constructor sheet as the run inputs and SHALL validate that both resources are syntactically valid and accessible before starting the calculation pipeline.

#### Scenario: Valid links start a run
- **WHEN** both constructor inputs contain accessible resources of the expected kinds and no fresh constructor run is active
- **THEN** the system creates a new run id and starts the import phase

#### Scenario: Invalid required link is fatal
- **WHEN** a required input is blank, malformed, inaccessible, or points to the wrong resource kind
- **THEN** the system does not mutate calculation or Docs output
- **AND** the constructor displays a specific corrective error beside the invalid input

### Requirement: One-action calculation orchestration
The system SHALL execute import, reconstruction, Sheets calculation, and Docs handoff through one `Собрать расчет` action in that order, reusing the existing calculation methodology and data structures.

#### Scenario: Complete synchronous run
- **WHEN** the source import finishes within one Apps Script execution
- **THEN** the system populates the existing reconstruction structures
- **AND** recalculates the existing Sheets calculation structures
- **AND** performs the available Docs handoff only after Sheets recalculation
- **AND** publishes a completed result on the constructor sheet

#### Scenario: Sheets remain authoritative
- **WHEN** the constructor displays totals
- **THEN** every displayed total is read from the structured result of an existing Sheets calculation or from cells updated by that calculation
- **AND** the constructor does not maintain an independent parallel formula for the same amount

### Requirement: Automatic resumable continuation
The system MUST persist constructor run state and automatically continue the workflow after an existing resumable import batch completes, without requiring the normal user to invoke a manual resume command. State transitions MUST enforce a single active run through document locking, active run-id comparison, and expected-phase comparison.

#### Scenario: Second build request joins active run
- **WHEN** the user invokes `Собрать расчет` while a fresh constructor run is active
- **THEN** the system keeps the existing run id and displays its current phase
- **AND** does not start another import or repeat any running/completed phase

#### Scenario: Import schedules another execution
- **WHEN** the import reaches its execution limit before all source groups are processed
- **THEN** the persisted batch session retains the constructor run id and pending next phase
- **AND** the constructor displays the import as in progress

#### Scenario: One-shot continuation is lost or delayed
- **WHEN** an active import or post-import phase no longer has an effective one-shot continuation
- **THEN** one deduplicated recurring watchdog resumes the same persisted run within its next interval
- **AND** preserves the import `nextIndex`, completed phase results, and active run id
- **AND** removes itself after the run reaches a terminal state

#### Scenario: Final batch advances the constructor
- **WHEN** the final scheduled import batch writes its outputs
- **THEN** the system automatically advances the same constructor run to reconstruction and calculation
- **AND** completed phases are not executed twice

#### Scenario: Recognition completes before derived views
- **WHEN** the last source group has been recognized but import summaries or diagnostics still require materialization
- **THEN** the session persists the recognized group count and enters a resumable finalization stage
- **AND** a later continuation resumes the pending derived view instead of recognizing the last source again

#### Scenario: Reconstruction exceeds one execution window
- **WHEN** reconstruction contains multiple target sheets or recalculation steps
- **THEN** each continuation completes and checkpoints at most one bounded target step
- **AND** the next continuation resumes from the first incomplete step without clearing completed target results
- **AND** the legacy synchronous reconstruction command remains callable outside constructor orchestration

#### Scenario: Stale continuation is ignored
- **WHEN** a scheduled or manual continuation carries a run id that is not the active run id
- **THEN** the system performs no calculation or worksheet mutation for that continuation

#### Scenario: No calculable rows is fatal
- **WHEN** import completes without any calculable normalized rows
- **THEN** the run ends as `Ошибка` with retained import diagnostics
- **AND** the system does not publish a successful zero-value calculation or update the output Doc

### Requirement: Non-blocking disputed-data handling
The system SHALL continue every phase for which meaningful results can be calculated when source rows are ambiguous, VLM-derived, partially missing, mismatched, or otherwise require review.

#### Scenario: Ambiguous rows do not block calculable results
- **WHEN** import or quality gates report disputed rows but normalized calculable rows are available
- **THEN** the system completes reconstruction and calculations for the available rows
- **AND** finishes with status `Готово с замечаниями`

#### Scenario: Optional claim facts are missing
- **WHEN** a calculation or Docs subsection requires optional case facts not recoverable from the supplied sources
- **THEN** the system omits only the unavailable calculation/subsection
- **AND** records the missing fact as a review issue
- **AND** preserves all other completed Sheets results

### Requirement: Consolidated review issues
The system SHALL aggregate existing import quality, VLM, diagnostic, reconstruction, and skipped-calculation signals into a concise constructor review table without removing the underlying audit records.

#### Scenario: Issue contains actionable context
- **WHEN** the system publishes a disputed item
- **THEN** the constructor shows its phase, source kind, source when available, reason, review/confidence status when available, known numerical impact or `не определено`, and suggested action

#### Scenario: Audit detail remains available
- **WHEN** the constructor summarizes an issue originating in a technical sheet
- **THEN** the original technical row remains unchanged and accessible in technical mode

### Requirement: Persistent progress and final status
The system SHALL present durable run progress on the constructor sheet and SHALL avoid modal technical alerts during normal execution.

#### Scenario: User reopens a running workbook
- **WHEN** a constructor run is active and the workbook is reopened
- **THEN** the constructor shows the persisted current phase, last update time formatted as `dd.MM.yyyy HH:mm`, and progress description
- **AND** reapplies the persisted visibility mode
- **AND** does not start or repeat any pipeline phase

#### Scenario: Resumable import advances by batches
- **WHEN** the payroll-slip adapter persists an incomplete import batch
- **THEN** the constructor shows the processed and total source counts, percentage, and a visual progress bar
- **AND** refreshes the progress and last-update time after every batch without requiring the user to reopen the workbook
- **AND** preserves the same progress after the workbook is reopened

#### Scenario: Import completes and reconstruction starts
- **WHEN** the final import batch advances the run to reconstruction
- **THEN** the status reads `Импорт завершен. Реконструкция начислений и выплат`
- **AND** the progress row switches from source counts to an overall pipeline progress bar

#### Scenario: Long post-import work remains visibly alive
- **WHEN** import finalization or reconstruction advances by a bounded step
- **THEN** the constructor persists the current substep, its duration, and a monotonic overall percentage
- **AND** refreshes the progress row and last-update time before scheduling the next continuation

#### Scenario: Liability total is displayed
- **WHEN** the constructor renders the amount calculated under the project methodology for Article 236 of the Labor Code
- **THEN** the result row is labeled `Материальная ответственность`

#### Scenario: Run completes
- **WHEN** all possible phases finish
- **THEN** the constructor shows `Готово` or `Готово с замечаниями`, completion time, calculated totals, the existing Docs handoff link, and issue count

#### Scenario: Fatal runtime failure
- **WHEN** an inaccessible dependency or corrupt run state prevents safe continuation
- **THEN** the constructor shows `Ошибка`, the failed phase, a corrective message, and a retry action
- **AND** retains results from already completed phases

#### Scenario: Retry after a failed phase
- **WHEN** the user invokes `Повторить последний запуск` for a failed or stale run
- **THEN** the system creates a successor run with a new run id and a reference to the prior run
- **AND** begins at the first incomplete phase
- **AND** does not repeat completed phases or clear their durable results

### Requirement: Reversible sheet visibility modes
The system SHALL provide normal, calculation-detail, and technical visibility modes by hiding or showing existing sheets without deleting, clearing, recreating, or reordering them.

#### Scenario: Normal mode
- **WHEN** the user selects `Обычный режим`
- **THEN** the constructor sheet is visible and all primary calculation, reconstruction, import, VLM, and diagnostic sheets are hidden

#### Scenario: Calculation detail mode
- **WHEN** the user selects `Показать детализацию`
- **THEN** the constructor and primary salary, premium, and vacation calculation sheets are visible
- **AND** reconstruction/import diagnostic sheets remain hidden

#### Scenario: Technical mode
- **WHEN** the user selects `Технический режим`
- **THEN** all existing sheets are visible

#### Scenario: Visibility change preserves workbook content
- **WHEN** the visibility mode changes
- **THEN** no sheet values, formulas, formatting, dimensions, order, or identifiers are changed by the visibility operation

### Requirement: Simplified menu with legacy compatibility
The system SHALL expose one `Конструктор требований` menu for the normal workflow and SHALL keep existing public Apps Script entry-point functions callable for compatibility and diagnostics.

#### Scenario: Normal menu is concise
- **WHEN** the spreadsheet opens
- **THEN** the primary menu presents constructor open/build and visibility actions directly
- **AND** implementation-oriented import/VLM maintenance commands appear only under a technical submenu

#### Scenario: Existing entry point remains callable
- **WHEN** a legacy test, trigger, or developer invokes an existing public calculation/import function by name
- **THEN** the function retains its existing externally observable behavior unless separately specified

### Requirement: Bounded Google Docs handoff
The system SHALL update Google Docs only after corresponding Sheets calculations complete and SHALL preserve document content outside the existing auto-generated markers.

#### Scenario: Available calculation narrative is written
- **WHEN** the Sheets calculation completes and the output Doc is accessible
- **THEN** the system updates the bounded calculation block using the existing Docs methodology
- **AND** stores the Doc link and handoff status on the constructor sheet

#### Scenario: Existing document content is preserved
- **WHEN** the system refreshes a previously populated output Doc
- **THEN** content outside the constructor-managed marker range remains unchanged

### Requirement: Source-independent orchestration boundary
The system SHALL orchestrate normalized facts and calculation capabilities through an adapter result containing source kind, normalized result references, quality issues, and completion/continuation status, without requiring the constructor UI to know 1C-specific section names or service-sheet layouts.

#### Scenario: Priority 1C adapter supplies normalized rows
- **WHEN** the existing 1C:ZUP adapter imports payroll slips
- **THEN** the constructor consumes an adapter result with source kind `payroll_slips`, normalized results, quality issues, and completion status through the orchestration boundary

#### Scenario: Future source kind can be recorded
- **WHEN** a later adapter supplies normalized entitlement facts from another source kind
- **THEN** the constructor run and issue model can identify that source kind without changing the two-link intake or phase sequencing
