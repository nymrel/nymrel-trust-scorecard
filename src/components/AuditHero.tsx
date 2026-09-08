import { ArrowRight, ChevronDown, Globe, ShieldCheck } from 'lucide-react';
import { type FormEvent, useEffect, useId, useState } from 'react';

import { PRESET_SITES } from '../engine/fixtures';

export interface AuditRequest {
  url: string;
  presetId?: string;
  jsonLd?: string;
}

interface AuditHeroProps {
  activeFixtureId?: string | undefined;
  currentUrl: string;
  isPending: boolean;
  onAudit: (request: AuditRequest) => void;
}

export function AuditHero({ activeFixtureId, currentUrl, isPending, onAudit }: AuditHeroProps) {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [showEvidence, setShowEvidence] = useState(false);
  const [jsonLd, setJsonLd] = useState('');
  const evidencePanelId = useId();

  useEffect(() => setInputUrl(currentUrl), [currentUrl]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = inputUrl.trim();
    if (!url || isPending) return;
    const trimmedJsonLd = jsonLd.trim();
    onAudit({ url, ...(trimmedJsonLd ? { jsonLd: trimmedJsonLd } : {}) });
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">
        <ShieldCheck aria-hidden="true" size={16} />
        Local-first machine-readability diagnostic
      </p>

      <h1 id="hero-title">
        Inspect the evidence. <span className="hero-accent">Keep the claim honest.</span>
      </h1>
      <p className="hero-copy">
        Score a versioned illustrative fixture or bounded JSON-LD you supply. This browser app does
        not fetch a website, verify live behavior, certify readiness, or predict discoverability.
      </p>

      <form onSubmit={handleSubmit} className="audit-form" aria-label="Diagnostic evidence input">
        <label htmlFor="diagnostic-domain" className="sr-only">
          Domain used to label the evidence
        </label>
        <Globe aria-hidden="true" className="input-icon" size={20} />
        <input
          id="diagnostic-domain"
          type="text"
          inputMode="url"
          value={inputUrl}
          onChange={(event) => setInputUrl(event.target.value)}
          placeholder="example.com"
          autoComplete="url"
          maxLength={2048}
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || inputUrl.trim().length === 0}
          className="btn-primary"
        >
          {jsonLd.trim() ? 'Score supplied evidence' : 'Review domain'}
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </form>

      <p className="form-help">
        A domain by itself receives no score. It is a label only; no network request is made.
      </p>

      <fieldset className="fixture-picker">
        <legend>Illustrative fixtures</legend>
        <div className="fixture-list">
          {PRESET_SITES.map((fixture) => (
            <button
              key={fixture.id}
              type="button"
              className="fixture-button"
              aria-pressed={activeFixtureId === fixture.id}
              disabled={isPending}
              onClick={() => {
                setInputUrl(fixture.url);
                setJsonLd('');
                onAudit({ url: fixture.url, presetId: fixture.id });
              }}
            >
              {fixture.name}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="evidence-toggle"
        aria-expanded={showEvidence}
        aria-controls={evidencePanelId}
        onClick={() => setShowEvidence((visible) => !visible)}
      >
        <ChevronDown aria-hidden="true" size={15} />
        {showEvidence ? 'Hide manual evidence' : 'Supply manual JSON-LD evidence'}
      </button>

      {showEvidence && (
        <div id={evidencePanelId} className="evidence-panel">
          <label htmlFor="manual-json-ld">Schema.org JSON-LD</label>
          <textarea
            id="manual-json-ld"
            rows={7}
            value={jsonLd}
            maxLength={131_072}
            spellCheck={false}
            onChange={(event) => setJsonLd(event.target.value)}
            placeholder='{ "@context": "https://schema.org", "@type": "Organization", "name": "Example" }'
          />
          <p>
            Evidence remains in this page and is never sent by this application. Invalid JSON is
            scored as invalid evidence; it is not silently repaired.
          </p>
        </div>
      )}
    </section>
  );
}
