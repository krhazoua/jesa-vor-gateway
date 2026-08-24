import { TRPCError } from "@trpc/server";

export const VOR_STATUSES = ["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"] as const;
export type VorStatus = typeof VOR_STATUSES[number];
export const ROLES = ["operator", "supervisor", "engineer", "admin"] as const;
export type Role = typeof ROLES[number];
export function assertAppendOnlyAuditAction(action: string) { if (/^(UPDATE|DELETE|TRUNCATE|PURGE)/i.test(action)) throw new TRPCError({ code: "FORBIDDEN", message: "Audit storage is append-only" }); }

export const CHECKS = ["EQUIPMENT_CHECK", "SIGNATURE_CHECK", "UNIT_CHECK", "DUPLICATE_CHECK", "TTL_CHECK", "RANGE_CHECK", "SIL_CHECK", "ROC_CHECK", "INTERLOCK_CHECK"] as const;

const transitions: Record<VorStatus, readonly VorStatus[]> = {
  PENDING_OPERATOR: ["ACCEPTED", "REJECTED", "EXPIRED", "DUPLICATED"],
  ACCEPTED: [], REJECTED: [], DUPLICATED: [], EXPIRED: [],
};

export function assertTransition(from: VorStatus, to: VorStatus) {
  if (!transitions[from]?.includes(to)) {
    throw new TRPCError({ code: "CONFLICT", message: `Illegal VoR transition ${from} → ${to}` });
  }
}

export function assertRole(role: string, allowed: readonly Role[]) {
  if (!allowed.includes(role as Role)) throw new TRPCError({ code: "FORBIDDEN", message: "Role is not authorized for this operation" });
}

export function assertFourEyes(requesterId: number, approverId: number) {
  if (requesterId === approverId) throw new TRPCError({ code: "FORBIDDEN", message: "Four-eyes rule: requester cannot approve their own request" });
}

export type ValidationInput = { equipmentExists: boolean; signatureValid: boolean; unitValid: boolean; duplicate: boolean; expiresAt: number; now: number; requestedValue: number; hardLow: number | null; hardHigh: number | null; silClass: string; requiresApproval: boolean; rocWithinLimit: boolean; interlockActive: boolean };
export type ValidationResult = { checkType: typeof CHECKS[number]; result: "PASS" | "FAIL" | "WARNING" | "NOT_EXECUTED" | "REQUIRES_APPROVAL"; ruleId: string; actualValue: string; expectedValue: string; explanation: string }[];

export function assertPropagationAllowed(status: VorStatus, validation: ValidationResult) {
  if (status !== "ACCEPTED") throw new TRPCError({ code: "FORBIDDEN", message: "Propagation blocked until the request is accepted" });
  if (!validation.length || validation.some(check => ["FAIL", "NOT_EXECUTED", "REQUIRES_APPROVAL"].includes(check.result))) throw new TRPCError({ code: "FORBIDDEN", message: "Propagation blocked by validation evidence" });
  return true;
}

export type DcsAcknowledgment = { requestId: string; adapter: "DCS_SIMULATOR"; status: "ACKNOWLEDGED"; acknowledgedAt: Date };
export function createDcsAcknowledgment(requestId: string, status: VorStatus, validation: ValidationResult, acknowledgedAt = new Date()): DcsAcknowledgment {
  assertPropagationAllowed(status, validation);
  return { requestId, adapter: "DCS_SIMULATOR", status: "ACKNOWLEDGED", acknowledgedAt };
}

export function validateRequest(input: ValidationInput): ValidationResult {
  const result: ValidationResult = [];
  const add = (checkType: typeof CHECKS[number], ok: boolean, actualValue: string, expectedValue: string, explanation: string, warning = false) => { result.push({ checkType, result: ok ? (warning ? "WARNING" : "PASS") : "FAIL", ruleId: `VOR.RULE.${String(result.length + 1).padStart(2, "0")}`, actualValue, expectedValue, explanation }); return ok; };
  if (!add("EQUIPMENT_CHECK", input.equipmentExists, String(input.equipmentExists), "true", "Canonical equipment reference must resolve.")) return result;
  if (!add("SIGNATURE_CHECK", input.signatureValid, String(input.signatureValid), "true", "Request signature and certificate subject must be valid.")) return result;
  if (!add("UNIT_CHECK", input.unitValid, String(input.unitValid), "true", "Engineering unit must match canonical variable.")) return result;
  if (!add("DUPLICATE_CHECK", !input.duplicate, String(input.duplicate), "false", "Request identity must not already exist.")) return result;
  if (!add("TTL_CHECK", input.now <= input.expiresAt, String(input.now), `≤ ${input.expiresAt}`, "Request must remain within its configured TTL.")) return result;
  const inRange = (input.hardLow === null || input.requestedValue >= input.hardLow) && (input.hardHigh === null || input.requestedValue <= input.hardHigh);
  if (!add("RANGE_CHECK", inRange, String(input.requestedValue), `${input.hardLow ?? "MISSING"}…${input.hardHigh ?? "MISSING"}`, "Requested setpoint must remain within hard engineering limits.")) return result;
  const silOk = input.silClass !== "SIL-1" || input.requiresApproval;
  if (!add("SIL_CHECK", silOk, input.silClass, input.requiresApproval ? "approval required" : "no approval", "SIL-1 requests require an independent approval.")) return result;
  if (!add("ROC_CHECK", input.rocWithinLimit, String(input.rocWithinLimit), "true", "Rate-of-change must remain within the canonical rule.")) return result;
  if (!add("INTERLOCK_CHECK", !input.interlockActive, String(input.interlockActive), "false", "No active process interlock may be bypassed.")) return result;
  if (input.requiresApproval) result[result.length - 1] = { ...result[result.length - 1], result: "REQUIRES_APPROVAL" };
  return result;
}
