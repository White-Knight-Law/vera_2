# VERA privacy roadmap

## Phase 1 — encrypted local vault

- Browser-native AES-256-GCM encryption.
- Passphrase-derived, non-extractable in-memory key.
- Explicit migration of legacy readable records.
- Manual and inactivity locking.
- Trust Center and honest prototype notice.
- Encrypted backup format and warnings for readable exports.

## Phase 2 — reviewed secure sharing

- Recipient public-key discovery and verification.
- Per-recipient key wrapping, revocation semantics, and expiration.
- Signed export manifests and replay protection.
- Safe recovery design that does not quietly grant White Knight universal decryption.
- Independent cryptographic design review before public claims.

## Phase 3 — authenticated service

- Separate development, staging, and production environments.
- Authenticated accounts, clinic tenants, least-privilege roles, and auditable consent grants.
- Encrypted object storage, metadata minimization, retention controls, and tamper-evident access events.
- Strict content-security policy, dependency integrity, secure headers, secret management, and incident response.
- Clear separation between orchestration metadata and survivor-controlled evidence.

## Readiness gates

Before real survivor data or clinic sales: independent penetration testing; privacy and legal review; accessibility and trauma-informed usability testing; documented backup, deletion, recovery, and breach procedures; verified tenant isolation; and evidence that no plaintext enters logs, analytics, crash reports, prompts, or backups.

