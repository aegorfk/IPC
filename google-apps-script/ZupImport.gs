const ZUP_IMPORT_SETTINGS = {
  PARSER_VERSION: 'zup-import-v15-source-isolation-headers',
  SOURCE_FOLDER_URL: 'https://drive.google.com/drive/folders/1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm?usp=sharing',
  RECONSTRUCTION_PREFIX: 'Из_1С_',
  IMPORT_SHEET_NAME: 'Импорт_1С_ЗУП',
  SUMMARY_SHEET_NAME: 'Импорт_1С_Свод',
  DIAGNOSTIC_SHEET_NAME: 'Импорт_1С_Диагностика',
  QUALITY_SHEET_NAME: 'Импорт_1С_Качество',
  QG_SHEET_NAME: 'Импорт_1С_QG',
  STATE_SHEET_NAME: 'Импорт_1С_Состояние',
  VLM_LOG_SHEET_NAME: 'Импорт_1С_VLM',
  PAYMENT_STRUCTURE_SHEET_NAME: 'Импорт_1С_СтруктураВыплат',
  GOOGLE_SHEETS_MIME: 'application/vnd.google-apps.spreadsheet',
  GOOGLE_DOCS_MIME: 'application/vnd.google-apps.document',
  PDF_MIME: 'application/pdf',
  XLSX_MIME: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS_MIME: 'application/vnd.ms-excel',
  CSV_MIME: 'text/csv',
  HTML_MIME: 'text/html',
  ENABLE_VLM_FALLBACK: true,
  POLZA_API_KEY_PROPERTY: 'POLZA_API_KEY',
  VLM_MODEL_PROPERTY: 'ZUP_VLM_MODEL',
  VLM_FORCE_PATTERN_PROPERTY: 'ZUP_VLM_FORCE_PATTERN',
  LANGFUSE_ENABLED_PROPERTY: 'ZUP_LANGFUSE_ENABLED',
  LANGFUSE_BASE_URL_PROPERTY: 'LANGFUSE_BASE_URL',
  LANGFUSE_PUBLIC_KEY_PROPERTY: 'LANGFUSE_PUBLIC_KEY',
  LANGFUSE_SECRET_KEY_PROPERTY: 'LANGFUSE_SECRET_KEY',
  POLZA_ENDPOINT: 'https://polza.ai/api/v1/chat/completions',
  VLM_DEFAULT_MODEL: 'google/gemini-3.1-flash-lite',
  VLM_STRONG_MODEL: 'google/gemini-3.5-flash',
  VLM_FORCE_MODEL: 'google/gemini-3.5-flash',
  VLM_FORCE_PATTERN: '',
  VLM_RETRY_ON_TOTAL_MISMATCH: true,
  VLM_MAX_FILE_BYTES: 8 * 1024 * 1024,
  VLM_MAX_TEXT_CHARS: 160000,
  BATCH_STATE_PROPERTY: 'ZUP_IMPORT_BATCH_STATE',
  BATCH_TRIGGER_FUNCTION: 'resumeZupFolderImport_',
  BATCH_TRIGGER_DELAY_MS: 60 * 1000,
  BATCH_TIME_BUDGET_MS: 210 * 1000,
  BATCH_TIME_MARGIN_MS: 30 * 1000,
  BATCH_MAX_FILES: 2,
  DIAGNOSTIC_BATCH_ROWS: 200,
  REVIEW_FILL: '#f4b183',
  SOURCE_FILL: '#d9ead3',
};

const ZUP_IMPORT_HEADERS = [
  'Файл',
  'Лист',
  'Организация',
  'Сотрудник',
  'Период',
  'Дата начисления',
  'Год',
  'Месяц',
  'Рабочие дни',
  'Факт. отработано дней',
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
  company: 2,
  employee: 3,
  period: 4,
  accrualDate: 5,
  year: 6,
  month: 7,
  workDays: 8,
  paidDays: 9,
  paymentDate: 10,
  paymentStatement: 11,
  statementDate: 12,
  section: 13,
  category: 14,
  kind: 15,
  accrued: 16,
  paid: 17,
  withheld: 18,
  sourceRow: 19,
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
  'Факт. отработано дней',
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
  'Организация',
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

const ZUP_VLM_LOG_HEADERS = [
  'Файл',
  'MIME',
  'Модель',
  'Статус',
  'Строк',
  'Стоимость, ₽',
  'Prompt tokens',
  'Completion tokens',
  'Total tokens',
  'Langfuse trace',
  'Предупреждения',
  'Сырой JSON',
];

const ZUP_QG_HEADERS = [
  'Проверка',
  'Серьезность',
  'Статус',
  'Файл',
  'Период',
  'Организация',
  'Сотрудник',
  'Лист/ячейка',
  'Проблема',
  'Что проверить',
];

const ZUP_PAYMENT_STRUCTURE_HEADERS = [
  'Организация',
  'Раздел 1С',
  'Категория',
  'Вид начисления',
  'Расчетная роль',
  'Строк',
  'Первый период',
  'Последний период',
  'Начислено',
  'Выплачено',
  'Удержано',
  'Файлы',
  'JSON',
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
    clearColumns: ['A', 'B', 'D', 'E', 'F', 'I', 'K', 'L', 'Q', 'R'],
  },
  {
    sourceSheetName: 'Ежемесячные',
    targetSheetName: 'Из_1С_Ежемесячные',
    dataStartRow: 2,
    clearColumns: ['C', 'F', 'H', 'I', 'J', 'K'],
  },
  {
    sourceSheetName: 'Ежеквартальные',
    targetSheetName: 'Из_1С_Ежеквартальные',
    dataStartRow: 2,
    clearColumns: ['C', 'F', 'H', 'I', 'J', 'K'],
  },
  {
    sourceSheetName: 'Ежегодные',
    targetSheetName: 'Из_1С_Ежегодные',
    dataStartRow: 2,
    clearColumns: ['C', 'F', 'H', 'I', 'J', 'K'],
  },
  {
    sourceSheetName: 'Отпуска и расчет',
    targetSheetName: 'Из_1С_Отпуска',
    dataStartRow: 2,
    clearColumns: ['A', 'B', 'D', 'G', 'H', 'K', 'L', 'M', 'N', 'O'],
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
  const result = startZupFolderImportBatch_(spreadsheet, folder, { force: false, dryRun: false });
  showZupBatchImportMessage_(result, 'Импорт 1С');
}

function importZupFolder_() {
  importZupFolder();
}

function previewZupFolderImport() {
  const spreadsheet = getTargetSpreadsheet_();
  const folder = resolveZupFolderFromSpreadsheet_(spreadsheet);
  const result = startZupFolderImportBatch_(spreadsheet, folder, { force: false, dryRun: true });
  showZupBatchImportMessage_(result, 'Проверка импорта 1С без перезаписи');
}

function forceZupFolderImport() {
  const spreadsheet = getTargetSpreadsheet_();
  const folder = resolveZupFolderFromSpreadsheet_(spreadsheet);
  const result = startZupFolderImportBatch_(spreadsheet, folder, { force: true, dryRun: false });
  showZupBatchImportMessage_(result, 'Полный импорт 1С');
}

function resumeZupFolderImport() {
  const result = continueZupFolderImportBatch_();
  showZupBatchImportMessage_(result, 'Пакетный импорт 1С');
}

function resumeZupFolderImport_() {
  continueZupFolderImportBatch_();
}

function cancelZupFolderImport() {
  clearZupBatchImportState_();
  deleteZupBatchImportTriggers_();
  showMessage_('Пакетный импорт 1С остановлен. Уже записанные строки импорта не удалены.');
}

function showZupVlmSettings() {
  const apiKeyConfigured = Boolean(getZupPolzaApiKey_());
  const model = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.VLM_MODEL_PROPERTY) || ZUP_IMPORT_SETTINGS.VLM_DEFAULT_MODEL;
  const forcePattern = getZupVlmForcePattern_();
  const langfuse = getZupLangfuseConfig_();
  showMessage_(
    [
      `VLM fallback: ${ZUP_IMPORT_SETTINGS.ENABLE_VLM_FALLBACK ? 'включен' : 'выключен'}`,
      `Polza API key: ${apiKeyConfigured ? 'задан' : `не задан (${ZUP_IMPORT_SETTINGS.POLZA_API_KEY_PROPERTY})`}`,
      `Модель: ${model}`,
      `Принудительный VLM: ${forcePattern || 'не задан'}`,
      `Лимит файла: ${Math.round(ZUP_IMPORT_SETTINGS.VLM_MAX_FILE_BYTES / 1024 / 1024)} МБ`,
      `Langfuse: ${langfuse.enabled ? 'включен' : 'выключен'}${langfuse.enabled ? ` (${langfuse.baseUrl})` : ''}`,
      'Ключи задаются в Apps Script -> Project Settings -> Script properties.',
    ].join('\n')
  );
}

function showZupVlmSettings_() {
  showZupVlmSettings();
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

function populateZupReconstructionSheets() {
  const spreadsheet = getTargetSpreadsheet_();
  const result = runZupReconstruction_(spreadsheet);

  showMessage_(
    [
      `Вкладки Из_1С заполнены из расчетных листков.`,
      result.fillResults.map((item) => `${item.sheet}: ${item.rows} строк`).join('\n'),
      '',
      `Пересчет Из_1С выполнен: ${result.calculationResults.map((item) => `${item.sheetName}: ${item.calculated} строк, пропущено ${item.skipped}`).join('; ')}`,
    ].join('\n')
  );
}

function runZupReconstruction_(spreadsheet) {
  let checkpoint = null;
  let stepResult = null;
  do {
    stepResult = continueZupReconstructionStep_(spreadsheet, checkpoint);
    checkpoint = stepResult.checkpoint;
  } while (!stepResult.complete);
  return stepResult.result;
}

function continueZupReconstructionStep_(spreadsheet, checkpoint, options) {
  const settings = options || {};
  const now = typeof settings.now === 'function' ? settings.now : () => new Date();
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
  const productionCalendar = loadProductionCalendarSafely_();
  const company = model.quality.mainCompany || (model.quality.companies.length === 1 ? model.quality.companies[0] : '');
  const state = Object.assign({
    version: 1,
    nextStep: 0,
    totalSteps: 10,
    currentStep: '',
    fillResults: [],
    calculationResults: [],
    stepTimings: [],
    startedAt: now().toISOString(),
  }, checkpoint || {});
  state.fillResults = (state.fillResults || []).slice();
  state.calculationResults = (state.calculationResults || []).slice();
  state.stepTimings = (state.stepTimings || []).slice();
  state.company = company;
  state.quality = model.quality;

  const reconstructionSheetNames = [
    'Из_1С_Оклад',
    'Из_1С_Ежемесячные',
    'Из_1С_Ежеквартальные',
    'Из_1С_Ежегодные',
    'Из_1С_Отпуска',
  ];
  const steps = [
    {
      key: 'fill_salary',
      label: 'Заполняем оклад',
      execute: () => state.fillResults.push(
        fillZupSalaryReconstruction_(spreadsheet, model.salary, productionCalendar, company, model.quality)
      ),
    },
    {
      key: 'fill_monthly_premiums',
      label: 'Заполняем ежемесячные премии',
      execute: () => state.fillResults.push(
        fillZupPremiumReconstruction_(spreadsheet, reconstructionSheetNames[1], model.monthlyPremiums, 'monthly', model.quality)
      ),
    },
    {
      key: 'fill_quarterly_premiums',
      label: 'Заполняем ежеквартальные премии',
      execute: () => state.fillResults.push(
        fillZupPremiumReconstruction_(spreadsheet, reconstructionSheetNames[2], model.quarterlyPremiums, 'quarterly', model.quality)
      ),
    },
    {
      key: 'fill_annual_premiums',
      label: 'Заполняем ежегодные премии',
      execute: () => state.fillResults.push(
        fillZupPremiumReconstruction_(spreadsheet, reconstructionSheetNames[3], model.annualPremiums, 'annual', model.quality)
      ),
    },
    {
      key: 'fill_vacations',
      label: 'Заполняем отпуска',
      execute: () => {
        state.fillResults.push(fillZupVacationReconstruction_(spreadsheet, model.vacations, model.quality));
        markZupReconstructionCompany_(spreadsheet, company, model.quality);
      },
    },
  ].concat(reconstructionSheetNames.map((sheetName) => ({
    key: `calculate_${sheetName}`,
    label: `Пересчитываем ${sheetName.replace(/^Из_1С_/, '')}`,
    execute: () => state.calculationResults.push(
      updateZupReconstructionIndexationSheet_(spreadsheet, sheetName)
    ),
  })));

  state.totalSteps = steps.length;
  if (state.nextStep >= steps.length) {
    return {
      complete: true,
      checkpoint: state,
      result: buildZupReconstructionResultFromCheckpoint_(state),
    };
  }

  const step = steps[state.nextStep];
  const startedAt = now();
  step.execute();
  const finishedAt = now();
  state.currentStep = step.label;
  state.stepTimings.push({
    step: step.key,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
  });
  state.nextStep++;
  state.updatedAt = finishedAt.toISOString();
  const complete = state.nextStep >= steps.length;
  return {
    complete,
    checkpoint: state,
    result: complete ? buildZupReconstructionResultFromCheckpoint_(state) : null,
  };
}

function buildZupReconstructionResultFromCheckpoint_(checkpoint) {
  const state = checkpoint || {};
  return {
    fillResults: state.fillResults || [],
    calculationResults: state.calculationResults || [],
    company: state.company || '',
    quality: state.quality || {},
    stepTimings: state.stepTimings || [],
  };
}

function clearZupImportSheets() {
  const spreadsheet = getTargetSpreadsheet_();
  [
    ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.SUMMARY_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.QUALITY_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.QG_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.VLM_LOG_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.PAYMENT_STRUCTURE_SHEET_NAME,
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
  const vlmRows = [];
  let filesRead = 0;

  groups.forEach((group) => {
    const processed = processZupImportGroup_(group, previousState, previousRowsByFile, normalizedOptions);
    rows.push(...processed.rows);
    skippedFiles.push(...processed.skippedFiles);
    vlmRows.push(...processed.vlmRows);
    qualityRows.push(processed.qualityRow);
    stateRows.push(processed.stateRow);
    if (processed.read) {
      filesRead++;
    }
  });

  const globalQualityRows = buildZupGlobalQualityRows_(rows);
  writeZupQualitySheet_(spreadsheet, globalQualityRows.concat(qualityRows), normalizedOptions.dryRun);
  writeZupQualityGateSheet_(spreadsheet, buildZupQualityGateRows_(rows, qualityRows));
  writeZupVlmLogSheet_(spreadsheet, vlmRows, normalizedOptions.dryRun);
  if (!normalizedOptions.dryRun) {
    writeZupImportSheet_(spreadsheet, rows, skippedFiles);
    writeZupSummarySheet_(spreadsheet, rows);
    writeZupPaymentStructureSheet_(spreadsheet, rows);
    writeZupDiagnosticSheet_(spreadsheet, rows);
    writeZupStateSheet_(spreadsheet, stateRows);
  }

  return {
    rows,
    skippedFiles,
    filesRead,
    qualityRows: globalQualityRows.concat(qualityRows),
    stateRows,
    vlmRows,
  };
}

function processZupImportGroup_(group, previousState, previousRowsByFile, options) {
  const normalizedOptions = Object.assign({ force: false, dryRun: false }, options || {});
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
    return {
      fileName: file.getName(),
      rows: parsed.rows,
      skippedFiles: parsed.skippedFiles,
      vlmRows: parsed.vlmRows || [],
      qualityRow: buildZupQualityRow_(group, parsed, unchanged ? 'Не изменился' : 'OK'),
      stateRow: buildZupStateRow_(group, parsed, signature, unchanged ? 'Не изменился' : 'OK'),
      read: Boolean(parsed.read),
    };
  } catch (error) {
    const reason = error && error.message ? error.message : String(error);
    const parsed = buildFailedZupResult_(file, reason);
    return {
      fileName: file.getName(),
      rows: [],
      skippedFiles: [[file.getName(), file.getMimeType(), reason]],
      vlmRows: [],
      qualityRow: buildZupQualityRow_(group, parsed, 'Ошибка'),
      stateRow: buildZupStateRow_(group, parsed, signature, 'Ошибка'),
      read: false,
    };
  }
}

function startZupFolderImportBatch_(spreadsheet, folder, options) {
  const normalizedOptions = Object.assign({ force: false, dryRun: false }, options || {});
  clearZupBatchImportState_();
  deleteZupBatchImportTriggers_();
  clearZupVlmLogSheet_(spreadsheet);
  const session = {
    spreadsheetId: spreadsheet.getId(),
    folderId: folder.id,
    source: folder.source,
    force: Boolean(normalizedOptions.force),
    dryRun: Boolean(normalizedOptions.dryRun),
    nextIndex: 0,
    total: 0,
    filesRead: 0,
    rowsRecognized: 0,
    skippedCount: 0,
    stage: 'recognizing',
    recognitionTimings: [],
    finalizationStep: 0,
    finalizationTimings: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (normalizedOptions.constructorRunId) {
    session.constructorRunId = normalizedOptions.constructorRunId;
    session.constructorNextPhase = normalizedOptions.constructorNextPhase || 'reconstructing';
  }
  saveZupBatchImportSession_(session);
  if (session.constructorRunId
    && typeof ensureClaimConstructorWatchdogTrigger_ === 'function') {
    ensureClaimConstructorWatchdogTrigger_();
  }
  return continueZupFolderImportBatch_();
}

function continueZupFolderImportBatch_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    scheduleZupBatchImportTrigger_();
    return buildZupBatchImportLockedResult_();
  }

  try {
    const session = loadZupBatchImportSession_();
    if (!session) {
      deleteZupBatchImportTriggers_();
      return {
        complete: true,
        source: '',
        total: 0,
        processed: 0,
        filesRead: 0,
        rows: [],
        skippedFiles: [],
        message: 'Нет активного пакетного импорта 1С.',
      };
    }

    scheduleZupBatchImportTrigger_();
    const spreadsheet = session.spreadsheetId
      ? SpreadsheetApp.openById(session.spreadsheetId)
      : getTargetSpreadsheet_();
    session.stage = session.stage || 'recognizing';
    if (session.stage === 'finalizing') {
      return continueZupImportFinalization_(spreadsheet, session);
    }
    const groups = selectZupImportFileGroups_(listZupFilesRecursively_(DriveApp.getFolderById(session.folderId)));
    session.total = groups.length;

    const previousState = readZupImportState_(spreadsheet);
    const rowsByFile = readExistingZupRowsByFile_(spreadsheet);
    const skippedFiles = readExistingZupSkippedFiles_(spreadsheet);
    const qualityRowsByGroup = readExistingZupQualityRowsByGroup_(spreadsheet);
    const stateRowsByGroup = readExistingZupStateRowsByGroup_(spreadsheet);
    const vlmRows = readExistingZupVlmRows_(spreadsheet);
    const started = Date.now();
    let processedNow = 0;
    session.recognitionTimings = session.recognitionTimings || [];

    while (
      session.nextIndex < groups.length &&
      processedNow < ZUP_IMPORT_SETTINGS.BATCH_MAX_FILES &&
      hasZupBatchTimeLeft_(started)
    ) {
      const group = groups[session.nextIndex];
      const groupStartedAt = new Date();
      session.currentRecognitionStep = group && group.selected && group.selected.getName
        ? group.selected.getName()
        : (group.key || `Источник ${session.nextIndex + 1}`);
      session.updatedAt = groupStartedAt.toISOString();
      saveZupBatchImportSession_(session);
      if (session.constructorRunId && typeof updateClaimConstructorImportProgress_ === 'function') {
        try {
          updateClaimConstructorImportProgress_(session);
        } catch (error) {
          console.warn(`Не удалось обновить шаг распознавания: ${error && error.message ? error.message : error}`);
        }
      }
      const processed = processZupImportGroup_(group, previousState, rowsByFile, session);
      const groupFinishedAt = new Date();
      rowsByFile[processed.fileName] = processed.rows;
      skippedFiles.push(...processed.skippedFiles);
      qualityRowsByGroup[group.key] = processed.qualityRow;
      stateRowsByGroup[group.key] = processed.stateRow;
      vlmRows.push(...processed.vlmRows);
      if (processed.read) {
        session.filesRead++;
      }
      session.rowsRecognized += processed.rows.length;
      session.skippedCount += processed.skippedFiles.length;
      session.nextIndex++;
      processedNow++;
      session.recognitionTimings.push({
        groupKey: group.key || '',
        source: session.currentRecognitionStep,
        startedAt: groupStartedAt.toISOString(),
        finishedAt: groupFinishedAt.toISOString(),
        durationMs: Math.max(0, groupFinishedAt.getTime() - groupStartedAt.getTime()),
        rows: processed.rows.length,
        read: Boolean(processed.read),
      });
      if (session.recognitionTimings.length > 100) {
        session.recognitionTimings = session.recognitionTimings.slice(-100);
      }
      session.updatedAt = groupFinishedAt.toISOString();
      writeZupBatchImportOutputs_(
        spreadsheet,
        flattenZupRowsByFile_(rowsByFile),
        dedupeZupSkippedFiles_(skippedFiles),
        qualityRowsByGroup,
        stateRowsByGroup,
        vlmRows,
        session,
        false
      );
      saveZupBatchImportSession_(session);
      if (session.constructorRunId && typeof updateClaimConstructorImportProgress_ === 'function') {
        try {
          const recognitionIssues = typeof buildClaimConstructorRecognitionIssues_ === 'function'
            ? buildClaimConstructorRecognitionIssues_(processed)
            : [];
          updateClaimConstructorImportProgress_(session, recognitionIssues);
        } catch (error) {
          console.warn(`Не удалось опубликовать замечания распознавания: ${error && error.message ? error.message : error}`);
        }
      }
    }

    const recognitionComplete = session.nextIndex >= groups.length;
    session.updatedAt = new Date().toISOString();
    const allRows = flattenZupRowsByFile_(rowsByFile);
    const allSkippedFiles = dedupeZupSkippedFiles_(skippedFiles);
    const completeImmediately = recognitionComplete && session.dryRun;
    writeZupBatchImportOutputs_(
      spreadsheet,
      allRows,
      allSkippedFiles,
      qualityRowsByGroup,
      stateRowsByGroup,
      vlmRows,
      session,
      completeImmediately
    );

    if (recognitionComplete && !completeImmediately) {
      session.stage = 'finalizing';
      session.finalizationStep = Number(session.finalizationStep) || 0;
      session.finalizationTimings = session.finalizationTimings || [];
      session.currentFinalizationStep = getZupImportFinalizationStepLabel_(session.finalizationStep);
    }
    saveZupBatchImportSession_(session);

    const result = {
      complete: completeImmediately,
      recognitionComplete,
      stage: completeImmediately ? 'complete' : session.stage,
      source: session.source,
      total: session.total,
      processed: session.nextIndex,
      filesRead: session.filesRead,
      rows: allRows,
      rowsRecognized: session.rowsRecognized,
      skippedFiles: allSkippedFiles,
      skippedCount: session.skippedCount,
      dryRun: Boolean(session.dryRun),
      processedNow,
    };

    if (session.constructorRunId && typeof updateClaimConstructorImportProgress_ === 'function') {
      try {
        updateClaimConstructorImportProgress_(session);
      } catch (error) {
        console.warn(`Не удалось обновить прогресс конструктора: ${error && error.message ? error.message : error}`);
      }
    }

    if (completeImmediately) {
      clearZupBatchImportState_();
      deleteZupBatchImportTriggers_();
      notifyClaimConstructorImportComplete_(session, result);
    } else {
      scheduleZupBatchImportTrigger_();
    }

    return result;
  } finally {
    lock.releaseLock();
  }
}

function continueZupImportFinalization_(spreadsheet, session) {
  const rowsByFile = readExistingZupRowsByFile_(spreadsheet);
  const rows = flattenZupRowsByFile_(rowsByFile);
  const skippedFiles = dedupeZupSkippedFiles_(readExistingZupSkippedFiles_(spreadsheet));
  const qualityRowsByGroup = readExistingZupQualityRowsByGroup_(spreadsheet);
  session.currentFinalizationStep = getZupImportFinalizationStepLabel_(session.finalizationStep);
  session.updatedAt = new Date().toISOString();
  saveZupBatchImportSession_(session);
  if (session.constructorRunId && typeof updateClaimConstructorImportProgress_ === 'function') {
    try {
      updateClaimConstructorImportProgress_(session);
    } catch (error) {
      console.warn(`Не удалось обновить финализацию импорта: ${error && error.message ? error.message : error}`);
    }
  }

  const stepResult = runNextZupImportFinalizationStep_(spreadsheet, session, {
    rows,
    skippedFiles,
    qualityRowsByGroup,
  });
  Object.keys(stepResult.checkpoint || {}).forEach((key) => {
    session[key] = stepResult.checkpoint[key];
  });
  session.updatedAt = new Date().toISOString();

  const result = {
    complete: stepResult.complete,
    recognitionComplete: true,
    stage: stepResult.complete ? 'complete' : 'finalizing',
    source: session.source,
    total: session.total || 0,
    processed: session.nextIndex || 0,
    filesRead: session.filesRead || 0,
    rows,
    rowsRecognized: rows.length,
    skippedFiles,
    skippedCount: skippedFiles.length,
    dryRun: Boolean(session.dryRun),
    processedNow: 0,
    finalizationStep: session.finalizationStep,
  };

  if (session.constructorRunId && typeof updateClaimConstructorImportProgress_ === 'function') {
    try {
      updateClaimConstructorImportProgress_(session);
    } catch (error) {
      console.warn(`Не удалось обновить прогресс финализации: ${error && error.message ? error.message : error}`);
    }
  }

  if (stepResult.complete) {
    clearZupBatchImportState_();
    deleteZupBatchImportTriggers_();
    notifyClaimConstructorImportComplete_(session, result);
  } else {
    saveZupBatchImportSession_(session);
    scheduleZupBatchImportTrigger_();
  }
  return result;
}

function runNextZupImportFinalizationStep_(spreadsheet, checkpoint, inputs, options) {
  const settings = options || {};
  const now = typeof settings.now === 'function' ? settings.now : () => new Date();
  const state = Object.assign({
    finalizationStep: 0,
    finalizationTimings: [],
  }, checkpoint || {});
  state.finalizationTimings = (state.finalizationTimings || []).slice();
  const values = inputs || {};
  const rows = values.rows || [];
  const qualityRowsByGroup = values.qualityRowsByGroup || {};
  const diagnosticTargets = getZupDiagnosticTargets_();
  const steps = [
    {
      key: 'quality',
      label: 'Проверяем качество импорта',
      execute: () => writeZupFinalQualityViews_(spreadsheet, rows, qualityRowsByGroup, state),
    },
    {
      key: 'summary',
      label: 'Собираем свод импорта',
      execute: () => { if (!state.dryRun) writeZupSummarySheet_(spreadsheet, rows); },
    },
    {
      key: 'payment_structure',
      label: 'Собираем структуру выплат',
      execute: () => { if (!state.dryRun) writeZupPaymentStructureSheet_(spreadsheet, rows); },
    },
  ].concat(diagnosticTargets.map((target, index) => ({
    key: `diagnostic_${target.layoutId}`,
    label: `Формируем диагностику: ${target.category}`,
    execute: () => state.dryRun
      ? { complete: true, checkpoint: {} }
      : continueZupDiagnosticTargetStep_(spreadsheet, rows, target, state, index === 0),
  }))).concat([{
    key: 'diagnostic_trim',
    label: 'Завершаем диагностику',
    execute: () => {
      if (!state.dryRun) trimZupDiagnosticSheet_(spreadsheet, state.diagnosticCommittedRows);
    },
  }]);
  if (state.finalizationStep >= steps.length) {
    return { complete: true, checkpoint: state };
  }

  const step = steps[state.finalizationStep];
  const startedAt = now();
  const stepResult = step.execute() || { complete: true, checkpoint: {} };
  const finishedAt = now();
  Object.keys(stepResult.checkpoint || {}).forEach((key) => {
    state[key] = stepResult.checkpoint[key];
  });
  state.currentFinalizationStep = stepResult.progressText || step.label;
  state.finalizationTimings.push({
    step: step.key,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
  });
  if (stepResult.complete !== false) {
    state.finalizationStep++;
    delete state.diagnosticTargetKey;
    delete state.diagnosticNextRow;
    delete state.diagnosticOutputRows;
    delete state.diagnosticBaseRows;
  }
  return {
    complete: state.finalizationStep >= steps.length,
    checkpoint: state,
  };
}

function getZupImportFinalizationStepLabel_(stepIndex) {
  const labels = [
    'Проверяем качество импорта',
    'Собираем свод импорта',
    'Собираем структуру выплат',
  ]
    .concat(getZupDiagnosticTargets_().map((target) => `Формируем диагностику: ${target.category}`))
    .concat(['Завершаем диагностику']);
  return labels[Number(stepIndex) || 0] || 'Завершаем импорт';
}

function writeZupFinalQualityViews_(spreadsheet, rows, qualityRowsByGroup, session) {
  const qualityRows = (session.dryRun ? [] : buildZupGlobalQualityRows_(rows))
    .concat([buildZupBatchStatusQualityRow_(session, true)])
    .concat(Object.keys(qualityRowsByGroup || {}).sort().map((key) => qualityRowsByGroup[key]));
  writeZupQualitySheet_(spreadsheet, qualityRows, session.dryRun);
  if (session.dryRun) {
    writeZupBatchProgressQualityGateSheet_(spreadsheet, session, true);
  } else {
    writeZupQualityGateSheet_(spreadsheet, buildZupQualityGateRows_(rows, qualityRowsByGroup));
  }
}

function notifyClaimConstructorImportComplete_(session, importResult) {
  if (!session || !session.constructorRunId || typeof continueClaimConstructorAfterImport_ !== 'function') {
    return null;
  }
  return continueClaimConstructorAfterImport_(
    session.constructorRunId,
    session.constructorNextPhase || 'reconstructing',
    importResult
  );
}

function writeZupBatchImportOutputs_(spreadsheet, rows, skippedFiles, qualityRowsByGroup, stateRowsByGroup, vlmRows, session, complete) {
  const qualityRows = (complete && !session.dryRun ? buildZupGlobalQualityRows_(rows) : [])
    .concat([buildZupBatchStatusQualityRow_(session, complete)])
    .concat(Object.keys(qualityRowsByGroup).sort().map((key) => qualityRowsByGroup[key]));
  writeZupQualitySheet_(spreadsheet, qualityRows, session.dryRun);
  if (complete && !session.dryRun) {
    writeZupQualityGateSheet_(spreadsheet, buildZupQualityGateRows_(rows, qualityRowsByGroup));
  } else {
    writeZupBatchProgressQualityGateSheet_(spreadsheet, session, complete);
  }
  writeZupVlmLogSheet_(spreadsheet, vlmRows, session.dryRun);

  if (session.dryRun) {
    return;
  }

  writeZupImportSheet_(spreadsheet, rows, skippedFiles);
  writeZupStateSheet_(spreadsheet, Object.keys(stateRowsByGroup).sort().map((key) => stateRowsByGroup[key]));
  if (complete) {
    writeZupSummarySheet_(spreadsheet, rows);
    writeZupPaymentStructureSheet_(spreadsheet, rows);
    writeZupDiagnosticSheet_(spreadsheet, rows);
  }
}

function hasZupBatchTimeLeft_(startedAtMs) {
  const budget = ZUP_IMPORT_SETTINGS.BATCH_TIME_BUDGET_MS;
  const margin = ZUP_IMPORT_SETTINGS.BATCH_TIME_MARGIN_MS || 0;
  return Date.now() - startedAtMs < Math.max(0, budget - margin);
}

function writeZupBatchProgressQualityGateSheet_(spreadsheet, session, complete) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.QG_SHEET_NAME);
  writeZupSheetData_(sheet, [ZUP_QG_HEADERS].concat([[
    'Пакетный импорт',
    'Инфо',
    complete ? 'OK' : 'В работе',
    '',
    '',
    '',
    '',
    '',
    complete && session.dryRun
      ? `Проверка без перезаписи завершена: обработано ${session.nextIndex || 0} из ${session.total || 0} групп.`
      : `Обработано ${session.nextIndex || 0} из ${session.total || 0} групп. Полные quality gates будут построены после завершения импорта.`,
    complete
      ? 'Сверить строки на листе качества.'
      : 'Дождаться автоматического продолжения или запустить "Продолжить пакетный импорт".',
  ]]));
}

function buildZupBatchStatusQualityRow_(session, complete) {
  const status = complete ? 'OK' : 'В работе';
  const warning = complete
    ? `Пакетный импорт завершен: ${session.nextIndex || 0} из ${session.total || 0} групп.`
    : `Пакетный импорт продолжается автоматически: ${session.nextIndex || 0} из ${session.total || 0} групп. Следующий запуск будет поставлен триггером.`;
  return buildZupGlobalQualityRow_('Пакетный импорт', status, warning);
}

function showZupBatchImportMessage_(result, title) {
  if (result && result.message) {
    showMessage_(result.message);
    return;
  }

  const prefix = result.complete
    ? `${title} завершен`
    : `${title} запущен пакетами`;
  const progress = result.total
    ? `${result.processed} из ${result.total} групп`
    : 'группы не найдены';
  showMessage_(
    [
      `${prefix}. Источник: ${result.source || 'не указан'}.`,
      `Прогресс: ${progress}.`,
      `Файлов прочитано: ${result.filesRead}. Распознано строк: ${Number.isFinite(result.rowsRecognized) ? result.rowsRecognized : result.rows.length}. Пропущено файлов: ${Number.isFinite(result.skippedCount) ? result.skippedCount : result.skippedFiles.length}.`,
      result.complete
        ? (result.dryRun ? 'Проверка завершена без перезаписи основных листов.' : 'Свод и диагностика обновлены.')
        : 'Продолжение поставлено автоматически через триггер; можно закрыть окно и вернуться позже.',
    ].join('\n')
  );
}

function buildZupBatchImportLockedResult_() {
  const session = loadZupBatchImportSession_();
  return {
    complete: false,
    source: session ? session.source : '',
    total: session ? session.total : 0,
    processed: session ? session.nextIndex : 0,
    filesRead: session ? session.filesRead : 0,
    rows: [],
    skippedFiles: [],
    message: 'Пакетный импорт уже выполняется. Я поставил повторный запуск, чтобы он продолжился после текущего шага.',
  };
}

function saveZupBatchImportSession_(session) {
  PropertiesService
    .getScriptProperties()
    .setProperty(ZUP_IMPORT_SETTINGS.BATCH_STATE_PROPERTY, JSON.stringify(session));
}

function loadZupBatchImportSession_() {
  const raw = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.BATCH_STATE_PROPERTY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    clearZupBatchImportState_();
    return null;
  }
}

function clearZupBatchImportState_() {
  PropertiesService
    .getScriptProperties()
    .deleteProperty(ZUP_IMPORT_SETTINGS.BATCH_STATE_PROPERTY);
}

function scheduleZupBatchImportTrigger_() {
  deleteZupBatchImportTriggers_();
  ScriptApp
    .newTrigger(ZUP_IMPORT_SETTINGS.BATCH_TRIGGER_FUNCTION)
    .timeBased()
    .after(ZUP_IMPORT_SETTINGS.BATCH_TRIGGER_DELAY_MS)
    .create();
}

function deleteZupBatchImportTriggers_() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getHandlerFunction && trigger.getHandlerFunction() === ZUP_IMPORT_SETTINGS.BATCH_TRIGGER_FUNCTION) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function flattenZupRowsByFile_(rowsByFile) {
  return Object.keys(rowsByFile)
    .sort()
    .reduce((rows, fileName) => rows.concat(rowsByFile[fileName] || []), []);
}

function dedupeZupSkippedFiles_(skippedFiles) {
  const seen = {};
  return (skippedFiles || []).filter((row) => {
    const key = row.join('|');
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
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
    'Не нашел ссылку на папку с расчетными листками. Добавьте в таблицу подпись "Расчетные листы:" и рядом ссылку на Drive-папку или заполните ZUP_IMPORT_SETTINGS.SOURCE_FOLDER_URL.'
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
        const label = normalizeText_(snapshot.values[rowIndex][columnIndex]);
        if (!label.includes('расчетные листы')
            && !label.includes('расчетные листки')) {
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
    ZUP_IMPORT_SETTINGS.QG_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME,
    ZUP_IMPORT_SETTINGS.VLM_LOG_SHEET_NAME,
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
      company: row[ZUP_IMPORT_COLUMNS.company],
      employee: row[ZUP_IMPORT_COLUMNS.employee],
      period: normalizeZupImportPeriod_(row[ZUP_IMPORT_COLUMNS.year], row[ZUP_IMPORT_COLUMNS.month], row[ZUP_IMPORT_COLUMNS.period]),
      accrualDate: row[ZUP_IMPORT_COLUMNS.accrualDate] instanceof Date ? row[ZUP_IMPORT_COLUMNS.accrualDate] : parseDateValue_(row[ZUP_IMPORT_COLUMNS.accrualDate]),
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
      isVlm: row[ZUP_IMPORT_COLUMNS.sheet] === 'Polza VLM',
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
    quality: buildZupReconstructionQuality_(rows),
  };
}

function buildZupReconstructionQuality_(rows) {
  const companyValues = rows.map((row) => normalizeZupCompanyName_(row.company)).filter(Boolean);
  const rawEmployees = getUniqueNormalizedValues_(rows.map((row) => row.employee));
  const normalizedEmployees = getUniqueNormalizedValues_(rows.map((row) => normalizeZupEmployeeName_(row.employee)));
  const mainCompany = getMostFrequentValue_(companyValues);
  const mainEmployee = getMostFrequentValue_(rows.map((row) => normalizeZupEmployeeName_(row.employee)).filter(Boolean));
  const blankCompanyPeriods = getZupProblemPeriods_(rows, (row) => !normalizeZupCompanyName_(row.company));
  const companyMismatchPeriods = getZupProblemPeriods_(rows, (row) => {
    const company = normalizeZupCompanyName_(row.company);
    return company && mainCompany && company !== mainCompany;
  });
  const employeeMismatchPeriods = getZupProblemPeriods_(rows, (row) => {
    const employee = normalizeZupEmployeeName_(row.employee);
    return employee && mainEmployee && employee !== mainEmployee;
  });
  const rawEmployeeVariantPeriods = getZupProblemPeriods_(rows, (row) => {
    const raw = normalizeText_(row.employee);
    return raw && normalizeZupEmployeeName_(raw) === mainEmployee && raw !== mainEmployee;
  });
  const periodIssues = buildZupPeriodIssueMap_([
    [blankCompanyPeriods, 'Организация не распознана в расчетном листке. Проверьте строку импорта и исходный файл.'],
    [companyMismatchPeriods, `Организация отличается от основной (${mainCompany}). Проверьте, относится ли месяц к другой компании.`],
    [employeeMismatchPeriods, `ФИО отличается от основного сотрудника (${mainEmployee}). Проверьте исходный расчетный листок.`],
    [rawEmployeeVariantPeriods, 'ФИО содержит служебный номер/вариант написания; для расчета нормализовано до ФИО.'],
  ]);

  return {
    companies: getUniqueNormalizedValues_(companyValues),
    employees: normalizedEmployees,
    rawEmployees,
    mainCompany,
    mainEmployee,
    blankCompanyPeriods,
    companyMismatchPeriods,
    employeeMismatchPeriods,
    rawEmployeeVariantPeriods,
    periodIssues,
    missingMonths: findZupMissingPeriods_(rows),
  };
}

function normalizeZupCompanyName_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeZupEmployeeName_(value) {
  return String(value || '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMostFrequentValue_(values) {
  const counts = {};
  (values || []).filter(Boolean).forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.keys(counts).sort((left, right) => counts[right] - counts[left] || left.localeCompare(right))[0] || '';
}

function getZupProblemPeriods_(rows, predicate) {
  const periods = {};
  rows.forEach((row) => {
    if (predicate(row) && row.period && row.period.year && row.period.month) {
      periods[buildZupPeriodKey_(row.period)] = formatZupPeriod_(row.period);
    }
  });
  return Object.keys(periods).sort().map((key) => periods[key]);
}

function buildZupPeriodIssueMap_(groups) {
  const map = {};
  groups.forEach(([periods, message]) => {
    (periods || []).forEach((periodText) => {
      const period = parseMonthYear_(periodText);
      if (!period) {
        return;
      }
      const key = buildZupPeriodKey_(period);
      map[key] = map[key] ? `${map[key]}\n${message}` : message;
    });
  });
  return map;
}

function getUniqueNormalizedValues_(values) {
  const seen = {};
  (values || []).forEach((value) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text) {
      seen[text] = true;
    }
  });
  return Object.keys(seen).sort();
}

function findZupMissingPeriods_(rows) {
  const periods = {};
  rows.forEach((row) => {
    if (row.period && row.period.year && row.period.month) {
      periods[buildZupPeriodKey_(row.period)] = row.period;
    }
  });
  const sorted = Object.keys(periods)
    .map((key) => periods[key])
    .sort((left, right) => left.year - right.year || left.month - right.month);
  if (sorted.length < 2) {
    return [];
  }

  const missing = [];
  for (
    let cursor = { year: sorted[0].year, month: sorted[0].month };
    cursor.year < sorted[sorted.length - 1].year || (cursor.year === sorted[sorted.length - 1].year && cursor.month <= sorted[sorted.length - 1].month);
    cursor = nextZupPeriod_(cursor)
  ) {
    if (!periods[buildZupPeriodKey_(cursor)]) {
      missing.push(formatZupPeriod_(cursor));
    }
  }
  return missing;
}

function nextZupPeriod_(period) {
  return period.month === 12
    ? { year: period.year + 1, month: 1 }
    : { year: period.year, month: period.month + 1 };
}

function loadProductionCalendarSafely_() {
  try {
    return loadProductionCalendar_();
  } catch (error) {
    return {};
  }
}

function getZupWorkingDaysForPeriod_(period, productionCalendar) {
  if (!period || !period.year || !period.month) {
    return '';
  }
  let days = 0;
  const daysInMonth = getDaysInMonth_(period.year, period.month);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(period.year, period.month - 1, day);
    if (!isNonWorkingDay_(date, productionCalendar || {})) {
      days++;
    }
  }
  return days || '';
}

function buildZupSalaryModel_(rows) {
  const map = {};
  rows.forEach((row) => {
    const key = buildZupPeriodKey_(row.period);
    if (row.section === 'Выплачено' && isZupSalaryPaymentRow_(row)) {
      if (!map[key]) {
        map[key] = buildEmptyZupSalaryItem_(row.period);
      }
      addZupStatementFromRow_(map[key], row);
      return;
    }

    if (row.section === 'Начислено' && isZupSalaryBaseAccrualCategory_(row.category) && row.accrued !== null) {
      if (!map[key]) {
        map[key] = buildEmptyZupSalaryItem_(row.period);
      }
      if (row.category === 'Оклад' && row.workDays !== null) {
        map[key].workDays += row.workDays;
        map[key].hasWorkDays = true;
      }
      if (row.category === 'Оклад' && row.paidDays !== null) {
        map[key].paidDays += row.paidDays;
        map[key].hasPaidDays = true;
      }
      map[key].amount += row.accrued || 0;
      if (row.category === 'Оклад') {
        map[key].salaryAmount += row.accrued || 0;
      } else if (row.category === 'Доплата до оклада') {
        map[key].salaryTopUpAmount += row.accrued || 0;
      }
      map[key].hasVlm = map[key].hasVlm || row.isVlm;
      map[key].files[row.file] = true;
    }
  });
  return sortZupModelItems_(Object.keys(map).map((key) => map[key]));
}

function buildEmptyZupSalaryItem_(period) {
  return {
    period,
    workDays: 0,
    paidDays: 0,
    hasWorkDays: false,
    hasPaidDays: false,
    amount: 0,
    salaryAmount: 0,
    salaryTopUpAmount: 0,
    hasVlm: false,
    files: {},
    statements: {},
    statementDates: {},
    statementEntries: [],
  };
}

function isZupSalaryPaymentRow_(row) {
  return isZupSalaryBaseAccrualCategory_(row.category) || /зарплата|первая половина|аванс|оклад/i.test(`${row.kind} ${row.sourceRow}`);
}

function isZupSalaryBaseAccrualCategory_(category) {
  return category === 'Оклад' || category === 'Доплата до оклада';
}

function isZupPremiumPaymentRow_(row) {
  return /прем/i.test(`${row.category} ${row.kind} ${row.sourceRow}`);
}

function addZupStatementFromRow_(target, row) {
  const statement = row.statement || row.kind || '';
  const date = row.statementDate || row.paymentDate || null;
  if (statement) {
    target.statements[statement] = true;
  }
  if (date) {
    target.statementDates[formatDate_(date)] = true;
  }
  if (Array.isArray(target.statementEntries) && (statement || date)) {
    target.statementEntries.push({
      statement,
      date,
      paid: row.paid,
      file: row.file,
    });
  }
}

function formatZupStatements_(item) {
  return Object.keys(item && item.statements ? item.statements : {}).sort().join('\n');
}

function formatZupStatementDates_(item) {
  return Object.keys(item && item.statementDates ? item.statementDates : {})
    .sort((left, right) => Number(parseDateValue_(left)) - Number(parseDateValue_(right)))
    .join('\n');
}

function inferZupSalaryPaymentScheduleFromItems_(items, productionCalendar) {
  const layout = getSheetLayout_('Оклад');
  const table = {
    layout,
    columns: {
      year: columnLetterToIndex_(layout.yearColumn),
      month: columnLetterToIndex_(layout.monthColumn),
      paymentDate: columnLetterToIndex_('R'),
    },
  };
  const rows = (items || []).map((item) => {
    const row = [];
    row[table.columns.year] = item.period.year;
    row[table.columns.month] = formatZupMonthName_(item.period.month);
    row[table.columns.paymentDate] = formatZupStatementDates_(item);
    return row;
  });
  return inferSalaryPaymentScheduleFromRows_(rows, table, productionCalendar || {});
}

function buildZupSalaryDiscreteRows_(scaffold, itemMap, productionCalendar, salaryPaymentSchedule) {
  const rows = [];
  (scaffold || []).forEach((scaffoldRow) => {
    const item = itemMap[buildZupPeriodKey_(scaffoldRow.period)] || null;
    rows.push(...buildZupSalaryDiscreteRowsForPeriod_(scaffoldRow.period, item, productionCalendar || {}, salaryPaymentSchedule));
  });
  return rows;
}

function buildZupSalaryDiscreteRowsForPeriod_(period, item, productionCalendar, salaryPaymentSchedule) {
  const calendarWorkDays = getZupWorkingDaysForPeriod_(period, productionCalendar);
  const totalWorkDays = calendarWorkDays || (item && item.hasWorkDays ? item.workDays : 0);
  const totalWorkedDays = item && item.hasPaidDays
    ? item.paidDays
    : null;
  const totalAmount = item && item.amount ? item.amount : null;
  const paymentDates = parsePaymentDatesCell_(formatZupStatementDates_(item)).dates;
  const rawPartData = SALARY_PAYMENT_PARTS.map((part, index) => {
    const statementDate = chooseSalaryStatementDate_(paymentDates, period, index);
    const inferredPayment = statementDate
      ? null
      : getInferredSalaryPaymentDate_(salaryPaymentSchedule, period, part.id, productionCalendar);
    const dueDate = statementDate || (inferredPayment && inferredPayment.date) || null;
    return {
      part,
      dueDate,
      statementDate,
      statement: formatZupStatementForSalaryPart_(item, part, dueDate),
    };
  });
  const ranges = getSalaryPaymentWorkRanges_(period, rawPartData, productionCalendar);
  const rawWorkDays = ranges.map((range) => countWorkingDaysBetween_(range.start, range.end, productionCalendar));
  const fallbackWorkDays = totalWorkDays || rawWorkDays.reduce((sum, value) => sum + value, 0);
  const shares = buildZupSalaryPartShares_(rawWorkDays, fallbackWorkDays);
  const workedParts = splitAmountByShares_(totalWorkedDays, shares);
  const amountParts = splitAmountByShares_(totalAmount, shares);

  return rawPartData.map((partData, index) => ({
    period,
    part: partData.part,
    item,
    workDays: rawWorkDays[index] || roundNumber_((fallbackWorkDays || 0) * shares[index], 4),
    workedDays: workedParts[index],
    amount: amountParts[index],
    dueDate: partData.dueDate,
    statement: partData.statement,
  }));
}

function buildZupSalaryPartShares_(workDays, totalWorkDays) {
  const total = (workDays || []).reduce((sum, value) => sum + (value || 0), 0);
  if (total > 0) {
    return workDays.map((value) => (value || 0) / total);
  }
  if (totalWorkDays > 0) {
    return SALARY_PAYMENT_PARTS.map(() => 1 / SALARY_PAYMENT_PARTS.length);
  }
  return SALARY_PAYMENT_PARTS.map(() => 1 / SALARY_PAYMENT_PARTS.length);
}

function formatZupStatementForSalaryPart_(item, part, dueDate) {
  const entries = item && Array.isArray(item.statementEntries)
    ? item.statementEntries.filter((entry) =>
        dueDate && entry.date && sameCalendarDate_(entry.date, dueDate)
      )
    : [];
  const statements = entries
    .map((entry) => entry.statement)
    .filter(Boolean);
  if (!statements.length) {
    return part.label;
  }
  return `${part.label}\n${Array.from(new Set(statements)).sort().join('\n')}`;
}

function buildZupPremiumModel_(rows, category) {
  const map = {};
  const paymentRowsByFile = buildZupPremiumPaymentRowsByFile_(rows);
  rows
    .filter((row) =>
      row.section === 'Начислено' &&
      row.category === category &&
      row.accrued !== null
    )
    .forEach((row) => {
      const premiumPeriod = detectZupPremiumPeriod_(row, category);
      const key = buildZupPremiumKey_(premiumPeriod, row.period);
      if (!map[key]) {
        map[key] = {
          premiumPeriod,
          paymentPeriod: row.period,
          accrued: 0,
          hasVlm: false,
          files: {},
          statements: {},
          statementDates: {},
        };
      }
      map[key].accrued += row.accrued || 0;
      map[key].hasVlm = map[key].hasVlm || row.isVlm;
      map[key].files[row.file] = true;
      (paymentRowsByFile[row.file] || []).forEach((paymentRow) => {
        addZupStatementFromRow_(map[key], paymentRow);
      });
    });
  return sortZupPremiumItems_(Object.keys(map).map((key) => map[key]));
}

function buildZupPremiumPaymentRowsByFile_(rows) {
  return rows.reduce((map, row) => {
    if (row.section !== 'Выплачено' || !isZupPremiumPaymentRow_(row)) {
      return map;
    }
    if (!map[row.file]) {
      map[row.file] = [];
    }
    map[row.file].push(row);
    return map;
  }, {});
}

function buildZupVacationModel_(rows) {
  const byFile = {};
  rows
    .filter((row) => row.category === 'Отпуска')
    .forEach((row) => {
      if (!byFile[row.file]) {
        byFile[row.file] = {
          accrued: [],
          paid: [],
        };
      }
      if (row.section === 'Начислено' && row.accrued !== null) {
        byFile[row.file].accrued.push(row);
      } else if (row.section === 'Выплачено' && row.paid !== null) {
        byFile[row.file].paid.push(row);
      }
    });

  const items = [];
  Object.keys(byFile).forEach((fileName) => {
    items.push(...buildZupVacationItemsForFile_(fileName, byFile[fileName]));
  });
  return items.sort((left, right) => Number(left.paymentDate || left.eventDate) - Number(right.paymentDate || right.eventDate));
}

function buildZupVacationItemsForFile_(fileName, group) {
  const accruedRows = group.accrued.sort(compareZupRowsByAccrualDate_);
  const paidRows = group.paid.sort(compareZupRowsByPaymentDate_);
  if (!accruedRows.length) {
    return [];
  }

  if (paidRows.length === 1 && accruedRows.length > 1) {
    return [buildZupVacationItem_(fileName, accruedRows, paidRows[0], false)];
  }

  if (paidRows.length === accruedRows.length) {
    return accruedRows.map((row, index) => buildZupVacationItem_(fileName, [row], paidRows[index], false));
  }

  return accruedRows.map((row) => buildZupVacationItem_(fileName, [row], null, paidRows.length > 1));
}

function buildZupVacationItem_(fileName, accruedRows, paidRow, needsReview) {
  const first = accruedRows[0];
  const amount = accruedRows.reduce((sum, row) => sum + (row.accrued || 0), 0);
  const days = accruedRows.reduce((sum, row) => sum + (row.paidDays || extractZupDaysFromText_(`${row.kind} ${row.sourceRow}`) || 0), 0);
  const paymentDate = paidRow
    ? (paidRow.statementDate || paidRow.paymentDate)
    : null;
  const statementHolder = {
    statements: {},
    statementDates: {},
  };
  if (paidRow) {
    addZupStatementFromRow_(statementHolder, paidRow);
  }
  return {
    paymentDate: paymentDate || first.accrualDate || zupPeriodToDate_(first.period),
    eventDate: paymentDate || first.accrualDate || zupPeriodToDate_(first.period),
    vacationPeriod: buildZupVacationPeriodText_(accruedRows),
    days: days || '',
    amount,
    period: first.period,
    kind: accruedRows.map((row) => row.kind).filter(Boolean).join('; '),
    isVlm: accruedRows.some((row) => row.isVlm) || Boolean(paidRow && paidRow.isVlm),
    file: fileName,
    needsReview,
    statements: statementHolder.statements,
    statementDates: statementHolder.statementDates,
  };
}

function buildZupVacationPeriodText_(rows) {
  return rows
    .map((row) => extractZupVacationPeriodText_(`${row.kind} ${row.sourceRow}`, row.period))
    .filter(Boolean)
    .join('\n');
}

function extractZupVacationPeriodText_(value, period) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const range = text.match(/(\d{1,2}[.]\d{1,2}(?:[.]\d{2,4})?)\s*[-–]\s*(\d{1,2}[.]\d{1,2}(?:[.]\d{2,4})?)/);
  if (range) {
    const start = normalizeZupPartialDateText_(range[1], period);
    const end = normalizeZupPartialDateText_(range[2], period);
    return start && end ? `${start}-${end}` : `${range[1]}-${range[2]}`;
  }
  const single = text.match(/(?:отпуск\D+)(\d{1,2}[.]\d{1,2}(?:[.]\d{2,4})?)/i);
  return single ? normalizeZupPartialDateText_(single[1], period) : '';
}

function normalizeZupPartialDateText_(value, period) {
  const parts = String(value || '').split('.');
  if (parts.length < 2) {
    return '';
  }
  const year = parts[2]
    ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2])
    : (period && period.year ? String(period.year) : '');
  return year ? `${pad2_(parts[0])}.${pad2_(parts[1])}.${year}` : '';
}

function compareZupRowsByAccrualDate_(left, right) {
  return Number(left.accrualDate || zupPeriodToDate_(left.period)) - Number(right.accrualDate || zupPeriodToDate_(right.period));
}

function compareZupRowsByPaymentDate_(left, right) {
  return Number(left.statementDate || left.paymentDate || zupPeriodToDate_(left.period)) - Number(right.statementDate || right.paymentDate || zupPeriodToDate_(right.period));
}

function fillZupSalaryReconstruction_(spreadsheet, items, productionCalendar, company, quality) {
  const sheet = spreadsheet.getSheetByName('Из_1С_Оклад');
  if (!sheet) {
    throw new Error('Не найдена вкладка Из_1С_Оклад.');
  }
  const scaffold = mergeZupSalaryScaffoldWithItems_(readZupSalaryScaffold_(spreadsheet), items);
  const itemMap = buildZupModelMapByPeriod_(items);
  const salaryPaymentSchedule = inferZupSalaryPaymentScheduleFromItems_(items, productionCalendar);
  const salaryRows = buildZupSalaryDiscreteRows_(scaffold, itemMap, productionCalendar, salaryPaymentSchedule);
  retargetZupReconstructionFormulas_(sheet);
  ensureZupAuxiliaryHeaders_(sheet, 2, [
    ['Q', 'Ведомости выплат'],
    ['R', 'Дата ведомости выплат'],
  ]);
  prepareZupOutputRows_(sheet, 3, salaryRows.length, ['A', 'B', 'D', 'E', 'F', 'I', 'K', 'L', 'Q', 'R']);
  clearZupReviewMarks_(sheet, 3, salaryRows.length, ['A', 'B', 'I', 'R']);
  clearZupSourceMarks_(sheet, 3, salaryRows.length, ['A', 'B', 'D', 'E', 'I', 'Q', 'R']);
  writeZupColumn_(sheet, 3, 'A', salaryRows.map((row) => numberOrBlank_(row.workedDays)));
  writeZupColumn_(sheet, 3, 'B', salaryRows.map((row) => numberOrBlank_(row.workDays)));
  writeZupColumn_(sheet, 3, 'D', salaryRows.map((row) => row.period.year));
  writeZupColumn_(sheet, 3, 'E', salaryRows.map((row) => formatZupMonthName_(row.period.month)));
  writeZupColumn_(sheet, 3, 'I', salaryRows.map((row) => row.amount ? roundMoney_(row.amount) : ''));
  writeZupColumn_(sheet, 3, 'Q', salaryRows.map((row) => row.statement || row.part.label));
  writeZupColumn_(sheet, 3, 'R', salaryRows.map((row) => row.dueDate || ''));
  markZupSalarySourceCells_(sheet, salaryRows, itemMap, productionCalendar);
  markZupSalaryReviewCells_(sheet, salaryRows, itemMap, productionCalendar);
  markZupPeriodQualityCells_(sheet, salaryRows, 3, 'D', quality);
  if (company) {
    sheet.getRange('P2').setValue(company);
  }
  return { sheet: 'Из_1С_Оклад', rows: salaryRows.length };
}

function fillZupPremiumReconstruction_(spreadsheet, sheetName, items, type, quality) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Не найдена вкладка ${sheetName}.`);
  }
  const sourceSheetName = sheetName.replace(/^Из_1С_/, '');
  const scaffold = mergeZupPremiumScaffoldWithItems_(readZupPremiumScaffold_(spreadsheet, sourceSheetName, type), items, type);
  const itemMap = buildZupPremiumScaffoldMap_(items, type);
  retargetZupReconstructionFormulas_(sheet);
  ensureZupAuxiliaryHeaders_(sheet, 1, [
    ['J', 'Ведомости выплат'],
    ['K', 'Дата ведомости выплат'],
  ]);
  prepareZupOutputRows_(sheet, 2, scaffold.length, ['C', 'F', 'H', 'I', 'J', 'K']);
  clearZupReviewMarks_(sheet, 2, scaffold.length, ['F']);
  clearZupSourceMarks_(sheet, 2, scaffold.length, ['C', 'F', 'J', 'K']);
  writeZupColumn_(sheet, 2, 'C', scaffold.map((row) => row.label));
  writeZupColumn_(sheet, 2, 'F', scaffold.map((row) => {
    const item = itemMap[row.key];
    return item && item.accrued ? roundMoney_(item.accrued) : '';
  }));
  writeZupColumn_(sheet, 2, 'J', scaffold.map((row) => formatZupStatements_(itemMap[row.key])));
  writeZupColumn_(sheet, 2, 'K', scaffold.map((row) => formatZupStatementDates_(itemMap[row.key])));
  markZupPremiumSourceCells_(sheet, scaffold, itemMap);
  markZupPremiumReviewCells_(sheet, scaffold, itemMap);
  markZupPeriodQualityCells_(sheet, scaffold, 2, 'C', quality);
  return { sheet: sheetName, rows: scaffold.length };
}

function fillZupVacationReconstruction_(spreadsheet, items, quality) {
  const sheet = spreadsheet.getSheetByName('Из_1С_Отпуска');
  if (!sheet) {
    throw new Error('Не найдена вкладка Из_1С_Отпуска.');
  }
  retargetZupReconstructionFormulas_(sheet);
  ensureZupAuxiliaryHeaders_(sheet, 1, [
    ['M', 'Период отпуска'],
    ['N', 'Ведомости выплат'],
    ['O', 'Дата ведомости выплат'],
  ]);
  prepareZupOutputRows_(sheet, 2, items.length, ['A', 'B', 'D', 'G', 'H', 'K', 'L', 'M', 'N', 'O']);
  clearZupReviewMarks_(sheet, 2, items.length, ['A', 'D', 'G', 'H']);
  clearZupSourceMarks_(sheet, 2, items.length, ['A', 'D', 'G', 'H', 'M', 'N', 'O']);
  writeZupColumn_(sheet, 2, 'A', items.map((item) => item.eventDate || ''));
  writeZupColumn_(sheet, 2, 'D', items.map((item) => numberOrBlank_(item.days)));
  writeZupColumn_(sheet, 2, 'G', items.map((item) => item.paymentDate || ''));
  writeZupColumn_(sheet, 2, 'H', items.map((item) => roundMoney_(item.amount || 0)));
  writeZupColumn_(sheet, 2, 'M', items.map((item) => item.vacationPeriod || ''));
  writeZupColumn_(sheet, 2, 'N', items.map((item) => formatZupStatements_(item)));
  writeZupColumn_(sheet, 2, 'O', items.map((item) => formatZupStatementDates_(item)));
  markZupVacationSourceCells_(sheet, items);
  markZupVacationReviewCells_(sheet, items);
  markZupPeriodQualityCells_(sheet, items, 2, 'A', quality);
  return { sheet: 'Из_1С_Отпуска', rows: items.length };
}

function prepareZupOutputRows_(sheet, dataStartRow, itemCount, clearColumns) {
  const bottomStartRow = findZupBottomLineStartRow_(sheet, dataStartRow);
  const currentDataEndRow = bottomStartRow ? bottomStartRow - 1 : sheet.getLastRow();
  const requiredLastRow = dataStartRow + Math.max(itemCount, 1) - 1;
  ensureZupSheetMaxRows_(sheet, requiredLastRow);
  copyZupTemplateRowsIfNeeded_(sheet, dataStartRow, requiredLastRow, bottomStartRow);
  const dataEndRow = Math.max(currentDataEndRow, requiredLastRow);
  const clearRowCount = Math.max(dataEndRow - dataStartRow + 1, 1);
  clearColumns.forEach((column) => {
    sheet.getRange(dataStartRow, columnLetterToIndex_(column) + 1, clearRowCount, 1).clearContent();
  });
  refreshZupBottomLineFormulas_(sheet, dataStartRow, requiredLastRow);
}

function ensureZupSheetMaxRows_(sheet, requiredLastRow) {
  const maxRows = sheet.getMaxRows ? sheet.getMaxRows() : sheet.getLastRow();
  if (maxRows < requiredLastRow) {
    sheet.insertRowsAfter(maxRows, requiredLastRow - maxRows);
  }
}

function copyZupTemplateRowsIfNeeded_(sheet, dataStartRow, requiredLastRow, bottomStartRow) {
  const currentDataEndRow = bottomStartRow ? bottomStartRow - 1 : sheet.getLastRow();
  if (currentDataEndRow >= requiredLastRow || currentDataEndRow < dataStartRow) {
    return;
  }
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const templateRow = Math.max(dataStartRow, currentDataEndRow);
  const templateRange = sheet.getRange(templateRow, 1, 1, lastColumn);
  const rowsToInsert = requiredLastRow - currentDataEndRow;
  if (bottomStartRow) {
    sheet.insertRowsBefore(bottomStartRow, rowsToInsert);
  }
  for (let row = currentDataEndRow + 1; row <= requiredLastRow; row++) {
    if (!bottomStartRow) {
      ensureZupSheetMaxRows_(sheet, row);
    }
    templateRange.copyTo(sheet.getRange(row, 1, 1, lastColumn), { contentsOnly: false });
  }
}

function ensureZupAuxiliaryHeaders_(sheet, headerRow, headers) {
  headers.forEach(([columnLetter, label]) => {
    const column = columnLetterToIndex_(columnLetter) + 1;
    const cell = sheet.getRange(headerRow, column);
    if (!String(cell.getValue() || '').trim()) {
      cell.setValue(label).setFontWeight('bold');
    }
  });
}

function findZupBottomLineStartRow_(sheet, dataStartRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < dataStartRow) {
    return null;
  }
  const values = sheet.getRange(dataStartRow, 1, lastRow - dataStartRow + 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues();
  for (let index = 0; index < values.length; index++) {
    const text = normalizeText_(values[index].join(' '));
    if (/^(итого|всего)|\b(итого|всего),?\s*руб/.test(text)) {
      return dataStartRow + index;
    }
  }
  return null;
}

function refreshZupBottomLineFormulas_(sheet, dataStartRow, dataEndRow) {
  const bottomStartRow = findZupBottomLineStartRow_(sheet, dataStartRow);
  if (!bottomStartRow || dataEndRow < dataStartRow) {
    return;
  }
  const rowCount = sheet.getLastRow() - bottomStartRow + 1;
  const columnCount = Math.max(sheet.getLastColumn(), 1);
  const range = sheet.getRange(bottomStartRow, 1, rowCount, columnCount);
  const formulas = range.getFormulas();
  formulas.forEach((row, rowIndex) => {
    row.forEach((formula, columnIndex) => {
      if (!formula || !/SUM/i.test(formula)) {
        return;
      }
      const updated = formula.replace(/([A-Z]+)\$?\d+:\1\$?\d+/g, (match, column) =>
        `${column}${dataStartRow}:${column}${dataEndRow}`
      );
      if (updated !== formula) {
        range.getCell(rowIndex + 1, columnIndex + 1).setFormula(updated);
      }
    });
  });
}

function writeZupColumn_(sheet, dataStartRow, columnLetter, values) {
  if (!values.length) {
    return;
  }
  sheet
    .getRange(dataStartRow, columnLetterToIndex_(columnLetter) + 1, values.length, 1)
    .setValues(values.map((value) => [value]));
}

function clearZupReviewMarks_(sheet, dataStartRow, rowCount, columnLetters) {
  if (!rowCount) {
    return;
  }
  columnLetters.forEach((columnLetter) => {
    sheet
      .getRange(dataStartRow, columnLetterToIndex_(columnLetter) + 1, rowCount, 1)
      .setBackground(null)
      .setNote('');
  });
}

function clearZupSourceMarks_(sheet, dataStartRow, rowCount, columnLetters) {
  if (!rowCount) {
    return;
  }
  columnLetters.forEach((columnLetter) => {
    sheet
      .getRange(dataStartRow, columnLetterToIndex_(columnLetter) + 1, rowCount, 1)
      .setBackground(null);
  });
}

function markZupReviewCell_(sheet, row, columnLetter, note) {
  sheet
    .getRange(row, columnLetterToIndex_(columnLetter) + 1)
    .setBackground(ZUP_IMPORT_SETTINGS.REVIEW_FILL)
    .setNote(note);
}

function markZupSourceCell_(sheet, row, columnLetter, note) {
  sheet
    .getRange(row, columnLetterToIndex_(columnLetter) + 1)
    .setBackground(ZUP_IMPORT_SETTINGS.SOURCE_FILL)
    .setNote(note);
}

function markZupSalarySourceCells_(sheet, scaffold, itemMap, productionCalendar) {
  scaffold.forEach((row, index) => {
    const sheetRow = 3 + index;
    const key = buildZupPeriodKey_(row.period);
    const item = row.item || itemMap[key];
    if (item && item.hasPaidDays) {
      markZupSourceCell_(sheet, sheetRow, 'A', `Фактически отработанные дни распределены на выплату "${row.part ? row.part.label : ''}" по рабочим дням периода. Источники: ${Object.keys(item.files).join(', ')}`);
    }
    if (row.workDays) {
      markZupSourceCell_(sheet, sheetRow, 'B', `Рабочие дни выплаты "${row.part ? row.part.label : ''}" рассчитаны по производственному календарю КонсультантПлюс.`);
    } else if (item && item.hasWorkDays) {
      markZupSourceCell_(sheet, sheetRow, 'B', `Рабочие дни из расчетного листка. Источники: ${Object.keys(item.files).join(', ')}`);
    }
    if (item && item.amount) {
      const topUpNote = item.salaryTopUpAmount
        ? ` Включена отдельная категория "Доплата до оклада": ${roundMoney_(item.salaryTopUpAmount)}.`
        : '';
      markZupSourceCell_(sheet, sheetRow, 'I', `Оклад и окладные доначисления распределены на выплату "${row.part ? row.part.label : ''}".${topUpNote} Источники: ${Object.keys(item.files).join(', ')}`);
    }
    if (row.statement) {
      markZupSourceCell_(sheet, sheetRow, 'Q', 'Ведомость выплаты из расчетного листка или восстановленная часть графика.');
    }
    if (row.dueDate) {
      markZupSourceCell_(sheet, sheetRow, 'R', 'Дата ведомости выплаты; используется для индексации и пеней по этой строке оклада.');
    }
  });
}

function markZupSalaryReviewCells_(sheet, scaffold, itemMap, productionCalendar) {
  scaffold.forEach((row, index) => {
    const sheetRow = 3 + index;
    const key = buildZupPeriodKey_(row.period);
    const item = row.item || itemMap[key];
    const hasCalendarWorkDays = Boolean(getZupWorkingDaysForPeriod_(row.period, productionCalendar));
    if (!item) {
      markZupReviewCell_(sheet, sheetRow, 'A', 'Нет оплаченных дней из расчетного листка за этот период.');
      if (!hasCalendarWorkDays) {
        markZupReviewCell_(sheet, sheetRow, 'B', 'Нет рабочих дней из расчетного листка и производственного календаря за этот период.');
      }
      markZupReviewCell_(sheet, sheetRow, 'I', 'Нет суммы оклада из расчетного листка за этот период.');
      return;
    }
    if (!item.amount) {
      markZupReviewCell_(sheet, sheetRow, 'I', 'Нет суммы оклада из расчетного листка за этот период.');
    }
    if (!item.hasPaidDays) {
      markZupReviewCell_(sheet, sheetRow, 'A', 'Сумма оклада найдена, но оплаченные дни не распознаны.');
    }
    if (!item.hasWorkDays && !hasCalendarWorkDays) {
      markZupReviewCell_(sheet, sheetRow, 'B', 'Сумма оклада найдена, но рабочие дни не распознаны.');
    }
    if (item.hasVlm) {
      markZupReviewCell_(sheet, sheetRow, 'I', `Оклад заполнен через VLM. Источники: ${Object.keys(item.files).join(', ')}`);
    }
    if (!row.dueDate) {
      markZupReviewCell_(sheet, sheetRow, 'R', `Не установлена дата выплаты для строки "${row.part ? row.part.label : ''}".`);
    }
  });
}

function markZupPremiumSourceCells_(sheet, scaffold, itemMap) {
  scaffold.forEach((row, index) => {
    const sheetRow = 2 + index;
    const item = itemMap[row.key];
    if (item && item.accrued) {
      markZupSourceCell_(sheet, sheetRow, 'F', `Начисленная премия из расчетного листка. Источники: ${Object.keys(item.files).join(', ')}`);
    }
    if (formatZupStatements_(item)) {
      markZupSourceCell_(sheet, sheetRow, 'J', 'Ведомости выплат из расчетного листка.');
      markZupSourceCell_(sheet, sheetRow, 'K', 'Даты ведомостей выплат из расчетного листка; используются для проверки пеней по ст. 236 ТК РФ.');
    }
  });
}

function markZupPremiumReviewCells_(sheet, scaffold, itemMap) {
  scaffold.forEach((row, index) => {
    const sheetRow = 2 + index;
    const item = itemMap[row.key];
    if (!item || !item.accrued) {
      markZupReviewCell_(sheet, sheetRow, 'F', 'Нет импортированной суммы премии для этой строки структуры.');
      return;
    }
    if (item.hasVlm) {
      markZupReviewCell_(sheet, sheetRow, 'F', `Премия заполнена через VLM. Источники: ${Object.keys(item.files).join(', ')}`);
    }
  });
}

function markZupVacationSourceCells_(sheet, items) {
  items.forEach((item, index) => {
    const sheetRow = 2 + index;
    if (item.paymentDate || item.eventDate) {
      markZupSourceCell_(sheet, sheetRow, 'A', `Дата из расчетного листка. Источник: ${item.file || ''}`);
      markZupSourceCell_(sheet, sheetRow, 'G', `Дата выплаты из расчетного листка. Источник: ${item.file || ''}`);
    }
    if (item.days) {
      markZupSourceCell_(sheet, sheetRow, 'D', `Дни отпуска из расчетного листка. Источник: ${item.file || ''}`);
    }
    if (item.amount) {
      markZupSourceCell_(sheet, sheetRow, 'H', `Начисленные отпускные из расчетного листка. Источник: ${item.file || ''}`);
    }
    if (item.vacationPeriod) {
      markZupSourceCell_(sheet, sheetRow, 'M', `Период отпуска из расчетного листка. Источник: ${item.file || ''}`);
    }
    if (formatZupStatements_(item)) {
      markZupSourceCell_(sheet, sheetRow, 'N', `Ведомость выплаты отпускных из расчетного листка. Источник: ${item.file || ''}`);
      markZupSourceCell_(sheet, sheetRow, 'O', `Дата ведомости выплаты отпускных из расчетного листка. Источник: ${item.file || ''}`);
    }
  });
}

function markZupVacationReviewCells_(sheet, items) {
  items.forEach((item, index) => {
    const sheetRow = 2 + index;
    if (!item.eventDate) {
      markZupReviewCell_(sheet, sheetRow, 'A', 'Не распознана дата события отпуска.');
    }
    if (!item.days) {
      markZupReviewCell_(sheet, sheetRow, 'D', 'Не распознано количество дней отпуска.');
    }
    if (!item.paymentDate) {
      markZupReviewCell_(sheet, sheetRow, 'G', 'Не распознана дата выплаты отпуска.');
    }
    if (item.amount === null || item.amount === undefined || item.amount === '') {
      markZupReviewCell_(sheet, sheetRow, 'H', 'Не распознана сумма отпуска.');
    } else if (item.needsReview) {
      markZupReviewCell_(sheet, sheetRow, 'H', `Несколько выплат отпуска в файле; требуется ручная сверка распределения. Источник: ${item.file || ''}`);
    } else if (item.isVlm) {
      markZupReviewCell_(sheet, sheetRow, 'H', `Отпускная сумма заполнена через VLM. Источник: ${item.file || ''}`);
    }
  });
}

function markZupPeriodQualityCells_(sheet, rows, dataStartRow, columnLetter, quality) {
  if (!quality || !quality.periodIssues) {
    return;
  }
  rows.forEach((row, index) => {
    const period = row.period || parseMonthYear_(row.label || '');
    if (!period || !period.year || !period.month) {
      return;
    }
    const issue = quality.periodIssues[buildZupPeriodKey_(period)];
    if (!issue) {
      return;
    }
    markZupReviewCell_(sheet, dataStartRow + index, columnLetter, issue);
  });
}

function markZupReconstructionCompany_(spreadsheet, company, quality) {
  getZupReconstructionConfigs_().forEach((config) => {
    const sheet = spreadsheet.getSheetByName(config.targetSheetName);
    if (!sheet) {
      return;
    }
    const cell = sheet.getRange('P2');
    cell.setValue(company || '');
    if (company && quality.companies.length === 1 && !quality.blankCompanyPeriods.length) {
      cell
        .setBackground(ZUP_IMPORT_SETTINGS.SOURCE_FILL)
        .setNote('Организация извлечена из расчетных листков.');
      return;
    }
    cell
      .setBackground(ZUP_IMPORT_SETTINGS.REVIEW_FILL)
      .setNote(buildZupCompanyQualityNote_(quality));
  });
}

function buildZupCompanyQualityNote_(quality) {
  const lines = [];
  if (quality.mainCompany) {
    lines.push(`Основная организация для заполнения: ${quality.mainCompany}.`);
  }
  if (quality.companies.length > 1) {
    lines.push(`В расчетных листках найдены другие организации: ${quality.companies.join(', ')}.`);
  }
  if (quality.blankCompanyPeriods.length) {
    lines.push(`Не распознана организация за периоды: ${quality.blankCompanyPeriods.join(', ')}.`);
  }
  return lines.join('\n') || 'Организация не распознана в расчетных листках.';
}

function updateZupReconstructionIndexationSheets_(spreadsheet) {
  const sheetNames = [
    'Из_1С_Оклад',
    'Из_1С_Ежемесячные',
    'Из_1С_Ежеквартальные',
    'Из_1С_Ежегодные',
    'Из_1С_Отпуска',
  ];
  return sheetNames
    .filter((sheetName) => spreadsheet.getSheetByName(sheetName))
    .map((sheetName) => updateZupReconstructionIndexationSheet_(spreadsheet, sheetName));
}

function updateZupReconstructionIndexationSheet_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Не найдена вкладка ${sheetName}.`);
  }
  return updateUnpaidSalaryIndexationCore_({ sheet });
}

function retargetZupReconstructionFormulas_(sheet) {
  const replacements = [
    ['Оклад', 'Из_1С_Оклад'],
    ['Ежемесячные', 'Из_1С_Ежемесячные'],
    ['Ежеквартальные', 'Из_1С_Ежеквартальные'],
    ['Ежегодные', 'Из_1С_Ежегодные'],
    ['Отпуска и расчет', 'Из_1С_Отпуска'],
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

function mergeZupSalaryScaffoldWithItems_(scaffold, items) {
  const map = {};
  (scaffold || []).forEach((row) => {
    map[buildZupPeriodKey_(row.period)] = row;
  });
  (items || []).forEach((item) => {
    const key = buildZupPeriodKey_(item.period);
    if (!map[key]) {
      map[key] = { period: item.period };
    }
  });
  return Object.keys(map)
    .map((key) => map[key])
    .sort((left, right) => left.period.year - right.period.year || left.period.month - right.period.month);
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

function mergeZupPremiumScaffoldWithItems_(scaffold, items, type) {
  const map = {};
  (scaffold || []).forEach((row) => {
    map[row.key] = row;
  });
  (items || []).forEach((item) => {
    const key = buildZupPremiumScaffoldKey_(item, type);
    if (key && !map[key]) {
      map[key] = {
        label: formatZupPremiumPeriodLabel_(item, type),
        key,
      };
    }
  });
  return Object.keys(map)
    .map((key) => map[key])
    .sort(compareZupScaffoldRows_);
}

function compareZupScaffoldRows_(left, right) {
  return getZupScaffoldSortKey_(left).localeCompare(getZupScaffoldSortKey_(right));
}

function getZupScaffoldSortKey_(row) {
  return String(row && row.key ? row.key : row && row.label ? row.label : '');
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
        accrued: 0,
        hasVlm: false,
        files: {},
        statements: {},
        statementDates: {},
      };
    }
    map[key].accrued += item.accrued || 0;
    map[key].hasVlm = map[key].hasVlm || item.hasVlm;
    Object.keys(item.files || {}).forEach((fileName) => {
      map[key].files[fileName] = true;
    });
    Object.keys(item.statements || {}).forEach((statement) => {
      map[key].statements[statement] = true;
    });
    Object.keys(item.statementDates || {}).forEach((date) => {
      map[key].statementDates[date] = true;
    });
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
    const sourceKey = normalizeZupSourceFileKey_(file.getName());
    const parentKey = getZupSourceParentKey_(file);
    const key = parentKey ? `${parentKey}::${sourceKey}` : sourceKey;
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

function getZupSourceParentKey_(file) {
  if (!file || typeof file.getParents !== 'function') {
    return '';
  }

  try {
    const parentIds = [];
    const parents = file.getParents();
    while (parents.hasNext()) {
      const parent = parents.next();
      const id = parent && typeof parent.getId === 'function' ? parent.getId() : '';
      if (id) {
        parentIds.push(String(id));
      }
    }
    return parentIds.sort().join('|');
  } catch (error) {
    return '';
  }
}

function normalizeZupSourceFileKey_(fileName) {
  return normalizeText_(fileName)
    .replace(/[_]+/g, ' ')
    .replace(/\.(html?|pdf|xlsx?|csv)$/i, '')
    .replace(/^\d+\.\s+/, '')
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
    return buildParsedZupResultWithVlmFallback_(file, parseZupSpreadsheet_(file.getId(), file.getName()), {
      sourceKind: 'spreadsheet',
    });
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.GOOGLE_DOCS_MIME) {
    return buildParsedZupResultWithVlmFallback_(file, parseZupGoogleDoc_(file.getId(), file.getName()), {
      sourceKind: 'document',
    });
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.CSV_MIME || /\.csv$/i.test(file.getName())) {
    const text = file.getBlob().getDataAsString('windows-1251');
    const grid = Utilities.parseCsv(text, detectCsvDelimiter_(text));
    return buildParsedZupResultWithVlmFallback_(file, parseZupGrid_(grid, file.getName(), 'CSV'), {
      sourceKind: 'text',
      text,
    });
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.HTML_MIME || /\.html?$/i.test(file.getName())) {
    const html = file.getBlob().getDataAsString('UTF-8');
    return buildParsedZupResultWithVlmFallback_(file, parseZupGrid_(htmlToZupGrid_(html), file.getName(), 'HTML'), {
      sourceKind: 'html',
      text: html,
    });
  }

  if (mimeType === ZUP_IMPORT_SETTINGS.PDF_MIME || /\.pdf$/i.test(file.getName())) {
    const parsed = parseZupPdfWithOcr_(file);
    return buildParsedZupResultWithVlmFallback_(file, parsed, {
      sourceKind: 'file',
      text: parsed.vlmText || '',
    });
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
      vlmRows: [],
    };
  }

  if (/^image\//i.test(mimeType)) {
    return buildParsedZupResultWithVlmFallback_(file, {
      rows: [],
      totals: buildEmptyZupTotals_(),
      warnings: ['Формат изображения передан в VLM fallback.'],
    }, {
      sourceKind: 'file',
    });
  }

  return {
    read: false,
    rows: [],
    skippedFiles: [[file.getName(), mimeType, 'Формат не поддержан импортером. Для PDF нужен OCR или дубль в Google Docs/HTML.']],
    quality: buildEmptyZupQualityData_(),
    vlmRows: [],
  };
}

function buildParsedZupResultWithVlmFallback_(file, parsed, options) {
  const deterministic = buildParsedZupResult_(file, parsed);
  const forceReason = getZupVlmForceReason_(file, deterministic, options || {});
  const forceVlm = Boolean(forceReason);
  if (deterministic.rows.length && !forceVlm) {
    return deterministic;
  }
  if (!forceVlm && !shouldUseZupVlmFallback_(file, deterministic, options)) {
    return deterministic;
  }

  const vlmOptions = Object.assign({}, options || {}, { forceVlm, forceReason });
  const vlmParsed = parseZupWithPolzaVlm_(file, parsed, vlmOptions);
  if (!vlmParsed) {
    return deterministic;
  }

  if (forceVlm && !vlmParsed.rows.length && deterministic.rows.length) {
    return buildParsedZupResult_(file, mergeZupVlmFailureWithDeterministicParsed_(parsed, vlmParsed));
  }

  const merged = mergeZupVlmFallbackParsed_(parsed, vlmParsed, {
    preferDeterministicTotals: deterministic.rows.length && forceReason === 'totalMismatch',
  });
  const vlmResult = buildParsedZupResult_(file, merged);
  if (
    deterministic.rows.length &&
    forceReason === 'totalMismatch' &&
    shouldKeepDeterministicZupResult_(deterministic, vlmResult)
  ) {
    const fallback = mergeZupVlmFailureWithDeterministicParsed_(parsed, vlmParsed);
    fallback.warnings.push('VLM-прогон не улучшил сверку с итогами; сохранены строки детерминированного парсера.');
    return buildParsedZupResult_(file, fallback);
  }
  return vlmResult;
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
    vlmRows: normalized.vlmRows || [],
  };
}

function mergeZupVlmFallbackParsed_(deterministicParsed, vlmParsed, options) {
  const deterministic = normalizeParsedZupData_(deterministicParsed);
  const vlm = normalizeParsedZupData_(vlmParsed);
  return {
    rows: vlm.rows,
    totals: options && options.preferDeterministicTotals && hasZupTotals_(deterministic.totals)
      ? deterministic.totals
      : (hasZupTotals_(vlm.totals) ? vlm.totals : deterministic.totals),
    company: vlm.company || deterministic.company,
    employee: vlm.employee || deterministic.employee,
    period: vlm.period || deterministic.period,
    warnings: deterministic.warnings.concat(vlm.warnings),
    vlmRows: vlm.vlmRows,
  };
}

function mergeZupVlmFailureWithDeterministicParsed_(deterministicParsed, vlmParsed) {
  const deterministic = normalizeParsedZupData_(deterministicParsed);
  const vlm = normalizeParsedZupData_(vlmParsed);
  return {
    rows: deterministic.rows,
    totals: deterministic.totals,
    company: deterministic.company,
    employee: deterministic.employee,
    period: deterministic.period,
    warnings: deterministic.warnings.concat(vlm.warnings),
    vlmRows: vlm.vlmRows,
  };
}

function hasZupTotals_(totals) {
  return Boolean(totals && (
    Math.abs(totals.accrued || 0) > 0.000001 ||
    Math.abs(totals.withheld || 0) > 0.000001 ||
    Math.abs(totals.paid || 0) > 0.000001
  ));
}

function shouldKeepDeterministicZupResult_(deterministicResult, vlmResult) {
  return getZupQualityMismatchScore_(vlmResult.quality) >= getZupQualityMismatchScore_(deterministicResult.quality);
}

function getZupQualityMismatchScore_(quality) {
  const source = quality && quality.sourceTotals ? quality.sourceTotals : buildEmptyZupTotals_();
  const recognized = quality && quality.recognizedTotals ? quality.recognizedTotals : buildEmptyZupTotals_();
  return ['accrued', 'withheld', 'paid'].reduce((score, key) => {
    const sourceAmount = source[key] || 0;
    if (!sourceAmount) {
      return score;
    }
    const diff = Math.abs(sourceAmount - (recognized[key] || 0));
    return diff > 0.01 ? score + diff : score;
  }, 0);
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
    parsed.vlmText = extractZupVlmTextFromGoogleDoc_(copied.id);
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

function extractZupVlmTextFromGoogleDoc_(documentId) {
  try {
    const body = DocumentApp.openById(documentId).getBody();
    const text = body.getText();
    return text && text.trim() ? text : '';
  } catch (error) {
    return '';
  }
}

function shouldUseZupVlmFallback_(file, parsedResult, options) {
  if (!ZUP_IMPORT_SETTINGS.ENABLE_VLM_FALLBACK) {
    return false;
  }

  const sourceKind = options && options.sourceKind;
  if (sourceKind === 'unsupported') {
    return false;
  }

  if (!parsedResult || parsedResult.rows.length) {
    return false;
  }

  const mimeType = file.getMimeType();
  return sourceKind === 'file' ||
    sourceKind === 'text' ||
    sourceKind === 'html' ||
    sourceKind === 'document' ||
    mimeType === ZUP_IMPORT_SETTINGS.PDF_MIME ||
    /^image\//i.test(mimeType);
}

function getZupVlmForceReason_(file, parsedResult, options) {
  const pattern = getZupVlmForcePattern_();
  if (matchesZupVlmForcePattern_(file, pattern)) {
    return 'pattern';
  }
  if (shouldRetryZupVlmForMultiSlipOcr_(parsedResult, options)) {
    return 'multiSlipOcr';
  }
  if (shouldRetryZupVlmForTotalMismatch_(parsedResult)) {
    return 'totalMismatch';
  }
  return '';
}

function matchesZupVlmForcePattern_(file, pattern) {
  if (!pattern) {
    return false;
  }
  if (pattern === '*') {
    return true;
  }

  const fileName = normalizeText_(file.getName());
  const tokens = pattern
    .split(/[;,\n]+/)
    .map((item) => normalizeText_(item))
    .filter(Boolean);
  return tokens.some((token) => fileName.includes(token));
}

function shouldRetryZupVlmForTotalMismatch_(parsedResult) {
  return Boolean(
    ZUP_IMPORT_SETTINGS.VLM_RETRY_ON_TOTAL_MISMATCH &&
    parsedResult &&
    parsedResult.rows &&
    parsedResult.rows.length &&
    getZupQualityMismatchScore_(parsedResult.quality) > 0.01
  );
}

function shouldRetryZupVlmForMultiSlipOcr_(parsedResult, options) {
  return Boolean(
    options &&
    options.sourceKind === 'file' &&
    options.text &&
    parsedResult &&
    parsedResult.rows &&
    parsedResult.rows.length &&
    countZupPayrollSlipMarkers_(options.text) > 1
  );
}

function countZupPayrollSlipMarkers_(text) {
  const matches = normalizeText_(text).match(/расчетн[а-яё]*\s+лист[а-яё]*/g) || [];
  return matches.length;
}

function getZupVlmForcePattern_() {
  const override = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.VLM_FORCE_PATTERN_PROPERTY).trim();
  if (/^(off|none|нет|выкл|-|0)$/i.test(override)) {
    return '';
  }
  return override || ZUP_IMPORT_SETTINGS.VLM_FORCE_PATTERN || '';
}

function decodeZupVlmResponse_(response) {
  const code = response.getResponseCode();
  const body = response.getContentText('UTF-8');
  if (code < 200 || code >= 300) {
    return {
      ok: false,
      warning: `Polza VLM вернула HTTP ${code}: ${body.slice(0, 500)}`,
      traceResponse: body,
      logPayload: body,
    };
  }

  let envelope;
  try {
    envelope = JSON.parse(body);
  } catch (error) {
    return {
      ok: false,
      warning: `Polza VLM вернула не-JSON ответ: ${String(error)}`,
      traceResponse: body,
      logPayload: body,
    };
  }

  const content = envelope &&
    envelope.choices &&
    envelope.choices[0] &&
    envelope.choices[0].message &&
    envelope.choices[0].message.content;
  if (!content) {
    return {
      ok: false,
      warning: 'Polza VLM не вернула message.content.',
      traceResponse: envelope,
      logPayload: body,
    };
  }

  let extracted;
  try {
    extracted = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (error) {
    return {
      ok: false,
      warning: `Polza VLM вернула content, который не парсится как JSON: ${String(error)}`,
      traceResponse: content,
      logPayload: content,
    };
  }

  return {
    ok: true,
    envelope,
    extracted,
  };
}

function buildZupVlmResponseFailure_(file, model, trace, requestPayload, startedAt, failure) {
  sendZupLangfuseVlmTrace_(trace, {
    status: 'ERROR',
    statusMessage: failure.warning,
    request: requestPayload,
    response: failure.traceResponse,
    startedAt,
    endedAt: new Date(),
    warnings: [failure.warning],
  });

  return buildEmptyZupVlmParsed_(
    file,
    failure.warning,
    model,
    failure.logPayload,
    trace.traceId
  );
}

function parseZupWithPolzaVlm_(file, parsed, options) {
  const apiKey = getZupPolzaApiKey_();
  if (!apiKey) {
    const warning = `VLM fallback не запущен: задайте Script property ${ZUP_IMPORT_SETTINGS.POLZA_API_KEY_PROPERTY}.`;
    return buildEmptyZupVlmParsed_(file, warning);
  }

  const model = getZupVlmModel_(file, options);
  const request = buildZupVlmRequest_(file, model, options || {});
  if (request.warning) {
    return buildEmptyZupVlmParsed_(file, request.warning, model);
  }

  const trace = createZupLangfuseTraceContext_(file, model, options || {});
  const startedAt = new Date();
  const response = UrlFetchApp.fetch(ZUP_IMPORT_SETTINGS.POLZA_ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify(request.payload),
    muteHttpExceptions: true,
  });

  const decoded = decodeZupVlmResponse_(response);
  if (!decoded.ok) {
    return buildZupVlmResponseFailure_(
      file,
      model,
      trace,
      request.payload,
      startedAt,
      decoded
    );
  }

  const envelope = decoded.envelope;
  const extracted = decoded.extracted;
  envelope._zupForceVlm = Boolean(options && options.forceVlm);
  envelope._zupForceReason = options && options.forceReason;
  const parsedVlm = convertPolzaVlmPayloadToZupParsed_(file, extracted, model, envelope);
  sendZupLangfuseVlmTrace_(trace, {
    status: 'OK',
    request: request.payload,
    response: extracted,
    envelope,
    startedAt,
    endedAt: new Date(),
    rows: parsedVlm.rows,
    warnings: parsedVlm.warnings,
  });
  parsedVlm.vlmRows = [buildZupVlmLogRow_(file, model, 'OK', parsedVlm.rows.length, envelope, extracted, parsedVlm.warnings, trace.traceId)];
  return parsedVlm;
}

function getZupPolzaApiKey_() {
  try {
    return PropertiesService
      .getScriptProperties()
      .getProperty(ZUP_IMPORT_SETTINGS.POLZA_API_KEY_PROPERTY);
  } catch (error) {
    return '';
  }
}

function getZupVlmModel_(file, options) {
  const override = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.VLM_MODEL_PROPERTY);
  if (override) {
    return override;
  }

  if (options && options.forceVlm) {
    return ZUP_IMPORT_SETTINGS.VLM_FORCE_MODEL || ZUP_IMPORT_SETTINGS.VLM_STRONG_MODEL;
  }

  const mimeType = file.getMimeType();
  if ((options && options.sourceKind === 'file') || mimeType === ZUP_IMPORT_SETTINGS.PDF_MIME) {
    return ZUP_IMPORT_SETTINGS.VLM_DEFAULT_MODEL;
  }

  return ZUP_IMPORT_SETTINGS.VLM_DEFAULT_MODEL;
}

function getZupScriptProperty_(name) {
  try {
    return PropertiesService.getScriptProperties().getProperty(name) || '';
  } catch (error) {
    return '';
  }
}

function getZupLangfuseConfig_() {
  const baseUrl = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.LANGFUSE_BASE_URL_PROPERTY).replace(/\/+$/, '');
  const publicKey = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.LANGFUSE_PUBLIC_KEY_PROPERTY);
  const secretKey = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.LANGFUSE_SECRET_KEY_PROPERTY);
  const enabledSetting = getZupScriptProperty_(ZUP_IMPORT_SETTINGS.LANGFUSE_ENABLED_PROPERTY);
  const disabled = /^(off|false|0|нет|выкл)$/i.test(String(enabledSetting || '').trim());
  return {
    enabled: Boolean(baseUrl && publicKey && secretKey && !disabled),
    baseUrl,
    publicKey,
    secretKey,
  };
}

function createZupLangfuseTraceContext_(file, model, options) {
  const fileId = typeof file.getId === 'function' ? file.getId() : '';
  return {
    traceId: `zup-${fileId || 'file'}-${Utilities.getUuid()}`,
    generationId: `zup-gen-${Utilities.getUuid()}`,
    fileId,
    fileName: file.getName(),
    mimeType: file.getMimeType(),
    model,
    options: options || {},
  };
}

function sendZupLangfuseVlmTrace_(trace, data) {
  const config = getZupLangfuseConfig_();
  if (!config.enabled || !trace) {
    return;
  }

  const startedAt = data.startedAt || new Date();
  const endedAt = data.endedAt || new Date();
  const usage = data.envelope && data.envelope.usage ? data.envelope.usage : {};
  const level = data.status === 'OK' ? 'DEFAULT' : 'ERROR';
  const metadata = {
    parserVersion: ZUP_IMPORT_SETTINGS.PARSER_VERSION,
    fileId: trace.fileId,
    fileName: trace.fileName,
    mimeType: trace.mimeType,
    forceVlm: Boolean(trace.options && trace.options.forceVlm),
    forceReason: trace.options && trace.options.forceReason || '',
    sourceKind: trace.options && trace.options.sourceKind || '',
    rowCount: data.rows ? data.rows.length : 0,
    warnings: data.warnings || [],
    costRub: usage.cost_rub || '',
  };

  sendZupLangfuseIngestion_(config, [
    {
      id: `evt-${Utilities.getUuid()}`,
      type: 'trace-create',
      timestamp: startedAt.toISOString(),
      body: {
        id: trace.traceId,
        name: 'zup-vlm-extraction',
        sessionId: 'zup-import',
        tags: ['zup', 'vlm', data.status === 'OK' ? 'ok' : 'error'],
        metadata,
        input: buildZupLangfuseInput_(trace, data),
        output: buildZupLangfuseOutput_(data),
      },
    },
    {
      id: `evt-${Utilities.getUuid()}`,
      type: 'generation-create',
      timestamp: startedAt.toISOString(),
      body: {
        id: trace.generationId,
        traceId: trace.traceId,
        name: 'polza-vlm-payroll-slip',
        startTime: startedAt.toISOString(),
        endTime: endedAt.toISOString(),
        model: trace.model,
        input: buildZupLangfuseInput_(trace, data),
        output: buildZupLangfuseOutput_(data),
        level,
        statusMessage: data.statusMessage || '',
        usage: {
          input: usage.prompt_tokens || 0,
          output: usage.completion_tokens || 0,
          total: usage.total_tokens || 0,
        },
        usageDetails: {
          input: usage.prompt_tokens || 0,
          output: usage.completion_tokens || 0,
          total: usage.total_tokens || 0,
        },
        metadata,
      },
    },
  ]);
}

function sendZupLangfuseQualityGateTrace_(qgRows) {
  const config = getZupLangfuseConfig_();
  if (!config.enabled || !qgRows || !qgRows.length) {
    return;
  }

  const traceId = `zup-qg-${Utilities.getUuid()}`;
  const now = new Date();
  sendZupLangfuseIngestion_(config, [{
    id: `evt-${Utilities.getUuid()}`,
    type: 'trace-create',
    timestamp: now.toISOString(),
    body: {
      id: traceId,
      name: 'zup-quality-gates',
      sessionId: 'zup-import',
      tags: ['zup', 'quality-gate'],
      metadata: {
        parserVersion: ZUP_IMPORT_SETTINGS.PARSER_VERSION,
        issueCount: qgRows.length,
        issuesByCheck: countZupQGRowsByColumn_(qgRows, 0),
        issuesBySeverity: countZupQGRowsByColumn_(qgRows, 1),
      },
      input: { sheet: ZUP_IMPORT_SETTINGS.QG_SHEET_NAME },
      output: truncateZupLangfuseValue_(qgRows),
    },
  }]);
}

function countZupQGRowsByColumn_(rows, index) {
  return rows.reduce((acc, row) => {
    const key = String(row[index] || 'пусто');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sendZupLangfuseIngestion_(config, batch) {
  try {
    const response = UrlFetchApp.fetch(`${config.baseUrl}/api/public/ingestion`, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: `Basic ${Utilities.base64Encode(`${config.publicKey}:${config.secretKey}`)}`,
      },
      payload: JSON.stringify({ batch }),
      muteHttpExceptions: true,
    });
    const code = response.getResponseCode();
    if (code < 200 || code >= 300) {
      Logger.log(`Langfuse ingestion HTTP ${code}: ${response.getContentText('UTF-8').slice(0, 500)}`);
    }
  } catch (error) {
    Logger.log(`Langfuse ingestion skipped: ${String(error)}`);
  }
}

function buildZupLangfuseInput_(trace, data) {
  return {
    fileName: trace.fileName,
    mimeType: trace.mimeType,
    model: trace.model,
    sourceKind: trace.options && trace.options.sourceKind || '',
    forceVlm: Boolean(trace.options && trace.options.forceVlm),
    forceReason: trace.options && trace.options.forceReason || '',
    prompt: extractZupLangfusePromptText_(data.request),
  };
}

function buildZupLangfuseOutput_(data) {
  return truncateZupLangfuseValue_({
    status: data.status,
    statusMessage: data.statusMessage || '',
    warnings: data.warnings || [],
    response: data.response || '',
    rowCount: data.rows ? data.rows.length : '',
  });
}

function extractZupLangfusePromptText_(request) {
  const messages = request && request.messages ? request.messages : [];
  return messages.map((message) => {
    const parts = Array.isArray(message.content) ? message.content : [{ type: 'text', text: message.content }];
    return parts
      .filter((part) => part && part.type === 'text')
      .map((part) => part.text || '')
      .join('\n');
  }).join('\n\n').slice(0, 12000);
}

function truncateZupLangfuseValue_(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || {});
  if (text.length <= 20000) {
    return value;
  }
  return {
    truncated: true,
    chars: text.length,
    preview: text.slice(0, 20000),
  };
}

function buildZupVlmRequest_(file, model, options) {
  const content = [{
    type: 'text',
    text: buildZupVlmPrompt_(file),
  }];

  if (options.text) {
    content.push({
      type: 'text',
      text: String(options.text).slice(0, ZUP_IMPORT_SETTINGS.VLM_MAX_TEXT_CHARS),
    });
  } else {
    const filePart = buildZupVlmFilePart_(file);
    if (filePart.warning) {
      return filePart;
    }
    content.push(filePart.part);
  }

  return {
    payload: {
      model,
      temperature: 0,
      max_tokens: 12000,
      messages: [
        {
          role: 'system',
          content: 'Ты извлекаешь строки расчетного листка 1С:ЗУП. Возвращай только данные по схеме, без пояснений.',
        },
        {
          role: 'user',
          content,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'zup_payroll_slip',
          strict: true,
          schema: buildZupVlmJsonSchema_(),
        },
      },
    },
  };
}

function buildZupVlmFilePart_(file) {
  const size = getZupFileSize_(file);
  if (size && size > ZUP_IMPORT_SETTINGS.VLM_MAX_FILE_BYTES) {
    return {
      warning: `VLM fallback пропущен: файл больше ${Math.round(ZUP_IMPORT_SETTINGS.VLM_MAX_FILE_BYTES / 1024 / 1024)} МБ.`,
    };
  }

  const blob = file.getBlob();
  const mimeType = blob.getContentType() || file.getMimeType();
  const base64 = Utilities.base64Encode(blob.getBytes());
  if (/^image\//i.test(mimeType)) {
    return {
      part: {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
        },
      },
    };
  }

  return {
    part: {
      type: 'file',
      file: {
        filename: file.getName(),
        file_data: `data:${mimeType};base64,${base64}`,
      },
    },
  };
}

function buildZupVlmPrompt_(file) {
  return [
    `Файл: ${file.getName()}`,
    'Извлеки расчетные листки из файла в строгую структуру. В одном файле или на одной странице может быть несколько расчетных листков за разные месяцы.',
    'Верни массив slips: отдельный объект на каждый расчетный листок/месяц/сотрудника. Не объединяй разные месяцы в один slip.',
    'Поддерживай 1С:ЗУП, ВТБ-таблицы и похожие расчетные формы. Названия секций нормализуй к Начислено, Удержано, Выплачено.',
    'Для каждого slip отдельно извлеки организацию-работодателя и сотрудника. В employee верни только ФИО человека без табельного номера, кадрового номера, кода в скобках и других служебных пометок. Если организация не видна, верни пустую строку.',
    'Нужны реальные строки начислений, выплат и удержаний: оклад, премии, отпускные, больничные, удержания, выплаты. Не включай справочные строки без денежного потока, если они не влияют на начислено/удержано/выплачено.',
    'Для начислений отдельно выделяй рабочие дни и оплачено дней, если они есть рядом с периодом строки. Если есть колонка "Оплачено" вида "18,00 дн.", заполни paidDays.',
    'Для каждой строки начисления верни accrualDate: полную дату начисления дохода или последний день периода начисления. Для премий с периодом 01.01-31.03 accrualDate должен быть 31.03 соответствующего года.',
    'Премии классифицируй по периоду начисления: месяц = ежемесячная, квартальный диапазон = ежеквартальная, год = ежегодная. Не дублируй выплаченную премию как начисленную.',
    'ВТБ-формат: строки с НДФЛ и удержаниями клади в Удержано, строки перечислений/карт/банка/ведомостей клади в Выплачено, строки "Итого по ведомости" используй только для сверки totals и не дублируй как row.',
    'Если листок содержит долг на начало/конец, не превращай его в начисление или выплату; можно упомянуть это в warnings.',
    'Даты возвращай в формате dd.MM.yyyy, период листка в формате MM.yyyy.',
    'Суммы возвращай числами в рублях, без пробелов и знаков валюты. Если суммы нет, возвращай 0.',
    'Категорию выбирай из: Оклад, Ежемесячные премии, Ежеквартальные премии, Ежегодные премии, Отпуска, Больничные, Отпуск без оплаты, Удержания, Выплаты, Материальная помощь, Командировки, Доплата до оклада, Сверхурочные и ночные, Праздники и выходные, Районные коэффициенты и надбавки, Совмещение и замещение, Выходное пособие, Прочее.',
    'В page верни номер страницы, если он понятен, иначе 0. В blockIndex верни порядковый номер расчетного листка внутри файла, начиная с 1.',
    'В sourceText положи короткий фрагмент исходной строки, по которому можно проверить извлечение; для строк из фото добавь узнаваемый текст строки.',
  ].join('\n');
}

function buildZupVlmJsonSchema_() {
  const amountProperties = {
    accrued: { type: 'number' },
    paid: { type: 'number' },
    withheld: { type: 'number' },
  };
  const rowSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      section: { type: 'string' },
      category: { type: 'string' },
      kind: { type: 'string' },
      period: { type: 'string' },
      accrualDate: { type: 'string' },
      year: { type: 'integer' },
      month: { type: 'integer' },
      workDays: { type: 'number' },
      paidDays: { type: 'number' },
      paymentDate: { type: 'string' },
      statement: { type: 'string' },
      statementDate: { type: 'string' },
      accrued: { type: 'number' },
      paid: { type: 'number' },
      withheld: { type: 'number' },
      sourceText: { type: 'string' },
      confidence: { type: 'number' },
    },
    required: [
      'section',
      'category',
      'kind',
      'period',
      'accrualDate',
      'year',
      'month',
      'workDays',
      'paidDays',
      'paymentDate',
      'statement',
      'statementDate',
      'accrued',
      'paid',
      'withheld',
      'sourceText',
      'confidence',
    ],
  };
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      slips: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            employee: { type: 'string' },
            company: { type: 'string' },
            period: { type: 'string' },
            year: { type: 'integer' },
            month: { type: 'integer' },
            page: { type: 'integer' },
            blockIndex: { type: 'integer' },
            totals: {
              type: 'object',
              additionalProperties: false,
              properties: amountProperties,
              required: ['accrued', 'paid', 'withheld'],
            },
            rows: {
              type: 'array',
              items: rowSchema,
            },
            warnings: {
              type: 'array',
              items: { type: 'string' },
            },
            confidence: { type: 'number' },
          },
          required: [
            'employee',
            'company',
            'period',
            'year',
            'month',
            'page',
            'blockIndex',
            'totals',
            'rows',
            'warnings',
            'confidence',
          ],
        },
      },
      warnings: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['slips', 'warnings'],
  };
}

function convertPolzaVlmPayloadToZupParsed_(file, payload, model, envelope) {
  const payloadData = payload || {};
  const slips = normalizePolzaVlmSlips_(payloadData);
  const rows = [];
  const totals = buildEmptyZupTotals_();
  const warnings = (payloadData.warnings || []).slice();
  let company = '';
  let employee = '';
  let firstPeriod = null;

  slips.forEach((slip, index) => {
    const period = parseMonthYear_(slip.period) || {
      year: Number(slip.year) || '',
      month: Number(slip.month) || '',
    };
    if (!company && slip.company) {
      company = slip.company;
    }
    if (!employee && slip.employee) {
      employee = slip.employee;
    }
    if (!firstPeriod && period && period.year && period.month) {
      firstPeriod = period;
    }

    const slipTotals = normalizeZupVlmTotals_(slip.totals);
    totals.accrued += slipTotals.accrued || 0;
    totals.withheld += slipTotals.withheld || 0;
    totals.paid += slipTotals.paid || 0;
    (slip.warnings || []).forEach((warning) => {
      warnings.push(`Slip ${slip.blockIndex || index + 1}: ${warning}`);
    });

    (slip.rows || []).forEach((row) => {
      const converted = convertPolzaVlmRowToZupRow_(file, row, slip, period);
      if (converted) {
        rows.push(converted);
      }
    });
  });

  warnings.unshift(`Строки извлечены через Polza VLM (${model}); требуется сверка по sourceText/confidence.`);
  if (slips.length > 1) {
    warnings.unshift(`VLM распознал несколько расчетных листков в одном файле: ${slips.length}.`);
  }
  if (envelope && envelope._zupForceVlm) {
    if (envelope._zupForceReason === 'totalMismatch') {
      warnings.unshift('Файл перечитан через VLM автоматически из-за расхождения с итогами расчетного листка.');
    } else if (envelope._zupForceReason === 'multiSlipOcr') {
      warnings.unshift('Файл перечитан через VLM автоматически: OCR-текст содержит несколько расчетных листков.');
    } else {
      warnings.unshift('Файл принудительно перечитан через VLM по ZUP_VLM_FORCE_PATTERN.');
    }
  }
  if (envelope && envelope.usage && envelope.usage.cost_rub) {
    warnings.push(`Стоимость VLM-запроса: ${envelope.usage.cost_rub} ₽.`);
  }

  return {
    rows,
    totals,
    company,
    employee,
    period: firstPeriod,
    warnings,
    vlmRows: [],
  };
}

function normalizePolzaVlmSlips_(payload) {
  const data = payload || {};
  if (Array.isArray(data.slips) && data.slips.length) {
    return data.slips.map((slip, index) => normalizePolzaVlmSlip_(slip, data, index));
  }
  return [normalizePolzaVlmSlip_(data, data, 0)];
}

function normalizePolzaVlmSlip_(slip, fallback, index) {
  const source = slip || {};
  const fallbackData = fallback || {};
  return {
    employee: source.employee || fallbackData.employee || '',
    company: source.company || fallbackData.company || '',
    period: source.period || fallbackData.period || '',
    year: source.year || fallbackData.year || '',
    month: source.month || fallbackData.month || '',
    page: Number(source.page) || 0,
    blockIndex: Number(source.blockIndex) || index + 1,
    totals: source.totals || fallbackData.totals || buildEmptyZupTotals_(),
    rows: source.rows || [],
    warnings: source.warnings || [],
    confidence: source.confidence || '',
  };
}

function convertPolzaVlmRowToZupRow_(file, row, slip, fallbackPeriod) {
  const period = parseMonthYear_(row.period) ||
    (row.year && row.month ? { year: Number(row.year), month: Number(row.month) } : null) ||
    fallbackPeriod;
  if (!period || !period.year || !period.month) {
    return null;
  }

  const section = normalizeZupVlmSection_(row.section, row);
  const category = normalizeZupVlmCategory_(row.category, row.kind || row.sourceText || '', section);
  const accrualDate = normalizeZupVlmAccrualDate_(row.accrualDate, period);
  const periodForColumns = accrualDate
    ? { year: accrualDate.getFullYear(), month: accrualDate.getMonth() + 1 }
    : period;
  const accrued = normalizeZupVlmAmount_(row.accrued);
  const paid = normalizeZupVlmAmount_(row.paid);
  const withheld = normalizeZupVlmAmount_(row.withheld);
  if (accrued === '' && paid === '' && withheld === '') {
    return null;
  }

  return [
    file.getName(),
    'Polza VLM',
    slip.company || '',
    slip.employee || '',
    formatZupPeriod_(period),
    accrualDate ? formatDate_(accrualDate) : '',
    periodForColumns.year,
    periodForColumns.month,
    normalizeZupVlmDayCount_(row.workDays),
    normalizeZupVlmDayCount_(row.paidDays),
    normalizeZupVlmDate_(row.paymentDate),
    row.statement || '',
    normalizeZupVlmDate_(row.statementDate),
    section,
    category,
    row.kind || row.sourceText || category,
    accrued,
    paid,
    withheld,
    buildZupVlmSourceText_(row, slip),
  ];
}

function buildZupVlmSourceText_(row, slip) {
  const parts = [];
  if (slip && slip.page) {
    parts.push(`стр. ${slip.page}`);
  }
  if (slip && slip.blockIndex) {
    parts.push(`блок ${slip.blockIndex}`);
  }
  if (row && row.confidence) {
    parts.push(`confidence ${row.confidence}`);
  }
  const prefix = parts.length ? `[VLM ${parts.join(', ')}] ` : '[VLM] ';
  return `${prefix}${row && row.sourceText ? row.sourceText : ''}`.trim();
}

function normalizeZupVlmSection_(section, row) {
  const normalized = normalizeText_(section);
  if (normalized.includes('выплат') || (row.paid && !row.accrued && !row.withheld)) {
    return 'Выплачено';
  }
  if (normalized.includes('удерж') || (row.withheld && !row.accrued && !row.paid)) {
    return 'Удержано';
  }
  return 'Начислено';
}

function normalizeZupVlmCategory_(category, text, section) {
  const normalized = String(category || '').trim();
  const detected = detectZupCategory_(text || '');
  if (normalized && !/^(Прочее|Выплаты)$/i.test(normalized)) {
    return normalized;
  }
  if (detected) {
    return detected;
  }
  if (normalizeText_(section) === 'удержано') {
    return 'Удержания';
  }
  if (normalizeText_(section) === 'выплачено') {
    return 'Выплаты';
  }
  return detectZupCategory_(text || '') || 'Прочее';
}

function normalizeZupVlmAmount_(value) {
  const amount = parseMoney_(value);
  return amount && Math.abs(amount) > 0.000001 ? roundMoney_(amount) : '';
}

function normalizeZupVlmDayCount_(value) {
  const days = parseMoney_(value);
  return days && days > 0 ? roundNumber_(days, 2) : '';
}

function normalizeZupVlmDate_(value) {
  const parsed = parseDateValue_(value);
  return parsed ? formatDate_(parsed) : '';
}

function normalizeZupVlmAccrualDate_(value, period) {
  const parsed = parseDateValue_(value);
  if (parsed) {
    return parsed;
  }
  return period && period.year && period.month ? new Date(period.year, period.month, 0) : null;
}

function normalizeZupVlmTotals_(totals) {
  const source = totals || {};
  return {
    accrued: parseMoney_(source.accrued) || 0,
    withheld: parseMoney_(source.withheld) || 0,
    paid: parseMoney_(source.paid) || 0,
  };
}

function buildEmptyZupVlmParsed_(file, warning, model, rawJson, traceId) {
  const usedModel = model || getZupVlmModel_(file, {});
  return {
    rows: [],
    totals: buildEmptyZupTotals_(),
    employee: '',
    company: '',
    period: null,
    warnings: [warning],
    vlmRows: [buildZupVlmLogRow_(file, usedModel, 'Ошибка', 0, null, rawJson || '', [warning], traceId)],
  };
}

function buildZupVlmLogRow_(file, model, status, rowCount, envelope, payload, warnings, traceId) {
  const usage = envelope && envelope.usage ? envelope.usage : {};
  return [
    file.getName(),
    file.getMimeType(),
    model,
    status,
    rowCount,
    usage.cost_rub || '',
    usage.prompt_tokens || '',
    usage.completion_tokens || '',
    usage.total_tokens || '',
    traceId || '',
    (warnings || []).join('\n'),
    typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
  ];
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
    company: extractZupCompany_(values) || '',
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
      company: parsed.length ? parsed[0][ZUP_IMPORT_COLUMNS.company] : '',
      employee: parsed.length ? parsed[0][ZUP_IMPORT_COLUMNS.employee] : '',
      period: parsed.length ? parseMonthYear_(parsed[0][ZUP_IMPORT_COLUMNS.period]) : null,
      warnings: [],
      vlmRows: [],
    };
  }

  const data = parsed || {};
  return {
    rows: data.rows || [],
    totals: data.totals || buildEmptyZupTotals_(),
    company: data.company || (data.rows && data.rows.length ? data.rows[0][ZUP_IMPORT_COLUMNS.company] : ''),
    employee: data.employee || (data.rows && data.rows.length ? data.rows[0][ZUP_IMPORT_COLUMNS.employee] : ''),
    period: data.period || (data.rows && data.rows.length ? parseMonthYear_(data.rows[0][ZUP_IMPORT_COLUMNS.period]) : null),
    warnings: data.warnings || [],
    vlmRows: data.vlmRows || [],
  };
}

function combineParsedZupData_(items) {
  const combined = {
    rows: [],
    totals: buildEmptyZupTotals_(),
    company: '',
    employee: '',
    period: null,
    warnings: [],
    vlmRows: [],
  };

  items.forEach((item) => {
    const normalized = normalizeParsedZupData_(item);
    combined.rows.push(...normalized.rows);
    combined.totals.accrued += normalized.totals.accrued || 0;
    combined.totals.withheld += normalized.totals.withheld || 0;
    combined.totals.paid += normalized.totals.paid || 0;
    combined.company = combined.company || normalized.company;
    combined.employee = combined.employee || normalized.employee;
    combined.period = combined.period || normalized.period;
    combined.warnings.push(...normalized.warnings);
    combined.vlmRows.push(...(normalized.vlmRows || []));
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
    company: '',
    employee: '',
    period: '',
    sourceTotals: buildEmptyZupTotals_(),
    recognizedTotals: buildEmptyZupTotals_(),
    warnings: [],
  };
}

function buildZupParsedQuality_(parsed) {
  const quality = buildEmptyZupQualityData_();
  quality.company = parsed.company || '';
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
  const company = extractZupCompany_(values) || '';
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
        company,
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

  const amount = extractZupAmountFromSegment_(segment);
  if (amount === null) {
    return null;
  }

  const period = resolveZupRowPeriod_(segment, context);
  const accrualDate = resolveZupAccrualDate_(segment.cells, period, context);
  const periodForColumns = accrualDate
    ? { year: accrualDate.getFullYear(), month: accrualDate.getMonth() + 1 }
    : period;
  const paymentStatement = extractZupPaymentStatement_(segment.cells);
  const paymentDate = paymentStatement.date || extractZupPaymentDateFromCells_(segment.cells);
  const dayColumns = extractZupDayColumns_(segment.cells, segment.section);
  const amountColumns = buildZupAmountColumns_(segment.section, amount);
  return [
    context.sourceFileName,
    context.sourceSheetName,
    context.company,
    context.employee,
    period ? formatZupPeriod_(period) : '',
    accrualDate ? formatDate_(accrualDate) : '',
    periodForColumns ? periodForColumns.year : '',
    periodForColumns ? periodForColumns.month : '',
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
  const moneyIndex = compactCells.findIndex((cell) => parseMoney_(cell) !== null && isLikelyZupMoneyCell_(cell));
  const dayCells = compactCells
    .slice(periodIndex >= 0 ? periodIndex + 1 : 0, moneyIndex >= 0 ? moneyIndex : compactCells.length)
    .map((cell) => parseZupDayCount_(cell))
    .filter((days) => days !== null && days > 0 && days <= 31);
  const workDays = periodIndex >= 0
    ? parseZupDayCount_(compactCells[periodIndex + 1])
    : dayCells[0];
  const paidDays = periodIndex >= 0
    ? parseZupDayCount_(compactCells[periodIndex + 3])
    : dayCells[dayCells.length - 1];
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

  const rule = ZUP_CATEGORY_RULES.find((candidate) =>
    candidate.patterns.some((pattern) => normalizedText.includes(normalizeText_(pattern)))
  );
  if (rule) {
    return rule.category;
  }

  if (/(отпуск|отпускные|компенсация отпуска)/.test(normalizedText)) {
    return 'Отпуска';
  }

  return '';
}

function extractZupCompany_(values) {
  for (let rowIndex = 0; rowIndex < Math.min(values.length, 30); rowIndex++) {
    const row = values[rowIndex] || [];
    const company = extractZupLabeledHeaderValue_(row, /организация|работодатель/i);
    if (company) {
      return company;
    }
  }
  return '';
}

function extractZupEmployee_(values) {
  for (let rowIndex = 0; rowIndex < Math.min(values.length, 30); rowIndex++) {
    const row = values[rowIndex] || [];
    const employee = extractZupLabeledHeaderValue_(row, /сотрудник|фио/i);
    if (employee) {
      return cleanZupEmployeeHeaderValue_(employee);
    }

    if (
      rowIndex <= 5 &&
      looksLikeZupEmployeeHeader_(row[0])
    ) {
      return cleanZupEmployeeHeaderValue_(row[0]);
    }
  }
  return '';
}

function extractZupLabeledHeaderValue_(row, labelPattern) {
  const exactPattern = new RegExp(`^(?:${labelPattern.source})\\s*:?$`, 'i');
  const inlinePattern = new RegExp(`(?:^|\\s)(?:${labelPattern.source})\\s*:?\\s*(.*)$`, 'i');
  const cells = (row || []).map((cell) => String(cell || '').replace(/\s+/g, ' ').trim());

  for (let columnIndex = 0; columnIndex < cells.length; columnIndex++) {
    const cell = cells[columnIndex];
    if (!cell) {
      continue;
    }

    if (exactPattern.test(cell)) {
      for (let nextIndex = columnIndex + 1; nextIndex < cells.length; nextIndex++) {
        if (cells[nextIndex]) {
          return cleanZupHeaderValue_(cells[nextIndex]);
        }
      }
      return '';
    }

    const inline = cell.match(inlinePattern);
    if (inline && inline[1]) {
      return cleanZupHeaderValue_(inline[1]);
    }
  }

  return '';
}

function cleanZupHeaderValue_(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(
      /\s+(?:организация|работодатель|подразделение|сотрудник|фио|расчетный\s+период|период|месяц|должность|табельный(?:\s+номер)?|кадровый(?:\s+номер)?|начислено|удержано|выплачено)\s*:?.*$/i,
      ''
    )
    .trim();
}

function cleanZupEmployeeHeaderValue_(value) {
  return cleanZupHeaderValue_(value)
    .replace(/\s*\([^)]+\)\s*$/, '')
    .trim();
}

function looksLikeZupEmployeeHeader_(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!/\([^)]+\)\s*$/.test(text)) {
    return false;
  }
  const name = text.replace(/\s*\([^)]+\)\s*$/, '').trim();
  const words = name.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 4 && words.every((word) =>
    /^[А-ЯЁ][А-ЯЁа-яё'-]+$/.test(word)
  );
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
  return extractZupPeriodFromCells_(segment.cells) || context.period;
}

function resolveZupAccrualDate_(cells, period, context) {
  const text = cells.join(' ');
  const range = text.match(/(\d{1,2})[.](\d{1,2})(?:[.](20\d{2}))?\s*[-–]\s*(\d{1,2})[.](\d{1,2})(?:[.](20\d{2}))?/);
  if (range) {
    const year = Number(range[6] || range[3]) || (period && period.year) || (context.period && context.period.year);
    const date = parseDateValue_(`${range[4]}.${range[5]}.${year}`);
    if (date) {
      return date;
    }
  }
  if (period && period.year && period.month) {
    return new Date(period.year, period.month, 0);
  }
  return null;
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

  const dates = text.match(/\d{1,2}[./]\d{1,2}[./]\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g) || [];
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

function extractZupAmountFromSegment_(segment) {
  const compactCells = segment.cells
    .map((cell) => String(cell || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const moneyCells = compactCells
    .map((cell) => ({
      text: cell,
      amount: parseMoney_(cell),
    }))
    .filter((item) => item.amount !== null && isLikelyZupMoneyCell_(item.text));

  if (!moneyCells.length) {
    return null;
  }

  const normalizedSection = normalizeText_(segment.section);
  if (normalizedSection === 'начислено') {
    const afterDayCount = moneyCells.filter((item) =>
      !/^\d{1,2}(?:[,.]\d{1,2})?(?:\s*дн\.)?$/i.test(item.text) &&
      !/^\d{1,3}(?:[,.]\d{1,2})?$/.test(item.text)
    );
    return afterDayCount.length ? afterDayCount[afterDayCount.length - 1].amount : null;
  }

  return moneyCells[moneyCells.length - 1].amount;
}

function isLikelyZupMoneyCell_(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text || /[а-яёa-z]/i.test(text)) {
    return false;
  }

  const compact = text.replace(/\s/g, '');
  if (/^-?\d+[,.]\d{2}$/.test(compact)) {
    return true;
  }
  if (/^-?\d{1,3}(?:\s\d{3})+(?:[,.]\d{1,2})?$/.test(text)) {
    return true;
  }

  const number = parseMoney_(text);
  return number !== null && Math.abs(number) >= 1000;
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
    sheet.getRange(2, ZUP_IMPORT_COLUMNS.accrualDate + 1, rows.length, 1).setNumberFormat('dd.mm.yyyy');
    sheet.getRange(2, ZUP_IMPORT_COLUMNS.workDays + 1, rows.length, 2).setNumberFormat('0.00');
    sheet.getRange(2, ZUP_IMPORT_COLUMNS.accrued + 1, rows.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
    highlightZupRows_(sheet, rows, 2, ZUP_IMPORT_HEADERS.length, (row) =>
      row[ZUP_IMPORT_COLUMNS.sheet] === 'Polza VLM' ||
      row[ZUP_IMPORT_COLUMNS.category] === 'Прочее'
    );
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

function writeZupPaymentStructureSheet_(spreadsheet, rows) {
  const structureRows = buildZupPaymentStructureRows_(rows);
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.PAYMENT_STRUCTURE_SHEET_NAME);
  writeZupSheetData_(sheet, [ZUP_PAYMENT_STRUCTURE_HEADERS].concat(structureRows));
  if (structureRows.length) {
    sheet.getRange(2, 9, structureRows.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
    sheet.getRange(2, 13, structureRows.length, 1).setWrap(true);
    highlightZupRows_(sheet, structureRows, 2, ZUP_PAYMENT_STRUCTURE_HEADERS.length, (row) =>
      row[4] === 'salary_top_up' || row[2] === 'Прочее'
    );
  }
}

function buildZupPaymentStructureRows_(rows) {
  const map = {};
  rows.forEach((row) => {
    const company = row[ZUP_IMPORT_COLUMNS.company] || 'Организация не распознана';
    const section = row[ZUP_IMPORT_COLUMNS.section] || '';
    const category = row[ZUP_IMPORT_COLUMNS.category] || 'Прочее';
    const kind = row[ZUP_IMPORT_COLUMNS.kind] || category;
    const key = [normalizeZupCompanyName_(company) || company, section, category, kind].join('|');
    if (!map[key]) {
      map[key] = {
        company,
        section,
        category,
        kind,
        role: resolveZupPaymentStructureRole_(section, category),
        count: 0,
        periods: {},
        files: {},
        accrued: 0,
        paid: 0,
        withheld: 0,
      };
    }
    const item = map[key];
    const period = normalizeZupImportPeriod_(
      row[ZUP_IMPORT_COLUMNS.year],
      row[ZUP_IMPORT_COLUMNS.month],
      row[ZUP_IMPORT_COLUMNS.period]
    );
    if (period && period.year && period.month) {
      item.periods[buildZupPeriodKey_(period)] = formatZupPeriod_(period);
    }
    if (row[ZUP_IMPORT_COLUMNS.file]) {
      item.files[row[ZUP_IMPORT_COLUMNS.file]] = true;
    }
    item.accrued += parseMoney_(row[ZUP_IMPORT_COLUMNS.accrued]) || 0;
    item.paid += parseMoney_(row[ZUP_IMPORT_COLUMNS.paid]) || 0;
    item.withheld += parseMoney_(row[ZUP_IMPORT_COLUMNS.withheld]) || 0;
    item.count++;
  });

  return Object.keys(map)
    .sort()
    .map((key) => {
      const item = map[key];
      const periodKeys = Object.keys(item.periods).sort();
      const files = Object.keys(item.files).sort();
      const json = {
        company: item.company,
        section: item.section,
        category: item.category,
        kind: item.kind,
        calculationRole: item.role,
        rowPolicy: 'keep_source_rows_separate',
        totals: {
          accrued: roundMoney_(item.accrued),
          paid: roundMoney_(item.paid),
          withheld: roundMoney_(item.withheld),
        },
        periods: periodKeys.map((periodKey) => item.periods[periodKey]),
        files,
      };
      return [
        item.company,
        item.section,
        item.category,
        item.kind,
        item.role,
        item.count,
        periodKeys.length ? item.periods[periodKeys[0]] : '',
        periodKeys.length ? item.periods[periodKeys[periodKeys.length - 1]] : '',
        roundMoney_(item.accrued),
        roundMoney_(item.paid),
        roundMoney_(item.withheld),
        files.join('\n'),
        JSON.stringify(json),
      ];
    });
}

function resolveZupPaymentStructureRole_(section, category) {
  if (normalizeText_(section) === 'удержано') {
    return 'withholding';
  }
  if (normalizeText_(section) === 'выплачено') {
    return 'payment';
  }
  if (category === 'Доплата до оклада') {
    return 'salary_top_up';
  }
  if (category === 'Оклад') {
    return 'salary_base';
  }
  if (/премии$/.test(category)) {
    return 'premium';
  }
  if (category === 'Отпуска') {
    return 'vacation';
  }
  if (category === 'Больничные') {
    return 'sick_leave';
  }
  return 'other_accrual';
}

function writeZupQualitySheet_(spreadsheet, qualityRows, dryRun) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.QUALITY_SHEET_NAME);
  writeZupSheetData_(sheet, [ZUP_QUALITY_HEADERS].concat(qualityRows));
  if (dryRun && sheet.getRange) {
    sheet.getRange(1, 1).setNote(`Проверка без перезаписи основных листов. Обновлено: ${new Date()}`);
  }
  if (qualityRows.length) {
    sheet.getRange(2, 10, qualityRows.length, 6).setNumberFormat(SETTINGS.MONEY_FORMAT);
    highlightZupRows_(sheet, qualityRows, 2, ZUP_QUALITY_HEADERS.length, (row) =>
      row[4] && row[4] !== 'OK' && row[4] !== 'Не изменился'
    );
  }
}

function writeZupVlmLogSheet_(spreadsheet, vlmRows, dryRun) {
  if (!vlmRows.length && !spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.VLM_LOG_SHEET_NAME)) {
    return;
  }

  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.VLM_LOG_SHEET_NAME);
  writeZupSheetData_(sheet, [ZUP_VLM_LOG_HEADERS].concat(vlmRows));
  if (dryRun && sheet.getRange) {
    sheet.getRange(1, 1).setNote(`VLM fallback log для проверки без перезаписи. Обновлено: ${new Date()}`);
  }
  if (vlmRows.length) {
    sheet.getRange(2, 6, vlmRows.length, 4).setNumberFormat('0.000000');
    highlightZupRows_(sheet, vlmRows, 2, ZUP_VLM_LOG_HEADERS.length, () => true);
  }
}

function clearZupVlmLogSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.VLM_LOG_SHEET_NAME);
  if (sheet) {
    sheet.clear();
  }
}

function writeZupQualityGateSheet_(spreadsheet, qgRows) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.QG_SHEET_NAME);
  const rows = qgRows && qgRows.length
    ? qgRows
    : [[
      'Quality gates',
      'Инфо',
      'OK',
      '',
      '',
      '',
      '',
      '',
      'Проблем для ручной проверки не найдено.',
      '',
    ]];
  writeZupSheetData_(sheet, [ZUP_QG_HEADERS].concat(rows));
  if (rows.length) {
    highlightZupRows_(sheet, rows, 2, ZUP_QG_HEADERS.length, (row) =>
      row[1] !== 'Инфо'
    );
  }
  sendZupLangfuseQualityGateTrace_(qgRows || []);
}

function buildZupQualityGateRows_(rows, qualityRowsInput) {
  const rowObjects = rows.map(convertZupImportArrayToIssueObject_);
  const quality = buildZupReconstructionQuality_(rowObjects);
  const issues = [];
  addZupCompanyQualityIssues_(issues, rowObjects, quality);
  addZupEmployeeQualityIssues_(issues, rowObjects, quality);
  addZupMissingMonthIssues_(issues, quality);
  addZupFileQualityIssues_(issues, qualityRowsInput);
  addZupCompletenessIssues_(issues, rowObjects);
  addZupPartialSalaryExplanationIssues_(issues, rowObjects);
  return dedupeZupQGRows_(issues);
}

function dedupeZupQGRows_(rows) {
  const seen = {};
  return rows.filter((row) => {
    const key = row.join('|');
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
}

function convertZupImportArrayToIssueObject_(row) {
  return {
    file: row[ZUP_IMPORT_COLUMNS.file],
    company: row[ZUP_IMPORT_COLUMNS.company],
    employee: row[ZUP_IMPORT_COLUMNS.employee],
    period: normalizeZupImportPeriod_(row[ZUP_IMPORT_COLUMNS.year], row[ZUP_IMPORT_COLUMNS.month], row[ZUP_IMPORT_COLUMNS.period]),
    section: row[ZUP_IMPORT_COLUMNS.section],
    category: row[ZUP_IMPORT_COLUMNS.category],
    kind: row[ZUP_IMPORT_COLUMNS.kind],
    workDays: parseMoney_(row[ZUP_IMPORT_COLUMNS.workDays]),
    paidDays: parseMoney_(row[ZUP_IMPORT_COLUMNS.paidDays]),
    accrued: parseMoney_(row[ZUP_IMPORT_COLUMNS.accrued]),
    paid: parseMoney_(row[ZUP_IMPORT_COLUMNS.paid]),
    withheld: parseMoney_(row[ZUP_IMPORT_COLUMNS.withheld]),
    sourceRow: row[ZUP_IMPORT_COLUMNS.sourceRow],
  };
}

function addZupCompanyQualityIssues_(issues, rows, quality) {
  if (!quality.mainCompany) {
    issues.push(buildZupQGRow_('Организация', 'Предупреждение', '', '', '', '', 'Организация не распознана ни в одном расчетном листке.', 'Проверить исходные файлы и при необходимости заполнить вручную.'));
    return;
  }
  if (quality.companies.length > 1) {
    issues.push(buildZupQGRow_('Организация', 'Предупреждение', '', '', quality.companies.join(', '), '', `Найдены разные организации; основной для заполнения считается ${quality.mainCompany}.`, 'Проверить месяцы с другой организацией, рыжие ячейки в Из_1С.'));
  }
  rows.forEach((row) => {
    const company = normalizeZupCompanyName_(row.company);
    if (!company || company === quality.mainCompany) {
      return;
    }
    issues.push(buildZupQGRow_('Организация', 'Предупреждение', row.file, formatZupPeriod_(row.period), company, row.employee, `Организация отличается от основной: ${quality.mainCompany}.`, 'Проверить исходный расчетный листок и рыжую ячейку периода.'));
  });
  rows.forEach((row) => {
    if (normalizeZupCompanyName_(row.company)) {
      return;
    }
    issues.push(buildZupQGRow_('Организация', 'Предупреждение', row.file, formatZupPeriod_(row.period), '', row.employee, 'Организация не распознана для периода.', 'Проверить исходный расчетный листок; таблица заполнена по основной организации.'));
  });
}

function addZupEmployeeQualityIssues_(issues, rows, quality) {
  if (!quality.mainEmployee) {
    issues.push(buildZupQGRow_('Сотрудник', 'Предупреждение', '', '', '', '', 'ФИО сотрудника не распознано.', 'Проверить исходные файлы и VLM JSON.'));
    return;
  }
  if (quality.employees.length > 1) {
    issues.push(buildZupQGRow_('Сотрудник', 'Предупреждение', '', '', '', quality.employees.join(', '), `Найдены разные ФИО; основной сотрудник: ${quality.mainEmployee}.`, 'Проверить исходные файлы и рыжие ячейки периода.'));
  }
  if (quality.rawEmployees.length > quality.employees.length) {
    issues.push(buildZupQGRow_('Сотрудник', 'Инфо', '', '', '', quality.rawEmployees.join(', '), 'В исходных данных есть служебные варианты ФИО; для quality gate они нормализованы до ФИО без номера в скобках.', 'LLM prompt обновлен: извлекать только ФИО сотрудника без табельного/кадрового номера.'));
  }
  rows.forEach((row) => {
    const employee = normalizeZupEmployeeName_(row.employee);
    if (!employee || employee === quality.mainEmployee) {
      return;
    }
    issues.push(buildZupQGRow_('Сотрудник', 'Предупреждение', row.file, formatZupPeriod_(row.period), row.company, row.employee, `ФИО отличается от основного сотрудника: ${quality.mainEmployee}.`, 'Проверить исходный расчетный листок.'));
  });
}

function addZupMissingMonthIssues_(issues, quality) {
  (quality.missingMonths || []).forEach((periodText) => {
    issues.push(buildZupQGRow_('Полнота месяцев', 'Предупреждение', '', periodText, '', '', 'Месяц отсутствует между первым и последним распознанным периодом.', 'Добавить расчетный листок или подтвердить пропуск вручную.'));
  });
}

function addZupFileQualityIssues_(issues, qualityRowsInput) {
  const rows = Array.isArray(qualityRowsInput)
    ? qualityRowsInput
    : Object.keys(qualityRowsInput || {}).map((key) => qualityRowsInput[key]);
  rows.forEach((row) => {
    if (!row || String(row[0] || '').indexOf('QUALITY_GATE:') === 0) {
      return;
    }
    const status = row[4];
    const warning = row[15];
    if (!warning || status === 'OK' || status === 'Не изменился') {
      return;
    }
    issues.push(buildZupQGRow_('Качество файла', status === 'Ошибка' ? 'Ошибка' : 'Предупреждение', row[1], row[8], row[6], row[7], warning, 'Сверить исходный файл, sourceText и суммы разделов.'));
  });
}

function addZupCompletenessIssues_(issues, rows) {
  const checks = [
    { name: 'Оклад', found: countZupPeriodsWithCategory_(rows, 'Оклад'), total: countZupPeriodSpan_(rows) },
    { name: 'Ежемесячные премии', found: countZupRowsByCategory_(rows, 'Ежемесячные премии', 'Начислено'), total: countZupPeriodSpan_(rows) },
    { name: 'Ежеквартальные премии', found: countZupRowsByCategory_(rows, 'Ежеквартальные премии', 'Начислено'), total: countZupExpectedQuarterlyRows_(rows) },
    { name: 'Ежегодные премии', found: countZupRowsByCategory_(rows, 'Ежегодные премии', 'Начислено'), total: countZupExpectedAnnualRows_(rows) },
    { name: 'Отпуска', found: countZupRowsByCategory_(rows, 'Отпуска', 'Начислено'), total: countZupRowsByCategory_(rows, 'Отпуска', 'Начислено') },
  ];
  checks.forEach((check) => {
    const found = check.found;
    const total = Math.max(check.total || found, 0);
    const percent = total ? Math.round(found / total * 100) : 100;
    issues.push(buildZupQGRow_('Заполняемость данных', 'Инфо', '', '', '', '', `${check.name}: найдено ${found} из ${total || found} ожидаемых строк (${percent}%).`, 'Это диагностическая метрика; отсутствие премий может быть нормой.'));
  });
}

function addZupPartialSalaryExplanationIssues_(issues, rows) {
  const periods = {};
  rows.forEach((row) => {
    if (!row.period || !row.period.year || !row.period.month) {
      return;
    }
    const key = buildZupPeriodKey_(row.period);
    if (!periods[key]) {
      periods[key] = {
        period: row.period,
        files: {},
        salaryRows: [],
        explanationRows: [],
      };
    }
    if (row.file) {
      periods[key].files[row.file] = true;
    }
    if (row.category === 'Оклад' && row.section === 'Начислено') {
      periods[key].salaryRows.push(row);
    }
    if (isZupSalaryAbsenceExplanationRow_(row)) {
      periods[key].explanationRows.push(row);
    }
  });

  Object.keys(periods).forEach((key) => {
    const group = periods[key];
    if (!group.salaryRows.length || !group.explanationRows.length) {
      return;
    }
    const details = group.explanationRows
      .map((row) => {
        const days = row.workDays || row.paidDays;
        return `${row.kind || row.category}${days ? ` (${days} дн.)` : ''}`;
      })
      .filter(Boolean);
    issues.push(buildZupQGRow_(
      'Неполный оклад',
      'Инфо',
      Object.keys(group.files).join('\n'),
      formatZupPeriod_(group.period),
      '',
      '',
      `Окладные дни могут быть меньше рабочих дней месяца: найдены строки ${details.join('; ')}.`,
      'Это не ошибка распознавания, если сумма оклада рассчитана только за фактически оплаченные окладом дни.'
    ));
  });
}

function isZupSalaryAbsenceExplanationRow_(row) {
  const text = normalizeText_(`${row.category || ''} ${row.kind || ''} ${row.sourceRow || ''}`);
  return row.section === 'Начислено' && (
    row.category === 'Отпуска' ||
    /больнич|нетрудоспособн|командиров|отпуск без|без сохранения|компенсац.*отпуск/.test(text)
  );
}

function buildZupQGRow_(check, severity, file, period, company, employee, problem, action) {
  return [
    check,
    severity,
    severity === 'Ошибка' ? 'На ручную проверку' : 'К сведению',
    file || '',
    period || '',
    company || '',
    employee || '',
    '',
    problem || '',
    action || '',
  ];
}

function countZupRowsByCategory_(rows, category, section) {
  return rows.filter((row) =>
    row.category === category &&
    (!section || row.section === section) &&
    row.accrued !== null
  ).length;
}

function countZupPeriodsWithCategory_(rows, category) {
  const periods = {};
  rows.forEach((row) => {
    if (row.category === category && row.period && row.period.year && row.period.month) {
      periods[buildZupPeriodKey_(row.period)] = true;
    }
  });
  return Object.keys(periods).length;
}

function countZupPeriodSpan_(rows) {
  const periods = {};
  rows.forEach((row) => {
    if (row.period && row.period.year && row.period.month) {
      periods[buildZupPeriodKey_(row.period)] = true;
    }
  });
  return Object.keys(periods).length;
}

function countZupExpectedQuarterlyRows_(rows) {
  const periods = countZupPeriodSpan_(rows);
  return periods ? Math.ceil(periods / 3) : 0;
}

function countZupExpectedAnnualRows_(rows) {
  const years = {};
  rows.forEach((row) => {
    if (row.period && row.period.year) {
      years[row.period.year] = true;
    }
  });
  return Object.keys(years).length;
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
    quality.company,
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

function buildZupGlobalQualityRows_(rows) {
  const objects = rows.map((row) => ({
    company: row[ZUP_IMPORT_COLUMNS.company],
    employee: row[ZUP_IMPORT_COLUMNS.employee],
    period: normalizeZupImportPeriod_(row[ZUP_IMPORT_COLUMNS.year], row[ZUP_IMPORT_COLUMNS.month], row[ZUP_IMPORT_COLUMNS.period]),
  }));
  const quality = buildZupReconstructionQuality_(objects);
  const rowsOut = [];
  rowsOut.push(buildZupGlobalQualityRow_(
    'Организация',
    quality.companies.length === 1 && !quality.blankCompanyPeriods.length ? 'OK' : 'Предупреждение',
    quality.companies.length === 1 && !quality.blankCompanyPeriods.length
      ? `Все расчетные листки относятся к одной организации: ${quality.companies[0]}.`
      : buildZupCompanyQualityNote_(quality)
  ));
  rowsOut.push(buildZupGlobalQualityRow_(
    'Сотрудник',
    quality.employees.length === 1 ? 'OK' : 'Предупреждение',
    quality.employees.length === 1
      ? `Все расчетные листки относятся к одному сотруднику: ${quality.employees[0]}.${quality.rawEmployees.length > 1 ? ` В исходных листках были варианты написания: ${quality.rawEmployees.join(', ')}.` : ''}`
      : (quality.employees.length ? `Найдено несколько сотрудников: ${quality.employees.join(', ')}.` : 'Сотрудник не распознан.')
  ));
  rowsOut.push(buildZupGlobalQualityRow_(
    'Полнота месяцев',
    quality.missingMonths.length ? 'Предупреждение' : 'OK',
    quality.missingMonths.length
      ? `Между первым и последним распознанным месяцем есть пропуски: ${quality.missingMonths.join(', ')}.`
      : 'Пропусков месяцев между первым и последним распознанным периодом не найдено.'
  ));
  return rowsOut;
}

function buildZupGlobalQualityRow_(checkName, status, warning) {
  return [
    `QUALITY_GATE:${checkName}`,
    '',
    '',
    '',
    status,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    warning,
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
    .filter((row) =>
      row[ZUP_IMPORT_COLUMNS.file] &&
      row[ZUP_IMPORT_COLUMNS.file] !== 'Пропущенные файлы' &&
      row[ZUP_IMPORT_COLUMNS.section] &&
      row.length >= ZUP_IMPORT_HEADERS.length
    );

  return values.reduce((map, row) => {
    const fileName = row[ZUP_IMPORT_COLUMNS.file];
    if (!map[fileName]) {
      map[fileName] = [];
    }
    map[fileName].push(row);
    return map;
  }, {});
}

function readExistingZupSkippedFiles_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.IMPORT_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  const values = sheet.getDataRange().getValues();
  const markerIndex = values.findIndex((row) => row[0] === 'Пропущенные файлы');
  if (markerIndex < 0) {
    return [];
  }
  return values
    .slice(markerIndex + 1)
    .filter((row) => row[0])
    .map((row) => row.slice(0, 3));
}

function readExistingZupQualityRowsByGroup_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.QUALITY_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {};
  }

  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, ZUP_QUALITY_HEADERS.length)
    .getValues()
    .reduce((map, row) => {
      const key = row[0];
      if (key && String(key).indexOf('QUALITY_GATE:') !== 0) {
        map[key] = row;
      }
      return map;
    }, {});
}

function readExistingZupStateRowsByGroup_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.STATE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {};
  }

  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, ZUP_STATE_HEADERS.length)
    .getValues()
    .reduce((map, row) => {
      if (row[0]) {
        map[row[0]] = row;
      }
      return map;
    }, {});
}

function readExistingZupVlmRows_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(ZUP_IMPORT_SETTINGS.VLM_LOG_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, ZUP_VLM_LOG_HEADERS.length).getValues();
}

function buildZupFileSignature_(file) {
  return [
    file.getId(),
    file.getLastUpdated ? Number(file.getLastUpdated()) : '',
    getZupFileSize_(file),
    ZUP_IMPORT_SETTINGS.PARSER_VERSION,
    getZupVlmImportSignature_(),
  ].join('|');
}

function getZupVlmImportSignature_() {
  return [
    getZupScriptProperty_(ZUP_IMPORT_SETTINGS.VLM_MODEL_PROPERTY) || ZUP_IMPORT_SETTINGS.VLM_DEFAULT_MODEL,
    getZupVlmForcePattern_(),
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
      company: normalizedRows.length ? normalizedRows[0][ZUP_IMPORT_COLUMNS.company] : '',
      employee: normalizedRows.length ? normalizedRows[0][ZUP_IMPORT_COLUMNS.employee] : '',
      period: normalizedRows.length ? normalizedRows[0][ZUP_IMPORT_COLUMNS.period] : '',
      sourceTotals: buildEmptyZupTotals_(),
      recognizedTotals: sumZupRowsByAmountColumns_(normalizedRows),
      warnings: ['Файл не изменился; строки взяты из предыдущего импорта.'],
    },
    vlmRows: [],
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
    vlmRows: [],
  };
}

function moneyOrBlank_(value) {
  return value ? roundMoney_(value) : '';
}

function getZupDiagnosticTargets_() {
  return [
    { layoutId: 'salary', category: 'Оклад' },
    { layoutId: 'monthlyPremiums', category: 'Ежемесячные премии' },
    { layoutId: 'quarterlyPremiums', category: 'Ежеквартальные премии' },
    { layoutId: 'annualPremiums', category: 'Ежегодные премии' },
    { layoutId: 'vacation', category: 'Отпуска', vacationBase: true },
  ];
}

function writeZupDiagnosticSheet_(spreadsheet, rows) {
  const diagnostics = buildZupDiagnostics_(spreadsheet, rows);
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  writeZupDiagnosticRows_(sheet, diagnostics);
}

function writeZupDiagnosticTargetSheet_(spreadsheet, rows, target, reset) {
  const baseRows = prepareZupDiagnosticTargetSheet_(spreadsheet, target, reset);
  const diagnostics = buildZupDiagnosticsForTarget_(spreadsheet, rows, target);
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  writeZupDiagnosticChunk_(sheet, diagnostics, baseRows + 2);
}

function prepareZupDiagnosticTargetSheet_(spreadsheet, target, reset) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  let existing = [];
  if (!reset && sheet.getLastRow() >= 2) {
    existing = sheet
      .getRange(2, 1, sheet.getLastRow() - 1, ZUP_DIAGNOSTIC_HEADERS.length)
      .getValues()
      .filter((row) => row[2] !== target.category);
  }
  writeZupDiagnosticRows_(sheet, existing);
  return existing.length;
}

function writeZupDiagnosticChunk_(sheet, diagnostics, startRow) {
  if (!diagnostics.length) return;
  sheet
    .getRange(startRow, 1, diagnostics.length, ZUP_DIAGNOSTIC_HEADERS.length)
    .setValues(rectangularizeRows_(diagnostics));
  sheet.getRange(startRow, 5, diagnostics.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
  highlightZupRows_(sheet, diagnostics, startRow, ZUP_DIAGNOSTIC_HEADERS.length, (row) =>
    row[7] && row[7] !== 'Сходится'
  );
}

function initializeZupDiagnosticSheet_(spreadsheet) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  sheet
    .getRange(1, 1, 1, ZUP_DIAGNOSTIC_HEADERS.length)
    .setValues([ZUP_DIAGNOSTIC_HEADERS])
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function trimZupDiagnosticSheet_(spreadsheet, committedRows) {
  const sheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  const firstStaleRow = Math.max(2, Number(committedRows) + 2 || 2);
  const lastRow = sheet.getLastRow();
  if (lastRow >= firstStaleRow) {
    sheet
      .getRange(firstStaleRow, 1, lastRow - firstStaleRow + 1, ZUP_DIAGNOSTIC_HEADERS.length)
      .clearContent();
  }
  if (typeof sheet.autoResizeColumns === 'function') {
    sheet.autoResizeColumns(1, ZUP_DIAGNOSTIC_HEADERS.length);
  }
}

function continueZupDiagnosticTargetStep_(spreadsheet, importRows, target, state, reset) {
  const commitTerminalRows = (diagnostics) => {
    const baseRows = reset ? 0 : Math.max(0, Number(state.diagnosticCommittedRows) || 0);
    if (reset) initializeZupDiagnosticSheet_(spreadsheet);
    const diagnosticSheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
    writeZupDiagnosticChunk_(diagnosticSheet, diagnostics, baseRows + 2);
    return {
      complete: true,
      checkpoint: { diagnosticCommittedRows: baseRows + diagnostics.length },
    };
  };
  const sourceSheet = spreadsheet
    .getSheets()
    .find((candidate) =>
      !isZupGeneratedSheet_(candidate.getName()) &&
      !isGeneratedSheetName_(candidate.getName()) &&
      getSheetLayout_(candidate.getName()).id === target.layoutId
    );
  if (!sourceSheet) {
    return commitTerminalRows([[
      target.category, '', target.category, '', '', '', '', 'Нет листа',
      `Не найден рабочий лист для шаблона ${target.layoutId}.`,
    ]]);
  }

  const table = findTable_(sourceSheet);
  const amountColumn = resolveZupDiagnosticAmountColumn_(table, target);
  if (!Number.isInteger(amountColumn)) {
    return commitTerminalRows([[
      sourceSheet.getName(), '', target.category, '', '', '', '', 'Нет колонки',
      'Не найдена колонка с текущим значением для сверки.',
    ]]);
  }

  const sameTarget = state.diagnosticTargetKey === target.layoutId;
  const nextRow = sameTarget ? Math.max(0, Number(state.diagnosticNextRow) || 0) : 0;
  const outputRows = sameTarget ? Math.max(0, Number(state.diagnosticOutputRows) || 0) : 0;
  const totalRows = Math.max(0, sourceSheet.getLastRow() - table.headerRow);
  const baseRows = sameTarget
    ? Math.max(0, Number(state.diagnosticBaseRows) || 0)
    : (reset ? 0 : Math.max(0, Number(state.diagnosticCommittedRows) || 0));
  if (!sameTarget && reset) {
    initializeZupDiagnosticSheet_(spreadsheet);
  }
  if (nextRow >= totalRows) {
    return {
      complete: true,
      checkpoint: { diagnosticCommittedRows: baseRows + outputRows },
      progressText: `Формируем диагностику: ${target.category} · завершено`,
    };
  }

  const batchRows = Math.max(1, Number(ZUP_IMPORT_SETTINGS.DIAGNOSTIC_BATCH_ROWS) || 200);
  const rowCount = Math.min(batchRows, totalRows - nextRow);
  const sourceStartRow = table.headerRow + 1 + nextRow;
  const values = sourceSheet
    .getRange(sourceStartRow, 1, rowCount, sourceSheet.getLastColumn())
    .getValues();
  const index = buildZupImportAccrualIndex_(importRows);
  const diagnostics = buildZupDiagnosticRowsFromValues_(
    index,
    sourceSheet,
    table,
    target,
    values,
    sourceStartRow
  );
  const diagnosticSheet = getOrCreateZupSheet_(spreadsheet, ZUP_IMPORT_SETTINGS.DIAGNOSTIC_SHEET_NAME);
  writeZupDiagnosticChunk_(diagnosticSheet, diagnostics, baseRows + outputRows + 2);
  const completedRows = nextRow + rowCount;
  return {
    complete: completedRows >= totalRows,
    progressText: `Формируем диагностику: ${target.category} · ${completedRows} из ${totalRows} строк`,
    checkpoint: completedRows >= totalRows ? {
      diagnosticCommittedRows: baseRows + outputRows + diagnostics.length,
    } : {
      diagnosticTargetKey: target.layoutId,
      diagnosticNextRow: completedRows,
      diagnosticOutputRows: outputRows + diagnostics.length,
      diagnosticBaseRows: baseRows,
      diagnosticCommittedRows: Math.max(0, Number(state.diagnosticCommittedRows) || 0),
    },
  };
}

function writeZupDiagnosticRows_(sheet, diagnostics) {
  const data = [ZUP_DIAGNOSTIC_HEADERS].concat(diagnostics);
  writeZupSheetData_(sheet, data);
  if (diagnostics.length) {
    sheet.getRange(2, 5, diagnostics.length, 3).setNumberFormat(SETTINGS.MONEY_FORMAT);
    highlightZupRows_(sheet, diagnostics, 2, ZUP_DIAGNOSTIC_HEADERS.length, (row) =>
      row[7] && row[7] !== 'Сходится'
    );
  }
}

function buildZupDiagnostics_(spreadsheet, importRows) {
  return getZupDiagnosticTargets_().reduce(
    (diagnostics, target) => diagnostics.concat(
      buildZupDiagnosticsForTarget_(spreadsheet, importRows, target)
    ),
    []
  );
}

function buildZupDiagnosticsForTarget_(spreadsheet, importRows, target) {
  const index = buildZupImportAccrualIndex_(importRows);
  const diagnostics = [];
  const sheet = spreadsheet
    .getSheets()
    .find((candidate) =>
      !isZupGeneratedSheet_(candidate.getName()) &&
      !isGeneratedSheetName_(candidate.getName()) &&
      getSheetLayout_(candidate.getName()).id === target.layoutId
    );
  if (!sheet) {
    return [[
      target.category,
      '',
      target.category,
      '',
      '',
      '',
      '',
      'Нет листа',
      `Не найден рабочий лист для шаблона ${target.layoutId}.`,
    ]];
  }

  const table = findTable_(sheet);
  const amountColumn = resolveZupDiagnosticAmountColumn_(table, target);
  if (!Number.isInteger(amountColumn)) {
    return [[
      sheet.getName(),
      '',
      target.category,
      '',
      '',
      '',
      '',
      'Нет колонки',
      'Не найдена колонка с текущим значением для сверки.',
    ]];
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= table.headerRow) {
    return diagnostics;
  }

  const values = sheet
    .getRange(table.headerRow + 1, 1, lastRow - table.headerRow, sheet.getLastColumn())
    .getValues();

  return buildZupDiagnosticRowsFromValues_(
    index,
    sheet,
    table,
    target,
    values,
    table.headerRow + 1
  );
}

function buildZupDiagnosticRowsFromValues_(index, sheet, table, target, values, sourceStartRow) {
  const diagnostics = [];
  const amountColumn = resolveZupDiagnosticAmountColumn_(table, target);
  values.forEach((row, rowIndex) => {
    const spreadsheetValue = parseMoney_(row[amountColumn]);
    if (spreadsheetValue === null) {
      return;
    }

    const imported = target.vacationBase
      ? getZupImportedVacationBase_(index, row, table)
      : (target.category === 'Оклад'
        ? getZupImportedSalaryAccrual_(index, parseRowPeriod_(row, table.columns))
        : getZupImportedAccrual_(index, target.category, parseRowPeriod_(row, table.columns)));

    diagnostics.push(buildZupDiagnosticRow_({
      sheetName: sheet.getName(),
      rowNumber: sourceStartRow + rowIndex,
      category: target.category,
      period: imported.period,
      spreadsheetValue,
      importedValue: imported.amount,
      details: imported.details,
    }));
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

function getZupImportedSalaryAccrual_(index, period) {
  const imported = getZupImportedAccruals_(index, ['Оклад', 'Доплата до оклада'], period);
  if (imported.amount !== null) {
    imported.details = `Оклад с учетом отдельной категории "Доплата до оклада". ${imported.details}`;
  }
  return imported;
}

function getZupImportedAccruals_(index, categories, period) {
  if (!period) {
    return {
      amount: null,
      period: '',
      details: 'Не удалось определить период строки рабочего листа.',
    };
  }

  let total = 0;
  const files = {};
  const foundCategories = {};
  categories.forEach((category) => {
    const item = index[buildZupImportAccrualKey_(category, period)];
    if (!item) {
      return;
    }
    total += item.amount;
    foundCategories[category] = true;
    Object.keys(item.files).forEach((fileName) => {
      files[fileName] = true;
    });
  });

  return {
    amount: Object.keys(foundCategories).length ? roundMoney_(total) : null,
    period: formatZupPeriod_(period),
    details: Object.keys(foundCategories).length
      ? `Категории: ${Object.keys(foundCategories).join(', ')}. Источники: ${Object.keys(files).join(', ')}`
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
    'Доплата до оклада',
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
  if (typeof sheet.autoResizeColumns === 'function') {
    sheet.autoResizeColumns(1, data[0].length);
  } else {
    for (let column = 1; column <= data[0].length; column++) {
      sheet.autoResizeColumn(column);
    }
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

function highlightZupRows_(sheet, rows, startRow, width, predicate) {
  if (!rows.length) {
    return;
  }
  const backgrounds = rows.map((row) =>
    new Array(width).fill(predicate(row) ? ZUP_IMPORT_SETTINGS.REVIEW_FILL : SETTINGS.BACKGROUND_DEFAULT)
  );
  const range = sheet.getRange(startRow, 1, rows.length, width);
  if (range.setBackgrounds) {
    range.setBackgrounds(backgrounds);
    return;
  }
  rows.forEach((row, index) => {
    if (predicate(row)) {
      const rowRange = sheet.getRange(startRow + index, 1, 1, width);
      if (rowRange.setBackground) {
        rowRange.setBackground(ZUP_IMPORT_SETTINGS.REVIEW_FILL);
      }
    }
  });
}

function getOrCreateZupSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}
