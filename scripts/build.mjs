import { execSync } from "child_process";

// Ensure DATABASE_URL is defined during build so Prisma schema validation succeeds
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  console.log("ℹ️  [Build Info] No DATABASE_URL found in build environment. Using default schema configuration for Prisma generation.");
  process.env.DATABASE_URL = "file:./dev.db";
}

try {
  console.log("⚡ [Build Step 1/2] Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  console.log("⚡ [Build Step 2/2] Running Next.js production build...");
  execSync("npx next build", { stdio: "inherit", env: process.env });
} catch (error) {
  console.error("❌ [Build Failed]", error.message || error);
  process.exit(error.status || 1);
}
