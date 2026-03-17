/**
 * SurveySparrow Response Viewer — backend API handlers.
 * Uses AppNest $http, $db, and $file (survey cache, response backups as CSV).
 */
const { AppnestFunctions, ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { $http, $db, $file } = AppnestFunctions;

const SURVEYS_CACHE_KEY = 'surveys_cache';
const BACKUPS_LIST_KEY = 'response_backups';
const BACKUPS_PATH_PREFIX = 'backups/';
const FILE_VISIBILITY = 'PRIVATE';

/** Normalize $db.list.get response: platform may return { data }, { value }, or the array itself. */
function normalizeListGetResponse(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.value)) return result.value;
  return [];
}
const hardcodedBaseUrl = true;
const BASE_URL = hardcodedBaseUrl ? 'https://api.salesparrow.com' : '<%=iparams.survey_sparrow_base_url%>';

/**
 * Fetch survey list from SurveySparrow API (used by syncSurveys).
 */
async function fetchSurveysFromApi() {
  const { data, status } = await $http.request({
    url: `${BASE_URL}/v3/surveys`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer <%=iparams.surveysparrow_api_key%>',
      'Content-Type': 'application/json',
    },
    body: {},
    query: {},
  });

  if (status !== 200) {
    throw new Error(data?.message || 'Failed to fetch surveys');
  }

  return Array.isArray(data?.data) ? data.data : (data?.data ? [data.data] : []);
}

/**
 * Get survey list from cache ($db). Returns cached list or empty array.
 */
async function getSurveys({ payload }) {
  try {
    const result = await $db.list.get({ key: SURVEYS_CACHE_KEY });
    const surveys = normalizeListGetResponse(result);
    return new ResultData({
      body: { surveys },
      statusCode: 200,
    });
  } catch (err) {
    return new ResultData({
      body: { surveys: [] },
      statusCode: 200,
    });
  }
}

/**
 * Sync survey list: fetch latest from SurveySparrow API and save to $db cache.
 * Try update first (key usually exists after first sync); if update fails, create; if create says "already exists", update.
 */
async function syncSurveys({ payload }) {
  try {
    const surveys = await fetchSurveysFromApi();

    try {
      await $db.list.update({ key: SURVEYS_CACHE_KEY, value: surveys });
    } catch (updateErr) {
      try {
        await $db.list.create({ key: SURVEYS_CACHE_KEY, value: surveys });
      } catch (createErr) {
        const msg = createErr?.response?.data?.message || '';
        console.log("-------------msg starts-------------------");
        console.log(msg);
        console.log("-------------msg ends-------------------");
        if (/already exists|key exists/i.test(msg)) {
          await $db.list.update({ key: SURVEYS_CACHE_KEY, value: surveys });
        } else {
          throw createErr;
        }
      }
    }

    return new ResultData({
      body: { surveys },
      statusCode: 200,
    });
  } catch (err) {
    const message = err?.message || 'Failed to sync surveys';
    return new ResultData({
      body: { error: message },
      statusCode: 502,
    });
  }
}

/**
 * Fetch one page of responses for a survey.
 * GET /v3/responses?survey_id=&page=&limit=
 * Payload: { surveyId: string, page: number, perPage?: number }
 */
async function getSurveyResponses({ payload }) {
  const { surveyId, page = 1, perPage = 10 } = payload || {};
  if (!surveyId) {
    return new ResultData({
      body: { error: 'surveyId is required' },
      statusCode: 400,
    });
  }

  try {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(perPage) || 10));
    const { data, status } = await $http.request({
      url: `${BASE_URL}/v3/responses`,
      method: 'GET',
      headers: {
        Authorization: 'Bearer <%=iparams.surveysparrow_api_key%>',
        'Content-Type': 'application/json',
      },
      body: {},
      query: {
        survey_id: String(surveyId),
        page: String(pageNum),
        limit: String(limitNum),
      },
    });

    if (status !== 200) {
      return new ResultData({
        body: { error: data?.message || 'Failed to fetch responses', status },
        statusCode: status >= 400 ? status : 502,
      });
    }

    const responses = Array.isArray(data?.data) ? data.data : (data?.data ? [data.data] : []);
    const total = typeof data?.total_count === 'number' ? data.total_count : responses.length;

    return new ResultData({
      body: {
        responses,
        meta: {
          page: pageNum,
          per_page: limitNum,
          total,
          has_next_page: Boolean(data?.has_next_page),
        },
      },
      statusCode: 200,
    });
  } catch (err) {
    const message = err?.message || 'API request failed';
    const statusCode = err?.statusCode || err?.status || 500;
    return new ResultData({
      body: { error: message },
      statusCode: typeof statusCode === 'number' ? statusCode : 500,
    });
  }
}

// --- Response backup (CSV) via $file ---

function escapeCsvCell(value) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Fetch all pages of responses for a survey.
 */
async function fetchAllResponses(surveyId) {
  const all = [];
  let page = 1;
  const limit = 100;
  let hasNext = true;

  while (hasNext) {
    const { data, status } = await $http.request({
      url: `${BASE_URL}/v3/responses`,
      method: 'GET',
      headers: {
        Authorization: 'Bearer <%=iparams.surveysparrow_api_key%>',
        'Content-Type': 'application/json',
      },
      body: {},
      query: {
        survey_id: String(surveyId),
        page: String(page),
        limit: String(limit),
      },
    });

    if (status !== 200) throw new Error(data?.message || 'Failed to fetch responses');

    const chunk = Array.isArray(data?.data) ? data.data : (data?.data ? [data.data] : []);
    all.push(...chunk);
    hasNext = Boolean(data?.has_next_page);
    if (chunk.length < limit) break;
    page += 1;
  }

  return all;
}

/**
 * Build CSV string from responses. One row per response; columns: Response ID, Submitted At, then one column per question (by question_id).
 */
function buildResponsesCsv(responses) {
  const questionKeys = []; // [ { id, text } ] in order
  const seen = new Set();

  responses.forEach((r) => {
    (r?.answers ?? []).forEach((a) => {
      const id = a?.question_id ?? a?.question ?? '';
      if (id === '') return;
      const key = String(id);
      if (seen.has(key)) return;
      seen.add(key);
      questionKeys.push({ id: key, text: (a?.question || `Q${id}`).replace(/"/g, '""') });
    });
  });

  const header = ['Response ID', 'Submitted At', ...questionKeys.map((q) => q.text)];
  const rows = [header.map(escapeCsvCell).join(',')];

  function getAnswer(resp, qId) {
    const ans = (resp?.answers ?? []).find((a) => String(a?.question_id ?? '') === qId);
    if (!ans) return '';
    if (ans.skipped) return '(Skipped)';
    const a = ans?.answer ?? ans;
    if (Array.isArray(a)) return a.map((x) => (x?.answer != null ? x.answer : x)).join('; ');
    if (a != null && typeof a === 'object' && a.answer !== undefined) return String(a.answer);
    return String(a ?? '');
  }

  responses.forEach((r) => {
    const completed = r?.completed_time ? new Date(r.completed_time).toISOString() : '';
    const row = [
      escapeCsvCell(r?.id ?? ''),
      escapeCsvCell(completed),
      ...questionKeys.map((q) => escapeCsvCell(getAnswer(r, q.id))),
    ];
    rows.push(row.join(','));
  });

  return '\uFEFF' + rows.join('\r\n'); // BOM for Excel
}

/**
 * Create a CSV backup of all responses for a survey and store in $file. Saves metadata to $db for list view.
 * Payload: { surveyId: string, surveyName?: string }
 */
async function createBackupCsv({ payload }) {
  const { surveyId, surveyName = 'Survey' } = payload || {};
  if (!surveyId) {
    return new ResultData({ body: { error: 'surveyId is required' }, statusCode: 400 });
  }

  try {
    const responses = await fetchAllResponses(surveyId);
    const csv = buildResponsesCsv(responses);

    const filename = `survey_${surveyId}_${Date.now()}.csv`;
    const path = BACKUPS_PATH_PREFIX + filename;

    const uploadResult = await $file.getUploadUrl({ path, visibility: FILE_VISIBILITY });
    console.log("-------------uploadResult starts-------------------");
    console.log(uploadResult);
    console.log("-------------uploadResult ends-------------------");
    const uploadUrl = uploadResult?.data?.preSignedUrl ?? uploadResult?.data ?? uploadResult?.uploadUrl;
    if (!uploadUrl) throw new Error('Failed to get upload URL');

    // await $http.request({
    //   url: uploadUrl,
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'text/csv' },
    //   body: typeof csv === 'string' ? csv : { content: csv },
    //   query: {},
    // });

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "text/csv",
      },
      body: csv,
    });

    const createdAt = new Date().toISOString();
    const entry = { path, surveyId, surveyName, createdAt, filename };

    try {
      const listResult = await $db.list.get({ key: BACKUPS_LIST_KEY });
      const list = normalizeListGetResponse(listResult).slice();
      list.unshift(entry);
      await $db.list.update({ key: BACKUPS_LIST_KEY, value: list });
    } catch (e) {
      await $db.list.create({ key: BACKUPS_LIST_KEY, value: [entry] });
    }

    return new ResultData({
      body: { path, filename, createdAt, count: responses.length },
      statusCode: 200,
    });
  } catch (err) {
    const message = err?.message || 'Failed to create backup';
    return new ResultData({ body: { error: message }, statusCode: 502 });
  }
}

/**
 * List backup files (from $db metadata). Returns { backups: [{ path, surveyId, surveyName, createdAt, filename }] }
 */
async function listBackups({ payload }) {
  try {
    const result = await $db.list.get({ key: BACKUPS_LIST_KEY });
    const backups = normalizeListGetResponse(result);
    return new ResultData({ body: { backups }, statusCode: 200 });
  } catch (err) {
    return new ResultData({ body: { backups: [] }, statusCode: 200 });
  }
}

/**
 * Get a signed download URL for a backup file. Payload: { path: string }
 */
async function getBackupDownloadUrl({ payload }) {
  const { path } = payload || {};
  if (!path) {
    return new ResultData({ body: { error: 'path is required' }, statusCode: 400 });
  }

  try {
    const result = await $file.getDownloadUrl({ path, visibility: FILE_VISIBILITY });
    const downloadUrl = result?.data?.url ?? result?.data ?? result?.downloadUrl;
    if (!downloadUrl) throw new Error('Failed to get download URL');
    return new ResultData({ body: { downloadUrl }, statusCode: 200 });
  } catch (err) {
    return new ResultData({
      body: { error: err?.message || 'Download not available' },
      statusCode: 404,
    });
  }
}

module.exports = { getSurveys, getSurveyResponses, syncSurveys, createBackupCsv, listBackups, getBackupDownloadUrl };
