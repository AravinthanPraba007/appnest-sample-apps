export async function listSurveySparrowContacts(payload) {
  const invoke = window.appnestClientFunctions?.appBackend?.invoke;
  if (typeof invoke !== 'function') {
    return {
      statusCode: 503,
      body: {
        message:
          'This screen must run inside SurveySparrow with the Appnest client loaded.',
      },
    };
  }

  return invoke({
    apiFunctionName: 'listSurveySparrowContacts',
    payload,
  });
}
