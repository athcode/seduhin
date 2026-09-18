import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const py = spawn("python", ["main.py"], { cwd: join(root, "backend"), shell: true, stdio: "ignore" });
const vite = spawn("cmd.exe", ["/c", "node_modules\\.bin\\vite.cmd preview --port 4173 --host 127.0.0.1"], { cwd: join(root, "frontend"), shell: true, stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await sleep(7000);
  const r = spawnSync(edge, ["--headless", "--disable-gpu", "--no-sandbox", "--virtual-time-budget=15000", "--dump-dom", "http://localhost:4173/"], { encoding: "utf8", maxBuffer: 1 << 26 });
  const d = r.stdout || "";
  const checks = {
    "len>3000": d.length > 3000,
    "hook": /Biji bagus, sayang ditebak/.test(d),
    "CTA Mulai Seduh": /Mulai Seduh/.test(d),
    "Cara Pakai": /Cara Pakai/.test(d),
    "copy step baru": /Asal kopi, proses, roast/.test(d),
    "tanpa em-dash": !/—/.test(d),
    "label fase ID": /Kopi|Resep|Seduh/.test(d),
  };
  for (const [k, v] of Object.entries(checks)) console.log((v ? "OK   " : "FAIL ") + k);
  if (!checks["len>3000"]) console.log("DOM:", d.slice(0, 400));
} finally {
  py.kill();
  vite.kill();
  spawnSync("taskkill", ["/F", "/IM", "python.exe"], { stdio: "ignore" });
  spawnSync("taskkill", ["/F", "/IM", "node.exe"], { stdio: "ignore" });
}
