export type ApprovalDecision = "APPROVED" | "REJECTED";

export function approvalDialogCopy(decision: ApprovalDecision) {
  return decision === "APPROVED"
    ? { eyebrow: "CONFIRM APPROVAL", title: "Approve request?", action: "CONFIRM APPROVAL", placeholder: "Optional approval note", requiresComment: false }
    : { eyebrow: "REJECTION REQUIRED", title: "Reject request?", action: "CONFIRM REJECTION", placeholder: "Required reason for rejection", requiresComment: true };
}

export const validationUnavailableCopy = {
  eyebrow: "NO CANONICAL EVIDENCE",
  title: "Validation results unavailable",
  body: "No persisted validation rows are available for the current authenticated session. The gateway does not infer PASS results without server evidence.",
} as const;

export function canSubmitApproval(decision: ApprovalDecision, comment: string) {
  return decision === "APPROVED" || comment.trim().length >= 3;
}
