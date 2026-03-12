import { useState } from 'react';
import { api } from '../services/api';

function ImportConfig({
  config,
  onConfigChange,
  importId,
  surveyId,
  filePath,
  mappings,
  onImportStarted,
  setError,
}) {
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    if (!importId || !surveyId || !filePath) {
      setError('Missing import ID, survey, or file path');
      return;
    }
    setError(null);
    setStarting(true);
    try {
      const res = await api.startImport({
        importId,
        surveyId,
        filePath,
        mapping: mappings,
        config: {
          timestampSource: config.timestampSource,
          timezone: config.timezone,
          duplicateRule: config.duplicateRule,
        },
      });
      if (res?.importId) onImportStarted(res.importId);
      else setError(res?.error ?? 'Failed to start import');
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="import-config">
      <div className="form-group">
        <label>Submission time</label>
        <select
          value={config.timestampSource}
          onChange={(e) => onConfigChange({ ...config, timestampSource: e.target.value })}
        >
          <option value="current">Current time</option>
          <option value="csv">From CSV column</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="form-group">
        <label>Timezone</label>
        <input
          type="text"
          value={config.timezone}
          onChange={(e) => onConfigChange({ ...config, timezone: e.target.value })}
          placeholder="e.g. UTC"
        />
      </div>
      <div className="form-group">
        <label>Duplicate handling</label>
        <select
          value={config.duplicateRule}
          onChange={(e) => onConfigChange({ ...config, duplicateRule: e.target.value })}
        >
          <option value="allow">Allow duplicates</option>
          <option value="skip">Skip duplicates</option>
          <option value="update">Update existing</option>
        </select>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleStart}
        disabled={starting || !importId || !surveyId || !filePath}
      >
        {starting ? 'Starting…' : 'Start import'}
      </button>
    </div>
  );
}

export default ImportConfig;
