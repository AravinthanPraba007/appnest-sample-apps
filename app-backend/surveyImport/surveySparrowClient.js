const { API_BASE, AUTH_HEADER_TEMPLATE } = require('./constants');

/**
 * @param {*} $fetch Appnest $fetch
 * @param {string} pathQuery path starting with /v3/...
 */
async function ssRequest($fetch, method, pathQuery, bodyObj) {
  const url = `${API_BASE}${pathQuery}`;
  const headers = {
    Authorization: AUTH_HEADER_TEMPLATE,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const write = method === 'POST' || method === 'PUT' || method === 'PATCH';
  const body = write
    ? JSON.stringify(bodyObj != null ? bodyObj : {})
    : {};
  const res = await $fetch.request({
    url,
    method,
    headers,
    body,
    options: { maxAttempts: 2 },
  });
  let parsed = res.body;
  if (typeof parsed === 'string') {
    try {
      parsed = parsed ? JSON.parse(parsed) : null;
    } catch {
      parsed = { _raw: res.body };
    }
  }
  return { status: res.status, body: parsed, headers: res.headers };
}

async function listSurveys($fetch, { page = 1, limit = 50 } = {}) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(100, Math.max(1, limit))),
  });
  return ssRequest($fetch, 'GET', `/v3/surveys?${q}`, {});
}

async function listQuestions($fetch, surveyId, page = 1) {
  const q = new URLSearchParams({
    survey_id: String(surveyId),
    page: String(page),
    limit: '100',
  });
  return ssRequest($fetch, 'GET', `/v3/questions?${q}`, {});
}

async function fetchAllQuestions($fetch, surveyId) {
  let page = 1;
  /** @type {any[]} */
  const all = [];
  let hasNext = true;
  while (hasNext) {
    const { status, body } = await listQuestions($fetch, surveyId, page);
    if (status < 200 || status >= 300) {
      return { error: true, status, body };
    }
    const chunk = (body && body.data) || [];
    all.push(...chunk);
    hasNext = Boolean(body && body.has_next_page);
    page++;
    if (page > 200) break;
  }
  return { error: false, questions: all };
}

async function createResponse($fetch, payload) {
  return ssRequest($fetch, 'POST', '/v3/responses', payload);
}

module.exports = {
  ssRequest,
  listSurveys,
  fetchAllQuestions,
  createResponse,
};
