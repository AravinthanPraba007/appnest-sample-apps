import { useState, useEffect } from 'react';
import { api } from '../services/api';

function ImportDetails({ importId, onBack, onOpenProgress, error, setError }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!importId) return;
    let cancelled = false;
    setLoading(true);
    api
      .getImportDetails({ importId })
      .then((res) => {
        if (!cancelled) setDetails(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [importId, setError]);

  const handleDownloadErrors = async () => {
    setError(null);
    try {
      const res = await api.getErrorRowsDownloadUrl({ importId });
      const url = res?.downloadUrl ?? res?.url;
      if (url) window.open(url, '_blank');
      else setError('No download URL');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRetryFailed = async () => {
    setError(null);
    try {
      await api.retryFailedImports({ importId });
      setDetails((d) => d ? { ...d, run: { ...d.run, status: 'processing', failedRowIndices: [] } } : null);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading && !details) {
    return (
      <div className="screen import-details">
        <p>Loading…</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    );
  }

  const run = details?.run ?? {};
  const errorLog = details?.errorLog ?? run?.errorLog ?? [];

  return (
    <div className="screen import-details">
      <header className="screen-header">
        <button type="button" className="btn btn-link back" onClick={onBack}>← Back</button>
        <h1>Import Details</h1>
        <p className="import-id">{importId}</p>
      </header>

      {error && (
        <div className="alert alert-error">
          {error}
          <button type="button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="details-card">
        <p><strong>Status:</strong> {run.status}</p>
        <p><strong>Survey ID:</strong> {run.surveyId}</p>
        <p><strong>Total / Success / Failed:</strong> {run.totalRows ?? 0} / {run.successCount ?? 0} / {run.failureCount ?? 0}</p>
        <p><strong>Started:</strong> {run.startedAt}</p>
        <p><strong>Completed:</strong> {run.completedAt ?? '—'}</p>
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={onOpenProgress}>
          View progress
        </button>
        {run.failedRowIndices?.length > 0 && (
          <>
            <button type="button" className="btn btn-primary" onClick={handleDownloadErrors}>
              Download error rows
            </button>
            <button type="button" className="btn btn-primary" onClick={handleRetryFailed}>
              Retry failed
            </button>
          </>
        )}
      </div>

      {errorLog.length > 0 && (
        <section className="error-log">
          <h2>Error log</h2>
          <table className="error-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {errorLog.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.rowIndex}</td>
                  <td>{entry.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default ImportDetails;
