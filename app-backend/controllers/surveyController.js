const { AppnestFunctions, ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { $db } = AppnestFunctions;
const { getSurveys: fetchSurveysFromApi, getResponses } = require('../helpers/surveyApi');

const SURVEYS_LIST_KEY = 'surveys_list';
const SURVEYS_LAST_SYNC_KEY = 'surveys_last_sync';

async function getSurveysHandler() {
  try {
    const list = await $db.list.get({ key: SURVEYS_LIST_KEY }).catch(() => null);
    const lastSync = await $db.string.get({ key: SURVEYS_LAST_SYNC_KEY }).catch(() => null);
    return {
      surveys: Array.isArray(list) ? list : [],
      lastSync: lastSync || null,
    };
  } catch (e) {
    return { surveys: [], lastSync: null };
  }
}

async function syncSurveysHandler() {
  try {
    console.log("-------------syncSurveysHandler starts-------------------");
    const surveys = await fetchSurveysFromApi();
    console.log("-------------surveys starts-------------------");
    console.log(surveys);
    console.log("-------------surveys ends-------------------");
    const data = Array.isArray(surveys) ? surveys : (surveys?.data ?? []);
    console.log("-------------data starts-------------------");
    console.log(data);
    console.log("-------------data ends-------------------");
    try {
      await $db.list.update({ key: SURVEYS_LIST_KEY, value: data });
    } catch (_) {
      await $db.list.create({ key: SURVEYS_LIST_KEY, value: data });
    }
    const now = new Date().toISOString();
    try {
      await $db.string.update({ key: SURVEYS_LAST_SYNC_KEY, value: now });
    } catch (e) {
      console.log("-------------error update starts-------------------");
      console.log(e);
      console.log("-------------error update ends-------------------");
      await $db.string.create({ key: SURVEYS_LAST_SYNC_KEY, value: now });
    }
    return { success: true, count: data.length };
  } catch (e) {
    console.log("-------------error sync starts-------------------");
    console.log(e);
    console.log("-------------error sync ends-------------------");
    return new ResultData({
      body: { success: false, error: e.message || 'Sync failed' },
      statusCode: 502,
    });
  }
}

async function getResponsesHandler({ payload }) {
  const { surveyId, page = 1, per_page: perPage = 10 } = payload || {};
  if (!surveyId) {
    return new ResultData({
      body: { error: 'surveyId is required' },
      statusCode: 400,
    });
  }
  try {
    const result = await getResponses(surveyId, Number(page), Number(perPage));
    const data = result?.data ?? result?.responses ?? [];
    const meta = result?.meta ?? {
      page: Number(page),
      per_page: Number(perPage),
      total: result?.total ?? data.length,
    };
    return { data, meta };
  } catch (e) {
    return new ResultData({
      body: { error: e.message || 'Failed to fetch responses' },
      statusCode: 502,
    });
  }
}

module.exports = {
  getSurveys: getSurveysHandler,
  syncSurveys: syncSurveysHandler,
  getResponses: getResponsesHandler,
};
