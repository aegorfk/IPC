const SETTINGS = {
  SPREADSHEET_ID: '15GQcgRInpcISWHn6hXvH0b-iSziPpQngl_Ggh-3EQ7o',
  SHEET_NAME: '',
  SOURCE_PAGE_URL: 'https://calc.consultant.ru/ind',
  SALARY_COMPENSATION_PAGE_URL: 'https://calc.consultant.ru/kompensaciya-zarplata',
  CLAIM_CALCULATION_DOC_URL: 'https://docs.google.com/document/d/1Uy_r1TuOS-l8SPlvCtRSeMYEYK0ydYPugwKJJJwnAjE/edit',
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
      liabilityTiming: 'single_due_date',
      recoveryPrincipalOutput: true,
      recoveryLiabilityOutput: true,
      recoveryIndexationOutput: true,
      derivativeOutput: false,
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
      liabilityTiming: 'single_due_date',
      recoveryPrincipalOutput: true,
      recoveryLiabilityOutput: true,
      recoveryIndexationOutput: true,
      derivativeOutput: false,
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
      annualSalaryDivisorColumn: 'C',
      vacationDaysColumn: 'D',
      averageDailyEarningColumn: 'E',
      actualDerivativeAmountColumn: 'H',
      correctDerivativeAmountColumn: 'I',
      derivativeUnderpaymentColumn: 'J',
      derivativeIndexationColumn: 'K',
      derivativeLiabilityColumn: 'L',
      underpaymentColumn: 'J',
      targetColumn: 'K',
      totalUnderpaymentColumn: 'J',
      penaltyColumn: 'L',
      liabilityTiming: 'single_due_date',
      recoveryPrincipalOutput: true,
      recoveryLiabilityOutput: true,
      recoveryIndexationOutput: true,
      derivativeOutput: true,
      derivativeOwnedOutputs: [
        'correctAnnualSalary', 'averageDailyEarning', 'correctDerivativeAmount',
        'derivativeUnderpayment', 'derivativeIndexation', 'derivativeLiability',
      ],
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
      liabilityTiming: 'single_due_date',
      recoveryPrincipalOutput: true,
      recoveryLiabilityOutput: true,
      recoveryIndexationOutput: true,
      derivativeOutput: false,
      unpaidLabel: 'недоплата ежегодных премий',
      totalLabel: 'недоплата ежегодных премий',
      updateMonthlyIpc: false,
    },
    {
      id: 'salary',
      namePattern: '^(оклад|заработ)',
      headerRow: 2,
      dataStartRow: 3,
      yearColumn: 'D',
      monthColumn: 'E',
      monthlyIpcColumn: 'F',
      salaryBeforeIndexationColumn: 'G',
      correctAmountColumn: 'H',
      underpaymentColumn: 'J',
      targetColumn: 'K',
      totalUnderpaymentColumn: 'J',
      penaltyColumn: 'L',
      liabilityTiming: 'salary_schedule',
      recoveryPrincipalOutput: true,
      recoveryLiabilityOutput: true,
      recoveryIndexationOutput: true,
      derivativeOutput: false,
      unpaidLabel: 'недоплата по окладу',
      totalLabel: 'недоплата по окладу',
      updateMonthlyIpc: true,
    },
  ],
};

const HEADER_ALIASES = {
  year: ['год', 'расчетный период год', 'расчётный период год'],
  month: ['мес', 'месяц', 'расчетный период мес', 'расчётный период мес'],
  period: ['период', 'период премии', 'расчетный период', 'расчётный период',
    'месяц, год расчета', 'месяц год расчета', 'месяц, год расчёта'],
  paymentDate: ['дата выплаты', 'дата выплаты премии', 'дата выплаты отпуск', 'дата выплаты отпуска', 'дата ведомости выплат'],
  paymentStatement: ['ведомости выплат', 'ведомость выплаты', 'ведомость'],
  unpaidSalary: ['недоплата по окладу', 'невыплаченный оклад', 'невыплаченная часть оклада', 'недоплата по отпускным выплатам'],
  target: ['сумма индексации недоплаты', 'сумма индексации самой недоплаты'],
  totalUnderpayment: ['общая недоплата по окладу'],
  correctAmount: ['размер надлежащей к выплате премии', 'размер надлежащей к выплате', 'размер надлежащей выплаты', 'надлежащей к выплате премии'],
  salaryBeforeIndexation: ['оклад до индексации', 'заработная плата до индексации', 'сумма до индексации'],
  correctAnnualSalary: ['сумма корректного годового заработка', 'корректный годовой заработок'],
  annualSalaryDivisor: ['делитель среднего заработка', 'делитель'],
  vacationDays: ['количество дней отпуска', 'дни отпуска', 'количество дней'],
  averageDailyEarning: ['среднедневной заработок', 'средний дневной заработок'],
  actualDerivativeAmount: ['начислено по расчетным листкам', 'фактически начислено', 'фактически выплачено'],
  correctDerivativeAmount: ['корректное начисление', 'надлежащее начисление отпускных'],
  vacationStartDate: ['дата начала отпуска', 'начало отпуска', 'дата начала периода отпуска'],
  annualPremiumYear: ['за какой год премия', 'год премии', 'год расчета премии', 'год расчёта премии'],
  penalty: ['пени ст. 236', 'пени по ст. 236', 'материальная ответственность', 'ст. 236 тк рф'],
};

const SHEET_LAYOUT_SEMANTIC_CONTRACTS = {
  salary: {
    requiredFields: ['year', 'month'],
    requiredPatterns: [/(оклад|заработн.*плат)/],
  },
  monthlyPremiums: {
    requiredFields: [],
    requiredPatterns: [/(ежемесяч[^|]*прем|месячн[^|]*прем)/, /(период|месяц|дата выплаты)/],
  },
  quarterlyPremiums: {
    requiredFields: [],
    requiredPatterns: [/(ежекварт[^|]*прем|квартальн[^|]*прем)/, /(период|квартал|дата выплаты)/],
  },
  annualPremiums: {
    requiredFields: [],
    requiredPatterns: [/(ежегод[^|]*прем|годов[^|]*прем)/, /(период|год|дата выплаты)/],
  },
  vacation: {
    requiredFields: [
      'correctAnnualSalary', 'annualSalaryDivisor', 'vacationDays',
      'averageDailyEarning', 'actualDerivativeAmount', 'correctDerivativeAmount',
    ],
    requiredPatterns: [/отпуск/],
  },
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
const STANDARD_ANNUAL_VACATION_DAYS = 28;
const CLAIM_CALCULATION_START_MARKER = '[[AUTO_CLAIM_CALCULATION_START]]';
const CLAIM_CALCULATION_END_MARKER = '[[AUTO_CLAIM_CALCULATION_END]]';
const SALARY_PAYMENT_PARTS = [
  { id: 'firstHalf', label: 'Первая половина месяца' },
  { id: 'secondHalf', label: 'Вторая половина месяца' },
];
const RECOVERY_BASELINE_PROPERTY = 'CLAIM_RECOVERY_BASELINES_V1';

function onOpen() {
  if (typeof hydrateClaimConstructorOnOpen_ === 'function') {
    hydrateClaimConstructorOnOpen_(SpreadsheetApp.getActiveSpreadsheet());
  }
  const ui = getSpreadsheetUi_();
  if (!ui) {
    console.log('onOpen только добавляет меню в таблицу. Для проверки из редактора запустите runIndexationFromEditor.');
    return;
  }

  const technicalMenu = ui.createMenu('Технические операции')
    .addItem('Проверить импорт без перезаписи', 'previewZupFolderImport')
    .addItem('Импортировать расчетные листки', 'importZupFolder')
    .addItem('Полный импорт с перечитыванием', 'forceZupFolderImport')
    .addItem('Продолжить пакетный импорт', 'resumeZupFolderImport')
    .addItem('Остановить пакетный импорт', 'cancelZupFolderImport')
    .addItem('Проверить VLM настройки', 'showZupVlmSettings')
    .addItem('Создать все вкладки структуры из 1С', 'createZupReconstructionSheets')
    .addSeparator()
    .addItem('Создать Из_1С_Оклад', 'createZupSalaryReconstructionSheet')
    .addItem('Создать Из_1С_Ежемесячные', 'createZupMonthlyReconstructionSheet')
    .addItem('Создать Из_1С_Ежеквартальные', 'createZupQuarterlyReconstructionSheet')
    .addItem('Создать Из_1С_Ежегодные', 'createZupAnnualReconstructionSheet')
    .addItem('Создать Из_1С_Отпуска', 'createZupVacationReconstructionSheet')
    .addSeparator()
    .addItem('Заполнить вкладки Из_1С из импорта', 'populateZupReconstructionSheets')
    .addItem('Пересчитать вкладки Из_1С', 'updateZupReconstructionIndexation')
    .addSeparator()
    .addItem('Обновить все расчетные листы', 'updateAllSheetsIndexation')
    .addItem('Заполнить Docs "Расчет требований"', 'fillClaimCalculationDocs')
    .addItem('Пересчитать вынужденный прогул, ст. 236 и отпуска', 'recalculateForcedAbsenceLiabilityAndVacations')
    .addSeparator()
    .addItem('Очистить импорт 1С', 'clearZupImportSheets');

  ui.createMenu('Конструктор требований')
    .addItem('Открыть конструктор', 'openClaimConstructor')
    .addItem('Собрать расчет', 'buildClaimCalculation')
    .addItem('Повторить последний запуск', 'retryClaimCalculation')
    .addSeparator()
    .addItem('Показать детализацию', 'showClaimConstructorDetailMode')
    .addItem('Обычный режим', 'showClaimConstructorNormalMode')
    .addItem('Технический режим', 'showClaimConstructorTechnicalMode')
    .addSeparator()
    .addSubMenu(technicalMenu)
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
  const results = runAllSheetsIndexation_(spreadsheet);
  showAllUpdateResults_(results);
}

function runAllSheetsIndexation_(spreadsheet) {
  const lock = getRecoveryWriteLock_();
  let acquired = false;
  try {
    if (lock) {
      acquired = lock.tryLock(30000);
      if (!acquired) {
        throw new Error('Не удалось получить блокировку для атомарного перерасчета требований.');
      }
    }
    if (typeof ensureClaimConstructorWorkspace_ === 'function') {
      ensureClaimConstructorWorkspace_(spreadsheet);
    } else if (typeof ensureClaimIntakeSheet_ === 'function') {
      ensureClaimIntakeSheet_(spreadsheet);
    }
    return runAllSheetsIndexationTransaction_(spreadsheet, { lockHeld: acquired });
  } finally {
    if (lock && acquired) lock.releaseLock();
  }
}

function runAllSheetsIndexationTransaction_(spreadsheet, options) {
  const transactionOptions = options || {};
  const descriptors = discoverCalculationSheetDescriptors_(spreadsheet);
  const transactionSnapshot = snapshotCalculationTransaction_(spreadsheet, descriptors);
  try {
    const indexes = loadConsultantIndexes_();
    const productionCalendar = loadProductionCalendar_();
    const compensationRates = loadSalaryCompensationRates_();
    const registry = readRecoveryBaselineRegistry_();
    restoreRegisteredRecoveryBaselines_(spreadsheet, registry);
    const intakeSheet = spreadsheet.getSheetByName('Анкета и требования');
    const questionnaireState = typeof captureClaimQuestionnaireState_ === 'function'
      ? captureClaimQuestionnaireState_(spreadsheet)
      : { partialRecoveries: [] };
    const recoveryState = typeof normalizePartialRecoveries_ === 'function'
      ? normalizePartialRecoveries_(questionnaireState.partialRecoveries || [])
      : { valid: [], invalid: [], unallocated: [] };
    const results = [];
    const runContext = {
      spreadsheet,
      descriptors,
      indexes,
      productionCalendar,
      compensationRates,
      successfulSourceSnapshot: [],
      failedSourceLayouts: new Set(),
      resultCaches: new Map(),
    };
    const ordered = descriptors.slice().sort((left, right) =>
      Number(left.layout.id === 'vacation') - Number(right.layout.id === 'vacation')
    );
    ordered.forEach((descriptor) => {
      const sheet = descriptor.sheet;
      const layoutId = descriptor.layout.id;
      if (descriptor.ambiguous === true) {
        if (layoutId !== 'vacation') runContext.failedSourceLayouts.add(layoutId);
        results.push({
          sheetName: sheet.getName(), layoutId, calculated: 0, skipped: 0,
          warning: 'ambiguous_source', totals: readCalculationTotalsFromDescriptor_(descriptor),
          claimFacts: [], derivativeDependencies: [], derivativeWarnings: [{
            code: 'calculation_source_ambiguous', disputed: true, source: sheet.getName(),
            reason: 'Семантический адаптер не смог однозначно определить обязательный источник текущего запуска.',
          }],
        });
        return;
      }
      if (layoutId === 'vacation' && runContext.failedSourceLayouts.size) {
        results.push({
          sheetName: sheet.getName(), layoutId, calculated: 0, skipped: 0,
          warning: 'upstream_source_failed',
          totals: readCalculationTotalsFromDescriptor_(descriptor),
          claimFacts: [], derivativeDependencies: [],
          derivativeWarnings: [{
            code: 'vacation_upstream_source_failed', disputed: true,
            source: sheet.getName(),
            reason: 'Отпускные сохранены без нового пересчета: обязательный источник текущего запуска завершился ошибкой или неоднозначен.',
          }],
        });
        return;
      }
      try {
        const result = updateUnpaidSalaryIndexationCore_({
          sheet,
          descriptor,
          indexes,
          productionCalendar,
          compensationRates,
          runContext,
        });
        const resultTable = result.table || buildTableFromDescriptor_(descriptor);
        if (Object.prototype.hasOwnProperty.call(result, 'table')) delete result.table;
        if (Object.prototype.hasOwnProperty.call(result, 'descriptor')) delete result.descriptor;
        runContext.resultCaches.set(result, { descriptor, table: resultTable });
        results.push(result);
        if (layoutId !== 'vacation') {
          Array.prototype.push.apply(
            runContext.successfulSourceSnapshot,
            buildCurrentRunSourceSnapshot_(descriptor)
          );
        }
      } catch (error) {
        if (!isCalculationDataQualityIssue_(error)) throw error;
        restoreCalculationDescriptorSnapshot_(transactionSnapshot, descriptor);
        const reason = error && error.message ? error.message : String(error);
        Logger.log(`Не удалось пересчитать лист "${sheet.getName()}": ${reason}`);
        if (layoutId !== 'vacation') runContext.failedSourceLayouts.add(layoutId);
        results.push({
          sheetName: sheet.getName(), layoutId, calculated: 0, skipped: 0,
          error: reason, totals: readCalculationTotalsFromDescriptor_(descriptor), claimFacts: [],
          derivativeDependencies: [], derivativeWarnings: [{
            code: 'calculation_source_failed', disputed: true, source: sheet.getName(), reason,
          }],
        });
      }
    });

    const preparedRecoveryFacts = prepareRecoveryBaselineFacts_(
      results.reduce((facts, result) => facts.concat(result.claimFacts || []), []), recoveryState
    );
    const recoveryEffects = applyPartialRecoveries_(
      preparedRecoveryFacts.claimFacts, recoveryState, compensationRates,
      { recomputeTargetKeys: preparedRecoveryFacts.recomputeTargetKeys }
    );
    const recoveryWriteResult = writeRecoveryAdjustedResultsToSheets_(
      spreadsheet, recoveryEffects.writeBacks,
      { lockHeld: transactionOptions.lockHeld === true }
    );
    if (!recoveryWriteResult.success && recoveryWriteResult.warnings.length) {
      throw new Error(recoveryWriteResult.warnings[0].reason || recoveryWriteResult.warnings[0].code);
    }
    recoveryEffects.warnings = recoveryEffects.warnings.concat(recoveryWriteResult.warnings);
    const derivativeEffects = applyDerivativePaymentEffects_(
      detectDerivativePaymentDependencies_(spreadsheet, results, recoveryEffects)
    );
    const derivativeWriteResult = writeDerivativePaymentEffectsToSheets_(
      spreadsheet, derivativeEffects.writeBacks
    );
    derivativeEffects.warnings = derivativeEffects.warnings.concat(derivativeWriteResult.warnings);
    recoveryEffects.derivativeEffects = derivativeEffects;
    recoveryEffects.warnings = mergeCalculationWarnings_(results, recoveryEffects.warnings
      .concat(derivativeEffects.warnings));
    SpreadsheetApp.flush();
    if (recoveryWriteResult.written > 0 || derivativeWriteResult.written > 0) {
      results.forEach((result, index) => {
        if (!result.error && !result.warning) {
          const resultCache = runContext.resultCaches.get(result) || {};
          results[index] = rescanCalculationResultFromSheet_(
            spreadsheet, result, resultCache.table, resultCache.descriptor
          );
        }
      });
    }
    applyCalculationEffectFactFlags_(results, recoveryEffects);
    results.calculationEffects = recoveryEffects;
    if (results.length && (recoveryState.valid.length
      || recoveryState.unallocated.length || recoveryEffects.warnings.length)) {
      results[0].calculationEffects = recoveryEffects;
    }
    let auditModel = null;
    const auditFacts = results.reduce(
      (facts, result) => facts.concat(result.claimFacts || []), []
    ).concat(recoveryEffects.auditFacts || []);
    if (typeof renderClaimAudit_ === 'function' && intakeSheet) {
      extendCalculationTransactionAuditSnapshot_(
        transactionSnapshot, spreadsheet, intakeSheet, auditFacts
      );
      auditModel = renderClaimAudit_(
        intakeSheet,
        auditFacts,
        { deferPropertyWrite: true }
      );
    }
    SpreadsheetApp.flush();
    const nextRegistry = persistRecoveryBaselineState_(
      preparedRecoveryFacts, recoveryEffects, recoveryWriteResult, { deferWrite: true }
    );
    if (auditModel && Array.isArray(auditModel.durableUncheckedClaimKeys)
      && typeof writeDurableUncheckedClaimKeys_ === 'function') {
      writeDurableUncheckedClaimKeys_(new Set(auditModel.durableUncheckedClaimKeys));
    }
    writeRecoveryBaselineRegistry_(nextRegistry);
    return results;
  } catch (error) {
    rollbackCalculationTransaction_(spreadsheet, transactionSnapshot);
    throw error;
  }
}

function snapshotCalculationTransaction_(spreadsheet, descriptors) {
  const snapshot = { batches: [], batchKeys: new Set() };
  const ownedSemantics = new Set([
    'monthlyIpc', 'unpaidSalary', 'totalUnderpayment', 'target', 'penalty',
    'correctAnnualSalary', 'averageDailyEarning', 'correctDerivativeAmount',
    'derivativeUnderpayment', 'derivativeIndexation', 'derivativeLiability',
  ]);
  (descriptors || []).forEach((descriptor) => {
    const sheet = descriptor.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < descriptor.headerRow) return;
    const columns = Array.from(new Set(Object.keys(descriptor.semanticColumns || {})
      .filter((semantic) => ownedSemantics.has(semantic)
        && Number.isInteger(descriptor.semanticColumns[semantic]))
      .map((semantic) => descriptor.semanticColumns[semantic] + 1))).sort((a, b) => a - b);
    groupContiguousCalculationColumns_(columns).forEach((group) => {
      addCalculationRangeSnapshot_(snapshot, sheet, descriptor.headerRow, group.start,
        lastRow - descriptor.headerRow + 1, group.end - group.start + 1);
    });
  });
  let auditNamedRange = null;
  let auditSnapshot = null;
  if (typeof getClaimIntakeLayout_ === 'function') {
    const audit = getClaimIntakeLayout_().claimSelections;
    const sheet = spreadsheet.getSheetByName('Анкета и требования');
    auditNamedRange = spreadsheet.getRangeByName(audit.namedRange);
    const extent = sheet
      ? getClaimAuditRenderedExtent_(sheet, audit, auditNamedRange) : 1;
    if (sheet) {
      auditSnapshot = { sheet, audit, extent, snapshottedExtent: extent };
      addCalculationRangeSnapshot_(snapshot, sheet, audit.firstRow, 1,
        extent, audit.columnCount);
      const title = sheet.getRange(audit.titleCell);
      addCalculationRangeSnapshot_(snapshot, sheet, title.getRow(), title.getColumn(), 1, 1);
    }
  }
  const properties = typeof PropertiesService !== 'undefined'
    ? PropertiesService.getDocumentProperties() : null;
  return Object.assign(snapshot, {
    auditSpreadsheet: spreadsheet,
    auditNamedRangeName: typeof getClaimIntakeLayout_ === 'function'
      ? getClaimIntakeLayout_().claimSelections.namedRange : '',
    auditNamedRangeExisted: !!auditNamedRange,
    auditNamedRange,
    auditSnapshot,
    properties,
    propertyValues: properties && typeof properties.getProperties === 'function'
      ? properties.getProperties() : {},
  });
}

function groupContiguousCalculationColumns_(columns) {
  return (columns || []).reduce((groups, column) => {
    const last = groups[groups.length - 1];
    if (last && column === last.end + 1) last.end = column;
    else groups.push({ start: column, end: column });
    return groups;
  }, []);
}

function addCalculationRangeSnapshot_(snapshot, sheet, row, column, rowCount, columnCount) {
  if (!snapshot || !sheet || rowCount <= 0 || columnCount <= 0) return;
  const key = [sheet.getSheetId ? sheet.getSheetId() : sheet.getName(),
    row, column, rowCount, columnCount].join('|');
  if (snapshot.batchKeys.has(key)) return;
  const range = sheet.getRange(row, column, rowCount, columnCount);
  snapshot.batchKeys.add(key);
  snapshot.batches.push({
    key, sheet, row, column, rowCount, columnCount,
    values: range.getValues(),
    formulas: range.getFormulas(),
    notes: range.getNotes(),
    backgrounds: range.getBackgrounds(),
    numberFormats: range.getNumberFormats(),
    dataValidations: range.getDataValidations(),
  });
}

function extendCalculationTransactionAuditSnapshot_(snapshot, spreadsheet, sheet, claimFacts) {
  if (!snapshot || !sheet || typeof getClaimIntakeLayout_ !== 'function') return;
  const audit = getClaimIntakeLayout_().claimSelections;
  const model = buildClaimAuditModel_(claimFacts || []);
  const plannedExtent = Math.max(1, model.groups.reduce(
    (count, group) => count + 1 + group.items.length, 0
  ));
  const namedRange = spreadsheet.getRangeByName(audit.namedRange);
  const previousExtent = getClaimAuditRenderedExtent_(sheet, audit, namedRange);
  const unionExtent = Math.max(previousExtent, plannedExtent);
  if (!snapshot.auditSnapshot) {
    snapshot.auditSnapshot = {
      sheet, audit, extent: previousExtent, unionExtent, snapshottedExtent: 0,
    };
  } else {
    snapshot.auditSnapshot.unionExtent = Math.max(
      snapshot.auditSnapshot.unionExtent || snapshot.auditSnapshot.extent,
      unionExtent
    );
  }
  const snapshottedExtent = snapshot.auditSnapshot.snapshottedExtent || 0;
  if (unionExtent > snapshottedExtent) {
    addCalculationRangeSnapshot_(snapshot, sheet, audit.firstRow + snapshottedExtent, 1,
      unionExtent - snapshottedExtent, audit.columnCount);
    snapshot.auditSnapshot.snapshottedExtent = unionExtent;
  }
}

function rollbackCalculationTransaction_(spreadsheet, snapshot) {
  const errors = [];
  let restored = false;
  for (let attempt = 0; attempt < 2 && !restored; attempt++) {
    try {
      restoreCalculationRangeSnapshots_(spreadsheet, snapshot.batches || []);
      restored = true;
    } catch (error) {
      if (attempt === 1) errors.push(error);
    }
  }
  if (snapshot.auditNamedRangeExisted && snapshot.auditNamedRange
    && snapshot.auditNamedRangeName) {
    try {
      spreadsheet.setNamedRange(
        snapshot.auditNamedRangeName, snapshot.auditNamedRange
      );
    } catch (error) { errors.push(error); }
  } else if (!snapshot.auditNamedRangeExisted && snapshot.auditNamedRangeName) {
    try {
      removeCalculationNamedRange_(spreadsheet, snapshot.auditNamedRangeName);
    } catch (error) { errors.push(error); }
  }
  if (snapshot.properties) {
    try {
      const current = snapshot.properties.getProperties();
      Object.keys(current).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(snapshot.propertyValues, key)) {
          snapshot.properties.deleteProperty(key);
        }
      });
      if (Object.keys(snapshot.propertyValues).length) {
        snapshot.properties.setProperties(snapshot.propertyValues, true);
      }
    } catch (error) { errors.push(error); }
  }
  verifyCalculationTransactionRollback_(snapshot, errors);
}

function verifyCalculationTransactionRollback_(snapshot, errors) {
  verifyCalculationRangeSnapshots_(snapshot.batches || [], errors);
  if (snapshot.properties) {
    const currentProperties = snapshot.properties.getProperties();
    const expectedKeys = Object.keys(snapshot.propertyValues).sort();
    const currentKeys = Object.keys(currentProperties).sort();
    if (JSON.stringify(currentKeys) !== JSON.stringify(expectedKeys)
      || expectedKeys.some((key) => currentProperties[key] !== snapshot.propertyValues[key])) {
      errors.push(new Error('Транзакционный rollback не восстановил свойства документа.'));
    }
  }
  if (snapshot.auditNamedRangeName && snapshot.auditSpreadsheet) {
    const currentRange = snapshot.auditSpreadsheet.getRangeByName(snapshot.auditNamedRangeName);
    if (snapshot.auditNamedRangeExisted) {
      if (!currentRange || currentRange.getSheet().getSheetId()
        !== snapshot.auditNamedRange.getSheet().getSheetId()
        || currentRange.getRow() !== snapshot.auditNamedRange.getRow()
        || currentRange.getColumn() !== snapshot.auditNamedRange.getColumn()
        || currentRange.getNumRows() !== snapshot.auditNamedRange.getNumRows()
        || currentRange.getNumColumns() !== snapshot.auditNamedRange.getNumColumns()) {
        errors.push(new Error('Транзакционный rollback не восстановил границы аудита.'));
      }
    } else if (currentRange) {
      errors.push(new Error('Транзакционный rollback не удалил вновь созданный диапазон аудита.'));
    }
  }
  if (errors.length) throw new Error(`Rollback failed: ${errors.map((error) =>
    error.message || error).join('; ')}`);
}

function verifyCalculationRangeSnapshots_(batches, errors) {
  (batches || []).forEach((batch) => {
    const range = batch.sheet.getRange(
      batch.row, batch.column, batch.rowCount, batch.columnCount
    );
    const formulas = range.getFormulas();
    const values = range.getValues();
    const valuesRestored = batch.values.every((row, rowIndex) => row.every(
      (value, columnIndex) => {
        const expectedFormula = batch.formulas[rowIndex][columnIndex] || '';
        const actualFormula = formulas[rowIndex][columnIndex] || '';
        return expectedFormula
          ? actualFormula === expectedFormula
          : actualFormula === '' && calculationSnapshotValuesEqual_(
            values[rowIndex][columnIndex], value
          );
      }
    ));
    const notesRestored = JSON.stringify(range.getNotes()) === JSON.stringify(batch.notes);
    const backgroundsRestored = JSON.stringify(range.getBackgrounds())
      === JSON.stringify(batch.backgrounds);
    const formatsRestored = JSON.stringify(range.getNumberFormats())
      === JSON.stringify(batch.numberFormats);
    const validationsRestored = calculationValidationMatricesEqual_(
      range.getDataValidations(), batch.dataValidations
    );
    if (!valuesRestored || !notesRestored || !backgroundsRestored
      || !formatsRestored || !validationsRestored) {
      errors.push(new Error(`Транзакционный rollback не восстановил диапазон ${batch.key}`
        + ` (values=${valuesRestored}, notes=${notesRestored}, backgrounds=${backgroundsRestored},`
        + ` formats=${formatsRestored}, validations=${validationsRestored}).`));
    }
  });
}

function calculationSnapshotValuesEqual_(left, right) {
  const leftIsDate = Object.prototype.toString.call(left) === '[object Date]';
  const rightIsDate = Object.prototype.toString.call(right) === '[object Date]';
  if (leftIsDate || rightIsDate) {
    return leftIsDate && rightIsDate && left.getTime() === right.getTime();
  }
  return left === right;
}

function restoreCalculationRangeSnapshots_(spreadsheet, batches) {
  const snapshots = batches || [];
  if (snapshots.length) {
    if (typeof Sheets === 'undefined' || !Sheets.Spreadsheets
      || typeof Sheets.Spreadsheets.batchUpdate !== 'function') {
      throw new Error('Advanced Sheets service is unavailable; rollback cannot restore exact values.');
    }
    const timezone = spreadsheet.getSpreadsheetTimeZone();
    Sheets.Spreadsheets.batchUpdate({
      requests: snapshots.map((batch) => ({
        updateCells: {
          range: {
            sheetId: batch.sheet.getSheetId(),
            startRowIndex: batch.row - 1,
            endRowIndex: batch.row - 1 + batch.rowCount,
            startColumnIndex: batch.column - 1,
            endColumnIndex: batch.column - 1 + batch.columnCount,
          },
          rows: batch.values.map((row, rowIndex) => ({
            values: row.map((value, columnIndex) => ({
              userEnteredValue: buildCalculationUserEnteredValue_(
                value, batch.formulas[rowIndex][columnIndex], timezone
              ),
            })),
          })),
          fields: 'userEnteredValue',
        },
      })),
    }, spreadsheet.getId());
  }
  snapshots.forEach((batch) => {
    const range = batch.sheet.getRange(
      batch.row, batch.column, batch.rowCount, batch.columnCount
    );
    range.setNotes(batch.notes);
    range.setBackgrounds(batch.backgrounds);
    range.setNumberFormats(batch.numberFormats);
    range.setDataValidations(batch.dataValidations);
  });
}

function buildCalculationUserEnteredValue_(value, formula, timezone) {
  if (formula) return { formulaValue: formula };
  if (value === '' || value === null || value === undefined) return {};
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return { numberValue: calculationDateToSheetsSerial_(value, timezone) };
  }
  if (typeof value === 'number') return { numberValue: value };
  if (typeof value === 'boolean') return { boolValue: value };
  return { stringValue: String(value) };
}

function calculationDateToSheetsSerial_(value, timezone) {
  const local = Utilities.formatDate(value, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const match = local.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/
  );
  if (!match) throw new Error('Не удалось преобразовать дату для точного rollback.');
  return Date.UTC(
    Number(match[1]), Number(match[2]) - 1, Number(match[3]),
    Number(match[4]), Number(match[5]), Number(match[6]), Number(match[7])
  ) / 86400000 + 25569;
}

function restoreCalculationDescriptorSnapshot_(snapshot, descriptor) {
  const batches = (snapshot && snapshot.batches || []).filter((batch) =>
    batch.sheet === descriptor.sheet
  );
  const errors = [];
  try {
    restoreCalculationRangeSnapshots_(
      snapshot.auditSpreadsheet || descriptor.sheet.getParent(), batches
    );
  } catch (error) {
    errors.push(error);
  }
  try {
    SpreadsheetApp.flush();
  } catch (error) {
    errors.push(error);
  }
  verifyCalculationRangeSnapshots_(batches, errors);
  if (errors.length) {
    throw new Error(`Data-quality rollback failed: ${errors.map((error) =>
      error.message || error).join('; ')}`);
  }
}

function calculationValidationMatricesEqual_(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return left.every((row, rowIndex) => row.length === right[rowIndex].length
    && row.every((validation, columnIndex) => calculationDataValidationsEqual_(
      validation, right[rowIndex][columnIndex]
    )));
}

function removeCalculationNamedRange_(spreadsheet, name) {
  if (!spreadsheet || !name) return;
  if (typeof spreadsheet.removeNamedRange === 'function') {
    spreadsheet.removeNamedRange(name);
    return;
  }
  if (typeof spreadsheet.getNamedRanges !== 'function') return;
  const namedRange = spreadsheet.getNamedRanges().find((candidate) =>
    candidate.getName && candidate.getName() === name
  );
  if (namedRange && typeof namedRange.remove === 'function') namedRange.remove();
}

function calculationDataValidationsEqual_(left, right) {
  if (left === right) return true;
  if (!left || !right) return false;
  if (typeof left.getCriteriaType === 'function'
    && typeof right.getCriteriaType === 'function') {
    const leftType = String(left.getCriteriaType());
    const rightType = String(right.getCriteriaType());
    const leftValues = typeof left.getCriteriaValues === 'function' ? left.getCriteriaValues() : [];
    const rightValues = typeof right.getCriteriaValues === 'function' ? right.getCriteriaValues() : [];
    return leftType === rightType && JSON.stringify(leftValues) === JSON.stringify(rightValues);
  }
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCalculationDataQualityIssue_(error) {
  return !!(error && (error.code === 'CALCULATION_DATA_QUALITY'
    || error.isDataQualityIssue === true));
}

function readCalculationTotalsFromDescriptor_(descriptor) {
  const columns = descriptor && descriptor.semanticColumns || {};
  const sheet = descriptor && descriptor.sheet;
  const sum = (column) => {
    if (!sheet || !Number.isInteger(column) || sheet.getLastRow() <= descriptor.headerRow) return 0;
    return sheet.getRange(descriptor.headerRow + 1, column + 1,
      sheet.getLastRow() - descriptor.headerRow, 1).getValues().reduce((total, row) => {
      const value = parseMoney_(row[0]);
      return total + (value === null ? 0 : value);
    }, 0);
  };
  return {
    underpayment: roundMoney_(sum(columns.totalUnderpayment)),
    indexation: roundMoney_(sum(columns.target)),
    liability: roundMoney_(sum(columns.penalty)),
  };
}

function buildCurrentRunSourceSnapshot_(descriptor) {
  const sheet = descriptor.sheet;
  const columns = descriptor.semanticColumns || {};
  if (!Number.isInteger(columns.correctAmount) || sheet.getLastRow() <= descriptor.headerRow) return [];
  return sheet.getRange(descriptor.headerRow + 1, 1,
    sheet.getLastRow() - descriptor.headerRow, sheet.getLastColumn()).getValues().reduce(
    (items, row, rowIndex) => {
      const period = parseRowPeriod_(row, columns);
      const amount = parseMoney_(row[columns.correctAmount]);
      if (period && amount !== null) items.push({
        layoutId: descriptor.layout.id,
        periodYear: period.year,
        periodMonth: period.month,
        annualPremiumYear: getAnnualPremiumYear_(row, columns),
        amount: roundMoney_(amount),
        source: { sheetName: sheet.getName(), row: descriptor.headerRow + rowIndex + 1 },
      });
      return items;
    }, []
  );
}

function mergeCalculationWarnings_(results, warnings) {
  const combined = [];
  (results || []).forEach((result) => {
    (result.derivativeWarnings || []).forEach((warning) => combined.push(Object.assign({}, warning, {
      source: warning.source || result.sheetName || result.layoutId || '',
    })));
  });
  (warnings || []).forEach((warning) => combined.push(Object.assign({}, warning)));
  const seen = new Set();
  return combined.filter((warning) => {
    const key = [warning.code, warning.source || warning.targetKey || '', warning.reason || ''].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function fillClaimCalculationTable() {
  fillClaimCalculationDocs();
}

function fillClaimCalculationDocs() {
  const spreadsheet = getTargetSpreadsheet_();
  const handoff = runClaimCalculationDocsHandoff_(spreadsheet);
  const issue = handoff.issues[0];
  if (issue && issue.code === 'output_doc_missing') {
    showMessage_('Не нашел ссылку на Google Doc. Добавьте в таблицу подпись "Расчет требований:" или "Расписанный расчет:" и рядом ссылку на документ.');
    return;
  }
  if (issue && issue.code === 'claim_parameters_missing') {
    showMessage_('Не хватает параметров: средний дневной заработок, дата начала вынужденного прогула и дата окончания расчета. Средний заработок берется из явной подписи или из последней строки вкладки "Отпуска и расчет"; сумма прогула не используется как источник.');
    return;
  }
  if (issue && issue.code === 'doc_write_failed') {
    throw new Error(issue.reason);
  }

  const result = handoff.result;
  showMessage_(
    `Docs "Расчет требований" заполнен. Рабочих дней прогула: ${result.workingDays}. Сумма за прогул: ${formatMoneyRu_(result.wageAmount, 2)}. Пени ст. 236: ${formatMoneyRu_(result.penaltyAmount, 2)}.`
  );
}

function runClaimCalculationDocsHandoff_(spreadsheet, options) {
  const settings = options || {};
  const params = settings.params || readClaimCalculationParams_(spreadsheet);
  if (!params.docUrl) {
    return buildSkippedClaimDocsHandoff_(
      'output_doc_missing',
      'Не указана ссылка на Google Doc для расшифровки расчета.'
    );
  }
  const calculated = settings.calculatedResult
    ? { ready: true, result: settings.calculatedResult }
    : calculateClaimCalculationResult_(spreadsheet, params);
  if (!calculated.ready) {
    return buildSkippedClaimDocsHandoff_(
      'claim_parameters_missing',
      'Не хватает параметров для расчета требований и соответствующего раздела Google Docs.'
    );
  }

  const result = calculated.result;
  params.averageDailyEarning = result.averageDailyEarning;
  try {
    writeClaimCalculationDoc_(params.docUrl, params, result);
    return {
      writtenSections: ['claim_calculation'],
      skippedSections: [],
      issues: [],
      result,
    };
  } catch (error) {
    const reason = error && error.message ? error.message : String(error);
    return buildSkippedClaimDocsHandoff_('doc_write_failed', `Не удалось обновить Google Doc: ${reason}`);
  }
}

function buildSkippedClaimDocsHandoff_(code, reason) {
  return {
    writtenSections: [],
    skippedSections: ['claim_calculation'],
    issues: [{ code, reason }],
    result: null,
  };
}

function calculateClaimCalculationResult_(spreadsheet, params, labelValues) {
  if (!params.startDate || !params.endDate || params.endDate < params.startDate) {
    return {
      ready: false,
      result: null,
    };
  }
  const averageDailyEarning = params.averageDailyEarning ||
    readAverageDailyEarningFromVacationSheet_(spreadsheet);
  if (!averageDailyEarning) {
    return {
      ready: false,
      result: null,
    };
  }
  const productionCalendar = loadProductionCalendar_();
  return {
    ready: true,
    result: calculateForcedAbsenceCompensation_(
      averageDailyEarning,
      params.startDate,
      params.endDate,
      productionCalendar,
      loadSalaryCompensationRates_(),
      { annualVacationDays: params.annualVacationDays || STANDARD_ANNUAL_VACATION_DAYS }
    ),
  };
}

function recalculateForcedAbsenceLiabilityAndVacations() {
  const spreadsheet = getTargetSpreadsheet_();
  const sheet = getTargetSheet_();
  const labelValues = scanSheetLabelValues_(sheet, {
    rows: 80,
    columns: 25,
    includeRichText: false,
  });
  const params = readClaimCalculationParamsFromLabelValues_(labelValues);
  const calculated = runClaimSheetCalculation_(spreadsheet, { params, labelValues, target: sheet });
  if (!calculated.ready) {
    showMessage_('Не хватает параметров: средний дневной заработок, дата начала вынужденного прогула и дата окончания расчета. Средний заработок берется из явной подписи или из последней строки вкладки "Отпуска и расчет"; сумма прогула не используется как источник.');
    return;
  }
  showMessage_(
    `Таблица пересчитана: прогул ${formatMoneyRu_(calculated.result.wageAmount, 2)}, матответственность ${formatMoneyRu_(calculated.result.penaltyAmount, 2)}, отпуск ${formatMoneyRu_(calculated.result.vacationAmount, 2)}. Обновлено ячеек: ${calculated.written}.`
  );
}

function runClaimSheetCalculation_(spreadsheet, options) {
  const settings = options || {};
  const labelValues = settings.labelValues || scanSpreadsheetLabelValues_(spreadsheet);
  const params = settings.params || readClaimCalculationParamsFromLabelValues_(labelValues);
  const calculated = calculateClaimCalculationResult_(spreadsheet, params, labelValues);
  if (!calculated.ready) {
    return {
      ready: false,
      written: 0,
      result: null,
      params,
      issues: [{
        code: 'claim_parameters_missing',
        reason: 'Не хватает параметров для расчета вынужденного прогула, ст. 236 и отпуска.',
      }],
    };
  }
  const written = writeClaimCalculationResultToSheet_(
    settings.target || spreadsheet,
    calculated.result,
    labelValues
  );
  SpreadsheetApp.flush();
  return {
    ready: true,
    written,
    result: calculated.result,
    params,
    issues: written > 0 ? [] : [{
      code: 'claim_output_labels_missing',
      reason: 'Расчет выполнен, но в Google Sheets не найдены поля для записи его результатов.',
    }],
  };
}

function updateZupReconstructionIndexation() {
  const spreadsheet = getTargetSpreadsheet_();
  const results = updateZupReconstructionIndexationSheets_(spreadsheet);
  showAllUpdateResults_(results);
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
  return sheetName === SETTINGS.METHODOLOGY_SHEET_NAME ||
    /^Из_1С_/i.test(String(sheetName || ''));
}

function updateUnpaidSalaryIndexationCore_(params) {
  const sheet = params.sheet;
  const spreadsheet = sheet.getParent();
  const timezone = spreadsheet.getSpreadsheetTimeZone();
  const runDate = todayInSpreadsheetTimezone_(timezone);
  const indexes = params.indexes || loadConsultantIndexes_();
  const table = findTable_(sheet, params.descriptor);
  const calculationEnd = resolveCalculationEndDate_(
    table.headerValues[table.columns.target],
    runDate
  );
  const penaltyEnd = resolveCalculationEndDate_(
    table.headerValues[table.columns.target],
    calculationEnd.date
  );
  const productionCalendar = params.productionCalendar || loadProductionCalendar_();
  const compensationRates = params.compensationRates || loadSalaryCompensationRates_();
  const lastRow = sheet.getLastRow();

  if (lastRow <= table.headerRow) {
    return {
      sheetName: sheet.getName(),
      layoutId: table.layout.id,
      calculated: 0,
      skipped: 0,
      totals: { underpayment: 0, indexation: 0, liability: 0 },
      claimFacts: [],
    };
  }

  const rowCount = lastRow - table.headerRow;
  const range = sheet.getRange(table.headerRow + 1, 1, rowCount, sheet.getLastColumn());
  const values = range.getValues();
  const vacationDerivativeResult = prepareVacationDerivativeRows_(
    sheet, table, values, params.runContext
  );
  const inferredPaymentSchedule = table.layout.id === 'salary'
    ? inferSalaryPaymentScheduleForSheet_(spreadsheet, values, table, productionCalendar)
    : null;
  const hasMonthlyIpcColumn = Number.isInteger(table.columns.monthlyIpc);
  const existingOutput = {
    monthlyIpc: hasMonthlyIpcColumn
      ? readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.monthlyIpc, rowCount)
      : null,
    target: readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.target, rowCount),
    penalty: readExistingOutputColumn_(sheet, table.headerRow + 1, table.columns.penalty, rowCount),
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
  const derivativeDependencies = [];
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

    if (table.layout.id === 'salary') {
      const schedule = buildSalaryDebtSchedule_(row, table, productionCalendar, {
        totalUnderpayment,
        principal: unpaidSalary,
        correctAmount: Number.isInteger(table.columns.correctAmount)
          ? parseMoney_(row[table.columns.correctAmount])
          : null,
        inferredPaymentSchedule,
      });
      const penaltyResult = calculateSalaryScheduleCompensation_(schedule, penaltyEnd.date, compensationRates);
      penaltyValues.push([penaltyResult.amount]);
      penaltyNotes.push([buildSalarySchedulePenaltyNote_(penaltyResult, schedule, penaltyEnd, totalUnderpayment, table.layout)]);
    } else {
      const penaltyDue = getRowPenaltyDueDate_(row, table, productionCalendar);
      const penaltyResult = calculateSalaryCompensation_(
        totalUnderpayment,
        penaltyDue.date,
        penaltyEnd.date,
        compensationRates
      );
      penaltyValues.push([penaltyResult.amount]);
      penaltyNotes.push([buildPenaltyNote_(penaltyResult, penaltyDue.date, penaltyEnd, totalUnderpayment, table.layout, penaltyDue.source)]);
    }
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
    const penaltyDue = getRowPenaltyDueDate_(row, table, productionCalendar);
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

    if (table.layout.id === 'salary') {
      const schedule = buildSalaryDebtSchedule_(row, table, productionCalendar, {
        totalUnderpayment,
        principal: unpaidSalary,
        correctAmount: Number.isInteger(table.columns.correctAmount)
          ? parseMoney_(row[table.columns.correctAmount])
          : null,
        inferredPaymentSchedule,
      });
      const penaltyResult = calculateSalaryScheduleCompensation_(schedule, penaltyEnd.date, compensationRates);
      penaltyValues.push([penaltyResult.amount]);
      penaltyNotes.push([buildSalarySchedulePenaltyNote_(penaltyResult, schedule, penaltyEnd, totalUnderpayment, table.layout)]);
    } else {
      const penaltyResult = calculateSalaryCompensation_(
        totalUnderpayment,
        penaltyDue.date,
        penaltyEnd.date,
        compensationRates
      );
      penaltyValues.push([penaltyResult.amount]);
      penaltyNotes.push([buildPenaltyNote_(penaltyResult, penaltyDue.date, penaltyEnd, totalUnderpayment, table.layout, penaltyDue.source)]);
    }
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
  markVacationDerivativeOutputs_(sheet, vacationDerivativeResult.markerDestinations);
  Array.prototype.push.apply(
    derivativeDependencies,
    buildVacationOutputDependencies_(sheet, table, vacationDerivativeResult.markerDestinations)
  );

  SpreadsheetApp.flush();
  const totals = summarizeClaimConstructorCalculationTotals_(
    sheet.getRange(table.headerRow + 1, table.columns.totalUnderpayment + 1, rowCount, 1).getValues(),
    sheet.getRange(table.headerRow + 1, table.columns.target + 1, rowCount, 1).getValues(),
    sheet.getRange(table.headerRow + 1, table.columns.penalty + 1, rowCount, 1).getValues()
  );
  const claimFacts = buildClaimFactsFromCalculationRows_({
    sheetName: sheet.getName(),
    table,
    rows: values,
    underpaymentValues: refreshedTotalUnderpaymentValues,
    indexationValues: targetValues,
    liabilityValues: penaltyValues,
    sourceMetadata: buildClaimFactSourceMetadata_(
      sheet,
      table,
      values,
      penaltyEnd.date,
      productionCalendar,
      inferredPaymentSchedule
    ),
  });

  return {
    sheetName: sheet.getName(),
    layoutId: table.layout.id,
    calculated,
    skipped,
    targetColumn: table.layout.targetColumn,
    penaltyColumn: table.layout.penaltyColumn,
    updatedIndexation: true,
    updatedPenalty: true,
    totals,
    claimFacts,
    derivativeDependencies,
    derivativeWarnings: vacationDerivativeResult.warnings,
  };
}

function buildClaimFactSourceMetadata_(
  sheet, table, rows, calculationEndDate, productionCalendar, inferredPaymentSchedule
) {
  return (rows || []).map((row, rowIndex) => {
    const sheetRow = table.headerRow + rowIndex + 1;
    const principalColumn = table.columns.totalUnderpayment + 1;
    const liabilityColumn = table.columns.penalty + 1;
    const indexationColumn = table.columns.target + 1;
    const due = getRowPenaltyDueDate_(row, table, productionCalendar);
    const liabilitySchedule = table.layout.liabilityTiming === 'salary_schedule'
      ? buildSalaryDebtSchedule_(row, table, productionCalendar, {
          totalUnderpayment: parseMoney_(row[table.columns.totalUnderpayment]),
          principal: parseMoney_(row[table.columns.unpaidSalary]),
          correctAmount: Number.isInteger(table.columns.correctAmount)
            ? parseMoney_(row[table.columns.correctAmount])
            : null,
          inferredPaymentSchedule,
        }).slices.filter((slice) => slice.dueDate && Number(slice.underpaymentAmount) > 0)
        .map((slice) => ({
          id: slice.id,
          label: slice.label,
          dueDate: new Date(slice.dueDate),
          principal: roundMoney_(slice.underpaymentAmount),
        }))
      : null;
    return {
      source: {
        sheetId: typeof sheet.getSheetId === 'function' ? sheet.getSheetId() : null,
        sheetName: sheet.getName(),
        row: sheetRow,
        adapterId: table.layout.id,
        cells: {
          principal: `${indexToColumnLetter_(principalColumn - 1)}${sheetRow}`,
          indexation: `${indexToColumnLetter_(indexationColumn - 1)}${sheetRow}`,
          liability: `${indexToColumnLetter_(liabilityColumn - 1)}${sheetRow}`,
        },
      },
      dueDate: due && due.date,
      liabilitySchedule,
      liabilityTiming: table.layout.liabilityTiming,
      calculationEndDate: calculationEndDate && new Date(calculationEndDate),
      destinations: {
        principal: {
          sheetName: sheet.getName(), row: sheetRow, column: principalColumn,
          adapterOwned: table.layout.recoveryPrincipalOutput === true,
        },
        liability: {
          sheetName: sheet.getName(), row: sheetRow, column: liabilityColumn,
          adapterOwned: table.layout.recoveryLiabilityOutput === true,
        },
        indexation: {
          sheetName: sheet.getName(), row: sheetRow, column: indexationColumn,
          adapterOwned: table.layout.recoveryIndexationOutput === true,
          recoveryTimingSupported: false,
        },
      },
    };
  });
}

function rescanCalculationResultFromSheet_(spreadsheet, result, cachedTable, cachedDescriptor) {
  const sheet = spreadsheet.getSheetByName(result.sheetName);
  if (!sheet) return result;
  const descriptor = cachedDescriptor || result.descriptor;
  const table = cachedTable || result.table
    || (descriptor ? buildTableFromDescriptor_(descriptor) : findTable_(sheet));
  const rowCount = Math.max(0, sheet.getLastRow() - table.headerRow);
  if (!rowCount) {
    return Object.assign({}, result, {
      totals: { underpayment: 0, indexation: 0, liability: 0 },
      claimFacts: [],
    });
  }
  const rows = sheet.getRange(table.headerRow + 1, 1, rowCount, sheet.getLastColumn()).getValues();
  const underpaymentValues = sheet
    .getRange(table.headerRow + 1, table.columns.totalUnderpayment + 1, rowCount, 1).getValues();
  const indexationValues = sheet
    .getRange(table.headerRow + 1, table.columns.target + 1, rowCount, 1).getValues();
  const liabilityValues = sheet
    .getRange(table.headerRow + 1, table.columns.penalty + 1, rowCount, 1).getValues();
  const sourceMetadata = rows.map((row, rowIndex) => ({
    source: {
      sheetId: typeof sheet.getSheetId === 'function' ? sheet.getSheetId() : null,
      sheetName: sheet.getName(),
      row: table.headerRow + rowIndex + 1,
      adapterId: table.layout.id,
    },
  }));
  const facts = buildClaimFactsFromCalculationRows_({
    sheetName: sheet.getName(), table, rows, underpaymentValues, indexationValues, liabilityValues,
    sourceMetadata,
  });
  const previousBySourceKey = new Map();
  const previousByKey = new Map();
  (result.claimFacts || []).forEach((fact) => {
    const key = buildStableClaimKey_(fact);
    if (!previousByKey.has(key)) previousByKey.set(key, []);
    previousByKey.get(key).push(fact);
    previousBySourceKey.set(`${key}::${getRecoverySourceIdentity_(fact)}`, fact);
  });
  facts.forEach((fact) => {
    const key = buildStableClaimKey_(fact);
    const candidates = previousByKey.get(key) || [];
    let previous = previousBySourceKey.get(`${key}::${getRecoverySourceIdentity_(fact)}`);
    if (previous) {
      const candidateIndex = candidates.indexOf(previous);
      if (candidateIndex >= 0) candidates.splice(candidateIndex, 1);
    } else {
      previous = candidates.shift();
    }
    if (!previous) return;
    ['source', 'dueDate', 'liabilitySchedule', 'liabilityTiming', 'calculationEndDate', 'destinations'].forEach((field) => {
      if (previous[field] !== undefined) fact[field] = previous[field];
    });
  });
  return Object.assign({}, result, {
    totals: summarizeClaimConstructorCalculationTotals_(
      underpaymentValues, indexationValues, liabilityValues
    ),
    claimFacts: facts,
  });
}

function buildTableFromDescriptor_(descriptor) {
  if (!descriptor) return null;
  return {
    headerRow: descriptor.headerRow,
    headerValues: descriptor.headerValues || [],
    layout: descriptor.layout,
    columns: Object.assign({}, descriptor.semanticColumns || {}),
    descriptor,
  };
}

function summarizeClaimConstructorCalculationTotals_(underpaymentValues, indexationValues, liabilityValues) {
  const sum = (values) => (values || []).reduce((total, row) => {
    const value = parseMoney_(row && row[0]);
    return total + (value === null ? 0 : value);
  }, 0);
  return {
    underpayment: sum(underpaymentValues),
    indexation: sum(indexationValues),
    liability: sum(liabilityValues),
  };
}

function applyCalculationEffectFactFlags_(calculationResults, calculationEffects) {
  const disputedKeys = new Set((calculationEffects && calculationEffects.claimFacts || [])
    .filter((fact) => fact && fact.disputed === true)
    .map(buildStableClaimKey_));
  if (!disputedKeys.size) return calculationResults;
  (calculationResults || []).forEach((result) => {
    (result.claimFacts || []).forEach((fact) => {
      if (disputedKeys.has(buildStableClaimKey_(fact))) fact.disputed = true;
    });
  });
  return calculationResults;
}

function buildClaimFactsFromCalculationRows_(params) {
  const settings = params || {};
  const rows = settings.rows || [];
  const table = settings.table || {};
  const columns = table.columns || {};
  const layoutId = table.layout && table.layout.id ? table.layout.id : 'unknown';
  const base = getClaimFactBase_(layoutId);
  const facts = [];

  rows.forEach((row, rowIndex) => {
    const period = parseRowPeriod_(row, columns);
    if (!period) return;
    const sourceMetadata = settings.sourceMetadata && settings.sourceMetadata[rowIndex];
    const common = {
      layoutId,
      baseKind: base.kind,
      baseLabel: base.label,
      periodKey: `${period.year}-${pad2_(period.month)}`,
      periodLabel: `${pad2_(period.month)}.${period.year}`,
      disputed: false,
      sourceRef: `${settings.sheetName || layoutId}!${Number(table.headerRow || 0) + rowIndex + 1}`,
    };
    if (sourceMetadata) {
      common.source = sourceMetadata.source;
      common.dueDate = sourceMetadata.dueDate;
      common.liabilitySchedule = sourceMetadata.liabilitySchedule;
      common.liabilityTiming = sourceMetadata.liabilityTiming;
      common.calculationEndDate = sourceMetadata.calculationEndDate;
      common.destinations = sourceMetadata.destinations;
    }
    appendClaimFactIfPositive_(facts, common, 'underpayment', 'principal',
      readClaimFactAmount_(settings.underpaymentValues, rowIndex));
    if (layoutId === 'salary') {
      appendClaimFactIfPositive_(facts, common, 'salary_indexation', 'salary_indexation',
        calculateSalaryIndexationFactAmount_(row, columns));
    }
    appendClaimFactIfPositive_(facts, common, 'underpayment_indexation', 'inflation_indexation',
      readClaimFactAmount_(settings.indexationValues, rowIndex));
    appendClaimFactIfPositive_(facts, common, 'material_liability', 'article_236',
      readClaimFactAmount_(settings.liabilityValues, rowIndex));
  });
  return facts;
}

function getClaimFactBase_(layoutId) {
  const bases = {
    salary: { kind: 'salary', label: 'Оклад' },
    monthlyPremiums: { kind: 'monthly_premium', label: 'Ежемесячная премия' },
    quarterlyPremiums: { kind: 'quarterly_premium', label: 'Ежеквартальная премия' },
    annualPremiums: { kind: 'annual_premium', label: 'Ежегодная премия' },
    vacation: { kind: 'vacation', label: 'Отпускные' },
  };
  return bases[layoutId] || { kind: normalizeText_(layoutId) || 'unknown', label: 'Иное начисление' };
}

function readClaimFactAmount_(values, rowIndex) {
  const value = values && values[rowIndex] ? parseMoney_(values[rowIndex][0]) : null;
  return value === null ? null : roundMoney_(value);
}

function calculateSalaryIndexationFactAmount_(row, columns) {
  if (!Number.isInteger(columns.correctAmount)
    || !Number.isInteger(columns.salaryBeforeIndexation)) return null;
  const indexedSalary = parseMoney_(row[columns.correctAmount]);
  const salaryBeforeIndexation = parseMoney_(row[columns.salaryBeforeIndexation]);
  if (indexedSalary === null || salaryBeforeIndexation === null) return null;
  return roundMoney_(indexedSalary - salaryBeforeIndexation);
}

function appendClaimFactIfPositive_(facts, common, family, calculationItem, amount) {
  if (amount === null || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return;
  const fact = {
    family,
    layoutId: common.layoutId,
    baseKind: common.baseKind,
    baseLabel: common.baseLabel,
    periodKey: common.periodKey,
    periodLabel: common.periodLabel,
    calculationItem,
    amount: roundMoney_(Number(amount)),
    disputed: common.disputed === true,
    sourceRef: common.sourceRef,
  };
  if (common.source) fact.source = common.source;
  if (common.dueDate) fact.dueDate = common.dueDate;
  if (common.liabilitySchedule) fact.liabilitySchedule = common.liabilitySchedule;
  if (common.liabilityTiming) fact.liabilityTiming = common.liabilityTiming;
  if (common.calculationEndDate) fact.calculationEndDate = common.calculationEndDate;
  if (common.destinations) fact.destinations = common.destinations;
  facts.push(fact);
}

function applyPartialRecoveries_(claimFacts, recoveryState, compensationRates, options) {
  const state = recoveryState || { valid: [], invalid: [], unallocated: [] };
  const rates = compensationRates || [];
  const facts = (claimFacts || []).map((fact) => Object.assign({}, fact));
  const principalByKey = new Map();
  facts.forEach((fact, inputOrder) => {
    if (fact.family === 'underpayment' && fact.calculationItem === 'principal') {
      const key = buildStableClaimKey_(fact);
      if (!principalByKey.has(key)) principalByKey.set(key, []);
      principalByKey.get(key).push({ fact, inputOrder });
    }
  });
  const valid = (state.valid || []).map((recovery, inputOrder) => ({ recovery, inputOrder }));
  valid.sort((left, right) => {
    const dateDifference = left.recovery.date.getTime() - right.recovery.date.getTime();
    return dateDifference || left.inputOrder - right.inputOrder;
  });
  const byTarget = new Map();
  valid.forEach((item) => {
    if (!byTarget.has(item.recovery.allocation)) byTarget.set(item.recovery.allocation, []);
    byTarget.get(item.recovery.allocation).push(item.recovery);
  });
  ((options && options.recomputeTargetKeys) || []).forEach((targetKey) => {
    if (!byTarget.has(targetKey)) byTarget.set(targetKey, []);
  });

  const warnings = (state.unallocated || []).map((recovery) => ({
    code: 'unallocated_recovery',
    disputed: true,
    recovery,
    reason: 'Частичное погашение не распределено и не уменьшает расчетные требования.',
  }));
  const auditFacts = (state.unallocated || []).map((recovery, index) => {
    const recoveryDate = recovery.date instanceof Date ? recovery.date : null;
    return {
      family: 'unallocated_recovery',
      layoutId: 'unallocated_recovery',
      baseKind: 'unallocated_recovery',
      baseLabel: 'Нераспределенное погашение',
      periodKey: recoveryDate
        ? `${recoveryDate.getFullYear()}-${pad2_(recoveryDate.getMonth() + 1)}-${pad2_(recoveryDate.getDate())}`
        : 'unknown_period',
      periodLabel: recoveryDate ? formatDate_(recoveryDate) : 'дата не указана',
      calculationItem: `unallocated_recovery_${Number.isInteger(recovery.rowIndex) ? recovery.rowIndex + 1 : index + 1}`,
      amount: roundMoney_(Number(recovery.amount) || 0),
      disputed: true,
      sourceRef: `questionnaire_recovery_${Number.isInteger(recovery.rowIndex) ? recovery.rowIndex + 1 : index + 1}`,
    };
  }).filter((fact) => fact.amount > 0);
  const overpayments = [];
  const liabilitySegments = [];
  const writeBacks = [];
  const sourceAdjustments = [];

  byTarget.forEach((recoveries, targetKey) => {
    const principalEntries = principalByKey.get(targetKey) || [];
    if (!principalEntries.length) {
      recoveries.forEach((recovery) => warnings.push({
        code: 'recovery_target_missing', recovery, targetKey,
        reason: 'Целевое требование частичного погашения не найдено; остальные расчеты продолжены.',
      }));
      return;
    }
    const sourceStates = principalEntries.map((entry) => {
      const principal = entry.fact;
      const sourceIdentity = getRecoverySourceIdentity_(principal);
      const declaredSchedule = (principal.liabilitySchedule || [])
        .filter((segment) => segment && segment.dueDate instanceof Date && Number(segment.principal) > 0)
        .map((segment, scheduleOrder) => ({
          id: segment.id || `segment_${scheduleOrder + 1}`,
          dueDate: new Date(segment.dueDate),
          calculationEndDate: segment.calculationEndDate instanceof Date
            ? new Date(segment.calculationEndDate)
            : new Date(principal.calculationEndDate),
          outstanding: roundMoney_(Number(segment.principal)),
          scheduleOrder,
          sourceIdentity,
          inputOrder: entry.inputOrder,
        }));
      const schedule = declaredSchedule.length
        ? declaredSchedule
        : (principal.liabilityTiming === 'single_due_date' && principal.dueDate instanceof Date ? [{
            id: 'singleDueDate', dueDate: new Date(principal.dueDate),
            calculationEndDate: new Date(principal.calculationEndDate),
            outstanding: roundMoney_(Number(principal.amount) || 0), scheduleOrder: 0,
            sourceIdentity, inputOrder: entry.inputOrder,
          }] : []);
      return {
        principal,
        sourceIdentity,
        inputOrder: entry.inputOrder,
        initialPrincipal: roundMoney_(Number(principal.amount) || 0),
        schedule,
      };
    });
    if (sourceStates.some((sourceState) => !sourceState.schedule.length
      || !(sourceState.principal.calculationEndDate instanceof Date))) {
      warnings.push({
        code: 'recovery_dates_missing', targetKey,
        reason: 'Для требования не заданы адаптером срок выплаты и дата окончания расчета.',
      });
      return;
    }
    if (!rates.length) {
      warnings.push({
        code: 'recovery_rates_missing', targetKey,
        reason: 'Перерасчет частичного погашения пропущен: ставки ст. 236 ТК РФ не переданы в чистое расчетное ядро.',
      });
      return;
    }
    const orderedSegments = sourceStates.reduce(
      (segments, sourceState) => segments.concat(sourceState.schedule), []
    ).sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime()
      || left.scheduleOrder - right.scheduleOrder
      || left.sourceIdentity.localeCompare(right.sourceIdentity)
      || left.inputOrder - right.inputOrder);
    recoveries.forEach((recovery) => {
      const eligibleSegments = orderedSegments.filter((segment) =>
        segment.outstanding > 0
        && segment.dueDate <= recovery.date
        && recovery.date <= segment.calculationEndDate
      );
      const eligibleOutstanding = roundMoney_(eligibleSegments.reduce(
        (sum, segment) => sum + segment.outstanding, 0
      ));
      let recoveryRemainder = Math.min(
        eligibleOutstanding, Number(recovery.amount) || 0
      );
      eligibleSegments.forEach((scheduleSegment) => {
        const applied = roundMoney_(Math.min(scheduleSegment.outstanding, recoveryRemainder));
        if (applied <= 0) return;
        const result = calculateSalaryCompensation_(applied, scheduleSegment.dueDate, recovery.date, rates);
        liabilitySegments.push({
          targetKey,
          sourceIdentity: scheduleSegment.sourceIdentity,
          schedulePart: scheduleSegment.id,
          kind: 'recovered',
          principal: applied,
          dueDate: new Date(scheduleSegment.dueDate),
          endDate: new Date(recovery.date),
          calculationEndDate: new Date(scheduleSegment.calculationEndDate),
          amount: result.amount,
          intervals: result.intervals,
        });
        scheduleSegment.outstanding = roundMoney_(scheduleSegment.outstanding - applied);
        recoveryRemainder = roundMoney_(recoveryRemainder - applied);
      });
      const applied = roundMoney_(Math.min(
        eligibleOutstanding, Number(recovery.amount) || 0
      ) - recoveryRemainder);
      const unapplied = roundMoney_((Number(recovery.amount) || 0) - applied);
      const outsideSegments = orderedSegments.filter((segment) =>
        segment.outstanding > 0 && eligibleSegments.indexOf(segment) < 0
      );
      const outsideOutstanding = roundMoney_(outsideSegments.reduce(
        (sum, segment) => sum + segment.outstanding, 0
      ));
      const deferredAmount = roundMoney_(Math.min(unapplied, outsideOutstanding));
      if (deferredAmount > 0) {
        const sourceIdentities = Array.from(new Set(outsideSegments.map((segment) =>
          segment.sourceIdentity
        )));
        warnings.push({
          code: 'recovery_out_of_period_deferred', recovery, targetKey,
          amount: deferredAmount, sourceIdentities,
          reason: `Сумма ${formatMoneyRu_(deferredAmount, 2)} не применена: по конкретным источникам долг существует вне временных границ этого погашения.`,
        });
      }
      const remainder = roundMoney_(unapplied - deferredAmount);
      if (remainder > 0) {
        const overpayment = { recovery, targetKey, applied, remainder };
        overpayments.push(overpayment);
        warnings.push({
          code: 'recovery_overpayment',
          overpayment,
          reason: `Погашение превышает остаток требования на ${formatMoneyRu_(remainder, 2)}; остаток требует проверки.`,
        });
      }
    });
    orderedSegments.forEach((scheduleSegment) => {
      if (scheduleSegment.outstanding <= 0) return;
      const result = calculateSalaryCompensation_(
        scheduleSegment.outstanding, scheduleSegment.dueDate,
        scheduleSegment.calculationEndDate, rates
      );
      liabilitySegments.push({
        targetKey,
        sourceIdentity: scheduleSegment.sourceIdentity,
        schedulePart: scheduleSegment.id,
        kind: 'outstanding',
        principal: scheduleSegment.outstanding,
        dueDate: new Date(scheduleSegment.dueDate),
        endDate: new Date(scheduleSegment.calculationEndDate),
        calculationEndDate: new Date(scheduleSegment.calculationEndDate),
        amount: result.amount,
        intervals: result.intervals,
      });
    });
    const relatedIndexations = [];
    sourceStates.forEach((sourceState) => {
      const principal = sourceState.principal;
      const sourceOutstanding = roundMoney_(sourceState.schedule.reduce(
        (sum, segment) => sum + segment.outstanding, 0
      ));
      principal.amount = sourceOutstanding;
      sourceAdjustments.push({
        targetKey,
        sourceIdentity: sourceState.sourceIdentity,
        source: principal.source ? Object.assign({}, principal.source) : null,
        destination: principal.destinations && principal.destinations.principal
          ? Object.assign({}, principal.destinations.principal) : null,
        baselinePrincipal: principal._recoveryBaseline
          ? principal._recoveryBaseline.baselinePrincipal
          : sourceState.initialPrincipal,
        adjustedPrincipal: sourceOutstanding,
        fingerprint: principal._recoveryBaseline
          ? principal._recoveryBaseline.fingerprint
          : buildRecoveryFingerprint_(recoveries),
      });
      const relatedLiability = findRecoveryRelatedFact_(
        facts, principal, 'material_liability', 'article_236'
      );
      const relatedIndexation = findRecoveryRelatedFact_(
        facts, principal, 'underpayment_indexation', 'inflation_indexation'
      );
      if (relatedIndexation) relatedIndexations.push({ principal, fact: relatedIndexation });
      const liabilityAmount = roundMoney_(liabilitySegments
        .filter((segment) => segment.targetKey === targetKey
          && segment.sourceIdentity === sourceState.sourceIdentity)
        .reduce((sum, segment) => sum + segment.amount, 0));
      if (relatedLiability) relatedLiability.amount = liabilityAmount;
      const explanation = `Частичное погашение учтено хронологически. Исходная сумма источника: ${formatMoneyRu_(sourceState.initialPrincipal, 2)}; остаток: ${formatMoneyRu_(sourceOutstanding, 2)}. Материальная ответственность по ст. 236 ТК РФ пересчитана по графику этого источника.`;
      if (principal.destinations && principal.destinations.principal) {
        writeBacks.push({
          destination: principal.destinations.principal,
          value: sourceOutstanding,
          kind: 'principal',
          note: explanation,
        });
      }
      const liabilityDestination = principal.destinations && principal.destinations.liability
        || relatedLiability && relatedLiability.destinations && relatedLiability.destinations.liability;
      if (liabilityDestination) {
        writeBacks.push({
          destination: liabilityDestination,
          value: liabilityAmount,
          kind: 'liability',
          note: explanation,
        });
      }
    });
    if (relatedIndexations.some((item) => {
      const destination = item.principal.destinations && item.principal.destinations.indexation
        || item.fact.destinations && item.fact.destinations.indexation;
      return !destination || destination.recoveryTimingSupported !== true;
    })) {
      relatedIndexations.forEach((item) => { item.fact.disputed = true; });
      warnings.push({
        code: 'recovery_indexation_timing_unsupported',
        targetKey,
        reason: 'Индексация не изменена: действующая методология не определяет корректировку индексации по дате частичного погашения; позиция отмечена как спорная.',
      });
    }
  });

  return {
    claimFacts: facts.filter((fact) => Number(fact.amount) > 0),
    auditFacts,
    liabilitySegments,
    writeBacks,
    sourceAdjustments,
    warnings,
    overpayments,
    unallocated: state.unallocated || [],
    invalid: state.invalid || [],
  };
}

function findRecoveryRelatedFact_(facts, principal, family, calculationItem) {
  const sourceIdentity = getRecoverySourceIdentity_(principal);
  return (facts || []).find((fact) => fact.family === family
    && fact.layoutId === principal.layoutId
    && fact.baseKind === principal.baseKind
    && fact.periodKey === principal.periodKey
    && fact.calculationItem === calculationItem
    && getRecoverySourceIdentity_(fact) === sourceIdentity);
}

function writeRecoveryAdjustedResultsToSheets_(spreadsheet, writeBacks, options) {
  const settings = options || {};
  const result = {
    success: false, written: 0, writtenBacks: [], blockedWriteBacks: [], warnings: [],
  };
  const lock = settings.lockHeld ? null : getRecoveryWriteLock_();
  let acquired = settings.lockHeld === true;
  try {
    if (lock) {
      acquired = lock.tryLock(30000);
      if (!acquired) {
        result.warnings.push({
          code: 'recovery_write_lock_unavailable',
          reason: 'Не удалось получить блокировку для записи результатов частичных погашений.',
        });
        return result;
      }
    }
    const preparedWrites = [];
    const snapshotsByCell = new Map();
    (writeBacks || []).forEach((writeBack) => {
      const destination = writeBack.destination || {};
      const sheet = spreadsheet.getSheetByName(destination.sheetName);
      if (!sheet || !destination.row || !destination.column) {
        result.warnings.push({ code: 'writeback_destination_missing', writeBack });
        return;
      }
      const range = sheet.getRange(destination.row, destination.column);
      const formula = typeof range.getFormula === 'function' ? range.getFormula() : '';
      if (formula && destination.adapterOwned !== true) {
        result.warnings.push({
          code: 'formula_writeback_blocked', writeBack,
          source: `${destination.sheetName}!R${destination.row}C${destination.column}`,
          destination: Object.assign({}, destination),
          reason: 'Формула сохранена: адаптер не объявил ячейку собственным расчетным выходом.',
        });
        result.blockedWriteBacks.push(writeBack);
        return;
      }
      const cellKey = [destination.sheetName, destination.row, destination.column].join('|');
      if (!snapshotsByCell.has(cellKey)) {
        snapshotsByCell.set(cellKey, {
          range,
          value: range.getValue(),
          formula,
          note: typeof range.getNote === 'function' ? range.getNote() : '',
          background: typeof range.getBackground === 'function' ? range.getBackground() : '',
          numberFormat: typeof range.getNumberFormat === 'function' ? range.getNumberFormat() : '',
        });
      }
      preparedWrites.push({ writeBack, range });
    });
    try {
      preparedWrites.forEach((prepared) => {
        const writeBack = prepared.writeBack;
        const range = prepared.range;
        range.setValue(writeBack.value).setNumberFormat(SETTINGS.MONEY_FORMAT);
        if (typeof range.setNote === 'function') {
          range.setNote(mergeCalculationEffectNote_(range.getNote(),
            `Частичное погашение. ${writeBack.note || ''}`));
        }
        result.written++;
        result.writtenBacks.push(writeBack);
      });
      if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.flush) SpreadsheetApp.flush();
      result.success = true;
      return result;
    } catch (error) {
      const rollbackErrors = [];
      snapshotsByCell.forEach((snapshot) => {
        let restored = false;
        let lastRollbackError = null;
        for (let attempt = 0; attempt < 2 && !restored; attempt++) {
          try {
            restoreRecoveryWriteSnapshot_(snapshot);
            restored = true;
          } catch (rollbackError) {
            lastRollbackError = rollbackError;
          }
        }
        if (!restored) {
          rollbackErrors.push(lastRollbackError || new Error('Не удалось восстановить ячейку'));
        }
      });
      if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.flush) {
        let flushed = false;
        let lastFlushError = null;
        for (let attempt = 0; attempt < 2 && !flushed; attempt++) {
          try {
            SpreadsheetApp.flush();
            flushed = true;
          } catch (rollbackFlushError) {
            lastFlushError = rollbackFlushError;
          }
        }
        if (!flushed) rollbackErrors.push(lastFlushError || new Error('Не удалось flush rollback'));
      }
      if (rollbackErrors.length) {
        throw new Error(`${error.message || error}; rollback failed: ${rollbackErrors
          .map((rollbackError) => rollbackError.message || rollbackError).join('; ')}`);
      }
      throw error;
    }
  } finally {
    if (lock && acquired) lock.releaseLock();
  }
}

function getRecoveryWriteLock_() {
  if (typeof LockService === 'undefined') return null;
  return LockService.getDocumentLock && LockService.getDocumentLock()
    || LockService.getScriptLock && LockService.getScriptLock()
    || null;
}

function restoreRecoveryWriteSnapshot_(snapshot) {
  const range = snapshot.range;
  range.setValue(snapshot.value);
  if (snapshot.formula) range.setFormula(snapshot.formula);
  if (typeof range.setNote === 'function') range.setNote(snapshot.note);
  if (typeof range.setBackground === 'function') range.setBackground(snapshot.background);
  if (typeof range.setNumberFormat === 'function') range.setNumberFormat(snapshot.numberFormat);
  if (Object.prototype.hasOwnProperty.call(snapshot, 'dataValidation')
    && typeof range.setDataValidation === 'function') {
    range.setDataValidation(snapshot.dataValidation || null);
  }
  if (typeof range.getFormula === 'function' && range.getFormula() !== snapshot.formula) {
    throw new Error('Формула не восстановлена');
  }
  if (!snapshot.formula && typeof range.getValue === 'function'
    && range.getValue() !== snapshot.value) {
    throw new Error('Значение не восстановлено');
  }
  if (typeof range.getNote === 'function' && range.getNote() !== snapshot.note) {
    throw new Error('Примечание не восстановлено');
  }
  if (typeof range.getBackground === 'function'
    && range.getBackground() !== snapshot.background) {
    throw new Error('Фон не восстановлен');
  }
  if (typeof range.getNumberFormat === 'function'
    && range.getNumberFormat() !== snapshot.numberFormat) {
    throw new Error('Формат числа не восстановлен');
  }
  if (Object.prototype.hasOwnProperty.call(snapshot, 'dataValidation')
    && typeof range.getDataValidation === 'function'
    && !calculationDataValidationsEqual_(range.getDataValidation(), snapshot.dataValidation)) {
    throw new Error('Проверка данных не восстановлена');
  }
}

function prepareRecoveryBaselineFacts_(claimFacts, recoveryState) {
  const facts = (claimFacts || []).map((fact) => Object.assign({}, fact));
  const registry = readRecoveryBaselineRegistry_();
  const recoveriesByTarget = new Map();
  ((recoveryState && recoveryState.valid) || []).forEach((recovery) => {
    if (!recoveriesByTarget.has(recovery.allocation)) recoveriesByTarget.set(recovery.allocation, []);
    recoveriesByTarget.get(recovery.allocation).push(recovery);
  });
  const recomputeTargetKeys = new Set();
  facts.forEach((fact) => {
    if (fact.family !== 'underpayment' || fact.calculationItem !== 'principal') return;
    const targetKey = buildStableClaimKey_(fact);
    const sourceIdentity = getRecoverySourceIdentity_(fact);
    const registryKey = buildRecoveryRegistryKey_(targetKey, sourceIdentity);
    const previous = registry[registryKey];
    const currentPrincipal = roundMoney_(Number(fact.amount) || 0);
    const recoveries = recoveriesByTarget.get(targetKey) || [];
    if (!recoveries.length && !previous) return;
    const baselinePrincipal = previous
      && roundMoney_(Number(previous.lastAdjusted)) === currentPrincipal
      ? roundMoney_(Number(previous.baselinePrincipal))
      : currentPrincipal;
    fact.amount = baselinePrincipal;
    fact.liabilitySchedule = rescaleRecoveryLiabilitySchedule_(
      fact.liabilitySchedule, currentPrincipal, baselinePrincipal
    );
    fact._recoveryBaseline = {
      registryKey,
      targetKey,
      sourceIdentity,
      baselinePrincipal,
      lastAdjusted: previous ? previous.lastAdjusted : null,
      fingerprint: buildRecoveryFingerprint_(recoveries),
    };
    recomputeTargetKeys.add(targetKey);
  });
  return { claimFacts: facts, registry, recomputeTargetKeys: Array.from(recomputeTargetKeys) };
}

function restoreRegisteredRecoveryBaselines_(spreadsheet, registry) {
  let restored = 0;
  Object.keys(registry || {}).forEach((registryKey) => {
    const entry = registry[registryKey] || {};
    const destination = entry.destination || {};
    if (!destination.sheetName || !destination.row || !destination.column) return;
    const sheet = spreadsheet.getSheetByName(destination.sheetName);
    if (!sheet) return;
    const range = sheet.getRange(destination.row, destination.column);
    const current = parseMoney_(range.getValue());
    if (current === null || roundMoney_(current) !== roundMoney_(Number(entry.lastAdjusted))) return;
    range.setValue(roundMoney_(Number(entry.baselinePrincipal)));
    restored++;
  });
  return restored;
}

function persistRecoveryBaselineState_(prepared, recoveryEffects, writeResult, options) {
  const writtenPrincipalKeys = new Set(((writeResult && writeResult.writtenBacks) || [])
    .filter((writeBack) => writeBack.kind === 'principal')
    .map((writeBack) => [writeBack.destination.sheetName, writeBack.destination.row,
      writeBack.destination.column].join('|')));
  const nextRegistry = {};
  ((prepared && prepared.claimFacts) || []).forEach((fact) => {
    const baseline = fact && fact._recoveryBaseline;
    if (!baseline) return;
    const previous = prepared.registry && prepared.registry[baseline.registryKey];
    if (previous) nextRegistry[baseline.registryKey] = Object.assign({}, previous);
  });
  const blockedPrincipalKeys = new Set(((writeResult && writeResult.blockedWriteBacks) || [])
    .filter((writeBack) => writeBack.kind === 'principal' && writeBack.destination)
    .map((writeBack) => [writeBack.destination.sheetName, writeBack.destination.row,
      writeBack.destination.column].join('|')));
  ((prepared && prepared.claimFacts) || []).forEach((fact) => {
    const baseline = fact && fact._recoveryBaseline;
    const destination = fact && fact.destinations && fact.destinations.principal;
    if (!baseline || !destination) return;
    const destinationKey = [destination.sheetName, destination.row, destination.column].join('|');
    if (blockedPrincipalKeys.has(destinationKey)) delete nextRegistry[baseline.registryKey];
  });
  const factByAdjustmentKey = new Map(((prepared && prepared.claimFacts) || [])
    .filter((fact) => fact && fact._recoveryBaseline)
    .map((fact) => [[fact._recoveryBaseline.targetKey,
      fact._recoveryBaseline.sourceIdentity].join('::'), fact]));
  ((recoveryEffects && recoveryEffects.sourceAdjustments) || []).forEach((adjustment) => {
    const fact = factByAdjustmentKey.get([adjustment.targetKey, adjustment.sourceIdentity].join('::'));
    const registryKey = buildRecoveryRegistryKey_(adjustment.targetKey, adjustment.sourceIdentity);
    const destination = fact && fact.destinations && fact.destinations.principal;
    const destinationKey = destination
      ? [destination.sheetName, destination.row, destination.column].join('|') : '';
    if (!destination || !writtenPrincipalKeys.has(destinationKey)) return;
    if (!adjustment.fingerprint) {
      delete nextRegistry[registryKey];
      return;
    }
    nextRegistry[registryKey] = {
      baselinePrincipal: roundMoney_(adjustment.baselinePrincipal),
      lastAdjusted: roundMoney_(adjustment.adjustedPrincipal),
      fingerprint: adjustment.fingerprint,
      destination: Object.assign({}, adjustment.destination || destination),
      source: adjustment.source ? Object.assign({}, adjustment.source) : fact && fact.source
        ? Object.assign({}, fact.source) : null,
    };
  });
  if (!(options && options.deferWrite)) writeRecoveryBaselineRegistry_(nextRegistry);
  return nextRegistry;
}

function readRecoveryBaselineRegistry_() {
  if (typeof PropertiesService === 'undefined') return {};
  const raw = PropertiesService.getDocumentProperties().getProperty(RECOVERY_BASELINE_PROPERTY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writeRecoveryBaselineRegistry_(registry) {
  if (typeof PropertiesService === 'undefined') return;
  const properties = PropertiesService.getDocumentProperties();
  if (!registry || !Object.keys(registry).length) {
    properties.deleteProperty(RECOVERY_BASELINE_PROPERTY);
    return;
  }
  properties.setProperty(RECOVERY_BASELINE_PROPERTY, JSON.stringify(registry));
}

function buildRecoveryFingerprint_(recoveries) {
  const parts = (recoveries || []).map((recovery) => [
    recovery.date instanceof Date ? recovery.date.getTime() : '',
    roundMoney_(Number(recovery.amount) || 0),
    String(recovery.allocation || ''),
  ].join(':')).sort();
  return parts.length ? parts.join('|') : '';
}

function getRecoverySourceIdentity_(fact) {
  const source = fact && fact.source || {};
  const destination = fact && fact.destinations && fact.destinations.principal || {};
  return [
    source.sheetId !== null && source.sheetId !== undefined ? source.sheetId : source.sheetName || destination.sheetName || 'unknown_sheet',
    source.row || destination.row || 'unknown_row',
    source.adapterId || fact.layoutId || 'unknown_adapter',
  ].join('|');
}

function buildRecoveryRegistryKey_(targetKey, sourceIdentity) {
  return `${targetKey}::${sourceIdentity}`;
}

function rescaleRecoveryLiabilitySchedule_(schedule, currentPrincipal, baselinePrincipal) {
  if (!Array.isArray(schedule) || !schedule.length || currentPrincipal <= 0
    || currentPrincipal === baselinePrincipal) return schedule;
  const scaled = schedule.map((segment) => Object.assign({}, segment, {
    principal: roundMoney_(Number(segment.principal) * baselinePrincipal / currentPrincipal),
  }));
  const difference = roundMoney_(baselinePrincipal - scaled.reduce(
    (sum, segment) => sum + Number(segment.principal || 0), 0
  ));
  if (scaled.length && difference) {
    scaled[scaled.length - 1].principal = roundMoney_(scaled[scaled.length - 1].principal + difference);
  }
  return scaled;
}

function prepareVacationDerivativeRows_(sheet, table, rows, runContext) {
  const result = { written: 0, warnings: [], markerDestinations: [] };
  if (!sheet || !table || !table.layout || table.layout.id !== 'vacation'
    || table.layout.derivativeOutput !== true) return result;
  const columns = table.columns || {};
  const required = [
    'correctAnnualSalary', 'annualSalaryDivisor', 'vacationDays',
    'averageDailyEarning', 'actualDerivativeAmount', 'correctDerivativeAmount',
    'derivativeUnderpayment', 'derivativeIndexation', 'derivativeLiability',
  ];
  const missing = required.filter((semantic) => !Number.isInteger(columns[semantic]));
  if (missing.length) {
    result.warnings.push({
      code: 'vacation_derivative_contract_incomplete',
      missing,
      reason: 'Адаптер отпускных не объявил все семантические колонки производного расчета.',
    });
    return result;
  }

  (rows || []).forEach((row, rowIndex) => {
    const vacationEvent = getVacationEventDate_(row, table);
    if (!vacationEvent) return;
    const annualSalary = calculateVacationCorrectAnnualSalary_(
      vacationEvent.date, table.layout, runContext
    );
    const divisor = parseMoney_(row[columns.annualSalaryDivisor]);
    const vacationDays = parseMoney_(row[columns.vacationDays]);
    const actualPaid = parseMoney_(row[columns.actualDerivativeAmount]);
    if (annualSalary === null || divisor === null || divisor <= 0
      || vacationDays === null || vacationDays < 0 || actualPaid === null) {
      result.warnings.push({
        code: 'vacation_derivative_inputs_invalid',
        row: table.headerRow + rowIndex + 1,
        reason: 'Производный расчет отпускных пропущен: требуются годовая база, положительный делитель, дни и фактически начисленная сумма.',
      });
      return;
    }

    const averageDaily = roundMoney_(annualSalary / divisor);
    const correctAmount = roundMoney_(averageDaily * vacationDays);
    const underpayment = roundMoney_(correctAmount - actualPaid);
    const sheetRow = table.headerRow + rowIndex + 1;
    const baseNote = `Реконструированная сумма корректного годового заработка за 12 месяцев до ${formatDate_(vacationEvent.date)}. Дата события: ${vacationEvent.source}. Годовые премии за незавершенный календарный год в отпускную базу не включаются.`;
    const effectNote = `Производная выплата пересчитана из-за изменения расчетной базы: средний дневной заработок = ${formatMoneyRu_(annualSalary, 2)} / ${formatMoneyRu_(divisor, 6)} = ${formatMoneyRu_(averageDaily, 2)}; корректное начисление = ${formatMoneyRu_(averageDaily, 2)} x ${formatMoneyRu_(vacationDays, 6)} = ${formatMoneyRu_(correctAmount, 2)}; недоплата = ${formatMoneyRu_(correctAmount, 2)} - ${formatMoneyRu_(actualPaid, 2)} = ${formatMoneyRu_(underpayment, 2)}.`;
    const writes = [
      { semantic: 'correctAnnualSalary', value: annualSalary, note: baseNote, marker: false },
      { semantic: 'averageDailyEarning', value: averageDaily, note: effectNote, marker: true },
      { semantic: 'correctDerivativeAmount', value: correctAmount, note: effectNote, marker: true },
      { semantic: 'derivativeUnderpayment', value: underpayment, note: effectNote, marker: true },
    ];
    let complete = true;
    writes.forEach((write) => {
      const column = columns[write.semantic];
      const destination = { sheetName: sheet.getName(), row: sheetRow, column: column + 1 };
      const written = writeVacationDerivativeCell_(
        sheet, destination, write.value, write.note, write.marker,
        isVacationDerivativeColumnOwned_(table.layout, write.semantic), result.warnings
      );
      if (!written) complete = false;
      if (written) {
        row[column] = write.value;
        result.written++;
      }
      if (write.marker) result.markerDestinations.push(destination);
    });
    if (!complete) return;
    ['derivativeIndexation', 'derivativeLiability'].forEach((semantic) => {
      result.markerDestinations.push({
        sheetName: sheet.getName(), row: sheetRow, column: columns[semantic] + 1,
        note: effectNote,
      });
    });
  });
  if (Number.isInteger(columns.correctAnnualSalary)) {
    sheet.getRange(table.headerRow, columns.correctAnnualSalary + 1)
      .setNote('Авторасчет: реконструированная корректная сумма годового заработка по смежным листам.');
  }
  return result;
}

function isVacationDerivativeColumnOwned_(layout, semantic) {
  return !!(layout && Array.isArray(layout.derivativeOwnedOutputs)
    && layout.derivativeOwnedOutputs.indexOf(semantic) >= 0);
}

function writeVacationDerivativeCell_(sheet, destination, value, note, marker, adapterOwned, warnings) {
  const range = sheet.getRange(destination.row, destination.column);
  const formula = typeof range.getFormula === 'function' ? range.getFormula() : '';
  if (formula && adapterOwned !== true) {
    warnings.push({
      code: 'formula_writeback_blocked', destination,
      source: `${destination.sheetName}!R${destination.row}C${destination.column}`,
      reason: 'Формула сохранена: семантическая колонка не объявлена выходом адаптера отпускных.',
    });
    return false;
  }
  range.setValue(value).setNumberFormat(SETTINGS.MONEY_FORMAT);
  if (marker) range.setBackground('#D9EAD3');
  else range.setBackground(SETTINGS.BACKGROUND_DEFAULT);
  if (typeof range.setNote === 'function') {
    range.setNote(mergeCalculationEffectNote_(range.getNote(), note));
  }
  return true;
}

function markVacationDerivativeOutputs_(sheet, destinations) {
  (destinations || []).forEach((destination) => {
    const range = sheet.getRange(destination.row, destination.column);
    range.setBackground('#D9EAD3');
    if (typeof range.setNote === 'function') {
      range.setNote(mergeCalculationEffectNote_(range.getNote(), destination.note
        || 'Производная выплата пересчитана из-за изменения расчетной базы.'));
    }
  });
}

function getDerivativePaymentDependencyRegistry_() {
  return {
    'vacation|average_earnings': { supported: true, calculation: 'existing_vacation_methodology' },
    'averageEarnings|average_earnings': { supported: true, calculation: 'existing_average_earnings_methodology' },
  };
}

function buildVacationDerivativeDependencies_(sheet, table, previousValues, recalculatedValues) {
  if (!sheet || !table || !table.layout || table.layout.id !== 'vacation'
    || table.layout.derivativeOutput !== true
    || !Number.isInteger(table.columns && table.columns.correctAnnualSalary)) return [];
  return (recalculatedValues || []).reduce((dependencies, row, rowIndex) => {
    const previous = parseMoney_(previousValues && previousValues[rowIndex]
      ? previousValues[rowIndex][0] : null);
    const recalculated = parseMoney_(row && row[0]);
    if (previous === null || recalculated === null
      || roundMoney_(previous) === roundMoney_(recalculated)) return dependencies;
    dependencies.push({
      layoutId: 'vacation',
      dependencyKind: 'average_earnings',
      baseChanged: true,
      destination: {
        sheetName: sheet.getName(),
        row: table.headerRow + rowIndex + 1,
        column: table.columns.correctAnnualSalary + 1,
        adapterOwned: table.layout.derivativeOutput === true,
      },
      recalculate: () => recalculated,
    });
    return dependencies;
  }, []);
}

function buildVacationOutputDependencies_(sheet, table, markerDestinations) {
  if (!sheet || !table || !table.layout || table.layout.id !== 'vacation') return [];
  const semanticByColumn = new Map([
    ['averageDailyEarning', table.columns.averageDailyEarning],
    ['correctDerivativeAmount', table.columns.correctDerivativeAmount],
    ['derivativeUnderpayment', table.columns.derivativeUnderpayment],
    ['derivativeIndexation', table.columns.derivativeIndexation],
    ['derivativeLiability', table.columns.derivativeLiability],
  ].filter((item) => Number.isInteger(item[1])).map((item) => [item[1] + 1, item[0]]));
  return (markerDestinations || []).reduce((dependencies, destination) => {
    const semantic = semanticByColumn.get(destination.column);
    if (!semantic) return dependencies;
    const outputRange = sheet.getRange(destination.row, destination.column);
    dependencies.push({
      layoutId: 'vacation',
      dependencyKind: 'average_earnings',
      semanticOutput: semantic,
      baseChanged: true,
      destination: Object.assign({}, destination, {
        adapterOwned: isVacationDerivativeColumnOwned_(table.layout, semantic),
      }),
      recalculate: () => parseMoney_(outputRange.getValue()),
    });
    return dependencies;
  }, []);
}

function detectDerivativePaymentDependencies_(spreadsheet, calculationResults, recoveryEffects) {
  const dependencies = [];
  (calculationResults || []).forEach((result) => {
    (result.derivativeDependencies || []).forEach((dependency) => {
      dependencies.push(Object.assign({}, dependency));
    });
  });
  const existingKeys = new Set(dependencies.map((dependency) => [
    dependency.layoutId,
    dependency.dependencyKind,
    dependency.destination && dependency.destination.sheetName,
    dependency.destination && dependency.destination.row,
    dependency.destination && dependency.destination.column,
  ].join('|')));
  (recoveryEffects && recoveryEffects.writeBacks || []).forEach((writeBack) => {
    if (writeBack.kind !== 'principal' || !writeBack.destination) return;
    const result = (calculationResults || []).find((item) =>
      item.sheetName === writeBack.destination.sheetName
    );
    if (!result || !/Premiums$/.test(result.layoutId || '')) return;
    const dependency = {
      layoutId: result.layoutId,
      dependencyKind: 'premium_base_without_explicit_formula',
      baseChanged: true,
      destination: Object.assign({}, writeBack.destination, { adapterOwned: false }),
    };
    const key = [dependency.layoutId, dependency.dependencyKind,
      dependency.destination.sheetName, dependency.destination.row,
      dependency.destination.column].join('|');
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      dependencies.push(dependency);
    }
  });
  return dependencies;
}

function applyDerivativePaymentEffects_(dependencies) {
  const registry = getDerivativePaymentDependencyRegistry_();
  const result = { updatedFacts: [], warnings: [], writeBacks: [] };
  (dependencies || []).forEach((dependency) => {
    if (!dependency || dependency.baseChanged !== true) return;
    const key = `${dependency.layoutId}|${dependency.dependencyKind}`;
    const definition = registry[key];
    if (!definition || typeof dependency.recalculate !== 'function') {
      const warning = {
        code: 'derivative_requires_review',
        layoutId: dependency.layoutId,
        dependencyKind: dependency.dependencyKind,
        reason: 'Зависимость производной выплаты неоднозначна; сумма не рассчитана и требует проверки.',
      };
      result.warnings.push(warning);
      result.writeBacks.push({
        destination: dependency.destination,
        reviewOnly: true,
        note: warning.reason,
      });
      return;
    }
    const amount = roundMoney_(Number(dependency.recalculate()));
    if (!Number.isFinite(amount)) {
      result.warnings.push({
        code: 'derivative_calculation_invalid',
        reason: 'Существующая методология не вернула числовой результат.',
      });
      return;
    }
    const fact = Object.assign({}, dependency.fact || {}, { amount, updated: true });
    result.updatedFacts.push(fact);
    result.writeBacks.push({
      destination: dependency.destination,
      value: amount,
      kind: 'derivative',
      note: 'Производная выплата изменена из-за изменения расчетной базы.',
    });
  });
  return result;
}

function writeDerivativePaymentEffectsToSheets_(spreadsheet, writeBacks) {
  const result = { written: 0, warnings: [] };
  (writeBacks || []).forEach((writeBack) => {
    const destination = writeBack.destination || {};
    const sheet = spreadsheet.getSheetByName(destination.sheetName);
    if (!sheet || !destination.row || !destination.column) {
      result.warnings.push({ code: 'writeback_destination_missing', writeBack });
      return;
    }
    const range = sheet.getRange(destination.row, destination.column);
    const formula = typeof range.getFormula === 'function' ? range.getFormula() : '';
    if (formula && destination.adapterOwned !== true) {
      result.warnings.push({
        code: 'formula_writeback_blocked', writeBack,
        source: `${destination.sheetName}!R${destination.row}C${destination.column}`,
        destination: Object.assign({}, destination),
        reason: 'Формула сохранена: адаптер не объявил ячейку собственным расчетным выходом.',
      });
      return;
    }
    if (writeBack.reviewOnly) {
      range.setBackground('#FFF2CC');
    } else {
      range.setValue(writeBack.value)
        .setNumberFormat(SETTINGS.MONEY_FORMAT)
        .setBackground('#D9EAD3');
      result.written++;
    }
    if (typeof range.setNote === 'function') {
      range.setNote(mergeCalculationEffectNote_(range.getNote(), writeBack.note || ''));
    }
  });
  return result;
}

function mergeCalculationEffectNote_(existingNote, ownedNote) {
  const existing = String(existingNote || '').trim();
  const addition = String(ownedNote || '').trim();
  if (!addition || existing.indexOf(addition) >= 0) return existing;
  return existing ? `${existing}\n${addition}` : addition;
}

function findTable_(sheet, descriptor) {
  const resolvedDescriptor = descriptor || resolveSheetLayout_(sheet);
  if (resolvedDescriptor && resolvedDescriptor.semanticColumns) {
    return {
      headerRow: resolvedDescriptor.headerRow,
      headerValues: resolvedDescriptor.headerValues || sheet
        .getRange(resolvedDescriptor.headerRow, 1, 1, sheet.getLastColumn())
        .getDisplayValues()[0],
      layout: resolvedDescriptor.layout,
      columns: Object.assign({}, resolvedDescriptor.semanticColumns),
      descriptor: resolvedDescriptor,
    };
  }
  const generatedLayout = /^Из_1С_/i.test(String(sheet.getName() || ''))
    ? getSheetLayout_(sheet.getName()) : null;
  const generatedAdapterFallback = generatedLayout
    && hasRecognizedFixedAdapterHeader_(sheet, generatedLayout);
  if (SETTINGS.USE_FIXED_COLUMNS && (resolvedDescriptor || generatedAdapterFallback)) {
    const layout = resolvedDescriptor
      ? resolvedDescriptor.layout || resolvedDescriptor
      : generatedLayout;
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
        salaryBeforeIndexation: layout.salaryBeforeIndexationColumn ? columnLetterToIndex_(layout.salaryBeforeIndexationColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.salaryBeforeIndexation),
        correctAnnualSalary: layout.correctAnnualSalaryColumn ? columnLetterToIndex_(layout.correctAnnualSalaryColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.correctAnnualSalary),
        annualSalaryDivisor: layout.annualSalaryDivisorColumn ? columnLetterToIndex_(layout.annualSalaryDivisorColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.annualSalaryDivisor),
        vacationDays: layout.vacationDaysColumn ? columnLetterToIndex_(layout.vacationDaysColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.vacationDays),
        averageDailyEarning: layout.averageDailyEarningColumn ? columnLetterToIndex_(layout.averageDailyEarningColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.averageDailyEarning),
        actualDerivativeAmount: layout.actualDerivativeAmountColumn ? columnLetterToIndex_(layout.actualDerivativeAmountColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.actualDerivativeAmount),
        correctDerivativeAmount: layout.correctDerivativeAmountColumn ? columnLetterToIndex_(layout.correctDerivativeAmountColumn) : resolveOptionalColumn_(headerValues, HEADER_ALIASES.correctDerivativeAmount),
        derivativeUnderpayment: layout.derivativeUnderpaymentColumn ? columnLetterToIndex_(layout.derivativeUnderpaymentColumn) : null,
        derivativeIndexation: layout.derivativeIndexationColumn ? columnLetterToIndex_(layout.derivativeIndexationColumn) : null,
        derivativeLiability: layout.derivativeLiabilityColumn ? columnLetterToIndex_(layout.derivativeLiabilityColumn) : null,
        vacationStartDate: resolveOptionalColumn_(headerValues, HEADER_ALIASES.vacationStartDate),
        paymentDate: resolveOptionalColumn_(headerValues, HEADER_ALIASES.paymentDate),
        paymentStatement: resolveOptionalColumn_(headerValues, HEADER_ALIASES.paymentStatement),
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

function hasRecognizedFixedAdapterHeader_(sheet, layout) {
  if (!sheet || !layout || sheet.getLastRow() < layout.headerRow || sheet.getLastColumn() < 1) {
    return false;
  }
  const headers = sheet.getRange(layout.headerRow, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];
  return headers.some((header) => Object.keys(HEADER_ALIASES).some((semantic) =>
    headerMatches_(header, HEADER_ALIASES[semantic])
  ));
}

function getSheetLayout_(sheetName) {
  const normalizedName = normalizeText_(String(sheetName || '').replace(/^Из_1С_/i, ''));
  return SETTINGS.SHEET_LAYOUTS.find((layout) =>
    new RegExp(layout.namePattern, 'i').test(normalizedName)
  ) || getDefaultSheetLayout_();
}

function resolveSheetLayout_(sheet) {
  if (!sheet || typeof sheet.getName !== 'function') return null;
  const rowCount = typeof sheet.getLastRow === 'function'
    ? Math.min(SETTINGS.HEADER_SCAN_ROWS, sheet.getLastRow())
    : 0;
  const columnCount = typeof sheet.getLastColumn === 'function' ? sheet.getLastColumn() : 0;
  if (rowCount > 0 && columnCount > 0) {
    let rows = [];
    try {
      rows = sheet.getRange(1, 1, rowCount, columnCount).getDisplayValues();
    } catch (error) {
      rows = [];
    }
    const normalizedName = normalizeText_(String(sheet.getName() || '').replace(/^Из_1С_/i, ''));
    const nameHint = SETTINGS.SHEET_LAYOUTS.find((layout) =>
      new RegExp(layout.namePattern, 'i').test(normalizedName)
    );
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const headers = rows[rowIndex].map(normalizeText_);
      const ids = getSemanticallyCompatibleLayoutIds_(headers);
      if (!ids.length) continue;
      const nameDisambiguates = nameHint && ids.indexOf(nameHint.id) >= 0;
      const id = nameDisambiguates ? nameHint.id : ids[0];
      const layout = SETTINGS.SHEET_LAYOUTS.find((candidate) => candidate.id === id) || null;
      if (!layout) return null;
      const semanticColumns = resolveSemanticColumnsForLayout_(rows[rowIndex], layout);
      if (!semanticColumns) continue;
      return Object.assign({}, layout, {
        layout,
        sheet,
        headerRow: rowIndex + 1,
        headerValues: rows[rowIndex],
        semanticColumns,
        ambiguous: ids.length > 1 && !nameDisambiguates,
        candidateLayoutIds: ids.slice(),
      });
    }
  }
  return null;
}

function discoverCalculationSheetDescriptors_(spreadsheet) {
  return (spreadsheet && spreadsheet.getSheets ? spreadsheet.getSheets() : []).reduce(
    (descriptors, sheet) => {
      if (isGeneratedSheetName_(sheet.getName())
        || sheet.getName() === 'Анкета и требования'
        || sheet.getName() === 'Конструктор') return descriptors;
      const descriptor = resolveSheetLayout_(sheet);
      if (descriptor && descriptor.semanticColumns) descriptors.push(descriptor);
      else if (descriptor && descriptor.id) descriptors.push({
        id: descriptor.id,
        layout: descriptor.layout || descriptor,
        sheet,
        headerRow: descriptor.headerRow || Math.max(1, Number(descriptor.dataStartRow || 2) - 1),
        headerValues: [],
        semanticColumns: {},
      });
      return descriptors;
    }, []
  );
}

function resolveSemanticColumnsForLayout_(headerValues, layout) {
  const headers = (headerValues || []).map(normalizeText_);
  const findAliases = (aliases) => headers.findIndex((header) =>
    (aliases || []).some((alias) => header.includes(normalizeText_(alias)))
  );
  const findPattern = (pattern) => headers.findIndex((header) => pattern.test(header));
  const columns = {};
  Object.keys(HEADER_ALIASES).forEach((semantic) => {
    const index = findAliases(HEADER_ALIASES[semantic]);
    if (index >= 0) columns[semantic] = index;
  });
  if (!Number.isInteger(columns.unpaidSalary)) {
    const unpaidPattern = layout.id === 'monthlyPremiums'
      ? /недоплат.*(ежемесяч|месячн).*прем/
      : layout.id === 'quarterlyPremiums'
        ? /недоплат.*(ежекварт|квартальн).*прем/
        : layout.id === 'annualPremiums'
          ? /недоплат.*(ежегод|годов).*прем/
          : layout.id === 'vacation' ? /недоплат.*отпуск/ : /(недоплат|невыплачен).*оклад/;
    const index = findPattern(unpaidPattern);
    if (index >= 0) columns.unpaidSalary = index;
  }
  if (layout.id === 'salary' && !Number.isInteger(columns.correctAmount)) {
    const index = findPattern(/(проиндексирован.*оклад|коррект.*заработн.*плат)/);
    if (index >= 0) columns.correctAmount = index;
  }
  if (!Number.isInteger(columns.penalty)) {
    const index = findPattern(/(пен[ия]|ст\.?\s*236|материальн.*ответствен)/);
    if (index >= 0) columns.penalty = index;
  }
  if (!Number.isInteger(columns.target)) {
    const index = findPattern(/индексац/);
    if (index >= 0) columns.target = index;
  }
  columns.totalUnderpayment = Number.isInteger(columns.totalUnderpayment)
    ? columns.totalUnderpayment : columns.unpaidSalary;
  if (layout.id === 'vacation' && !Number.isInteger(columns.period)
    && Number.isInteger(columns.paymentDate)) columns.period = columns.paymentDate;
  if (layout.updateMonthlyIpc && !Number.isInteger(columns.monthlyIpc)) {
    const index = findPattern(/(^|\s)ипц(\s|$)/);
    if (index >= 0) columns.monthlyIpc = index;
  }
  ['derivativeUnderpayment', 'derivativeIndexation', 'derivativeLiability'].forEach((semantic) => {
    if (Number.isInteger(columns[semantic])) return;
    const patterns = {
      derivativeUnderpayment: /недоплат.*отпуск/,
      derivativeIndexation: /индексац.*недоплат/,
      derivativeLiability: /(пен[ия]|ст\.?\s*236|материальн.*ответствен)/,
    };
    const index = findPattern(patterns[semantic]);
    if (index >= 0) columns[semantic] = index;
  });
  const hasPeriod = Number.isInteger(columns.period)
    || (Number.isInteger(columns.year) && Number.isInteger(columns.month));
  if (!hasPeriod || !Number.isInteger(columns.unpaidSalary)
    || !Number.isInteger(columns.target) || !Number.isInteger(columns.penalty)) return null;
  if (!Number.isInteger(columns.monthlyIpc)) columns.monthlyIpc = null;
  return columns;
}

function getSemanticallyCompatibleLayoutIds_(headers) {
  const normalizedHeaders = (headers || []).map(normalizeText_);
  const text = normalizedHeaders.join(' | ');
  const has = (aliases) => normalizedHeaders.some((header) => headerMatches_(header, aliases));
  const common = /(недоплат|невыплачен)/.test(text)
    && /индексац/.test(text)
    && /(пен[ия]|ст\.?\s*236|материальн.*ответствен)/.test(text);
  if (!common) return [];
  return Object.keys(SHEET_LAYOUT_SEMANTIC_CONTRACTS).filter((layoutId) => {
    const contract = SHEET_LAYOUT_SEMANTIC_CONTRACTS[layoutId];
    return (contract.requiredFields || []).every((field) =>
      HEADER_ALIASES[field] && has(HEADER_ALIASES[field])
    ) && (contract.requiredPatterns || []).every((pattern) => pattern.test(text));
  });
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
    values: range.getValues(),
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
  const descriptor = discoverCalculationSheetDescriptors_(spreadsheet)
    .find((candidate) => candidate.layout.id === layoutId);
  const sheet = descriptor && descriptor.sheet;

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

function buildSalaryDebtSchedule_(row, table, productionCalendar, options) {
  const period = parseRowPeriod_(row, table.columns);
  const paymentDates = Number.isInteger(table.columns.paymentDate)
    ? parsePaymentDatesCell_(row[table.columns.paymentDate]).dates
    : [];
  const inferredPaymentSchedule = options && options.inferredPaymentSchedule;
  const totalWorkDays = Number.isInteger(table.columns.workDays)
    ? parseMoney_(row[table.columns.workDays])
    : null;
  const totalWorkedDays = Number.isInteger(table.columns.workedDays)
    ? parseMoney_(row[table.columns.workedDays])
    : null;
  const correctAmount = options && options.correctAmount !== undefined
    ? options.correctAmount
    : (Number.isInteger(table.columns.correctAmount) ? parseMoney_(row[table.columns.correctAmount]) : null);
  const underpaymentAmount = options && options.totalUnderpayment !== undefined
    ? options.totalUnderpayment
    : (options && options.principal !== undefined ? options.principal : null);

  if (!period) {
    return {
      period: null,
      slices: [],
      missingReason: 'не определен расчетный период строки',
    };
  }

  let partData;
  if (paymentDates.length >= 2) {
    partData = SALARY_PAYMENT_PARTS.map((part, index) => ({
      part,
      dueDate: chooseSalaryStatementDate_(paymentDates, period, index),
      dateSource: `колонка ${indexToColumnLetter_(table.columns.paymentDate)}`,
    }));
  } else if (paymentDates.length === 1) {
    const part = classifySalaryPaymentPart_(paymentDates[0], period, inferredPaymentSchedule) || SALARY_PAYMENT_PARTS[1];
    partData = [{
      part,
      dueDate: paymentDates[0],
      dateSource: `колонка ${indexToColumnLetter_(table.columns.paymentDate)}`,
    }];
  } else {
    partData = SALARY_PAYMENT_PARTS.map((part) => {
      const inferred = getInferredSalaryPaymentDate_(inferredPaymentSchedule, period, part.id, productionCalendar);
      return {
        part,
        dueDate: inferred ? inferred.date : null,
        dateSource: inferred ? inferred.source : '',
      };
    });
  }

  const ranges = getSalaryPaymentWorkRanges_(period, partData, productionCalendar);
  const rawWorkDays = ranges.map((range) => countWorkingDaysBetween_(range.start, range.end, productionCalendar));
  const fallbackWorkDays = totalWorkDays || rawWorkDays.reduce((sum, value) => sum + value, 0);
  const shares = buildSalaryPartShares_(rawWorkDays, fallbackWorkDays, partData.length);
  const workedParts = splitAmountByShares_(totalWorkedDays, shares);
  const correctParts = splitAmountByShares_(correctAmount, shares);
  const underpaymentParts = splitAmountByShares_(underpaymentAmount, shares);

  return {
    period,
    slices: partData.map((item, index) => ({
      id: item.part.id,
      label: item.part.label,
      dueDate: item.dueDate,
      dateSource: item.dateSource,
      workDays: rawWorkDays[index] || roundNumber_((fallbackWorkDays || 0) * shares[index], 4),
      workedDays: workedParts[index],
      correctAmount: correctParts[index],
      underpaymentAmount: underpaymentParts[index],
    })),
    missingReason: '',
  };
}

function calculateSalaryScheduleCompensation_(schedule, actualPaymentDate, rates) {
  const parts = (schedule.slices || []).map((slice) => {
    if (!slice.dueDate || !slice.underpaymentAmount || slice.underpaymentAmount <= 0) {
      return {
        slice,
        result: {
          amount: 0,
          intervals: [],
          skipped: true,
        },
      };
    }
    return {
      slice,
      result: calculateSalaryCompensation_(slice.underpaymentAmount, slice.dueDate, actualPaymentDate, rates),
    };
  });

  return {
    amount: roundMoney_(parts.reduce((sum, part) => sum + part.result.amount, 0)),
    parts,
  };
}

function isSalaryScheduleReady_(schedule) {
  return Boolean(schedule && schedule.slices && schedule.slices.length && schedule.slices.every((slice) => slice.dueDate));
}

function buildSalaryMissingPaymentDatesMessage_(schedule) {
  if (schedule && schedule.missingReason) {
    return `Пени не рассчитаны: ${schedule.missingReason}.`;
  }
  return 'Пени не рассчитаны: не установлены даты выплаты зарплаты по частям месяца.';
}

function buildSalarySchedulePenaltyNote_(result, schedule, penaltyEnd, principal, layout) {
  const lines = [
    `Сумма для пеней: ${principal} (колонка ${layout.totalUnderpaymentColumn}, "${layout.totalLabel}")`,
    `Дата окончания: ${penaltyEnd.source}`,
    `Формула: часть долга x ставка / 100 / 150 x дни задержки`,
  ];
  if (!isSalaryScheduleReady_(schedule)) {
    lines.push(buildSalaryMissingPaymentDatesMessage_(schedule));
  }
  (result.parts || []).forEach((part) => {
    const slice = part.slice;
    lines.push(
      `${slice.label}: долг ${slice.underpaymentAmount || 0}, дата выплаты ${slice.dueDate ? formatDate_(slice.dueDate) : 'не установлена'} (${slice.dateSource || 'нет источника'}), пени ${part.result.amount}.`
    );
  });
  return lines.join('\n');
}

function inferSalaryPaymentScheduleForSheet_(spreadsheet, rows, table, productionCalendar) {
  const importedSheet = spreadsheet && spreadsheet.getSheetByName
    ? spreadsheet.getSheetByName('Из_1С_Оклад')
    : null;
  if (importedSheet) {
    try {
      const importedTable = findTable_(importedSheet);
      const lastRow = importedSheet.getLastRow();
      if (lastRow > importedTable.headerRow) {
        const importedRows = importedSheet
          .getRange(importedTable.headerRow + 1, 1, lastRow - importedTable.headerRow, importedSheet.getLastColumn())
          .getValues();
        const inferred = inferSalaryPaymentScheduleFromRows_(importedRows, importedTable, productionCalendar);
        if (inferred.firstHalf || inferred.secondHalf) {
          return inferred;
        }
      }
    } catch (error) {
      // Fall through to the current sheet values.
    }
  }
  return inferSalaryPaymentScheduleFromRows_(rows, table, productionCalendar);
}

function inferSalaryPaymentScheduleFromRows_(rows, table, productionCalendar) {
  const buckets = {
    firstHalf: [],
    secondHalf: [],
  };
  if (Number.isInteger(table.columns.paymentDate) && table.columns.paymentDate !== columnLetterToIndex_('R')) {
    return {
      firstHalf: null,
      secondHalf: null,
    };
  }
  (rows || []).forEach((row) => {
    const period = parseRowPeriod_(row, table.columns);
    if (!period || !Number.isInteger(table.columns.paymentDate)) {
      return;
    }
    const dates = parsePaymentDatesCell_(row[table.columns.paymentDate]).dates;
    dates.forEach((date) => {
      const part = classifySalaryPaymentPart_(date, period, null);
      if (!part) {
        return;
      }
      const normalized = normalizeObservedSalaryPaymentDate_(date, part.id, productionCalendar);
      buckets[part.id].push({
        day: normalized.day,
        monthOffset: getMonthOffset_(period, normalized.date),
      });
    });
  });

  return {
    firstHalf: summarizeSalaryPaymentBucket_(buckets.firstHalf),
    secondHalf: summarizeSalaryPaymentBucket_(buckets.secondHalf),
  };
}

function summarizeSalaryPaymentBucket_(items) {
  if (!items.length) {
    return null;
  }
  const counts = {};
  items.forEach((item) => {
    const key = `${item.day}|${item.monthOffset}`;
    if (!counts[key]) {
      counts[key] = {
        day: item.day,
        monthOffset: item.monthOffset,
        matches: 0,
        observations: items.length,
      };
    }
    counts[key].matches++;
  });
  return Object.keys(counts)
    .map((key) => counts[key])
    .sort((left, right) => right.matches - left.matches || left.monthOffset - right.monthOffset || left.day - right.day)[0];
}

function classifySalaryPaymentPart_(date, period, inferredPaymentSchedule) {
  const offset = getMonthOffset_(period, date);
  if (offset === 0 && date.getDate() >= 10) {
    return SALARY_PAYMENT_PARTS[0];
  }
  if (offset === 1 && date.getDate() <= 15) {
    return SALARY_PAYMENT_PARTS[1];
  }
  if (inferredPaymentSchedule) {
    const byDistance = SALARY_PAYMENT_PARTS
      .map((part) => {
        const inferred = getInferredSalaryPaymentDate_(inferredPaymentSchedule, period, part.id, {});
        return inferred ? { part, distance: Math.abs(Number(inferred.date) - Number(date)) } : null;
      })
      .filter(Boolean)
      .sort((left, right) => left.distance - right.distance)[0];
    return byDistance ? byDistance.part : null;
  }
  return null;
}

function normalizeObservedSalaryPaymentDate_(date, partId, productionCalendar) {
  if (partId === 'firstHalf') {
    const nextDay = addDays_(date, 1);
    if (isNonWorkingDay_(nextDay, productionCalendar)) {
      return {
        date: nextDay,
        day: nextDay.getDate(),
      };
    }
  }
  return {
    date,
    day: date.getDate(),
  };
}

function getInferredSalaryPaymentDate_(schedule, period, partId, productionCalendar) {
  const item = schedule && schedule[partId];
  if (!item || !period) {
    return null;
  }
  const date = new Date(period.year, period.month - 1 + item.monthOffset, item.day);
  while (isNonWorkingDay_(date, productionCalendar)) {
    date.setDate(date.getDate() - 1);
  }
  return {
    date,
    source: `восстановлено по графику выплат: ${item.day}-е число ${item.monthOffset ? 'следующего' : 'текущего'} месяца`,
  };
}

function chooseSalaryStatementDate_(paymentDates, period, index) {
  const part = SALARY_PAYMENT_PARTS[index];
  const matching = (paymentDates || []).find((date) => {
    const classified = classifySalaryPaymentPart_(date, period, null);
    return classified && classified.id === part.id;
  });
  return matching || (paymentDates || [])[index] || null;
}

function getSalaryPaymentWorkRanges_(period, partData, productionCalendar) {
  const monthStart = new Date(period.year, period.month - 1, 1);
  const monthEnd = new Date(period.year, period.month, 0);
  if (!partData.length) {
    return [];
  }
  if (partData.length === 1) {
    const id = partData[0].part.id;
    const start = id === 'secondHalf' && partData[0].dueDate
      ? clampDateToMonth_(partData[0].dueDate, monthStart, monthEnd)
      : monthStart;
    const end = id === 'firstHalf' && partData[0].dueDate
      ? addDays_(clampDateToMonth_(partData[0].dueDate, monthStart, monthEnd), -1)
      : monthEnd;
    return [{ start, end: end < start ? start : end }];
  }
  const firstDue = partData[0].dueDate
    ? clampDateToMonth_(partData[0].dueDate, monthStart, monthEnd)
    : new Date(period.year, period.month - 1, 16);
  return [
    { start: monthStart, end: addDays_(firstDue, -1) },
    { start: firstDue, end: monthEnd },
  ];
}

function clampDateToMonth_(date, monthStart, monthEnd) {
  if (!date || date < monthStart) {
    return monthStart;
  }
  if (date > monthEnd) {
    return monthEnd;
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function countWorkingDaysBetween_(startDate, endDate, productionCalendar) {
  if (!startDate || !endDate || endDate < startDate) {
    return 0;
  }
  let count = 0;
  for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays_(cursor, 1)) {
    if (!isNonWorkingDay_(cursor, productionCalendar)) {
      count++;
    }
  }
  return count;
}

function buildSalaryPartShares_(workDays, totalWorkDays, partCount) {
  const total = (workDays || []).reduce((sum, value) => sum + (value || 0), 0);
  if (total > 0) {
    return workDays.map((value) => (value || 0) / total);
  }
  const count = partCount || SALARY_PAYMENT_PARTS.length;
  return new Array(count).fill(1 / count);
}

function splitAmountByShares_(amount, shares) {
  if (amount === null || amount === undefined || amount === '') {
    return shares.map(() => null);
  }
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return shares.map(() => null);
  }
  let distributed = 0;
  return shares.map((share, index) => {
    if (index === shares.length - 1) {
      return roundMoney_(numeric - distributed);
    }
    const value = roundMoney_(numeric * share);
    distributed += value;
    return value;
  });
}

function getMonthOffset_(period, date) {
  return (date.getFullYear() * 12 + date.getMonth()) - (period.year * 12 + period.month - 1);
}

function sameCalendarDate_(left, right) {
  return left instanceof Date &&
    right instanceof Date &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
}

function calculateForcedAbsenceCompensation_(averageDailyEarning, startDate, endDate, productionCalendar, rates, options) {
  const annualVacationDays = options && options.annualVacationDays
    ? options.annualVacationDays
    : STANDARD_ANNUAL_VACATION_DAYS;
  const workDates = [];
  const dailyDebts = [];
  for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays_(cursor, 1)) {
    if (!isNonWorkingDay_(cursor, productionCalendar)) {
      const workDate = new Date(cursor);
      workDates.push(workDate);
      dailyDebts.push({
        date: workDate,
        result: calculateSalaryCompensation_(averageDailyEarning, workDate, endDate, rates),
      });
    }
  }
  const wageAmount = roundMoney_(averageDailyEarning * workDates.length);
  const penaltyAmount = roundMoney_(dailyDebts.reduce((sum, item) => sum + item.result.amount, 0));
  const vacationDays = annualVacationDays / 365 * inclusiveDays_(startDate, endDate);
  const vacationAmount = roundMoney_(averageDailyEarning * vacationDays);

  return {
    startDate,
    endDate,
    averageDailyEarning,
    annualVacationDays,
    workingDays: workDates.length,
    workDates,
    dailyDebts,
    dailyRows: buildForcedAbsenceDailyRows_(dailyDebts, averageDailyEarning, endDate),
    wageAmount,
    penaltyAmount,
    vacationDays,
    vacationAmount,
    amount: roundMoney_(wageAmount + penaltyAmount + vacationAmount),
  };
}

function buildForcedAbsenceDailyRows_(dailyDebts, averageDailyEarning, endDate) {
  return (dailyDebts || [])
    .filter((item) => item.result && !item.result.skipped)
    .map((item) => ({
      workDate: item.date,
      averageDailyEarning,
      accruedDebt: averageDailyEarning,
      delayStart: addDays_(item.date, 1),
      delayEnd: endDate,
      penalty: item.result.amount,
      intervals: item.result.intervals,
    }));
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
    const precise = sum * interval.rate / 100 / 150 * interval.days;
    const compensation = roundMoney_(precise);
    interval.compensationPrecise = precise;
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

function buildPenaltyNote_(result, dueDate, penaltyEnd, principal, layout, dueDateSource) {
  const lines = [
    `Сумма для пеней: ${principal} (колонка ${layout.totalUnderpaymentColumn}, "${layout.totalLabel}")`,
    `Установленная дата выплаты: ${formatDate_(dueDate)}`,
    `Источник даты выплаты: ${dueDateSource || 'период строки'}`,
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

function buildSalaryPaymentScheduleSummaryRows_(schedule, runDate) {
  return [
    ['Даты выплаты зарплаты', 'Восстановленный график по датам ведомостей'],
    ['Первая половина месяца', formatSalaryPaymentScheduleItem_(schedule && schedule.firstHalf)],
    ['Вторая половина месяца', formatSalaryPaymentScheduleItem_(schedule && schedule.secondHalf)],
    ['Обновлено', formatDate_(runDate)],
  ];
}

function formatSalaryPaymentScheduleItem_(item) {
  if (!item) {
    return 'не восстановлено';
  }
  return `${item.day}-е число ${item.monthOffset ? 'следующего' : 'текущего'} месяца (${item.matches}/${item.observations} наблюдений)`;
}

function readClaimCalculationParams_(spreadsheet) {
  const labelValues = scanSpreadsheetLabelValues_(spreadsheet);
  return readClaimCalculationParamsFromLabelValues_(labelValues);
}

function readClaimCalculationParamsFromLabelValues_(labelValues) {
  return {
    docUrl: findFirstLabeledDocUrl_(labelValues, [
      'расчет требований',
      'расчёт требований',
      'расписанный расчет',
      'расписанный расчёт',
    ]) || SETTINGS.CLAIM_CALCULATION_DOC_URL,
    averageDailyEarning: findFirstLabeledMoney_(labelValues, [
      'средний дневной заработок',
      'среднедневной заработок',
    ]),
    startDate: findFirstLabeledDate_(labelValues, [
      'дата начала вынужденного прогула',
      'начало вынужденного прогула',
      'начало прогула',
      'дата увольнения',
      'увольнения',
    ]),
    endDate: findFirstLabeledDate_(labelValues, [
      'дата окончания расчета',
      'дата окончания расчёта',
      'окончание расчета',
      'окончание расчёта',
      'дата окончания вынужденного прогула',
      'дата решения суда',
      'решения суда',
    ]),
    annualVacationDays: findFirstLabeledMoney_(labelValues, [
      'годовая норма отпуска',
      'норма отпуска',
      'дней отпуска в год',
    ]) || STANDARD_ANNUAL_VACATION_DAYS,
    summaryValues: collectClaimSummaryValues_(labelValues),
  };
}

function collectClaimSummaryValues_(labelValues) {
  const items = [
    ['Итого зарплата', ['итого зарплата']],
    ['Итого материальная ответственность', ['итого матответственность', 'итого материальной ответственности']],
    ['Итого индексация недоплаты', ['итого индексация недоплаты']],
    ['Итого отпускные', ['итого отпускные']],
    ['Цена иска', ['цена иска']],
    ['Сумма прогула', ['сумма прогул', 'сумма прогула']],
    ['Сумма матответственности', ['сумма матотв', 'сумма материальной ответственности', 'матответствен']],
    ['Сумма отпуска', ['сумма отпуска', 'сумма отпуск']],
  ];
  return items
    .map((item) => {
      const value = findFirstLabeledMoney_(labelValues, item[1]);
      return value === null ? null : [item[0], value];
    })
    .filter(Boolean);
}

function readAverageDailyEarningFromVacationSheet_(spreadsheet) {
  if (!spreadsheet || !spreadsheet.getSheetByName) {
    return null;
  }
  const sheet = spreadsheet.getSheetByName('Отпуска и расчет') || spreadsheet.getSheetByName('Отпуска');
  if (!sheet) {
    return null;
  }
  const layout = getSheetLayout_(sheet.getName());
  const column = layout.averageDailyEarningColumn
    ? columnLetterToIndex_(layout.averageDailyEarningColumn)
    : columnLetterToIndex_('E');
  const startRow = layout.dataStartRow || 2;
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) {
    return null;
  }
  const values = sheet
    .getRange(startRow, column + 1, lastRow - startRow + 1, 1)
    .getValues();
  for (let index = values.length - 1; index >= 0; index--) {
    const averageDailyEarning = parseMoney_(values[index][0]);
    if (averageDailyEarning) {
      return averageDailyEarning;
    }
  }
  return null;
}

function writeClaimCalculationResultToSheet_(sheetOrSpreadsheet, result, labelValues) {
  const effectiveLabelValues = labelValues || (
    sheetOrSpreadsheet && sheetOrSpreadsheet.getSheets
      ? scanSpreadsheetLabelValues_(sheetOrSpreadsheet)
      : scanSheetLabelValues_(sheetOrSpreadsheet, { rows: 80, columns: 25, includeRichText: false })
  );
  let written = 0;
  written += writeFirstLabeledValue_(effectiveLabelValues, [
    'сумма прогул',
    'сумма прогула',
  ], result.wageAmount, buildClaimCalculationSheetNote_(result, 'wage'));
  written += writeFirstLabeledValue_(effectiveLabelValues, [
    'сумма матотв',
    'сумма материальной ответственности',
  ], result.penaltyAmount, buildClaimCalculationSheetNote_(result, 'penalty'));
  written += writeFirstLabeledValue_(effectiveLabelValues, [
    'сумма отпуска',
    'сумма отпуск',
  ], result.vacationAmount, buildClaimCalculationSheetNote_(result, 'vacation'), {
    derivativeDependency: 'average_earnings',
  });
  return written;
}

function writeFirstLabeledValue_(labelValues, aliases, value, note, options) {
  const entry = findFirstLabelEntry_(labelValues, aliases, false);
  if (!entry || !entry.sheet) {
    return 0;
  }
  const range = entry.sheet.getRange(entry.row + 1, entry.column + 2);
  const previousValue = typeof range.getValue === 'function' ? range.getValue() : null;
  const previousNote = typeof range.getNote === 'function' ? range.getNote() : '';
  const changed = parseMoney_(previousValue) !== null
    && roundMoney_(parseMoney_(previousValue)) !== roundMoney_(Number(value));
  range.setValue(value).setNumberFormat(SETTINGS.MONEY_FORMAT);
  if (note && range.setNote) {
    range.setNote(mergeCalculationEffectNote_(previousNote, note));
  }
  if (changed && options && options.derivativeDependency) {
    if (typeof range.setBackground === 'function') range.setBackground('#D9EAD3');
    if (typeof range.setNote === 'function') {
      range.setNote(mergeCalculationEffectNote_(
        range.getNote(),
        'Производная выплата изменена из-за изменения расчетной базы.'
      ));
    }
  }
  return 1;
}

function buildClaimCalculationSheetNote_(result, type) {
  const lines = [
    `Период расчета: ${formatDate_(result.startDate)} - ${formatDate_(result.endDate)}`,
    `Средний дневной заработок: ${formatMoneyRu_(result.averageDailyEarning, 2)}`,
  ];
  if (type === 'wage') {
    lines.push(`Рабочих дней вынужденного прогула: ${result.workingDays}`);
    lines.push(`Формула: ${formatMoneyRu_(result.averageDailyEarning, 2)} x ${result.workingDays} = ${formatMoneyRu_(result.wageAmount, 2)}`);
  } else if (type === 'penalty') {
    lines.push('Пени ст. 236 ТК РФ считаются по каждому дневному долгу отдельно.');
    lines.push('Просрочка по каждому рабочему дню начинается со следующего календарного дня.');
    lines.push(`Итого пени: ${formatMoneyRu_(result.penaltyAmount, 2)}`);
  } else if (type === 'vacation') {
    lines.push(`Календарных дней периода: ${inclusiveDays_(result.startDate, result.endDate)}`);
    lines.push(`Накопленные дни отпуска: ${formatMoneyRu_(result.vacationDays, 6)}`);
    lines.push(`Формула: ${formatMoneyRu_(result.averageDailyEarning, 2)} x ${formatMoneyRu_(result.vacationDays, 6)} = ${formatMoneyRu_(result.vacationAmount, 2)}`);
  }
  return lines.join('\n');
}

function scanSpreadsheetLabelValues_(spreadsheet) {
  const result = [];
  spreadsheet.getSheets().forEach((sheet) => {
    Array.prototype.push.apply(result, scanSheetLabelValues_(sheet, {
      rows: 120,
      columns: 30,
      includeRichText: true,
    }));
  });
  return result;
}

function scanSheetLabelValues_(sheet, options) {
  const settings = options || {};
  const rows = Math.min(sheet.getLastRow(), settings.rows || 120);
  const columns = Math.min(sheet.getLastColumn(), settings.columns || 30);
  if (rows <= 0 || columns <= 0) {
    return [];
  }
  const range = sheet.getRange(1, 1, rows, columns);
  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  const richTextValues = settings.includeRichText && range.getRichTextValues ? range.getRichTextValues() : null;
  const result = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const label = normalizeText_(displayValues[row][column]).replace(/:$/, '');
      if (!label) {
        continue;
      }
      const candidates = [];
      collectNearbyLabelCandidates_(candidates, values, displayValues, richTextValues, row, column, rows, columns);
      result.push({
        sheet,
        sheetName: sheet.getName(),
        row,
        column,
        label,
        values: candidates.filter((value) => value !== null && value !== undefined && value !== ''),
      });
    }
  }
  return result;
}

function collectNearbyLabelCandidates_(candidates, values, displayValues, richTextValues, row, column, rowCount, columnCount) {
  for (let offset = 1; offset <= 5 && column + offset < columnCount; offset++) {
    collectLabelCandidateCell_(candidates, values, displayValues, richTextValues, row, column + offset);
  }
  for (let offset = 1; offset <= 30 && row + offset < rowCount; offset++) {
    collectLabelCandidateCell_(candidates, values, displayValues, richTextValues, row + offset, column);
  }
}

function collectLabelCandidateCell_(candidates, values, displayValues, richTextValues, row, column) {
  candidates.push(values[row][column]);
  candidates.push(displayValues[row][column]);
  if (richTextValues && richTextValues[row][column]) {
    const link = richTextValues[row][column].getLinkUrl();
    if (link) {
      candidates.push(link);
    }
  }
}

function findFirstLabeledValue_(labelValues, aliases) {
  const found = findFirstLabelEntry_(labelValues, aliases, true);
  return found ? found.values[0] : '';
}

function findFirstLabelEntry_(labelValues, aliases, requireValue) {
  const normalizedAliases = aliases.map((alias) => normalizeText_(alias));
  return (labelValues || []).find((entry) =>
    normalizedAliases.some((alias) => entry.label.indexOf(alias) >= 0) &&
    (!requireValue || entry.values.length)
  );
}

function findFirstLabeledDate_(labelValues, aliases) {
  return findFirstParsedLabeledValue_(labelValues, aliases, parseDateValue_);
}

function findFirstLabeledMoney_(labelValues, aliases) {
  return findFirstParsedLabeledValue_(labelValues, aliases, parseMoney_);
}

function findFirstLabeledDocUrl_(labelValues, aliases) {
  return findFirstParsedLabeledValue_(labelValues, aliases, (value) => {
    const text = String(value || '');
    return extractGoogleDocId_(text) ? extractGoogleDocUrl_(text) || text : null;
  });
}

function findFirstParsedLabeledValue_(labelValues, aliases, parser) {
  const normalizedAliases = aliases.map((alias) => normalizeText_(alias));
  for (const entry of (labelValues || [])) {
    if (!normalizedAliases.some((alias) => entry.label.indexOf(alias) >= 0)) {
      continue;
    }
    for (const value of entry.values) {
      const parsed = parser(value);
      if (parsed !== null && parsed !== undefined && parsed !== '') {
        return parsed;
      }
    }
  }
  return null;
}

function writeClaimCalculationDoc_(docUrl, params, result) {
  const documentId = extractGoogleDocId_(docUrl);
  if (!documentId) {
    throw new Error('Не удалось определить ID Google Doc для расчета требований.');
  }
  const document = DocumentApp.openById(documentId);
  const body = document.getBody();
  replaceClaimCalculationAutoBlock_(body);
  appendHiddenClaimMarker_(body, CLAIM_CALCULATION_START_MARKER);
  body.appendParagraph('Автоматически обновляемый расчет').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(`Дата формирования: ${formatDate_(todayInSpreadsheetTimezone_(Session.getScriptTimeZone()))}`);

  body.appendParagraph('Исходные данные').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendTable([
    ['Показатель', 'Значение'],
    ['Средний дневной заработок', formatMoneyRu_(params.averageDailyEarning, 2)],
    ['Дата начала вынужденного прогула', formatDate_(params.startDate)],
    ['Дата окончания расчета', formatDate_(params.endDate)],
    ['Годовая норма отпуска', String(params.annualVacationDays || STANDARD_ANNUAL_VACATION_DAYS)],
  ]);

  if (params.summaryValues && params.summaryValues.length) {
    body.appendParagraph('Сводка из таблицы').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendTable([['Показатель', 'Сумма']].concat(
      params.summaryValues.map((row) => [row[0], formatMoneyRu_(row[1], 2)])
    ));
  }

  body.appendParagraph('Вынужденный прогул').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(
    `Сумма среднего заработка за время вынужденного прогула: ${formatMoneyRu_(params.averageDailyEarning, 2)} x ${result.workingDays} раб. дн. = ${formatMoneyRu_(result.wageAmount, 2)}.`
  );

  body.appendParagraph('Материальная ответственность по ст. 236 ТК РФ').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(
    `Долг по среднему заработку возникает ежедневно: каждый рабочий день формирует новый долг в размере среднего дневного заработка ${formatMoneyRu_(result.averageDailyEarning, 2)}. Пени считаются отдельно по каждому дневному долгу со следующего календарного дня после соответствующего рабочего дня до ${formatDate_(params.endDate)}.`
  );
  body.appendParagraph(
    `Накопительный итог считается последовательным суммированием: накопительно по строке N = пени строки 1 + ... + пени строки N. Последний накопительный итог равен общей сумме пеней: ${formatMoneyRu_(result.penaltyAmount, 2)}.`
  );
  body.appendTable(buildForcedAbsenceDocTableRows_(result, params));

  body.appendParagraph('Накопленные отпуска за вынужденный прогул').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(
    `Накопленные дни отпуска: ${formatMoneyRu_(result.annualVacationDays, 0)} / 365 x ${inclusiveDays_(params.startDate, params.endDate)} кал. дн. = ${formatMoneyRu_(result.vacationDays, 6)} дн.`
  );
  body.appendParagraph(
    `Денежная оценка накопленного отпуска: ${formatMoneyRu_(params.averageDailyEarning, 2)} x ${formatMoneyRu_(result.vacationDays, 6)} = ${formatMoneyRu_(result.vacationAmount, 2)}.`
  );

  body.appendParagraph('Итого').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendTable([
    ['Требование', 'Сумма'],
    ['Средний заработок за вынужденный прогул', formatMoneyRu_(result.wageAmount, 2)],
    ['Пени ст. 236 ТК РФ', formatMoneyRu_(result.penaltyAmount, 2)],
    ['Накопленные отпуска', formatMoneyRu_(result.vacationAmount, 2)],
    ['Итого', formatMoneyRu_(result.amount, 2)],
  ]);
  appendHiddenClaimMarker_(body, CLAIM_CALCULATION_END_MARKER);
  document.saveAndClose();
}

function appendHiddenClaimMarker_(body, marker) {
  const paragraph = body
    .appendParagraph(marker)
    .setHeading(DocumentApp.ParagraphHeading.NORMAL)
    .setSpacingBefore(0)
    .setSpacingAfter(0);
  try {
    paragraph
      .editAsText()
      .setFontSize(1)
      .setForegroundColor('#ffffff');
  } catch (error) {
    Logger.log(`Не удалось скрыть технический маркер Docs: ${error && error.message ? error.message : error}`);
  }
  return paragraph;
}

function replaceClaimCalculationAutoBlock_(body) {
  const start = findBodyParagraphByText_(body, CLAIM_CALCULATION_START_MARKER);
  const end = findBodyParagraphByText_(body, CLAIM_CALCULATION_END_MARKER);
  if (!start || !end || start.index > end.index) {
    return;
  }
  if (end.index === body.getNumChildren() - 1) {
    body.appendParagraph('');
  }
  for (let index = end.index; index >= start.index; index--) {
    removeBodyChildSafely_(body, index);
  }
}

function removeBodyChildSafely_(body, index) {
  const child = body.getChild(index);
  if (body.getNumChildren && body.getNumChildren() <= 1) {
    body.appendParagraph('');
  }
  try {
    body.removeChild(child);
  } catch (error) {
    if (
      /last paragraph in a document section/i.test(String(error && error.message ? error.message : error)) &&
      child &&
      child.getType &&
      child.getType() === DocumentApp.ElementType.PARAGRAPH &&
      child.asParagraph &&
      child.asParagraph().setText
    ) {
      child.asParagraph().setText('');
      return;
    }
    throw error;
  }
}

function findBodyParagraphByText_(body, text) {
  for (let index = 0; index < body.getNumChildren(); index++) {
    const child = body.getChild(index);
    if (
      child.getType &&
      child.getType() === DocumentApp.ElementType.PARAGRAPH &&
      child.asParagraph().getText() === text
    ) {
      return { child, index };
    }
  }
  return null;
}

function buildForcedAbsenceDocTableRows_(result, params) {
  const entries = [];
  let cumulativePenalty = 0;
  (result.dailyDebts || []).forEach((item) => {
    cumulativePenalty = roundMoney_(cumulativePenalty + item.result.amount);
    entries.push([
      formatDate_(item.date),
      `${formatDate_(addDays_(item.date, 1))} - ${formatDate_(params.endDate)}`,
      formatMoneyRu_(item.result.amount, 2),
      formatMoneyRu_(cumulativePenalty, 2),
    ]);
  });

  const rows = [[
    'Дата',
    'Просрочка',
    'Пени',
    'Накопительно',
    'Дата',
    'Просрочка',
    'Пени',
    'Накопительно',
  ]];
  for (let index = 0; index < entries.length; index += 2) {
    rows.push(entries[index].concat(entries[index + 1] || ['', '', '', '']));
  }
  return rows;
}

function extractGoogleDocId_(value) {
  const match = String(value || '').match(/\/document\/d\/([^/]+)/);
  return match ? match[1] : '';
}

function buildForcedAbsenceCalculationTableRows_(result, startDate, endDate, annualVacationDays) {
  const vacationDaysPerCalendarDay = annualVacationDays / 365;
  return (result.dailyDebts || []).map((item) => [
    item.date,
    result.averageDailyEarning,
    result.averageDailyEarning,
    addDays_(item.date, 1),
    endDate,
    item.result.amount,
    roundNumber_(vacationDaysPerCalendarDay * inclusiveDays_(startDate, item.date), 8),
  ]);
}

function deleteSalaryAuxiliaryColumns_(sheet, layout) {
  const startColumn = columnLetterToIndex_('S') + 1;
  const count = 5;
  if (isSalaryAuxiliaryColumnsDeleted_(sheet, layout)) {
    return;
  }
  if (sheet.getMaxColumns && sheet.getMaxColumns() >= startColumn + count - 1) {
    sheet.deleteColumns(startColumn, count);
    sheet.getRange(1, columnLetterToIndex_('Q') + 1).setNote('Служебные колонки S:W удалены после перехода на компактную сводку графика выплат.');
  }
}

function isSalaryAuxiliaryColumnsDeleted_(sheet, layout) {
  const note = sheet.getRange(1, columnLetterToIndex_('Q') + 1).getNote();
  return /S:W/.test(note || '');
}

function isAutoIndexationInputEdit_(table, startColumn, endColumn) {
  const outputColumns = [
    table.columns.monthlyIpc,
    table.columns.target,
    table.columns.penalty,
    table.columns.correctAnnualSalary,
  ].filter(Number.isInteger);
  for (let column = startColumn; column <= endColumn; column++) {
    if (outputColumns.indexOf(column) >= 0) {
      return false;
    }
  }
  return true;
}

function renameLegacyVacationSheet_(spreadsheet) {
  const oldSheet = spreadsheet.getSheetByName('Отпуска');
  const targetSheet = spreadsheet.getSheetByName('Отпуска и расчет');
  if (oldSheet && !targetSheet) {
    oldSheet.setName('Отпуска и расчет');
  }
}

function isFinalSettlementRow_(row, table, finalSettlementDate) {
  if (!(finalSettlementDate instanceof Date)) {
    return false;
  }
  const periodDate = Number.isInteger(table.columns.period)
    ? parseDateValue_(row[table.columns.period])
    : null;
  const paymentDate = Number.isInteger(table.columns.paymentDate)
    ? parseDateValue_(row[table.columns.paymentDate])
    : null;
  return sameCalendarDate_(periodDate, finalSettlementDate) ||
    sameCalendarDate_(paymentDate, finalSettlementDate);
}

function getRowIndexationStart_(row, table, productionCalendar, finalSettlementDate) {
  if (isFinalSettlementRow_(row, table, finalSettlementDate)) {
    return {
      date: finalSettlementDate,
      source: 'дата окончательного расчета при увольнении',
    };
  }
  return {
    date: getRowStartDate_(row, table.columns, table.layout, productionCalendar),
    source: 'период строки, 5-е число следующего месяца с переносом на рабочий день',
  };
}

function collectCurrentCalculationRowsFromSheet_(sheet, table, finalSettlementDate) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= table.headerRow) {
    return [];
  }
  const values = sheet
    .getRange(table.headerRow + 1, 1, lastRow - table.headerRow, sheet.getLastColumn())
    .getValues();
  return values
    .map((row, index) => {
      const finalSettlement = isFinalSettlementRow_(row, table, finalSettlementDate);
      const eventDate = finalSettlement
        ? finalSettlementDate
        : (getVacationEventDate_(row, table) || {}).date;
      return {
        sheetName: sheet.getName(),
        rowNumber: table.headerRow + 1 + index,
        sectionId: finalSettlement ? 'finalSettlement' : table.layout.id,
        eventDate,
        underpayment: Number.isInteger(table.columns.unpaidSalary)
          ? parseMoney_(row[table.columns.unpaidSalary])
          : null,
        indexation: Number.isInteger(table.columns.target)
          ? parseMoney_(row[table.columns.target])
          : null,
        penalty: Number.isInteger(table.columns.penalty)
          ? parseMoney_(row[table.columns.penalty])
          : null,
      };
    })
    .filter((item) => item.eventDate || item.underpayment !== null);
}

function isReportSummaryRow_(row, table) {
  const periodColumns = [
    table && table.columns ? table.columns.year : null,
    table && table.columns ? table.columns.month : null,
    table && table.columns ? table.columns.period : null,
  ].filter(Number.isInteger);
  if (periodColumns.some((column) => row[column] !== null && row[column] !== undefined && row[column] !== '')) {
    return false;
  }
  const leadingText = normalizeText_((row || []).slice(0, 3).join(' '));
  return /(^|\s)итого([\s,:]|$)/.test(leadingText);
}

function parseA1Cell_(value) {
  const match = String(value || '').trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    row: Number(match[2]),
    column: columnLetterToIndex_(match[1]) + 1,
  };
}

function buildDetailedCompensationEntryTitle_(layout, periodLabel, suffix) {
  const titles = {
    salary: 'Оклад',
    monthlyPremiums: 'Ежемесячные премии',
    quarterlyPremiums: 'Ежеквартальные премии',
    annualPremiums: 'Ежегодные премии',
    vacation: 'Отпуска',
  };
  const base = titles[layout.id] || 'Расчет';
  return `${base}${periodLabel ? ` (${periodLabel})` : ''}${suffix || ''}`;
}

function buildDetailedCompensationDelayHeading_(entry, index) {
  const label = entry.groupId === 'vacation'
    ? `Задержка отпускных${entry.periodLabel ? ` (${entry.periodLabel})` : ''}`
    : `Задержка заработной платы - ${String(entry.title || '').toLowerCase()}`;
  return `7.${index + 1}. ${label}`;
}

function extractGoogleDocUrl_(value) {
  const match = String(value || '').match(/https:\/\/docs[.]google[.]com\/document\/d\/[^/\s]+\/edit/);
  return match ? match[0] : '';
}

function isDetailedCompensationDocLabel_(value) {
  return /^расписанный расч[её]т:?$/i.test(normalizeText_(value));
}

function formatMoneyRu_(value, digits) {
  const fixed = roundNumber_(value, digits).toFixed(digits);
  const parts = fixed.split('.');
  const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return digits > 0 ? `${integer},${parts[1]}` : integer;
}

function formatMoneyWordsRu_(value) {
  const rubles = Math.floor(Math.abs(value));
  const kopecks = Math.round((Math.abs(value) - rubles) * 100);
  return `${numberToWordsRu_(rubles, true)} ${declineRu_(rubles, ['рубль', 'рубля', 'рублей'])} ${pad2_(kopecks)} ${declineRu_(kopecks, ['копейка', 'копейки', 'копеек'])}`;
}

function numberToWordsRu_(number, feminine) {
  if (number === 0) {
    return 'ноль';
  }
  const units = feminine
    ? ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
    : ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
  const scales = [
    { forms: ['', '', ''], feminine },
    { forms: ['тысяча', 'тысячи', 'тысяч'], feminine: true },
    { forms: ['миллион', 'миллиона', 'миллионов'], feminine: false },
  ];
  const words = [];
  let rest = number;
  let scale = 0;
  while (rest > 0) {
    const chunk = rest % 1000;
    if (chunk) {
      const scaleInfo = scales[scale] || scales[0];
      const chunkWords = numberChunkToWordsRu_(chunk, scaleInfo.feminine, units, teens, tens, hundreds);
      if (scale > 0) {
        chunkWords.push(declineRu_(chunk, scaleInfo.forms));
      }
      words.unshift(chunkWords.join(' '));
    }
    rest = Math.floor(rest / 1000);
    scale++;
  }
  return words.join(' ');
}

function numberChunkToWordsRu_(number, feminine, defaultUnits, teens, tens, hundreds) {
  const units = feminine
    ? ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
    : defaultUnits;
  const words = [];
  words.push(hundreds[Math.floor(number / 100)]);
  const lastTwo = number % 100;
  if (lastTwo >= 10 && lastTwo <= 19) {
    words.push(teens[lastTwo - 10]);
  } else {
    words.push(tens[Math.floor(lastTwo / 10)]);
    words.push(units[lastTwo % 10]);
  }
  return words.filter(Boolean);
}

function declineRu_(number, forms) {
  const lastTwo = Math.abs(number) % 100;
  const last = Math.abs(number) % 10;
  if (lastTwo >= 11 && lastTwo <= 14) {
    return forms[2];
  }
  if (last === 1) {
    return forms[0];
  }
  if (last >= 2 && last <= 4) {
    return forms[1];
  }
  return forms[2];
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

function getRowPenaltyDueDate_(row, table, productionCalendar) {
  if (Number.isInteger(table.columns.paymentDate)) {
    const parsed = parsePaymentDateCell_(row[table.columns.paymentDate]);
    if (parsed.date) {
      return {
        date: parsed.date,
        source: parsed.count > 1
          ? `колонка ${indexToColumnLetter_(table.columns.paymentDate)}, последняя из ${parsed.count} дат ведомостей`
          : `колонка ${indexToColumnLetter_(table.columns.paymentDate)}`,
      };
    }
  }

  const date = getRowStartDate_(row, table.columns, table.layout, productionCalendar);
  return {
    date,
    source: 'период строки, 5-е число следующего месяца с переносом на рабочий день',
  };
}

function parsePaymentDatesCell_(value) {
  if (value instanceof Date) {
    return { date: value, dates: [value], count: 1 };
  }

  const text = String(value || '');
  const dates = [];
  const numericPattern = /(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/g;
  let numericMatch;
  while ((numericMatch = numericPattern.exec(text)) !== null) {
    const parsed = buildParsedDate_(numericMatch[1], numericMatch[2], numericMatch[3], new Date().getFullYear());
    if (parsed && parsed.date) {
      dates.push(parsed.date);
    }
  }

  if (dates.length) {
    dates.sort((left, right) => Number(left) - Number(right));
    return { date: dates[dates.length - 1], dates, count: dates.length };
  }

  const fallback = parseDateValue_(value);
  return { date: fallback, dates: fallback ? [fallback] : [], count: fallback ? 1 : 0 };
}

function parsePaymentDateCell_(value) {
  const parsed = parsePaymentDatesCell_(value);
  return {
    date: parsed.date,
    count: parsed.count,
  };
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

function calculateVacationCorrectAnnualSalary_(paymentDate, layout, runContext) {
  if (!(paymentDate instanceof Date)) {
    return null;
  }

  const endDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
  const startDate = addMonths_(endDate, -12);
  if (runContext && Array.isArray(runContext.successfulSourceSnapshot)) {
    return reconstructCorrectAnnualEarningsFromSnapshot_(
      runContext.successfulSourceSnapshot, startDate, endDate, paymentDate
    );
  }
  return reconstructCorrectAnnualEarnings_(startDate, endDate, paymentDate);
}

function reconstructCorrectAnnualEarningsFromSnapshot_(snapshot, startDate, endDate, eventDate) {
  return roundMoney_((snapshot || []).reduce((total, item) => {
    const periodDate = new Date(item.periodYear, item.periodMonth - 1, 1);
    if (periodDate < startDate || periodDate >= endDate) return total;
    if (item.layoutId === 'annualPremiums'
      && !(Number(item.annualPremiumYear) < eventDate.getFullYear())) return total;
    return total + Number(item.amount || 0);
  }, 0));
}

function reconstructCorrectAnnualEarnings_(startDate, endDate, eventDate) {
  const spreadsheet = getTargetSpreadsheet_();
  let total = 0;
  const relevantLayouts = SETTINGS.SHEET_LAYOUTS.filter(
    (layout) => layout.correctAmountColumn && layout.id !== 'vacation'
  );

  relevantLayouts.forEach((layout) => {
    spreadsheet.getSheets()
      .filter((candidate) => {
        if (isGeneratedSheetName_(candidate.getName())
          || candidate.getName() === 'Анкета и требования'
          || candidate.getName() === 'Конструктор') return false;
        const resolved = resolveSheetLayout_(candidate);
        return resolved && resolved.id === layout.id;
      })
      .forEach((sheet) => {
        const table = findTable_(sheet);
        if (!Number.isInteger(table.columns.correctAmount)) return;
        const lastRow = sheet.getLastRow();
        if (lastRow <= table.headerRow) return;
        const rows = sheet.getRange(
          table.headerRow + 1, 1, lastRow - table.headerRow, sheet.getLastColumn()
        ).getValues();
        rows.forEach((row) => {
          const period = parseRowPeriod_(row, table.columns);
          if (!period) return;
          const periodDate = new Date(period.year, period.month - 1, 1);
          if (periodDate < startDate || periodDate >= endDate) return;
          if (layout.id === 'annualPremiums'
            && !isAnnualPremiumCompletedForVacation_(row, table, eventDate)) {
            return;
          }
          const amount = parseMoney_(row[table.columns.correctAmount]);
          if (amount !== null) total += amount;
        });
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
