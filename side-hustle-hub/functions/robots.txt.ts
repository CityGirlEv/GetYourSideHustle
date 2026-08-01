/** Plain-text robots — used when Functions handle /robots.txt (see public/_routes.json). */
const BODY = `# https://getyoursidehustle.com/robots.txt
User-agent: *
Allow: /

# App / API surfaces (not for indexing)
Disallow: /api/
Disallow: /admin

Sitemap: https://getyoursidehustle.com/sitemap.xml
`;

export async function onRequestGet() {
  return new Response(BODY, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
