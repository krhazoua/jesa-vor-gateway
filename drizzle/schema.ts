import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["operator", "supervisor", "engineer", "admin"]).default("operator").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  tag: varchar("tag", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  processArea: varchar("processArea", { length: 120 }).notNull(),
  sourceRef: varchar("sourceRef", { length: 160 }).notNull(),
});

export const variables = mysqlTable("variables", {
  id: int("id").autoincrement().primaryKey(),
  tag: varchar("tag", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  variableType: mysqlEnum("variableType", ["PV", "SP", "MV", "CV", "DV"]).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  hardLow: decimal("hardLow", { precision: 16, scale: 4 }),
  hardHigh: decimal("hardHigh", { precision: 16, scale: 4 }),
  warningLow: decimal("warningLow", { precision: 16, scale: 4 }),
  warningHigh: decimal("warningHigh", { precision: 16, scale: 4 }),
  criticalLow: decimal("criticalLow", { precision: 16, scale: 4 }),
  criticalHigh: decimal("criticalHigh", { precision: 16, scale: 4 }),
  silClass: mysqlEnum("silClass", ["SIL-0", "SIL-1", "SIL-2", "SIL-3"]).notNull(),
  dcsMapping: varchar("dcsMapping", { length: 180 }).notNull(),
  sourceRef: varchar("sourceRef", { length: 160 }).notNull(),
});

export const vorRequests = mysqlTable("vorRequests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 64 }).notNull().unique(),
  sourceUc: varchar("sourceUc", { length: 16 }).notNull(),
  sourceIdentity: varchar("sourceIdentity", { length: 160 }).notNull(),
  department: varchar("department", { length: 64 }).default("OPERATIONS").notNull(),
  equipmentId: int("equipmentId").notNull(),
  variableId: int("variableId").notNull(),
  requesterId: int("requesterId").notNull(),
  currentPv: decimal("currentPv", { precision: 16, scale: 4 }).notNull(),
  requestedSp: decimal("requestedSp", { precision: 16, scale: 4 }).notNull(),
  priority: mysqlEnum("priority", ["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL").notNull(),
  ttlSeconds: int("ttlSeconds").notNull(),
  certificateSubject: varchar("certificateSubject", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"]).default("PENDING_OPERATOR").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ requesterIdx: index("vorRequests_requester_idx").on(table.requesterId), statusIdx: index("vorRequests_status_idx").on(table.status), requestIdIdx: uniqueIndex("vorRequests_requestId_idx").on(table.requestId) }));

export const validationChecks = mysqlTable("validationChecks", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  sequence: int("sequence").notNull(),
  checkType: mysqlEnum("checkType", ["EQUIPMENT_CHECK", "SIGNATURE_CHECK", "UNIT_CHECK", "DUPLICATE_CHECK", "TTL_CHECK", "RANGE_CHECK", "SIL_CHECK", "ROC_CHECK", "INTERLOCK_CHECK"]).notNull(),
  result: mysqlEnum("result", ["PASS", "FAIL", "WARNING", "NOT_EXECUTED", "REQUIRES_APPROVAL"]).notNull(),
  ruleId: varchar("ruleId", { length: 80 }).notNull(),
  actualValue: varchar("actualValue", { length: 255 }),
  expectedValue: varchar("expectedValue", { length: 255 }),
  explanation: text("explanation"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
}, table => ({ requestSeqIdx: uniqueIndex("validationChecks_request_seq_idx").on(table.requestId, table.sequence) }));

export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  requesterId: int("requesterId").notNull(),
  approverId: int("approverId"),
  decision: mysqlEnum("decision", ["PENDING", "APPROVED", "REJECTED"]).default("PENDING").notNull(),
  comment: text("comment"),
  decidedAt: timestamp("decidedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ approvalRequestIdx: index("approvals_request_idx").on(table.requestId), approvalDecisionIdx: index("approvals_decision_idx").on(table.decision) }));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  recipientId: int("recipientId").notNull(),
  requestId: int("requestId"),
  type: mysqlEnum("type", ["STATE_CHANGED", "APPROVAL_REQUIRED"]).notNull(),
  severity: mysqlEnum("severity", ["INFO", "WARNING", "CRITICAL"]).default("INFO").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ recipientIdx: index("notifications_recipient_idx").on(table.recipientId, table.createdAt), unreadIdx: index("notifications_unread_idx").on(table.recipientId, table.readAt) }));

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId"),
  actorId: int("actorId").notNull(),
  actorRole: varchar("actorRole", { length: 32 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  previousState: varchar("previousState", { length: 32 }),
  newState: varchar("newState", { length: 32 }),
  result: varchar("result", { length: 32 }).notNull(),
  reason: text("reason"),
  module: varchar("module", { length: 32 }).notNull(),
  certificateSubject: varchar("certificateSubject", { length: 255 }),
  sourceIp: varchar("sourceIp", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ auditRequestIdx: index("auditEvents_request_idx").on(table.requestId), auditCreatedIdx: index("auditEvents_created_idx").on(table.createdAt) }));

export const requestHistory = mysqlTable("requestHistory", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  actorId: int("actorId").notNull(),
  fromStatus: mysqlEnum("fromStatus", ["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"]),
  toStatus: mysqlEnum("toStatus", ["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"]).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ historyRequestIdx: index("requestHistory_request_idx").on(table.requestId) }));

export const processSnapshots = mysqlTable("processSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").notNull(),
  variableId: int("variableId").notNull(),
  pv: decimal("pv", { precision: 16, scale: 4 }).notNull(),
  interlockActive: int("interlockActive").default(0).notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type VorRequest = typeof vorRequests.$inferSelect;
export type ValidationCheck = typeof validationChecks.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
