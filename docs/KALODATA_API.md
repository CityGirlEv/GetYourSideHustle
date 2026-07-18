# Kalodata API (for Competitor Scouting)

Competitor Scouting can load Medicare-related TikTok video ads from **Kalodata** when you have **Enterprise** API credentials. Kalodata is a TikTok Shop analytics platform — it is **not** affiliated with Medicare.gov or CMS.

## Availability

| Plan | API access |
|------|------------|
| Starter / Professional | **No** public API — web UI only |
| Enterprise | **Custom API integration** — contact [Kalodata sales](https://www.kalodata.com/pricing) |

There is **no official self-service public API** documented for Starter or Professional plans. This project does not scrape the Kalodata web UI (session cookies break often and violate terms).

## Wire into this project (Enterprise only)

After Kalodata provides your API base URL and key, add to `.env`:

```bash
KALODATA_API_BASE_URL="https://api.example.kalodata.com"   # from Kalodata Enterprise onboarding
KALODATA_API_KEY="your-enterprise-api-key"
```

Restart the dev server. On **Admin → Competitor Scouting**, the **Kalodata** row should load results instead of **skipped**.

### Expected API contract

The fetcher calls `POST {KALODATA_API_BASE_URL}/video/search` with:

```json
{
  "keyword": "medicare",
  "keywords": ["medicare"],
  "query": "medicare",
  "limit": 25
}
```

Authorization: `Bearer {KALODATA_API_KEY}`

Response should be JSON with a `data`, `videos`, or `results` array. Each item may include:

- `video_id` or `id`
- `title`, `description`, or `caption`
- `creator_name`, `author_name`, or `shop_name`
- `tiktok_url`, `video_url`, or `url`

If your Enterprise endpoint differs, ask Kalodata to align with the contract above or open an issue to add an alternate path env var.

## Medicare keyword strategy

The fetcher searches these terms (deduped across runs):

- medicare
- medicare advantage
- medicare supplement
- medigap
- turning 65
- part b

## Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| Kalodata source **skipped** | `KALODATA_API_KEY` or `KALODATA_API_BASE_URL` missing |
| HTTP 401 / 403 | Invalid or expired Enterprise API key |
| HTTP 404 | Wrong `KALODATA_API_BASE_URL` — confirm path with Kalodata |
| 0 results | No Medicare TikTok Shop creatives in Kalodata index — normal for non-e-commerce Medicare funnels |

## Security

- Do not commit `KALODATA_API_KEY` to git
- Rotate the key if exposed
- Enterprise keys are account-scoped — share only with trusted staff

Official product site: [kalodata.com](https://www.kalodata.com/)
