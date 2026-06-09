## Fix: Function Search Path Mutable

The Supabase linter flags database functions that don't have an explicit `search_path` set. This is a security best practice — without it, a malicious user could potentially manipulate the search path to hijack function execution.

Looking at the existing functions in the database, most already have `SET search_path TO 'public'`, but a few of the email queue helpers do not:

- `public.enqueue_email(text, jsonb)`
- `public.read_email_batch(text, integer, integer)`
- `public.delete_email(text, bigint)`
- `public.move_to_dlq(text, text, bigint, jsonb)`

These are `SECURITY DEFINER` functions, which makes the missing `search_path` especially important to lock down.

### Plan

Create a new migration that runs `ALTER FUNCTION ... SET search_path = public, pgmq` on each of the four email queue functions. We include `pgmq` because they call `pgmq.send`, `pgmq.read`, `pgmq.delete`, and `pgmq.create` by unqualified-schema reference.

No application code changes are needed — behavior is unchanged, only the search_path is pinned.

### Verification

After the migration runs, re-run the Supabase linter; the `function_search_path_mutable` warning should clear.
