import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useInterval } from '../hooks/useInterval';

function ImportProgress({ importId, onBack, onViewDetails, error, setError }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    if (!importId) return;
    api
      .getImportStatus({ importId })
      .then((data) => {
        setStatus(data);
        setError(null);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    fetchStatus();
  }, [importId]);

  useInterval(
    () => {
      if (status?.status === 'processing') fetchStatus();
    },
    status?.status === 'processing' ? 2000 : null
  );

  useEffect(() => {
    if (!status && importId) setLoading(true);
    else setLoading(false);
  }, [status, importId]);

  if (loading && !status) {
    return (
      <div className="screen import-progress">
        <p>Loading…</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="screen import-progress">
      <header className="screen-header">
        <button type="button" className="btn btn-link back" onClick={onBack}>← Back</button>
        <h1>Import Progress</h1>
        <p className="import-id">{importId}</p>
      </header>

      {error && (
        <div className="alert alert-error">
          {error}
          <button type="button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {status && (
        <div className="status-card">
          <p><strong>Status:</strong> {status.status}</p>
          <p><strong>Total rows:</strong> {status.totalRows ?? 0}</p>
          <p><strong>Success:</strong> {status.successCount ?? 0}</p>
          <p><strong>Failed:</strong> {status.failureCount ?? 0}</p>
          <p><strong>Started:</strong> {status.startedAt}</p>
          {status.completedAt && <p><strong>Completed:</strong> {status.completedAt}</p>}
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onViewDetails}>
          View details
        </button>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Dashboard
        </button>
      </div>
    </div>
  );
}

export default ImportProgress;
