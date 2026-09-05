import { describe, expect, it, beforeEach } from 'vitest';
import { getRolePermissions } from '../../userAuth';
import {
  canManageEmailTemplates,
  deleteEmailTemplate,
  getEmailTemplates,
  resetEmailTemplate,
  upsertEmailTemplate,
} from '../templateStore';

describe('email template store & access gate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows Admin and Super Admin to manage templates', () => {
    expect(getRolePermissions('super_admin').canManageEmailTemplates).toBe(true);
    expect(getRolePermissions('admin').canManageEmailTemplates).toBe(true);
    expect(canManageEmailTemplates('super_admin')).toBe(true);
    expect(canManageEmailTemplates('admin')).toBe(true);
  });

  it('rejects Dev, QA, and Member from managing templates', () => {
    expect(getRolePermissions('dev').canManageEmailTemplates).toBe(false);
    expect(getRolePermissions('qa').canManageEmailTemplates).toBe(false);
    expect(getRolePermissions('member').canManageEmailTemplates).toBe(false);
    expect(canManageEmailTemplates('qa')).toBe(false);
    expect(canManageEmailTemplates(null)).toBe(false);
  });

  it('seeds system templates and lets Super Admin create, update, and delete a custom template', () => {
    const list = getEmailTemplates();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.some((t) => t.id === 'signup-pending')).toBe(true);
    expect(list.some((t) => t.id === 'signup-confirmation')).toBe(true);
    expect(list.some((t) => t.id === 'password-reset')).toBe(true);
    for (const template of list.filter((t) => t.isSystem)) {
      expect(template.html).toContain('official_logo_seal.png');
      expect(template.html).toContain('https://nonnegotiation.com');
      expect(template.html).toContain('Accountability Protocol');
      expect(template.html).toContain('Feel it. Follow the Plan anyway.');
    }

    const created = upsertEmailTemplate(
      { name: 'Welcome series 1', subject: 'Start your plan', html: '<p>Hello {{name}}</p>' },
      'super_admin',
    );
    expect(created.success).toBe(true);
    expect(created.template?.isSystem).toBe(false);

    const updated = upsertEmailTemplate(
      { id: created.template!.id, name: 'Welcome series 1', subject: 'Updated subject', html: '<p>Hi</p>' },
      'admin',
    );
    expect(updated.success).toBe(true);
    expect(updated.template?.subject).toBe('Updated subject');

    const removed = deleteEmailTemplate(created.template!.id, 'admin');
    expect(removed.success).toBe(true);
    expect(getEmailTemplates().some((t) => t.id === created.template!.id)).toBe(false);
  });

  it('rejects create, update, and delete without Admin or Super Admin', () => {
    const createRes = upsertEmailTemplate(
      { name: 'X', subject: 'Y', html: '<p>Z</p>' },
      'qa',
    );
    expect(createRes.success).toBe(false);
    expect(createRes.error).toContain('Access denied');

    const updateRes = upsertEmailTemplate(
      { id: 'signup-pending', name: 'Hacked', subject: 'Nope', html: '<p>x</p>' },
      'member',
    );
    expect(updateRes.success).toBe(false);

    const deleteRes = deleteEmailTemplate('signup-pending', 'dev');
    expect(deleteRes.success).toBe(false);
    expect(deleteRes.error).toContain('Access denied');
  });

  it('blocks deleting system templates and allows reset', () => {
    upsertEmailTemplate(
      { id: 'signup-pending', name: 'Signup received (pending approval)', subject: 'Changed', html: '<p>Changed</p>' },
      'admin',
    );
    expect(getEmailTemplates().find((t) => t.id === 'signup-pending')?.subject).toBe('Changed');

    const del = deleteEmailTemplate('signup-pending', 'admin');
    expect(del.success).toBe(false);
    expect(del.error).toContain('cannot be deleted');

    const reset = resetEmailTemplate('signup-pending', 'super_admin');
    expect(reset.success).toBe(true);
    expect(reset.template?.subject).toContain('pending approval');
  });
});
