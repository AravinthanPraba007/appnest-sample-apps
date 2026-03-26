import './app-shell.css';
import { TwigsReadyProvider } from './TwigsReadyProvider.jsx';
import { CapabilityLabApp } from './capability-lab/CapabilityLabApp.jsx';

export default function App() {
  return (
    <TwigsReadyProvider>
      <CapabilityLabApp />
    </TwigsReadyProvider>
  );
}
