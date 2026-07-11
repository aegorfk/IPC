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
    this.formulas = new Map();
    this.formatting = new Map();
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
  hideSheet() { this.hidden = true; this.spreadsheet.visibilityOperations.push(`hide:${this.name}`); return this; }
  showSheet() { this.hidden = false; this.spreadsheet.visibilityOperations.push(`show:${this.name}`); return this; }
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
    this.visibilityOperations = [];
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
    ScriptApp: {
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger(trigger) {
        const index = triggers.indexOf(trigger);
        if (index >= 0) triggers.splice(index, 1);
      },
      newTrigger(handler) {
        const trigger = { getHandlerFunction: () => handler };
        return {
          timeBased() { return this; },
          after() { return this; },
          create() { triggers.push(trigger); return trigger; },
        };
      },
    },
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
  assert.strictEqual(layout.primaryAction.cell, 'A2');
  assert.ok(layout.primaryAction.text.includes('Собрать расчет'));
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
  const legacy = harness.spreadsheet.getSheetByName('Оклад');
  legacy
    .seed(1, 1, 'Исходные данные:')
    .seed(1, 2, 'Папка', 'https://drive.google.com/drive/folders/legacy-folder-123456789')
    .seed(2, 1, 'Расписанный расчет:')
    .seed(2, 2, 'Документ', 'https://docs.google.com/document/d/legacy-doc-123456789/edit');
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();

  assert.strictEqual(
    sheet.getRange(layout.sourceFolder.valueCell).getValue(),
    'https://drive.google.com/drive/folders/legacy-folder-123456789'
  );
  assert.strictEqual(
    sheet.getRange(layout.outputDoc.valueCell).getValue(),
    'https://docs.google.com/document/d/legacy-doc-123456789/edit'
  );
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
  const run = harness.context.createClaimConstructorRun_({});
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date());
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  harness.context.scheduleClaimConstructorContinuation_();
  const calls = [];
  harness.context.continueClaimConstructorPipeline_ = (runId) => {
    calls.push(runId);
    const current = harness.context.loadClaimConstructorRun_(harness.scriptProperties);
    current.status = 'complete';
    current.phase = 'complete';
    harness.context.saveClaimConstructorRun_(current, harness.scriptProperties);
    return current;
  };

  const completed = harness.context.resumeClaimConstructorPipeline_();

  assert.deepStrictEqual(calls, [run.id]);
  assert.strictEqual(completed.status, 'complete');
  assert.strictEqual(harness.triggers.length, 0);
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

  run.phase = 'importing';
  run.progress = { processed: 3, total: 31 };
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /3 из 31/);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /10%/);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /[█░]/);

  run.status = 'complete';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Готово');

  run.status = 'complete_with_warnings';
  run.completedAt = '2026-07-11T09:06:00.000Z';
  run.issues = [{}, {}];
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Готово с замечаниями');
  assert.strictEqual(sheet.getRange(layout.status.completedAtCell).getValue(), '2026-07-11T09:06:00.000Z');
  assert.strictEqual(sheet.getRange(layout.status.issueCountCell).getValue(), 2);

  run.status = 'failed';
  run.progressText = 'Нет доступа к документу';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Ошибка');
  assert.strictEqual(sheet.getRange(layout.status.messageCell).getValue(), 'Нет доступа к документу');
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
    spreadsheetId: harness.spreadsheet.getId(),
  });
  run.phase = 'importing';
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);

  const updated = harness.context.updateClaimConstructorImportProgress_({
    constructorRunId: run.id,
    spreadsheetId: harness.spreadsheet.getId(),
    nextIndex: 7,
    total: 31,
  });

  assert.deepStrictEqual(JSON.parse(JSON.stringify(updated.progress)), {
    processed: 7,
    total: 31,
    percent: 23,
  });
  assert.match(sheet.getRange(harness.context.getClaimConstructorLayout_().status.messageCell).getValue(), /7 из 31/);
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
  assert.strictEqual(layout.outputLinks, undefined);
  assert.strictEqual(sheet.getRange('A19').getValue(), '');
  assert.strictEqual(sheet.getRange('A20').getValue(), 'Требует внимания');
}

{
  const harness = createHarness();
  const dashboard = harness.context.buildClaimConstructorDashboardResult_(
    harness.spreadsheet,
    [
      { totals: { underpayment: 100, indexation: 20, liability: 5 } },
      { totals: { underpayment: 50, indexation: 10, liability: 2 } },
    ],
    'https://docs.google.com/document/d/result-doc/edit'
  );

  assert.deepStrictEqual(JSON.parse(JSON.stringify(dashboard.totals)), {
    underpayment: 150,
    indexation: 30,
    liability: 7,
    total: 187,
  });
  assert.strictEqual(dashboard.output.docUrl, 'https://docs.google.com/document/d/result-doc/edit');
  assert.strictEqual(
    dashboard.output.spreadsheetUrl,
    'https://docs.google.com/spreadsheets/d/fake-spreadsheet-id/edit'
  );
  const sheetTotals = harness.context.summarizeClaimConstructorCalculationTotals_(
    [[100], ['50,50'], ['']],
    [[20], [10], [null]],
    [[5], [2], ['не число']]
  );
  assert.deepStrictEqual(JSON.parse(JSON.stringify(sheetTotals)), {
    underpayment: 150.5,
    indexation: 30,
    liability: 7,
  });
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

function stubReconstructionPipeline(harness) {
  const model = {
    salary: [],
    monthlyPremiums: [],
    quarterlyPremiums: [],
    annualPremiums: [],
    vacations: [],
    quality: { mainCompany: 'ООО Тест', companies: ['ООО Тест'], blankCompanyPeriods: [] },
  };
  harness.context.getTargetSpreadsheet_ = () => harness.spreadsheet;
  harness.context.readZupImportObjects_ = () => [{ file: 'листок.pdf' }];
  harness.context.getZupReconstructionConfigs_ = () => [];
  harness.context.buildZupReconstructionModel_ = () => model;
  harness.context.loadProductionCalendarSafely_ = () => ({ calendar: true });
  harness.context.fillZupSalaryReconstruction_ = () => ({ sheet: 'Из_1С_Оклад', rows: 2 });
  harness.context.fillZupPremiumReconstruction_ = (spreadsheet, sheetName) => ({ sheet: sheetName, rows: 1 });
  harness.context.fillZupVacationReconstruction_ = () => ({ sheet: 'Из_1С_Отпуска', rows: 1 });
  harness.context.markZupReconstructionCompany_ = () => {};
  harness.context.updateZupReconstructionIndexationSheets_ = () => [
    { sheetName: 'Из_1С_Оклад', calculated: 2, skipped: 0 },
  ];
  return model;
}

{
  const harness = createHarness();
  stubReconstructionPipeline(harness);
  const messages = [];
  harness.context.showMessage_ = (message) => messages.push(message);

  harness.context.populateZupReconstructionSheets();

  assert.strictEqual(messages.length, 1);
  assert.ok(messages[0].includes('Вкладки Из_1С заполнены'));
  assert.ok(messages[0].includes('Пересчет Из_1С выполнен'));
}

{
  const harness = createHarness();
  const model = stubReconstructionPipeline(harness);
  const messages = [];
  harness.context.showMessage_ = (message) => messages.push(message);

  const result = harness.context.runZupReconstruction_(harness.spreadsheet);

  assert.strictEqual(result.fillResults.length, 5);
  assert.strictEqual(result.calculationResults.length, 1);
  assert.strictEqual(result.company, 'ООО Тест');
  assert.strictEqual(result.quality, model.quality);
  assert.deepStrictEqual(messages, []);
}

function stubAllSheetsCalculation(harness) {
  const layoutByName = { Оклад: 'salary', Ежемесячные: 'monthlyPremiums' };
  const deleted = [];
  harness.context.getTargetSpreadsheet_ = () => harness.spreadsheet;
  harness.context.isGeneratedSheetName_ = () => false;
  harness.context.getSheetLayout_ = (name) => ({ id: layoutByName[name] || 'unknown' });
  harness.context.updateUnpaidSalaryIndexationCore_ = ({ sheet }) => ({
    sheetName: sheet.getName(),
    layoutId: layoutByName[sheet.getName()],
    calculated: 1,
    skipped: 0,
  });
  harness.context.deleteLegacyGeneratedSheets_ = () => deleted.push('deleted');
  return deleted;
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  const deleted = stubAllSheetsCalculation(harness);
  const displayed = [];
  harness.context.showAllUpdateResults_ = (results) => displayed.push(results);

  const legacyResult = harness.context.updateAllSheetsIndexation();

  assert.strictEqual(legacyResult, undefined);
  assert.strictEqual(displayed.length, 1);
  assert.strictEqual(displayed[0].length, 2);
  assert.deepStrictEqual(deleted, ['deleted']);
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  const deleted = stubAllSheetsCalculation(harness);
  const displayed = [];
  harness.context.showAllUpdateResults_ = (results) => displayed.push(results);

  const results = harness.context.runAllSheetsIndexation_(harness.spreadsheet);

  assert.deepStrictEqual(Array.from(results).map((item) => item.layoutId), ['salary', 'monthlyPremiums']);
  assert.deepStrictEqual(displayed, []);
  assert.deepStrictEqual(deleted, ['deleted']);
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  stubAllSheetsCalculation(harness);
  harness.context.updateUnpaidSalaryIndexationCore_ = ({ sheet }) => {
    if (sheet.getName() === 'Ежемесячные') throw new Error('Ошибка листа премий');
    return { sheetName: sheet.getName(), layoutId: 'salary', calculated: 1, skipped: 0 };
  };

  const results = harness.context.runAllSheetsIndexation_(harness.spreadsheet);

  assert.strictEqual(results.length, 2);
  assert.strictEqual(results[1].sheetName, 'Ежемесячные');
  assert.ok(results[1].error.includes('Ошибка листа премий'));
}

function stubDocsHandoff(harness, ready = true) {
  const params = {
    docUrl: 'https://docs.google.com/document/d/result-doc/edit',
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-31T00:00:00.000Z'),
  };
  const result = {
    workingDays: 20,
    wageAmount: 100000,
    penaltyAmount: 5000,
    averageDailyEarning: 5000,
  };
  const writes = [];
  harness.context.getTargetSpreadsheet_ = () => harness.spreadsheet;
  harness.context.readClaimCalculationParams_ = () => params;
  harness.context.calculateClaimCalculationResult_ = () => ({ ready, result: ready ? result : null });
  harness.context.writeClaimCalculationDoc_ = (...args) => writes.push(args);
  return { params, result, writes };
}

{
  const harness = createHarness();
  const stub = stubDocsHandoff(harness);
  const messages = [];
  harness.context.showMessage_ = (message) => messages.push(message);

  harness.context.fillClaimCalculationDocs();

  assert.strictEqual(stub.writes.length, 1);
  assert.strictEqual(messages.length, 1);
  assert.ok(messages[0].includes('Docs "Расчет требований" заполнен'));
}

{
  const harness = createHarness();
  const stub = stubDocsHandoff(harness);
  const messages = [];
  harness.context.showMessage_ = (message) => messages.push(message);

  const handoff = harness.context.runClaimCalculationDocsHandoff_(harness.spreadsheet);

  assert.deepStrictEqual(Array.from(handoff.writtenSections), ['claim_calculation']);
  assert.deepStrictEqual(Array.from(handoff.skippedSections), []);
  assert.deepStrictEqual(Array.from(handoff.issues), []);
  assert.strictEqual(handoff.result, stub.result);
  assert.strictEqual(stub.writes.length, 1);
  assert.deepStrictEqual(messages, []);
}

{
  const harness = createHarness();
  const stub = stubDocsHandoff(harness, false);
  const handoff = harness.context.runClaimCalculationDocsHandoff_(harness.spreadsheet);

  assert.deepStrictEqual(Array.from(handoff.writtenSections), []);
  assert.deepStrictEqual(Array.from(handoff.skippedSections), ['claim_calculation']);
  assert.strictEqual(handoff.issues.length, 1);
  assert.strictEqual(handoff.issues[0].code, 'claim_parameters_missing');
  assert.strictEqual(stub.writes.length, 0);
}

{
  const harness = createHarness();
  stubDocsHandoff(harness);
  harness.context.writeClaimCalculationDoc_ = () => { throw new Error('Нет доступа к Doc'); };

  const handoff = harness.context.runClaimCalculationDocsHandoff_(harness.spreadsheet);

  assert.deepStrictEqual(Array.from(handoff.writtenSections), []);
  assert.deepStrictEqual(Array.from(handoff.skippedSections), ['claim_calculation']);
  assert.strictEqual(handoff.issues[0].code, 'doc_write_failed');
  assert.ok(handoff.issues[0].reason.includes('Нет доступа к Doc'));
}

{
  const harness = createHarness();
  const result = { wageAmount: 100, penaltyAmount: 10, vacationAmount: 20, averageDailyEarning: 5 };
  const writes = [];
  harness.context.readClaimCalculationParams_ = () => ({ startDate: new Date(), endDate: new Date() });
  harness.context.calculateClaimCalculationResult_ = () => ({ ready: true, result });
  harness.context.writeClaimCalculationResultToSheet_ = (target, value) => {
    writes.push({ target, value });
    return 3;
  };

  const calculated = harness.context.runClaimSheetCalculation_(harness.spreadsheet);

  assert.strictEqual(calculated.ready, true);
  assert.strictEqual(calculated.written, 3);
  assert.strictEqual(calculated.result, result);
  assert.strictEqual(writes[0].target, harness.spreadsheet);
  assert.strictEqual(writes[0].value, result);
}

{
  const harness = createHarness();
  const stub = stubDocsHandoff(harness);
  harness.context.calculateClaimCalculationResult_ = () => { throw new Error('Не пересчитывать повторно'); };

  const handoff = harness.context.runClaimCalculationDocsHandoff_(harness.spreadsheet, {
    params: stub.params,
    calculatedResult: stub.result,
  });

  assert.deepStrictEqual(Array.from(handoff.writtenSections), ['claim_calculation']);
  assert.strictEqual(stub.writes.length, 1);
}

{
  const harness = createHarness();
  const calls = [];
  const rows = [['листок.pdf', 'Лист1']];
  harness.context.startZupFolderImportBatch_ = (spreadsheet, folder, options) => {
    calls.push({ spreadsheet, folder, options });
    return {
      complete: false,
      source: folder.source,
      rows,
      rowsRecognized: 1,
      skippedFiles: [['непрочитан.pdf', 'application/pdf', 'Формат не распознан']],
    };
  };
  const folder = { id: 'folder-1', source: 'Конструктор!B4' };

  const result = harness.context.runPayrollSlipSourceAdapter_(
    harness.spreadsheet,
    folder,
    { constructorRunId: 'run-1', force: false }
  );

  assert.strictEqual(result.sourceKind, 'payroll_slips');
  assert.strictEqual(result.normalizedResults.rows, rows);
  assert.strictEqual(result.normalizedResults.rowsRecognized, 1);
  assert.strictEqual(result.qualityIssues.length, 1);
  assert.strictEqual(result.qualityIssues[0].source, 'непрочитан.pdf');
  assert.strictEqual(result.completion.status, 'continuing');
  assert.strictEqual(result.completion.continuationRequired, true);
  assert.strictEqual(calls[0].options.constructorRunId, 'run-1');
  const adapters = harness.context.getClaimConstructorSourceAdapters_();
  assert.deepStrictEqual(Object.keys(adapters), ['payroll_slips']);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  sheet.getRange(layout.sourceFolder.valueCell).setValue('не ссылка');
  sheet.getRange(layout.outputDoc.valueCell).setValue('');
  const starts = [];
  harness.context.startZupFolderImportBatch_ = (...args) => starts.push(args);

  const result = harness.context.buildClaimCalculation();

  assert.strictEqual(result.started, false);
  assert.strictEqual(result.validation.valid, false);
  assert.strictEqual(starts.length, 0);
  assert.strictEqual(harness.scriptProperties.getProperty('CLAIM_CONSTRUCTOR_RUN_STATE'), null);
  assert.ok(sheet.getRange(layout.sourceFolder.errorCell).getValue().includes('распознать'));
  assert.ok(sheet.getRange(layout.outputDoc.errorCell).getValue().includes('Вставьте'));
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Ошибка');
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const folderId = 'valid-folder-123456789';
  const docId = 'valid-doc-123456789';
  sheet.getRange(layout.sourceFolder.valueCell).setValue(`https://drive.google.com/drive/folders/${folderId}`);
  sheet.getRange(layout.outputDoc.valueCell).setValue(`https://docs.google.com/document/d/${docId}/edit`);
  harness.driveFolders.set(folderId, { id: folderId });
  harness.documents.set(docId, { id: docId });
  const starts = [];
  harness.context.startZupFolderImportBatch_ = (spreadsheet, folder, options) => {
    starts.push({ spreadsheet, folder, options });
    return { complete: false, rows: [], rowsRecognized: 0, skippedFiles: [] };
  };

  const result = harness.context.buildClaimCalculation();

  assert.strictEqual(result.started, true);
  assert.strictEqual(result.joined, false);
  assert.strictEqual(result.run.phase, 'importing');
  assert.strictEqual(starts.length, 1);
  assert.strictEqual(starts[0].options.constructorRunId, result.run.id);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Распознавание расчетных листков');
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const folderId = 'failing-folder-123456789';
  const docId = 'failing-doc-123456789';
  sheet.getRange(layout.sourceFolder.valueCell).setValue(`https://drive.google.com/drive/folders/${folderId}`);
  sheet.getRange(layout.outputDoc.valueCell).setValue(`https://docs.google.com/document/d/${docId}/edit`);
  harness.driveFolders.set(folderId, { id: folderId });
  harness.documents.set(docId, { id: docId });
  harness.context.startZupFolderImportBatch_ = () => { throw new Error('Сбой запуска импорта'); };

  const failed = harness.context.buildClaimCalculation();

  assert.strictEqual(failed.run.status, 'failed');
  assert.strictEqual(failed.run.failedPhase, 'importing');
  assert.ok(failed.run.progressText.includes('Сбой запуска импорта'));
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Ошибка');
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const folderId = 'valid-folder-123456789';
  const docId = 'valid-doc-123456789';
  sheet.getRange(layout.sourceFolder.valueCell).setValue(`https://drive.google.com/drive/folders/${folderId}`);
  sheet.getRange(layout.outputDoc.valueCell).setValue(`https://docs.google.com/document/d/${docId}/edit`);
  harness.driveFolders.set(folderId, { id: folderId });
  harness.documents.set(docId, { id: docId });
  const active = harness.context.createClaimConstructorRun_({}, { now: new Date() });
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);
  const starts = [];
  harness.context.startZupFolderImportBatch_ = (...args) => starts.push(args);

  const result = harness.context.buildClaimCalculation();

  assert.strictEqual(result.started, false);
  assert.strictEqual(result.joined, true);
  assert.strictEqual(result.run.id, active.id);
  assert.strictEqual(starts.length, 0);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  sheet.getRange(layout.sourceFolder.valueCell).setValue('испорченная ссылка во время запуска');
  sheet.getRange(layout.outputDoc.valueCell).setValue('');
  const active = harness.context.createClaimConstructorRun_({}, { now: new Date() });
  active.phase = 'importing';
  active.progressText = 'Импорт продолжается';
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);

  const result = harness.context.buildClaimCalculation();

  assert.strictEqual(result.joined, true);
  assert.strictEqual(result.run.id, active.id);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Распознавание расчетных листков');
  assert.strictEqual(sheet.getRange(layout.status.messageCell).getValue(), 'Импорт продолжается');
}

{
  const harness = createHarness();
  harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  harness.scriptProperties.setProperty('CLAIM_CONSTRUCTOR_RUN_STATE', '{повреждено');
  const sideEffects = [];
  harness.context.startZupFolderImportBatch_ = () => sideEffects.push('import');

  const result = harness.context.buildClaimCalculation();
  const persisted = JSON.parse(harness.scriptProperties.getProperty('CLAIM_CONSTRUCTOR_RUN_STATE'));

  assert.strictEqual(result.started, false);
  assert.strictEqual(result.run.status, 'failed');
  assert.strictEqual(result.run.corruptState, true);
  assert.strictEqual(persisted.corruptState, true);
  assert.deepStrictEqual(sideEffects, []);
}

function stubBatchSessionStartup(harness) {
  harness.context.clearZupBatchImportState_ = () => harness.scriptProperties.deleteProperty('ZUP_IMPORT_BATCH_STATE');
  harness.context.deleteZupBatchImportTriggers_ = () => {};
  harness.context.clearZupVlmLogSheet_ = () => {};
  harness.context.continueZupFolderImportBatch_ = () => harness.context.loadZupBatchImportSession_();
}

{
  const harness = createHarness();
  stubBatchSessionStartup(harness);

  const session = harness.context.startZupFolderImportBatch_(
    harness.spreadsheet,
    { id: 'folder-1', source: 'Оклад!B1' },
    { force: false, dryRun: false }
  );

  assert.strictEqual(Object.prototype.hasOwnProperty.call(session, 'constructorRunId'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(session, 'constructorNextPhase'), false);
}

{
  const harness = createHarness();
  stubBatchSessionStartup(harness);

  const session = harness.context.startZupFolderImportBatch_(
    harness.spreadsheet,
    { id: 'folder-1', source: 'Конструктор!B4' },
    {
      force: false,
      dryRun: false,
      constructorRunId: 'run-1',
      constructorNextPhase: 'reconstructing',
    }
  );

  assert.strictEqual(session.constructorRunId, 'run-1');
  assert.strictEqual(session.constructorNextPhase, 'reconstructing');
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(
    run,
    'validating',
    'importing',
    new Date('2026-07-11T09:01:00.000Z')
  );
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  const session = {
    constructorRunId: run.id,
    constructorNextPhase: 'reconstructing',
  };
  const importResult = {
    complete: true,
    rows: [['расчетная строка']],
    rowsRecognized: 1,
    skippedFiles: [['спорный.pdf', 'application/pdf', 'Нужна ручная проверка']],
  };
  const pipelineCalls = [];
  harness.context.continueClaimConstructorPipeline_ = (runId) => {
    pipelineCalls.push(runId);
    return harness.context.loadClaimConstructorRun_(harness.scriptProperties);
  };

  const first = harness.context.notifyClaimConstructorImportComplete_(session, importResult);
  const repeated = harness.context.notifyClaimConstructorImportComplete_(session, importResult);

  assert.strictEqual(first.phase, 'reconstructing');
  assert.strictEqual(repeated, null);
  assert.deepStrictEqual(pipelineCalls, []);
  assert.strictEqual(harness.triggers.length, 1);
  assert.strictEqual(harness.triggers[0].getHandlerFunction(), 'resumeClaimConstructorPipeline_');
  const continued = harness.context.loadClaimConstructorRun_(harness.scriptProperties);
  assert.strictEqual(continued.phase, 'reconstructing');
  assert.strictEqual(continued.issues.length, 1);
  assert.strictEqual(continued.issues[0].source, 'спорный.pdf');
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date('2026-07-11T09:01:00.000Z'));
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);

  const stale = harness.context.notifyClaimConstructorImportComplete_(
    { constructorRunId: 'old-run', constructorNextPhase: 'reconstructing' },
    { complete: true, rows: [['строка']] }
  );
  const standalone = harness.context.notifyClaimConstructorImportComplete_(
    { spreadsheetId: harness.spreadsheet.getId() },
    { complete: true, rows: [['строка']] }
  );

  assert.strictEqual(stale, null);
  assert.strictEqual(standalone, null);
  assert.strictEqual(harness.context.loadClaimConstructorRun_(harness.scriptProperties).phase, 'importing');
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' }, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date('2026-07-11T09:01:00.000Z'));
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date('2026-07-11T09:02:00.000Z'));
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  const order = [];
  harness.context.runZupReconstruction_ = () => {
    order.push('reconstructing');
    return { fillResults: [{ sheet: 'Из_1С_Оклад', rows: 1 }], calculationResults: [] };
  };
  harness.context.runAllSheetsIndexation_ = () => {
    order.push('calculating');
    return [{ sheetName: 'Оклад', calculated: 1, skipped: 0 }];
  };
  harness.context.runClaimSheetCalculation_ = () => ({ ready: true, written: 3, result: {}, params: {}, issues: [] });
  harness.context.readClaimCalculationParams_ = () => ({ startDate: new Date(), endDate: new Date() });
  harness.context.runClaimCalculationDocsHandoff_ = () => {
    order.push('writing_doc');
    return { writtenSections: ['claim_calculation'], skippedSections: [], issues: [], result: {} };
  };

  const completed = harness.context.continueClaimConstructorPipeline_(run.id, {
    spreadsheet: harness.spreadsheet,
  });

  assert.deepStrictEqual(order, ['reconstructing', 'calculating', 'writing_doc']);
  assert.strictEqual(completed.status, 'complete');
  assert.strictEqual(completed.phase, 'complete');
  assert.strictEqual(completed.phases.reconstructing, 'done');
  assert.strictEqual(completed.phases.calculating, 'done');
  assert.strictEqual(completed.phases.writing_doc, 'done');
  assert.strictEqual(completed.results.reconstruction.fillResults[0].rows, 1);
  assert.strictEqual(completed.results.calculations[0].sheetName, 'Оклад');
  assert.deepStrictEqual(Array.from(completed.results.docs.writtenSections), ['claim_calculation']);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' }, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date('2026-07-11T09:01:00.000Z'));
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date('2026-07-11T09:02:00.000Z'));
  run.issues.push(harness.context.normalizeClaimConstructorIssue_({
    phase: 'importing', sourceKind: 'payroll_slips', source: 'спорный.pdf', reason: 'Нужна сверка',
  }));
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  harness.context.runZupReconstruction_ = () => ({ fillResults: [], calculationResults: [] });
  harness.context.runAllSheetsIndexation_ = () => [{ sheetName: 'Оклад', calculated: 1, skipped: 0 }];
  harness.context.runClaimSheetCalculation_ = () => ({ ready: true, written: 3, result: {}, params: {}, issues: [] });
  harness.context.readClaimCalculationParams_ = () => ({ startDate: new Date(), endDate: new Date() });
  harness.context.runClaimCalculationDocsHandoff_ = () => ({
    writtenSections: [],
    skippedSections: ['claim_calculation'],
    issues: [{ code: 'claim_parameters_missing', reason: 'Не хватает даты' }],
    result: null,
  });

  const completed = harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.strictEqual(completed.status, 'complete_with_warnings');
  assert.strictEqual(completed.phase, 'complete_with_warnings');
  assert.strictEqual(completed.issues.length, 2);
  assert.strictEqual(completed.results.calculations[0].calculated, 1);
  assert.strictEqual(completed.results.docs.skippedSections[0], 'claim_calculation');
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'reconstructing', 'calculating', new Date());
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  const order = [];
  const claimResult = { wageAmount: 100, penaltyAmount: 10, vacationAmount: 20 };
  harness.context.runAllSheetsIndexation_ = () => {
    order.push('sheets');
    return [{ totals: { underpayment: 5, indexation: 1, liability: 1 } }];
  };
  harness.context.runClaimSheetCalculation_ = () => {
    order.push('claim_sheet');
    return { ready: true, written: 3, result: claimResult, params: {}, issues: [] };
  };
  harness.context.readClaimCalculationParams_ = () => ({});
  harness.context.runClaimCalculationDocsHandoff_ = (spreadsheet, options) => {
    order.push('docs');
    assert.strictEqual(options.calculatedResult, claimResult);
    return { writtenSections: ['claim_calculation'], skippedSections: [], issues: [], result: claimResult };
  };

  const completed = harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.deepStrictEqual(order, ['sheets', 'claim_sheet', 'docs']);
  assert.strictEqual(completed.results.claimCalculation.written, 3);
  assert.strictEqual(completed.results.dashboard.totals.underpayment, 125);
  assert.strictEqual(completed.results.dashboard.totals.liability, 11);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' });
  run.phases = {
    validating: 'done', importing: 'done', reconstructing: 'done', calculating: 'done', writing_doc: 'running',
  };
  run.phase = 'writing_doc';
  run.results.claimCalculation = { ready: true, written: 3, result: {}, params: {}, issues: [] };
  run.results.calculations = [{ durable: true }];
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  harness.context.runClaimCalculationDocsHandoff_ = () => ({
    writtenSections: [],
    skippedSections: ['claim_calculation'],
    issues: [{ code: 'doc_write_failed', reason: 'Нет доступа к обязательному Google Doc' }],
    result: null,
  });

  const failed = harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.strictEqual(failed.status, 'failed');
  assert.strictEqual(failed.failedPhase, 'writing_doc');
  assert.strictEqual(failed.results.calculations[0].durable, true);
}

{
  const harness = createHarness(['Оклад', 'Импорт_1С_QG', 'Импорт_1С_VLM']);
  const qg = harness.spreadsheet.getSheetByName('Импорт_1С_QG');
  ['Проверка', 'Серьезность', 'Статус', 'Файл', 'Период', 'Организация', 'Сотрудник', 'Лист/ячейка', 'Проблема', 'Что проверить']
    .forEach((value, index) => qg.seed(1, index + 1, value));
  ['Сотрудник', 'Предупреждение', 'На проверке', 'листок.pdf', '06.2026', '', '', 'A2', 'ФИО различается', 'Сверить']
    .forEach((value, index) => qg.seed(2, index + 1, value));
  const vlm = harness.spreadsheet.getSheetByName('Импорт_1С_VLM');
  Array.from({ length: 12 }, (_, index) => `H${index}`).forEach((value, index) => vlm.seed(1, index + 1, value));
  ['листок.pdf', 'pdf', 'model', 'VLM', 1, 0, 0, 0, 0, '', 'Низкая уверенность', '{}']
    .forEach((value, index) => vlm.seed(2, index + 1, value));
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'reconstructing', 'calculating', new Date());
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  harness.context.runAllSheetsIndexation_ = () => [{ sheetName: 'Оклад', calculated: 1, skipped: 2 }];
  harness.context.runClaimSheetCalculation_ = () => ({ ready: true, written: 3, result: {}, params: {}, issues: [] });
  harness.context.runClaimCalculationDocsHandoff_ = () => ({
    writtenSections: [], skippedSections: [], issues: [], result: {},
  });

  const completed = harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.ok(completed.issues.some((issue) => issue.source === 'листок.pdf; 06.2026; A2'));
  assert.ok(completed.issues.some((issue) => issue.reviewStatus === 'VLM'));
  assert.ok(completed.issues.some((issue) => issue.phase === 'calculating' && issue.reason.includes('пропущено 2')));
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date('2026-07-11T09:01:00.000Z'));
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  const downstreamCalls = [];
  harness.context.runZupReconstruction_ = () => downstreamCalls.push('reconstructing');
  harness.context.runAllSheetsIndexation_ = () => downstreamCalls.push('calculating');
  harness.context.runClaimCalculationDocsHandoff_ = () => downstreamCalls.push('writing_doc');

  const failed = harness.context.continueClaimConstructorAfterImport_(run.id, 'reconstructing', {
    complete: true,
    rows: [],
    rowsRecognized: 0,
    skippedFiles: [['непрочитан.pdf', 'application/pdf', 'Нет расчетных строк']],
  });

  assert.strictEqual(failed.status, 'failed');
  assert.strictEqual(failed.phase, 'failed');
  assert.strictEqual(failed.phases.importing, 'done');
  assert.strictEqual(failed.results.import.rowsRecognized, 0);
  assert.ok(failed.issues.some((issue) => issue.severity === 'error' && issue.reason.includes('расчетных строк')));
  assert.deepStrictEqual(downstreamCalls, []);
  const constructorSheet = harness.spreadsheet.getSheetByName('Конструктор');
  const layout = harness.context.getClaimConstructorLayout_();
  assert.strictEqual(constructorSheet.getRange(layout.status.phaseCell).getValue(), 'Ошибка');
}

{
  const harness = createHarness();
  const previous = harness.context.createClaimConstructorRun_({ folderId: 'folder-1', docId: 'doc-1' }, {
    now: new Date('2026-07-11T09:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(previous, 'validating', 'importing', new Date('2026-07-11T09:01:00.000Z'));
  harness.context.completeClaimConstructorPhase_(previous, 'importing', 'reconstructing', new Date('2026-07-11T09:02:00.000Z'));
  harness.context.completeClaimConstructorPhase_(previous, 'reconstructing', 'calculating', new Date('2026-07-11T09:03:00.000Z'));
  previous.status = 'failed';
  previous.phase = 'failed';
  previous.failedPhase = 'calculating';
  previous.results = {
    import: { rowsRecognized: 3 },
    reconstruction: { fillResults: [{ rows: 3 }] },
    calculations: { partial: true },
  };
  previous.issues = [harness.context.normalizeClaimConstructorIssue_({ reason: 'Спорная строка' })];

  const successor = harness.context.createClaimConstructorRetryRun_(previous, {
    now: new Date('2026-07-11T10:00:00.000Z'),
  });

  assert.strictEqual(successor.id, 'uuid-2');
  assert.strictEqual(successor.parentRunId, previous.id);
  assert.strictEqual(successor.phase, 'calculating');
  assert.strictEqual(successor.phases.validating, 'done');
  assert.strictEqual(successor.phases.importing, 'done');
  assert.strictEqual(successor.phases.reconstructing, 'done');
  assert.strictEqual(successor.phases.calculating, 'running');
  assert.strictEqual(successor.phases.writing_doc, 'pending');
  assert.strictEqual(successor.results.import.rowsRecognized, 3);
  assert.strictEqual(successor.results.reconstruction.fillResults[0].rows, 3);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(successor.results, 'calculations'), false);
  assert.strictEqual(successor.issues.length, 1);
}

{
  const harness = createHarness();
  const previous = harness.context.createClaimConstructorRun_({}, { now: new Date('2026-07-11T09:00:00.000Z') });
  previous.status = 'failed';
  previous.phase = 'failed';
  previous.failedPhase = 'writing_doc';
  previous.phases = {
    validating: 'done', importing: 'done', reconstructing: 'done', calculating: 'done', writing_doc: 'running',
  };
  harness.context.saveClaimConstructorRun_(previous, harness.scriptProperties);
  const pipelineCalls = [];
  harness.context.continueClaimConstructorPipeline_ = (runId) => {
    pipelineCalls.push(runId);
    return harness.context.loadClaimConstructorRun_(harness.scriptProperties);
  };

  const successor = harness.context.retryClaimCalculation();

  assert.strictEqual(successor.id, 'uuid-2');
  assert.strictEqual(successor.parentRunId, previous.id);
  assert.strictEqual(successor.phase, 'writing_doc');
  assert.deepStrictEqual(pipelineCalls, [successor.id]);
}

{
  const harness = createHarness();
  const folderId = 'retry-folder-123456789';
  const docId = 'retry-doc-123456789';
  const previous = harness.context.createClaimConstructorRun_({
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    folderId,
    docUrl: `https://docs.google.com/document/d/${docId}/edit`,
    docId,
  }, { now: new Date('2026-07-11T09:00:00.000Z') });
  previous.status = 'failed';
  previous.phase = 'failed';
  previous.failedPhase = 'importing';
  previous.phases = {
    validating: 'done', importing: 'running', reconstructing: 'pending', calculating: 'pending', writing_doc: 'pending',
  };
  harness.context.saveClaimConstructorRun_(previous, harness.scriptProperties);
  harness.driveFolders.set(folderId, { id: folderId });
  harness.documents.set(docId, { id: docId });
  const importCalls = [];
  harness.context.startZupFolderImportBatch_ = (spreadsheet, folder, options) => {
    importCalls.push({ spreadsheet, folder, options });
    return { complete: false, rows: [], rowsRecognized: 0, skippedFiles: [] };
  };

  const successor = harness.context.retryClaimCalculation();

  assert.strictEqual(successor.parentRunId, previous.id);
  assert.strictEqual(successor.phase, 'importing');
  assert.strictEqual(importCalls.length, 1);
  assert.strictEqual(importCalls[0].options.force, false);
  assert.strictEqual(importCalls[0].options.constructorRunId, successor.id);
}

{
  const harness = createHarness();
  const previous = harness.context.createClaimConstructorRun_({
    folderUrl: 'не ссылка', folderId: '', docUrl: '', docId: '',
  }, { now: new Date('2026-07-11T09:00:00.000Z') });
  previous.status = 'failed';
  previous.phase = 'failed';
  previous.failedPhase = 'validating';
  harness.context.saveClaimConstructorRun_(previous, harness.scriptProperties);
  const importCalls = [];
  harness.context.startZupFolderImportBatch_ = (...args) => importCalls.push(args);

  const successor = harness.context.retryClaimCalculation();

  assert.strictEqual(successor.parentRunId, previous.id);
  assert.strictEqual(successor.status, 'failed');
  assert.strictEqual(successor.phase, 'failed');
  assert.strictEqual(successor.failedPhase, 'validating');
  assert.strictEqual(importCalls.length, 0);
}

['running', 'complete'].forEach((status) => {
  const harness = createHarness();
  const existing = harness.context.createClaimConstructorRun_({});
  existing.status = status;
  existing.phase = status === 'running' ? 'importing' : 'complete';
  harness.context.saveClaimConstructorRun_(existing, harness.scriptProperties);
  const sideEffects = [];
  harness.context.startZupFolderImportBatch_ = () => sideEffects.push('import');
  harness.context.continueClaimConstructorPipeline_ = () => sideEffects.push('pipeline');

  const returned = harness.context.retryClaimCalculation();

  assert.strictEqual(returned.id, existing.id);
  assert.deepStrictEqual(sideEffects, []);
});

{
  const harness = createHarness();
  const active = harness.context.createClaimConstructorRun_({}, {
    now: new Date('2026-07-11T00:00:00.000Z'),
  });
  harness.context.completeClaimConstructorPhase_(active, 'validating', 'importing', new Date('2026-07-11T00:01:00.000Z'));
  harness.context.completeClaimConstructorPhase_(active, 'importing', 'reconstructing', new Date('2026-07-11T00:02:00.000Z'));
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);
  harness.context.scheduleClaimConstructorContinuation_();

  const returned = harness.context.retryClaimCalculation();

  assert.strictEqual(returned.id, active.id);
}

[
  { failedPhase: 'reconstructing', expected: ['reconstructing', 'calculating', 'writing_doc'] },
  { failedPhase: 'calculating', expected: ['calculating', 'writing_doc'] },
  { failedPhase: 'writing_doc', expected: ['writing_doc'] },
].forEach(({ failedPhase, expected }) => {
  const harness = createHarness();
  const previous = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' });
  const order = harness.context.getClaimConstructorPhaseOrder_();
  const failedIndex = order.indexOf(failedPhase);
  previous.phases = {};
  order.forEach((phase, index) => {
    previous.phases[phase] = index < failedIndex ? 'done' : (index === failedIndex ? 'running' : 'pending');
  });
  previous.status = 'failed';
  previous.phase = 'failed';
  previous.failedPhase = failedPhase;
  previous.results = {
    import: { rowsRecognized: 1 },
    reconstruction: { durable: true },
    calculations: [{ durable: true }],
    claimCalculation: { ready: true, written: 3, result: {}, params: {}, issues: [] },
  };
  harness.context.saveClaimConstructorRun_(previous, harness.scriptProperties);
  const calls = [];
  harness.context.runZupReconstruction_ = () => { calls.push('reconstructing'); return { fillResults: [] }; };
  harness.context.runAllSheetsIndexation_ = () => { calls.push('calculating'); return []; };
  harness.context.runClaimSheetCalculation_ = () => ({ ready: true, written: 3, result: {}, params: {}, issues: [] });
  harness.context.readClaimCalculationParams_ = () => ({});
  harness.context.runClaimCalculationDocsHandoff_ = () => {
    calls.push('writing_doc');
    return { writtenSections: [], skippedSections: [], issues: [], result: null };
  };

  const completed = harness.context.retryClaimCalculation();

  assert.deepStrictEqual(calls, expected);
  assert.strictEqual(completed.status, 'complete');
  if (failedIndex > order.indexOf('importing')) {
    assert.strictEqual(completed.results.import.rowsRecognized, 1);
  }
});

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const folderId = 'interleave-folder-123456789';
  const docId = 'interleave-doc-123456789';
  sheet.getRange(layout.sourceFolder.valueCell).setValue(`https://drive.google.com/drive/folders/${folderId}`);
  sheet.getRange(layout.outputDoc.valueCell).setValue(`https://docs.google.com/document/d/${docId}/edit`);
  harness.driveFolders.set(folderId, { id: folderId });
  harness.documents.set(docId, { id: docId });
  const oldRun = harness.context.createClaimConstructorRun_({}, { now: new Date() });
  harness.context.completeClaimConstructorPhase_(oldRun, 'validating', 'importing', new Date());
  harness.context.saveClaimConstructorRun_(oldRun, harness.scriptProperties);
  const importCalls = [];
  harness.context.startZupFolderImportBatch_ = (...args) => importCalls.push(args);

  const joined = harness.context.buildClaimCalculation();
  assert.strictEqual(joined.run.id, oldRun.id);
  assert.strictEqual(importCalls.length, 0);

  oldRun.status = 'failed';
  oldRun.phase = 'failed';
  oldRun.failedPhase = 'reconstructing';
  oldRun.phases.importing = 'done';
  oldRun.phases.reconstructing = 'running';
  harness.context.saveClaimConstructorRun_(oldRun, harness.scriptProperties);
  const pipelineCalls = [];
  harness.context.continueClaimConstructorPipeline_ = (runId) => {
    pipelineCalls.push(runId);
    return harness.context.loadClaimConstructorRun_(harness.scriptProperties);
  };
  const successor = harness.context.retryClaimCalculation();
  const staleTrigger = harness.context.notifyClaimConstructorImportComplete_(
    { constructorRunId: oldRun.id, constructorNextPhase: 'reconstructing' },
    { complete: true, rows: [['строка']] }
  );

  assert.strictEqual(successor.parentRunId, oldRun.id);
  assert.strictEqual(staleTrigger, null);
  assert.deepStrictEqual(pipelineCalls, [successor.id]);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date());
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  const calls = [];
  harness.context.runZupReconstruction_ = () => { calls.push('reconstructing'); return { fillResults: [] }; };
  harness.context.runAllSheetsIndexation_ = () => { calls.push('calculating'); return []; };
  harness.context.runClaimSheetCalculation_ = () => ({ ready: true, written: 3, result: {}, params: {}, issues: [] });
  harness.context.readClaimCalculationParams_ = () => ({});
  harness.context.runClaimCalculationDocsHandoff_ = () => {
    calls.push('writing_doc');
    return { writtenSections: [], skippedSections: [], issues: [], result: null };
  };

  harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });
  harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.deepStrictEqual(calls, ['reconstructing', 'calculating', 'writing_doc']);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({ docUrl: 'https://docs.google.com/document/d/doc-1/edit' });
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date());
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  let reconstructionCalls = 0;
  harness.context.runZupReconstruction_ = () => {
    reconstructionCalls++;
    if (reconstructionCalls === 1) {
      harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });
    }
    return { fillResults: [] };
  };
  harness.context.runAllSheetsIndexation_ = () => [];
  harness.context.runClaimSheetCalculation_ = () => ({ ready: true, written: 3, result: {}, params: {}, issues: [] });
  harness.context.runClaimCalculationDocsHandoff_ = () => ({
    writtenSections: [], skippedSections: [], issues: [], result: {},
  });

  harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.strictEqual(reconstructionCalls, 1);
}

{
  const harness = createHarness();
  const run = harness.context.createClaimConstructorRun_({});
  harness.context.completeClaimConstructorPhase_(run, 'validating', 'importing', new Date());
  harness.context.completeClaimConstructorPhase_(run, 'importing', 'reconstructing', new Date());
  harness.context.saveClaimConstructorRun_(run, harness.scriptProperties);
  const downstream = [];
  harness.context.runZupReconstruction_ = () => { throw new Error('Сбой реконструкции'); };
  harness.context.runAllSheetsIndexation_ = () => downstream.push('calculating');
  harness.context.runClaimCalculationDocsHandoff_ = () => downstream.push('writing_doc');

  const failed = harness.context.continueClaimConstructorPipeline_(run.id, { spreadsheet: harness.spreadsheet });

  assert.strictEqual(failed.status, 'failed');
  assert.strictEqual(failed.phase, 'failed');
  assert.strictEqual(failed.failedPhase, 'reconstructing');
  assert.ok(failed.progressText.includes('Сбой реконструкции'));
  assert.ok(failed.issues.some((issue) => issue.severity === 'error' && issue.phase === 'reconstructing'));
  assert.deepStrictEqual(downstream, []);
  const constructorSheet = harness.spreadsheet.getSheetByName('Конструктор');
  const layout = harness.context.getClaimConstructorLayout_();
  assert.strictEqual(constructorSheet.getRange(layout.status.phaseCell).getValue(), 'Ошибка');
}

{
  const harness = createHarness([
    'Конструктор',
    'Оклад',
    'Ежемесячные',
    'Отпуска и расчет',
    'Из_1С_Оклад',
    'Из_ДругойСистемы_Оклад',
    'Импорт_1С_QG',
    'Диагностика распознавания',
    'Заметки',
  ]);
  const classify = (name) => harness.context.classifyClaimConstructorSheet_(
    harness.spreadsheet.getSheetByName(name)
  );

  assert.strictEqual(classify('Конструктор'), 'constructor');
  assert.strictEqual(classify('Оклад'), 'primary_calculation');
  assert.strictEqual(classify('Ежемесячные'), 'primary_calculation');
  assert.strictEqual(classify('Отпуска и расчет'), 'primary_calculation');
  assert.strictEqual(classify('Из_1С_Оклад'), 'reconstruction');
  assert.strictEqual(classify('Из_ДругойСистемы_Оклад'), 'reconstruction');
  assert.strictEqual(classify('Импорт_1С_QG'), 'technical');
  assert.strictEqual(classify('Диагностика распознавания'), 'technical');
  assert.strictEqual(classify('Заметки'), 'other');
}

{
  const names = [
    'Конструктор', 'Оклад', 'Ежемесячные', 'Ежеквартальные', 'Ежегодные', 'Отпуска и расчет',
    'Из_1С_Оклад', 'Импорт_1С_QG', 'Заметки',
  ];
  const harness = createHarness(names);
  harness.spreadsheet.getSheets().forEach((sheet, index) => {
    sheet.seed(1, 1, `value-${index}`);
    sheet.formulas.set('2:1', `=A${index + 1}`);
    sheet.formatting.set('1:1', { color: `#00000${index}` });
    sheet.columnWidths.set(1, 100 + index);
  });
  const snapshot = () => harness.spreadsheet.getSheets().map((sheet) => ({
    id: sheet.getSheetId(),
    name: sheet.getName(),
    cells: Array.from(sheet.cells.entries()),
    formulas: Array.from(sheet.formulas.entries()),
    formatting: Array.from(sheet.formatting.entries()),
    widths: Array.from(sheet.columnWidths.entries()),
  }));
  const before = JSON.stringify(snapshot());

  harness.context.applyClaimConstructorVisibilityMode_('normal', harness.spreadsheet);
  assert.strictEqual(harness.spreadsheet.visibilityOperations[0], 'show:Конструктор');
  assert.strictEqual(harness.spreadsheet.getSheetByName('Конструктор').isSheetHidden(), false);
  assert.ok(harness.spreadsheet.getSheets().filter((sheet) => sheet.getName() !== 'Конструктор').every((sheet) => sheet.isSheetHidden()));

  harness.context.applyClaimConstructorVisibilityMode_('detail', harness.spreadsheet);
  names.forEach((name) => {
    const shouldBeVisible = name === 'Конструктор' || [
      'Оклад', 'Ежемесячные', 'Ежеквартальные', 'Ежегодные', 'Отпуска и расчет',
    ].includes(name);
    assert.strictEqual(harness.spreadsheet.getSheetByName(name).isSheetHidden(), !shouldBeVisible, name);
  });

  harness.context.applyClaimConstructorVisibilityMode_('technical', harness.spreadsheet);
  assert.ok(harness.spreadsheet.getSheets().every((sheet) => !sheet.isSheetHidden()));
  assert.strictEqual(JSON.stringify(snapshot()), before);
  assert.strictEqual(harness.documentProperties.getProperty('CLAIM_CONSTRUCTOR_VISIBILITY_MODE'), 'technical');
}

{
  const harness = createHarness(['Оклад']);
  harness.context.onOpen();

  assert.strictEqual(harness.menus.length, 1);
  assert.strictEqual(harness.menus[0].name, 'Конструктор требований');
  const directFunctions = harness.menus[0].items.filter((item) => item.fn).map((item) => item.fn);
  assert.deepStrictEqual(directFunctions, [
    'openClaimConstructor',
    'buildClaimCalculation',
    'retryClaimCalculation',
    'showClaimConstructorDetailMode',
    'showClaimConstructorNormalMode',
    'showClaimConstructorTechnicalMode',
  ]);
  const submenu = harness.menus[0].items.find((item) => item.submenu).submenu;
  assert.strictEqual(submenu.name, 'Технические операции');
  const technicalFunctions = submenu.items.filter((item) => item.fn).map((item) => item.fn);
  assert.ok(technicalFunctions.includes('previewZupFolderImport'));
  assert.ok(technicalFunctions.includes('resumeZupFolderImport'));
  assert.ok(technicalFunctions.includes('showZupVlmSettings'));
  assert.ok(technicalFunctions.includes('populateZupReconstructionSheets'));
}

{
  const harness = createHarness(['Конструктор', 'Оклад', 'Импорт_1С_QG']);
  harness.documentProperties.setProperty('CLAIM_CONSTRUCTOR_VISIBILITY_MODE', 'detail');

  harness.context.onOpen();

  assert.strictEqual(harness.spreadsheet.getSheetByName('Конструктор').isSheetHidden(), false);
  assert.strictEqual(harness.spreadsheet.getSheetByName('Оклад').isSheetHidden(), false);
  assert.strictEqual(harness.spreadsheet.getSheetByName('Импорт_1С_QG').isSheetHidden(), true);
}

console.log('claim constructor characterization ok');

module.exports = {
  FakeProperties,
  FakeRange,
  FakeSheet,
  FakeSpreadsheet,
  createHarness,
};
