import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const assetsDir = join(process.cwd(), "dist", "public", "assets");
const budgets = {
  initial: 1_600_000,
  excelReport: 1_000_000,
  pdfReport: 450_000,
  html2canvas: 250_000,
  purify: 50_000,
};

const files = await readdir(assetsDir);
const entries = await Promise.all(files.map(async (file) => ({ file, bytes: (await stat(join(assetsDir, file))).size })));
const pick = (pattern) => entries.find((entry) => pattern.test(entry.file));
const initial = pick(/^index-[^/]+\.js$/);
const checks = [
  ["initial", initial],
  ["excelReport", pick(/^excelReport-[^/]+\.js$/)],
  ["pdfReport", pick(/^pdfReport-[^/]+\.js$/)],
  ["html2canvas", pick(/^html2canvas\.esm-[^/]+\.js$/)],
  ["purify", pick(/^purify\.es-[^/]+\.js$/)],
];

for (const [name, entry] of checks) {
  if (!entry) throw new Error(`Missing expected production asset for ${name}`);
  const limit = budgets[name];
  console.log(`${name}: ${entry.file} ${entry.bytes} bytes (budget ${limit})`);
  if (entry.bytes > limit) throw new Error(`${name} bundle budget exceeded by ${entry.bytes - limit} bytes`);
}

const initialText = await readFile(join(assetsDir, initial.file), "utf8");
for (const forbidden of ["exceljs", "jspdf", "html2canvas", "dompurify"]) {
  if (initialText.toLowerCase().includes(forbidden)) {
    throw new Error(`Initial bundle contains deferred dependency marker: ${forbidden}`);
  }
}
console.log("Bundle budgets passed; PDF and ExcelJS dependencies remain deferred.");
