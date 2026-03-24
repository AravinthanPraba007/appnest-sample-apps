/**
 * SurveySparrow Public API client via $http.
 * API key is injected by platform via <%=iparams.surveysparrow_api_key%> in headers.
 */
const { AppnestFunctions } = require('@aravinthan_p/appnest-app-sdk-utils');
const { $http } = AppnestFunctions;

const BASE_URL = 'https://api.salesparrow.com';

/**
 * @param {object} opts - { headers?: object, query?: object }
 * @returns {Promise<{ body: any, status: number }>}
 */
async function request(method, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await $http.request({
    url,
    method,
    headers: {
      Authorization: 'Bearer <%=iparams.surveysparrow_api_key%>',
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    query: opts.query || {},
    body: opts.body,
  });
  const body = typeof res?.body === 'string' ? JSON.parse(res.body || '{}') : (res?.body ?? {});
  const status = res?.status ?? 0;
  return { body, status };
}

async function getSurveys() {
  const { body, status } = await request('GET', '/v3/surveys');
  if (status !== 200) {
    throw new Error(body?.message || `API error ${status}`);
  }
  const raw = body?.data ?? body;
  return Array.isArray(raw) ? raw : (raw?.surveys ?? []);
}

async function getResponses(surveyId, page = 1, perPage = 10) {
  const { body, status } = await request('GET', `/v3/responses`, {
    query: { page: String(page), limit: String(perPage), survey_id: String(surveyId) },
  });
  if (status !== 200) {
    throw new Error(body?.message || `API error ${status}`);
  }
  return body;
}

module.exports = { getSurveys, getResponses, request };
