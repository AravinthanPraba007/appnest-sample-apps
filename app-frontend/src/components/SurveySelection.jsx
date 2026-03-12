import { useState, useEffect } from 'react';
import { api } from '../services/api';

function SurveySelection({
  surveyId,
  surveyVersion,
  onSelectSurvey,
  onSelectVersion,
  onQuestionsLoaded,
  setError,
}) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getSurveys({})
      .then((res) => {
        console.log("-------------res from getSurveys starts-------------------");
        console.log(res);
        console.log("-------------res from getSurveys ends-------------------");
        if (!cancelled && res?.surveys) setSurveys(Array.isArray(res.surveys) ? res.surveys : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setError]);

  useEffect(() => {
    if (!surveyId) {
      onQuestionsLoaded([]);
      return;
    }
    let cancelled = false;
    api
      .getSurveyQuestions({ surveyId, surveyVersion })
      .then((res) => {
        if (!cancelled && res?.questions) onQuestionsLoaded(res.questions);
      })
      .catch(() => {
        if (!cancelled) onQuestionsLoaded([]);
      });
    return () => { cancelled = true; };
  }, [surveyId, surveyVersion, onQuestionsLoaded]);

  const list = Array.isArray(surveys) ? surveys : [];

  return (
    <div className="survey-selection">
      <label htmlFor="survey-select">Select survey</label>
      {loading ? (
        <p>Loading surveys…</p>
      ) : (
        <select
          id="survey-select"
          value={surveyId ?? ''}
          onChange={(e) => onSelectSurvey(e.target.value || null)}
        >
          <option value="">— Select —</option>
          {list.map((s) => (
            <option key={s.id ?? s.survey_id} value={String(s.id ?? s.survey_id ?? s)}>
              {s.name ?? s.title ?? `Survey ${s.id ?? s.survey_id}`}
            </option>
          ))}
        </select>
      )}
      {surveyId && <p className="hint">Survey selected. Questions will be used for column mapping in the next steps.</p>}
    </div>
  );
}

export default SurveySelection;
