const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('google-apps-script/SalaryIndexation.gs', 'utf8');
const zupImportCode = fs.readFileSync('google-apps-script/ZupImport.gs', 'utf8');

const context = {
  console,
  Date,
  JSON,
  Logger: { log() {} },
  Math,
  Number,
  Object,
  RegExp,
  Session: { getScriptTimeZone: () => 'Europe/Moscow' },
  String,
  UrlFetchApp: { fetch() { throw new Error('UrlFetchApp is not used in date tests'); } },
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

const calendar = {
  2023: [
    '|1|2|3|4|5|6|7|8|', '', '', '', '', '', '', '', '', '', '|4|5|', '',
  ],
  2026: [
    '|1|2|3|4|5|6|7|8|9|10|11|17|18|24|25|31|',
    '', '', '', '', '', '', '', '', '', '', '',
  ],
};

{
  const parsed = context.resolveCalculationEndDate_(
    'Сумма индексации самой недоплаты на момент подачи иска (20 мая)',
    new Date(2026, 4, 13)
  );
  assert.strictEqual(context.formatDate_(parsed.date), '20.05.2026');
  assert.match(parsed.source, /из заголовка/);
}

{
  const parsed = context.resolveCalculationEndDate_(
    'Сумма индексации самой недоплаты на момент подачи иска (20.05.2027)',
    new Date(2026, 4, 13)
  );
  assert.strictEqual(context.formatDate_(parsed.date), '20.05.2027');
}

{
  const start = context.getIndexationStartDate_(2023, 10, calendar);
  assert.strictEqual(context.formatDate_(start), '03.11.2023');
}

{
  const row = [];
  row[3] = 2023;
  row[4] = 'окт';
  const columns = { year: 3, month: 4 };
  const period = context.parseRowPeriod_(row, columns);
  const start = context.getRowStartDate_(row, columns, context.getSheetLayout_('Оклад'), calendar);
  assert.strictEqual(period.year, 2023);
  assert.strictEqual(period.month, 10);
  assert.strictEqual(context.formatDate_(start), '03.11.2023');
}

{
  const start = context.getIndexationStartDate_(2025, 12, calendar);
  assert.strictEqual(context.formatDate_(start), '31.12.2025');
}

{
  assert.strictEqual(context.columnLetterToIndex_('D'), 3);
  assert.strictEqual(context.columnLetterToIndex_('E'), 4);
  assert.strictEqual(context.columnLetterToIndex_('F'), 5);
  assert.strictEqual(context.columnLetterToIndex_('H'), 7);
  assert.strictEqual(context.columnLetterToIndex_('I'), 8);
  assert.strictEqual(context.columnLetterToIndex_('J'), 9);
  assert.strictEqual(context.columnLetterToIndex_('K'), 10);
  assert.strictEqual(context.columnLetterToIndex_('L'), 11);
  assert.strictEqual(context.columnLetterToIndex_('M'), 12);
  assert.strictEqual(context.indexToColumnLetter_(0), 'A');
  assert.strictEqual(context.indexToColumnLetter_(27), 'AB');
  assert.strictEqual(context.isGeneratedSheetName_('Методология'), true);
  assert.strictEqual(context.isGeneratedSheetName_('Проверка'), false);
  assert.strictEqual(context.isGeneratedSheetName_('Оклад'), false);
}

{
  const monthlyLayout = context.getSheetLayout_('Ежемесячные');
  assert.strictEqual(monthlyLayout.id, 'monthlyPremiums');
  assert.strictEqual(monthlyLayout.periodColumn, 'C');
  assert.strictEqual(monthlyLayout.correctAmountColumn, 'B');
  assert.strictEqual(monthlyLayout.underpaymentColumn, 'G');
  assert.strictEqual(monthlyLayout.targetColumn, 'H');
  assert.strictEqual(monthlyLayout.totalUnderpaymentColumn, 'G');
  assert.strictEqual(monthlyLayout.penaltyColumn, 'I');
  assert.strictEqual(monthlyLayout.updateMonthlyIpc, false);

  const salaryLayout = context.getSheetLayout_('Оклад');
  assert.strictEqual(salaryLayout.id, 'salary');
  assert.strictEqual(salaryLayout.yearColumn, 'D');
  assert.strictEqual(salaryLayout.monthColumn, 'E');
  assert.strictEqual(salaryLayout.monthlyIpcColumn, 'F');
  assert.strictEqual(salaryLayout.correctAmountColumn, 'H');
  assert.strictEqual(salaryLayout.underpaymentColumn, 'J');
  assert.strictEqual(salaryLayout.targetColumn, 'K');
  assert.strictEqual(salaryLayout.totalUnderpaymentColumn, 'J');
  assert.strictEqual(salaryLayout.penaltyColumn, 'L');
}

{
  const quarterlyLayout = context.getSheetLayout_('Ежеквартальные');
  assert.strictEqual(quarterlyLayout.id, 'quarterlyPremiums');
  assert.strictEqual(quarterlyLayout.periodColumn, 'C');
  assert.strictEqual(quarterlyLayout.correctAmountColumn, 'B');
  assert.strictEqual(quarterlyLayout.underpaymentColumn, 'G');
  assert.strictEqual(quarterlyLayout.targetColumn, 'H');
  assert.strictEqual(quarterlyLayout.totalUnderpaymentColumn, 'G');
  assert.strictEqual(quarterlyLayout.penaltyColumn, 'I');
  assert.strictEqual(quarterlyLayout.updateMonthlyIpc, false);
}

{
  const annualLayout = context.getSheetLayout_('Ежегодные');
  assert.strictEqual(annualLayout.id, 'annualPremiums');
  assert.strictEqual(annualLayout.periodColumn, 'C');
  assert.strictEqual(annualLayout.correctAmountColumn, 'B');
  assert.strictEqual(annualLayout.underpaymentColumn, 'G');
  assert.strictEqual(annualLayout.targetColumn, 'H');
  assert.strictEqual(annualLayout.totalUnderpaymentColumn, 'G');
  assert.strictEqual(annualLayout.penaltyColumn, 'I');
  assert.strictEqual(annualLayout.updateMonthlyIpc, false);
}

{
  const vacationLayout = context.getSheetLayout_('Отпуск');
  assert.strictEqual(vacationLayout.id, 'vacation');
  assert.strictEqual(vacationLayout.periodColumn, 'A');
  assert.strictEqual(vacationLayout.correctAnnualSalaryColumn, 'B');
  assert.strictEqual(vacationLayout.workedDaysColumn, undefined);
  assert.strictEqual(vacationLayout.underpaymentColumn, 'J');
  assert.strictEqual(vacationLayout.targetColumn, 'K');
  assert.strictEqual(vacationLayout.totalUnderpaymentColumn, 'J');
  assert.strictEqual(vacationLayout.penaltyColumn, 'L');
  assert.strictEqual(vacationLayout.updateMonthlyIpc, false);
}

{
  const table = {
    layout: context.getSheetLayout_('Отпуск'),
    columns: {
      period: 0,
      vacationStartDate: 1,
    },
  };
  const row = [new Date(2026, 1, 13), new Date(2026, 1, 9)];
  const event = context.getVacationEventDate_(row, table);
  assert.strictEqual(context.formatDate_(event.date), '09.02.2026');
  assert.strictEqual(event.source, 'колонка B');

  const fallbackTable = {
    layout: context.getSheetLayout_('Отпуск'),
    columns: {
      period: 0,
      vacationStartDate: null,
    },
  };
  const fallback = context.getVacationEventDate_(row, fallbackTable);
  assert.strictEqual(context.formatDate_(fallback.date), '13.02.2026');
  assert.strictEqual(fallback.source, 'колонка A');
}

{
  const ruleBefore = context.getVacationCalculationRule_(new Date(2025, 7, 31));
  assert.strictEqual(ruleBefore, '922');

  const ruleAfter = context.getVacationCalculationRule_(new Date(2025, 8, 1));
  assert.strictEqual(ruleAfter, '540');

  const resultBefore = context.calculateVacationEarnings_(1000, new Date(2025, 7, 1), new Date(2025, 7, 31), {'2025-8': 100}, {
    regionId: 1,
    includeDeflationMonths: false,
  }, new Date(2025, 7, 28));
  assert.strictEqual(resultBefore.rule, '922');

  const resultAfter = context.calculateVacationEarnings_(1000, new Date(2025, 8, 1), new Date(2025, 8, 31), {'2025-9': 100}, {
    regionId: 1,
    includeDeflationMonths: false,
  }, new Date(2025, 8, 1));
  assert.strictEqual(resultAfter.rule, '540');
}

{
  const premiumSheet = {
    getName: () => 'Ежемесячные',
    getLastColumn: () => 10,
    getRange(row, column, rowCount, columnCount) {
      assert.strictEqual(row, 1);
      assert.strictEqual(column, 1);
      assert.strictEqual(rowCount, 1);
      assert.strictEqual(columnCount, 10);
      return {
        getDisplayValues() {
          return [[
            'Должностной оклад с учетом индексации',
            'Размер надлежащей к выплате премии',
            'Месяц, год расчета',
            'Вид премии',
            'Основание для расчета премии',
            'Выплаченные премии',
            'Недоплата по ежемесячным премиям (с учетом фактически выплаченных )',
            'Сумма индексации недоплаты на момент подачи иска (20.05.2026)',
            'Пени за несвоевременную выплату (ст. 236 ТК РФ)',
            '',
          ]];
        },
      };
    },
  };
  const table = context.findTable_(premiumSheet);
  assert.strictEqual(table.headerRow, 1);
  assert.strictEqual(table.columns.period, 2);
  assert.strictEqual(table.columns.unpaidSalary, 6);
  assert.strictEqual(table.columns.target, 7);
  assert.strictEqual(table.columns.totalUnderpayment, 6);
  assert.strictEqual(table.columns.penalty, 8);
  assert.strictEqual(table.columns.monthlyIpc, null);
}

{
  const period = context.parseMonthYear_('Октябрь 2023');
  assert.strictEqual(period.year, 2023);
  assert.strictEqual(period.month, 10);

  const numericPeriod = context.parseMonthYear_('02.2026');
  assert.strictEqual(numericPeriod.year, 2026);
  assert.strictEqual(numericPeriod.month, 2);
}

{
  const period = context.parseMonthYear_('4 квартал 2023 (октябрь - декабрь) Декабрь 2023');
  assert.strictEqual(period.year, 2023);
  assert.strictEqual(period.month, 12);

  const payoutPeriod = context.parseMonthYear_('1 квартал 2026 (январь - март) Апрель 2026');
  assert.strictEqual(payoutPeriod.year, 2026);
  assert.strictEqual(payoutPeriod.month, 4);
}

{
  const period = context.parseMonthYear_('2023 год Декабрь 2023');
  assert.strictEqual(period.year, 2023);
  assert.strictEqual(period.month, 12);

  const payoutPeriod = context.parseMonthYear_('2026 год Апрель 2026');
  assert.strictEqual(payoutPeriod.year, 2026);
  assert.strictEqual(payoutPeriod.month, 4);
}

{
  const columns = { period: 0, annualPremiumYear: null };
  assert.strictEqual(
    context.getAnnualPremiumYear_(['2026 год Апрель 2026'], columns),
    2026
  );
  assert.strictEqual(
    context.isAnnualPremiumCompletedForVacation_(
      ['2025 год Декабрь 2025'],
      { columns },
      new Date(2026, 0, 15)
    ),
    true
  );
  assert.strictEqual(
    context.isAnnualPremiumCompletedForVacation_(
      ['2026 год Апрель 2026'],
      { columns },
      new Date(2026, 3, 21)
    ),
    false
  );
}

{
  const ipc = context.getMonthlyIpcCoefficient_({ '2024-1': 100.86 }, 2024, 1);
  assert.strictEqual(ipc.percent, 100.86);
  assert.strictEqual(ipc.rawCoefficient, 1.0086);
  assert.strictEqual(ipc.coefficient, 1.0086);

  const deflationIpc = context.getMonthlyIpcCoefficient_({ '2025-8': 99.6 }, 2025, 8);
  assert.strictEqual(deflationIpc.percent, 99.6);
  assert.strictEqual(deflationIpc.rawCoefficient, 0.996);
  assert.strictEqual(deflationIpc.coefficient, 1);
  assert.match(context.buildMonthlyIpcNote_(deflationIpc), /приведен к 1/);
  assert.strictEqual(context.getMonthlyIpcCoefficient_({}, 2024, 1), null);
}

{
  const result = context.calculateIndexation_(
    1000,
    new Date(2025, 7, 1),
    new Date(2025, 7, 31),
    { '2025-8': 99.6 },
    { includeDeflationMonths: false }
  );
  assert.strictEqual(result.amount, 0);
  assert.strictEqual(result.coefficient, 0);
  assert.deepStrictEqual(Array.from(result.skippedDeflationMonths), ['08.2025']);
}

{
  const result = context.calculateIndexation_(
    1000,
    new Date(2024, 0, 1),
    new Date(2024, 1, 29),
    { '2024-1': 101, '2024-2': 102 },
    { includeDeflationMonths: false }
  );
  assert.strictEqual(result.amount, 30.2);
  assert.strictEqual(context.roundNumber_(result.multiplier, 6), 1.0302);
}

{
  const result = context.calculateIndexation_(
    1000,
    new Date(2026, 2, 1),
    new Date(2026, 4, 20),
    { '2026-3': 100.6 },
    { includeDeflationMonths: false }
  );
  assert.deepStrictEqual(Array.from(result.missingMonths), []);
  assert.deepStrictEqual(Array.from(result.unpublishedMonths), ['04.2026', '05.2026']);
  assert.match(context.buildResultNote_(result, new Date(2026, 2, 1), {
    date: new Date(2026, 4, 20),
    source: 'тест',
  }), /ИПЦ еще не опубликован/);
}

{
  const result = context.calculateIndexation_(
    356400,
    new Date(2023, 10, 3),
    new Date(2026, 4, 20),
    {
      '2023-11': 101.11,
      '2023-12': 100.73,
      '2024-1': 100.86,
      '2024-2': 100.68,
      '2024-3': 100.39,
      '2024-4': 100.5,
      '2024-5': 100.74,
      '2024-6': 100.64,
      '2024-7': 101.14,
      '2024-8': 100.2,
      '2024-9': 100.48,
      '2024-10': 100.75,
      '2024-11': 101.43,
      '2024-12': 101.32,
      '2025-1': 101.23,
      '2025-2': 100.81,
      '2025-3': 100.65,
      '2025-4': 100.4,
      '2025-5': 100.43,
      '2025-6': 100.2,
      '2025-7': 100.57,
      '2025-8': 99.6,
      '2025-9': 100.34,
      '2025-10': 100.5,
      '2025-11': 100.42,
      '2025-12': 100.32,
      '2026-1': 101.62,
      '2026-2': 100.73,
      '2026-3': 100.6,
    },
    { includeDeflationMonths: true }
  );
  assert.strictEqual(result.amount, 75560.58);
}

{
  assert.strictEqual(context.detectZupCategory_('оплата по окладу 89100'), 'Оклад');
  assert.strictEqual(context.detectZupCategory_('премия ежемесячная 12000'), 'Ежемесячные премии');
  assert.strictEqual(context.detectZupCategory_('премия квартальная 15000'), 'Ежеквартальные премии');
  assert.strictEqual(context.detectZupCategory_('премия годовая 30000'), 'Ежегодные премии');
  assert.strictEqual(context.detectZupSection_('Начислено'), 'Начислено');
  assert.strictEqual(context.detectCsvDelimiter_('a;b;c'), ';');
  assert.strictEqual(context.extractLastMoneyFromRow_(['Оплата по окладу', '21', '89 100,00']), 89100);
  assert.deepStrictEqual(
    Array.from(context.splitZupTextLine_('Оплата по окладу    21    89 100,00')),
    ['Оплата по окладу', '21', '89 100,00']
  );
  const htmlRows = context.htmlToZupGrid_(
    '<table><tr><td>Начислено</td></tr><tr><td>Оплата по окладу</td><td>21</td><td>89&nbsp;100,00</td></tr></table>'
  );
  assert.deepStrictEqual(Array.from(htmlRows[1]), ['Оплата по окладу', '21', '89 100,00']);
  const parsedHtml = context.extractZupRowsFromGrid_(htmlRows, 'test.html', 'HTML');
  assert.strictEqual(parsedHtml.length, 1);
  assert.strictEqual(parsedHtml[0][7], 'Начислено');
  assert.strictEqual(parsedHtml[0][8], 'Оклад');
  assert.strictEqual(parsedHtml[0][10], 89100);
  assert.strictEqual(parsedHtml[0][11], '');
  assert.strictEqual(parsedHtml[0][12], '');
  assert.strictEqual(context.buildZupSummary_(parsedHtml)[0][7], 89100);
  assert.strictEqual(
    context.extractDriveFolderId_('https://drive.google.com/drive/folders/1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm?ths=true'),
    '1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm'
  );
  assert.strictEqual(
    context.extractDriveFolderId_('https://drive.google.com/open?id=1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm'),
    '1YpnqMHnY0K0ZwJIttm8aggzUGv3TBkpm'
  );
  const paidColumns = context.buildZupAmountColumns_('Выплачено', 1000);
  assert.strictEqual(paidColumns.accrued, '');
  assert.strictEqual(paidColumns.paid, 1000);
  assert.strictEqual(paidColumns.withheld, '');

  const zupHtml = [
    '<table>',
    '<tr><td colspan="21">Вентнагель Ирина Николаевна (000р9)</td><td colspan="10">К выплате:</td><td colspan="4">54 718,12</td></tr>',
    '<tr><td colspan="17">Начислено:</td><td colspan="4">89 100,00</td><td colspan="10">Удержано:</td><td colspan="4">11 583,00</td></tr>',
    '<tr><td colspan="7">Оплата по окладу</td><td colspan="3">янв. 2024</td><td colspan="2">17</td><td colspan="2">68</td><td colspan="3">17,00 дн.</td><td colspan="4">89 100,00</td><td colspan="7">НДФЛ</td><td colspan="3">янв. 2024</td><td colspan="4">11 583,00</td></tr>',
    '<tr><td colspan="21"></td><td colspan="10">Выплачено:</td><td colspan="4">77 517,00</td></tr>',
    '<tr><td colspan="21"></td><td colspan="7">За первую половину месяца (Банк, вед. № 5 от 19.01.24)</td><td colspan="3">янв. 2024</td><td colspan="4">22 798,88</td></tr>',
    '</table>',
  ].join('');
  const parsedZupHtml = context.extractZupRowsFromGrid_(
    context.htmlToZupGrid_(zupHtml),
    '1. Расчетный листок О2 янв 2024.html',
    'HTML'
  );
  assert.strictEqual(parsedZupHtml.length, 3);
  assert.strictEqual(parsedZupHtml[0][2], 'Вентнагель Ирина Николаевна');
  assert.strictEqual(parsedZupHtml[0][10], 89100);
  assert.strictEqual(parsedZupHtml[1][8], 'Удержания');
  assert.strictEqual(parsedZupHtml[1][12], 11583);
  assert.strictEqual(parsedZupHtml[2][6], '19.01.2024');
  assert.strictEqual(parsedZupHtml[2][11], 22798.88);
}

{
  const existing = {
    formulas: [[''], ['=SUM(K3:K33)']],
    notes: [[''], ['manual total']],
    backgrounds: [['#ffffff'], ['#eeeeee']],
  };
  assert.strictEqual(context.preserveFormulaOrBlank_(existing, 0), '');
  assert.strictEqual(context.preserveFormulaOrBlank_(existing, 1), '=SUM(K3:K33)');
  assert.strictEqual(context.preserveFormulaNoteOrBlank_(existing, 1), 'manual total');
  assert.strictEqual(context.preserveFormulaNoteOrText_(existing, 0, 'new note'), 'new note');
  assert.strictEqual(context.preserveFormulaBackgroundOrDefault_(existing, 1), '#eeeeee');
}

{
  assert.strictEqual(
    context.getIndexationBackground_({
      skippedDeflationMonths: ['08.2025'],
      missingMonths: ['04.2026'],
    }),
    '#eadcf8'
  );
  assert.strictEqual(
    context.getIndexationBackground_({
      skippedDeflationMonths: [],
      missingMonths: ['04.2026'],
    }),
    '#fff2cc'
  );
}

{
  const rates = [
    { date: new Date(2023, 0, 1), rate: 10 },
    { date: new Date(2023, 0, 10), rate: 20 },
  ];
  const result = context.calculateSalaryCompensation_(
    1500,
    new Date(2023, 0, 5),
    new Date(2023, 0, 12),
    rates
  );
  assert.strictEqual(result.intervals.length, 2);
  assert.strictEqual(context.formatDate_(result.intervals[0].start), '06.01.2023');
  assert.strictEqual(context.formatDate_(result.intervals[0].end), '09.01.2023');
  assert.strictEqual(result.amount, 10);
}

console.log('date logic ok');
