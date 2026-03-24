const surveyController = require('./controllers/surveyController');
const backupController = require('./controllers/backupController');

async function getSurveys() {
  return surveyController.getSurveys();
}

async function syncSurveys() {
  return surveyController.syncSurveys();
}

async function getResponses({ payload }) {
  return surveyController.getResponses({ payload });
}

async function listBackups() {
  return backupController.listBackups();
}

async function getBackupDownloadUrl({ payload }) {
  return backupController.getBackupDownloadUrl({ payload });
}

async function runScheduledBackup({ payload }) {
  return backupController.runScheduledBackup({ payload });
}

module.exports = {
  getSurveys,
  syncSurveys,
  getResponses,
  listBackups,
  getBackupDownloadUrl,
  runScheduledBackup,
};
