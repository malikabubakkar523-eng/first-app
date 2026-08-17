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
  console.log("⚡ [Build Step 1/2] Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  console.log("⚡ [Build Step 2/2] Running Next.js production build...");
  execSync("npx next build", { stdio: "inherit", env: process.env });
} catch (error) {
  console.error("❌ [Build Failed]", error.message || error);
  process.exit(error.status || 1);
}
