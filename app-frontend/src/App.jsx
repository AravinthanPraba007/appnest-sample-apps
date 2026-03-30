import { ThemeProvider, TooltipProvider } from '@sparrowengg/twigs-react';
import { ImportWizard } from './components/ImportWizard';
import './css/App.css';

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ImportWizard />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
