import { useState, useEffect } from 'react';
import { api } from '../services/api';

function ImportHistory({ onBack, onOpenDetails, onOpenProgress, error, setError }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getImportHistory({ limit: 50, offset: 0 })
      .then((res) => {
        if (!cancelled && res?.runs) setRuns(res.runs);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setError]);

  return (
    <div className="screen import-history">
      <header className="screen-header">
        <button type="button" className="btn btn-link back" onClick={onBack}>← Back</button>
        <h1>Import History</h1>
      </header>

      {error && (
        <div className="alert alert-error">
          {error}
          <button type="button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : runs.length === 0 ? (
        <p className="empty">No import runs yet.</p>
      ) : (
        <table className="runs-table">
          <thead>
            <tr>
              <th>Import ID</th>
              <th>Survey</th>
              <th>Status</th>
              <th>Success / Total</th>
              <th>Started</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.importId}>
                <td className="run-id">{run.importId}</td>
                <td>{run.surveyId}</td>
                <td><span className={`status-badge ${run.status}`}>{run.status}</span></td>
                <td>{run.successCount ?? 0} / {run.totalRows ?? 0}</td>
                <td>{run.startedAt}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => onOpenDetails(run.importId)}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => onOpenProgress(run.importId)}
                  >
                    Progress
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ImportHistory;
