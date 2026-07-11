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
    writingDoc: 'Формирование расшифровки в Google Docs',
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
