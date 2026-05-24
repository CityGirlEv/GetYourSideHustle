import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const createAdvisor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(128),
      full_name: z.string().min(1).max(255).optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify caller is admin
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (callerRoles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = (existingUsers?.users ?? []).find((u) => u.email === data.email);
    if (existing) {
      throw new Error("A user with this email already exists");
    }

    // Create the user
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name ?? "",
      },
    });

    if (createError || !createData.user) {
      throw new Error(createError?.message ?? "Failed to create user");
    }

    const newUserId = createData.user.id;

    // Ensure role and credits (trigger should fire, but belt-and-suspenders)
    await supabaseAdmin.from("profiles").upsert({
      id: newUserId,
      full_name: data.full_name ?? "",
    });

    await supabaseAdmin.from("user_roles").upsert({
      user_id: newUserId,
      role: "advisor",
    });

    await supabaseAdmin.from("advisor_credits").upsert({
      advisor_id: newUserId,
      balance: 10,
    });

    return {
      id: newUserId,
      email: data.email,
      full_name: data.full_name ?? "",
    };
  });
