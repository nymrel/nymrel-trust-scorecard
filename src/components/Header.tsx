import React from 'react';
import { Shield, Radio, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--color-stone-border)',
      backgroundColor: 'rgba(250, 248, 242, 0.92)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Brand Mark & Title */}
        <div 
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-cedar)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cream)',
            boxShadow: '0 2px 6px rgba(42, 51, 46, 0.2)',
          }}>
            <Shield size={20} color="var(--color-cream)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--color-cedar)',
                letterSpacing: '-0.02em',
              }}>
                Nymrel
              </span>
              <span style={{
                backgroundColor: 'var(--color-terracotta)',
                color: 'var(--color-cream)',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                Trust Scorecard
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Dual-Audience Machine Trust & AI Readiness Gauge
            </div>
          </div>
        </div>

        {/* Example-mode notice & external links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* No-live-fetch notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-stone-border)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}>
            <Radio size={13} color="var(--color-terracotta)" />
            <span>
              <strong style={{ color: 'var(--color-cedar)', fontWeight: 700 }}>Example mode</strong>{' '}
              — no website fetches
            </span>
          </div>

          {/* Engine Status Pill */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#1F5A38',
            backgroundColor: '#EDF7F1',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #BDE0CD',
            fontWeight: 600,
          }} className="status-pill-desktop">
            <Sparkles size={13} />
            <span>Agentic UCP v1.0 Active</span>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/nymrel/nymrel-trust-scorecard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-stone-border)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-cedar)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-linen)';
              e.currentTarget.style.borderColor = 'var(--color-cedar)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              e.currentTarget.style.borderColor = 'var(--color-stone-border)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <style>{`
        @media (min-width: 640px) {
          .status-pill-desktop { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};
