insert into storage.buckets (id, name, public)
values ('test-evidence', 'test-evidence', false)
on conflict (id) do nothing;

create policy "QA/Admin read all test evidence"
on storage.objects for select
to authenticated
using (
  bucket_id = 'test-evidence'
  and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'qa'::app_role))
);

create policy "Users read own test evidence"
on storage.objects for select
to authenticated
using (
  bucket_id = 'test-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users upload own test evidence"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'test-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own test evidence"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'test-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);