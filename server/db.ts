import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { approvals, auditEvents, equipment, InsertUser, requestHistory, users, variables, vorRequests } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { assertAppendOnlyAuditAction, type VorStatus } from "./vor";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) throw new Error("Database is required for authenticated operations");
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "operator"), active: user.active ?? 1 };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn } });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function listRequests() { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(vorRequests).orderBy(desc(vorRequests.createdAt)); }
export async function getRequestByRequestId(requestId: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.select().from(vorRequests).where(eq(vorRequests.requestId, requestId)).limit(1); return result[0]; }
export async function listPendingApprovals() { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(approvals).where(eq(approvals.decision, "PENDING")).orderBy(desc(approvals.createdAt)); }
export async function listAuditEvents() { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(200); }
export async function getEngineeringCatalog() { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return { equipment: await db.select().from(equipment), variables: await db.select().from(variables) }; }
export async function recordAudit(event: typeof auditEvents.$inferInsert) { assertAppendOnlyAuditAction(event.action); const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(auditEvents).values(event); }
export async function transitionRequest(requestId: number, actorId: number, actorRole: string, fromStatus: VorStatus, toStatus: VorStatus, reason: string, sourceIp?: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async tx => { const updated = await tx.update(vorRequests).set({ status: toStatus }).where(and(eq(vorRequests.id, requestId), eq(vorRequests.status, fromStatus))); if (!updated[0] || ("affectedRows" in updated[0] && updated[0].affectedRows !== 1)) throw new Error("Concurrent request state change detected"); await tx.insert(requestHistory).values({ requestId, actorId, fromStatus, toStatus, reason }); await tx.insert(auditEvents).values({ requestId, actorId, actorRole, action: "REQUEST_STATE_TRANSITION", previousState: fromStatus, newState: toStatus, result: "COMMITTED", reason, module: "DMZ", sourceIp }); return tx.select().from(vorRequests).where(eq(vorRequests.id, requestId)).limit(1); }); }
