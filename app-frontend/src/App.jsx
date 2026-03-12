import { useState } from 'react';
import Dashboard from './components/Dashboard';
import NewImport from './components/NewImport';
import ImportHistory from './components/ImportHistory';
import ImportDetails from './components/ImportDetails';
import ImportProgress from './components/ImportProgress';
import './css/App.css';

const SCREENS = {
  DASHBOARD: 'dashboard',
  NEW_IMPORT: 'new_import',
  IMPORT_HISTORY: 'import_history',
  IMPORT_DETAILS: 'import_details',
  IMPORT_PROGRESS: 'import_progress',
};

function App() {
  const [screen, setScreen] = useState(SCREENS.DASHBOARD);
  const [importId, setImportId] = useState(null);
  const [surveyId, setSurveyId] = useState(null);
  const [error, setError] = useState(null);

  const goToDashboard = () => {
    setScreen(SCREENS.DASHBOARD);
    setImportId(null);
    setSurveyId(null);
    setError(null);
  };

  const goToNewImport = () => {
    setScreen(SCREENS.NEW_IMPORT);
    setImportId(null);
    setSurveyId(null);
    setError(null);
  };

  const goToImportHistory = () => {
    setScreen(SCREENS.IMPORT_HISTORY);
    setImportId(null);
    setError(null);
  };

  const goToImportDetails = (id) => {
    setImportId(id);
    setScreen(SCREENS.IMPORT_DETAILS);
    setError(null);
  };

  const goToImportProgress = (id) => {
    setImportId(id);
    setScreen(SCREENS.IMPORT_PROGRESS);
    setError(null);
  };

  const handleImportStarted = (id) => {
    setImportId(id);
    setScreen(SCREENS.IMPORT_PROGRESS);
    setError(null);
  };

  if (screen === SCREENS.DASHBOARD) {
    return (
      <div className="app csv-importer">
        <Dashboard
          onNewImport={goToNewImport}
          onImportHistory={goToImportHistory}
          onOpenImportDetails={goToImportDetails}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  if (screen === SCREENS.NEW_IMPORT) {
    return (
      <div className="app csv-importer">
        <NewImport
          onBack={goToDashboard}
          onImportStarted={handleImportStarted}
          onOpenProgress={goToImportProgress}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  if (screen === SCREENS.IMPORT_HISTORY) {
    return (
      <div className="app csv-importer">
        <ImportHistory
          onBack={goToDashboard}
          onOpenDetails={goToImportDetails}
          onOpenProgress={goToImportProgress}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  if (screen === SCREENS.IMPORT_DETAILS && importId) {
    return (
      <div className="app csv-importer">
        <ImportDetails
          importId={importId}
          onBack={goToImportHistory}
          onOpenProgress={goToImportProgress}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  if (screen === SCREENS.IMPORT_PROGRESS && importId) {
    return (
      <div className="app csv-importer">
        <ImportProgress
          importId={importId}
          onBack={goToDashboard}
          onViewDetails={() => goToImportDetails(importId)}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  return (
    <div className="app csv-importer">
      <Dashboard
        onNewImport={goToNewImport}
        onImportHistory={goToImportHistory}
        onOpenImportDetails={goToImportDetails}
        error={error}
        setError={setError}
      />
    </div>
  );
}

export default App;
