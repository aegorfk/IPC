const CLAIM_CONSTRUCTOR_SETTINGS = {
  SHEET_NAME: 'Конструктор',
  SOURCE_FOLDER_LABEL: 'Расчетные листы:',
  SOURCE_FOLDER_NAMED_RANGE: 'CLAIM_CONSTRUCTOR_SOURCE_FOLDER',
  NORMATIVE_FOLDER_LABEL: 'Нормативные документы',
  NORMATIVE_FOLDER_NAMED_RANGE: 'CLAIM_CONSTRUCTOR_NORMATIVE_FOLDER',
  NORMATIVE_FOLDER_PLACEHOLDER: 'пока не анализируется',
  OUTPUT_DOC_LABEL: 'Расписанный расчет:',
  OUTPUT_DOC_NAMED_RANGE: 'CLAIM_CONSTRUCTOR_OUTPUT_DOC',
  RUN_STATE_PROPERTY: 'CLAIM_CONSTRUCTOR_RUN_STATE',
  RUN_STATE_CHUNK_PREFIX: 'CLAIM_CONSTRUCTOR_RUN_STATE_CHUNK_',
  RUN_STATE_STORAGE_VERSION: 2,
  RUN_STATE_VALUE_MAX_BYTES: 8000,
  RUN_STATE_TOTAL_MAX_BYTES: 384000,
  VISIBILITY_MODE_PROPERTY: 'CLAIM_CONSTRUCTOR_VISIBILITY_MODE',
  CONTINUATION_TRIGGER_FUNCTION: 'resumeClaimConstructorPipeline_',
  CONTINUATION_TRIGGER_ID_PROPERTY: 'CLAIM_CONSTRUCTOR_CONTINUATION_TRIGGER_ID',
  CONTINUATION_TRIGGER_DELAY_MS: 60 * 1000,
  WATCHDOG_TRIGGER_FUNCTION: 'watchClaimConstructorPipeline_',
  WATCHDOG_TRIGGER_ID_PROPERTY: 'CLAIM_CONSTRUCTOR_WATCHDOG_TRIGGER_ID',
  // A one-minute watchdog closes the gap when a one-shot import continuation
  // trigger is delayed by Apps Script scheduling or a slow VLM request.
  WATCHDOG_INTERVAL_MINUTES: 1,
  WATCHDOG_TRIGGER_VERSION_PROPERTY: 'CLAIM_CONSTRUCTOR_WATCHDOG_TRIGGER_VERSION',
  WATCHDOG_TRIGGER_VERSION: '2',
  PHASE_EXECUTION_LEASE_MS: 7 * 60 * 1000,
  TRANSIENT_RETRY_LIMIT: 3,
  RUN_STALE_MS: 6 * 60 * 60 * 1000,
  ISSUE_HEADERS: [
    'Уровень',
    'Этап',
    'Тип источника',
    'Источник',
    'Причина',
    'Статус проверки',
    'Влияние',
    'Что сделать',
  ],
  PHASE_LABELS: {
    validating: 'Проверка исходных данных',
    importing: 'Распознавание расчетных листков',
    reconstructing: 'Импорт завершен. Реконструкция начислений и выплат',
    calculating: 'Расчет недоплат, индексации и материальной ответственности',
    writing_doc: 'Создание новой версии расчета в Google Docs',
    complete: 'Готово',
    completeWithWarnings: 'Готово с замечаниями',
    failed: 'Ошибка',
  },
};

function getClaimConstructorLayout_() {
  return {
    sheetName: CLAIM_CONSTRUCTOR_SETTINGS.SHEET_NAME,
    primaryAction: {
      cell: 'A2',
      text: 'Собрать расчет: меню «Конструктор требований» → «Собрать расчет»',
    },
    sourceFolder: {
      label: CLAIM_CONSTRUCTOR_SETTINGS.SOURCE_FOLDER_LABEL,
      namedRange: CLAIM_CONSTRUCTOR_SETTINGS.SOURCE_FOLDER_NAMED_RANGE,
      labelCell: 'A4',
      valueCell: 'B4',
      errorCell: 'B5',
    },
    normativeFolder: {
      label: CLAIM_CONSTRUCTOR_SETTINGS.NORMATIVE_FOLDER_LABEL,
      namedRange: CLAIM_CONSTRUCTOR_SETTINGS.NORMATIVE_FOLDER_NAMED_RANGE,
      labelCell: 'A6',
      valueCell: 'B6',
      placeholderCell: 'A7',
    },
    outputDoc: {
      label: CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_LABEL,
      namedRange: CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_NAMED_RANGE,
      labelCell: 'A9',
      valueCell: 'B9',
      errorCell: 'B10',
    },
    status: {
      titleCell: 'A12',
      phaseCell: 'B12',
      messageCell: 'B13',
      updatedAtCell: 'B14',
      completedAtCell: 'B15',
      issueCountCell: 'B16',
    },
    totalsStartRow: 17,
    resultFields: {
      underpayment: { label: 'Недоплата', labelCell: 'A18', valueCell: 'B18' },
      indexation: { label: 'Индексация', labelCell: 'A19', valueCell: 'B19' },
      liability: { label: 'Материальная ответственность', labelCell: 'A20', valueCell: 'B20' },
      total: { label: 'Итого требований', labelCell: 'A21', valueCell: 'B21' },
    },
    issuesHeaderRow: 24,
    issueHeaders: CLAIM_CONSTRUCTOR_SETTINGS.ISSUE_HEADERS.slice(),
    phaseLabels: Object.assign({}, CLAIM_CONSTRUCTOR_SETTINGS.PHASE_LABELS),
  };
}

function ensureClaimConstructorSheet_(spreadsheet) {
  if (typeof migrateLegacyPayrollSheetNames_ === 'function') {
    migrateLegacyPayrollSheetNames_(spreadsheet);
  }
  const layout = getClaimConstructorLayout_();
  let sheet = spreadsheet.getSheetByName(layout.sheetName);
  const created = !sheet;
  if (!sheet) {
    sheet = spreadsheet.insertSheet(layout.sheetName, 0);
  }

  migrateLegacyClaimConstructorLayout_(spreadsheet, sheet, layout);
  applyClaimConstructorStructure_(sheet, layout);
  formatClaimConstructorSheet_(sheet, layout);
  spreadsheet.setNamedRange(layout.sourceFolder.namedRange, sheet.getRange(layout.sourceFolder.valueCell));
  spreadsheet.setNamedRange(layout.normativeFolder.namedRange, sheet.getRange(layout.normativeFolder.valueCell));
  spreadsheet.setNamedRange(layout.outputDoc.namedRange, sheet.getRange(layout.outputDoc.valueCell));
  if (created) {
    seedClaimConstructorInputsFromLegacyLabels_(spreadsheet, sheet, layout);
  }
  return sheet;
}

function migrateLegacyClaimConstructorLayout_(spreadsheet, sheet, layout) {
  if (sheet.getRange('A6').getValue() !== CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_LABEL) {
    return false;
  }

  const documentLock = LockService.getDocumentLock();
  const lock = documentLock || LockService.getScriptLock();
  let acquired = false;
  try {
    if (lock) {
      acquired = lock.tryLock(30 * 1000);
      if (!acquired) {
        throw new Error('Конструктор уже обновляется другим процессом. Повторите попытку позже.');
      }
    }
    if (sheet.getRange('A6').getValue() !== CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_LABEL) {
      return false;
    }
    return migrateLegacyClaimConstructorLayoutLocked_(spreadsheet, sheet, layout);
  } finally {
    if (acquired) {
      try {
        if (typeof SpreadsheetApp.flush === 'function') {
          SpreadsheetApp.flush();
        }
      } finally {
        lock.releaseLock();
      }
    }
  }
}

function migrateLegacyClaimConstructorLayoutLocked_(spreadsheet, sheet, layout) {

  const legacyDocUrl = sheet.getRange('B6').getValue();
  const legacyDocError = sheet.getRange('B7').getValue();
  const docsRowMigrated = sheet.getRange(layout.outputDoc.labelCell).getValue() === layout.outputDoc.label;
  const fullLegacyLayout = sheet.getRange('A9').getValue() === 'Статус:';
  const statusMigrated = sheet.getRange(layout.status.titleCell).getValue() === 'Статус:';
  const legacyStatusBelowDocs = sheet.getRange('A10').getValue() === 'Прогресс:'
    || sheet.getRange('A11').getValue() === 'Обновлено:'
    || sheet.getRange('A12').getValue() === 'Завершено:'
    || sheet.getRange('A13').getValue() === 'Замечаний:';
  const totalsMigrated = sheet.getRange(layout.totalsStartRow, 1).getValue() === 'Итоги расчета';
  const legacyTotals = sheet.getRange('A14').getValue() === 'Итоги расчета';
  const issuesMigrated = sheet.getRange(layout.issuesHeaderRow - 1, 1).getValue() === 'Требует внимания'
    || sheet.getRange(layout.issuesHeaderRow, 1).getValue() === 'Уровень';
  const legacyIssues = sheet.getRange('A20').getValue() === 'Требует внимания'
    || sheet.getRange('A21').getValue() === 'Уровень';
  const lastRow = sheet.getLastRow();
  const columnCount = Math.max(sheet.getLastColumn(), layout.issueHeaders.length);

  const migratedDocUrl = docsRowMigrated
    ? sheet.getRange(layout.outputDoc.valueCell).getValue()
    : '';
  if (migratedDocUrl && legacyDocUrl && migratedDocUrl !== legacyDocUrl) {
    const validLegacyDocUrl = typeof extractGoogleDocId_ === 'function'
      && extractGoogleDocId_(legacyDocUrl);
    const preserved = validLegacyDocUrl
      && typeof preserveClaimIntakeDocHistoryUrl_ === 'function'
      && preserveClaimIntakeDocHistoryUrl_(
        spreadsheet,
        legacyDocUrl,
        'Перенесен из прежней ячейки Конструктора'
      );
    if (!preserved) {
      throw new Error('Не удалось сохранить прежнюю ссылку Google Doc в истории; старая ячейка оставлена без изменений.');
    }
  }

  if (!issuesMigrated && (fullLegacyLayout || legacyIssues)) {
    moveLegacyClaimConstructorBlock_(sheet, 20, lastRow, 3, columnCount);
  }
  if (!totalsMigrated && (fullLegacyLayout || legacyTotals)) {
    moveLegacyClaimConstructorBlock_(sheet, 14, 18, 3, columnCount);
  }
  if (!statusMigrated && fullLegacyLayout) {
    moveLegacyClaimConstructorBlock_(sheet, 9, 13, 3, columnCount);
  } else if (!statusMigrated && legacyStatusBelowDocs) {
    moveLegacyClaimConstructorBlock_(sheet, 10, 13, 3, columnCount);
  }
  if (!docsRowMigrated) {
    sheet.getRange(layout.outputDoc.labelCell).setValue(layout.outputDoc.label);
  }

  if (!migratedDocUrl) {
    sheet.getRange(layout.outputDoc.valueCell).setValue(legacyDocUrl);
  }
  if (legacyDocUrl && !migratedDocUrl
      && sheet.getRange(layout.outputDoc.valueCell).getValue() !== legacyDocUrl) {
    throw new Error('Не удалось безопасно перенести ссылку на текущий Google Doc.');
  }
  setClaimConstructorCellIfBlank_(sheet.getRange(layout.outputDoc.errorCell), legacyDocError);
  sheet.getRange('B6').clearContent();
  sheet.getRange('B7').clearContent();
  sheet.getRange('A6').clearContent();
  return true;
}

function moveLegacyClaimConstructorBlock_(sheet, firstRow, lastRow, offset, columnCount) {
  if (lastRow < firstRow) {
    return;
  }
  const rowCount = lastRow - firstRow + 1;
  const source = sheet.getRange(firstRow, 1, rowCount, columnCount);
  const destination = sheet.getRange(firstRow + offset, 1, rowCount, columnCount);
  source.moveTo(destination);
}

function seedClaimConstructorInputsFromLegacyLabels_(spreadsheet, sheet, layout) {
  const folder = findZupFolderNearSourceLabel_(spreadsheet);
  if (folder) {
    setClaimConstructorCellIfBlank_(
      sheet.getRange(layout.sourceFolder.valueCell),
      `https://drive.google.com/drive/folders/${folder.id}`
    );
  }
  const docUrl = findFirstLabeledDocUrl_(scanSpreadsheetLabelValues_(spreadsheet), [
    CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_LABEL,
    'расписанный расчет',
  ]);
  if (docUrl) {
    setClaimConstructorCellIfBlank_(sheet.getRange(layout.outputDoc.valueCell), docUrl);
  }
}

function applyClaimConstructorStructure_(sheet, layout) {
  sheet.getRange('A1').setValue('Конструктор требований');
  sheet.getRange(layout.primaryAction.cell).setValue(layout.primaryAction.text);
  sheet.getRange(layout.sourceFolder.labelCell).setValue(layout.sourceFolder.label);
  sheet.getRange(layout.normativeFolder.labelCell).setValue(layout.normativeFolder.label);
  sheet.getRange(layout.normativeFolder.placeholderCell)
    .setValue(CLAIM_CONSTRUCTOR_SETTINGS.NORMATIVE_FOLDER_PLACEHOLDER);
  sheet.getRange(layout.outputDoc.labelCell).setValue(layout.outputDoc.label);
  sheet.getRange(layout.status.titleCell).setValue('Статус:');
  sheet.getRange('A13').setValue('Прогресс:');
  sheet.getRange('A14').setValue('Обновлено:');
  sheet.getRange('A15').setValue('Завершено:');
  sheet.getRange('A16').setValue('Замечаний:');
  setClaimConstructorCellIfBlank_(sheet.getRange(layout.status.phaseCell), 'Готов к запуску');
  sheet.getRange(layout.totalsStartRow, 1).setValue('Итоги расчета');
  sheet.getRange(layout.totalsStartRow + 1, 1, 4, 1).setValues([
    ['Недоплата'],
    ['Индексация'],
    ['Материальная ответственность'],
    ['Итого требований'],
  ]);
  sheet.getRange(layout.issuesHeaderRow - 1, 1).setValue('Требует внимания');
  sheet.getRange(layout.issuesHeaderRow, 1, 1, layout.issueHeaders.length).setValues([layout.issueHeaders]);
}

function setClaimConstructorCellIfBlank_(range, value) {
  if (range.getValue() === '') {
    range.setValue(value);
  }
}

function formatClaimConstructorSheet_(sheet, layout) {
  sheet.setFrozenRows(2);
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 520);
  for (let column = 3; column <= layout.issueHeaders.length; column++) {
    sheet.setColumnWidth(column, 150);
  }
  sheet.getRange(1, 1, 1, 2)
    .setBackground('#E8F0FE')
    .setFontColor('#202124')
    .setFontSize(16)
    .setFontWeight('bold');
  sheet.getRange(4, 1, 7, 2).setWrap(true).setVerticalAlignment('middle');
  sheet.getRange(layout.issuesHeaderRow, 1, 1, layout.issueHeaders.length)
    .setBackground('#E8F0FE')
    .setFontWeight('bold')
    .setWrap(true);
}

function openClaimConstructor() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureClaimConstructorWorkspace_(spreadsheet).constructor;
  sheet.showSheet();
  sheet.activate();
  return sheet;
}

/**
 * Small read-only smoke diagnostics used by the live workbook check.  Keep
 * the response bounded so it can be called through the Apps Script API.
 */
function getClaimConstructorLiveDiagnostics() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const run = loadClaimConstructorRun_();
  const batch = typeof loadZupBatchImportSession_ === 'function'
    ? loadZupBatchImportSession_()
    : null;
  const triggers = typeof ScriptApp === 'undefined'
    ? []
    : ScriptApp.getProjectTriggers().map((trigger) => trigger.getHandlerFunction());
  return {
    spreadsheetId: spreadsheet.getId(),
    run: run ? {
      id: run.id,
      status: run.status,
      phase: run.phase,
      progressText: run.progressText,
      updatedAt: run.updatedAt,
      issueCount: Array.isArray(run.issues) ? run.issues.length : 0,
    } : null,
    batch: batch ? {
      stage: batch.stage,
      processed: batch.processed,
      total: batch.total,
      updatedAt: batch.updatedAt,
      runId: batch.runId,
      constructorRunId: batch.constructorRunId,
    } : null,
    triggers,
    recognition: typeof getZupRecognitionDiagnostics_ === 'function'
      ? getZupRecognitionDiagnostics_(spreadsheet)
      : null,
  };
}

function readClaimConstructorInputs_(spreadsheet) {
  const layout = getClaimConstructorLayout_();
  const folderRange = spreadsheet.getRangeByName(layout.sourceFolder.namedRange);
  const docRange = spreadsheet.getRangeByName(layout.outputDoc.namedRange);
  const namedFolderUrl = folderRange ? String(folderRange.getValue() || '').trim() : '';
  const namedDocUrl = docRange ? String(docRange.getValue() || '').trim() : '';
  const namedFolderId = extractDriveFolderId_(namedFolderUrl);
  const namedDocId = extractGoogleDocId_(namedDocUrl);

  if (namedFolderId && namedDocId) {
    return {
      folderUrl: namedFolderUrl,
      folderId: namedFolderId,
      docUrl: namedDocUrl,
      docId: namedDocId,
      source: 'named_ranges',
    };
  }

  const labeledFolder = findZupFolderNearSourceLabel_(spreadsheet);
  const labelValues = scanSpreadsheetLabelValues_(spreadsheet);
  const labeledDocUrl = findFirstLabeledDocUrl_(labelValues, [
    CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_LABEL,
    'расписанный расчет',
  ]) || '';
  const useNamedFolder = Boolean(namedFolderUrl);
  const useNamedDoc = Boolean(namedDocUrl);
  const folderId = useNamedFolder ? namedFolderId : (labeledFolder ? labeledFolder.id : '');
  const docId = useNamedDoc ? namedDocId : extractGoogleDocId_(labeledDocUrl);

  return {
    folderUrl: useNamedFolder ? namedFolderUrl : (folderId ? `https://drive.google.com/drive/folders/${folderId}` : ''),
    folderId,
    docUrl: useNamedDoc ? namedDocUrl : labeledDocUrl,
    docId,
    source: 'labels',
  };
}

function validateClaimConstructorInputs_(inputs) {
  const values = inputs || {};
  const errors = [];
  let folder = null;
  let document = null;

  if (!String(values.folderUrl || '').trim()) {
    errors.push(claimConstructorInputError_('folder', 'folder_required', 'Вставьте ссылку на папку Google Drive с расчетными листками.'));
  } else if (/docs\.google\.com\/document\/d\//i.test(values.folderUrl)) {
    errors.push(claimConstructorInputError_('folder', 'folder_wrong_kind', 'Нужна ссылка на папку Google Drive, а не на Google Doc.'));
  } else if (!values.folderId) {
    errors.push(claimConstructorInputError_('folder', 'folder_invalid', 'Не удалось распознать ссылку на папку Google Drive.'));
  } else {
    try {
      folder = DriveApp.getFolderById(values.folderId);
    } catch (error) {
      errors.push(claimConstructorInputError_('folder', 'folder_inaccessible', 'Папка Google Drive не найдена или недоступна текущему пользователю.'));
    }
  }

  if (!String(values.docUrl || '').trim()) {
    errors.push(claimConstructorInputError_('doc', 'doc_required', 'Вставьте ссылку на Google Doc для расшифровки расчета.'));
  } else if (/drive\.google\.com\/drive\/folders\//i.test(values.docUrl)) {
    errors.push(claimConstructorInputError_('doc', 'doc_wrong_kind', 'Нужна ссылка на Google Doc, а не на папку Google Drive.'));
  } else if (!values.docId) {
    errors.push(claimConstructorInputError_('doc', 'doc_invalid', 'Не удалось распознать ссылку на Google Doc.'));
  } else {
    try {
      document = DocumentApp.openById(values.docId);
    } catch (error) {
      errors.push(claimConstructorInputError_('doc', 'doc_inaccessible', 'Google Doc не найден или недоступен текущему пользователю.'));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    folder,
    document,
  };
}

function claimConstructorInputError_(field, code, message) {
  return { field, code, message };
}

function getClaimConstructorPhaseOrder_() {
  return ['validating', 'importing', 'reconstructing', 'calculating', 'writing_doc'];
}

function createClaimConstructorRun_(inputs, options) {
  const settings = options || {};
  const now = settings.now || new Date();
  const phases = {};
  getClaimConstructorPhaseOrder_().forEach((phase, index) => {
    phases[phase] = index === 0 ? 'running' : 'pending';
  });
  return {
    version: 1,
    id: Utilities.getUuid(),
    parentRunId: settings.parentRunId || '',
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    status: 'running',
    phase: 'validating',
    progressText: 'Проверяем ссылки и доступ к исходным данным.',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    completedAt: '',
    inputs: Object.assign({}, inputs || {}),
    phases,
    phaseExecutions: {},
    runtimeRetries: {},
    issues: [],
    results: {},
  };
}

function serializeClaimConstructorRun_(run) {
  return JSON.stringify(run);
}

function getClaimConstructorUtf8ByteLength_(value) {
  const text = String(value || '');
  let bytes = 0;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x800) {
      bytes += 2;
    } else if (code >= 0xD800 && code <= 0xDBFF
      && index + 1 < text.length
      && text.charCodeAt(index + 1) >= 0xDC00
      && text.charCodeAt(index + 1) <= 0xDFFF) {
      bytes += 4;
      index++;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

function splitClaimConstructorStateChunks_(value, maxBytes) {
  const text = String(value || '');
  const limit = Math.max(1, Number(maxBytes) || CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_VALUE_MAX_BYTES);
  const chunks = [];
  let start = 0;
  let bytes = 0;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    let charBytes = code < 0x80 ? 1 : (code < 0x800 ? 2 : 3);
    let width = 1;
    if (code >= 0xD800 && code <= 0xDBFF
      && index + 1 < text.length
      && text.charCodeAt(index + 1) >= 0xDC00
      && text.charCodeAt(index + 1) <= 0xDFFF) {
      charBytes = 4;
      width = 2;
    }
    if (bytes && bytes + charBytes > limit) {
      chunks.push(text.slice(start, index));
      start = index;
      bytes = 0;
    }
    bytes += charBytes;
    if (width === 2) index++;
  }
  if (start < text.length || !chunks.length) {
    chunks.push(text.slice(start));
  }
  return chunks;
}

function hashClaimConstructorState_(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function getClaimConstructorStateChunkKey_(generation, index) {
  return `${CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_CHUNK_PREFIX}${generation}_${index}`;
}

function cleanupClaimConstructorStateChunks_(store, retainedKeys) {
  const retained = retainedKeys || {};
  const properties = store.getProperties ? store.getProperties() : {};
  Object.keys(properties).forEach((key) => {
    if (key.indexOf(CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_CHUNK_PREFIX) !== 0 || retained[key]) return;
    try {
      store.deleteProperty(key);
    } catch (error) {
      // Orphaned chunks are harmless because the committed manifest never references them.
    }
  });
}

function parseClaimConstructorStateManifest_(value) {
  try {
    const manifest = JSON.parse(value);
    return manifest
      && manifest.storageVersion === CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_STORAGE_VERSION
      && manifest.generation
      && Number.isInteger(manifest.chunkCount)
      && manifest.chunkCount > 0
      ? manifest
      : null;
  } catch (error) {
    return null;
  }
}

function loadChunkedClaimConstructorState_(store, manifest) {
  const chunks = [];
  for (let index = 0; index < manifest.chunkCount; index++) {
    const chunk = store.getProperty(getClaimConstructorStateChunkKey_(manifest.generation, index));
    if (chunk === null || chunk === undefined) return null;
    chunks.push(chunk);
  }
  const serialized = chunks.join('');
  if (getClaimConstructorUtf8ByteLength_(serialized) !== Number(manifest.byteLength)
    || hashClaimConstructorState_(serialized) !== manifest.checksum) {
    return null;
  }
  return serialized;
}

function parseClaimConstructorRun_(value) {
  if (!value) {
    return null;
  }
  try {
    const run = JSON.parse(value);
    return run && run.id && run.phases ? run : null;
  } catch (error) {
    return null;
  }
}

function saveClaimConstructorRun_(run, properties) {
  const store = properties || PropertiesService.getDocumentProperties();
  const serialized = serializeClaimConstructorRun_(run);
  const byteLength = getClaimConstructorUtf8ByteLength_(serialized);
  if (byteLength > CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_TOTAL_MAX_BYTES) {
    throw new Error(
      `Состояние конструктора превышает безопасный общий лимит: ${byteLength} байт. `
      + 'Подробные диагностические данные необходимо вынести в технические листы.'
    );
  }
  if (byteLength <= CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_VALUE_MAX_BYTES) {
    store.setProperty(CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_PROPERTY, serialized);
    cleanupClaimConstructorStateChunks_(store, {});
    return run;
  }

  const chunks = splitClaimConstructorStateChunks_(
    serialized,
    CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_VALUE_MAX_BYTES
  );
  const generation = `${hashClaimConstructorState_(serialized)}-${byteLength}-${chunks.length}`;
  const chunkProperties = {};
  const retainedKeys = {};
  chunks.forEach((chunk, index) => {
    const key = getClaimConstructorStateChunkKey_(generation, index);
    chunkProperties[key] = chunk;
    retainedKeys[key] = true;
  });
  store.setProperties(chunkProperties, false);
  const manifest = {
    storageVersion: CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_STORAGE_VERSION,
    generation,
    chunkCount: chunks.length,
    byteLength,
    checksum: hashClaimConstructorState_(serialized),
  };
  store.setProperty(
    CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_PROPERTY,
    JSON.stringify(manifest)
  );
  cleanupClaimConstructorStateChunks_(store, retainedKeys);
  return run;
}

function loadClaimConstructorRun_(properties) {
  const store = properties || PropertiesService.getDocumentProperties();
  const raw = store.getProperty(CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_PROPERTY);
  if (!raw) {
    return null;
  }
  const manifest = parseClaimConstructorStateManifest_(raw);
  const serialized = manifest ? loadChunkedClaimConstructorState_(store, manifest) : raw;
  const parsed = parseClaimConstructorRun_(serialized);
  if (parsed) {
    return parsed;
  }
  const now = new Date().toISOString();
  const phases = {};
  getClaimConstructorPhaseOrder_().forEach((phase) => { phases[phase] = 'pending'; });
  const corrupt = {
    version: 1,
    id: `corrupt-${Utilities.getUuid()}`,
    parentRunId: '',
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    status: 'failed',
    phase: 'failed',
    failedPhase: 'validating',
    corruptState: true,
    progressText: 'Состояние предыдущего запуска повреждено. Расчет не запущен.',
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    inputs: {},
    phases,
    phaseExecutions: {},
    runtimeRetries: {},
    issues: [normalizeClaimConstructorIssue_({
      severity: 'error',
      phase: 'validating',
      sourceKind: 'system',
      reason: 'Не удалось прочитать сохраненное состояние запуска.',
      reviewStatus: 'поврежденное состояние',
      knownImpact: 'запуск заблокирован',
      suggestedAction: 'Сохранить диагностику и создать новый запуск после проверки.',
    })],
    results: {},
    corruptValue: String(raw).slice(0, 500),
  };
  saveClaimConstructorRun_(corrupt, store);
  return corrupt;
}

function isClaimConstructorPhaseDone_(run, phase) {
  return Boolean(run && run.phases && run.phases[phase] === 'done');
}

function completeClaimConstructorPhase_(run, expectedPhase, nextPhase, now) {
  if (!run || run.phase !== expectedPhase || run.phases[expectedPhase] !== 'running') {
    return false;
  }
  run.phases[expectedPhase] = 'done';
  if (nextPhase) {
    run.phases[nextPhase] = 'running';
    run.phase = nextPhase;
  }
  run.updatedAt = (now || new Date()).toISOString();
  return true;
}

function startOrJoinClaimConstructorRun_(inputs, options) {
  const settings = options || {};
  const properties = settings.properties || PropertiesService.getDocumentProperties();
  const now = settings.now || new Date();
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return { run: loadClaimConstructorRun_(properties), joined: true, busy: true };
  }

  try {
    const active = loadClaimConstructorRun_(properties);
    if (active && active.corruptState) {
      return { run: active, joined: true, busy: false };
    }
    if (isClaimConstructorRunActive_(active) && !isClaimConstructorRunStale_(active, properties, now)) {
      return { run: active, joined: true, busy: false };
    }

    let replacedRun = null;
    if (isClaimConstructorRunActive_(active)) {
      active.status = 'failed';
      active.phase = 'failed';
      active.progressText = 'Предыдущий запуск устарел и был заменен новым.';
      active.updatedAt = now.toISOString();
      active.completedAt = now.toISOString();
      replacedRun = active;
    }
    const parentRunId = replacedRun ? replacedRun.id : (settings.parentRunId || '');
    deleteClaimConstructorContinuationTriggers_();
    const run = createClaimConstructorRun_(inputs, { now, parentRunId });
    saveClaimConstructorRun_(run, properties);
    return { run, joined: false, busy: false, replacedRun };
  } finally {
    lock.releaseLock();
  }
}

function isClaimConstructorRunActive_(run) {
  return Boolean(run && run.status === 'running');
}

function isClaimConstructorRunStale_(run, properties, now) {
  if (!isOlderThanClaimConstructorStaleLimit_(run && run.updatedAt, now)) {
    return false;
  }
  if (!run || run.phase !== 'importing') {
    return !hasClaimConstructorContinuationTrigger_();
  }

  const session = loadClaimConstructorBatchSession_(properties);
  if (!session || session.constructorRunId !== run.id) {
    return true;
  }
  if (!isOlderThanClaimConstructorStaleLimit_(session.updatedAt, now)) {
    return false;
  }
  return !hasClaimConstructorImportTrigger_();
}

function isOlderThanClaimConstructorStaleLimit_(timestamp, now) {
  const time = new Date(timestamp || 0).getTime();
  return !Number.isFinite(time) || (now || new Date()).getTime() - time > CLAIM_CONSTRUCTOR_SETTINGS.RUN_STALE_MS;
}

function loadClaimConstructorBatchSession_(properties) {
  const store = properties || PropertiesService.getDocumentProperties();
  const propertyName = typeof ZUP_IMPORT_SETTINGS !== 'undefined'
    ? ZUP_IMPORT_SETTINGS.BATCH_STATE_PROPERTY
    : 'ZUP_IMPORT_BATCH_STATE';
  const raw = store.getProperty(propertyName);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function hasClaimConstructorImportTrigger_() {
  const handler = typeof ZUP_IMPORT_SETTINGS !== 'undefined'
    ? ZUP_IMPORT_SETTINGS.BATCH_TRIGGER_FUNCTION
    : 'resumeZupFolderImport_';
  const propertyName = typeof ZUP_IMPORT_SETTINGS !== 'undefined'
    ? ZUP_IMPORT_SETTINGS.BATCH_TRIGGER_ID_PROPERTY
    : 'ZUP_IMPORT_BATCH_TRIGGER_ID';
  return ScriptApp.getProjectTriggers().some((trigger) =>
    isClaimConstructorOwnedTrigger_(trigger, propertyName, handler)
  );
}

function hasClaimConstructorContinuationTrigger_() {
  return ScriptApp.getProjectTriggers().some((trigger) =>
    isClaimConstructorOwnedTrigger_(trigger,
      CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_ID_PROPERTY,
      CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_FUNCTION)
  );
}

function advanceActiveClaimConstructorRun_(runId, expectedPhase, nextPhase, options) {
  const settings = options || {};
  const properties = settings.properties || PropertiesService.getDocumentProperties();
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }

  try {
    const run = loadClaimConstructorRun_(properties);
    if (!run || run.id !== runId) {
      return null;
    }
    if (!completeClaimConstructorPhase_(run, expectedPhase, nextPhase, settings.now || new Date())) {
      return null;
    }
    if (settings.progressText) {
      run.progressText = settings.progressText;
    }
    saveClaimConstructorRun_(run, properties);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function writeClaimConstructorStatus_(sheet, run) {
  const layout = getClaimConstructorLayout_();
  const terminalLabels = {
    complete: layout.phaseLabels.complete,
    complete_with_warnings: layout.phaseLabels.completeWithWarnings,
    failed: layout.phaseLabels.failed,
  };
  const phaseLabel = terminalLabels[run.status]
    || layout.phaseLabels[run.phase]
    || run.phase
    || 'Готов к запуску';
  sheet.getRange(layout.status.phaseCell).setValue(phaseLabel);
  sheet.getRange(layout.status.messageCell).setValue(formatClaimConstructorProgress_(run));
  sheet.getRange(layout.status.updatedAtCell).setValue(formatClaimConstructorTimestamp_(run.updatedAt));
  sheet.getRange(layout.status.completedAtCell).setValue(formatClaimConstructorTimestamp_(run.completedAt));
  sheet.getRange(layout.status.issueCountCell).setValue((run.issues || []).length);
  return sheet;
}

function normalizeClaimConstructorProgress_(progress) {
  const value = progress || {};
  const total = Math.max(0, Math.floor(Number(value.total) || 0));
  const processed = Math.max(0, Math.min(total || Infinity, Math.floor(Number(value.processed) || 0)));
  return {
    processed,
    total,
    percent: total ? Math.min(100, Math.round(processed / total * 100)) : 0,
  };
}

function formatClaimConstructorProgress_(run) {
  const value = run || {};
  if (value.status !== 'running') {
    return value.progressText || '';
  }
  if (value.phase === 'importing' && value.progress && Number(value.progress.total)) {
    const progress = normalizeClaimConstructorProgress_(value.progress);
    const suffix = value.progressText ? ` · ${value.progressText}` : '';
    return `${buildClaimConstructorProgressBar_(progress.percent)} ${progress.percent}% · ${progress.processed} из ${progress.total}${suffix}`;
  }
  const phasePercents = {
    validating: 5,
    importing: 20,
    reconstructing: 70,
    calculating: 85,
    writing_doc: 95,
  };
  const checkpointPercent = value.progress && value.progress.phase === value.phase
    ? Number(value.progress.percent)
    : NaN;
  const phasePercent = Number.isFinite(checkpointPercent)
    ? checkpointPercent
    : phasePercents[value.phase];
  if (Number.isFinite(phasePercent)) {
    const suffix = value.progressText ? ` · ${value.progressText}` : '';
    return `${buildClaimConstructorProgressBar_(phasePercent)} ${phasePercent}%${suffix}`;
  }
  return value.progressText || '';
}

function buildClaimConstructorProgressBar_(percent) {
  const width = 16;
  const normalized = Math.max(0, Math.min(100, Number(percent) || 0));
  const filled = Math.min(width, Math.round(normalized / 100 * width));
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
}

function formatClaimConstructorTimestamp_(value) {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return String(value);
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm');
}

function updateClaimConstructorImportProgress_(session, recognitionIssues) {
  const value = session || {};
  if (!value.constructorRunId) {
    return null;
  }
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  let run = null;
  try {
    run = loadClaimConstructorRun_();
    if (!run || run.id !== value.constructorRunId || run.status !== 'running' || run.phase !== 'importing') {
      return null;
    }
    run.progress = normalizeClaimConstructorProgress_({
      processed: value.nextIndex,
      total: value.total,
    });
    run.progressText = value.stage === 'finalizing'
      ? (value.currentFinalizationStep || 'Завершаем импорт')
      : '';
    run.issues = mergeClaimConstructorIssues_(run.issues, recognitionIssues || []);
    run.updatedAt = value.updatedAt || new Date().toISOString();
    saveClaimConstructorRun_(run);
  } finally {
    lock.releaseLock();
  }
  const spreadsheet = SpreadsheetApp.openById(value.spreadsheetId || run.spreadsheetId);
  refreshClaimConstructorDashboard_(spreadsheet, run);
  return run;
}

function updateClaimConstructorCalculationCheckpoint_(runId, spreadsheet, checkpoint) {
  const value = checkpoint || {};
  const run = loadClaimConstructorRun_();
  if (!run || run.id !== runId || run.status !== 'running' || run.phase !== 'calculating') {
    return null;
  }
  run.results = run.results || {};
  run.results.calculationCheckpoint = Object.assign({}, value);
  run.progressText = formatClaimConstructorCalculationCheckpoint_(value);
  run.updatedAt = value.updatedAt || new Date().toISOString();
  saveClaimConstructorRun_(run);
  const sheet = spreadsheet && spreadsheet.getSheetByName
    ? spreadsheet.getSheetByName(getClaimConstructorLayout_().sheetName)
    : null;
  if (sheet) {
    writeClaimConstructorStatus_(sheet, run);
    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.flush) {
      SpreadsheetApp.flush();
    }
  }
  return run;
}

function formatClaimConstructorCalculationCheckpoint_(checkpoint) {
  const value = checkpoint || {};
  const messages = {
    preparing: 'Подготавливаем атомарный пересчет.',
    references: 'Загружаем индексы, календарь и ставки.',
    recoveries: 'Учитываем частичные взыскания.',
    derivatives: 'Пересчитываем производные выплаты.',
    audit: 'Формируем аудит и требования.',
    complete: 'Расчетные листы пересчитаны.',
  };
  if (value.stage === 'sheet_started') {
    return `Рассчитываем лист ${value.index || '?'} из ${value.total || '?'}: ${value.sheetName || 'без названия'}.`;
  }
  if (value.stage === 'sheet_completed') {
    return `Лист ${value.index || '?'} из ${value.total || '?'} рассчитан: ${value.sheetName || 'без названия'}.`;
  }
  return messages[value.stage] || 'Пересчитываем требования.';
}

function normalizeClaimConstructorIssue_(issue) {
  const value = issue || {};
  const normalized = {
    severity: value.severity === 'error' ? 'error' : 'warning',
    phase: value.phase || 'unknown',
    sourceKind: value.sourceKind || 'unknown',
    source: value.source || '',
    reason: value.reason || 'Требуется проверка исходных данных.',
    reviewStatus: value.reviewStatus || 'требует проверки',
    knownImpact: value.knownImpact === null || value.knownImpact === undefined || value.knownImpact === ''
      ? 'не определено'
      : value.knownImpact,
    suggestedAction: value.suggestedAction || 'Проверить исходный документ и уточнить данные.',
  };
  if (value.provisional) normalized.provisional = true;
  normalized.key = value.key || buildClaimConstructorIssueKey_(normalized);
  return normalized;
}

function buildClaimConstructorIssueKey_(issue) {
  const value = issue || {};
  const identity = [
    value.phase || 'unknown',
    value.sourceKind || 'unknown',
    value.source || '',
    value.reason || '',
  ].map((part) => String(part).trim().toLowerCase()).join('|');
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index++) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `issue:${(hash >>> 0).toString(36)}`;
}

function buildClaimConstructorIssueSourceIdentity_(issue) {
  const value = issue || {};
  return [value.phase, value.sourceKind, value.source]
    .map((part) => String(part || '').trim().toLowerCase())
    .join('|');
}

function mergeClaimConstructorIssues_(existingIssues, incomingIssues) {
  let merged = (existingIssues || []).map((issue) => normalizeClaimConstructorIssue_(issue));
  (incomingIssues || []).forEach((incoming) => {
    const issue = normalizeClaimConstructorIssue_(incoming);
    if (!issue.provisional) {
      const sourceIdentity = buildClaimConstructorIssueSourceIdentity_(issue);
      merged = merged.filter((existing) => !(
        existing.provisional
        && buildClaimConstructorIssueSourceIdentity_(existing) === sourceIdentity
      ));
    }
    const existingIndex = merged.findIndex((existing) => existing.key === issue.key);
    if (existingIndex < 0) {
      merged.push(issue);
      return;
    }
    if (!merged[existingIndex].provisional && issue.provisional) {
      return;
    }
    merged[existingIndex] = issue;
  });
  return merged;
}

function buildClaimConstructorRecognitionSourceKey_(source, fallback) {
  const identity = String(source || fallback || 'unknown').trim().toLowerCase();
  return `importing|source|${identity}`;
}

function buildClaimConstructorRecognitionIssues_(processed) {
  const value = processed || {};
  const issues = [];
  const qualityRow = value.qualityRow || [];
  const qualityStatus = String(qualityRow[4] || '');
  const groupKey = qualityRow[0] || qualityRow[1] || value.fileName || '';
  const qualitySource = qualityRow[1] || value.fileName || '';
  const vlmSources = {};
  (value.vlmRows || []).forEach((row) => {
    vlmSources[String(row[0] || value.fileName || '').trim().toLowerCase()] = true;
  });
  if (/(предуп|ошиб|пропущ|не распоз)/i.test(qualityStatus)) {
    issues.push({
      key: buildClaimConstructorRecognitionSourceKey_(qualitySource, groupKey),
      provisional: true,
      severity: /ошиб/i.test(qualityStatus) ? 'error' : 'warning',
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source: qualitySource,
      reason: qualityRow[15] || `Статус распознавания: ${qualityStatus}.`,
      reviewStatus: `предварительно · ${qualityStatus || 'требует проверки'}`
        + (vlmSources[String(qualitySource).trim().toLowerCase()] ? ' · VLM' : ''),
      suggestedAction: 'Сверить распознанные значения с исходным расчетным листком.',
    });
  }
  (value.vlmRows || []).forEach((row) => {
    const source = row[0] || value.fileName || '';
    if (qualitySource && String(source).trim().toLowerCase() === String(qualitySource).trim().toLowerCase()
      && /(предуп|ошиб|пропущ|не распоз)/i.test(qualityStatus)) return;
    issues.push({
      key: buildClaimConstructorRecognitionSourceKey_(source, groupKey),
      provisional: true,
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source,
      reason: row[10] || 'Файл распознан с помощью VLM и требует сверки с источником.',
      reviewStatus: `предварительно · ${row[3] || 'VLM'}`,
      suggestedAction: 'Сверить распознанные значения с исходным расчетным листком.',
    });
  });
  (value.skippedFiles || []).forEach((row) => {
    const source = row[0] || value.fileName || '';
    issues.push({
      key: buildClaimConstructorRecognitionSourceKey_(source, groupKey),
      provisional: true,
      severity: 'error',
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source,
      reason: row[2] || 'Файл не был распознан.',
      reviewStatus: 'предварительно · файл пропущен',
      suggestedAction: 'Проверить формат и содержимое исходного файла.',
    });
  });
  return mergeClaimConstructorIssues_([], issues);
}

function aggregateClaimConstructorIssues_(signals) {
  const values = signals || {};
  const issues = [];
  const warnedSources = {};
  const vlmSources = {};
  (values.vlmRows || []).forEach((row) => {
    vlmSources[String(row[0] || '').trim().toLowerCase()] = true;
  });
  (values.qualityRows || []).forEach((row) => {
    const status = String(row[4] || '');
    if (!/(предуп|ошиб|пропущ|не распоз)/i.test(status)) return;
    const groupKey = row[0] || row[1] || '';
    const source = row[1] || '';
    warnedSources[String(source).trim().toLowerCase()] = true;
    issues.push(normalizeClaimConstructorIssue_({
      key: buildClaimConstructorRecognitionSourceKey_(source, groupKey),
      severity: /ошиб/i.test(status) ? 'error' : 'warning',
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source,
      reason: row[15] || `Статус распознавания: ${status}.`,
      reviewStatus: (status || 'требует проверки')
        + (vlmSources[String(source).trim().toLowerCase()] ? ' · VLM' : ''),
      suggestedAction: 'Сверить распознанные значения с исходным расчетным листком.',
    }));
  });
  (values.qualityGateRows || []).forEach((row) => {
    issues.push(normalizeClaimConstructorIssue_({
      severity: String(row[1] || '').toLowerCase().indexOf('ошиб') >= 0 ? 'error' : 'warning',
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source: [row[3], row[4], row[7]].filter(Boolean).join('; '),
      reason: row[8] || row[0] || 'Сигнал quality gate',
      reviewStatus: row[2] || row[1] || 'требует проверки',
      suggestedAction: row[9] || 'Сверить с исходным расчетным листком.',
    }));
  });
  (values.vlmRows || []).forEach((row) => {
    const source = row[0] || '';
    if (warnedSources[String(source).trim().toLowerCase()]) return;
    issues.push(normalizeClaimConstructorIssue_({
      key: buildClaimConstructorRecognitionSourceKey_(source, ''),
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source,
      reason: row[10] || 'Строки распознаны с помощью VLM.',
      reviewStatus: row[3] || 'VLM',
      suggestedAction: 'Сверить распознанные значения с исходным файлом.',
    }));
  });
  appendClaimConstructorSignalIssues_(issues, values.diagnosticIssues, 'importing');
  appendClaimConstructorSignalIssues_(issues, values.reconstructionIssues, 'reconstructing');
  appendClaimConstructorSignalIssues_(issues, values.skippedCalculationIssues, 'calculating');
  appendClaimConstructorSignalIssues_(issues, values.calculationEffectIssues, 'calculating');
  return mergeClaimConstructorIssues_([], issues);
}

function appendClaimConstructorSignalIssues_(target, sourceIssues, phase) {
  (sourceIssues || []).forEach((issue) => {
    target.push(normalizeClaimConstructorIssue_(Object.assign({
      phase,
      sourceKind: 'payroll_slips',
    }, issue)));
  });
}

function renderClaimConstructorResults_(sheet, results) {
  const layout = getClaimConstructorLayout_();
  const values = results || {};
  const totals = values.totals || {};
  Object.keys(layout.resultFields).forEach((key) => {
    const value = Object.prototype.hasOwnProperty.call(totals, key) ? totals[key] : '';
    sheet.getRange(layout.resultFields[key].valueCell).setValue(value);
  });
  return sheet;
}

function renderClaimConstructorIssues_(sheet, issues) {
  const layout = getClaimConstructorLayout_();
  const firstRow = layout.issuesHeaderRow + 1;
  const existingRows = Math.max(0, sheet.getLastRow() - firstRow + 1);
  if (existingRows) {
    sheet.getRange(firstRow, 1, existingRows, layout.issueHeaders.length).clearContent();
  }
  const rows = (issues || []).map((issue) => [
    issue.severity,
    issue.phase,
    issue.sourceKind,
    issue.source,
    issue.reason,
    issue.reviewStatus,
    issue.knownImpact,
    issue.suggestedAction,
  ]);
  if (rows.length) {
    sheet.getRange(firstRow, 1, rows.length, layout.issueHeaders.length).setValues(rows);
  }
  return sheet;
}

function hydrateClaimConstructorOnOpen_(spreadsheet) {
  const layout = getClaimConstructorLayout_();
  if (!spreadsheet.getSheetByName(layout.sheetName)) {
    return false;
  }
  const sheet = ensureClaimConstructorWorkspace_(spreadsheet).constructor;
  const run = loadClaimConstructorRun_();
  if (run) {
    writeClaimConstructorStatus_(sheet, run);
    renderClaimConstructorResults_(sheet, run.results.dashboard || run.results);
    renderClaimConstructorIssues_(sheet, run.issues);
  }
  if (typeof discoverCalculationSheetDescriptors_ === 'function'
    && typeof syncCalculatedAverageEarningsFromDescriptors_ === 'function') {
    try {
      syncCalculatedAverageEarningsFromDescriptors_(
        spreadsheet,
        discoverCalculationSheetDescriptors_(spreadsheet)
      );
    } catch (error) {
      Logger.log(`Не удалось обновить рассчитанный средний заработок при открытии: ${error}`);
    }
  }
  const mode = PropertiesService
    .getDocumentProperties()
    .getProperty(CLAIM_CONSTRUCTOR_SETTINGS.VISIBILITY_MODE_PROPERTY);
  if (mode && typeof applyClaimConstructorVisibilityMode_ === 'function') {
    applyClaimConstructorVisibilityMode_(mode, spreadsheet);
  }
  return true;
}

function getClaimConstructorSourceAdapters_() {
  return {
    payroll_slips: {
      sourceKind: 'payroll_slips',
      start: runPayrollSlipSourceAdapter_,
    },
  };
}

function runPayrollSlipSourceAdapter_(spreadsheet, folder, options) {
  const importResult = startZupFolderImportBatch_(spreadsheet, folder, options || {});
  const complete = Boolean(importResult.complete);
  return {
    sourceKind: 'payroll_slips',
    normalizedResults: {
      rows: importResult.rows || [],
      rowsRecognized: Number.isFinite(importResult.rowsRecognized)
        ? importResult.rowsRecognized
        : (importResult.rows || []).length,
      source: importResult.source || folder.source || '',
    },
    qualityIssues: (importResult.skippedFiles || []).map((row) => normalizeClaimConstructorIssue_({
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source: row[0] || '',
      reason: row[2] || 'Файл не был распознан.',
      reviewStatus: 'пропущен при импорте',
      suggestedAction: 'Проверить формат и содержимое исходного файла.',
    })),
    completion: {
      complete,
      continuationRequired: !complete,
      status: complete ? 'complete' : 'continuing',
    },
    importResult,
  };
}

function renderClaimConstructorInputErrors_(sheet, errors) {
  const layout = getClaimConstructorLayout_();
  sheet.getRange(layout.sourceFolder.errorCell).clearContent();
  sheet.getRange(layout.outputDoc.errorCell).clearContent();
  (errors || []).forEach((error) => {
    const cell = error.field === 'folder'
      ? layout.sourceFolder.errorCell
      : layout.outputDoc.errorCell;
    sheet.getRange(cell).setValue(error.message);
  });
}

function buildClaimCalculation() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureClaimConstructorWorkspace_(spreadsheet).constructor;
  renderClaimConstructorInputErrors_(sheet, []);
  sheet.showSheet();
  sheet.activate();
  const persistedRun = loadClaimConstructorRun_();
  const recoveredStaleImport = recoverClaimConstructorImportIfComplete_(spreadsheet, sheet, persistedRun);
  if (recoveredStaleImport) {
    return recoveredStaleImport;
  }
  const activeRun = joinFreshClaimConstructorRun_();
  if (activeRun) {
    ensureClaimConstructorWatchdogTrigger_();
    const recovered = recoverClaimConstructorImportIfComplete_(spreadsheet, sheet, activeRun);
    if (recovered) {
      return recovered;
    }
    if (['reconstructing', 'calculating', 'writing_doc'].indexOf(activeRun.phase) >= 0) {
      const continued = continueClaimConstructorPipeline_(activeRun.id, { spreadsheet });
      return {
        started: false,
        joined: true,
        resumed: true,
        validation: null,
        run: continued || loadClaimConstructorRun_() || activeRun,
      };
    }
    writeClaimConstructorStatus_(sheet, activeRun);
    return { started: false, joined: true, validation: null, run: activeRun };
  }
  const inputs = readClaimConstructorInputs_(spreadsheet);
  const validation = validateClaimConstructorInputs_(inputs);
  renderClaimConstructorInputErrors_(sheet, validation.errors);
  if (!validation.valid) {
    writeClaimConstructorStatus_(sheet, {
      status: 'failed',
      phase: 'failed',
      progressText: validation.errors.map((error) => error.message).join(' '),
      updatedAt: new Date().toISOString(),
    });
    return { started: false, joined: false, validation, run: null };
  }

  const started = startOrJoinClaimConstructorRun_(inputs);
  if (!started.run || started.joined) {
    if (started.run) {
      writeClaimConstructorStatus_(sheet, started.run);
    }
    return {
      started: false,
      joined: Boolean(started.run),
      busy: started.busy,
      validation,
      run: started.run,
    };
  }

  const run = advanceActiveClaimConstructorRun_(
    started.run.id,
    'validating',
    'importing',
    { progressText: 'Импортируем и распознаем расчетные листки.' }
  );
  writeClaimConstructorStatus_(sheet, run);
  const adapter = getClaimConstructorSourceAdapters_().payroll_slips;
  try {
    const adapterResult = adapter.start(spreadsheet, {
      id: inputs.folderId,
      source: `${sheet.getName()}!${getClaimConstructorLayout_().sourceFolder.valueCell}`,
    }, {
      force: false,
      dryRun: false,
      constructorRunId: run.id,
      constructorNextPhase: 'reconstructing',
    });
    return { started: true, joined: false, validation, run, adapterResult };
  } catch (error) {
    const failed = failClaimConstructorRuntime_(run.id, 'importing', error);
    refreshClaimConstructorDashboard_(spreadsheet, failed);
    return { started: false, joined: false, validation, run: failed, error };
  }
}

function recoverClaimConstructorImportIfComplete_(spreadsheet, sheet, activeRun) {
  const run = activeRun || {};
  if (run.status !== 'running' || run.phase !== 'importing') {
    return null;
  }
  const session = loadClaimConstructorBatchSession_();
  let importResult = null;
  let waitingRun = null;
  if (session && session.constructorRunId === run.id) {
    importResult = buildCompletedClaimConstructorImportResultFromSheets_(spreadsheet, run, session);
    if (importResult) {
      if (typeof clearZupBatchImportState_ === 'function') {
        clearZupBatchImportState_();
      }
      if (typeof deleteZupBatchImportTriggers_ === 'function') {
        deleteZupBatchImportTriggers_();
      }
    } else {
      waitingRun = Object.assign({}, run, {
        updatedAt: new Date().toISOString(),
      });
      writeClaimConstructorStatus_(sheet, waitingRun);
      if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.flush) {
        SpreadsheetApp.flush();
      }
      if (spreadsheet && typeof spreadsheet.toast === 'function') {
        spreadsheet.toast(
          'Команда принята. Проверяем последний шаг импорта.',
          'Конструктор требований',
          5
        );
      }
    }
    if (typeof scheduleZupBatchImportTrigger_ === 'function') {
      if (!importResult) {
        scheduleZupBatchImportTrigger_();
      }
    }
    if (!importResult) {
      return {
        started: false,
        joined: true,
        recovered: false,
        waiting: true,
        validation: null,
        run: waitingRun,
      };
    }
  }
  writeClaimConstructorStatus_(sheet, Object.assign({}, run, {
    progressText: 'Импорт завершен. Восстанавливаем переход к реконструкции.',
  }));
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.flush) {
    SpreadsheetApp.flush();
  }
  importResult = importResult || buildCompletedClaimConstructorImportResultFromSheets_(spreadsheet, run);
  if (!importResult) {
    return null;
  }
  const advanced = continueClaimConstructorAfterImport_(
    run.id,
    'reconstructing',
    importResult
  );
  if (!advanced) {
    return null;
  }
  refreshClaimConstructorDashboard_(spreadsheet, advanced);
  return {
    started: false,
    joined: true,
    recovered: true,
    validation: null,
    run: advanced,
  };
}

function buildCompletedClaimConstructorImportResultFromSheets_(spreadsheet, run, session) {
  if (
    typeof readExistingZupSkippedFiles_ !== 'function' ||
    typeof readExistingZupStateRowsByGroup_ !== 'function'
  ) {
    return null;
  }
  const stateRowsByGroup = readExistingZupStateRowsByGroup_(spreadsheet);
  const stateCount = Object.keys(stateRowsByGroup).length;
  const expectedTotal = Number(run && run.progress && run.progress.total) || 0;
  if (expectedTotal && stateCount < expectedTotal) {
    return null;
  }
  if (session && !hasCompleteCurrentClaimConstructorBatchState_(stateRowsByGroup, session, expectedTotal)) {
    return null;
  }
  const rowsRecognized = Object.keys(stateRowsByGroup).reduce((sum, key) => {
    const row = stateRowsByGroup[key] || [];
    return sum + (Number(row[8]) || 0);
  }, 0);
  if (!rowsRecognized) {
    return null;
  }
  const skippedFiles = readExistingZupSkippedFiles_(spreadsheet);
  const total = expectedTotal || stateCount;
  return {
    complete: true,
    recovered: true,
    source: (run && run.results && run.results.import && run.results.import.source)
      || (run && run.inputs && run.inputs.folderUrl)
      || '',
    total,
    processed: total,
    filesRead: stateCount || total,
    rowsRecognized,
    skippedFiles,
    skippedCount: skippedFiles.length,
    dryRun: false,
    processedNow: 0,
  };
}

function hasCompleteCurrentClaimConstructorBatchState_(stateRowsByGroup, session, expectedTotal) {
  const total = Number(expectedTotal) || Number(session && session.total) || 0;
  const startedAt = new Date(session && session.startedAt || 0).getTime();
  if (!total || !Number.isFinite(startedAt)) {
    return false;
  }
  const currentRows = Object.keys(stateRowsByGroup || {}).filter((key) => {
    const row = stateRowsByGroup[key] || [];
    const updatedAt = new Date(row[10] || 0).getTime();
    return Number.isFinite(updatedAt) && updatedAt >= startedAt;
  });
  return currentRows.length >= total;
}

function joinFreshClaimConstructorRun_() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return loadClaimConstructorRun_();
  }
  try {
    const run = loadClaimConstructorRun_();
    if (run && run.corruptState) {
      return run;
    }
    return isClaimConstructorRunActive_(run)
      && !isClaimConstructorRunStale_(run, PropertiesService.getDocumentProperties(), new Date())
      ? run
      : null;
  } finally {
    lock.releaseLock();
  }
}

function continueClaimConstructorAfterImport_(runId, nextPhase, importResult) {
  appendClaimConstructorIssuesToRun_(
    runId,
    'importing',
    (importResult && importResult.skippedFiles || []).map((row) => ({
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source: row[0] || '',
      reason: row[2] || 'Файл не был распознан.',
      reviewStatus: 'пропущен при импорте',
      suggestedAction: 'Проверить исходный файл вручную.',
    }))
  );
  const calculableRows = importResult && Array.isArray(importResult.rows)
    ? importResult.rows.length
    : Number(importResult && importResult.rowsRecognized || 0);
  if (calculableRows === 0) {
    const failed = failClaimConstructorRunAfterImport_(runId, importResult || {});
    if (failed) {
      refreshClaimConstructorDashboard_(SpreadsheetApp.openById(failed.spreadsheetId), failed);
    }
    return failed;
  }
  const advanced = advanceActiveClaimConstructorRun_(
    runId,
    'importing',
    nextPhase || 'reconstructing',
    { progressText: 'Импорт завершен. Восстанавливаем начисления и выплаты.' }
  );
  if (!advanced) {
    return null;
  }
  advanced.results = advanced.results || {};
  advanced.results.import = {
    source: importResult.source || '',
    total: importResult.total || 0,
    processed: importResult.processed || 0,
    rowsRecognized: calculableRows,
    skippedCount: Number.isFinite(importResult.skippedCount)
      ? importResult.skippedCount
      : (importResult.skippedFiles || []).length,
    recovered: Boolean(importResult.recovered),
  };
  saveClaimConstructorRun_(advanced);
  scheduleClaimConstructorContinuation_();
  refreshClaimConstructorDashboard_(SpreadsheetApp.openById(advanced.spreadsheetId), advanced);
  return advanced;
}

function resumeClaimConstructorPipeline_() {
  const run = loadClaimConstructorRun_();
  if (!isClaimConstructorRunActive_(run)) {
    deleteClaimConstructorContinuationTriggers_();
    deleteClaimConstructorWatchdogTriggers_();
    return run;
  }
  scheduleClaimConstructorContinuation_();
  const result = continueClaimConstructorPipeline_(run.id, {
    spreadsheet: SpreadsheetApp.openById(run.spreadsheetId),
  });
  if (!isClaimConstructorRunActive_(result)) {
    deleteClaimConstructorContinuationTriggers_();
    deleteClaimConstructorWatchdogTriggers_();
  }
  return result;
}

function watchClaimConstructorPipeline_() {
  const run = loadClaimConstructorRun_();
  if (!isClaimConstructorRunActive_(run)) {
    deleteClaimConstructorWatchdogTriggers_();
    return run;
  }
  ensureClaimConstructorWatchdogTrigger_();
  const spreadsheet = SpreadsheetApp.openById(run.spreadsheetId);
  if (run.phase === 'importing') {
    const session = loadClaimConstructorBatchSession_();
    if (session && session.constructorRunId === run.id
      && typeof continueZupFolderImportBatch_ === 'function') {
      return continueZupFolderImportBatch_();
    }
    const sheet = spreadsheet.getSheetByName(getClaimConstructorLayout_().sheetName);
    const recovered = sheet
      ? recoverClaimConstructorImportIfComplete_(spreadsheet, sheet, run)
      : null;
    if (recovered) return recovered;
    if (typeof scheduleZupBatchImportTrigger_ === 'function') {
      scheduleZupBatchImportTrigger_();
    }
    return run;
  }
  return continueClaimConstructorPipeline_(run.id, { spreadsheet });
}

function getClaimConstructorTriggerUniqueId_(trigger) {
  if (!trigger) return '';
  if (typeof trigger.getUniqueId === 'function') return String(trigger.getUniqueId() || '');
  return String(trigger.uniqueId || '');
}

function isClaimConstructorOwnedTrigger_(trigger, propertyName, handlerName) {
  if (!trigger || !trigger.getHandlerFunction
    || trigger.getHandlerFunction() !== handlerName) return false;
  const id = getClaimConstructorTriggerUniqueId_(trigger);
  const ownedId = PropertiesService.getDocumentProperties().getProperty(propertyName) || '';
  if (ownedId) return id === ownedId;
  // Test doubles and legacy runtimes may not expose Trigger.getUniqueId().
  return !id;
}

function rememberClaimConstructorTrigger_(trigger, propertyName) {
  const id = getClaimConstructorTriggerUniqueId_(trigger);
  if (id) PropertiesService.getDocumentProperties().setProperty(propertyName, id);
  return trigger;
}

function forgetClaimConstructorTrigger_(propertyName, trigger) {
  const properties = PropertiesService.getDocumentProperties();
  const ownedId = properties.getProperty(propertyName) || '';
  if (!ownedId || !trigger || !getClaimConstructorTriggerUniqueId_(trigger)
    || ownedId === getClaimConstructorTriggerUniqueId_(trigger)) {
    properties.deleteProperty(propertyName);
  }
}

function ensureClaimConstructorWatchdogTrigger_() {
  const matches = ScriptApp.getProjectTriggers().filter((trigger) =>
    isClaimConstructorOwnedTrigger_(trigger,
      CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_ID_PROPERTY,
      CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_FUNCTION)
  );
  const props = PropertiesService.getDocumentProperties();
  const currentVersion = props.getProperty(
    CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_VERSION_PROPERTY
  );
  if (matches.length && currentVersion === CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_VERSION) {
    matches.slice(1).forEach((trigger) => ScriptApp.deleteTrigger(trigger));
    return matches[0];
  }
  matches.forEach((trigger) => {
    ScriptApp.deleteTrigger(trigger);
    forgetClaimConstructorTrigger_(CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_ID_PROPERTY, trigger);
  });
  const trigger = ScriptApp
    .newTrigger(CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_FUNCTION)
    .timeBased()
    .everyMinutes(CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_INTERVAL_MINUTES)
    .create();
  rememberClaimConstructorTrigger_(
    trigger, CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_ID_PROPERTY
  );
  props.setProperty(
    CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_VERSION_PROPERTY,
    CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_VERSION
  );
  return trigger;
}

function deleteClaimConstructorWatchdogTriggers_() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (isClaimConstructorOwnedTrigger_(trigger,
      CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_ID_PROPERTY,
      CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_FUNCTION)) {
      ScriptApp.deleteTrigger(trigger);
      forgetClaimConstructorTrigger_(CLAIM_CONSTRUCTOR_SETTINGS.WATCHDOG_TRIGGER_ID_PROPERTY, trigger);
    }
  });
}

function scheduleClaimConstructorContinuation_() {
  deleteClaimConstructorContinuationTriggers_();
  const trigger = ScriptApp
    .newTrigger(CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_FUNCTION)
    .timeBased()
    .after(CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_DELAY_MS)
    .create();
  rememberClaimConstructorTrigger_(
    trigger, CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_ID_PROPERTY
  );
}

function deleteClaimConstructorContinuationTriggers_() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (isClaimConstructorOwnedTrigger_(trigger,
      CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_ID_PROPERTY,
      CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_FUNCTION)) {
      ScriptApp.deleteTrigger(trigger);
      forgetClaimConstructorTrigger_(CLAIM_CONSTRUCTOR_SETTINGS.CONTINUATION_TRIGGER_ID_PROPERTY, trigger);
    }
  });
}

function continueClaimConstructorPipeline_(runId, options) {
  const settings = options || {};
  let run = loadClaimConstructorRun_();
  if (!run || run.id !== runId) {
    return null;
  }
  const spreadsheet = settings.spreadsheet || SpreadsheetApp.openById(run.spreadsheetId);

  try {
    if (run.phase === 'reconstructing' && run.phases.reconstructing === 'running') {
      const executionToken = claimClaimConstructorPhaseExecution_(runId, 'reconstructing');
      if (!executionToken) {
        return loadClaimConstructorRun_();
      }
      const reconstructionStep = continueZupReconstructionStep_(
        spreadsheet,
        run.results.reconstructionCheckpoint || null
      );
      if (!reconstructionStep.complete) {
        run = recordClaimConstructorPhaseCheckpoint_(
          runId,
          'reconstructing',
          'reconstructionCheckpoint',
          reconstructionStep.checkpoint,
          executionToken
        );
      } else {
        run = recordClaimConstructorPhaseResult_(
          runId,
          'reconstructing',
          'calculating',
          'reconstruction',
          reconstructionStep.result,
          'Реконструкция завершена. Пересчитываем требования.',
          { reconstructionCheckpoint: undefined },
          null,
          executionToken
        );
      }
    }
    else if (run && run.phase === 'calculating' && run.phases.calculating === 'running') {
      const executionToken = claimClaimConstructorPhaseExecution_(runId, 'calculating');
      if (!executionToken) {
        return loadClaimConstructorRun_();
      }
      const calculations = runAllSheetsIndexation_(spreadsheet, {
        onProgress: (checkpoint) => updateClaimConstructorCalculationCheckpoint_(
          runId, spreadsheet, checkpoint
        ),
      });
      const claimCalculation = runClaimSheetCalculation_(spreadsheet);
      const dashboard = buildClaimConstructorDashboardResult_(
        spreadsheet,
        calculations,
        run.inputs.docUrl || '',
        claimCalculation
      );
      const claimIssues = (claimCalculation.issues || []).map((issue) => ({
        phase: 'calculating',
        sourceKind: 'calculation_sheet',
        reason: issue.reason || issue.code,
        reviewStatus: 'раздел пропущен',
        suggestedAction: 'Добавить недостающие расчетные параметры в Google Sheets и повторить запуск.',
      }));
      const workflowIssues = aggregateClaimConstructorIssues_(
        collectClaimConstructorIssueSignals_(spreadsheet, run.results.reconstruction, calculations)
      );
      run = recordClaimConstructorPhaseResult_(
        runId,
        'calculating',
        'writing_doc',
        'calculations',
        calculations,
        'Расчет в Google Sheets завершен. Создаем новую версию расчета в Google Docs.',
        { dashboard, claimCalculation },
        workflowIssues.concat(claimIssues),
        executionToken
      );
    }
    else if (run && run.phase === 'writing_doc' && run.phases.writing_doc === 'running') {
      let docs = findSuccessfulSelectedClaimDocumentByIdempotency_(spreadsheet, runId);
      const persistedExecution = run.phaseExecutions && run.phaseExecutions.writing_doc;
      const executionToken = docs && persistedExecution
        ? persistedExecution.token
        : claimClaimConstructorPhaseExecution_(runId, 'writing_doc');
      if (!executionToken) {
        return loadClaimConstructorRun_();
      }
      const docIssues = [];
      if (!docs) {
        try {
          docs = writeSelectedClaimDocument({
            spreadsheet,
            source: 'constructor_run',
            idempotencyKey: run.id,
          });
        } catch (error) {
          if (!isSelectedClaimDocumentCorrectiveError_(error)) throw error;
          docs = {
            created: false,
            code: error.code,
            reason: error.message,
            source: 'constructor_run',
            idempotencyKey: run.id,
          };
          docIssues.push(buildClaimConstructorCorrectiveDocsIssue_(error, run));
        }
      }
      if (docs && docs.created !== false && docs.reused === true && !docs.selectedTotals
        && typeof buildSelectedClaimPayload_ === 'function'
        && typeof summarizeSelectedClaimDashboardTotals_ === 'function') {
        docs.selectedTotals = summarizeSelectedClaimDashboardTotals_(
          buildSelectedClaimPayload_(spreadsheet)
        );
      }
      const serializedDocs = normalizeClaimConstructorDocsResult_(docs);
      try {
        run = finishClaimConstructorRun_(
          runId, 'writing_doc', 'docs', serializedDocs, docIssues, executionToken
        );
      } catch (saveError) {
        const committed = findSuccessfulSelectedClaimDocumentByIdempotency_(spreadsheet, runId);
        if (!committed) throw saveError;
        run = finishClaimConstructorRun_(
          runId, 'writing_doc', 'docs', normalizeClaimConstructorDocsResult_(committed),
          docIssues, executionToken
        );
      }
    }
    if (isClaimConstructorRunActive_(run)) {
      scheduleClaimConstructorContinuation_();
    } else {
      deleteClaimConstructorContinuationTriggers_();
      deleteClaimConstructorWatchdogTriggers_();
    }
  } catch (error) {
    const failedPhase = run && getClaimConstructorPhaseOrder_().indexOf(run.phase) >= 0
      ? run.phase
      : 'unknown';
    const handled = handleClaimConstructorRuntimeError_(runId, failedPhase, error);
    if (handled) {
      refreshClaimConstructorDashboard_(spreadsheet, handled);
    }
    return handled;
  }
  if (run) {
    refreshClaimConstructorDashboard_(spreadsheet, run);
  }
  return run;
}

function normalizeClaimConstructorDocsResult_(result) {
  const value = result || {};
  return {
    created: value.created !== false,
    documentId: value.documentId || '',
    url: value.url || '',
    title: value.title || '',
    sourceDocumentId: value.sourceDocumentId || '',
    source: value.source || 'constructor_run',
    idempotencyKey: value.idempotencyKey || '',
    reused: value.reused === true,
    code: value.code || '',
    reason: value.reason || '',
    selectedTotals: value.selectedTotals || null,
  };
}

function buildClaimConstructorCorrectiveDocsIssue_(error, run) {
  const actions = {
    average_earnings_invalid: 'Указать положительный средний заработок и выбрать сценарий, затем использовать «Расписать выбранные требования».',
    selected_claims_missing: 'Выбрать хотя бы одно требование в разделе «Аудит и требования», затем использовать «Расписать выбранные требования».',
    document_parent_unresolvable: 'Указать доступный расчетный Google Doc ровно в одной нужной папке, затем использовать «Расписать выбранные требования».',
  };
  return {
    phase: 'writing_doc',
    sourceKind: 'calculation_doc',
    source: run && run.inputs ? run.inputs.docUrl || '' : '',
    reason: error.message,
    reviewStatus: 'требуется исправление пользователем',
    knownImpact: 'Google Doc не создан; расчет в Google Sheets завершен',
    suggestedAction: actions[error.code],
  };
}

function isRetryableClaimConstructorRuntimeError_(error) {
  const reason = error && error.message ? error.message : String(error || '');
  return /(Service (?:Spreadsheets|Drive|Documents) failed while accessing|Service unavailable|Internal error|Please try again|timed? out|Timeout|Rate limit|Service invoked too many times|Too many simultaneous invocations|\b(?:408|429|500|502|503|504)\b)/i.test(reason);
}

function pruneResolvedTransientRuntimeIssues_(issues, successfulPhase, phases) {
  return (issues || []).filter((issue) => {
    const resolvedPhase = issue.phase === successfulPhase
      || (phases && phases[issue.phase] === 'done');
    const resolvedRuntimeIssue = issue.sourceKind === 'system'
      && issue.reviewStatus === 'фатальная ошибка';
    return !(resolvedPhase && resolvedRuntimeIssue);
  });
}

function handleClaimConstructorRuntimeError_(runId, failedPhase, error) {
  if (!isRetryableClaimConstructorRuntimeError_(error)) {
    return failClaimConstructorRuntime_(runId, failedPhase, error);
  }

  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  let recovered = null;
  let exhausted = false;
  try {
    const run = loadClaimConstructorRun_();
    if (!run || run.id !== runId || run.status !== 'running'
      || run.phase !== failedPhase || run.phases[failedPhase] !== 'running') {
      return null;
    }
    run.runtimeRetries = run.runtimeRetries || {};
    const previousAttempts = Math.max(0, Number(run.runtimeRetries[failedPhase]) || 0);
    if (previousAttempts >= CLAIM_CONSTRUCTOR_SETTINGS.TRANSIENT_RETRY_LIMIT) {
      exhausted = true;
    } else {
      const attempt = previousAttempts + 1;
      run.runtimeRetries[failedPhase] = attempt;
      run.phaseExecutions = run.phaseExecutions || {};
      delete run.phaseExecutions[failedPhase];
      run.progressText = `Временная ошибка сервиса Google. Повторяем автоматически (${attempt} из ${CLAIM_CONSTRUCTOR_SETTINGS.TRANSIENT_RETRY_LIMIT}).`;
      run.updatedAt = new Date().toISOString();
      saveClaimConstructorRun_(run);
      recovered = run;
    }
  } finally {
    lock.releaseLock();
  }

  if (exhausted) {
    return failClaimConstructorRuntime_(runId, failedPhase, error);
  }
  scheduleClaimConstructorContinuation_();
  ensureClaimConstructorWatchdogTrigger_();
  return recovered;
}

function failClaimConstructorRuntime_(runId, failedPhase, error) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    if (!run || run.id !== runId || run.status !== 'running') {
      return null;
    }
    const reason = error && error.message ? error.message : String(error);
    run.status = 'failed';
    run.phase = 'failed';
    run.failedPhase = failedPhase;
    run.progressText = `Этап завершился ошибкой: ${reason}`;
    run.issues = mergeClaimConstructorIssues_(run.issues, [{
      severity: 'error',
      phase: failedPhase,
      sourceKind: 'system',
      reason,
      reviewStatus: 'фатальная ошибка',
      knownImpact: 'этап не завершен',
      suggestedAction: 'Устранить причину и выбрать «Повторить последний запуск».',
    }]);
    run.updatedAt = new Date().toISOString();
    run.completedAt = run.updatedAt;
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function compactClaimConstructorCalculationEffects_(effects) {
  if (!effects) return null;
  const derivative = effects.derivativeEffects || {};
  return {
    warnings: (effects.warnings || []).slice(),
    derivativeEffects: {
      warnings: (derivative.warnings || []).slice(),
    },
  };
}

function compactClaimConstructorCalculationResult_(result) {
  const value = result || {};
  const compact = {};
  Object.keys(value).forEach((key) => {
    const item = value[key];
    if (item === null || ['string', 'number', 'boolean'].indexOf(typeof item) >= 0) {
      compact[key] = item;
    }
  });
  if (value.totals) {
    compact.totals = {
      underpayment: Number(value.totals.underpayment) || 0,
      indexation: Number(value.totals.indexation) || 0,
      liability: Number(value.totals.liability) || 0,
    };
  }
  if (Array.isArray(value.claimFacts)) compact.claimFactCount = value.claimFacts.length;
  if (Array.isArray(value.derivativeDependencies)) {
    compact.derivativeDependencyCount = value.derivativeDependencies.length;
  }
  if (Array.isArray(value.derivativeWarnings)) {
    compact.derivativeWarningCount = value.derivativeWarnings.length;
  }
  const effects = compactClaimConstructorCalculationEffects_(value.calculationEffects);
  if (effects) compact.calculationEffects = effects;
  return compact;
}

function compactClaimConstructorCalculationResults_(results) {
  return (results || []).map(compactClaimConstructorCalculationResult_);
}

function compactClaimConstructorReconstructionResult_(result) {
  const value = result || {};
  return {
    fillResults: (value.fillResults || []).map(compactClaimConstructorCalculationResult_),
    calculationResults: compactClaimConstructorCalculationResults_(value.calculationResults),
    company: value.company || '',
    quality: value.quality || {},
    stepTimings: (value.stepTimings || []).slice(),
  };
}

function compactClaimConstructorReconstructionCheckpoint_(checkpoint) {
  const compact = Object.assign({}, checkpoint || {});
  compact.fillResults = (compact.fillResults || []).map(compactClaimConstructorCalculationResult_);
  compact.calculationResults = compactClaimConstructorCalculationResults_(compact.calculationResults);
  return compact;
}

function compactClaimConstructorClaimCalculation_(claimCalculation) {
  const value = claimCalculation || {};
  const compact = {};
  Object.keys(value).forEach((key) => {
    const item = value[key];
    if (item === null || ['string', 'number', 'boolean'].indexOf(typeof item) >= 0) {
      compact[key] = item;
    }
  });
  const result = value.result || {};
  compact.result = {};
  Object.keys(result).forEach((key) => {
    const item = result[key];
    if (item === null || ['string', 'number', 'boolean'].indexOf(typeof item) >= 0) {
      compact.result[key] = item;
    }
  });
  compact.issueCount = (value.issues || []).length;
  return compact;
}

function compactClaimConstructorStoredResult_(key, value) {
  if (key === 'reconstruction') return compactClaimConstructorReconstructionResult_(value);
  if (key === 'reconstructionCheckpoint') {
    return value === undefined ? undefined : compactClaimConstructorReconstructionCheckpoint_(value);
  }
  if (key === 'calculations') return compactClaimConstructorCalculationResults_(value);
  if (key === 'claimCalculation') return compactClaimConstructorClaimCalculation_(value);
  return value;
}

function recordClaimConstructorPhaseResult_(runId, expectedPhase, nextPhase, resultKey, result, progressText, additionalResults, issues, executionToken) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    const execution = run && run.phaseExecutions && run.phaseExecutions[expectedPhase];
    if (!run || run.id !== runId || run.phase !== expectedPhase || run.phases[expectedPhase] !== 'running'
      || !execution || execution.token !== executionToken) {
      return null;
    }
    run.results[resultKey] = compactClaimConstructorStoredResult_(resultKey, result);
    Object.keys(additionalResults || {}).forEach((key) => {
      run.results[key] = compactClaimConstructorStoredResult_(key, additionalResults[key]);
    });
    run.issues = mergeClaimConstructorIssues_(run.issues, issues || []);
    run.issues = pruneResolvedTransientRuntimeIssues_(run.issues, expectedPhase, run.phases);
    delete run.phaseExecutions[expectedPhase];
    if (run.runtimeRetries) delete run.runtimeRetries[expectedPhase];
    completeClaimConstructorPhase_(run, expectedPhase, nextPhase, new Date());
    run.progressText = progressText || run.progressText;
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function recordClaimConstructorPhaseCheckpoint_(runId, expectedPhase, resultKey, checkpoint, executionToken) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    const execution = run && run.phaseExecutions && run.phaseExecutions[expectedPhase];
    if (!run || run.id !== runId || run.phase !== expectedPhase || run.phases[expectedPhase] !== 'running'
      || !execution || execution.token !== executionToken) {
      return null;
    }
    const value = compactClaimConstructorStoredResult_(resultKey, checkpoint || {});
    run.results[resultKey] = value;
    const totalSteps = Math.max(1, Number(value.totalSteps) || 1);
    const completedSteps = Math.max(0, Math.min(totalSteps, Number(value.nextStep) || 0));
    run.progress = {
      phase: expectedPhase,
      processed: completedSteps,
      total: totalSteps,
      percent: Math.min(84, 70 + Math.round(completedSteps / totalSteps * 15)),
    };
    run.progressText = value.currentStep || 'Продолжаем реконструкцию';
    run.updatedAt = value.updatedAt || new Date().toISOString();
    run.issues = pruneResolvedTransientRuntimeIssues_(run.issues, expectedPhase, run.phases);
    delete run.phaseExecutions[expectedPhase];
    if (run.runtimeRetries) delete run.runtimeRetries[expectedPhase];
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function finishClaimConstructorRun_(runId, expectedPhase, resultKey, result, issues, executionToken) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    const execution = run && run.phaseExecutions && run.phaseExecutions[expectedPhase];
    if (!run || run.id !== runId || run.phase !== expectedPhase || run.phases[expectedPhase] !== 'running'
      || !execution || execution.token !== executionToken) {
      return null;
    }
    run.results[resultKey] = result;
    if (resultKey === 'docs' && result && result.url) {
      run.results.dashboard = run.results.dashboard || {};
      run.results.dashboard.output = run.results.dashboard.output || {};
      run.results.dashboard.output.docUrl = result.url;
      if (result.selectedTotals) {
        run.results.dashboard.totals = result.selectedTotals;
      }
      run.inputs.docUrl = result.url;
    }
    run.issues = mergeClaimConstructorIssues_(run.issues, issues || []);
    run.issues = pruneResolvedTransientRuntimeIssues_(run.issues, expectedPhase, run.phases);
    delete run.phaseExecutions[expectedPhase];
    if (run.runtimeRetries) delete run.runtimeRetries[expectedPhase];
    completeClaimConstructorPhase_(run, expectedPhase, null, new Date());
    const hasWarnings = run.issues.length > 0;
    run.status = hasWarnings ? 'complete_with_warnings' : 'complete';
    run.phase = run.status;
    run.progressText = hasWarnings
      ? 'Расчет готов. Спорные позиции отмечены в разделе «Требует внимания».'
      : 'Расчет и доступная расшифровка готовы.';
    run.completedAt = run.updatedAt;
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function claimClaimConstructorPhaseExecution_(runId, phase, now) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    if (!run || run.id !== runId || run.status !== 'running'
      || run.phase !== phase || run.phases[phase] !== 'running') {
      return null;
    }
    run.phaseExecutions = run.phaseExecutions || {};
    const existing = run.phaseExecutions[phase];
    const currentTime = now || new Date();
    const existingStartedAt = existing ? new Date(existing.startedAt || 0).getTime() : 0;
    const existingFresh = existing && Number.isFinite(existingStartedAt)
      && currentTime.getTime() - existingStartedAt <= CLAIM_CONSTRUCTOR_SETTINGS.PHASE_EXECUTION_LEASE_MS;
    if (existingFresh) {
      return null;
    }
    const token = Utilities.getUuid();
    run.phaseExecutions[phase] = {
      token,
      startedAt: currentTime.toISOString(),
    };
    run.updatedAt = currentTime.toISOString();
    saveClaimConstructorRun_(run);
    return token;
  } finally {
    lock.releaseLock();
  }
}

function refreshClaimConstructorDashboard_(spreadsheet, run) {
  const sheet = ensureClaimConstructorWorkspace_(spreadsheet).constructor;
  writeClaimConstructorStatus_(sheet, run);
  renderClaimConstructorResults_(sheet, run.results.dashboard || run.results);
  renderClaimConstructorIssues_(sheet, run.issues);
}

function buildClaimConstructorDashboardResult_(spreadsheet, calculationResults, docUrl, claimCalculation) {
  const totals = (calculationResults || []).reduce((acc, result) => {
    const item = result.totals || {};
    acc.underpayment += Number(item.underpayment) || 0;
    acc.indexation += Number(item.indexation) || 0;
    acc.liability += Number(item.liability) || 0;
    return acc;
  }, { underpayment: 0, indexation: 0, liability: 0 });
  // Totals shown as claims must be fully represented by selectable audit facts.
  // Forced-absence/vacation calculations remain available in their own cells,
  // but are not added here until they have stable selectable audit keys.
  totals.total = totals.underpayment + totals.indexation + totals.liability;
  return {
    totals,
    output: {
      docUrl: docUrl || '',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheet.getId()}/edit`,
    },
  };
}

function collectClaimConstructorIssueSignals_(spreadsheet, reconstructionResult, calculationResults) {
  const qualityRows = readClaimConstructorIssueSheetRows_(spreadsheet, 'Расчетные_листы_Качество');
  const qualityGateRows = readClaimConstructorIssueSheetRows_(spreadsheet, 'Расчетные_листы_Проверки')
    .filter((row) => String(row[1] || '').toLowerCase() !== 'инфо');
  const vlmRows = readClaimConstructorIssueSheetRows_(spreadsheet, 'Расчетные_листы_VLM');
  const diagnosticIssues = readClaimConstructorIssueSheetRows_(spreadsheet, 'Расчетные_листы_Диагностика')
    .filter((row) => /(ошиб|предуп|не распоз|пропущ|не найден)/i.test(row.join(' ')))
    .map((row, index) => ({
      source: `Расчетные_листы_Диагностика!${index + 2}`,
      reason: row.join(' | '),
    }));
  const reconstructionIssues = buildClaimConstructorReconstructionIssues_(reconstructionResult);
  const skippedCalculationIssues = (calculationResults || [])
    .filter((result) => result.error || Number(result.skipped) > 0)
    .map((result) => ({
      source: result.sheetName || result.layoutId || '',
      reason: result.error
        ? `Расчет завершился ошибкой: ${result.error}`
        : `При расчете пропущено ${result.skipped} строк.`,
      reviewStatus: result.error ? 'ошибка расчета' : 'частичный расчет',
    }));
  const calculationEffects = calculationResults && (
    calculationResults.calculationEffects
    || (calculationResults.find && calculationResults.find((result) => result.calculationEffects) || {})
      .calculationEffects
  );
  const calculationEffectIssues = calculationEffects && calculationEffects.warnings
    ? calculationEffects.warnings.map((warning) => ({
        source: warning.source || warning.targetKey || '',
        reason: warning.reason || warning.code,
        reviewStatus: warning.code === 'unallocated_recovery'
          ? 'спорное нераспределенное погашение'
          : 'требует проверки',
        sourceKind: 'calculation_sheet',
      }))
    : [];
  return {
    qualityRows,
    qualityGateRows,
    vlmRows,
    diagnosticIssues,
    reconstructionIssues,
    skippedCalculationIssues,
    calculationEffectIssues,
  };
}

function refreshClaimConstructorReviewIssues() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) return null;
  let run;
  let spreadsheet;
  try {
    run = loadClaimConstructorRun_();
    if (!run) return null;
    spreadsheet = SpreadsheetApp.openById(run.spreadsheetId);
    const finalIssues = aggregateClaimConstructorIssues_(
      collectClaimConstructorIssueSignals_(
        spreadsheet,
        run.results && run.results.reconstruction,
        run.results && run.results.calculations
      )
    );
    run.issues = mergeClaimConstructorIssues_(run.issues, finalIssues);
    run.updatedAt = new Date().toISOString();
    saveClaimConstructorRun_(run);
  } finally {
    lock.releaseLock();
  }
  refreshClaimConstructorDashboard_(spreadsheet, run);
  return {
    runId: run.id,
    status: run.status,
    issueCount: run.issues.length,
  };
}

function readClaimConstructorIssueSheetRows_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  return sheet.getDataRange().getValues().slice(1);
}

function buildClaimConstructorReconstructionIssues_(reconstructionResult) {
  const quality = reconstructionResult && reconstructionResult.quality;
  if (!quality) {
    return [];
  }
  const issues = [];
  if ((quality.companies || []).length > 1) {
    issues.push({
      source: 'Реконструкция',
      reason: `В расчетных листках найдены разные организации: ${quality.companies.join(', ')}.`,
    });
  }
  if ((quality.blankCompanyPeriods || []).length) {
    issues.push({
      source: 'Реконструкция',
      reason: `Не распознана организация за периоды: ${quality.blankCompanyPeriods.join(', ')}.`,
    });
  }
  Object.keys(quality.periodIssues || {}).forEach((period) => {
    issues.push({
      source: `Реконструкция, ${period}`,
      reason: String(quality.periodIssues[period]),
    });
  });
  return issues;
}

function appendClaimConstructorIssuesToRun_(runId, expectedPhase, issues) {
  if (!issues || !issues.length) {
    return loadClaimConstructorRun_();
  }
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    if (!run || run.id !== runId || run.phase !== expectedPhase || run.phases[expectedPhase] !== 'running') {
      return null;
    }
    run.issues = mergeClaimConstructorIssues_(run.issues, issues);
    run.updatedAt = new Date().toISOString();
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function failClaimConstructorRunAfterImport_(runId, importResult) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    if (!run || run.id !== runId || run.phase !== 'importing' || run.phases.importing !== 'running') {
      return null;
    }
    run.phases.importing = 'done';
    run.results.import = {
      source: importResult.source || '',
      total: importResult.total || 0,
      processed: importResult.processed || 0,
      rowsRecognized: importResult.rowsRecognized || 0,
      skippedCount: Number.isFinite(importResult.skippedCount)
        ? importResult.skippedCount
        : (importResult.skippedFiles || []).length,
    };
    run.issues = mergeClaimConstructorIssues_(run.issues, [{
      severity: 'error',
      phase: 'importing',
      sourceKind: 'payroll_slips',
      reason: 'Импорт завершен без расчетных строк, поэтому расчет и Docs не запускались.',
      reviewStatus: 'фатальная проверка',
      knownImpact: 'расчет не выполнен',
      suggestedAction: 'Проверить исходные файлы и повторить импорт.',
    }]);
    run.status = 'failed';
    run.phase = 'failed';
    run.failedPhase = 'importing';
    run.progressText = 'Не найдено расчетных строк. Диагностика импорта сохранена.';
    run.updatedAt = new Date().toISOString();
    run.completedAt = run.updatedAt;
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}

function createClaimConstructorRetryRun_(previousRun, options) {
  const settings = options || {};
  const phaseOrder = getClaimConstructorPhaseOrder_();
  let restartIndex = phaseOrder.indexOf(previousRun && previousRun.failedPhase);
  if (restartIndex < 0) {
    restartIndex = phaseOrder.findIndex((phase) => previousRun.phases[phase] !== 'done');
  }
  if (restartIndex < 0) {
    restartIndex = 0;
  }

  const run = createClaimConstructorRun_(previousRun.inputs, {
    now: settings.now || new Date(),
    parentRunId: previousRun.id,
  });
  phaseOrder.forEach((phase, index) => {
    run.phases[phase] = index < restartIndex && previousRun.phases[phase] === 'done'
      ? 'done'
      : (index === restartIndex ? 'running' : 'pending');
  });
  run.phase = phaseOrder[restartIndex];
  run.progressText = `Повторяем этап: ${getClaimConstructorLayout_().phaseLabels[run.phase] || run.phase}.`;
  run.issues = pruneResolvedTransientRuntimeIssues_(
    JSON.parse(JSON.stringify(previousRun.issues || [])),
    previousRun.failedPhase,
    previousRun.phases
  );
  run.results = {};
  const resultKeysByPhase = {
    importing: ['import'],
    reconstructing: ['reconstruction'],
    calculating: ['calculations', 'claimCalculation', 'dashboard'],
    writing_doc: ['docs'],
  };
  phaseOrder.slice(0, restartIndex).forEach((phase) => {
    (resultKeysByPhase[phase] || []).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(previousRun.results || {}, key)) {
        run.results[key] = JSON.parse(JSON.stringify(
          compactClaimConstructorStoredResult_(key, previousRun.results[key])
        ));
      }
    });
  });
  return run;
}

function retryClaimCalculation() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return loadClaimConstructorRun_();
  }
  let successor;
  try {
    const previous = loadClaimConstructorRun_();
    if (!previous) {
      return null;
    }
    if (previous.corruptState) {
      return previous;
    }
    if (previous.status === 'running') {
      if (!isClaimConstructorRunStale_(previous, PropertiesService.getDocumentProperties(), new Date())) {
        return previous;
      }
      previous.status = 'failed';
      previous.failedPhase = previous.phase;
      previous.phase = 'failed';
      previous.progressText = 'Предыдущий запуск устарел; создан повтор с первого незавершенного этапа.';
      previous.updatedAt = new Date().toISOString();
      previous.completedAt = previous.updatedAt;
    } else if (previous.status !== 'failed') {
      return previous;
    }
    successor = createClaimConstructorRetryRun_(previous);
    saveClaimConstructorRun_(successor);
  } finally {
    lock.releaseLock();
  }

  const spreadsheet = SpreadsheetApp.openById(successor.spreadsheetId);
  const constructorSheet = ensureClaimConstructorWorkspace_(spreadsheet).constructor;
  renderClaimConstructorInputErrors_(constructorSheet, []);
  refreshClaimConstructorDashboard_(spreadsheet, successor);
  if (successor.phase === 'validating' || successor.phase === 'importing') {
    return continueClaimConstructorRetryImport_(successor, spreadsheet);
  }
  if (['reconstructing', 'calculating', 'writing_doc'].indexOf(successor.phase) >= 0) {
    return continueClaimConstructorPipeline_(successor.id, { spreadsheet });
  }
  return successor;
}

function classifyClaimConstructorSheet_(sheet) {
  const name = String(sheet && sheet.getName ? sheet.getName() : '').trim();
  const normalized = name.toLowerCase().replace(/ё/g, 'е');
  if (name === CLAIM_CONSTRUCTOR_SETTINGS.SHEET_NAME) {
    return 'constructor';
  }
  if (typeof CLAIM_INTAKE_SETTINGS !== 'undefined' && name === CLAIM_INTAKE_SETTINGS.SHEET_NAME) {
    return 'questionnaire';
  }
  if (/^(оклад|ежемесячные|ежеквартальные|ежегодные|отпуска(?: и расчет)?)$/.test(normalized)) {
    return 'primary_calculation';
  }
  if (/^(?:реконструкция_|из_)/i.test(name)) {
    return 'reconstruction';
  }
  if (/^расчетные_листы(?:_|$)/i.test(name) || /(диагност|качество|\bvlm\b|проверки|состояние|структура выплат|аудит)/i.test(name)) {
    return 'technical';
  }
  return 'other';
}

function applyClaimConstructorVisibilityMode_(mode, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const normalizedMode = ['normal', 'detail', 'technical'].indexOf(mode) >= 0 ? mode : 'normal';
  let constructorSheet = target.getSheetByName(CLAIM_CONSTRUCTOR_SETTINGS.SHEET_NAME);
  let questionnaireSheet = typeof CLAIM_INTAKE_SETTINGS !== 'undefined'
    ? target.getSheetByName(CLAIM_INTAKE_SETTINGS.SHEET_NAME)
    : null;
  if (!constructorSheet || !questionnaireSheet) {
    const workspace = ensureClaimConstructorWorkspace_(target);
    constructorSheet = workspace.constructor;
    questionnaireSheet = workspace.questionnaire;
  }
  constructorSheet.showSheet();
  questionnaireSheet.showSheet();

  target.getSheets().forEach((sheet) => {
    const group = classifyClaimConstructorSheet_(sheet);
    const visible = normalizedMode === 'technical'
      || group === 'constructor'
      || group === 'questionnaire'
      || (normalizedMode === 'detail' && group === 'primary_calculation');
    if (visible) {
      sheet.showSheet();
    } else {
      sheet.hideSheet();
    }
  });
  PropertiesService
    .getDocumentProperties()
    .setProperty(CLAIM_CONSTRUCTOR_SETTINGS.VISIBILITY_MODE_PROPERTY, normalizedMode);
  return normalizedMode;
}

function showClaimConstructorNormalMode() {
  return applyClaimConstructorVisibilityMode_('normal');
}

function showClaimConstructorDetailMode() {
  return applyClaimConstructorVisibilityMode_('detail');
}

function showClaimConstructorTechnicalMode() {
  return applyClaimConstructorVisibilityMode_('technical');
}

function continueClaimConstructorRetryImport_(successor, spreadsheet) {
  const validation = validateClaimConstructorInputs_(successor.inputs);
  const sheet = ensureClaimConstructorWorkspace_(spreadsheet).constructor;
  renderClaimConstructorInputErrors_(sheet, validation.errors);
  if (!validation.valid) {
    const failed = failClaimConstructorValidation_(successor.id, validation.errors);
    refreshClaimConstructorDashboard_(spreadsheet, failed);
    return failed;
  }

  let run = successor;
  if (run.phase === 'validating') {
    run = advanceActiveClaimConstructorRun_(
      run.id,
      'validating',
      'importing',
      { progressText: 'Повторно импортируем расчетные листки.' }
    );
  }
  try {
    getClaimConstructorSourceAdapters_().payroll_slips.start(spreadsheet, {
      id: run.inputs.folderId,
      source: `${sheet.getName()}!${getClaimConstructorLayout_().sourceFolder.valueCell}`,
    }, {
      force: false,
      dryRun: false,
      constructorRunId: run.id,
      constructorNextPhase: 'reconstructing',
    });
  } catch (error) {
    const failed = failClaimConstructorRuntime_(run.id, 'importing', error);
    refreshClaimConstructorDashboard_(spreadsheet, failed);
    return failed;
  }
  return loadClaimConstructorRun_() || run;
}

function failClaimConstructorValidation_(runId, errors) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return null;
  }
  try {
    const run = loadClaimConstructorRun_();
    if (!run || run.id !== runId) {
      return null;
    }
    run.status = 'failed';
    run.phase = 'failed';
    run.failedPhase = 'validating';
    run.progressText = (errors || []).map((error) => error.message).join(' ');
    run.updatedAt = new Date().toISOString();
    run.completedAt = run.updatedAt;
    saveClaimConstructorRun_(run);
    return run;
  } finally {
    lock.releaseLock();
  }
}
