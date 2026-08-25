# Approved Plant Integration Contract

## Purpose and status

This document defines the acceptance contract required before the VoR Gateway can connect to an external plant system. It is a **design and approval contract only**. The current application remains `DISCONNECTED_READ_ONLY`; no endpoint, credential, certificate private material, or plant-write capability is configured by this document.

## Boundary contract

| Concern | Required contract | Current prototype state |
|---|---|---|
| Transport | A plant-approved OPC UA or equivalent edge transport with a documented endpoint, namespace, security policy, and timeout profile | Not configured |
| Direction | Read snapshots from the plant edge; writes remain disabled until formal activation | Read-only |
| Identity | Server-side equipment, variable, unit, range, SIL, ROC, and interlock mapping from the approved engineering master | Local canonical master |
| Authentication | Mutual certificate authentication validated against an approved trust store and rotation procedure | Certificate evidence workflow only |
| Authorization | Server-enforced role policy and four-eyes approval for any future propagation request | Enforced for gateway governance |
| Freshness | Re-read current value, engineering limits, SIL, ROC, interlocks, equipment state, and variable state immediately before propagation | Pre-propagation checks are contract-gated |
| Audit | Immutable request, validation, decision, approval, mapping, propagation, acknowledgement, and failure events with UTC timestamps | Gateway audit trail active |
| Failure behavior | Timeout, stale snapshot, mapping mismatch, certificate failure, interlock failure, or acknowledgement failure must abort propagation and produce an audit event | Read-only failure states active |

## Required acceptance evidence

Before activation, the owner must provide an approved endpoint and namespace map, an equipment and variable master revision, a certificate-chain validation record, a trust-store approval and rotation record, a FAT/SAT acceptance reference, a rollback and isolation plan, a controlled change window, an acknowledgement and timeout test report, and independent sign-off from the required roles. These references must be stored as governed evidence, not embedded as secrets in frontend code or source control.

## Activation gates

The following gates are mandatory and ordered: authoritative master reconciliation; exact or approved mapping evidence; two independent valid certificate-backed sign-offs; FAT/SAT acceptance; rollback and isolation readiness; controlled change-window approval; server-side TOCTOU revalidation; and a successful dry-run acknowledgement test. Failure of any gate keeps the adapter disconnected and plant writes disabled.

## Runtime request contract

A future adapter implementation must accept only a server-produced mapping containing the canonical request ID, approved equipment identity, approved variable identity, DCS tag, unit, requested value, current value, engineering limits, SIL class, ROC and interlock evidence, certificate-chain status, approval evidence, and an expiry timestamp. The adapter must return an acknowledgement containing the request ID, mapped tag, accepted value, adapter transaction reference, UTC timestamp, and final propagation state. It must never accept arbitrary DCS tags or raw frontend mapping instructions.

## Non-negotiable safety rules

The frontend cannot enable a plant write, select an arbitrary tag, bypass validation, bypass four-eyes approval, or override a failed mapping verification. No simulated response may be labelled as a live plant response. Until the contract evidence is approved and an implementation is separately authorized, the only valid production posture is `DISCONNECTED_READ_ONLY` with `NO PLANT WRITE`.
