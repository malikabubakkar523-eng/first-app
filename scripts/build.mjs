import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Load .env file into process.env if present
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.warn("⚠️ Could not load local .env:", e);
}

// Fallback DATABASE_URL if undefined in CI build container
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/veloce?schema=public";
}

try {
  console.log("⚡ [Build Step 1/3] Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  // If a live remote PostgreSQL database URL is configured, automatically push tables and seed
  const isRemoteDb =
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("localhost:5432") &&
    (process.env.DATABASE_URL.includes("postgres") || process.env.DATABASE_URL.includes("prisma"));

  if (isRemoteDb) {
    try {
      console.log("⚡ [Build Step 2/3] Auto-syncing database tables (prisma db push)...");
      execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env: process.env, timeout: 45000 });
      
      console.log("⚡ [Build Step 2.5/3] Auto-seeding initial store data...");
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env, timeout: 45000 });
    } catch (dbSyncErr) {
      console.warn("ℹ️  [Build Notice] Database auto-sync skipped during build:", dbSyncErr.message || dbSyncErr);
    }
  }

  console.log("⚡ [Build Step 3/3] Running Next.js production build...");
  execSync("npx next build", { stdio: "inherit", env: process.env });
} catch (error) {
  console.error("❌ [Build Failed]", error.message || error);
  process.exit(error.status || 1);
}
