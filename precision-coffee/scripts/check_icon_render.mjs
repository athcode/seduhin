// Sisipkan ikon dari MethodIcon.tsx ke icon_bbox.html lalu dump getBBox via Edge headless.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "../frontend/src/components/MethodIcon.tsx"), "utf8");

const parts = src.split(/\/\* ── (.+?)(?= \*\/)/);
const icons = [];
for (let i = 1; i < parts.length; i += 2) {
  const name = parts[i].split(":")[0].trim();
  let markup = parts[i + 1] ?? "";
  const end = markup.indexOf("),");
  if (end !== -1) markup = markup.slice(0, end);
  icons.push({ name, markup });
}

const cells = icons
  .map((i) => `<div class="cell" data-name="${i.name}"><svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#3C2A21" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${i.markup}</svg></div>`)
  .join("\n");

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>body{background:#F9F6F0;margin:0;font-family:monospace}.cell{display:inline-block}</style></head>
<body>
${cells}
<pre id="out">PENDING</pre>
<script>
const res = [];
document.querySelectorAll(".cell").forEach((cell) => {
  const s = cell.querySelector("svg");
  try {
    const b = s.getBBox();
    res.push({ name: cell.dataset.name, w: +b.width.toFixed(2), h: +b.height.toFixed(2), x: +b.x.toFixed(2), y: +b.y.toFixed(2) });
  } catch (e) { res.push({ name: cell.dataset.name, err: String(e) }); }
});
document.getElementById("out").textContent = "RESULT:" + JSON.stringify(res);
<\/script>
</body></html>`;

const outPath = join(__dirname, "icon_bbox.html");
writeFileSync(outPath, html);

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const r = spawnSync(edge, [
  "--headless", "--disable-gpu", "--no-sandbox",
  "--virtual-time-budget=2000",
  "--dump-dom",
  "file:///" + outPath.replace(/\\/g, "/"),
], { encoding: "utf8", maxBuffer: 1 << 26 });

const dom = r.stdout || "";
const idx = dom.indexOf("RESULT:");
if (idx === -1) {
  console.log("GAGAL: tidak ada RESULT. stdout:", r.stdout?.slice(0, 500), "stderr:", r.stderr?.slice(0, 500));
  process.exit(1);
}
const data = JSON.parse(dom.slice(idx + 7).split("</pre>")[0].trim());

let problems = 0;
for (const d of data) {
  if (d.err) { console.log(`ERROR  ${d.name}: ${d.err}`); problems++; continue; }
  const tiny = d.w < 4 || d.h < 4;
  // ikon wajar menempati sebagian besar viewBox 24x24
  const small = d.w < 10 && d.h < 10;
  if (tiny || small) { console.log(`SUSPECT ${d.name}: bbox ${d.w}x${d.h} @ (${d.x},${d.y})`); problems++; }
  else console.log(`OK    ${d.name}: ${d.w}x${d.h} @ (${d.x},${d.y})`);
}
console.log(problems === 0 ? "\nRENDER OK — semua ikon punya geometri wajar" : `\n${problems} ikon mencurigakan`);
