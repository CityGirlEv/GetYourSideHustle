import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Simple product research endpoint.
 * Accepts a URL, fetches the page HTML, and extracts basic metadata.
 * Returns an object containing the title and meta description (if present).
 */
export const productResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ url: z.string().url() }).parse(input)
  )
  .handler(async ({ data }) => {
    // Perform a server‑side fetch of the supplied URL.
    const response = await fetch(data.url);
    const html = await response.text();

    // Very simple regex extraction – sufficient for demonstration.
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^\"]*)["']/i);

    const title = titleMatch ? titleMatch[1].trim() : "";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";

    return { title, description };
  });
