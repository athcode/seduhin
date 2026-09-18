// Validasi geometri ikon SVG: parse semua path d="..." di MethodIcon.tsx,
// flatten ke titik, lalu cek bounding box ada di dalam viewBox 24x24.
import { readFileSync } from "node:fs";

const src = readFileSync(
  new URL("../frontend/src/components/MethodIcon.tsx", import.meta.url),
  "utf8",
);

const pathRe = /<path[^>]*\bd="([^"]+)"/g;
const ellipseRe = /<ellipse[^>]*>/g;
const num = /-?\d*\.?\d+/g;

let problems = 0;
let count = 0;

function checkRange(label, x, y) {
  count++;
  const out = x < -0.6 || x > 24.6 || y < -0.6 || y > 24.6;
  if (out) {
    problems++;
    console.log(`OUT-OF-BOUNDS ${label}: x=${x.toFixed(2)} y=${y.toFixed(2)}`);
  }
}

let m;
while ((m = pathRe.exec(src))) {
  const d = m[1];
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g);
  let cmd = "M";
  const pts = [];
  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i];
    if (/[a-zA-Z]/.test(t)) {
      cmd = t;
      i++;
      continue;
    }
    const arity = { M: 2, L: 2, H: 1, V: 1, l: 2, h: 1, v: 1, C: 6, c: 6, Q: 4, q: 4, T: 2, t: 2, A: 7, a: 7, Z: 0, z: 0 }[cmd] ?? 0;
    if (arity === 0) {
      i++;
      continue;
    }
    const args = tokens.slice(i, i + arity).map(Number);
    i += arity;
    const rel = cmd === cmd.toLowerCase() && cmd !== cmd.toUpperCase() ? cmd.toLowerCase() === cmd : false;
    pts.push({ cmd, args, rel });
  }
  // flatten absolute-only (ikon semua absolute kecuali arc relatif a)
  let x = 0,
    y = 0;
  for (const p of pts) {
    const c = p.cmd;
    const a = p.args;
    if (c === "M" || c === "L") {
      x = a[0];
      y = a[1];
      checkRange(`${c}`, x, y);
    } else if (c === "H") {
      x = a[0];
      checkRange("H", x, y);
    } else if (c === "V") {
      y = a[0];
      checkRange("V", x, y);
    } else if (c === "C") {
      checkRange("C1", a[0], a[1]);
      checkRange("C2", a[2], a[3]);
      x = a[4];
      y = a[5];
      checkRange("C-end", x, y);
    } else if (c === "Q") {
      checkRange("Q-ctl", a[0], a[1]);
      x = a[2];
      y = a[3];
      checkRange("Q-end", x, y);
    } else if (c === "T") {
      x = a[0];
      y = a[1];
      checkRange("T-end", x, y);
    } else if (c === "A" || c === "a") {
      if (c === "A") {
        x = a[5];
        y = a[6];
      } else {
        x += a[5];
        y += a[6];
      }
      checkRange("A-end", x, y);
    } else if (c === "h" || c === "v" || c === "l" || c === "c" || c === "q" || c === "t") {
      // relatif: lompat ke endpoint untuk tracking
      if (c === "h") x += a[0];
      else if (c === "v") y += a[0];
      else if (c === "l") { x += a[0]; y += a[1]; }
      else if (c === "c") { x += a[4]; y += a[5]; }
      else if (c === "q") { x += a[2]; y += a[3]; }
      else if (c === "t") { x += a[0]; y += a[1]; }
      checkRange(`${c}-end(rel)`, x, y);
    }
  }
}

let e;
while ((e = ellipseRe.exec(src))) {
  const tag = e[0];
  const cx = parseFloat(tag.match(/cx="([^"]+)"/)?.[1] ?? "0");
  const cy = parseFloat(tag.match(/cy="([^"]+)"/)?.[1] ?? "0");
  const rx = parseFloat(tag.match(/rx="([^"]+)"/)?.[1] ?? "0");
  const ry = parseFloat(tag.match(/ry="([^"]+)"/)?.[1] ?? "0");
  checkRange("ellipse-left", cx - rx, cy);
  checkRange("ellipse-right", cx + rx, cy);
  checkRange("ellipse-top", cx, cy - ry);
  checkRange("ellipse-bottom", cx, cy + ry);
}

console.log(`\nCek ${count} titik -> ${problems} out-of-bounds`);
console.log(problems === 0 ? "GEOMETRI OK" : "ADA MASALAH GEOMETRI");
