# MY PLAN, NOT MY MOOD — QUALITY ASSURANCE (QA) PLAN

---

## 1. MANDATORY QA DOMAINS

### Functional Testing
* Verify all navigation menu items resolve without 404s.
* Confirm "What's Your Mood Today?" tool updates response cards and generates correct single action steps.
* Test "What Won Today?" receipt image generator across mobile and desktop.
* Validate Add-to-Cart slide-out drawer, variant selection (Size/Color), and checkout redirection.

### Responsive Breakpoints
* Test layout integrity at 320px (iPhone SE), 375px, 414px, 768px (Tablet), 1024px, 1440px+ (Desktop).
* Ensure zero horizontal scroll overflow.

### Accessibility (WCAG 2.1 AA)
* Minimum contrast ratio of 4.5:1 for body text and 3:1 for large headers.
* All interactive buttons, forms, and mood pills must be keyboard accessible with visible focus indicators (`:focus-visible`).
* Accessible labels (`aria-label`) on icon-only buttons.

---

## 2. TEST DATA RULE & PROVENANCE

> [!IMPORTANT]
> **Strict Test Data Rule**:
> All development and testing environments MUST explicitly label non-production data. 
> Use credentials like `TEST CUSTOMER`, `test@example.com`, and `TEST ORDER #9999`. 
> Never allow mock or simulated data to appear as authentic customer metrics or live store statistics.
