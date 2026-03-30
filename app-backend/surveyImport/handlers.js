const {
  ResultData,
  AppnestFunctions,
} = require('@aravinthan_p/appnest-sdk-utils');
const {
  MAX_CSV_CHARS,
  MAX_ROWS,
  PREVIEW_ROW_LIMIT,
  BATCH_SIZE,
  FAILURE_LIST_CAP,
  DB_PREFIX,
} = require('./constants');
const { parseCsv } = require('./parseCsv');
const {
  listSurveys,
  fetchAllQuestions,
  createResponse,
} = require('./surveySparrowClient');

const $db = AppnestFunctions.$db;
const $fetch = AppnestFunctions.$fetch;
const $next = AppnestFunctions.$next;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ingestKey(id) {
  return `${DB_PREFIX}:ingest:${id}`;
}

function jobKey(id) {
  return `${DB_PREFIX}:job:${id}`;
}

function idemKey(jobId, rowIndex) {
  return `${DB_PREFIX}:idem:${jobId}:${rowIndex}`;
}

function failuresKey(jobId) {
  return `${DB_PREFIX}:failures:${jobId}`;
}

/** Question types that typically do not accept a free-form "answer" in CSV import */
const SKIP_QUESTION_TYPES = new Set([
  'thank_you',
  'thankyou',
  'thankyoupage',
  'welcome',
  'welcomepage',
  'section',
  'description',
  'statement',
  'divider',
]);

function normalizeType(t) {
  return String(t || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function isMappableQuestion(q) {
  const t = normalizeType(q.type);
  if (SKIP_QUESTION_TYPES.has(t)) return false;
  if (q.parent_question_id && Number(q.parent_question_id) > 0) {
    // Skip matrix sub-rows for v1 — reduces mis-submit risk
    return false;
  }
  return Number(q.id) > 0;
}

function formatQuestionsForClient(questions) {
  return questions.filter(isMappableQuestion).map((q) => {
    const props = q.properties && typeof q.properties === 'object' ? q.properties : {};
    const label =
      props.label ||
      props.question ||
      props.question_txt ||
      props.name ||
      q.description ||
      `Question ${q.id}`;
    return {
      id: q.id,
      type: q.type,
      position: q.position,
      survey_id: q.survey_id,
      label: String(label).replace(/<[^>]+>/g, '').trim() || `Question ${q.id}`,
      required: Boolean(props.required || props.mandatory),
    };
  });
}

async function listSurveysHandler({ payload }) {
  try {
    const page = Math.max(1, Number(payload?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(payload?.limit) || 50));
    const { status, body } = await listSurveys($fetch, { page, limit });
    if (status < 200 || status >= 300) {
      return new ResultData({
        statusCode: status >= 400 ? status : 502,
        body: {
          error: 'Failed to list surveys',
          details: body,
        },
      });
    }
    const surveys = (body?.data || []).map((s) => ({
      id: s.id,
      name: s.name,
      survey_type: s.survey_type,
      archived: s.archived,
    }));
    return {
      surveys,
      has_next_page: Boolean(body?.has_next_page),
      page,
    };
  } catch (e) {
    return new ResultData({
      statusCode: 500,
      body: { error: e.message || 'listSurveys failed' },
    });
  }
}

async function getSurveyQuestionsHandler({ payload }) {
  const surveyId = Number(payload?.surveyId);
  if (!surveyId) {
    return new ResultData({
      statusCode: 400,
      body: { error: 'surveyId is required' },
    });
  }
  try {
    const result = await fetchAllQuestions($fetch, surveyId);
    if (result.error) {
      return new ResultData({
        statusCode: result.status >= 400 ? result.status : 502,
        body: { error: 'Failed to load questions', details: result.body },
      });
    }
    return {
      surveyId,
      questions: formatQuestionsForClient(result.questions),
    };
  } catch (e) {
    return new ResultData({
      statusCode: 500,
      body: { error: e.message || 'getSurveyQuestions failed' },
    });
  }
}

async function ingestCsvHandler({ payload }) {
  const csvText = payload?.csvText;
  if (typeof csvText !== 'string') {
    return new ResultData({
      statusCode: 400,
      body: { error: 'csvText string is required' },
    });
  }
  if (csvText.length > MAX_CSV_CHARS) {
    return new ResultData({
      statusCode: 400,
      body: { error: `CSV exceeds max size (${MAX_CSV_CHARS} characters)` },
    });
  }
  try {
    const rows = parseCsv(csvText);
    if (!rows.length) {
      return new ResultData({
        statusCode: 400,
        body: { error: 'No rows found in CSV' },
      });
    }
    const headers = rows[0].map((h) => String(h).trim());
    const bodyRows = rows.slice(1);
    if (bodyRows.length > MAX_ROWS) {
      return new ResultData({
        statusCode: 400,
        body: {
          error: `Too many data rows (max ${MAX_ROWS}); split your file.`,
        },
      });
    }
    const ingestId = uuid();
    const ingest = {
      headers,
      rows: bodyRows,
      rowCount: bodyRows.length,
      createdAt: new Date().toISOString(),
    };
    await $db.map.set({ key: ingestKey(ingestId), value: ingest });
    const previewRows = bodyRows.slice(0, PREVIEW_ROW_LIMIT).map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] != null ? String(r[idx]) : '';
      });
      return obj;
    });
    return {
      ingestId,
      headers,
      rowCount: bodyRows.length,
      previewRows,
    };
  } catch (e) {
    return new ResultData({
      statusCode: 500,
      body: { error: e.message || 'ingestCsv failed' },
    });
  }
}

/**
 * @param {{ [questionId: string]: string | null }} mapping questionId -> CSV column name, null = skip
 */
async function validateMappingHandler({ payload }) {
  const { ingestId, surveyId, mapping } = payload || {};
  if (!ingestId || !surveyId || !mapping || typeof mapping !== 'object') {
    return new ResultData({
      statusCode: 400,
      body: { error: 'ingestId, surveyId, and mapping are required' },
    });
  }
  const ingest = await $db.map.get({ key: ingestKey(ingestId) });
  if (!ingest || !ingest.headers) {
    return new ResultData({
      statusCode: 404,
      body: { error: 'Ingest not found; upload CSV again.' },
    });
  }
  const qResult = await fetchAllQuestions($fetch, Number(surveyId));
  if (qResult.error) {
    return new ResultData({
      statusCode: 502,
      body: { error: 'Could not load survey questions', details: qResult.body },
    });
  }
  const mappable = formatQuestionsForClient(qResult.questions);
  const headerSet = new Set(ingest.headers);
  const errors = [];

  for (const q of mappable) {
    const key = String(q.id);
    const col = mapping[key];
    if (col == null || col === '') {
      if (q.required) {
        errors.push({
          questionId: q.id,
          message: `Required question "${q.label}" is not mapped.`,
        });
      }
      continue;
    }
    if (col === '__skip__') continue;
    if (!headerSet.has(col)) {
      errors.push({
        questionId: q.id,
        message: `Column "${col}" is not in the CSV for question "${q.label}".`,
      });
    }
  }

  let mappedAny = false;
  for (const q of mappable) {
    const col = mapping[String(q.id)];
    if (col && col !== '__skip__') mappedAny = true;
  }
  if (!mappedAny) {
    errors.push({
      questionId: null,
      message: 'Map at least one question to a CSV column.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function rowToAnswers(headers, rowCells, mapping, surveyIdNum) {
  const headerIndex = {};
  headers.forEach((h, i) => {
    headerIndex[h] = i;
  });
  const answers = [];
  for (const [qid, col] of Object.entries(mapping)) {
    if (col == null || col === '' || col === '__skip__') continue;
    const idx = headerIndex[col];
    if (idx === undefined) continue;
    const raw = rowCells[idx];
    const answer = raw == null ? '' : String(raw).trim();
    if (answer === '') continue;
    answers.push({
      question_id: Number(qid),
      answer,
    });
  }
  return {
    survey_id: surveyIdNum,
    answers,
    trigger_workflow: true,
  };
}

async function recordFailure(jobId, rowIndex, message, details) {
  const key = failuresKey(jobId);
  const entry = JSON.stringify({
    rowIndex,
    message,
    details: details || null,
    at: new Date().toISOString(),
  });
  try {
    let list = (await $db.list.get({ key })) || [];
    if (!Array.isArray(list)) list = [];
    list.push(entry);
    while (list.length > FAILURE_LIST_CAP) list.shift();
    await $db.list.set({ key, value: list });
  } catch {
    /* best-effort */
  }
}

async function startImportJobHandler({ payload }) {
  const { ingestId, surveyId, mapping } = payload || {};
  if (!ingestId || !surveyId || !mapping) {
    return new ResultData({
      statusCode: 400,
      body: { error: 'ingestId, surveyId, and mapping are required' },
    });
  }
  const validation = await validateMappingHandler({ payload });
  if (validation?.statusCode >= 400) return validation;
  if (validation.valid !== true) {
    return new ResultData({
      statusCode: 400,
      body: {
        error: 'Invalid mapping',
        errors: validation.errors || [],
      },
    });
  }

  const ingest = await $db.map.get({ key: ingestKey(ingestId) });
  if (!ingest) {
    return new ResultData({
      statusCode: 404,
      body: { error: 'Ingest expired or missing' },
    });
  }

  const jobId = uuid();
  const job = {
    jobId,
    ingestId,
    surveyId: Number(surveyId),
    mapping,
    cursor: 0,
    status: 'running',
    succeeded: 0,
    failed: 0,
    skipped: 0,
    totalRows: ingest.rows.length,
    createdAt: new Date().toISOString(),
    cancelled: false,
  };
  await $db.map.set({ key: jobKey(jobId), value: job });

  await $next.run({
    functionName: 'processImportBatch',
    payload: { jobId },
    delay: 0,
  });

  return { jobId, status: 'running', totalRows: job.totalRows };
}

async function processImportBatchHandler({ payload }) {
  const jobId = payload?.jobId;
  if (!jobId) {
    return new ResultData({
      statusCode: 400,
      body: { error: 'jobId is required' },
    });
  }

  const job = await $db.map.get({ key: jobKey(jobId) });
  if (!job) {
    return new ResultData({ statusCode: 404, body: { error: 'Job not found' } });
  }
  if (job.cancelled) {
    return { jobId, done: true, status: 'cancelled' };
  }
  if (job.status === 'completed' || job.status === 'failed') {
    return { jobId, done: true, status: job.status };
  }

  const ingest = await $db.map.get({ key: ingestKey(job.ingestId) });
  if (!ingest) {
    job.status = 'failed';
    await $db.map.set({ key: jobKey(jobId), value: job });
    return new ResultData({
      statusCode: 500,
      body: { error: 'Ingest missing during import' },
    });
  }

  const { headers, rows } = ingest;
  const surveyIdNum = Number(job.surveyId);
  const end = Math.min(job.cursor + BATCH_SIZE, rows.length);

  for (let i = job.cursor; i < end; i++) {
    const fresh = await $db.map.get({ key: jobKey(jobId) });
    if (fresh?.cancelled) {
      job.cancelled = true;
      job.status = 'cancelled';
      await $db.map.set({ key: jobKey(jobId), value: job });
      return { jobId, done: true, status: 'cancelled' };
    }

    const idemK = idemKey(jobId, i);
    const already = await $db.string.get({ key: idemK });
    if (already) {
      job.succeeded++;
      continue;
    }

    const answersPayload = rowToAnswers(
      headers,
      rows[i],
      job.mapping,
      surveyIdNum
    );
    if (!answersPayload.answers.length) {
      job.skipped++;
      continue;
    }

    const { status, body } = await createResponse($fetch, answersPayload);
    if (status >= 200 && status < 300) {
      const extId =
        body && body.data && body.data.id != null
          ? String(body.data.id)
          : 'ok';
      await $db.string.set({ key: idemK, value: extId });
      job.succeeded++;
    } else {
      job.failed++;
      const msg =
        (body &&
          (body.message || body.error || body.errors?.[0]?.message)) ||
        `HTTP ${status}`;
      await recordFailure(jobId, i + 1, String(msg), body);
      if (status === 401 || status === 403) {
        job.status = 'failed';
        job.lastError = msg;
        job.cursor = end;
        await $db.map.set({ key: jobKey(jobId), value: job });
        return { jobId, done: true, status: 'failed' };
      }
    }
  }

  job.cursor = end;
  if (end >= rows.length) {
    job.status = 'completed';
    await $db.map.set({ key: jobKey(jobId), value: job });
    return {
      jobId,
      done: true,
      status: 'completed',
      succeeded: job.succeeded,
      failed: job.failed,
      skipped: job.skipped,
    };
  }

  await $db.map.set({ key: jobKey(jobId), value: job });
  await $next.run({
    functionName: 'processImportBatch',
    payload: { jobId },
    delay: 1,
  });
  return {
    jobId,
    done: false,
    status: 'running',
    cursor: job.cursor,
    succeeded: job.succeeded,
    failed: job.failed,
    skipped: job.skipped,
  };
}

async function getImportJobStatusHandler({ payload }) {
  const jobId = payload?.jobId;
  if (!jobId) {
    return new ResultData({
      statusCode: 400,
      body: { error: 'jobId is required' },
    });
  }
  const job = await $db.map.get({ key: jobKey(jobId) });
  if (!job) {
    return new ResultData({ statusCode: 404, body: { error: 'Job not found' } });
  }
  let failures = [];
  try {
    const raw = await $db.list.get({ key: failuresKey(jobId) });
    if (Array.isArray(raw)) {
      failures = raw
        .slice(-100)
        .map((s) => {
          try {
            return JSON.parse(s);
          } catch {
            return { message: String(s) };
          }
        })
        .reverse();
    }
  } catch {
    failures = [];
  }
  return {
    jobId: job.jobId,
    status: job.status,
    cursor: job.cursor,
    totalRows: job.totalRows,
    succeeded: job.succeeded,
    failed: job.failed,
    skipped: job.skipped,
    lastError: job.lastError || null,
    failures,
  };
}

async function cancelImportJobHandler({ payload }) {
  const jobId = payload?.jobId;
  if (!jobId) {
    return new ResultData({
      statusCode: 400,
      body: { error: 'jobId is required' },
    });
  }
  const job = await $db.map.get({ key: jobKey(jobId) });
  if (!job) {
    return new ResultData({ statusCode: 404, body: { error: 'Job not found' } });
  }
  job.cancelled = true;
  if (job.status === 'running') job.status = 'cancelled';
  await $db.map.set({ key: jobKey(jobId), value: job });
  return { ok: true, jobId };
}

module.exports = {
  listSurveys: listSurveysHandler,
  getSurveyQuestions: getSurveyQuestionsHandler,
  ingestCsv: ingestCsvHandler,
  validateMapping: validateMappingHandler,
  startImportJob: startImportJobHandler,
  processImportBatch: processImportBatchHandler,
  getImportJobStatus: getImportJobStatusHandler,
  cancelImportJob: cancelImportJobHandler,
};
