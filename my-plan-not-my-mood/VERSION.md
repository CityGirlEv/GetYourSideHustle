# Version log — My Plan, Not My Mood

Bump rules (see `src/lib/appVersion.ts`):

1. Same calendar day → increase `dayBuild` (…#1 → …#2).
2. New calendar day → set `buildDate` to today, reset `dayBuild` to `1`.
3. Named release (Alpha V1.2, etc.) → bump `major`/`minor`, reset `dayBuild` to `1`.

| Stamp | Notes |
|-------|--------|
| Alpha V1.1 · 2026-08-25 #1 | Renamed Prototype → Alpha V1.1; day+increment version control |
| Alpha V1.1 · 2026-08-25 #2 | Header: Home/nav never overlaps brand text (two-row layout) |
| Alpha V1.1 · 2026-08-25 #3 | Header nav: two-line text links (less crowded) |
| Alpha V1.1 · 2026-08-25 #4 | Welcome popup: Alpha now; Beta ask + perks |
| Alpha V1.1 · 2026-08-25 #5 | Header: single-row pill nav, larger logo, tighter bar |
| Alpha V1.1 · 2026-08-25 #6 | Admin role: Testing Portal + Task List only |
