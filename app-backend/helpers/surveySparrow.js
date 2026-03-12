/**
 * SurveySparrow API client using $http.
 * API key and base URL are injected via runtime replacement:
 *   <%=iparams.surveysparrow_api_key%> in headers
 *   <%=iparams.survey_api_base_url%> in URLs
 * The AppNest framework replaces these placeholders when making the request.
 */

/** Auth header value: framework replaces at runtime */
const AUTH_HEADER = 'Bearer <%=iparams.surveysparrow_api_key%>';

/** Base URL for SurveySparrow API: framework replaces at runtime (installation_param survey_api_base_url) */
// const API_BASE_URL = '<%=iparams.survey_api_base_url%>';
const API_BASE_URL = 'https://api.salesparrow.com';

/**
 * @param {{ $http: object }} params
 */
async function getSurveysFromApi({ $http }) {
  console.log('API_BASE_URL', API_BASE_URL);
  console.log("--------------------------------");
  console.log($http);
  console.log("--------------------------------");
  const { data, status } = await $http.request({
    url: `${API_BASE_URL}/v3/surveys`,
    method: 'GET',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: {},
    query: {},
  });
  if (status !== 200) {
    return { error: data?.message || 'Failed to fetch surveys', status };
  }
  return { data: data?.data ?? data };
}

/**
 * @param {{ $http: object, surveyId: string|number }} params
 */
async function getSurveyById({ $http, surveyId }) {
  const { data, status } = await $http.request({
    url: `${API_BASE_URL}/v3/surveys/${surveyId}`,
    method: 'GET',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: {},
    query: {},
  });
  if (status !== 200) {
    return { error: data?.message || 'Failed to fetch survey', status };
  }
  return { data: data?.data ?? data };
}

/**
 * Create a single response/submission.
 * @param {{ $http: object, surveyId: number, answers: Array<{ question_id: number, answer: string }>, submittedAt?: string }} params
 */
async function createResponse({ $http, surveyId, answers, submittedAt }) {
  const body = {
    survey_id: Number(surveyId),
    answers: answers.map((a) => ({
      question_id: a.question_id,
      answer: String(a.answer ?? ''),
    })),
    trigger_workflow: false,
  };
  if (submittedAt) {
    body.meta_data = { date_time: submittedAt };
  }
  const { data, status } = await $http.request({
    url: `${API_BASE_URL}/v3/responses`,
    method: 'POST',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body,
    query: {},
  });
  return { data, status };
}

module.exports = {
  getSurveysFromApi,
  getSurveyById,
  createResponse,
};
