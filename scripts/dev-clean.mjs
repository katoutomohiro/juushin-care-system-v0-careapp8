import { rmSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";

const PORT_CANDIDATES = [3000, 3001, 3002, 3003, 3004, 3005];

// Windows は pnpm.cmd を spawn しないと不安定になりやすい
const PNPM_BIN = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net
      .createServer()
      .once("error", (err) => resolve(err.code === "EADDRINUSE"))
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

function spawnAndWait(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: false, // ★重要: Windowsでの不安定さ回避
      env: opts.env ?? process.env,
      cwd: opts.cwd ?? process.cwd(),
    });

    child.on("error", (e) => reject(e));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function main() {
  cleanNext();

  const port = await pickPort();
  console.log(`[dev-clean] starting next dev on port ${port}`);

  await spawnAndWait(PNPM_BIN, ["dev"], {
    env: { ...process.env, PORT: String(port) },
  });
}

main().catch((e) => {
  console.error("[dev-clean] failed:", e?.message ?? e);
  process.exit(1);
});
