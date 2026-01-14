import { existsSync, rmSync } from "node:fs";

if (existsSync(".next")) {
  rmSync(".next", { recursive: true, force: true });
  console.log("[dev-clean] .next directory removed");
} else {
  console.log("[dev-clean] .next directory not found (already clean)");
}

console.log("[dev-clean] Cache cleanup complete. Run 'pnpm dev' to start the server.");
