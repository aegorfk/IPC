const CLAIM_INTAKE_SETTINGS = {
  SHEET_NAME: 'Анкета и требования',
  NORMAL_SHEET_NAMES: ['Конструктор', 'Анкета и требования'],
  SECTOR_VALUES: [
    'Частная организация',
    'Бюджетный сектор / публичный должник',
    'Неизвестно',
  ],
  AVERAGE_SCENARIO_VALUES: ['Рассчитанный системой', 'Заданный вручную'],
  SELECTED_DOC_ACTION_LABEL: 'Расписать выбранные требования',
  RECOVERY_ERROR_BACKGROUND: '#F4CCCC',
  RECOVERY_WARNING_BACKGROUND: '#FFF2CC',
};

const APPROVED_CLAIM_DOCUMENT_TEMPLATE_PROPERTY = 'APPROVED_CLAIM_DOCUMENT_TEMPLATE_ID_V1';
const DEFAULT_APPROVED_CLAIM_DOCUMENT_TEMPLATE_ID = '1qwMjRD99FNWnF2Wu8T7wbkSuvDOiH5tu82aSxovxArE';
const EMPLOYMENT_NORMATIVE_IMPORT_ENABLED_PROPERTY = 'EMPLOYMENT_NORMATIVE_IMPORT_ENABLED_V1';
const EMPLOYMENT_NORMATIVE_DOCUMENT_MIME_TYPE = 'application/vnd.google-apps.document';
const EMPLOYMENT_PREMIUM_DELAY_DETAILS_ENABLED_PROPERTY = 'EMPLOYMENT_PREMIUM_DELAY_DETAILS_ENABLED_V1';
const EMPLOYMENT_PREMIUM_DELAY_DETAILS_SHEET_NAME = 'Детализация просрочки премий';
const PAYROLL_AUDIT_RULE_CATALOG_V1 = {
  employment_start_boundary: { version: '1.0', minimumSources: ['questionnaire'], claimFamily: null },
  premium_payment_delay: { version: '1.0', minimumSources: ['payroll_slip', 'due_rule'], claimFamily: 'premium_payment_delay' },
  overtime_hours: { version: '1.0', minimumSources: ['work_schedule', 'timesheet'], claimFamily: null },
  vacation_payment_timing: { version: '1.0', minimumSources: ['vacation_interval', 'payment_date'], claimFamily: 'vacation_payment_delay' },
  payroll_source_integrity: { version: '1.1', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_arithmetic: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_date_quality: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_payment_matching: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_identity: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_work_time: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_regular_accrual: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  payroll_preliminary_category: { version: '1.0', minimumSources: ['payroll_slip'], claimFamily: null },
  questionnaire_payment_facts: { version: '1.0', minimumSources: ['questionnaire'], claimFamily: null },
  questionnaire_partial_recoveries: { version: '1.0', minimumSources: ['questionnaire'], claimFamily: null },
  questionnaire_termination: { version: '1.0', minimumSources: ['questionnaire'], claimFamily: null },
  questionnaire_work_time: { version: '1.0', minimumSources: ['questionnaire'], claimFamily: null },
  normative_remuneration: { version: '1.0', minimumSources: ['employment_contract', 'local_normative_act'], claimFamily: null },
  normative_derivative_payments: { version: '1.0', minimumSources: ['local_normative_act', 'payroll_slip'], claimFamily: null },
  normative_premium: { version: '1.0', minimumSources: ['local_normative_act', 'payroll_slip'], claimFamily: 'premium_payment_delay' },
  normative_enhanced_work: { version: '1.0', minimumSources: ['employment_contract', 'local_normative_act', 'payroll_slip'], claimFamily: null },
  normative_regional_coefficient: { version: '1.0', minimumSources: ['employment_contract', 'local_normative_act'], claimFamily: null },
  normative_wage_indexation: { version: '1.0', minimumSources: ['local_normative_act'], claimFamily: 'salary_indexation' },
  normative_vacation_entitlement: { version: '1.0', minimumSources: ['employment_contract', 'local_normative_act'], claimFamily: null },
  normative_enhanced_guarantees: { version: '1.0', minimumSources: ['employment_contract', 'local_normative_act'], claimFamily: null },
};

const EMPLOYMENT_AUDIT_FACT_SOURCE_PRIORITY = {
  user_confirmed: 400,
  document_confirmed: 300,
  payroll_slip: 200,
  calculated_assumption: 100,
};

const EMPLOYMENT_AUDIT_VERIFICATION_STATUSES = [
  'confirmed', 'probable_or_disputed', 'cannot_verify', 'informational',
];

/**
 * A legal/payroll fact never loses where it came from.  The effective value is
 * chosen for the calculation, but conflicting source values remain available
 * for audit and later review.
 */
function createEmploymentAuditFact_(value, options) {
  const settings = options || {};
  const sourceType = String(settings.sourceType || 'calculated_assumption');
  const verificationStatus = String(settings.verificationStatus || 'probable_or_disputed');
  if (!Object.prototype.hasOwnProperty.call(EMPLOYMENT_AUDIT_FACT_SOURCE_PRIORITY, sourceType)) {
    throw new Error(`Неизвестный источник факта: ${sourceType}`);
  }
  if (EMPLOYMENT_AUDIT_VERIFICATION_STATUSES.indexOf(verificationStatus) < 0) {
    throw new Error(`Неизвестный статус проверки факта: ${verificationStatus}`);
  }
  return {
    value: value === undefined ? null : value,
    sourceType,
    sourceRef: String(settings.sourceRef || ''),
    confidence: normalizeEmploymentAuditConfidence_(settings.confidence),
    verificationStatus,
    notes: String(settings.notes || ''),
  };
}

function getPayrollAuditRuleCatalog_() {
  return JSON.parse(JSON.stringify(PAYROLL_AUDIT_RULE_CATALOG_V1));
}

/**
 * Read-only diagnostics for the approved court-calculation template.  It is
 * intentionally kept in the project so a future template revision can be
 * mapped from observable headings/tables rather than by clearing the body.
 */
function inspectApprovedClaimTemplateStructure() {
  const id = PropertiesService.getScriptProperties()
    .getProperty(APPROVED_CLAIM_DOCUMENT_TEMPLATE_PROPERTY)
    || DEFAULT_APPROVED_CLAIM_DOCUMENT_TEMPLATE_ID;
  const document = DocumentApp.openById(id);
  const body = document.getBody();
  const children = [];
  for (let index = 0; index < body.getNumChildren(); index++) {
    const child = body.getChild(index);
    const type = child.getType();
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      children.push({ index, type: 'paragraph', text: child.getText(), heading: String(child.getHeading()) });
    } else if (type === DocumentApp.ElementType.TABLE) {
      const table = child.asTable();
      const rows = [];
      for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
        const row = table.getRow(rowIndex);
        const cells = [];
        for (let cellIndex = 0; cellIndex < row.getNumCells(); cellIndex++) {
          cells.push(String(row.getCell(cellIndex).getText() || '').slice(0, 300));
        }
        rows.push(cells);
      }
      children.push({ index, type: 'table', rows, numRows: table.getNumRows() });
    } else {
      children.push({ index, type: String(type) });
    }
  }
  return { documentId: id, title: document.getName(), children };
}

function createPayrollAuditCatalogResult_(ruleId, input) {
  const rule = PAYROLL_AUDIT_RULE_CATALOG_V1[ruleId];
  if (!rule) throw new Error(`Неизвестное правило аудита: ${ruleId}`);
  const value = input || {};
  const status = EMPLOYMENT_AUDIT_VERIFICATION_STATUSES.indexOf(value.status) >= 0
    ? value.status : 'cannot_verify';
  const result = {
    id: buildEmploymentAuditPositionId_({ ruleId, layoutId: value.layoutId, baseKind: value.baseKind,
      periodKey: value.periodKey, calculationItem: value.calculationItem }),
    ruleId, ruleVersion: rule.version, minimumSources: rule.minimumSources.slice(), status,
    layoutId: value.layoutId || '', baseKind: value.baseKind || '', periodKey: value.periodKey || '',
    calculationItem: value.calculationItem || '',
    evidence: (value.evidence || []).slice(), moneyImpact: value.moneyImpact === undefined ? null : value.moneyImpact,
    claimFamily: value.claimFamily === undefined ? rule.claimFamily : value.claimFamily,
    question: String(value.question || ''), requestedDocument: String(value.requestedDocument || ''),
    reason: String(value.reason || ''), disputed: status === 'probable_or_disputed' || status === 'cannot_verify',
  };
  if (status === 'cannot_verify' && !result.question && !result.requestedDocument) {
    result.question = 'Уточните недостающий факт для проверки.';
  }
  return result;
}

function buildPayrollSlipAutomaticAuditCatalog_(rows, quality) {
  const items = [];
  const sourceRows = rows || [];
  const details = quality || {};
  (details.missingMonths || []).forEach((periodLabel, index) => items.push(
    createPayrollAuditCatalogResult_('payroll_source_integrity', {
      layoutId: 'raw_payroll', baseKind: 'period_completeness', periodKey: periodLabel,
      calculationItem: `missing_period_${index + 1}`, status: 'probable_or_disputed',
      evidence: [{ periodLabel }], reason: `Между расчетными листками пропущен период ${periodLabel}.`,
      question: 'Есть ли расчетный листок за этот период?', requestedDocument: 'Расчетный листок за пропущенный период.',
    })
  ));
  const seen = new Map();
  sourceRows.forEach((row, index) => {
    if (!row || !row.file || !row.sourceRow) return;
    const key = [row.file, row.section, row.sourceRow, row.accrued, row.paid, row.withheld].join('|');
    if (seen.has(key)) {
      items.push(createPayrollAuditCatalogResult_('payroll_source_integrity', {
        layoutId: 'raw_payroll', baseKind: 'source_row', periodKey: row.period && `${row.period.year}-${pad2_(row.period.month)}`,
        calculationItem: `possible_duplicate_${index + 1}`, status: 'probable_or_disputed',
        evidence: [{ source: row.file, sourceRow: row.sourceRow }, { source: sourceRows[seen.get(key)].file }],
        reason: 'Найдены две одинаковые исходные позиции; они сохранены отдельно до проверки технического дубля.',
        question: 'Это один и тот же расчетный листок/строка или самостоятельные позиции?',
      }));
    } else seen.set(key, index);
  });
  (details.companyMismatchPeriods || []).forEach((periodLabel, index) => items.push(
    createPayrollAuditCatalogResult_('payroll_identity', {
      layoutId: 'raw_payroll', baseKind: 'employer_identity', periodKey: periodLabel,
      calculationItem: `employer_mismatch_${index + 1}`, status: 'probable_or_disputed',
      evidence: collectPayrollAuditEvidenceForPeriod_(sourceRows, periodLabel),
      reason: 'Работодатель отличается от основной организации в наборе листков; расчет продолжается по принятому допущению.',
      question: 'Подтвердите, относится ли этот период к тому же работодателю.',
    })
  ));
  (details.employeeMismatchPeriods || []).forEach((periodLabel, index) => items.push(
    createPayrollAuditCatalogResult_('payroll_identity', {
      layoutId: 'raw_payroll', baseKind: 'employee_identity', periodKey: periodLabel,
      calculationItem: `employee_mismatch_${index + 1}`, status: 'probable_or_disputed',
      evidence: collectPayrollAuditEvidenceForPeriod_(sourceRows, periodLabel),
      reason: 'ФИО отличается от основного работника в наборе расчетных листков.',
      question: 'Подтвердите, что расчетный листок относится к этому же работнику.',
    })
  ));
  Array.prototype.push.apply(items, buildPayrollSourceCompletenessAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollFileDuplicateAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollArithmeticAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollDateAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollPaymentMatchingAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollWorkTimeAnomalyAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollRegularAccrualAudit_(sourceRows));
  Array.prototype.push.apply(items, buildPayrollPreliminaryCategoryAudit_(sourceRows));
  return items;
}

function buildPayrollAuditSourceEvidence_(row, index) {
  const value = row || {};
  return {
    source: String(value.file || ''),
    sourceSheet: String(value.sheet || ''),
    sourceRow: String(value.sourceRow || ''),
    sourceOrdinal: value.sourceOrdinal === undefined ? index + 1 : value.sourceOrdinal,
    period: value.period ? buildPayrollAuditPeriodKey_(value.period) : '',
  };
}

function buildPayrollAuditPeriodKey_(period) {
  return period && Number(period.year) && Number(period.month)
    ? `${Number(period.year)}-${pad2_(Number(period.month))}` : '';
}

function collectPayrollAuditEvidenceForPeriod_(rows, periodLabel) {
  const parsed = parseMonthYear_(periodLabel);
  const key = parsed ? buildPayrollAuditPeriodKey_(parsed) : String(periodLabel || '');
  return (rows || []).map((row, index) => ({ row, index }))
    .filter((entry) => buildPayrollAuditPeriodKey_(entry.row && entry.row.period) === key)
    .map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index));
}

function buildPayrollSourceCompletenessAudit_(rows) {
  const items = [];
  (rows || []).forEach((row, index) => {
    if (!row) return;
    const periodKey = buildPayrollAuditPeriodKey_(row.period) || 'unknown';
    const evidence = [buildPayrollAuditSourceEvidence_(row, index)];
    if (!String(row.section || '').trim() || !String(row.sourceRow || '').trim()) {
      items.push(createPayrollAuditCatalogResult_('payroll_source_integrity', {
        layoutId: 'raw_payroll', baseKind: 'source_completeness', periodKey,
        calculationItem: `incomplete_source_${index + 1}`, status: 'cannot_verify', evidence,
        reason: 'У распознанной позиции отсутствует раздел или исходное название строки.',
        question: 'Что указано в этой строке исходного расчетного листка?',
        requestedDocument: 'Исходный расчетный листок в читаемом качестве.',
      }));
    }
    ['accrued', 'paid', 'withheld'].forEach((field) => {
      const amount = row[field];
      if (amount !== null && amount !== undefined && amount !== ''
        && (!Number.isFinite(Number(amount)) || Number(amount) < 0)) {
        items.push(createPayrollAuditCatalogResult_('payroll_source_integrity', {
          layoutId: 'raw_payroll', baseKind: field, periodKey,
          calculationItem: `invalid_amount_${field}_${index + 1}`,
          status: 'probable_or_disputed', evidence, moneyImpact: null,
          reason: `В исходной позиции распознана невозможная сумма в поле «${field}».`,
          question: 'Подтвердите сумму по изображению расчетного листка.',
        }));
      }
    });
  });
  return items;
}

function payrollAuditRowFingerprint_(row, includeFile) {
  const value = row || {};
  return [
    includeFile ? value.file : '', value.sheet, value.company, value.employee,
    buildPayrollAuditPeriodKey_(value.period), value.section, value.category, value.kind,
    value.accrued, value.paid, value.withheld, value.sourceRow,
    value.paymentDate && formatDate_(value.paymentDate),
    value.statementDate && formatDate_(value.statementDate), value.accrualInterval,
  ].map((part) => normalizeText_(part)).join('|');
}

function buildPayrollFileDuplicateAudit_(rows) {
  const byFile = new Map();
  (rows || []).forEach((row, index) => {
    const file = String(row && row.file || '').trim();
    if (!file) return;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push({ row, index });
  });
  const fingerprints = new Map();
  const items = [];
  byFile.forEach((entries, file) => {
    const fingerprint = entries.map((entry) => payrollAuditRowFingerprint_(entry.row, false))
      .sort().join('\n');
    if (!fingerprint) return;
    if (fingerprints.has(fingerprint)) {
      const first = fingerprints.get(fingerprint);
      items.push(createPayrollAuditCatalogResult_('payroll_source_integrity', {
        layoutId: 'raw_payroll', baseKind: 'duplicate_file',
        periodKey: buildPayrollAuditPeriodKey_(entries[0].row.period) || 'unknown',
        calculationItem: `duplicate_file_${items.length + 1}`, status: 'probable_or_disputed',
        evidence: first.entries.concat(entries).map((entry) =>
          buildPayrollAuditSourceEvidence_(entry.row, entry.index)),
        reason: `Файлы «${first.file}» и «${file}» содержат одинаковый набор распознанных событий. Оба набора сохранены до подтверждения версии.`,
        question: 'Это две версии одного расчетного листка или самостоятельные документы?',
      }));
    } else fingerprints.set(fingerprint, { file, entries });
  });
  return items;
}

function payrollAuditSectionKind_(row) {
  const text = normalizeText_(`${row && row.section || ''} ${row && row.kind || ''} ${row && row.sourceRow || ''}`);
  if (/удерж/.test(text)) return 'withheld';
  if (/выплач|к выплате|межрасчет|межрасчёт/.test(text)) return 'paid';
  if (/начисл/.test(text)) return 'accrued';
  return '';
}

function buildPayrollArithmeticAudit_(rows) {
  const groups = new Map();
  (rows || []).forEach((row, index) => {
    const key = `${String(row && row.file || '')}|${buildPayrollAuditPeriodKey_(row && row.period)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ row, index });
  });
  const items = [];
  groups.forEach((entries, key) => {
    const totals = {};
    const sums = { accrued: 0, paid: 0, withheld: 0 };
    entries.forEach((entry) => {
      const row = entry.row || {};
      const text = normalizeText_(`${row.kind || ''} ${row.sourceRow || ''}`);
      const section = payrollAuditSectionKind_(row);
      const amount = Number(row[section]);
      if (!section || !Number.isFinite(amount)) return;
      if (/итого|всего/.test(text)) totals[section] = amount;
      else sums[section] += amount;
    });
    Object.keys(totals).forEach((section) => {
      if (Math.abs(totals[section] - sums[section]) <= 0.01) return;
      const first = entries[0] || {};
      items.push(createPayrollAuditCatalogResult_('payroll_arithmetic', {
        layoutId: 'raw_payroll', baseKind: section,
        periodKey: buildPayrollAuditPeriodKey_(first.row && first.row.period) || 'unknown',
        calculationItem: `section_total_${section}_${items.length + 1}`,
        status: 'probable_or_disputed',
        evidence: entries.map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index)),
        reason: `Итог раздела (${totals[section]}) не равен сумме его отдельных строк (${roundClaimAuditMoney_(sums[section])}).`,
        question: 'Проверьте пропущенные строки и итог раздела в исходном листке.',
      }));
    });
    const balanceRow = entries.map((entry) => entry.row || {}).find((row) =>
      Number.isFinite(Number(row.openingBalance)) && Number.isFinite(Number(row.closingBalance)));
    if (balanceRow) {
      const expectedClosing = Number(balanceRow.openingBalance) + sums.accrued - sums.withheld - sums.paid;
      if (Math.abs(expectedClosing - Number(balanceRow.closingBalance)) > 0.01) {
        items.push(createPayrollAuditCatalogResult_('payroll_arithmetic', {
          layoutId: 'raw_payroll', baseKind: 'balance', periodKey: buildPayrollAuditPeriodKey_(balanceRow.period) || key,
          calculationItem: `balance_${items.length + 1}`, status: 'probable_or_disputed',
          evidence: entries.map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index)),
          reason: `Исходящий остаток не сходится с начислениями, удержаниями и выплатами; расчетное значение ${roundClaimAuditMoney_(expectedClosing)}.`,
          question: 'Уточните входящий и исходящий остаток расчетного листка.',
        }));
      }
    }
  });
  return items;
}

function buildPayrollDateAudit_(rows, options) {
  const now = parseDateValue_(options && options.now) || new Date();
  const items = [];
  const missingByPeriod = new Map();
  (rows || []).forEach((row, index) => {
    if (!row) return;
    const periodKey = buildPayrollAuditPeriodKey_(row.period) || 'unknown';
    const evidence = [buildPayrollAuditSourceEvidence_(row, index)];
    ['accrualDate', 'paymentDate', 'statementDate'].forEach((field) => {
      const raw = row[field];
      if (!raw) return;
      const date = parseDateValue_(raw);
      if (!date || Number.isNaN(Number(date)) || date > now) {
        items.push(createPayrollAuditCatalogResult_('payroll_date_quality', {
          layoutId: 'raw_payroll', baseKind: field, periodKey,
          calculationItem: `invalid_date_${field}_${index + 1}`, status: 'probable_or_disputed', evidence,
          reason: !date || Number.isNaN(Number(date)) ? 'Распознана невозможная дата.' : 'Распознана дата в будущем.',
          question: 'Подтвердите дату по исходному расчетному листку.',
        }));
      }
      if (date && row.period) {
        const monthDistance = Math.abs((date.getFullYear() - Number(row.period.year)) * 12
          + date.getMonth() + 1 - Number(row.period.month));
        if (monthDistance > 18) {
          items.push(createPayrollAuditCatalogResult_('payroll_date_quality', {
            layoutId: 'raw_payroll', baseKind: field, periodKey,
            calculationItem: `remote_date_${field}_${index + 1}`, status: 'probable_or_disputed', evidence,
            reason: 'Дата отстоит от периода расчетного листка более чем на 18 месяцев.',
            question: 'Подтвердите период, к которому относится дата.',
          }));
        }
      }
    });
    if (payrollAuditSectionKind_(row) === 'paid' && !row.paymentDate && !row.statementDate) {
      if (!missingByPeriod.has(periodKey)) missingByPeriod.set(periodKey, []);
      missingByPeriod.get(periodKey).push({ row, index });
    }
  });
  missingByPeriod.forEach((entries, periodKey) => items.push(
    createPayrollAuditCatalogResult_('payroll_date_quality', {
      layoutId: 'raw_payroll', baseKind: 'actual_payment_date', periodKey,
      calculationItem: 'missing_actual_payment_date', status: 'cannot_verify',
      evidence: entries.map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index)),
      reason: 'Для одной или нескольких выплат нет фактической даты, необходимой для расчета по ст. 236 ТК РФ.',
      question: 'В какие даты фактически поступили эти выплаты?',
      requestedDocument: 'Банковская выписка или платежный реестр с датами поступлений.',
    })
  ));
  return items;
}

function normalizePayrollAuditMatchKey_(row) {
  const text = normalizeText_(`${row && row.category || ''} ${row && row.kind || ''}`)
    .replace(/за первую половину месяца|зарплата за месяц|межрасчет|межрасчёт/g, '')
    .replace(/[^а-яa-z0-9]+/g, ' ').trim();
  return text || normalizeText_(row && row.category);
}

function buildPayrollPaymentMatchingAudit_(rows) {
  const accrualKeys = new Set();
  const payments = new Map();
  (rows || []).forEach((row, index) => {
    const periodKey = buildPayrollAuditPeriodKey_(row && row.period) || 'unknown';
    const matchKey = normalizePayrollAuditMatchKey_(row);
    if (payrollAuditSectionKind_(row) === 'accrued' && matchKey) accrualKeys.add(`${periodKey}|${matchKey}`);
    if (payrollAuditSectionKind_(row) !== 'paid') return;
    const key = `${periodKey}|${matchKey || 'unknown'}`;
    if (!payments.has(key)) payments.set(key, []);
    payments.get(key).push({ row, index });
  });
  const items = [];
  payments.forEach((entries, key) => {
    const parts = key.split('|');
    const periodKey = parts.shift();
    const matchKey = parts.join('|');
    const dates = new Set(entries.map((entry) => {
      const date = entry.row.statementDate || entry.row.paymentDate;
      return date ? formatDate_(date) : '';
    }).filter(Boolean));
    if (dates.size > 1) {
      items.push(createPayrollAuditCatalogResult_('payroll_payment_matching', {
        layoutId: 'raw_payroll', baseKind: 'multiple_payment_events', periodKey,
        calculationItem: `multiple_${items.length + 1}`, status: 'informational',
        evidence: entries.map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index)),
        reason: `В периоде сохранено несколько самостоятельных выплат одного вида с датами: ${Array.from(dates).sort().join(', ')}. Они не объединены.`,
      }));
    }
    if (matchKey !== 'unknown' && !accrualKeys.has(`${periodKey}|${matchKey}`)) {
      items.push(createPayrollAuditCatalogResult_('payroll_payment_matching', {
        layoutId: 'raw_payroll', baseKind: 'unmatched_payment', periodKey,
        calculationItem: `unmatched_${items.length + 1}`, status: 'probable_or_disputed',
        evidence: entries.map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index)),
        reason: 'Выплата не сопоставилась с начислением того же вида в нормализованных строках периода.',
        question: 'К какому начислению относится эта выплата?',
      }));
    }
  });
  return items;
}

function buildPayrollWorkTimeAnomalyAudit_(rows) {
  const items = [];
  (rows || []).forEach((row, index) => {
    const periodKey = buildPayrollAuditPeriodKey_(row && row.period) || 'unknown';
    [['workDays', row && row.workDays], ['paidDays', row && row.paidDays],
      ['workHours', row && (row.workHours === undefined ? row.actualHours : row.workHours)]].forEach(([field, raw]) => {
      if (raw === null || raw === undefined || raw === '') return;
      const value = Number(raw);
      const limit = field === 'workHours' ? 372 : 31;
      if (Number.isFinite(value) && value >= 0 && value <= limit) return;
      items.push(createPayrollAuditCatalogResult_('payroll_work_time', {
        layoutId: 'raw_payroll', baseKind: field, periodKey,
        calculationItem: `impossible_${field}_${index + 1}`, status: 'probable_or_disputed',
        evidence: [buildPayrollAuditSourceEvidence_(row, index)],
        reason: `Распознано невозможное значение рабочего времени: ${raw}.`,
        question: 'Проверьте дни/часы по расчетному листку и табелю.',
        requestedDocument: 'Табель учета рабочего времени.',
      }));
    });
  });
  return items;
}

function isPayrollRegularAccrual_(row) {
  const text = normalizeText_(`${row && row.category || ''} ${row && row.kind || ''}`);
  return payrollAuditSectionKind_(row) === 'accrued'
    && /оклад|тариф|ежемесячн.*прем|постоянн.*надбав|доплата до оклада/.test(text)
    && Number.isFinite(Number(row.accrued));
}

function buildPayrollRegularAccrualAudit_(rows) {
  const series = new Map();
  (rows || []).forEach((row, index) => {
    if (!isPayrollRegularAccrual_(row)) return;
    const kind = normalizePayrollAuditMatchKey_(row);
    const periodKey = buildPayrollAuditPeriodKey_(row.period);
    const key = `${normalizeText_(row.employee)}|${kind}`;
    if (!series.has(key)) series.set(key, new Map());
    const periods = series.get(key);
    if (!periods.has(periodKey)) periods.set(periodKey, { amount: 0, evidence: [] });
    periods.get(periodKey).amount += Number(row.accrued) || 0;
    periods.get(periodKey).evidence.push(buildPayrollAuditSourceEvidence_(row, index));
  });
  const items = [];
  series.forEach((periods, seriesKey) => {
    const ordered = Array.from(periods.entries()).sort((left, right) => left[0].localeCompare(right[0]));
    for (let index = 1; index < ordered.length; index++) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      if (previous[1].amount <= 0 || current[1].amount <= 0) continue;
      const ratio = current[1].amount / previous[1].amount;
      if (ratio >= 0.5 && ratio <= 1.5) continue;
      items.push(createPayrollAuditCatalogResult_('payroll_regular_accrual', {
        layoutId: 'raw_payroll', baseKind: 'regular_accrual', periodKey: current[0],
        calculationItem: `abrupt_change_${items.length + 1}`, status: 'probable_or_disputed',
        evidence: previous[1].evidence.concat(current[1].evidence),
        reason: `Регулярное начисление резко изменилось с ${roundClaimAuditMoney_(previous[1].amount)} до ${roundClaimAuditMoney_(current[1].amount)}.`,
        question: 'Чем объясняется изменение регулярного начисления (неполный месяц, отпуск, изменение оклада или ошибка)?',
      }));
    }
  });
  return items;
}

function buildPayrollPreliminaryCategoryAudit_(rows) {
  const items = [];
  const seen = new Set();
  (rows || []).forEach((row, index) => {
    if (!row || payrollAuditSectionKind_(row) !== 'accrued') return;
    const kind = String(row.kind || row.sourceRow || '').trim();
    const category = String(row.category || '').trim();
    if (!kind || (category && category !== 'Прочее')) return;
    const key = `${normalizeText_(kind)}|${buildPayrollAuditPeriodKey_(row.period)}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(createPayrollAuditCatalogResult_('payroll_preliminary_category', {
      layoutId: 'raw_payroll', baseKind: 'preliminary_category',
      periodKey: buildPayrollAuditPeriodKey_(row.period) || 'unknown',
      calculationItem: `category_${index + 1}`, status: 'cannot_verify',
      evidence: [buildPayrollAuditSourceEvidence_(row, index)],
      reason: `Для начисления «${kind}» не определена предварительная расчетная категория.`,
      question: 'Это основная, компенсационная, стимулирующая выплата или разовое поощрение?',
      requestedDocument: 'Трудовой договор или ЛНА, устанавливающий выплату.',
    }));
  });
  return items;
}

function normalizeEmploymentAuditConfidence_(value) {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
    throw new Error('Уверенность факта должна быть числом от 0 до 1');
  }
  return numeric;
}

function resolveEmploymentAuditFacts_(facts) {
  const candidates = (facts || [])
    .filter(Boolean)
    .map((fact) => createEmploymentAuditFact_(fact.value, fact));
  if (!candidates.length) {
    return { effective: null, candidates: [], conflict: false };
  }
  const comparable = (value) => value instanceof Date
    ? `date:${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
    : `${typeof value}:${String(value).trim()}`;
  const distinctValues = Array.from(new Set(candidates.map((fact) => comparable(fact.value))));
  const statusWeight = { confirmed: 4, probable_or_disputed: 3, informational: 2, cannot_verify: 1 };
  const ordered = candidates.slice().sort((left, right) =>
    (EMPLOYMENT_AUDIT_FACT_SOURCE_PRIORITY[right.sourceType]
      - EMPLOYMENT_AUDIT_FACT_SOURCE_PRIORITY[left.sourceType])
    || (statusWeight[right.verificationStatus] - statusWeight[left.verificationStatus])
    || ((right.confidence === null ? -1 : right.confidence)
      - (left.confidence === null ? -1 : left.confidence))
    || left.sourceRef.localeCompare(right.sourceRef)
  );
  return {
    effective: ordered[0],
    candidates: ordered,
    conflict: distinctValues.length > 1,
  };
}

/**
 * Normalizes legacy payment metadata without treating a payroll-slip month as
 * either the statutory due date or a factual payment date.  All three time
 * axes stay independent for Article 236 and premium-delay audit.
 */
function normalizeEmploymentPaymentTimeline_(value) {
  const source = value || {};
  const period = source.accrualPeriod || source.period || source.payrollSlipPeriod || null;
  const due = source.dueDateFact || (source.legalDueDate
    ? createEmploymentAuditFact_(source.legalDueDate, {
      sourceType: source.legalDueDateSourceType || 'document_confirmed',
      sourceRef: source.legalDueDateSource || '',
      confidence: source.legalDueDateConfidence,
      verificationStatus: source.legalDueDateVerificationStatus || 'confirmed',
    }) : null);
  const actual = source.actualPaymentDateFact || (source.actualPaymentDate
    ? createEmploymentAuditFact_(source.actualPaymentDate, {
      sourceType: source.actualPaymentDateSourceType || 'payroll_slip',
      sourceRef: source.actualPaymentDateSource || '',
      confidence: source.actualPaymentDateConfidence,
      verificationStatus: source.actualPaymentDateVerificationStatus || 'probable_or_disputed',
    }) : null);
  return {
    accrualPeriod: period || null,
    dueDateFact: due || null,
    actualPaymentDateFact: actual || null,
  };
}

/**
 * Determines the lower boundary of claim audit from the questionnaire without
 * inventing a date from the first available payroll slip.  A confirmed user
 * correction remains authoritative even where document candidates disagree;
 * the disagreement is retained as a non-blocking review warning.
 */
function resolveEmploymentAuditScope_(questionnaireState) {
  const state = questionnaireState || {};
  const hasEmploymentStartAnswer = Object.prototype.hasOwnProperty.call(state, 'employmentStartDate')
    || Object.prototype.hasOwnProperty.call(state, 'employmentStartFact')
    || Object.prototype.hasOwnProperty.call(state, 'employmentStartFacts');
  const suppliedFacts = Array.isArray(state.employmentStartFacts)
    ? state.employmentStartFacts
    : (state.employmentStartFact ? [state.employmentStartFact] : []);
  if (!suppliedFacts.length && state.employmentStartDate) {
    suppliedFacts.push(createEmploymentAuditFact_(state.employmentStartDate, {
      sourceType: 'user_confirmed',
      sourceRef: 'Анкета и требования!B4',
      confidence: 1,
      verificationStatus: 'confirmed',
    }));
  }
  const resolution = resolveEmploymentAuditFacts_(suppliedFacts);
  const fact = resolution.effective;
  const startDate = fact && parseDateValue_(fact.value);
  const source = fact && fact.sourceRef ? fact.sourceRef : 'Анкета и требования!B4';
  const warnings = [];
  if (!startDate) {
    // Older programmatic callers did not yet provide the questionnaire field.
    // They retain the previous neutral behavior; the real questionnaire always
    // supplies an explicit null when the user leaves the answer blank.
    if (!hasEmploymentStartAnswer) {
      return { active: false, startDate: null, fact: null, resolution, warnings };
    }
    warnings.push({
      code: 'employment_start_date_missing',
      disputed: true,
      source,
      reason: 'Не задана дата начала трудовых отношений: нижняя граница аудита не проверена; расчет продолжается за весь доступный период.',
    });
    return { active: false, startDate: null, fact: null, resolution, warnings };
  }
  if (fact.verificationStatus !== 'confirmed') {
    warnings.push({
      code: 'employment_start_date_unconfirmed',
      disputed: true,
      source,
      reason: 'Дата начала трудовых отношений не подтверждена: нижняя граница аудита не ограничена до подтверждения пользователем.',
    });
    return { active: false, startDate, fact, resolution, warnings };
  }
  if (resolution.conflict) {
    warnings.push({
      code: 'employment_start_date_conflict',
      disputed: true,
      source,
      reason: 'Дата начала трудовых отношений расходится между источниками: для аудита использована подтвержденная пользователем дата.',
    });
  }
  return { active: true, startDate, fact, resolution, warnings };
}

/**
 * Claim facts are monthly at this stage.  The month in which employment
 * starts is deliberately preserved: a monthly row can contain work after the
 * start date, while a month ending before it cannot form a claim.
 */
function filterClaimFactsByEmploymentAuditScope_(claimFacts, scope) {
  const source = claimFacts || [];
  if (!scope || !scope.active || !(scope.startDate instanceof Date)) {
    return { included: source.slice(), excluded: [] };
  }
  const firstEmploymentMonth = new Date(
    scope.startDate.getFullYear(), scope.startDate.getMonth(), 1
  );
  const included = [];
  const excluded = [];
  source.forEach((fact) => {
    const match = String(fact && fact.periodKey || '').match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (!match) {
      included.push(fact);
      return;
    }
    const periodMonth = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    if (periodMonth < firstEmploymentMonth) excluded.push(fact);
    else included.push(fact);
  });
  return { included, excluded };
}

/**
 * A premium identity deliberately excludes employer and payroll-system labels.
 * The persisted source ordinal keeps visually identical source events apart
 * until a later calculation layer explicitly decides to aggregate them.
 */
function buildEmploymentPremiumAuditId_(premium) {
  const value = premium || {};
  const period = normalizeText_(value.premiumPeriod || value.accrualPeriod || value.periodKey)
    || 'unknown_period';
  const semantic = normalizeText_(value.paymentSemantic || value.baseKind || value.category)
    || 'unknown_premium';
  const ordinal = Number.isInteger(value.sourceOrdinal)
    ? String(value.sourceOrdinal)
    : (normalizeText_(value.calculationItem) || 'unknown_event');
  return [
    'premium_delay',
    normalizeClaimLayoutIdentity_(value.layoutId),
    semantic,
    period,
    `event_${ordinal}`,
  ].map((part) => encodeURIComponent(normalizeText_(part))).join('|');
}

function buildEmploymentAuditPositionId_(fact) {
  const value = fact || {};
  return [
    normalizeText_(value.ruleId) || 'unknown_rule',
    normalizeClaimLayoutIdentity_(value.layoutId),
    normalizeClaimBaseKindIdentity_(value.baseKind),
    normalizeText_(value.periodKey) || 'unknown_period',
    normalizeText_(value.calculationItem) || 'unknown_item',
  ].map((part) => encodeURIComponent(normalizeText_(part))).join('|');
}

function classifyEmploymentPremiumNature_(premium) {
  const value = premium || {};
  const evidence = value.evidence || [];
  const text = normalizeText_([
    value.label, value.kind, value.sourceText,
    ...evidence.map((item) => item && (item.text || item.value || item.notes)),
  ].filter(Boolean).join(' '));
  const systemEvidence = value.remunerationSystem === true
    || evidence.some((item) => item && item.remunerationSystem === true);
  const oneOffEvidence = value.article191Reward === true
    || /разов|ко дн(?:[её]м|ю) рождения|юбиле|выдающ|особ[ыи]е достижен|поощрен/i.test(text);
  if (systemEvidence) {
    return {
      kind: 'remuneration_system', verificationStatus: 'confirmed', disputed: false,
      reason: 'Премия подтверждена как часть системы оплаты труда.', evidence,
    };
  }
  if (oneOffEvidence) {
    return {
      kind: 'article_191_reward',
      verificationStatus: evidence.length ? 'confirmed' : 'probable_or_disputed',
      disputed: !evidence.length,
      reason: 'Выявлены признаки разового поощрения по ст. 191 ТК РФ; требуется сверка с ПВТР или приказом.',
      evidence,
    };
  }
  return {
    kind: 'disputed', verificationStatus: 'probable_or_disputed', disputed: true,
    reason: 'Недостаточно сведений, чтобы отнести премию к системе оплаты труда или разовому поощрению.',
    evidence,
  };
}

/**
 * Resolves a premium due date only from a declared rule. Payroll-slip period
 * is allowed as a rule parameter, never as a substitute for the due date.
 */
function resolveEmploymentPremiumDueDate_(premium, dueRule) {
  const premiumValue = premium || {};
  const rule = dueRule || premiumValue.dueRule;
  if (!rule || !rule.type) {
    return {
      dueDateFact: null,
      status: 'cannot_verify',
      reason: 'Не установлен самостоятельный срок выплаты премии: требуется правило из договора, ЛНА или подтвержденное уточнение пользователя.',
      rule: null,
    };
  }
  let date = null;
  const parameters = Object.assign({}, rule.parameters || {});
  if (rule.type === 'fixed_date') {
    date = parseDateValue_(parameters.date || rule.date);
  } else if (rule.type === 'quarter_end_day') {
    const match = String(premiumValue.premiumPeriod || premiumValue.accrualPeriod || '')
      .match(/^(\d{4})-Q([1-4])$/i);
    const day = Number(parameters.day);
    if (match && Number.isInteger(day) && day >= 1 && day <= 31) {
      const year = Number(match[1]);
      const finalMonth = Number(match[2]) * 3;
      const candidate = new Date(year, finalMonth - 1, day);
      if (candidate.getMonth() === finalMonth - 1) date = candidate;
    }
  } else if (rule.type === 'period_end_offset') {
    const end = resolveEmploymentPremiumPeriodEnd_(premiumValue.premiumPeriod || premiumValue.accrualPeriod);
    const days = Number(parameters.days);
    if (end && Number.isFinite(days)) date = new Date(
      end.getFullYear(), end.getMonth(), end.getDate() + Math.trunc(days)
    );
  } else if (rule.type === 'period_year_month_day') {
    const periodMatch = String(premiumValue.premiumPeriod || premiumValue.accrualPeriod || '')
      .match(/^(\d{4})(?:-(?:Q[1-4]|\d{2}))?$/i);
    const month = Number(parameters.month);
    const day = Number(parameters.day);
    if (periodMatch && Number.isInteger(month) && month >= 1 && month <= 12
      && Number.isInteger(day) && day >= 1 && day <= 31) {
      const candidate = new Date(Number(periodMatch[1]), month - 1, day);
      if (candidate.getMonth() === month - 1) date = candidate;
    }
  }
  if (!date) {
    return {
      dueDateFact: null,
      status: 'cannot_verify',
      reason: `Не удалось применить правило срока выплаты премии «${rule.type}».`,
      rule: { id: String(rule.id || rule.type), type: rule.type, parameters, sourceRef: rule.sourceRef || '' },
    };
  }
  const sourceType = rule.sourceType || (rule.assumed ? 'calculated_assumption' : 'document_confirmed');
  const verificationStatus = rule.assumed ? 'probable_or_disputed' : 'confirmed';
  return {
    dueDateFact: createEmploymentAuditFact_(date, {
      sourceType,
      sourceRef: rule.sourceRef || '',
      confidence: rule.confidence === undefined ? (rule.assumed ? 0.5 : 1) : rule.confidence,
      verificationStatus,
      notes: rule.notes || '',
    }),
    status: verificationStatus,
    reason: rule.assumed ? 'Срок рассчитан по явно отмеченному допущению.' : 'Срок рассчитан по подтвержденному правилу.',
    rule: { id: String(rule.id || rule.type), type: rule.type, parameters, sourceRef: rule.sourceRef || '' },
  };
}

function resolveEmploymentPremiumPeriodEnd_(value) {
  const quarter = String(value || '').match(/^(\d{4})-Q([1-4])$/i);
  if (quarter) return new Date(Number(quarter[1]), Number(quarter[2]) * 3, 0);
  const month = String(value || '').match(/^(\d{4})-(\d{2})$/);
  if (month) return new Date(Number(month[1]), Number(month[2]), 0);
  return null;
}

function buildEmploymentPremiumDelayAudit_(premium, dueRule) {
  const value = premium || {};
  const due = resolveEmploymentPremiumDueDate_(value, dueRule);
  const actual = value.actualPaymentDateFact || null;
  if (!due.dueDateFact || !actual || !parseDateValue_(actual.value)) {
    return Object.assign({}, due, {
      status: 'cannot_verify',
      delayDays: null,
      reason: !due.dueDateFact ? due.reason : 'Не подтверждена фактическая дата выплаты премии.',
    });
  }
  const dueDate = parseDateValue_(due.dueDateFact.value);
  const actualDate = parseDateValue_(actual.value);
  const delayDays = Math.max(0, Math.round((Number(actualDate) - Number(dueDate)) / 86400000));
  return Object.assign({}, due, {
    actualPaymentDateFact: actual,
    delayDays,
    status: delayDays > 0
      ? (due.status === 'confirmed' && actual.verificationStatus === 'confirmed'
        ? 'confirmed' : 'probable_or_disputed')
      : 'informational',
    delayed: delayDays > 0,
  });
}

/**
 * Converts a premium's independently established payment timeline into the
 * existing Article 236 rate engine. Each factual partial payment closes only
 * its paid share; an unpaid remainder runs to the selected calculation date.
 */
function calculateEmploymentPremiumArticle236_(premium, delayAudit, compensationRates, calculationEndDate) {
  const value = premium || {};
  const audit = delayAudit || {};
  const dueFact = audit.dueDateFact;
  const dueDate = dueFact && parseDateValue_(dueFact.value);
  const principal = parseMoney_(value.amount !== undefined ? value.amount : value.accrued);
  if (!dueDate || principal === null || principal <= 0) {
    return {
      amount: 0, outstanding: principal && principal > 0 ? principal : 0,
      intervals: [], status: 'cannot_verify',
      reason: !dueDate ? 'Не установлен срок выплаты премии.' : 'Не установлена сумма премии.',
    };
  }
  const rawPayments = Array.isArray(value.actualPayments)
    ? value.actualPayments
    : (value.actualPaymentDateFact ? [{ amount: principal, dateFact: value.actualPaymentDateFact }] : []);
  const payments = rawPayments.map((payment, index) => {
    const dateFact = payment && (payment.dateFact || payment.actualPaymentDateFact || payment);
    const date = dateFact && parseDateValue_(dateFact.value || dateFact.date || dateFact);
    const amount = parseMoney_(payment && payment.amount !== undefined ? payment.amount : principal);
    return { index, date, amount: amount === null ? 0 : Math.max(0, amount), dateFact };
  }).filter((payment) => payment.date && payment.amount > 0).sort((left, right) =>
    Number(left.date) - Number(right.date) || left.index - right.index
  );
  const intervals = [];
  let outstanding = roundClaimAuditMoney_(principal);
  let total = 0;
  payments.forEach((payment) => {
    if (outstanding <= 0) return;
    const paidShare = Math.min(outstanding, payment.amount);
    const calculation = calculateSalaryCompensation_(paidShare, dueDate, payment.date, compensationRates || []);
    intervals.push({
      kind: 'paid_share', base: paidShare, dueDate: new Date(dueDate), endDate: new Date(payment.date),
      actualPaymentDateFact: payment.dateFact || null, calculation,
    });
    total += calculation.amount;
    outstanding = roundClaimAuditMoney_(outstanding - paidShare);
  });
  const endDate = parseDateValue_(calculationEndDate);
  if (outstanding > 0 && endDate) {
    const calculation = calculateSalaryCompensation_(outstanding, dueDate, endDate, compensationRates || []);
    intervals.push({
      kind: 'outstanding', base: outstanding, dueDate: new Date(dueDate), endDate: new Date(endDate), calculation,
    });
    total += calculation.amount;
  }
  const hasAssumption = dueFact.verificationStatus !== 'confirmed'
    || payments.some((payment) => payment.dateFact
      && payment.dateFact.verificationStatus !== 'confirmed');
  return {
    amount: roundClaimAuditMoney_(total), outstanding, intervals,
    status: hasAssumption ? 'probable_or_disputed' : 'confirmed',
    disputed: hasAssumption,
    reason: hasAssumption ? 'Расчет использует явно отмеченное допущение о сроке или дате выплаты.' : '',
  };
}

/**
 * Adapts independently sourced premium-payment timelines to selectable claim
 * facts.  It does not infer either date from a payroll-slip month, and keeps
 * every source event separate by ordinal for user-level selection.
 */
function buildEmploymentPremiumDelayClaimFacts_(premiums, options) {
  const settings = options || {};
  const facts = [];
  const warnings = [];
  (premiums || []).forEach((input, index) => {
    const premium = Object.assign({}, input || {});
    const timeline = normalizeEmploymentPaymentTimeline_(premium);
    premium.actualPaymentDateFact = premium.actualPaymentDateFact || timeline.actualPaymentDateFact;
    const delay = buildEmploymentPremiumDelayAudit_(premium, premium.dueRule);
    const sourceRef = String(premium.sourceRef || premium.source || `premium_event_${index + 1}`);
    if (delay.status === 'cannot_verify') {
      warnings.push({
        code: 'premium_payment_delay_cannot_verify', disputed: true, source: sourceRef,
        reason: delay.reason,
      });
      return;
    }
    if (!delay.delayed) return;
    const compensation = calculateEmploymentPremiumArticle236_(
      premium, delay, settings.compensationRates || [], settings.calculationEndDate
    );
    if (!Number.isFinite(compensation.amount) || compensation.amount <= 0) {
      warnings.push({
        code: 'premium_payment_delay_amount_unavailable', disputed: true, source: sourceRef,
        reason: compensation.reason || 'Не удалось оценить материальную ответственность за просрочку премии.',
      });
      return;
    }
    const periodKey = String(premium.premiumPeriod || timeline.accrualPeriod || 'unknown_period');
    const sourceOrdinal = Number.isInteger(premium.sourceOrdinal) ? premium.sourceOrdinal : index + 1;
    const nature = classifyEmploymentPremiumNature_(premium);
    const disputed = delay.status !== 'confirmed' || compensation.disputed === true || nature.disputed === true;
    facts.push({
      family: 'premium_payment_delay',
      layoutId: premium.layoutId || 'premium',
      baseKind: premium.baseKind || 'premium_payment',
      baseLabel: premium.baseLabel || premium.label || 'Премия',
      periodKey,
      periodLabel: formatEmploymentPremiumPeriodLabel_(periodKey),
      calculationItem: `premium_event_${sourceOrdinal}`,
      premiumAuditId: buildEmploymentPremiumAuditId_(Object.assign({}, premium, { sourceOrdinal })),
      amount: roundClaimAuditMoney_(compensation.amount),
      disputed,
      sourceRef,
      dueDate: delay.dueDateFact && delay.dueDateFact.value || null,
      actualPaymentDate: delay.actualPaymentDateFact && delay.actualPaymentDateFact.value || null,
      delayDays: delay.delayDays,
      premiumAmount: parseMoney_(premium.amount !== undefined ? premium.amount : premium.accrued),
      premiumNature: nature.kind,
      dueRule: delay.rule,
      assumptions: [delay.reason, compensation.reason, nature.reason].filter(Boolean),
      verificationStatus: disputed ? 'probable_or_disputed' : 'confirmed',
      auditDetails: {
        kind: 'premium_payment_delay',
        premiumLabel: premium.label || premium.baseLabel || 'Премия',
        premiumPeriod: periodKey,
        premiumAmount: parseMoney_(premium.amount !== undefined ? premium.amount : premium.accrued),
        dueDate: delay.dueDateFact && delay.dueDateFact.value || null,
        actualPaymentDate: delay.actualPaymentDateFact && delay.actualPaymentDateFact.value || null,
        delayDays: delay.delayDays,
        liabilityAmount: roundClaimAuditMoney_(compensation.amount),
        sourceRef,
        dueRule: delay.rule,
        assumptions: [delay.reason, compensation.reason, nature.reason].filter(Boolean),
        verificationStatus: disputed ? 'probable_or_disputed' : 'confirmed',
      },
    });
  });
  return { facts, warnings };
}

function formatEmploymentPremiumPeriodLabel_(periodKey) {
  const quarter = String(periodKey || '').match(/^(\d{4})-Q([1-4])$/i);
  if (quarter) return `${quarter[2]} квартал ${quarter[1]}`;
  const month = String(periodKey || '').match(/^(\d{4})-(\d{2})$/);
  if (month) return `${month[2]}.${month[1]}`;
  return String(periodKey || 'период не определен');
}

function isEmploymentPremiumDelayDetailsEnabled_() {
  if (typeof PropertiesService === 'undefined') return false;
  return PropertiesService.getDocumentProperties()
    .getProperty(EMPLOYMENT_PREMIUM_DELAY_DETAILS_ENABLED_PROPERTY) === 'true';
}

function setEmploymentPremiumDelayDetailsEnabled_(enabled) {
  PropertiesService.getDocumentProperties().setProperty(
    EMPLOYMENT_PREMIUM_DELAY_DETAILS_ENABLED_PROPERTY,
    enabled === true ? 'true' : 'false'
  );
  return enabled === true;
}

/**
 * This optional sheet mirrors selected audit facts only. It is intentionally
 * not read back into calculations and therefore cannot become a second source
 * of truth for Article 236.
 */
function renderEmploymentPremiumDelayDetails_(spreadsheet, premiumClaimFacts, options) {
  const settings = options || {};
  const enabled = settings.enabled === undefined
    ? isEmploymentPremiumDelayDetailsEnabled_()
    : settings.enabled === true;
  if (!enabled) return null;
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = target.getSheetByName(EMPLOYMENT_PREMIUM_DELAY_DETAILS_SHEET_NAME);
  if (!sheet) sheet = target.insertSheet(EMPLOYMENT_PREMIUM_DELAY_DETAILS_SHEET_NAME);
  const headers = [[
    'Премия', 'Период', 'Сумма премии', 'Срок выплаты', 'Фактическая дата',
    'Дней задержки', 'Материальная ответственность по ст. 236 ТК РФ',
    'Статус', 'Источник и допущения', 'Технический идентификатор',
  ]];
  const rows = (premiumClaimFacts || []).filter((fact) => fact && fact.family === 'premium_payment_delay')
    .map((fact) => {
      const detail = fact.auditDetails || {};
      return [
        detail.premiumLabel || fact.baseLabel || 'Премия',
        fact.periodLabel || fact.periodKey,
        detail.premiumAmount === null || detail.premiumAmount === undefined ? '' : detail.premiumAmount,
        detail.dueDate || fact.dueDate || '',
        detail.actualPaymentDate || fact.actualPaymentDate || '',
        detail.delayDays === null || detail.delayDays === undefined ? '' : detail.delayDays,
        detail.liabilityAmount === null || detail.liabilityAmount === undefined ? fact.amount : detail.liabilityAmount,
        detail.verificationStatus === 'probable_or_disputed' ? 'спорное' : 'подтверждено',
        [detail.sourceRef || fact.sourceRef, (detail.assumptions || []).join(' ')].filter(Boolean).join(' · '),
        fact.premiumAuditId || buildStableClaimKey_(fact),
      ];
    });
  const rowCount = Math.max(sheet.getLastRow(), headers.length + rows.length, 1);
  sheet.getRange(1, 1, rowCount, headers[0].length).clearContent();
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
    .setBackground('#E8F0FE').setFontWeight('bold');
  if (rows.length) sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
  sheet.getRange(2, 3, Math.max(rows.length, 1), 1).setNumberFormat('#,##0.00');
  sheet.getRange(2, 4, Math.max(rows.length, 1), 2).setNumberFormat('dd.MM.yyyy');
  sheet.getRange(2, 7, Math.max(rows.length, 1), 1).setNumberFormat('#,##0.00');
  if (typeof sheet.getRange(1, 1, Math.max(rows.length + 1, 2), headers[0].length).createFilter === 'function') {
    const existingFilter = typeof sheet.getFilter === 'function' ? sheet.getFilter() : null;
    if (existingFilter && typeof existingFilter.remove === 'function') existingFilter.remove();
    sheet.getRange(1, 1, Math.max(rows.length + 1, 2), headers[0].length).createFilter();
  }
  return sheet;
}

/**
 * Normative-document analysis is deliberately opt-in.  Until it is enabled,
 * the calculator retains its payroll-slip-only workflow and never reads the
 * optional folder simply because a link happens to be present in Constructor.
 */
function isEmploymentNormativeImportEnabled_() {
  if (typeof PropertiesService === 'undefined') return false;
  return PropertiesService.getDocumentProperties()
    .getProperty(EMPLOYMENT_NORMATIVE_IMPORT_ENABLED_PROPERTY) === 'true';
}

function setEmploymentNormativeImportEnabled_(enabled) {
  if (typeof PropertiesService === 'undefined') {
    throw new Error('Недоступно хранилище настроек для включения анализа нормативных документов.');
  }
  PropertiesService.getDocumentProperties().setProperty(
    EMPLOYMENT_NORMATIVE_IMPORT_ENABLED_PROPERTY,
    enabled === true ? 'true' : 'false'
  );
  return enabled === true;
}

function readEmploymentNormativeFolderInput_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const range = target.getRangeByName('CLAIM_CONSTRUCTOR_NORMATIVE_FOLDER');
  const url = range ? String(range.getValue() || '').trim() : '';
  return { url, folderId: extractEmploymentNormativeFolderId_(url) };
}

function extractEmploymentNormativeFolderId_(value) {
  const text = String(value || '').trim();
  const match = text.match(/(?:drive\.google\.com\/drive\/folders\/|folders\/)([a-zA-Z0-9_-]{8,})/i);
  return match ? match[1] : '';
}

function listEmploymentNormativeDocuments_(folder) {
  const documents = [];
  const files = folder && typeof folder.getFiles === 'function' ? folder.getFiles() : null;
  if (!files || typeof files.hasNext !== 'function') return documents;
  while (files.hasNext()) {
    const file = files.next();
    const name = String(file.getName ? file.getName() : '');
    const mimeType = String(file.getMimeType ? file.getMimeType() : '');
    const classification = classifyEmploymentNormativeDocument_(name, mimeType);
    documents.push({
      id: String(file.getId ? file.getId() : ''),
      name,
      mimeType,
      url: String(file.getUrl ? file.getUrl() : ''),
      type: classification.type,
      supported: classification.supported,
      revision: resolveEmploymentNormativeDocumentRevision_(file, name),
    });
  }
  return documents.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
}

function classifyEmploymentNormativeDocument_(name, mimeType) {
  const title = normalizeText_(name);
  const supported = mimeType === EMPLOYMENT_NORMATIVE_DOCUMENT_MIME_TYPE;
  if (/доп(?:олнительн)?\s*(?:ое)?\s*соглашен|допсоглашен/i.test(title)) {
    return { type: 'employment_addendum', supported };
  }
  if (/трудов(?:ой|ого)?\s+договор/i.test(title)) {
    return { type: 'employment_contract', supported };
  }
  if (/пвтр|правил[а-я\s]*внутренн|положени|премирован|оплат[аы]\s+труд|индексац|коллективн/i.test(title)) {
    return { type: 'local_normative_act', supported };
  }
  return { type: 'unknown', supported };
}

function resolveEmploymentNormativeDocumentRevision_(file, name) {
  const title = String(name || '');
  const explicitDate = extractEmploymentNormativeDate_(title);
  const modified = file && typeof file.getLastUpdated === 'function' ? file.getLastUpdated() : null;
  return {
    explicitDate: explicitDate || null,
    modifiedAt: modified instanceof Date ? new Date(modified) : null,
    label: explicitDate
      ? `редакция от ${formatDate_(explicitDate)}`
      : (modified instanceof Date ? `изменен ${formatDate_(modified)}` : 'дата редакции не определена'),
  };
}

function extractEmploymentNormativeDate_(text) {
  const match = String(text || '').match(/(?:редакц(?:ия|ии)?\s*)?(?:от\s*)?(\d{1,2}[.]\d{1,2}[.]\d{4})/i);
  return match ? parseDateValue_(match[1]) : null;
}

/**
 * Reads one folder containing a contract, integral addenda and local acts.
 * An inaccessible folder or unsupported file is a review item, never a hard
 * failure for unrelated payroll reconstruction.
 */
function importEmploymentNormativeFolder_(spreadsheet, options) {
  const settings = options || {};
  const enabled = settings.enabled === undefined
    ? isEmploymentNormativeImportEnabled_()
    : settings.enabled === true;
  if (!enabled) return { status: 'disabled', documents: [], warnings: [], facts: null };
  const input = settings.input || readEmploymentNormativeFolderInput_(spreadsheet);
  if (!input.folderId) {
    return {
      status: 'cannot_verify', documents: [], facts: null,
      warnings: [{
        code: 'normative_folder_missing', disputed: true,
        source: 'Конструктор!B6',
        reason: 'Не указана папка с трудовым договором, дополнительными соглашениями и ЛНА.',
      }],
    };
  }
  let folder;
  try {
    if (typeof DriveApp === 'undefined' || !DriveApp.getFolderById) throw new Error('DriveApp unavailable');
    folder = DriveApp.getFolderById(input.folderId);
  } catch (error) {
    return {
      status: 'cannot_verify', documents: [], facts: null,
      warnings: [{
        code: 'normative_folder_inaccessible', disputed: true,
        source: input.url || input.folderId,
        reason: 'Папка нормативных документов не найдена или недоступна; расчет по расчетным листкам продолжен.',
      }],
    };
  }
  const documents = listEmploymentNormativeDocuments_(folder);
  const warnings = documents.filter((document) => !document.supported).map((document) => ({
    code: 'normative_document_unsupported', disputed: true,
    source: document.url || document.name,
    reason: `Файл «${document.name}» пока не поддерживается для извлечения; он не блокирует расчет.`,
  }));
  const resolved = resolveEmploymentNormativeDocumentVersions_(documents);
  warnings.push.apply(warnings, resolved.conflicts);
  const facts = extractEmploymentNormativeFacts_(documents.filter((document) => document.supported));
  warnings.push.apply(warnings, facts.premiumDueRules.conflicts);
  return {
    status: warnings.length ? 'complete_with_warnings' : 'complete',
    folderId: input.folderId,
    documents,
    resolved,
    facts,
    warnings,
  };
}

function readEmploymentNormativeDocumentText_(document) {
  if (!document || !document.id || document.mimeType !== EMPLOYMENT_NORMATIVE_DOCUMENT_MIME_TYPE) return '';
  try {
    if (typeof DocumentApp === 'undefined' || !DocumentApp.openById) return '';
    const body = DocumentApp.openById(document.id).getBody();
    return body && typeof body.getText === 'function' ? String(body.getText() || '') : '';
  } catch (error) {
    return '';
  }
}

function extractEmploymentNormativeFacts_(documents) {
  const employmentStartFacts = [];
  const remunerationElements = [];
  const premiumMentions = [];
  const conditions = [];
  const workingTimeFacts = [];
  (documents || []).forEach((document) => {
    const text = readEmploymentNormativeDocumentText_(document);
    if (!text) return;
    const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((item) => item.trim()).filter(Boolean);
    sentences.forEach((sentence, index) => {
      const sourceRef = `${document.name}#${index + 1}`;
      const date = extractEmploymentNormativeDate_(sentence);
      if (date && /приступ|начал[а-я\s]*работ|принят[а-я\s]*на\s+работ|трудов(?:ой|ого)?\s+договор/i.test(sentence)) {
        employmentStartFacts.push(createEmploymentAuditFact_(date, {
          sourceType: 'document_confirmed', sourceRef, confidence: 0.8,
          verificationStatus: 'probable_or_disputed', notes: sentence,
        }));
      }
      if (/оклад|надбавк|доплат|компенсацион|стимулирующ/i.test(sentence)) {
        remunerationElements.push({ text: sentence, sourceRef, documentId: document.id });
      }
      const workTime = sentence.match(/(\d{1,2})\s*час(?:а|ов)?\s*(?:в|за)\s*недел/i);
      if (workTime || /(?:пятиднев|сменн\w*\s+график|режим\s+рабочего\s+времени)/i.test(sentence)) {
        workingTimeFacts.push(createEmploymentWorkingTimeFact_({
          hoursPerWeek: workTime ? Number(workTime[1]) : null,
        }, {
          sourceType: 'document_confirmed', sourceRef, confidence: workTime ? 0.8 : 0.6,
          verificationStatus: 'probable_or_disputed',
          schedule: /пятиднев/i.test(sentence) ? 'пятидневная неделя'
            : (/сменн/i.test(sentence) ? 'сменный график' : ''),
          notes: sentence,
        }));
      }
      if (/преми|бонус/i.test(sentence)) {
        const dueRule = extractEmploymentPremiumDueRuleFromText_(sentence, sourceRef);
        premiumMentions.push({
          text: sentence, sourceRef, documentId: document.id,
          classification: classifyEmploymentPremiumNature_({ label: sentence, evidence: [{ text: sentence }] }),
          dueRule,
        });
      }
      if (/срок|выплат|не позднее|ежемесяч|ежеквартал/i.test(sentence)) {
        conditions.push({
          text: sentence, sourceRef, documentId: document.id,
          dueRule: extractEmploymentPremiumDueRuleFromText_(sentence, sourceRef),
        });
      }
    });
  });
  return {
    employmentStartFacts, remunerationElements, premiumMentions, conditions, workingTimeFacts,
    premiumDueRules: resolveEmploymentNormativePremiumDueRules_(conditions),
  };
}

function extractEmploymentPremiumDueRuleFromText_(text, sourceRef) {
  const sentence = String(text || '');
  if (!/преми|бонус/i.test(sentence)) return null;
  const monthNames = {
    января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
    июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
  };
  const fixed = sentence.match(/(?:не\s+позднее|до)\s+(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/i);
  if (fixed) {
    return {
      id: `document_month_day_${monthNames[fixed[2].toLowerCase()]}_${fixed[1]}`,
      type: 'period_year_month_day',
      parameters: { month: monthNames[fixed[2].toLowerCase()], day: Number(fixed[1]) },
      sourceType: 'document_confirmed', sourceRef, confidence: 0.75,
      notes: sentence,
    };
  }
  const offset = sentence.match(/(?:в\s+течение|не\s+позднее)\s+(\d+)\s+(?:календарн\w*\s+)?дн(?:ей|я)?\s+(?:после|по\s+окончании)/i);
  if (offset) {
    return {
      id: `document_period_offset_${offset[1]}`,
      type: 'period_end_offset', parameters: { days: Number(offset[1]) },
      sourceType: 'document_confirmed', sourceRef, confidence: 0.7,
      notes: sentence,
    };
  }
  return null;
}

function resolveEmploymentNormativePremiumDueRules_(conditions) {
  const rules = (conditions || []).filter((condition) => condition && condition.dueRule)
    .map((condition) => Object.assign({ text: condition.text, sourceRef: condition.sourceRef }, condition.dueRule));
  const bySemantic = {};
  rules.forEach((rule) => {
    const semantic = /ежеквартал/i.test(rule.notes || rule.text || '') ? 'quarterly'
      : (/ежемесяч/i.test(rule.notes || rule.text || '') ? 'monthly' : 'premium');
    if (!bySemantic[semantic]) bySemantic[semantic] = [];
    bySemantic[semantic].push(rule);
  });
  const conflicts = [];
  Object.keys(bySemantic).forEach((semantic) => {
    const signatures = new Set(bySemantic[semantic].map((rule) =>
      `${rule.type}:${JSON.stringify(rule.parameters || {})}`
    ));
    if (signatures.size > 1) {
      conflicts.push({
        code: 'premium_due_rule_conflict', disputed: true,
        source: bySemantic[semantic].map((rule) => rule.sourceRef).join('; '),
        reason: `В нормативных документах найдены противоречащие сроки выплаты премии (${semantic}); срок не выбран автоматически.`,
      });
    }
  });
  return { rules, conflicts };
}

function resolveEmploymentNormativeDocumentVersions_(documents) {
  const byType = {};
  (documents || []).filter((document) => document.type !== 'unknown').forEach((document) => {
    if (!byType[document.type]) byType[document.type] = [];
    byType[document.type].push(document);
  });
  const activeByType = {};
  const conflicts = [];
  Object.keys(byType).forEach((type) => {
    const versions = byType[type].slice().sort((left, right) => {
      const leftDate = left.revision.explicitDate || left.revision.modifiedAt || new Date(0);
      const rightDate = right.revision.explicitDate || right.revision.modifiedAt || new Date(0);
      return Number(rightDate) - Number(leftDate) || right.id.localeCompare(left.id);
    });
    activeByType[type] = versions[0];
    const sameEffectiveDate = versions.length > 1 && versions[0].revision.explicitDate
      && versions[1].revision.explicitDate
      && Number(versions[0].revision.explicitDate) === Number(versions[1].revision.explicitDate)
      && versions[0].id !== versions[1].id;
    if (sameEffectiveDate) {
      conflicts.push({
        code: 'normative_document_version_conflict', disputed: true,
        source: `${versions[0].name}; ${versions[1].name}`,
        reason: `Для типа «${employmentNormativeDocumentTypeLabel_(type)}» найдены разные документы с одной датой редакции; требуется выбрать применимую редакцию.`,
      });
    }
  });
  return { activeByType, conflicts };
}

function employmentNormativeDocumentTypeLabel_(type) {
  return {
    employment_contract: 'трудовой договор',
    employment_addendum: 'дополнительное соглашение',
    local_normative_act: 'локальный нормативный акт',
  }[type] || 'документ';
}

function createEmploymentWorkingTimeFact_(value, options) {
  const fact = createEmploymentAuditFact_(value, options);
  const settings = options || {};
  return Object.assign(fact, {
    schedule: String(settings.schedule || ''),
    effectiveFrom: parseDateValue_(settings.effectiveFrom) || null,
    effectiveTo: parseDateValue_(settings.effectiveTo) || null,
  });
}

function resolveEmploymentWorkingTimeFact_(facts, periodDate) {
  const period = parseDateValue_(periodDate);
  const applicable = (facts || []).filter((fact) => {
    const from = parseDateValue_(fact && fact.effectiveFrom);
    const to = parseDateValue_(fact && fact.effectiveTo);
    return !period || ((!from || from <= period) && (!to || to >= period));
  });
  const resolution = resolveEmploymentAuditFacts_(applicable);
  if (resolution.effective) {
    const original = applicable.find((fact) =>
      String(fact && fact.sourceRef || '') === String(resolution.effective.sourceRef || ''));
    if (original) resolution.effective = Object.assign({}, resolution.effective, original);
  }
  resolution.candidates = resolution.candidates.map((candidate) => {
    const original = applicable.find((fact) =>
      String(fact && fact.sourceRef || '') === String(candidate.sourceRef || ''));
    return original ? Object.assign({}, candidate, original) : candidate;
  });
  return resolution;
}

/**
 * An overtime check never estimates a statutory norm from payroll days alone.
 * It reports a concrete gap only when both the contractual schedule and the
 * employer-recorded hours are present; otherwise it asks for the missing fact.
 */
function buildEmploymentOvertimeAudit_(event, workingTimeFacts) {
  const value = event || {};
  const periodDate = parseDateValue_(value.periodDate) || resolveEmploymentPremiumPeriodEnd_(value.periodKey);
  const norm = resolveEmploymentWorkingTimeFact_(workingTimeFacts, periodDate);
  const actualHours = value.actualHours === null || value.actualHours === undefined || value.actualHours === ''
    ? NaN : Number(value.actualHours);
  const expectedHours = value.expectedHours === null || value.expectedHours === undefined || value.expectedHours === ''
    ? NaN : Number(value.expectedHours);
  const actualDays = value.actualDays === null || value.actualDays === undefined || value.actualDays === ''
    ? NaN : Number(value.actualDays);
  const expectedDays = value.expectedDays === null || value.expectedDays === undefined || value.expectedDays === ''
    ? NaN : Number(value.expectedDays);
  if (!norm.effective || norm.effective.verificationStatus !== 'confirmed') {
    return {
      id: buildEmploymentAuditPositionId_({ ruleId: 'overtime_hours', layoutId: value.layoutId, baseKind: 'work_time', periodKey: value.periodKey, calculationItem: value.calculationItem }),
      status: 'cannot_verify', disputed: true,
      reason: 'Не подтверждены норма рабочего времени и применимый график; укажите их в договоре, ЛНА или анкете.',
      question: 'Какова норма рабочего времени и график работника в этом периоде?',
      requestedDocument: 'Трудовой договор, допсоглашение или ЛНА о режиме рабочего времени.',
    };
  }
  const hasComparableHours = Number.isFinite(actualHours) && Number.isFinite(expectedHours);
  const hasComparableDays = Number.isFinite(actualDays) && Number.isFinite(expectedDays);
  if (!hasComparableHours && !hasComparableDays) {
    return {
      id: buildEmploymentAuditPositionId_({ ruleId: 'overtime_hours', layoutId: value.layoutId, baseKind: 'work_time', periodKey: value.periodKey, calculationItem: value.calculationItem }),
      status: 'cannot_verify', disputed: true,
      reason: 'В расчетных листках нет сопоставимых фактически отраженных и нормативных часов.',
      question: 'Укажите табель/график с количеством часов за период.',
      requestedDocument: 'Табель учета рабочего времени.',
    };
  }
  const hoursPerDay = Number(value.hoursPerDay)
    || Number(norm.effective.value && norm.effective.value.hoursPerDay)
    || (Number(norm.effective.value && norm.effective.value.hoursPerWeek) / 5)
    || 8;
  const excessDays = hasComparableDays ? Math.max(0, actualDays - expectedDays) : 0;
  const excessHours = hasComparableHours
    ? Math.max(0, actualHours - expectedHours)
    : excessDays * hoursPerDay;
  const paidOvertimeHours = Math.max(0, Number(value.paidOvertimeHours) || 0);
  const hasPaidOvertimeWithoutHours = value.hasPaidOvertime === true
    && !Number.isFinite(Number(value.paidOvertimeHours));
  const unpaidOvertimeHours = hasPaidOvertimeWithoutHours
    ? null : Math.max(0, excessHours - paidOvertimeHours);
  return {
    id: buildEmploymentAuditPositionId_({ ruleId: 'overtime_hours', layoutId: value.layoutId, baseKind: 'work_time', periodKey: value.periodKey, calculationItem: value.calculationItem }),
    status: unpaidOvertimeHours === null
      ? 'cannot_verify'
      : (excessHours > paidOvertimeHours ? 'probable_or_disputed' : 'informational'),
    disputed: unpaidOvertimeHours === null || excessHours > paidOvertimeHours,
    actualHours: hasComparableHours ? actualHours : null,
    expectedHours: hasComparableHours ? expectedHours : null,
    actualDays: hasComparableDays ? actualDays : null,
    expectedDays: hasComparableDays ? expectedDays : null,
    excessDays, excessHours, paidOvertimeHours, unpaidOvertimeHours,
    sourceFacts: norm.candidates,
    reason: unpaidOvertimeHours === null
      ? 'В расчетном листке есть оплата сверхурочной работы, но нет количества оплаченных часов; требуется сверка с табелем.'
      : (excessHours > paidOvertimeHours
        ? 'Возможно, часть сверхурочной работы не оплачена; требуется сверка с табелем и правилами оплаты.'
        : 'По доступным данным сверхурочные часы не превышают уже отраженную оплату.'),
    question: unpaidOvertimeHours === null
      ? 'Сколько сверхурочных часов уже оплачено за этот период?' : '',
    requestedDocument: unpaidOvertimeHours === null ? 'Табель учета рабочего времени.' : '',
  };
}

function buildEmploymentOvertimeAuditCatalog_(rows, workingTimeFacts, options) {
  const settings = options || {};
  const groups = new Map();
  (rows || []).forEach((row, index) => {
    if (!row || !row.period) return;
    const periodKey = buildPayrollAuditPeriodKey_(row.period);
    if (!groups.has(periodKey)) groups.set(periodKey, []);
    groups.get(periodKey).push({ row, index });
  });
  const scope = settings.employmentAuditScope || { active: false, startDate: null };
  return Array.from(groups.entries()).map(([periodKey, entries]) => {
    const period = entries[0].row.period;
    const periodDate = new Date(period.year, period.month - 1, 1);
    const normResolution = resolveEmploymentWorkingTimeFact_(workingTimeFacts, periodDate);
    const normValue = normResolution.effective && normResolution.effective.value || {};
    const schedule = normalizeText_(normResolution.effective && normResolution.effective.schedule
      || normValue.schedule || '');
    const actualHours = uniqueFinitePayrollAuditValue_(entries, ['actualHours', 'workHours', 'paidHours']);
    const actualDays = uniqueFinitePayrollAuditValue_(entries, ['paidDays', 'actualDays']);
    let expectedDays = null;
    let expectedHours = null;
    const shiftSchedule = /смен|суммирован|вахт|ненормир/.test(schedule);
    if (!shiftSchedule && normResolution.effective
      && normResolution.effective.verificationStatus === 'confirmed') {
      expectedDays = getEmploymentExpectedWorkingDays_(
        period, settings.productionCalendar || {}, scope.active ? scope.startDate : null,
        settings.employmentEndDate
      );
      const hoursPerWeek = Number(normValue.hoursPerWeek);
      const hoursPerDay = Number(normValue.hoursPerDay)
        || (Number.isFinite(hoursPerWeek) && hoursPerWeek > 0 ? hoursPerWeek / 5 : null);
      if (expectedDays !== null && hoursPerDay) expectedHours = expectedDays * hoursPerDay;
    }
    const overtimeRows = entries.filter((entry) =>
      /сверхуроч/.test(normalizeText_(`${entry.row.category || ''} ${entry.row.kind || ''} ${entry.row.sourceRow || ''}`)));
    const paidOvertimeHours = uniqueFinitePayrollAuditValue_(overtimeRows, ['paidOvertimeHours', 'actualHours', 'workHours']);
    const audit = buildEmploymentOvertimeAudit_({
      layoutId: 'raw_payroll', periodKey, calculationItem: 'employer_reported_time', periodDate,
      actualHours, expectedHours, actualDays, expectedDays,
      paidOvertimeHours: paidOvertimeHours === null ? undefined : paidOvertimeHours,
      hasPaidOvertime: overtimeRows.length > 0,
      hoursPerDay: Number(normValue.hoursPerDay) || (Number(normValue.hoursPerWeek) / 5),
    }, workingTimeFacts);
    return createPayrollAuditCatalogResult_('overtime_hours', {
      layoutId: 'raw_payroll', baseKind: 'work_time', periodKey,
      calculationItem: 'employer_reported_time', status: audit.status,
      evidence: entries.map((entry) => buildPayrollAuditSourceEvidence_(entry.row, entry.index))
        .concat(audit.sourceFacts || []),
      reason: shiftSchedule && audit.status === 'cannot_verify'
        ? 'Для сменного или суммированного режима месячная норма не выводится из пятидневного календаря.'
        : audit.reason,
      question: shiftSchedule
        ? 'Какова утвержденная норма часов по графику за этот период?' : audit.question,
      requestedDocument: shiftSchedule
        ? 'Табель учета рабочего времени и утвержденный график.'
        : (audit.requestedDocument || (audit.status === 'cannot_verify'
          ? 'Табель учета рабочего времени.' : '')),
    });
  });
}

function uniqueFinitePayrollAuditValue_(entries, fields) {
  const values = new Set();
  (entries || []).forEach((entry) => {
    const row = entry && entry.row || {};
    (fields || []).some((field) => {
      if (row[field] === null || row[field] === undefined || row[field] === '') return false;
      const value = Number(row[field]);
      if (Number.isFinite(value)) values.add(value);
      return true;
    });
  });
  return values.size === 1 ? Array.from(values)[0] : null;
}

function getEmploymentExpectedWorkingDays_(period, productionCalendar, employmentStartDate, employmentEndDate) {
  if (!period || !Number(period.year) || !Number(period.month)) return null;
  const start = parseDateValue_(employmentStartDate);
  const end = parseDateValue_(employmentEndDate);
  const first = new Date(Number(period.year), Number(period.month) - 1, 1);
  const last = new Date(Number(period.year), Number(period.month), 0);
  const from = start && start > first ? start : first;
  const to = end && end < last ? end : last;
  if (from > to) return 0;
  let days = 0;
  for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    if (!isNonWorkingDay_(cursor, productionCalendar || {})) days++;
  }
  return days;
}

/** Keeps each vacation source event separate while deriving a reviewable leave chronology. */
function buildEmploymentVacationChronology_(events, options) {
  const settings = options || {};
  const entitlement = Number(settings.annualEntitlementDays || 28);
  const start = parseDateValue_(settings.employmentStartDate);
  const end = parseDateValue_(settings.employmentEndDate);
  const items = (events || []).map((event, index) => {
    const value = event || {};
    const interval = resolveEmploymentVacationInterval_(value);
    const paymentDate = parseDateValue_(value.paymentDate);
    const timing = typeof buildZupVacationTimingAudit_ === 'function'
      ? buildZupVacationTimingAudit_({ vacationStartDate: interval.startDate, paymentDate,
        entitledAmount: value.amount, paidAmount: value.paidAmount })
      : { status: 'cannot_verify', reason: 'Не загружен модуль проверки отпускных.' };
    return {
      id: String(value.id || `vacation_event_${index + 1}`), sourceRef: value.sourceRef || value.file || '',
      startDate: interval.startDate, endDate: interval.endDate, days: interval.days,
      paymentDate, amount: parseMoney_(value.amount), paidAmount: parseMoney_(value.paidAmount),
      timing, status: interval.startDate && interval.endDate ? 'available' : 'cannot_verify',
    };
  }).sort((a, b) => Number(a.startDate || 0) - Number(b.startDate || 0));
  const warnings = [];
  items.forEach((item, index) => {
    if (item.status === 'cannot_verify') warnings.push({ code: 'vacation_interval_missing', disputed: true,
      source: item.sourceRef, reason: 'Не распознан точный интервал отпуска; требуется уточнение кадрового документа.' });
    if (item.timing && item.timing.status === 'cannot_verify') warnings.push({ code: 'vacation_payment_date_missing', disputed: true,
      source: item.sourceRef, reason: 'Не подтверждена фактическая дата выплаты отпускных; срок по ст. 236 ТК РФ требует уточнения.' });
    if (index && item.startDate && items[index - 1].endDate && item.startDate <= items[index - 1].endDate) {
      warnings.push({ code: 'vacation_interval_overlap', disputed: true, source: item.sourceRef,
        reason: 'Интервалы отпусков пересекаются; позиции сохранены раздельно и требуют сверки.' });
    }
  });
  const usedDays = items.reduce((sum, item) => sum + (Number(item.days) || 0), 0);
  const accrualEnd = end || new Date();
  const months = start && accrualEnd >= start
    ? (accrualEnd.getFullYear() - start.getFullYear()) * 12 + accrualEnd.getMonth() - start.getMonth() + 1 : null;
  const accruedDays = months === null || !Number.isFinite(entitlement) ? null : Math.max(0, months * entitlement / 12);
  const unusedDays = accruedDays === null ? null : Math.max(0, accruedDays - usedDays);
  const averageDailyEarnings = parseMoney_(settings.averageDailyEarnings);
  const unusedCompensation = end && unusedDays !== null && averageDailyEarnings !== null
    ? roundClaimAuditMoney_(unusedDays * averageDailyEarnings) : null;
  return { items, warnings, usedDays, accruedDays, unusedDays, unusedCompensation,
    status: warnings.length ? 'complete_with_warnings' : 'complete' };
}

function resolveEmploymentVacationInterval_(event) {
  const value = event || {};
  let startDate = parseDateValue_(value.vacationStartDate || value.startDate);
  let endDate = parseDateValue_(value.vacationEndDate || value.endDate);
  const dates = String(value.vacationPeriod || '').match(/\d{1,2}[.]\d{1,2}[.]\d{4}/g) || [];
  if (!startDate && dates[0]) startDate = parseDateValue_(dates[0]);
  if (!endDate && dates[1]) endDate = parseDateValue_(dates[1]);
  const days = startDate && endDate && endDate >= startDate
    ? Math.round((endDate - startDate) / 86400000) + 1 : Number(value.days) || null;
  return { startDate, endDate, days };
}

function getClaimIntakeSettings_() {
  return CLAIM_INTAKE_SETTINGS;
}

function getClaimIntakeLayout_() {
  return {
    sheetName: CLAIM_INTAKE_SETTINGS.SHEET_NAME,
    employerSector: {
      label: 'Сектор работодателя',
      labelCell: 'A3',
      valueCell: 'B3',
      namedRange: 'CLAIM_INTAKE_EMPLOYER_SECTOR',
    },
    employmentStartDate: {
      label: 'Дата начала трудовых отношений',
      labelCell: 'A4',
      valueCell: 'B4',
      sourceCell: 'C4',
      statusCell: 'D4',
      namedRange: 'CLAIM_INTAKE_EMPLOYMENT_START_DATE',
      sourceNamedRange: 'CLAIM_INTAKE_EMPLOYMENT_START_SOURCE',
      statusNamedRange: 'CLAIM_INTAKE_EMPLOYMENT_START_STATUS',
    },
    questionnaireFacts: {
      employmentEndDate: {
        label: 'Дата увольнения (если есть)', labelCell: 'G3', valueCell: 'H3',
        namedRange: 'CLAIM_INTAKE_EMPLOYMENT_END_DATE',
      },
      workSchedule: {
        label: 'Режим и норма времени', labelCell: 'G4', valueCell: 'H4',
        namedRange: 'CLAIM_INTAKE_WORK_SCHEDULE',
      },
      actualPaymentFacts: {
        label: 'Фактические даты выплат', labelCell: 'G5', valueCell: 'H5',
        namedRange: 'CLAIM_INTAKE_ACTUAL_PAYMENT_FACTS',
      },
    },
    calculatedAverage: {
      label: 'Рассчитанный средний заработок',
      labelCell: 'A6',
      valueCell: 'B6',
      namedRange: 'CLAIM_INTAKE_CALCULATED_AVERAGE_EARNINGS',
    },
    calculatedAverageContext: {
      valueCell: 'C6',
      namedRange: 'CLAIM_INTAKE_CALCULATED_AVERAGE_CONTEXT',
    },
    calculatedAverageBadge: {
      value: 'рассчитано',
      valueCell: 'D6',
    },
    manualAverageEnabled: {
      label: 'Задать вручную средний заработок',
      labelCell: 'A7',
      valueCell: 'B7',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_ENABLED',
    },
    manualAverage: {
      label: 'Средний заработок вручную',
      labelCell: 'A8',
      valueCell: 'B8',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_EARNINGS',
    },
    manualAverageContext: {
      valueCell: 'C8',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_CONTEXT',
    },
    manualAverageSource: {
      value: 'источник: пользователь',
      valueCell: 'D8',
      namedRange: 'CLAIM_INTAKE_MANUAL_AVERAGE_SOURCE',
    },
    finalAverageScenario: {
      label: 'Итоговый сценарий',
      labelCell: 'A10',
      valueCell: 'B10',
      namedRange: 'CLAIM_INTAKE_FINAL_AVERAGE_SCENARIO',
    },
    partialRecoveries: {
      titleCell: 'A12',
      actionCell: 'B12',
      actionControlCell: 'C12',
      headerRow: 13,
      firstRow: 14,
      rowCount: 10,
      columnCount: 4,
      namedRange: 'CLAIM_INTAKE_PARTIAL_RECOVERIES',
    },
    claimSelections: {
      titleCell: 'A62',
      firstRow: 63,
      columnCount: 6,
      namedRange: 'CLAIM_INTAKE_CLAIM_SELECTIONS',
    },
    docsHistory: {
      titleCell: 'G48',
      headerRow: 49,
      firstRow: 50,
      firstColumn: 7,
      rowCount: 1,
      columnCount: 3,
      namedRange: 'CLAIM_INTAKE_DOCS_HISTORY',
    },
  };
}

function ensureClaimIntakeSheet_(spreadsheet) {
  const layout = getClaimIntakeLayout_();
  let sheet = spreadsheet.getSheetByName(layout.sheetName);
  const created = !sheet;
  if (created) {
    const constructor = spreadsheet.getSheetByName('Конструктор');
    const insertIndex = constructor ? constructor.getIndex() : 1;
    sheet = spreadsheet.insertSheet(layout.sheetName, insertIndex);
  }

  applyClaimIntakeStructure_(sheet, layout);
  formatClaimIntakeSheet_(sheet, layout, created);
  registerClaimIntakeNamedRanges_(spreadsheet, sheet, layout);
  return sheet;
}

function ensureClaimConstructorWorkspace_(spreadsheet) {
  const constructor = ensureClaimConstructorSheet_(spreadsheet);
  const questionnaire = ensureClaimIntakeSheet_(spreadsheet);
  return { constructor, questionnaire };
}

function applyClaimIntakeStructure_(sheet, layout) {
  sheet.getRange('A1').setValue('Анкета и требования');
  sheet.getRange('A2').setValue('Факты дела, настройки расчета и выбранные требования');
  sheet.getRange(layout.employerSector.labelCell).setValue(layout.employerSector.label);
  sheet.getRange(layout.employmentStartDate.labelCell).setValue(layout.employmentStartDate.label);
  Object.keys(layout.questionnaireFacts).forEach((key) => {
    const field = layout.questionnaireFacts[key];
    sheet.getRange(field.labelCell).setValue(field.label);
  });
  if (!String(sheet.getRange(layout.employmentStartDate.sourceCell).getValue() || '').trim()) {
    sheet.getRange(layout.employmentStartDate.sourceCell).setValue('источник: пользователь');
  }
  if (!String(sheet.getRange(layout.employmentStartDate.statusCell).getValue() || '').trim()) {
    sheet.getRange(layout.employmentStartDate.statusCell).setValue('подтверждено пользователем');
  }
  sheet.getRange('A5').setValue('Средний заработок');
  [
    layout.calculatedAverage,
    layout.manualAverageEnabled,
    layout.manualAverage,
    layout.finalAverageScenario,
  ].forEach((field) => sheet.getRange(field.labelCell).setValue(field.label));
  sheet.getRange(layout.calculatedAverageBadge.valueCell)
    .setValue(layout.calculatedAverageBadge.value);
  sheet.getRange(layout.manualAverageSource.valueCell)
    .setValue(layout.manualAverageSource.value);

  sheet.getRange(layout.partialRecoveries.titleCell).setValue('Частичные погашения');
  sheet.getRange(layout.partialRecoveries.actionCell).setValue('Добавить');
  sheet.getRange(layout.partialRecoveries.headerRow, 1, 1, 4).setValues([[
    'Учитывать', 'Дата', 'Сумма', 'К какому требованию отнести',
  ]]);
  sheet.getRange(layout.claimSelections.titleCell).setValue('Аудит и требования');
  sheet.getRange(layout.docsHistory.titleCell).setValue('История сформированных Docs');
  sheet.getRange(layout.docsHistory.headerRow, layout.docsHistory.firstColumn, 1, 3).setValues([[
    'Дата создания', 'Документ', 'Источник',
  ]]);

  const sectorRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CLAIM_INTAKE_SETTINGS.SECTOR_VALUES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(layout.employerSector.valueCell).setDataValidation(sectorRule);
  sheet.getRange(layout.employmentStartDate.valueCell).setNumberFormat('dd.MM.yyyy');
  sheet.getRange(layout.questionnaireFacts.employmentEndDate.valueCell).setNumberFormat('dd.MM.yyyy');
  const scenarioRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES, true)
    .setAllowInvalid(false)
    .build();
  const scenarioCell = sheet.getRange(layout.finalAverageScenario.valueCell);
  scenarioCell.setDataValidation(scenarioRule);
  if (!String(scenarioCell.getValue() || '').trim()) {
    scenarioCell.setValue(CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0]);
  }

  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.manualAverageEnabled.valueCell)
  );
  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.partialRecoveries.actionControlCell)
  );
  const recoveryActionControl = sheet.getRange(layout.partialRecoveries.actionControlCell);
  if (recoveryActionControl.getValue() !== true) {
    recoveryActionControl.setValue(false);
  }
  insertClaimIntakeCheckboxesPreservingValues_(
    sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 1)
  );
}

function insertClaimIntakeCheckboxesPreservingValues_(range) {
  const values = range.getValues();
  range.insertCheckboxes();
  range.setValues(values);
}

function buildStableClaimKey_(item) {
  const value = item || {};
  return [
    value.family,
    normalizeClaimLayoutIdentity_(value.layoutId),
    normalizeClaimBaseKindIdentity_(value.baseKind),
    value.periodKey,
    value.calculationItem,
  ]
    .map((part) => encodeURIComponent(normalizeText_(part)))
    .join('|');
}

function normalizeClaimLayoutIdentity_(layoutId) {
  return normalizeText_(layoutId) || 'unknown_layout';
}

function normalizeClaimBaseKindIdentity_(baseKind) {
  return normalizeText_(baseKind) || 'unknown_base_kind';
}

function buildClaimAuditModel_(claimFacts) {
  const familyDefinitions = [
    { family: 'underpayment', label: 'Взыскать недоплату' },
    { family: 'material_liability', label: 'Материальная ответственность' },
    { family: 'premium_payment_delay', label: 'Материальная ответственность за просрочку выплаты премии' },
    { family: 'vacation_payment_delay', label: 'Нарушение срока выплаты отпускных' },
    { family: 'salary_indexation', label: 'Индексация заработной платы' },
    { family: 'underpayment_indexation', label: 'Индексация недоплаты' },
    { family: 'unallocated_recovery', label: 'Нераспределенные погашения', excludedFromClaimTotals: true },
  ];
  const factsByFamily = {};
  familyDefinitions.forEach((definition) => { factsByFamily[definition.family] = new Map(); });

  (claimFacts || []).forEach((fact) => {
    if (!fact || !factsByFamily[fact.family]) return;
    const amount = Number(fact.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const key = buildStableClaimKey_(fact);
    const existing = factsByFamily[fact.family].get(key);
    if (existing) {
      existing.amount = roundClaimAuditMoney_(existing.amount + amount);
      existing.disputed = existing.disputed || fact.disputed === true;
      if (fact.auditDetails) existing.auditDetails.push(fact.auditDetails);
      if (fact.sourceRef && existing.sourceRefs.indexOf(fact.sourceRef) < 0) {
        existing.sourceRefs.push(fact.sourceRef);
      }
      return;
    }
    factsByFamily[fact.family].set(key, {
      key,
      family: fact.family,
      layoutId: fact.layoutId,
      baseKind: fact.baseKind,
      baseLabel: fact.baseLabel,
      periodKey: fact.periodKey,
      periodLabel: fact.periodLabel,
      calculationItem: fact.calculationItem,
      violationLabel: buildClaimViolationLabel_(fact),
      periodLabel: fact.periodLabel || fact.periodKey,
      label: `${buildClaimViolationLabel_(fact)} — ${fact.periodLabel || fact.periodKey}`,
      amount: roundClaimAuditMoney_(amount),
      disputed: fact.disputed === true,
      badge: fact.disputed === true ? 'спорное' : '',
      selected: true,
      sourceRefs: fact.sourceRef ? [fact.sourceRef] : [],
      auditDetails: fact.auditDetails ? [fact.auditDetails] : [],
    });
  });

  const groups = familyDefinitions.map((definition) => {
    const items = Array.from(factsByFamily[definition.family].values());
    if (!items.length) return null;
    return {
      family: definition.family,
      label: definition.label,
      excludedFromClaimTotals: definition.excludedFromClaimTotals === true,
      total: roundClaimAuditMoney_(items.reduce((sum, item) => sum + item.amount, 0)),
      items,
    };
  }).filter(Boolean);
  const model = {
    groups,
    total: roundClaimAuditMoney_(groups.reduce(
      (sum, group) => sum + (group.excludedFromClaimTotals ? 0 : group.total), 0
    )),
  };
  const expectedTotal = roundClaimAuditMoney_((claimFacts || []).reduce((sum, fact) => {
    if (!fact || !factsByFamily[fact.family] || fact.family === 'unallocated_recovery') return sum;
    const amount = Number(fact.amount);
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0));
  if (Math.abs(model.total - expectedTotal) > 0.01) {
    throw new Error(
      `Разбивка требований не сходится с расчетными позициями: `
      + `${formatClaimAuditAmount_(model.total)} вместо ${formatClaimAuditAmount_(expectedTotal)}.`
    );
  }
  return model;
}

function buildClaimViolationLabel_(fact) {
  const value = fact || {};
  const baseLabels = {
    salary: 'окладу',
    monthly_premium: 'ежемесячной премии',
    quarterly_premium: 'ежеквартальной премии',
    annual_premium: 'ежегодной премии',
    vacation: 'отпускным',
    vacation_payment: 'отпускным',
    salary_payment: 'заработной плате',
  };
  const basis = baseLabels[value.baseKind]
    || String(value.baseLabel || 'иному основанию').toLowerCase();
  const labels = {
    underpayment: `Недоплата по ${basis}`,
    material_liability: `Материальная ответственность за задержку выплаты по ${basis}`,
    premium_payment_delay: 'Материальная ответственность за просрочку выплаты премии',
    vacation_payment_delay: 'Нарушение срока выплаты отпускных',
    salary_indexation: `Индексация заработной платы по ${basis}`,
    underpayment_indexation: `Индексация недоплаты по ${basis}`,
    unallocated_recovery: 'Нераспределенное частичное погашение',
  };
  return labels[value.family] || String(value.baseLabel || 'Требование');
}

function mergeClaimSelections_(existingSelections, currentItems) {
  const prior = new Map();
  (existingSelections || []).forEach((item) => {
    if (!item || !isFivePartClaimKey_(item.key)) return;
    if (item.selected === true || item.selected === false) prior.set(item.key, item.selected);
  });
  return (currentItems || []).map((item) => {
    return Object.assign({}, item, {
      selected: prior.has(item.key) ? prior.get(item.key) : true,
    });
  });
}

const CLAIM_UNCHECKED_SELECTIONS_PROPERTY = 'CLAIM_INTAKE_UNCHECKED_SELECTIONS_V1';

function readDurableUncheckedClaimKeys_() {
  if (typeof PropertiesService === 'undefined') return new Set();
  const raw = PropertiesService.getDocumentProperties()
    .getProperty(CLAIM_UNCHECKED_SELECTIONS_PROPERTY);
  if (!raw) return new Set();
  try {
    const keys = JSON.parse(raw);
    return new Set((Array.isArray(keys) ? keys : []).filter(isFivePartClaimKey_));
  } catch (error) {
    return new Set();
  }
}

function writeDurableUncheckedClaimKeys_(keys) {
  if (typeof PropertiesService === 'undefined') return;
  const properties = PropertiesService.getDocumentProperties();
  const values = Array.from(keys || []).filter(isFivePartClaimKey_).sort();
  if (!values.length) {
    properties.deleteProperty(CLAIM_UNCHECKED_SELECTIONS_PROPERTY);
    return;
  }
  properties.setProperty(CLAIM_UNCHECKED_SELECTIONS_PROPERTY, JSON.stringify(values));
}

function isFivePartClaimKey_(key) {
  return typeof key === 'string' && key.split('|').length === 5;
}

function captureDurableClaimSelections_(existingSelections, options) {
  const unchecked = readDurableUncheckedClaimKeys_();
  (existingSelections || []).forEach((item) => {
    if (!item || !isFivePartClaimKey_(item.key)) return;
    if (item.selected === false) unchecked.add(item.key);
    if (item.selected === true) unchecked.delete(item.key);
  });
  if (!(options && options.deferPropertyWrite)) writeDurableUncheckedClaimKeys_(unchecked);
  return unchecked;
}

function readExistingClaimSelections_(sheet) {
  const layout = getClaimIntakeLayout_().claimSelections;
  const namedRange = sheet.getParent().getRangeByName(layout.namedRange);
  const extent = getClaimAuditRenderedExtent_(sheet, layout, namedRange);
  return sheet.getRange(layout.firstRow, 1, extent, layout.columnCount).getValues().reduce((items, row) => {
    const key = String(row[5] || '').trim();
    if (key) items.push({ key, selected: row[0] === true });
    return items;
  }, []);
}

function renderClaimAudit_(sheet, claimFacts, options) {
  const layout = getClaimIntakeLayout_();
  const audit = layout.claimSelections;
  const model = buildClaimAuditModel_(claimFacts);
  const prior = readExistingClaimSelections_(sheet);
  const durableUnchecked = captureDurableClaimSelections_(prior, options);
  const persistedSelections = prior.concat(Array.from(durableUnchecked, (key) => ({
    key,
    selected: false,
  })));
  const merged = mergeClaimSelections_(persistedSelections, model.groups.reduce(
    (items, group) => items.concat(group.items),
    []
  ));
  const selectedByKey = new Map(merged.map((item) => [item.key, item.selected]));
  model.groups.forEach((group) => {
    group.items.forEach((item) => { item.selected = selectedByKey.get(item.key); });
  });

  const rows = [];
  const notes = [];
  const checkboxRanges = [];
  model.groups.forEach((group) => {
    rows.push(['', `${group.label} — ${formatClaimAuditAmount_(group.total)}`, '', '', '', '']);
    notes.push(['', '', '', '', '', '']);
    const firstItemOffset = rows.length;
    group.items.forEach((item) => {
      rows.push([
        item.selected,
        item.violationLabel,
        item.periodLabel,
        item.amount,
        item.badge,
        item.key,
      ]);
      notes.push(['', buildClaimAuditDetailNote_(item), '', '', '', '']);
    });
    checkboxRanges.push({ firstItemOffset, rowCount: group.items.length });
  });
  if (!rows.length) {
    rows.push(['', 'Расчетные позиции пока не найдены', '', '', '', '']);
    notes.push(['', '', '', '', '', '']);
  }
  const spreadsheet = sheet.getParent();
  const namedRange = spreadsheet.getRangeByName(audit.namedRange);
  const previousExtent = getClaimAuditRenderedExtent_(sheet, audit, namedRange);
  ensureClaimAuditRows_(sheet, audit.firstRow + Math.max(previousExtent, rows.length) - 1);
  const clearExtent = Math.max(previousExtent, rows.length);
  const range = sheet.getRange(audit.firstRow, 1, clearExtent, audit.columnCount);
  range.clearContent();
  if (typeof range.setNotes === 'function') {
    range.setNotes(Array.from({ length: clearExtent }, () => Array(audit.columnCount).fill('')));
  }
  if (typeof range.clearDataValidations === 'function') range.clearDataValidations();
  sheet.getRange(audit.titleCell).setValue('Аудит и требования');
  sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount).setValues(rows);
  if (typeof sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount).setNotes === 'function') {
    sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount).setNotes(notes);
  }
  checkboxRanges.forEach((checkboxRange) => {
    if (!checkboxRange.rowCount) return;
    const values = rows
      .slice(checkboxRange.firstItemOffset, checkboxRange.firstItemOffset + checkboxRange.rowCount)
      .map((row) => [row[0]]);
    const target = sheet.getRange(
      audit.firstRow + checkboxRange.firstItemOffset,
      1,
      checkboxRange.rowCount,
      1
    );
    target.insertCheckboxes();
    target.setValues(values);
  });
  model.groups.reduce((offset, group) => {
    sheet.getRange(audit.firstRow + offset, 2, 1, 4)
      .setBackground('#E8F0FE')
      .setFontWeight('bold');
    return offset + group.items.length + 1;
  }, 0);
  sheet.getRange(audit.firstRow, 2, rows.length, 4).setWrap(true);
  sheet.getRange(audit.firstRow, 4, rows.length, 1).setNumberFormat('#,##0.00');
  spreadsheet.setNamedRange(
    audit.namedRange,
    sheet.getRange(audit.firstRow, 1, rows.length, audit.columnCount)
  );
  if (typeof sheet.hideColumns === 'function') sheet.hideColumns(6);
  model.durableUncheckedClaimKeys = Array.from(durableUnchecked);
  return model;
}

function buildClaimAuditDetailNote_(item) {
  const details = item && item.auditDetails || [];
  if (!details.length) return '';
  return details.map((detail) => {
    if (!detail || detail.kind !== 'premium_payment_delay') return '';
    const dates = [
      detail.dueDate ? `срок: ${formatDate_(parseDateValue_(detail.dueDate))}` : '',
      detail.actualPaymentDate ? `выплачено: ${formatDate_(parseDateValue_(detail.actualPaymentDate))}` : '',
      Number.isFinite(Number(detail.delayDays)) ? `задержка: ${detail.delayDays} дн.` : '',
    ].filter(Boolean).join('; ');
    const amount = Number.isFinite(Number(detail.premiumAmount))
      ? `сумма премии: ${formatClaimAuditAmount_(detail.premiumAmount)}` : '';
    const liability = Number.isFinite(Number(detail.liabilityAmount))
      ? `ст. 236 ТК РФ: ${formatClaimAuditAmount_(detail.liabilityAmount)}` : '';
    const source = detail.sourceRef ? `источник: ${detail.sourceRef}` : '';
    const assumptions = detail.assumptions && detail.assumptions.length
      ? `допущения: ${detail.assumptions.join(' ')}` : '';
    return [amount, dates, liability, source, assumptions].filter(Boolean).join('\n');
  }).filter(Boolean).join('\n\n');
}

function ensureClaimAuditRows_(sheet, requiredLastRow) {
  if (typeof sheet.getMaxRows !== 'function' || typeof sheet.insertRowsAfter !== 'function') return;
  const maxRows = sheet.getMaxRows();
  if (requiredLastRow > maxRows) sheet.insertRowsAfter(maxRows, requiredLastRow - maxRows);
}

function getClaimAuditRenderedExtent_(sheet, audit, namedRange) {
  if (namedRange
    && namedRange.getSheet().getSheetId() === sheet.getSheetId()
    && namedRange.getRow() === audit.firstRow
    && namedRange.getColumn() === 1
    && namedRange.getNumColumns() === audit.columnCount
    && namedRange.getNumRows() > 0) {
    return namedRange.getNumRows();
  }
  return 1;
}

function roundClaimAuditMoney_(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatClaimAuditAmount_(value) {
  const fixed = Number(value || 0).toFixed(2).replace('.', ',');
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatClaimIntakeSheet_(sheet, layout, created) {
  sheet.setFrozenRows(2);
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 340);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(7, 170);
  sheet.setColumnWidth(8, 360);
  sheet.setColumnWidth(9, 130);
  sheet.getRange(1, 1, 1, 2)
    .setBackground('#E8F0FE')
    .setFontColor('#202124')
    .setFontSize(16)
    .setFontWeight('bold');
  sheet.getRange(layout.partialRecoveries.headerRow, 1, 1, 4)
    .setBackground('#E8F0FE')
    .setFontWeight('bold')
    .setWrap(true);
  if (created) {
    sheet.getRange(layout.partialRecoveries.firstRow, 1, layout.partialRecoveries.rowCount, 4)
      .setBackgrounds(Array.from(
        { length: layout.partialRecoveries.rowCount },
        () => Array(4).fill('#FFFFFF')
      ));
  }
}

function registerClaimIntakeNamedRanges_(spreadsheet, sheet, layout) {
  [
    layout.employerSector,
    layout.employmentStartDate,
    layout.questionnaireFacts.employmentEndDate,
    layout.questionnaireFacts.workSchedule,
    layout.questionnaireFacts.actualPaymentFacts,
    layout.calculatedAverage,
    layout.calculatedAverageContext,
    layout.manualAverageEnabled,
    layout.manualAverage,
    layout.manualAverageContext,
    layout.manualAverageSource,
    layout.finalAverageScenario,
  ].forEach((field) => {
    spreadsheet.setNamedRange(field.namedRange, sheet.getRange(field.valueCell));
  });
  spreadsheet.setNamedRange(
    layout.employmentStartDate.sourceNamedRange,
    sheet.getRange(layout.employmentStartDate.sourceCell)
  );
  spreadsheet.setNamedRange(
    layout.employmentStartDate.statusNamedRange,
    sheet.getRange(layout.employmentStartDate.statusCell)
  );
  spreadsheet.setNamedRange(
    layout.partialRecoveries.namedRange,
    sheet.getRange(
      layout.partialRecoveries.firstRow, 1,
      layout.partialRecoveries.rowCount, layout.partialRecoveries.columnCount
    )
  );
  const historyExtent = getClaimDocsHistoryExtent_(
    sheet, layout.docsHistory, spreadsheet.getRangeByName(layout.docsHistory.namedRange)
  );
  spreadsheet.setNamedRange(
    layout.docsHistory.namedRange,
    sheet.getRange(
      layout.docsHistory.firstRow, layout.docsHistory.firstColumn,
      historyExtent, layout.docsHistory.columnCount
    )
  );
  const existingAuditRange = spreadsheet.getRangeByName(layout.claimSelections.namedRange);
  let auditExtent;
  if (isLegacyClaimAuditRange_(sheet, layout.claimSelections, existingAuditRange)) {
    const legacySelections = existingAuditRange.getValues().reduce((items, row) => {
      const key = String(row[4] || '').trim();
      if (isFivePartClaimKey_(key)) items.push({ key, selected: row[0] === true });
      return items;
    }, []);
    captureDurableClaimSelections_(legacySelections);
    auditExtent = existingAuditRange.getNumRows();
  } else {
    auditExtent = getClaimAuditRenderedExtent_(
      sheet, layout.claimSelections, existingAuditRange
    );
  }
  spreadsheet.setNamedRange(
    layout.claimSelections.namedRange,
    sheet.getRange(
      layout.claimSelections.firstRow,
      1,
      auditExtent,
      layout.claimSelections.columnCount
    )
  );
}

function isLegacyClaimAuditRange_(sheet, audit, range) {
  return Boolean(range
    && range.getSheet().getSheetId() === sheet.getSheetId()
    && range.getRow() === audit.firstRow
    && range.getColumn() === 1
    && range.getNumColumns() === 5
    && range.getNumRows() > 0);
}

function readAverageEarningsState_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return {
    calculated: {
      amount: target.getRangeByName(layout.calculatedAverage.namedRange).getValue(),
      context: target.getRangeByName(layout.calculatedAverageContext.namedRange).getValue(),
    },
    user: {
      amount: target.getRangeByName(layout.manualAverage.namedRange).getValue(),
      context: target.getRangeByName(layout.manualAverageContext.namedRange).getValue(),
    },
    selectedSource: normalizeAverageEarningsSource_(
      target.getRangeByName(layout.finalAverageScenario.namedRange).getValue()
    ),
  };
}

function syncCalculatedAverageEarningsFromDescriptors_(spreadsheet, descriptors) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const candidate = findCalculatedAverageEarningsFromDescriptors_(descriptors);
  if (!candidate) return null;
  const layout = getClaimIntakeLayout_();
  const sheet = ensureClaimIntakeSheet_(target);
  sheet.getRange(layout.calculatedAverage.valueCell)
    .setValue(candidate.amount)
    .setNumberFormat('#,##0.00');
  sheet.getRange(layout.calculatedAverageContext.valueCell).setValue(candidate.context);
  return candidate;
}

function findCalculatedAverageEarningsFromDescriptors_(descriptors) {
  let latest = null;
  (descriptors || []).forEach((descriptor) => {
    const layout = descriptor && descriptor.layout || {};
    const columns = descriptor && descriptor.semanticColumns || {};
    const sheet = descriptor && descriptor.sheet;
    if (!sheet || layout.id !== 'vacation' || !Number.isInteger(columns.averageDailyEarning)) {
      return;
    }
    const rowCount = Math.max(0, sheet.getLastRow() - descriptor.headerRow);
    if (!rowCount) return;
    const values = sheet.getRange(
      descriptor.headerRow + 1, 1, rowCount, sheet.getLastColumn()
    ).getDisplayValues();
    for (let rowIndex = values.length - 1; rowIndex >= 0; rowIndex--) {
      const annualSalary = Number.isInteger(columns.correctAnnualSalary)
        ? parseClaimPositiveAmount_(values[rowIndex][columns.correctAnnualSalary])
        : null;
      const divisor = Number.isInteger(columns.annualSalaryDivisor)
        ? parseClaimPositiveAmount_(values[rowIndex][columns.annualSalaryDivisor])
        : null;
      const amount = annualSalary !== null && divisor !== null
        ? roundMoney_(annualSalary / divisor)
        : parseClaimPositiveAmount_(values[rowIndex][columns.averageDailyEarning]);
      if (amount === null) continue;
      latest = {
        amount,
        context: buildCalculatedAverageEarningsContext_(
          sheet, values[rowIndex], columns, descriptor.headerRow + rowIndex + 1
        ),
        source: {
          sheetName: sheet.getName(),
          row: descriptor.headerRow + rowIndex + 1,
          adapterId: layout.id,
        },
      };
      break;
    }
  });
  return latest;
}

function buildCalculatedAverageEarningsContext_(sheet, row, columns, sheetRow) {
  const firstDisplayValue = (semantics) => {
    for (let index = 0; index < semantics.length; index++) {
      const column = columns[semantics[index]];
      if (!Number.isInteger(column)) continue;
      const value = String(row[column] || '').trim();
      if (value) return value;
    }
    return '';
  };
  let period = firstDisplayValue(['vacationStartDate', 'paymentDate', 'period']);
  if (!period && Number.isInteger(columns.year) && Number.isInteger(columns.month)) {
    const year = String(row[columns.year] || '').trim();
    const month = String(row[columns.month] || '').trim();
    period = [month, year].filter(Boolean).join('.');
  }
  const source = sheet && sheet.getName ? sheet.getName() : `строка ${sheetRow}`;
  return period ? `${period} · ${source}` : source;
}

function normalizeAverageEarningsStateForWrite_(state) {
  const value = state || {};
  const calculated = value.calculated || {};
  const user = value.user || {};
  const selected = normalizeAverageEarningsSource_(value.selectedSource);
  if (selected !== 'calculated' && selected !== 'user') {
    throw new Error('Неизвестный источник среднего заработка');
  }
  [calculated, user].forEach((scenario) => {
    if (scenario.amount !== undefined
      && typeof scenario.amount !== 'number'
      && typeof scenario.amount !== 'string') {
      throw new Error('Средний заработок должен быть числом');
    }
    if (scenario.context !== undefined
      && scenario.context !== null
      && typeof scenario.context !== 'string') {
      throw new Error('Контекст среднего заработка должен быть строкой');
    }
  });
  const selectedScenario = selected === 'user' ? user : calculated;
  if (parseClaimPositiveAmount_(selectedScenario.amount) === null) {
    throw new Error('Укажите положительный средний заработок для выбранного сценария');
  }
  return {
    calculatedAmount: calculated.amount === undefined ? '' : calculated.amount,
    calculatedContext: calculated.context || '',
    userAmount: user.amount === undefined ? '' : user.amount,
    userContext: user.context || '',
    selectedSource: selected,
    selectedScenario: selected === 'user'
      ? CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[1]
      : CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0],
  };
}

function writeAverageEarningsState_(state, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  writeClaimQuestionnaireState_({ averageEarnings: state }, target);
}

function normalizeAverageEarningsSource_(value) {
  const normalized = String(value || '').trim();
  if (normalized === 'user' || normalized === CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[1]) {
    return 'user';
  }
  if (
    normalized === 'calculated'
    || normalized === CLAIM_INTAKE_SETTINGS.AVERAGE_SCENARIO_VALUES[0]
  ) {
    return 'calculated';
  }
  return normalized;
}

function resolveSelectedAverageEarnings_(state) {
  const value = state || {};
  const source = normalizeAverageEarningsSource_(value.selectedSource);
  if (source !== 'calculated' && source !== 'user') {
    return {
      valid: false,
      source: source || null,
      amount: null,
      context: '',
      error: source
        ? 'Неизвестный источник среднего заработка'
        : 'Источник среднего заработка не выбран',
    };
  }
  const scenario = source === 'user' ? value.user : value.calculated;
  const amount = parseClaimPositiveAmount_(scenario && scenario.amount);
  const context = scenario && scenario.context ? String(scenario.context) : '';
  if (amount === null) {
    return {
      valid: false,
      source,
      amount: null,
      context,
      error: 'Укажите положительный средний заработок для выбранного сценария',
    };
  }
  return { source, amount, context };
}

function captureClaimQuestionnaireState_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const employmentStartValue = target.getRangeByName(layout.employmentStartDate.namedRange).getValue();
  const employmentEndValue = target.getRangeByName(
    layout.questionnaireFacts.employmentEndDate.namedRange
  ).getValue();
  const workScheduleValue = target.getRangeByName(
    layout.questionnaireFacts.workSchedule.namedRange
  ).getValue();
  const actualPaymentFactsValue = target.getRangeByName(
    layout.questionnaireFacts.actualPaymentFacts.namedRange
  ).getValue();
  return {
    employerSector: target.getRangeByName(layout.employerSector.namedRange).getValue(),
    employmentStartDate: employmentStartValue || null,
    employmentStartFact: employmentStartValue
      ? createEmploymentAuditFact_(employmentStartValue, {
        sourceType: employmentAuditSourceTypeFromDisplay_(
          target.getRangeByName(layout.employmentStartDate.sourceNamedRange).getValue()
        ),
        sourceRef: `${layout.sheetName}!${layout.employmentStartDate.valueCell}`,
        verificationStatus: employmentAuditStatusFromDisplay_(
          target.getRangeByName(layout.employmentStartDate.statusNamedRange).getValue()
        ),
        confidence: 1,
      })
      : null,
    manualAverageEnabled: target.getRangeByName(layout.manualAverageEnabled.namedRange).getValue() === true,
    averageEarnings: readAverageEarningsState_(target),
    partialRecoveries: target.getRangeByName(layout.partialRecoveries.namedRange).getValues(),
    employmentEndDate: employmentEndValue || null,
    workSchedule: String(workScheduleValue || '').trim(),
    actualPaymentFacts: String(actualPaymentFactsValue || '').trim(),
  };
}

function buildQuestionnaireAuditCatalog_(questionnaireState, rows, options) {
  const state = questionnaireState || {};
  const settings = options || {};
  const items = [];
  const start = parseDateValue_(state.employmentStartDate);
  const end = parseDateValue_(state.employmentEndDate);
  if (start && end && end < start) {
    items.push(createPayrollAuditCatalogResult_('questionnaire_termination', {
      layoutId: 'questionnaire', baseKind: 'employment_boundary', periodKey: 'case',
      calculationItem: 'termination_before_start', status: 'probable_or_disputed',
      evidence: [{ source: 'Анкета и требования!B4' }, { source: 'Анкета и требования!H3' }],
      reason: 'Дата увольнения раньше даты начала трудовых отношений.',
      question: 'Проверьте даты приема и увольнения в анкете.',
    }));
  }
  (rows || []).forEach((row, index) => {
    const periodKey = buildPayrollAuditPeriodKey_(row && row.period) || 'unknown';
    const periodStart = row && row.period ? new Date(row.period.year, row.period.month - 1, 1) : null;
    const periodEnd = row && row.period ? new Date(row.period.year, row.period.month, 0) : null;
    const evidence = [buildPayrollAuditSourceEvidence_(row, index)];
    if (start && periodEnd && periodEnd < start) {
      items.push(createPayrollAuditCatalogResult_('employment_start_boundary', {
        layoutId: 'raw_payroll', baseKind: 'before_employment', periodKey,
        calculationItem: `questionnaire_boundary_${index + 1}`, status: 'informational', evidence,
        reason: 'Период находится до подтвержденной даты начала трудовых отношений и исключен из применимого аудита.',
      }));
    }
    if (end && periodStart && periodStart > end) {
      items.push(createPayrollAuditCatalogResult_('questionnaire_termination', {
        layoutId: 'raw_payroll', baseKind: 'after_termination', periodKey,
        calculationItem: `questionnaire_after_end_${index + 1}`, status: 'probable_or_disputed', evidence,
        reason: 'Период находится после подтвержденной даты увольнения.',
        question: 'Подтвердите дату увольнения или объясните начисление после нее.',
      }));
    }
    if (payrollAuditSectionKind_(row) === 'paid' && !row.paymentDate && !row.statementDate
      && !String(state.actualPaymentFacts || '').trim()) {
      items.push(createPayrollAuditCatalogResult_('questionnaire_payment_facts', {
        layoutId: 'raw_payroll', baseKind: 'actual_payment_date', periodKey,
        calculationItem: 'user_payment_date', status: 'cannot_verify', evidence,
        reason: 'Расчетный листок не содержит подтвержденной фактической даты выплаты.',
        question: `Укажите фактическую дату выплаты за ${periodKey}.`,
        requestedDocument: 'Банковская выписка или платежный реестр.',
      }));
    }
  });
  const recoveries = Array.isArray(state.partialRecoveries) ? state.partialRecoveries : [];
  recoveries.forEach((row, index) => {
    if (!Array.isArray(row) || row[0] !== true) return;
    const date = parseDateValue_(row[1]);
    const amount = parseMoney_(row[2]);
    if (!date || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      items.push(createPayrollAuditCatalogResult_('questionnaire_partial_recoveries', {
        layoutId: 'questionnaire', baseKind: 'partial_recovery', periodKey: 'case',
        calculationItem: `invalid_recovery_${index + 1}`, status: 'cannot_verify',
        evidence: [{ source: `Анкета и требования!${14 + index}:C${14 + index}` }],
        reason: 'Отмеченное частичное погашение не содержит понятных даты и суммы.',
        question: 'Укажите дату и сумму каждого частичного погашения.',
        requestedDocument: 'Судебный акт, платежное поручение или банковская выписка.',
      }));
    }
  });
  if (!String(state.workSchedule || '').trim()
    && (rows || []).some((row) => row && (row.workDays !== null || row.paidDays !== null))) {
    items.push(createPayrollAuditCatalogResult_('questionnaire_work_time', {
      layoutId: 'questionnaire', baseKind: 'work_schedule', periodKey: 'case',
      calculationItem: 'missing_work_schedule', status: 'cannot_verify',
      evidence: [{ source: 'Анкета и требования!H4' }],
      reason: 'В расчетных листках есть дни работы, но режим и норма рабочего времени не указаны.',
      question: 'Какой режим работы и норма часов действовали в спорные периоды?',
      requestedDocument: 'Трудовой договор, ЛНА и табель учета рабочего времени.',
    }));
  }
  return items;
}

function buildNormativeDocumentAuditCatalog_(normativeImport, rows, options) {
  const value = normativeImport || {};
  const settings = options || {};
  if (value.status === 'disabled') return [];
  if (!value.facts) {
    return [createPayrollAuditCatalogResult_('normative_remuneration', {
      layoutId: 'normative', baseKind: 'documents', periodKey: 'case',
      calculationItem: 'normative_sources_missing', status: 'cannot_verify',
      evidence: [], reason: 'Договор и ЛНА не подключены или недоступны.',
      question: 'Укажите папку с трудовым договором, допсоглашениями и ЛНА.',
      requestedDocument: 'Папка Google Drive с нормативными документами.',
    })];
  }
  const facts = value.facts;
  const items = [];
  const evidenceFromFacts = (list) => (list || []).map((fact) => ({
    source: fact.sourceRef || fact.source || '', fragment: fact.fragment || fact.notes || '',
  }));
  if (!(facts.remunerationElements || []).length) {
    items.push(createPayrollAuditCatalogResult_('normative_remuneration', {
      layoutId: 'normative', baseKind: 'remuneration_system', periodKey: 'case',
      calculationItem: 'remuneration_elements_missing', status: 'cannot_verify', evidence: [],
      reason: 'В подключенных документах не найден состав системы оплаты труда.',
      question: 'Какие выплаты входят в систему оплаты труда?',
      requestedDocument: 'Трудовой договор и ЛНА об оплате труда.',
    }));
  } else {
    items.push(createPayrollAuditCatalogResult_('normative_remuneration', {
      layoutId: 'normative', baseKind: 'remuneration_system', periodKey: 'case',
      calculationItem: 'remuneration_elements_found', status: 'informational',
      evidence: evidenceFromFacts(facts.remunerationElements),
      reason: `Извлечено элементов системы оплаты труда: ${(facts.remunerationElements || []).length}.`,
    }));
  }
  const premiums = facts.premiumMentions || [];
  if (!premiums.length) {
    items.push(createPayrollAuditCatalogResult_('normative_premium', {
      layoutId: 'normative', baseKind: 'premium', periodKey: 'case',
      calculationItem: 'premium_rule_missing', status: 'cannot_verify', evidence: [],
      reason: 'Правила классификации и сроков премий не извлечены.',
      question: 'Есть ли в договоре или ЛНА правила начисления и выплаты премий?',
      requestedDocument: 'Положение о премировании или иной ЛНА.',
    }));
  } else premiums.forEach((premium, index) => {
    const classification = premium.classification && premium.classification.kind;
    const dueRule = premium.dueRule;
    const status = classification === 'disputed' || !dueRule ? 'probable_or_disputed' : 'informational';
    items.push(createPayrollAuditCatalogResult_('normative_premium', {
      layoutId: 'normative', baseKind: 'premium', periodKey: 'case',
      calculationItem: `premium_rule_${index + 1}`, status,
      evidence: evidenceFromFacts([premium]),
      reason: !dueRule ? 'Срок выплаты премии не установлен однозначно.'
        : (classification === 'disputed' ? 'Правовая природа премии остается спорной.' : 'Правило премии извлечено из документов.'),
      question: !dueRule ? 'Какой срок выплаты установлен для этой премии?' : '',
      requestedDocument: !dueRule ? 'Положение о премировании.' : '',
    }));
  });
  const workFacts = facts.workingTimeFacts || [];
  if (!workFacts.length) {
    items.push(createPayrollAuditCatalogResult_('normative_enhanced_work', {
      layoutId: 'normative', baseKind: 'work_schedule', periodKey: 'case',
      calculationItem: 'work_schedule_missing', status: 'cannot_verify', evidence: [],
      reason: 'В договоре/ЛНА не найдены применимые режим и норма рабочего времени.',
      question: 'Какой график, норма часов и условия работы действовали?',
      requestedDocument: 'Трудовой договор, ЛНА и табель.',
    }));
  }
  const derivativeRows = (rows || []).filter((row) =>
    /отпуск|больнич|средн.*заработ|командиров|пособи/.test(normalizeText_(`${row.category || ''} ${row.kind || ''}`)));
  if (derivativeRows.length) {
    items.push(createPayrollAuditCatalogResult_('normative_derivative_payments', {
      layoutId: 'raw_payroll', baseKind: 'derivative_payment', periodKey: 'case',
      calculationItem: 'derivative_base_review', status: 'probable_or_disputed',
      evidence: derivativeRows.slice(0, 50).map((row, index) => buildPayrollAuditSourceEvidence_(row, index)),
      reason: 'В расчетных листках есть производные выплаты; при изменении базы их нужно пересчитать отдельно.',
      question: 'Проверьте расчет производных выплат после уточнения базы.',
      requestedDocument: 'Расчетные листки и ЛНА, определяющие базу производных выплат.',
    }));
  }
  const searchableText = JSON.stringify(facts).toLowerCase();
  [
    ['normative_regional_coefficient', 'regional_coefficient', /районн|северн|коэффициент/,
      'Применимость районного коэффициента и северной надбавки не подтверждена.', 'ЛНА о районных коэффициентах и месте работы.'],
    ['normative_wage_indexation', 'wage_indexation', /индексац/,
      'Правила индексации заработной платы требуют отдельной проверки по ЛНА.', 'ЛНА об индексации заработной платы.'],
    ['normative_vacation_entitlement', 'vacation_entitlement', /отпускн|ежегодн.*отпуск/,
      'Отпускной стаж и повышенная продолжительность отпуска требуют кадровых документов.', 'Трудовой договор, график отпусков и кадровые документы.'],
    ['normative_enhanced_guarantees', 'enhanced_guarantees', /ночн|выходн|празднич|вредн|гаранти/,
      'Повышенные гарантии за ночную, выходную или особую работу требуют подтверждения.', 'Трудовой договор, ЛНА и табель.'],
  ].forEach(([ruleId, baseKind, pattern, reason, requestedDocument]) => {
    const found = pattern.test(searchableText);
    items.push(createPayrollAuditCatalogResult_(ruleId, {
      layoutId: 'normative', baseKind, periodKey: 'case',
      calculationItem: `${baseKind}_review`, status: found ? 'probable_or_disputed' : 'cannot_verify',
      evidence: value.documents ? value.documents.map((doc) => ({ source: doc.url || doc.name })) : [],
      reason: found ? reason : `В подключенных документах не найдено подтверждение: ${baseKind}.`,
      question: found ? 'Подтвердите применимое правило и период его действия.'
        : 'Есть ли специальное правило для этого вида гарантии?',
      requestedDocument,
    }));
  });
  return items;
}

function payrollAuditCatalogToWarnings_(items) {
  return (items || []).filter((item) => item && item.status !== 'informational').map((item) => ({
    code: `payroll_audit_${item.ruleId}`,
    disputed: item.disputed === true,
    source: (item.evidence && item.evidence[0] && (item.evidence[0].source || item.evidence[0].sourceRef)) || item.id,
    reason: `${item.reason || 'Проверка требует внимания.'}`
      + (item.question ? ` Вопрос: ${item.question}` : '')
      + (item.requestedDocument ? ` Запрос: ${item.requestedDocument}` : ''),
    auditResult: item,
    reviewStatus: item.status === 'cannot_verify' ? 'нужно уточнить' : 'требует проверки',
  }));
}

function readClaimQuestionnaireState_(spreadsheet) {
  return captureClaimQuestionnaireState_(spreadsheet);
}

function normalizeClaimQuestionnaireStateForWrite_(state, layout) {
  const value = state || {};
  const normalized = {};
  if (value.employerSector !== undefined) {
    if (CLAIM_INTAKE_SETTINGS.SECTOR_VALUES.indexOf(value.employerSector) < 0) {
      throw new Error('Неизвестный сектор работодателя');
    }
    normalized.employerSector = value.employerSector;
  }
  if (value.employmentStartDate !== undefined || value.employmentStartFact !== undefined) {
    const sourceFact = value.employmentStartFact || createEmploymentAuditFact_(
      value.employmentStartDate,
      { sourceType: 'user_confirmed', verificationStatus: 'confirmed', confidence: 1 }
    );
    const parsedDate = parseDateValue_(sourceFact.value);
    if (!parsedDate) {
      throw new Error('Дата начала трудовых отношений должна быть понятной датой');
    }
    normalized.employmentStartFact = createEmploymentAuditFact_(parsedDate, sourceFact);
  }
  if (value.manualAverageEnabled !== undefined) {
    if (typeof value.manualAverageEnabled !== 'boolean') {
      throw new Error('Признак ручного среднего заработка должен быть логическим значением');
    }
    normalized.manualAverageEnabled = value.manualAverageEnabled;
  }
  if (value.averageEarnings !== undefined) {
    normalized.averageEarnings = normalizeAverageEarningsStateForWrite_(value.averageEarnings);
  }
  if (value.partialRecoveries !== undefined) {
    if (!Array.isArray(value.partialRecoveries)) {
      throw new Error('Частичные погашения должны быть массивом строк');
    }
    normalized.partialRecoveries = value.partialRecoveries
      .slice(0, layout.partialRecoveries.rowCount)
      .map((row) => {
        if (!Array.isArray(row)) {
          throw new Error('Каждая строка частичного погашения должна быть массивом');
        }
        const result = row.slice(0, layout.partialRecoveries.columnCount);
        while (result.length < layout.partialRecoveries.columnCount) result.push('');
        return result;
      });
    while (normalized.partialRecoveries.length < layout.partialRecoveries.rowCount) {
      normalized.partialRecoveries.push(['', '', '', '']);
    }
  }
  if (value.employmentEndDate !== undefined) {
    const parsedEndDate = value.employmentEndDate === null || value.employmentEndDate === ''
      ? null : parseDateValue_(value.employmentEndDate);
    if (value.employmentEndDate && !parsedEndDate) {
      throw new Error('Дата увольнения должна быть понятной датой');
    }
    normalized.employmentEndDate = parsedEndDate;
  }
  if (value.workSchedule !== undefined) normalized.workSchedule = String(value.workSchedule || '');
  if (value.actualPaymentFacts !== undefined) {
    normalized.actualPaymentFacts = String(value.actualPaymentFacts || '');
  }
  return normalized;
}

function employmentAuditSourceTypeFromDisplay_(value) {
  const normalized = normalizeText_(value);
  if (normalized.indexOf('документ') >= 0) return 'document_confirmed';
  if (normalized.indexOf('расчет') >= 0 || normalized.indexOf('расчёт') >= 0) return 'payroll_slip';
  if (normalized.indexOf('допущ') >= 0) return 'calculated_assumption';
  return 'user_confirmed';
}

function employmentAuditStatusFromDisplay_(value) {
  const normalized = normalizeText_(value);
  if (normalized.indexOf('не удалось') >= 0 || normalized.indexOf('невозможно') >= 0) return 'cannot_verify';
  if (normalized.indexOf('спор') >= 0 || normalized.indexOf('предполож') >= 0) return 'probable_or_disputed';
  if (normalized.indexOf('сведен') >= 0) return 'informational';
  return 'confirmed';
}

function getClaimIntakeMutationLock_() {
  return LockService.getDocumentLock() || LockService.getScriptLock();
}

function withClaimIntakeMutationLock_(callback, options) {
  const settings = options || {};
  if (settings.lockHeld) return callback();
  const lock = getClaimIntakeMutationLock_();
  if (!lock || !lock.tryLock(5000)) {
    throw new Error('Анкета занята другим процессом; повторите попытку');
  }
  let result;
  let operationError = null;
  try {
    result = callback();
  } catch (error) {
    operationError = error;
  }
  try {
    SpreadsheetApp.flush();
  } catch (error) {
    if (typeof settings.onFlushError === 'function') {
      try {
        settings.onFlushError(error);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        // Preserve the original flush error while still releasing the lock.
      }
    }
    if (!operationError) operationError = error;
  } finally {
    lock.releaseLock();
  }
  if (operationError) throw operationError;
  return result;
}

function writeClaimQuestionnaireState_(state, spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const normalized = normalizeClaimQuestionnaireStateForWrite_(state, layout);
  const lockOptions = {};
  let rollback = null;
  lockOptions.onFlushError = () => {
    if (rollback) rollback();
  };
  return withClaimIntakeMutationLock_(() => {
    const sheet = target.getSheetByName(layout.sheetName) || ensureClaimIntakeSheet_(target);
    const mutations = [];
    if (normalized.employerSector !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.employerSector.valueCell),
        values: [[normalized.employerSector]],
      });
    }
    if (normalized.employmentStartFact) {
      const fact = normalized.employmentStartFact;
      mutations.push({
        range: sheet.getRange(layout.employmentStartDate.valueCell),
        values: [[fact.value]],
      }, {
        range: sheet.getRange(layout.employmentStartDate.sourceCell),
        values: [[formatEmploymentAuditFactSource_(fact)]],
      }, {
        range: sheet.getRange(layout.employmentStartDate.statusCell),
        values: [[formatEmploymentAuditFactStatus_(fact)]],
      });
    }
    if (normalized.manualAverageEnabled !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.manualAverageEnabled.valueCell),
        values: [[normalized.manualAverageEnabled]],
      });
    }
    if (normalized.averageEarnings) {
      mutations.push(
        {
          range: sheet.getRange(6, 2, 1, 2),
          values: [[
            normalized.averageEarnings.calculatedAmount,
            normalized.averageEarnings.calculatedContext,
          ]],
        },
        {
          range: sheet.getRange(8, 2, 1, 2),
          values: [[
            normalized.averageEarnings.userAmount,
            normalized.averageEarnings.userContext,
          ]],
        },
        {
          range: sheet.getRange(layout.finalAverageScenario.valueCell),
          values: [[normalized.averageEarnings.selectedScenario]],
        }
      );
    }
    if (normalized.partialRecoveries) {
      mutations.push({
        range: sheet.getRange(
          layout.partialRecoveries.firstRow,
          1,
          layout.partialRecoveries.rowCount,
          layout.partialRecoveries.columnCount
        ),
        values: normalized.partialRecoveries,
      });
    }
    if (normalized.employmentEndDate !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.questionnaireFacts.employmentEndDate.valueCell),
        values: [[normalized.employmentEndDate]],
      });
    }
    if (normalized.workSchedule !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.questionnaireFacts.workSchedule.valueCell),
        values: [[normalized.workSchedule]],
      });
    }
    if (normalized.actualPaymentFacts !== undefined) {
      mutations.push({
        range: sheet.getRange(layout.questionnaireFacts.actualPaymentFacts.valueCell),
        values: [[normalized.actualPaymentFacts]],
      });
    }
    const snapshots = mutations.map((mutation) => mutation.range.getValues());
    rollback = () => {
      for (let index = mutations.length - 1; index >= 0; index--) {
        mutations[index].range.setValues(snapshots[index]);
      }
    };
    try {
      mutations.forEach((mutation) => mutation.range.setValues(mutation.values));
      return captureClaimQuestionnaireState_(target);
    } catch (error) {
      rollback();
      throw error;
    }
  }, lockOptions);
}

function formatEmploymentAuditFactSource_(fact) {
  const labels = {
    user_confirmed: 'источник: пользователь',
    document_confirmed: 'источник: документ',
    payroll_slip: 'источник: расчетные листы',
    calculated_assumption: 'источник: допущение',
  };
  return labels[fact && fact.sourceType] || 'источник: не указан';
}

function formatEmploymentAuditFactStatus_(fact) {
  const labels = {
    confirmed: 'подтверждено',
    probable_or_disputed: 'спорное',
    cannot_verify: 'нужно уточнить',
    informational: 'к сведению',
  };
  return labels[fact && fact.verificationStatus] || 'нужно уточнить';
}

function addClaimPartialRecovery(options) {
  const settings = options || {};
  const spreadsheet = settings.spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return withClaimIntakeMutationLock_(() => {
    const sheet = settings.sheet
      || spreadsheet.getSheetByName(layout.sheetName)
      || ensureClaimIntakeSheet_(spreadsheet);
    const rows = sheet.getRange(
      layout.partialRecoveries.firstRow,
      1,
      layout.partialRecoveries.rowCount,
      layout.partialRecoveries.columnCount
    ).getValues();
    const emptyIndex = rows.findIndex((row) => !row[0] && row.slice(1).every(isClaimIntakeEmpty_));
    if (emptyIndex < 0) {
      const error = 'Нет свободных строк для частичных погашений';
      spreadsheet.toast(error, 'Анкета и требования');
      return { added: false, error };
    }
    const row = layout.partialRecoveries.firstRow + emptyIndex;
    sheet.getRange(row, 1).setValue(true);
    return { added: true, row };
  }, settings);
}

function onEdit(e) {
  if (!e || !e.range) return { handled: false };
  const editedRange = e.range;
  const sheet = editedRange.getSheet();
  const layout = getClaimIntakeLayout_();
  if (!sheet || sheet.getName() !== layout.sheetName) return { handled: false };

  const row = editedRange.getRow();
  const column = editedRange.getColumn();
  const rowCount = editedRange.getNumRows();
  const columnCount = editedRange.getNumColumns();
  const editedLastRow = row + rowCount - 1;
  const editedLastColumn = column + columnCount - 1;
  const actionControl = sheet.getRange(layout.partialRecoveries.actionControlCell);
  const actionRow = actionControl.getRow();
  const actionColumn = actionControl.getColumn();
  const touchesAction = row <= actionRow
    && editedLastRow >= actionRow
    && column <= actionColumn
    && editedLastColumn >= actionColumn;
  const exactAction = row === actionRow
    && column === actionColumn
    && rowCount === 1
    && columnCount === 1;
  const recoveriesFirstRow = layout.partialRecoveries.firstRow;
  const recoveriesLastRow = recoveriesFirstRow + layout.partialRecoveries.rowCount - 1;
  const touchesRecoveryInputs = row <= recoveriesLastRow
    && editedLastRow >= recoveriesFirstRow
    && column <= 4
    && editedLastColumn >= 1;
  if (!touchesAction && !touchesRecoveryInputs) return { handled: false };

  const spreadsheet = e.source || sheet.getParent();
  return withClaimIntakeMutationLock_(() => {
    if (touchesAction && !exactAction && actionControl.getValue() === true) {
      actionControl.setValue(false);
    }
    if (exactAction) {
      const checked = (e.value === 'TRUE' || e.value === true)
        && actionControl.getValue() === true;
      if (!checked) {
        if (actionControl.getValue() === true) actionControl.setValue(false);
        return { handled: false };
      }
      try {
        return {
          handled: true,
          type: 'add',
          result: addClaimPartialRecovery({ spreadsheet, sheet, lockHeld: true }),
        };
      } finally {
        actionControl.setValue(false);
      }
    }
    if (touchesRecoveryInputs) {
      return {
        handled: true,
        type: 'validate_partial_recoveries',
        result: validateClaimPartialRecoveries_(spreadsheet, {
          spreadsheet,
          sheet,
          lockHeld: true,
        }),
      };
    }
    return { handled: true, type: 'ignored_action_paste' };
  }, { spreadsheet, sheet });
}

function isClaimIntakeEmpty_(value) {
  return value === '' || value === null || value === undefined;
}

function normalizePartialRecoveries_(rows) {
  const result = { valid: [], invalid: [], unallocated: [] };
  (rows || []).forEach((row, rowIndex) => {
    const values = Array.isArray(row)
      ? row
      : [row && row.active, row && row.date, row && row.amount, row && row.allocation];
    if (values[0] !== true) return;
    const date = parseClaimRecoveryDate_(values[1]);
    const amount = parseClaimPositiveAmount_(values[2]);
    const allocation = String(values[3] || '').trim();
    const errors = [];
    if (!date) errors.push('Некорректная дата частичного погашения');
    if (amount === null) errors.push('Сумма частичного погашения должна быть положительным числом');
    const normalized = { rowIndex, date, amount, allocation, row: values };
    if (errors.length) {
      normalized.errors = errors;
      result.invalid.push(normalized);
    } else if (!allocation) {
      normalized.disputed = true;
      result.unallocated.push(normalized);
    } else {
      result.valid.push(normalized);
    }
  });
  return result;
}

function parseClaimRecoveryDate_(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const text = String(value || '').trim();
  const match = text.match(/^(?:(\d{2})\.(\d{2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/);
  if (!match) return null;
  const year = Number(match[3] || match[4]);
  const month = Number(match[2] || match[5]);
  const day = Number(match[1] || match[6]);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day
    ? parsed
    : null;
}

function parseClaimPositiveAmount_(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  const text = String(value || '').trim();
  if (!/^[+-]?(?:\d{1,3}(?:[ \u00A0]\d{3})+|\d+)(?:[.,]\d+)?$/.test(text)) {
    return null;
  }
  const parsed = Number(text.replace(/[ \u00A0]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateClaimPartialRecoveries_(spreadsheet, options) {
  const settings = options || {};
  const target = spreadsheet || settings.spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  return withClaimIntakeMutationLock_(() => {
    const sheet = settings.sheet
      || target.getSheetByName(layout.sheetName)
      || ensureClaimIntakeSheet_(target);
    const range = sheet.getRange(
      layout.partialRecoveries.firstRow,
      1,
      layout.partialRecoveries.rowCount,
      layout.partialRecoveries.columnCount
    );
    const result = normalizePartialRecoveries_(range.getValues());
    const invalidByRow = indexClaimRecoveryRows_(result.invalid);
    const unallocatedByRow = indexClaimRecoveryRows_(result.unallocated);
    const backgrounds = range.getBackgrounds();
    const noteRange = sheet.getRange(
      layout.partialRecoveries.firstRow,
      4,
      layout.partialRecoveries.rowCount,
      1
    );
    const notes = noteRange.getNotes();
    const nextBackgrounds = backgrounds.map((row) => row.slice());
    const nextNotes = notes.map((row) => row.slice());
    const properties = PropertiesService.getDocumentProperties();
    const ownership = properties.getProperties();
    const ownershipSnapshots = {};
    const propertyUpdates = {};
    const propertyDeletes = [];
    let backgroundsChanged = false;
    let notesChanged = false;

    for (let index = 0; index < layout.partialRecoveries.rowCount; index++) {
      const absoluteRow = layout.partialRecoveries.firstRow + index;
      const key = getClaimRecoveryValidationPropertyKeyForRow_(sheet, absoluteRow);
      ownershipSnapshots[key] = Object.prototype.hasOwnProperty.call(ownership, key)
        ? { present: true, value: ownership[key] }
        : { present: false, value: null };
      let previous = null;
      if (ownership[key]) {
        try {
          previous = JSON.parse(ownership[key]);
        } catch (error) {
          previous = null;
        }
      }
      const baseBackgrounds = backgrounds[index].map((background, columnIndex) =>
        previous && background === previous.ownedBackground
          ? previous.backgrounds[columnIndex]
          : background
      );
      const baseNote = previous && notes[index][0] === previous.ownedNote
        ? previous.note || ''
        : notes[index][0];
      let desired = null;
      if (invalidByRow[index]) {
        desired = {
          background: CLAIM_INTAKE_SETTINGS.RECOVERY_ERROR_BACKGROUND,
          message: invalidByRow[index].errors.join('. '),
        };
      } else if (unallocatedByRow[index]) {
        desired = {
          background: CLAIM_INTAKE_SETTINGS.RECOVERY_WARNING_BACKGROUND,
          message: 'Не указано требование: распределение будет уточнено, погашение считается спорным',
        };
      }
      const desiredBackgrounds = desired
        ? Array(layout.partialRecoveries.columnCount).fill(desired.background)
        : baseBackgrounds;
      const desiredNote = desired ? desired.message : baseNote;
      if (JSON.stringify(desiredBackgrounds) !== JSON.stringify(backgrounds[index])) {
        nextBackgrounds[index] = desiredBackgrounds;
        backgroundsChanged = true;
      }
      if (desiredNote !== notes[index][0]) {
        nextNotes[index][0] = desiredNote;
        notesChanged = true;
      }
      if (desired) {
        const serialized = JSON.stringify({
          backgrounds: baseBackgrounds,
          note: baseNote,
          ownedBackground: desired.background,
          ownedNote: desired.message,
        });
        if (ownership[key] !== serialized) propertyUpdates[key] = serialized;
      } else if (ownership[key]) {
        propertyDeletes.push(key);
      }
    }
    const rollback = () => {
      try {
        range.setBackgrounds(backgrounds);
      } catch (error) {
        // Continue restoring notes and ownership even if a visual rollback fails.
      }
      try {
        noteRange.setNotes(notes);
      } catch (error) {
        // Continue restoring ownership even if a note rollback fails.
      }
      const propertyRestores = {};
      Object.keys(ownershipSnapshots).forEach((key) => {
        if (ownershipSnapshots[key].present) {
          propertyRestores[key] = ownershipSnapshots[key].value;
        }
      });
      if (Object.keys(propertyRestores).length) {
        try {
          properties.setProperties(propertyRestores);
        } catch (error) {
          // Best effort: preserve the original mutation error.
        }
      }
      Object.keys(ownershipSnapshots).forEach((key) => {
        if (!ownershipSnapshots[key].present) {
          try {
            properties.deleteProperty(key);
          } catch (error) {
            // Best effort: preserve the original mutation error.
          }
        }
      });
    };
    try {
      if (Object.keys(propertyUpdates).length) properties.setProperties(propertyUpdates);
      if (backgroundsChanged) range.setBackgrounds(nextBackgrounds);
      if (notesChanged) noteRange.setNotes(nextNotes);
      propertyDeletes.forEach((key) => properties.deleteProperty(key));
    } catch (error) {
      rollback();
      throw error;
    }
    return result;
  }, settings);
}

function indexClaimRecoveryRows_(items) {
  return (items || []).reduce((result, item) => {
    result[item.rowIndex] = item;
    return result;
  }, {});
}

function getClaimRecoveryValidationPropertyKeyForRow_(sheet, row) {
  return `CLAIM_RECOVERY_VALIDATION_${sheet.getSheetId()}_${row}`;
}

function preserveClaimIntakeDocHistoryUrl_(spreadsheet, docUrl, note) {
  const value = String(docUrl || '').trim();
  if (!value) {
    return false;
  }
  const layout = getClaimIntakeLayout_();
  const sheet = ensureClaimIntakeSheet_(spreadsheet);
  const history = getClaimDocsHistoryRange_(spreadsheet, sheet, layout.docsHistory);
  const rows = history.getValues();
  const existingIndex = rows.findIndex((row) => extractGoogleDocId_(row[1]) === extractGoogleDocId_(value));
  if (existingIndex >= 0) {
    return true;
  }
  appendClaimDocsHistory_(spreadsheet, {
    timestamp: new Date(),
    title: note || 'Перенесенный расчет',
    url: value,
    source: 'legacy',
  });
  return true;
}

function getClaimDocsHistoryExtent_(sheet, history, namedRange) {
  if (namedRange
    && namedRange.getSheet().getSheetId() === sheet.getSheetId()
    && namedRange.getRow() === history.firstRow
    && namedRange.getColumn() === history.firstColumn
    && namedRange.getNumColumns() === history.columnCount
    && namedRange.getNumRows() > 0) {
    return namedRange.getNumRows();
  }
  return 1;
}

function getClaimDocsHistoryRange_(spreadsheet, sheet, history) {
  const namedRange = spreadsheet.getRangeByName(history.namedRange);
  return sheet.getRange(
    history.firstRow, history.firstColumn,
    getClaimDocsHistoryExtent_(sheet, history, namedRange), history.columnCount
  );
}

function appendClaimDocsHistory_(spreadsheet, entry) {
  const layout = getClaimIntakeLayout_();
  const history = layout.docsHistory;
  const sheet = spreadsheet.getSheetByName(layout.sheetName) || ensureClaimIntakeSheet_(spreadsheet);
  const range = getClaimDocsHistoryRange_(spreadsheet, sheet, history);
  const rows = range.getValues();
  validateClaimDocsHistoryRows_(rows);
  const hasOnlyBlankPlaceholder = rows.length === 1
    && rows[0].every((cell) => cell === '' || cell === null);
  const row = hasOnlyBlankPlaceholder ? history.firstRow : history.firstRow + rows.length;
  ensureClaimAuditRows_(sheet, row);
  const targetRange = sheet.getRange(row, history.firstColumn, 1, history.columnCount);
  const previousTargetValues = targetRange.getValues();
  if (!hasOnlyBlankPlaceholder && previousTargetValues[0].some((cell) =>
    cell !== '' && cell !== null)) {
    throw new Error('Следующая ячейка истории занята посторонними данными; запись отменена.');
  }
  const documentCell = `${entry.title || 'Расчет требований'} — ${entry.url}`;
  targetRange.setValues([[
    entry.timestamp || new Date(), documentCell, formatClaimDocsHistoryMetadata_(entry),
  ]]);
  const extent = row - history.firstRow + 1;
  spreadsheet.setNamedRange(
    history.namedRange,
    sheet.getRange(history.firstRow, history.firstColumn, extent, history.columnCount)
  );
  return { row, extent, targetRange, previousTargetValues };
}

function formatClaimDocsHistoryMetadata_(entry) {
  const value = entry || {};
  const source = value.source || 'payroll_slips';
  const idempotencyKey = String(value.idempotencyKey || '').trim();
  if (!idempotencyKey) return source;
  return JSON.stringify({ source, idempotencyKey });
}

function parseClaimDocsHistoryMetadata_(value) {
  const text = String(value || '').trim();
  if (!text) return { source: '', idempotencyKey: '' };
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return {
        source: String(parsed.source || ''),
        idempotencyKey: String(parsed.idempotencyKey || ''),
      };
    }
  } catch (error) {
    // Legacy history stores the source marker as plain text.
  }
  return { source: text, idempotencyKey: '' };
}

function findSuccessfulSelectedClaimDocumentByIdempotency_(spreadsheet, idempotencyKey) {
  const key = String(idempotencyKey || '').trim();
  if (!key) return null;
  const layout = getClaimIntakeLayout_();
  const sheet = spreadsheet.getSheetByName(layout.sheetName);
  if (!sheet) return null;
  const rows = getClaimDocsHistoryRange_(spreadsheet, sheet, layout.docsHistory).getValues();
  for (let index = rows.length - 1; index >= 0; index--) {
    const metadata = parseClaimDocsHistoryMetadata_(rows[index][2]);
    if (metadata.idempotencyKey !== key) continue;
    const documentId = extractGoogleDocId_(rows[index][1]);
    if (!documentId) continue;
    const text = String(rows[index][1] || '');
    const urlMatch = text.match(/https:\/\/docs\.google\.com\/document\/d\/[^\s]+/i);
    const url = urlMatch ? urlMatch[0] : `https://docs.google.com/document/d/${documentId}/edit`;
    const title = urlMatch ? text.slice(0, urlMatch.index).replace(/\s+—\s*$/, '') : 'Расчет требований';
    return {
      documentId,
      url,
      title,
      source: metadata.source,
      idempotencyKey: key,
      reused: true,
      historyRow: layout.docsHistory.firstRow + index,
    };
  }
  return null;
}

function validateClaimDocsHistoryRows_(rows) {
  (rows || []).forEach((row) => {
    const blank = row.every((cell) => cell === '' || cell === null);
    if (blank) return;
    if (!extractGoogleDocId_(row[1])) {
      throw new Error('Ячейка истории занята посторонними данными; запись отменена.');
    }
  });
}

function validateClaimDocsHistoryAuthority_(spreadsheet) {
  const layout = getClaimIntakeLayout_();
  const sheet = spreadsheet.getSheetByName(layout.sheetName);
  if (!sheet) throw new Error('Не найден лист истории сформированных Docs.');
  const range = getClaimDocsHistoryRange_(spreadsheet, sheet, layout.docsHistory);
  const rows = range.getValues();
  validateClaimDocsHistoryRows_(rows);
  const blankPlaceholder = rows.length === 1
    && rows[0].every((cell) => cell === '' || cell === null);
  if (!blankPlaceholder) {
    const nextRow = layout.docsHistory.firstRow + rows.length;
    const next = sheet.getRange(
      nextRow, layout.docsHistory.firstColumn, 1, layout.docsHistory.columnCount
    ).getValues()[0];
    if (next.some((cell) => cell !== '' && cell !== null)) {
      throw new Error('Следующая ячейка истории занята посторонними данными; запись отменена.');
    }
  }
  return range;
}

function buildSelectedClaimPayload_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const layout = getClaimIntakeLayout_();
  const sheet = target.getSheetByName(layout.sheetName);
  if (!sheet) {
    throw new Error('Лист «Анкета и требования» не найден. Сначала обновите конструктор.');
  }
  const auditRange = target.getRangeByName(layout.claimSelections.namedRange);
  const extent = getClaimAuditRenderedExtent_(sheet, layout.claimSelections, auditRange);
  const rows = sheet.getRange(
    layout.claimSelections.firstRow, 1, extent, layout.claimSelections.columnCount
  ).getValues();
  const groups = [];
  let currentGroup = null;
  rows.forEach((row) => {
    const key = String(row[5] || '').trim();
    if (!key) {
      const heading = String(row[1] || '').trim();
      if (!heading) return;
      currentGroup = {
        family: '',
        label: heading.replace(/\s+—\s+[\d\s\u00a0]+(?:[,.]\d+)?\s*$/, ''),
        items: [],
        total: 0,
      };
      groups.push(currentGroup);
      return;
    }
    if (!currentGroup) {
      throw new Error(
        'Нарушен порядок групп аудита: позиция находится до заголовка группы. '
        + 'Повторите расчет в Google Sheets.'
      );
    }
    if (row[0] !== true) return;
    if (!isFivePartClaimKey_(key)) {
      throw new Error('В выбранной позиции поврежден технический ключ. Повторите расчет в Google Sheets.');
    }
    const amount = Number(row[3]);
    const keyParts = key.split('|').map(decodeClaimKeyPart_);
    const family = keyParts[0];
    const violation = String(row[1] || '').trim();
    const periodKey = keyParts[3];
    const period = formatSelectedClaimPeriod_(row[2], periodKey);
    if (!violation || !period || !Number.isFinite(amount) || amount <= 0) {
      throw new Error(
        'Выбранная позиция не содержит понятное нарушение, период или положительную сумму. '
        + 'Повторите расчет в Google Sheets.'
      );
    }
    if (!currentGroup.family) currentGroup.family = family;
    if (currentGroup.family !== family) {
      throw new Error(
        'Нарушен порядок групп аудита: позиция относится к другой группе. '
        + 'Повторите расчет в Google Sheets.'
      );
    }
    const item = {
      key,
      family,
      layoutId: keyParts[1],
      baseKind: keyParts[2],
      periodKey,
      calculationItem: keyParts[4],
      violation,
      period,
      label: `${violation} — ${period}`,
      amount: roundClaimAuditMoney_(amount),
      disputed: String(row[4] || '').trim().toLowerCase() === 'спорное',
    };
    currentGroup.items.push(item);
    currentGroup.total = roundClaimAuditMoney_(currentGroup.total + item.amount);
  });
  const selectedGroups = groups.filter((group) => group.items.length);
  const selectedClaimKeys = new Set(selectedGroups.reduce(
    (keys, group) => keys.concat(group.items.map((item) => item.key)), []
  ));
  const selectedItemByKey = new Map(selectedGroups.reduce(
    (items, group) => items.concat(group.items), []
  ).map((item) => [item.key, item]));
  const averageState = readAverageEarningsState_(target);
  const selectedAverage = resolveSelectedAverageEarnings_(averageState);
  const scenarios = ['calculated', 'user'].map((source) => {
    const scenario = source === 'user' ? averageState.user : averageState.calculated;
    const amount = parseClaimPositiveAmount_(scenario && scenario.amount);
    return amount === null ? null : {
      source,
      amount,
      context: String(scenario && scenario.context || ''),
      selected: source === normalizeAverageEarningsSource_(averageState.selectedSource),
    };
  }).filter(Boolean);
  const recoveryRows = target.getRangeByName(layout.partialRecoveries.namedRange).getValues();
  const recoveries = normalizePartialRecoveries_(recoveryRows);
  const run = typeof loadClaimConstructorRun_ === 'function' ? loadClaimConstructorRun_() : null;
  const effects = findLatestCalculationEffects_(run && run.results);
  const claimGroups = selectedGroups.filter((group) => group.family !== 'unallocated_recovery');
  return {
    employerSector: String(target.getRangeByName(layout.employerSector.namedRange).getValue() || ''),
    averageEarnings: {
      selected: selectedAverage,
      scenarios,
    },
    groups: claimGroups,
    total: roundClaimAuditMoney_(claimGroups.reduce((sum, group) => sum + group.total, 0)),
    recoveries: {
      valid: recoveries.valid.filter((recovery) => selectedClaimKeys.has(recovery.allocation))
        .map((recovery) => {
          const item = selectedItemByKey.get(recovery.allocation);
          return Object.assign({}, recovery, {
            allocationLabel: item ? `${item.violation} (${item.period})` : 'выбранное требование',
          });
        }),
      invalid: recoveries.invalid,
      unallocated: recoveries.unallocated,
    },
    warnings: collectSelectedClaimWarnings_(effects, selectedClaimKeys),
    sourceKind: 'payroll_slips',
  };
}

function formatSelectedClaimPeriod_(value, periodKey) {
  const normalizedKey = String(periodKey || '').trim();
  const keyMatch = normalizedKey.match(/^(\d{4})-(\d{2})$/);
  if (keyMatch) return `${keyMatch[2]}.${keyMatch[1]}`;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd.MM.yyyy');
  }
  return String(value || '').trim();
}

function summarizeSelectedClaimDashboardTotals_(payload) {
  const totals = (payload && payload.groups || []).reduce((result, group) => {
    (group.items || []).forEach((item) => {
      const amount = Number(item.amount) || 0;
      if (item.family === 'underpayment') result.underpayment += amount;
      if (item.family === 'salary_indexation' || item.family === 'underpayment_indexation') {
        result.indexation += amount;
      }
      if (item.family === 'material_liability' || item.family === 'vacation_payment_delay'
        || item.family === 'premium_payment_delay') {
        result.liability += amount;
      }
    });
    return result;
  }, { underpayment: 0, indexation: 0, liability: 0 });
  totals.underpayment = roundClaimAuditMoney_(totals.underpayment);
  totals.indexation = roundClaimAuditMoney_(totals.indexation);
  totals.liability = roundClaimAuditMoney_(totals.liability);
  totals.total = roundClaimAuditMoney_(
    totals.underpayment + totals.indexation + totals.liability
  );
  return totals;
}

function syncClaimConstructorTotalsToSelection_(spreadsheet, payload) {
  const totals = summarizeSelectedClaimDashboardTotals_(payload);
  if (typeof loadClaimConstructorRun_ !== 'function'
    || typeof saveClaimConstructorRun_ !== 'function') return totals;
  const run = loadClaimConstructorRun_();
  if (!run || !run.results) return totals;
  run.results.dashboard = run.results.dashboard || { output: {} };
  run.results.dashboard.totals = totals;
  saveClaimConstructorRun_(run);
  const sheet = spreadsheet.getSheetByName(getClaimConstructorLayout_().sheetName);
  if (sheet && typeof renderClaimConstructorResults_ === 'function') {
    renderClaimConstructorResults_(sheet, run.results.dashboard);
    SpreadsheetApp.flush();
  }
  return totals;
}

function syncClaimConstructorTotalsToSelection() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const payload = buildSelectedClaimPayload_(spreadsheet);
  return syncClaimConstructorTotalsToSelection_(spreadsheet, payload);
}

function decodeClaimKeyPart_(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch (error) {
    return String(value || '');
  }
}

function findLatestCalculationEffects_(results) {
  const value = results || {};
  if (value.calculationEffects) return value.calculationEffects;
  const calculations = value.calculations;
  if (Array.isArray(calculations)) {
    for (let index = calculations.length - 1; index >= 0; index--) {
      if (calculations[index] && calculations[index].calculationEffects) {
        return calculations[index].calculationEffects;
      }
    }
  }
  return null;
}

function collectSelectedClaimWarnings_(calculationEffects, selectedClaimKeys) {
  if (!calculationEffects) return [];
  const derivative = calculationEffects.derivativeEffects;
  const selected = selectedClaimKeys instanceof Set ? selectedClaimKeys : new Set();
  const seen = new Set();
  return (calculationEffects.warnings || []).concat(
    derivative && derivative.warnings || []
  ).filter((warning) => {
    const targetKey = extractClaimWarningTargetKey_(warning);
    if (targetKey && !selected.has(targetKey)) return false;
    const semanticKey = buildClaimWarningSemanticKey_(warning);
    if (seen.has(semanticKey)) return false;
    seen.add(semanticKey);
    return true;
  }).map((warning) => {
    const recovery = warning.recovery || warning.overpayment && warning.overpayment.recovery;
    const targetKey = extractClaimWarningTargetKey_(warning);
    return {
      code: warning.code || '',
      reason: warning.reason || warning.message || '',
      source: warning.source || warning.sourceRef
        || (typeof warning.sourceContext === 'string' ? warning.sourceContext : '')
        || targetKey,
      disputed: warning.disputed === true,
      sourceContext: {
        source: warning.sourceContext || warning.source || warning.sourceRef || '',
        targetKey,
        amount: Number.isFinite(Number(warning.amount)) ? Number(warning.amount) : null,
        sourceIdentities: (warning.sourceIdentities || []).slice(),
        recovery: recovery ? {
          rowIndex: Number.isInteger(recovery.rowIndex) ? recovery.rowIndex : null,
          date: recovery.date || null,
          amount: Number.isFinite(Number(recovery.amount)) ? Number(recovery.amount) : null,
          allocation: recovery.allocation || '',
        } : null,
      },
    };
  });
}

function buildClaimWarningSemanticKey_(warning) {
  const value = warning || {};
  const sourceContext = value.sourceContext !== undefined
    ? value.sourceContext
    : (value.source !== undefined ? value.source : value.sourceRef || '');
  return stableClaimWarningStringify_([
    value.code || '',
    extractClaimWarningTargetKey_(value),
    sourceContext,
    value.reason || value.message || '',
  ]);
}

function extractClaimWarningTargetKey_(warning) {
  const value = warning || {};
  const candidates = [
    value,
    value.overpayment,
    value.recovery,
    value.effect,
    value.writeBack,
    value.sourceAdjustment,
  ];
  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index];
    if (!candidate || typeof candidate !== 'object') continue;
    const targetKey = candidate.targetKey || candidate.claimKey || '';
    if (targetKey) return String(targetKey);
  }
  return '';
}

function stableClaimWarningStringify_(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableClaimWarningStringify_).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${stableClaimWarningStringify_(value[key])}`
    ).join(',')}}`;
  }
  return JSON.stringify(value);
}

function resolveSelectedClaimDocumentFolder_(spreadsheet) {
  const target = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const constructorLayout = getClaimConstructorLayout_();
  const intakeLayout = getClaimIntakeLayout_();
  const candidates = [];
  const approvedTemplateId = readApprovedClaimDocumentTemplateId_();
  if (approvedTemplateId) candidates.push(approvedTemplateId);
  const currentRange = target.getRangeByName(constructorLayout.outputDoc.namedRange);
  if (currentRange) candidates.push(currentRange.getValue());
  const intake = target.getSheetByName(intakeLayout.sheetName);
  if (intake) {
    const historyRows = getClaimDocsHistoryRange_(target, intake, intakeLayout.docsHistory).getValues();
    for (let index = historyRows.length - 1; index >= 0; index--) {
      candidates.push(historyRows[index][1]);
    }
  }
  let lastProblem = '';
  for (let index = 0; index < candidates.length; index++) {
    const id = normalizeGoogleDocIdCandidate_(candidates[index]);
    if (!id) continue;
    try {
      const file = DriveApp.getFileById(id);
      const parents = file.getParents();
      const found = [];
      while (parents.hasNext()) found.push(parents.next());
      if (found.length === 1) {
        return { folder: found[0], sourceDocumentId: id };
      }
      lastProblem = found.length
        ? 'У документа найдено несколько родительских папок.'
        : 'У документа нет доступной родительской папки.';
    } catch (error) {
      lastProblem = `Документ недоступен: ${error && error.message ? error.message : error}`;
    }
  }
  throw createSelectedClaimDocumentCorrectiveError_(
    'document_parent_unresolvable',
    'Не удалось определить ровно одну доступную папку для нового Google Doc. '
    + 'Укажите в Конструкторе ссылку на доступный расчетный документ в нужной папке'
    + (lastProblem ? `. ${lastProblem}` : '.')
  );
}

function normalizeGoogleDocIdCandidate_(value) {
  const extracted = extractGoogleDocId_(value);
  if (extracted) return extracted;
  const raw = String(value || '').trim();
  return /^[A-Za-z0-9_-]{20,}$/.test(raw) ? raw : '';
}

function readApprovedClaimDocumentTemplateId_() {
  if (typeof PropertiesService === 'undefined') {
    return DEFAULT_APPROVED_CLAIM_DOCUMENT_TEMPLATE_ID;
  }
  return String(PropertiesService.getDocumentProperties()
    .getProperty(APPROVED_CLAIM_DOCUMENT_TEMPLATE_PROPERTY)
    || DEFAULT_APPROVED_CLAIM_DOCUMENT_TEMPLATE_ID).trim();
}

function setApprovedClaimDocumentTemplateId(documentId) {
  const id = normalizeGoogleDocIdCandidate_(documentId);
  if (!id) throw new Error('Не указан корректный ID утвержденного шаблона судебного расчета.');
  const file = DriveApp.getFileById(id);
  const parents = file.getParents();
  let count = 0;
  while (parents.hasNext()) {
    parents.next();
    count++;
  }
  if (count !== 1) {
    throw new Error('Утвержденный шаблон должен находиться ровно в одной доступной папке Google Drive.');
  }
  PropertiesService.getDocumentProperties()
    .setProperty(APPROVED_CLAIM_DOCUMENT_TEMPLATE_PROPERTY, id);
  return { documentId: id, configured: true };
}

function writeSelectedClaimDocument(options) {
  const settings = options || {};
  const spreadsheet = settings.spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  if (!lock || !lock.tryLock(30000)) {
    throw new Error('Формирование документа уже выполняется; повторите попытку позже.');
  }
  try {
    return writeSelectedClaimDocumentLocked_(spreadsheet, settings);
  } finally {
    lock.releaseLock();
  }
}

function writeSelectedClaimDocumentLocked_(spreadsheet, settings) {
  ensureClaimConstructorWorkspace_(spreadsheet);
  const existing = findSuccessfulSelectedClaimDocumentByIdempotency_(
    spreadsheet, settings.idempotencyKey
  );
  if (existing) {
    const currentRange = spreadsheet.getRangeByName(
      getClaimConstructorLayout_().outputDoc.namedRange
    );
    if (!currentRange) throw new Error('Не найдена ячейка текущего расчетного документа.');
    currentRange.setValue(existing.url);
    SpreadsheetApp.flush();
    return existing;
  }
  const resolvedFolder = resolveSelectedClaimDocumentFolder_(spreadsheet);
  const payload = buildSelectedClaimPayload_(spreadsheet);
  validateSelectedClaimDocumentPayload_(payload);
  validateClaimDocsHistoryAuthority_(spreadsheet);
  const now = settings.now || new Date();
  const title = buildSelectedClaimDocumentTitle_(payload, now);
  let document = null;
  let file = null;
  let documentId = '';
  try {
    const templateFile = DriveApp.getFileById(resolvedFolder.sourceDocumentId);
    file = templateFile.makeCopy(title, resolvedFolder.folder);
    documentId = file.getId();
    document = DocumentApp.openById(documentId);
    populateSelectedClaimDocument_(document, payload, now);
    document.saveAndClose();
    const url = document.getUrl
      ? document.getUrl()
      : `https://docs.google.com/document/d/${document.getId()}/edit`;
    updateSelectedClaimDocumentRegistry_(spreadsheet, {
      timestamp: now,
      title,
      url,
      source: settings.source || payload.sourceKind,
      idempotencyKey: settings.idempotencyKey || '',
    });
    const selectedTotals = summarizeSelectedClaimDashboardTotals_(payload);
    return {
      documentId,
      url,
      title,
      folder: resolvedFolder.folder,
      sourceDocumentId: resolvedFolder.sourceDocumentId,
      source: settings.source || payload.sourceKind,
      idempotencyKey: String(settings.idempotencyKey || ''),
      selectedTotals,
      payload,
    };
  } catch (error) {
    if (documentId) {
      try {
        trashGeneratedClaimDocument_(documentId, file);
      } catch (trashError) {
        throw new Error(
          `${error && error.message ? error.message : error}. `
          + `Не удалось удалить созданный документ; orphan ${documentId}: `
          + `${trashError && trashError.message ? trashError.message : trashError}`
        );
      }
    }
    throw error;
  }
}

function trashGeneratedClaimDocument_(documentId, knownFile) {
  const errors = [];
  let file = knownFile;
  if (!file) {
    try {
      file = DriveApp.getFileById(documentId);
    } catch (error) {
      errors.push(error);
    }
  }
  if (file && typeof file.setTrashed === 'function') {
    try {
      file.setTrashed(true);
      return true;
    } catch (error) {
      errors.push(error);
    }
  }
  if (typeof Drive !== 'undefined' && Drive.Files
    && typeof Drive.Files.trash === 'function') {
    try {
      Drive.Files.trash(documentId);
      return true;
    } catch (error) {
      errors.push(error);
    }
  }
  throw new Error(errors.map((error) => error && error.message ? error.message : String(error))
    .join('; ') || 'Сервисы удаления Google Drive недоступны.');
}

function validateSelectedClaimDocumentPayload_(payload) {
  const value = payload || {};
  const selectedAverage = value.averageEarnings && value.averageEarnings.selected;
  if (!selectedAverage || selectedAverage.valid === false
    || !Number.isFinite(Number(selectedAverage.amount))
    || Number(selectedAverage.amount) <= 0) {
    throw createSelectedClaimDocumentCorrectiveError_(
      'average_earnings_invalid',
      'Выберите сценарий и укажите положительный средний заработок перед формированием документа.'
    );
  }
  const itemCount = (value.groups || []).reduce(
    (count, group) => count + (group.items || []).length, 0
  );
  if (!itemCount) {
    throw createSelectedClaimDocumentCorrectiveError_(
      'selected_claims_missing',
      'Выберите хотя бы одно требование в разделе «Аудит и требования».'
    );
  }
}

function createSelectedClaimDocumentCorrectiveError_(code, message) {
  const error = new Error(message);
  error.name = 'SelectedClaimDocumentCorrectiveError';
  error.code = code;
  error.corrective = true;
  return error;
}

function isSelectedClaimDocumentCorrectiveError_(error) {
  return Boolean(error && error.corrective === true && [
    'average_earnings_invalid',
    'selected_claims_missing',
    'document_parent_unresolvable',
    'approved_layout_unmapped_basis',
    'approved_template_preservation_required',
  ].indexOf(error.code) >= 0);
}

function writeSelectedClaimDocumentAction() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const result = writeSelectedClaimDocument({ spreadsheet });
  if (result && result.payload) {
    syncClaimConstructorTotalsToSelection_(spreadsheet, result.payload);
  }
  spreadsheet.toast(
    `Создан новый документ: ${result.title}`,
    CLAIM_INTAKE_SETTINGS.SELECTED_DOC_ACTION_LABEL
  );
  return result;
}

function buildSelectedClaimDocumentTitle_(payload, now) {
  const selected = payload.averageEarnings && payload.averageEarnings.selected || {};
  const scenario = selected.source === 'user' ? 'ручной средний' : 'рассчитанный средний';
  const timestamp = Utilities.formatDate(
    now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm:ss'
  );
  return `Расчет заявленных сумм — ${timestamp} — ${scenario}`;
}

function populateSelectedClaimDocument_(document, payload, now) {
  const body = document.getBody();
  assertApprovedClaimTemplateCanBePreserved_(body);
  clearNewSelectedClaimDocumentBody_(body);
  const model = buildApprovedClaimDocumentModel_(payload, now);
  appendApprovedClaimHeading_(body, 'Расчет заявленных сумм', DocumentApp.ParagraphHeading.HEADING1);
  appendApprovedClaimParagraph_(body, 'Дата окончания расчета:');
  model.endDateRows.forEach((row) => appendApprovedClaimListItem_(body, row));

  appendApprovedClaimHeading_(body, 'Сводка', DocumentApp.ParagraphHeading.HEADING2);
  appendApprovedClaimTable_(body, model.summaryRows, {
    totalRow: true,
    columnWidths: [105, 70, 95, 90, 80],
  });
  const totalParagraph = appendApprovedClaimParagraph_(
    body,
    `Общая сумма выбранных требований на ${model.calculationDate}: `
      + `${formatClaimAuditAmount_(model.total)} ₽`
  );
  setApprovedClaimElementBold_(totalParagraph, true);

  model.sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0 && section.baseKind === 'monthly_premium'
      && typeof body.appendPageBreak === 'function') {
      body.appendPageBreak();
    }
    appendApprovedClaimHeading_(body, section.title, DocumentApp.ParagraphHeading.HEADING2);
    appendApprovedClaimTable_(body, section.rows, {
      totalRow: true,
      columnWidths: [85, 85, 75, 85, 110],
    });
    if (section.disputedItems.length) {
      appendApprovedClaimParagraph_(body, 'Спорные позиции, включенные пользователем:');
      section.disputedItems.forEach((item) => appendApprovedClaimListItem_(
        body,
        `${item.violation} (${item.period}) — ${formatClaimAuditAmount_(item.amount)} ₽`
      ));
    }
  });

  appendApprovedAverageEarningsSection_(body, payload.averageEarnings);
  appendApprovedArticle236Detail_(body, model);
  appendSelectedClaimRecoveriesNarrative_(body, payload.recoveries);
  appendApprovedClaimWarnings_(body, payload.warnings);
  appendApprovedClaimParagraph_(
    body,
    'Расчет сформирован только по выбранным пользователем требованиям на основании данных '
      + 'Google Sheets. Снятые позиции в суммы и таблицы документа не включены.'
  );
  reconcileApprovedClaimDocumentModel_(model, payload);
}

/**
 * A generated court calculation is always a fresh copy of the approved
 * template.  The source template is never changed.  The new copy may be
 * rebuilt only after this preflight confirms the required approved headings;
 * the model below owns only the values and rows allowed by the locked
 * presentation contract.
 */
function assertApprovedClaimTemplateCanBePreserved_(body) {
  const requiredHeadings = [
    'Расчет заявленных сумм',
    'Сводка',
    '1. Оклад: индексация, индексация недоплаты, матответственность',
    '5. Расчет среднего заработка',
    '7. Подробный расчет матответственности по ст. 236 ТК РФ',
  ];
  const hasFindText = body && typeof body.findText === 'function';
  const hasAllHeadings = hasFindText && requiredHeadings.every((heading) =>
    Boolean(body.findText(escapeApprovedClaimTemplateRegex_(heading)))
  );
  if (hasFindText && !hasAllHeadings) {
    throw createSelectedClaimDocumentCorrectiveError_(
      'approved_template_preservation_required',
      'Копия судебного расчета не соответствует утвержденному макету: '
        + 'не найдены обязательные разделы. Исходный шаблон не изменен; проверьте его редакцию.'
    );
  }
  return true;
}

function escapeApprovedClaimTemplateRegex_(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clearNewSelectedClaimDocumentBody_(body) {
  if (body && typeof body.clear === 'function') {
    body.clear();
    return body;
  }
  if (body && Array.isArray(body.content)) body.content.length = 0;
  return body;
}

function buildApprovedClaimDocumentModel_(payload, now) {
  const value = payload || {};
  const definitions = [
    { baseKind: 'salary', label: 'Оклад', title: '1. Оклад: индексация, индексация недоплаты, матответственность' },
    { baseKind: 'monthly_premium', label: 'Ежемесячные премии', title: '2.1. Ежемесячные премии' },
    { baseKind: 'quarterly_premium', label: 'Ежеквартальные премии', title: '2.2. Ежеквартальные премии' },
    { baseKind: 'annual_premium', label: 'Ежегодные премии', title: '2.3. Ежегодные премии' },
    { baseKind: 'vacation', label: 'Отпуска', title: '3. Отпуска' },
    { baseKind: 'vacation_payment', label: 'Отпуска', title: '3. Отпуска' },
    { baseKind: 'salary_payment', label: 'Окончательный расчет', title: '4. Окончательный расчет при увольнении: перерасчет, индексация недоплаты и матответственность' },
  ];
  const definitionByBase = new Map(definitions.map((definition) => [definition.baseKind, definition]));
  const items = (value.groups || []).reduce(
    (result, group) => result.concat((group.items || []).map((item) => Object.assign({}, item, {
      family: item.family || group.family,
    }))), []
  ).filter((item) => item.family !== 'unallocated_recovery');
  const unknown = items.filter((item) => !definitionByBase.has(item.baseKind));
  if (unknown.length) {
    throw createSelectedClaimDocumentCorrectiveError_(
      'approved_layout_unmapped_basis',
      `Для основания «${unknown[0].violation || unknown[0].baseKind}» еще не согласован раздел `
        + 'судебного расчета. Сначала согласуйте изменение макета.'
    );
  }
  const buckets = new Map();
  items.forEach((item) => {
    const bucketKey = item.baseKind === 'vacation_payment' ? 'vacation' : item.baseKind;
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, new Map());
    const periods = buckets.get(bucketKey);
    if (!periods.has(item.period)) {
      periods.set(item.period, {
        period: item.period,
        underpayment: 0,
        indexation: 0,
        liability: 0,
        selectedTotal: 0,
        items: [],
      });
    }
    const row = periods.get(item.period);
    if (item.family === 'underpayment') row.underpayment += item.amount;
    if (item.family === 'salary_indexation' || item.family === 'underpayment_indexation') {
      row.indexation += item.amount;
    }
    if (item.family === 'material_liability' || item.family === 'vacation_payment_delay') {
      row.liability += item.amount;
    }
    row.selectedTotal += item.amount;
    row.items.push(item);
  });
  const orderedDefinitions = definitions.filter((definition, index, all) =>
    all.findIndex((candidate) => (candidate.baseKind === 'vacation_payment' ? 'vacation' : candidate.baseKind)
      === (definition.baseKind === 'vacation_payment' ? 'vacation' : definition.baseKind)) === index
  );
  const sections = [];
  const summaryRows = [[
    'Вид требования', 'Количество периодов', 'Сумма по требованию, ₽',
    'Компенсация, ₽', 'Индексация, ₽',
  ]];
  const article236Items = [];
  orderedDefinitions.forEach((definition) => {
    const bucketKey = definition.baseKind === 'vacation_payment' ? 'vacation' : definition.baseKind;
    const periods = buckets.get(bucketKey);
    if (!periods || !periods.size) return;
    const rows = Array.from(periods.values()).sort(compareApprovedClaimPeriods_);
    const totals = rows.reduce((result, row) => {
      result.underpayment += row.underpayment;
      result.indexation += row.indexation;
      result.liability += row.liability;
      result.selectedTotal += row.selectedTotal;
      row.items.filter((item) => item.family === 'material_liability'
        || item.family === 'vacation_payment_delay').forEach((item) => article236Items.push(item));
      return result;
    }, { underpayment: 0, indexation: 0, liability: 0, selectedTotal: 0 });
    const tableRows = [['Период', 'Недоплата, ₽', 'Индексация, ₽', '236 ТК РФ, ₽', 'Итого, ₽']]
      .concat(rows.map((row) => [
        row.period,
        formatClaimAuditAmount_(row.underpayment),
        formatClaimAuditAmount_(row.indexation),
        formatClaimAuditAmount_(row.liability),
        formatClaimAuditAmount_(row.selectedTotal),
      ]))
      .concat([[
        'Итого',
        formatClaimAuditAmount_(totals.underpayment),
        formatClaimAuditAmount_(totals.indexation),
        formatClaimAuditAmount_(totals.liability),
        formatClaimAuditAmount_(totals.selectedTotal),
      ]]);
    sections.push({
      baseKind: bucketKey,
      title: definition.title,
      rows: tableRows,
      totals,
      disputedItems: rows.reduce(
        (result, row) => result.concat(row.items.filter((item) => item.disputed)), []
      ),
    });
    summaryRows.push([
      definition.label,
      String(rows.length),
      formatClaimAuditAmount_(totals.underpayment),
      formatClaimAuditAmount_(totals.liability),
      formatClaimAuditAmount_(totals.indexation),
    ]);
  });
  const summaryTotals = sections.reduce((result, section) => {
    result.periodCount += section.rows.length - 2;
    result.underpayment += section.totals.underpayment;
    result.liability += section.totals.liability;
    result.indexation += section.totals.indexation;
    result.selectedTotal += section.totals.selectedTotal;
    return result;
  }, { periodCount: 0, underpayment: 0, liability: 0, indexation: 0, selectedTotal: 0 });
  summaryRows.push([
    'Итого',
    String(summaryTotals.periodCount),
    formatClaimAuditAmount_(summaryTotals.underpayment),
    formatClaimAuditAmount_(summaryTotals.liability),
    formatClaimAuditAmount_(summaryTotals.indexation),
  ]);
  const calculationDate = Utilities.formatDate(
    now, Session.getScriptTimeZone(), 'dd.MM.yyyy'
  );
  return {
    calculationDate,
    endDateRows: sections.map((section) => {
      const definition = orderedDefinitions.find((candidate) => {
        const key = candidate.baseKind === 'vacation_payment' ? 'vacation' : candidate.baseKind;
        return key === section.baseKind;
      });
      return `${definition ? definition.label : section.baseKind}: ${calculationDate}`;
    }),
    items,
    sections,
    summaryRows,
    article236Items,
    total: roundClaimAuditMoney_(summaryTotals.selectedTotal),
  };
}

function compareApprovedClaimPeriods_(left, right) {
  const parse = (value) => {
    const match = String(value && value.period || '').match(/^(\d{2})\.(\d{4})$/);
    return match ? Number(match[2]) * 12 + Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };
  return parse(left) - parse(right) || String(left.period).localeCompare(String(right.period));
}

function reconcileApprovedClaimDocumentModel_(model, payload) {
  const selectedTotal = roundClaimAuditMoney_((model.items || []).reduce(
    (sum, item) => sum + Number(item.amount || 0), 0
  ));
  const payloadTotal = roundClaimAuditMoney_(Number(payload && payload.total || 0));
  if (Math.abs(model.total - selectedTotal) > 0.01
    || Math.abs(model.total - payloadTotal) > 0.01) {
    throw new Error(
      `Судебный расчет не сходится с выбранными требованиями: документ `
        + `${formatClaimAuditAmount_(model.total)}, выбранные позиции `
        + `${formatClaimAuditAmount_(selectedTotal)}, аудит ${formatClaimAuditAmount_(payloadTotal)}.`
    );
  }
  return true;
}

function appendApprovedAverageEarningsSection_(body, averageEarnings) {
  const value = averageEarnings || {};
  const selected = value.selected || {};
  appendApprovedClaimHeading_(
    body, '5. Расчет среднего заработка', DocumentApp.ParagraphHeading.HEADING2
  );
  const rows = [['Показатель', 'Значение'], [
    selected.source === 'user' ? 'Средний заработок, заданный вручную' : 'Средний заработок по реконструкции',
    `${formatClaimAuditAmount_(selected.amount || 0)} ₽`,
  ]];
  if (selected.context) rows.push(['Источник выбранного значения', selected.context]);
  (value.scenarios || []).filter((scenario) => !scenario.selected).forEach((scenario) => {
    rows.push([
      scenario.source === 'user' ? 'Для сравнения: заданный вручную' : 'Для сравнения: по реконструкции',
      `${formatClaimAuditAmount_(scenario.amount || 0)} ₽${scenario.context ? `; ${scenario.context}` : ''}`,
    ]);
  });
  appendApprovedClaimTable_(body, rows, { columnWidths: [290, 150] });
}

function appendApprovedArticle236Detail_(body, model) {
  if (!model.article236Items.length) return;
  if (typeof body.appendPageBreak === 'function') body.appendPageBreak();
  appendApprovedClaimHeading_(
    body,
    '7. Подробный расчет матответственности по ст. 236 ТК РФ',
    DocumentApp.ParagraphHeading.HEADING2
  );
  const total = model.article236Items.reduce(
    (sum, item) => sum + Number(item.amount || 0), 0
  );
  const rows = [['Период', 'Суть нарушения', 'Компенсация, ₽']]
    .concat(model.article236Items.map((item) => [
      item.period,
      `${formatApprovedArticle236Violation_(item.violation)}`
        + `${item.disputed ? ' (спорное)' : ''}`,
      formatClaimAuditAmount_(item.amount),
    ]))
    .concat([['', 'Итого', formatClaimAuditAmount_(total)]]);
  appendApprovedClaimTable_(body, rows, {
    totalRow: true,
    columnWidths: [75, 275, 90],
  });
}

function formatApprovedArticle236Violation_(value) {
  return String(value || '')
    .replace(/^Материальная ответственность за задержку\s+/i, 'Задержка ')
    .trim();
}

function appendApprovedClaimWarnings_(body, warnings) {
  const values = warnings || [];
  if (!values.length) return;
  appendApprovedClaimParagraph_(body, 'Замечания к расчету:');
  values.forEach((warning) => appendApprovedClaimListItem_(
    body,
    `${warning.reason || warning.code}`
  ));
}

function appendApprovedClaimHeading_(body, text, heading) {
  const paragraph = body.appendParagraph(text).setHeading(heading);
  const styles = {};
  styles[DocumentApp.ParagraphHeading.HEADING1] = {
    color: '#366091', size: 15, spacingBefore: 24,
  };
  styles[DocumentApp.ParagraphHeading.HEADING2] = {
    color: '#4F81BD', size: 13, spacingBefore: 10,
  };
  styles[DocumentApp.ParagraphHeading.HEADING3] = {
    color: '#4F81BD', size: 11, spacingBefore: 10,
  };
  const style = styles[heading] || styles[DocumentApp.ParagraphHeading.HEADING3];
  if (typeof paragraph.setLineSpacing === 'function') paragraph.setLineSpacing(1.15);
  if (typeof paragraph.setSpacingBefore === 'function') {
    paragraph.setSpacingBefore(style.spacingBefore);
  }
  if (typeof paragraph.setSpacingAfter === 'function') paragraph.setSpacingAfter(0);
  if (typeof paragraph.editAsText === 'function') {
    const value = paragraph.editAsText();
    if (value && typeof value.setFontFamily === 'function') {
      value.setFontFamily('Times New Roman');
    }
    if (value && typeof value.setForegroundColor === 'function') {
      value.setForegroundColor(style.color);
    }
    if (value && typeof value.setFontSize === 'function') value.setFontSize(style.size);
    if (value && typeof value.setBold === 'function') value.setBold(true);
  }
  return paragraph;
}

function appendApprovedClaimParagraph_(body, text) {
  const paragraph = body.appendParagraph(text);
  if (typeof paragraph.setLineSpacing === 'function') paragraph.setLineSpacing(1.15);
  if (typeof paragraph.setSpacingAfter === 'function') paragraph.setSpacingAfter(4);
  setApprovedClaimElementTextStyle_(paragraph, {
    color: '#000000', size: 11, bold: false,
  });
  return paragraph;
}

function appendApprovedClaimListItem_(body, text) {
  if (body && typeof body.appendListItem === 'function') {
    const item = body.appendListItem(text);
    if (typeof item.setLineSpacing === 'function') item.setLineSpacing(1.15);
    if (typeof item.setSpacingAfter === 'function') item.setSpacingAfter(2);
    setApprovedClaimElementTextStyle_(item, {
      color: '#000000', size: 11, bold: false,
    });
    return item;
  }
  return body.appendParagraph(`• ${text}`);
}

function appendApprovedClaimTable_(body, rows, options) {
  const table = body.appendTable(rows);
  const settings = options || {};
  if (!table || typeof table.getNumRows !== 'function') return table;
  if (typeof table.setBorderColor === 'function') table.setBorderColor('#000000');
  if (typeof table.setBorderWidth === 'function') table.setBorderWidth(1);
  if (Array.isArray(settings.columnWidths)) {
    for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
      const row = table.getRow(rowIndex);
      if (!row || typeof row.getNumCells !== 'function') continue;
      for (let cellIndex = 0; cellIndex < row.getNumCells(); cellIndex++) {
        const cell = row.getCell(cellIndex);
        setApprovedClaimElementTextStyle_(cell, {
          color: '#000000', size: 11, bold: false,
        });
        const width = settings.columnWidths[cellIndex];
        if (width && cell && typeof cell.setWidth === 'function') cell.setWidth(width);
      }
    }
  }
  styleApprovedClaimTableRow_(table.getRow(0), true, true);
  if (settings.totalRow && table.getNumRows() > 1) {
    styleApprovedClaimTableRow_(table.getRow(table.getNumRows() - 1), true, true);
  }
  return table;
}

function styleApprovedClaimTableRow_(row, bold, shaded) {
  if (!row || typeof row.getNumCells !== 'function') return;
  for (let index = 0; index < row.getNumCells(); index++) {
    const cell = row.getCell(index);
    if (shaded && cell && typeof cell.setBackgroundColor === 'function') {
      cell.setBackgroundColor('#eeeeee');
    }
    setApprovedClaimElementBold_(cell, bold);
  }
}

function setApprovedClaimElementBold_(element, bold) {
  if (!element) return;
  try {
    if (typeof element.editAsText === 'function') element.editAsText().setBold(Boolean(bold));
  } catch (error) {
    Logger.log(`Не удалось применить полужирное начертание: ${error && error.message ? error.message : error}`);
  }
}

function setApprovedClaimElementTextStyle_(element, options) {
  if (!element || typeof element.editAsText !== 'function') return;
  const settings = options || {};
  try {
    const value = element.editAsText();
    if (value && typeof value.setFontFamily === 'function') {
      value.setFontFamily('Times New Roman');
    }
    if (settings.color && value && typeof value.setForegroundColor === 'function') {
      value.setForegroundColor(settings.color);
    }
    if (settings.size && value && typeof value.setFontSize === 'function') {
      value.setFontSize(settings.size);
    }
    if (typeof settings.bold === 'boolean' && value && typeof value.setBold === 'function') {
      value.setBold(settings.bold);
    }
  } catch (error) {
    Logger.log(`Не удалось применить стиль утвержденного расчета: ${error && error.message ? error.message : error}`);
  }
}

function appendSelectedClaimRecoveriesNarrative_(body, recoveries) {
  const value = recoveries || { valid: [], unallocated: [], invalid: [] };
  if (!value.valid.length && !value.unallocated.length && !value.invalid.length) return;
  body.appendParagraph('Частичные погашения')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  value.valid.forEach((item) => body.appendParagraph(
    `${formatDate_(item.date)} — ${formatClaimAuditAmount_(item.amount)} руб.; `
    + `отнесено к ${item.allocationLabel || 'выбранному требованию'}.`
  ));
  value.unallocated.forEach((item) => body.appendParagraph(
    `Спорное нераспределенное погашение: ${formatDate_(item.date)} — `
    + `${formatClaimAuditAmount_(item.amount)} руб.`
  ));
  value.invalid.forEach((item) => body.appendParagraph(
    `Не учтено: ${(item.errors || []).join('; ')}.`
  ));
}

function updateSelectedClaimDocumentRegistry_(spreadsheet, entry) {
  const constructorLayout = getClaimConstructorLayout_();
  const intakeLayout = getClaimIntakeLayout_();
  const currentRange = spreadsheet.getRangeByName(constructorLayout.outputDoc.namedRange);
  if (!currentRange) throw new Error('Не найдена ячейка текущего расчетного документа.');
  const intake = spreadsheet.getSheetByName(intakeLayout.sheetName);
  if (!intake) throw new Error('Не найден лист истории сформированных Docs.');
  const historyName = intakeLayout.docsHistory.namedRange;
  const namedHistory = spreadsheet.getRangeByName(historyName);
  const historySnapshot = namedHistory ? {
    exists: true,
    sheet: namedHistory.getSheet(),
    row: namedHistory.getRow(),
    column: namedHistory.getColumn(),
    rowCount: namedHistory.getNumRows(),
    columnCount: namedHistory.getNumColumns(),
    values: namedHistory.getValues(),
  } : { exists: false };
  const currentValues = currentRange.getValues();
  const authority = getClaimDocsHistoryRange_(spreadsheet, intake, intakeLayout.docsHistory);
  const authorityRows = authority.getValues();
  const placeholder = authorityRows.length === 1
    && authorityRows[0].every((cell) => cell === '' || cell === null);
  const targetRow = placeholder
    ? intakeLayout.docsHistory.firstRow
    : intakeLayout.docsHistory.firstRow + authorityRows.length;
  const targetRange = intake.getRange(
    targetRow, intakeLayout.docsHistory.firstColumn, 1, intakeLayout.docsHistory.columnCount
  );
  const targetValues = targetRange.getValues();
  try {
    appendClaimDocsHistory_(spreadsheet, entry);
    currentRange.setValue(entry.url);
    SpreadsheetApp.flush();
  } catch (error) {
    const rollbackErrors = [];
    const attempt = (label, callback) => {
      try {
        callback();
      } catch (rollbackError) {
        rollbackErrors.push(`${label}: ${rollbackError && rollbackError.message
          ? rollbackError.message : rollbackError}`);
      }
    };
    attempt('целевая строка истории', () => targetRange.setValues(targetValues));
    if (historySnapshot.exists) {
      const restoredHistory = historySnapshot.sheet.getRange(
        historySnapshot.row, historySnapshot.column,
        historySnapshot.rowCount, historySnapshot.columnCount
      );
      attempt('содержимое истории', () => restoredHistory.setValues(historySnapshot.values));
      attempt('именованный диапазон истории', () =>
        spreadsheet.setNamedRange(historyName, restoredHistory));
    } else {
      attempt('удаление созданного именованного диапазона', () =>
        removeClaimNamedRangeIfPresent_(spreadsheet, historyName));
    }
    attempt('текущая ссылка', () => currentRange.setValues(currentValues));
    attempt('flush отката', () => SpreadsheetApp.flush());
    attempt('проверка отката', () => verifySelectedClaimRegistryRollback_(
      spreadsheet, currentRange, currentValues, historyName, historySnapshot,
      targetRange, targetValues
    ));
    if (rollbackErrors.length) {
      throw new Error(
        `${error && error.message ? error.message : error}. `
        + `Откат реестра не удался: ${rollbackErrors.join('; ')}`
      );
    }
    throw error;
  }
  return { previousExtent: authority.getNumRows(), targetRange };
}

function removeClaimNamedRangeIfPresent_(spreadsheet, name) {
  const named = spreadsheet.getNamedRanges().find((item) => item.getName() === name);
  if (named) named.remove();
}

function verifySelectedClaimRegistryRollback_(
  spreadsheet, currentRange, currentValues, historyName, historySnapshot,
  targetRange, targetValues
) {
  if (!claimRegistryValuesEqual_(currentRange.getValues(), currentValues)) {
    throw new Error('текущая ссылка не восстановлена');
  }
  if (!claimRegistryValuesEqual_(targetRange.getValues(), targetValues)) {
    throw new Error('целевая строка истории не восстановлена');
  }
  const restoredNamed = spreadsheet.getRangeByName(historyName);
  if (!historySnapshot.exists) {
    if (restoredNamed) throw new Error('лишний именованный диапазон истории не удален');
    return;
  }
  if (!restoredNamed
    || restoredNamed.getSheet().getSheetId() !== historySnapshot.sheet.getSheetId()
    || restoredNamed.getRow() !== historySnapshot.row
    || restoredNamed.getColumn() !== historySnapshot.column
    || restoredNamed.getNumRows() !== historySnapshot.rowCount
    || restoredNamed.getNumColumns() !== historySnapshot.columnCount
    || !claimRegistryValuesEqual_(restoredNamed.getValues(), historySnapshot.values)) {
    throw new Error('именованный диапазон истории восстановлен не полностью');
  }
}

function claimRegistryValuesEqual_(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((row, rowIndex) => Array.isArray(row)
    && Array.isArray(right[rowIndex]) && row.length === right[rowIndex].length
    && row.every((value, columnIndex) => {
      const expected = right[rowIndex][columnIndex];
      if (value instanceof Date && expected instanceof Date) {
        return value.getTime() === expected.getTime();
      }
      return value === expected;
    }));
}
