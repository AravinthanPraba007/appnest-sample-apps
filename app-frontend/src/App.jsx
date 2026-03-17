import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@sparrowengg/twigs-react';
import AppLayout from './components/AppLayout';
import SurveyList from './components/SurveyList';
import ResponseViewer from './components/ResponseViewer';
import BackupsView from './components/BackupsView';
import './css/App.css';

function App() {
  const [view, setView] = useState('surveyList');
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 10, total: 0, has_next_page: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [error, setError] = useState(null);

  const invokeBackend = useCallback(async (functionName, payload = {}) => {
    const client = window.appnestClientFunctions;
    if (!client?.appBackend?.invoke) {
      return { statusCode: 503, body: { error: 'Backend not available' } };
    }
    console.log("xd--");
    console.log(functionName);
    console.log(payload);
    console.log("xd--");
    return client.appBackend.invoke({ apiFunctionName: functionName, payload });
  }, []);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await invokeBackend('getSurveys', {});
    setLoading(false);
    if (result?.statusCode === 200) {
      setSurveys(result?.body?.surveys ?? []);
    } else {
      setError(result?.body?.error || 'Failed to load surveys');
    }
  }, [invokeBackend]);

  const handleSyncSurveys = useCallback(async () => {
    setSyncing(true);
    setError(null);
    const result = await invokeBackend('syncSurveys', {});
    setSyncing(false);
    if (result?.statusCode === 200) {
      setSurveys(result?.body?.surveys ?? []);
    } else {
      setError(result?.body?.error || 'Failed to sync surveys');
    }
  }, [invokeBackend]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleViewResponses = useCallback((survey) => {
    setSelectedSurvey(survey);
    setView('responses');
    setResponses([]);
    setMeta({ page: 1, per_page: 10, total: 0, has_next_page: false });
    setError(null);
  }, []);

  const handleViewBackups = useCallback(() => {
    setView('backups');
    setError(null);
  }, []);

  const fetchBackups = useCallback(async () => {
    setBackupsLoading(true);
    const result = await invokeBackend('listBackups', {});
    setBackupsLoading(false);
    if (result?.statusCode === 200) {
      setBackups(result?.body?.backups ?? []);
    }
  }, [invokeBackend]);

  useEffect(() => {
    if (view === 'backups') fetchBackups();
  }, [view, fetchBackups]);

  const handleBackupCsv = useCallback(async () => {
    if (!selectedSurvey?.id) return;
    setBackupLoading(true);
    setError(null);
    const result = await invokeBackend('createBackupCsv', {
      surveyId: String(selectedSurvey.id),
      surveyName: selectedSurvey.name || 'Survey',
    });
    setBackupLoading(false);
    if (result?.statusCode === 200) {
      setView('backups');
      fetchBackups();
    } else {
      setError(result?.body?.error || 'Failed to create backup');
    }
  }, [selectedSurvey, invokeBackend, fetchBackups]);

  const handleBackupDownload = useCallback(async (path) => {
    const result = await invokeBackend('getBackupDownloadUrl', { path });
    if (result?.statusCode === 200 && result?.body?.downloadUrl) {
      const url = result.body.downloadUrl?.preSignedUrl ?? result.body.downloadUrl;
      if (url) window.open(url, '_blank');
    }
  }, [invokeBackend]);

  const handleBack = useCallback(() => {
    setView('surveyList');
    setSelectedSurvey(null);
    setResponses([]);
    setMeta({ page: 1, per_page: 10, total: 0, has_next_page: false });
    setError(null);
  }, []);

  const fetchResponses = useCallback(async (page = 1) => {
    if (!selectedSurvey?.id) return;
    setLoading(true);
    setError(null);
    const result = await invokeBackend('getSurveyResponses', {
      surveyId: String(selectedSurvey.id),
      page,
      perPage: 10,
    });
    setLoading(false);
    if (result?.statusCode === 200) {
      setResponses(result?.body?.responses ?? []);
      setMeta(result?.body?.meta ?? { page: 1, per_page: 10, total: 0, has_next_page: false });
    } else {
      setError(result?.body?.error || 'Failed to load responses');
    }
  }, [selectedSurvey, invokeBackend]);

  useEffect(() => {
    if (view === 'responses' && selectedSurvey?.id) {
      fetchResponses(1);
    }
  }, [view, selectedSurvey?.id]);

  return (
    <ThemeProvider>
      <div className="app-root app-shell">
        <AppLayout
          currentView={view}
          onGoHome={handleBack}
          onGoBackups={handleViewBackups}
          onBack={handleBack}
        >
          <div className="app-container">
            {view === 'surveyList' && (
              <SurveyList
                surveys={surveys}
                loading={loading}
                syncing={syncing}
                error={error}
                onRetry={fetchSurveys}
                onSync={handleSyncSurveys}
                onViewResponses={handleViewResponses}
              />
            )}
            {view === 'responses' && (
              <ResponseViewer
                survey={selectedSurvey}
                responses={responses}
                meta={meta}
                loading={loading}
                error={error}
                onRetry={() => fetchResponses(meta.page)}
                onPageChange={(page) => fetchResponses(page)}
                onBackupCsv={handleBackupCsv}
                backupLoading={backupLoading}
              />
            )}
            {view === 'backups' && (
              <BackupsView
                backups={backups}
                loading={backupsLoading}
                error={error}
                onRefresh={fetchBackups}
                onDownload={handleBackupDownload}
              />
            )}
          </div>
        </AppLayout>
      </div>
    </ThemeProvider>
  );
}

export default App;
