import {
  packageIncludesFeature,
  type AgentAddOnId,
  type AgentTierId,
} from "@/lib/agent-pricing-tiers";
import {
  userCanAccessAgentUpsellFeatures,
  userCanSeeAdminMenu,
  type UserRoleCheck,
} from "@/lib/user-roles";

/** Platform feature id — county plan inventory by 3-digit ZIP prefix (multiselect counties). */
export const COUNTY_REPORT_ZIP3_FEATURE = "county-report-zip3";

/** Platform feature id — county plan inventory for one 5-digit ZIP (single county). */
export const COUNTY_REPORT_ZIP5_FEATURE = "county-report-zip5";

export type AgentPackageContext = {
  tierId: AgentTierId;
  addOnIds: AgentAddOnId[];
};

/** Resolve tier + à la carte add-ons for entitlement checks (MVP until profile billing ships). */
export function resolveAgentPackageForUser(
  user: UserRoleCheck | null | undefined,
): AgentPackageContext {
  if (!user || !userCanAccessAgentUpsellFeatures(user)) {
    return { tierId: "bronze", addOnIds: [] };
  }
  if (userCanSeeAdminMenu(user)) {
    return { tierId: "gold", addOnIds: [] };
  }
  // TODO: read tierId + addOnIds from user profile when platform billing ships.
  return { tierId: "bronze", addOnIds: [] };
}

export function packageIncludesCountyReportZip3(
  tierId: AgentTierId,
  addOnIds: AgentAddOnId[],
): boolean {
  return packageIncludesFeature(tierId, addOnIds, COUNTY_REPORT_ZIP3_FEATURE);
}

export function packageIncludesCountyReportZip5(
  tierId: AgentTierId,
  addOnIds: AgentAddOnId[],
): boolean {
  return packageIncludesFeature(tierId, addOnIds, COUNTY_REPORT_ZIP5_FEATURE);
}

export function userCanAccessCountyReportZip3(
  user: UserRoleCheck | null | undefined,
  pkg?: AgentPackageContext,
): boolean {
  if (!userCanAccessAgentUpsellFeatures(user)) return false;
  const resolved = pkg ?? resolveAgentPackageForUser(user);
  return packageIncludesCountyReportZip3(resolved.tierId, resolved.addOnIds);
}

export function userCanAccessCountyReportZip5(
  user: UserRoleCheck | null | undefined,
  pkg?: AgentPackageContext,
): boolean {
  if (!userCanAccessAgentUpsellFeatures(user)) return false;
  const resolved = pkg ?? resolveAgentPackageForUser(user);
  return packageIncludesCountyReportZip5(resolved.tierId, resolved.addOnIds);
}

/** True when the agent package unlocks at least one county report mode. */
export function userCanAccessAnyCountyReportMode(
  user: UserRoleCheck | null | undefined,
  pkg?: AgentPackageContext,
): boolean {
  return (
    userCanAccessCountyReportZip3(user, pkg) || userCanAccessCountyReportZip5(user, pkg)
  );
}
