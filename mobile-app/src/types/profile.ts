import type { Branch, Profile } from "@/types/database";

export type ProfileWithBranch = Profile & {
  branch: Pick<
    Branch,
    "id" | "name" | "address" | "latitude" | "longitude" | "radius_meters" | "is_active"
  > | null;
};
