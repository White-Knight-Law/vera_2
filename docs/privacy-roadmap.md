# VERA Privacy Roadmap

## Phase 1: Encrypted Local Vault (Current)

**Timeline:** July 2026
**Status:** Prototype

### Goals

- ✅ Implement AES-256-GCM encryption for at-rest data
- ✅ Derive keys from user passphrase (PBKDF2-SHA-256)
- ✅ Detect and migrate plaintext victim data
- ✅ Auto-lock vault after inactivity
- ✅ Add Trust Center showing encryption status
- ✅ Require confirmation before plaintext export
- ✅ Create security policy & threat model documentation
- ✅ Write automated tests for crypto operations

### Scope

- Single device, browser-only
- No backend or accounts
- No network communication
- No public-key sharing or asymmetric crypto

### Known Limitations

- ✗ No recovery if passphrase is lost (data unrecoverable)
- ✗ No backup or sync to other devices
- ✗ No secure sharing with advocate (requires plaintext export)
- ✗ No audit trail or access logging
- ✗ No tamper detection
- ✗ No multifactor authentication
- ✗ Vulnerable to XSS, malicious extensions, weak passphrases

### Deliverables

- [ ] `js/crypto-utils.js` — AES-256-GCM with Web Crypto API
- [ ] `js/storage-adapter.js` — Encrypted localStorage wrapper
- [ ] `js/vault-session.js` — Lock/unlock and inactivity timeout
- [ ] `js/handoff-encryption.js` — Encrypted/plaintext handoff export
- [ ] `docs/security-policy.md` — Transparent security disclosures
- [ ] `docs/threat-model.md` — Attack vectors and mitigations
- [ ] `tests/crypto-utils.test.js` — Unit tests
- [ ] Lock screen UI in `index.html`
- [ ] Trust Center view in `index.html`
- [ ] Migration prompt for plaintext data
- [ ] Pull request with detailed change summary

---

## Phase 2: Backend & Encrypted Sync (Q4 2026)

**Prerequisites:** Phase 1 security audit

### Goals

- [ ] Implement user accounts & authentication
- [ ] Deploy VERA to Google Cloud (Cloud Run, Cloud Storage)
- [ ] Add encrypted sync to backend
- [ ] Implement public-key sharing for advocate access
- [ ] Enable victim-to-advocate encrypted handoff
- [ ] Add audit logging (append-only, encrypted)
- [ ] Implement data retention & deletion policies
- [ ] Add support for backup recovery (BIP39-style seed phrase)

### Architecture

```
Victim Browser
    ↓ (E2E encrypted)
VERA Backend (Cloud Run)
    ↓ (encrypted at rest)
Cloud Storage (GCS)
    ↓ (encrypted, immutable audit log)
Cloud Audit Logs
```

### Encryption

- **In transit:** TLS 1.3 (confidentiality)
- **At rest:** AES-256-GCM with Google Cloud KMS or customer-managed keys
- **E2E:** Client encrypts before sending; server never sees plaintext
- **Audit log:** Encrypted, signed, append-only (tamper-evident)

### Key Distribution

- **User-controlled keys:** Victim's encryption key is derived from their passphrase (only they know)
- **Advocate access:** Victim shares encrypted data or public key with advocate
  - Option A: Victim generates share link with time-limited access token
  - Option B: Victim adds advocate's public key; system encrypts data for both
  - Option C: Victim grants advocate access to encrypted storage; advocate uses shared passphrase (high trust)

### User Identity

- **No account required in Phase 1** (victim is anonymous)
- **In Phase 2:** Victims can create optional accounts to manage multi-device access
  - Email (for recovery)
  - Password (hashed with Argon2id)
  - Two-factor authentication (TOTP)
  - Biometric (browser native)

### Access Control

- **Victim:** Full control of their data
- **Advocate:** Can view only if victim grants access (time-bound or permanent)
- **Admin:** Cannot access victim data (encrypted at rest); can only see audit logs
- **Google Cloud:** Cannot access victim data (customer-managed keys) or audit logs (encrypted)

### Audit Logging

```json
{
  "timestamp": "2026-10-15T10:30:00Z",
  "event": "handoff_exported",
  "victim_id": "[hash]",
  "advocate_id": "[hash]",
  "data_category": "evidence",
  "encryption_status": "encrypted",
  "ip_hash": "[hash]",
  "user_agent_hash": "[hash]",
  "signature": "[HMAC-SHA256]"
}
```

Audit logs are:
- Encrypted (AES-256-GCM)
- Signed (HMAC to detect tampering)
- Append-only (new events added, old events immutable)
- Retained for minimum 7 years (state crime victims' rights laws)
- Accessible to victim for transparency

### Regulatory Compliance

**HIPAA (if applicable):**

- [ ] Business Associate Agreement (BAA) with White Knight Law
- [ ] Minimum necessary principle (only collect needed data)
- [ ] Access controls (authentication, role-based access)
- [ ] Audit controls (access logging)
- [ ] Integrity controls (data not altered by unauthorized parties)
- [ ] Transmission security (TLS in transit)
- [ ] Breach notification (notify victim if compromised)

**State Crime Victims' Rights Laws:**

- [ ] Identify applicable state law (varies by jurisdiction)
- [ ] Implement retention requirements (typically 5-7 years)
- [ ] Provide victim transparency (victim can see who accessed their data)
- [ ] Implement deletion on request

**Attorney-Client Privilege (if applicable):**

- [ ] Consult counsel on privilege claims
- [ ] Mark communications as privileged
- [ ] Limit access to attorneys and clients
- [ ] Implement work-product protection

### Independent Security Audit

**Before Phase 2 production:**

- [ ] Hire independent security firm (e.g., NCC Group, Trail of Bits)
- [ ] Scope: Crypto implementation, key management, access control, audit logging
- [ ] Penetration test: Network, application, cloud infrastructure
- [ ] Code review: Focus on cryptographic correctness, key handling, secret management
- [ ] Test data migration, recovery, breach scenarios
- [ ] Publish audit report (with sensitive details redacted)

---

## Phase 3: Advocate Dashboard & Multi-Clinic Deployment (Q2 2027)

### Goals

- [ ] Build private dashboard for advocates and clinics
- [ ] Implement multi-tenant isolation (clinic A cannot see clinic B's data)
- [ ] Enable bulk operations (advocates can manage multiple victims)
- [ ] Add templates and workflows (intake, followup, referral)
- [ ] Implement consent management (victim explicitly consents to data sharing)
- [ ] Add report generation (victim can generate printable case files)
- [ ] Deploy to multiple cloud regions for availability

### Architecture

```
Victim Browser → VERA Intake (Phase 1-2)
                    ↓ (encrypted handoff)
              Advocate Dashboard (Phase 3)
                    ↓ (multi-tenant)
              Cloud Infrastructure
                    ├─ Cloud SQL (encrypted, audit logged)
                    ├─ Cloud Storage (encrypted, versioned)
                    ├─ Cloud Pub/Sub (audit events)
                    └─ Cloud Logging (encrypted, immutable)
```

### Multi-Tenancy

Each clinic is a separate tenant:

- **Isolated data:** Clinic A's data is cryptographically separated from Clinic B
- **Isolated keys:** Each clinic has own encryption key or key partition
- **Isolated audit logs:** Each clinic's access logs are separate
- **Row-level security:** Database enforces clinic_id on all queries
- **Network isolation:** Optional: separate VPCs or projects per clinic

### Victim Consent

```json
{
  "consent_id": "[UUID]",
  "victim_id": "[hash]",
  "advocate_id": "[hash]",
  "clinic_id": "[hash]",
  "scope": ["view", "export", "print"],
  "data_categories": ["evidence", "timeline", "narrative"],
  "duration": "until_revoked",
  "timestamp_created": "2026-10-15T10:00:00Z",
  "timestamp_expires": null,
  "victim_signature": "[digital signature]",
  "encryption_status": "signed_not_encrypted"
}
```

Consent records are:
- Created explicitly (not assumed)
- Signed by victim (non-repudiation)
- Time-bound (can expire)
- Revocable (victim can withdraw consent)
- Audited (access logs tied to consent)

---

## Phase 4: Advanced Features (TBD)

### Potential Future Work

- [ ] Cryptocurrency/blockchain for immutable audit trail (high complexity, uncertain value)
- [ ] Hardware security keys (Yubikey, FIDO2) for advocate multifactor auth
- [ ] Biometric authentication (fingerprint, face) for victim unlock
- [ ] Offline-first sync (victim can use VERA without internet)
- [ ] Native mobile apps (iOS, Android) with secure enclave
- [ ] Translation support (multilingual for immigrant victims)
- [ ] Video evidence storage (encrypted end-to-end)
- [ ] AI-assisted intake (transcription, summarization) with privacy-preserving processing
- [ ] Victim-to-lawyer secure messaging (encrypted chat)
- [ ] Integration with court systems (secure document filing)
- [ ] Zero-knowledge proof of data possession (for remote audits)

### Research Needed

- Blockchain viability for victim privacy (likely not applicable)
- Homomorphic encryption for server-side processing without decryption
- Secure multiparty computation for aggregated victim statistics
- Privacy-preserving analytics (differential privacy)

---

## Timeline

| Phase | Start | End | Status | Key Milestone |
|-------|-------|-----|--------|---------------|
| Phase 1 | Jul 2026 | Aug 2026 | In Progress | Encrypted local vault |
| Security Audit | Aug 2026 | Oct 2026 | Planned | Third-party review |
| Phase 2 | Oct 2026 | Dec 2026 | Planned | Backend + E2E encryption |
| Phase 2 Deployment | Dec 2026 | Jan 2027 | Planned | Production launch |
| Phase 3 | Jan 2027 | Jun 2027 | Planned | Multi-clinic dashboard |
| Phase 3 Deployment | Jun 2027 | Jul 2027 | Planned | Multi-clinic production |

---

## Success Criteria

### Phase 1

- ✅ Encrypt all sensitive victim data before localStorage storage
- ✅ Require passphrase to access vault
- ✅ Auto-lock after inactivity
- ✅ Migrate existing plaintext data with user consent
- ✅ Document security limitations transparently
- ✅ Zero critical or high-severity security findings in code review

### Phase 2

- ✅ Deploy to production (Cloud Run, GCS)
- ✅ Support 500+ concurrent users without degradation
- ✅ Maintain E2E encryption (server never sees plaintext)
- ✅ Pass independent security audit
- ✅ Achieve zero unplanned data breaches
- ✅ Comply with HIPAA and state victim privacy laws

### Phase 3

- ✅ Support 10+ clinic tenants with complete data isolation
- ✅ Process 1000+ victim cases per clinic per month
- ✅ 99.9% uptime SLA
- ✅ RTO/RPO < 1 hour
- ✅ All access audited and compliant with legal holds

---

## Governance & Review

### Phase 1 Review

- [ ] Code review by 2 senior developers
- [ ] Threat model review by security engineer
- [ ] Feedback from victim advocates
- [ ] Legal review by White Knight Law counsel

### Phase 2 Review

- [ ] Independent security audit (80-120 hours)
- [ ] HIPAA compliance audit (if applicable)
- [ ] Penetration test (red team exercise)
- [ ] Load testing & chaos engineering
- [ ] Legal review of data handling policies

### Phase 3 Review

- [ ] Multi-tenancy isolation verification
- [ ] Consent & audit logging compliance
- [ ] SOC 2 Type II certification
- [ ] Regulatory compliance audit (state + federal)
