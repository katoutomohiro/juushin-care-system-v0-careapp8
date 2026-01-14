import { existsSync, rmSync } from "node:fs";
import net from "node:net";
import { spawn } from "node:child_process";

const PORT_CANDIDATES = [3000, 3001, 3002, 3003, 3004, 3005];

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net
      .createServer()
      .once("error", (err) => resolve(err?.code === "EADDRINUSE"))
      .once("listening", () => server.close(() => resolve(false)))
      .listen(port, "127.0.0.1");
  });
}

async function pickPort() {
  for (const p of PORT_CANDIDATES) {
    const used = await isPortInUse(p);
    if (!used) return p;
  }
  return 3000;
}

function cleanNext() {
  if (existsSync(".next")) {
    rmSync(".next", { recursive: true, force: true });
    console.log("[dev-clean] removed .next");
  } else {
    console.log("[dev-clean] .next not found");
  }
}

function runNextDev(port) {
  const env = { ...process.env, PORT: String(port) };

  const isWin = process.platform === "win32";
  const command = isWin ? "cmd.exe" : "pnpm";
  const args = isWin ? ["/c", "pnpm", "dev"] : ["dev"];

  console.log(`[dev-clean] starting next dev on port ${port}...`);

  const child = spawn(command, args, {
    stdio: "inherit",
    env,
    shell: false,
  });

  child.on("exit", (code) => process.exit(code ?? 1));
  child.on("error", (e) => {
    console.error("[dev-clean] failed to start:", e);
    process.exit(1);
  });
}

async function main() {
  cleanNext();
  const port = await pickPort();
  runNextDev(port);
}

main().catch((e) => {
  console.error("[dev-clean] fatal:", e);
  process.exit(1);
});
