import { describe, expect, it } from 'vitest';
import {
  WORK_ATTACHMENT_MAX_BYTES,
  canModifyWorkAttachment,
  normalizeWorkAttachments,
  workAttachmentTooLarge,
} from '../workAttachments';

describe('workAttachments', () => {
  it('allows generous uploads up to 25 MB', () => {
    expect(WORK_ATTACHMENT_MAX_BYTES).toBeGreaterThanOrEqual(25 * 1024 * 1024);
    expect(workAttachmentTooLarge(25 * 1024 * 1024)).toBeNull();
    expect(workAttachmentTooLarge(25 * 1024 * 1024 + 1)).toMatch(/25 MB/);
  });

  it('normalizes attachment metadata', () => {
    const rows = normalizeWorkAttachments([
      {
        id: 'a1',
        name: 'spec.pdf',
        mimeType: 'application/pdf',
        byteSize: 1200,
        uploadedBy: 'Angela',
        uploadedByEmail: 'angela@example.com',
        uploadedAt: '2026-09-02T12:00:00.000Z',
      },
      { id: '', name: 'skip-me' },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('spec.pdf');
  });

  it('gates delete/modify: own attachments or Super Admin', () => {
    const file = {
      id: 'a1',
      name: 'spec.pdf',
      mimeType: 'application/pdf',
      byteSize: 10,
      uploadedBy: 'Angela',
      uploadedByEmail: 'angela@example.com',
      uploadedAt: '2026-09-02T12:00:00.000Z',
    };
    expect(
      canModifyWorkAttachment(file, {
        name: 'Angela',
        email: 'angela@example.com',
        isSuperAdmin: false,
      }),
    ).toBe(true);
    expect(
      canModifyWorkAttachment(file, {
        name: 'Narissa',
        email: 'narissa@example.com',
        isSuperAdmin: false,
      }),
    ).toBe(false);
    expect(
      canModifyWorkAttachment(file, {
        name: 'Evelyn Irving',
        email: 'evelyn@example.com',
        isSuperAdmin: true,
      }),
    ).toBe(true);
  });
});
