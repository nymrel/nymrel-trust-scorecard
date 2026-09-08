import { Award, Check, Copy, Download, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { generateBadgeArtifact } from '../engine/badgeGenerator';
import { copyText } from '../lib/clipboard';
import type { AuditScore, BadgeOptions } from '../types';

interface BadgeEmbedDrawerProps {
  score: AuditScore;
}

const THEMES = [
  { id: 'warm-paper', name: 'Warm Paper' },
  { id: 'cedar', name: 'Cedar Forest' },
  { id: 'terracotta', name: 'Terracotta' },
  { id: 'minimal-stone', name: 'Minimal Stone' },
] as const satisfies readonly { id: BadgeOptions['theme']; name: string }[];

const FORMATS = [
  { id: 'pill', name: 'Pill' },
  { id: 'shield', name: 'Shield' },
  { id: 'compact', name: 'Compact' },
] as const satisfies readonly { id: BadgeOptions['format']; name: string }[];

export function BadgeEmbedDrawer({ score }: BadgeEmbedDrawerProps) {
  const [theme, setTheme] = useState<BadgeOptions['theme']>('warm-paper');
  const [format, setFormat] = useState<BadgeOptions['format']>('pill');
  const [label, setLabel] = useState('Illustrative score');
  const [artifactView, setArtifactView] = useState<'svg' | 'data-uri'>('svg');
  const [copyStatus, setCopyStatus] = useState<'copied' | 'error' | null>(null);
  const feedbackTimer = useRef<number | undefined>(undefined);

  const artifact = useMemo(
    () =>
      generateBadgeArtifact(score.domain, score.totalScore, score.grade, {
        format,
        label,
        theme,
      }),
    [format, label, score.domain, score.grade, score.totalScore, theme],
  );
  const displayedArtifact = artifactView === 'svg' ? artifact.svg : artifact.dataUri;

  useEffect(
    () => () => {
      if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const handleCopy = async () => {
    const copied = await copyText(displayedArtifact);
    setCopyStatus(copied ? 'copied' : 'error');
    if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCopyStatus(null), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.svg], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = artifact.fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <section className="panel" aria-labelledby="badge-title">
      <div className="panel-header">
        <div>
          <h2 id="badge-title" className="section-title">
            <Award aria-hidden="true" size={22} />
            Local illustrative badge
          </h2>
          <p className="section-copy">
            This downloadable artifact preserves the result label. It is not a hosted verification
            badge, certification, or current-domain proof.
          </p>
        </div>
        <button type="button" onClick={handleDownload} className="btn-secondary">
          <Download aria-hidden="true" size={15} />
          Download SVG
        </button>
      </div>

      <div className="badge-grid">
        <div className="control-stack">
          <fieldset className="control-group">
            <legend>Color theme</legend>
            <div className="option-grid">
              {THEMES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="option-button"
                  aria-pressed={theme === option.id}
                  onClick={() => setTheme(option.id)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="control-group">
            <legend>Badge format</legend>
            <div className="option-grid option-grid-three">
              {FORMATS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="option-button"
                  aria-pressed={format === option.id}
                  onClick={() => setFormat(option.id)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="control-group">
            <label htmlFor="badge-label">Badge label</label>
            <input
              id="badge-label"
              type="text"
              value={label}
              maxLength={40}
              onChange={(event) => setLabel(event.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <h3 className="control-label">Safe image preview</h3>
          <div className="badge-preview">
            <img
              src={artifact.dataUri}
              alt={`Illustrative diagnostic badge for ${score.domain}: ${score.totalScore} out of 100, grade ${score.grade}`}
            />
          </div>

          <div className="artifact-toolbar">
            <div role="tablist" aria-label="Badge artifact format" className="tab-list">
              {(['svg', 'data-uri'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={artifactView === tab}
                  className="tab-button"
                  onClick={() => setArtifactView(tab)}
                >
                  {tab === 'svg' ? 'SVG source' : 'Data URI'}
                </button>
              ))}
            </div>
            <button type="button" className="copy-button" onClick={handleCopy}>
              {copyStatus === 'copied' ? (
                <Check aria-hidden="true" size={14} />
              ) : copyStatus === 'error' ? (
                <TriangleAlert aria-hidden="true" size={14} />
              ) : (
                <Copy aria-hidden="true" size={14} />
              )}
              {copyStatus === 'copied'
                ? 'Copied'
                : copyStatus === 'error'
                  ? 'Clipboard unavailable'
                  : 'Copy artifact'}
            </button>
          </div>
          <pre className="code-block artifact-code">
            <code>{displayedArtifact}</code>
          </pre>
          <p className="sr-only" aria-live="polite">
            {copyStatus === 'copied'
              ? 'Badge artifact copied.'
              : copyStatus === 'error'
                ? 'Clipboard access is unavailable.'
                : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
