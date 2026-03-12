/**
 * Constants for CSV Response Importer.
 * SurveySparrow API base URL — use region-specific if needed (e.g. EU, AP).
 */
const SURVEYSPARROW_API_BASE = 'https://api.surveysparrow.com';
const CHUNK_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

module.exports = {
  SURVEYSPARROW_API_BASE,
  CHUNK_SIZE,
  MAX_RETRIES,
  RETRY_DELAY_MS,
};
