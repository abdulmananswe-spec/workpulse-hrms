import type { AppRole, Profile } from "@/types/database";

export const REQUIRED_ADMIN_ROLE: AppRole = "admin";
export const REQUIRED_MOBILE_ROLE: AppRole = "employee";

export const UNAUTHORIZED_MESSAGE = "Unauthorized Access";

type RoleCheckProfile = Pick<Profile, "role" | "is_active"> | null;

export function isAdmin(profile: RoleCheckProfile): boolean {
  return profile?.role === REQUIRED_ADMIN_ROLE && profile.is_active;
}

export function isEmployee(profile: RoleCheckProfile): boolean {
  return profile?.role === REQUIRED_MOBILE_ROLE && profile.is_active;
}

export function hasRequiredAdminRole(profile: RoleCheckProfile): boolean {
  return isAdmin(profile);
}
