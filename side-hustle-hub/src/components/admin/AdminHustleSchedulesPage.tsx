import { useEffect, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { WaitIndicator } from "../WaitFeedback";

type AdminScheduleRow = {
  userId: string;
  email: string;
  name: string;
  membershipTier: string;
  updatedAt: string;
  scheduleCount: number;
  schedules: Array<{
    id: string;
    ownerLabel: string;
    hustleLabel: string;
    dueDate: string;
    weekStart: string;
    reminderCadence: string;
    progressPct: number;
    blockCount: number;
  }>;
};

export function AdminHustleSchedulesPage() {
  const [rows, setRows] = useState<AdminScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ rows: AdminScheduleRow[] }>("admin/hustle-schedules");
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load schedule suites.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="glass admin-hustle-schedules" data-testid="admin-hustle-schedules">
      <div className="admin-hustle-schedules__head">
        <h2>
          <CalendarDays size={22} aria-hidden /> Member Schedule Suites
        </h2>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={14} aria-hidden /> Refresh
        </button>
      </div>
      <p>
        All saved Schedule Suite plans across members (Pro+ reminders run from the daily digest
        cron). Admins can review every suite here.
      </p>

      {loading && <WaitIndicator message="Loading schedule suites…" />}
      {error && <p className="user-portal-credits-error">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p data-testid="admin-hustle-schedules-empty">No Schedule Suite data saved yet.</p>
      )}

      <div className="admin-hustle-schedules__list">
        {rows.map((row) => (
          <article
            key={row.userId}
            className="admin-hustle-schedules__card"
            data-testid={`admin-schedule-user-${row.userId}`}
          >
            <header>
              <div>
                <strong>{row.name || "Member"}</strong>
                <span>{row.email}</span>
              </div>
              <span className="glow-badge amber">{row.membershipTier || "free"}</span>
            </header>
            <p className="admin-hustle-schedules__meta">
              {row.scheduleCount} active suite{row.scheduleCount === 1 ? "" : "s"} · updated{" "}
              {row.updatedAt?.slice(0, 10) || "—"}
            </p>
            <ul>
              {row.schedules.map((s) => (
                <li key={s.id}>
                  <strong>
                    {s.ownerLabel} · {s.hustleLabel}
                  </strong>
                  <span>
                    Due {s.dueDate || "—"} · Week {s.weekStart || "—"} · {s.progressPct}% · Reminder:{" "}
                    {s.reminderCadence || "none"}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
