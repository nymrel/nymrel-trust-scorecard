import React, { useState } from 'react';
import { Globe, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { PRESET_SITES } from '../engine/fixtures';

interface AuditHeroProps {
  currentUrl: string;
  isScanning: boolean;
  scanStep: string;
  onAudit: (target: { url: string; presetId?: string; rawHtml?: string; jsonLd?: string }) => void;
}

export const AuditHero: React.FC<AuditHeroProps> = ({
  currentUrl,
  isScanning,
  scanStep,
  onAudit,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || 'nymrel.com');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customJsonLd, setCustomJsonLd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isScanning) return;
    onAudit({
      url: inputUrl.trim(),
      jsonLd: customJsonLd.trim() ? customJsonLd.trim() : undefined,
    });
  };

  const handleSelectPreset = (presetId: string, url: string) => {
    setInputUrl(url);
    onAudit({ url, presetId });
  };

  return (
    <section style={{
      padding: '48px 0 24px 0',
      textAlign: 'center',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Eyebrow badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'var(--color-linen)',
        border: '1px solid var(--color-stone-border)',
        padding: '5px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--color-cedar)',
        marginBottom: '18px',
      }}>
        <ShieldCheck size={16} color="var(--color-terracotta)" />
        <span>Universal Commerce Protocol & Dual-Audience Trust Engine</span>
      </div>

      {/* Main Heading */}
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(28px, 5vw, 44px)',
        fontWeight: 800,
        lineHeight: 1.15,
        color: 'var(--color-cedar)',
        letterSpacing: '-0.025em',
        marginBottom: '16px',
      }}>
        Is Your Website Ready for{' '}
        <span style={{
          color: 'var(--color-terracotta)',
          textDecoration: 'underline',
          textDecorationColor: 'var(--color-stone-border-dark)',
          textUnderlineOffset: '6px',
        }}>
          Autonomous AI Agents
        </span>
        ?
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(15px, 2vw, 17px)',
        color: 'var(--color-text-secondary)',
        maxWidth: '680px',
        margin: '0 auto 32px auto',
        lineHeight: 1.6,
      }}>
        A deterministic scorer for clearly labeled example fixtures or evidence you paste here. This browser demo does not fetch websites or live-verify domains.
      </p>

      {/* URL Input Bar */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-stone-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '6px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '680px',
        margin: '0 auto 20px auto',
        transition: 'all 0.2s ease',
      }}>
        <div style={{ paddingLeft: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
          <Globe size={20} color="var(--color-terracotta)" />
        </div>
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter a domain to label supplied evidence or choose an example"
          disabled={isScanning}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'transparent',
            padding: '8px 4px',
          }}
        />
        <button
          type="submit"
          disabled={isScanning}
          className="btn-primary"
          style={{
            minWidth: '130px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
          }}
        >
          {isScanning ? (
            <>
              <Zap size={16} className="pulse-badge" />
              <span>Preparing result...</span>
            </>
          ) : (
            <>
              <span>Review input</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Scanning Progress Overlay / Text */}
      {isScanning && (
        <div style={{
          backgroundColor: 'var(--color-linen)',
          border: '1px solid var(--color-stone-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          maxWidth: '580px',
          margin: '0 auto 20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '14px',
          color: 'var(--color-cedar)',
          fontWeight: 500,
        }}>
          <Sparkles size={16} color="var(--color-terracotta)" className="spin-slow" />
          <span>{scanStep || 'Preparing a local, not-live-verified result...'}</span>
        </div>
      )}

      {/* 1-Click Preset Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '8px',
      }}>
        <span style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          fontWeight: 600,
          marginRight: '4px',
        }}>
          Example fixtures:
        </span>
        {PRESET_SITES.map((preset) => {
          const isActive = cleanUrl(preset.url) === cleanUrl(inputUrl);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id, preset.url)}
              disabled={isScanning}
              style={{
                backgroundColor: isActive ? 'var(--color-cedar)' : 'var(--color-surface)',
                color: isActive ? 'var(--color-cream)' : 'var(--color-cedar)',
                border: `1px solid ${isActive ? 'var(--color-cedar)' : 'var(--color-stone-border)'}`,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-linen)';
                  e.currentTarget.style.borderColor = 'var(--color-cedar)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  e.currentTarget.style.borderColor = 'var(--color-stone-border)';
                }
              }}
            >
              {preset.id === 'nymrel' && <ShieldCheck size={13} color={isActive ? '#FAF8F2' : '#A8541F'} />}
              <span>{preset.name} example</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Inspector Toggle */}
      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {showAdvanced ? 'Hide Custom JSON-LD Tester' : 'Test custom JSON-LD / HTML snippet'}
        </button>
        {showAdvanced && (
          <div style={{
            marginTop: '12px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-stone-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'left',
            maxWidth: '680px',
            margin: '12px auto 0 auto',
          }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-cedar)', display: 'block', marginBottom: '6px' }}>
              Paste manual Schema.org JSON-LD (optional):
            </label>
            <textarea
              rows={4}
              value={customJsonLd}
              onChange={(e) => setCustomJsonLd(e.target.value)}
              placeholder='{ "@context": "https://schema.org", "@type": "Organization", "name": "My AI Co", "parentOrganization": { "@type": "Organization", "name": "Parent Co" } }'
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '8px',
                border: '1px solid var(--color-stone-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-warm)',
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
              Pasted evidence is evaluated locally and is not live-verified. A domain alone will not receive a score.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

function cleanUrl(u: string): string {
  return u.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}
