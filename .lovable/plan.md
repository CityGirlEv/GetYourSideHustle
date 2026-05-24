## Roles, assignment, and agent notes

### Roles
Add enum values: `viewer`, `editor`, `qa`, `agent` (keep `admin`; legacy `advisor` stays for back-compat).
- **admin** — all access; only role that can create users and assign agents
- **editor** — can create scenarios from the wizard; can view scenarios they created
- **agent** — can view scenarios an admin assigned to them; can add/edit `agent_notes`
- **qa** — read-only access to all scenarios
- **viewer** — read-only access to scenarios they created (default for newly-created users)

### Database (migration)
1. `ALTER TYPE app_role ADD VALUE` for the four new roles.
2. `scenarios` table:
   - `created_by uuid` (nullable — public form still allows anon)
   - `assigned_agent_id uuid`
   - `agent_notes text`
   - `wants_contact boolean DEFAULT false`
3. RLS rewrite on `scenarios`:
   - admins: all
   - qa: select all
   - editor/viewer: select where `created_by = auth.uid()`
   - agent: select where `assigned_agent_id = auth.uid()`
   - agent: update only `agent_notes` on assigned scenarios (via RPC)
4. New RPCs (`SECURITY DEFINER`):
   - `admin_set_user_role(p_user uuid, p_role app_role)` — admin only
   - `admin_assign_agent(p_scenario uuid, p_agent uuid)` — admin only; validates target has `agent` role
   - `agent_update_notes(p_scenario uuid, p_notes text)` — caller must be the assigned agent
5. Update `create_scenario` to set `created_by = auth.uid()` when authenticated.
6. When an `expert_contact_request` is inserted with a `scenario_code`, set `scenarios.wants_contact = true` (trigger).
7. `handle_new_user` default role → `viewer` (admin-created users get explicit role).

### Server functions (`src/lib/admin.functions.ts`)
- `createAdvisor` → `createUser({ email, password, full_name, role })`; admin assigns chosen role
- `setUserRole({ user_id, role })`
- `listAgents()` — for the assign dropdown

### UI
- **Admin > Staff**: role selector on create form; role dropdown on each row (calls `setUserRole`).
- **Admin > Scenarios**: for rows where `wants_contact = true`, show an "Assign agent" select populated from `listAgents()`; shows assigned agent + notes preview.
- **New `/agent` route**: lists scenarios assigned to the current agent; opens `/agent/scenario/$code` with a notes textarea and Save button.
- **`AppShell` nav**: add Agent link when `user.role === "agent"`; keep Admin link for `admin`.
- **Wizard** (`/scenario/new`) is unchanged for anon; if a logged-in editor uses it, `created_by` is captured server-side.

### Out of scope (unchanged)
- Credits, billing, advisor portal (kept as-is for the legacy `advisor` role).
- Email notifications when an agent is assigned.