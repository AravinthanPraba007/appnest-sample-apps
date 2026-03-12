import { useState, useRef } from 'react';
import { api } from '../services/api';

function CsvUpload({
  importId,
  surveyId,
  onImportIdReady,
  onFilePathReady,
  onHeadersLoaded,
  setError,
}) {
  const [uploadUrl, setUploadUrl] = useState(null);
  const [path, setPath] = useState(null);
  const [currentImportId, setCurrentImportId] = useState(importId);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const fileInputRef = useRef(null);

  const ensureUploadUrl = async () => {
    if (currentImportId && uploadUrl) return currentImportId;
    setError(null);
    try {
      const res = await api.getCsvUploadUrl({ importId: currentImportId });
      const url = res?.uploadUrl ?? res?.url;
      const id = res?.importId ?? currentImportId;
      const p = res?.path;
      if (url) {
        setUploadUrl(url);
        setPath(p);
        setCurrentImportId(id);
        onImportIdReady?.(id);
        if (p) onFilePathReady?.(p);
        return id;
      }
    } catch (e) {
      setError(e.message);
    }
    return null;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const id = await ensureUploadUrl();
    if (!id || !uploadUrl) {
      await ensureUploadUrl();
    }
    const url = uploadUrl || (await api.getCsvUploadUrl({ importId: id }).then((r) => r?.uploadUrl ?? r?.url));
    if (!url) {
      setError('Could not get upload URL');
      return;
    }
    setUploading(true);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'text/csv' },
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const resolvedPath = path || `csv/default/${id}/upload.csv`;
      setPath(resolvedPath);
      onImportIdReady?.(id);
      onFilePathReady?.(resolvedPath);
      setValidationResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleValidate = async () => {
    if (!currentImportId) {
      const id = await ensureUploadUrl();
      if (!id) return;
    }
    setError(null);
    setValidating(true);
    try {
      const res = await api.validateCsv({ importId: currentImportId });
      setValidationResult(res);
      if (res?.headers) onHeadersLoaded(res.headers);
      if (res?.path) onFilePathReady(res.path);
    } catch (err) {
      setError(err.message);
      setValidationResult({ valid: false, errors: [{ message: err.message }] });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="csv-upload">
      <p>Get an upload URL, then choose a CSV file to upload.</p>
      <div className="actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={ensureUploadUrl}
          disabled={uploading}
        >
          Get upload URL
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelect}
          style={{ display: 'block', marginTop: 8 }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleValidate}
          disabled={validating || !currentImportId}
        >
          {validating ? 'Validating…' : 'Validate CSV'}
        </button>
      </div>
      {validationResult && (
        <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
          {validationResult.valid ? (
            <p>Valid. {validationResult.rowCount ?? 0} rows, headers: {validationResult.headers?.join(', ')}</p>
          ) : (
            <ul>
              {(validationResult.errors || []).map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default CsvUpload;
