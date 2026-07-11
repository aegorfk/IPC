const CLAIM_CONSTRUCTOR_SETTINGS = {
  SHEET_NAME: 'Конструктор',
  SOURCE_FOLDER_LABEL: 'Исходные данные:',
  SOURCE_FOLDER_NAMED_RANGE: 'CLAIM_CONSTRUCTOR_SOURCE_FOLDER',
  OUTPUT_DOC_LABEL: 'Расписанный расчет:',
  OUTPUT_DOC_NAMED_RANGE: 'CLAIM_CONSTRUCTOR_OUTPUT_DOC',
  RUN_STATE_PROPERTY: 'CLAIM_CONSTRUCTOR_RUN_STATE',
  VISIBILITY_MODE_PROPERTY: 'CLAIM_CONSTRUCTOR_VISIBILITY_MODE',
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
    reconstructing: 'Реконструкция начислений и выплат',
    calculating: 'Расчет недоплат, индексации и пеней',
    writing_doc: 'Формирование расшифровки в Google Docs',
    complete: 'Готово',
    completeWithWarnings: 'Готово с замечаниями',
    failed: 'Ошибка',
  },
};

function getClaimConstructorLayout_() {
  return {
    sheetName: CLAIM_CONSTRUCTOR_SETTINGS.SHEET_NAME,
    sourceFolder: {
      label: CLAIM_CONSTRUCTOR_SETTINGS.SOURCE_FOLDER_LABEL,
      namedRange: CLAIM_CONSTRUCTOR_SETTINGS.SOURCE_FOLDER_NAMED_RANGE,
      labelCell: 'A4',
      valueCell: 'B4',
    },
    outputDoc: {
      label: CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_LABEL,
      namedRange: CLAIM_CONSTRUCTOR_SETTINGS.OUTPUT_DOC_NAMED_RANGE,
      labelCell: 'A6',
      valueCell: 'B6',
    },
    status: {
      titleCell: 'A9',
      phaseCell: 'B9',
      messageCell: 'B10',
      updatedAtCell: 'B11',
    },
    totalsStartRow: 14,
    resultFields: {
      underpayment: { label: 'Недоплата', labelCell: 'A15', valueCell: 'B15' },
      indexation: { label: 'Индексация', labelCell: 'A16', valueCell: 'B16' },
      liability: { label: 'Пени и материальная ответственность', labelCell: 'A17', valueCell: 'B17' },
      total: { label: 'Итого требований', labelCell: 'A18', valueCell: 'B18' },
    },
    outputLinks: {
      docLabelCell: 'A19',
      docCell: 'B19',
      spreadsheetLabelCell: 'A20',
      spreadsheetCell: 'B20',
    },
    issuesHeaderRow: 22,
    issueHeaders: CLAIM_CONSTRUCTOR_SETTINGS.ISSUE_HEADERS.slice(),
    phaseLabels: Object.assign({}, CLAIM_CONSTRUCTOR_SETTINGS.PHASE_LABELS),
  };
}

function ensureClaimConstructorSheet_(spreadsheet) {
  const layout = getClaimConstructorLayout_();
  let sheet = spreadsheet.getSheetByName(layout.sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(layout.sheetName, 0);
  }

  applyClaimConstructorStructure_(sheet, layout);
  formatClaimConstructorSheet_(sheet, layout);
  spreadsheet.setNamedRange(layout.sourceFolder.namedRange, sheet.getRange(layout.sourceFolder.valueCell));
  spreadsheet.setNamedRange(layout.outputDoc.namedRange, sheet.getRange(layout.outputDoc.valueCell));
  return sheet;
}

function applyClaimConstructorStructure_(sheet, layout) {
  sheet.getRange('A1').setValue('Конструктор требований');
  sheet.getRange(layout.sourceFolder.labelCell).setValue(layout.sourceFolder.label);
  sheet.getRange(layout.outputDoc.labelCell).setValue(layout.outputDoc.label);
  sheet.getRange(layout.status.titleCell).setValue('Статус:');
  setClaimConstructorCellIfBlank_(sheet.getRange(layout.status.phaseCell), 'Готов к запуску');
  sheet.getRange(layout.totalsStartRow, 1).setValue('Итоги расчета');
  sheet.getRange(layout.totalsStartRow + 1, 1, 4, 1).setValues([
    ['Недоплата'],
    ['Индексация'],
    ['Пени и материальная ответственность'],
    ['Итого требований'],
  ]);
  sheet.getRange(layout.outputLinks.docLabelCell).setValue('Расшифровка в Google Docs');
  sheet.getRange(layout.outputLinks.spreadsheetLabelCell).setValue('Рабочая таблица');
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
    .setBackground('#0B57D0')
    .setFontColor('#FFFFFF')
    .setFontSize(16)
    .setFontWeight('bold');
  sheet.getRange(4, 1, 3, 2).setWrap(true).setVerticalAlignment('middle');
  sheet.getRange(layout.issuesHeaderRow, 1, 1, layout.issueHeaders.length)
    .setBackground('#E8F0FE')
    .setFontWeight('bold')
    .setWrap(true);
}

function openClaimConstructor() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureClaimConstructorSheet_(spreadsheet);
  sheet.showSheet();
  sheet.activate();
  return sheet;
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
  const folderId = namedFolderId || (labeledFolder ? labeledFolder.id : '');
  const docId = namedDocId || extractGoogleDocId_(labeledDocUrl);

  return {
    folderUrl: namedFolderId ? namedFolderUrl : (folderId ? `https://drive.google.com/drive/folders/${folderId}` : ''),
    folderId,
    docUrl: namedDocId ? namedDocUrl : labeledDocUrl,
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
    issues: [],
    results: {},
  };
}

function serializeClaimConstructorRun_(run) {
  return JSON.stringify(run);
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
  const store = properties || PropertiesService.getScriptProperties();
  store.setProperty(CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_PROPERTY, serializeClaimConstructorRun_(run));
  return run;
}

function loadClaimConstructorRun_(properties) {
  const store = properties || PropertiesService.getScriptProperties();
  return parseClaimConstructorRun_(store.getProperty(CLAIM_CONSTRUCTOR_SETTINGS.RUN_STATE_PROPERTY));
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
  const properties = settings.properties || PropertiesService.getScriptProperties();
  const now = settings.now || new Date();
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) {
    return { run: loadClaimConstructorRun_(properties), joined: true, busy: true };
  }

  try {
    const active = loadClaimConstructorRun_(properties);
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
    return true;
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
  const store = properties || PropertiesService.getScriptProperties();
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
  return ScriptApp.getProjectTriggers().some((trigger) =>
    trigger.getHandlerFunction && trigger.getHandlerFunction() === handler
  );
}

function advanceActiveClaimConstructorRun_(runId, expectedPhase, nextPhase, options) {
  const settings = options || {};
  const properties = settings.properties || PropertiesService.getScriptProperties();
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
  sheet.getRange(layout.status.messageCell).setValue(run.progressText || '');
  sheet.getRange(layout.status.updatedAtCell).setValue(run.updatedAt || '');
  return sheet;
}

function normalizeClaimConstructorIssue_(issue) {
  const value = issue || {};
  return {
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
}

function aggregateClaimConstructorIssues_(signals) {
  const values = signals || {};
  const issues = [];
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
    issues.push(normalizeClaimConstructorIssue_({
      phase: 'importing',
      sourceKind: 'payroll_slips',
      source: row[0] || '',
      reason: row[10] || 'Строки распознаны с помощью VLM.',
      reviewStatus: row[3] || 'VLM',
      suggestedAction: 'Сверить распознанные значения с исходным файлом.',
    }));
  });
  appendClaimConstructorSignalIssues_(issues, values.diagnosticIssues, 'importing');
  appendClaimConstructorSignalIssues_(issues, values.reconstructionIssues, 'reconstructing');
  appendClaimConstructorSignalIssues_(issues, values.skippedCalculationIssues, 'calculating');
  return issues;
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
  const output = values.output || {};
  Object.keys(layout.resultFields).forEach((key) => {
    const value = Object.prototype.hasOwnProperty.call(totals, key) ? totals[key] : '';
    sheet.getRange(layout.resultFields[key].valueCell).setValue(value);
  });
  sheet.getRange(layout.outputLinks.docCell).setValue(output.docUrl || '');
  sheet.getRange(layout.outputLinks.spreadsheetCell).setValue(output.spreadsheetUrl || '');
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
  const sheet = ensureClaimConstructorSheet_(spreadsheet);
  const run = loadClaimConstructorRun_();
  if (run) {
    writeClaimConstructorStatus_(sheet, run);
    renderClaimConstructorResults_(sheet, run.results);
    renderClaimConstructorIssues_(sheet, run.issues);
  }
  const mode = PropertiesService
    .getDocumentProperties()
    .getProperty(CLAIM_CONSTRUCTOR_SETTINGS.VISIBILITY_MODE_PROPERTY);
  if (mode && typeof applyClaimConstructorVisibilityMode_ === 'function') {
    applyClaimConstructorVisibilityMode_(mode, spreadsheet);
  }
  return true;
}
