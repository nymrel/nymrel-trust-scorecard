import React, { useState } from 'react';
import { AuditScore } from '../types';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareOnXButtonProps {
  score: AuditScore;
}

export const ShareOnXButton: React.FC<ShareOnXButtonProps> = ({ score }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const shareUrl = `https://score.nymrel.com/?url=${encodeURIComponent(score.domain)}`;
  const tweetText = `My site scored ${score.totalScore}/100 (Grade ${score.grade}) on @nymrel Machine Trust Scorecard! Check your AI agent readiness: ${shareUrl}`;
  const tweetIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySnippet = () => {
    const summary = `🛡️ Machine Trust Audit for ${score.domain}: ${score.totalScore}/100 (Grade ${score.grade})\n• Discovery: ${score.dimensions.discovery.score}/20\n• Entity Graph: ${score.dimensions.entityGraph.score}/20\n• Offers & Commerce: ${score.dimensions.intentAndOffers.score}/20\n• Machine Payments: ${score.dimensions.machinePayments.score}/20\n• Crawler Access: ${score.dimensions.aiCrawlerAccess.score}/20\n\nAudit your domain: ${shareUrl}`;
    navigator.clipboard.writeText(summary);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-stone-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '48px',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Share2 size={18} color="var(--color-terracotta)" />
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-cedar)' }}>
            Share Your Machine Trust Score
          </h4>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Broadcast your site's AI Agent readiness to customers, partners, and autonomous agent networks.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Share on X (Twitter) */}
        <a
          href={tweetIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#000000',
            color: '#FAF8F2',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1F2937';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
          }}
        >
          {/* Custom X mark */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share on X</span>
        </a>

        {/* Copy Share URL */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="btn-secondary"
          style={{ fontSize: '13px', padding: '10px 14px' }}
        >
          {copiedLink ? (
            <>
              <Check size={14} color="#1F5A38" />
              <span style={{ color: '#1F5A38' }}>Link Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Copy Text Summary */}
        <button
          type="button"
          onClick={handleCopySnippet}
          className="btn-secondary"
          style={{ fontSize: '13px', padding: '10px 14px' }}
        >
          {copiedSnippet ? (
            <>
              <Check size={14} color="#1F5A38" />
              <span style={{ color: '#1F5A38' }}>Summary Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Scorecard Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
