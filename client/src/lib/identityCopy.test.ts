import { describe, expect, it } from "vitest";
import { identityCopy, roleDisplay } from "./identityCopy";

describe("identity copy contract", () => {
  it("uses role-based operator identity without fictional names", () => {
    expect(identityCopy.operatorDisplay).toBe("Authenticated operator role");
    expect(identityCopy.operatorLabel).toContain("OPERATOR ROLE");
    expect(identityCopy.operatorDisplay).not.toMatch(/Shift|[A-Z][a-z]+ [A-Z][a-z]+/);
  });

  it("maps technical roles to clear operational labels", () => {
    expect(roleDisplay("admin")).toBe("VoR Administrator");
    expect(roleDisplay("engineer")).toBe("Process Engineer");
    expect(roleDisplay("operator")).toBe("Operator");
  });

  it("keeps sign-in copy neutral and provider-independent", () => {
    expect(identityCopy.signInDescription).toBe("Please sign in securely to continue");
    expect(identityCopy.signInAction).toBe("Secure sign-in");
    expect(`${identityCopy.signInDescription} ${identityCopy.signInAction}`).not.toMatch(/Manus|OAuth provider/i);
  });
});
