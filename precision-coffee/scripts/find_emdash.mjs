import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function walk(dir, acc = []) {
  let ents;
  try {
    ents = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of ents) {
    if (name === "node_modules" || name === "__pycache__" || name === "dist" || name.startsWith(".")) continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, acc);
      else if (/\.(tsx|ts|py|md|html|css|ps1|json)$/i.test(name)) acc.push(p);
    } catch {
      /* skip */
    }
  }
  return acc;
}

let total = 0;
for (const f of walk(root)) {
  const c = readFileSync(f, "utf8");
  c.split(/\r?\n/).forEach((ln, i) => {
    if (ln.includes("—") || ln.includes("&mdash;") || ln.includes("&#8212;")) {
      total++;
      console.log(`${f.replace(root, ".")}:${i + 1}: ${ln.trim().slice(0, 110)}`);
    }
  });
}
console.log(total === 0 ? "BERSIH - 0 em-dash di source" : `\nTotal: ${total}`);
