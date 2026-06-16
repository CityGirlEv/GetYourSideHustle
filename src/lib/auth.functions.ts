import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveBannedSignInMessage } from "@/lib/auth-sign-in.server";

export const resolveSignInErrorMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        error_message: z.string().trim().min(1).max(500),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const message = await resolveBannedSignInMessage(data.email, data.error_message);
    return { message };
  });
