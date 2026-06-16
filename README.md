# Get Part B Optimizer

## E2E Test Setup

1. Copy the template:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in `.env.local` with real test account credentials.

3. Create test accounts via the Admin Console → Staff tab (or register and have an admin approve).

4. Run tests:
   ```bash
   bun run e2e
   ```

Tests gracefully skip when env vars are missing, so you can run partial suites.
