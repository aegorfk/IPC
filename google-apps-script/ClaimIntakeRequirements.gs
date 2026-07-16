const CLAIM_INTAKE_SETTINGS = {
  SHEET_NAME: 'Анкета и требования',
  NORMAL_SHEET_NAMES: ['Конструктор', 'Анкета и требования'],
  SECTOR_VALUES: [
    'Частная организация',
    'Бюджетный сектор / публичный должник',
    'Неизвестно',
  ],
  AVERAGE_SCENARIO_VALUES: ['Рассчитанный системой', 'Заданный вручную'],
  SELECTED_DOC_ACTION_LABEL: 'Расписать выбранные требования',
  RECOVERY_ERROR_BACKGROUND: '#F4CCCC',
  RECOVERY_WARNING_BACKGROUND: '#FFF2CC',
};

function getClaimIntakeSettings_() {
  return CLAIM_INTAKE_SETTINGS;
}

function getClaimIntakeLayout_() {
  return {
    sheetName: CLAIM_INTAKE_SETTINGS.SHEET_NAME,
    employerSector: {
      label: 'Сектор работодателя',
      labelCell: 'A3',
      valueCell: 'B3',
      namedRange: 'CLAIM_INTAKE_EMPLOYER_SECTOR',
    },
    calculatedAverage: {
      label: 'Рассчитанный средний заработок',
      labelCell: 'A6',
      valueCell: 'B6',
      namedRange: 'CLAIM_INTAKE_CALCULATED_AVERAGE_EARNINGS',
    },
    calculatedAverageContext: {
      valueCell: 'C6',
      namedRange: 'CLAIM_INTAKE_CALCULATED_AVERAGE_CONTEXT',
    },
    calculatedAverageBadge: {
      value: 'рассчитано',
      valueCell: 'D6',
    },
    manualAverageEnabled: {
      label: 'Задать вручную средний заработок',
      labelCell: 'A7',
      valueCell: 'B7',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_ENABLED',
    },
    manualAverage: {
      label: 'Средний заработок вручную',
      labelCell: 'A8',
      valueCell: 'B8',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_EARNINGS',
    },
    manualAverageContext: {
      valueCell: 'C8',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_CONTEXT',
    },
    manualAverageSource: {
      value: 'источник: пользователь',
      valueCell: 'D8',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_SOURCE',
    },
    finalAverageScenario: {
      label: 'Итоговый сценарий',
      labelCell: 'A10',
      valueCell: 'B10',
      namedRange: 'CLAIM_INTAKE_FINAL_AVERAGE_SCENARIO',
    },
    partialRecoveries: {
      titleCell: 'A12',
      actionCell: 'B12',
      actionControlCell: 'C12',
      headerRow: 13,
      firstRow: 14,
      rowCount: 10,
      columnCount: 4,
      namedRange: 'CLAIM_INTAKE_PARTIAL_RECOVERIES',
    },
    claimSelections: {
      titleCell: 'A62',
      firstRow: 63,
      columnCount: 5,
      namedRange: 'CLAIM_INTAKE_CLAIM_SELECTIONS',
    },
    docsHistory: {
      titleCell: 'G48',
      headerRow: 49,
      firstRow: 50,
      firstColumn: 7,
      rowCount: 1,
      columnCount: 3,
      namedRange: 'CLAIM_INTAKE_DOCS_HISTORY',
    },
  };
}

function ensureClaimIntakeSheet_(spreadsheet) {
  const layout = getClaimIntakeLayout_();
  let sheet = spreadsheet.getSheetByName(layout.sheetName);
  const created = !sheet;
  if (created) {
    const constructor = spreadsheet.getSheetByName('Конструктор');
    const insertIndex = constructor ? constructor.getIndex() : 1;
    sheet = spreadsheet.insertSheet(layout.sheetName, insertIndex);
  }

  applyClaimIntakeStructure_(sheet, layout);
  formatClaimIntakeSheet_(sheet, layout, created);
  registerClaimIntakeNamedRanges_(spreadsheet, sheet, layout);
  return sheet;
}

function ensureClaimConstructorWorkspace_(spreadsheet) {
  const constructor = ensureClaimConstructorSheet_(spreadsheet);
  const questionnaire = ensureClaimIntakeSheet_(spreadsheet);
  return { constructor, questionnaire };
}

function applyClaimIntakeStructure_(sheet, layout) {
  sheet.getRange('A1').setValue('Анкета и требования');
  sheet.getRange('A2').setValue('Факты дела, настройки расчета и выбранные требования');
  sheet.getRange(layout.employerSector.labelCell).setValue(layout.employerSector.label);
  sheet.getRange('A5').setValue('Средний заработок');
  [
    layout.calculatedAverage,
    layout.manualAverageEnabled,
    layout.manualAverage,
    layout.finalAverageScenario,
  ].forEach((field) => sheet.getRange(field.labelCell).setValue(field.label));
  sheet.getRange(layout.calculatedAverageBadge.valueCell)
    .setValue(layout.calculatedAverageBadge.value);
  sheet.getRange(layout.manualAverageSource.valueCell)
    .setValue(layout.manualAverageSource.value);

  sheet.getRange(layout.partialRecoveries.titleCell).setValue('Частичные погашения');
  sheet.getRange(layout.partialRecoveries.actionCell).setValue('Добавить');
  sheet.getRange(layout.partialRecoveries.headerRow, 1, 1, 4).setValues([[
    'Учитывать', 'Дата', 'Сумма', 'К какому требованию отнести',
  ]]);
  sheet.getRange(layout.claimSelections.titleCell).setValue('Аудит и требования');
  sheet.getRange(layout.docsHistory.titleCell).setValue('История сформированных Docs');
  sheet.getRange(layout.docsHistory.headerRow, layout.docsHistory.firstColumn, 1, 3).setValues([[
    'Дата создания', 'Документ', 'Источник',
  ]]);

  const sectorRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CLAIM_INTAKE_SETTINGS.SECTOR_VALUES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(layout.employerSector.valueCell).setDataValidation(sectorRule);
  const scenarioRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES, true)
    .setAllowInvalid(false)
    .build();
  const scenarioCell = sheet.getRange(layout.finalAverageScenario.valueCell);
  scenarioCell.setDataValidation(scenarioRule);
  if (!String(scenarioCell.getValue() || '').trim()) {
    scenarioCell.setValue(CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0]);
  }

  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.manualAverageEnabled.valueCell)
  );
  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.partialRecoveries.actionControlCell)
  );
  const recoveryActionControl = sheet.getRange(layout.partialRecoveries.actionControlCell);
  if (recoveryActionControl.getValue() !== true) {
    recoveryActionControl.setValue(false);
  }
  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 1)
  );
}

function insertClaimIntakeCheckboxesPreservingValues_(range) {
  const values = range.getValues();
  range.insertCheckboxes();
  range.setValues(values);
}

function buildStableClaimKey_(item) {
  const value = item || {};
  return [
    value.family,
    normalizeClaimLayoutIdentity_(value.layoutId),
    normalizeClaimBaseKindIdentity_(value.baseKind),
    value.periodKey,
    value.calculationItem,
  ]
    .map((part) => encodeURIComponent(normalizeText_(part)))
    .join('|');
}

function normalizeClaimLayoutIdentity_(layoutId) {
  return normalizeText_(layoutId) || 'unknown_layout';
}

function normalizeClaimBaseKindIdentity_(baseKind) {
  return normalizeText_(baseKind) || 'unknown_base_kind';
}

function buildClaimAuditModel_(claimFacts) {
  const familyDefinitions = [
    { family: 'underpayment', label: 'Взыскать недоплату' },
    { family: 'material_liability', label: 'Материальная ответственность' },
    { family: 'salary_indexation', label: 'Индексация заработной платы' },
    { family: 'underpayment_indexation', label: 'Индексация недоплаты' },
    { family: 'unallocated_recovery', label: 'Нераспределенные погашения', excludedFromClaimTotals: true },
  ];
  const factsByFamily = {};
  familyDefinitions.forEach((definition) => { factsByFamily[definition.family] = new Map(); });

  (claimFacts || []).forEach((fact) => {
    if (!fact || !factsByFamily[fact.family]) return;
    const amount = Number(fact.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const key = buildStableClaimKey_(fact);
    const existing = factsByFamily[fact.family].get(key);
    if (existing) {
      existing.amount = roundClaimAuditMoney_(existing.amount + amount);
      existing.disputed = existing.disputed || fact.disputed === true;
      if (fact.sourceRef && existing.sourceRefs.indexOf(fact.sourceRef) < 0) {
        existing.sourceRefs.push(fact.sourceRef);
      }
      return;
    }
    factsByFamily[fact.family].set(key, {
      key,
      family: fact.family,
      layoutId: fact.layoutId,
      baseKind: fact.baseKind,
      baseLabel: fact.baseLabel,
      periodKey: fact.periodKey,
      periodLabel: fact.periodLabel,
      calculationItem: fact.calculationItem,
      label: `${fact.baseLabel || 'Основание'} — ${fact.periodLabel || fact.periodKey}`,
      amount: roundClaimAuditMoney_(amount),
      disputed: fact.disputed === true,
      badge: fact.disputed === true ? 'спорное' : '',
      selected: true,
      sourceRefs: fact.sourceRef ? [fact.sourceRef] : [],
    });
  });

  const groups = familyDefinitions.map((definition) => {
    const items = Array.from(factsByFamily[definition.family].values());
    if (!items.length) return null;
    return {
      family: definition.family,
      label: definition.label,
      excludedFromClaimTotals: definition.excludedFromClaimTotals === true,
      total: roundClaimAuditMoney_(items.reduce((sum, item) => sum + item.amount, 0)),
      items,
    };
  }).filter(Boolean);
  return {
    groups,
    total: roundClaimAuditMoney_(groups.reduce(
      (sum, group) => sum + (group.excludedFromClaimTotals ? 0 : group.total), 0
    )),
  };
}

function mergeClaimSelections_(existingSelections, currentItems) {
  const prior = new Map();
  (existingSelections || []).forEach((item) => {
    if (!item || !isFivePartClaimKey_(item.key)) return;
    if (item.selected === true || item.selected === false) prior.set(item.key, item.selected);
  });
  return (currentItems || []).map((item) => {
    return Object.assign({}, item, {
      selected: prior.has(item.key) ? prior.get(item.key) : true,
    });
  });
}

const CLAIM_UNCHECKED_SELECTIONS_PROPERTY = 'CLAIM_INTAKE_UNCHECKED_SELECTIONS_V1';

function readDurableUncheckedClaimKeys_() {
  if (typeof PropertiesService === 'undefined') return new Set();
  const raw = PropertiesService.getDocumentProperties()
    .getProperty(CLAIM_UNCHECKED_SELECTIONS_PROPERTY);
  if (!raw) return new Set();
  try {
    const keys = JSON.parse(raw);
    return new Set((Array.isArray(keys) ? keys : []).filter(isFivePartClaimKey_));
  } catch (error) {
    return new Set();
  }
}

function writeDurableUncheckedClaimKeys_(keys) {
  if (typeof PropertiesService === 'undefined') return;
  const properties = PropertiesService.getDocumentProperties();
  const values = Array.from(keys || []).filter(isFivePartClaimKey_).sort();
  if (!values.length) {
    properties.deleteProperty(CLAIM_UNCHECKED_SELECTIONS_PROPERTY);
    return;
  }
  properties.setProperty(CLAIM_UNCHECKED_SELECTIONS_PROPERTY, JSON.stringify(values));
}

function isFivePartClaimKey_(key) {
  return typeof key === 'string' && key.split('|').length === 5;
}

function captureDurableClaimSelections_(existingSelections, options) {
  const unchecked = readDurableUncheckedClaimKeys_();
  (existingSelections || []).forEach((item) => {
    if (!item || !isFivePartClaimKey_(item.key)) return;
    if (item.selected === false) unchecked.add(item.key);
    if (item.selected === true) unchecked.delete(item.key);
  });
  if (!(options && options.deferPropertyWrite)) writeDurableUncheckedClaimKeys_(unchecked);
  return unchecked;
}

function readExistingClaimSelections_(sheet) {
  const layout = getClaimIntakeLayout_().claimSelections;
  const namedRange = sheet.getParent().getRangeByName(layout.namedRange);
  const extent = getClaimAuditRenderedExtent_(sheet, layout, namedRange);
  return sheet.getRange(layout.firstRow, 1, extent, layout.columnCount).getValues().reduce((items, row) => {
    const key = String(row[4] || '').trim();
    if (key) items.push({ key, selected: row[0] === true });
    return items;
  }, []);
}

function renderClaimAudit_(sheet, claimFacts, options) {
  const layout = getClaimIntakeLayout_();
  const audit = layout.claimSelections;
  const model = buildClaimAuditModel_(claimFacts);
  const prior = readExistingClaimSelections_(sheet);
  const durableUnchecked = captureDurableClaimSelections_(prior, options);
  const persistedSelections = prior.concat(Array.from(durableUnchecked, (key) => ({
    key,
    selected: false,
  })));
  const merged = mergeClaimSelections_(persistedSelections, model.groups.reduce(
    (items, group) => items.concat(group.items),
    []
  ));
  const selectedByKey = new Map(merged.map((item) => [item.key, item.selected]));
  model.groups.forEach((group) => {
    group.items.forEach((item) => { item.selected = selectedByKey.get(item.key); });
  });

  const rows = [];
  const checkboxRanges = [];
  model.groups.forEach((group) => {
    rows.push(['', `${group.label} — ${formatClaimAuditAmount_(group.total)}`, '', '', '']);
    const firstItemOffset = rows.length;
    group.items.forEach((item) => {
      rows.push([item.selected, item.label, item.badge, item.amount, item.key]);
    });
    checkboxRanges.push({ firstItemOffset, rowCount: group.items.length });
  });
  if (!rows.length) rows.push(['', 'Расчетные позиции пока не найдены', '', '', '']);
  const spreadsheet = sheet.getParent();
  const namedRange = spreadsheet.getRangeByName(audit.namedRange);
  const previousExtent = getClaimAuditRenderedExtent_(sheet, audit, namedRange);
  ensureClaimAuditRows_(sheet, audit.firstRow + Math.max(previousExtent, rows.length) - 1);
  const clearExtent = Math.max(previousExtent, rows.length);
  const range = sheet.getRange(audit.firstRow, 1, clearExtent, audit.columnCount);
  range.clearContent();
  if (typeof range.clearDataValidations === 'function') range.clearDataValidations();
  sheet.getRange(audit.titleCell).setValue('Аудит и требования');
  sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount).setValues(rows);
  checkboxRanges.forEach((checkboxRange) => {
    if (!checkboxRange.rowCount) return;
    const values = rows
      .slice(checkboxRange.firstItemOffset, checkboxRange.firstItemOffset + checkboxRange.rowCount)
      .map((row) => [row[0]]);
    const target = sheet.getRange(
      audit.firstRow + checkboxRange.firstItemOffset,
      1,
      checkboxRange.rowCount,
      1
    );
    target.insertCheckboxes();
    target.setValues(values);
  });
  sheet.getRange(audit.firstRow, 4, rows.length, 1).setNumberFormat('#,##0.00');
  spreadsheet.setNamedRange(
    audit.namedRange,
    sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount)
  );
  if (typeof sheet.hideColumns === 'function') sheet.hideColumns(5);
  model.durableUncheckedClaimKeys = Array.from(durableUnchecked);
  return model;
}

function ensureClaimAuditRows_(sheet, requiredLastRow) {
  if (typeof sheet.getMaxRows !== 'function' || typeof sheet.insertRowsAfter !== 'function') return;
  const maxRows = sheet.getMaxRows();
  if (requiredLastRow > maxRows) sheet.insertRowsAfter(maxRows, requiredLastRow - maxRows);
}

function getClaimAuditRenderedExtent_(sheet, audit, namedRange) {
  if (namedRange
    && namedRange.getSheet().getSheetId() === sheet.getSheetId()
    && namedRange.getRow() === audit.firstRow
    && namedRange.getColumn() === 1
    && namedRange.getNumColumns() === audit.columnCount
    && namedRange.getNumRows() > 0) {
    return namedRange.getNumRows();
  }
  return 1;
}

function roundClaimAuditMoney_(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatClaimAuditAmount_(value) {
  const fixed = Number(value || 0).toFixed(2).replace('.', ',');
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatClaimIntakeSheet_(sheet, layout, created) {
  sheet.setFrozenRows(2);
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 300);
  sheet.setColumnWidth(7, 170);
  sheet.setColumnWidth(8, 360);
  sheet.setColumnWidth(9, 130);
  sheet.getRange(1, 1, 1, 2)
    .setBackground('#E8F0FE')
    .setFontColor('#202124')
    .setFontSize(16)
    .setFontWeight('bold');
  sheet.getRange(layout.partialRecoveries.headerRow, 1, 1, 4)
    .setBackground('#E8F0FE')
    .setFontWeight('bold')
    .setWrap(true);
  if (created) {
    sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 4)
      .setBackgrounds(Array.from(
        { length: layout.partialRecoveries.rowCount },
        () => Array(4).fill('#FFFFFF')
      ));
  }
}

function registerClaimIntakeNamedRanges_(spreadsheet, sheet, layout) {
  [
    layout.employerSector,
    layout.calculatedAverage,
    layout.calculatedAverageContext,
    layout.manualAverageEnabled,
    layout.manualAverage,
    layout.manualAverageContext,
    layout.manualAverageSource,
    layout.finalAverageScenario,
  ].forEach((field) => {
    spreadsheet.setNamedRange(field.namedRange, sheet.getRange(field.valueCell));
  });
  spreadsheet.setNamedRange(
    layout.partialRecoveries.namedRange,
    sheet.getRange(
      layout.partialRecoveries.firstRow, 1,
      layout.partialRecoveries.rowCount, layout.partialRecoveries.columnCount
    )
  );
  const historyExtent = getClaimDocsHistoryExtent_(
    sheet, layout.docsHistory, spreadsheet.getRangeByName(layout.docsHistory.namedRange)
  );
  spreadsheet.setNamedRange(
    layout.docsHistory.namedRange,
    sheet.getRange(
      layout.docsHistory.firstRow, layout.docsHistory.firstColumn,
      historyExtent, layout.docsHistory.columnCount
    )
  );
  const auditExtent = getClaimAuditRenderedExtent_(
    sheet,
    layout.claimSelections,
    spreadsheet.getRangeByName(layout.claimSelections.namedRange)
  );
  spreadsheet.setNamedRange(
    layout.claimSelections.namedRange,
    sheet.getRange(
      layout.claimSelections.firstRow,
      1,
      auditExtent,
      layout.claimSelections.columnCount
    )
  );
}

function readAverageEarningsState_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return {
    calculated: {
      amount: target.getRangeByName(layout.calculatedAverage.namedRange).getValue(),
      context: target.getRangeByName(layout.calculatedAverageContext.namedRange).getValue(),
    },
    user: {
      amount: target.getRangeByName(layout.manualAverage.namedRange).getValue(),
      context: target.getRangeByName(layout.manualAverageContext.namedRange).getValue(),
    },
    selectedSource: normalizeAverageEarningsSource_(
      target.getRangeByName(layout.finalAverageScenario.namedRange).getValue()
    ),
  };
}

function syncCalculatedAverageEarningsFromDescriptors_(spreadsheet, descriptors) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const candidate = findCalculatedAverageEarningsFromDescriptors_(descriptors);
  if (!candidate) return null;
  const layout = getClaimIntakeLayout_();
  const sheet = ensureClaimIntakeSheet_(target);
  sheet.getRange(layout.calculatedAverage.valueCell)
    .setValue(candidate.amount)
    .setNumberFormat('#,##0.00');
  sheet.getRange(layout.calculatedAverageContext.valueCell).setValue(candidate.context);
  return candidate;
}

function findCalculatedAverageEarningsFromDescriptors_(descriptors) {
  let latest = null;
  (descriptors || []).forEach((descriptor) => {
    const layout = descriptor && descriptor.layout || {};
    const columns = descriptor && descriptor.semanticColumns || {};
    const sheet = descriptor && descriptor.sheet;
    if (!sheet || layout.id !== 'vacation' || !Number.isInteger(columns.averageDailyEarning)) {
      return;
    }
    const rowCount = Math.max(0, sheet.getLastRow() - descriptor.headerRow);
    if (!rowCount) return;
    const values = sheet.getRange(
      descriptor.headerRow + 1, 1, rowCount, sheet.getLastColumn()
    ).getDisplayValues();
    for (let rowIndex = values.length - 1; rowIndex >= 0; rowIndex--) {
      const annualSalary = Number.isInteger(columns.correctAnnualSalary)
        ? parseClaimPositiveAmount_(values[rowIndex][columns.correctAnnualSalary])
        : null;
      const divisor = Number.isInteger(columns.annualSalaryDivisor)
        ? parseClaimPositiveAmount_(values[rowIndex][columns.annualSalaryDivisor])
        : null;
      const amount = annualSalary !== null && divisor !== null
        ? roundMoney_(annualSalary / divisor)
        : parseClaimPositiveAmount_(values[rowIndex][columns.averageDailyEarning]);
      if (amount === null) continue;
      latest = {
        amount,
        context: buildCalculatedAverageEarningsContext_(
          sheet, values[rowIndex], columns, descriptor.headerRow + rowIndex + 1
        ),
        source: {
          sheetName: sheet.getName(),
          row: descriptor.headerRow + rowIndex + 1,
          adapterId: layout.id,
        },
      };
      break;
    }
  });
  return latest;
}

function buildCalculatedAverageEarningsContext_(sheet, row, columns, sheetRow) {
  const firstDisplayValue = (semantics) => {
    for (let index = 0; index < semantics.length; index++) {
      const column = columns[semantics[index]];
      if (!Number.isInteger(column)) continue;
      const value = String(row[column] || '').trim();
      if (value) return value;
    }
    return '';
  };
  let period = firstDisplayValue(['vacationStartDate', 'paymentDate', 'period']);
  if (!period && Number.isInteger(columns.year) && Number.isInteger(columns.month)) {
    const year = String(row[columns.year] || '').trim();
    const month = String(row[columns.month] || '').trim();
    period = [month, year].filter(Boolean).join('.');
  }
  const source = sheet && sheet.getName ? sheet.getName() : `строка ${sheetRow}`;
  return period ? `${period} · ${source}` : source;
}

function normalizeAverageEarningsStateForWrite_(state) {
  const value = state || {};
  const calculated = value.calculated || {};
  const user = value.user || {};
  const selected = normalizeAverageEarningsSource_(value.selectedSource);
  if (selected !== 'calculated' && selected !== 'user') {
    throw new Error('Неизвестный источник среднего заработка');
  }
  [calculated, user].forEach((scenario) => {
    if (scenario.amount !== undefined
      && typeof scenario.amount !== 'number'
      && typeof scenario.amount !== 'string') {
      throw new Error('Средний заработок должен быть числом');
    }
    if (scenario.context !== undefined
      && scenario.context !== null
      && typeof scenario.context !== 'string') {
      throw new Error('Контекст среднего заработка должен быть строкой');
    }
  });
  const selectedScenario = selected === 'user' ? user : calculated;
  if (parseClaimPositiveAmount_(selectedScenario.amount) === null) {
    throw new Error('Укажите положительный средний заработок для выбранного сценария');
  }
  return {
    calculatedAmount: calculated.amount === undefined ? '' : calculated.amount,
    calculatedContext: calculated.context || '',
    userAmount: user.amount === undefined ? '' : user.amount,
    userContext: user.context || '',
    selectedSource: selected,
    selectedScenario: selected === 'user'
      ? CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[1]
      : CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0],
  };
}

function writeAverageEarningsState_(state, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  writeClaimQuestionnaireState_({ averageEarnings: state }, target);
}

function normalizeAverageEarningsSource_(value) {
  const normalized = String(value || '').trim();
  if (normalized === 'user' || normalized === CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[1]) {
    return 'user';
  }
  if (
    normalized === 'calculated'
    || normalized === CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0]
  ) {
    return 'calculated';
  }
  return normalized;
}

function resolveSelectedAverageEarnings_(state) {
  const value = state || {};
  const source = normalizeAverageEarningsSource_(value.selectedSource);
  if (source !== 'calculated' && source !== 'user') {
    return {
      valid: false,
      source: source || null,
      amount: null,
      context: '',
      error: source
        ? 'Неизвестный источник среднего заработка'
        : 'Источник среднего заработка не выбран',
    };
  }
  const scenario = source === 'user' ? value.user : value.calculated;
  const amount = parseClaimPositiveAmount_(scenario && scenario.amount);
  const context = scenario && scenario.context ? String(scenario.context) : '';
  if (amount === null) {
    return {
      valid: false,
      source,
      amount: null,
      context,
      error: 'Укажите положительный средний заработок для выбранного сценария',
    };
  }
  return { source, amount, context };
}

function captureClaimQuestionnaireState_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return {
    employerSector: target.getRangeByName(layout.employerSector.namedRange).getValue(),
    manualAverageEnabled: target.getRangeByName(layout.manualAverageEnabled.namedRange).getValue() === true,
    averageEarnings: readAverageEarningsState_(target),
    partialRecoveries: target.getRangeByName(layout.partialRecoveries.namedRange).getValues(),
  };
}

function readClaimQuestionnaireState_(spreadsheet) {
  return captureClaimQuestionnaireState_(spreadsheet);
}

function normalizeClaimQuestionnaireStateForWrite_(state, layout) {
  const value = state || {};
  const normalized = {};
  if (value.employerSector !== undefined) {
    if (CLAIM_INTAKE_SETTINGS.SECTOR_VALUES.indexOf(value.employerSector) < 0) {
      throw new Error('Неизвестный сектор работодателя');
    }
    normalized.employerSector = value.employerSector;
  }
  if (value.manualAverageEnabled !== undefined) {
    if (typeof value.manualAverageEnabled !== 'boolean') {
      throw new Error('Признак ручного среднего заработка должен быть логическим значением');
    }
    normalized.manualAverageEnabled = value.manualAverageEnabled;
  }
  if (value.averageEarnings !== undefined) {
    normalized.averageEarnings = normalizeAverageEarningsStateForWrite_(value.averageEarnings);
  }
  if (value.partialRecoveries !== undefined) {
    if (!Array.isArray(value.partialRecoveries)) {
      throw new Error('Частичные погашения должны быть массивом строк');
    }
    normalized.partialRecoveries = value.partialRecoveries
      .slice(0, layout.partialRecoveries.rowCount)
      .map((row) => {
        if (!Array.isArray(row)) {
          throw new Error('Каждая строка частичного погашения должна быть массивом');
        }
        const result = row.slice(0, layout.partialRecoveries.columnCount);
        while (result.length < layout.partialRecoveries.columnCount) result.push('');
        return result;
      });
    while (normalized.partialRecoveries.length < layout.partialRecoveries.rowCount) {
      normalized.partialRecoveries.push(['', '', '', '']);
    }
  }
  return normalized;
}

function getClaimIntakeMutationLock_() {
  return LockService.getDocumentLock() || LockService.getScriptLock();
}

function withClaimIntakeMutationLock_(callback, options) {
  const settings = options || {};
  if (settings.lockHeld) return callback();
  const lock = getClaimIntakeMutationLock_();
  if (!lock || !lock.tryLock(5000)) {
    throw new Error('Анкета занята другим процессом; повторите попытку');
  }
  let result;
  let operationError = null;
  try {
    result = callback();
  } catch (error) {
    operationError = error;
  }
  try {
    SpreadsheetApp.flush();
  } catch (error) {
    if (typeof settings.onFlushError === 'function') {
      try {
        settings.onFlushError(error);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        // Preserve the original flush error while still releasing the lock.
      }
    }
    if (!operationError) operationError = error;
  } finally {
    lock.releaseLock();
  }
  if (operationError) throw operationError;
  return result;
}

function writeClaimQuestionnaireState_(state, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const normalized = normalizeClaimQuestionnaireStateForWrite_(state, layout);
  const lockOptions = {};
  let rollback = null;
  lockOptions.onFlushError = () => {
    if (rollback) rollback();
  };
  return withClaimIntakeMutationLock_(() => {
    const sheet = target.getSheetByName(layout.sheetName) || ensureClaimIntakeSheet_(target);
    const mutations = [];
    if (normalized.employerSector !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.employerSector.valueCell),
        values: [[normalized.employerSector]],
      });
    }
    if (normalized.manualAverageEnabled !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.manualAverageEnabled.valueCell),
        values: [[normalized.manualAverageEnabled]],
      });
    }
    if (normalized.averageEarnings) {
      mutations.push(
        {
          range: sheet.getRange(6, 2, 1, 2),
          values: [[
            normalized.averageEarnings.calculatedAmount,
            normalized.averageEarnings.calculatedContext,
          ]],
        },
        {
          range: sheet.getRange(8, 2, 1, 2),
          values: [[
            normalized.averageEarnings.userAmount,
            normalized.averageEarnings.userContext,
          ]],
        },
        {
          range: sheet.getRange(layout.finalAverageScenario.valueCell),
          values: [[normalized.averageEarnings.selectedScenario]],
        }
      );
    }
    if (normalized.partialRecoveries) {
      mutations.push({
        range: sheet.getRange(
          layout.partialRecoveries.firstRow,
          1,
          layout.partialRecoveries.rowCount,
          layout.partialRecoveries.columnCount
        ),
        values: normalized.partialRecoveries,
      });
    }
    const snapshots = mutations.map((mutation) => mutation.range.getValues());
    rollback = () => {
      for (let index = mutations.length - 1; index >= 0; index--) {
        mutations[index].range.setValues(snapshots[index]);
      }
    };
    try {
      mutations.forEach((mutation) => mutation.range.setValues(mutation.values));
      return captureClaimQuestionnaireState_(target);
    } catch (error) {
      rollback();
      throw error;
    }
  }, lockOptions);
}

function addClaimPartialRecovery(options) {
  const settings = options || {};
  const spreadsheet = settings.spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return withClaimIntakeMutationLock_(() => {
    const sheet = settings.sheet
      || spreadsheet.getSheetByName(layout.sheetName)
      || ensureClaimIntakeSheet_(spreadsheet);
    const rows = sheet.getRange(
      layout.partialRecoveries.firstRow,
      1,
      layout.partialRecoveries.rowCount,
      layout.partialRecoveries.columnCount
    ).getValues();
    const emptyIndex = rows.findIndex((row) => !row[0] && row.slice(1).every(isClaimIntakeEmpty_));
    if (emptyIndex < 0) {
      const error = 'Нет свободных строк для частичных погашений';
      spreadsheet.toast(error, 'Анкета и требования');
      return { added: false, error };
    }
    const row = layout.partialRecoveries.firstRow + emptyIndex;
    sheet.getRange(row, 1).setValue(true);
    return { added: true, row };
  }, settings);
}

function onEdit(e) {
  if (!e || !e.range) return { handled: false };
  const editedRange = e.range;
  const sheet = editedRange.getSheet();
  const layout = getClaimIntakeLayout_();
  if (!sheet || sheet.getName() !== layout.sheetName) return { handled: false };

  const row = editedRange.getRow();
  const column = editedRange.getColumn();
  const rowCount = editedRange.getNumRows();
  const columnCount = editedRange.getNumColumns();
  const editedLastRow = row + rowCount - 1;
  const editedLastColumn = column + columnCount - 1;
  const actionControl = sheet.getRange(layout.partialRecoveries.actionControlCell);
  const actionRow = actionControl.getRow();
  const actionColumn = actionControl.getColumn();
  const touchesAction = row <= actionRow
    && editedLastRow >= actionRow
    && column <= actionColumn
    && editedLastColumn >= actionColumn;
  const exactAction = row === actionRow
    && column === actionColumn
    && rowCount === 1
    && columnCount === 1;
  const recoveriesFirstRow = layout.partialRecoveries.firstRow;
  const recoveriesLastRow = recoveriesFirstRow + layout.partialRecoveries.rowCount - 1;
  const touchesRecoveryInputs = row <= recoveriesLastRow
    && editedLastRow >= recoveriesFirstRow
    && column <= 4
    && editedLastColumn >= 1;
  if (!touchesAction && !touchesRecoveryInputs) return { handled: false };

  const spreadsheet = e.source || sheet.getParent();
  return withClaimIntakeMutationLock_(() => {
    if (touchesAction && !exactAction && actionControl.getValue() === true) {
      actionControl.setValue(false);
    }
    if (exactAction) {
      const checked = (e.value === 'TRUE' || e.value === true)
        && actionControl.getValue() === true;
      if (!checked) {
        if (actionControl.getValue() === true) actionControl.setValue(false);
        return { handled: false };
      }
      try {
        return {
          handled: true,
          type: 'add',
          result: addClaimPartialRecovery({ spreadsheet, sheet, lockHeld: true }),
        };
      } finally {
        actionControl.setValue(false);
      }
    }
    if (touchesRecoveryInputs) {
      return {
        handled: true,
        type: 'validate_partial_recoveries',
        result: validateClaimPartialRecoveries_(spreadsheet, {
          spreadsheet,
          sheet,
          lockHeld: true,
        }),
      };
    }
    return { handled: true, type: 'ignored_action_paste' };
  }, { spreadsheet, sheet });
}

function isClaimIntakeEmpty_(value) {
  return value === '' || value === null || value === undefined;
}

function normalizePartialRecoveries_(rows) {
  const result = { valid: [], invalid: [], unallocated: [] };
  (rows || []).forEach((row, rowIndex) => {
    const values = Array.isArray(row)
      ? row
      : [row && row.active, row && row.date, row && row.amount, row && row.allocation];
    if (values[0] !== true) return;
    const date = parseClaimRecoveryDate_(values[1]);
    const amount = parseClaimPositiveAmount_(values[2]);
    const allocation = String(values[3] || '').trim();
    const errors = [];
    if (!date) errors.push('Некорректная дата частичного погашения');
    if (amount === null) errors.push('Сумма частичного погашения должна быть положительным числом');
    const normalized = { rowIndex, date, amount, allocation, row: values };
    if (errors.length) {
      normalized.errors = errors;
      result.invalid.push(normalized);
    } else if (!allocation) {
      normalized.disputed = true;
      result.unallocated.push(normalized);
    } else {
      result.valid.push(normalized);
    }
  });
  return result;
}

function parseClaimRecoveryDate_(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const text = String(value || '').trim();
  const match = text.match(/^(?:(\d{2})\.(\d{2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/);
  if (!match) return null;
  const year = Number(match[3] || match[4]);
  const month = Number(match[2] || match[5]);
  const day = Number(match[1] || match[6]);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day
    ? parsed
    : null;
}

function parseClaimPositiveAmount_(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  const text = String(value || '').trim();
  if (!/^[+-]?(?:\d{1,3}(?:[ \u00A0]\d{3})+|\d+)(?:[.,]\d+)?$/.test(text)) {
    return null;
  }
  const parsed = Number(text.replace(/[ \u00A0]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateClaimPartialRecoveries_(spreadsheet, options) {
  const settings = options || {};
  const target = spreadsheet || settings.spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return withClaimIntakeMutationLock_(() => {
    const sheet = settings.sheet
      || target.getSheetByName(layout.sheetName)
      || ensureClaimIntakeSheet_(target);
    const range = sheet.getRange(
      layout.partialRecoveries.firstRow,
      1,
      layout.partialRecoveries.rowCount,
      layout.partialRecoveries.columnCount
    );
    const result = normalizePartialRecoveries_(range.getValues());
    const invalidByRow = indexClaimRecoveryRows_(result.invalid);
    const unallocatedByRow = indexClaimRecoveryRows_(result.unallocated);
    const backgrounds = range.getBackgrounds();
    const noteRange = sheet.getRange(
      layout.partialRecoveries.firstRow,
      4,
      layout.partialRecoveries.rowCount,
      1
    );
    const notes = noteRange.getNotes();
    const nextBackgrounds = backgrounds.map((row) => row.slice());
    const nextNotes = notes.map((row) => row.slice());
    const properties = PropertiesService.getDocumentProperties();
    const ownership = properties.getProperties();
    const ownershipSnapshots = {};
    const propertyUpdates = {};
    const propertyDeletes = [];
    let backgroundsChanged = false;
    let notesChanged = false;

    for (let index = 0; index < layout.partialRecoveries.rowCount; index++) {
      const absoluteRow = layout.partialRecoveries.firstRow + index;
      const key = getClaimRecoveryValidationPropertyKeyForRow_(sheet, absoluteRow);
      ownershipSnapshots[key] = Object.prototype.hasOwnProperty.call(ownership, key)
        ? { present: true, value: ownership[key] }
        : { present: false, value: null };
      let previous = null;
      if (ownership[key]) {
        try {
          previous = JSON.parse(ownership[key]);
        } catch (error) {
          previous = null;
        }
      }
      const baseBackgrounds = backgrounds[index].map((background, columnIndex) =>
        previous && background === previous.ownedBackground
          ? previous.backgrounds[columnIndex]
          : background
      );
      const baseNote = previous && notes[index][0] === previous.ownedNote
        ? previous.note || ''
        : notes[index][0];
      let desired = null;
      if (invalidByRow[index]) {
        desired = {
          background: CLAIM_INTAKE_SETTINGS.RECOVERY_ERROR_BACKGROUND,
          message: invalidByRow[index].errors.join('. '),
        };
      } else if (unallocatedByRow[index]) {
        desired = {
          background: CLAIM_INTAKE_SETTINGS.RECOVERY_WARNING_BACKGROUND,
          message: 'Не указано требование: распределение будет уточнено, погашение считается спорным',
        };
      }
      const desiredBackgrounds = desired
        ? Array(layout.partialRecoveries.columnCount).fill(desired.background)
        : baseBackgrounds;
      const desiredNote = desired ? desired.message : baseNote;
      if (JSON.stringify(desiredBackgrounds) !== JSON.stringify(backgrounds[index])) {
        nextBackgrounds[index] = desiredBackgrounds;
        backgroundsChanged = true;
      }
      if (desiredNote !== notes[index][0]) {
        nextNotes[index][0] = desiredNote;
        notesChanged = true;
      }
      if (desired) {
        const serialized = JSON.stringify({
          backgrounds: baseBackgrounds,
          note: baseNote,
          ownedBackground: desired.background,
          ownedNote: desired.message,
        });
        if (ownership[key] !== serialized) propertyUpdates[key] = serialized;
      } else if (ownership[key]) {
        propertyDeletes.push(key);
      }
    }
    const rollback = () => {
      try {
        range.setBackgrounds(backgrounds);
      } catch (error) {
        // Continue restoring notes and ownership even if a visual rollback fails.
      }
      try {
        noteRange.setNotes(notes);
      } catch (error) {
        // Continue restoring ownership even if a note rollback fails.
      }
      const propertyRestores = {};
      Object.keys(ownershipSnapshots).forEach((key) => {
        if (ownershipSnapshots[key].present) {
          propertyRestores[key] = ownershipSnapshots[key].value;
        }
      });
      if (Object.keys(propertyRestores).length) {
        try {
          properties.setProperties(propertyRestores);
        } catch (error) {
          // Best effort: preserve the original mutation error.
        }
      }
      Object.keys(ownershipSnapshots).forEach((key) => {
        if (!ownershipSnapshots[key].present) {
          try {
            properties.deleteProperty(key);
          } catch (error) {
            // Best effort: preserve the original mutation error.
          }
        }
      });
    };
    try {
      if (Object.keys(propertyUpdates).length) properties.setProperties(propertyUpdates);
      if (backgroundsChanged) range.setBackgrounds(nextBackgrounds);
      if (notesChanged) noteRange.setNotes(nextNotes);
      propertyDeletes.forEach((key) => properties.deleteProperty(key));
    } catch (error) {
      rollback();
      throw error;
    }
    return result;
  }, settings);
}

function indexClaimRecoveryRows_(items) {
  return (items || []).reduce((result, item) => {
    result[item.rowIndex] = item;
    return result;
  }, {});
}

function getClaimRecoveryValidationPropertyKeyForRow_(sheet, row) {
  return `CLAIM_RECOVERY_VALIDATION_${sheet.getSheetId()}_${row}`;
}

function preserveClaimIntakeDocHistoryUrl_(spreadsheet, docUrl, note) {
  const value = String(docUrl || '').trim();
  if (!value) {
    return false;
  }
  const layout = getClaimIntakeLayout_();
  const sheet = ensureClaimIntakeSheet_(spreadsheet);
  const history = getClaimDocsHistoryRange_(spreadsheet, sheet, layout.docsHistory);
  const rows = history.getValues();
  const existingIndex = rows.findIndex((row) => extractGoogleDocId_(row[1]) === extractGoogleDocId_(value));
  if (existingIndex >= 0) {
    return true;
  }
  appendClaimDocsHistory_(spreadsheet, {
    timestamp: new Date(),
    title: note || 'Перенесенный расчет',
    url: value,
    source: 'legacy',
  });
  return true;
}

function getClaimDocsHistoryExtent_(sheet, history, namedRange) {
  if (namedRange
    && namedRange.getSheet().getSheetId() === sheet.getSheetId()
    && namedRange.getRow() === history.firstRow
    && namedRange.getColumn() === history.firstColumn
    && namedRange.getNumColumns() === history.columnCount
    && namedRange.getNumRows() > 0) {
    return namedRange.getNumRows();
  }
  return 1;
}

function getClaimDocsHistoryRange_(spreadsheet, sheet, history) {
  const namedRange = spreadsheet.getRangeByName(history.namedRange);
  return sheet.getRange(
    history.firstRow, history.firstColumn,
    getClaimDocsHistoryExtent_(sheet, history, namedRange), history.columnCount
  );
}

function appendClaimDocsHistory_(spreadsheet, entry) {
  const layout = getClaimIntakeLayout_();
  const history = layout.docsHistory;
  const sheet = spreadsheet.getSheetByName(layout.sheetName) || ensureClaimIntakeSheet_(spreadsheet);
  const range = getClaimDocsHistoryRange_(spreadsheet, sheet, history);
  const rows = range.getValues();
  validateClaimDocsHistoryRows_(rows);
  const hasOnlyBlankPlaceholder = rows.length === 1
    && rows[0].every((cell) => cell === '' || cell === null);
  const row = hasOnlyBlankPlaceholder ? history.firstRow : history.firstRow + rows.length;
  ensureClaimAuditRows_(sheet, row);
  const targetRange = sheet.getRange(row, history.firstColumn, 1, history.columnCount);
  const previousTargetValues = targetRange.getValues();
  if (!hasOnlyBlankPlaceholder && previousTargetValues[0].some((cell) =>
    cell !== '' && cell !== null)) {
    throw new Error('Следующая ячейка истории занята посторонними данными; запись отменена.');
  }
  const documentCell = `${entry.title || 'Расчет требований'} — ${entry.url}`;
  targetRange.setValues([[
    entry.timestamp || new Date(), documentCell, formatClaimDocsHistoryMetadata_(entry),
  ]]);
  const extent = row - history.firstRow + 1;
  spreadsheet.setNamedRange(
    history.namedRange,
    sheet.getRange(history.firstRow, history.firstColumn, extent, history.columnCount)
  );
  return { row, extent, targetRange, previousTargetValues };
}

function formatClaimDocsHistoryMetadata_(entry) {
  const value = entry || {};
  const source = value.source || 'payroll_slips';
  const idempotencyKey = String(value.idempotencyKey || '').trim();
  if (!idempotencyKey) return source;
  return JSON.stringify({ source, idempotencyKey });
}

function parseClaimDocsHistoryMetadata_(value) {
  const text = String(value || '').trim();
  if (!text) return { source: '', idempotencyKey: '' };
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return {
        source: String(parsed.source || ''),
        idempotencyKey: String(parsed.idempotencyKey || ''),
      };
    }
  } catch (error) {
    // Legacy history stores the source marker as plain text.
  }
  return { source: text, idempotencyKey: '' };
}

function findSuccessfulSelectedClaimDocumentByIdempotency_(spreadsheet, idempotencyKey) {
  const key = String(idempotencyKey || '').trim();
  if (!key) return null;
  const layout = getClaimIntakeLayout_();
  const sheet = spreadsheet.getSheetByName(layout.sheetName);
  if (!sheet) return null;
  const rows = getClaimDocsHistoryRange_(spreadsheet, sheet, layout.docsHistory).getValues();
  for (let index = rows.length - 1; index >= 0; index--) {
    const metadata = parseClaimDocsHistoryMetadata_(rows[index][2]);
    if (metadata.idempotencyKey !== key) continue;
    const documentId = extractGoogleDocId_(rows[index][1]);
    if (!documentId) continue;
    const text = String(rows[index][1] || '');
    const urlMatch = text.match(/https:\/\/docs\.google\.com\/document\/d\/[^\s]+/i);
    const url = urlMatch ? urlMatch[0] : `https://docs.google.com/document/d/${documentId}/edit`;
    const title = urlMatch ? text.slice(0, urlMatch.index).replace(/\s+—\s*$/, '') : 'Расчет требований';
    return {
      documentId,
      url,
      title,
      source: metadata.source,
      idempotencyKey: key,
      reused: true,
      historyRow: layout.docsHistory.firstRow + index,
    };
  }
  return null;
}

function validateClaimDocsHistoryRows_(rows) {
  (rows || []).forEach((row) => {
    const blank = row.every((cell) => cell === '' || cell === null);
    if (blank) return;
    if (!extractGoogleDocId_(row[1])) {
      throw new Error('Ячейка истории занята посторонними данными; запись отменена.');
    }
  });
}

function validateClaimDocsHistoryAuthority_(spreadsheet) {
  const layout = getClaimIntakeLayout_();
  const sheet = spreadsheet.getSheetByName(layout.sheetName);
  if (!sheet) throw new Error('Не найден лист истории сформированных Docs.');
  const range = getClaimDocsHistoryRange_(spreadsheet, sheet, layout.docsHistory);
  const rows = range.getValues();
  validateClaimDocsHistoryRows_(rows);
  const blankPlaceholder = rows.length === 1
    && rows[0].every((cell) => cell === '' || cell === null);
  if (!blankPlaceholder) {
    const nextRow = layout.docsHistory.firstRow + rows.length;
    const next = sheet.getRange(
      nextRow, layout.docsHistory.firstColumn, 1, layout.docsHistory.columnCount
    ).getValues()[0];
    if (next.some((cell) => cell !== '' && cell !== null)) {
      throw new Error('Следующая ячейка истории занята посторонними данными; запись отменена.');
    }
  }
  return range;
}

function buildSelectedClaimPayload_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const sheet = target.getSheetByName(layout.sheetName);
  if (!sheet) {
    throw new Error('Лист «Анкета и требования» не найден. Сначала обновите конструктор.');
  }
  const auditRange = target.getRangeByName(layout.claimSelections.namedRange);
  const extent = getClaimAuditRenderedExtent_(sheet, layout.claimSelections, auditRange);
  const rows = sheet.getRange(
    layout.claimSelections.firstRow, 1, extent, layout.claimSelections.columnCount
  ).getValues();
  const groups = [];
  let currentGroup = null;
  rows.forEach((row) => {
    const key = String(row[4] || '').trim();
    if (!key) {
      const heading = String(row[1] || '').trim();
      if (!heading) return;
      currentGroup = {
        family: '',
        label: heading.replace(/\s+—\s+[\d\s\u00a0]+(?:[,.]\d+)?\s*$/, ''),
        items: [],
        total: 0,
      };
      groups.push(currentGroup);
      return;
    }
    if (!currentGroup) {
      throw new Error(
        'Нарушен порядок групп аудита: позиция находится до заголовка группы. '
        + 'Повторите расчет в Google Sheets.'
      );
    }
    if (row[0] !== true) return;
    const amount = Number(row[3]);
    const family = decodeClaimKeyPart_(key.split('|')[0]);
    if (!currentGroup.family) currentGroup.family = family;
    const item = {
      key,
      family,
      label: String(row[1] || '').trim(),
      amount: Number.isFinite(amount) ? roundClaimAuditMoney_(amount) : 0,
      disputed: String(row[2] || '').trim().toLowerCase() === 'спорное',
    };
    currentGroup.items.push(item);
    currentGroup.total = roundClaimAuditMoney_(currentGroup.total + item.amount);
  });
  const selectedGroups = groups.filter((group) => group.items.length);
  const selectedClaimKeys = new Set(selectedGroups.reduce(
    (keys, group) => keys.concat(group.items.map((item) => item.key)), []
  ));
  const averageState = readAverageEarningsState_(target);
  const selectedAverage = resolveSelectedAverageEarnings_(averageState);
  const scenarios = ['calculated', 'user'].map((source) => {
    const scenario = source === 'user' ? averageState.user : averageState.calculated;
    const amount = parseClaimPositiveAmount_(scenario && scenario.amount);
    return amount === null ? null : {
      source,
      amount,
      context: String(scenario && scenario.context || ''),
      selected: source === normalizeAverageEarningsSource_(averageState.selectedSource),
    };
  }).filter(Boolean);
  const recoveryRows = target.getRangeByName(layout.partialRecoveries.namedRange).getValues();
  const recoveries = normalizePartialRecoveries_(recoveryRows);
  const run = typeof loadClaimConstructorRun_ === 'function' ? loadClaimConstructorRun_() : null;
  const effects = findLatestCalculationEffects_(run && run.results);
  return {
    employerSector: String(target.getRangeByName(layout.employerSector.namedRange).getValue() || ''),
    averageEarnings: {
      selected: selectedAverage,
      scenarios,
    },
    groups: selectedGroups,
    total: roundClaimAuditMoney_(selectedGroups.reduce((sum, group) => sum + group.total, 0)),
    recoveries: {
      valid: recoveries.valid.filter((recovery) => selectedClaimKeys.has(recovery.allocation)),
      invalid: recoveries.invalid,
      unallocated: recoveries.unallocated,
    },
    warnings: collectSelectedClaimWarnings_(effects, selectedClaimKeys),
    sourceKind: 'payroll_slips',
  };
}

function decodeClaimKeyPart_(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch (error) {
    return String(value || '');
  }
}

function findLatestCalculationEffects_(results) {
  const value = results || {};
  if (value.calculationEffects) return value.calculationEffects;
  const calculations = value.calculations;
  if (Array.isArray(calculations)) {
    for (let index = calculations.length - 1; index >= 0; index--) {
      if (calculations[index] && calculations[index].calculationEffects) {
        return calculations[index].calculationEffects;
      }
    }
  }
  return null;
}

function collectSelectedClaimWarnings_(calculationEffects, selectedClaimKeys) {
  if (!calculationEffects) return [];
  const derivative = calculationEffects.derivativeEffects;
  const selected = selectedClaimKeys instanceof Set ? selectedClaimKeys : new Set();
  const seen = new Set();
  return (calculationEffects.warnings || []).concat(
    derivative && derivative.warnings || []
  ).filter((warning) => {
    const targetKey = extractClaimWarningTargetKey_(warning);
    if (targetKey && !selected.has(targetKey)) return false;
    const semanticKey = buildClaimWarningSemanticKey_(warning);
    if (seen.has(semanticKey)) return false;
    seen.add(semanticKey);
    return true;
  }).map((warning) => {
    const recovery = warning.recovery || warning.overpayment && warning.overpayment.recovery;
    const targetKey = extractClaimWarningTargetKey_(warning);
    return {
      code: warning.code || '',
      reason: warning.reason || warning.message || '',
      source: warning.source || warning.sourceRef
        || (typeof warning.sourceContext === 'string' ? warning.sourceContext : '')
        || targetKey,
      disputed: warning.disputed === true,
      sourceContext: {
        source: warning.sourceContext || warning.source || warning.sourceRef || '',
        targetKey,
        amount: Number.isFinite(Number(warning.amount)) ? Number(warning.amount) : null,
        sourceIdentities: (warning.sourceIdentities || []).slice(),
        recovery: recovery ? {
          rowIndex: Number.isInteger(recovery.rowIndex) ? recovery.rowIndex : null,
          date: recovery.date || null,
          amount: Number.isFinite(Number(recovery.amount)) ? Number(recovery.amount) : null,
          allocation: recovery.allocation || '',
        } : null,
      },
    };
  });
}

function buildClaimWarningSemanticKey_(warning) {
  const value = warning || {};
  const sourceContext = value.sourceContext !== undefined
    ? value.sourceContext
    : (value.source !== undefined ? value.source : value.sourceRef || '');
  return stableClaimWarningStringify_([
    value.code || '',
    extractClaimWarningTargetKey_(value),
    sourceContext,
    value.reason || value.message || '',
  ]);
}

function extractClaimWarningTargetKey_(warning) {
  const value = warning || {};
  const candidates = [
    value,
    value.overpayment,
    value.recovery,
    value.effect,
    value.writeBack,
    value.sourceAdjustment,
  ];
  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index];
    if (!candidate || typeof candidate !== 'object') continue;
    const targetKey = candidate.targetKey || candidate.claimKey || '';
    if (targetKey) return String(targetKey);
  }
  return '';
}

function stableClaimWarningStringify_(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableClaimWarningStringify_).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${stableClaimWarningStringify_(value[key])}`
    ).join(',')}}`;
  }
  return JSON.stringify(value);
}

function resolveSelectedClaimDocumentFolder_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const constructorLayout = getClaimConstructorLayout_();
  const intakeLayout = getClaimIntakeLayout_();
  const candidates = [];
  const currentRange = target.getRangeByName(constructorLayout.outputDoc.namedRange);
  if (currentRange) candidates.push(currentRange.getValue());
  const intake = target.getSheetByName(intakeLayout.sheetName);
  if (intake) {
    const historyRows = getClaimDocsHistoryRange_(target, intake, intakeLayout.docsHistory).getValues();
    for (let index = historyRows.length - 1; index >= 0; index--) {
      candidates.push(historyRows[index][1]);
    }
  }
  let lastProblem = '';
  for (let index = 0; index < candidates.length; index++) {
    const id = extractGoogleDocId_(candidates[index]);
    if (!id) continue;
    try {
      const file = DriveApp.getFileById(id);
      const parents = file.getParents();
      const found = [];
      while (parents.hasNext()) found.push(parents.next());
      if (found.length === 1) {
        return { folder: found[0], sourceDocumentId: id };
      }
      lastProblem = found.length
        ? 'У документа найдено несколько родительских папок.'
        : 'У документа нет доступной родительской папки.';
    } catch (error) {
      lastProblem = `Документ недоступен: ${error && error.message ? error.message : error}`;
    }
  }
  throw createSelectedClaimDocumentCorrectiveError_(
    'document_parent_unresolvable',
    'Не удалось определить ровно одну доступную папку для нового Google Doc. '
    + 'Укажите в Конструкторе ссылку на доступный расчетный документ в нужной папке'
    + (lastProblem ? `. ${lastProblem}` : '.')
  );
}

function writeSelectedClaimDocument(options) {
  const settings = options || {};
  const spreadsheet = settings.spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  if (!lock || !lock.tryLock(30000)) {
    throw new Error('Формирование документа уже выполняется; повторите попытку позже.');
  }
  try {
    return writeSelectedClaimDocumentLocked_(spreadsheet, settings);
  } finally {
    lock.releaseLock();
  }
}

function writeSelectedClaimDocumentLocked_(spreadsheet, settings) {
  ensureClaimConstructorWorkspace_(spreadsheet);
  const existing = findSuccessfulSelectedClaimDocumentByIdempotency_(
    spreadsheet, settings.idempotencyKey
  );
  if (existing) {
    const currentRange = spreadsheet.getRangeByName(
      getClaimConstructorLayout_().outputDoc.namedRange
    );
    if (!currentRange) throw new Error('Не найдена ячейка текущего расчетного документа.');
    currentRange.setValue(existing.url);
    SpreadsheetApp.flush();
    return existing;
  }
  const resolvedFolder = resolveSelectedClaimDocumentFolder_(spreadsheet);
  const payload = buildSelectedClaimPayload_(spreadsheet);
  validateSelectedClaimDocumentPayload_(payload);
  validateClaimDocsHistoryAuthority_(spreadsheet);
  const now = settings.now || new Date();
  const title = buildSelectedClaimDocumentTitle_(payload, now);
  let document = null;
  let file = null;
  let documentId = '';
  try {
    document = DocumentApp.create(title);
    documentId = document.getId();
    file = DriveApp.getFileById(documentId);
    file.moveTo(resolvedFolder.folder);
    populateSelectedClaimDocument_(document, payload, now);
    document.saveAndClose();
    const url = document.getUrl
      ? document.getUrl()
      : `https://docs.google.com/document/d/${document.getId()}/edit`;
    updateSelectedClaimDocumentRegistry_(spreadsheet, {
      timestamp: now,
      title,
      url,
      source: settings.source || payload.sourceKind,
      idempotencyKey: settings.idempotencyKey || '',
    });
    return {
      documentId,
      url,
      title,
      folder: resolvedFolder.folder,
      sourceDocumentId: resolvedFolder.sourceDocumentId,
      source: settings.source || payload.sourceKind,
      idempotencyKey: String(settings.idempotencyKey || ''),
      payload,
    };
  } catch (error) {
    if (documentId) {
      try {
        trashGeneratedClaimDocument_(documentId, file);
      } catch (trashError) {
        throw new Error(
          `${error && error.message ? error.message : error}. `
          + `Не удалось удалить созданный документ; orphan ${documentId}: `
          + `${trashError && trashError.message ? trashError.message : trashError}`
        );
      }
    }
    throw error;
  }
}

function trashGeneratedClaimDocument_(documentId, knownFile) {
  const errors = [];
  let file = knownFile;
  if (!file) {
    try {
      file = DriveApp.getFileById(documentId);
    } catch (error) {
      errors.push(error);
    }
  }
  if (file && typeof file.setTrashed === 'function') {
    try {
      file.setTrashed(true);
      return true;
    } catch (error) {
      errors.push(error);
    }
  }
  if (typeof Drive !== 'undefined' && Drive.Files
    && typeof Drive.Files.trash === 'function') {
    try {
      Drive.Files.trash(documentId);
      return true;
    } catch (error) {
      errors.push(error);
    }
  }
  throw new Error(errors.map((error) => error && error.message ? error.message : String(error))
    .join('; ') || 'Сервисы удаления Google Drive недоступны.');
}

function validateSelectedClaimDocumentPayload_(payload) {
  const value = payload || {};
  const selectedAverage = value.averageEarnings && value.averageEarnings.selected;
  if (!selectedAverage || selectedAverage.valid === false
    || !Number.isFinite(Number(selectedAverage.amount))
    || Number(selectedAverage.amount) <= 0) {
    throw createSelectedClaimDocumentCorrectiveError_(
      'average_earnings_invalid',
      'Выберите сценарий и укажите положительный средний заработок перед формированием документа.'
    );
  }
  const itemCount = (value.groups || []).reduce(
    (count, group) => count + (group.items || []).length, 0
  );
  if (!itemCount) {
    throw createSelectedClaimDocumentCorrectiveError_(
      'selected_claims_missing',
      'Выберите хотя бы одно требование в разделе «Аудит и требования».'
    );
  }
}

function createSelectedClaimDocumentCorrectiveError_(code, message) {
  const error = new Error(message);
  error.name = 'SelectedClaimDocumentCorrectiveError';
  error.code = code;
  error.corrective = true;
  return error;
}

function isSelectedClaimDocumentCorrectiveError_(error) {
  return Boolean(error && error.corrective === true && [
    'average_earnings_invalid',
    'selected_claims_missing',
    'document_parent_unresolvable',
  ].indexOf(error.code) >= 0);
}

function writeSelectedClaimDocumentAction() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const result = writeSelectedClaimDocument({ spreadsheet });
  spreadsheet.toast(
    `Создан новый документ: ${result.title}`,
    CLAIM_INTAKE_SETTINGS.SELECTED_DOC_ACTION_LABEL
  );
  return result;
}

function buildSelectedClaimDocumentTitle_(payload, now) {
  const selected = payload.averageEarnings && payload.averageEarnings.selected || {};
  const scenario = selected.source === 'user' ? 'ручной средний' : 'рассчитанный средний';
  const timestamp = Utilities.formatDate(
    now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm:ss'
  );
  return `Расчет выбранных требований — ${timestamp} — ${scenario}`;
}

function populateSelectedClaimDocument_(document, payload, now) {
  const body = document.getBody();
  body.appendParagraph('Расчет выбранных требований')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Дата формирования: ${Utilities.formatDate(
    now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm'
  )}`);
  body.appendParagraph(`Источник данных: расчетные листки (${payload.sourceKind}).`);
  body.appendParagraph(`Сектор работодателя: ${payload.employerSector || 'не указан'}.`);
  const average = payload.averageEarnings.selected || {};
  body.appendParagraph('Сценарий среднего заработка')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(
    `${average.source === 'user' ? 'Заданный вручную' : 'Рассчитанный системой'}: `
    + `${formatClaimAuditAmount_(average.amount || 0)} руб.`
    + (average.context ? `; контекст: ${average.context}` : '')
  );
  (payload.averageEarnings.scenarios || []).filter((scenario) => !scenario.selected)
    .forEach((scenario) => body.appendParagraph(
      `Для сравнения — ${scenario.source === 'user' ? 'ручной' : 'рассчитанный'}: `
      + `${formatClaimAuditAmount_(scenario.amount)} руб.`
      + (scenario.context ? `; ${scenario.context}` : '')
    ));
  body.appendParagraph('Выбранные требования')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  payload.groups.forEach((group) => {
    body.appendParagraph(group.label).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendTable([['Позиция', 'Статус', 'Сумма']].concat(group.items.map((item) => [
      item.label,
      item.disputed ? 'спорное' : '',
      `${formatClaimAuditAmount_(item.amount)} руб.`,
    ])));
    body.appendParagraph(`Итого по группе: ${formatClaimAuditAmount_(group.total)} руб.`);
  });
  body.appendParagraph(`Итого выбранных требований: ${formatClaimAuditAmount_(payload.total)} руб.`);
  appendSelectedClaimRecoveriesNarrative_(body, payload.recoveries);
  if (payload.warnings.length) {
    body.appendParagraph('Предупреждения расчета')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    payload.warnings.forEach((warning) => body.appendParagraph(
      `${warning.reason || warning.code}` + (warning.source ? `; источник: ${warning.source}` : '')
    ));
  }
  body.appendParagraph(
    'Расшифровка сформирована только по данным расчетных листков и рассчитанным значениям Google Sheets; '
    + 'нормативный анализ и полный текст иска в этот документ не включены.'
  );
}

function appendSelectedClaimRecoveriesNarrative_(body, recoveries) {
  const value = recoveries || { valid: [], unallocated: [], invalid: [] };
  if (!value.valid.length && !value.unallocated.length && !value.invalid.length) return;
  body.appendParagraph('Частичные погашения')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  value.valid.forEach((item) => body.appendParagraph(
    `${formatDate_(item.date)} — ${formatClaimAuditAmount_(item.amount)} руб.; `
    + `отнесено к ${item.allocation}.`
  ));
  value.unallocated.forEach((item) => body.appendParagraph(
    `Спорное нераспределенное погашение: ${formatDate_(item.date)} — `
    + `${formatClaimAuditAmount_(item.amount)} руб.`
  ));
  value.invalid.forEach((item) => body.appendParagraph(
    `Не учтено: ${(item.errors || []).join('; ')}.`
  ));
}

function updateSelectedClaimDocumentRegistry_(spreadsheet, entry) {
  const constructorLayout = getClaimConstructorLayout_();
  const intakeLayout = getClaimIntakeLayout_();
  const currentRange = spreadsheet.getRangeByName(constructorLayout.outputDoc.namedRange);
  if (!currentRange) throw new Error('Не найдена ячейка текущего расчетного документа.');
  const intake = spreadsheet.getSheetByName(intakeLayout.sheetName);
  if (!intake) throw new Error('Не найден лист истории сформированных Docs.');
  const historyName = intakeLayout.docsHistory.namedRange;
  const namedHistory = spreadsheet.getRangeByName(historyName);
  const historySnapshot = namedHistory ? {
    exists: true,
    sheet: namedHistory.getSheet(),
    row: namedHistory.getRow(),
    column: namedHistory.getColumn(),
    rowCount: namedHistory.getNumRows(),
    columnCount: namedHistory.getNumColumns(),
    values: namedHistory.getValues(),
  } : { exists: false };
  const currentValues = currentRange.getValues();
  const authority = getClaimDocsHistoryRange_(spreadsheet, intake, intakeLayout.docsHistory);
  const authorityRows = authority.getValues();
  const placeholder = authorityRows.length === 1
    && authorityRows[0].every((cell) => cell === '' || cell === null);
  const targetRow = placeholder
    ? intakeLayout.docsHistory.firstRow
    : intakeLayout.docsHistory.firstRow + authorityRows.length;
  const targetRange = intake.getRange(
    targetRow, intakeLayout.docsHistory.firstColumn, 1, intakeLayout.docsHistory.columnCount
  );
  const targetValues = targetRange.getValues();
  try {
    appendClaimDocsHistory_(spreadsheet, entry);
    currentRange.setValue(entry.url);
    SpreadsheetApp.flush();
  } catch (error) {
    const rollbackErrors = [];
    const attempt = (label, callback) => {
      try {
        callback();
      } catch (rollbackError) {
        rollbackErrors.push(`${label}: ${rollbackError && rollbackError.message
          ? rollbackError.message : rollbackError}`);
      }
    };
    attempt('целевая строка истории', () => targetRange.setValues(targetValues));
    if (historySnapshot.exists) {
      const restoredHistory = historySnapshot.sheet.getRange(
        historySnapshot.row, historySnapshot.column,
        historySnapshot.rowCount, historySnapshot.columnCount
      );
      attempt('содержимое истории', () => restoredHistory.setValues(historySnapshot.values));
      attempt('именованный диапазон истории', () =>
        spreadsheet.setNamedRange(historyName, restoredHistory));
    } else {
      attempt('удаление созданного именованного диапазона', () =>
        removeClaimNamedRangeIfPresent_(spreadsheet, historyName));
    }
    attempt('текущая ссылка', () => currentRange.setValues(currentValues));
    attempt('flush отката', () => SpreadsheetApp.flush());
    attempt('проверка отката', () => verifySelectedClaimRegistryRollback_(
      spreadsheet, currentRange, currentValues, historyName, historySnapshot,
      targetRange, targetValues
    ));
    if (rollbackErrors.length) {
      throw new Error(
        `${error && error.message ? error.message : error}. `
        + `Откат реестра не удался: ${rollbackErrors.join('; ')}`
      );
    }
    throw error;
  }
  return { previousExtent: authority.getNumRows(), targetRange };
}

function removeClaimNamedRangeIfPresent_(spreadsheet, name) {
  const named = spreadsheet.getNamedRanges().find((item) => item.getName() === name);
  if (named) named.remove();
}

function verifySelectedClaimRegistryRollback_(
  spreadsheet, currentRange, currentValues, historyName, historySnapshot,
  targetRange, targetValues
) {
  if (!claimRegistryValuesEqual_(currentRange.getValues(), currentValues)) {
    throw new Error('текущая ссылка не восстановлена');
  }
  if (!claimRegistryValuesEqual_(targetRange.getValues(), targetValues)) {
    throw new Error('целевая строка истории не восстановлена');
  }
  const restoredNamed = spreadsheet.getRangeByName(historyName);
  if (!historySnapshot.exists) {
    if (restoredNamed) throw new Error('лишний именованный диапазон истории не удален');
    return;
  }
  if (!restoredNamed
    || restoredNamed.getSheet().getSheetId() !== historySnapshot.sheet.getSheetId()
    || restoredNamed.getRow() !== historySnapshot.row
    || restoredNamed.getColumn() !== historySnapshot.column
    || restoredNamed.getNumRows() !== historySnapshot.rowCount
    || restoredNamed.getNumColumns() !== historySnapshot.columnCount
    || !claimRegistryValuesEqual_(restoredNamed.getValues(), historySnapshot.values)) {
    throw new Error('именованный диапазон истории восстановлен не полностью');
  }
}

function claimRegistryValuesEqual_(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((row, rowIndex) => Array.isArray(row)
    && Array.isArray(right[rowIndex]) && row.length === right[rowIndex].length
    && row.every((value, columnIndex) => {
      const expected = right[rowIndex][columnIndex];
      if (value instanceof Date && expected instanceof Date) {
        return value.getTime() === expected.getTime();
      }
      return value === expected;
    }));
}
