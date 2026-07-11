const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const SOURCE_FILES = [
  'google-apps-script/SalaryIndexation.gs',
  'google-apps-script/ZupImport.gs',
  'google-apps-script/ClaimConstructor.gs',
];

class FakeRichText {
  constructor(link) {
    this.link = link || '';
  }

  getLinkUrl() {
    return this.link;
  }
}

class FakeRange {
  constructor(sheet, row, column, rowCount, columnCount) {
    this.sheet = sheet;
    this.row = row;
    this.column = column;
    this.rowCount = rowCount || 1;
    this.columnCount = columnCount || 1;
  }

  getValues() {
    return this.sheet.readGrid(this.row, this.column, this.rowCount, this.columnCount, 'value');
  }

  getDisplayValues() {
    return this.getValues().map((row) => row.map((value) => value === null || value === undefined ? '' : String(value)));
  }

  getRichTextValues() {
    return this.sheet.readGrid(this.row, this.column, this.rowCount, this.columnCount, 'link')
      .map((row) => row.map((link) => new FakeRichText(link)));
  }

  getValue() {
    return this.getValues()[0][0];
  }

  setValue(value) {
    return this.setValues([[value]]);
  }

  setValues(values) {
    this.sheet.writeGrid(this.row, this.column, values, 'value');
    return this;
  }

  setRichTextValue(value) {
    const link = value && typeof value.getLinkUrl === 'function' ? value.getLinkUrl() : '';
    this.sheet.writeGrid(this.row, this.column, [[link]], 'link');
    return this;
  }

  clearContent() {
    const empty = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(''));
    return this.setValues(empty);
  }

  merge() { return this; }
  breakApart() { return this; }
  setBackground() { return this; }
  setBorder() { return this; }
  setFontColor() { return this; }
  setFontFamily() { return this; }
  setFontSize() { return this; }
  setFontWeight() { return this; }
  setHorizontalAlignment() { return this; }
  setNumberFormat() { return this; }
  setNote() { return this; }
  setVerticalAlignment() { return this; }
  setWrap() { return this; }
}

class FakeSheet {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.hidden = false;
    this.cells = new Map();
    this.links = new Map();
    this.frozenRows = 0;
    this.columnWidths = new Map();
  }

  key(row, column) {
    return `${row}:${column}`;
  }

  seed(row, column, value, link) {
    this.cells.set(this.key(row, column), value);
    if (link) this.links.set(this.key(row, column), link);
    return this;
  }

  readGrid(row, column, rowCount, columnCount, kind) {
    const store = kind === 'link' ? this.links : this.cells;
    return Array.from({ length: rowCount }, (_, rowOffset) =>
      Array.from({ length: columnCount }, (_, columnOffset) =>
        store.get(this.key(row + rowOffset, column + columnOffset)) || ''
      )
    );
  }

  writeGrid(row, column, values, kind) {
    const store = kind === 'link' ? this.links : this.cells;
    values.forEach((valuesRow, rowOffset) => {
      valuesRow.forEach((value, columnOffset) => {
        store.set(this.key(row + rowOffset, column + columnOffset), value);
      });
    });
  }

  getName() { return this.name; }
  getSheetId() { return this.id; }
  getRange(row, column, rowCount, columnCount) {
    if (typeof row === 'string') {
      const match = row.match(/^([A-Z]+)(\d+)$/i);
      if (!match) throw new Error(`Unsupported A1 range ${row}`);
      const parsedColumn = match[1].toUpperCase().split('').reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0);
      return new FakeRange(this, Number(match[2]), parsedColumn, 1, 1);
    }
    return new FakeRange(this, row, column, rowCount, columnCount);
  }
  getDataRange() {
    return this.getRange(1, 1, Math.max(this.getLastRow(), 1), Math.max(this.getLastColumn(), 1));
  }
  getLastRow() {
    return Math.max(0, ...Array.from(this.cells.keys()).map((key) => Number(key.split(':')[0])));
  }
  getLastColumn() {
    return Math.max(0, ...Array.from(this.cells.keys()).map((key) => Number(key.split(':')[1])));
  }
  getIndex() { return this.spreadsheet.sheets.indexOf(this) + 1; }
  activate() { this.spreadsheet.activeSheet = this; return this; }
  hideSheet() { this.hidden = true; return this; }
  showSheet() { this.hidden = false; return this; }
  isSheetHidden() { return this.hidden; }
  setFrozenRows(count) { this.frozenRows = count; return this; }
  setColumnWidth(column, width) { this.columnWidths.set(column, width); return this; }
  setRowHeight() { return this; }
  autoResizeRows() { return this; }
}

class FakeSpreadsheet {
  constructor(sheetNames) {
    this.sheets = sheetNames.map((name, index) => new FakeSheet(name, index + 100));
    this.sheets.forEach((sheet) => { sheet.spreadsheet = this; });
    this.activeSheet = this.sheets[0] || null;
    this.namedRanges = new Map();
    this.toasts = [];
  }

  getId() { return 'fake-spreadsheet-id'; }
  getSheets() { return this.sheets.slice(); }
  getSheetByName(name) { return this.sheets.find((sheet) => sheet.getName() === name) || null; }
  getActiveSheet() { return this.activeSheet; }
  setActiveSheet(sheet) { this.activeSheet = sheet; return sheet; }
  insertSheet(name, index) {
    const sheet = new FakeSheet(name, 100 + this.sheets.length);
    sheet.spreadsheet = this;
    const targetIndex = Number.isInteger(index) ? index : this.sheets.length;
    this.sheets.splice(targetIndex, 0, sheet);
    return sheet;
  }
  setNamedRange(name, range) { this.namedRanges.set(name, range); }
  getRangeByName(name) { return this.namedRanges.get(name) || null; }
  getNamedRanges() {
    return Array.from(this.namedRanges.entries()).map(([name, range]) => ({
      getName: () => name,
      getRange: () => range,
      remove: () => this.namedRanges.delete(name),
    }));
  }
  toast(message, title) { this.toasts.push({ message, title }); }
}

class FakeProperties {
  constructor() {
    this.values = new Map();
  }
  getProperty(name) { return this.values.has(name) ? this.values.get(name) : null; }
  setProperty(name, value) { this.values.set(name, String(value)); return this; }
  deleteProperty(name) { this.values.delete(name); return this; }
}

function createHarness(sheetNames = ['Оклад']) {
  const spreadsheet = new FakeSpreadsheet(sheetNames);
  const scriptProperties = new FakeProperties();
  const documentProperties = new FakeProperties();
  const driveFolders = new Map();
  const driveFiles = new Map();
  const documents = new Map();
  const menus = [];
  const triggers = [];
  let uuidCounter = 0;
  const documentLock = {
    allow: true,
    acquired: 0,
    released: 0,
    tryLock() { this.acquired++; return this.allow; },
    releaseLock() { this.released++; },
  };

  const context = {
    console,
    Date,
    DocumentApp: {
      ElementType: { PARAGRAPH: 'PARAGRAPH', TABLE: 'TABLE' },
      ParagraphHeading: { NORMAL: 'NORMAL', HEADING3: 'HEADING3' },
      openById(id) {
        if (!documents.has(id)) throw new Error(`Missing document ${id}`);
        return documents.get(id);
      },
    },
    DriveApp: {
      getFolderById(id) {
        if (!driveFolders.has(id)) throw new Error(`Missing folder ${id}`);
        return driveFolders.get(id);
      },
      getFileById(id) {
        if (!driveFiles.has(id)) throw new Error(`Missing file ${id}`);
        return driveFiles.get(id);
      },
    },
    JSON,
    LockService: {
      getDocumentLock: () => documentLock,
      getScriptLock: () => documentLock,
    },
    Logger: { log() {} },
    Math,
    Number,
    Object,
    PropertiesService: {
      getScriptProperties: () => scriptProperties,
      getDocumentProperties: () => documentProperties,
    },
    RegExp,
    ScriptApp: { getProjectTriggers: () => triggers },
    Session: { getScriptTimeZone: () => 'Europe/Moscow' },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => spreadsheet,
      getUi: () => ({
        createMenu(name) {
          const menu = {
            name,
            items: [],
            addItem(label, fn) { this.items.push({ label, fn }); return this; },
            addSeparator() { this.items.push({ separator: true }); return this; },
            addSubMenu(submenu) { this.items.push({ submenu }); return this; },
            addToUi() { menus.push(this); return this; },
          };
          return menu;
        },
      }),
      flush() {},
      openById: () => spreadsheet,
    },
    String,
    UrlFetchApp: { fetch() { throw new Error('Unexpected UrlFetchApp.fetch'); } },
    Utilities: {
      formatDate(date, timezone, format) {
        if (format === 'dd.MM.yyyy') {
          return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
        }
        return date.toISOString();
      },
      getUuid: () => `uuid-${++uuidCounter}`,
    },
  };

  vm.createContext(context);
  SOURCE_FILES.filter((file) => fs.existsSync(file)).forEach((file) => {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  });

  return {
    context,
    spreadsheet,
    scriptProperties,
    documentProperties,
    driveFolders,
    driveFiles,
    documents,
    menus,
    triggers,
    documentLock,
  };
}

{
  const harness = createHarness(['Оклад']);
  const sheet = harness.spreadsheet.getSheetByName('Оклад');
  const folderUrl = 'https://drive.google.com/drive/folders/1ExamplePayrollFolder123456789';
  sheet.seed(1, 1, 'Исходные данные:').seed(1, 2, 'Расчетные листки', folderUrl);

  const resolved = harness.context.findZupFolderNearSourceLabel_(harness.spreadsheet);

  assert.strictEqual(resolved.id, '1ExamplePayrollFolder123456789');
  assert.strictEqual(resolved.source, 'Оклад!B1');
}

{
  const harness = createHarness();
  const docUrl = 'https://docs.google.com/document/d/1ExampleClaimDocument123456789/edit';
  const params = harness.context.readClaimCalculationParamsFromLabelValues_([{
    label: 'расписанный расчет',
    values: [docUrl],
  }]);

  assert.strictEqual(params.docUrl, docUrl);
}

{
  const harness = createHarness();
  [
    'importZupFolder',
    'populateZupReconstructionSheets',
    'updateZupReconstructionIndexation',
    'updateAllSheetsIndexation',
    'fillClaimCalculationDocs',
  ].forEach((name) => assert.strictEqual(typeof harness.context[name], 'function', `${name} must remain callable`));
}

{
  const harness = createHarness();
  const layout = harness.context.getClaimConstructorLayout_();

  assert.strictEqual(layout.sheetName, 'Конструктор');
  assert.strictEqual(layout.sourceFolder.label, 'Исходные данные:');
  assert.strictEqual(layout.sourceFolder.namedRange, 'CLAIM_CONSTRUCTOR_SOURCE_FOLDER');
  assert.strictEqual(layout.outputDoc.label, 'Расписанный расчет:');
  assert.strictEqual(layout.outputDoc.namedRange, 'CLAIM_CONSTRUCTOR_OUTPUT_DOC');
  assert.deepStrictEqual(Array.from(layout.issueHeaders), [
    'Уровень',
    'Этап',
    'Тип источника',
    'Источник',
    'Причина',
    'Статус проверки',
    'Влияние',
    'Что сделать',
  ]);
  assert.strictEqual(layout.phaseLabels.completeWithWarnings, 'Готово с замечаниями');
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  const layout = harness.context.getClaimConstructorLayout_();
  const created = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);

  assert.strictEqual(created.getName(), 'Конструктор');
  assert.strictEqual(harness.spreadsheet.getSheets()[0].getName(), 'Конструктор');
  assert.strictEqual(created.getRange(layout.sourceFolder.labelCell).getValue(), 'Исходные данные:');
  assert.strictEqual(created.getRange(layout.outputDoc.labelCell).getValue(), 'Расписанный расчет:');
  assert.strictEqual(
    harness.spreadsheet.getRangeByName(layout.sourceFolder.namedRange).getValue(),
    ''
  );

  created.getRange(layout.sourceFolder.valueCell).setValue('https://drive.google.com/drive/folders/preserved-folder');
  created.getRange(layout.outputDoc.valueCell).setValue('https://docs.google.com/document/d/preserved-doc/edit');
  created.getRange(layout.status.messageCell).setValue('Сохраненный статус');
  created.getRange(23, 1).setValue('Сохраненное замечание');
  const originalId = created.getSheetId();
  const originalOrder = harness.spreadsheet.getSheets().map((sheet) => sheet.getSheetId());

  const reopened = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);

  assert.strictEqual(reopened.getSheetId(), originalId);
  assert.deepStrictEqual(harness.spreadsheet.getSheets().map((sheet) => sheet.getSheetId()), originalOrder);
  assert.strictEqual(reopened.getRange(layout.sourceFolder.valueCell).getValue(), 'https://drive.google.com/drive/folders/preserved-folder');
  assert.strictEqual(reopened.getRange(layout.outputDoc.valueCell).getValue(), 'https://docs.google.com/document/d/preserved-doc/edit');
  assert.strictEqual(reopened.getRange(layout.status.messageCell).getValue(), 'Сохраненный статус');
  assert.strictEqual(reopened.getRange(23, 1).getValue(), 'Сохраненное замечание');
}

{
  const harness = createHarness(['Оклад']);
  const layout = harness.context.getClaimConstructorLayout_();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  sheet.getRange(layout.sourceFolder.valueCell).setValue('https://drive.google.com/drive/folders/named-range-folder-123456');
  sheet.getRange(layout.outputDoc.valueCell).setValue('https://docs.google.com/document/d/named-range-doc-123456/edit');
  harness.spreadsheet.getSheetByName('Оклад')
    .seed(1, 1, 'Исходные данные:')
    .seed(1, 2, 'https://drive.google.com/drive/folders/conflicting-folder-123456');

  const inputs = harness.context.readClaimConstructorInputs_(harness.spreadsheet);

  assert.strictEqual(inputs.folderId, 'named-range-folder-123456');
  assert.strictEqual(inputs.docId, 'named-range-doc-123456');
  assert.strictEqual(inputs.source, 'named_ranges');
}

{
  const harness = createHarness(['Оклад']);
  const sheet = harness.spreadsheet.getSheetByName('Оклад');
  sheet
    .seed(1, 1, 'Исходные данные:')
    .seed(1, 2, 'Расчетные листки', 'https://drive.google.com/drive/folders/label-folder-123456789')
    .seed(2, 1, 'Расписанный расчет:')
    .seed(2, 2, 'Расшифровка', 'https://docs.google.com/document/d/label-doc-123456789/edit');

  const inputs = harness.context.readClaimConstructorInputs_(harness.spreadsheet);

  assert.strictEqual(inputs.folderId, 'label-folder-123456789');
  assert.strictEqual(inputs.docId, 'label-doc-123456789');
  assert.strictEqual(inputs.source, 'labels');
}

{
  const harness = createHarness(['Оклад']);
  const folderId = 'accessible-folder-123456789';
  const docId = 'accessible-doc-123456789';
  const folder = { id: folderId };
  const document = { id: docId };
  harness.driveFolders.set(folderId, folder);
  harness.documents.set(docId, document);

  const result = harness.context.validateClaimConstructorInputs_({
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    folderId,
    docUrl: `https://docs.google.com/document/d/${docId}/edit`,
    docId,
  });

  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(Array.from(result.errors), []);
  assert.strictEqual(result.folder, folder);
  assert.strictEqual(result.document, document);
}

{
  const harness = createHarness(['Оклад']);
  const calculationSheet = harness.spreadsheet.getSheetByName('Оклад');
  calculationSheet.getRange('A1').setValue('не менять');

  const result = harness.context.validateClaimConstructorInputs_({
    folderUrl: 'https://docs.google.com/document/d/wrong-folder-kind/edit',
    folderId: '',
    docUrl: 'https://drive.google.com/drive/folders/wrong-doc-kind',
    docId: '',
  });

  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(Array.from(result.errors).map((error) => error.code), [
    'folder_wrong_kind',
    'doc_wrong_kind',
  ]);
  assert.strictEqual(calculationSheet.getRange('A1').getValue(), 'не менять');
}

{
  const harness = createHarness();
  const result = harness.context.validateClaimConstructorInputs_({
    folderUrl: 'не ссылка',
    folderId: '',
    docUrl: '',
    docId: '',
  });

  assert.deepStrictEqual(Array.from(result.errors).map((error) => error.code), [
    'folder_invalid',
    'doc_required',
  ]);
}

{
  const harness = createHarness();
  const result = harness.context.validateClaimConstructorInputs_({
    folderUrl: 'https://drive.google.com/drive/folders/inaccessible-folder-123456789',
    folderId: 'inaccessible-folder-123456789',
    docUrl: 'https://docs.google.com/document/d/inaccessible-doc-123456789/edit',
    docId: 'inaccessible-doc-123456789',
  });

  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(Array.from(result.errors).map((error) => error.code), [
    'folder_inaccessible',
    'doc_inaccessible',
  ]);
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  const opened = harness.context.openClaimConstructor();

  assert.strictEqual(opened.getName(), 'Конструктор');
  assert.strictEqual(harness.spreadsheet.getActiveSheet(), opened);
  assert.strictEqual(opened.frozenRows, 2);
  assert.strictEqual(opened.columnWidths.get(1), 190);
  assert.strictEqual(opened.columnWidths.get(2), 520);
  assert.strictEqual(harness.spreadsheet.getSheets().length, 3);
}

{
  const harness = createHarness();
  const now = new Date('2026-07-11T09:00:00.000Z');
  const run = harness.context.createClaimConstructorRun_({
    folderId: 'folder-1',
    docId: 'doc-1',
  }, { now, parentRunId: 'prior-run' });

  assert.strictEqual(run.version, 1);
  assert.strictEqual(run.id, 'uuid-1');
  assert.strictEqual(run.parentRunId, 'prior-run');
  assert.strictEqual(run.phase, 'validating');
  assert.strictEqual(run.phases.validating, 'running');
  assert.strictEqual(run.phases.importing, 'pending');
  assert.deepStrictEqual(Array.from(harness.context.getClaimConstructorPhaseOrder_()), [
    'validating',
    'importing',
    'reconstructing',
    'calculating',
    'writing_doc',
  ]);
  assert.strictEqual(run.createdAt, now.toISOString());
  assert.deepStrictEqual(Array.from(run.issues), []);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ folderId: 'folder-1', docId: 'doc-1' }, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);

  const restored = harness.context.loadClaimConstructorRun_(harness.scriptProperties);

  assert.strictEqual(restored.id, run.id);
  assert.strictEqual(restored.inputs.folderId, 'folder-1');
  assert.strictEqual(harness.context.serializeClaimConstructorRun_(restored), JSON.stringify(restored));
  assert.strictEqual(harness.context.parseClaimConstructorRun_('{bad json'), null);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });

  const advanced = harness.context.completeClaimConstructorPhase_(
    run,
    'validating',
    'importing',
    new Date('2026-07-11T09:01:00.000Z')
  );
  const repeated = harness.context.completeClaimConstructorPhase_(
    run,
    'validating',
    'importing',
    new Date('2026-07-11T09:02:00.000Z')
  );

  assert.strictEqual(advanced, true);
  assert.strictEqual(repeated, false);
  assert.strictEqual(run.phases.validating, 'done');
  assert.strictEqual(run.phases.importing, 'running');
  assert.strictEqual(run.phase, 'importing');
  assert.strictEqual(run.updatedAt, '2026-07-11T09:01:00.000Z');
  assert.strictEqual(harness.context.isClaimConstructorPhaseDone_(run, 'validating'), true);
}

{
  const harness = createHarness();
  const active = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);

  const result = harness.context.startOrJoinClaimConstructorRun_({}, {
    now: new Date('2026-07-11T10:00:00.000Z'),
    properties: harness.scriptProperties,
  });

  assert.strictEqual(result.joined, true);
  assert.strictEqual(result.run.id, active.id);
  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
}

{
  const harness = createHarness();
  harness.documentLock.allow = false;

  const result = harness.context.startOrJoinClaimConstructorRun_({}, {
    now: new Date('2026-07-11T10:00:00.000Z'),
    properties: harness.scriptProperties,
  });

  assert.strictEqual(result.busy, true);
  assert.strictEqual(result.run, null);
  assert.strictEqual(harness.scriptProperties.getProperty('CLAIM_CONSTRUCTOR_RUN_STATE'), null);
  assert.strictEqual(harness.documentLock.released, 0);
}

{
  const harness = createHarness();
  const stale = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T00:00:00.000Z'),
  });
  harness.context.saveClaimConstructorRun_(stale, harness.scriptProperties);

  const result = harness.context.startOrJoinClaimConstructorRun_({}, {
    now: new Date('2026-07-11T07:00:01.000Z'),
    properties: harness.scriptProperties,
  });

  assert.strictEqual(result.joined, false);
  assert.strictEqual(result.run.id, 'uuid-2');
  assert.strictEqual(result.run.parentRunId, stale.id);
  assert.strictEqual(result.replacedRun.status, 'failed');
  assert.strictEqual(result.replacedRun.phase, 'failed');
  assert.strictEqual(result.replacedRun.completedAt, '2026-07-11T07:00:01.000Z');
}

{
  const harness = createHarness();
  const active = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T00:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(
    active,
    'validating',
    'importing',
    new Date('2026-07-11T00:01:00.000Z')
  );
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);
  harness.scriptProperties.setProperty('ZUP_IMPORT_BATCH_STATE', JSON.stringify({
    constructorRunId: active.id,
    updatedAt: '2026-07-11T06:30:00.000Z',
  }));

  const result = harness.context.startOrJoinClaimConstructorRun_({}, {
    now: new Date('2026-07-11T07:00:01.000Z'),
    properties: harness.scriptProperties,
  });

  assert.strictEqual(result.joined, true);
  assert.strictEqual(result.run.id, active.id);
}

{
  const harness = createHarness();
  const active = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T00:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(
    active,
    'validating',
    'importing',
    new Date('2026-07-11T00:01:00.000Z')
  );
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);
  harness.scriptProperties.setProperty('ZUP_IMPORT_BATCH_STATE', JSON.stringify({
    constructorRunId: active.id,
    updatedAt: '2026-07-11T00:00:00.000Z',
  }));
  harness.triggers.push({ getHandlerFunction: () => 'resumeZupFolderImport_' });

  const result = harness.context.startOrJoinClaimConstructorRun_({}, {
    now: new Date('2026-07-11T07:00:01.000Z'),
    properties: harness.scriptProperties,
  });

  assert.strictEqual(result.joined, true);
  assert.strictEqual(result.run.id, active.id);
}

{
  const harness = createHarness();
  const active = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);

  const advanced = harness.context.advanceActiveClaimConstructorRun_(
    active.id,
    'validating',
    'importing',
    { now: new Date('2026-07-11T09:01:00.000Z'), properties: harness.scriptProperties }
  );
  const staleContinuation = harness.context.advanceActiveClaimConstructorRun_(
    'old-run-id',
    'importing',
    'reconstructing',
    { now: new Date('2026-07-11T09:02:00.000Z'), properties: harness.scriptProperties }
  );
  const repeated = harness.context.advanceActiveClaimConstructorRun_(
    active.id,
    'validating',
    'importing',
    { now: new Date('2026-07-11T09:03:00.000Z'), properties: harness.scriptProperties }
  );

  assert.strictEqual(advanced.phase, 'importing');
  assert.strictEqual(staleContinuation, null);
  assert.strictEqual(repeated, null);
  assert.strictEqual(harness.context.loadClaimConstructorRun_(harness.scriptProperties).phase, 'importing');
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  run.phase = 'calculating';
  run.progressText = 'Считаем недоплаты';
  run.updatedAt = '2026-07-11T09:05:00.000Z';

  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Расчет недоплат, индексации и пеней');
  assert.strictEqual(sheet.getRange(layout.status.messageCell).getValue(), 'Считаем недоплаты');
  assert.strictEqual(sheet.getRange(layout.status.updatedAtCell).getValue(), '2026-07-11T09:05:00.000Z');

  run.status = 'complete';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Готово');

  run.status = 'complete_with_warnings';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Готово с замечаниями');

  run.status = 'failed';
  run.progressText = 'Нет доступа к документу';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Ошибка');
  assert.strictEqual(sheet.getRange(layout.status.messageCell).getValue(), 'Нет доступа к документу');
}

{
  const harness = createHarness();
  const issue = harness.context.normalizeClaimConstructorIssue_({
    severity: 'warning',
    phase: 'importing',
    sourceKind: 'payroll_slips',
    source: 'Расчетный листок.pdf, строка 12',
    reason: 'Категория начисления требует проверки',
    reviewStatus: 'VLM, уверенность 0.71',
    suggestedAction: 'Сверить с расчетным листком',
  });

  assert.strictEqual(issue.severity, 'warning');
  assert.strictEqual(issue.phase, 'importing');
  assert.strictEqual(issue.sourceKind, 'payroll_slips');
  assert.strictEqual(issue.source, 'Расчетный листок.pdf, строка 12');
  assert.strictEqual(issue.reason, 'Категория начисления требует проверки');
  assert.strictEqual(issue.reviewStatus, 'VLM, уверенность 0.71');
  assert.strictEqual(issue.knownImpact, 'не определено');
  assert.strictEqual(issue.suggestedAction, 'Сверить с расчетным листком');
}

{
  const harness = createHarness();
  const signals = {
    qualityGateRows: [[
      'Сотрудник', 'Предупреждение', 'На проверке', 'листок.pdf', '06.2026', '', 'Иванов', 'строка 12',
      'ФИО различается', 'Сверить ФИО',
    ]],
    vlmRows: [[
      'листок.pdf', 'application/pdf', 'gemini', 'VLM', 4, 0, 0, 0, 0, '', 'Низкая уверенность', '{}',
    ]],
    diagnosticIssues: [{ source: 'Импорт_1С_Диагностика!A2', reason: 'Не найдена дата выплаты' }],
    reconstructionIssues: [{ source: 'Из_1С_Оклад!A7', reason: 'Строка не сопоставлена' }],
    skippedCalculationIssues: [{ source: 'Оклад!A10', reason: 'Строка пропущена при расчете' }],
  };
  const snapshot = JSON.stringify(signals);

  const issues = harness.context.aggregateClaimConstructorIssues_(signals);

  assert.strictEqual(issues.length, 5);
  assert.strictEqual(issues[0].phase, 'importing');
  assert.strictEqual(issues[0].source, 'листок.pdf; 06.2026; строка 12');
  assert.strictEqual(issues[1].reviewStatus, 'VLM');
  assert.strictEqual(issues[2].phase, 'importing');
  assert.strictEqual(issues[3].phase, 'reconstructing');
  assert.strictEqual(issues[4].phase, 'calculating');
  assert.strictEqual(JSON.stringify(signals), snapshot);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const results = {
    totals: {
      underpayment: 100000,
      indexation: 12000,
      liability: 8000,
      total: 120000,
    },
    output: {
      docUrl: 'https://docs.google.com/document/d/result-doc/edit',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/fake-spreadsheet-id/edit',
    },
  };

  harness.context.renderClaimConstructorResults_(sheet, results);

  assert.strictEqual(sheet.getRange(layout.resultFields.underpayment.valueCell).getValue(), 100000);
  assert.strictEqual(sheet.getRange(layout.resultFields.indexation.valueCell).getValue(), 12000);
  assert.strictEqual(sheet.getRange(layout.resultFields.liability.valueCell).getValue(), 8000);
  assert.strictEqual(sheet.getRange(layout.resultFields.total.valueCell).getValue(), 120000);
  assert.strictEqual(sheet.getRange(layout.outputLinks.docCell).getValue(), results.output.docUrl);
  assert.strictEqual(sheet.getRange(layout.outputLinks.spreadsheetCell).getValue(), results.output.spreadsheetUrl);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const issues = [harness.context.normalizeClaimConstructorIssue_({
    severity: 'warning',
    phase: 'importing',
    sourceKind: 'payroll_slips',
    source: 'листок.pdf',
    reason: 'Нужна сверка',
    reviewStatus: 'VLM',
    knownImpact: 'не определено',
    suggestedAction: 'Сверить',
  }), harness.context.normalizeClaimConstructorIssue_({
    severity: 'error',
    phase: 'calculating',
    reason: 'Строка пропущена',
  })];

  harness.context.renderClaimConstructorIssues_(sheet, issues);
  assert.deepStrictEqual(sheet.getRange(layout.issuesHeaderRow + 1, 1, 1, 8).getValues()[0], [
    'warning', 'importing', 'payroll_slips', 'листок.pdf', 'Нужна сверка', 'VLM', 'не определено', 'Сверить',
  ]);
  harness.context.renderClaimConstructorIssues_(sheet, issues.slice(0, 1));
  assert.strictEqual(sheet.getRange(layout.issuesHeaderRow + 2, 1).getValue(), '');
}

{
  const harness = createHarness(['Оклад']);
  harness.context.onOpen();
  assert.strictEqual(harness.spreadsheet.getSheetByName('Конструктор'), null);
}

{
  const harness = createHarness(['Конструктор', 'Оклад']);
  const sheet = harness.spreadsheet.getSheetByName('Конструктор');
  const layout = harness.context.getClaimConstructorLayout_();
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  run.phase = 'calculating';
  run.progressText = 'Восстановленный статус';
  run.results = { totals: { total: 321 } };
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  harness.documentProperties.setProperty('CLAIM_CONSTRUCTOR_VISIBILITY_MODE', 'detail');
  const visibilityCalls = [];
  const pipelineCalls = [];
  harness.context.applyClaimConstructorVisibilityMode_ = (mode) => visibilityCalls.push(mode);
  harness.context.importZupFolder = () => pipelineCalls.push('import');
  harness.context.populateZupReconstructionSheets = () => pipelineCalls.push('reconstruct');
  harness.context.updateAllSheetsIndexation = () => pipelineCalls.push('calculate');

  harness.context.onOpen();

  assert.strictEqual(sheet.getRange(layout.status.messageCell).getValue(), 'Восстановленный статус');
  assert.strictEqual(sheet.getRange(layout.resultFields.total.valueCell).getValue(), 321);
  assert.deepStrictEqual(visibilityCalls, ['detail']);
  assert.deepStrictEqual(pipelineCalls, []);
}

console.log('claim constructor characterization ok');

module.exports = {
  FakeProperties,
  FakeRange,
  FakeSheet,
  FakeSpreadsheet,
  createHarness,
};
