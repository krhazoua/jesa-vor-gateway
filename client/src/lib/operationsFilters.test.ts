import { describe, expect, it } from "vitest";
import { filterAndSortOperations, type OperationRow } from "./operationsFilters";

const rows: OperationRow[] = [
  { id: "VOR-002", time: "08:05:00", createdAt: Date.parse("2026-08-25T08:05:00Z"), source: "UC2", variable: "Reactor Temperature", tag: "TIC-5210", current: "75", requested: "77", unit: "°C", uc: "UC2", status: "PENDING_OPERATOR", priority: "HIGH", sil: "SIL-1", delta: "+2", equipment: "ATTACK-REACTOR-01" },
  { id: "VOR-001", time: "08:00:00", createdAt: Date.parse("2026-08-25T08:00:00Z"), source: "UC1", variable: "Free Sulfate", tag: "AIC-5214", current: "27", requested: "28", unit: "g/L", uc: "UC1", status: "ACCEPTED", priority: "NORMAL", sil: "SIL-0", delta: "+1", equipment: "ATTACK-REACTOR-01" },
  { id: "VOR-003", time: "09:00:00", createdAt: Date.parse("2026-08-24T09:00:00Z"), source: "UC1", variable: "Slurry Solids", tag: "FIC-5218", current: "31", requested: "30", unit: "%", uc: "UC1", status: "REJECTED", priority: "CRITICAL", sil: "SIL-2", delta: "-1", equipment: "FLASH-COOLER-01" },
];

const allFilters = { query: "", status: "ALL", equipment: "ALL", variable: "ALL", priority: "ALL", uc: "ALL", fromDate: "", toDate: "" };

describe("Operations filters", () => {
  it("filters by canonical status, source UC, and date range", () => {
    const result = filterAndSortOperations(rows, { ...allFilters, status: "ACCEPTED", uc: "UC1", fromDate: "2026-08-25", toDate: "2026-08-25" }, "createdAt", "desc");
    expect(result.map(row => row.id)).toEqual(["VOR-001"]);
  });

  it("matches request, variable, and equipment terms through one search field", () => {
    const result = filterAndSortOperations(rows, { ...allFilters, query: "flash-cooler" }, "createdAt", "desc");
    expect(result.map(row => row.id)).toEqual(["VOR-003"]);
  });

  it("sorts priority by engineering urgency and uses request ID as a stable tie-breaker", () => {
    const result = filterAndSortOperations(rows, allFilters, "priority", "desc");
    expect(result.map(row => row.id)).toEqual(["VOR-003", "VOR-002", "VOR-001"]);
  });

  it("keeps newest-first ordering by default and returns no rows for unmatched filters", () => {
    expect(filterAndSortOperations(rows, allFilters, "createdAt", "desc").map(row => row.id)).toEqual(["VOR-002", "VOR-001", "VOR-003"]);
    expect(filterAndSortOperations(rows, { ...allFilters, variable: "Unknown" }, "createdAt", "desc")).toEqual([]);
  });
});
