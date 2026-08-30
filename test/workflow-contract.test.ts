import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const workflowDirectory = join(root, '.github', 'workflows');

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('GitHub workflow contract', () => {
  const workflowFiles = readdirSync(workflowDirectory)
    .filter((name) => /\.ya?ml$/.test(name))
    .map((name) => ({
      name,
      content: readFileSync(join(workflowDirectory, name), 'utf8'),
    }));

  it('pins every action to a full commit SHA', () => {
    expect(workflowFiles.length).toBeGreaterThanOrEqual(3);
    for (const workflow of workflowFiles) {
      const uses = [...workflow.content.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map(
        (match) => match[1],
      );
      expect(uses.length, workflow.name).toBeGreaterThan(0);
      for (const action of uses) {
        expect(action, `${workflow.name}: ${action}`).toMatch(/^[^@\s]+@[0-9a-f]{40}$/);
      }
    }
  });

  it('tests supported runtimes without fallback installs', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain('"22.12.0"');
    expect(ci).toContain('"24.20.0"');
    expect(ci).toContain('"26.x"');
    expect(ci).toContain('windows-latest');
    expect(ci).not.toMatch(/node-version:\s*["']?(18|20)/);
    expect(ci).not.toContain('npm ci || npm install');
    expect(ci).not.toContain('continue-on-error');
  });

  it('requires an exact main commit and packages evidence without deployment', () => {
    const release = read('.github/workflows/release-evidence.yml');
    expect(release).toContain('commit_sha');
    expect(release).toContain('^[0-9a-fA-F]{40}$');
    expect(release).toContain('git merge-base --is-ancestor');
    expect(release).toContain('attest-build-provenance@');
    expect(release).not.toMatch(/\b(deploy|vercel|cloudflare)\b/i);
  });

  it('cooldowns dependency updates and keeps private reporting guidance', () => {
    expect(read('.github/dependabot.yml')).toContain('cooldown:');
    expect(read('SECURITY.md')).toContain('Do not open a public issue');
  });
});
