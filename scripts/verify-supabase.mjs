import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const require = createRequire(resolve(root, "mobile-app/package.json"));
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile(filePath) {
  const env = {};

  try {
    const content = readFileSync(filePath, "utf8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      env[key] = value;
    }
  } catch {
    return null;
  }

  return env;
}

async function verifyApp({ name, envPath, urlKey, anonKeyName }) {
  const env = loadEnvFile(envPath);

  if (!env) {
    console.error(`[${name}] FAIL - env file not found: ${envPath}`);
    return false;
  }

  const url = env[urlKey] ?? "";
  const anonKey = env[anonKeyName] ?? "";

  if (!url || !anonKey) {
    console.error(`[${name}] FAIL - missing ${urlKey} or ${anonKeyName}`);
    return false;
  }

  console.log(`[${name}] URL loaded: ${url}`);
  console.log(`[${name}] Publishable key loaded: yes`);

  const client = createClient(url, anonKey);
  const { error } = await client.auth.getSession();

  if (error) {
    console.error(`[${name}] FAIL - ${error.message}`);
    return false;
  }

  console.log(`[${name}] PASS - Supabase client initialized successfully`);
  return true;
}

const results = await Promise.all([
  verifyApp({
    name: "Mobile App",
    envPath: resolve(root, "mobile-app/.env"),
    urlKey: "EXPO_PUBLIC_SUPABASE_URL",
    anonKeyName: "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  }),
  verifyApp({
    name: "Admin Panel",
    envPath: resolve(root, "admin-panel/.env.local"),
    urlKey: "NEXT_PUBLIC_SUPABASE_URL",
    anonKeyName: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  }),
]);

if (results.every(Boolean)) {
  console.log("\nSupabase Connectivity = PASS");
  process.exit(0);
}

console.log("\nSupabase Connectivity = FAIL");
process.exit(1);
