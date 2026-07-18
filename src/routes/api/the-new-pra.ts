import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * TheNewPRA endpoint.
 * Accepts a JSON body `{ url: string }`.
 * Returns the page title and meta description (if any).
 */
export const theNewPRA = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ url: z.string().url() }).parse(input)
  )
  .handler(async ({ data }) => {
    const response = await fetch(data.url);
    const html = await response.text();

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^\"]*)["']/i);

    const title = titleMatch ? titleMatch[1].trim() : "";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";

    return { title, description };
  });
