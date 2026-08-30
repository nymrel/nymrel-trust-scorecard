import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportRuntimeError } from '../lib/runtimeDiagnostics';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  failed: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    reportRuntimeError(error, 'caught-render');
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="fatal-fallback">
        <h1>The local diagnostic could not render.</h1>
        <p>No evidence was sent anywhere. Reload the page to reset local state.</p>
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          Reload diagnostic
        </button>
      </main>
    );
  }
}
