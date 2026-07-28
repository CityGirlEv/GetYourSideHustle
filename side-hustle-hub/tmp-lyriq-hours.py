"""Quick local D1 check — Lyriq hours vs entry count."""
import sqlite3
from pathlib import Path

db_path = next(
    Path(".wrangler/state/v3/d1/miniflare-D1DatabaseObject").glob("*.sqlite")
)
# Prefer the larger non-metadata db
cands = [
    p
    for p in Path(".wrangler/state/v3/d1/miniflare-D1DatabaseObject").glob("*.sqlite")
    if "metadata" not in p.name
]
db_path = max(cands, key=lambda p: p.stat().st_size)
print("db", db_path)

db = sqlite3.connect(db_path)
c = db.cursor()

print("\n=== Lyriq totals ===")
for r in c.execute(
    """
    SELECT user_name, user_id,
           COUNT(*) AS entries,
           ROUND(SUM(accumulated_ms)/3600000.0, 2) AS hrs,
           MIN(work_date), MAX(work_date)
    FROM time_entries
    WHERE user_id = 'u-lyriq' OR lower(user_name) LIKE '%lyriq%'
    GROUP BY user_id
    """
):
    print(r)

print("\n=== By day ===")
for r in c.execute(
    """
    SELECT work_date, COUNT(*) AS n,
           ROUND(SUM(accumulated_ms)/3600000.0, 2) AS hrs,
           ROUND(SUM(CASE WHEN accumulated_ms < 60000 THEN 1 ELSE 0 END), 0) AS under_1min,
           ROUND(SUM(CASE WHEN accumulated_ms = 300000 THEN 1 ELSE 0 END), 0) AS exactly_5min
    FROM time_entries
    WHERE user_id = 'u-lyriq'
    GROUP BY work_date
    ORDER BY work_date
    """
):
    print(r)

print("\n=== Sample tiny entries ===")
for r in c.execute(
    """
    SELECT work_date, source_id, status, accumulated_ms,
           ROUND(accumulated_ms/60000.0, 1) AS mins,
           started_at, ended_at
    FROM time_entries
    WHERE user_id = 'u-lyriq'
    ORDER BY accumulated_ms ASC
    LIMIT 15
    """
):
    print(r)

print("\n=== Largest entries ===")
for r in c.execute(
    """
    SELECT work_date, source_id, status,
           ROUND(accumulated_ms/60000.0, 1) AS mins,
           started_at, ended_at
    FROM time_entries
    WHERE user_id = 'u-lyriq'
    ORDER BY accumulated_ms DESC
    LIMIT 10
    """
):
    print(r)

print("\n=== All users period totals ===")
for r in c.execute(
    """
    SELECT user_name, COUNT(*) AS n,
           ROUND(SUM(accumulated_ms)/3600000.0, 2) AS hrs
    FROM time_entries
    GROUP BY user_id
    ORDER BY hrs DESC
    """
):
    print(r)
