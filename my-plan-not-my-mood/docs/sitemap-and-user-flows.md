# MY PLAN, NOT MY MOOD — SITEMAP & USER FLOW ARCHITECTURE

---

## 1. SITEMAP ARCHITECTURE

```
HOME (/)
 ├── SHOP (/shop)
 │    ├── COLLECTIONS
 │    │    ├── Original Signature (/collections/original)
 │    │    ├── Check The Box (/collections/check-the-box)
 │    │    ├── Midlife & Reinvention (/collections/midlife-humor)
 │    │    └── Planning Tools (/collections/planners)
 │    ├── APPAREL
 │    │    ├── Tops & Tees (/shop/tees)
 │    │    ├── Hoodies & Fleece (/shop/hoodies)
 │    │    └── Hats & Accessories (/shop/accessories)
 │    └── PRODUCT DETAIL PAGE (/products/:handle)
 ├── WHAT'S YOUR MOOD? (/mood) [Interactive Tool]
 ├── WHAT WON TODAY? (/receipts) [Receipt Generator]
 ├── CHALLENGE (/challenge) [7-Day Reset Signup]
 ├── OUR STORY (/about)
 ├── CART (/cart)
 └── CHECKOUT (/checkout)
```

---

## 2. KEY USER FLOWS

### Flow 1: E-Commerce Purchase Flow
```
Social Ad / Post ---> Landing Page / Product Page ---> Add to Cart ---> Slide-Out Cart (Cross-sell Desk Pad) ---> Checkout ---> Confirmation + Plan Receipt Invitation
```

### Flow 2: Interactive Mood Tool Lead Capture
```
Homepage ---> Click "What's Your Mood Today?" ---> Select Mood ---> Instant Plan Recommendation Card ---> Enter Email for 7-Day Free Challenge PDF ---> Redirect to Shop
```

### Flow 3: Community "What Won Today?" Receipt Share
```
User visits /receipts ---> Enters Mood + Executed Plan ---> Selects [x] Plan Won ---> Downloads 9:16 Social Card ---> Shares to IG Story with #WhatWonToday
```
