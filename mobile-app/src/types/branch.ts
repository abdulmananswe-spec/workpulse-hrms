import type { Branch } from "@/types/database";

export type EmployeeBranch = Pick<
  Branch,
  "id" | "name" | "latitude" | "longitude" | "radius_meters" | "is_active"
>;
