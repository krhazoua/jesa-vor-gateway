import { X509Certificate } from "node:crypto";

export type CertificateChainStatus = "VALID" | "INVALID" | "TRUST_STORE_MISSING";
export type TrustAnchor = { subject: string; fingerprint: string; status: "ACTIVE" | "REVOKED" };

function normalizeFingerprint(value: string) { return value.replace(/[^a-fA-F0-9]/g, "").toUpperCase(); }
function parseCertificates(data: Buffer) {
  const pem = data.toString("utf8");
  const blocks = Array.from(pem.matchAll(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g)).map(match => match[0]);
  if (!blocks.length) return [new X509Certificate(data)];
  return blocks.map(block => new X509Certificate(block));
}

export function validateTrustAnchor(data: Buffer, fingerprint: string) {
  try {
    const certificates = parseCertificates(data);
    const root = certificates[certificates.length - 1];
    const fingerprintMatches = normalizeFingerprint(root.fingerprint256) === normalizeFingerprint(fingerprint);
    const selfSigned = root.checkIssued(root) && root.verify(root.publicKey);
    return { valid: fingerprintMatches && selfSigned, fingerprint: root.fingerprint256, reason: !fingerprintMatches ? "Submitted fingerprint does not match the trust-anchor certificate." : !selfSigned ? "Trust anchor must be self-signed." : "Trust anchor accepted." };
  } catch {
    return { valid: false, fingerprint: fingerprint, reason: "Trust-anchor file is not a parseable X.509 certificate." };
  }
}

export function hasDualIndependentApproval(signoffs: Array<{ actorId: number; decision: "APPROVED" | "REJECTED"; chainStatus: CertificateChainStatus }>) { return new Set(signoffs.filter(signoff => signoff.decision === "APPROVED" && signoff.chainStatus === "VALID").map(signoff => signoff.actorId)).size >= 2; }

export function validateCertificateChain(data: Buffer, leafFingerprint: string, anchors: TrustAnchor[]) {
  try {
    const certificates = parseCertificates(data);
    const leaf = certificates[0];
    if (normalizeFingerprint(leaf.fingerprint256) !== normalizeFingerprint(leafFingerprint)) return { status: "INVALID" as const, reason: "Certificate fingerprint does not match the uploaded leaf certificate." };
    const activeAnchors = anchors.filter(anchor => anchor.status === "ACTIVE");
    const anchor = activeAnchors.find(item => certificates.some(certificate => normalizeFingerprint(certificate.fingerprint256) === normalizeFingerprint(item.fingerprint)));
    if (!anchor) return { status: "TRUST_STORE_MISSING" as const, reason: "No active approved trust anchor matches the uploaded certificate chain." };
    const targetFingerprint = normalizeFingerprint(anchor.fingerprint);
    let current = leaf;
    const visited = new Set<string>();
    while (normalizeFingerprint(current.fingerprint256) !== targetFingerprint) {
      const currentFingerprint = normalizeFingerprint(current.fingerprint256);
      if (visited.has(currentFingerprint)) return { status: "INVALID" as const, reason: "Certificate chain contains a cycle." };
      visited.add(currentFingerprint);
      const issuer = certificates.find(candidate => candidate.subject === current.issuer && current.checkIssued(candidate) && current.verify(candidate.publicKey));
      if (!issuer) return { status: "INVALID" as const, reason: "Certificate chain cannot be verified to an approved trust anchor." };
      current = issuer;
    }
    return { status: "VALID" as const, reason: "Certificate chain terminates at an active approved trust anchor." };
  } catch {
    return { status: "INVALID" as const, reason: "Certificate file is not a parseable X.509 certificate chain." };
  }
}
