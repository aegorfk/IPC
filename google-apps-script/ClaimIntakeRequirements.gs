const CLAIM_INTAKE_SETTINGS = {
  SHEET_NAME: 'Анкета и требования',
  NORMAL_SHEET_NAMES: ['Конструктор', 'Анкета и требования'],
  SECTOR_VALUES: [
    'Частная организация',
    'Бюджетный сектор / публичный должник',
    'Неизвестно',
  ],
  AVERAGE_SCENARIO_VALUES: ['Рассчитанный системой', 'Заданный вручную'],
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
    manualAverageSource: {
      label: 'Источник ручного значения',
      labelCell: 'A9',
      valueCell: 'B9',
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
  if (!sheet) {
    const constructor = spreadsheet.getSheetByName('Конструктор');
    const insertIndex = constructor ? constructor.getIndex() : 1;
    sheet = spreadsheet.insertSheet(layout.sheetName, insertIndex);
  }

  applyClaimIntakeStructure_(sheet, layout);
  formatClaimIntakeSheet_(sheet, layout);
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
    layout.manualAverageSource,
    layout.finalAverageScenario,
  ].forEach((field) => sheet.getRange(field.labelCell).setValue(field.label));

  sheet.getRange(layout.partialRecoveries.titleCell).setValue('Частичные погашения');
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
  sheet.getRange(layout.finalAverageScenario.valueCell).setDataValidation(scenarioRule);

  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.manualAverageEnabled.valueCell)
  );
  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 1)
  );
}

function insertClaimIntakeCheckboxesPreservingValues_(range) {
  const values = range.getValues();
  range.insertCheckboxes();
  range.setValues(values);
}

function formatClaimIntakeSheet_(sheet, layout) {
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
  sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 4)
    .setBackgrounds(Array.from(
      { length: layout.partialRecoveries.rowCount },
      () => Array(4).fill('#FFFFFF')
    ));
}

function registerClaimIntakeNamedRanges_(spreadsheet, sheet, layout) {
  [
    layout.employerSector,
    layout.calculatedAverage,
    layout.manualAverageEnabled,
    layout.manualAverage,
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
    return String(history.getValues()[existingIndex][1] || '').trim() === value;
  }
  const emptyIndex = rows.findIndex((row) => row.every((cell) => cell === '' || cell === null));
  if (emptyIndex < 0) {
    return false;
  }
  const target = sheet.getRange(layout.docsHistory.firstRow + emptyIndex, 1, 1, 3);
  target.setValues([[new Date(), value, note || '']]);
  return String(target.getValues()[0][1] || '').trim() === value;
}
