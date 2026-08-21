import React, { useState } from 'react';
import { AuditScore, CheckStatus, DimensionKey } from '../types';
import { dimensions as dimensionConfigs } from '../theme/tokens';
import { generateRemediationBundle } from '../engine/remediationEngine';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  PackageCheck,
} from 'lucide-react';

interface RemediationAccordionProps {
  score: AuditScore;
  selectedDimension?: DimensionKey | null;
  onClearDimension?: () => void;
}

export const RemediationAccordion: React.FC<RemediationAccordionProps> = ({
  score,
  selectedDimension,
  onClearDimension,
}) => {
  const [filter, setFilter] = useState<'all' | 'issues' | 'passed'>('issues');
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Generate complete remediation packages using @nymrel/machine-trust and @nymrel/open-ucp
  const remediationBundles = generateRemediationBundle(score.domain, score.checks);

  // Filter checks
  const filteredChecks = score.checks.filter((check) => {
    if (selectedDimension && check.dimension !== selectedDimension) return false;
    if (filter === 'issues') return check.status === 'FAIL' || check.status === 'WARN';
    if (filter === 'passed') return check.status === 'PASS';
    return true;
  });

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 size={16} color="#1F5A38" />;
      case 'WARN':
        return <AlertTriangle size={16} color="#B46416" />;
      case 'FAIL':
        return <XCircle size={16} color="#C53030" />;
      default:
        return <Info size={16} color="#1E40AF" />;
    }
  };

  const getStatusPillClass = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return 'pill-pass';
      case 'WARN':
        return 'pill-warn';
      case 'FAIL':
        return 'pill-fail';
      default:
        return 'pill-info';
    }
  };

  return (
    <section style={{ marginBottom: '48px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
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
            <Terminal size={20} color="var(--color-terracotta)" />
            <span>Diagnostics & 1-Click Code Remediation</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Instant code patches to achieve 100/100 Machine Trust using <code>@nymrel/machine-trust</code> and <code>@nymrel/open-ucp</code>.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-linen)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-stone-border)',
        }}>
          {(['issues', 'all', 'passed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: filter === mode ? 'var(--color-surface)' : 'transparent',
                color: filter === mode ? 'var(--color-cedar)' : 'var(--color-text-secondary)',
                boxShadow: filter === mode ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {mode === 'issues' ? 'Issues & Fixes' : mode === 'all' ? 'All Checks' : 'Passed Checks'}
            </button>
          ))}
        </div>
      </div>

      {/* Dimension Filter Chip (if selected from Radar) */}
      {selectedDimension && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--color-linen)',
          border: '1px solid var(--color-stone-border)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '13px',
        }}>
          <span>Showing dimension: <strong>{dimensionConfigs[selectedDimension].name}</strong></span>
          <button
            type="button"
            onClick={onClearDimension}
            style={{
              color: 'var(--color-terracotta)',
              fontWeight: 700,
              fontSize: '12px',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Show all dimensions
          </button>
        </div>
      )}

      {/* Top 1-Click Fix Packages (if issues exist) */}
      {remediationBundles.length > 0 && filter !== 'passed' && (
        <div style={{
          backgroundColor: 'var(--color-surface-warm)',
          border: '1px solid var(--color-stone-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PackageCheck size={20} color="var(--color-terracotta)" />
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-cedar)' }}>
              Recommended 1-Click Remediation Packages
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {remediationBundles.map((bundle, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-stone-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-cedar)', marginBottom: '4px' }}>
                    {bundle.title}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                    {bundle.description}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-cedar-dark)',
                    color: '#FAF8F2',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                  }}>
                    <code>{bundle.installCommand}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(bundle.installCommand, `bundle-${idx}`)}
                      style={{ color: '#FAF8F2', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Copy install command"
                    >
                      {copiedCodeKey === `bundle-${idx}` ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accordion Item List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredChecks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-stone-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
          }}>
            <CheckCircle2 size={32} color="#1F5A38" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-cedar)' }}>
              All checks in this category are in compliance!
            </div>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Your site clears all requirements for this audit filter.
            </p>
          </div>
        ) : (
          filteredChecks.map((check) => {
            const isOpen = activeCheckId === check.id;
            const dimConfig = dimensionConfigs[check.dimension];

            return (
              <div
                key={check.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isOpen ? 'var(--color-terracotta)' : 'var(--color-stone-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setActiveCheckId(isOpen ? null : check.id)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: isOpen ? 'var(--color-linen)' : 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {getStatusIcon(check.status)}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-cedar)' }}>
                          {check.name}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          backgroundColor: 'var(--color-linen-dark)',
                          color: 'var(--color-cedar)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}>
                          {dimConfig.shortName}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {check.message}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span className={`pill ${getStatusPillClass(check.status)}`}>
                      {check.score}/{check.maxScore} pts
                    </span>
                    {isOpen ? <ChevronUp size={18} color="var(--color-cedar)" /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
                  </div>
                </div>

                {/* Accordion Body */}
                {isOpen && (
                  <div style={{
                    padding: '18px 20px',
                    borderTop: '1px solid var(--color-stone-border)',
                    backgroundColor: 'var(--color-surface-warm)',
                  }}>
                    {/* Diagnosis explanation */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Diagnostic Analysis
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                        {check.message}
                      </p>
                    </div>

                    {/* Remediation guidance */}
                    {check.remediation && (
                      <div style={{
                        backgroundColor: '#FEF6ED',
                        border: '1px solid #FAD8B5',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        marginBottom: '16px',
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#9A4C10', marginBottom: '2px' }}>
                          How to Fix
                        </div>
                        <p style={{ fontSize: '13px', color: '#78350F' }}>
                          {check.remediation}
                        </p>
                      </div>
                    )}

                    {/* Code Snippet with Copy Button */}
                    {check.codeSnippet && (
                      <div style={{ position: 'relative', marginTop: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--color-cedar)',
                          color: '#E2DDD2',
                          padding: '6px 12px',
                          borderTopLeftRadius: 'var(--radius-sm)',
                          borderTopRightRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          <span>{check.codeSnippet.filename} ({check.codeSnippet.language})</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(check.codeSnippet!.code, check.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#FAF8F2',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {copiedCodeKey === check.id ? (
                              <>
                                <Check size={13} color="#34D399" />
                                <span style={{ color: '#34D399' }}>Copied!</span>
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
                          borderBottomLeftRadius: 'var(--radius-sm)',
                          borderBottomRightRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          overflowX: 'auto',
                          lineHeight: 1.5,
                        }}>
                          <code>{check.codeSnippet.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
