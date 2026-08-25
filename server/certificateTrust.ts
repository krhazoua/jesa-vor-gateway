import { X509Certificate } from "node:crypto";

export type CertificateChainStatus = "VALID" | "INVALID" | "TRUST_STORE_MISSING";
export type TrustAnchor = { subject: string; fingerprint: string; status: "ACTIVE" | "REVOKED" | "RETIRED"; expiresAt?: Date | string | null };
export type CertificateExpiryState = "VALID" | "EXPIRING_SOON" | "CRITICAL" | "EXPIRED" | "UNKNOWN";

function normalizeFingerprint(value: string) { return value.replace(/[^a-fA-F0-9]/g, "").toUpperCase(); }
function parseCertificates(data: Buffer) {
  const pem = data.toString("utf8");
  const blocks = Array.from(pem.matchAll(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g)).map(match => match[0]);
  if (!blocks.length) return [new X509Certificate(data)];
  return blocks.map(block => new X509Certificate(block));
}
function validity(certificate: X509Certificate) { return { validFrom: new Date(certificate.validFrom).toISOString(), expiresAt: new Date(certificate.validTo).toISOString() }; }

export function evaluateCertificateExpiry(expiresAt: Date | string | null | undefined, warningDays: number, criticalDays: number, now = new Date()): { state: CertificateExpiryState; daysRemaining: number | null; message: string } {
  if (!expiresAt || !Number.isFinite(warningDays) || !Number.isFinite(criticalDays) || warningDays < criticalDays || criticalDays < 0) return { state: "UNKNOWN", daysRemaining: null, message: "Certificate validity window is unavailable." };
  const expires = new Date(expiresAt).getTime();
  if (!Number.isFinite(expires)) return { state: "UNKNOWN", daysRemaining: null, message: "Certificate expiry timestamp is invalid." };
  const daysRemaining = Math.ceil((expires - now.getTime()) / 86_400_000);
  if (daysRemaining < 0) return { state: "EXPIRED", daysRemaining, message: "Certificate is expired and must not be accepted." };
  if (daysRemaining <= criticalDays) return { state: "CRITICAL", daysRemaining, message: `Certificate expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}; rotation is critical.` };
  if (daysRemaining <= warningDays) return { state: "EXPIRING_SOON", daysRemaining, message: `Certificate expires in ${daysRemaining} days; plan trust-anchor rotation.` };
  return { state: "VALID", daysRemaining, message: "Certificate is outside the configured warning window." };
}

export function validateExpiryPolicy(warningDays: number, criticalDays: number) { return Number.isInteger(warningDays) && Number.isInteger(criticalDays) && criticalDays >= 0 && warningDays >= criticalDays && warningDays <= 3650; }
export function canRetireTrustAnchor(args: { anchorStatus: TrustAnchor["status"]; replacementStatus: TrustAnchor["status"]; hasVerifiedRotation: boolean; replacementExpiresAt?: Date | string | null; now?: number }) { const replacementExpiry = args.replacementExpiresAt ? new Date(args.replacementExpiresAt).getTime() : null; return args.anchorStatus === "ACTIVE" && args.replacementStatus === "ACTIVE" && args.hasVerifiedRotation && (replacementExpiry === null || replacementExpiry > (args.now ?? Date.now())); }

export function validateTrustAnchor(data: Buffer, fingerprint: string) {
  try {
    const certificates = parseCertificates(data);
    const root = certificates[certificates.length - 1];
    const fingerprintMatches = normalizeFingerprint(root.fingerprint256) === normalizeFingerprint(fingerprint);
    const selfSigned = root.checkIssued(root) && root.verify(root.publicKey);
    return { valid: fingerprintMatches && selfSigned, fingerprint: root.fingerprint256, ...validity(root), reason: !fingerprintMatches ? "Submitted fingerprint does not match the trust-anchor certificate." : !selfSigned ? "Trust anchor must be self-signed." : "Trust anchor accepted." };
  } catch {
    return { valid: false, fingerprint, validFrom: null, expiresAt: null, reason: "Trust-anchor file is not a parseable X.509 certificate." };
  }
}

export function hasDualIndependentApproval(signoffs: Array<{ actorId: number; decision: "APPROVED" | "REJECTED"; chainStatus: CertificateChainStatus }>) { return new Set(signoffs.filter(signoff => signoff.decision === "APPROVED" && signoff.chainStatus === "VALID").map(signoff => signoff.actorId)).size >= 2; }

export function validateCertificateChain(data: Buffer, leafFingerprint: string, anchors: TrustAnchor[]) {
  try {
    const certificates = parseCertificates(data);
    const leaf = certificates[0];
    const leafValidity = validity(leaf);
    const now = Date.now();
    if (now < new Date(leafValidity.validFrom).getTime()) return { status: "INVALID" as const, ...leafValidity, reason: "Certificate is not yet valid." };
    if (now >= new Date(leafValidity.expiresAt).getTime()) return { status: "INVALID" as const, ...leafValidity, reason: "Certificate is expired and cannot be accepted." };
    if (normalizeFingerprint(leaf.fingerprint256) !== normalizeFingerprint(leafFingerprint)) return { status: "INVALID" as const, ...leafValidity, reason: "Certificate fingerprint does not match the uploaded leaf certificate." };
    const activeAnchors = anchors.filter(anchor => anchor.status === "ACTIVE" && (!anchor.expiresAt || new Date(anchor.expiresAt).getTime() > Date.now()));
    const anchor = activeAnchors.find(item => certificates.some(certificate => normalizeFingerprint(certificate.fingerprint256) === normalizeFingerprint(item.fingerprint)));
    if (!anchor) return { status: "TRUST_STORE_MISSING" as const, ...leafValidity, reason: "No active approved trust anchor matches the uploaded certificate chain." };
    const targetFingerprint = normalizeFingerprint(anchor.fingerprint);
    let current = leaf;
    const visited = new Set<string>();
    while (normalizeFingerprint(current.fingerprint256) !== targetFingerprint) {
      const currentFingerprint = normalizeFingerprint(current.fingerprint256);
      if (visited.has(currentFingerprint)) return { status: "INVALID" as const, ...leafValidity, reason: "Certificate chain contains a cycle." };
      visited.add(currentFingerprint);
      const issuer = certificates.find(candidate => candidate.subject === current.issuer && current.checkIssued(candidate) && current.verify(candidate.publicKey));
      if (!issuer) return { status: "INVALID" as const, ...leafValidity, reason: "Certificate chain cannot be verified to an approved trust anchor." };
      current = issuer;
    }
    return { status: "VALID" as const, ...leafValidity, anchorFingerprint: anchor.fingerprint, reason: "Certificate chain terminates at an active approved trust anchor." };
  } catch {
    return { status: "INVALID" as const, validFrom: null, expiresAt: null, reason: "Certificate file is not a parseable X.509 certificate chain." };
  }
}
