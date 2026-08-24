export const identityCopy = {
  operatorDisplay: "Authenticated operator role",
  operatorLabel: "OPERATOR ROLE · AUTHENTICATED",
  requesterRole: "Operator",
  sessionStatus: "Server-authenticated session",
  sessionToast: "Session is authenticated by the server and bound to the active user role.",
  signInDescription: "Please sign in securely to continue",
  signInAction: "Secure sign-in",
} as const;

export const roleDisplay = (role: string) => ({
  admin: "VoR Administrator",
  engineer: "Process Engineer",
  supervisor: "Supervisor",
  operator: "Operator",
  user: "Operator",
}[role.toLowerCase()] || role);
