const { AppnestFunctions } = require('@aravinthan_p/appnest-app-sdk-utils');
const { ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { getSurveysFromApi, getSurveyById } = require('../helpers/surveySparrow');

async function getSurveys({ payload }) {

  console.log("--------------------------------");
  console.log(AppnestFunctions);
  console.log("--------------------------------");
  console.log(AppnestFunctions.$http);
  const { data, error, status } = await getSurveysFromApi({ $http: AppnestFunctions.$http });
  if (error) {
    return new ResultData({ body: { error }, statusCode: status || 502 });
  }
  const list = Array.isArray(data) ? data : data?.surveys ?? data?.data ?? [];
  return { surveys: list };
}

async function getSurveyQuestions({ payload }) {
  const { surveyId, surveyVersion } = payload;
  if (!surveyId) {
    return new ResultData({ body: { error: 'surveyId required' }, statusCode: 400 });
  }
  const { data, error, status } = await getSurveyById({
    $http: AppnestFunctions.$http,
    surveyId,
  });
  if (error) {
    return new ResultData({ body: { error }, statusCode: status || 502 });
  }
  const survey = data?.data ?? data;
  const questions = survey?.questions ?? survey?.sections?.flatMap((s) => s.questions ?? []) ?? [];
  return { questions: Array.isArray(questions) ? questions : [] };
}

module.exports = { getSurveys, getSurveyQuestions };
