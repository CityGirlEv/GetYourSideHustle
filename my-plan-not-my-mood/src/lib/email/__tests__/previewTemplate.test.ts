import { describe, expect, it } from 'vitest';
import { applyEmailPreviewPlaceholders, renderEmailPreviewHtml, renderManagedEmail } from '../previewTemplate';

describe('applyEmailPreviewPlaceholders', () => {
  it('fills name, email, and login placeholders for the preview pane', () => {
    const html = applyEmailPreviewPlaceholders(
      '<p>Hello {{name}}</p><p>{{email}}</p><a href="{{loginUrl}}">Sign in</a>',
    );
    expect(html).toContain('Angela Harris');
    expect(html).toContain('Angela@AngelaHarris.com');
    expect(html).toContain('https://nonnegotiation.com');
    expect(html).not.toContain('{{name}}');
  });

  it('renders preview HTML with logo, website, header, and footer', () => {
    const html = renderEmailPreviewHtml('<p>Hello {{name}}</p>');
    expect(html).toContain('Angela Harris');
    expect(html).toContain('official_logo_seal.png');
    expect(html).toContain('https://nonnegotiation.com');
    expect(html).toContain('Accountability Protocol');
    expect(html).toContain('Feel it. Follow the Plan anyway.');
  });

  it('renders a managed template with recipient vars', () => {
    const rendered = renderManagedEmail(
      { subject: 'Hi {{name}}', html: '<p>{{email}} · {{wantsBeta}}</p>' },
      { name: 'Pat', email: 'pat@example.com', wantsBeta: 'Yes' },
    );
    expect(rendered.subject).toBe('Hi Pat');
    expect(rendered.html).toContain('pat@example.com');
    expect(rendered.html).toContain('Yes');
    expect(rendered.html).toContain('official_logo_seal.png');
  });
});
