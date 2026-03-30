function loadSdk() {
  try {
    return require('@sparrowengg/appnest-app-sdk-utils');
  } catch {
    return require('@aravinthan_p/appnest-sdk-utils');
  }
}

const { AppnestFunctions, ResultData } = loadSdk();

const { $fetch, getTraceId } = AppnestFunctions;

function parseBody(body) {
  if (body == null) return null;
  if (typeof body === 'object' && body !== null) return body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeListResponse(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  if (!Array.isArray(out.contacts) && Array.isArray(out.data)) {
    out.contacts = out.data;
  }
  if (out.hasNextPage == null && out.has_next_page != null) {
    out.hasNextPage = out.has_next_page;
  }
  return out;
}

async function listSurveySparrowContacts({ payload = {} }) {
  const traceId = getTraceId();
  const page = Number(payload.page) > 0 ? Number(payload.page) : 1;
  const rawMax = Number(payload.maxResults);
  const maxResults = Math.min(100, Math.max(1, Number.isFinite(rawMax) ? rawMax : 50));

  const params = new URLSearchParams({
    page: String(page),
    maxResults: String(maxResults),
  });

  const search = payload.search != null ? String(payload.search).trim() : '';
  if (search) params.set('search', search);

  const type = payload.type;
  if (type === 'active' || type === 'unsubscribed' || type === 'bounced') {
    params.set('type', type);
  }

  const url = `https://api.salesparrow.com/v1/contacts?${params.toString()}`;

  try {
    const res = await $fetch.request({
      url,
      method: 'GET',
      headers: {
        Authorization: 'Bearer <%=installation_parameters.surveysparrow_api_key%>',
        Accept: 'application/json',
      },
      body: {},
      options: { maxAttempts: 3 },
    });

    const raw = parseBody(res.body);
    const data = normalizeListResponse(raw);

    if (res.status >= 200 && res.status < 300 && data) {
      return data;
    }

    const message =
      (raw && (raw.message || raw.error || raw.errors)) ||
      (data && (data.message || data.error)) ||
      `SurveySparrow returned status ${res.status}`;

    return new ResultData({
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
      body: { message: String(message), traceId },
    });
  } catch {
    return new ResultData({
      statusCode: 500,
      body: {
        message: 'Failed to load contacts. Try again later.',
        traceId,
      },
    });
  }
}

module.exports = { listSurveySparrowContacts };
