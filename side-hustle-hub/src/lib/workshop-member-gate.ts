import { savePendingJoinReturn } from "./pending-join-return";
import { workshopRequiresMember } from "./workshop-playbooks";
import { AI_SCENE_PACKS_WORKSHOP_ID, resolveWorkshopId } from "./workshops";

/** Bold lead on the workshop registration gate. */
export const WORKSHOP_FREE_MEMBERSHIP_NEED =
  "Need Free membership or higher to attend.";

/** Guest-gate submit copy when a member-only workshop is still locked. */
export const WORKSHOP_JOIN_OR_SIGN_IN =
  "Join Free (or sign in) to pre-register. Need Free membership or higher to attend.";

/** Starter/Free+ members may register; guests stay on the Join / Sign in gate. */
export function workshopRegistrationMemberOk(workshopId: string, isLoggedIn: boolean): boolean {
  return !workshopRequiresMember(workshopId) || isLoggedIn;
}

export function workshopRegistrationFormUnlocked(opts: {
  isOpen: boolean;
  memberOk: boolean;
  submitting?: boolean;
}): boolean {
  return Boolean(opts.isOpen && opts.memberOk && !opts.submitting);
}

export function workshopMemberGateWorkshopName(workshopId: string, title: string): string {
  if (resolveWorkshopId(workshopId) === AI_SCENE_PACKS_WORKSHOP_ID) {
    return "the 90-Minute AI Workshop";
  }
  return title;
}

/** Manual path back if signup does not auto-return them to Register. */
export function workshopMemberGateDirections(workshopId: string, title: string): string {
  const name = workshopMemberGateWorkshopName(workshopId, title);
  return `Create a FREE account, then come back by clicking Community → Workshops → look for ${name} and click Register again.`;
}

export function saveWorkshopRegistrationJoinReturn(workshopId: string) {
  const id = resolveWorkshopId(workshopId);
  return savePendingJoinReturn({
    view: "workshops",
    workshopRegisterId: id || workshopId,
  });
}
