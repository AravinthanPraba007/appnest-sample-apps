import { Button, Text } from '@sparrowengg/twigs-react';

const VIEW_HOME = 'surveyList';
const VIEW_RESPONSES = 'responses';
const VIEW_BACKUPS = 'backups';

export default function AppNavbar({ currentView, onGoHome, onGoBackups, onBack }) {
  const showBack = currentView === VIEW_RESPONSES || currentView === VIEW_BACKUPS;

  return (
    <header className="app-navbar">
      <div className="app-navbar__inner">
        <div className="app-navbar__left">
          <button
            type="button"
            className="app-navbar__home"
            onClick={onGoHome}
            aria-label="Home"
          >
            <Text size="md" weight="semibold">SurveySparrow Response Viewer</Text>
          </button>
          {showBack && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              className="app-navbar__back"
            >
              ← Back
            </Button>
          )}
        </div>
        <nav className="app-navbar__right">
          <Button
            variant="secondary"
            size="sm"
            onClick={onGoBackups}
            className={currentView === VIEW_BACKUPS ? 'app-navbar__link--active' : ''}
          >
            Backups
          </Button>
        </nav>
      </div>
    </header>
  );
}
