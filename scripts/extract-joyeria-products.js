/**
 * Extrae productos oro y plata de urlaty/app/aliadas/joyeria/page.tsx
 * y genera data/aliada-joyeria.json. Ejecutar desde back_urlaty: node scripts/extract-joyeria-products.js
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fromCwd = join(process.cwd(), "..", "urlaty", "app", "aliadas", "joyeria", "page.tsx");
const fromScript = join(__dirname, "..", "..", "..", "urlaty", "app", "aliadas", "joyeria", "page.tsx");
const joyeriaPath = existsSync(fromCwd) ? fromCwd : fromScript;
const outPath = join(__dirname, "../data/aliada-joyeria.json");

const content = readFileSync(joyeriaPath, "utf-8");

function getTipo(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("cadena") && !n.includes("pulsera")) return "cadenas";
  if (n.includes("pulsera")) return "pulseras";
  if (n.includes("combo")) return "combos";
  if (n.includes("topos") || n.includes("arete")) return "topos-aretes";
  return "otros";
}

function extractProducts(sectionContent) {
  const products = [];
  const blockRegex = /\{\s*id:\s*(\d+)\s*,\s*name:\s*"((?:[^"\\]|\\.)*)"\s*,\s*price:\s*(\d+)\s*,\s*image:\s*(?:\s*\n\s*)*"([^"]*)"\s*,\s*description:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = blockRegex.exec(sectionContent)) !== null) {
    products.push({
      id: parseInt(m[1], 10),
      name: m[2].replace(/\\"/g, '"').trim(),
      price: parseInt(m[3], 10),
      image: m[4].trim(),
      description: m[5].replace(/\\"/g, '"').trim(),
    });
  }
  return products;
}

const goldStart = content.indexOf("const goldItems: Product[] = [");
const goldEnd = content.indexOf("];", goldStart) + 2;
const silverStart = content.indexOf("const silverItems: Product[] = [");
const silverEnd = content.indexOf("];", silverStart) + 2;

if (goldStart === -1 || silverStart === -1) {
  console.error("No se encontraron goldItems o silverItems");
  process.exit(1);
}

const goldSection = content.slice(goldStart, goldEnd);
const silverSection = content.slice(silverStart, silverEnd);

const goldProducts = extractProducts(goldSection);
const silverProducts = extractProducts(silverSection);

const result = [
  ...goldProducts.map((p) => ({ ...p, category: "oro", tipo: getTipo(p.name) })),
  ...silverProducts.map((p) => ({ ...p, category: "plata", tipo: getTipo(p.name) })),
];

writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
console.log("OK: " + goldProducts.length + " oro, " + silverProducts.length + " plata → " + outPath);
