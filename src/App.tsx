import React, { useState, useEffect } from 'react';
import { AuditResult, DimensionKey, isScoredAudit } from './types';
import { runAudit } from './engine/auditEngine';
import { PRESET_SITES } from './engine/fixtures';
import { Header } from './components/Header';
import { AuditHero } from './components/AuditHero';
import { ScorecardRadar } from './components/ScorecardRadar';
import { RemediationAccordion } from './components/RemediationAccordion';
import { BadgeEmbedDrawer } from './components/BadgeEmbedDrawer';
import { ShareOnXButton } from './components/ShareOnXButton';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://nymrel.com');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey | null>(null);

  // Initialize initial audit with Nymrel flagship preset
  const [auditResult, setAuditResult] = useState<AuditResult>(() => {
    return runAudit({ url: 'https://nymrel.com', presetId: 'nymrel' });
  });

  // Handle URL query parameters on initial page load (e.g. ?url=stripe.com)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const presetId = params.get('example');
      const targetParam = params.get('url') || params.get('domain');
      const preset = presetId ? PRESET_SITES.find((candidate) => candidate.id === presetId) : undefined;
      if (preset) {
        handleTriggerAudit({ url: preset.url, presetId: preset.id });
      } else if (targetParam) {
        handleTriggerAudit({ url: targetParam });
      }
    } catch {
      // Ignore URL parsing errors on fallback
    }
  }, []);

  const handleTriggerAudit = (target: { url: string; presetId?: string; rawHtml?: string; jsonLd?: string }) => {
    setCurrentUrl(target.url);
    setIsScanning(true);
    setSelectedDimension(null);

    // Update browser URL query string for instant viral shareability
    try {
      const cleanTarget = target.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      const query = target.presetId
        ? `example=${encodeURIComponent(target.presetId)}`
        : `url=${encodeURIComponent(cleanTarget)}`;
      const newUrl = `${window.location.pathname}?${query}`;
      window.history.replaceState({}, '', newUrl);
    } catch {
      // Ignore
    }

    setScanStep(
      target.presetId
        ? 'Loading example fixture. No website request is made.'
        : target.jsonLd
          ? 'Evaluating manually supplied JSON-LD. No website request is made.'
          : 'No website evidence supplied. Live verification is unavailable.'
    );

    window.setTimeout(() => {
      const result = runAudit({
        url: target.url,
        presetId: target.presetId,
        rawHtml: target.rawHtml,
        jsonLdStrings: target.jsonLd ? [target.jsonLd] : undefined,
      });
      setAuditResult(result);
      setIsScanning(false);
      setScanStep('');
    }, 120);
  };

  const handleReset = () => {
    handleTriggerAudit({ url: 'https://nymrel.com', presetId: 'nymrel' });
  };

  return (
    <div className="app-container">
      <Header onReset={handleReset} />

      <main className="main-content">
        {/* Hero & URL Input */}
        <AuditHero
          currentUrl={currentUrl}
          isScanning={isScanning}
          scanStep={scanStep}
          onAudit={handleTriggerAudit}
        />

        {/* Scorecard Visualizer (Radar + Radial Gauge + 5 Dimensions) */}
        <ScorecardRadar
          result={auditResult}
          onSelectDimension={(dim) => {
            setSelectedDimension(dim);
            const el = document.getElementById('remediation-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 1-Click Viral Tweet & Share Bar */}
        {isScoredAudit(auditResult) && (
          <>
            {auditResult.provenance.kind === 'example_fixture' && <ShareOnXButton score={auditResult} />}

            {/* Diagnostics & Remediation Accordion */}
            <div id="remediation-section">
              <RemediationAccordion
                score={auditResult}
                selectedDimension={selectedDimension}
                onClearDimension={() => setSelectedDimension(null)}
              />
            </div>

            {/* SVG Machine Trust Badge Generator & Embed Drawer */}
            <BadgeEmbedDrawer score={auditResult} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
