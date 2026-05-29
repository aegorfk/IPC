const ZUP_IMPORT_SETTINGS = {
  PARSER_VERSION: 'zup-import-v2',
  SOURCE_FOLDER_URL: 'https://drive.google.com/drive/folders/1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm?usp=sharing',
  RECONSTRUCTION_PREFIX: 'Из_1С_',
  IMPORT_SHEET_NAME: 'Импорт_1С_ЗУП',
  SUMMARY_SHEET_NAME: 'Импорт_1С_Свод',
  DIAGNOSTIC_SHEET_NAME: 'Импорт_1С_Диагностика',
  QUALITY_SHEET_NAME: 'Импорт_1С_Качество',
  STATE_SHEET_NAME: 'Импорт_1С_Состояние',
  GOOGLE_SHEETS_MIME: 'application/vnd.google-apps.spreadsheet',
  GOOGLE_DOCS_MIME: 'application/vnd.google-apps.document',
  PDF_MIME: 'application/pdf',
  XLSX_MIME: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS_MIME: 'application/vnd.ms-excel',
  CSV_MIME: 'text/csv',
  HTML_MIME: 'text/html',
};

const ZUP_IMPORT_HEADERS = [
  'Файл',
  'Лист',
  'Сотрудник',
  'Период',
  'Год',
  'Месяц',
  'Рабочие дни',
  'Оплачено дней',
  'Дата выплаты',
  'Ведомость',
  'Дата ведомости',
  'Раздел 1С',
  'Категория',
  'Вид начисления',
  'Начислено',
  'Выплачено',
  'Удержано',
  'Строка источника',
];

const ZUP_IMPORT_COLUMNS = {
  file: 0,
  sheet: 1,
  employee: 2,
  period: 3,
  year: 4,
  month: 5,
  workDays: 6,
  paidDays: 7,
  paymentDate: 8,
  paymentStatement: 9,
  statementDate: 10,
  section: 11,
  category: 12,
  kind: 13,
  accrued: 14,
  paid: 15,
  withheld: 16,
  sourceRow: 17,
};

const ZUP_SUMMARY_HEADERS = [
  'Файл',
  'Период',
  'Год',
  'Месяц',
  'Раздел 1С',
  'Категория',
  'Вид начисления',
  'Рабочие дни',
  'Оплачено дней',
  'Начислено',
  'Выплачено',
  'Удержано',
  'Строк',
];

const ZUP_QUALITY_HEADERS = [
  'Группа',
  'Выбранный файл',
  'Выбранный MIME',
  'Варианты',
  'Статус',
  'Строк',
  'Сотрудник',
  'Период',
  'Начислено итог',
  'Начислено распознано',
  'Удержано итог',
  'Удержано распознано',
  'Выплачено итог',
  'Выплачено распознано',
  'Предупреждения',
];

const ZUP_STATE_HEADERS = [
  'Группа',
  'Файл ID',
  'Файл',
  'MIME',
  'Updated',
  'Size',
  'Parser',
  'Signature',
  'Строк',
  'Статус',
  'Последний импорт',
];

const ZUP_DIAGNOSTIC_HEADERS = [
  'Лист',
  'Строка',
  'Категория',
  'Период',
  'Значение в рабочем листе',
  'Значение из импорта',
  'Разница',
  'Статус',
  'Детали',
];

const ZUP_RECONSTRUCTION_SHEETS = [
  {
    sourceSheetName: 'Оклад',
    targetSheetName: 'Из_1С_Оклад',
    dataStartRow: 3,
    clearColumns: ['A', 'B', 'D', 'E', 'F', 'I', 'K', 'L'],
  },
  {
    sourceSheetName: 'Ежемесячные',
    targetSheetName: 'Из_1С_Ежемесячные',
    dataStartRow: 2,
    clearColumns: ['C', 'F', 'H', 'I'],
  },
  {
    sourceSheetName: 'Ежеквартальные',
    targetSheetName: 'Из_1С_Ежеквартальные',
    dataStartRow: 2,
    clearColumns: ['C', 'F', 'H', 'I'],
  },
  {
    sourceSheetName: 'Ежегодные',
    targetSheetName: 'Из_1С_Ежегодные',
    dataStartRow: 2,
    clearColumns: ['C', 'F', 'H', 'I'],
  },
  {
    sourceSheetName: 'Отпуска',
    targetSheetName: 'Из_1С_Отпуска',
    dataStartRow: 2,
    clearColumns: ['A', 'B', 'D', 'G', 'H', 'K', 'L'],
  },
];

const ZUP_CATEGORY_RULES = [
  {
    category: 'Доплата до оклада',
    patterns: ['доплата до оклада'],
  },
  {
    category: 'Командировки',
    patterns: ['командировка', 'командировочные'],
  },
  {
    category: 'Сверхурочные и ночные',
    patterns: ['сверхуроч', 'ночн', 'работа в ночное время'],
  },
  {
    category: 'Праздники и выходные',
    patterns: ['работа в выходной', 'выходные дни', 'праздничн', 'нерабочий праздничный'],
  },
  {
    category: 'Районные коэффициенты и надбавки',
    patterns: ['районный коэффициент', 'северная надбавка', 'процентная надбавка'],
  },
  {
    category: 'Совмещение и замещение',
    patterns: ['совмещение', 'замещение', 'расширение зоны обслуживания'],
  },
  {
    category: 'Больничные',
    patterns: ['больнич', 'пособие по временной нетрудоспособности'],
  },
  {
    category: 'Отпуск без оплаты',
    patterns: ['отпуск за свой счет', 'отпуск без оплаты'],
  },
  {
    category: 'Материальная помощь',
    patterns: ['материальная помощь', 'матпомощ'],
  },
  {
    category: 'Оклад',
    patterns: ['оплата по окладу', 'оклад по дням', 'должностной оклад', 'зарплата за месяц', 'за первую половину'],
  },
  {
    category: 'Ежемесячные премии',
    patterns: ['ежемесячн', 'премия за месяц', 'месячная премия'],
  },
  {
    category: 'Ежеквартальные премии',
    patterns: ['ежекварт', 'квартальн'],
  },
  {
    category: 'Ежегодные премии',
    patterns: ['ежегод', 'годов', 'по итогам года'],
  },
  {
    category: 'Отпуска',
    patterns: ['отпуск', 'отпускные', 'компенсация отпуска'],
  },
  {
    category: 'Выходное пособие',
    patterns: ['выходн', 'пособие'],
  },
  {
    category: 'Удержания',
    patterns: ['ндфл', 'исполнительный лист', 'удержание'],
  },
];

function importZupFolder() {
  const spreadsheet = getTargetSpreadsheet_();
  const folder = resolveZupFolderFromSpreadsheet_(spreadsheet);
  const result = importZupFolderCore_(spreadsheet, folder.id, { force: false, dryRun: false });
  showMessage_(
    `Импорт 1С завершен. Источник: ${folder.source}. Файлов прочитано: ${result.filesRead}. Строк распознано: ${result.rows.length}. Пропущено файлов: ${result.skippedFiles.length}.`
  );
}

function importZupFolder_() {
  importZupFolder();
}

function previewZupFolderImport() {
  const spreadsheet = getTargetSpreadsheet_();
  const folder = resolveZupFolderFromSpreadsheet_(spreadsheet);
  const result = importZupFolderCore_(spreadsheet, folder.id, { force: false, dryRun: true });
  showMessage_(
    `Проверка импорта 1С завершена без перезаписи строк. Источник: ${folder.source}. Файлов проверено: ${result.filesRead}. Потенциальных строк: ${result.rows.length}.`
  );
}

function forceZupFolderImport() {
  const spreadsheet = getTargetSpreadsheet_();
  const folder = resolveZupFolderFromSpreadsheet_(spreadsheet);
  const result = importZupFolderCore_(spreadsheet, folder.id, { force: true, dryRun: false });
  showMessage_(
    `Полный импорт 1С завершен. Источник: ${folder.source}. Файлов перечитано: ${result.filesRead}. Строк распознано: ${result.rows.length}. Пропущено файлов: ${result.skippedFiles.length}.`
  );
}

function createZupReconstructionSheets() {
  const spreadsheet = getTargetSpreadsheet_();
  const created = [];
  const skipped = [];

  getZupReconstructionConfigs_().forEach((config) => {
    const result = createSingleZupReconstructionSheet_(spreadsheet, config);
    if (result.created) {
      created.push(result.sheetName);
    } else {
      skipped.push(result.reason);
    }
  });

  showMessage_(
    `Вкладки структуры 1С созданы: ${created.join(', ') || 'нет'}${skipped.length ? `\n\nПропущено:\n${skipped.join('\n')}` : ''}`
  );
}

function createZupSalaryReconstructionSheet() {
  createNamedZupReconstructionSheet_('Оклад');
}

function createZupMonthlyReconstructionSheet() {
  createNamedZupReconstructionSheet_('Ежемесячные');
}

function createZupQuarterlyReconstructionSheet() {
  createNamedZupReconstructionSheet_('Ежеквартальные');
}

function createZupAnnualReconstructionSheet() {
  createNamedZupReconstructionSheet_('Ежегодные');
}

function createZupVacationReconstructionSheet() {
  createNamedZupReconstructionSheet_('Отпуска');
}

function populateZupReconstructionSheets() {
  const spreadsheet = getTargetSpreadsheet_();
  const importRows = readZupImportObjects_(spreadsheet);
  if (!importRows.length) {
    throw new Error('Нет строк в Импорт_1С_ЗУП. Сначала выполните импорт расчетных листков.');
  }

  getZupReconstructionConfigs_().forEach((config) => {
    if (!spreadsheet.getSheetByName(config.targetSheetName)) {
      createSingleZupReconstructionSheet_(spreadsheet, config);
    }
  });

  const model = buildZupReconstructionModel_(importRows);
  const results = [
    fillZupSalaryReconstruction_(spreadsheet, model.salary),
    fillZupPremiumReconstruction_(spreadsheet, 'Из_1С_Ежемесячные', model.monthlyPremiums, 'monthly'),
    fillZupPremiumReconstruction_(spreadsheet, 'Из_1С_Ежеквартальные', model.quarterlyPremiums, 'quarterly'),
    fillZupPremiumReconstruction_(spreadsheet, 'Из_1С_Ежегодные', model.annualPremiums, 'annual'),
    fillZupVacationReconstruction_(spreadsheet, model.vacations),
  ];

  showMessage_(
    `Вкладки Из_1С заполнены из расчетных листков.\n${results.map((item) => `${item.sheet}: ${item.rows} строк`).join('\n')}`
  );
}

function createNamedZupReconstructionSheet_(sourceSheetName) {
  const spreadsheet = getTargetSpreadsheet_();
  const config = getZupReconstructionConfigs_().find((candidate) =>
    candidate.sourceSheetName === sourceSheetName
  );
  if (!config) {
    throw new Error(`Не найдена настройка вкладки ${sourceSheetName}.`);
  }

  const result = createSingleZupReconstructionSheet_(spreadsheet, config);
  showMessage_(result.created
    ? `Вкладка структуры 1С создана: ${result.sheetName}`
    : `Вкладка структуры 1С не создана: ${result.reason}`);
}

function clearZupImportSheets() {
  const spreadsheet = getTargetSpreadsheet_();
  [
    ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.SUMMARY_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.QUALITY_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME,
  ].forEach((sheetName) => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      spreadsheet.deleteSheet(sheet);
    }
  });
  showMessage_('Листы импорта 1С удалены.');
}

function clearZupImportSheets_() {
  clearZupImportSheets();
}

function importZupFolderCore_(spreadsheet, folderId, options) {
  const normalizedOptions = Object.assign({ force: false, dryRun: false }, options || {});
  const groups = selectZupImportFileGroups_(listZupFilesRecursively_(DriveApp.getFolderById(folderId)));
  const previousState = readZupImportState_(spreadsheet);
  const previousRowsByFile = readExistingZupRowsByFile_(spreadsheet);
  const rows = [];
  const skippedFiles = [];
  const qualityRows = [];
  const stateRows = [];
  let filesRead = 0;

  groups.forEach((group) => {
    const file = group.selected;
    const signature = buildZupFileSignature_(file);
    const unchanged = !normalizedOptions.force &&
      previousState[group.key] &&
      previousState[group.key].signature === signature &&
      previousRowsByFile[file.getName()];

    try {
      const parsed = unchanged
        ? buildUnchangedZupResult_(file, previousRowsByFile[file.getName()])
        : parseZupFile_(file);
      rows.push(...parsed.rows);
      skippedFiles.push(...parsed.skippedFiles);
      qualityRows.push(buildZupQualityRow_(group, parsed, unchanged ? 'Не изменился' : 'OK'));
      stateRows.push(buildZupStateRow_(group, parsed, signature, unchanged ? 'Не изменился' : 'OK'));
      if (parsed.read) {
        filesRead++;
      }
    } catch (error) {
      const reason = error && error.message ? error.message : String(error);
      skippedFiles.push([
        file.getName(),
        file.getMimeType(),
        reason,
      ]);
      const parsed = buildFailedZupResult_(file, reason);
      qualityRows.push(buildZupQualityRow_(group, parsed, 'Ошибка'));
      stateRows.push(buildZupStateRow_(group, parsed, signature, 'Ошибка'));
    }
  });

  writeZupQualitySheet_(spreadsheet, qualityRows, normalizedOptions.dryRun);
  if (!normalizedOptions.dryRun) {
    writeZupImportSheet_(spreadsheet, rows, skippedFiles);
    writeZupSummarySheet_(spreadsheet, rows);
    writeZupDiagnosticSheet_(spreadsheet, rows);
    writeZupStateSheet_(spreadsheet, stateRows);
  }

  return {
    rows,
    skippedFiles,
    filesRead,
    qualityRows,
    stateRows,
  };
}

function resolveZupFolderFromSpreadsheet_(spreadsheet) {
  const labelResult = findZupFolderNearSourceLabel_(spreadsheet);
  if (labelResult) {
    return labelResult;
  }

  const anywhereResult = findZupFolderAnywhere_(spreadsheet);
  if (anywhereResult) {
    return anywhereResult;
  }

  const configuredResult = resolveConfiguredZupFolder_();
  if (configuredResult) {
    return configuredResult;
  }

  throw new Error(
    'Не нашел ссылку на папку с исходными данными. Добавьте в таблицу подпись "Исходные данные:" и рядом ссылку на Drive-папку или заполните ZUP_IMPORT_SETTINGS.SOURCE_FOLDER_URL.'
  );
}

function resolveConfiguredZupFolder_() {
  const id = extractDriveFolderId_(ZUP_IMPORT_SETTINGS.SOURCE_FOLDER_URL);
  return id
    ? {
      id,
      source: 'ZUP_IMPORT_SETTINGS.SOURCE_FOLDER_URL',
    }
    : null;
}

function findZupFolderNearSourceLabel_(spreadsheet) {
  const sheets = spreadsheet.getSheets().filter((sheet) => !isZupGeneratedSheet_(sheet.getName()));
  for (const sheet of sheets) {
    const snapshot = readZupSheetSnapshot_(sheet);
    for (let rowIndex = 0; rowIndex < snapshot.values.length; rowIndex++) {
      for (let columnIndex = 0; columnIndex < snapshot.values[rowIndex].length; columnIndex++) {
        if (!normalizeText_(snapshot.values[rowIndex][columnIndex]).includes('исходные данные')) {
          continue;
        }

        const found = findFolderIdNearCell_(snapshot, rowIndex, columnIndex);
        if (found) {
          return {
            id: found.id,
            source: `${sheet.getName()}!${indexToColumnLetter_(found.columnIndex)}${found.rowIndex + 1}`,
          };
        }
      }
    }
  }

  return null;
}

function findZupFolderAnywhere_(spreadsheet) {
  const sheets = spreadsheet.getSheets().filter((sheet) => !isZupGeneratedSheet_(sheet.getName()));
  for (const sheet of sheets) {
    const snapshot = readZupSheetSnapshot_(sheet);
    for (let rowIndex = 0; rowIndex < snapshot.values.length; rowIndex++) {
      for (let columnIndex = 0; columnIndex < snapshot.values[rowIndex].length; columnIndex++) {
        const id = extractDriveFolderId_(
          `${snapshot.values[rowIndex][columnIndex]} ${snapshot.links[rowIndex][columnIndex]}`
        );
        if (id) {
          return {
            id,
            source: `${sheet.getName()}!${indexToColumnLetter_(columnIndex)}${rowIndex + 1}`,
          };
        }
      }
    }
  }

  return null;
}

function findFolderIdNearCell_(snapshot, rowIndex, columnIndex) {
  const maxRow = Math.min(snapshot.values.length - 1, rowIndex + 2);
  const maxColumn = Math.min(snapshot.values[rowIndex].length - 1, columnIndex + 8);
  for (let currentRow = rowIndex; currentRow <= maxRow; currentRow++) {
    for (let currentColumn = columnIndex + 1; currentColumn <= maxColumn; currentColumn++) {
      const id = extractDriveFolderId_(
        `${snapshot.values[currentRow][currentColumn]} ${snapshot.links[currentRow][currentColumn]}`
      );
      if (id) {
        return {
          id,
          rowIndex: currentRow,
          columnIndex: currentColumn,
        };
      }
    }
  }

  return null;
}

function readZupSheetSnapshot_(sheet) {
  const range = sheet.getDataRange();
  const richTextValues = range.getRichTextValues();
  return {
    values: range.getDisplayValues(),
    links: richTextValues.map((row) => row.map((cell) => cell ? cell.getLinkUrl() || '' : '')),
  };
}

function extractDriveFolderId_(value) {
  const text = String(value || '');
  const folderMatch = text.match(/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    return folderMatch[1];
  }

  const idMatch = text.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return idMatch[1];
  }

  const plainId = text.trim().match(/^[a-zA-Z0-9_-]{20,}$/);
  return plainId ? plainId[0] : '';
}

function isZupGeneratedSheet_(sheetName) {
  return isZupReconstructionSheetName_(sheetName) || [
    ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.SUMMARY_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.QUALITY_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME,
  ].includes(sheetName);
}

function isZupReconstructionSheetName_(sheetName) {
  return String(sheetName || '').indexOf(ZUP_IMPORT_SETTINGS.RECONSTRUCTION_PREFIX) === 0;
}

function getZupReconstructionConfigs_() {
  return ZUP_RECONSTRUCTION_SHEETS.map((config) => Object.assign({}, config, {
    clearColumnIndexes: config.clearColumns.map(columnLetterToIndex_),
  }));
}

function moveZupSheetAfter_(spreadsheet, sheet, previousSheet) {
  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(previousSheet.getIndex() + 1);
}

function createSingleZupReconstructionSheet_(spreadsheet, config) {
  const sourceSheet = spreadsheet.getSheetByName(config.sourceSheetName);
  if (!sourceSheet) {
    return {
      created: false,
      reason: `${config.sourceSheetName}: исходная вкладка не найдена`,
    };
  }

  const existingSheet = spreadsheet.getSheetByName(config.targetSheetName);
  if (existingSheet) {
    spreadsheet.deleteSheet(existingSheet);
  }

  const targetSheet = spreadsheet.insertSheet(config.targetSheetName);
  moveZupSheetAfter_(spreadsheet, targetSheet, sourceSheet);
  copyZupReconstructionStructure_(sourceSheet, targetSheet);
  prepareZupReconstructionSheet_(targetSheet, config);
  applyZupReconstructionSheetDimensions_(sourceSheet, targetSheet);
  return {
    created: true,
    sheetName: config.targetSheetName,
  };
}

function copyZupReconstructionStructure_(sourceSheet, targetSheet) {
  const lastRow = Math.max(sourceSheet.getLastRow(), 1);
  const lastColumn = Math.max(sourceSheet.getLastColumn(), 1);
  const sourceRange = sourceSheet.getRange(1, 1, lastRow, lastColumn);
  const targetRange = targetSheet.getRange(1, 1, lastRow, lastColumn);
  sourceRange.copyTo(targetRange, { contentsOnly: false });

  if (targetSheet.setFrozenRows && sourceSheet.getFrozenRows) {
    targetSheet.setFrozenRows(sourceSheet.getFrozenRows());
  }
  if (targetSheet.setFrozenColumns && sourceSheet.getFrozenColumns) {
    targetSheet.setFrozenColumns(sourceSheet.getFrozenColumns());
  }
}

function applyZupReconstructionSheetDimensions_(sourceSheet, targetSheet) {
  const lastColumn = Math.max(sourceSheet.getLastColumn(), 1);
  for (let column = 1; column <= lastColumn; column++) {
    targetSheet.setColumnWidth(column, sourceSheet.getColumnWidth(column));
  }
}

function readZupImportObjects_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, ZUP_IMPORT_HEADERS.length)
    .getValues()
    .filter((row) => row[ZUP_IMPORT_COLUMNS.file])
    .map((row) => ({
      file: row[ZUP_IMPORT_COLUMNS.file],
      sheet: row[ZUP_IMPORT_COLUMNS.sheet],
      employee: row[ZUP_IMPORT_COLUMNS.employee],
      period: normalizeZupImportPeriod_(row[ZUP_IMPORT_COLUMNS.year], row[ZUP_IMPORT_COLUMNS.month], row[ZUP_IMPORT_COLUMNS.period]),
      workDays: parseMoney_(row[ZUP_IMPORT_COLUMNS.workDays]),
      paidDays: parseMoney_(row[ZUP_IMPORT_COLUMNS.paidDays]),
      paymentDate: row[ZUP_IMPORT_COLUMNS.paymentDate] instanceof Date ? row[ZUP_IMPORT_COLUMNS.paymentDate] : parseDateValue_(row[ZUP_IMPORT_COLUMNS.paymentDate]),
      statement: row[ZUP_IMPORT_COLUMNS.paymentStatement],
      statementDate: row[ZUP_IMPORT_COLUMNS.statementDate] instanceof Date ? row[ZUP_IMPORT_COLUMNS.statementDate] : parseDateValue_(row[ZUP_IMPORT_COLUMNS.statementDate]),
      section: row[ZUP_IMPORT_COLUMNS.section],
      category: row[ZUP_IMPORT_COLUMNS.category],
      kind: row[ZUP_IMPORT_COLUMNS.kind],
      accrued: parseMoney_(row[ZUP_IMPORT_COLUMNS.accrued]),
      paid: parseMoney_(row[ZUP_IMPORT_COLUMNS.paid]),
      withheld: parseMoney_(row[ZUP_IMPORT_COLUMNS.withheld]),
      sourceRow: row[ZUP_IMPORT_COLUMNS.sourceRow],
    }))
    .filter((row) => row.period);
}

function normalizeZupImportPeriod_(yearValue, monthValue, periodValue) {
  const year = Number(yearValue);
  const month = Number(monthValue);
  if (year && month >= 1 && month <= 12) {
    return { year, month };
  }
  return parseMonthYear_(periodValue);
}

function buildZupReconstructionModel_(rows) {
  return {
    salary: buildZupSalaryModel_(rows),
    monthlyPremiums: buildZupPremiumModel_(rows, 'Ежемесячные премии'),
    quarterlyPremiums: buildZupPremiumModel_(rows, 'Ежеквартальные премии'),
    annualPremiums: buildZupPremiumModel_(rows, 'Ежегодные премии'),
    vacations: buildZupVacationModel_(rows),
  };
}

function buildZupSalaryModel_(rows) {
  const map = {};
  rows
    .filter((row) => row.section === 'Начислено' && row.category === 'Оклад' && row.accrued !== null)
    .forEach((row) => {
      const key = buildZupPeriodKey_(row.period);
      if (!map[key]) {
        map[key] = {
          period: row.period,
          workDays: 0,
          paidDays: 0,
          hasWorkDays: false,
          hasPaidDays: false,
          amount: 0,
        };
      }
      if (row.workDays !== null) {
        map[key].workDays += row.workDays;
        map[key].hasWorkDays = true;
      }
      if (row.paidDays !== null) {
        map[key].paidDays += row.paidDays;
        map[key].hasPaidDays = true;
      }
      map[key].amount += row.accrued || 0;
    });
  return sortZupModelItems_(Object.keys(map).map((key) => map[key]));
}

function buildZupPremiumModel_(rows, category) {
  const map = {};
  rows
    .filter((row) => row.category === category && (row.accrued !== null || row.paid !== null))
    .forEach((row) => {
      const premiumPeriod = detectZupPremiumPeriod_(row, category);
      const key = buildZupPremiumKey_(premiumPeriod, row.period);
      if (!map[key]) {
        map[key] = {
          premiumPeriod,
          paymentPeriod: row.period,
          accrued: 0,
          paid: 0,
        };
      }
      map[key].accrued += row.accrued || 0;
      map[key].paid += row.paid || 0;
    });
  return sortZupPremiumItems_(Object.keys(map).map((key) => map[key]));
}

function buildZupVacationModel_(rows) {
  return rows
    .filter((row) => row.category === 'Отпуска' && (row.accrued !== null || row.paid !== null))
    .map((row) => ({
      paymentDate: row.statementDate || row.paymentDate || zupPeriodToDate_(row.period),
      eventDate: row.paymentDate || row.statementDate || zupPeriodToDate_(row.period),
      days: extractZupDaysFromText_(`${row.kind} ${row.sourceRow}`),
      amount: row.accrued !== null ? row.accrued : row.paid,
      period: row.period,
      kind: row.kind,
    }))
    .sort((left, right) => Number(left.paymentDate) - Number(right.paymentDate));
}

function fillZupSalaryReconstruction_(spreadsheet, items) {
  const sheet = spreadsheet.getSheetByName('Из_1С_Оклад');
  if (!sheet) {
    throw new Error('Не найдена вкладка Из_1С_Оклад.');
  }
  const scaffold = readZupSalaryScaffold_(spreadsheet);
  const itemMap = buildZupModelMapByPeriod_(items);
  retargetZupReconstructionFormulas_(sheet);
  prepareZupOutputRows_(sheet, 3, scaffold.length, ['A', 'B', 'D', 'E', 'F', 'I', 'K', 'L']);
  writeZupColumn_(sheet, 3, 'A', scaffold.map((row) => {
    const item = itemMap[buildZupPeriodKey_(row.period)];
    return item && item.hasPaidDays ? item.paidDays : '';
  }));
  writeZupColumn_(sheet, 3, 'B', scaffold.map((row) => {
    const item = itemMap[buildZupPeriodKey_(row.period)];
    return item && item.hasWorkDays ? item.workDays : '';
  }));
  writeZupColumn_(sheet, 3, 'D', scaffold.map((row) => row.period.year));
  writeZupColumn_(sheet, 3, 'E', scaffold.map((row) => formatZupMonthName_(row.period.month)));
  writeZupColumn_(sheet, 3, 'I', scaffold.map((row) => {
    const item = itemMap[buildZupPeriodKey_(row.period)];
    return item ? roundMoney_(item.amount) : '';
  }));
  return { sheet: 'Из_1С_Оклад', rows: scaffold.length };
}

function fillZupPremiumReconstruction_(spreadsheet, sheetName, items, type) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Не найдена вкладка ${sheetName}.`);
  }
  const sourceSheetName = sheetName.replace(/^Из_1С_/, '');
  const scaffold = readZupPremiumScaffold_(spreadsheet, sourceSheetName, type);
  const itemMap = buildZupPremiumScaffoldMap_(items, type);
  retargetZupReconstructionFormulas_(sheet);
  prepareZupOutputRows_(sheet, 2, scaffold.length, ['C', 'F', 'H', 'I']);
  writeZupColumn_(sheet, 2, 'C', scaffold.map((row) => row.label));
  writeZupColumn_(sheet, 2, 'F', scaffold.map((row) => {
    const item = itemMap[row.key];
    return item && (item.paid || item.accrued) ? roundMoney_(item.paid || item.accrued) : '';
  }));
  return { sheet: sheetName, rows: scaffold.length };
}

function fillZupVacationReconstruction_(spreadsheet, items) {
  const sheet = spreadsheet.getSheetByName('Из_1С_Отпуска');
  if (!sheet) {
    throw new Error('Не найдена вкладка Из_1С_Отпуска.');
  }
  retargetZupReconstructionFormulas_(sheet);
  prepareZupOutputRows_(sheet, 2, items.length, ['A', 'B', 'D', 'G', 'H', 'K', 'L']);
  writeZupColumn_(sheet, 2, 'A', items.map((item) => item.eventDate || ''));
  writeZupColumn_(sheet, 2, 'D', items.map((item) => numberOrBlank_(item.days)));
  writeZupColumn_(sheet, 2, 'G', items.map((item) => item.paymentDate || ''));
  writeZupColumn_(sheet, 2, 'H', items.map((item) => roundMoney_(item.amount || 0)));
  return { sheet: 'Из_1С_Отпуска', rows: items.length };
}

function prepareZupOutputRows_(sheet, dataStartRow, itemCount, clearColumns) {
  const requiredLastRow = dataStartRow + Math.max(itemCount, 1) - 1;
  ensureZupSheetMaxRows_(sheet, requiredLastRow);
  copyZupTemplateRowsIfNeeded_(sheet, dataStartRow, requiredLastRow);
  const clearRowCount = Math.max(sheet.getLastRow(), requiredLastRow) - dataStartRow + 1;
  clearColumns.forEach((column) => {
    sheet.getRange(dataStartRow, columnLetterToIndex_(column) + 1, clearRowCount, 1).clearContent();
  });
}

function ensureZupSheetMaxRows_(sheet, requiredLastRow) {
  const maxRows = sheet.getMaxRows ? sheet.getMaxRows() : sheet.getLastRow();
  if (maxRows < requiredLastRow) {
    sheet.insertRowsAfter(maxRows, requiredLastRow - maxRows);
  }
}

function copyZupTemplateRowsIfNeeded_(sheet, dataStartRow, requiredLastRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow >= requiredLastRow || lastRow < dataStartRow) {
    return;
  }
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const templateRow = Math.max(dataStartRow, lastRow);
  const templateRange = sheet.getRange(templateRow, 1, 1, lastColumn);
  for (let row = lastRow + 1; row <= requiredLastRow; row++) {
    templateRange.copyTo(sheet.getRange(row, 1, 1, lastColumn), { contentsOnly: false });
  }
}

function writeZupColumn_(sheet, dataStartRow, columnLetter, values) {
  if (!values.length) {
    return;
  }
  sheet
    .getRange(dataStartRow, columnLetterToIndex_(columnLetter) + 1, values.length, 1)
    .setValues(values.map((value) => [value]));
}

function retargetZupReconstructionFormulas_(sheet) {
  const replacements = [
    ['Оклад', 'Из_1С_Оклад'],
    ['Ежемесячные', 'Из_1С_Ежемесячные'],
    ['Ежеквартальные', 'Из_1С_Ежеквартальные'],
    ['Ежегодные', 'Из_1С_Ежегодные'],
    ['Отпуска', 'Из_1С_Отпуска'],
  ];
  const range = sheet.getDataRange();
  const formulas = range.getFormulas();
  formulas.forEach((row, rowIndex) => {
    row.forEach((formula, columnIndex) => {
      if (!formula) {
        return;
      }
      const updated = replacements.reduce((current, replacement) => {
        return current.replace(new RegExp(`'${replacement[0]}'!`, 'g'), `'${replacement[1]}'!`);
      }, formula);
      if (updated !== formula) {
        range.getCell(rowIndex + 1, columnIndex + 1).setFormula(updated);
      }
    });
  });
}

function readZupSalaryScaffold_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Оклад');
  if (!sheet || sheet.getLastRow() < 3) {
    return [];
  }
  return sheet
    .getRange(3, 1, sheet.getLastRow() - 2, Math.max(sheet.getLastColumn(), 5))
    .getValues()
    .map((row) => normalizeZupScaffoldPeriod_(row[3], row[4], `${row[4]} ${row[3]}`))
    .filter(Boolean)
    .map((period) => ({ period }));
}

function readZupPremiumScaffold_(spreadsheet, sourceSheetName, type) {
  const sheet = spreadsheet.getSheetByName(sourceSheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 3))
    .getValues()
    .map((row) => buildZupPremiumScaffoldRow_(row[2], type))
    .filter(Boolean);
}

function buildZupPremiumScaffoldRow_(label, type) {
  if (!label) {
    return null;
  }
  const text = String(label).trim();
  if (!text || /^итого|^всего/i.test(normalizeText_(text))) {
    return null;
  }

  if (type === 'quarterly') {
    const quarter = parseZupQuarterLabel_(text);
    return quarter ? {
      label: text,
      key: buildZupQuarterKey_(quarter.year, quarter.quarter),
    } : null;
  }

  if (type === 'annual') {
    const year = detectZupYearFromText_(text);
    return year ? {
      label: text,
      key: buildZupAnnualKey_(year),
    } : null;
  }

  const period = parseMonthYear_(text);
  return period ? {
    label: text,
    key: buildZupPeriodKey_(period),
  } : null;
}

function buildZupModelMapByPeriod_(items) {
  return items.reduce((map, item) => {
    map[buildZupPeriodKey_(item.period)] = item;
    return map;
  }, {});
}

function buildZupPremiumScaffoldMap_(items, type) {
  return items.reduce((map, item) => {
    const key = buildZupPremiumScaffoldKey_(item, type);
    if (!key) {
      return map;
    }
    if (!map[key]) {
      map[key] = {
        paid: 0,
        accrued: 0,
      };
    }
    map[key].paid += item.paid || 0;
    map[key].accrued += item.accrued || 0;
    return map;
  }, {});
}

function buildZupPremiumScaffoldKey_(item, type) {
  if (type === 'quarterly') {
    if (!item.premiumPeriod.quarter) {
      return '';
    }
    return buildZupQuarterKey_(item.premiumPeriod.year || item.paymentPeriod.year, item.premiumPeriod.quarter);
  }
  if (type === 'annual') {
    return buildZupAnnualKey_(item.premiumPeriod.year || item.paymentPeriod.year);
  }
  return buildZupPeriodKey_(item.paymentPeriod);
}

function normalizeZupScaffoldPeriod_(yearValue, monthValue, fallbackValue) {
  const year = Number(yearValue);
  const month = parseZupMonthValue_(monthValue);
  if (year && month) {
    return { year, month };
  }
  return parseMonthYear_(fallbackValue);
}

function parseZupMonthValue_(value) {
  if (typeof value === 'number') {
    return value >= 1 && value <= 12 ? value : null;
  }
  const text = normalizeText_(value).replace(/\./g, '');
  return MONTHS[text] || null;
}

function parseZupQuarterLabel_(value) {
  const match = normalizeText_(value).match(/([1-4])\s*квартал\s*(20\d{2})/);
  if (!match) {
    return null;
  }
  return {
    quarter: Number(match[1]),
    year: Number(match[2]),
  };
}

function buildZupQuarterKey_(year, quarter) {
  return `${year}-Q${quarter}`;
}

function buildZupAnnualKey_(year) {
  return `${year}`;
}

function detectZupPremiumPeriod_(row, category) {
  if (category === 'Ежеквартальные премии') {
    const quarter = detectZupQuarterFromText_(`${row.kind} ${row.sourceRow}`);
    if (quarter) {
      quarter.year = quarter.year || row.period.year;
      return quarter;
    }
  }
  if (category === 'Ежегодные премии') {
    const year = detectZupYearFromText_(`${row.kind} ${row.sourceRow}`) || row.period.year;
    return { year, month: 12, type: 'annual' };
  }
  return row.period;
}

function detectZupQuarterFromText_(value) {
  const text = String(value || '');
  const match = text.match(/(\d{1,2})[.](\d{1,2})\s*[-–]\s*(\d{1,2})[.](\d{1,2})/);
  if (!match) {
    return null;
  }
  const startMonth = Number(match[2]);
  const endMonth = Number(match[4]);
  const quarterByEndMonth = {
    3: 1,
    6: 2,
    9: 3,
    12: 4,
  };
  const quarter = quarterByEndMonth[endMonth];
  if (!quarter) {
    return null;
  }
  return {
    year: detectZupYearFromText_(text) || null,
    month: endMonth,
    quarter,
    startMonth,
    endMonth,
  };
}

function detectZupYearFromText_(value) {
  const match = String(value || '').match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function extractZupDaysFromText_(value) {
  const matches = String(value || '').match(/(\d{1,2}(?:[,.]\d{1,2})?)\s*дн\./gi) || [];
  if (!matches.length) {
    return '';
  }
  const raw = matches[matches.length - 1].match(/\d{1,2}(?:[,.]\d{1,2})?/)[0];
  return Number(raw.replace(',', '.'));
}

function formatZupPremiumPeriodLabel_(item, type) {
  if (type === 'quarterly' && item.premiumPeriod.quarter) {
    const year = item.premiumPeriod.year || item.paymentPeriod.year;
    return `${item.premiumPeriod.quarter} квартал ${year} (${formatZupMonthName_(item.premiumPeriod.startMonth)} - ${formatZupMonthName_(item.premiumPeriod.endMonth)})\n${formatZupMonthName_(item.paymentPeriod.month)} ${item.paymentPeriod.year}`;
  }
  if (type === 'annual') {
    return `${item.premiumPeriod.year} год\n${formatZupMonthName_(item.paymentPeriod.month)} ${item.paymentPeriod.year}`;
  }
  return `${capitalizeFirst_(formatZupMonthName_(item.paymentPeriod.month))} ${item.paymentPeriod.year}`;
}

function formatZupMonthName_(month) {
  return [
    '',
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ][Number(month)] || '';
}

function capitalizeFirst_(value) {
  const text = String(value || '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function buildZupPeriodKey_(period) {
  return `${period.year}-${pad2_(period.month)}`;
}

function buildZupPremiumKey_(premiumPeriod, paymentPeriod) {
  return [
    premiumPeriod.year || paymentPeriod.year,
    premiumPeriod.quarter || premiumPeriod.month,
    paymentPeriod.year,
    paymentPeriod.month,
  ].join('|');
}

function sortZupModelItems_(items) {
  return items.sort((left, right) =>
    left.period.year - right.period.year || left.period.month - right.period.month
  );
}

function sortZupPremiumItems_(items) {
  return items.sort((left, right) =>
    (left.paymentPeriod.year - right.paymentPeriod.year) ||
    (left.paymentPeriod.month - right.paymentPeriod.month) ||
    ((left.premiumPeriod.quarter || left.premiumPeriod.month || 0) - (right.premiumPeriod.quarter || right.premiumPeriod.month || 0))
  );
}

function zupPeriodToDate_(period) {
  return new Date(period.year, period.month - 1, 1);
}

function numberOrBlank_(value) {
  return value || value === 0 ? value : '';
}

function prepareZupReconstructionSheet_(sheet, config) {
  const lastRow = sheet.getLastRow();
  if (lastRow >= config.dataStartRow) {
    const rowCount = lastRow - config.dataStartRow + 1;
    config.clearColumnIndexes.forEach((columnIndex) => {
      sheet.getRange(config.dataStartRow, columnIndex + 1, rowCount, 1).clearContent();
    });
  }

  config.clearColumnIndexes.forEach((columnIndex) => {
    sheet.getRange(Math.max(1, config.dataStartRow - 1), columnIndex + 1).setNote(
      'Очищено для реконструкции из расчетных листков 1С.'
    );
  });

  sheet.getRange(1, 1).setNote(
    `Вкладка создана из "${config.sourceSheetName}" для восстановления структуры по расчетным листкам 1С.`
  );
  if (sheet.setTabColor) {
    sheet.setTabColor('#d9ead3');
  }
}

function listZupFilesRecursively_(folder) {
  const files = [];
  const fileIterator = folder.getFiles();
  while (fileIterator.hasNext()) {
    files.push(fileIterator.next());
  }

  const folderIterator = folder.getFolders();
  while (folderIterator.hasNext()) {
    files.push(...listZupFilesRecursively_(folderIterator.next()));
  }

  return files;
}

function selectZupImportFiles_(files) {
  return selectZupImportFileGroups_(files).map((group) => group.selected);
}

function selectZupImportFileGroups_(files) {
  const groups = {};
  files.forEach((file) => {
    const key = normalizeZupSourceFileKey_(file.getName());
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
  });

  return Object.keys(groups)
    .sort()
    .map((key) => ({
      key,
      files: groups[key].slice().sort(compareZupFilePreference_),
      selected: chooseZupImportFile_(groups[key]),
      variants: groups[key].map(formatZupFileVariant_).sort(),
    }));
}

function normalizeZupSourceFileKey_(fileName) {
  return normalizeText_(fileName)
    .replace(/\.(html?|pdf|xlsx?|csv)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function chooseZupImportFile_(files) {
  const preferredMimeTypes = [
    ZUP_IMPORT_SETTINGS.GOOGLE_DOCS_MIME,
    ZUP_IMPORT_SETTINGS.HTML_MIME,
    ZUP_IMPORT_SETTINGS.GOOGLE_SHEETS_MIME,
    ZUP_IMPORT_SETTINGS.CSV_MIME,
    ZUP_IMPORT_SETTINGS.PDF_MIME,
  ];

  for (const mimeType of preferredMimeTypes) {
    const found = files.find((file) => file.getMimeType() === mimeType);
    if (found) {
      return found;
    }
  }

  const htmlByName = files.find((file) => /\.html?$/i.test(file.getName()));
  return htmlByName || files[0];
}

function compareZupFilePreference_(left, right) {
  const leftScore = getZupFilePreferenceScore_(left);
  const rightScore = getZupFilePreferenceScore_(right);
  if (leftScore !== rightScore) {
    return leftScore - rightScore;
  }
  return String(left.getName()).localeCompare(String(right.getName()));
}

function getZupFilePreferenceScore_(file) {
  const mimeType = file.getMimeType();
  const scores = {};
  scores[ZUP_IMPORT_SETTINGS.GOOGLE_DOCS_MIME] = 1;
  scores[ZUP_IMPORT_SETTINGS.HTML_MIME] = 2;
  scores[ZUP_IMPORT_SETTINGS.GOOGLE_SHEETS_MIME] = 3;
  scores[ZUP_IMPORT_SETTINGS.CSV_MIME] = 4;
  scores[ZUP_IMPORT_SETTINGS.PDF_MIME] = 5;
  return scores[mimeType] || (/\.html?$/i.test(file.getName()) ? 2 : 99);
}

function formatZupFileVariant_(file) {
  return `${file.getName()} [${file.getMimeType()}]`;
}

function parseZupFile_(file) {
  const mimeType = file.getMimeType();
  if (mimeType === ZUP_IMPORT_SETTINGS.GOOGLE_SHEETS_MIME) {
    return buildParsedZupResult_(file, parseZupSpreadsheet_(file.getId(), file.getName()));
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.GOOGLE_DOCS_MIME) {
    return buildParsedZupResult_(file, parseZupGoogleDoc_(file.getId(), file.getName()));
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.CSV_MIME || /\.csv$/i.test(file.getName())) {
    const text = file.getBlob().getDataAsString('windows-1251');
    const grid = Utilities.parseCsv(text, detectCsvDelimiter_(text));
    return buildParsedZupResult_(file, parseZupGrid_(grid, file.getName(), 'CSV'));
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.HTML_MIME || /\.html?$/i.test(file.getName())) {
    const html = file.getBlob().getDataAsString('UTF-8');
    return buildParsedZupResult_(file, parseZupGrid_(htmlToZupGrid_(html), file.getName(), 'HTML'));
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.PDF_MIME || /\.pdf$/i.test(file.getName())) {
    return buildParsedZupResult_(file, parseZupPdfWithOcr_(file));
  }

  if (
    mimeType === ZUP_IMPORT_SETTINGS.XLSX_MIME ||
    mimeType === ZUP_IMPORT_SETTINGS.XLS_MIME ||
    /\.(xlsx|xls)$/i.test(file.getName())
  ) {
    return {
      read: false,
      rows: [],
      skippedFiles: [[file.getName(), mimeType, 'Excel-файл нужно предварительно открыть/сохранить как Google Sheets или CSV.']],
    };
  }

  return {
    read: false,
    rows: [],
    skippedFiles: [[file.getName(), mimeType, 'Формат не поддержан импортером. Для PDF нужен OCR или дубль в Google Docs/HTML.']],
    quality: buildEmptyZupQualityData_(),
  };
}

function buildParsedZupResult_(file, parsed) {
  const normalized = normalizeParsedZupData_(parsed);
  const quality = buildZupParsedQuality_(normalized);
  return {
    read: true,
    rows: normalized.rows,
    skippedFiles: normalized.rows.length
      ? []
      : [[
        file.getName(),
        file.getMimeType(),
        'Файл прочитан, но строки начислений/выплат не распознаны. Проверьте структуру расчетного листка или пришлите пример текста.',
      ]],
    quality,
  };
}

function parseZupSpreadsheet_(spreadsheetId, sourceFileName) {
  const sourceSpreadsheet = SpreadsheetApp.openById(spreadsheetId);
  return combineParsedZupData_(sourceSpreadsheet.getSheets().map((sheet) => {
    const values = sheet.getDataRange().getDisplayValues();
    return parseZupGrid_(values, sourceFileName, sheet.getName());
  }));
}

function parseZupGoogleDoc_(documentId, sourceFileName) {
  const exportedRows = parseZupGoogleDocHtmlExport_(documentId, sourceFileName);
  if (exportedRows && exportedRows.rows.length) {
    return exportedRows;
  }

  const body = DocumentApp.openById(documentId).getBody();
  const grids = [];
  collectZupBodyTables_(body, grids);

  const parsedTables = combineParsedZupData_(grids.map((grid, index) =>
    parseZupGrid_(grid, sourceFileName, `Google Docs table ${index + 1}`)
  ));

  if (parsedTables.rows.length) {
    return parsedTables;
  }

  return parseZupPlainText_(body.getText(), sourceFileName, 'Google Docs text');
}

function parseZupGoogleDocHtmlExport_(documentId, sourceFileName) {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(documentId)}/export?mimeType=text/html`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    return null;
  }

  return parseZupGrid_(
    htmlToZupGrid_(response.getContentText('UTF-8')),
    sourceFileName,
    'Google Docs HTML export'
  );
}

function parseZupPdfWithOcr_(file) {
  if (typeof Drive === 'undefined' || !Drive.Files || !Drive.Files.copy) {
    return {
      rows: [],
      totals: buildEmptyZupTotals_(),
      warnings: ['PDF требует OCR. Включите Advanced Drive service в Apps Script и scope drive.'],
    };
  }

  const resource = {
    title: `${file.getName()} OCR`,
    mimeType: ZUP_IMPORT_SETTINGS.GOOGLE_DOCS_MIME,
  };
  const copied = Drive.Files.copy(resource, file.getId(), {
    convert: true,
    ocr: true,
    ocrLanguage: 'ru',
  });

  try {
    const parsed = parseZupGoogleDoc_(copied.id, file.getName());
    parsed.warnings = (parsed.warnings || []).concat(['PDF прочитан через временный OCR-документ.']);
    return parsed;
  } finally {
    try {
      DriveApp.getFileById(copied.id).setTrashed(true);
    } catch (error) {
      // Если удаление временного OCR-документа не удалось, импорт не должен падать.
    }
  }
}

function collectZupBodyTables_(element, grids) {
  const type = element.getType();
  if (type === DocumentApp.ElementType.TABLE) {
    grids.push(extractZupTableGrid_(element.asTable()));
    return;
  }

  if (typeof element.getNumChildren !== 'function') {
    return;
  }

  for (let index = 0; index < element.getNumChildren(); index++) {
    collectZupBodyTables_(element.getChild(index), grids);
  }
}

function extractZupTableGrid_(table) {
  const grid = [];
  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
    const row = table.getRow(rowIndex);
    const values = [];
    for (let cellIndex = 0; cellIndex < row.getNumCells(); cellIndex++) {
      values.push(row.getCell(cellIndex).getText().replace(/\s+/g, ' ').trim());
    }
    grid.push(values);
  }
  return grid;
}

function parseZupPlainText_(text, sourceFileName, sourceSheetName) {
  const grid = String(text || '')
    .split(/\r?\n/)
    .map((line) => splitZupTextLine_(line))
    .filter((row) => row.some((cell) => String(cell).trim()));
  return parseZupGrid_(grid, sourceFileName, sourceSheetName);
}

function htmlToZupGrid_(html) {
  const tableRows = extractZupHtmlTableRows_(html);
  if (tableRows.length) {
    return tableRows;
  }

  return htmlToZupPlainTextGrid_(html);
}

function extractZupHtmlTableRows_(html) {
  const rows = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(String(html || ''))) !== null) {
    const row = [];
    const cellRegex = /<t[dh]\b([^>]*)>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      const text = cleanZupHtmlCell_(cellMatch[2]);
      const colspan = extractZupHtmlSpan_(cellMatch[1], 'colspan');
      row.push(text);
      for (let index = 1; index < colspan; index++) {
        row.push('');
      }
    }
    if (row.some((cell) => String(cell).trim())) {
      rows.push(row);
    }
  }
  return rows;
}

function extractZupHtmlSpan_(attributes, name) {
  const match = String(attributes || '').match(new RegExp(`${name}=["']?(\\d+)`, 'i'));
  const value = match ? Number(match[1]) : 1;
  return value > 0 && value < 200 ? value : 1;
}

function cleanZupHtmlCell_(html) {
  return decodeHtmlEntities_(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function htmlToZupPlainTextGrid_(html) {
  const text = decodeHtmlEntities_(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\/t[dh]>/gi, '\t')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  );

  return text
    .split(/\r?\n/)
    .map((line) => splitZupTextLine_(line))
    .filter((row) => row.some((cell) => String(cell).trim()));
}

function splitZupTextLine_(line) {
  const normalized = String(line || '').replace(/\u00a0/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const parts = normalized.indexOf('\t') >= 0
    ? normalized.split(/\t+/)
    : normalized.split(/\s{2,}/);

  return parts
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function decodeHtmlEntities_(value) {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return String(value || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (named[normalized]) {
      return named[normalized];
    }

    if (normalized[0] === '#') {
      const radix = normalized[1] === 'x' ? 16 : 10;
      const number = parseInt(normalized[1] === 'x' ? normalized.slice(2) : normalized.slice(1), radix);
      return Number.isNaN(number) ? match : String.fromCharCode(number);
    }

    return match;
  });
}

function parseZupGrid_(values, sourceFileName, sourceSheetName) {
  const rows = extractZupRowsFromGrid_(values, sourceFileName, sourceSheetName);
  return {
    rows,
    totals: extractZupSectionTotalsFromGrid_(values),
    employee: extractZupEmployee_(values) || '',
    period: extractZupPeriod_(values, sourceFileName),
    warnings: [],
  };
}

function normalizeParsedZupData_(parsed) {
  if (Array.isArray(parsed)) {
    return {
      rows: parsed,
      totals: buildEmptyZupTotals_(),
      employee: parsed.length ? parsed[0][ZUP_IMPORT_COLUMNS.employee] : '',
      period: parsed.length ? parseMonthYear_(parsed[0][ZUP_IMPORT_COLUMNS.period]) : null,
      warnings: [],
    };
  }

  const data = parsed || {};
  return {
    rows: data.rows || [],
    totals: data.totals || buildEmptyZupTotals_(),
    employee: data.employee || (data.rows && data.rows.length ? data.rows[0][ZUP_IMPORT_COLUMNS.employee] : ''),
    period: data.period || (data.rows && data.rows.length ? parseMonthYear_(data.rows[0][ZUP_IMPORT_COLUMNS.period]) : null),
    warnings: data.warnings || [],
  };
}

function combineParsedZupData_(items) {
  const combined = {
    rows: [],
    totals: buildEmptyZupTotals_(),
    employee: '',
    period: null,
    warnings: [],
  };

  items.forEach((item) => {
    const normalized = normalizeParsedZupData_(item);
    combined.rows.push(...normalized.rows);
    combined.totals.accrued += normalized.totals.accrued || 0;
    combined.totals.withheld += normalized.totals.withheld || 0;
    combined.totals.paid += normalized.totals.paid || 0;
    combined.employee = combined.employee || normalized.employee;
    combined.period = combined.period || normalized.period;
    combined.warnings.push(...normalized.warnings);
  });

  return combined;
}

function buildEmptyZupTotals_() {
  return {
    accrued: 0,
    withheld: 0,
    paid: 0,
  };
}

function buildEmptyZupQualityData_() {
  return {
    employee: '',
    period: '',
    sourceTotals: buildEmptyZupTotals_(),
    recognizedTotals: buildEmptyZupTotals_(),
    warnings: [],
  };
}

function buildZupParsedQuality_(parsed) {
  const quality = buildEmptyZupQualityData_();
  quality.employee = parsed.employee || '';
  quality.period = parsed.period ? formatZupPeriod_(parsed.period) : '';
  quality.sourceTotals = parsed.totals || buildEmptyZupTotals_();
  quality.recognizedTotals = sumZupRowsByAmountColumns_(parsed.rows || []);
  quality.warnings = (parsed.warnings || []).slice();
  quality.warnings.push(...buildZupTotalWarnings_(quality.sourceTotals, quality.recognizedTotals));
  return quality;
}

function extractZupSectionTotalsFromGrid_(values) {
  const totals = buildEmptyZupTotals_();
  (values || []).forEach((rawRow) => {
    const row = rawRow.map((cell) => String(cell || '').replace(/\s+/g, ' ').trim());
    const spans = detectZupSectionSpans_(row);
    if (!spans.length) {
      return;
    }

    splitZupRowBySectionSpans_(row, spans).forEach((segment) => {
      const normalized = normalizeText_(segment.cells.join(' '));
      if (!normalized || normalized.includes('к выплате')) {
        return;
      }

      const section = normalizeText_(segment.section);
      if (!/^(начислено|удержано|выплачено)$/.test(section)) {
        return;
      }

      const amount = extractLastMoneyFromRow_(segment.cells);
      if (amount === null) {
        return;
      }

      if (section === 'начислено') {
        totals.accrued += amount;
      } else if (section === 'удержано') {
        totals.withheld += amount;
      } else if (section === 'выплачено') {
        totals.paid += amount;
      }
    });
  });
  return totals;
}

function sumZupRowsByAmountColumns_(rows) {
  return rows.reduce((totals, row) => {
    totals.accrued += parseMoney_(row[ZUP_IMPORT_COLUMNS.accrued]) || 0;
    totals.paid += parseMoney_(row[ZUP_IMPORT_COLUMNS.paid]) || 0;
    totals.withheld += parseMoney_(row[ZUP_IMPORT_COLUMNS.withheld]) || 0;
    return totals;
  }, buildEmptyZupTotals_());
}

function buildZupTotalWarnings_(sourceTotals, recognizedTotals) {
  const warnings = [];
  [
    ['accrued', 'Начислено'],
    ['withheld', 'Удержано'],
    ['paid', 'Выплачено'],
  ].forEach(([key, label]) => {
    const source = sourceTotals[key] || 0;
    const recognized = recognizedTotals[key] || 0;
    if (source && Math.abs(source - recognized) > 0.01) {
      warnings.push(`${label}: итог ${roundMoney_(source)}, распознано ${roundMoney_(recognized)}`);
    }
  });
  return warnings;
}

function extractZupRowsFromGrid_(values, sourceFileName, sourceSheetName) {
  const employee = extractZupEmployee_(values) || '';
  const period = extractZupPeriod_(values, sourceFileName);
  const rows = [];
  let section = '';
  let sectionSpans = [];

  values.forEach((rawRow) => {
    const row = rawRow.map((cell) => String(cell || '').replace(/\s+/g, ' ').trim());
    const rowText = normalizeText_(row.join(' '));
    if (!rowText) {
      return;
    }

    const rowSectionSpans = detectZupSectionSpans_(row);
    if (rowSectionSpans.length) {
      sectionSpans = mergeZupSectionSpans_(sectionSpans, rowSectionSpans, row.length);
      section = rowSectionSpans[0].section;
      return;
    }

    const segments = sectionSpans.length
      ? splitZupRowBySectionSpans_(row, sectionSpans)
      : [{ section: section || 'Не определен', cells: row }];

    segments.forEach((segment) => {
      const extracted = extractZupRowSegment_(segment, {
        sourceFileName,
        sourceSheetName,
        employee,
        period,
      });
      if (extracted) {
        rows.push(extracted);
      }
    });
  });

  return rows;
}

function detectZupSectionSpans_(row) {
  const markers = [];
  row.forEach((cell, index) => {
    const section = detectZupSection_(cell);
    if (section) {
      markers.push({ section, start: index });
    }
  });

  return markers.map((marker, index) => ({
    section: marker.section,
    start: marker.start,
    end: index + 1 < markers.length ? markers[index + 1].start : row.length,
  }));
}

function mergeZupSectionSpans_(currentSpans, rowSpans, rowLength) {
  if (
    currentSpans.length &&
    rowSpans.length === 1 &&
    rowSpans[0].start > 0
  ) {
    const preserved = currentSpans
      .filter((span) => span.start < rowSpans[0].start)
      .map((span) => ({
        section: span.section,
        start: span.start,
      }));
    return buildZupSectionSpansFromMarkers_(preserved.concat([{ section: rowSpans[0].section, start: rowSpans[0].start }]), rowLength);
  }

  return rowSpans;
}

function buildZupSectionSpansFromMarkers_(markers, rowLength) {
  return markers
    .sort((left, right) => left.start - right.start)
    .map((marker, index, sorted) => ({
      section: marker.section,
      start: marker.start,
      end: index + 1 < sorted.length ? sorted[index + 1].start : rowLength,
    }));
}

function splitZupRowBySectionSpans_(row, sectionSpans) {
  if (sectionSpans.length === 1) {
    return [{ section: sectionSpans[0].section, cells: row }];
  }

  const hasEnoughCells = row.length >= Math.max(...sectionSpans.map((span) => span.end));
  if (!hasEnoughCells) {
    return [{ section: sectionSpans[0].section, cells: row }];
  }

  return sectionSpans.map((span) => ({
    section: span.section,
    cells: row.slice(span.start, span.end),
  }));
}

function extractZupRowSegment_(segment, context) {
  const rowText = normalizeText_(segment.cells.join(' '));
  if (!rowText || isZupTechnicalRow_(rowText)) {
    return null;
  }

  const category = detectZupCategory_(rowText, segment.section);
  if (!category) {
    return null;
  }

  const amount = extractLastMoneyFromRow_(segment.cells);
  if (amount === null) {
    return null;
  }

  const period = resolveZupRowPeriod_(segment, context);
  const paymentStatement = extractZupPaymentStatement_(segment.cells);
  const paymentDate = paymentStatement.date || extractZupPaymentDateFromCells_(segment.cells);
  const dayColumns = extractZupDayColumns_(segment.cells, segment.section);
  const amountColumns = buildZupAmountColumns_(segment.section, amount);
  return [
    context.sourceFileName,
    context.sourceSheetName,
    context.employee,
    period ? formatZupPeriod_(period) : '',
    period ? period.year : '',
    period ? period.month : '',
    dayColumns.workDays,
    dayColumns.paidDays,
    paymentDate ? formatDate_(paymentDate) : '',
    paymentStatement.statement,
    paymentStatement.date ? formatDate_(paymentStatement.date) : '',
    segment.section || 'Не определен',
    category,
    compactZupRowLabel_(segment.cells),
    amountColumns.accrued,
    amountColumns.paid,
    amountColumns.withheld,
    segment.cells.join(' | '),
  ];
}

function extractZupDayColumns_(cells, section) {
  const result = {
    workDays: '',
    paidDays: '',
  };
  const normalizedSection = normalizeText_(section);
  if (normalizedSection !== 'начислено') {
    return result;
  }

  const compactCells = cells
    .map((cell) => String(cell || '').trim())
    .filter(Boolean);
  const periodIndex = compactCells.findIndex((cell) => parseMonthYear_(cell));
  if (periodIndex < 0) {
    return result;
  }

  const workDays = parseZupDayCount_(compactCells[periodIndex + 1]);
  const paidDays = parseZupDayCount_(compactCells[periodIndex + 3]);
  if (workDays !== null && workDays > 0 && workDays <= 31) {
    result.workDays = workDays;
  }
  if (paidDays !== null && paidDays > 0 && paidDays <= 31) {
    result.paidDays = paidDays;
  }
  return result;
}

function parseZupDayCount_(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return null;
  }

  if (!/^\d{1,2}(?:[,.]\d{1,2})?(?:\s*дн\.)?$/i.test(text)) {
    return null;
  }

  const number = Number(text.replace(/\s*дн\.$/i, '').replace(',', '.'));
  return Number.isNaN(number) ? null : number;
}

function buildZupAmountColumns_(section, amount) {
  const result = {
    accrued: '',
    paid: '',
    withheld: '',
  };
  const normalizedSection = normalizeText_(section);
  if (normalizedSection === 'выплачено') {
    result.paid = amount;
  } else if (normalizedSection === 'удержано') {
    result.withheld = amount;
  } else {
    result.accrued = amount;
  }
  return result;
}

function isZupTechnicalRow_(rowText) {
  return [
    'организация',
    'подразделение',
    'должность',
    'тариф',
    'рабочие дни',
    'рабочие часы',
    'период',
    'сумма',
    'долг предприятия',
    'общий облагаемый доход',
  ].some((marker) => rowText === marker || rowText.indexOf(`${marker}:`) === 0);
}

function detectZupSection_(rowText) {
  const normalizedText = normalizeText_(rowText);
  if (normalizedText.includes('начислен')) {
    return 'Начислено';
  }
  if (normalizedText.includes('удержан')) {
    return 'Удержано';
  }
  if (normalizedText.includes('выплачен') || normalizedText.includes('выплат')) {
    return 'Выплачено';
  }
  return '';
}

function detectZupCategory_(rowText) {
  const normalizedText = normalizeText_(rowText);
  if (/больнич|нетрудоспособности/.test(normalizedText)) {
    return 'Больничные';
  }

  if (normalizedText.includes('прем')) {
    if (/(кварт|0?1[./-]0?1\s*[-–]\s*3?1[./-]0?3|0?1[./-]0?4\s*[-–]\s*30[./-]0?6|0?1[./-]0?7\s*[-–]\s*30[./-]0?9|0?1[./-]10\s*[-–]\s*3?1[./-]12)/.test(normalizedText)) {
      return 'Ежеквартальные премии';
    }
    if (/(ежегод|годов|итогам года|\b20\d{2}\s*год)/.test(normalizedText)) {
      return 'Ежегодные премии';
    }
    return 'Ежемесячные премии';
  }

  if (/(отпуск|отпускные|компенсация отпуска)/.test(normalizedText)) {
    return 'Отпуска';
  }

  const rule = ZUP_CATEGORY_RULES.find((candidate) =>
    candidate.patterns.some((pattern) => normalizedText.includes(normalizeText_(pattern)))
  );
  return rule ? rule.category : '';
}

function extractZupEmployee_(values) {
  for (let rowIndex = 0; rowIndex < Math.min(values.length, 30); rowIndex++) {
    const row = values[rowIndex];
    const joined = row.join(' ').replace(/\s+/g, ' ').trim();
    const inline = joined.match(/(?:сотрудник|фио)\s*:?\s*(.+)$/i);
    if (inline && inline[1]) {
      return inline[1].trim();
    }

    for (let columnIndex = 0; columnIndex < row.length - 1; columnIndex++) {
      if (/^(сотрудник|фио)$/i.test(String(row[columnIndex]).trim())) {
        return String(row[columnIndex + 1]).trim();
      }
    }

    if (
      rowIndex <= 5 &&
      /\([^)]+\)/.test(String(row[0] || '')) &&
      !/организация|расчетный листок|к выплате/i.test(String(row[0] || ''))
    ) {
      return String(row[0]).replace(/\s*\([^)]+\)\s*$/, '').trim();
    }
  }
  return '';
}

function extractZupPeriod_(values, sourceFileName) {
  const fromFileName = parseMonthYear_(sourceFileName);
  if (fromFileName) {
    return fromFileName;
  }

  const lines = values.slice(0, 30).map((row) => row.join(' '));
  for (const line of lines) {
    const period = parseMonthYear_(line);
    if (period) {
      return period;
    }
  }

  return null;
}

function extractZupPeriodFromCells_(cells) {
  for (const cell of cells) {
    const period = parseMonthYear_(cell);
    if (period) {
      return period;
    }
  }
  return parseMonthYear_(cells.join(' '));
}

function resolveZupRowPeriod_(segment, context) {
  if (context.period) {
    return context.period;
  }
  return extractZupPeriodFromCells_(segment.cells);
}

function extractZupPaymentDateFromCells_(cells) {
  const text = cells.join(' ');
  const afterOt = text.match(/\bот\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i);
  if (afterOt) {
    const parsed = parseDateValue_(afterOt[1]);
    if (parsed) {
      return parsed;
    }
  }

  const dates = text.match(/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/g) || [];
  for (let index = dates.length - 1; index >= 0; index--) {
    const parsed = parseDateValue_(dates[index]);
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

function extractZupPaymentStatement_(cells) {
  const text = cells.join(' ');
  const result = {
    statement: '',
    date: null,
  };
  const statementMatch = text.match(/\(([^)]*(?:вед\.?|ведомост)[^)]*)\)/i);
  if (!statementMatch) {
    return result;
  }

  result.statement = statementMatch[1].replace(/\s+/g, ' ').trim();
  const dateMatch = result.statement.match(/(?:^|\s)от\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i);
  if (dateMatch) {
    result.date = parseDateValue_(dateMatch[1]);
  }
  return result;
}

function extractLastMoneyFromRow_(row) {
  const numbers = row
    .map((cell) => parseMoney_(cell))
    .filter((number) => number !== null);
  return numbers.length ? numbers[numbers.length - 1] : null;
}

function compactZupRowLabel_(row) {
  const label = row
    .filter((cell) => String(cell).trim())
    .filter((cell) => parseMoney_(cell) === null)
    .map((cell) => stripZupStatementFromLabel_(cell))
    .filter(Boolean)
    .slice(0, 4)
    .join(' / ')
    .trim();
  return label || row.filter((cell) => String(cell).trim()).slice(0, 1).join('').trim();
}

function stripZupStatementFromLabel_(value) {
  return String(value || '')
    .replace(/\s*\([^)]*(?:вед\.?|ведомост|банк)[^)]*\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCsvDelimiter_(text) {
  const firstLine = String(text).split(/\r?\n/)[0] || '';
  return firstLine.indexOf(';') >= 0 ? ';' : ',';
}

function formatZupPeriod_(period) {
  return `${pad2_(period.month)}.${period.year}`;
}

function writeZupImportSheet_(spreadsheet, rows, skippedFiles) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME);
  const data = [ZUP_IMPORT_HEADERS].concat(rows);
  if (skippedFiles.length) {
    data.push([]);
    data.push(['Пропущенные файлы', 'MIME type', 'Причина']);
    data.push(...skippedFiles);
  }

  writeZupSheetData_(sheet, data);
  if (rows.length) {
    sheet.getRange(2, 7, rows.length, 2).setNumberFormat('0.00');
    sheet.getRange(2, ZUP_IMPORT_COLUMNS.accrued + 1, rows.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
  }
}

function writeZupSummarySheet_(spreadsheet, rows) {
  const summary = buildZupSummary_(rows);
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.SUMMARY_SHEET_NAME);
  const data = [ZUP_SUMMARY_HEADERS].concat(summary);
  writeZupSheetData_(sheet, data);
  if (summary.length) {
    sheet.getRange(2, 8, summary.length, 2).setNumberFormat('0.00');
    sheet.getRange(2, 10, summary.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
  }
}

function buildZupSummary_(rows) {
  const map = {};
  rows.forEach((row) => {
    const key = [
      row[ZUP_IMPORT_COLUMNS.file],
      row[ZUP_IMPORT_COLUMNS.period],
      row[ZUP_IMPORT_COLUMNS.year],
      row[ZUP_IMPORT_COLUMNS.month],
      row[ZUP_IMPORT_COLUMNS.section],
      row[ZUP_IMPORT_COLUMNS.category],
      row[ZUP_IMPORT_COLUMNS.kind],
    ].join('|');
    if (!map[key]) {
      map[key] = {
        file: row[ZUP_IMPORT_COLUMNS.file],
        period: row[ZUP_IMPORT_COLUMNS.period],
        year: row[ZUP_IMPORT_COLUMNS.year],
        month: row[ZUP_IMPORT_COLUMNS.month],
        section: row[ZUP_IMPORT_COLUMNS.section],
        category: row[ZUP_IMPORT_COLUMNS.category],
        kind: row[ZUP_IMPORT_COLUMNS.kind],
        workDays: 0,
        paidDays: 0,
        accrued: 0,
        paid: 0,
        withheld: 0,
        count: 0,
      };
    }

    map[key].workDays += parseMoney_(row[ZUP_IMPORT_COLUMNS.workDays]) || 0;
    map[key].paidDays += parseMoney_(row[ZUP_IMPORT_COLUMNS.paidDays]) || 0;
    map[key].accrued += parseMoney_(row[ZUP_IMPORT_COLUMNS.accrued]) || 0;
    map[key].paid += parseMoney_(row[ZUP_IMPORT_COLUMNS.paid]) || 0;
    map[key].withheld += parseMoney_(row[ZUP_IMPORT_COLUMNS.withheld]) || 0;
    map[key].count++;
  });

  return Object.keys(map)
    .sort()
    .map((key) => {
      const item = map[key];
      return [
        item.file,
        item.period,
        item.year,
        item.month,
        item.section,
        item.category,
        item.kind,
        item.workDays ? roundNumber_(item.workDays, 2) : '',
        item.paidDays ? roundNumber_(item.paidDays, 2) : '',
        roundMoney_(item.accrued),
        roundMoney_(item.paid),
        roundMoney_(item.withheld),
        item.count,
      ];
    });
}

function writeZupQualitySheet_(spreadsheet, qualityRows, dryRun) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.QUALITY_SHEET_NAME);
  writeZupSheetData_(sheet, [ZUP_QUALITY_HEADERS].concat(qualityRows));
  if (dryRun && sheet.getRange) {
    sheet.getRange(1, 1).setNote(`Проверка без перезаписи основных листов. Обновлено: ${new Date()}`);
  }
  if (qualityRows.length) {
    sheet.getRange(2, 9, qualityRows.length, 6).setNumberFormat(SETTINGS.MONEY_FORMAT);
  }
}

function writeZupStateSheet_(spreadsheet, stateRows) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME);
  writeZupSheetData_(sheet, [ZUP_STATE_HEADERS].concat(stateRows));
}

function buildZupQualityRow_(group, parsed, fallbackStatus) {
  const quality = parsed.quality || buildEmptyZupQualityData_();
  const warnings = quality.warnings || [];
  const status = fallbackStatus === 'Не изменился'
    ? fallbackStatus
    : (parsed.read && !warnings.length ? fallbackStatus : (parsed.read ? 'Предупреждение' : fallbackStatus));
  return [
    group.key,
    group.selected.getName(),
    group.selected.getMimeType(),
    group.variants.join('\n'),
    status,
    parsed.rows.length,
    quality.employee,
    quality.period,
    moneyOrBlank_(quality.sourceTotals.accrued),
    moneyOrBlank_(quality.recognizedTotals.accrued),
    moneyOrBlank_(quality.sourceTotals.withheld),
    moneyOrBlank_(quality.recognizedTotals.withheld),
    moneyOrBlank_(quality.sourceTotals.paid),
    moneyOrBlank_(quality.recognizedTotals.paid),
    warnings.join('\n'),
  ];
}

function buildZupStateRow_(group, parsed, signature, status) {
  const file = group.selected;
  return [
    group.key,
    file.getId(),
    file.getName(),
    file.getMimeType(),
    file.getLastUpdated ? file.getLastUpdated() : '',
    getZupFileSize_(file),
    ZUP_IMPORT_SETTINGS.PARSER_VERSION,
    signature,
    parsed.rows.length,
    status,
    new Date(),
  ];
}

function readZupImportState_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {};
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, ZUP_STATE_HEADERS.length).getValues();
  return values.reduce((map, row) => {
    if (row[0]) {
      map[row[0]] = {
        fileId: row[1],
        signature: row[7],
        status: row[9],
      };
    }
    return map;
  }, {});
}

function readExistingZupRowsByFile_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {};
  }

  const values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, ZUP_IMPORT_HEADERS.length)
    .getValues()
    .filter((row) => row[ZUP_IMPORT_COLUMNS.file] && row.length >= ZUP_IMPORT_HEADERS.length);

  return values.reduce((map, row) => {
    const fileName = row[ZUP_IMPORT_COLUMNS.file];
    if (!map[fileName]) {
      map[fileName] = [];
    }
    map[fileName].push(row);
    return map;
  }, {});
}

function buildZupFileSignature_(file) {
  return [
    file.getId(),
    file.getLastUpdated ? Number(file.getLastUpdated()) : '',
    getZupFileSize_(file),
    ZUP_IMPORT_SETTINGS.PARSER_VERSION,
  ].join('|');
}

function getZupFileSize_(file) {
  try {
    return file.getSize ? file.getSize() : '';
  } catch (error) {
    return '';
  }
}

function buildUnchangedZupResult_(file, rows) {
  const normalizedRows = rows || [];
  return {
    read: true,
    rows: normalizedRows,
    skippedFiles: [],
    quality: {
      employee: normalizedRows.length ? normalizedRows[0][ZUP_IMPORT_COLUMNS.employee] : '',
      period: normalizedRows.length ? normalizedRows[0][ZUP_IMPORT_COLUMNS.period] : '',
      sourceTotals: buildEmptyZupTotals_(),
      recognizedTotals: sumZupRowsByAmountColumns_(normalizedRows),
      warnings: ['Файл не изменился; строки взяты из предыдущего импорта.'],
    },
  };
}

function buildFailedZupResult_(file, reason) {
  return {
    read: false,
    rows: [],
    skippedFiles: [[file.getName(), file.getMimeType(), reason]],
    quality: Object.assign(buildEmptyZupQualityData_(), {
      warnings: [reason],
    }),
  };
}

function moneyOrBlank_(value) {
  return value ? roundMoney_(value) : '';
}

function writeZupDiagnosticSheet_(spreadsheet, rows) {
  const diagnostics = buildZupDiagnostics_(spreadsheet, rows);
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  const data = [ZUP_DIAGNOSTIC_HEADERS].concat(diagnostics);
  writeZupSheetData_(sheet, data);
  if (diagnostics.length) {
    sheet.getRange(2, 5, diagnostics.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
  }
}

function buildZupDiagnostics_(spreadsheet, importRows) {
  const index = buildZupImportAccrualIndex_(importRows);
  const diagnostics = [];
  const targets = [
    { layoutId: 'salary', category: 'Оклад' },
    { layoutId: 'monthlyPremiums', category: 'Ежемесячные премии' },
    { layoutId: 'quarterlyPremiums', category: 'Ежеквартальные премии' },
    { layoutId: 'annualPremiums', category: 'Ежегодные премии' },
    { layoutId: 'vacation', category: 'Отпуска', vacationBase: true },
  ];

  targets.forEach((target) => {
    const sheet = spreadsheet
      .getSheets()
      .find((candidate) =>
        !isZupGeneratedSheet_(candidate.getName()) &&
        !isGeneratedSheetName_(candidate.getName()) &&
        getSheetLayout_(candidate.getName()).id === target.layoutId
      );
    if (!sheet) {
      diagnostics.push([
        target.category,
        '',
        target.category,
        '',
        '',
        '',
        '',
        'Нет листа',
        `Не найден рабочий лист для шаблона ${target.layoutId}.`,
      ]);
      return;
    }

    const table = findTable_(sheet);
    const amountColumn = resolveZupDiagnosticAmountColumn_(table, target);
    if (!Number.isInteger(amountColumn)) {
      diagnostics.push([
        sheet.getName(),
        '',
        target.category,
        '',
        '',
        '',
        '',
        'Нет колонки',
        'Не найдена колонка с текущим значением для сверки.',
      ]);
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= table.headerRow) {
      return;
    }

    const values = sheet
      .getRange(table.headerRow + 1, 1, lastRow - table.headerRow, sheet.getLastColumn())
      .getValues();

    values.forEach((row, rowIndex) => {
      const spreadsheetValue = parseMoney_(row[amountColumn]);
      if (spreadsheetValue === null) {
        return;
      }

      const imported = target.vacationBase
        ? getZupImportedVacationBase_(index, row, table)
        : getZupImportedAccrual_(index, target.category, parseRowPeriod_(row, table.columns));

      diagnostics.push(buildZupDiagnosticRow_({
        sheetName: sheet.getName(),
        rowNumber: table.headerRow + 1 + rowIndex,
        category: target.category,
        period: imported.period,
        spreadsheetValue,
        importedValue: imported.amount,
        details: imported.details,
      }));
    });
  });

  return diagnostics;
}

function resolveZupDiagnosticAmountColumn_(table, target) {
  if (
    target.layoutId === 'salary' &&
    Number.isInteger(table.columns.unpaidSalary) &&
    table.columns.unpaidSalary > 0
  ) {
    return table.columns.unpaidSalary - 1;
  }

  if (
    target.layoutId !== 'salary' &&
    Number.isInteger(table.columns.underpayment) &&
    table.columns.underpayment > 0
  ) {
    return table.columns.underpayment - 1;
  }

  if (Number.isInteger(table.columns.correctAmount)) {
    return table.columns.correctAmount;
  }
  if (Number.isInteger(table.columns.correctAnnualSalary)) {
    return table.columns.correctAnnualSalary;
  }
  return null;
}

function buildZupImportAccrualIndex_(rows) {
  const index = {};
  rows.forEach((row) => {
    const year = Number(row[ZUP_IMPORT_COLUMNS.year]);
    const month = Number(row[ZUP_IMPORT_COLUMNS.month]);
    const amount = parseMoney_(row[ZUP_IMPORT_COLUMNS.accrued]);
    if (!year || !month || amount === null) {
      return;
    }

    const key = buildZupImportAccrualKey_(row[ZUP_IMPORT_COLUMNS.category], { year, month });
    if (!index[key]) {
      index[key] = {
        amount: 0,
        files: {},
      };
    }
    index[key].amount += amount;
    index[key].files[row[ZUP_IMPORT_COLUMNS.file]] = true;
  });
  return index;
}

function getZupImportedAccrual_(index, category, period) {
  if (!period) {
    return {
      amount: null,
      period: '',
      details: 'Не удалось определить период строки рабочего листа.',
    };
  }

  const item = index[buildZupImportAccrualKey_(category, period)];
  return {
    amount: item ? roundMoney_(item.amount) : null,
    period: formatZupPeriod_(period),
    details: item
      ? `Источники: ${Object.keys(item.files).join(', ')}`
      : 'Нет импортированных начислений за этот период и категорию.',
  };
}

function getZupImportedVacationBase_(index, row, table) {
  const vacationEvent = getVacationEventDate_(row, table);
  if (!vacationEvent) {
    return {
      amount: null,
      period: '',
      details: 'Не удалось определить дату события отпуска.',
    };
  }

  const endDate = new Date(vacationEvent.date.getFullYear(), vacationEvent.date.getMonth(), 1);
  const startDate = addMonths_(endDate, -12);
  const categories = [
    'Оклад',
    'Ежемесячные премии',
    'Ежеквартальные премии',
    'Ежегодные премии',
  ];
  let total = 0;
  const files = {};
  for (let cursor = new Date(startDate); cursor < endDate; cursor = addMonths_(cursor, 1)) {
    const period = {
      year: cursor.getFullYear(),
      month: cursor.getMonth() + 1,
    };
    categories.forEach((category) => {
      const item = index[buildZupImportAccrualKey_(category, period)];
      if (!item) {
        return;
      }
      total += item.amount;
      Object.keys(item.files).forEach((fileName) => {
        files[fileName] = true;
      });
    });
  }

  return {
    amount: Object.keys(files).length ? roundMoney_(total) : null,
    period: `${formatZupPeriod_({ year: startDate.getFullYear(), month: startDate.getMonth() + 1 })}-${formatZupPeriod_({ year: addMonths_(endDate, -1).getFullYear(), month: addMonths_(endDate, -1).getMonth() + 1 })}`,
    details: Object.keys(files).length
      ? `Реконструкция отпускной базы по импортированным начислениям за 12 месяцев. Источники: ${Object.keys(files).join(', ')}`
      : 'Нет импортированных начислений для 12 месяцев перед отпуском.',
  };
}

function buildZupImportAccrualKey_(category, period) {
  return [category, period.year, period.month].join('|');
}

function buildZupDiagnosticRow_(params) {
  const difference = params.importedValue === null
    ? ''
    : roundMoney_(params.spreadsheetValue - params.importedValue);
  let status = 'Не сходится';
  if (params.importedValue === null) {
    status = 'Нет данных импорта';
  } else if (Math.abs(difference) <= 0.01) {
    status = 'Сходится';
  }

  return [
    params.sheetName,
    params.rowNumber,
    params.category,
    params.period,
    params.spreadsheetValue,
    params.importedValue === null ? '' : params.importedValue,
    difference,
    status,
    params.details,
  ];
}

function writeZupSheetData_(sheet, data) {
  sheet.clear();
  sheet.getRange(1, 1, data.length, Math.max(...data.map((row) => row.length))).setValues(
    rectangularizeRows_(data)
  );
  sheet.getRange(1, 1, 1, data[0].length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  for (let column = 1; column <= data[0].length; column++) {
    sheet.autoResizeColumn(column);
  }
}

function rectangularizeRows_(rows) {
  const width = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => {
    const result = row.slice();
    while (result.length < width) {
      result.push('');
    }
    return result;
  });
}

function getOrCreateZupSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}
