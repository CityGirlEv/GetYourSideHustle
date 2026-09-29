import { describe, expect, it, beforeEach } from 'vitest';
import {
  AUDIT_ACTION_LABELS,
  FULL_AUDIT_LOG_HEADING,
  MAX_AUDIT_ENTRIES,
  USER_AUDIT_EMPTY,
  USER_AUDIT_LOG_LABEL,
  USER_AUDIT_STORAGE_KEY,
  AUDIT_BACKFILL_DAYS,
  AUDIT_RECOVERED_DETAIL,
  auditActionLabel,
  auditActorFromUser,
  auditBackfillSince,
  auditCountForUser,
  auditLogForUser,
  backfillUserAuditFromUsers,
  defaultUserAuditOpen,
  formatAuditWhen,
  fullAuditLogSummary,
  getUserAuditLog,
  isUserAuditAction,
  isUserAuditOpen,
  recordUserAudit,
  recoveredRegisterAuditId,
  recoveredRegisterEntry,
  sortAuditLogNewestFirst,
  toggleUserAuditOpen,
  trimAuditLog,
  userAuditToggleLabel,
} from '../userAuditLog';
import { deleteUser, loginUser, logoutUser, registerUser, updateUserProfile } from '../userAuth';

describe('userAuditLog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('labels actions, formats time, and builds collapsible toggle copy', () => {
    expect(isUserAuditAction('login')).toBe(true);
    expect(isUserAuditAction('hack')).toBe(false);
    expect(auditActionLabel('login')).toBe(AUDIT_ACTION_LABELS.login);
    expect(auditActionLabel('roles_changed')).toBe('Roles changed');
    expect(formatAuditWhen('2026-08-30T12:04:00.000Z')).toBe('2026-08-30 12:04 UTC');
    expect(formatAuditWhen('not-a-date')).toBe('not-a-date');
    expect(userAuditToggleLabel(3)).toBe('Audit log (3)');
    expect(USER_AUDIT_LOG_LABEL).toBe('Audit log');
    expect(FULL_AUDIT_LOG_HEADING).toBe('Full audit log');
    expect(USER_AUDIT_EMPTY).toBe('No audit events yet.');
    expect(fullAuditLogSummary(0)).toContain('No audit events');
    expect(fullAuditLogSummary(1)).toBe('1 event across all users');
    expect(fullAuditLogSummary(4)).toBe('4 events across all users');
  });

  it('toggles one user audit panel without closing the others', () => {
    expect(defaultUserAuditOpen()).toEqual({});
    expect(isUserAuditOpen({}, 'user-001')).toBe(false);
    const open = toggleUserAuditOpen({ 'user-002': true }, 'user-001');
    expect(open['user-001']).toBe(true);
    expect(open['user-002']).toBe(true);
    expect(toggleUserAuditOpen(open, 'user-001')['user-001']).toBe(false);
    expect(toggleUserAuditOpen(open, 'user-001')['user-002']).toBe(true);
  });

  it('records newest-first, groups by user, and ignores junk storage', () => {
    const older = recordUserAudit({
      id: 'audit-old',
      at: '2026-08-01T10:00:00.000Z',
      action: 'login',
      userId: 'user-a',
      userName: 'Ada',
      userEmail: 'ada@example.com',
      summary: 'Ada signed in',
    });
    const newer = recordUserAudit({
      id: 'audit-new',
      at: '2026-08-30T10:00:00.000Z',
      action: 'status_changed',
      userId: 'user-a',
      userName: 'Ada',
      userEmail: 'ada@example.com',
      summary: 'Status changed to active',
      ...auditActorFromUser({ id: 'admin-1', name: 'Angela Harris', email: 'angela@myplannotmymood.com' }),
    });
    recordUserAudit({
      id: 'audit-b',
      at: '2026-08-15T10:00:00.000Z',
      action: 'register',
      userId: 'user-b',
      userName: 'Bea',
      userEmail: 'bea@example.com',
      summary: 'Signed up as Member',
    });

    const log = getUserAuditLog();
    expect(log[0]?.id).toBe(newer.id);
    expect(log.map((row) => row.id)).toEqual(['audit-new', 'audit-b', 'audit-old']);
    expect(auditLogForUser(log, 'user-a').map((row) => row.id)).toEqual(['audit-new', 'audit-old']);
    expect(auditCountForUser(log, 'user-a')).toBe(2);
    expect(auditLogForUser(log, 'user-b')).toHaveLength(1);
    expect(auditLogForUser(log, '')).toEqual([]);
    expect(newer.actorName).toBe('Angela Harris');
    expect(auditActorFromUser('admin')).toEqual({});
    expect(older.action).toBe('login');

    localStorage.setItem(USER_AUDIT_STORAGE_KEY, '{bad');
    expect(getUserAuditLog()).toEqual([]);
    localStorage.setItem(USER_AUDIT_STORAGE_KEY, JSON.stringify([{ action: 'nope' }, null, 4]));
    expect(getUserAuditLog()).toEqual([]);
  });

  it('keeps only the newest entries when the log is capped', () => {
    const trimmed = trimAuditLog(
      [
        {
          id: 'a',
          at: '2026-01-01T00:00:00.000Z',
          action: 'login',
          userId: 'u1',
          userName: 'A',
          userEmail: 'a@example.com',
          summary: 'old',
        },
        {
          id: 'b',
          at: '2026-02-01T00:00:00.000Z',
          action: 'logout',
          userId: 'u1',
          userName: 'A',
          userEmail: 'a@example.com',
          summary: 'new',
        },
      ],
      1,
    );
    expect(trimmed.map((row) => row.id)).toEqual(['b']);
    expect(sortAuditLogNewestFirst(trimmed)[0]?.id).toBe('b');
    expect(MAX_AUDIT_ENTRIES).toBe(400);
  });

  it('writes audit events for sign-in, failed sign-in, sign-up, profile edits, delete, and sign-out', () => {
    const failed = loginUser('nobody@example.com', 'nope');
    expect(failed.success).toBe(false);
    expect(getUserAuditLog().some((row) => row.action === 'login_failed' && row.userEmail === 'nobody@example.com')).toBe(true);

    const login = loginUser('angela@myplannotmymood.com', 'myplan2026');
    expect(login.success).toBe(true);
    expect(getUserAuditLog().some((row) => row.action === 'login' && row.userEmail === 'angela@myplannotmymood.com')).toBe(true);

    const created = registerUser('Lee Gate', 'lee-audit@example.com', 'leepass1', 'member', true, {
      actor: login.user,
      phone: '6195550100',
    });
    expect(created.success).toBe(true);
    expect(getUserAuditLog().some((row) => row.action === 'register' && row.userEmail === 'lee-audit@example.com' && row.actorEmail === 'angela@myplannotmymood.com')).toBe(true);

    const renamed = updateUserProfile(created.user!.id, { name: 'Lee Updated', status: 'inactive', roles: ['qa'] }, login.user);
    expect(renamed.success).toBe(true);
    const afterEdit = getUserAuditLog();
    expect(afterEdit.some((row) => row.action === 'profile_update' && row.userId === created.user!.id)).toBe(true);
    expect(afterEdit.some((row) => row.action === 'status_changed' && row.summary.includes('inactive'))).toBe(true);
    expect(afterEdit.some((row) => row.action === 'roles_changed' && row.userId === created.user!.id)).toBe(true);

    const removed = deleteUser(created.user!.id, login.user);
    expect(removed.success).toBe(true);
    expect(getUserAuditLog().some((row) => row.action === 'deleted' && row.userEmail === 'lee-audit@example.com')).toBe(true);
    expect(auditLogForUser(getUserAuditLog(), created.user!.id).some((row) => row.action === 'deleted')).toBe(true);

    logoutUser();
    expect(getUserAuditLog().some((row) => row.action === 'logout')).toBe(true);
  });

  it('recovers last-week user records into the audit log without duplicating live sign-ups', () => {
    const now = new Date('2026-08-30T19:00:00.000Z');
    expect(AUDIT_BACKFILL_DAYS).toBe(7);
    expect(auditBackfillSince(now).toISOString()).toBe('2026-08-23T19:00:00.000Z');

    const recent = recoveredRegisterEntry(
      {
        id: 'user-lee',
        name: 'Lee Gate',
        email: 'lee@example.com',
        role: 'member',
        status: 'pending',
        wantsBeta: true,
        createdAt: '2026-08-27T15:00:00.000Z',
      },
      auditBackfillSince(now),
    );
    expect(recent?.id).toBe(recoveredRegisterAuditId('user-lee'));
    expect(recent?.action).toBe('register');
    expect(recent?.at).toBe('2026-08-27T15:00:00.000Z');
    expect(recent?.summary).toBe('Account created as member (pending)');
    expect(recent?.detail).toBe(`${AUDIT_RECOVERED_DETAIL} · Beta Test applicant`);

    expect(
      recoveredRegisterEntry(
        {
          id: 'user-old',
          name: 'Old Account',
          email: 'old@example.com',
          role: 'member',
          status: 'active',
          createdAt: '2026-08-01T00:00:00.000Z',
        },
        auditBackfillSince(now),
      ),
    ).toBeNull();

    const recovered = backfillUserAuditFromUsers(
      [
        {
          id: 'user-lee',
          name: 'Lee Gate',
          email: 'lee@example.com',
          role: 'member',
          status: 'pending',
          wantsBeta: true,
          createdAt: '2026-08-27T15:00:00.000Z',
        },
        {
          id: 'user-old',
          name: 'Old Account',
          email: 'old@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2026-08-01T00:00:00.000Z',
        },
        {
          id: 'user-live',
          name: 'Live Signup',
          email: 'live@example.com',
          role: 'member',
          status: 'pending',
          createdAt: '2026-08-29T12:00:00.000Z',
        },
      ],
      [
        {
          id: 'audit-live',
          at: '2026-08-29T12:00:00.000Z',
          action: 'register',
          userId: 'user-live',
          userName: 'Live Signup',
          userEmail: 'live@example.com',
          summary: 'Signed up as Member (pending)',
        },
      ],
      now,
    );

    expect(recovered.map((row) => row.userId)).toEqual(['user-live', 'user-lee']);
    expect(recovered.filter((row) => row.userId === 'user-live')).toHaveLength(1);
    expect(getUserAuditLog().some((row) => row.id === recoveredRegisterAuditId('user-lee'))).toBe(true);
    expect(backfillUserAuditFromUsers([{
      id: 'user-lee',
      name: 'Lee Gate',
      email: 'lee@example.com',
      role: 'member',
      status: 'pending',
      createdAt: '2026-08-27T15:00:00.000Z',
    }], recovered, now).filter((row) => row.userId === 'user-lee')).toHaveLength(1);
  });
});
