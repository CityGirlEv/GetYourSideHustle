# MY PLAN, NOT MY MOOD — TECHNICAL REQUIREMENTS & ARCHITECTURE

---

## 1. ENVIRONMENT URLS & ACCESS

| Environment | URL | Details |
| :--- | :--- | :--- |
| **Production Live Web** | [https://my-plan-not-my-mood.pages.dev](https://my-plan-not-my-mood.pages.dev) | Live deployed storefront & app |
| **Custom Domain** | [https://nonnegotiation.com](https://nonnegotiation.com) | Official custom domain |
| **Local Development** | [http://localhost:3001](http://localhost:3001) | Local Vite dev server |

---

## 2. RECOMMENDED TECH STACK

| Component | Technology / Platform | Purpose |
| :--- | :--- | :--- |
| **E-Commerce Frontend** | React / TanStack Start / Vite | Modern high-performance web storefront & interactive widgets |
| **Styling** | Vanilla CSS / TailwindCSS | High-craft visual brand styling |
| **Database & Auth** | Supabase (PostgreSQL + Auth) | User accounts, saved mood logs, receipt submissions, order history |
| **Fulfillment / POD** | Printful / Monster Digital API | Automated order routing for apparel & accessories |
| **Email Marketing** | Klaviyo | Abandoned cart, Welcome flow, "The Plan Check-in" weekly newsletter |
| **Analytics** | PostHog / Google Analytics 4 | Event tracking for mood tool, cart adds, challenge signups |

---

## 2. DATA MODEL SCHEMAS

### Mood Selection Log Schema (`mood_logs`)
```json
{
  "id": "UUID",
  "user_id": "UUID (Optional)",
  "session_id": "STRING",
  "selected_mood": "TIRED | OVER_IT | PROCRASTINATING | ANXIOUS | FIRED_UP | MEH",
  "recommended_plan": "STRING",
  "created_at": "TIMESTAMPTZ"
}
```

### Plan Receipt Submission Schema (`plan_receipts`)
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "mood_entry": "STRING",
  "plan_executed": "STRING",
  "winner": "PLAN | MOOD",
  "is_public": "BOOLEAN",
  "created_at": "TIMESTAMPTZ"
}
```

---

## 3. ANALYTICS & EVENT TRACKING SCHEMA

* `view_homepage`
* `select_mood` (properties: `mood_type`)
* `generate_receipt` (properties: `winner`)
* `signup_challenge` (properties: `challenge_name`)
* `view_product` (properties: `product_id`, `category`)
* `add_to_cart` (properties: `product_id`, `variant`)
* `begin_checkout`
* `purchase_complete` (properties: `order_id`, `revenue`, `items_count`)
