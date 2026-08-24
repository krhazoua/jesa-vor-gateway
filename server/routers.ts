import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { approvals, auditEvents, requestHistory, validationChecks, vorRequests } from "../drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { getAnalyticsSeries, getDb, getRequestByRequestId, listAuditEvents, listPendingApprovals, listRequests, transitionRequest } from "./db";
import { assertFourEyes, assertRole, assertTransition, type Role, type VorStatus } from "./vor";

const roleProcedure = (allowed: readonly Role[]) => protectedProcedure.use(async ({ ctx, next }) => { assertRole(ctx.user.role, allowed); return next({ ctx }); });
const supervisorProcedure = roleProcedure(["supervisor", "engineer", "admin"]);
const engineerProcedure = roleProcedure(["engineer", "admin"]);
const adminProcedure = roleProcedure(["admin"]);
const analyticsFilterInput = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), department: z.enum(["ALL", "OPERATIONS", "MAINTENANCE", "PROCESS_CONTROL", "INSTRUMENTATION", "ELECTRICAL", "IT_OT_SECURITY"]).optional() }).optional();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  requests: router({
    list: protectedProcedure.input(z.object({ status: z.string().optional(), query: z.string().optional() }).optional()).query(async ({ input }) => { const rows = await listRequests(); const q = input?.query?.toLowerCase(); return rows.filter(row => (!input?.status || row.status === input.status) && (!q || `${row.requestId} ${row.sourceUc} ${row.sourceIdentity}`.toLowerCase().includes(q))); }),
    detail: protectedProcedure.input(z.object({ requestId: z.string() })).query(async ({ input }) => { const db = await getDb(); const request = await getRequestByRequestId(input.requestId); if (!db || !request) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" }); const checks = await db.select().from(validationChecks).where(eq(validationChecks.requestId, request.id)); const history = await db.select().from(requestHistory).where(eq(requestHistory.requestId, request.id)).orderBy(desc(requestHistory.createdAt)); return { request, checks, history }; }),
    transition: supervisorProcedure.input(z.object({ requestId: z.string(), toStatus: z.enum(["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"]), reason: z.string().min(3) })).mutation(async ({ input, ctx }) => { const request = await getRequestByRequestId(input.requestId); if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" }); assertTransition(request.status as VorStatus, input.toStatus); const updated = await transitionRequest(request.id, ctx.user.id, ctx.user.role, request.status as VorStatus, input.toStatus, input.reason, ctx.req.ip); return updated[0]; }),
  }),
  approvals: router({
    pending: supervisorProcedure.query(() => listPendingApprovals()),
    decide: supervisorProcedure.input(z.object({ approvalId: z.number().int().positive(), decision: z.enum(["APPROVED", "REJECTED"]), comment: z.string().min(3) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const approval = (await db.select().from(approvals).where(eq(approvals.id, input.approvalId)).limit(1))[0]; if (!approval) throw new TRPCError({ code: "NOT_FOUND", message: "Approval not found" }); assertFourEyes(approval.requesterId, ctx.user.id); if (approval.decision !== "PENDING") throw new TRPCError({ code: "CONFLICT", message: "Approval is already decided" }); const request = (await db.select().from(vorRequests).where(eq(vorRequests.id, approval.requestId)).limit(1))[0]; if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" }); const nextStatus = input.decision === "APPROVED" ? "ACCEPTED" : "REJECTED"; assertTransition(request.status as VorStatus, nextStatus); await db.transaction(async tx => { const approvalUpdate = await tx.update(approvals).set({ approverId: ctx.user.id, decision: input.decision, comment: input.comment, decidedAt: new Date() }).where(and(eq(approvals.id, input.approvalId), eq(approvals.decision, "PENDING"))) as unknown as { affectedRows: number }; if (approvalUpdate.affectedRows !== 1) throw new TRPCError({ code: "CONFLICT", message: "Approval was decided concurrently" }); const requestUpdate = await tx.update(vorRequests).set({ status: nextStatus }).where(and(eq(vorRequests.id, request.id), eq(vorRequests.status, request.status))) as unknown as { affectedRows: number }; if (requestUpdate.affectedRows !== 1) throw new TRPCError({ code: "CONFLICT", message: "Request state changed concurrently" }); await tx.insert(requestHistory).values({ requestId: request.id, actorId: ctx.user.id, fromStatus: request.status as VorStatus, toStatus: nextStatus, reason: input.comment }); await tx.insert(auditEvents).values({ requestId: request.id, actorId: ctx.user.id, actorRole: ctx.user.role, action: `APPROVAL_${input.decision}`, previousState: request.status, newState: nextStatus, result: "COMMITTED", reason: input.comment, module: "CPC", sourceIp: ctx.req.ip }); }); return { success: true, requestId: request.requestId, status: nextStatus }; }),
  }),
  validation: router({ list: engineerProcedure.input(z.object({ requestId: z.string().optional() }).optional()).query(async ({ input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (input?.requestId) { const request = await getRequestByRequestId(input.requestId); if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" }); return db.select().from(validationChecks).where(eq(validationChecks.requestId, request.id)); } return db.select().from(validationChecks).orderBy(desc(validationChecks.executedAt)).limit(200); }),
  }),
  audit: router({ list: engineerProcedure.query(() => listAuditEvents()) }),
  systemHealth: router({ summary: protectedProcedure.query(() => ({ zones: [{ module: "psM+O", status: "ONLINE" }, { module: "DMZ", status: "ONLINE" }, { module: "CPC", status: "ONLINE" }], dcs: { mode: "SIMULATOR", status: "ONLINE" }, generatedAt: new Date() })) }),
  analytics: router({ summary: engineerProcedure.input(analyticsFilterInput).query(async ({ input }) => { const rows = await listRequests(input); const series = await getAnalyticsSeries(input); const total = rows.length; return { total, accepted: rows.filter(row => row.status === "ACCEPTED").length, rejected: rows.filter(row => row.status === "REJECTED").length, pending: rows.filter(row => row.status === "PENDING_OPERATOR").length, duplicated: rows.filter(row => row.status === "DUPLICATED").length, expired: rows.filter(row => row.status === "EXPIRED").length, ...series }; }) }),
  configuration: router({ policy: adminProcedure.query(() => ({ statuses: ["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"], checks: ["EQUIPMENT_CHECK", "SIGNATURE_CHECK", "UNIT_CHECK", "DUPLICATE_CHECK", "TTL_CHECK", "RANGE_CHECK", "SIL_CHECK", "ROC_CHECK", "INTERLOCK_CHECK"], roles: ["operator", "supervisor", "engineer", "admin"] })) }),
});

export type AppRouter = typeof appRouter;
