import { Check, Copy, Share2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { copyText } from '../lib/clipboard';
import type { AuditScore } from '../types';

interface ShareOnXButtonProps {
  score: AuditScore;
}

type CopyStatus = 'copied-link' | 'copied-summary' | 'error' | null;

export function ShareOnXButton({ score }: ShareOnXButtonProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const feedbackTimer = useRef<number | undefined>(undefined);
  const fixtureId = score.provenance.fixtureId;
  const shareUrl = fixtureId
    ? `https://score.nymrel.com/?example=${encodeURIComponent(fixtureId)}`
    : 'https://score.nymrel.com/';
  const summary = `${score.provenance.label} for ${score.domain}: ${score.totalScore}/100 (grade ${score.grade}). Synthetic fixture; not live-verified, certified, or outcome proof. Review: ${shareUrl}`;
  const xDraftUrl = `https://x.com/intent/post?text=${encodeURIComponent(summary)}`;

  useEffect(
    () => () => {
      if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const copy = async (value: string, success: Exclude<CopyStatus, 'error' | null>) => {
    const copied = await copyText(value);
    setCopyStatus(copied ? success : 'error');
    if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCopyStatus(null), 2500);
  };

  return (
    <section className="share-panel" aria-labelledby="share-title">
      <div>
        <h2 id="share-title">
          <Share2 aria-hidden="true" size={18} />
          Share the illustration honestly
        </h2>
        <p>
          The prepared copy labels this as synthetic and not live-verified. Review every word before
          publishing.
        </p>
      </div>

      <div className="share-actions">
        <a href={xDraftUrl} target="_blank" rel="noopener noreferrer" className="x-draft-button">
          Open draft on X
        </a>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => copy(shareUrl, 'copied-link')}
        >
          {copyStatus === 'copied-link' ? (
            <Check aria-hidden="true" size={14} />
          ) : (
            <Copy aria-hidden="true" size={14} />
          )}
          {copyStatus === 'copied-link' ? 'Link copied' : 'Copy link'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => copy(summary, 'copied-summary')}
        >
          {copyStatus === 'copied-summary' ? (
            <Check aria-hidden="true" size={14} />
          ) : copyStatus === 'error' ? (
            <TriangleAlert aria-hidden="true" size={14} />
          ) : (
            <Copy aria-hidden="true" size={14} />
          )}
          {copyStatus === 'copied-summary'
            ? 'Summary copied'
            : copyStatus === 'error'
              ? 'Clipboard unavailable'
              : 'Copy summary'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copyStatus === 'error' ? 'Clipboard access is unavailable.' : ''}
      </p>
    </section>
  );
}
