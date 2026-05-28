import { Page } from "@playwright/test";

export interface AuthCreds {
  email: string;
  password: string;
}

/** Log in through the UI sign-in form. Assumes the page is on /auth. */
export async function signIn(page: Page, creds: AuthCreds) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(creds.email);
  await page.getByLabel(/password/i).fill(creds.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait for navigation away from auth (redirect to role destination)
  await page.waitForURL((url) => !url.pathname.includes("/auth"), { timeout: 10_000 });
}

/** Log out via UI if a sign-out button exists, otherwise navigate to /auth. */
export async function signOut(page: Page) {
  const outBtn = page.getByTitle("Sign out");
  if (await outBtn.isVisible().catch(() => false)) {
    await outBtn.click();
    await page.waitForURL("/auth", { timeout: 10_000 });
  } else {
    await page.goto("/auth");
  }
}

function getCreds(envPrefix: string): AuthCreds | null {
  const email = process.env[`E2E_${envPrefix}_EMAIL`];
  const password = process.env[`E2E_${envPrefix}_PASSWORD`];
  if (!email || !password) return null;
  return { email, password };
}

export const adminCreds = () => getCreds("ADMIN");
export const qaCreds = () => getCreds("QA");
export const agentCreds = () => getCreds("AGENT");
