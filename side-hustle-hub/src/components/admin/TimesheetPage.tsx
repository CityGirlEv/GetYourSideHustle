import { useEffect, useMemo, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import type { AuthUser } from "../../lib/auth";
import { ApiError } from "../../lib/api";
import {
  bucketByDay,
  daysInWeekEndingFriday,
  fetchTimeEntries,
  fetchTimeEntryUsers,
  formatDuration,
  formatDurationHours,
  liveElapsedMs,
  recentWeekEndings,
  weekEndingFriday,
  weekStartingSaturday,
  type TimeEntry,
  type TimeEntryUser,
} from "../../lib/gysh-time-entries";

type TimesheetPageProps = {
  authUser?: AuthUser | null;
};

function weekdayLabel(iso: string): string {
  return parseLocal(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function TimesheetPage({ authUser = null }: TimesheetPageProps) {
  const weekOptions = useMemo(() => recentWeekEndings(16), []);
  const [weekEnding, setWeekEnding] = useState(() => weekEndingFriday());
  const [users, setUsers] = useState<TimeEntryUser[]>([]);
  const [userId, setUserId] = useState(authUser?.id || "u-lyriq");
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const from = weekStartingSaturday(weekEnding);
  const to = weekEnding;

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [u, list] = await Promise.all([
        fetchTimeEntryUsers(),
        fetchTimeEntries({ userId, from, to }),
      ]);
      setUsers(u);
      setEntries(list);
      if (!u.some((x) => x.id === userId) && u[0]) setUserId(u[0].id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load timesheet.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when week/user changes
  }, [userId, weekEnding]);

  useEffect(() => {
    if (authUser?.id) setUserId(authUser.id);
  }, [authUser?.id]);

  const byDayMap = useMemo(() => {
    const buckets = bucketByDay(entries);
    return new Map(buckets.map((b) => [b.date, b]));
  }, [entries]);

  const weekDays = daysInWeekEndingFriday(weekEnding);
  const weekTotalMs = entries.reduce((sum, e) => sum + liveElapsedMs(e), 0);
  const selectedUser = users.find((u) => u.id === userId);

  return (
    <div className="timesheet-page" data-testid="timesheet-page">
      <header className="glass timesheet-page__hero">
        <div>
          <p className="timesheet-page__eyebrow">
            <CalendarClock size={14} aria-hidden /> Partner timesheet
          </p>
          <h2>Daily & weekly time</h2>
          <p>
            Weeks run Saturday → Friday (week ending Friday). Start / pause / end timers on Task List and Testing
            Portal — timers stop when status changes or work is marked done.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void reload()} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="glass timesheet-page__controls">
        <label>
          <span>Team member</span>
          <select
            className="select-input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            data-testid="timesheet-user"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
                {u.name?.toLowerCase().includes("lyriq") || u.email.includes("leegaulden")
                  ? " (Lyriq)"
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Week ending Friday</span>
          <select
            className="select-input"
            value={weekEnding}
            onChange={(e) => setWeekEnding(e.target.value)}
            data-testid="timesheet-week"
          >
            {weekOptions.map((fri) => (
              <option key={fri} value={fri}>
                {weekdayLabel(fri)} · {fromLabel(fri)}
              </option>
            ))}
          </select>
        </label>
        <div className="timesheet-page__week-total">
          <span>Week total</span>
          <strong>{formatDuration(weekTotalMs)}</strong>
          <em>{formatDurationHours(weekTotalMs)}</em>
        </div>
      </div>

      {error && <div className="timesheet-page__error">{error}</div>}
      {loading && <p className="timesheet-page__muted">Loading timesheet…</p>}

      {!loading && (
        <div className="timesheet-page__days">
          {weekDays.map((date) => {
            const bucket = byDayMap.get(date);
            const total = bucket?.totalMs ?? 0;
            const list = bucket?.entries ?? [];
            return (
              <section key={date} className="glass timesheet-day" data-testid={`timesheet-day-${date}`}>
                <header className="timesheet-day__head">
                  <div>
                    <h3>{weekdayLabel(date)}</h3>
                    <span className="timesheet-day__iso">{date}</span>
                  </div>
                  <div className="timesheet-day__total">
                    <strong>{formatDuration(total)}</strong>
                    <span>{formatDurationHours(total)}</span>
                  </div>
                </header>
                {list.length === 0 ? (
                  <p className="timesheet-page__muted">No time logged.</p>
                ) : (
                  <table className="timesheet-day__table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Item</th>
                        <th>Status</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((e) => (
                        <tr key={e.id}>
                          <td>{e.source === "task" ? "Task" : "Test"}</td>
                          <td>
                            <code>{e.sourceId}</code>
                            <span className="timesheet-day__label">{e.sourceLabel}</span>
                          </td>
                          <td>
                            <span className={`timesheet-status timesheet-status--${e.status}`}>
                              {e.status}
                            </span>
                          </td>
                          <td>{formatDuration(liveElapsedMs(e))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            );
          })}
        </div>
      )}

      {selectedUser && (
        <p className="timesheet-page__footnote">
          Showing {selectedUser.name || selectedUser.email} · Sat {from} → Fri {to}
        </p>
      )}
    </div>
  );
}

function fromLabel(weekEndingFri: string): string {
  const start = weekStartingSaturday(weekEndingFri);
  return `${start} → ${weekEndingFri}`;
}
