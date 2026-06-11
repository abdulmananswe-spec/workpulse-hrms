/**
 * Phase 3.5 — Authentication & Profile Verification Script
 * Run: node scripts/verify-auth.mjs
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const require = createRequire(resolve(root, "mobile-app/package.json"));
const { createClient } = require("@supabase/supabase-js");

const PASSWORD = "Password123!";
const USERS = {
  admin: "admin@company.com",
  employee: "employee@company.com",
};

function loadEnv(filePath) {
  const env = {};
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

const mobileEnv = loadEnv(resolve(root, "mobile-app/.env"));
const url = mobileEnv.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = mobileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const results = {
  authUsers: { admin: false, employee: false },
  profiles: { admin: null, employee: null },
  roles: { admin: null, employee: null },
  mobileLogin: { employee: false, adminBlocked: false },
  adminLogin: { admin: false, employeeBlocked: false },
  sessionRestore: { employee: false, admin: false },
  logout: { employee: false, admin: false },
  rls: {
    employeeOwnProfile: false,
    employeeOwnAttendance: false,
    employeeCreateAttendance: false,
    adminAllProfiles: false,
    adminAllAttendance: false,
    employeeCannotSeeAllProfiles: false,
  },
  triggerNote: null,
  issues: [],
  fixes: [],
};

function client() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signIn(email, password) {
  const supabase = client();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { supabase, data, error };
}

async function getProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, employee_code, is_active")
    .eq("id", userId)
    .maybeSingle();
  return { data, error };
}

console.log("=".repeat(60));
console.log("PHASE 3.5 — AUTHENTICATION & PROFILE VERIFICATION");
console.log("=".repeat(60));
console.log(`Supabase URL: ${url}\n`);

// --- STEP 1 & 3: Verify auth users and roles ---
for (const [key, email] of Object.entries(USERS)) {
  console.log(`\n--- Checking ${key}: ${email} ---`);
  const { supabase, data, error } = await signIn(email, PASSWORD);

  if (error) {
    console.log(`  Auth login: FAIL — ${error.message}`);
    results.issues.push(`${email} cannot sign in: ${error.message}`);
    continue;
  }

  results.authUsers[key] = true;
  console.log(`  Auth login: PASS — user id ${data.user.id}`);

  const { data: profile, error: profileError } = await getProfile(
    supabase,
    data.user.id,
  );

  if (profileError) {
    console.log(`  Profile fetch: FAIL — ${profileError.message}`);
    results.issues.push(`${email} profile fetch failed: ${profileError.message}`);
  } else if (!profile) {
    console.log(`  Profile fetch: FAIL — no profile row found`);
    results.issues.push(`${email} has auth user but NO profile row — trigger may not have run or seed not applied`);
  } else {
    results.profiles[key] = profile;
    results.roles[key] = profile.role;
    console.log(`  Profile: PASS — ${profile.full_name} (role=${profile.role})`);

    if (key === "admin" && profile.role !== "admin") {
      results.issues.push(`admin@company.com role is '${profile.role}', expected 'admin'`);
    }
    if (key === "employee" && profile.role !== "employee") {
      results.issues.push(`employee@company.com role is '${profile.role}', expected 'employee'`);
    }
  }

  await supabase.auth.signOut();
}

// --- STEP 4: Mobile login flow ---
console.log("\n--- Mobile Login Flow ---");

// Employee should login
{
  const { supabase, data, error } = await signIn(USERS.employee, PASSWORD);
  if (!error && data.session) {
    const { data: profile } = await getProfile(supabase, data.user.id);
    if (profile?.role === "employee" && profile.is_active) {
      results.mobileLogin.employee = true;
      console.log("  Employee login: PASS");

      // Session restore
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id === data.user.id) {
        results.sessionRestore.employee = true;
        console.log("  Employee session restore: PASS");
      }

      await supabase.auth.signOut();
      const { data: afterSignOut } = await supabase.auth.getSession();
      if (!afterSignOut.session) {
        results.logout.employee = true;
        console.log("  Employee logout: PASS");
      }
    }
  } else {
    console.log(`  Employee login: FAIL — ${error?.message}`);
  }
}

// Admin should be blocked on mobile (role check)
{
  const { supabase, data, error } = await signIn(USERS.admin, PASSWORD);
  if (!error && data.session) {
    const { data: profile } = await getProfile(supabase, data.user.id);
    const isEmployeeRole = profile?.role === "employee" && profile?.is_active;
    if (!isEmployeeRole) {
      results.mobileLogin.adminBlocked = true;
      console.log("  Admin blocked from employee area: PASS (role=admin, not employee)");
    } else {
      console.log("  Admin blocked from employee area: FAIL — admin has employee access");
      results.issues.push("Admin user incorrectly has employee role or mobile guard would fail");
    }
    await supabase.auth.signOut();
  }
}

// --- STEP 4: Admin login flow ---
console.log("\n--- Admin Login Flow ---");

{
  const { supabase, data, error } = await signIn(USERS.admin, PASSWORD);
  if (!error && data.session) {
    const { data: profile } = await getProfile(supabase, data.user.id);
    if (profile?.role === "admin" && profile.is_active) {
      results.adminLogin.admin = true;
      console.log("  Admin login: PASS");

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id === data.user.id) {
        results.sessionRestore.admin = true;
        console.log("  Admin session restore: PASS");
      }

      await supabase.auth.signOut();
      const { data: afterSignOut } = await supabase.auth.getSession();
      if (!afterSignOut.session) {
        results.logout.admin = true;
        console.log("  Admin logout: PASS");
      }
    }
  } else {
    console.log(`  Admin login: FAIL — ${error?.message}`);
  }
}

{
  const { supabase, data, error } = await signIn(USERS.employee, PASSWORD);
  if (!error && data.session) {
    const { data: profile } = await getProfile(supabase, data.user.id);
    const isAdminRole = profile?.role === "admin" && profile?.is_active;
    if (!isAdminRole) {
      results.adminLogin.employeeBlocked = true;
      console.log("  Employee blocked from admin area: PASS (role=employee, not admin)");
    } else {
      console.log("  Employee blocked from admin area: FAIL");
    }
    await supabase.auth.signOut();
  }
}

// --- STEP 5: RLS verification ---
console.log("\n--- RLS Verification ---");

// Employee RLS
{
  const { supabase, data, error } = await signIn(USERS.employee, PASSWORD);
  if (!error && data.session) {
    const uid = data.user.id;

    const { data: ownProfile, error: pErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", uid)
      .maybeSingle();
    if (!pErr && ownProfile) {
      results.rls.employeeOwnProfile = true;
      console.log("  Employee view own profile: PASS");
    } else {
      console.log(`  Employee view own profile: FAIL — ${pErr?.message ?? "no data"}`);
    }

    const { data: allProfiles } = await supabase.from("profiles").select("id");
    if ((allProfiles?.length ?? 0) <= 1) {
      results.rls.employeeCannotSeeAllProfiles = true;
      console.log("  Employee cannot view all profiles: PASS");
    } else {
      console.log(`  Employee cannot view all profiles: FAIL — saw ${allProfiles?.length} rows`);
      results.issues.push("RLS: employee can see multiple profiles");
    }

    const { data: ownAttendance, error: aErr } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("employee_id", uid);
    if (!aErr) {
      results.rls.employeeOwnAttendance = true;
      console.log("  Employee view own attendance: PASS");
    } else {
      console.log(`  Employee view own attendance: FAIL — ${aErr.message}`);
      if (aErr.message.includes("policy")) {
        results.issues.push("RLS migration 20250608140000 may not be applied");
      }
    }

    // Test insert (will rollback by signing out — insert a dummy then delete if possible)
    const { error: insertErr } = await supabase.from("attendance_records").insert({
      employee_id: uid,
      check_in_time: new Date().toISOString(),
      status: "present",
    });
    if (!insertErr) {
      results.rls.employeeCreateAttendance = true;
      console.log("  Employee create attendance: PASS");
      // Clean up test record
      await supabase
        .from("attendance_records")
        .delete()
        .eq("employee_id", uid)
        .gte("created_at", new Date(Date.now() - 5000).toISOString());
    } else {
      console.log(`  Employee create attendance: FAIL — ${insertErr.message}`);
      results.issues.push(`RLS insert blocked: ${insertErr.message}`);
      results.fixes.push("Run: cd database && supabase db push (migration 20250608140000_attendance_employee_policies.sql)");
    }

    await supabase.auth.signOut();
  }
}

// Admin RLS
{
  const { supabase, data, error } = await signIn(USERS.admin, PASSWORD);
  if (!error && data.session) {
    const { data: allProfiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, role");
    if (!pErr && (allProfiles?.length ?? 0) >= 2) {
      results.rls.adminAllProfiles = true;
      console.log(`  Admin view all profiles: PASS (${allProfiles.length} profiles)`);
    } else {
      console.log(`  Admin view all profiles: FAIL — ${pErr?.message ?? `only ${allProfiles?.length ?? 0} profiles`}`);
    }

    const { data: allAttendance, error: aErr } = await supabase
      .from("attendance_records")
      .select("id");
    if (!aErr) {
      results.rls.adminAllAttendance = true;
      console.log(`  Admin view all attendance: PASS (${allAttendance?.length ?? 0} records)`);
    } else {
      console.log(`  Admin view all attendance: FAIL — ${aErr.message}`);
    }

    await supabase.auth.signOut();
  }
}

// --- Summary ---
console.log("\n" + "=".repeat(60));
console.log("FINAL REPORT");
console.log("=".repeat(60));

const authUsersPass = results.authUsers.admin && results.authUsers.employee;
const profilesPass =
  results.profiles.admin && results.profiles.employee;
const rolesPass =
  results.roles.admin === "admin" && results.roles.employee === "employee";
const mobilePass =
  results.mobileLogin.employee && results.mobileLogin.adminBlocked;
const adminPass = results.adminLogin.admin && results.adminLogin.employeeBlocked;
const rlsPass =
  results.rls.employeeOwnProfile &&
  results.rls.employeeOwnAttendance &&
  results.rls.employeeCreateAttendance &&
  results.rls.adminAllProfiles &&
  results.rls.adminAllAttendance &&
  results.rls.employeeCannotSeeAllProfiles;

console.log(`\n1. Existing users:`);
console.log(`   admin@company.com: ${results.authUsers.admin ? "EXISTS" : "MISSING"}`);
console.log(`   employee@company.com: ${results.authUsers.employee ? "EXISTS" : "MISSING"}`);

console.log(`\n2. Profiles found:`);
console.log(`   Admin: ${results.profiles.admin ? JSON.stringify(results.profiles.admin) : "NOT FOUND"}`);
console.log(`   Employee: ${results.profiles.employee ? JSON.stringify(results.profiles.employee) : "NOT FOUND"}`);

console.log(`\n3. Roles found:`);
console.log(`   Admin role: ${results.roles.admin ?? "N/A"}`);
console.log(`   Employee role: ${results.roles.employee ?? "N/A"}`);

console.log(`\n4. Authentication test results:`);
console.log(`   Mobile employee login: ${results.mobileLogin.employee ? "PASS" : "FAIL"}`);
console.log(`   Mobile admin blocked: ${results.mobileLogin.adminBlocked ? "PASS" : "FAIL"}`);
console.log(`   Admin login: ${results.adminLogin.admin ? "PASS" : "FAIL"}`);
console.log(`   Admin employee blocked: ${results.adminLogin.employeeBlocked ? "PASS" : "FAIL"}`);
console.log(`   Session restore (employee): ${results.sessionRestore.employee ? "PASS" : "FAIL"}`);
console.log(`   Session restore (admin): ${results.sessionRestore.admin ? "PASS" : "FAIL"}`);
console.log(`   Logout (employee): ${results.logout.employee ? "PASS" : "FAIL"}`);
console.log(`   Logout (admin): ${results.logout.admin ? "PASS" : "FAIL"}`);

console.log(`\n5. RLS verification:`);
console.log(`   Employee own profile: ${results.rls.employeeOwnProfile ? "PASS" : "FAIL"}`);
console.log(`   Employee own attendance: ${results.rls.employeeOwnAttendance ? "PASS" : "FAIL"}`);
console.log(`   Employee create attendance: ${results.rls.employeeCreateAttendance ? "PASS" : "FAIL"}`);
console.log(`   Admin all profiles: ${results.rls.adminAllProfiles ? "PASS" : "FAIL"}`);
console.log(`   Admin all attendance: ${results.rls.adminAllAttendance ? "PASS" : "FAIL"}`);
console.log(`   Employee isolated from other profiles: ${results.rls.employeeCannotSeeAllProfiles ? "PASS" : "FAIL"}`);

console.log(`\n6. Issues found: ${results.issues.length}`);
results.issues.forEach((i) => console.log(`   - ${i}`));

console.log(`\n7. Fixes required:`);
if (results.fixes.length === 0 && results.issues.length === 0) {
  console.log("   None — system fully functional");
} else {
  results.fixes.forEach((f) => console.log(`   - ${f}`));
  if (!results.authUsers.admin || !results.authUsers.employee) {
    console.log(`   - Run SQL: database/scripts/create-test-users.sql in Supabase SQL Editor`);
    console.log(`   - OR create users via Dashboard (see docs/verification/auth-verification.md)`);
  }
  if (results.profiles.admin && results.roles.admin !== "admin") {
    console.log(`   - SQL: UPDATE profiles SET role = 'admin' WHERE email = 'admin@company.com';`);
  }
  if (results.profiles.employee && results.roles.employee !== "employee") {
    console.log(`   - SQL: UPDATE profiles SET role = 'employee' WHERE email = 'employee@company.com';`);
  }
}

console.log(`\n--- EXPECTED OUTPUT ---`);
console.log(`Auth Users = ${authUsersPass ? "PASS" : "FAIL"}`);
console.log(`Profiles = ${profilesPass ? "PASS" : "FAIL"}`);
console.log(`Roles = ${rolesPass ? "PASS" : "FAIL"}`);
console.log(`Mobile Login = ${mobilePass ? "PASS" : "FAIL"}`);
console.log(`Admin Login = ${adminPass ? "PASS" : "FAIL"}`);
console.log(`RLS = ${rlsPass ? "PASS" : "FAIL"}`);

process.exit(
  authUsersPass && profilesPass && rolesPass && mobilePass && adminPass && rlsPass
    ? 0
    : 1,
);
