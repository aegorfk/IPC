## ADDED Requirements

### Requirement: Provider-neutral evidence reference
Every normalized source row SHALL expose a provider-neutral evidence reference containing all available source-document and recognition coordinates without replacing or aggregating the normalized row.

#### Scenario: Complete source coordinates are available
- **WHEN** an adapter provides a document id or URL, signature/hash, source sheet or page, source row, source ordinal, recognition version, and confidence
- **THEN** the evidence reference preserves each supplied field
- **AND** contains no payroll-vendor assumption in its identity

#### Scenario: Only partial coordinates are available
- **WHEN** a legacy normalized row contains only a file label and source fragment
- **THEN** the evidence reference preserves those available values
- **AND** explicitly reports incomplete traceability
- **AND** does not fabricate a page, row, hash, URL, or confidence

#### Scenario: Equal-looking rows have different ordinals
- **WHEN** two rows have the same period, event, label, amount, and date but distinct persisted source ordinals
- **THEN** they produce distinct evidence-reference identities
- **AND** both remain available to later audit and Article 236 analysis
