import { useState } from 'react';
import { isScoredAudit, type AuditResult, type DimensionKey } from '../types';
import { dimensions as dimensionConfigs, colors } from '../theme/tokens';
import { Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ScorecardRadarProps {
  result: AuditResult;
  onSelectDimension?: (key: DimensionKey) => void;
}

export function ScorecardRadar({ result, onSelectDimension }: ScorecardRadarProps) {
  const [activeHoverDim, setActiveHoverDim] = useState<DimensionKey | null>(null);

  if (!isScoredAudit(result)) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-stone-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '32px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '12px',
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-stone-border)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-secondary)',
            fontWeight: 700,
          }}
        >
          {result.provenance.label}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-cedar)',
            margin: '14px 0 8px',
          }}
        >
          No score for {result.domain}
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {result.provenance.description}
        </p>
      </div>
    );
  }

  const score = result;

  const dimensionKeys: DimensionKey[] = [
    'discovery',
    'entityGraph',
    'intentAndOffers',
    'machinePayments',
    'aiCrawlerAccess',
  ];

  // SVG Radar calculations
  const size = 320;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = dimensionKeys.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Compute vertices for the score polygon
  const polygonPoints = dimensionKeys
    .map((key, i) => {
      const dim = score.dimensions[key];
      const ratio = (dim?.percentage || 0) / 100;
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const x = center + radius * ratio * Math.cos(angle);
      const y = center + radius * ratio * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Grade color theme
  const gradeInfo = colors.grades[score.grade === 'A+' ? 'A' : score.grade] || colors.grades.C;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-stone-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 24px',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '32px',
      }}
    >
      {/* Top Banner with Entity Name & Total Score Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--color-stone-border)',
          paddingBottom: '24px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-cedar)',
                letterSpacing: '-0.02em',
              }}
            >
              {score.entityName || score.domain}
            </h2>
            <span
              style={{
                fontSize: '12px',
                backgroundColor: 'var(--color-linen)',
                border: '1px solid var(--color-stone-border)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
              }}
            >
              {score.domain}
            </span>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.5,
            }}
          >
            {score.verdict}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              maxWidth: '640px',
              lineHeight: 1.5,
              marginBottom: 0,
            }}
          >
            <strong>{score.provenance.label}:</strong> {score.provenance.description}
          </p>
        </div>

        {/* Big Overall Grade Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: gradeInfo.bg,
            border: `1px solid ${gradeInfo.border}`,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: gradeInfo.text,
                fontWeight: 700,
              }}
            >
              Diagnostic score
            </div>
            <div
              style={{ fontSize: '36px', fontWeight: 900, color: gradeInfo.text, lineHeight: 1 }}
            >
              {score.totalScore}
              <span style={{ fontSize: '18px', fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <div
            style={{
              width: '1px',
              height: '40px',
              backgroundColor: gradeInfo.border,
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: gradeInfo.text,
                fontWeight: 700,
              }}
            >
              Grade
            </div>
            <div
              style={{ fontSize: '32px', fontWeight: 900, color: gradeInfo.text, lineHeight: 1 }}
            >
              {score.grade}
            </div>
          </div>
        </div>
      </div>

      {/* Center Visuals: Radial Radar Chart & Dimensions Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        {/* Radar Chart SVG */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-labelledby="radar-title radar-description"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            <title id="radar-title">Five-dimension diagnostic score for {score.domain}</title>
            <desc id="radar-description">
              {dimensionKeys
                .map(
                  (key) =>
                    `${dimensionConfigs[key].shortName}: ${score.dimensions[key].percentage}%`,
                )
                .join(', ')}
            </desc>
            <defs>
              <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8541F" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#2A332E" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Concentric Web Polygons */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
              const pts = dimensionKeys
                .map((_, i) => {
                  const angle = i * angleStep - Math.PI / 2;
                  const x = center + radius * level * Math.cos(angle);
                  const y = center + radius * level * Math.sin(angle);
                  return `${x},${y}`;
                })
                .join(' ');
              return (
                <polygon
                  key={level}
                  points={pts}
                  fill="none"
                  stroke="var(--color-stone-border)"
                  strokeWidth={level === 1.0 ? '1.5' : '1'}
                  strokeDasharray={level < 1.0 ? '3,3' : undefined}
                />
              );
            })}

            {/* Spokes / Axis Lines */}
            {dimensionKeys.map((key, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              return (
                <line
                  key={key}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="var(--color-stone-border)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Score Polygon */}
            <polygon
              points={polygonPoints}
              fill="url(#radarGrad)"
              stroke="var(--color-terracotta)"
              strokeWidth="2.5"
              style={{ transition: 'all 0.4s ease-out' }}
            />

            {/* Data Point Nodes */}
            {dimensionKeys.map((key, i) => {
              const dim = score.dimensions[key];
              const ratio = (dim?.percentage || 0) / 100;
              const angle = i * angleStep - Math.PI / 2;
              const x = center + radius * ratio * Math.cos(angle);
              const y = center + radius * ratio * Math.sin(angle);
              const isHovered = activeHoverDim === key;

              return (
                <g key={key}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill={isHovered ? 'var(--color-terracotta)' : 'var(--color-cedar)'}
                    stroke="#FAF8F2"
                    strokeWidth="2"
                    style={{ transition: 'all 0.2s ease' }}
                  />
                </g>
              );
            })}

            {/* Dimension Labels around circumference */}
            {dimensionKeys.map((key, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = radius + 24;
              const x = center + labelRadius * Math.cos(angle);
              const y = center + labelRadius * Math.sin(angle);
              const isHovered = activeHoverDim === key;
              const dimConfig = dimensionConfigs[key];

              let anchor: 'start' | 'end' | 'middle' = 'middle';
              if (Math.cos(angle) > 0.3) anchor = 'start';
              else if (Math.cos(angle) < -0.3) anchor = 'end';

              return (
                <text
                  key={key}
                  x={x}
                  y={y + 4}
                  textAnchor={anchor}
                  fill={isHovered ? 'var(--color-terracotta)' : 'var(--color-cedar)'}
                  fontFamily="var(--font-sans)"
                  fontSize={isHovered ? '12px' : '11px'}
                  fontWeight={isHovered ? '700' : '600'}
                  style={{ transition: 'all 0.15s ease' }}
                >
                  {dimConfig.shortName} ({score.dimensions[key]?.percentage || 0}%)
                </text>
              );
            })}
          </svg>

          {/* Machine Trust Index Pill underneath */}
          <div
            style={{
              marginTop: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-linen)',
              border: '1px solid var(--color-stone-border)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              color: 'var(--color-cedar)',
              fontWeight: 600,
            }}
          >
            <Sparkles aria-hidden="true" size={14} color="var(--color-terracotta)" />
            <span>
              Normalized diagnostic index:{' '}
              <strong>{score.machineTrustIndex.toFixed(2)} / 1.00</strong>
            </span>
          </div>
        </div>

        {/* 5-Dimension Progress List & Quick Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dimensionKeys.map((key) => {
            const dim = score.dimensions[key];
            const config = dimensionConfigs[key];
            const isHovered = activeHoverDim === key;

            return (
              <button
                type="button"
                key={key}
                onClick={() => onSelectDimension?.(key)}
                onMouseEnter={() => setActiveHoverDim(key)}
                onMouseLeave={() => setActiveHoverDim(null)}
                aria-label={`Review ${dim.name}: ${dim.score} of ${dim.maxScore} points`}
                style={{
                  backgroundColor: isHovered ? 'var(--color-linen)' : 'var(--color-surface-warm)',
                  border: `1px solid ${isHovered ? 'var(--color-terracotta)' : 'var(--color-stone-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: config.color,
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-cedar)' }}
                    >
                      {dim.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-cedar)' }}>
                    {dim.score}{' '}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      / {dim.maxScore} pts
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--color-stone-border)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: `${dim.percentage}%`,
                      height: '100%',
                      backgroundColor: config.color,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </div>

                {/* Status check counts */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#1F5A38',
                    }}
                  >
                    <CheckCircle2 size={12} /> {dim.passedCount} pass
                  </span>
                  {dim.warningCount > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#9A4C10',
                      }}
                    >
                      <AlertCircle size={12} /> {dim.warningCount} warn
                    </span>
                  )}
                  {dim.failedCount > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#C53030',
                      }}
                    >
                      <XCircle size={12} /> {dim.failedCount} fail
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
