import { describe, expect, it } from "vitest";
import { filterAuditRecords, paginateAuditRows, sortAuditEntries, sortAuditRows } from "./auditTable";

const rows = [
  ["08:31:06", "VOR-003", "Operator", "RANGE_CHECK_FAILED", "REJECTED"],
  ["08:42:19", "VOR-001", "Operator", "REQUEST_ACCEPTED", "ACCEPTED"],
  ["08:39:48", "VOR-002", "Supervisor", "APPROVAL_PENDING", "PENDING_OPERATOR"],
];

describe("audit table navigation", () => {
  it("sorts by any selected column in both directions without mutating input", () => {
    expect(sortAuditRows(rows, { index: 1, direction: "asc" }).map(row => row[1])).toEqual(["VOR-001", "VOR-002", "VOR-003"]);
    expect(sortAuditRows(rows, { index: 0, direction: "desc" }).map(row => row[0])).toEqual(["08:42:19", "08:39:48", "08:31:06"]);
    expect(rows[0][1]).toBe("VOR-003");
  });

  it("clamps requested pages and returns a truthful visible range", () => {
    const page = paginateAuditRows(rows, 4, 2);
    expect(page.page).toBe(2);
    expect(page.pageCount).toBe(2);
    expect(page.start).toBe(3);
    expect(page.end).toBe(3);
    expect(page.total).toBe(3);
    expect(page.rows).toEqual([rows[2]]);
  });

  it("supports request-list pagination with the same clamped contract", () => {
    const requestRows = Array.from({ length: 21 }, (_, index) => [`VOR-${String(index + 1).padStart(3, "0")}`, "08:00:00", "UC1", "Attack Reactor", "AIC-5214", "28.0", "PENDING_OPERATOR"]);
    const page = paginateAuditRows(requestRows, 99, 10);
    expect(page.page).toBe(3);
    expect(page.pageCount).toBe(3);
    expect(page.start).toBe(21);
    expect(page.end).toBe(21);
    expect(page.total).toBe(21);
  });

  it("preserves unique audit-event IDs when display values collide", () => {
    const entries = [
      { id: 41, values: ["2026-08-24 16:27:32", "SYSTEM", "7 / OPERATOR", "CATALOG_IMPORT / CONFIGURATION", "— → COMPLETED"] },
      { id: 42, values: ["2026-08-24 16:27:32", "SYSTEM", "7 / OPERATOR", "CATALOG_IMPORT / CONFIGURATION", "— → COMPLETED"] },
    ];
    const sorted = sortAuditEntries(entries, { index: 0, direction: "desc" });
    expect(sorted.map(entry => entry.id)).toEqual([41, 42]);
    expect(new Set(sorted.map(entry => entry.id)).size).toBe(sorted.length);
  });

  it("represents an empty result without an invalid range", () => {
    expect(paginateAuditRows([], 1, 10)).toMatchObject({ page: 1, pageCount: 1, start: 0, end: 0, total: 0, rows: [] });
  });

  it("filters audit records by independent fields and inclusive UTC dates", () => {
    const records = [
      { createdAt: new Date("2026-08-24T08:31:06Z"), requestId: 3, actorId: 7, actorRole: "operator", action: "RANGE_CHECK_FAILED", previousState: "PENDING_OPERATOR", newState: "REJECTED", result: "FAILED", reason: "Outside configured range" },
      { createdAt: new Date("2026-08-24T08:42:19Z"), requestId: 1, actorId: 8, actorRole: "supervisor", action: "REQUEST_ACCEPTED", previousState: "PENDING_OPERATOR", newState: "ACCEPTED", result: "COMMITTED", reason: "Approved" },
    ];
    expect(filterAuditRecords(records, { role: "operator", event: "RANGE_CHECK_FAILED", state: "REJECTED", requestId: "3", userId: "7", from: "2026-08-24", to: "2026-08-24" })).toEqual([records[0]]);
    expect(filterAuditRecords(records, { text: "approved", role: "ALL", event: "ALL", state: "ALL" })).toEqual([records[1]]);
  });
});
