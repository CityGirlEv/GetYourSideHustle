import { savePendingJoinReturn } from "./pending-join-return";
import { AI_SCENE_PACKS_WORKSHOP_ID, resolveWorkshopId } from "./workshops";

/** Bold lead on the workshop registration gate. */
export const WORKSHOP_FREE_MEMBERSHIP_NEED =
  "Need Free membership or higher to attend.";

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
