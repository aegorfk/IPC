const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const SOURCE_FILES = [
  'google-apps-script/SalaryIndexation.gs',
  'google-apps-script/ZupImport.gs',
  'google-apps-script/ClaimIntakeRequirements.gs',
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

  getNotes() {
    return this.sheet.readGrid(this.row, this.column, this.rowCount, this.columnCount, 'note');
  }

  getSheet() { return this.sheet; }
  getRow() { return this.row; }
  getColumn() { return this.column; }
  getNumRows() { return this.rowCount; }
  getNumColumns() { return this.columnCount; }

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

  setNotes(notes) {
    this.sheet.writeGrid(this.row, this.column, notes, 'note');
    return this;
  }

  setRichTextValue(value) {
    const link = value && typeof value.getLinkUrl === 'function' ? value.getLinkUrl() : '';
    this.sheet.writeGrid(this.row, this.column, [[link]], 'link');
    return this;
  }

  getFormula() {
    return this.sheet.readGrid(this.row, this.column, 1, 1, 'formula')[0][0] || '';
  }

  setFormula(value) {
    this.sheet.writeGrid(this.row, this.column, [[value]], 'formula');
    return this;
  }

  clearContent() {
    const empty = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(''));
    return this.setValues(empty);
  }

  setDataValidation(validation) {
    this.sheet.writeGrid(this.row, this.column, [[validation]], 'validation');
    return this;
  }

  getDataValidation() {
    return this.sheet.readGrid(this.row, this.column, 1, 1, 'validation')[0][0] || null;
  }

  clearDataValidations() {
    const empty = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(''));
    this.sheet.writeGrid(this.row, this.column, empty, 'validation');
    return this;
  }

  insertCheckboxes() {
    const values = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(false));
    this.setValues(values);
    this.sheet.writeGrid(
      this.row,
      this.column,
      Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill({ type: 'checkbox' })),
      'validation'
    );
    return this;
  }

  setBackgrounds(backgrounds) {
    this.sheet.writeGrid(this.row, this.column, backgrounds, 'background');
    return this;
  }

  getBackgrounds() {
    return this.sheet.readGrid(this.row, this.column, this.rowCount, this.columnCount, 'background');
  }

  getBackground() {
    return this.getBackgrounds()[0][0] || '';
  }

  setBackground(value) {
    return this.setBackgrounds(Array.from(
      { length: this.rowCount },
      () => Array(this.columnCount).fill(value)
    ));
  }

  getNote() {
    return this.sheet.readGrid(this.row, this.column, 1, 1, 'note')[0][0] || '';
  }

  setNote(value) {
    this.sheet.writeGrid(this.row, this.column, [[value]], 'note');
    return this;
  }

  getNumberFormat() {
    return this.sheet.readGrid(this.row, this.column, 1, 1, 'numberFormat')[0][0] || '';
  }

  setNumberFormat(value) {
    this.sheet.writeGrid(this.row, this.column, [[value]], 'numberFormat');
    return this;
  }

  moveTo(target) {
    this.sheet.moveRangeState(this, target);
    return this;
  }

  merge() { return this; }
  breakApart() { return this; }
  setBorder() { return this; }
  setFontColor() { return this; }
  setFontFamily() { return this; }
  setFontSize() { return this; }
  setFontWeight() { return this; }
  setHorizontalAlignment() { return this; }
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
    this.validations = new Map();
    this.backgrounds = new Map();
    this.notes = new Map();
    this.numberFormats = new Map();
    this.frozenRows = 0;
    this.columnWidths = new Map();
    this.hiddenColumns = new Set();
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
    const store = this.getStateStore(kind);
    return Array.from({ length: rowCount }, (_, rowOffset) =>
      Array.from({ length: columnCount }, (_, columnOffset) =>
        store.has(this.key(row + rowOffset, column + columnOffset))
          ? store.get(this.key(row + rowOffset, column + columnOffset))
          : ''
      )
    );
  }

  writeGrid(row, column, values, kind) {
    this.spreadsheet.serviceCalls.writes++;
    this.spreadsheet.serviceCalls[`${kind || 'value'}Writes`] =
      (this.spreadsheet.serviceCalls[`${kind || 'value'}Writes`] || 0) + 1;
    this.spreadsheet.writeAttempts++;
    if (this.spreadsheet.failWriteAt === this.spreadsheet.writeAttempts) {
      this.spreadsheet.failWriteAt = null;
      throw new Error('injected sheet write failure');
    }
    const store = this.getStateStore(kind);
    values.forEach((valuesRow, rowOffset) => {
      valuesRow.forEach((value, columnOffset) => {
        store.set(this.key(row + rowOffset, column + columnOffset), value);
      });
    });
    if (this.spreadsheet.failAfterWriteKind === (kind || 'value')) {
      this.spreadsheet.failAfterWriteKind = null;
      throw new Error(`injected ${kind || 'value'} write failure`);
    }
  }

  getStateStores() {
    return [
      this.cells,
      this.links,
      this.formulas,
      this.formatting,
      this.validations,
      this.backgrounds,
      this.notes,
      this.numberFormats,
    ];
  }

  getStateStore(kind) {
    return {
      value: this.cells,
      link: this.links,
      formula: this.formulas,
      formatting: this.formatting,
      validation: this.validations,
      background: this.backgrounds,
      note: this.notes,
      numberFormat: this.numberFormats,
    }[kind || 'value'];
  }

  moveRangeState(source, target) {
    if (target.sheet !== this) throw new Error('Cross-sheet move is not supported by fake');
    const snapshots = this.getStateStores().map((store) =>
      Array.from({ length: source.rowCount }, (_, rowOffset) =>
        Array.from({ length: source.columnCount }, (_, columnOffset) => {
          const key = this.key(source.row + rowOffset, source.column + columnOffset);
          return { present: store.has(key), value: store.get(key) };
        })
      )
    );
    this.getStateStores().forEach((store) => {
      for (let rowOffset = 0; rowOffset < source.rowCount; rowOffset++) {
        for (let columnOffset = 0; columnOffset < source.columnCount; columnOffset++) {
          store.delete(this.key(source.row + rowOffset, source.column + columnOffset));
        }
      }
    });
    this.getStateStores().forEach((store, storeIndex) => {
      for (let rowOffset = 0; rowOffset < source.rowCount; rowOffset++) {
        for (let columnOffset = 0; columnOffset < source.columnCount; columnOffset++) {
          const destinationKey = this.key(target.row + rowOffset, target.column + columnOffset);
          const state = snapshots[storeIndex][rowOffset][columnOffset];
          if (state.present) store.set(destinationKey, state.value);
          else store.delete(destinationKey);
        }
      }
    });
  }

  getName() { return this.name; }
  getParent() { return this.spreadsheet; }
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
    return Math.max(0, ...this.getStateStores().flatMap((store) =>
      Array.from(store.keys()).map((key) => Number(key.split(':')[0]))
    ));
  }
  getLastColumn() {
    return Math.max(0, ...this.getStateStores().flatMap((store) =>
      Array.from(store.keys()).map((key) => Number(key.split(':')[1]))
    ));
  }
  getIndex() { return this.spreadsheet.sheets.indexOf(this) + 1; }
  activate() { this.spreadsheet.activeSheet = this; return this; }
  hideSheet() { this.hidden = true; this.spreadsheet.visibilityOperations.push(`hide:${this.name}`); return this; }
  showSheet() { this.hidden = false; this.spreadsheet.visibilityOperations.push(`show:${this.name}`); return this; }
  isSheetHidden() { return this.hidden; }
  setFrozenRows(count) { this.frozenRows = count; return this; }
  setColumnWidth(column, width) { this.columnWidths.set(column, width); return this; }
  hideColumns(column, count) {
    const size = count || 1;
    for (let offset = 0; offset < size; offset++) this.hiddenColumns.add(column + offset);
    return this;
  }
  isColumnHiddenByUser(column) { return this.hiddenColumns.has(column); }
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
    this.writeAttempts = 0;
    this.failWriteAt = null;
    this.failAfterWriteKind = null;
    this.serviceCalls = { writes: 0, namedRangeSets: 0 };
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
  setNamedRange(name, range) {
    this.serviceCalls.namedRangeSets++;
    this.namedRanges.set(name, range);
  }
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
    this.getPropertyCalls = 0;
    this.getPropertiesCalls = 0;
    this.setPropertiesCalls = 0;
  }
  getProperty(name) {
    this.getPropertyCalls++;
    return this.values.has(name) ? this.values.get(name) : null;
  }
  getProperties() {
    this.getPropertiesCalls++;
    return Object.fromEntries(this.values);
  }
  setProperty(name, value) { this.values.set(name, String(value)); return this; }
  setProperties(values) {
    this.setPropertiesCalls++;
    if (this.failSetPropertiesOnce) {
      this.failSetPropertiesOnce = false;
      throw new Error('injected property set failure');
    }
    Object.keys(values || {}).forEach((name) => this.values.set(name, String(values[name])));
    return this;
  }
  deleteProperty(name) {
    if (this.failDeletePropertyOnce) {
      this.failDeletePropertyOnce = false;
      throw new Error('injected property delete failure');
    }
    this.values.delete(name);
    return this;
  }
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
    onTryLock: null,
    tryLock() { this.acquired++; if (this.onTryLock) this.onTryLock(); return this.allow; },
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
      flush() {
        documentLock.flushes = (documentLock.flushes || 0) + 1;
        if (documentLock.flushError) throw documentLock.flushError;
      },
      newDataValidation: () => {
        const rule = { type: '', values: [] };
        return {
          requireValueInList(values) { rule.type = 'list'; rule.values = values.slice(); return this; },
          setAllowInvalid() { return this; },
          build() { return rule; },
        };
      },
      openById: () => spreadsheet,
    },
    String,
    UrlFetchApp: { fetch() { throw new Error('Unexpected UrlFetchApp.fetch'); } },
    Utilities: {
      formatDate(date, timezone, format) {
        if (format === 'dd.MM.yyyy') {
          return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
        }
        if (format === 'dd.MM.yyyy HH:mm') {
          const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
          return `${String(shifted.getUTCDate()).padStart(2, '0')}.${String(shifted.getUTCMonth() + 1).padStart(2, '0')}.${shifted.getUTCFullYear()} ${String(shifted.getUTCHours()).padStart(2, '0')}:${String(shifted.getUTCMinutes()).padStart(2, '0')}`;
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
  const harness = createHarness(['Конструктор']);
  const sheet = harness.spreadsheet.getSheetByName('Конструктор');
  const folderUrl = 'https://drive.google.com/drive/folders/1CurrentPayrollFolder123456789';
  sheet.seed(4, 1, 'Расчетные листы:').seed(4, 2, folderUrl);

  const resolved = harness.context.findZupFolderNearSourceLabel_(harness.spreadsheet);

  assert.strictEqual(resolved.id, '1CurrentPayrollFolder123456789');
  assert.strictEqual(resolved.source, 'Конструктор!B4');
}

{
  const harness = createHarness(['Оклад']);
  const active = harness.context.createClaimConstructorRun_({}, { now: new Date() });
  harness.context.saveClaimConstructorRun_(active, harness.scriptProperties);

  const result = harness.context.buildClaimCalculation();

  assert.strictEqual(result.joined, true);
  assert.ok(harness.spreadsheet.getSheetByName('Конструктор'));
  assert.ok(harness.spreadsheet.getSheetByName('Анкета и требования'));
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
  assert.strictEqual(layout.sourceFolder.label, 'Расчетные листы:');
  assert.strictEqual(layout.sourceFolder.namedRange, 'CLAIM_CONSTRUCTOR_SOURCE_FOLDER');
  assert.strictEqual(layout.normativeFolder.label, 'Нормативные документы');
  assert.strictEqual(layout.normativeFolder.labelCell, 'A6');
  assert.strictEqual(layout.normativeFolder.valueCell, 'B6');
  assert.strictEqual(layout.normativeFolder.placeholderCell, 'A7');
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
  assert.strictEqual(layout.phaseLabels.reconstructing, 'Импорт завершен. Реконструкция начислений и выплат');
  assert.strictEqual(layout.resultFields.liability.label, 'Материальная ответственность');
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);

  assert.strictEqual(workspace.constructor.getName(), 'Конструктор');
  assert.strictEqual(workspace.questionnaire.getName(), 'Анкета и требования');
  assert.deepStrictEqual(
    harness.spreadsheet.getSheets().slice(0, 2).map((sheet) => sheet.getName()),
    ['Конструктор', 'Анкета и требования']
  );

  harness.context.applyClaimConstructorVisibilityMode_('normal', harness.spreadsheet);
  assert.deepStrictEqual(
    harness.spreadsheet.getSheets().filter((sheet) => !sheet.isSheetHidden()).map((sheet) => sheet.getName()),
    ['Конструктор', 'Анкета и требования']
  );

  harness.context.applyClaimConstructorVisibilityMode_('detail', harness.spreadsheet);
  assert.deepStrictEqual(
    harness.spreadsheet.getSheets().filter((sheet) => !sheet.isSheetHidden()).map((sheet) => sheet.getName()),
    ['Конструктор', 'Анкета и требования', 'Оклад', 'Ежемесячные']
  );
}

{
  const harness = createHarness(['Конструктор']);
  const legacyDocUrl = 'https://docs.google.com/document/d/legacy-current-doc-123456789/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(4, 1, 'Расчетные листы:')
    .seed(4, 2, 'https://drive.google.com/drive/folders/current-payroll-123456789')
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, legacyDocUrl)
    .seed(9, 1, 'Статус:')
    .seed(9, 2, 'Сохраненный этап')
    .seed(23, 1, 'Сохраненное замечание');

  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const intakeLayout = harness.context.getClaimIntakeLayout_();

  assert.strictEqual(constructor.getRange('A6').getValue(), 'Нормативные документы');
  assert.strictEqual(constructor.getRange('B6').getValue(), '');
  assert.strictEqual(constructor.getRange('A7').getValue(), 'пока не анализируется');
  assert.strictEqual(constructor.getRange(layout.outputDoc.labelCell).getValue(), 'Расписанный расчет:');
  assert.strictEqual(constructor.getRange(layout.outputDoc.valueCell).getValue(), legacyDocUrl);
  assert.strictEqual(constructor.getRange(layout.status.phaseCell).getValue(), 'Сохраненный этап');
  assert.strictEqual(constructor.getRange(26, 1).getValue(), 'Сохраненное замечание');

  const questionnaire = workspace.questionnaire;
  questionnaire.getRange(intakeLayout.employerSector.valueCell).setValue('Частная организация');
  questionnaire.getRange(intakeLayout.partialRecoveries.firstRow, 2).setValue('15.01.2026');
  constructor.getRange(layout.normativeFolder.valueCell)
    .setValue('https://drive.google.com/drive/folders/normative-folder-123456789');
  const repaired = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);

  assert.strictEqual(repaired.constructor.getRange(layout.sourceFolder.valueCell).getValue(), 'https://drive.google.com/drive/folders/current-payroll-123456789');
  assert.strictEqual(repaired.constructor.getRange(layout.normativeFolder.valueCell).getValue(), 'https://drive.google.com/drive/folders/normative-folder-123456789');
  assert.strictEqual(repaired.constructor.getRange(layout.outputDoc.valueCell).getValue(), legacyDocUrl);
  assert.strictEqual(repaired.questionnaire.getRange(intakeLayout.employerSector.valueCell).getValue(), 'Частная организация');
  assert.strictEqual(repaired.questionnaire.getRange(intakeLayout.partialRecoveries.firstRow, 2).getValue(), '15.01.2026');
}

{
  const harness = createHarness(['Конструктор']);
  const docUrl = 'https://docs.google.com/document/d/partially-migrated-doc-123456789/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, docUrl)
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, docUrl)
    .seed(12, 1, 'Статус:')
    .seed(12, 2, 'Уже перенесенный этап');

  harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();

  assert.strictEqual(constructor.getRange(layout.status.phaseCell).getValue(), 'Уже перенесенный этап');
  assert.strictEqual(constructor.getRange(layout.outputDoc.valueCell).getValue(), docUrl);
  assert.strictEqual(constructor.getRange(layout.normativeFolder.valueCell).getValue(), '');
}

{
  const harness = createHarness(['Конструктор']);
  const destinationDocUrl = 'https://docs.google.com/document/d/source-cleared-destination-123456789/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, '')
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, destinationDocUrl)
    .seed(12, 1, 'Статус:')
    .seed(12, 2, 'Миграция почти завершена');

  const firstRepair = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const secondRepair = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);

  assert.strictEqual(firstRepair.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(secondRepair.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(constructor.getRange(layout.status.phaseCell).getValue(), 'Миграция почти завершена');
  assert.strictEqual(constructor.getRange(layout.normativeFolder.valueCell).getValue(), '');
}

{
  const harness = createHarness(['Конструктор']);
  const legacyDocUrl = 'https://docs.google.com/document/d/conflicting-legacy-doc-123456789/edit';
  const destinationDocUrl = 'https://docs.google.com/document/d/conflicting-current-doc-123456789/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, legacyDocUrl)
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, destinationDocUrl)
    .seed(12, 1, 'Статус:')
    .seed(12, 2, 'Уже перенесенный этап');

  const firstRepair = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const intakeLayout = harness.context.getClaimIntakeLayout_();
  const secondRepair = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const history = secondRepair.questionnaire
    .getRange(intakeLayout.docsHistory.firstRow, 1, intakeLayout.docsHistory.rowCount, 3)
    .getValues();

  assert.strictEqual(firstRepair.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(secondRepair.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(constructor.getRange(layout.normativeFolder.valueCell).getValue(), '');
  assert.strictEqual(history.filter((row) => row[1] === legacyDocUrl).length, 1);
}

{
  const harness = createHarness(['Конструктор']);
  const destinationDocUrl = 'https://docs.google.com/document/d/docs-row-without-status-source-cleared/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, '')
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, destinationDocUrl)
    .seed(12, 2, 'Статус без восстановленной метки');

  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();

  assert.strictEqual(workspace.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(workspace.constructor.getRange(layout.status.phaseCell).getValue(), 'Статус без восстановленной метки');
  assert.strictEqual(workspace.constructor.getRange(layout.normativeFolder.valueCell).getValue(), '');
}

{
  const harness = createHarness(['Конструктор']);
  const legacyDocUrl = 'https://docs.google.com/document/d/docs-row-without-status-legacy/edit';
  const destinationDocUrl = 'https://docs.google.com/document/d/docs-row-without-status-current/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, legacyDocUrl)
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, destinationDocUrl)
    .seed(12, 2, 'Статус без восстановленной метки');

  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const intakeLayout = harness.context.getClaimIntakeLayout_();
  const history = workspace.questionnaire
    .getRange(intakeLayout.docsHistory.firstRow, 1, intakeLayout.docsHistory.rowCount, 3)
    .getValues();

  assert.strictEqual(workspace.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(workspace.constructor.getRange(layout.status.phaseCell).getValue(), 'Статус без восстановленной метки');
  assert.strictEqual(history.filter((row) => row[1] === legacyDocUrl).length, 1);
}

{
  const harness = createHarness(['Конструктор', 'Анкета и требования']);
  const legacyDocUrl = 'https://docs.google.com/document/d/history-full-legacy-doc/edit';
  const destinationDocUrl = 'https://docs.google.com/document/d/history-full-current-doc/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  const questionnaire = harness.spreadsheet.getSheetByName('Анкета и требования');
  const intakeLayout = harness.context.getClaimIntakeLayout_();
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, legacyDocUrl)
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, destinationDocUrl);
  questionnaire
    .getRange(intakeLayout.docsHistory.firstRow, 1, intakeLayout.docsHistory.rowCount, 3)
    .setValues(Array.from({ length: intakeLayout.docsHistory.rowCount }, (_, index) => [
      `date-${index}`, `https://docs.google.com/document/d/existing-${index}/edit`, 'existing',
    ]));

  let repairError = null;
  try {
    harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  } catch (error) {
    repairError = error;
  }

  assert.ok(repairError);
  assert.ok(repairError.message.includes('Не удалось сохранить прежнюю ссылку Google Doc в истории'));
  assert.strictEqual(constructor.getRange('B6').getValue(), legacyDocUrl);
  assert.strictEqual(constructor.getRange('B9').getValue(), destinationDocUrl);
  assert.strictEqual(constructor.getRange('A6').getValue(), 'Расписанный расчет:');
}

{
  const harness = createHarness(['Конструктор']);
  const destinationDocUrl = 'https://docs.google.com/document/d/status-new-totals-old-doc/edit';
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, destinationDocUrl)
    .seed(12, 1, 'Статус:')
    .seed(12, 2, 'Новый статус уже на месте')
    .seed(14, 1, 'Итоги расчета')
    .seed(15, 1, 'Недоплата')
    .seed(15, 2, 12345);

  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();

  assert.strictEqual(workspace.constructor.getRange(layout.outputDoc.valueCell).getValue(), destinationDocUrl);
  assert.strictEqual(workspace.constructor.getRange(layout.status.phaseCell).getValue(), 'Новый статус уже на месте');
  assert.strictEqual(workspace.constructor.getRange(layout.resultFields.underpayment.valueCell).getValue(), 12345);
}

{
  const harness = createHarness(['Конструктор']);
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  const metadataCell = constructor.getRange('B15');
  const validation = { type: 'list', values: ['legacy'] };
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, 'https://docs.google.com/document/d/semantic-migration-doc/edit')
    .seed(9, 1, 'Статус:')
    .seed(14, 1, 'Итоги расчета')
    .seed(15, 1, 'Недоплата')
    .seed(20, 1, 'Требует внимания')
    .seed(21, 1, 'Уровень');
  metadataCell
    .setValue('legacy-value')
    .setFormula('=SUM(100; 23)')
    .setRichTextValue(new FakeRichText('https://example.test/legacy-rich-link'))
    .setNote('legacy-note')
    .setBackground('#FFCC00')
    .setNumberFormat('#,##0.00 ₽')
    .setDataValidation(validation);
  constructor.formatting.set('15:2', { fontWeight: 'bold', wrap: true });

  harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const destination = constructor.getRange('B18');
  const source = constructor.getRange('B15');

  assert.strictEqual(destination.getValue(), 'legacy-value');
  assert.strictEqual(destination.getFormula(), '=SUM(100; 23)');
  assert.strictEqual(destination.getRichTextValues()[0][0].getLinkUrl(), 'https://example.test/legacy-rich-link');
  assert.strictEqual(destination.getNote(), 'legacy-note');
  assert.strictEqual(destination.getBackground(), '#FFCC00');
  assert.strictEqual(destination.getNumberFormat(), '#,##0.00 ₽');
  assert.deepStrictEqual(destination.getDataValidation(), validation);
  assert.deepStrictEqual(constructor.formatting.get('18:2'), { fontWeight: 'bold', wrap: true });
  assert.strictEqual(source.getValue(), '');
  assert.strictEqual(source.getFormula(), '');
  assert.strictEqual(source.getRichTextValues()[0][0].getLinkUrl(), '');
  assert.strictEqual(source.getNote(), '');
  assert.strictEqual(source.getBackground(), '');
  assert.strictEqual(source.getNumberFormat(), '');
  assert.strictEqual(source.getDataValidation(), null);
  assert.strictEqual(constructor.formatting.has('15:2'), false);
}

{
  const harness = createHarness(['Конструктор', 'Анкета и требования']);
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  const questionnaire = harness.spreadsheet.getSheetByName('Анкета и требования');
  const intakeLayout = harness.context.getClaimIntakeLayout_();
  const legacyDocUrl = 'https://docs.google.com/document/d/preflight-full-history-legacy/edit';
  const currentDocUrl = 'https://docs.google.com/document/d/preflight-full-history-current/edit';
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, legacyDocUrl)
    .seed(9, 1, 'Расписанный расчет:')
    .seed(9, 2, currentDocUrl)
    .seed(10, 1, 'Прогресс:')
    .seed(10, 2, 'legacy-progress')
    .seed(14, 1, 'Итоги расчета')
    .seed(15, 2, 777)
    .seed(20, 1, 'Требует внимания')
    .seed(21, 1, 'Уровень')
    .seed(22, 1, 'legacy-issue');
  constructor.getRange('B15').setFormula('=777').setNote('do-not-move').setBackground('#ABCDEF');
  questionnaire
    .getRange(intakeLayout.docsHistory.firstRow, 1, intakeLayout.docsHistory.rowCount, 3)
    .setValues(Array.from({ length: intakeLayout.docsHistory.rowCount }, (_, index) => [
      `date-${index}`, `https://docs.google.com/document/d/preflight-existing-${index}/edit`, 'existing',
    ]));
  const snapshot = () => JSON.stringify(constructor.getStateStores().map((store) => Array.from(store.entries())));
  const before = snapshot();

  assert.throws(
    () => harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet),
    /Не удалось сохранить прежнюю ссылку Google Doc в истории/
  );

  assert.strictEqual(snapshot(), before);
}

{
  const harness = createHarness(['Конструктор']);
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, 'https://docs.google.com/document/d/lock-recheck-legacy/edit')
    .seed(9, 1, 'Статус:')
    .seed(9, 2, 'legacy-phase');
  harness.documentLock.onTryLock = () => constructor.seed(6, 1, 'Нормативные документы');

  const migrated = harness.context.migrateLegacyClaimConstructorLayout_(
    harness.spreadsheet,
    constructor,
    harness.context.getClaimConstructorLayout_()
  );

  assert.strictEqual(migrated, false);
  assert.strictEqual(constructor.getRange('A9').getValue(), 'Статус:');
  assert.strictEqual(constructor.getRange('B9').getValue(), 'legacy-phase');
  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
  assert.strictEqual(harness.documentLock.flushes, 1);
}

{
  const harness = createHarness(['Конструктор']);
  const constructor = harness.spreadsheet.getSheetByName('Конструктор');
  constructor
    .seed(6, 1, 'Расписанный расчет:')
    .seed(6, 2, 'https://docs.google.com/document/d/flush-error-legacy/edit')
    .seed(9, 1, 'Статус:');
  harness.documentLock.flushError = new Error('flush failed');

  assert.throws(
    () => harness.context.migrateLegacyClaimConstructorLayout_(
      harness.spreadsheet,
      constructor,
      harness.context.getClaimConstructorLayout_()
    ),
    /flush failed/
  );
  assert.strictEqual(harness.documentLock.released, 1);
}

{
  const harness = createHarness();
  harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimConstructorLayout_();
  const intakeLayout = harness.context.getClaimIntakeLayout_();
  const namedRanges = new Set(harness.spreadsheet.getNamedRanges().map((item) => item.getName()));

  [
    layout.sourceFolder.namedRange,
    layout.normativeFolder.namedRange,
    layout.outputDoc.namedRange,
    intakeLayout.employerSector.namedRange,
    intakeLayout.calculatedAverage.namedRange,
    intakeLayout.calculatedAverageContext.namedRange,
    intakeLayout.manualAverageEnabled.namedRange,
    intakeLayout.manualAverage.namedRange,
    intakeLayout.manualAverageContext.namedRange,
    intakeLayout.manualAverageSource.namedRange,
    intakeLayout.finalAverageScenario.namedRange,
    intakeLayout.partialRecoveries.namedRange,
    intakeLayout.claimSelections.namedRange,
    intakeLayout.docsHistory.namedRange,
  ].forEach((name) => assert.ok(namedRanges.has(name), `${name} must be registered`));

  assert.deepStrictEqual(
    Array.from(harness.context.getClaimIntakeSettings_().NORMAL_SHEET_NAMES),
    ['Конструктор', 'Анкета и требования']
  );
  assert.deepStrictEqual(
    Array.from(harness.context.getClaimIntakeSettings_().SECTOR_VALUES),
    ['Частная организация', 'Бюджетный сектор / публичный должник', 'Неизвестно']
  );
}

{
  const harness = createHarness();
  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const intakeLayout = harness.context.getClaimIntakeLayout_();
  const recoveryRange = workspace.questionnaire.getRange(
    intakeLayout.partialRecoveries.firstRow,
    1,
    intakeLayout.partialRecoveries.rowCount,
    intakeLayout.partialRecoveries.columnCount
  );
  const highlighted = Array.from(
    { length: intakeLayout.partialRecoveries.rowCount },
    (_, index) => Array(intakeLayout.partialRecoveries.columnCount).fill(index === 1 ? '#F4CCCC' : '#FFFFFF')
  );
  recoveryRange.setBackgrounds(highlighted);

  harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);

  assert.deepStrictEqual(recoveryRange.getBackgrounds(), highlighted);
}

{
  const harness = createHarness(['Оклад', 'Ежемесячные']);
  const layout = harness.context.getClaimConstructorLayout_();
  const created = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);

  assert.strictEqual(created.getName(), 'Конструктор');
  assert.strictEqual(harness.spreadsheet.getSheets()[0].getName(), 'Конструктор');
  assert.strictEqual(created.getRange(layout.sourceFolder.labelCell).getValue(), 'Расчетные листы:');
  assert.strictEqual(created.getRange(layout.outputDoc.labelCell).getValue(), 'Расписанный расчет:');
  assert.strictEqual(
    harness.spreadsheet.getRangeByName(layout.sourceFolder.namedRange).getValue(),
    ''
  );

  created.getRange(layout.sourceFolder.valueCell).setValue('https://drive.google.com/drive/folders/preserved-folder');
  created.getRange(layout.outputDoc.valueCell).setValue('https://docs.google.com/document/d/preserved-doc/edit');
  created.getRange(layout.status.messageCell).setValue('Сохраненный статус');
  created.getRange(layout.issuesHeaderRow + 2, 1).setValue('Сохраненное замечание');
  const originalId = created.getSheetId();
  const originalOrder = harness.spreadsheet.getSheets().map((sheet) => sheet.getSheetId());

  const reopened = harness.context.ensureClaimConstructorSheet_(harness.spreadsheet);

  assert.strictEqual(reopened.getSheetId(), originalId);
  assert.deepStrictEqual(harness.spreadsheet.getSheets().map((sheet) => sheet.getSheetId()), originalOrder);
  assert.strictEqual(reopened.getRange(layout.sourceFolder.valueCell).getValue(), 'https://drive.google.com/drive/folders/preserved-folder');
  assert.strictEqual(reopened.getRange(layout.outputDoc.valueCell).getValue(), 'https://docs.google.com/document/d/preserved-doc/edit');
  assert.strictEqual(reopened.getRange(layout.status.messageCell).getValue(), 'Сохраненный статус');
  assert.strictEqual(reopened.getRange(layout.issuesHeaderRow + 2, 1).getValue(), 'Сохраненное замечание');
}

{
  const harness = createHarness(['Оклад']);
  const legacy = harness.spreadsheet.getSheetByName('Оклад');
  legacy
    .seed(1, 1, 'Расчетные листы:')
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
    .seed(1, 1, 'Расчетные листы:')
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
    .seed(1, 1, 'Расчетные листы:')
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
  assert.strictEqual(harness.spreadsheet.getSheets().length, 4);
  assert.ok(harness.spreadsheet.getSheetByName('Анкета и требования'));
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
  assert.strictEqual(sheet.getRange(layout.status.updatedAtCell).getValue(), '11.07.2026 12:05');

  run.phase = 'importing';
  run.progress = { processed: 3, total: 31 };
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /3 из 31/);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /10%/);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /[█░]/);

  run.phase = 'reconstructing';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(
    sheet.getRange(layout.status.phaseCell).getValue(),
    'Импорт завершен. Реконструкция начислений и выплат'
  );
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /70%/);
  assert.match(sheet.getRange(layout.status.messageCell).getValue(), /[█░]/);

  run.status = 'complete';
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Готово');

  run.status = 'complete_with_warnings';
  run.completedAt = '2026-07-11T09:06:00.000Z';
  run.issues = [{}, {}];
  harness.context.writeClaimConstructorStatus_(sheet, run);
  assert.strictEqual(sheet.getRange(layout.status.phaseCell).getValue(), 'Готово с замечаниями');
  assert.strictEqual(sheet.getRange(layout.status.completedAtCell).getValue(), '11.07.2026 12:06');
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
  assert.strictEqual(sheet.getRange('A22').getValue(), '');
  assert.strictEqual(sheet.getRange('A23').getValue(), 'Требует внимания');
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
    'Анкета и требования',
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
  assert.strictEqual(classify('Анкета и требования'), 'questionnaire');
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
    'Конструктор', 'Анкета и требования', 'Оклад', 'Ежемесячные', 'Ежеквартальные', 'Ежегодные', 'Отпуска и расчет',
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
  assert.ok(harness.spreadsheet.getSheets().filter((sheet) => !['Конструктор', 'Анкета и требования'].includes(sheet.getName())).every((sheet) => sheet.isSheetHidden()));
  assert.strictEqual(harness.spreadsheet.getSheetByName('Анкета и требования').isSheetHidden(), false);

  harness.context.applyClaimConstructorVisibilityMode_('detail', harness.spreadsheet);
  names.forEach((name) => {
    const shouldBeVisible = ['Конструктор', 'Анкета и требования'].includes(name) || [
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

{
  const harness = createHarness();
  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const sheet = workspace.questionnaire;

  assert.deepStrictEqual(
    Array.from(sheet.getRange(layout.employerSector.valueCell).getDataValidation().values),
    ['Частная организация', 'Бюджетный сектор / публичный должник', 'Неизвестно']
  );
  assert.deepStrictEqual(
    Array.from(sheet.getRange(layout.finalAverageScenario.valueCell).getDataValidation().values),
    ['Рассчитанный системой', 'Заданный вручную']
  );
  assert.strictEqual(
    sheet.getRange(layout.finalAverageScenario.valueCell).getValue(),
    'Рассчитанный системой'
  );
  assert.strictEqual(sheet.getRange(layout.manualAverageEnabled.labelCell).getValue(), 'Задать вручную средний заработок');
  assert.strictEqual(sheet.getRange(layout.calculatedAverageBadge.valueCell).getValue(), 'рассчитано');
  assert.strictEqual(sheet.getRange(layout.manualAverageSource.valueCell).getValue(), 'источник: пользователь');
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.actionCell).getValue(), 'Добавить');
  assert.strictEqual(layout.partialRecoveries.actionControlCell, 'C12');
  assert.strictEqual(
    sheet.getRange(layout.partialRecoveries.actionControlCell).getDataValidation().type,
    'checkbox'
  );
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.actionControlCell).getValue(), false);
  assert.ok(!sheet.getDataRange().getDisplayValues().flat().includes('Бюджетный сектор / Не знаю'));
  assert.ok(!sheet.getDataRange().getDisplayValues().flat().includes('выберите сценарий'));
  assert.ok(!sheet.getDataRange().getDisplayValues().flat().includes('Пересчитать оба сценария'));
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  harness.context.writeAverageEarningsState_({
    calculated: { amount: 4321.5, context: '01.01.2025–31.12.2025' },
    user: { amount: 5000, context: 'с 01.02.2026' },
    selectedSource: 'user',
  }, harness.spreadsheet);

  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(harness.context.readAverageEarningsState_(harness.spreadsheet))),
    {
      calculated: { amount: 4321.5, context: '01.01.2025–31.12.2025' },
      user: { amount: 5000, context: 'с 01.02.2026' },
      selectedSource: 'user',
    }
  );
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(harness.context.resolveSelectedAverageEarnings_(
      harness.context.readAverageEarningsState_(harness.spreadsheet)
    ))),
    { source: 'user', amount: 5000, context: 'с 01.02.2026' }
  );

  sheet.getRange(layout.manualAverage.valueCell).setValue(0);
  const rejected = harness.context.resolveSelectedAverageEarnings_(
    harness.context.readAverageEarningsState_(harness.spreadsheet)
  );
  assert.strictEqual(rejected.valid, false);
  assert.strictEqual(rejected.source, 'user');
  assert.strictEqual(rejected.error, 'Укажите положительный средний заработок для выбранного сценария');
  assert.strictEqual(sheet.getRange(layout.calculatedAverage.valueCell).getValue(), 4321.5);
  assert.strictEqual(sheet.getRange(layout.calculatedAverageContext.valueCell).getValue(), '01.01.2025–31.12.2025');
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(harness.context.resolveSelectedAverageEarnings_({
      calculated: { amount: 4321.5, context: '2025 год' },
      user: { amount: 0, context: 'ошибочное ручное значение' },
      selectedSource: 'calculated',
    }))),
    { source: 'calculated', amount: 4321.5, context: '2025 год' }
  );
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(harness.context.resolveSelectedAverageEarnings_({
      calculated: { amount: 4321.5, context: '2025 год' },
      user: { amount: 5000, context: '2026 год' },
      selectedSource: 'bogus',
    }))),
    {
      valid: false,
      source: 'bogus',
      amount: null,
      context: '',
      error: 'Неизвестный источник среднего заработка',
    }
  );

  const averageCells = [
    layout.calculatedAverage.valueCell,
    layout.calculatedAverageContext.valueCell,
    layout.manualAverage.valueCell,
    layout.manualAverageContext.valueCell,
    layout.finalAverageScenario.valueCell,
  ];
  const beforeInvalidWrite = averageCells.map((cell) => sheet.getRange(cell).getValue());
  assert.throws(() => harness.context.writeAverageEarningsState_({
    calculated: { amount: 9999, context: 'измененный расчетный контекст' },
    user: { amount: 8888, context: 'измененный ручной контекст' },
    selectedSource: 'bogus',
  }, harness.spreadsheet), /Неизвестный источник среднего заработка/);
  assert.deepStrictEqual(
    averageCells.map((cell) => sheet.getRange(cell).getValue()),
    beforeInvalidWrite,
    'Ошибочный selector не должен частично записывать сценарии'
  );
}

{
  const harness = createHarness();
  harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Неизвестно',
    averageEarnings: {
      calculated: { amount: 3200, context: '2025 год' },
      user: { amount: 3500, context: 'с 01.03.2026' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [
      [true, '10.01.2026', 1000, 'salary:2025-12'],
      [true, '11.02.2026', 250, ''],
    ],
  }, harness.spreadsheet);

  harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const reopened = harness.context.captureClaimQuestionnaireState_(harness.spreadsheet);

  assert.strictEqual(reopened.employerSector, 'Неизвестно');
  assert.strictEqual(reopened.averageEarnings.calculated.amount, 3200);
  assert.strictEqual(reopened.averageEarnings.user.amount, 3500);
  assert.strictEqual(reopened.averageEarnings.selectedSource, 'calculated');
  assert.deepStrictEqual(Array.from(reopened.partialRecoveries[0]), [true, '10.01.2026', 1000, 'salary:2025-12']);
  assert.deepStrictEqual(Array.from(reopened.partialRecoveries[1]), [true, '11.02.2026', 250, '']);
  assert.strictEqual(
    harness.context.resolveSelectedAverageEarnings_(reopened.averageEarnings).amount,
    3200,
    'Неизвестный сектор не должен блокировать разрешение среднего заработка'
  );
  assert.strictEqual(harness.scriptProperties.values.size, 0);
}

{
  const harness = createHarness();
  const normalized = harness.context.normalizePartialRecoveries_([
    [true, '10.01.2026', '1 250,50', 'salary:2025-12'],
    [true, '2026-02-11', 300, ''],
    [true, '31.02.2026', 100, 'salary:2026-01'],
    [true, '12.03.2026', 0, 'salary:2026-02'],
    [true, '13.03.2026', '-20', 'salary:2026-02'],
    [true, '14.03.2026', '1,2,3', 'salary:2026-02'],
    [false, '', '', ''],
  ]);

  assert.strictEqual(normalized.valid.length, 1);
  assert.strictEqual(normalized.valid[0].amount, 1250.5);
  assert.strictEqual(normalized.valid[0].allocation, 'salary:2025-12');
  assert.strictEqual(normalized.unallocated.length, 1);
  assert.strictEqual(normalized.unallocated[0].amount, 300);
  assert.strictEqual(normalized.unallocated[0].disputed, true);
  assert.deepStrictEqual(Array.from(normalized.invalid).map((item) => item.rowIndex), [2, 3, 4, 5]);

  const unchecked = harness.context.normalizePartialRecoveries_([
    [false, '31.02.2026', -100, 'claim:unchecked'],
    [false, '10.01.2026', 100, 'claim:unchecked-valid'],
  ]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(unchecked)), {
    valid: [],
    invalid: [],
    unallocated: [],
  });
}

{
  const harness = createHarness();
  const workspace = harness.context.ensureClaimConstructorWorkspace_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const sheet = workspace.questionnaire;
  sheet.getRange(layout.partialRecoveries.firstRow, 2, 1, 3)
    .setValues([['10.01.2026', 100, 'salary:2025-12']]);

  const first = harness.context.addClaimPartialRecovery();
  const second = harness.context.addClaimPartialRecovery();

  assert.strictEqual(first.added, true);
  assert.strictEqual(first.row, layout.partialRecoveries.firstRow + 1);
  assert.strictEqual(second.row, layout.partialRecoveries.firstRow + 2);
  assert.strictEqual(harness.documentLock.acquired, 2);
  assert.strictEqual(harness.documentLock.released, 2);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 2).getValue(), '10.01.2026');
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.firstRow + 1, 1).getValue(), true);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.firstRow + 2, 1).getValue(), true);

  sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 4)
    .setValues(Array.from({ length: layout.partialRecoveries.rowCount }, (_, index) => [
      true, `01.01.202${index}`, 1, `claim:${index}`,
    ]));
  const full = harness.context.addClaimPartialRecovery();
  assert.strictEqual(full.added, false);
  assert.strictEqual(full.error, 'Нет свободных строк для частичных погашений');
  assert.strictEqual(harness.spreadsheet.toasts.at(-1).message, full.error);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const control = sheet.getRange(layout.partialRecoveries.actionControlCell).setValue(true);

  assert.strictEqual(typeof harness.context.onEdit, 'function');
  harness.context.onEdit({ range: control, value: 'TRUE' });

  assert.strictEqual(control.getValue(), false);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 1).getValue(), true);

  sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 4)
    .setValues(Array.from({ length: layout.partialRecoveries.rowCount }, (_, index) => [
      true, `01.01.202${index}`, 1, `claim:${index}`,
    ]));
  control.setValue(true);
  harness.context.onEdit({ range: control, value: 'TRUE' });

  assert.strictEqual(control.getValue(), false);
  assert.strictEqual(
    harness.spreadsheet.toasts.at(-1).message,
    'Нет свободных строк для частичных погашений'
  );
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const control = sheet.getRange(layout.partialRecoveries.actionControlCell).setValue(true);
  const result = harness.context.onEdit({
    range: control,
    source: harness.spreadsheet,
    value: 'FALSE',
  });
  assert.strictEqual(result.handled, false);
  assert.strictEqual(control.getValue(), false);
  assert.notStrictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 1).getValue(), true);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const firstRow = layout.partialRecoveries.firstRow;
  sheet.getRange(firstRow, 1, 3, 4).setValues([
    [true, '31.02.2026', 100, 'claim:a'],
    [true, '10.02.2026', 200, ''],
    [true, '31.02.2026', 300, 'claim:c'],
  ]);
  sheet.getRange(firstRow, 1).setBackground('#D9EAD3').setNote('Проверить платежное поручение');

  harness.context.onEdit({ range: sheet.getRange(firstRow, 2), value: '31.02.2026' });

  assert.strictEqual(sheet.getRange(firstRow, 1).getBackground(), '#F4CCCC');
  assert.ok(sheet.getRange(firstRow, 4).getNote().includes('Некорректная дата'));
  assert.strictEqual(sheet.getRange(firstRow + 1, 1).getBackground(), '#FFF2CC');
  assert.ok(sheet.getRange(firstRow + 1, 4).getNote().includes('спорным'));

  sheet.getRange(firstRow, 2).setValue('09.02.2026');
  harness.context.onEdit({ range: sheet.getRange(firstRow, 2), value: '09.02.2026' });

  assert.strictEqual(sheet.getRange(firstRow, 1).getBackground(), '#D9EAD3');
  assert.strictEqual(sheet.getRange(firstRow, 1).getNote(), 'Проверить платежное поручение');
  assert.strictEqual(sheet.getRange(firstRow, 4).getNote(), '');

  const untouchedBackground = sheet.getRange(firstRow + 2, 1).getBackground();
  const untouchedNote = sheet.getRange(firstRow + 2, 4).getNote();
  sheet.getRange(layout.employerSector.valueCell).setValue('Неизвестно');
  harness.context.onEdit({
    range: sheet.getRange(layout.employerSector.valueCell),
    value: 'Неизвестно',
  });
  assert.strictEqual(sheet.getRange(firstRow + 2, 1).getBackground(), untouchedBackground);
  assert.strictEqual(sheet.getRange(firstRow + 2, 4).getNote(), untouchedNote);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const row = layout.partialRecoveries.firstRow;
  sheet.getRange(row, 1, 1, 4).setValues([[true, '31.02.2026', 100, 'claim:a']]);
  sheet.getRange(row, 1).setBackground('#D9EAD3').setNote('Пользовательская заметка');
  harness.context.onEdit({ range: sheet.getRange(row, 2), value: '31.02.2026' });
  assert.strictEqual(sheet.getRange(row, 1).getBackground(), '#F4CCCC');

  sheet.getRange(row, 1).setValue(false);
  const uncheckedResult = harness.context.onEdit({
    range: sheet.getRange(row, 1),
    value: 'FALSE',
  });

  assert.strictEqual(uncheckedResult.handled, true);
  assert.strictEqual(uncheckedResult.result.invalid.length, 0);
  assert.strictEqual(sheet.getRange(row, 1).getBackground(), '#D9EAD3');
  assert.strictEqual(sheet.getRange(row, 1).getNote(), 'Пользовательская заметка');
  assert.strictEqual(sheet.getRange(row, 4).getNote(), '');

  sheet.getRange(row, 1).setValue(true);
  const checkedResult = harness.context.onEdit({
    range: sheet.getRange(row, 1),
    value: 'TRUE',
  });

  assert.strictEqual(checkedResult.result.invalid.length, 1);
  assert.strictEqual(sheet.getRange(row, 1).getBackground(), '#F4CCCC');
  assert.ok(sheet.getRange(row, 4).getNote().includes('Некорректная дата'));
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const firstRow = layout.partialRecoveries.firstRow;
  sheet.getRange(firstRow, 1, 3, 4).setValues([
    [true, '31.02.2026', 100, 'claim:a'],
    [true, '10.02.2026', 200, ''],
    [true, '11.02.2026', 300, 'claim:b'],
  ]);
  sheet.getRange(firstRow, 1).setBackground('#D9EAD3').setNote('Проверить платежное поручение');
  sheet.getRange(firstRow + 2, 3).setBackground('#CFE2F3').setNote('Пользовательская заметка');

  const result = harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);

  assert.strictEqual(result.invalid.length, 1);
  assert.strictEqual(result.unallocated.length, 1);
  assert.strictEqual(result.valid.length, 1);
  assert.strictEqual(sheet.getRange(firstRow, 1).getBackground(), '#F4CCCC');
  assert.ok(sheet.getRange(firstRow, 4).getNote().includes('Некорректная дата частичного погашения'));
  assert.strictEqual(sheet.getRange(firstRow + 1, 1).getBackground(), '#FFF2CC');
  assert.ok(sheet.getRange(firstRow + 1, 4).getNote().includes('распределение будет уточнено'));
  assert.strictEqual(sheet.getRange(firstRow + 2, 3).getBackground(), '#CFE2F3');
  assert.strictEqual(sheet.getRange(firstRow + 2, 3).getNote(), 'Пользовательская заметка');

  sheet.getRange(firstRow, 2).setValue('09.02.2026');
  sheet.getRange(firstRow + 1, 4).setValue('claim:c');
  harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);

  assert.strictEqual(sheet.getRange(firstRow, 1).getBackground(), '#D9EAD3');
  assert.strictEqual(sheet.getRange(firstRow, 1).getNote(), 'Проверить платежное поручение');
  assert.strictEqual(sheet.getRange(firstRow, 4).getNote(), '');
  assert.strictEqual(sheet.getRange(firstRow + 1, 1).getBackground(), '#FFFFFF');
  assert.strictEqual(sheet.getRange(firstRow + 1, 4).getNote(), '');
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Неизвестно',
    manualAverageEnabled: false,
    averageEarnings: {
      calculated: { amount: 3200, context: '2025 год' },
      user: { amount: 3500, context: '2026 год' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [[true, '10.01.2026', 100, 'claim:initial']],
  }, harness.spreadsheet);
  const questionnaireCells = [
    layout.employerSector.valueCell,
    layout.manualAverageEnabled.valueCell,
    layout.calculatedAverage.valueCell,
    layout.calculatedAverageContext.valueCell,
    layout.manualAverage.valueCell,
    layout.manualAverageContext.valueCell,
    layout.finalAverageScenario.valueCell,
  ];
  const snapshot = () => JSON.stringify({
    fields: questionnaireCells.map((cell) => sheet.getRange(cell).getValue()),
    recoveries: sheet.getRange(
      layout.partialRecoveries.firstRow,
      1,
      layout.partialRecoveries.rowCount,
      4
    ).getValues(),
  });
  const before = snapshot();

  assert.throws(() => harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Несуществующий сектор',
    averageEarnings: {
      calculated: { amount: 9999, context: 'изменено' },
      user: { amount: 8888, context: 'изменено' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [[true, '11.01.2026', 200, 'claim:changed']],
  }, harness.spreadsheet), /Неизвестный сектор работодателя/);
  assert.strictEqual(snapshot(), before);

  assert.throws(() => harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Частная организация',
    averageEarnings: {
      calculated: { amount: 9999, context: 'изменено' },
      user: { amount: 8888, context: 'изменено' },
      selectedSource: 'bogus',
    },
  }, harness.spreadsheet), /Неизвестный источник среднего заработка/);
  assert.strictEqual(snapshot(), before);

  assert.throws(() => harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Частная организация',
    averageEarnings: {
      calculated: { amount: 0, context: 'изменено' },
      user: { amount: 8888, context: 'изменено' },
      selectedSource: 'calculated',
    },
  }, harness.spreadsheet), /положительный средний заработок/);
  assert.strictEqual(snapshot(), before);

  assert.throws(() => harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Частная организация',
    averageEarnings: {
      calculated: { amount: 9999, context: 'изменено' },
      user: { amount: 8888, context: 'изменено' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [{ active: true, date: '11.01.2026', amount: 200 }],
  }, harness.spreadsheet), /строка частичного погашения/);
  assert.strictEqual(snapshot(), before);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Неизвестно',
    manualAverageEnabled: false,
    averageEarnings: {
      calculated: { amount: 3200, context: '2025 год' },
      user: { amount: 3500, context: '2026 год' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [[true, '10.01.2026', 100, 'claim:initial']],
  }, harness.spreadsheet);
  const before = JSON.stringify(sheet.getDataRange().getValues());
  harness.documentLock.acquired = 0;
  harness.documentLock.released = 0;
  harness.documentLock.flushes = 0;
  harness.spreadsheet.failWriteAt = harness.spreadsheet.writeAttempts + 2;

  assert.throws(() => harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Частная организация',
    manualAverageEnabled: true,
    averageEarnings: {
      calculated: { amount: 9999, context: 'changed calculated' },
      user: { amount: 8888, context: 'changed user' },
      selectedSource: 'user',
    },
    partialRecoveries: [[true, '11.01.2026', 200, 'claim:changed']],
  }, harness.spreadsheet), /injected sheet write failure/);

  assert.strictEqual(JSON.stringify(sheet.getDataRange().getValues()), before);
  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
  assert.strictEqual(harness.documentLock.flushes, 1);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Неизвестно',
    manualAverageEnabled: false,
    averageEarnings: {
      calculated: { amount: 3200, context: '2025 год' },
      user: { amount: 3500, context: '2026 год' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [[true, '10.01.2026', 100, 'claim:initial']],
  }, harness.spreadsheet);
  const before = JSON.stringify(sheet.getDataRange().getValues());
  harness.documentLock.flushError = new Error('injected questionnaire flush failure');

  assert.throws(() => harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Частная организация',
    manualAverageEnabled: true,
    averageEarnings: {
      calculated: { amount: 9999, context: 'changed calculated' },
      user: { amount: 8888, context: 'changed user' },
      selectedSource: 'user',
    },
    partialRecoveries: [[true, '11.01.2026', 200, 'claim:changed']],
  }, harness.spreadsheet), /injected questionnaire flush failure/);

  assert.strictEqual(JSON.stringify(sheet.getDataRange().getValues()), before);
  assert.strictEqual(harness.documentLock.released, 2);
}

{
  const harness = createHarness();
  harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Неизвестно',
    manualAverageEnabled: true,
    averageEarnings: {
      calculated: { amount: 3200, context: '2025 год' },
      user: { amount: 3500, context: '2026 год' },
      selectedSource: 'user',
    },
  }, harness.spreadsheet);
  const captured = harness.context.captureClaimQuestionnaireState_(harness.spreadsheet);
  assert.strictEqual(captured.manualAverageEnabled, true);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const actionRow = sheet.getRange(12, 2, 1, 2).setValues([['Добавить', true]]);
  const result = harness.context.onEdit({
    range: actionRow,
    source: harness.spreadsheet,
    value: 'TRUE',
  });
  assert.strictEqual(result.handled, true);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.actionControlCell).getValue(), false);
  assert.notStrictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 1).getValue(), true);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const actionPaste = sheet.getRange(12, 3, 1, 2).setValues([[true, 'pasted']]);
  const result = harness.context.onEdit({ range: actionPaste, source: harness.spreadsheet });
  assert.strictEqual(result.handled, true);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.actionControlCell).getValue(), false);
  assert.notStrictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 1).getValue(), true);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const firstRow = layout.partialRecoveries.firstRow;
  sheet.getRange(firstRow, 1, 1, 4).setValues([[true, '31.02.2026', 100, 'claim:a']]);
  const mixedPaste = sheet.getRange(12, 3, 3, 2);
  sheet.getRange(layout.partialRecoveries.actionControlCell).setValue(true);
  const result = harness.context.onEdit({ range: mixedPaste, source: harness.spreadsheet });
  assert.strictEqual(result.handled, true);
  assert.strictEqual(result.type, 'validate_partial_recoveries');
  assert.strictEqual(result.result.invalid.length, 1);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.actionControlCell).getValue(), false);
  assert.notStrictEqual(sheet.getRange(firstRow + 1, 1).getValue(), true);
}

{
  const harness = createHarness();
  const eventSpreadsheet = new FakeSpreadsheet(['Анкета и требования']);
  const sheet = harness.context.ensureClaimIntakeSheet_(eventSpreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const control = sheet.getRange(layout.partialRecoveries.actionControlCell).setValue(true);
  const result = harness.context.onEdit({ range: control, source: eventSpreadsheet, value: 'TRUE' });
  assert.strictEqual(result.result.row, layout.partialRecoveries.firstRow);
  assert.strictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 1).getValue(), true);
  assert.strictEqual(harness.spreadsheet.getSheetByName(layout.sheetName), null);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const control = sheet.getRange(layout.partialRecoveries.actionControlCell).setValue(true);
  harness.documentLock.onTryLock = () => {
    sheet.getRange(layout.partialRecoveries.firstRow, 1).setValue(true);
    harness.documentLock.onTryLock = null;
  };
  harness.spreadsheet.serviceCalls = { writes: 0, namedRangeSets: 0 };
  harness.documentLock.acquired = 0;
  harness.documentLock.released = 0;
  const result = harness.context.onEdit({
    range: control,
    source: harness.spreadsheet,
    value: 'TRUE',
  });
  assert.strictEqual(result.result.row, layout.partialRecoveries.firstRow + 1);
  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
  assert.strictEqual(harness.spreadsheet.serviceCalls.namedRangeSets, 0);
  assert.ok(harness.spreadsheet.serviceCalls.valueWrites <= 3);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const control = sheet.getRange(layout.partialRecoveries.actionControlCell).setValue(true);
  harness.documentLock.onTryLock = () => {
    control.setValue(false);
    harness.documentLock.onTryLock = null;
  };
  const result = harness.context.onEdit({
    range: control,
    source: harness.spreadsheet,
    value: 'TRUE',
  });
  assert.strictEqual(result.handled, false);
  assert.notStrictEqual(sheet.getRange(layout.partialRecoveries.firstRow, 1).getValue(), true);
  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  sheet.getRange(layout.partialRecoveries.firstRow, 1, 1, 4)
    .setValues([[true, '31.02.2026', 100, 'claim:a']]);
  harness.documentLock.acquired = 0;
  harness.documentLock.released = 0;
  harness.documentProperties.getPropertyCalls = 0;
  harness.documentProperties.getPropertiesCalls = 0;

  harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);

  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
  assert.strictEqual(harness.documentProperties.getPropertiesCalls, 1);
  assert.strictEqual(harness.documentProperties.getPropertyCalls, 0);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  harness.context.writeClaimQuestionnaireState_({
    employerSector: 'Неизвестно',
    manualAverageEnabled: false,
    averageEarnings: {
      calculated: { amount: 3200, context: '2025 год' },
      user: { amount: 3500, context: '2026 год' },
      selectedSource: 'calculated',
    },
    partialRecoveries: [[true, '10.01.2026', 100, 'claim:initial']],
  }, harness.spreadsheet);
  const before = JSON.stringify(sheet.getDataRange().getValues());
  harness.documentLock.acquired = 0;
  harness.documentLock.released = 0;
  harness.spreadsheet.failWriteAt = harness.spreadsheet.writeAttempts + 2;

  assert.throws(() => harness.context.writeAverageEarningsState_({
    calculated: { amount: 9999, context: 'changed calculated' },
    user: { amount: 8888, context: 'changed user' },
    selectedSource: 'user',
  }, harness.spreadsheet), /injected sheet write failure/);

  assert.strictEqual(JSON.stringify(sheet.getDataRange().getValues()), before);
  assert.strictEqual(harness.documentLock.acquired, 1);
  assert.strictEqual(harness.documentLock.released, 1);
}

[
  {
    name: 'background',
    inject(harness) { harness.spreadsheet.failAfterWriteKind = 'background'; },
    error: /injected background write failure/,
  },
  {
    name: 'note',
    inject(harness) { harness.spreadsheet.failAfterWriteKind = 'note'; },
    error: /injected note write failure/,
  },
  {
    name: 'properties',
    inject(harness) { harness.documentProperties.failSetPropertiesOnce = true; },
    error: /injected property set failure/,
  },
].forEach((scenario) => {
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const row = layout.partialRecoveries.firstRow;
  const rowRange = sheet.getRange(row, 1, 1, 4);
  rowRange.setValues([[true, '31.02.2026', 100, 'claim:a']]);
  sheet.getRange(row, 1).setBackground('#D9EAD3');
  sheet.getRange(row, 4).setNote('Пользовательская заметка');
  const beforeBackgrounds = rowRange.getBackgrounds();
  const beforeNote = sheet.getRange(row, 4).getNote();
  const beforeProperties = JSON.stringify(Array.from(harness.documentProperties.values.entries()));
  scenario.inject(harness);
  const acquiredBefore = harness.documentLock.acquired;
  const releasedBefore = harness.documentLock.released;

  assert.throws(
    () => harness.context.validateClaimPartialRecoveries_(harness.spreadsheet),
    scenario.error,
    `${scenario.name}: validation must surface the service failure`
  );
  assert.deepStrictEqual(rowRange.getBackgrounds(), beforeBackgrounds, `${scenario.name}: backgrounds rollback`);
  assert.strictEqual(sheet.getRange(row, 4).getNote(), beforeNote, `${scenario.name}: note rollback`);
  assert.strictEqual(
    JSON.stringify(Array.from(harness.documentProperties.values.entries())),
    beforeProperties,
    `${scenario.name}: ownership rollback`
  );
  assert.strictEqual(harness.documentLock.acquired, acquiredBefore + 1);
  assert.strictEqual(harness.documentLock.released, releasedBefore + 1);

  harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);
  assert.strictEqual(sheet.getRange(row, 1).getBackground(), '#F4CCCC');
  assert.ok(sheet.getRange(row, 4).getNote().includes('Некорректная дата'));
  sheet.getRange(row, 2).setValue('09.02.2026');
  harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);
  assert.strictEqual(sheet.getRange(row, 1).getBackground(), '#D9EAD3');
  assert.strictEqual(sheet.getRange(row, 4).getNote(), 'Пользовательская заметка');
  assert.strictEqual(
    Array.from(harness.documentProperties.values.keys())
      .filter((key) => key.includes(`_${sheet.getSheetId()}_${row}`)).length,
    0,
    `${scenario.name}: corrected row must not retain ownership`
  );
});

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  const row = layout.partialRecoveries.firstRow;
  const rowRange = sheet.getRange(row, 1, 1, 4);
  rowRange.setValues([[true, '31.02.2026', 100, 'claim:a']]);
  sheet.getRange(row, 1).setBackground('#D9EAD3');
  sheet.getRange(row, 4).setNote('Пользовательская заметка');
  harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);
  const validatorBackgrounds = rowRange.getBackgrounds();
  const validatorNote = sheet.getRange(row, 4).getNote();
  const validatorProperties = JSON.stringify(Array.from(harness.documentProperties.values.entries()));
  sheet.getRange(row, 2).setValue('09.02.2026');
  harness.documentProperties.failDeletePropertyOnce = true;

  assert.throws(
    () => harness.context.validateClaimPartialRecoveries_(harness.spreadsheet),
    /injected property delete failure/
  );
  assert.deepStrictEqual(rowRange.getBackgrounds(), validatorBackgrounds);
  assert.strictEqual(sheet.getRange(row, 4).getNote(), validatorNote);
  assert.strictEqual(JSON.stringify(Array.from(harness.documentProperties.values.entries())), validatorProperties);

  harness.context.validateClaimPartialRecoveries_(harness.spreadsheet);
  assert.strictEqual(sheet.getRange(row, 1).getBackground(), '#D9EAD3');
  assert.strictEqual(sheet.getRange(row, 4).getNote(), 'Пользовательская заметка');
  assert.strictEqual(harness.documentProperties.values.size, 0);
}

{
  const harness = createHarness();
  const salaryTable = {
    headerRow: 2,
    layout: { id: 'salary' },
    columns: { year: 3, month: 4, correctAmount: 7 },
  };
  const salaryRows = [
    ['', '', '', 2026, 'Январь', '', 100000, 104000],
  ];
  const salaryFacts = harness.context.buildClaimFactsFromCalculationRows_({
    sheetName: 'Оклад',
    table: salaryTable,
    rows: salaryRows,
    underpaymentValues: [[12000]],
    indexationValues: [[800]],
    liabilityValues: [[450]],
  });
  const premiumFacts = harness.context.buildClaimFactsFromCalculationRows_({
    sheetName: 'Ежемесячные',
    table: {
      headerRow: 1,
      layout: { id: 'monthlyPremiums' },
      columns: { period: 2 },
    },
    rows: [['', '', 'Февраль 2026']],
    underpaymentValues: [[3000]],
    indexationValues: [[120]],
    liabilityValues: [[75]],
  });
  const vacationFacts = harness.context.buildClaimFactsFromCalculationRows_({
    sheetName: 'Отпуска',
    table: {
      headerRow: 1,
      layout: { id: 'vacation' },
      columns: { period: 0 },
    },
    rows: [[new Date('2026-03-10T00:00:00.000Z')]],
    underpaymentValues: [[5000]],
    indexationValues: [[200]],
    liabilityValues: [[90]],
  });
  const facts = salaryFacts.concat(premiumFacts, vacationFacts);

  assert.deepStrictEqual(Array.from(new Set(facts.map((fact) => fact.family))), [
    'underpayment',
    'salary_indexation',
    'underpayment_indexation',
    'material_liability',
  ]);
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(salaryFacts)),
    [
      {
        family: 'underpayment',
        baseKind: 'salary',
        baseLabel: 'Оклад',
        periodKey: '2026-01',
        periodLabel: '01.2026',
        calculationItem: 'principal',
        amount: 12000,
        disputed: false,
        sourceRef: 'Оклад!3',
      },
      {
        family: 'salary_indexation',
        baseKind: 'salary',
        baseLabel: 'Оклад',
        periodKey: '2026-01',
        periodLabel: '01.2026',
        calculationItem: 'salary_indexation',
        amount: 4000,
        disputed: false,
        sourceRef: 'Оклад!3',
      },
      {
        family: 'underpayment_indexation',
        baseKind: 'salary',
        baseLabel: 'Оклад',
        periodKey: '2026-01',
        periodLabel: '01.2026',
        calculationItem: 'inflation_indexation',
        amount: 800,
        disputed: false,
        sourceRef: 'Оклад!3',
      },
      {
        family: 'material_liability',
        baseKind: 'salary',
        baseLabel: 'Оклад',
        periodKey: '2026-01',
        periodLabel: '01.2026',
        calculationItem: 'article_236',
        amount: 450,
        disputed: false,
        sourceRef: 'Оклад!3',
      },
    ]
  );
  assert.strictEqual(facts.filter((fact) => fact.family === 'underpayment').length, 3);
  assert.strictEqual(
    facts.reduce((sum, fact) => sum + (fact.family === 'material_liability' ? fact.amount : 0), 0),
    615
  );
}

{
  const harness = createHarness();
  const base = {
    family: 'underpayment',
    baseKind: 'salary',
    baseLabel: 'Старый отображаемый текст',
    periodKey: '2026|01',
    periodLabel: 'Январь 2026',
    calculationItem: 'principal|monthly',
    amount: 100,
    disputed: false,
    sourceRef: 'Оклад!3',
  };
  const first = harness.context.buildStableClaimKey_(base);
  const changedDisplay = harness.context.buildStableClaimKey_(Object.assign({}, base, {
    baseLabel: 'Новый отображаемый текст',
    periodLabel: '01.2026',
    amount: 999,
  }));
  const changedPeriod = harness.context.buildStableClaimKey_(Object.assign({}, base, {
    periodKey: '2026-02',
  }));
  const changedFamily = harness.context.buildStableClaimKey_(Object.assign({}, base, {
    family: 'material_liability',
  }));

  assert.strictEqual(first, changedDisplay);
  assert.notStrictEqual(first, changedPeriod);
  assert.notStrictEqual(first, changedFamily);
  assert.strictEqual(first.split('|').length, 4);
  assert.ok(!first.includes('2026|01'));
  assert.ok(!first.includes('principal|monthly'));
}

{
  const harness = createHarness();
  const facts = [
    {
      family: 'underpayment', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
      periodLabel: '01.2026', calculationItem: 'principal', amount: 1000, disputed: false,
      sourceRef: 'Оклад!3',
    },
    {
      family: 'underpayment', baseKind: 'monthly_premium', baseLabel: 'Ежемесячная премия',
      periodKey: '2026-02', periodLabel: '02.2026', calculationItem: 'principal', amount: 300,
      disputed: true, sourceRef: 'Ежемесячные!2',
    },
    {
      family: 'material_liability', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
      periodLabel: '01.2026', calculationItem: 'article_236', amount: 50, disputed: false,
      sourceRef: 'Оклад!3',
    },
    {
      family: 'salary_indexation', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
      periodLabel: '01.2026', calculationItem: 'salary_indexation', amount: 200, disputed: false,
      sourceRef: 'Оклад!3',
    },
    {
      family: 'underpayment_indexation', baseKind: 'monthly_premium', baseLabel: 'Ежемесячная премия',
      periodKey: '2026-02', periodLabel: '02.2026', calculationItem: 'inflation_indexation', amount: 20,
      disputed: false, sourceRef: 'Ежемесячные!2',
    },
  ];
  const model = harness.context.buildClaimAuditModel_(facts);

  assert.deepStrictEqual(Array.from(model.groups, (group) => group.label), [
    'Взыскать недоплату',
    'Материальная ответственность',
    'Индексация заработной платы',
    'Индексация недоплаты',
  ]);
  assert.deepStrictEqual(Array.from(model.groups, (group) => group.total), [1300, 50, 200, 20]);
  assert.deepStrictEqual(
    Array.from(model.groups[0].items, (item) => item.label),
    ['Оклад — 01.2026', 'Ежемесячная премия — 02.2026']
  );
  assert.strictEqual(model.groups[0].items[1].selected, true);
  assert.strictEqual(model.groups[0].items[1].badge, 'спорное');
  assert.ok(!model.groups[0].items[1].badge.includes('включено'));

  const oldKey = model.groups[0].items[0].key;
  const newKey = model.groups[1].items[0].key;
  const merged = harness.context.mergeClaimSelections_(
    [{ key: oldKey, selected: false }],
    [{ key: oldKey }, { key: newKey, disputed: true }]
  );
  assert.strictEqual(merged[0].selected, false);
  assert.strictEqual(merged[1].selected, true);
}

{
  const harness = createHarness();
  const sheet = harness.context.ensureClaimIntakeSheet_(harness.spreadsheet);
  const layout = harness.context.getClaimIntakeLayout_();
  sheet.getRange(layout.employerSector.valueCell).setValue('Частная организация');
  sheet.getRange(layout.docsHistory.firstRow, 1, 1, 3)
    .setValues([['12.07.2026', 'https://docs.google.com/document/d/keep/edit', 'existing']]);
  const facts = [
    {
      family: 'underpayment', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
      periodLabel: '01.2026', calculationItem: 'principal', amount: 1000, disputed: true,
      sourceRef: 'Оклад!3',
    },
    {
      family: 'material_liability', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
      periodLabel: '01.2026', calculationItem: 'article_236', amount: 50, disputed: false,
      sourceRef: 'Оклад!3',
    },
  ];

  harness.context.renderClaimAudit_(sheet, facts);
  const rendered = sheet.getRange(
    layout.claimSelections.firstRow,
    1,
    layout.claimSelections.rowCount,
    layout.claimSelections.columnCount
  ).getValues();
  const itemRows = rendered.filter((row) => row[4]);
  assert.strictEqual(sheet.getRange(layout.claimSelections.titleCell).getValue(), 'Аудит и требования');
  assert.strictEqual(itemRows.length, 2);
  assert.strictEqual(itemRows[0][0], true);
  assert.strictEqual(itemRows[0][2], 'спорное');
  assert.ok(rendered.some((row) => String(row[1]).includes('Материальная ответственность — 50,00')));
  assert.strictEqual(rendered.filter((row) => /Общий подытог/.test(String(row[1]))).length, 0);
  assert.strictEqual(rendered.filter((row) => /Материальная ответственность/.test(String(row[1]))).length, 1);
  assert.ok(!rendered.flat().join(' ').includes('Все позиции включены по умолчанию'));
  assert.ok(!rendered.flat().join(' ').includes('6 оснований'));
  assert.ok(!rendered.flat().join(' ').includes('по базам'));
  assert.strictEqual(sheet.isColumnHiddenByUser(5), true);

  sheet.getRange(layout.claimSelections.firstRow + 1, 1).setValue(false);
  harness.context.renderClaimAudit_(sheet, facts.concat({
    family: 'underpayment_indexation', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
    periodLabel: '01.2026', calculationItem: 'inflation_indexation', amount: 20, disputed: false,
    sourceRef: 'Оклад!3',
  }));
  const rerendered = sheet.getRange(
    layout.claimSelections.firstRow,
    1,
    layout.claimSelections.rowCount,
    layout.claimSelections.columnCount
  ).getValues().filter((row) => row[4]);
  assert.strictEqual(rerendered.find((row) => row[4] === itemRows[0][4])[0], false);
  assert.strictEqual(rerendered.find((row) => row[4] !== itemRows[0][4] && row[4] !== itemRows[1][4])[0], true);
  assert.strictEqual(sheet.getRange(layout.employerSector.valueCell).getValue(), 'Частная организация');
  assert.deepStrictEqual(
    sheet.getRange(layout.docsHistory.firstRow, 1, 1, 3).getValues()[0],
    ['12.07.2026', 'https://docs.google.com/document/d/keep/edit', 'existing']
  );

  harness.context.renderClaimAudit_(sheet, []);
  const empty = sheet.getRange(
    layout.claimSelections.firstRow,
    1,
    layout.claimSelections.rowCount,
    layout.claimSelections.columnCount
  ).getValues();
  assert.strictEqual(empty[0][1], 'Расчетные позиции пока не найдены');
  assert.strictEqual(empty.filter((row) => row[4]).length, 0);
  assert.strictEqual(sheet.getRange(layout.employerSector.valueCell).getValue(), 'Частная организация');
}

{
  const harness = createHarness(['Оклад']);
  const claimFact = {
    family: 'underpayment', baseKind: 'salary', baseLabel: 'Оклад', periodKey: '2026-01',
    periodLabel: '01.2026', calculationItem: 'principal', amount: 1000, disputed: false,
    sourceRef: 'Оклад!3',
  };
  harness.context.isGeneratedSheetName_ = () => false;
  harness.context.getSheetLayout_ = () => ({ id: 'salary' });
  harness.context.updateUnpaidSalaryIndexationCore_ = () => ({
    sheetName: 'Оклад', layoutId: 'salary', calculated: 1, skipped: 0,
    totals: { underpayment: 1000, indexation: 0, liability: 0 },
    claimFacts: [claimFact],
  });
  harness.context.deleteLegacyGeneratedSheets_ = () => {};

  harness.context.runAllSheetsIndexation_(harness.spreadsheet);

  const intake = harness.spreadsheet.getSheetByName('Анкета и требования');
  assert.ok(intake, 'mass calculation must create the audit workspace');
  const layout = harness.context.getClaimIntakeLayout_();
  const rendered = intake.getRange(
    layout.claimSelections.firstRow,
    1,
    layout.claimSelections.rowCount,
    layout.claimSelections.columnCount
  ).getValues();
  assert.strictEqual(rendered.filter((row) => row[4]).length, 1);
  assert.strictEqual(rendered.find((row) => row[4])[4], harness.context.buildStableClaimKey_(claimFact));
}

console.log('claim constructor characterization ok');

module.exports = {
  FakeProperties,
  FakeRange,
  FakeSheet,
  FakeSpreadsheet,
  createHarness,
};
