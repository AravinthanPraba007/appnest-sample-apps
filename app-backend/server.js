const surveys = require('./controller/surveys');
const csv = require('./controller/csv');
const importRun = require('./controller/importRun');

module.exports = {
  getSurveys: surveys.getSurveys,
  getSurveyQuestions: surveys.getSurveyQuestions,
  getCsvUploadUrl: csv.getCsvUploadUrl,
  validateCsv: csv.validateCsv,
  saveColumnMapping: csv.saveColumnMapping,
  startImport: importRun.startImport,
  processImportChunk: importRun.processImportChunk,
  getImportStatus: importRun.getImportStatus,
  getImportHistory: importRun.getImportHistory,
  getImportDetails: importRun.getImportDetails,
  getErrorRowsDownloadUrl: importRun.getErrorRowsDownloadUrl,
  retryFailedImports: importRun.retryFailedImports,
};
