export type SummaryNotification = {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
};

export type SummaryApproval = {
  id: number;
  requestId: string;
  equipmentName: string;
  variableName: string;
  requestedSp: string;
  unit: string;
  priority: string;
  createdAt: Date;
};

export function buildOperationsGovernanceSummary(notifications: SummaryNotification[], approvals: SummaryApproval[], canReviewApprovals: boolean) {
  const expiryAlerts = notifications.filter(item => item.type === "CERTIFICATE_EXPIRY").slice(0, 5).map(item => ({ id: item.id, severity: item.severity, title: item.title, message: item.message, readAt: item.readAt, createdAt: item.createdAt }));
  const pendingApprovals = canReviewApprovals ? approvals.slice(0, 5) : [];
  return {
    expiryAlerts,
    expiryAlertCount: expiryAlerts.length,
    pendingApprovals,
    pendingApprovalCount: canReviewApprovals ? pendingApprovals.length : null,
    approvalVisibility: canReviewApprovals ? "AUTHORIZED" as const : "ROLE_RESTRICTED" as const,
  };
}
