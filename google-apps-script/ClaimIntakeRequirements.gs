const CLAIM_INTAKE_SETTINGS = {
  SHEET_NAME: 'Анкета и требования',
  NORMAL_SHEET_NAMES: ['Конструктор', 'Анкета и требования'],
  SECTOR_VALUES: [
    'Частная организация',
    'Бюджетный сектор / публичный должник',
    'Неизвестно',
  ],
  AVERAGE_SCENARIO_VALUES: ['Рассчитанный системой', 'Заданный вручную'],
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
      titleCell: 'A25',
      firstRow: 26,
      rowCount: 20,
      columnCount: 5,
      namedRange: 'CLAIM_INTAKE_CLAIM_SELECTIONS',
    },
    docsHistory: {
      titleCell: 'A48',
      headerRow: 49,
      firstRow: 50,
      rowCount: 10,
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
  sheet.getRange(layout.docsHistory.headerRow, 1, 1, 3).setValues([[
    'Дата создания', 'Документ', 'Сценарий',
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

function formatClaimIntakeSheet_(sheet, layout, created) {
  sheet.setFrozenRows(2);
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 300);
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
  [layout.partialRecoveries, layout.claimSelections, layout.docsHistory].forEach((table) => {
    spreadsheet.setNamedRange(
      table.namedRange,
      sheet.getRange(table.firstRow, 1, table.rowCount, table.columnCount)
    );
  });
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

function writeAverageEarningsState_(state, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const value = state || {};
  const calculated = value.calculated || {};
  const user = value.user || {};
  target.getRangeByName(layout.calculatedAverage.namedRange)
    .setValue(calculated.amount === undefined ? '' : calculated.amount);
  target.getRangeByName(layout.calculatedAverageContext.namedRange)
    .setValue(calculated.context || '');
  target.getRangeByName(layout.manualAverage.namedRange)
    .setValue(user.amount === undefined ? '' : user.amount);
  target.getRangeByName(layout.manualAverageContext.namedRange)
    .setValue(user.context || '');
  const selected = normalizeAverageEarningsSource_(value.selectedSource);
  if (selected !== 'calculated' && selected !== 'user') {
    throw new Error('Неизвестный источник среднего заработка');
  }
  target.getRangeByName(layout.finalAverageScenario.namedRange).setValue(
    selected === 'user'
      ? CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[1]
      : CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0]
  );
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
    averageEarnings: readAverageEarningsState_(target),
    partialRecoveries: target.getRangeByName(layout.partialRecoveries.namedRange).getValues(),
  };
}

function readClaimQuestionnaireState_(spreadsheet) {
  return captureClaimQuestionnaireState_(spreadsheet);
}

function writeClaimQuestionnaireState_(state, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const value = state || {};
  if (value.employerSector !== undefined) {
    target.getRangeByName(layout.employerSector.namedRange).setValue(value.employerSector);
  }
  if (value.averageEarnings) {
    writeAverageEarningsState_(value.averageEarnings, target);
  }
  if (value.partialRecoveries) {
    const range = target.getRangeByName(layout.partialRecoveries.namedRange);
    const rows = value.partialRecoveries.slice(0, layout.partialRecoveries.rowCount)
      .map((row) => Array.from(row).slice(0, layout.partialRecoveries.columnCount));
    while (rows.length < layout.partialRecoveries.rowCount) {
      rows.push(['', '', '', '']);
    }
    range.setValues(rows.map((row) => {
      while (row.length < layout.partialRecoveries.columnCount) row.push('');
      return row;
    }));
  }
  return captureClaimQuestionnaireState_(target);
}

function addClaimPartialRecovery() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ensureClaimIntakeSheet_(spreadsheet);
  const layout = getClaimIntakeLayout_();
  const range = spreadsheet.getRangeByName(layout.partialRecoveries.namedRange);
  const rows = range.getValues();
  const emptyIndex = rows.findIndex((row) => !row[0] && row.slice(1).every(isClaimIntakeEmpty_));
  if (emptyIndex < 0) {
    const error = 'Нет свободных строк для частичных погашений';
    spreadsheet.toast(error, 'Анкета и требования');
    return { added: false, error };
  }
  const row = layout.partialRecoveries.firstRow + emptyIndex;
  spreadsheet.getSheetByName(layout.sheetName).getRange(row, 1).setValue(true);
  return { added: true, row };
}

function onEdit(e) {
  if (!e || !e.range) return { handled: false };
  const editedRange = e.range;
  const sheet = editedRange.getSheet();
  const layout = getClaimIntakeLayout_();
  if (!sheet || sheet.getName() !== layout.sheetName) return { handled: false };

  const row = editedRange.getRow();
  const column = editedRange.getColumn();
  const actionControl = sheet.getRange(layout.partialRecoveries.actionControlCell);
  if (row === actionControl.getRow() && column === actionControl.getColumn()) {
    const checked = e.value === 'TRUE' || editedRange.getValue() === true;
    if (!checked) return { handled: false };
    try {
      return { handled: true, type: 'add', result: addClaimPartialRecovery() };
    } finally {
      actionControl.setValue(false);
    }
  }

  const editedLastRow = row + editedRange.getNumRows() - 1;
  const editedLastColumn = column + editedRange.getNumColumns() - 1;
  const recoveriesFirstRow = layout.partialRecoveries.firstRow;
  const recoveriesLastRow = recoveriesFirstRow + layout.partialRecoveries.rowCount - 1;
  const touchesRecoveryInputs = row <= recoveriesLastRow
    && editedLastRow >= recoveriesFirstRow
    && column <= 4
    && editedLastColumn >= 2;
  if (!touchesRecoveryInputs) return { handled: false };
  return {
    handled: true,
    type: 'validate_partial_recoveries',
    result: validateClaimPartialRecoveries_(sheet.getParent()),
  };
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
    if (!values[0] && values.slice(1).every(isClaimIntakeEmpty_)) return;
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

function validateClaimPartialRecoveries_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const sheet = target.getSheetByName(layout.sheetName);
  const range = target.getRangeByName(layout.partialRecoveries.namedRange);
  const result = normalizePartialRecoveries_(range.getValues());
  const invalidByRow = indexClaimRecoveryRows_(result.invalid);
  const unallocatedByRow = indexClaimRecoveryRows_(result.unallocated);
  for (let index = 0; index < layout.partialRecoveries.rowCount; index++) {
    const rowRange = sheet.getRange(layout.partialRecoveries.firstRow + index, 1, 1, 4);
    clearClaimRecoveryValidation_(rowRange);
    if (invalidByRow[index]) {
      applyClaimRecoveryValidation_(
        rowRange,
        CLAIM_INTAKE_SETTINGS.RECOVERY_ERROR_BACKGROUND,
        invalidByRow[index].errors.join('. ')
      );
    } else if (unallocatedByRow[index]) {
      applyClaimRecoveryValidation_(
        rowRange,
        CLAIM_INTAKE_SETTINGS.RECOVERY_WARNING_BACKGROUND,
        'Не указано требование: распределение будет уточнено, погашение считается спорным'
      );
    }
  }
  return result;
}

function indexClaimRecoveryRows_(items) {
  return (items || []).reduce((result, item) => {
    result[item.rowIndex] = item;
    return result;
  }, {});
}

function applyClaimRecoveryValidation_(rowRange, background, message) {
  const noteCell = rowRange.getSheet().getRange(rowRange.getRow(), rowRange.getColumn() + 3);
  const state = {
    backgrounds: rowRange.getBackgrounds()[0],
    note: noteCell.getNote(),
    ownedBackground: background,
    ownedNote: message,
  };
  PropertiesService.getDocumentProperties().setProperty(
    getClaimRecoveryValidationPropertyKey_(rowRange),
    JSON.stringify(state)
  );
  rowRange.setBackground(background);
  noteCell.setNote(message);
}

function clearClaimRecoveryValidation_(rowRange) {
  const noteCell = rowRange.getSheet().getRange(rowRange.getRow(), rowRange.getColumn() + 3);
  const properties = PropertiesService.getDocumentProperties();
  const key = getClaimRecoveryValidationPropertyKey_(rowRange);
  const serialized = properties.getProperty(key);
  if (!serialized) return;
  try {
    const state = JSON.parse(serialized);
    const current = rowRange.getBackgrounds()[0];
    rowRange.setBackgrounds([current.map((background, index) =>
      background === state.ownedBackground ? state.backgrounds[index] : background
    )]);
    if (noteCell.getNote() === state.ownedNote) {
      noteCell.setNote(state.note || '');
    }
  } catch (error) {
    // Leave non-validator formatting untouched when ownership metadata is malformed.
  }
  properties.deleteProperty(key);
}

function getClaimRecoveryValidationPropertyKey_(rowRange) {
  return `CLAIM_RECOVERY_VALIDATION_${rowRange.getSheet().getSheetId()}_${rowRange.getRow()}`;
}

function preserveClaimIntakeDocHistoryUrl_(spreadsheet, docUrl, note) {
  const value = String(docUrl || '').trim();
  if (!value) {
    return false;
  }
  const layout = getClaimIntakeLayout_();
  const sheet = ensureClaimIntakeSheet_(spreadsheet);
  const history = sheet.getRange(
    layout.docsHistory.firstRow,
    1,
    layout.docsHistory.rowCount,
    layout.docsHistory.columnCount
  );
  const rows = history.getValues();
  const existingIndex = rows.findIndex((row) => String(row[1] || '').trim() === value);
  if (existingIndex >= 0) {
    return true;
  }
  const emptyIndex = rows.findIndex((row) => row.every((cell) => cell === '' || cell === null));
  if (emptyIndex < 0) {
    return false;
  }
  const target = sheet.getRange(layout.docsHistory.firstRow + emptyIndex, 1, 1, 3);
  target.setValues([[new Date(), value, note || '']]);
  return String(target.getValues()[0][1] || '').trim() === value;
}
