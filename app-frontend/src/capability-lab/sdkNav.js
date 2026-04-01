export const SDK_NAV = [
  {
    id: '$file',
    title: '$file',
    blurb:
      'getUploadUrl, getDownloadUrl, download via $app.fileDownload, exists, list, delete, upload via $app.fileUpload',
  },
  {
    id: '$db',
    title: '$db',
    blurb:
      'StringTest, ListTest, MapTest, NumberTest, BooleanTest — run logs are kept per tab ($db-string, $db-list, …).',
  },
  {
    id: '$fetch',
    title: '$fetch',
    blurb: '$fetch.request lab: method, URL, headers, query, body (api.salesparrow.com only)',
  },
  {
    id: '$schedule',
    title: '$schedule',
    blurb:
      'Tabs + onScheduledEvent trigger history ($db.list); manifest event_listener_functions',
  },
  {
    id: '$next',
    title: '$next',
    blurb:
      'run(functionName, payload, delay), nextLabLogInvocation + trigger history',
  },
  {
    id: 'getTraceId',
    title: 'getTraceId',
    blurb: 'Read current request trace id',
  },
];
