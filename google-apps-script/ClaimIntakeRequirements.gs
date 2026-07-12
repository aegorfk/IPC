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

function buildStableClaimKey_(item) {
  const value = item || {};
  return [value.family, value.baseKind, value.periodKey, value.calculationItem]
    .map((part) => encodeURIComponent(normalizeText_(part)))
    .join('|');
}

function buildClaimAuditModel_(claimFacts) {
  const familyDefinitions = [
    { family: 'underpayment', label: 'Взыскать недоплату' },
    { family: 'material_liability', label: 'Материальная ответственность' },
    { family: 'salary_indexation', label: 'Индексация заработной платы' },
    { family: 'underpayment_indexation', label: 'Индексация недоплаты' },
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
      total: roundClaimAuditMoney_(items.reduce((sum, item) => sum + item.amount, 0)),
      items,
    };
  }).filter(Boolean);
  return {
    groups,
    total: roundClaimAuditMoney_(groups.reduce((sum, group) => sum + group.total, 0)),
  };
}

function mergeClaimSelections_(existingSelections, currentItems) {
  const prior = new Map();
  (existingSelections || []).forEach((item) => {
    if (!item || !item.key) return;
    if (item.selected === true || item.selected === false) prior.set(item.key, item.selected);
  });
  return (currentItems || []).map((item) => Object.assign({}, item, {
    selected: prior.has(item.key) ? prior.get(item.key) : true,
  }));
}

function readExistingClaimSelections_(sheet) {
  const layout = getClaimIntakeLayout_().claimSelections;
  return sheet.getRange(
    layout.firstRow,
    1,
    layout.rowCount,
    layout.columnCount
  ).getValues().reduce((items, row) => {
    const key = String(row[4] || '').trim();
    if (key) items.push({ key, selected: row[0] === true });
    return items;
  }, []);
}

function renderClaimAudit_(sheet, claimFacts) {
  const layout = getClaimIntakeLayout_();
  const audit = layout.claimSelections;
  const model = buildClaimAuditModel_(claimFacts);
  const prior = readExistingClaimSelections_(sheet);
  const merged = mergeClaimSelections_(prior, model.groups.reduce(
    (items, group) => items.concat(group.items),
    []
  ));
  const selectedByKey = new Map(merged.map((item) => [item.key, item.selected]));
  model.groups.forEach((group) => {
    group.items.forEach((item) => { item.selected = selectedByKey.get(item.key); });
  });

  const rows = [];
  model.groups.forEach((group) => {
    rows.push(['', `${group.label} — ${formatClaimAuditAmount_(group.total)}`, '', '', '']);
    group.items.forEach((item) => {
      rows.push([item.selected, item.label, item.badge, item.amount, item.key]);
    });
  });
  if (!rows.length) rows.push(['', 'Расчетные позиции пока не найдены', '', '', '']);
  if (rows.length > audit.rowCount) {
    throw new Error(`Для аудита требуется ${rows.length} строк, доступно ${audit.rowCount}`);
  }

  const range = sheet.getRange(
    audit.firstRow,
    1,
    audit.rowCount,
    audit.columnCount
  );
  range.clearContent();
  if (typeof range.clearDataValidations === 'function') range.clearDataValidations();
  sheet.getRange(audit.titleCell).setValue('Аудит и требования');
  sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount).setValues(rows);
  rows.forEach((row, index) => {
    if (!row[4]) return;
    insertClaimIntakeCheckboxesPreservingValues_(sheet.getRange(audit.firstRow + index, 1));
  });
  sheet.getRange(audit.firstRow, 4, audit.rowCount, 1).setNumberFormat('#,##0.00');
  if (typeof sheet.hideColumns === 'function') sheet.hideColumns(5);
  return model;
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
