import { useState, useEffect } from 'react';
import { api } from '../services/api';

function ColumnMapping({
  headers,
  questions,
  mappings,
  onMappingsChange,
  importId,
  surveyId,
  setError,
}) {
  const [saving, setSaving] = useState(false);
  const [localMap, setLocalMap] = useState(() => {
    const m = {};
    (mappings || []).forEach((x) => { m[x.csvColumn] = x.questionId; });
    return m;
  });

  useEffect(() => {
    const m = {};
    (mappings || []).forEach((x) => { m[x.csvColumn] = x.questionId; });
    setLocalMap(m);
  }, [mappings]);

  const handleMappingChange = (csvColumn, questionId) => {
    const next = { ...localMap };
    if (questionId === '' || questionId == null) delete next[csvColumn];
    else next[csvColumn] = questionId;
    setLocalMap(next);
    onMappingsChange?.(
      Object.entries(next).map(([csvColumn, questionId]) => ({ csvColumn, questionId }))
    );
  };

  const handleSave = async () => {
    const list = Object.entries(localMap).map(([csvColumn, questionId]) => ({ csvColumn, questionId }));
    if (!importId || !surveyId) {
      setError('Missing import or survey');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.saveColumnMapping({ importId, surveyId, mappings: list });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const questionList = Array.isArray(questions) ? questions : [];
  const headerList = Array.isArray(headers) ? headers : [];

  return (
    <div className="column-mapping">
      <p>Map each CSV column to a survey question.</p>
      <button type="button" className="btn btn-secondary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save mapping'}
      </button>
      <table className="mapping-table">
        <thead>
          <tr>
            <th>CSV Column</th>
            <th>Survey Question</th>
          </tr>
        </thead>
        <tbody>
          {headerList.map((h) => (
            <tr key={h}>
              <td>{h}</td>
              <td>
                <select
                  value={localMap[h] ?? ''}
                  onChange={(e) => handleMappingChange(h, e.target.value || null)}
                >
                  <option value="">— Skip —</option>
                  {questionList.map((q) => (
                    <option key={q.id ?? q.question_id} value={String(q.id ?? q.question_id)}>
                      {q.name ?? q.title ?? q.text ?? `Q ${q.id ?? q.question_id}`}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {headerList.length === 0 && <p className="hint">Upload and validate a CSV first to see columns.</p>}
    </div>
  );
}

export default ColumnMapping;
