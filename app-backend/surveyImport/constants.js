/** @type {const} */
module.exports = {
  API_BASE: 'https://api.surveysparrow.com',
  AUTH_HEADER_TEMPLATE:
    'Bearer <%=installation_parameters.surveysparrow_api_key%>',
  MAX_CSV_CHARS: 2 * 1024 * 1024,
  MAX_ROWS: 10000,
  PREVIEW_ROW_LIMIT: 20,
  BATCH_SIZE: 20,
  FAILURE_LIST_CAP: 500,
  DB_PREFIX: 'sci',
};
