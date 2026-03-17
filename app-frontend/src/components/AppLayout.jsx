import AppNavbar from './AppNavbar';

export default function AppLayout({ currentView, onGoHome, onGoBackups, onBack, children }) {
  return (
    <div className="app-layout">
      <AppNavbar
        currentView={currentView}
        onGoHome={onGoHome}
        onGoBackups={onGoBackups}
        onBack={onBack}
      />
      <main className="app-layout__main">
        {children}
      </main>
    </div>
  );
}
