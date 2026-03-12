const {AppnestFunctions} = require('@aravinthan_p/appnest-app-sdk-utils');
const { ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { parseCsvWithHeaders, validateCsvContent } = require('../helpers/csvParser');

const VISIBILITY = 'PRIVATE';

function getWorkspaceId(payload) {
  return payload.workspaceId ?? payload.workspace_id ?? 'default';
}

async function getCsvUploadUrl({ payload }) {
  const workspaceId = getWorkspaceId(payload);
  const importId = payload.importId ?? payload.import_id ?? `imp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const path = `csv/${workspaceId}/${importId}/upload.csv`;
  try {
    const { data } = await AppnestFunctions.$file.getUploadUrl({ path, visibility: VISIBILITY });
    const uploadUrl = data?.uploadUrl ?? data?.url ?? data;
    return { uploadUrl, path, importId };
  } catch (err) {
    return new ResultData({
      body: { error: err.message || 'Failed to get upload URL' },
      statusCode: 500,
    });
  }
}

async function validateCsv({ payload }) {
  const { importId, path: pathOverride, workspaceId: wsId } = payload;
  const workspaceId = wsId ?? getWorkspaceId(payload);
  const path = pathOverride ?? `csv/${workspaceId}/${importId}/upload.csv`;
  const { $file: fileApi, $http } = AppnestFunctions;
  try {
    const { data: urlData } = await fileApi.getDownloadUrl({ path, visibility: VISIBILITY });
    const downloadUrl = urlData?.downloadUrl ?? urlData?.url ?? urlData;
    if (!downloadUrl) {
      return new ResultData({ body: { valid: false, errors: [{ message: 'File not found or not yet uploaded' }] }, statusCode: 404 });
    }
    const { data: res, status } = await $http.request({
      url: downloadUrl,
      method: 'GET',
      headers: {},
      body: {},
      query: {},
    });
    const csvText = typeof res === 'string' ? res : res?.body ?? JSON.stringify(res);
    const { headers, rows } = parseCsvWithHeaders(csvText);
    const { valid, errors, headers: outHeaders } = validateCsvContent({ headers, rows });
    return { valid, errors, headers: outHeaders, rowCount: rows.length };
  } catch (err) {
    return new ResultData({
      body: { valid: false, errors: [{ message: err.message || 'Failed to validate CSV' }] },
      statusCode: 500,
    });
  }
}

async function saveColumnMapping({ payload }) {
  const { importId, surveyId, mappings } = payload;
  if (!importId || !surveyId || !Array.isArray(mappings)) {
    return new ResultData({ body: { error: 'importId, surveyId, and mappings required' }, statusCode: 400 });
  }
  const workspaceId = getWorkspaceId(payload);
  const key = `column_mapping_${workspaceId}_${importId}`;
  try {
    const db = AppnestFunctions.$db;
    await db.map.create({ key, value: { surveyId, mappings } }).catch(() =>
      db.map.update({ key, value: { surveyId, mappings } })
    );
    return { success: true };
  } catch (err) {
    return new ResultData({ body: { error: err.message }, statusCode: 500 });
  }
}

module.exports = { getCsvUploadUrl, validateCsv, saveColumnMapping };
