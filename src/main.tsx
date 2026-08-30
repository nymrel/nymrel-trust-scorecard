import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { reportRuntimeError } from './lib/runtimeDiagnostics';
import './theme/theme.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('The application root element is missing.');

createRoot(rootElement, {
  onCaughtError: (error) => reportRuntimeError(error, 'caught-render'),
  onRecoverableError: (error) => reportRuntimeError(error, 'recoverable-render'),
  onUncaughtError: (error) => reportRuntimeError(error, 'uncaught-render'),
}).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
