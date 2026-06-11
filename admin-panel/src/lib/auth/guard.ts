import { getAuthenticatedAdminProfile } from "@/lib/auth/server";

export async function requireAdminAction() {
  await getAuthenticatedAdminProfile();
}
