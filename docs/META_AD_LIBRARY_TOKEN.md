# Meta Ad Library API token (for Competitor Scouting)

Competitor Scouting uses the **Meta Ad Library API** (`/ads_archive`) — not your Facebook password.
Set the token in `.env` as:

```bash
FACEBOOK_ACCESS_TOKEN="your_long_lived_token_here"
```

Restart the dev server (or redeploy) after saving. On **Admin → Competitor Scouting**, click **Refresh scouting**.
The **Meta Ad Library** row should show ads found instead of “skipped”.

---

## What you need

- A personal **Facebook account** (login only in the browser — never paste your password into this app)
- Government ID for Meta identity verification (1–3 business days)
- A **Meta Developer** app with **Ad Library API** enabled
- A **long-lived access token** (about 60 days; refresh before expiry)

---

## Request access — detailed walkthrough

Meta’s official flow is three gates: **identity verification → developer account → app with Ad Library API**. There is **no separate “Ad Library API application form”** beyond those steps. Full App Review / Business Verification is **not** listed on Meta’s official Ad Library page for basic access, but identity verification is mandatory.

Official page: [facebook.com/ads/library/api](https://www.facebook.com/ads/library/api/)

### Step 1 — Confirm identity and location (required first)

This is the step most people get stuck on. Meta uses the same identity flow as for political/social-issue advertisers.

1. Sign in to the **same Facebook account** you will use for developers.facebook.com.
2. Open **[facebook.com/ID](https://www.facebook.com/ID)** (Meta identity confirmation).
3. Click **Get started** / **Confirm your identity** (wording varies by account).
4. Provide:
   - **Legal name** (must match your ID)
   - **Country of residence**
   - **Government-issued photo ID** — passport, driver’s license, or national ID (JPEG/PNG, readable, not expired)
   - **Selfie or video** if prompted (liveness check)
   - **Phone number** for SMS verification (must receive codes)
5. Submit and wait. Meta states this **can take a few days** (often 1–3 business days; sometimes same day).
6. Check status:
   - Return to [facebook.com/ID](https://www.facebook.com/ID)
   - Or look for a Meta notification / email (“Identity confirmed” or similar)

**If verification fails:** re-upload a clearer ID photo, ensure name matches exactly, try a different accepted ID type, or use Meta Help Center → “Confirm your identity.” You cannot use the Ad Library API until this step succeeds.

**Important:** This is tied to your **personal Facebook account**, not to the app name. One verified person can create the developer app.

---

### Step 2 — Create a Meta for Developers account

1. Go to **[developers.facebook.com](https://developers.facebook.com/)**.
2. Click **Get started** (top right).
3. Sign in with the **verified Facebook account** from Step 1.
4. Complete registration:
   - Confirm email if asked
   - Select role (e.g. **Developer**)
   - Accept the **[Platform Policy](https://developers.facebook.com/policy/)**
5. You should land on the developer home with **My Apps** in the nav.

---

### Step 3 — Create an app and enable Ad Library API

Meta recommends returning to the Ad Library API page after Step 2:

1. Open **[facebook.com/ads/library/api](https://www.facebook.com/ads/library/api/)**.
2. Click **Access the API** (top of page). This opens Graph API Explorer or app creation.
3. **Create the app:**
   - **My Apps** → **Create App**
   - Use case: **Other** → **Business** (or closest match; names change over time)
   - App name: e.g. `Part B Optimizer Scouting`
   - Contact email: your work email
   - **Create app**
4. On the **app dashboard**, add the product:
   - **Add product** → **Ad Library API** → **Set up**
   - Or: **Use cases** / **Products** → enable **Ad Library API**
5. Accept **Authorized Access to Public Information** (and any Ad Library terms shown).
6. Note your **App ID** and **App Secret** under **App settings → Basic** (needed later for long-lived tokens). Never commit the secret to git.

You do **not** need to publish the app to the App Store or submit for standard App Review just to query `/ads_archive` with your own user token — provided Step 1 identity verification is complete.

---

### Step 4 — Confirm you’re authorized (before building tokens)

Quick check in [Graph API Explorer](https://developers.facebook.com/tools/explorer/):

1. **Meta App** → select your new app.
2. **User or Page** → **Get User Access Token**.
3. Add permission **`ads_read`** (and **`public_profile`** if offered).
4. **Generate Access Token** → approve the Facebook login dialog.
5. In the query box, run:

   ```
   GET /ads_archive?search_terms=medicare&ad_reached_countries=['US']&ad_type=ALL&fields=page_id,ad_snapshot_url&limit=3
   ```

6. **Success:** JSON with a `"data"` array (may be empty if no matching ads — that’s OK).
7. **Failure:** common errors:
   - **OAuth / permission** — regenerate token with `ads_read` on the correct app.
   - **Error 1357045 or “identity”** — Step 1 not finished; wait or redo [facebook.com/ID](https://www.facebook.com/ID).
   - **Application does not have permission** — Ad Library API product not added to the app.

---

### What the API actually returns (scope)

Per Meta’s docs, the API is **not** a full dump of every commercial ad on Facebook:

| Ad type | What you get |
|--------|----------------|
| Social issues, elections, politics | Broad archive + spend/impressions (US and worldwide, ~7 years) |
| Ads delivered to the **EU** | Extra fields (reach, beneficiary, etc.), ~1 year |
| Other US commercial ads | **Limited** — often only if in special categories (e.g. **Financial products and services**, housing, employment) or EU-delivered |

For Medicare competitor scouting, try `ad_type=FINANCIAL_PRODUCTS_AND_SERVICES_ADS` or `ALL` with `search_terms=medicare`. Empty results may mean no eligible archived ads, not necessarily a bad token.

---

## Step 1 — Verify your identity (summary)

1. Open [facebook.com/ID](https://www.facebook.com/ID)
2. Complete Meta’s identity confirmation (government ID + country)
3. Wait for approval (often 1–3 business days)

This is required before Ad Library API access is granted.

---

## Step 2 — Create a Meta Developer account (summary)

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Click **Get started** and sign in with your Facebook account
3. Accept the **Platform Policy**

---

## Step 3 — Create an app (summary)

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps/) or [Ad Library API → Access the API](https://www.facebook.com/ads/library/api/)
2. **Create app** → type **Other** → use case **Business** (or closest match)
3. Name it (e.g. `Part B Optimizer Scouting`)
4. Add product **Ad Library API** and accept terms
5. Save **App ID** and **App Secret** from App settings → Basic

---

## Step 4 — Generate a short-lived token (Graph API Explorer)

1. Open [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. **Meta App** → select your scouting app
3. **User or Page** → **User Token**
4. **Permissions** → add `ads_read` (and `public_profile` if needed)
5. Click **Generate Access Token** and approve the prompt
6. Copy the token (valid ~1–2 hours)

**Quick test** (replace `TOKEN`):

```bash
curl -G "https://graph.facebook.com/v20.0/ads_archive" \
  -d "search_terms=medicare" \
  -d "ad_reached_countries=['US']" \
  -d "ad_type=ALL" \
  -d "fields=page_id,ad_snapshot_url,primary_text" \
  -d "limit=3" \
  -d "access_token=TOKEN"
```

You should get JSON with a `data` array — not an OAuth error.

---

## Step 5 — Exchange for a long-lived token (~60 days)

You need your app **App ID** and **App Secret** (App settings → Basic).

```bash
curl -G "https://graph.facebook.com/v20.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

Copy `access_token` from the response → put it in `.env` as `FACEBOOK_ACCESS_TOKEN`.

Optional: debug the token at [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/).

---

## Step 6 — Wire into this project

**Local** — add to `.env` in the project root:

```bash
FACEBOOK_ACCESS_TOKEN="EAA..."
```

**Production** — add the same variable to your Cloudflare Pages / Worker secrets (or wherever server env vars live).

Never commit the token to git.

---

## Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| Meta source **skipped** in scouting | `FACEBOOK_ACCESS_TOKEN` missing or empty in server env |
| OAuth / invalid token | Token expired — generate a new long-lived token |
| Empty `data` array | Try `ad_type=ALL`, broader `search_terms`, or confirm ID verification finished |
| Permission error | Regenerate token with `ads_read` on the correct app |

---

## Security

- **Do not** share your Facebook password with anyone or store it in code
- **Do not** commit `FACEBOOK_ACCESS_TOKEN` to the repository
- Rotate the token if it is ever exposed
- For production, consider a **System User** token in Meta Business Manager (non-expiring; requires Business verification)

Official reference: [Meta Ad Library API](https://www.facebook.com/ads/library/api/)
