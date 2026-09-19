// Uji interaksi live: navigasi back/next antar phase via CDP (Edge headless).
// Jalankan: node scripts/nav_check.mjs (server dev harus jalan di :5173)
import { spawn } from "node:child_process";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = "http://localhost:5173/";
const PORT = 9223;

const failures = [];
function check(name, cond, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${extra}`);
  if (!cond) failures.push(name);
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Edge debug target tidak ketemu");
}

const browser = spawn(EDGE, [
  "--headless", "--disable-gpu", "--no-sandbox",
  `--remote-debugging-port=${PORT}`, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) =>
    new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  const evalJs = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error("eval error: " + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Page.navigate", { url: URL });
  await sleep(3000);

  const clickText = (text) => evalJs(`[...document.querySelectorAll("button")].find(b => b.textContent.trim().includes(${JSON.stringify(text)}))?.click() ?? false`);
  const hasText = (text) => evalJs(`document.body.textContent.includes(${JSON.stringify(text)})`);
  const countButtons = (text) => evalJs(`[...document.querySelectorAll(".phase-rail button")].filter(b => b.textContent.includes(${JSON.stringify(text)})).length`);
  // phase rail: ambil dari .phase-rail (bukan button global — brand "Seduhin" cocok "Seduh")
  const clickRail = (text) => evalJs(`[...document.querySelectorAll(".phase-rail button")].find(b => b.textContent.includes(${JSON.stringify(text)}))?.click() ?? false`);

  // 1. home → method
  check("home render", await hasText("Mulai Seduh"));
  await clickText("Mulai Seduh");
  await sleep(400);
  check("masuk method", await hasText("Pilih Metode Seduh"));

  // 2. method → presets (pilih V60)
  await evalJs(`[...document.querySelectorAll("button")].find(b => b.textContent.includes("V60"))?.click()`);
  await sleep(400);
  check("masuk presets (V60)", await hasText("Custom / Manual"));

  // 3. presets → input
  await clickText("Custom / Manual");
  await sleep(400);
  check("masuk input", await hasText("Asal Kopi"));
  check("back 'Alat lain' ada", await hasText("Alat lain"));

  // 4. isi origin → generate → recipe
  await evalJs(`
    const el = document.getElementById("origin");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, "Ethiopia Yirgacheffe");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    true;
  `);
  await clickText("Generate Resep");
  await sleep(1500); // tunggu fetch /api/recipe
  check("masuk recipe", await hasText("Kapan Tuang Air"));
  check("back 'Ubah Kopi' ada", await hasText("Ubah Kopi"));
  check("Mulai Timer ada", await hasText("Mulai Timer"));

  // 5. phase rail: 4 step, yang aktif "Resep"
  check("rail 4 step", await countButtons("Resep") >= 1);
  check("rail step 'Seduh'", await countButtons("Seduh") >= 1);
  check("rail step 'Rasa'", await countButtons("Rasa") >= 1);

  // 6. NEXT: klik step "Seduh" → brewing
  await clickRail("Seduh");
  await sleep(400);
  check("next ke brewing", await hasText("Lagi Jalan") || await hasText("Start"));
  check("back 'Balik ke resep' ada", await hasText("Balik ke resep"));

  // 7. NEXT: step "Rasa" → feedback
  await clickRail("Rasa");
  await sleep(400);
  check("next ke feedback", await hasText("Kegasaman") || await hasText("Kepahitan"));
  check("back 'Seduh Lagi' ada", await hasText("Seduh Lagi"));
  check("'Bikin Baru' ada", await hasText("Bikin Baru"));

  // 8. BACK: step "Resep" → recipe lagi
  await clickRail("Resep");
  await sleep(400);
  check("back ke recipe", await hasText("Kapan Tuang Air"));

  // 9. BACK: step "Kopi" → input (ubah kopi)
  await clickRail("Kopi");
  await sleep(400);
  check("back ke input", await hasText("Asal Kopi"));
  check("origin ter-isi ulang", await evalJs(`document.getElementById("origin")?.value === "Ethiopia Yirgacheffe"`));

  // 10. dari input, skip ke "Rasa" (recipe masih ada di state → reachable)
  await clickRail("Rasa");
  await sleep(400);
  check("skip ke feedback dari input (data ada)", await hasText("Kegasaman"));

  // 11. URL ikut phase (pushState)
  check("url /rasa saat feedback", await evalJs(`location.pathname === "/rasa"`));

  // 12. browser BACK: /rasa → /kopi
  await evalJs(`history.back()`);
  await sleep(400);
  check("browser back ke input", await hasText("Asal Kopi"));
  check("url /kopi", await evalJs(`location.pathname === "/kopi"`));

  // 13. browser FORWARD: balik ke /rasa
  await evalJs(`history.forward()`);
  await sleep(400);
  check("browser forward ke feedback", await hasText("Kegasaman"));
  check("url /rasa lagi", await evalJs(`location.pathname === "/rasa"`));

  // 14. browser BACK 2x: /rasa → /kopi → /resep
  await evalJs(`history.back()`);
  await sleep(300);
  await evalJs(`history.back()`);
  await sleep(400);
  check("back 2x ke recipe", await hasText("Kapan Tuang Air"));
  check("url /resep", await evalJs(`location.pathname === "/resep"`));

  // 15. deep-link /seduh cold start (no recipe) → pulang ke beranda
  await send("Page.navigate", { url: "http://localhost:5173/seduh" });
  await sleep(3000);
  check("deep-link /seduh tanpa recipe → beranda", await hasText("Mulai Seduh"));
  check("url dinormalkan ke /", await evalJs(`location.pathname === "/"`));

  // 16. deep-link /metode jalan
  await send("Page.navigate", { url: "http://localhost:5173/metode" });
  await sleep(2500);
  check("deep-link /metode jalan", await hasText("Pilih Metode Seduh"));
  check("url /metode", await evalJs(`location.pathname === "/metode"`));

  // 17. alur cepat lagi untuk uji guard RESET
  await clickText("V60");
  await sleep(400);
  await clickText("Custom / Manual");
  await sleep(400);
  await evalJs(`
    const el = document.getElementById("origin");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, "Toraja");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    true;
  `);
  await clickText("Generate Resep");
  await sleep(1500);
  check("alur cepat: masuk recipe", await hasText("Kapan Tuang Air"));

  // 18. RESET dari recipe → beranda
  await evalJs(`[...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Reset")?.click()`);
  await sleep(400);
  check("reset ke beranda", await hasText("Mulai Seduh"));
  check("url / setelah reset", await evalJs(`location.pathname === "/"`));

  // 19. browser back setelah RESET: URL /seduh kedaluwarsa → tetap beranda
  await evalJs(`history.back()`);
  await sleep(500);
  check("back dari reset tidak white screen", await hasText("Mulai Seduh"));
  check("url kembali ke /", await evalJs(`location.pathname === "/"`));

  console.log();
  console.log(`=== ${failures.length} failures ===`);
  for (const f of failures) console.log(" -", f);
  ws.close();
  browser.kill();
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => { console.error("CRASH:", e.message); browser.kill(); process.exit(2); });
