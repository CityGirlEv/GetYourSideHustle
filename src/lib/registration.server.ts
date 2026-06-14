export type BetaRegistrationRole = 'qa' | 'agent'

/** True when the user already holds the role they are trying to register for. */
export function roleAlreadyRegistered(
  existingRoles: string[],
  requestedRole: BetaRegistrationRole,
): boolean {
  return existingRoles.includes(requestedRole)
}

/** Merge QA device lists without duplicates; empty → null for profile storage. */
export function mergeQaDevices(
  existing: string[] | null | undefined,
  incoming: string[] | null | undefined,
): string[] | null {
  const merged = Array.from(new Set([...(existing ?? []), ...(incoming ?? [])]))
  return merged.length > 0 ? merged : null
}

export function registrationRoleLabel(role: BetaRegistrationRole): string {
  return role === 'qa' ? 'QA tester' : 'agent'
}
