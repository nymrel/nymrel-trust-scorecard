import React, { useState } from 'react';
import { AuditScore, BadgeOptions } from '../types';
import { generateBadgeSvg, generateBadgeEmbedCode } from '../engine/badgeGenerator';
import { Award, Copy, Check, Download } from 'lucide-react';

interface BadgeEmbedDrawerProps {
  score: AuditScore;
}

export const BadgeEmbedDrawer: React.FC<BadgeEmbedDrawerProps> = ({ score }) => {
  const [theme, setTheme] = useState<BadgeOptions['theme']>('warm-paper');
  const [format, setFormat] = useState<BadgeOptions['format']>('pill');
  const [label, setLabel] = useState('Machine Trust');
  const [activeTab, setActiveTab] = useState<'markdown' | 'html' | 'react'>('markdown');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const badgeSvg = generateBadgeSvg(score.totalScore, score.grade, { theme, format, label });
  const embedCodes = generateBadgeEmbedCode(score.domain, score.totalScore, score.grade, { theme, format, label });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([badgeSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nymrel-trust-badge-${score.domain}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-stone-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '32px 24px',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '48px',
    }}>
      {/* Title & Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--color-stone-border)',
        paddingBottom: '20px',
        marginBottom: '24px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--color-cedar)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Award size={22} color="var(--color-terracotta)" />
            <span>Machine Trust Badge Generator</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Embed a live, verified Machine Trust badge in your GitHub README, website footer, or documentation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSvg}
          className="btn-secondary"
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          <Download size={15} />
          <span>Download SVG</span>
        </button>
      </div>

      {/* Grid: Left Customizer Controls, Right Live Preview & Embed Code */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
      }}>
        {/* Customizer Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theme Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-cedar)', display: 'block', marginBottom: '8px' }}>
              Color Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { id: 'warm-paper', name: 'Warm Paper' },
                { id: 'cedar', name: 'Cedar Forest' },
                { id: 'terracotta', name: 'Terracotta' },
                { id: 'minimal-stone', name: 'Minimal Stone' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${theme === t.id ? 'var(--color-terracotta)' : 'var(--color-stone-border)'}`,
                    backgroundColor: theme === t.id ? 'var(--color-linen)' : 'var(--color-surface-warm)',
                    color: theme === t.id ? 'var(--color-cedar)' : 'var(--color-text-secondary)',
                    fontWeight: theme === t.id ? 700 : 500,
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-cedar)', display: 'block', marginBottom: '8px' }}>
              Badge Format
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'pill', name: 'Pill' },
                { id: 'shield', name: 'Shield' },
                { id: 'compact', name: 'Compact' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format === f.id ? 'var(--color-terracotta)' : 'var(--color-stone-border)'}`,
                    backgroundColor: format === f.id ? 'var(--color-linen)' : 'var(--color-surface-warm)',
                    color: format === f.id ? 'var(--color-cedar)' : 'var(--color-text-secondary)',
                    fontWeight: format === f.id ? 700 : 500,
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-cedar)', display: 'block', marginBottom: '8px' }}>
              Badge Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Machine Trust"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-stone-border)',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'var(--color-surface-warm)',
              }}
            />
          </div>
        </div>

        {/* Live Preview & Code Block */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-cedar)', display: 'block', marginBottom: '8px' }}>
            Live Rendered Preview
          </label>
          <div style={{
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-stone-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px',
            marginBottom: '20px',
          }}>
            <div dangerouslySetInnerHTML={{ __html: badgeSvg }} />
          </div>

          {/* Code Tabs */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-stone-border)',
              paddingBottom: '6px',
              marginBottom: '10px',
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['markdown', 'html', 'react'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontSize: '12px',
                      fontWeight: activeTab === tab ? 700 : 500,
                      color: activeTab === tab ? 'var(--color-terracotta)' : 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      padding: '4px 8px',
                      borderBottom: activeTab === tab ? '2px solid var(--color-terracotta)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleCopy(embedCodes[activeTab], `tab-${activeTab}`)}
                style={{
                  fontSize: '12px',
                  color: 'var(--color-cedar)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
              >
                {copiedKey === `tab-${activeTab}` ? (
                  <>
                    <Check size={13} color="#1F5A38" />
                    <span style={{ color: '#1F5A38' }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre style={{
              margin: 0,
              backgroundColor: 'var(--color-cedar-dark)',
              color: '#F4F0E6',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              overflowX: 'auto',
              lineHeight: 1.5,
            }}>
              <code>{embedCodes[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
