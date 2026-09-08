import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { run as runAxe } from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../src/App';

describe('application trust states', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('labels the default fixture and passes an automated accessibility scan', async () => {
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: /inspect the evidence/i })).toBeTruthy();
    expect(screen.getByText(/Synthetic fixture illustrative-/i)).toBeTruthy();
    expect(screen.getByText(/not a current audit/i)).toBeTruthy();

    const accessibility = await runAxe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(accessibility.violations).toEqual([]);
  });

  it('shows an unavailable state for a domain label without evidence', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText('Domain used to label the evidence');
    await user.clear(input);
    await user.type(input, 'unscored.example');
    await user.click(screen.getByRole('button', { name: /review domain/i }));

    expect(
      await screen.findByRole('heading', { name: /no score for unscored\.example/i }),
    ).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /local illustrative badge/i })).toBeNull();
  });

  it('scores manual JSON-LD and labels its provenance', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /supply manual json-ld evidence/i }));
    const evidence = screen.getByLabelText('Schema.org JSON-LD');
    fireEvent.change(evidence, {
      target: {
        value: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Manual Example',
        }),
      },
    });

    const input = screen.getByLabelText('Domain used to label the evidence');
    await user.clear(input);
    await user.type(input, 'manual.example');
    await user.click(screen.getByRole('button', { name: /score supplied evidence/i }));

    expect((await screen.findAllByText(/Manual evidence/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/no network request or independent verification/i)).toBeTruthy();
  });
});
