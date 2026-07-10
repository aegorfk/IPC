const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('google-apps-script/SalaryIndexation.gs', 'utf8');
const zupImportCode = fs.readFileSync('google-apps-script/ZupImport.gs', 'utf8');

const context = {
  console,
  Date,
  DocumentApp: {
    ElementType: {
      PARAGRAPH: 'PARAGRAPH',
      TABLE: 'TABLE',
    },
  },
  JSON,
  Logger: { log() {} },
  Math,
  Number,
  Object,
  RegExp,
  Session: { getScriptTimeZone: () => 'Europe/Moscow' },
  String,
  UrlFetchApp: { fetch() { throw new Error('UrlFetchApp is not used in VLM conversion tests'); } },
  Utilities: {
    formatDate(date, timezone, format) {
      assert.strictEqual(format, 'dd.MM.yyyy');
      return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    },
  },
};

vm.createContext(context);
vm.runInContext(code, context);
vm.runInContext(zupImportCode, context);

const fakeFile = {
  getName: () => 'multi-slip.pdf',
  getMimeType: () => 'application/pdf',
};

const columns = {
  employee: 3,
  period: 4,
  statementDate: 12,
  accrued: 16,
  paid: 17,
  sourceRow: 19,
};

const payload = {
  slips: [
    {
      employee: 'Иванов Иван Иванович',
      company: 'ООО Ромашка',
      period: '10.2023',
      year: 2023,
      month: 10,
      page: 1,
      blockIndex: 1,
      totals: { accrued: 100000, paid: 87000, withheld: 13000 },
      rows: [
        {
          section: 'Начислено',
          category: 'Оклад',
          kind: 'Оплата по окладу',
          period: '10.2023',
          accrualDate: '31.10.2023',
          year: 2023,
          month: 10,
          workDays: 22,
          paidDays: 22,
          paymentDate: '',
          statement: '',
          statementDate: '',
          accrued: 100000,
          paid: 0,
          withheld: 0,
          sourceText: 'Оплата по окладу окт. 2023 100 000,00',
          confidence: 0.98,
        },
        {
          section: 'Удержано',
          category: 'Удержания',
          kind: 'НДФЛ',
          period: '10.2023',
          accrualDate: '31.10.2023',
          year: 2023,
          month: 10,
          workDays: 0,
          paidDays: 0,
          paymentDate: '',
          statement: '',
          statementDate: '',
          accrued: 0,
          paid: 0,
          withheld: 13000,
          sourceText: 'НДФЛ окт. 2023 13 000,00',
          confidence: 0.97,
        },
      ],
      warnings: [],
      confidence: 0.96,
    },
    {
      employee: 'Иванов Иван Иванович',
      company: 'ООО Ромашка',
      period: '11.2023',
      year: 2023,
      month: 11,
      page: 1,
      blockIndex: 2,
      totals: { accrued: 110000, paid: 95700, withheld: 14300 },
      rows: [
        {
          section: 'Выплачено',
          category: 'Выплаты',
          kind: 'Зарплата за месяц',
          period: '11.2023',
          accrualDate: '30.11.2023',
          year: 2023,
          month: 11,
          workDays: 0,
          paidDays: 0,
          paymentDate: '05.12.2023',
          statement: 'Банк, вед. № 12 от 05.12.2023',
          statementDate: '05.12.2023',
          accrued: 0,
          paid: 95700,
          withheld: 0,
          sourceText: 'Зарплата за месяц вед. № 12 от 05.12.2023 95 700,00',
          confidence: 0.95,
        },
      ],
      warnings: ['Проверить дату ведомости'],
      confidence: 0.94,
    },
  ],
  warnings: ['Файл содержит несколько листков на странице'],
};

const parsed = context.convertPolzaVlmPayloadToZupParsed_(fakeFile, payload, 'test-model', {
  usage: { cost_rub: 1.23 },
});

assert.strictEqual(parsed.rows.length, 3);
assert.strictEqual(parsed.company, 'ООО Ромашка');
assert.strictEqual(parsed.employee, 'Иванов Иван Иванович');
assert.strictEqual(parsed.totals.accrued, 210000);
assert.strictEqual(parsed.totals.withheld, 27300);
assert.strictEqual(parsed.totals.paid, 182700);
assert.match(parsed.warnings.join('\n'), /несколько расчетных листков/);
assert.match(parsed.warnings.join('\n'), /Slip 2: Проверить дату ведомости/);

const first = parsed.rows[0];
assert.strictEqual(first[columns.period], '10.2023');
assert.strictEqual(first[columns.accrued], 100000);
assert.match(first[columns.sourceRow], /стр\. 1, блок 1/);

const payment = parsed.rows[2];
assert.strictEqual(payment[columns.period], '11.2023');
assert.strictEqual(payment[columns.paid], 95700);
assert.strictEqual(payment[columns.statementDate], '05.12.2023');

const legacy = context.convertPolzaVlmPayloadToZupParsed_(fakeFile, {
  employee: 'Петров Петр Петрович',
  company: 'ООО Л legacy',
  period: '12.2023',
  year: 2023,
  month: 12,
  totals: { accrued: 50000, paid: 43500, withheld: 6500 },
  rows: [payload.slips[0].rows[0]],
  warnings: [],
}, 'test-model', {});

assert.strictEqual(legacy.rows.length, 1);
assert.strictEqual(legacy.company, 'ООО Л legacy');
assert.strictEqual(legacy.rows[0][columns.employee], 'Петров Петр Петрович');

assert.strictEqual(context.countZupPayrollSlipMarkers_('РАСЧЕТНЫЙ ЛИСТОК ЗА ОКТЯБРЬ\nрасчетный листок за ноябрь'), 2);
