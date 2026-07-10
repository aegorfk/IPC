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
    },
    ParagraphHeading: {
      NORMAL: 'NORMAL',
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
  2024: [
    '|1|2|3|4|5|6|7|8|13|14|20|21|27|28|',
    '|3|4|10|11|17|18|23|24|25|',
    '', '', '', '', '', '', '', '', '', '',
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
  const row = [];
  row[2] = '15.02.2024';
  row[3] = 2024;
  row[4] = 'фев';
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      paymentDate: 2,
      year: 3,
      month: 4,
    },
  };
  const due = context.getRowPenaltyDueDate_(row, table, calendar);
  assert.strictEqual(context.formatDate_(due.date), '15.02.2024');
  assert.strictEqual(due.source, 'колонка C');
}

{
  const row = [];
  row[2] = '05.02.2024\n15.02.2024';
  row[3] = 2024;
  row[4] = 'фев';
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      paymentDate: 2,
      year: 3,
      month: 4,
    },
  };
  const due = context.getRowPenaltyDueDate_(row, table, calendar);
  assert.strictEqual(context.formatDate_(due.date), '15.02.2024');
  assert.strictEqual(due.source, 'колонка C, последняя из 2 дат ведомостей');
}

{
  const parsed = context.parsePaymentDatesCell_('19.01.2024\n05.02.2024');
  assert.strictEqual(parsed.count, 2);
  assert.strictEqual(context.formatDate_(parsed.dates[0]), '19.01.2024');
  assert.strictEqual(context.formatDate_(parsed.dates[1]), '05.02.2024');
}

{
  const row = [];
  row[0] = 17;
  row[1] = 17;
  row[3] = 2024;
  row[4] = 'янв';
  row[7] = 17000;
  row[9] = 1700;
  row[17] = '19.01.2024\n05.02.2024';
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      workedDays: 0,
      workDays: 1,
      year: 3,
      month: 4,
      correctAmount: 7,
      unpaidSalary: 9,
      totalUnderpayment: 9,
      paymentDate: 17,
    },
  };
  const schedule = context.buildSalaryDebtSchedule_(row, table, calendar, {
    principal: 1700,
    totalUnderpayment: 1700,
    correctAmount: 17000,
  });
  assert.strictEqual(schedule.slices.length, 2);
  assert.strictEqual(schedule.slices[0].workDays, 8);
  assert.strictEqual(schedule.slices[1].workDays, 9);
  assert.strictEqual(schedule.slices[0].correctAmount, 8000);
  assert.strictEqual(schedule.slices[1].correctAmount, 9000);
  assert.strictEqual(schedule.slices[0].underpaymentAmount, 800);
  assert.strictEqual(schedule.slices[1].underpaymentAmount, 900);
  assert.strictEqual(context.formatDate_(schedule.slices[0].dueDate), '19.01.2024');
  assert.strictEqual(context.formatDate_(schedule.slices[1].dueDate), '05.02.2024');
  const compensation = context.calculateSalaryScheduleCompensation_(
    schedule,
    new Date(2024, 1, 6),
    [{ date: new Date(2024, 0, 1), rate: 10 }]
  );
  assert.strictEqual(compensation.parts.length, 2);
  assert.strictEqual(compensation.amount, 10.2);
}

{
  const row = [];
  row[0] = 8;
  row[1] = 8;
  row[3] = 2024;
  row[4] = 'янв';
  row[7] = 8000;
  row[9] = 800;
  row[17] = '19.01.2024';
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      workedDays: 0,
      workDays: 1,
      year: 3,
      month: 4,
      correctAmount: 7,
      unpaidSalary: 9,
      totalUnderpayment: 9,
      paymentDate: 17,
    },
  };
  const schedule = context.buildSalaryDebtSchedule_(row, table, calendar, {
    principal: 800,
    totalUnderpayment: 800,
    correctAmount: 8000,
    inferredPaymentSchedule: {
      firstHalf: { day: 20, monthOffset: 1, matches: 2, observations: 2 },
      secondHalf: { day: 5, monthOffset: 1, matches: 2, observations: 2 },
    },
  });
  assert.strictEqual(schedule.slices.length, 1);
  assert.strictEqual(schedule.slices[0].id, 'firstHalf');
  assert.strictEqual(schedule.slices[0].workDays, 8);
  assert.strictEqual(schedule.slices[0].correctAmount, 8000);
  assert.strictEqual(schedule.slices[0].underpaymentAmount, 800);
  assert.strictEqual(context.formatDate_(schedule.slices[0].dueDate), '19.01.2024');
}

{
  const row = [];
  row[0] = 17;
  row[1] = 17;
  row[3] = 2024;
  row[4] = 'янв';
  row[7] = 17000;
  row[9] = 1700;
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      workedDays: 0,
      workDays: 1,
      year: 3,
      month: 4,
      correctAmount: 7,
      unpaidSalary: 9,
      totalUnderpayment: 9,
      paymentDate: 17,
    },
  };
  const schedule = context.buildSalaryDebtSchedule_(row, table, calendar, {
    principal: 1700,
    totalUnderpayment: 1700,
    correctAmount: 17000,
  });
  assert.strictEqual(context.isSalaryScheduleReady_(schedule), false);
  assert.match(context.buildSalaryMissingPaymentDatesMessage_(schedule), /не установлены даты выплаты/);
}

{
  const row = [];
  row[0] = 17;
  row[1] = 17;
  row[3] = 2024;
  row[4] = 'янв';
  row[7] = 17000;
  row[9] = 1700;
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      workedDays: 0,
      workDays: 1,
      year: 3,
      month: 4,
      correctAmount: 7,
      unpaidSalary: 9,
      totalUnderpayment: 9,
      paymentDate: 17,
    },
  };
  const schedule = context.buildSalaryDebtSchedule_(row, table, calendar, {
    principal: 1700,
    totalUnderpayment: 1700,
    correctAmount: 17000,
    inferredPaymentSchedule: {
      firstHalf: { day: 20, monthOffset: 0, matches: 3, observations: 3 },
      secondHalf: { day: 5, monthOffset: 1, matches: 3, observations: 3 },
    },
  });
  assert.strictEqual(context.isSalaryScheduleReady_(schedule), true);
  assert.strictEqual(context.formatDate_(schedule.slices[0].dueDate), '19.01.2024');
  assert.strictEqual(context.formatDate_(schedule.slices[1].dueDate), '05.02.2024');
  assert.match(schedule.slices[0].dateSource, /восстановлено/);
}

{
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      workedDays: 0,
      workDays: 1,
      year: 3,
      month: 4,
      correctAmount: 7,
      unpaidSalary: 9,
      totalUnderpayment: 9,
      paymentDate: 17,
    },
  };
  const rows = [
    [17, 17, '', 2024, 'янв', '', '', 17000, '', 1700, '', '', '', '', '', '', '', '19.01.2024\n05.02.2024'],
    [20, 20, '', 2024, 'фев', '', '', 20000, '', 2000, '', '', '', '', '', '', '', '20.02.2024\n05.03.2024'],
  ];
  const inferred = context.inferSalaryPaymentScheduleFromRows_(rows, table, calendar);
  assert.strictEqual(inferred.firstHalf.day, 20);
  assert.strictEqual(inferred.secondHalf.day, 5);
  const march = [];
  march[0] = 20;
  march[1] = 20;
  march[3] = 2024;
  march[4] = 'мар';
  march[7] = 20000;
  march[9] = 2000;
  const schedule = context.buildSalaryDebtSchedule_(march, table, calendar, {
    principal: 2000,
    totalUnderpayment: 2000,
    correctAmount: 20000,
    inferredPaymentSchedule: inferred,
  });
  assert.strictEqual(context.formatDate_(schedule.slices[0].dueDate), '20.03.2024');
  assert.strictEqual(context.formatDate_(schedule.slices[1].dueDate), '05.04.2024');
}

{
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      year: 3,
      month: 4,
      paymentDate: 17,
    },
  };
  const rows = [
    [17, 17, '', 2024, 'янв', '', '', 17000, '', 1700, '', '', '', '', '', '', '', '05.01.2024\n05.02.2024'],
    [20, 20, '', 2024, 'фев', '', '', 20000, '', 2000, '', '', '', '', '', '', '', '05.02.2024\n05.03.2024'],
  ];
  const inferred = context.inferSalaryPaymentScheduleFromRows_(rows, table, calendar);
  assert.strictEqual(inferred.firstHalf, null);
  assert.strictEqual(inferred.secondHalf.day, 5);
}

{
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      year: 3,
      month: 4,
      paymentDate: context.columnLetterToIndex_('S'),
    },
  };
  const rows = [
    [17, 17, '', 2024, 'янв', '', '', 17000, '', 1700, '', '', '', '', '', '', '', '', '19.01.2024\n05.02.2024'],
  ];
  const inferred = context.inferSalaryPaymentScheduleFromRows_(rows, table, calendar);
  assert.strictEqual(inferred.firstHalf, null);
  assert.strictEqual(inferred.secondHalf, null);
}

{
  const header = new Array(18).fill('');
  header[17] = 'Дата ведомости выплат';
  const rows = [
    [17, 17, '', 2024, 'янв', '', '', 17000, '', 1700, '', '', '', '', '', '', '', '19.01.2024\n05.02.2024'],
    [20, 20, '', 2024, 'фев', '', '', 20000, '', 2000, '', '', '', '', '', '', '', '20.02.2024\n05.03.2024'],
  ];
  const importedSheet = {
    getName: () => 'Из_1С_Оклад',
    getLastRow: () => 2 + rows.length,
    getLastColumn: () => header.length,
    getRange(row, column, rowCount, columnCount) {
      assert.strictEqual(column, 1);
      assert.strictEqual(columnCount, header.length);
      if (row === 2) {
        return {
          getDisplayValues: () => [header],
        };
      }
      assert.strictEqual(row, 3);
      assert.strictEqual(rowCount, rows.length);
      return {
        getValues: () => rows,
      };
    },
  };
  const spreadsheet = {
    getSheetByName(name) {
      return name === 'Из_1С_Оклад' ? importedSheet : null;
    },
  };
  const table = {
    layout: context.getSheetLayout_('Оклад'),
    columns: {
      year: 3,
      month: 4,
      paymentDate: null,
    },
  };
  const inferred = context.inferSalaryPaymentScheduleForSheet_(spreadsheet, [], table, calendar);
  assert.strictEqual(inferred.firstHalf.day, 20);
  assert.strictEqual(inferred.secondHalf.day, 5);
  const summaryRows = context.buildSalaryPaymentScheduleSummaryRows_(inferred, new Date(2026, 5, 2));
  assert.strictEqual(summaryRows[0][0], 'Даты выплаты зарплаты');
  assert.match(summaryRows[1][1], /20-е число текущего месяца/);
  assert.match(summaryRows[2][1], /5-е число следующего месяца/);
  assert.strictEqual(summaryRows[3][0], 'Обновлено');
  assert.ok(!summaryRows.some((row) => row[0] === 'Источник'));
}

{
  const layout = context.getSheetLayout_('Оклад');
  const notes = {};
  const sheet = {
    deleted: [],
    header: new Array(30).fill(''),
    maxColumns: 30,
    getMaxColumns() {
      return this.maxColumns;
    },
    deleteColumns(column, count) {
      this.deleted.push({ column, count });
      this.maxColumns -= count;
    },
    getRange(row, column, rowCount, columnCount) {
      const self = this;
      return {
        getDisplayValues() {
          return [self.header.slice(column - 1, column - 1 + (columnCount || 1))];
        },
        getNote() {
          return notes[`${row}:${column}`] || '';
        },
        setNote(note) {
          notes[`${row}:${column}`] = note;
          return this;
        },
      };
    },
  };
  context.deleteSalaryAuxiliaryColumns_(sheet, layout);
  assert.deepStrictEqual(sheet.deleted, [{ column: 19, count: 5 }]);
  assert.match(notes['1:17'], /S:W/);
  assert.strictEqual(context.isSalaryAuxiliaryColumnsDeleted_(sheet, layout), true);
  context.deleteSalaryAuxiliaryColumns_(sheet, layout);
  assert.deepStrictEqual(sheet.deleted, [{ column: 19, count: 5 }]);
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
  assert.strictEqual(context.isGeneratedSheetName_('Из_1С_Оклад'), true);
  assert.strictEqual(context.isGeneratedSheetName_('Проверка'), false);
  assert.strictEqual(context.isGeneratedSheetName_('Оклад'), false);
  assert.strictEqual(context.getSheetLayout_('Из_1С_Ежемесячные').id, 'monthlyPremiums');
  assert.strictEqual(context.getSheetLayout_('Из_1С_Отпуска').id, 'vacation');
}

{
  const calls = [];
  const sheets = {
    'Отпуска': {
      setName(name) {
        calls.push(name);
      },
    },
    'Отпуска и расчет': null,
  };
  context.renameLegacyVacationSheet_({
    getSheetByName(name) {
      return sheets[name] || null;
    },
  });
  assert.deepStrictEqual(calls, ['Отпуска и расчет']);
}

{
  const vacationConfig = context.getZupReconstructionConfigs_().find((config) =>
    config.targetSheetName === 'Из_1С_Отпуска'
  );
  assert.strictEqual(vacationConfig.sourceSheetName, 'Отпуска и расчет');
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
  const table = {
    layout: context.getSheetLayout_('Отпуска и расчет'),
    columns: {
      period: 0,
      paymentDate: 6,
      vacationStartDate: null,
    },
  };
  const row = [
    new Date(2026, 3, 21),
    null,
    null,
    null,
    null,
    null,
    new Date(2026, 3, 21),
  ];
  const finalSettlementDate = new Date(2026, 3, 21);
  assert.strictEqual(context.isFinalSettlementRow_(row, table, finalSettlementDate), true);
  const start = context.getRowIndexationStart_(row, table, calendar, finalSettlementDate);
  assert.strictEqual(context.formatDate_(start.date), '21.04.2026');
  assert.match(start.source, /дата окончательного расчета/);
  const indexation = context.calculateIndexation_(
    349525.0976,
    start.date,
    new Date(2026, 4, 20),
    {'2026-4': 100.14, '2026-5': 100.17},
    {includeDeflationMonths: false}
  );
  assert.strictEqual(indexation.amount, 546.64);
}

{
  const dismissalDate = new Date(2026, 3, 21);
  const row = [
    dismissalDate,
    5397472.24,
    304,
    24.33,
    17754.84,
    null,
    dismissalDate,
    82450.23,
    431975.33,
    349525.10,
    546.64,
    9856.61,
  ];
  const table = {
    headerRow: 1,
    headerValues: [
      'Дата выплаты',
      'Сумма корректного годового заработка',
      'Делитель',
      'Количество дней',
      'Среднедневной заработок',
      '',
      'Дата выплаты',
      'Начислено по расчетным листкам',
      'Корректное начисление (с индексацией)',
      'Недоплата по выплатам',
      'Сумма индексации недоплаты',
      'Пени',
    ],
    layout: context.getSheetLayout_('Отпуска и расчет'),
    columns: {
      period: 0,
      actualPayment: 7,
      unpaidSalary: 9,
      target: 10,
      penalty: 11,
      vacationStartDate: null,
    },
  };
  const rows = context.collectCurrentCalculationRowsFromSheet_({
    getName: () => 'Отпуска и расчет',
    getLastRow: () => 2,
    getLastColumn: () => row.length,
    getRange: () => ({getValues: () => [row]}),
  }, table, dismissalDate);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].sectionId, 'finalSettlement');
  assert.strictEqual(context.formatDate_(rows[0].eventDate), '21.04.2026');
}

{
  const endDate = new Date(2026, 5, 10);
  const rows = context.buildForcedAbsenceDailyRows_([
    {
      date: new Date(2026, 5, 9),
      result: {
        skipped: false,
        amount: 17.16,
        intervals: [{days: 1}],
      },
    },
    {
      date: new Date(2026, 5, 10),
      result: {
        skipped: true,
        amount: 0,
        intervals: [],
      },
    },
  ], 17754.84, endDate);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(context.formatDate_(rows[0].workDate), '09.06.2026');
  assert.strictEqual(context.formatDate_(rows[0].delayStart), '10.06.2026');
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
  assert.strictEqual(context.isAutoIndexationInputEdit_(table, 5, 5), true);
  assert.strictEqual(context.isAutoIndexationInputEdit_(table, 6, 6), true);
  assert.strictEqual(context.isAutoIndexationInputEdit_(table, 7, 7), false);
  assert.strictEqual(context.isAutoIndexationInputEdit_(table, 8, 8), false);
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
  assert.strictEqual(parsedHtml[0][13], 'Начислено');
  assert.strictEqual(parsedHtml[0][14], 'Оклад');
  assert.strictEqual(parsedHtml[0][16], 89100);
  assert.strictEqual(parsedHtml[0][17], '');
  assert.strictEqual(parsedHtml[0][18], '');
  assert.strictEqual(context.buildZupSummary_(parsedHtml)[0][9], 89100);
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
  assert.strictEqual(parsedZupHtml[0][3], 'Вентнагель Ирина Николаевна');
  assert.strictEqual(parsedZupHtml[0][8], 17);
  assert.strictEqual(parsedZupHtml[0][9], 17);
  assert.strictEqual(parsedZupHtml[0][16], 89100);
  assert.strictEqual(parsedZupHtml[1][14], 'Удержания');
  assert.strictEqual(parsedZupHtml[1][18], 11583);
  assert.strictEqual(parsedZupHtml[2][10], '19.01.2024');
  assert.strictEqual(parsedZupHtml[2][11], 'Банк, вед. № 5 от 19.01.24');
  assert.strictEqual(parsedZupHtml[2][12], '19.01.2024');
  assert.strictEqual(parsedZupHtml[2][15], 'За первую половину месяца');
  assert.strictEqual(parsedZupHtml[2][17], 22798.88);
  assert.strictEqual(
    context.extractZupPaymentDateFromCells_(['Отпуск основной', '01.10-05.10', '5,00 дн.']),
    null
  );
  assert.strictEqual(
    context.extractZupAmountFromSegment_({ section: 'Начислено', cells: ['Отпуск за свой счет', '18.11', '1', '4'] }),
    null
  );
  assert.strictEqual(
    context.extractZupAmountFromSegment_({ section: 'Начислено', cells: ['Отпуск основной', '5,00 дн.', '15 320,85'] }),
    15320.85
  );

  const conflictingPeriodRows = context.extractZupRowsFromGrid_(
    context.htmlToZupGrid_(
      '<table><tr><td>Начислено</td></tr><tr><td>Оплата по окладу</td><td>янв. 2024</td><td>89 100,00</td></tr></table>'
    ),
    '13. Расчетный листок О2 янв 2025.html',
    'HTML'
  );
  assert.strictEqual(conflictingPeriodRows[0][4], '01.2024');
  assert.strictEqual(conflictingPeriodRows[0][6], 2024);
  assert.strictEqual(conflictingPeriodRows[0][7], 1);

  const parsedGrid = context.parseZupGrid_(
    context.htmlToZupGrid_(zupHtml),
    '1. Расчетный листок О2 янв 2024.html',
    'HTML'
  );
  assert.strictEqual(parsedGrid.totals.accrued, 89100);
  assert.strictEqual(parsedGrid.totals.withheld, 11583);
  assert.strictEqual(parsedGrid.totals.paid, 77517);
  const quality = context.buildZupParsedQuality_(parsedGrid);
  assert.deepStrictEqual(Array.from(quality.warnings), [
    'Выплачено: итог 77517, распознано 22798.88',
  ]);

  const mixedSectionRows = context.extractZupRowsFromGrid_(
    [
      ['Начислено', '', '', 'Удержано', '', ''],
      ['', '', '', 'Выплачено', '', ''],
      [
        'Премия',
        'февр. 2024',
        '93 625,00',
        'Премии, межрасчет (Банк, вед. № 50 от 20.02.24)',
        'февр. 2024',
        '81 454,00',
      ],
    ],
    '2. Расчетный листок О2 фев 2024',
    'HTML'
  );
  assert.strictEqual(mixedSectionRows.length, 2);
  assert.strictEqual(mixedSectionRows[0][13], 'Начислено');
  assert.strictEqual(mixedSectionRows[0][14], 'Ежемесячные премии');
  assert.strictEqual(mixedSectionRows[0][16], 93625);
  assert.strictEqual(mixedSectionRows[1][13], 'Выплачено');
  assert.strictEqual(mixedSectionRows[1][14], 'Ежемесячные премии');
  assert.strictEqual(mixedSectionRows[1][17], 81454);
  assert.strictEqual(
    context.detectZupCategory_('Больничный за счет работодателя / Премии, межрасчет'),
    'Больничные'
  );
}

{
  function makeFakeFile(name, mimeType, content, parentId) {
    return {
      getId: () => `${name}-id`,
      getName: () => name,
      getMimeType: () => mimeType,
      getLastUpdated: () => new Date(2026, 0, 1),
      getSize: () => content.length,
      getParents: () => {
        let consumed = false;
        return {
          hasNext: () => Boolean(parentId) && !consumed,
          next: () => {
            consumed = true;
            return { getId: () => parentId };
          },
        };
      },
      getBlob: () => ({
        getDataAsString: () => content,
      }),
    };
  }

  const htmlFile = makeFakeFile(
    'Расчетный листок янв 2024.html',
    'text/html',
    '<table><tr><td>Начислено</td></tr><tr><td>Оплата по окладу</td><td>янв. 2024</td><td>21</td><td>168</td><td>21,00 дн.</td><td>89 100,00</td></tr></table>'
  );
  const duplicateDoc = makeFakeFile(
    'Расчетный листок янв 2024',
    'application/vnd.google-apps.document',
    ''
  );
  const groups = context.selectZupImportFileGroups_([htmlFile, duplicateDoc]);
  assert.strictEqual(groups.length, 1);
  assert.strictEqual(groups[0].selected.getMimeType(), 'application/vnd.google-apps.document');
  assert.strictEqual(groups[0].variants.length, 2);

  const equalNameDifferentFolders = context.selectZupImportFileGroups_([
    makeFakeFile('2023.10.pdf', 'application/pdf', '', 'employee-a'),
    makeFakeFile('2023.10.pdf', 'application/pdf', '', 'employee-b'),
  ]);
  assert.strictEqual(equalNameDifferentFolders.length, 2);
  assert.strictEqual(
    vm.runInContext('ZUP_IMPORT_SETTINGS.PARSER_VERSION', context),
    'zup-import-v15-source-isolation-headers'
  );

  assert.strictEqual(
    context.extractZupCompany_([['Организация: ООО Ромашка Период: 10.2023']]),
    'ООО Ромашка'
  );
  assert.strictEqual(
    context.extractZupCompany_([['Организация ООО Ромашка Период 10.2023']]),
    'ООО Ромашка'
  );
  assert.strictEqual(
    context.extractZupCompany_([['Расчетный листок Организация: ООО Ромашка Период: 10.2023']]),
    'ООО Ромашка'
  );
  assert.strictEqual(
    context.extractZupEmployee_([['Сотрудник: Иванов Иван Иванович (00042) Период: 10.2023']]),
    'Иванов Иван Иванович'
  );
  assert.strictEqual(
    context.extractZupEmployee_([
      ['РАСЧЕТНЫЙ ЛИСТОК ЗА ОКТЯБРЬ 2023'],
      ['Отсутствие по болезни (больничный)'],
    ]),
    ''
  );
  assert.strictEqual(context.isZupGeneratedSheet_('Из_1С_Оклад'), true);
  const reconstructionConfigs = context.getZupReconstructionConfigs_();
  assert.strictEqual(reconstructionConfigs.length, 5);
  assert.deepStrictEqual(
    Array.from(reconstructionConfigs.find((config) => config.targetSheetName === 'Из_1С_Оклад').clearColumns),
    ['A', 'B', 'D', 'E', 'F', 'I', 'K', 'L', 'Q', 'R']
  );
  assert.strictEqual(typeof context.createSingleZupReconstructionSheet_, 'function');
  assert.strictEqual(typeof context.copyZupReconstructionStructure_, 'function');
  assert.strictEqual(typeof context.applyZupReconstructionSheetDimensions_, 'function');

  const sheetWrites = {};
  const fakeSpreadsheet = {
    getSheetByName(name) {
      return sheetWrites[name] || null;
    },
    insertSheet(name) {
      const sheet = {
        name,
        values: [],
        clear() {
          this.values = [];
        },
        getLastRow() {
          return this.values.length;
        },
        getRange(row, column, rowCount, columnCount) {
          return {
            setValues: (values) => {
              sheet.values = values;
              return this;
            },
            getValues: () => sheet.values.slice(row - 1, row - 1 + rowCount).map((currentRow) => currentRow.slice(column - 1, column - 1 + columnCount)),
            setFontWeight: () => this,
            setNumberFormat: () => this,
            setNote: () => this,
          };
        },
        setFrozenRows() {},
        autoResizeColumn() {},
      };
      sheetWrites[name] = sheet;
      return sheet;
    },
  };

  context.DriveApp = {
    getFolderById() {
      return {
        getFiles() {
          let used = false;
          return {
            hasNext: () => !used,
            next: () => {
              used = true;
              return htmlFile;
            },
          };
        },
        getFolders() {
          return {
            hasNext: () => false,
          };
        },
      };
    },
  };

  const dryRun = context.importZupFolderCore_(fakeSpreadsheet, 'folder-id', { dryRun: true });
  assert.strictEqual(dryRun.rows.length, 1);
  assert.strictEqual(Boolean(sheetWrites['Импорт_1С_Качество']), true);
  assert.strictEqual(Boolean(sheetWrites['Импорт_1С_QG']), true);
  assert.strictEqual(Boolean(sheetWrites['Импорт_1С_ЗУП']), false);
  assert.strictEqual(Boolean(sheetWrites['Импорт_1С_Свод']), false);
  assert.strictEqual(Boolean(sheetWrites['Импорт_1С_Диагностика']), false);
}

{
  const rows = [
    ['2025_Январь.png', 'Polza VLM', '', 'Вентнагель Ирина Николаевна', '01.2025', '', 2025, 1, '', '', '', '', '', 'Начислено', 'Оклад', 'Оплата по окладу', 89100, '', '', ''],
    ['2026_Февраль.png', 'Polza VLM', 'БИЗНЕС СИСТЕМА ТЕЛЕХАУС ООО', 'Вентнагель Ирина Николаевна', '02.2026', '', 2026, 2, '', '', '', '', '', 'Начислено', 'Оклад', 'Оплата по окладу', 33723, '', '', ''],
    ['2024_Декабрь.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна (000р9)', '12.2024', '', 2024, 12, '', '', '', '', '', 'Начислено', 'Оклад', 'Оплата по окладу', 89100, '', '', ''],
    ['2024_Ноябрь.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна', '11.2024', '', 2024, 11, '', '', '', '', '', 'Начислено', 'Оклад', 'Оплата по окладу', 89100, '', '', ''],
  ];
  const qgRows = context.buildZupQualityGateRows_(rows, []);
  assert.ok(qgRows.some((row) => row[0] === 'Организация' && row[5] === 'БИЗНЕС СИСТЕМА ТЕЛЕХАУС ООО'));
  assert.ok(qgRows.some((row) => row[0] === 'Организация' && row[4] === '01.2025'));
  assert.ok(qgRows.some((row) => row[0] === 'Сотрудник' && /нормализованы/.test(row[8])));
  const quality = context.buildZupReconstructionQuality_(rows.map((row) => ({
    company: row[2],
    employee: row[3],
    period: { year: row[6], month: row[7] },
  })));
  assert.strictEqual(quality.mainCompany, 'О2 КЛАУД ООО');
  assert.strictEqual(quality.mainEmployee, 'Вентнагель Ирина Николаевна');
  assert.ok(quality.periodIssues['2026-02']);
}

{
  const fakeFile = {
    getName: () => '2026_Апрель.png',
    getMimeType: () => 'image/png',
  };
  const row = context.buildZupVlmLogRow_(
    fakeFile,
    'google/gemini-3.5-flash',
    'OK',
    6,
    { usage: { cost_rub: 1.23, prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 } },
    { rows: [] },
    ['review'],
    'trace-123'
  );
  assert.strictEqual(row[9], 'trace-123');
  assert.strictEqual(row[10], 'review');
}

{
  const rows = [
    ['2024_Сентябрь.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна', '09.2024', '', 2024, 9, 19, 19, '', '', '', 'Начислено', 'Оклад', 'Оплата по окладу', 80614.29, '', '', ''],
    ['2024_Сентябрь.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна', '09.2024', '', 2024, 9, 1, 1, '', '', '', 'Начислено', 'Отпуска', 'Отпуск основной', 4172.31, '', '', ''],
    ['2024_Сентябрь.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна', '09.2024', '', 2024, 9, 1, 1, '', '', '', 'Начислено', 'Прочее', 'Командировка', 4313.4, '', '', ''],
  ];
  const qgRows = context.buildZupQualityGateRows_(rows, []);
  assert.ok(qgRows.some((row) => row[0] === 'Неполный оклад' && /Отпуск основной/.test(row[8]) && /Командировка/.test(row[8])));
}

{
  const model = context.buildZupReconstructionModel_([
    {
      period: { year: 2024, month: 2 },
      file: '2024_Февраль.png',
      section: 'Начислено',
      category: 'Оклад',
      workDays: 20,
      paidDays: 19,
      accrued: 84645,
      paid: null,
      kind: 'Оплата по окладу',
      sourceRow: '',
    },
    {
      period: { year: 2024, month: 2 },
      file: '2024_Февраль.png',
      section: 'Начислено',
      category: 'Доплата до оклада',
      workDays: 1,
      paidDays: 1,
      accrued: 4455,
      paid: null,
      kind: 'Доплата до оклада за дни отпуска',
      sourceRow: 'Доплата до оклада за дни отпуска | 1 | 4 455,00',
    },
    {
      period: { year: 2024, month: 2 },
      file: '2024_Февраль.png',
      section: 'Начислено',
      category: 'Ежемесячные премии',
      workDays: null,
      paidDays: null,
      accrued: 93625,
      paid: null,
      kind: 'Премия',
      sourceRow: '',
    },
    {
      period: { year: 2024, month: 2 },
      file: '2024_Февраль.png',
      section: 'Выплачено',
      category: 'Ежемесячные премии',
      workDays: null,
      paidDays: null,
      accrued: null,
      paid: 81454,
      kind: 'Премии, межрасчет',
      sourceRow: '',
    },
    {
      period: { year: 2024, month: 3 },
      file: '2024_Июль.png',
      section: 'Начислено',
      category: 'Ежеквартальные премии',
      workDays: null,
      paidDays: null,
      accrued: 54174.5,
      paid: null,
      kind: 'Премия / 01.01-31.03',
      sourceRow: 'Премия | 01.01-31.03 | 54 174,50',
    },
    {
      period: { year: 2024, month: 9 },
      file: '2024_Сентябрь.png',
      section: 'Начислено',
      category: 'Отпуска',
      workDays: null,
      paidDays: null,
      accrued: 3006.28,
      paid: null,
      paymentDate: new Date(2024, 8, 20),
      statementDate: new Date(2024, 8, 20),
      kind: 'Отпуск основной / 1,00 дн.',
      sourceRow: '',
    },
  ]);
  assert.strictEqual(model.salary[0].amount, 89100);
  assert.strictEqual(model.salary[0].salaryTopUpAmount, 4455);
  assert.strictEqual(model.salary[0].paidDays, 19);
  assert.strictEqual(model.monthlyPremiums[0].accrued, 93625);
  assert.match(context.formatZupPremiumPeriodLabel_(model.monthlyPremiums[0], 'monthly'), /Февраль 2024/);
  assert.match(context.formatZupPremiumPeriodLabel_(model.quarterlyPremiums[0], 'quarterly'), /1 квартал 2024/);
  assert.strictEqual(model.vacations[0].amount, 3006.28);
  assert.strictEqual(model.vacations[0].days, 1);

  const monthlyScaffold = context.buildZupPremiumScaffoldRow_('Февраль 2024', 'monthly');
  assert.strictEqual(monthlyScaffold.key, '2024-02');
  const quarterlyScaffold = context.buildZupPremiumScaffoldRow_('1 квартал 2024 (январь - март)\nАпрель 2024', 'quarterly');
  assert.strictEqual(quarterlyScaffold.key, '2024-Q1');
  const premiumMap = context.buildZupPremiumScaffoldMap_(model.quarterlyPremiums, 'quarterly');
  assert.strictEqual(premiumMap['2024-Q1'].accrued, 54174.5);
}

{
  const model = context.buildZupReconstructionModel_([
    {
      period: { year: 2024, month: 1 },
      file: '2024_Январь.png',
      section: 'Начислено',
      category: 'Оклад',
      workDays: 17,
      paidDays: 17,
      accrued: 89100,
      paid: null,
      kind: 'Оплата по окладу',
      sourceRow: '',
    },
    {
      period: { year: 2024, month: 1 },
      file: '2024_Январь.png',
      section: 'Выплачено',
      category: 'Оклад',
      workDays: null,
      paidDays: null,
      accrued: null,
      paid: 22798.88,
      statement: 'Банк, вед. № 5 от 19.01.24',
      statementDate: new Date(2024, 0, 19),
      paymentDate: new Date(2024, 0, 19),
      kind: 'За первую половину месяца',
      sourceRow: '',
    },
    {
      period: { year: 2024, month: 1 },
      file: '2024_Январь.png',
      section: 'Выплачено',
      category: 'Оклад',
      workDays: null,
      paidDays: null,
      accrued: null,
      paid: 54718.12,
      statement: 'Банк, вед. № 25 от 05.02.24',
      statementDate: new Date(2024, 1, 5),
      paymentDate: new Date(2024, 1, 5),
      kind: 'Зарплата за месяц',
      sourceRow: '',
    },
  ]);
  const itemMap = context.buildZupModelMapByPeriod_(model.salary);
  const inferred = context.inferZupSalaryPaymentScheduleFromItems_(model.salary, calendar);
  const rows = context.buildZupSalaryDiscreteRows_(
    [{ period: { year: 2024, month: 1 } }],
    itemMap,
    calendar,
    inferred
  );
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].part.id, 'firstHalf');
  assert.strictEqual(rows[1].part.id, 'secondHalf');
  assert.strictEqual(rows[0].workDays, 8);
  assert.strictEqual(rows[1].workDays, 9);
  assert.strictEqual(rows[0].workedDays, 8);
  assert.strictEqual(rows[1].workedDays, 9);
  assert.strictEqual(rows[0].amount, 41929.41);
  assert.strictEqual(rows[1].amount, 47170.59);
  assert.strictEqual(context.formatDate_(rows[0].dueDate), '19.01.2024');
  assert.strictEqual(context.formatDate_(rows[1].dueDate), '05.02.2024');
  assert.match(rows[0].statement, /Первая половина месяца/);
  assert.match(rows[0].statement, /Банк, вед\. № 5/);
  assert.match(rows[1].statement, /Вторая половина месяца/);
  assert.match(rows[1].statement, /Банк, вед\. № 25/);
}

{
  const rows = [
    ['2024_Февраль.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна', '02.2024', '', 2024, 2, 19, 19, '', '', '', 'Начислено', 'Оклад', 'Оплата по окладу', 84645, '', '', ''],
    ['2024_Февраль.png', 'Polza VLM', 'О2 КЛАУД ООО', 'Вентнагель Ирина Николаевна', '02.2024', '', 2024, 2, 1, 1, '', '', '', 'Начислено', 'Доплата до оклада', 'Доплата до оклада за дни отпуска', 4455, '', '', ''],
  ];
  const structure = context.buildZupPaymentStructureRows_(rows);
  const topUp = structure.find((row) => row[2] === 'Доплата до оклада');
  assert.ok(topUp);
  assert.strictEqual(topUp[4], 'salary_top_up');
  assert.match(topUp[12], /keep_source_rows_separate/);
  const index = context.buildZupImportAccrualIndex_(rows);
  const imported = context.getZupImportedSalaryAccrual_(index, { year: 2024, month: 2 });
  assert.strictEqual(imported.amount, 89100);
  assert.match(imported.details, /Доплата до оклада/);
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
  assert.strictEqual(result.intervals[0].compensationPrecise, 4);
  assert.strictEqual(result.amount, 10);
}

{
  const result = context.calculateForcedAbsenceCompensation_(
    1000,
    new Date(2024, 1, 24),
    new Date(2024, 1, 29),
    calendar,
    [{ date: new Date(2024, 0, 1), rate: 10 }]
  );
  assert.strictEqual(result.workingDays, 4);
  assert.strictEqual(
    result.workDates.map(context.formatDate_).join(','),
    '26.02.2024,27.02.2024,28.02.2024,29.02.2024'
  );
  assert.strictEqual(result.wageAmount, 4000);
  assert.strictEqual(result.penaltyAmount, 4);
  assert.strictEqual(result.dailyDebts.length, 4);
  assert.deepStrictEqual(
    Array.from(result.dailyDebts.map((item) => item.result.amount)),
    [2, 1.33, 0.67, 0]
  );
  assert.strictEqual(result.dailyRows.length, 3);
  assert.strictEqual(context.formatDate_(result.dailyRows[0].delayStart), '27.02.2024');
  assert.strictEqual(context.formatDate_(result.dailyRows[2].delayStart), '29.02.2024');
  // Vacation days: 28 days per year => 28/365 per calendar day
  const calendarDays = 6; // 24,25,26,27,28,29 Feb 2024
  const expectedVacationDays = (28 / 365) * calendarDays;
  assert.strictEqual(result.vacationDays, expectedVacationDays);
  const expectedVacationAmount = Math.round((1000 * expectedVacationDays + Number.EPSILON) * 100) / 100;
  assert.strictEqual(result.vacationAmount, expectedVacationAmount);
  assert.strictEqual(result.amount, 4000 + 4 + expectedVacationAmount);
  const tableRows = context.buildForcedAbsenceCalculationTableRows_(
    result,
    new Date(2024, 1, 24),
    new Date(2024, 1, 29),
    28
  );
  assert.strictEqual(tableRows.length, 4);
  assert.strictEqual(context.formatDate_(tableRows[0][0]), '26.02.2024');
  assert.strictEqual(tableRows[0][1], 1000);
  assert.strictEqual(tableRows[0][5], 2);
  const docRows = context.buildForcedAbsenceDocTableRows_(result, {
    endDate: new Date(2024, 1, 29),
  });
  assert.deepStrictEqual(Array.from(docRows[0]), [
    'Дата',
    'Просрочка',
    'Пени',
    'Накопительно',
    'Дата',
    'Просрочка',
    'Пени',
    'Накопительно',
  ]);
  assert.strictEqual(docRows.length, 3);
  assert.strictEqual(docRows[1][0], '26.02.2024');
  assert.strictEqual(docRows[1][2], '2,00');
  assert.strictEqual(docRows[1][3], '2,00');
  assert.strictEqual(docRows[1][4], '27.02.2024');
  assert.strictEqual(docRows[1][6], '1,33');
  assert.strictEqual(docRows[1][7], '3,33');
  assert.strictEqual(docRows[2][3], '4,00');
}

{
  const parsed = context.parseA1Cell_('O13');
  assert.strictEqual(parsed.row, 13);
  assert.strictEqual(parsed.column, 15);
  assert.strictEqual(context.parseA1Cell_('bad'), null);
}

{
  const salaryTable = {
    columns: {
      year: 3,
      month: 4,
      period: null,
    },
  };
  const salaryRowWithSideSummary = [
    21,
    21,
    1,
    2023,
    'ноя',
    1.0111,
    90089.01,
    90089.01,
    89100,
    989.01,
    null,
    null,
    null,
    'ИТОГО ИНДЕКСАЦИЯ НЕДОПЛАТЫ:',
  ];
  assert.strictEqual(
    context.isReportSummaryRow_(salaryRowWithSideSummary, salaryTable),
    false
  );
  assert.strictEqual(
    context.isReportSummaryRow_(['ИТОГО, руб.:'], salaryTable),
    true
  );
}

{
  assert.strictEqual(
    context.buildDetailedCompensationEntryTitle_(
      { id: 'monthlyPremiums' },
      'апрель 2024',
      ''
    ),
    'Ежемесячные премии (апрель 2024)'
  );
  assert.strictEqual(
    context.buildDetailedCompensationDelayHeading_(
      {
        groupId: 'monthlyPremiums',
        title: 'Ежемесячные премии (апрель 2024)',
        periodLabel: 'апрель 2024',
      },
      6
    ),
    '7.7. Задержка заработной платы - ежемесячные премии (апрель 2024)'
  );
  assert.strictEqual(
    context.buildDetailedCompensationDelayHeading_(
      {
        groupId: 'vacation',
        title: 'Отпуска (август 2025)',
        periodLabel: 'август 2025',
      },
      50
    ),
    '7.51. Задержка отпускных (август 2025)'
  );
}

{
  const values = [
    ['', 'ДАТА УВОЛЬНЕНИЯ', '', 'ДАТА РЕШЕНИЯ СУДА'],
    ['', new Date(2024, 3, 21), '', new Date(2026, 5, 19)],
    ['Среднедневной заработок', '', '', ''],
    [17754.84, '', '', ''],
  ];
  const fakeSheet = {
    getName: () => 'Основной',
    getLastRow: () => values.length,
    getLastColumn: () => values[0].length,
    getRange() {
      return {
        getValues: () => values,
        getDisplayValues: () => values.map((row) => row.map((value) =>
          value instanceof Date ? context.formatDate_(value) : String(value || '')
        )),
        getRichTextValues: () => values.map((row) => row.map(() => ({ getLinkUrl: () => '' }))),
      };
    },
  };
  const params = context.readClaimCalculationParams_({
    getSheets: () => [fakeSheet],
  });
  assert.strictEqual(context.formatDate_(params.startDate), '21.04.2024');
  assert.strictEqual(context.formatDate_(params.endDate), '19.06.2026');
  assert.strictEqual(params.averageDailyEarning, 17754.84);
}

{
  const averageDailyColumnValues = [
    [15000],
    [''],
    [17754.84],
    [''],
  ];
  const vacationSheet = {
    getName: () => 'Отпуска и расчет',
    getLastRow: () => 1 + averageDailyColumnValues.length,
    getRange(row, column, rowCount, columnCount) {
      assert.strictEqual(row, 2);
      assert.strictEqual(column, 5);
      assert.strictEqual(rowCount, averageDailyColumnValues.length);
      assert.strictEqual(columnCount, 1);
      return {
        getValues: () => averageDailyColumnValues,
      };
    },
  };
  const spreadsheet = {
    getSheetByName(name) {
      return name === 'Отпуска и расчет' ? vacationSheet : null;
    },
  };
  assert.strictEqual(context.readAverageDailyEarningFromVacationSheet_(spreadsheet), 17754.84);
}

{
  const calculated = context.calculateClaimCalculationResult_({
    getSheetByName: () => null,
  }, {
    startDate: new Date(2026, 3, 21),
    endDate: new Date(2026, 5, 19),
    averageDailyEarning: null,
  }, [
    {
      label: 'сумма прогул',
      values: [9463329.72],
    },
  ]);
  assert.strictEqual(calculated.ready, false);
}

{
  const values = [
    ['', 'ИТОГО МАТОТВЕТСТВЕННОСТЬ:', 7617007.39],
    ['', 'СУММА ПРОГУЛ:', ''],
    ['', 'СУММА МАТОТВ:', ''],
    ['', 'СУММА ОТПУСКА:', ''],
  ];
  const formats = {};
  const notes = {};
  const fakeSheet = {
    getName: () => 'Расчет',
    getLastRow: () => values.length,
    getLastColumn: () => values[0].length,
    getRange(row, column, rowCount, columnCount) {
      if (rowCount && columnCount) {
        return {
          getValues: () => values
            .slice(row - 1, row - 1 + rowCount)
            .map((sourceRow) => sourceRow.slice(column - 1, column - 1 + columnCount)),
          getDisplayValues: () => values
            .slice(row - 1, row - 1 + rowCount)
            .map((sourceRow) => sourceRow
              .slice(column - 1, column - 1 + columnCount)
              .map((value) => String(value || ''))),
        };
      }
      return {
        setValue(value) {
          values[row - 1][column - 1] = value;
          return this;
        },
        setNumberFormat(format) {
          formats[`${row}:${column}`] = format;
          return this;
        },
        setNote(note) {
          notes[`${row}:${column}`] = note;
          return this;
        },
      };
    },
  };
  const labelValues = context.scanSheetLabelValues_(fakeSheet, {
    rows: 20,
    columns: 10,
    includeRichText: false,
  });
  const written = context.writeClaimCalculationResultToSheet_(fakeSheet, {
    startDate: new Date(2026, 3, 21),
    endDate: new Date(2026, 5, 19),
    averageDailyEarning: 17754.84,
    workingDays: 40,
    wageAmount: 9463331.26,
    penaltyAmount: 4350082.78,
    vacationDays: 4.602739726027397,
    vacationAmount: 1075992.12,
  }, labelValues);
  assert.strictEqual(written, 3);
  assert.strictEqual(values[0][2], 7617007.39);
  assert.strictEqual(values[1][2], 9463331.26);
  assert.strictEqual(values[2][2], 4350082.78);
  assert.strictEqual(values[3][2], 1075992.12);
  assert.strictEqual(formats['2:3'], '#,##0.00');
  assert.match(notes['2:3'], /Период расчета: 21\.04\.2026 - 19\.06\.2026/);
  assert.match(notes['3:3'], /Пени ст\. 236 ТК РФ/);
  assert.match(notes['4:3'], /Календарных дней периода: 60/);
}

{
  const calls = [];
  const body = {
    appendParagraph(text) {
      calls.push(['appendParagraph', text]);
      return {
        setHeading(value) {
          calls.push(['setHeading', value]);
          return this;
        },
        setSpacingBefore(value) {
          calls.push(['setSpacingBefore', value]);
          return this;
        },
        setSpacingAfter(value) {
          calls.push(['setSpacingAfter', value]);
          return this;
        },
        editAsText() {
          return {
            setFontSize(value) {
              calls.push(['setFontSize', value]);
              return this;
            },
            setForegroundColor(value) {
              calls.push(['setForegroundColor', value]);
              return this;
            },
          };
        },
      };
    },
  };
  context.appendHiddenClaimMarker_(body, '[[AUTO_CLAIM_CALCULATION_START]]');
  assert.deepStrictEqual(calls, [
    ['appendParagraph', '[[AUTO_CLAIM_CALCULATION_START]]'],
    ['setHeading', 'NORMAL'],
    ['setSpacingBefore', 0],
    ['setSpacingAfter', 0],
    ['setFontSize', 1],
    ['setForegroundColor', '#ffffff'],
  ]);
}

{
  const makeParagraph = (text) => ({
    text,
    getType: () => 'PARAGRAPH',
    asParagraph: () => ({
      getText: () => text,
      setText(value) {
        this.text = value;
        return this;
      },
    }),
  });
  const children = [
    makeParagraph('[[AUTO_CLAIM_CALCULATION_START]]'),
    makeParagraph('Автоматически обновляемый расчет'),
    makeParagraph('[[AUTO_CLAIM_CALCULATION_END]]'),
  ];
  const body = {
    getNumChildren: () => children.length,
    getChild: (index) => children[index],
    appendParagraph(text) {
      children.push(makeParagraph(text));
      return children[children.length - 1];
    },
    removeChild(child) {
      if (children.length === 1) {
        throw new Error("Can't remove the last paragraph in a document section.");
      }
      const index = children.indexOf(child);
      assert.notStrictEqual(index, -1);
      children.splice(index, 1);
    },
  };
  context.replaceClaimCalculationAutoBlock_(body);
  assert.strictEqual(children.length, 1);
  assert.strictEqual(children[0].asParagraph().getText(), '');
}

{
  const makeParagraph = (text) => ({
    getType: () => 'PARAGRAPH',
    asParagraph: () => ({
      getText: () => text,
      setText: () => this,
    }),
  });
  const children = [
    makeParagraph('Ручной текст'),
    makeParagraph('[[AUTO_CLAIM_CALCULATION_START]]'),
    makeParagraph('Автоматически обновляемый расчет'),
    makeParagraph('[[AUTO_CLAIM_CALCULATION_END]]'),
  ];
  let appended = 0;
  const body = {
    getNumChildren: () => children.length,
    getChild: (index) => children[index],
    appendParagraph(text) {
      appended += 1;
      children.push(makeParagraph(text));
      return children[children.length - 1];
    },
    removeChild(child) {
      const index = children.indexOf(child);
      assert.notStrictEqual(index, -1);
      children.splice(index, 1);
    },
  };
  context.replaceClaimCalculationAutoBlock_(body);
  assert.strictEqual(appended, 1);
  assert.strictEqual(children.length, 2);
  assert.strictEqual(children[0].asParagraph().getText(), 'Ручной текст');
  assert.strictEqual(children[1].asParagraph().getText(), '');
}

{
  assert.strictEqual(
    context.extractGoogleDocUrl_('https://docs.google.com/document/d/1Uy_r1TuOS-l8SPlvCtRSeMYEYK0ydYPugwKJJJwnAjE/edit?usp=sharing'),
    'https://docs.google.com/document/d/1Uy_r1TuOS-l8SPlvCtRSeMYEYK0ydYPugwKJJJwnAjE/edit'
  );
  assert.strictEqual(context.isDetailedCompensationDocLabel_('Расписанный расчёт:'), true);
  assert.strictEqual(
    context.extractGoogleDocId_('https://docs.google.com/document/d/1Uy_r1TuOS-l8SPlvCtRSeMYEYK0ydYPugwKJJJwnAjE/edit?tab=t.0#heading=h.gu6y48a4iy08'),
    '1Uy_r1TuOS-l8SPlvCtRSeMYEYK0ydYPugwKJJJwnAjE'
  );
  assert.strictEqual(context.formatMoneyRu_(7624537.92, 2), '7 624 537,92');
  assert.strictEqual(context.formatMoneyRu_(3626.6667, 3), '3 626,667');
  assert.strictEqual(
    context.formatMoneyWordsRu_(25140.01),
    'двадцать пять тысяч сто сорок рублей 01 копейка'
  );
}

console.log('date logic ok');
