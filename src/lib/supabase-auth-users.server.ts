import { supabaseAdmin } from "@/integrations/supabase/client.server";

type AuthUser = NonNullable<
  Awaited<ReturnType<typeof supabaseAdmin.auth.admin.listUsers>>["data"]
>["users"][number];

/** Paginate through every Supabase auth user (default API page is too small). */
export async function listAllAuthUsers(): Promise<AuthUser[]> {
  const users: AuthUser[] = [];
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const batch = data.users ?? [];
    if (batch.length === 0) break;
    users.push(...batch);
  }
  return users;
}
