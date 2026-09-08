import { useCallback, useState, useTransition } from 'react';

import { AuditHero, type AuditRequest } from './components/AuditHero';
import { BadgeEmbedDrawer } from './components/BadgeEmbedDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { RemediationAccordion } from './components/RemediationAccordion';
import { ScorecardRadar } from './components/ScorecardRadar';
import { ShareOnXButton } from './components/ShareOnXButton';
import { runAudit } from './engine/auditEngine';
import { PRESET_SITES } from './engine/fixtures';
import type { AuditResult, DimensionKey } from './types';
import { isScoredAudit } from './types';

interface ViewState {
  request: AuditRequest;
  result: AuditResult;
}

function defaultRequest(): AuditRequest {
  const fixture = PRESET_SITES.find((candidate) => candidate.id === 'nymrel');
  return fixture ? { url: fixture.url, presetId: fixture.id } : { url: 'https://nymrel.example' };
}

function readInitialRequest(): AuditRequest {
  try {
    const parameters = new URLSearchParams(window.location.search);
    const fixtureId = parameters.get('example');
    const fixture = fixtureId
      ? PRESET_SITES.find((candidate) => candidate.id === fixtureId)
      : undefined;
    if (fixture) return { url: fixture.url, presetId: fixture.id };

    const domain = parameters.get('domain') ?? parameters.get('url');
    if (domain) return { url: domain };
  } catch {
    // The deterministic default remains available if browser URL state is malformed.
  }
  return defaultRequest();
}

function calculateView(request: AuditRequest): ViewState {
  return {
    request,
    result: runAudit({
      url: request.url,
      ...(request.presetId ? { presetId: request.presetId } : {}),
      ...(request.jsonLd ? { jsonLdStrings: [request.jsonLd] } : {}),
    }),
  };
}

function updateBrowserLocation(request: AuditRequest): void {
  const parameters = new URLSearchParams();
  if (request.presetId) parameters.set('example', request.presetId);
  else parameters.set('domain', request.url);
  const query = parameters.toString();
  window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

export function App() {
  const [view, setView] = useState<ViewState>(() => calculateView(readInitialRequest()));
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAudit = useCallback((request: AuditRequest) => {
    const nextView = calculateView(request);
    updateBrowserLocation(request);
    setSelectedDimension(null);
    startTransition(() => setView(nextView));
  }, []);

  const handleReset = useCallback(() => handleAudit(defaultRequest()), [handleAudit]);
  const activeFixtureId = isScoredAudit(view.result) ? view.result.provenance.fixtureId : undefined;

  return (
    <div className="app-container">
      <a className="skip-link" href="#diagnostic-main">
        Skip to diagnostic
      </a>
      <Header onReset={handleReset} />

      <main id="diagnostic-main" className="main-content" tabIndex={-1}>
        <AuditHero
          activeFixtureId={activeFixtureId}
          currentUrl={view.request.url}
          isPending={isPending}
          onAudit={handleAudit}
        />

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isPending
            ? 'Updating the local diagnostic.'
            : isScoredAudit(view.result)
              ? `Diagnostic updated for ${view.result.domain}: ${view.result.totalScore} out of 100.`
              : `No diagnostic score for ${view.result.domain}.`}
        </div>

        <ScorecardRadar
          result={view.result}
          onSelectDimension={(dimension) => {
            setSelectedDimension(dimension);
            document.getElementById('remediation-section')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            });
          }}
        />

        {isScoredAudit(view.result) && (
          <>
            {view.result.provenance.kind === 'illustrative_fixture' && (
              <ShareOnXButton score={view.result} />
            )}
            <div id="remediation-section">
              <RemediationAccordion
                score={view.result}
                selectedDimension={selectedDimension}
                onClearDimension={() => setSelectedDimension(null)}
              />
            </div>
            <BadgeEmbedDrawer score={view.result} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
