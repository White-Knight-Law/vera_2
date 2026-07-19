# VERA Phase 1 security policy

VERA is a prototype. Phase 1 protects case data stored by this browser with AES-256-GCM while the local vault is locked. A key is derived in the browser from the user's passphrase with PBKDF2-HMAC-SHA-256 and a unique salt. A fresh 96-bit IV is generated for every encryption operation. The derived key is non-extractable and retained in memory only while the vault is unlocked.

## Data handling promises

- The vault passphrase and derived key are not written to browser storage.
- Sensitive case records replace the former plaintext `vera_case_v1` value only after an encrypt/decrypt verification succeeds.
- Existing readable records require an explicit choice to encrypt, export, or delete.
- Readable exports and clipboard handoffs require a warning and explicit confirmation.
- No analytics, backend storage, external AI processing, credentials, or real personal data are added by this phase.

## Claims VERA does not make

Phase 1 is not zero knowledge, end-to-end encryption, HIPAA compliance, attorney-client privilege, subpoena-proofing, or production readiness. Those terms must not be used without independent technical and legal verification.

## Operational limits

While unlocked, VERA must decrypt records in the browser. A compromised device, malicious extension, injected script, person with access to an unlocked browser, screen capture, clipboard manager, downloaded readable file, or browser backup may expose information. White Knight cannot recover a forgotten local-vault passphrase.

