import { describe, expect, it } from "vitest";
import { approvalDialogCopy, canSubmitApproval, validationUnavailableCopy } from "./workflowCopy";

describe("workflow presentation contract", () => {
  it("requires an explicit reason before rejection can be committed", () => {
    expect(canSubmitApproval("REJECTED", "  ")).toBe(false);
    expect(canSubmitApproval("REJECTED", "Range outside hard limit")).toBe(true);
    expect(canSubmitApproval("APPROVED", "")).toBe(true);
  });

  it("keeps approval and rejection confirmation language distinct", () => {
    expect(approvalDialogCopy("APPROVED")).toMatchObject({ eyebrow: "CONFIRM APPROVAL", action: "CONFIRM APPROVAL", requiresComment: false });
    expect(approvalDialogCopy("REJECTED")).toMatchObject({ eyebrow: "REJECTION REQUIRED", action: "CONFIRM REJECTION", requiresComment: true });
  });

  it("states that validation cannot be inferred without canonical evidence", () => {
    expect(validationUnavailableCopy.body).toMatch(/does not infer PASS/);
  });
});
