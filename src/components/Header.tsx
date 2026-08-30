import { Code2, Radio, Shield } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button type="button" className="brand-button" onClick={onReset}>
          <span className="brand-mark" aria-hidden="true">
            <Shield size={20} />
          </span>
          <span>
            <span className="brand-line">
              <strong>Nymrel</strong>
              <span>Trust Scorecard</span>
            </span>
            <small>Evidence-scoped machine-readability diagnostic</small>
          </span>
        </button>

        <div className="header-actions">
          <p className="mode-pill">
            <Radio aria-hidden="true" size={14} />
            Local evaluation · no website fetches
          </p>
          <a
            href="https://github.com/nymrel/nymrel-trust-scorecard"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            <Code2 aria-hidden="true" size={16} />
            Source
          </a>
        </div>
      </div>
    </header>
  );
}
