/** Sub-steps for the Wednesday Facebook page invite task (editorial calendar slot 99). */

export interface FacebookInviteDayStep {
  id: string;
  label: string;
  /** Optional command or path to copy on invite day. */
  command?: string;
}

export const FACEBOOK_INVITE_EVENT_ID = "facebook_invite:launch";

export const FACEBOOK_INVITE_DAY_STEPS: FacebookInviteDayStep[] = [
  {
    id: "posts-live",
    label: "Confirm welcome post + Article 2 are live (page has at least 2 posts).",
  },
  {
    id: "export-unzipped",
    label: "Meta JSON export is unzipped in Downloads\\facebook-export (comments + likes/reactions inside).",
    command: String.raw`C:\Users\evely\Downloads\facebook-export`,
  },
  {
    id: "run-pipeline",
    label: "Run the pipeline — builds top-50 list and updates invite_agent.py.",
    command: String.raw`C:\Users\evely\run_facebook_invite_pipeline.ps1 -ExportPath "C:\Users\evely\Downloads\facebook-export" -SelfName "Your Facebook Display Name"`,
  },
  {
    id: "run-agent",
    label: "Start the browser agent.",
    command: String.raw`& "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" C:\Users\evely\invite_agent.py`,
  },
  {
    id: "login",
    label: "Log into Facebook in the opened browser and finish 2FA (script waits ~45 seconds).",
  },
  {
    id: "open-modal",
    label: "On PartBOptimizer, open Invite friends to like this Page — wait until the modal is fully open.",
  },
  {
    id: "press-enter",
    label: "Switch to the Cursor terminal and press Enter so the agent can search names.",
  },
  {
    id: "send-invites",
    label: "Review checked names in the browser, then click Send Invites yourself.",
  },
];

export function facebookInviteStepStorageId(stepId: string): string {
  return `${FACEBOOK_INVITE_EVENT_ID}:${stepId}`;
}
