const {AppnestFunctions} = require('@aravinthan_p/appnest-app-sdk-utils');
const { $db, $file, $http, $next, ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { createResponse } = require('../helpers/surveySparrow');
const { parseCsvWithHeaders } = require('../helpers/csvParser');
const { CHUNK_SIZE, MAX_RETRIES, RETRY_DELAY_MS } = require('../constants');

const VISIBILITY = 'PRIVATE';

function getWorkspaceId(payload) {
  return payload.workspaceId ?? payload.workspace_id ?? 'default';
}

async function startImport({ payload }) {
  const { importId, surveyId, filePath, mapping, config } = payload;
  if (!importId || !surveyId || !filePath) {
    return new ResultData({ body: { error: 'importId, surveyId, filePath required' }, statusCode: 400 });
  }
  const workspaceId = getWorkspaceId(payload);
  const runKey = `import_run_${workspaceId}_${importId}`;
  const listKey = `import_run_list_${workspaceId}`;
  const run = {
    surveyId,
    filePath,
    status: 'processing',
    totalRows: 0,
    successCount: 0,
    failureCount: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    createdBy: payload.userId ?? payload.createdBy ?? 'user',
    config: config ?? { timestampSource: 'current', timezone: 'UTC', duplicateRule: 'allow' },
    errorLog: [],
    failedRowIndices: [],
  };
  try {
    await $db.map.create({ key: runKey, value: run }).catch(() => $db.map.update({ key: runKey, value: run }));
    const listData = await $db.list.get({ key: listKey }).catch(() => ({ data: [] }));
    const currentList = Array.isArray(listData?.data) ? listData.data : [];
    await $db.list.prepend({ key: listKey, value: [importId] }).catch(() =>
      $db.list.update({ key: listKey, value: [importId, ...currentList] })
    );
    await $next.run({
      functionName: 'processImportChunk',
      payload: { importId, offset: 0, limit: CHUNK_SIZE, workspaceId },
      delay: 0,
    });
    return { importId, status: 'processing' };
  } catch (err) {
    run.status = 'failed';
    run.completedAt = new Date().toISOString();
    await $db.map.update({ key: runKey, value: run }).catch(() => {});
    return new ResultData({ body: { error: err.message }, statusCode: 500 });
  }
}

async function processImportChunk({ payload }) {
  const { importId, offset, limit, workspaceId: wsId, retryMode, rowIndices: explicitRowIndices } = payload;
  const workspaceId = wsId ?? getWorkspaceId(payload);
  const runKey = `import_run_${workspaceId}_${importId}`;
  const mappingKey = `column_mapping_${workspaceId}_${importId}`;

  let runRes = await $db.map.get({ key: runKey });
  const run = runRes?.data ?? runRes;
  if (!run) {
    return { error: 'Import run not found' };
  }

  let csvText = '';
  try {
    const { data: urlData } = await $file.getDownloadUrl({ path: run.filePath, visibility: VISIBILITY });
    const downloadUrl = urlData?.downloadUrl ?? urlData?.url ?? urlData;
    if (downloadUrl) {
      const { data: res } = await $http.request({
        url: downloadUrl,
        method: 'GET',
        headers: {},
        body: {},
        query: {},
      });
      csvText = typeof res === 'string' ? res : res?.body ?? JSON.stringify(res ?? '');
    }
  } catch (e) {
    run.status = 'failed';
    run.completedAt = new Date().toISOString();
    run.errorLog = run.errorLog || [];
    run.errorLog.push({ rowIndex: -1, error: e.message || 'Failed to read CSV' });
    await $db.map.update({ key: runKey, value: run });
    return { error: e.message };
  }

  const { headers, rows } = parseCsvWithHeaders(csvText);
  if (run.totalRows === 0) {
    run.totalRows = rows.length;
    await $db.map.update({ key: runKey, value: run });
  }

  let mappingData = (await $db.map.get({ key: mappingKey }).catch(() => ({})))?.data ?? {};
  const mappings = mappingData?.mappings ?? [];
  const mapByCsvColumn = {};
  mappings.forEach((m) => {
    mapByCsvColumn[m.csvColumn] = m.questionId;
  });

  const chunkRows = (retryMode && Array.isArray(explicitRowIndices) && explicitRowIndices.length > 0)
    ? explicitRowIndices.map((idx) => rows[idx]).filter(Boolean)
    : rows.slice(offset, offset + limit);
  const chunkIndices = (retryMode && Array.isArray(explicitRowIndices) && explicitRowIndices.length > 0)
    ? explicitRowIndices
    : chunkRows.map((_, i) => offset + i);
  const timestampSource = run.config?.timestampSource ?? 'current';
  const timezone = run.config?.timezone ?? 'UTC';

  for (let i = 0; i < chunkRows.length; i++) {
    const rowIndex = chunkIndices[i] ?? offset + i;
    const row = chunkRows[i];
    const answers = [];
    for (const [col, val] of Object.entries(row)) {
      const qId = mapByCsvColumn[col];
      if (qId != null && val !== undefined && val !== '') {
        answers.push({ question_id: Number(qId), answer: String(val) });
      }
    }
    let submittedAt = null;
    if (timestampSource === 'current') {
      submittedAt = new Date().toISOString();
    } else if (timestampSource === 'csv' && row.date_time) {
      submittedAt = row.date_time;
    }

    let lastStatus = 0;
    for (let r = 0; r < MAX_RETRIES; r++) {
      const { data, status } = await createResponse({
        $http: AppnestFunctions.$http,
        surveyId: run.surveyId,
        answers,
        submittedAt,
      });
      lastStatus = status;
      if (status === 200 || status === 201) {
        run.successCount = (run.successCount || 0) + 1;
        break;
      }
      if (status === 429) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS * (r + 1)));
        continue;
      }
      run.failureCount = (run.failureCount || 0) + 1;
      run.failedRowIndices = run.failedRowIndices || [];
      run.failedRowIndices.push(rowIndex);
      run.errorLog = run.errorLog || [];
      run.errorLog.push({ rowIndex, error: data?.message ?? data?.error ?? `HTTP ${status}` });
      break;
    }
    if (lastStatus === 429) {
      run.failureCount = (run.failureCount || 0) + 1;
      run.failedRowIndices = run.failedRowIndices || [];
      run.failedRowIndices.push(rowIndex);
      run.errorLog.push({ rowIndex, error: 'Rate limited after retries' });
    }
  }

  await $db.map.update({ key: runKey, value: run });

  if (retryMode && Array.isArray(explicitRowIndices)) {
    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    await $db.map.update({ key: runKey, value: run });
    return { ok: true, processed: chunkRows.length };
  }

  const nextOffset = offset + limit;
  if (nextOffset < rows.length) {
    await $next.run({
      functionName: 'processImportChunk',
      payload: { importId, offset: nextOffset, limit, workspaceId },
      delay: 0,
    });
  } else {
    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    await $db.map.update({ key: runKey, value: run });
  }

  return { ok: true, processed: chunkRows.length };
}

async function getImportStatus({ payload }) {
  const { importId } = payload;
  const workspaceId = getWorkspaceId(payload);
  const runKey = `import_run_${workspaceId}_${importId}`;
  const runRes = await $db.map.get({ key: runKey });
  const run = runRes?.data ?? runRes;
  if (!run) {
    return new ResultData({ body: { error: 'Import not found' }, statusCode: 404 });
  }
  return {
    status: run.status,
    totalRows: run.totalRows ?? 0,
    successCount: run.successCount ?? 0,
    failureCount: run.failureCount ?? 0,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  };
}

async function getImportHistory({ payload }) {
  const { limit = 20, offset = 0, surveyId: filterSurveyId } = payload;
  const workspaceId = getWorkspaceId(payload);
  const listKey = `import_run_list_${workspaceId}`;
  const listRes = await $db.list.get({ key: listKey }).catch(() => ({ data: [] }));
  const ids = Array.isArray(listRes?.data) ? listRes.data : [];
  const pageIds = ids.slice(Number(offset), Number(offset) + Number(limit));
  const runs = [];
  for (const id of pageIds) {
    const runRes = await $db.map.get({ key: `import_run_${workspaceId}_${id}` });
    const run = runRes?.data ?? runRes;
    if (run && (filterSurveyId == null || run.surveyId === filterSurveyId)) {
      runs.push({
        importId: id,
        surveyId: run.surveyId,
        status: run.status,
        totalRows: run.totalRows,
        successCount: run.successCount,
        failureCount: run.failureCount,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
      });
    }
  }
  return { runs, total: runs.length };
}

async function getImportDetails({ payload }) {
  const { importId } = payload;
  const workspaceId = getWorkspaceId(payload);
  const runKey = `import_run_${workspaceId}_${importId}`;
  const runRes = await $db.map.get({ key: runKey });
  const run = runRes?.data ?? runRes;
  if (!run) {
    return new ResultData({ body: { error: 'Import not found' }, statusCode: 404 });
  }
  return { run: { ...run, importId }, errorLog: run.errorLog ?? [] };
}

async function getErrorRowsDownloadUrl({ payload }) {
  const { importId } = payload;
  const workspaceId = getWorkspaceId(payload);
  const runKey = `import_run_${workspaceId}_${importId}`;
  const runRes = await $db.map.get({ key: runKey });
  const run = runRes?.data ?? runRes;
  if (!run || !run.failedRowIndices?.length) {
    return new ResultData({ body: { error: 'No error rows' }, statusCode: 404 });
  }
  const path = `csv/${workspaceId}/${importId}/errors.csv`;
  const { data } = await $file.getDownloadUrl({ path, visibility: VISIBILITY });
  const downloadUrl = data?.downloadUrl ?? data?.url ?? data;
  return { downloadUrl };
}

async function retryFailedImports({ payload }) {
  const { importId } = payload;
  const workspaceId = getWorkspaceId(payload);
  const runKey = `import_run_${workspaceId}_${importId}`;
  const runRes = await $db.map.get({ key: runKey });
  const run = runRes?.data ?? runRes;
  if (!run) {
    return new ResultData({ body: { error: 'Import not found' }, statusCode: 404 });
  }
  const failedIndices = run.failedRowIndices ?? [];
  if (failedIndices.length === 0) {
    return { success: true, retriedCount: 0 };
  }
  run.status = 'processing';
  run.failedRowIndices = [];
  run.errorLog = run.errorLog?.filter((e) => e.rowIndex === -1) ?? [];
  await $db.map.update({ key: runKey, value: run });
  await $next.run({
    functionName: 'processImportChunk',
    payload: { importId, workspaceId, retryMode: true, rowIndices: failedIndices },
    delay: 0,
  });
  return { success: true, retriedCount: failedIndices.length };
}

module.exports = {
  startImport,
  processImportChunk,
  getImportStatus,
  getImportHistory,
  getImportDetails,
  getErrorRowsDownloadUrl,
  retryFailedImports,
};
