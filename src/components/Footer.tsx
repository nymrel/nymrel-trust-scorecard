import React from 'react';
import { Shield, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-stone-border)',
      backgroundColor: 'var(--color-linen)',
      padding: '48px 20px 36px 20px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '36px',
        marginBottom: '36px',
      }}>
        {/* Entity & Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-cedar)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cream)',
            }}>
              <Shield size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 800, color: 'var(--color-cedar)' }}>
              Nymrel Trust Scorecard
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
            Dual-audience machine trust and agentic commerce verification standard. Built for human clarity and verifiable machine execution.
          </p>
          <div style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
          }}>
            Operating Umbrella: <strong>Nymrel</strong><br />
            Parent Legal Entity: <strong>JalenBuilds LLC</strong>
          </div>
        </div>

        {/* Nymrel Ecosystem Links */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-cedar)', marginBottom: '12px' }}>
            Ecosystem Protocols
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <li>
              <a href="https://github.com/nymrel/open-ucp" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                <span>@nymrel/open-ucp</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://github.com/nymrel/nymrel-machine-trust" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                <span>@nymrel/machine-trust</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://github.com/nymrel/agentic-ucp-scanner" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                <span>@nymrel/agentic-ucp-scanner</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        {/* Machine Trust & Machine Discovery Links */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-cedar)', marginBottom: '12px' }}>
            Machine Orientation
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <li>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                <FileText size={13} color="var(--color-terracotta)" />
                <span>/llms.txt Orientation</span>
              </a>
            </li>
            <li>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                <FileText size={13} />
                <span>robots.txt AI Policy</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/nymrel/nymrel-trust-scorecard" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Source Code (MIT)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & License */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        borderTop: '1px solid var(--color-stone-border)',
        paddingTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--color-text-muted)',
      }}>
        <div>
          © 2026 Nymrel / JalenBuilds LLC. Released under the MIT License.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>contact@jalenbuilds.com</span>
          <span>Nymrel Machine Trust Certified</span>
        </div>
      </div>
    </footer>
  );
};
