import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Info,
  PackageCheck,
  Terminal,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { generateRemediationBundle } from '../engine/remediationEngine';
import { copyText } from '../lib/clipboard';
import { dimensions as dimensionConfigs } from '../theme/tokens';
import type { AuditScore, CheckStatus, DimensionKey } from '../types';

interface RemediationAccordionProps {
  score: AuditScore;
  selectedDimension?: DimensionKey | null;
  onClearDimension?: () => void;
}

type FilterMode = 'issues' | 'all' | 'passed';

function StatusIcon({ status }: { status: CheckStatus }) {
  const iconProps = { 'aria-hidden': true, size: 16 } as const;
  switch (status) {
    case 'PASS':
      return <CheckCircle2 {...iconProps} color="#1F5A38" />;
    case 'WARN':
      return <AlertTriangle {...iconProps} color="#9A4C10" />;
    case 'FAIL':
      return <XCircle {...iconProps} color="#9B1C1C" />;
    default:
      return <Info {...iconProps} color="#1E40AF" />;
  }
}

function statusPillClass(status: CheckStatus): string {
  return `pill pill-${status.toLowerCase()}`;
}

export function RemediationAccordion({
  score,
  selectedDimension,
  onClearDimension,
}: RemediationAccordionProps) {
  const [filter, setFilter] = useState<FilterMode>('issues');
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<{
    key: string;
    outcome: 'copied' | 'error';
  } | null>(null);
  const feedbackTimer = useRef<number | undefined>(undefined);
  const sectionId = useId();

  useEffect(
    () => () => {
      if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const remediationBundles = generateRemediationBundle(score.domain, score.checks);
  const filteredChecks = score.checks.filter((check) => {
    if (selectedDimension && check.dimension !== selectedDimension) return false;
    if (filter === 'issues') return check.status === 'FAIL' || check.status === 'WARN';
    if (filter === 'passed') return check.status === 'PASS';
    return true;
  });

  const handleCopy = async (code: string, key: string) => {
    const copied = await copyText(code);
    setCopyFeedback({ key, outcome: copied ? 'copied' : 'error' });
    if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCopyFeedback(null), 2500);
  };

  return (
    <section className="remediation-section" aria-labelledby={`${sectionId}-title`}>
      <div className="remediation-header">
        <div>
          <h2 id={`${sectionId}-title`} className="section-title">
            <Terminal aria-hidden="true" size={20} />
            Diagnostics and reviewable remediation
          </h2>
          <p className="section-copy">
            Inspect the scoring rationale and adapt candidate files to your verified architecture.
            No candidate automatically changes a site, proves compliance, or guarantees a score.
          </p>
        </div>

        <fieldset className="filter-controls">
          <legend className="sr-only">Filter diagnostic checks</legend>
          {(['issues', 'all', 'passed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={filter === mode}
              onClick={() => setFilter(mode)}
            >
              {mode === 'issues' ? 'Issues' : mode === 'all' ? 'All checks' : 'Passed'}
            </button>
          ))}
        </fieldset>
      </div>

      {selectedDimension && (
        <div className="dimension-filter">
          <span>
            Showing <strong>{dimensionConfigs[selectedDimension].name}</strong>
          </span>
          <button type="button" onClick={() => onClearDimension?.()}>
            Show every dimension
          </button>
        </div>
      )}

      {remediationBundles.length > 0 && filter !== 'passed' && (
        <div className="candidate-panel">
          <div className="candidate-heading">
            <PackageCheck aria-hidden="true" size={20} />
            <div>
              <h3>Review candidates</h3>
              <p>Templates contain operator-fill fields and require owner review before use.</p>
            </div>
          </div>

          <div className="candidate-grid">
            {remediationBundles.map((bundle) => {
              const feedbackKey = `bundle-${bundle.title}`;
              return (
                <article key={bundle.title} className="candidate-card">
                  <h4>{bundle.title}</h4>
                  <p>{bundle.description}</p>
                  <div className="candidate-instruction">
                    <code>{bundle.reviewCommand}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(bundle.reviewCommand, feedbackKey)}
                      aria-label={`Copy review instruction for ${bundle.title}`}
                    >
                      {copyFeedback?.key === feedbackKey && copyFeedback.outcome === 'copied' ? (
                        <Check aria-hidden="true" size={14} />
                      ) : copyFeedback?.key === feedbackKey && copyFeedback.outcome === 'error' ? (
                        <TriangleAlert aria-hidden="true" size={14} />
                      ) : (
                        <Copy aria-hidden="true" size={14} />
                      )}
                    </button>
                  </div>
                  <details>
                    <summary>{bundle.files.length} candidate file(s)</summary>
                    {bundle.files.map((file) => (
                      <div key={file.filename} className="candidate-file">
                        <div>
                          <strong>{file.filename}</strong>
                          <span>{file.explanation}</span>
                        </div>
                        <pre className="code-block">
                          <code>{file.code}</code>
                        </pre>
                      </div>
                    ))}
                  </details>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <div className="check-list">
        {filteredChecks.length === 0 ? (
          <div className="empty-checks">
            <CheckCircle2 aria-hidden="true" size={30} />
            <h3>No checks match this filter</h3>
            <p>The selected diagnostic view has no results in this status group.</p>
          </div>
        ) : (
          filteredChecks.map((check) => {
            const isOpen = activeCheckId === check.id;
            const panelId = `${sectionId}-${check.id}`;
            const dimension = dimensionConfigs[check.dimension];
            const snippet = check.codeSnippet;

            return (
              <article key={check.id} className="check-card">
                <button
                  type="button"
                  className="check-summary"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setActiveCheckId(isOpen ? null : check.id)}
                >
                  <StatusIcon status={check.status} />
                  <span className="check-summary-copy">
                    <span className="check-title-row">
                      <strong>{check.name}</strong>
                      <span>{dimension.shortName}</span>
                    </span>
                    <span className="check-message">{check.message}</span>
                  </span>
                  <span className={statusPillClass(check.status)}>
                    {check.score}/{check.maxScore} pts
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    size={18}
                    className={isOpen ? 'chevron-open' : undefined}
                  />
                </button>

                {isOpen && (
                  <div id={panelId} className="check-details">
                    <h3>Diagnostic rationale</h3>
                    <p>{check.message}</p>

                    {check.remediation && (
                      <div className="remediation-note">
                        <strong>Review candidate</strong>
                        <p>{check.remediation}</p>
                      </div>
                    )}

                    {snippet && (
                      <div className="snippet">
                        <div className="snippet-toolbar">
                          <span>
                            {snippet.filename} ({snippet.language})
                          </span>
                          <button type="button" onClick={() => handleCopy(snippet.code, check.id)}>
                            {copyFeedback?.key === check.id && copyFeedback.outcome === 'copied' ? (
                              <Check aria-hidden="true" size={13} />
                            ) : copyFeedback?.key === check.id &&
                              copyFeedback.outcome === 'error' ? (
                              <TriangleAlert aria-hidden="true" size={13} />
                            ) : (
                              <Copy aria-hidden="true" size={13} />
                            )}
                            {copyFeedback?.key === check.id
                              ? copyFeedback.outcome === 'copied'
                                ? 'Copied'
                                : 'Clipboard unavailable'
                              : 'Copy candidate'}
                          </button>
                        </div>
                        <pre className="code-block snippet-code">
                          <code>{snippet.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {copyFeedback?.outcome === 'copied'
          ? 'Candidate copied.'
          : copyFeedback?.outcome === 'error'
            ? 'Clipboard access is unavailable.'
            : ''}
      </p>
    </section>
  );
}
