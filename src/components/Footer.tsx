import { Code2, ExternalLink, FileText, Shield } from 'lucide-react';

const ECOSYSTEM_LINKS = [
  { href: 'https://github.com/nymrel/open-ucp', label: 'Open UCP' },
  { href: 'https://github.com/nymrel/nymrel-machine-trust', label: 'Machine Trust' },
  { href: 'https://github.com/nymrel/agentic-ucp-scanner', label: 'Agentic UCP Scanner' },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h2 className="footer-brand">
            <span className="footer-mark" aria-hidden="true">
              <Shield size={16} />
            </span>
            Nymrel Trust Scorecard
          </h2>
          <p>
            A local-first, evidence-scoped diagnostic. Scores describe only the fixture or manual
            evidence supplied; they are not certifications or live-site outcome proof.
          </p>
          <a href="https://nymrel.com">Built and maintained by Nymrel</a>
        </div>

        <nav aria-label="Nymrel ecosystem">
          <h2>Ecosystem</h2>
          <ul>
            {ECOSYSTEM_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ExternalLink aria-hidden="true" size={12} />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Machine-readable resources">
          <h2>Resources</h2>
          <ul>
            <li>
              <a href="/llms.txt">
                <FileText aria-hidden="true" size={13} />
                llms.txt
              </a>
            </li>
            <li>
              <a href="/robots.txt">
                <FileText aria-hidden="true" size={13} />
                robots.txt
              </a>
            </li>
            <li>
              <a
                href="https://github.com/nymrel/nymrel-trust-scorecard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code2 aria-hidden="true" size={13} />
                MIT source
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Nymrel. Diagnostic software released under the MIT License.</span>
        <a href="mailto:contact@nymrel.com">contact@nymrel.com</a>
      </div>
    </footer>
  );
}
