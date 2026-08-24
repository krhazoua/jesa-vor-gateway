import { describe, expect, it } from "vitest";
import { paginateAuditRows, sortAuditRows } from "./auditTable";

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

  it("represents an empty result without an invalid range", () => {
    expect(paginateAuditRows([], 1, 10)).toMatchObject({ page: 1, pageCount: 1, start: 0, end: 0, total: 0, rows: [] });
  });
});
