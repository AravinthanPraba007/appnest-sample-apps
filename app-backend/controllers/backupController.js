const { AppnestFunctions, ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { $file, $http } = AppnestFunctions;
const { getSurveys: fetchSurveysFromApi, getResponses } = require('../helpers/surveyApi');

const BACKUPS_PREFIX = 'backups/';
const VISIBILITY = 'PRIVATE';

async function listBackups() {
  try {
    const { objects } = await $file.list({ path: BACKUPS_PREFIX, visibility: VISIBILITY });
    const files = (objects || []).map((path) => ({
      name: path.replace(BACKUPS_PREFIX, ''),
      path: path.startsWith(BACKUPS_PREFIX) ? path : `${BACKUPS_PREFIX}${path}`,
    }));
    return { files };
  } catch (e) {
    return new ResultData({
      body: { error: e.message || 'Failed to list backups' },
      statusCode: 502,
    });
  }
}

async function getBackupDownloadUrl({ payload }) {
  const path = payload?.path;
  if (!path) {
    return new ResultData({
      body: { error: 'path is required' },
      statusCode: 400,
    });
  }
  try {
    const { preSignedUrl } = await $file.getDownloadUrl({ path, visibility: VISIBILITY });
    return { url: preSignedUrl };
  } catch (e) {
    return new ResultData({
      body: { error: e.message || 'Failed to get download URL' },
      statusCode: 502,
    });
  }
}

async function runScheduledBackup({ payload }) {
  const surveyIds = payload?.surveyIds;
  try {
    const surveys = Array.isArray(surveyIds) && surveyIds.length > 0
      ? surveyIds.map((id) => ({ id }))
      : await fetchSurveysFromApi();
    const list = Array.isArray(surveys) ? surveys : (surveys?.data ?? []);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    const fileName = `responses_${dateStr}.json`;
    const path = `${BACKUPS_PREFIX}${fileName}`;

    const allResponses = [];
    for (const s of list.slice(0, 20)) {
      const id = typeof s === 'object' ? s.id : s;
      if (!id) continue;
      try {
        const res = await getResponses(id, 1, 100);
        const data = res?.data ?? res?.responses ?? [];
        allResponses.push({ surveyId: id, responses: data });
      } catch (_) {
        // skip survey on error
      }
    }

    const { preSignedUrl } = await $file.getUploadUrl({ path, visibility: VISIBILITY });
    const body = JSON.stringify({ date: dateStr, surveys: allResponses }, null, 2);
    await $http.request({
      url: preSignedUrl,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    return { success: true, path };
  } catch (e) {
    return new ResultData({
      body: { success: false, error: e.message || 'Backup failed' },
      statusCode: 502,
    });
  }
}

module.exports = {
  listBackups,
  getBackupDownloadUrl,
  runScheduledBackup,
};
