import React, { useState, useEffect } from 'react';
import { AuditScore, DimensionKey } from './types';
import { runAudit } from './engine/auditEngine';
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
  const [auditScore, setAuditScore] = useState<AuditScore>(() => {
    return runAudit({ url: 'https://nymrel.com', presetId: 'nymrel' });
  });

  // Handle URL query parameters on initial page load (e.g. ?url=stripe.com)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetParam = params.get('url') || params.get('domain');
      if (targetParam) {
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
      const newUrl = `${window.location.pathname}?url=${encodeURIComponent(cleanTarget)}`;
      window.history.replaceState({}, '', newUrl);
    } catch {
      // Ignore
    }

    const steps = [
      'Probing robots.txt for OAI-SearchBot & PerplexityBot access...',
      'Extracting Schema.org JSON-LD graph & parentOrganization hierarchy...',
      'Inspecting Universal Commerce Protocol (UCP) manifest & endpoints...',
      'Evaluating HTTP 402 / x402 headers & autonomous payment rails...',
      'Synthesizing Machine Trust Index and generating code patches...',
    ];

    let stepIdx = 0;
    setScanStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setScanStep(steps[stepIdx]);
      } else {
        clearInterval(stepInterval);
        const result = runAudit({
          url: target.url,
          presetId: target.presetId,
          rawHtml: target.rawHtml,
          jsonLdStrings: target.jsonLd ? [target.jsonLd] : undefined,
        });
        setAuditScore(result);
        setIsScanning(false);
        setScanStep('');
      }
    }, 280);
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
          score={auditScore}
          onSelectDimension={(dim) => {
            setSelectedDimension(dim);
            const el = document.getElementById('remediation-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 1-Click Viral Tweet & Share Bar */}
        <ShareOnXButton score={auditScore} />

        {/* Diagnostics & Remediation Accordion */}
        <div id="remediation-section">
          <RemediationAccordion
            score={auditScore}
            selectedDimension={selectedDimension}
            onClearDimension={() => setSelectedDimension(null)}
          />
        </div>

        {/* SVG Machine Trust Badge Generator & Embed Drawer */}
        <BadgeEmbedDrawer score={auditScore} />
      </main>

      <Footer />
    </div>
  );
};
