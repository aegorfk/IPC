const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const salaryCode = fs.readFileSync('google-apps-script/SalaryIndexation.gs', 'utf8');
const zupImportCode = fs.readFileSync('google-apps-script/ZupImport.gs', 'utf8');

function createResponse(code, body) {
  return {
    getResponseCode: () => code,
    getContentText: (encoding) => {
      assert.strictEqual(encoding, 'UTF-8');
      return body;
    },
  };
}

function createHarness() {
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
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: () => '',
      }),
    },
    RegExp,
    Session: { getScriptTimeZone: () => 'Europe/Moscow' },
    String,
    UrlFetchApp: { fetch() {} },
    Utilities: {
      formatDate(date, timezone, format) {
        assert.strictEqual(format, 'dd.MM.yyyy');
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(salaryCode, context);
  vm.runInContext(zupImportCode, context);

  const state = {
    apiKey: 'test-key',
    currentResponse: null,
    fetches: [],
    requestResult: {
      payload: {
        model: 'test-model',
        messages: [{ role: 'user', content: 'test input' }],
      },
    },
    traces: [],
  };

  context.getZupPolzaApiKey_ = () => state.apiKey;
  context.getZupVlmModel_ = () => 'test-model';
  context.buildZupVlmRequest_ = () => state.requestResult;
  context.createZupLangfuseTraceContext_ = () => ({ traceId: 'trace-1' });
  context.sendZupLangfuseVlmTrace_ = (trace, data) => state.traces.push({ trace, data });
  context.UrlFetchApp.fetch = (url, options) => {
    state.fetches.push({ url, options });
    return state.currentResponse;
  };

  return {
    context,
    state,
    file: {
      getName: () => 'response-test.pdf',
      getMimeType: () => 'application/pdf',
      getBlob: () => ({ getBytes: () => [1, 2, 3] }),
      getSize: () => 3,
    },
  };
}

function createExtractedPayload() {
  return {
    slips: [
      {
        employee: 'Иванов Иван Иванович',
        company: 'ООО Ромашка',
        period: '10.2023',
        year: 2023,
        month: 10,
        totals: { accrued: 100, paid: 0, withheld: 0 },
        rows: [
          {
            section: 'Начислено',
            category: 'Оклад',
            kind: 'Оплата по окладу',
            period: '10.2023',
            accrued: 100,
            paid: 0,
            withheld: 0,
            sourceText: 'Оплата по окладу 100,00',
          },
        ],
        warnings: [],
      },
    ],
    warnings: [],
  };
}

function parseErrorText(value) {
  try {
    JSON.parse(value);
  } catch (error) {
    return String(error);
  }
  throw new Error('Expected invalid JSON');
}

{
  const payload = createExtractedPayload();
  const envelope = { choices: [{ message: { content: JSON.stringify(payload) } }] };
  const decoded = createHarness().context.decodeZupVlmResponse_(
    createResponse(200, JSON.stringify(envelope))
  );

  assert.strictEqual(decoded.ok, true);
  assert.strictEqual(JSON.stringify(decoded.envelope), JSON.stringify(envelope));
  assert.strictEqual(JSON.stringify(decoded.extracted), JSON.stringify(payload));
}

{
  const envelope = { choices: [{ message: {} }] };
  const body = JSON.stringify(envelope);
  const decoded = createHarness().context.decodeZupVlmResponse_(createResponse(200, body));

  assert.strictEqual(decoded.ok, false);
  assert.strictEqual(decoded.warning, 'Polza VLM не вернула message.content.');
  assert.strictEqual(JSON.stringify(decoded.traceResponse), JSON.stringify(envelope));
  assert.strictEqual(decoded.logPayload, body);
}

{
  const harness = createHarness();
  const startedAt = new Date(2026, 6, 10, 12, 0, 0);
  const failure = {
    warning: 'Ошибка декодирования',
    traceResponse: { invalid: true },
    logPayload: 'raw failure payload',
  };

  const parsed = harness.context.buildZupVlmResponseFailure_(
    harness.file,
    'test-model',
    { traceId: 'trace-1' },
    harness.state.requestResult.payload,
    startedAt,
    failure
  );

  assert.deepStrictEqual(Array.from(parsed.warnings), [failure.warning]);
  assert.strictEqual(parsed.vlmRows[0][9], 'trace-1');
  assert.strictEqual(parsed.vlmRows[0][11], failure.logPayload);
  assert.strictEqual(harness.state.traces.length, 1);
  assert.strictEqual(harness.state.traces[0].data.status, 'ERROR');
  assert.strictEqual(harness.state.traces[0].data.statusMessage, failure.warning);
  assert.deepStrictEqual(harness.state.traces[0].data.response, failure.traceResponse);
  assert.strictEqual(harness.state.traces[0].data.startedAt, startedAt);
}

function assertSuccessfulResponse(content) {
  const harness = createHarness();
  const envelope = {
    choices: [{ message: { content } }],
    usage: { cost_rub: 1.25 },
  };
  harness.state.currentResponse = createResponse(200, JSON.stringify(envelope));

  const parsed = harness.context.parseZupWithPolzaVlm_(harness.file, null, {});

  assert.strictEqual(parsed.rows.length, 1);
  assert.strictEqual(parsed.rows[0][16], 100);
  assert.strictEqual(parsed.vlmRows[0][3], 'OK');
  assert.strictEqual(parsed.vlmRows[0][9], 'trace-1');
  assert.strictEqual(parsed.vlmRows[0][11], JSON.stringify(createExtractedPayload()));
  assert.strictEqual(harness.state.fetches.length, 1);
  assert.strictEqual(
    harness.state.fetches[0].url,
    vm.runInContext('ZUP_IMPORT_SETTINGS.POLZA_ENDPOINT', harness.context)
  );
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(harness.state.fetches[0].options)),
    {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer test-key' },
      payload: JSON.stringify(harness.state.requestResult.payload),
      muteHttpExceptions: true,
    }
  );
  assert.strictEqual(harness.state.traces.length, 1);
  assert.strictEqual(harness.state.traces[0].data.status, 'OK');
  assert.deepStrictEqual(harness.state.traces[0].data.request, harness.state.requestResult.payload);
  assert.deepStrictEqual(harness.state.traces[0].data.response, createExtractedPayload());
  assert.strictEqual(harness.state.traces[0].data.envelope._zupForceVlm, false);
  assert.strictEqual(harness.state.traces[0].data.envelope._zupForceReason, undefined);
  assert.strictEqual(harness.state.traces[0].data.rows.length, 1);
  assert.deepStrictEqual(
    Array.from(harness.state.traces[0].data.warnings),
    Array.from(parsed.warnings)
  );
  assert.ok(harness.state.traces[0].data.startedAt instanceof Date);
  assert.ok(harness.state.traces[0].data.endedAt instanceof Date);
}

function assertFailedResponse({ response, warning, traceResponse, logPayload }) {
  const harness = createHarness();
  harness.state.currentResponse = response;

  const parsed = harness.context.parseZupWithPolzaVlm_(harness.file, null, {});

  assert.strictEqual(parsed.rows.length, 0);
  assert.deepStrictEqual(Array.from(parsed.warnings), [warning]);
  assert.strictEqual(parsed.vlmRows[0][3], 'Ошибка');
  assert.strictEqual(parsed.vlmRows[0][9], 'trace-1');
  assert.strictEqual(parsed.vlmRows[0][11], logPayload);
  assert.strictEqual(harness.state.fetches.length, 1);
  assert.strictEqual(harness.state.traces.length, 1);
  assert.strictEqual(harness.state.traces[0].data.status, 'ERROR');
  assert.strictEqual(harness.state.traces[0].data.statusMessage, warning);
  assert.deepStrictEqual(harness.state.traces[0].data.request, harness.state.requestResult.payload);
  assert.deepStrictEqual(harness.state.traces[0].data.response, traceResponse);
  assert.deepStrictEqual(Array.from(harness.state.traces[0].data.warnings), [warning]);
}

{
  const harness = createHarness();
  harness.state.apiKey = '';

  const parsed = harness.context.parseZupWithPolzaVlm_(harness.file, null, {});

  assert.deepStrictEqual(Array.from(parsed.warnings), [
    'VLM fallback не запущен: задайте Script property POLZA_API_KEY.',
  ]);
  assert.strictEqual(harness.state.fetches.length, 0);
  assert.strictEqual(harness.state.traces.length, 0);
}

{
  const harness = createHarness();
  harness.state.requestResult = { warning: 'Файл слишком большой для VLM.' };

  const parsed = harness.context.parseZupWithPolzaVlm_(harness.file, null, {});

  assert.deepStrictEqual(Array.from(parsed.warnings), ['Файл слишком большой для VLM.']);
  assert.strictEqual(harness.state.fetches.length, 0);
  assert.strictEqual(harness.state.traces.length, 0);
}

{
  const payload = createExtractedPayload();
  assertSuccessfulResponse(JSON.stringify(payload));
  assertSuccessfulResponse(payload);
}

{
  const body = 'upstream failed';
  assertFailedResponse({
    response: createResponse(502, body),
    warning: 'Polza VLM вернула HTTP 502: upstream failed',
    traceResponse: body,
    logPayload: body,
  });
}

{
  const body = '{invalid-envelope';
  assertFailedResponse({
    response: createResponse(200, body),
    warning: `Polza VLM вернула не-JSON ответ: ${parseErrorText(body)}`,
    traceResponse: body,
    logPayload: body,
  });
}

{
  const envelope = { choices: [{ message: {} }] };
  const body = JSON.stringify(envelope);
  assertFailedResponse({
    response: createResponse(200, body),
    warning: 'Polza VLM не вернула message.content.',
    traceResponse: envelope,
    logPayload: body,
  });
}

{
  const content = '{invalid-content';
  const body = JSON.stringify({ choices: [{ message: { content } }] });
  assertFailedResponse({
    response: createResponse(200, body),
    warning: `Polza VLM вернула content, который не парсится как JSON: ${parseErrorText(content)}`,
    traceResponse: content,
    logPayload: content,
  });
}

console.log('vlm response logic ok');
