export const MAX_CSV_BYTES = 1_000_000;
export const MAX_CSV_ROWS = 2_000;

export type CatalogRecordType = "EQUIPMENT" | "VARIABLE";
export type EquipmentImportRow = { tag: string; name: string; processArea: string; sourceRef: string };
export type VariableImportRow = { tag: string; name: string; variableType: "PV" | "SP" | "MV" | "CV" | "DV"; unit: string; hardLow: string | null; hardHigh: string | null; warningLow: string | null; warningHigh: string | null; criticalLow: string | null; criticalHigh: string | null; silClass: "SIL-0" | "SIL-1" | "SIL-2" | "SIL-3"; dcsMapping: string; sourceRef: string };
export type CatalogImportRow = EquipmentImportRow | VariableImportRow;
export type CatalogImportParseResult = { recordType: CatalogRecordType; headers: string[]; rows: CatalogImportRow[]; errors: Array<{ row: number; message: string }>; rowCount: number };
export type CatalogDiff = { status: "MATCHED" | "MISMATCH" | "BLOCKED"; fatSatGate: "BLOCKED" | "PENDING_EXTERNAL_SIGNOFF"; matchedCount: number; addedCount: number; changedCount: number; removedCount: number; differences: Array<{ tag: string; kind: "ADDED" | "CHANGED" | "REMOVED" | "SOURCE_MISMATCH"; details: string }> };

function comparableRow(row: CatalogImportRow) {
  const fields = ["tag", "name", "processArea", "variableType", "unit", "hardLow", "hardHigh", "warningLow", "warningHigh", "criticalLow", "criticalHigh", "silClass", "dcsMapping", "sourceRef"];
  return JSON.stringify(Object.fromEntries(fields.filter(field => field in row).map(field => [field, (row as Record<string, unknown>)[field]])));
}

export function diffCatalogRows(recordType: CatalogRecordType, incomingRows: CatalogImportRow[], existingRows: CatalogImportRow[], authoritySourceRef: string): CatalogDiff {
  const differences: CatalogDiff["differences"] = [];
  if (incomingRows.some(row => row.sourceRef !== authoritySourceRef)) differences.push({ tag: "SOURCE", kind: "SOURCE_MISMATCH", details: "Every imported row must declare the selected authoritative source reference." });
  const incoming = new Map(incomingRows.map(row => [row.tag.toUpperCase(), row]));
  const existing = new Map(existingRows.map(row => [row.tag.toUpperCase(), row]));
  let matchedCount = 0;
  incoming.forEach((row, key) => {
    const current = existing.get(key);
    if (!current) differences.push({ tag: row.tag, kind: "ADDED", details: `${recordType} tag is present in the authority file but absent from the canonical catalog.` });
    else if (comparableRow(row) === comparableRow(current)) matchedCount += 1;
    else differences.push({ tag: row.tag, kind: "CHANGED", details: `${recordType} canonical values differ from the authority file.` });
  });
  existing.forEach((row, key) => { if (!incoming.has(key)) differences.push({ tag: row.tag, kind: "REMOVED", details: `${recordType} tag is present in the canonical catalog but absent from the authority file.` }); });
  const addedCount = differences.filter(diff => diff.kind === "ADDED").length;
  const changedCount = differences.filter(diff => diff.kind === "CHANGED").length;
  const removedCount = differences.filter(diff => diff.kind === "REMOVED").length;
  const blocked = differences.some(diff => diff.kind === "SOURCE_MISMATCH");
  const status = blocked ? "BLOCKED" : differences.length ? "MISMATCH" : "MATCHED";
  return { status, fatSatGate: status === "MATCHED" ? "PENDING_EXTERNAL_SIGNOFF" : "BLOCKED", matchedCount, addedCount, changedCount, removedCount, differences };
}

const EQUIPMENT_HEADERS = ["tag", "name", "processArea", "sourceRef"] as const;
const VARIABLE_HEADERS = ["tag", "name", "variableType", "unit", "hardLow", "hardHigh", "warningLow", "warningHigh", "criticalLow", "criticalHigh", "silClass", "dcsMapping", "sourceRef"] as const;
const VARIABLE_TYPES = new Set(["PV", "SP", "MV", "CV", "DV"]);
const SIL_CLASSES = new Set(["SIL-0", "SIL-1", "SIL-2", "SIL-3"]);

function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { row.push(cell.trim()); cell = ""; continue; }
    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim()); cell = "";
      if (row.some(value => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += character;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  row.push(cell.trim());
  if (row.some(value => value.length > 0)) rows.push(row);
  return rows;
}

function textField(value: string | undefined, label: string, max: number): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized) return `${label} is required`;
  if (normalized.length > max) return `${label} exceeds ${max} characters`;
  return null;
}

function numericField(value: string | undefined, label: string): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? null : `${label} must be numeric`;
}

function duplicateErrors(rows: Array<{ tag: string }>, rowOffset: number) {
  const seen = new Map<string, number>();
  return rows.flatMap((row, index) => {
    const key = row.tag.toUpperCase();
    const previous = seen.get(key);
    seen.set(key, rowOffset + index);
    return previous ? [{ row: rowOffset + index, message: `Duplicate tag ${row.tag}; first declared on row ${previous}` }] : [];
  });
}

export function parseCatalogCsv(recordType: CatalogRecordType, source: string): CatalogImportParseResult {
  const byteLength = Buffer.byteLength(source, "utf8");
  if (byteLength === 0) return { recordType, headers: [], rows: [], errors: [{ row: 1, message: "CSV file is empty" }], rowCount: 0 };
  if (byteLength > MAX_CSV_BYTES) return { recordType, headers: [], rows: [], errors: [{ row: 1, message: `CSV exceeds the ${MAX_CSV_BYTES} byte limit` }], rowCount: 0 };
  let matrix: string[][];
  try { matrix = splitCsv(source.replace(/^\uFEFF/, "")); } catch (error) { return { recordType, headers: [], rows: [], errors: [{ row: 1, message: error instanceof Error ? error.message : "CSV could not be parsed" }], rowCount: 0 }; }
  const expected = recordType === "EQUIPMENT" ? EQUIPMENT_HEADERS : VARIABLE_HEADERS;
  const headers = (matrix.shift() ?? []).map(header => header.trim());
  if (headers.join(",") !== expected.join(",")) return { recordType, headers, rows: [], errors: [{ row: 1, message: `Expected headers: ${expected.join(",")}` }], rowCount: Math.max(matrix.length, 0) };
  const errors: Array<{ row: number; message: string }> = [];
  if (matrix.length === 0) errors.push({ row: 2, message: "CSV contains headers but no data rows" });
  if (matrix.length > MAX_CSV_ROWS) errors.push({ row: 1, message: `CSV contains ${matrix.length} rows; maximum is ${MAX_CSV_ROWS}` });
  const rows: CatalogImportRow[] = [];
  matrix.slice(0, MAX_CSV_ROWS).forEach((values, index) => {
    const rowNumber = index + 2;
    if (values.length !== expected.length) { errors.push({ row: rowNumber, message: `Expected ${expected.length} columns but found ${values.length}` }); return; }
    const record = Object.fromEntries(expected.map((header, headerIndex) => [header, values[headerIndex] ?? ""])) as Record<string, string>;
    const requiredFields = recordType === "EQUIPMENT" ? [["tag", 64], ["name", 160], ["processArea", 120], ["sourceRef", 160]] : [["tag", 64], ["name", 160], ["unit", 32], ["dcsMapping", 180], ["sourceRef", 160]];
    requiredFields.forEach(([field, max]) => { const issue = textField(record[field as string], field as string, max as number); if (issue) errors.push({ row: rowNumber, message: issue }); });
    if (recordType === "EQUIPMENT") rows.push({ tag: record.tag.trim(), name: record.name.trim(), processArea: record.processArea.trim(), sourceRef: record.sourceRef.trim() });
    else {
      if (!VARIABLE_TYPES.has(record.variableType)) errors.push({ row: rowNumber, message: "variableType must be PV, SP, MV, CV, or DV" });
      if (!SIL_CLASSES.has(record.silClass)) errors.push({ row: rowNumber, message: "silClass must be SIL-0, SIL-1, SIL-2, or SIL-3" });
      ["hardLow", "hardHigh", "warningLow", "warningHigh", "criticalLow", "criticalHigh"].forEach(field => { const issue = numericField(record[field], field); if (issue) errors.push({ row: rowNumber, message: issue }); });
      rows.push({ tag: record.tag.trim(), name: record.name.trim(), variableType: record.variableType as VariableImportRow["variableType"], unit: record.unit.trim(), hardLow: record.hardLow.trim() || null, hardHigh: record.hardHigh.trim() || null, warningLow: record.warningLow.trim() || null, warningHigh: record.warningHigh.trim() || null, criticalLow: record.criticalLow.trim() || null, criticalHigh: record.criticalHigh.trim() || null, silClass: record.silClass as VariableImportRow["silClass"], dcsMapping: record.dcsMapping.trim(), sourceRef: record.sourceRef.trim() });
    }
  });
  errors.push(...duplicateErrors(rows, 2));
  return { recordType, headers, rows, errors, rowCount: matrix.length };
}

export function csvTemplate(recordType: CatalogRecordType) {
  return recordType === "EQUIPMENT" ? "tag,name,processArea,sourceRef\nATTACK-REACTOR-01,Attack Reactor,ATTACK_REACTOR,PAP-ENG-REF" : "tag,name,variableType,unit,hardLow,hardHigh,warningLow,warningHigh,criticalLow,criticalHigh,silClass,dcsMapping,sourceRef\nTIC-5210,Reactor Temperature,PV,°C,71,80,72,79,70,81,SIL-0,DCS.PAP.ATTACK.TIC5210,PAP-ENG-REF";
}
