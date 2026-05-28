const SETTINGS = {
  SPREADSHEET_ID: '15GQcgRInpcISWHn6hXvH0b-iSziPpQngl_Ggh-3EQ7o',
  SHEET_NAME: '',
  SOURCE_PAGE_URL: 'https://calc.consultant.ru/ind',
  SALARY_COMPENSATION_PAGE_URL: 'https://calc.consultant.ru/kompensaciya-zarplata',
  INDEX_URLS: [
    'https://calc.consultant.ru/conf/calc_ind/indexes.json',
    'https://calc.consultant.ru/conf/calc_ind/indexes_from_2022.json',
  ],
  SALARY_COMPENSATION_RATES_URL: 'https://calc.consultant.ru/conf/calc_395/rates.json',
  PRODUCTION_CALENDAR_URL: 'https://calc.consultant.ru/conf/calc/calendar.json',
  REGION_ID: 1,
  INCLUDE_DEFLATION_MONTHS: false,
  USE_FIXED_COLUMNS: true,
  HEADER_ROW: 2,
  DATA_START_ROW: 3,
  YEAR_COLUMN: 'D',
  MONTH_COLUMN: 'E',
  MONTHLY_IPC_COLUMN: 'F',
  UNDERPAYMENT_COLUMN: 'J',
  TARGET_COLUMN: 'K',
  TOTAL_UNDERPAYMENT_COLUMN: 'L',
  PENALTY_COLUMN: 'M',
  HEADER_SCAN_ROWS: 20,
  IPC_FORMAT: '0.0000',
  MONEY_FORMAT: '#,##0.00',
  BACKGROUND_DEFAULT: '#ffffff',
  BACKGROUND_MISSING_DATA: '#fff2cc',
  BACKGROUND_DEFLATION: '#eadcf8',
  METHODOLOGY_SHEET_NAME: 'Методология',
  SHEET_LAYOUTS: [
    {
      id: 'monthlyPremiums',
      namePattern: '^ежемесяч',
      headerRow: 1,
      dataStartRow: 2,
      periodColumn: 'C',
      correctAmountColumn: 'B',
      underpaymentColumn: 'G',
      targetColumn: 'H',
      totalUnderpaymentColumn: 'G',
      penaltyColumn: 'I',
      unpaidLabel: 'недоплата по ежемесячным премиям',
      totalLabel: 'недоплата по ежемесячным премиям',
      updateMonthlyIpc: false,
    },
    {
      id: 'quarterlyPremiums',
      namePattern: '^ежекварт',
      headerRow: 1,
      dataStartRow: 2,
      periodColumn: 'C',
      correctAmountColumn: 'B',
      underpaymentColumn: 'G',
      targetColumn: 'H',
      totalUnderpaymentColumn: 'G',
      penaltyColumn: 'I',
      unpaidLabel: 'недоплата ежеквартальных премий',
      totalLabel: 'недоплата ежеквартальных премий',
      updateMonthlyIpc: false,
    },
    {
      id: 'vacation',
      namePattern: '^отпуск',
      headerRow: 1,
      dataStartRow: 2,
      periodColumn: 'A',
      correctAnnualSalaryColumn: 'B',
      underpaymentColumn: 'J',
      targetColumn: 'K',
      totalUnderpaymentColumn: 'J',
      penaltyColumn: 'L',
      unpaidLabel: 'недоплата по отпускным выплатам',
      totalLabel: 'недоплата по отпускным выплатам',
      updateMonthlyIpc: false,
    },
    {
      id: 'annualPremiums',
      namePattern: '^ежегод',
      headerRow: 1,
      dataStartRow: 2,
      periodColumn: 'C',
      correctAmountColumn: 'B',
      underpaymentColumn: 'G',
      targetColumn: 'H',
      totalUnderpaymentColumn: 'G',
      penaltyColumn: 'I',
      unpaidLabel: 'недоплата ежегодных премий',
      totalLabel: 'недоплата ежегодных премий',
      updateMonthlyIpc: false,
    },
    {
      id: 'salary',
      namePattern: '.*',
      headerRow: 2,
      dataStartRow: 3,
      yearColumn: 'D',
      monthColumn: 'E',
      monthlyIpcColumn: 'F',
      correctAmountColumn: 'H',
      underpaymentColumn: 'J',
      targetColumn: 'K',
      totalUnderpaymentColumn: 'J',
      penaltyColumn: 'L',
      unpaidLabel: 'недоплата по окладу',
      totalLabel: 'недоплата по окладу',
      updateMonthlyIpc: true,
    },
  ],
};

const HEADER_ALIASES = {
  year: ['год', 'расчетный период год', 'расчётный период год'],
  month: ['мес', 'месяц', 'расчетный период мес', 'расчётный период мес'],
  paymentDate: ['дата выплаты', 'дата выплаты премии', 'дата выплаты отпуск', 'дата выплаты отпуска'],
  unpaidSalary: ['недоплата по окладу', 'невыплаченный оклад', 'невыплаченная часть оклада', 'недоплата по отпускным выплатам'],
  target: ['сумма индексации недоплаты', 'сумма индексации самой недоплаты'],
  totalUnderpayment: ['общая недоплата по окладу'],
  correctAmount: ['размер надлежащей к выплате премии', 'размер надлежащей к выплате', 'размер надлежащей выплаты', 'надлежащей к выплате премии'],
  correctAnnualSalary: ['сумма корректного годового заработка', 'корректный годовой заработок'],
  vacationStartDate: ['дата начала отпуска', 'начало отпуска', 'дата начала периода отпуска'],
  annualPremiumYear: ['за какой год премия', 'год премии', 'год расчета премии', 'год расчёта премии'],
};

const MONTHS = {
  '1': 1,
  '01': 1,
  'янв': 1,
  'январь': 1,
  'января': 1,
  '2': 2,
  '02': 2,
  'фев': 2,
  'февраль': 2,
  'февраля': 2,
  '3': 3,
  '03': 3,
  'мар': 3,
  'март': 3,
  'марта': 3,
  '4': 4,
  '04': 4,
  'апр': 4,
  'апрель': 4,
  'апреля': 4,
  '5': 5,
  '05': 5,
  'май': 5,
  'мая': 5,
  '6': 6,
  '06': 6,
  'июн': 6,
  'июнь': 6,
  'июня': 6,
  '7': 7,
  '07': 7,
  'июл': 7,
  'июль': 7,
  'июля': 7,
  '8': 8,
  '08': 8,
  'авг': 8,
  'август': 8,
  'августа': 8,
  '9': 9,
  '09': 9,
  'сен': 9,
  'сент': 9,
  'сентябрь': 9,
  'сентября': 9,
  '10': 10,
  'окт': 10,
  'октябрь': 10,
  'октября': 10,
  '11': 11,
  'ноя': 11,
  'ноябрь': 11,
  'ноября': 11,
  '12': 12,
  'дек': 12,
  'декабрь': 12,
  'декабря': 12,
};

const AVERAGE_EARNINGS_540_START_DATE = new Date(2025, 8, 1); // 1 сентября 2025

function onOpen() {
  const ui = getSpreadsheetUi_();
  if (!ui) {
    console.log('onOpen только добавляет меню в таблицу. Для проверки из редактора запустите runIndexationFromEditor.');
    return;
  }

  ui.createMenu('Индексация недоплаты')
    .addItem('Обновить все листы', 'updateAllSheetsIndexation')
    .addItem('Обновить активный лист', 'updateUnpaidSalaryIndexation')
    .addItem('Обновить ежемесячные премии', 'updateMonthlyPremiumIndexation')
    .addItem('Обновить квартальные премии', 'updateQuarterlyPremiumIndexation')
    .addItem('Обновить ежегодные премии', 'updateAnnualPremiumIndexation')
    .addItem('Обновить отпуска', 'updateVacationIndexation')
    .addToUi();

  ui.createMenu('Импорт 1С')
    .addItem('Импортировать расчетные листки', 'importZupFolder')
    .addItem('Очистить импорт 1С', 'clearZupImportSheets')
    .addToUi();
}

function runIndexationFromEditor() {
  updateAllSheetsIndexation();
}

function runMonthlyPremiumIndexationFromEditor() {
  updateMonthlyPremiumIndexation();
}

function runQuarterlyPremiumIndexationFromEditor() {
  updateQuarterlyPremiumIndexation();
}

function runAnnualPremiumIndexationFromEditor() {
  updateAnnualPremiumIndexation();
}

function updateAllSheetsIndexation() {
  const spreadsheet = getTargetSpreadsheet_();
  const sheets = spreadsheet.getSheets();
  const results = [];
  const processedLayouts = new Set();

  const layoutIds = ['salary', 'monthlyPremiums', 'quarterlyPremiums', 'annualPremiums', 'vacation'];

  for (const layoutId of layoutIds) {
    try {
      const sheet = sheets.find(
        (candidate) =>
          !isGeneratedSheetName_(candidate.getName()) &&
          getSheetLayout_(candidate.getName()).id === layoutId
      );
      if (sheet && !processedLayouts.has(layoutId)) {
        const result = updateUnpaidSalaryIndexationCore_({
          sheet: sheet,
        });
        results.push(result);
        SpreadsheetApp.flush();
        processedLayouts.add(layoutId);
      }
    } catch (error) {
      Logger.log(`Не удалось пересчитать лист "${layoutId}": ${error && error.message ? error.message : error}`);
    }
  }

  deleteLegacyGeneratedSheets_(spreadsheet);
  showAllUpdateResults_(results);
}

function updateUnpaidSalaryIndexation() {
  const sheet = getTargetSheet_();
  if (isGeneratedSheetName_(sheet.getName())) {
    showMessage_(`Лист "${sheet.getName()}" служебный и не пересчитывается как расчетный. Запустите "Обновить все листы" или выберите расчетный лист.`);
    return;
  }

  const result = updateUnpaidSalaryIndexationCore_({
    sheet,
  });

  showUpdateResult_(result);
}

function updateMonthlyPremiumIndexation() {
  const result = updateUnpaidSalaryIndexationCore_({
    sheet: getSheetByLayout_('monthlyPremiums'),
  });

  showUpdateResult_(result);
}

function updateQuarterlyPremiumIndexation() {
  const result = updateUnpaidSalaryIndexationCore_({
    sheet: getSheetByLayout_('quarterlyPremiums'),
  });

  showUpdateResult_(result);
}

function updateAnnualPremiumIndexation() {
  const result = updateUnpaidSalaryIndexationCore_({
    sheet: getSheetByLayout_('annualPremiums'),
  });

  showUpdateResult_(result);
}

function updateVacationIndexation() {
  const result = updateUnpaidSalaryIndexationCore_({
    sheet: getSheetByLayout_('vacation'),
  });

  showUpdateResult_(result);
}

function showUpdateResult_(result) {
  const columnsUpdated = [];
  if (result.updatedIndexation) {
    columnsUpdated.push(`Колонка ${result.targetColumn} (индексация)`);
  }
  if (result.updatedPenalty) {
    columnsUpdated.push(`Колонка ${result.penaltyColumn} (пени ст. 236 ТК РФ)`);
  }
  const columnsInfo = columnsUpdated.length > 0 ? `. Обновлены: ${columnsUpdated.join(', ')}.` : '';
  const message = `Индексация на листе "${result.sheetName}" завершена. Рассчитано строк: ${result.calculated}. Пропущено строк: ${result.skipped}${columnsInfo}`;
  showMessage_(message);
}

function showAllUpdateResults_(results) {
  if (results.length === 0) {
    const message = 'Не найдено листов для обновления.';
    console.log(message);
    const ui = getSpreadsheetUi_();
    if (ui) {
      ui.alert(message);
    } else {
      Logger.log(message);
    }
    return;
  }

  const details = results
    .map(
      (result) =>
        `• Лист "${result.sheetName}": рассчитано ${result.calculated}, пропущено ${result.skipped}`
    )
    .join('\n');

  const totalCalculated = results.reduce((sum, r) => sum + r.calculated, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  const message = `Индексация обновлена на ${results.length} листе(ах).\nВсего рассчитано стр: ${totalCalculated}. Всего пропущено стр: ${totalSkipped}.\n\nДетали:\n${details}`;
  showMessage_(message);
}

function showMessage_(message) {
  console.log(message);
  const ui = getSpreadsheetUi_();
  if (ui) {
    ui.alert(message);
  } else {
    Logger.log(message);
  }
}

function deleteLegacyGeneratedSheets_(spreadsheet) {
  ['Проверка', SETTINGS.METHODOLOGY_SHEET_NAME].forEach((sheetName) => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      spreadsheet.deleteSheet(sheet);
    }
  });
}

function isGeneratedSheetName_(sheetName) {
  return sheetName === SETTINGS.METHODOLOGY_SHEET_NAME;
}

function updateUnpaidSalaryIndexationCore_(params) {
  const sheet = params.sheet;
  const spreadsheet = sheet.getParent();
  const timezone = spreadsheet.getSpreadsheetTimeZone();
  const runDate = todayInSpreadsheetTimezone_(timezone);
  const indexes = loadConsultantIndexes_();
  const table = findTable_(sheet);
  const calculationEnd = resolveCalculationEndDate_(
    table.headerValues[table.columns.target],
    runDate
  );
  const penaltyEnd = resolveCalculationEndDate_(
    table.headerValues[table.columns.target],
    calculationEnd.date
  );
  const productionCalendar = loadProductionCalendar_();
  const compensationRates = loadSalaryCompensationRates_();
  const lastRow = sheet.getLastRow();

  if (lastRow <= table.headerRow) {
    return {
      sheetName: sheet.getName(),
      layoutId: table.layout.id,
      calculated: 0,
      skipped: 0,
    };
  }

  const rowCount = lastRow - table.headerRow;
  const range = sheet.getRange(table.headerRow + 1, 1, rowCount, sheet.getLastColumn());
  const values = range.getValues();
  const hasMonthlyIpcColumn = Number.isInteger(table.columns.monthlyIpc);
  const existingOutput = {
    monthlyIpc: hasMonthlyIpcColumn
      ? readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.monthlyIpc, rowCount)
      : null,
    target: readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.target, rowCount),
    penalty: readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.penalty, rowCount),
    correctAnnualSalary: Number.isInteger(table.columns.correctAnnualSalary)
      ? readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.correctAnnualSalary, rowCount)
      : null,
  };
  const monthlyIpcValues = [];
  const monthlyIpcNotes = [];
  const monthlyIpcBackgrounds = [];
  const targetValues = [];
  const targetNotes = [];
  const targetBackgrounds = [];
  const penaltyValues = [];
  const penaltyNotes = [];
  const penaltyBackgrounds = [];
  let calculated = 0;
  let skipped = 0;

  values.forEach((row, rowIndex) => {
    const rowPeriod = parseRowPeriod_(row, table.columns);
    const startDate = rowPeriod
      ? getIndexationStartDate_(rowPeriod.year, rowPeriod.month, productionCalendar)
      : null;
    const year = rowPeriod ? rowPeriod.year : null;
    const month = rowPeriod ? rowPeriod.month : null;
    const unpaidSalary = parseMoney_(row[table.columns.unpaidSalary]);
    const totalUnderpayment = parseMoney_(row[table.columns.totalUnderpayment]);
    const monthlyIpc = hasMonthlyIpcColumn && year && month
      ? getMonthlyIpcCoefficient_(indexes, year, month)
      : null;
    if (hasMonthlyIpcColumn) {
      if (monthlyIpc === null) {
        if (!year || !month) {
          monthlyIpcValues.push([preserveFormulaOrBlank_(existingOutput.monthlyIpc, rowIndex)]);
          monthlyIpcNotes.push([preserveFormulaNoteOrBlank_(existingOutput.monthlyIpc, rowIndex)]);
          monthlyIpcBackgrounds.push([
            preserveFormulaBackgroundOrDefault_(existingOutput.monthlyIpc, rowIndex),
          ]);
        } else {
          monthlyIpcValues.push(['']);
          monthlyIpcNotes.push([
            `Нет ИПЦ к предыдущему месяцу для ${pad2_(month)}.${year} в данных КонсультантПлюс.`,
          ]);
          monthlyIpcBackgrounds.push([SETTINGS.BACKGROUND_MISSING_DATA]);
        }
      } else {
        monthlyIpcValues.push([monthlyIpc.rawCoefficient]);
        monthlyIpcNotes.push([
          buildMonthlyIpcNote_(monthlyIpc),
        ]);
        monthlyIpcBackgrounds.push([
          monthlyIpc.percent < 100 ? SETTINGS.BACKGROUND_DEFLATION : SETTINGS.BACKGROUND_DEFAULT,
        ]);
      }
    }

    if (!startDate || unpaidSalary === null) {
      targetValues.push([preserveFormulaOrBlank_(existingOutput.target, rowIndex)]);
      targetNotes.push([preserveFormulaNoteOrBlank_(existingOutput.target, rowIndex)]);
      targetBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.target, rowIndex)]);
      penaltyValues.push([preserveFormulaOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyNotes.push([preserveFormulaNoteOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.penalty, rowIndex)]);
      skipped++;
      return;
    }

    if (startDate > calculationEnd.date) {
      targetValues.push([preserveFormulaOrBlank_(existingOutput.target, rowIndex)]);
      targetNotes.push([
        preserveFormulaNoteOrText_(
          existingOutput.target,
          rowIndex,
          `Период начинается позже даты окончания расчета ${formatDate_(calculationEnd.date)}.`
        ),
      ]);
      targetBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.target, rowIndex)]);
      penaltyValues.push([preserveFormulaOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyNotes.push([preserveFormulaNoteOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.penalty, rowIndex)]);
      skipped++;
      return;
    }

    if (unpaidSalary <= 0) {
      targetValues.push([0]);
      targetNotes.push([
        `Индексация не начислена: ${table.layout.unpaidLabel} ${unpaidSalary} <= 0.`,
      ]);
      targetBackgrounds.push([
        hasMonthlyIpcColumn && monthlyIpc === null
          ? SETTINGS.BACKGROUND_MISSING_DATA
          : SETTINGS.BACKGROUND_DEFAULT,
      ]);
    } else {
      const vacationEvent = table.layout.id === 'vacation'
        ? getVacationEventDate_(row, table)
        : null;
      const result = table.layout.id === 'vacation'
        ? calculateVacationEarnings_(unpaidSalary, startDate, calculationEnd.date, indexes, {
            regionId: SETTINGS.REGION_ID,
            includeDeflationMonths: SETTINGS.INCLUDE_DEFLATION_MONTHS,
          },
          vacationEvent ? vacationEvent.date : null
        )
        : calculateIndexation_(unpaidSalary, startDate, calculationEnd.date, indexes, {
            regionId: SETTINGS.REGION_ID,
            includeDeflationMonths: SETTINGS.INCLUDE_DEFLATION_MONTHS,
          });

      targetValues.push([result.amount]);
      targetNotes.push([
        table.layout.id === 'vacation'
          ? buildVacationResultNote_(result, startDate, calculationEnd)
          : buildResultNote_(result, startDate, calculationEnd),
      ]);
      targetBackgrounds.push([getIndexationBackground_(result)]);
    }

    if (totalUnderpayment === null) {
      penaltyValues.push([preserveFormulaOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyNotes.push([
        preserveFormulaNoteOrText_(
          existingOutput.penalty,
          rowIndex,
          `Пени не рассчитаны: нет числового значения в колонке ${table.layout.totalUnderpaymentColumn}.`
        ),
      ]);
      penaltyBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.penalty, rowIndex)]);
      skipped++;
      return;
    }

    if (totalUnderpayment <= 0) {
      penaltyValues.push([0]);
      penaltyNotes.push([
        `Пени не начислены: ${table.layout.totalLabel} ${totalUnderpayment} <= 0.`,
      ]);
      penaltyBackgrounds.push([SETTINGS.BACKGROUND_DEFAULT]);
      calculated++;
      return;
    }

    const penaltyResult = calculateSalaryCompensation_(
      totalUnderpayment,
      startDate,
      penaltyEnd.date,
      compensationRates
    );
    penaltyValues.push([penaltyResult.amount]);
    penaltyNotes.push([buildPenaltyNote_(penaltyResult, startDate, penaltyEnd, totalUnderpayment, table.layout)]);
    penaltyBackgrounds.push([SETTINGS.BACKGROUND_DEFAULT]);
    calculated++;
  });

  if (hasMonthlyIpcColumn) {
    const monthlyIpcRange = sheet.getRange(
      table.headerRow + 1,
      table.columns.monthlyIpc + 1,
      rowCount,
      1
    );
    monthlyIpcRange.setValues(monthlyIpcValues);
    monthlyIpcRange.setNotes(monthlyIpcNotes);
    monthlyIpcRange.setBackgrounds(monthlyIpcBackgrounds);
    monthlyIpcRange.setNumberFormat(SETTINGS.IPC_FORMAT);
    sheet
      .getRange(table.headerRow, table.columns.monthlyIpc + 1)
      .setNote(
        `Авторасчет: ${formatDate_(runDate)}. ИПЦ к предыдущему месяцу, коэффициент = процент / 100. В расчете индексации ИПЦ < 100% приводится к 100%. Источник: calc.consultant.ru.`
      );
  }

  const targetRange = sheet.getRange(table.headerRow + 1, table.columns.target + 1, rowCount, 1);
  targetRange.setValues(targetValues);
  targetRange.setNotes(targetNotes);
  targetRange.setBackgrounds(targetBackgrounds);
  targetRange.setNumberFormat(SETTINGS.MONEY_FORMAT);
  sheet
    .getRange(table.headerRow, table.columns.target + 1)
    .setNote(
      `Авторасчет: ${formatDate_(runDate)}. Дата окончания: ${formatDate_(
        calculationEnd.date
      )} (${calculationEnd.source}). Источник ИПЦ и производственного календаря: calc.consultant.ru.`
    );

  SpreadsheetApp.flush();
  const refreshedTotalUnderpaymentValues = sheet
    .getRange(table.headerRow + 1, table.columns.totalUnderpayment + 1, rowCount, 1)
    .getValues();
  penaltyValues.length = 0;
  penaltyNotes.length = 0;
  penaltyBackgrounds.length = 0;

  values.forEach((row, rowIndex) => {
    const startDate = getRowStartDate_(row, table.columns, table.layout, productionCalendar);
    const unpaidSalary = parseMoney_(row[table.columns.unpaidSalary]);

    if (!startDate || unpaidSalary === null) {
      penaltyValues.push([preserveFormulaOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyNotes.push([preserveFormulaNoteOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.penalty, rowIndex)]);
      return;
    }

    if (startDate > calculationEnd.date) {
      penaltyValues.push([preserveFormulaOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyNotes.push([preserveFormulaNoteOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.penalty, rowIndex)]);
      return;
    }

    const totalUnderpayment = parseMoney_(refreshedTotalUnderpaymentValues[rowIndex][0]);
    if (totalUnderpayment === null) {
      penaltyValues.push([preserveFormulaOrBlank_(existingOutput.penalty, rowIndex)]);
      penaltyNotes.push([
        preserveFormulaNoteOrText_(
          existingOutput.penalty,
          rowIndex,
          `Пени не рассчитаны: нет числового значения в колонке ${table.layout.totalUnderpaymentColumn}.`
        ),
      ]);
      penaltyBackgrounds.push([preserveFormulaBackgroundOrDefault_(existingOutput.penalty, rowIndex)]);
      return;
    }

    if (totalUnderpayment <= 0) {
      penaltyValues.push([0]);
      penaltyNotes.push([
        `Пени не начислены: ${table.layout.totalLabel} ${totalUnderpayment} <= 0.`,
      ]);
      penaltyBackgrounds.push([SETTINGS.BACKGROUND_DEFAULT]);
      return;
    }

    const penaltyResult = calculateSalaryCompensation_(
      totalUnderpayment,
      startDate,
      penaltyEnd.date,
      compensationRates
    );
    penaltyValues.push([penaltyResult.amount]);
    penaltyNotes.push([buildPenaltyNote_(penaltyResult, startDate, penaltyEnd, totalUnderpayment, table.layout)]);
    penaltyBackgrounds.push([SETTINGS.BACKGROUND_DEFAULT]);
  });

  const penaltyRange = sheet.getRange(table.headerRow + 1, table.columns.penalty + 1, rowCount, 1);
  penaltyRange.setValues(penaltyValues);
  penaltyRange.setNotes(penaltyNotes);
  penaltyRange.setBackgrounds(penaltyBackgrounds);
  penaltyRange.setNumberFormat(SETTINGS.MONEY_FORMAT);
  sheet
    .getRange(table.headerRow, table.columns.penalty + 1)
    .setNote(
      `Авторасчет: ${formatDate_(runDate)}. Дата окончания пеней: ${formatDate_(
        penaltyEnd.date
      )} (${penaltyEnd.source}). Источник ставок: calc.consultant.ru/kompensaciya-zarplata.`
    );

  if (table.layout.id === 'vacation' && Number.isInteger(table.columns.correctAnnualSalary)) {
    const correctAnnualSalaryRange = sheet.getRange(
      table.headerRow + 1,
      table.columns.correctAnnualSalary + 1,
      rowCount,
      1
    );
    const correctAnnualSalaryValues = [];
    const correctAnnualSalaryNotes = [];
    const correctAnnualSalaryBackgrounds = [];

    values.forEach((row, rowIndex) => {
      const vacationEvent = getVacationEventDate_(row, table);
      const existingValue = preserveFormulaOrBlank_(existingOutput.correctAnnualSalary, rowIndex);
      const existingNote = preserveFormulaNoteOrBlank_(existingOutput.correctAnnualSalary, rowIndex);
      const existingBackground = preserveFormulaBackgroundOrDefault_(existingOutput.correctAnnualSalary, rowIndex);

      if (!vacationEvent) {
        correctAnnualSalaryValues.push([existingValue]);
        correctAnnualSalaryNotes.push([existingNote]);
        correctAnnualSalaryBackgrounds.push([existingBackground]);
        return;
      }

      const reconstructedSalary = calculateVacationCorrectAnnualSalary_(vacationEvent.date, table.layout);
      if (reconstructedSalary === null) {
        correctAnnualSalaryValues.push([existingValue]);
        correctAnnualSalaryNotes.push([existingNote]);
        correctAnnualSalaryBackgrounds.push([existingBackground]);
        return;
      }

      correctAnnualSalaryValues.push([reconstructedSalary]);
      correctAnnualSalaryNotes.push([
        `Реконструированная сумма корректного годового заработка за 12 месяцев до ${formatDate_(vacationEvent.date)}. Дата события: ${vacationEvent.source}. Годовые премии за незавершенный календарный год в отпускную базу не включаются.`,
      ]);
      correctAnnualSalaryBackgrounds.push([SETTINGS.BACKGROUND_DEFAULT]);
    });

    correctAnnualSalaryRange.setValues(correctAnnualSalaryValues);
    correctAnnualSalaryRange.setNotes(correctAnnualSalaryNotes);
    correctAnnualSalaryRange.setBackgrounds(correctAnnualSalaryBackgrounds);
    correctAnnualSalaryRange.setNumberFormat(SETTINGS.MONEY_FORMAT);
    sheet
      .getRange(table.headerRow, table.columns.correctAnnualSalary + 1)
      .setNote('Авторасчет: реконструированная корректная сумма годового заработка по смежным листам.');
  }

  return {
    sheetName: sheet.getName(),
    layoutId: table.layout.id,
    calculated,
    skipped,
    targetColumn: table.layout.targetColumn,
    penaltyColumn: table.layout.penaltyColumn,
    updatedIndexation: true,
    updatedPenalty: true,
  };
}

function findTable_(sheet) {
  if (SETTINGS.USE_FIXED_COLUMNS) {
    const layout = getSheetLayout_(sheet.getName());
    const headerValues = sheet
      .getRange(layout.headerRow, 1, 1, sheet.getLastColumn())
      .getDisplayValues()[0];

    return {
      headerRow: layout.dataStartRow - 1,
      headerValues,
      layout,
      columns: {
        year: layout.yearColumn ? columnLetterToIndex_(layout.yearColumn) : null,
        month: layout.monthColumn ? columnLetterToIndex_(layout.monthColumn) : null,
        period: layout.periodColumn ? columnLetterToIndex_(layout.periodColumn) : null,
        monthlyIpc: layout.updateMonthlyIpc ? columnLetterToIndex_(layout.monthlyIpcColumn) : null,
        unpaidSalary: columnLetterToIndex_(layout.underpaymentColumn),
        correctAmount: layout.correctAmountColumn ? columnLetterToIndex_(layout.correctAmountColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.correctAmount),
        correctAnnualSalary: layout.correctAnnualSalaryColumn ? columnLetterToIndex_(layout.correctAnnualSalaryColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.correctAnnualSalary),
        vacationStartDate: resolveOptionalColumn_(headerValues, HEADER_ALIASES.vacationStartDate),
        annualPremiumYear: resolveOptionalColumn_(headerValues, HEADER_ALIASES.annualPremiumYear),
        target: columnLetterToIndex_(layout.targetColumn),
        totalUnderpayment: columnLetterToIndex_(layout.totalUnderpaymentColumn),
        penalty: columnLetterToIndex_(layout.penaltyColumn),
      },
    };
  }

  const scanRows = Math.min(SETTINGS.HEADER_SCAN_ROWS, sheet.getLastRow());
  const lastColumn = sheet.getLastColumn();
  const rows = sheet.getRange(1, 1, scanRows, lastColumn).getDisplayValues();

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const columns = resolveColumns_(rows[rowIndex]);
    if (columns) {
      return {
        headerRow: rowIndex + 1,
        headerValues: rows[rowIndex],
        layout: getDefaultSheetLayout_(),
        columns,
      };
    }
  }

  throw new Error(
    'Не нашел нужные заголовки: год, мес, Невыплаченный оклад, Сумма индексации самой недоплаты.'
  );
}

function getSheetLayout_(sheetName) {
  const normalizedName = normalizeText_(sheetName);
  return SETTINGS.SHEET_LAYOUTS.find((layout) =>
    new RegExp(layout.namePattern, 'i').test(normalizedName)
  ) || getDefaultSheetLayout_();
}

function getDefaultSheetLayout_() {
  return SETTINGS.SHEET_LAYOUTS[SETTINGS.SHEET_LAYOUTS.length - 1];
}

function resolveColumns_(headerRow) {
  const columns = {};
  Object.keys(HEADER_ALIASES).forEach((key) => {
    const foundIndex = headerRow.findIndex((header) => headerMatches_(header, HEADER_ALIASES[key]));
    if (foundIndex >= 0) {
      columns[key] = foundIndex;
    }
  });

  const requiredKeys = ['year', 'month', 'period', 'unpaidSalary', 'target', 'totalUnderpayment', 'penalty'];
  return requiredKeys.every((key) => Number.isInteger(columns[key])) ? columns : null;
}

function resolveOptionalColumn_(headerValues, aliases) {
  const index = headerValues.findIndex((header) => headerMatches_(header, aliases));
  return index >= 0 ? index : null;
}

function headerMatches_(header, aliases) {
  const normalizedHeader = normalizeText_(header);
  return aliases.some((alias) => normalizedHeader.includes(normalizeText_(alias)));
}

function readExistingOutputColumn_(sheet, startRow, columnIndex, rowCount) {
  const range = sheet.getRange(startRow, columnIndex + 1, rowCount, 1);
  return {
    formulas: range.getFormulas(),
    notes: range.getNotes(),
    backgrounds: range.getBackgrounds(),
  };
}

function preserveFormulaOrBlank_(existingOutput, rowIndex) {
  return existingOutput.formulas[rowIndex][0] || '';
}

function preserveFormulaNoteOrBlank_(existingOutput, rowIndex) {
  return existingOutput.formulas[rowIndex][0] ? existingOutput.notes[rowIndex][0] : '';
}

function preserveFormulaNoteOrText_(existingOutput, rowIndex, text) {
  return existingOutput.formulas[rowIndex][0] ? existingOutput.notes[rowIndex][0] : text;
}

function preserveFormulaBackgroundOrDefault_(existingOutput, rowIndex) {
  return existingOutput.formulas[rowIndex][0]
    ? existingOutput.backgrounds[rowIndex][0]
    : SETTINGS.BACKGROUND_DEFAULT;
}

function getIndexationBackground_(result) {
  if (result.skippedDeflationMonths.length) {
    return SETTINGS.BACKGROUND_DEFLATION;
  }

  if (result.missingMonths.length) {
    return SETTINGS.BACKGROUND_MISSING_DATA;
  }

  return SETTINGS.BACKGROUND_DEFAULT;
}

function loadConsultantIndexes_() {
  const salt = loadDataVersionSalt_();
  const responses = SETTINGS.INDEX_URLS.map((url) =>
    fetchJson_(salt ? `${url}?v=${encodeURIComponent(salt)}` : url)
  );

  return responses
    .reduce((all, data) => all.concat(data), [])
    .filter((item) => item && Number(item.r) === SETTINGS.REGION_ID)
    .reduce((map, item) => {
      map[`${item.y}-${item.m}`] = Number(item.v);
      return map;
    }, {});
}

function loadProductionCalendar_() {
  const salt = loadDataVersionSalt_();
  const data = fetchJson_(
    salt
      ? `${SETTINGS.PRODUCTION_CALENDAR_URL}?v=${encodeURIComponent(salt)}`
      : SETTINGS.PRODUCTION_CALENDAR_URL
  );

  return data.reduce((calendar, item) => {
    calendar[item.year] = item.daysOff;
    return calendar;
  }, {});
}

function loadSalaryCompensationRates_() {
  const salt = loadDataVersionSalt_();
  const data = fetchJson_(
    salt
      ? `${SETTINGS.SALARY_COMPENSATION_RATES_URL}?v=${encodeURIComponent(salt)}`
      : SETTINGS.SALARY_COMPENSATION_RATES_URL
  );
  const rates = data.rates_395 || [];

  // Same normalization as https://calc.consultant.ru/kompensaciya-zarplata.
  rates.splice(1, 10);
  rates.splice(2, 3);

  return rates
    .map((item) => ({
      date: parseIsoLikeDate_(item.date),
      rate: Number(item.rate),
    }))
    .filter((item) => item.date && !Number.isNaN(item.rate))
    .sort((left, right) => left.date - right.date);
}

function loadDataVersionSalt_() {
  try {
    const response = UrlFetchApp.fetch(SETTINGS.SOURCE_PAGE_URL, {
      muteHttpExceptions: true,
      headers: {
        Accept: 'text/html',
      },
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return '';
    }
    const match = response.getContentText().match(/DataVersionSalt\s*=\s*"([^"]+)"/);
    return match ? match[1] : '';
  } catch (error) {
    return '';
  }
}

function fetchJson_(url) {
  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: {
      Accept: 'application/json',
      Referer: SETTINGS.SOURCE_PAGE_URL,
    },
  });
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error(`Не удалось загрузить ${url}. HTTP ${code}`);
  }
  return JSON.parse(response.getContentText());
}

function getTargetSheet_() {
  const spreadsheet = getTargetSpreadsheet_();
  if (SETTINGS.SHEET_NAME) {
    const sheet = spreadsheet.getSheetByName(SETTINGS.SHEET_NAME);
    if (!sheet) {
      throw new Error(`Не найден лист "${SETTINGS.SHEET_NAME}".`);
    }
    return sheet;
  }

  const activeSheet = spreadsheet.getActiveSheet();
  return activeSheet || spreadsheet.getSheets()[0];
}

function getSheetByLayout_(layoutId) {
  const spreadsheet = getTargetSpreadsheet_();
  const sheet = spreadsheet
    .getSheets()
    .find((candidate) => getSheetLayout_(candidate.getName()).id === layoutId);

  if (!sheet) {
    throw new Error(`Не найден лист для шаблона "${layoutId}".`);
  }

  return sheet;
}

function getTargetSpreadsheet_() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  return SpreadsheetApp.openById(SETTINGS.SPREADSHEET_ID);
}

function getSpreadsheetUi_() {
  try {
    return SpreadsheetApp.getUi();
  } catch (error) {
    return null;
  }
}

function calculateIndexation_(principal, startDate, endDate, indexes, options) {
  const months = splitByCalendarMonth_(startDate, endDate);
  const latestIndexPeriod = getLatestIndexPeriod_(indexes);
  let multiplier = 1;
  const usedMonths = [];
  const missingMonths = [];
  const unpublishedMonths = [];
  const skippedDeflationMonths = [];

  months.forEach((period) => {
    const year = period.start.getFullYear();
    const month = period.start.getMonth() + 1;
    const index = indexes[`${year}-${month}`];

    if (!index) {
      if (latestIndexPeriod && compareYearMonth_(year, month, latestIndexPeriod.year, latestIndexPeriod.month) > 0) {
        unpublishedMonths.push(`${pad2_(month)}.${year}`);
      } else {
        missingMonths.push(`${pad2_(month)}.${year}`);
      }
      return;
    }

    if (index < 100 && !options.includeDeflationMonths) {
      skippedDeflationMonths.push(`${pad2_(month)}.${year}`);
      return;
    }

    const daysInMonth = getDaysInMonth_(year, month);
    const periodFactor = (100 + (index - 100) * (period.days / daysInMonth)) / 100;
    multiplier *= periodFactor;
    usedMonths.push({
      year,
      month,
      index,
      days: period.days,
      daysInMonth,
      factor: periodFactor,
    });
  });

  const coefficient = multiplier - 1;

  return {
    amount: roundMoney_(principal * coefficient),
    coefficient,
    multiplier,
    usedMonths,
    missingMonths,
    unpublishedMonths,
    skippedDeflationMonths,
  };
}

function getMonthlyIpcCoefficient_(indexes, year, month) {
  const percent = indexes[`${year}-${month}`];
  if (!percent) {
    return null;
  }

  const rawCoefficient = roundNumber_(percent / 100, 4);

  return {
    percent,
    rawCoefficient,
    coefficient: Math.max(rawCoefficient, 1),
  };
}

function getLatestIndexPeriod_(indexes) {
  return Object.keys(indexes).reduce((latest, key) => {
    const match = key.match(/^(\d{4})-(\d{1,2})$/);
    if (!match) {
      return latest;
    }

    const candidate = {
      year: Number(match[1]),
      month: Number(match[2]),
    };
    if (!latest || compareYearMonth_(candidate.year, candidate.month, latest.year, latest.month) > 0) {
      return candidate;
    }
    return latest;
  }, null);
}

function compareYearMonth_(leftYear, leftMonth, rightYear, rightMonth) {
  return (leftYear * 12 + leftMonth) - (rightYear * 12 + rightMonth);
}

function getVacationCalculationRule_(paymentDate) {
  return paymentDate && paymentDate >= AVERAGE_EARNINGS_540_START_DATE ? '540' : '922';
}

function calculateVacationEarnings_(principal, startDate, endDate, indexes, options, paymentDate) {
  const rule = getVacationCalculationRule_(paymentDate);
  const result = calculateIndexation_(principal, startDate, endDate, indexes, options);
  return {
    ...result,
    rule,
  };
}

function buildVacationResultNote_(result, startDate, calculationEnd) {
  const lines = [
    `Период: ${formatDate_(startDate)} - ${formatDate_(calculationEnd.date)}`,
    `Метод расчета: ${result.rule === '540' ? 'ПП РФ №540 (с 01.09.2025)' : 'ПП РФ №922'}`,
    `Дата начала: 5-е число следующего месяца, перенесенное влево на ближайший рабочий день.`,
    `Дата окончания: ${calculationEnd.source}`,
    `Множитель индексации: ${roundNumber_(result.multiplier, 8)}`,
    `Коэффициент прироста: ${roundNumber_(result.coefficient, 8)}`,
  ];
  if (result.missingMonths.length) {
    lines.push(`Нет ИПЦ: ${result.missingMonths.join(', ')}`);
  }

  if (result.unpublishedMonths.length) {
    lines.push(`ИПЦ еще не опубликован и не включен в множитель: ${result.unpublishedMonths.join(', ')}`);
  }

  if (result.skippedDeflationMonths.length) {
    lines.push(`ИПЦ < 100%, для расчета приведен к 100%: ${result.skippedDeflationMonths.join(', ')}`);
  }

  if (result.rule === '540') {
    lines.push('Средний заработок рассчитан с учетом перехода на ПП РФ №540 с 01.09.2025.');
  }

  return lines.join('\n');
}

function buildMonthlyIpcNote_(monthlyIpc) {
  const lines = [
    `ИПЦ к предыдущему месяцу: ${monthlyIpc.percent}%. Источник: calc.consultant.ru/conf/calc_ind/*.json`,
  ];

  if (monthlyIpc.rawCoefficient < 1) {
    lines.push(
      `В колонке оставлен фактический коэффициент ${monthlyIpc.rawCoefficient}; в расчете индексации он приведен к 1, чтобы не уменьшать реальное содержание зарплаты.`
    );
  }

  return lines.join('\n');
}

function calculateSalaryCompensation_(sum, dueDate, actualPaymentDate, rates) {
  const startDate = addDays_(dueDate, 1);
  const endDate = new Date(
    actualPaymentDate.getFullYear(),
    actualPaymentDate.getMonth(),
    actualPaymentDate.getDate()
  );

  if (endDate < startDate) {
    return {
      amount: 0,
      intervals: [],
      skipped: true,
    };
  }

  const intervals = splitByRatePeriods_(startDate, endDate, rates);
  const amount = intervals.reduce((total, interval) => {
    const compensation = roundMoney_(sum * interval.rate / 100 / 150 * interval.days);
    interval.compensation = compensation;
    return total + compensation;
  }, 0);

  return {
    amount: roundMoney_(amount),
    intervals,
    skipped: false,
  };
}

function splitByRatePeriods_(startDate, endDate, rates) {
  const intervals = [];
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (cursor <= end) {
    const rate = getRateForDate_(cursor, rates);
    const nextRateDate = getNextRateDate_(cursor, rates);
    let intervalEnd = end;
    if (nextRateDate && nextRateDate <= end) {
      intervalEnd = addDays_(nextRateDate, -1);
    }

    intervals.push({
      start: new Date(cursor),
      end: new Date(intervalEnd),
      days: inclusiveDays_(cursor, intervalEnd),
      rate,
      compensation: 0,
    });
    cursor = addDays_(intervalEnd, 1);
  }

  return intervals;
}

function getRateForDate_(date, rates) {
  let rate = 0;
  for (let index = 0; index < rates.length; index++) {
    if (rates[index].date <= date) {
      rate = rates[index].rate;
    } else {
      break;
    }
  }
  return rate;
}

function getNextRateDate_(date, rates) {
  for (let index = 0; index < rates.length; index++) {
    if (rates[index].date > date) {
      return rates[index].date;
    }
  }
  return null;
}

function splitByCalendarMonth_(startDate, endDate) {
  const periods = [];
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (cursor <= end) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const periodEnd = monthEnd < end ? monthEnd : end;
    periods.push({
      start: new Date(cursor),
      end: new Date(periodEnd),
      days: inclusiveDays_(cursor, periodEnd),
    });
    cursor = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate() + 1);
  }

  return periods;
}

function buildResultNote_(result, startDate, calculationEnd) {
  const lines = [
    `Период: ${formatDate_(startDate)} - ${formatDate_(calculationEnd.date)}`,
    `Дата начала: 5-е число следующего месяца, перенесенное влево на ближайший рабочий день.`,
    `Дата окончания: ${calculationEnd.source}`,
    `Множитель индексации: ${roundNumber_(result.multiplier, 8)}`,
    `Коэффициент прироста: ${roundNumber_(result.coefficient, 8)}`,
  ];

  if (result.missingMonths.length) {
    lines.push(`Нет ИПЦ: ${result.missingMonths.join(', ')}`);
  }

  if (result.unpublishedMonths.length) {
    lines.push(`ИПЦ еще не опубликован и не включен в множитель: ${result.unpublishedMonths.join(', ')}`);
  }

  if (result.skippedDeflationMonths.length) {
    lines.push(`ИПЦ < 100%, для расчета приведен к 100%: ${result.skippedDeflationMonths.join(', ')}`);
  }

  return lines.join('\n');
}

function buildPenaltyNote_(result, dueDate, penaltyEnd, principal, layout) {
  const lines = [
    `Сумма для пеней: ${principal} (колонка ${layout.totalUnderpaymentColumn}, "${layout.totalLabel}")`,
    `Установленная дата выплаты: ${formatDate_(dueDate)}`,
    `Период пеней: ${formatDate_(addDays_(dueDate, 1))} - ${formatDate_(penaltyEnd.date)}`,
    `Дата окончания: ${penaltyEnd.source}`,
    `Формула: ${layout.totalLabel} x ставка / 100 / 150 x дни задержки`,
  ];

  if (result.skipped) {
    lines.push('Пени не рассчитаны: дата окончания не позже установленной даты выплаты.');
  } else {
    lines.push(
      `Интервалы ставок: ${result.intervals
        .map((interval) => `${formatDate_(interval.start)}-${formatDate_(interval.end)}: ${interval.rate}% (${interval.days} дн.)`)
        .join('; ')}`
    );
  }

  return lines.join('\n');
}

function parseYear_(value) {
  const number = Number(String(value).replace(/[^\d]/g, ''));
  return number >= 2002 && number <= 2100 ? number : null;
}

function parseMonth_(value) {
  if (value instanceof Date) {
    return value.getMonth() + 1;
  }

  const key = normalizeText_(value).replace(/\./g, '');
  return MONTHS[key] || null;
}

function parseRowPeriod_(row, columns) {
  if (Number.isInteger(columns.period)) {
    return parseMonthYear_(row[columns.period]);
  }

  const year = Number.isInteger(columns.year) ? parseYear_(row[columns.year]) : null;
  const month = Number.isInteger(columns.month) ? parseMonth_(row[columns.month]) : null;
  return year && month ? { year, month } : null;
}

function getRowStartDate_(row, columns, layout, productionCalendar) {
  const period = parseRowPeriod_(row, columns);
  return period ? getIndexationStartDate_(period.year, period.month, productionCalendar) : null;
}

function getVacationEventDate_(row, table) {
  if (Number.isInteger(table.columns.vacationStartDate)) {
    const explicitDate = parseDateValue_(row[table.columns.vacationStartDate]);
    if (explicitDate) {
      return {
        date: explicitDate,
        source: `колонка ${indexToColumnLetter_(table.columns.vacationStartDate)}`,
      };
    }
  }

  if (Number.isInteger(table.columns.period)) {
    const fallbackDate = parseDateValue_(row[table.columns.period]);
    if (fallbackDate) {
      return {
        date: fallbackDate,
        source: `колонка ${table.layout.periodColumn}`,
      };
    }
  }

  return null;
}

function parseDateValue_(value) {
  if (value instanceof Date) {
    return value;
  }

  const text = normalizeText_(value);
  if (!text) {
    return null;
  }

  const parsed = parseDateExpression_(text, new Date().getFullYear());
  if (parsed) {
    return parsed.date;
  }

  const monthYear = parseMonthYear_(value);
  return monthYear ? new Date(monthYear.year, monthYear.month - 1, 1) : null;
}

function calculateVacationCorrectAnnualSalary_(paymentDate, layout) {
  if (!(paymentDate instanceof Date)) {
    return null;
  }

  const endDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
  const startDate = addMonths_(endDate, -12);
  return reconstructCorrectAnnualEarnings_(startDate, endDate, paymentDate);
}

function reconstructCorrectAnnualEarnings_(startDate, endDate, eventDate) {
  const spreadsheet = getTargetSpreadsheet_();
  let total = 0;
  const relevantLayouts = SETTINGS.SHEET_LAYOUTS.filter(
    (layout) => layout.correctAmountColumn && layout.id !== 'vacation'
  );

  relevantLayouts.forEach((layout) => {
    const sheet = spreadsheet
      .getSheets()
      .find((candidate) => getSheetLayout_(candidate.getName()).id === layout.id);
    if (!sheet) {
      return;
    }

    const table = findTable_(sheet);
    if (!Number.isInteger(table.columns.correctAmount)) {
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= table.headerRow) {
      return;
    }

    const rows = sheet.getRange(table.headerRow + 1, 1, lastRow - table.headerRow, sheet.getLastColumn()).getValues();
    rows.forEach((row) => {
      const period = parseRowPeriod_(row, table.columns);
      if (!period) {
        return;
      }

      const periodDate = new Date(period.year, period.month - 1, 1);
      if (periodDate >= startDate && periodDate < endDate) {
        if (
          layout.id === 'annualPremiums' &&
          !isAnnualPremiumCompletedForVacation_(row, table, eventDate)
        ) {
          return;
        }

        const amount = parseMoney_(row[table.columns.correctAmount]);
        if (amount !== null) {
          total += amount;
        }
      }
    });
  });

  return roundMoney_(total);
}

function isAnnualPremiumCompletedForVacation_(row, table, eventDate) {
  const premiumYear = getAnnualPremiumYear_(row, table.columns);
  return premiumYear !== null && premiumYear < eventDate.getFullYear();
}

function getAnnualPremiumYear_(row, columns) {
  if (Number.isInteger(columns.annualPremiumYear)) {
    const explicitYear = parseFirstYear_(row[columns.annualPremiumYear]);
    if (explicitYear) {
      return explicitYear;
    }
  }

  if (Number.isInteger(columns.period)) {
    return parseFirstYear_(row[columns.period]);
  }

  return null;
}

function parseFirstYear_(value) {
  const match = String(value || '').match(/20\d{2}/);
  if (!match) {
    return null;
  }

  return parseYear_(match[0]);
}

function parseMonthYear_(value) {
  if (value instanceof Date) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
    };
  }

  const text = normalizeText_(value).replace(/[,\s]+/g, ' ').trim();
  if (!text) {
    return null;
  }

  const monthYear = text.match(/(\d{1,2})[./-](\d{4})/);
  if (monthYear) {
    const month = Number(monthYear[1]);
    const year = parseYear_(monthYear[2]);
    return year && month >= 1 && month <= 12 ? { year, month } : null;
  }

  const yearMonth = text.match(/(\d{4})[./-](\d{1,2})/);
  if (yearMonth) {
    const year = parseYear_(yearMonth[1]);
    const month = Number(yearMonth[2]);
    return year && month >= 1 && month <= 12 ? { year, month } : null;
  }

  const yearMatch = text.match(/(20\d{2})/);
  if (!yearMatch) {
    return null;
  }
  const year = parseYear_(yearMatch[1]);
  if (!year) {
    return null;
  }

  const months = text
    .split(/\s+/)
    .map((part) => part.replace(/[^а-я0-9.]/g, '').replace(/\./g, ''))
    .map((part) => MONTHS[part])
    .filter((candidate) => Number.isInteger(candidate));

  const month = months.length > 0 ? months[months.length - 1] : null;

  return month ? { year, month } : null;
}

function parseMoney_(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }

  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '')
    .replace(',', '.');

  if (!normalized) {
    return null;
  }

  const number = Number(normalized);
  return Number.isNaN(number) ? null : number;
}

function resolveCalculationEndDate_(targetHeader, fallbackDate) {
  const parsed = parseDateFromHeader_(targetHeader, fallbackDate.getFullYear());
  if (parsed) {
    return {
      date: parsed.date,
      source: parsed.hasExplicitYear
        ? `из заголовка "${targetHeader}"`
        : `из заголовка "${targetHeader}", год ${parsed.date.getFullYear()} взят из даты запуска`,
    };
  }

  return {
    date: fallbackDate,
    source: 'дата запуска скрипта, потому что в заголовке не найдена дата окончания',
  };
}

function parseDateFromHeader_(header, defaultYear) {
  const text = normalizeText_(header);
  const parentheses = [];
  let match;
  const parenthesesRegex = /\(([^)]*)\)/g;
  while ((match = parenthesesRegex.exec(text)) !== null) {
    parentheses.push(match[1]);
  }

  const candidates = parentheses.length ? parentheses : [text];
  for (const candidate of candidates) {
    const parsed = parseDateExpression_(candidate, defaultYear);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function parseDateExpression_(text, defaultYear) {
  const numeric = text.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
  if (numeric) {
    return buildParsedDate_(numeric[1], numeric[2], numeric[3], defaultYear);
  }

  const words = text.match(/(\d{1,2})\s+([а-я.]+)\s*(\d{2,4})?/);
  if (words) {
    const month = MONTHS[words[2].replace(/\./g, '')];
    if (month) {
      return buildParsedDate_(words[1], month, words[3], defaultYear);
    }
  }

  return null;
}

function parseIsoLikeDate_(value) {
  const match = String(value).match(/^(\d{4})[.](\d{2})[.](\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function buildParsedDate_(dayValue, monthValue, yearValue, defaultYear) {
  const day = Number(dayValue);
  const month = Number(monthValue);
  let year = yearValue ? Number(yearValue) : defaultYear;
  if (year < 100) {
    year += 2000;
  }

  if (!day || !month || month < 1 || month > 12 || year < 2002 || year > 2100) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return {
    date,
    hasExplicitYear: Boolean(yearValue),
  };
}

function todayInSpreadsheetTimezone_(timezone) {
  const now = new Date();
  const dateString = Utilities.formatDate(now, timezone, 'yyyy-MM-dd');
  const parts = dateString.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function inclusiveDays_(from, to) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((end - start) / msPerDay) + 1;
}

function addDays_(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths_(date, months) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const newMonth = month + months;
  const result = new Date(year, newMonth, day);
  if (result.getMonth() !== ((newMonth % 12) + 12) % 12) {
    return new Date(result.getFullYear(), result.getMonth() + 1, 0);
  }
  return result;
}

function getDaysInMonth_(year, month) {
  return new Date(year, month, 0).getDate();
}

function getIndexationStartDate_(year, month, productionCalendar) {
  const date = new Date(year, month, 5);
  while (isNonWorkingDay_(date, productionCalendar)) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function isNonWorkingDay_(date, productionCalendar) {
  const yearDaysOff = productionCalendar[date.getFullYear()];
  if (!yearDaysOff) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  const monthDaysOff = yearDaysOff[date.getMonth()];
  if (!monthDaysOff) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  return monthDaysOff.indexOf(`|${date.getDate()}|`) >= 0;
}

function formatDate_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd.MM.yyyy');
}

function normalizeText_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function roundMoney_(value) {
  return roundNumber_(value, 2);
}

function roundNumber_(value, digits) {
  const multiplier = Math.pow(10, digits);
  return Math.round((Number(value) + Number.EPSILON) * multiplier) / multiplier;
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}

function columnLetterToIndex_(columnLetter) {
  const letters = String(columnLetter).trim().toUpperCase();
  let index = 0;
  for (let i = 0; i < letters.length; i++) {
    index = index * 26 + letters.charCodeAt(i) - 64;
  }
  return index - 1;
}

function indexToColumnLetter_(columnIndex) {
  let index = columnIndex + 1;
  let letters = '';
  while (index > 0) {
    const remainder = (index - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    index = Math.floor((index - 1) / 26);
  }
  return letters;
}
