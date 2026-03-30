const { AppnestFunctions, ResultData } = require('@sparrowengg/appnest-app-sdk-utils');

const { $fetch, getTraceId } = AppnestFunctions;

const BASE_URL = 'https://api.salesparrow.com';

function parseBody(body) {
  if (body == null || body === '') return null;
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function errorMessage(body, status) {
  const json = parseBody(body);
  if (json && typeof json === 'object') {
    if (json.message) return String(json.message);
    if (json.error) return String(json.error);
  }
  if (typeof body === 'string' && body.length > 0 && body.length < 500) return body;
  return `SurveySparrow request failed (${status})`;
}

async function getContacts({ payload = {} }) {
  const traceId = getTraceId();
  const page = Math.max(1, parseInt(payload.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(payload.limit, 10) || 25));

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  const search = payload.search != null && String(payload.search).trim();
  if (search) params.set('search', search);

  if (payload.contact_list_id != null && payload.contact_list_id !== '') {
    params.set('contact_list_id', String(payload.contact_list_id));
  }

  if (payload.type && ['unsubscribed', 'active', 'bounced'].includes(payload.type)) {
    params.set('type', payload.type);
  }

  if (payload.contact_type && ['contact', 'employee'].includes(payload.contact_type)) {
    params.set('contact_type', payload.contact_type);
  }

  if (payload.created_date_gte) {
    params.set('created_date.gte', String(payload.created_date_gte));
  }
  if (payload.created_date_lte) {
    params.set('created_date.lte', String(payload.created_date_lte));
  }

  const url = `${BASE_URL}/v3/contacts?${params.toString()}`;

  const res = await $fetch.request({
    url,
    method: 'GET',
    headers: {
      Authorization: 'Bearer <%=installation_parameters.surveysparrow_api_key%>',
      Accept: 'application/json',
    },
    body: {},
  });

  if (res.status < 200 || res.status >= 300) {
    return new ResultData({
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
      body: {
        message: errorMessage(res.body, res.status),
        traceId,
      },
    });
  }

  const json = parseBody(res.body);
  if (!json || typeof json !== 'object') {
    return new ResultData({
      statusCode: 502,
      body: { message: 'Invalid response from SurveySparrow', traceId },
    });
  }

  return {
    contacts: Array.isArray(json.data) ? json.data : [],
    has_next_page: Boolean(json.has_next_page),
    page,
    limit,
  };
}

async function getContactLists({ payload: _payload = {} }) {
  const traceId = getTraceId();

  const res = await $fetch.request({
    url: `${BASE_URL}/v3/contact_lists`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer <%=installation_parameters.surveysparrow_api_key%>',
      Accept: 'application/json',
    },
    body: {},
  });

  if (res.status < 200 || res.status >= 300) {
    return new ResultData({
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
      body: {
        message: errorMessage(res.body, res.status),
        traceId,
      },
    });
  }

  const json = parseBody(res.body);
  if (!json || typeof json !== 'object') {
    return new ResultData({
      statusCode: 502,
      body: { message: 'Invalid response from SurveySparrow', traceId },
    });
  }

  return {
    contact_lists: Array.isArray(json.data) ? json.data : [],
  };
}

module.exports = { getContacts, getContactLists };
