import { describe, expect, it } from "vitest";
import { isConfigurationGovernanceAuditAction } from "./configurationAudit";

describe("configuration governance audit allowlist", () => {
  it("includes trust and authorization evidence actions", () => {
    expect(isConfigurationGovernanceAuditAction("TRUST_ANCHOR_ROTATED")).toBe(true);
    expect(isConfigurationGovernanceAuditAction("TRUST_ANCHOR_RETIRED")).toBe(true);
    expect(isConfigurationGovernanceAuditAction("AUTHORITATIVE_MASTER_ARMED")).toBe(true);
    expect(isConfigurationGovernanceAuditAction("ADAPTER_ACTIVATION_READY")).toBe(true);
  });

  it("excludes unrelated request activity", () => {
    expect(isConfigurationGovernanceAuditAction("REQUEST_CREATED")).toBe(false);
    expect(isConfigurationGovernanceAuditAction("LOGIN")).toBe(false);
  });
});
