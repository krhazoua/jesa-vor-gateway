import type { ReportDefinition } from "./reportExport";

export type AuditExportRecord = {
  id: number;
  createdAt: Date;
  requestId: number | null;
  actorId: number;
  actorRole: string;
  action: string;
  previousState: string | null;
  newState: string | null;
  result: string;
  reason?: string | null;
  module: string;
  certificateSubject?: string | null;
  sourceIp?: string | null;
};

export function buildAuditReport(records: AuditExportRecord[], generatedAt = new Date()): ReportDefinition {
  return {
    filename: `jesa-vor-audit-${generatedAt.toISOString().slice(0, 10)}`,
    title: "JESA VoR Gateway — Audit trail",
    metadata: {
      Source: "Canonical DB / read-only",
      Generated: generatedAt.toISOString(),
      ExportedRows: String(records.length),
      Boundary: "Read-only edge adapter · no plant write path",
    },
    sections: [{
      title: "Audit events",
      columns: [
        "Event ID",
        "Timestamp (UTC)",
        "Request",
        "Actor ID",
        "Actor role",
        "Action",
        "Module",
        "Previous state",
        "New state",
        "Result",
        "Reason",
        "Certificate subject",
        "Source IP",
      ],
      rows: records.map(record => [
        record.id,
        record.createdAt.toISOString(),
        record.requestId == null ? "SYSTEM" : String(record.requestId),
        record.actorId,
        record.actorRole,
        record.action,
        record.module,
        record.previousState ?? "",
        record.newState ?? "",
        record.result,
        record.reason ?? "",
        record.certificateSubject ?? "",
        record.sourceIp ?? "",
      ]),
    }],
  };
}
