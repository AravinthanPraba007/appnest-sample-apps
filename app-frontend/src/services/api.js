/**
 * Backend API client for CSV Response Importer.
 * Uses window.appnestClientFunctions.appBackend.invoke({ functionName, payload }).
 * Response shape: { statusCode, body }.
 */

export async function invoke(functionName, payload = {}) {
  if (typeof window === 'undefined' || !window.appnestClientFunctions?.appBackend) {
    throw new Error('Appnest client not available');
  }
  const response = await window.appnestClientFunctions.appBackend.invoke({
    apiFunctionName: functionName,
    payload: { ...payload },
  });
  console.log("-------------response from invoke starts-------------------");
  console.log(response);
  console.log("-------------response from invoke ends-------------");
  const { statusCode, body } = response;
  console.log("-------------statusCode from invoke starts-------------------");
  console.log(statusCode);
  console.log("-------------statusCode from invoke ends-------------------");
  console.log("-------------body from invoke starts-------------------");
  console.log(body);
  console.log("-------------body from invoke ends-------------------");
  if (statusCode >= 400) {
    const err = new Error(body?.error ?? body?.message ?? `Request failed: ${statusCode}`);
    err.statusCode = statusCode;
    err.body = body;
    throw err;
  }
  console.log("-------------body from invoke starts-------------------");
  console.log(body);
  console.log("-------------body from invoke ends-------------------");
  return body;
}

export const api = {
  getSurveys: (payload) => invoke('getSurveys', payload),
  getSurveyQuestions: (payload) => invoke('getSurveyQuestions', payload),
  getCsvUploadUrl: (payload) => invoke('getCsvUploadUrl', payload),
  validateCsv: (payload) => invoke('validateCsv', payload),
  saveColumnMapping: (payload) => invoke('saveColumnMapping', payload),
  startImport: (payload) => invoke('startImport', payload),
  getImportStatus: (payload) => invoke('getImportStatus', payload),
  getImportHistory: (payload) => invoke('getImportHistory', payload),
  getImportDetails: (payload) => invoke('getImportDetails', payload),
  getErrorRowsDownloadUrl: (payload) => invoke('getErrorRowsDownloadUrl', payload),
  retryFailedImports: (payload) => invoke('retryFailedImports', payload),
};
