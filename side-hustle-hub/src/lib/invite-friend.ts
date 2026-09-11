import { CREDIT_EARN_ACTIONS } from "./membership";

/** Kid Credits earned when a referred friend creates an account. */
export function inviteFriendCredits(): number {
  return CREDIT_EARN_ACTIONS.find((a) => a.id === "refer_friend")?.credits ?? 5;
}

export const INVITE_FRIEND_TITLE = "Invite a friend";

export function inviteFriendHeadline(): string {
  return "Share GYSH with one friend this week.";
}

export function inviteFriendBody(isLoggedIn: boolean): string {
  const credits = inviteFriendCredits();
  if (isLoggedIn) {
    return `Copy your invite link, send it to one friend, and you earn ${credits} Kid Credits when they create an account.`;
  }
  return `Join free (or log in) to get your invite link. Send it to one friend — you earn ${credits} Kid Credits when they create an account.`;
}

/** Numbered steps shown on the Teens Guide CTA, dashboards, and PDF. */
export function inviteFriendSteps(isLoggedIn: boolean): string[] {
  const credits = inviteFriendCredits();
  if (isLoggedIn) {
    return [
      "Copy your invite link below (it’s also next to My Dashboard).",
      "Send it to one friend this week — text, chat, or email.",
      `When they create an account, you earn ${credits} Kid Credits.`,
    ];
  }
  return [
    "Join free or log in so GYSH can give you an invite link.",
    "Open My Dashboard and copy your invite link next to the dashboard button, or open the Referral tab.",
    "Send it to one friend this week — text, chat, or email.",
    `When they create an account, you earn ${credits} Kid Credits.`,
  ];
}
