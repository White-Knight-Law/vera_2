# VERA Threat Model

## Scope

This threat model covers Phase 1 of VERA (Encrypted Local Vault) only. It assumes:

- Single-device, browser-based application
- No backend or network communication
- No user authentication or accounts
- Victim manages their own passphrase
- Data stored only in browser localStorage

## Assets

### High Value

1. **Victim narrative / statement**
   - Highly sensitive personal account of crime
   - Could expose victim identity, location, relationships
   - Legal liability if leaked

2. **Evidence inventory**
   - Photographs, documents, medical records
   - Can identify victim or perpetrator
   - May be needed for prosecution

3. **Medical information**
   - HIPAA-protected if applicable
   - Sensitive health history
   - Could enable discrimination

4. **Contact information**
   - Victim phone, email, address
   - Can enable harassment or re-victimization
   - May identify family members

5. **Timeline events**
   - Chronology of crime and impact
   - May contain identifying details
   - Could corroborate or contradict victim testimony

### Medium Value

6. **Chat transcript**
   - Interactions with advocate/counselor
   - Emotional state and concerns
   - May contain advice or recommendations

7. **Case notes**
   - Observations about victim condition
   - Referral information
   - Follow-up items

### Low Value (for this threat model)

8. **UI state**
   - Active tab, form visibility
   - Could infer victim has accessed certain features
   - Not directly sensitive but could leak usage patterns

## Threat Actors

### 1. Opportunistic Device Thief

**Goal:** Steal data from any device
**Capability:** Physical access to unlocked or locked device
**Motivation:** Resale, ransomware, identity theft

**Threats:**

- Extract localStorage (if device is unlocked or easily unlocked)
- Extract browser cache
- Copy browser profile directory
- USB forensics on running device

**Mitigations:**

- ✓ Encryption at rest (localStorage is encrypted)
- ✓ Auto-lock after 15 min inactivity (thief finds locked vault)
- ✗ No device encryption requirement (outside VERA scope)

**Residual Risk:** If device has weak OS-level lock (or is already unlocked), thief accesses vault while unlocked. Or, with forensic tools, thief extracts encryption key from RAM.

---

### 2. Malicious Browser Extension

**Goal:** Steal victim data for extortion, blackmail, or sale
**Capability:** Full access to page DOM, localStorage, network, crypto API
**Motivation:** Financial, harassment

**Threats:**

- Read localStorage and decrypt (inject JavaScript to call CryptoUtils)
- Monitor clipboard for handoff exports
- Exfiltrate data via network request
- Monitor keystrokes during passphrase entry
- Inject fake lock screen to steal passphrase

**Mitigations:**

- ✓ Encryption in localStorage (extension can still decrypt)
- ✓ Auto-lock (extension cannot read locked vault, but can wait for unlock)
- ✗ No code integrity verification
- ✗ No CSP to prevent extension injection
- ✗ No message authentication for extension communication

**Residual Risk:** Malicious extension can read data while vault is unlocked. Can also keylog passphrase or wait for next unlock.

---

### 3. Sophisticated Attacker with XSS

**Goal:** Steal victim data via compromised website code
**Capability:** Inject malicious JavaScript into page
**Motivation:** Extortion, stalking, organized crime

**Threats:**

- Read decrypted data from page memory
- Call CryptoUtils.encrypt/decrypt with injected code
- Exfiltrate data via network request
- Monitor and intercept handoff exports
- Steal passphrase via fake input prompts

**Mitigations:**

- ✓ Encryption (attacker can still decrypt with key in memory)
- ✓ No third-party JS libraries (reduces attack surface)
- ✓ Content Security Policy (if deployed)
- ✓ Subresource Integrity (if external resources used)
- ✗ No runtime code integrity verification
- ✗ No trusted execution environment

**Residual Risk:** High. XSS with script execution can read anything in page memory.

---

### 4. Forensic Examiner (LE / Attacker)

**Goal:** Extract data from device using forensic tools
**Capability:** Physical access, forensic software, memory dump tools
**Motivation:** Investigation, evidence collection, extortion

**Threats:**

- Extract browser memory (live or hibernation)
- Access browser cache / cookies
- Read encrypted files with external tools
- Brute-force weak passphrases (offline)
- Perform chip-off or JTAG to extract stored encryption keys

**Mitigations:**

- ✓ Encryption (forensic tools cannot decrypt without key or passphrase)
- ✓ PBKDF2 high iteration count (makes offline brute-force harder)
- ✓ AES-256 (computationally infeasible to break)
- ✓ Auto-lock (reduces time window for memory extraction)
- ✗ No secure enclave support
- ✗ No TPM integration
- ✗ No full-disk encryption requirement

**Residual Risk:** Medium. Forensic tools can extract keys from memory if device is powered on. Strong passphrase + high PBKDF2 iterations makes offline attack expensive but not impossible with GPUs.

---

### 5. Insider Threat (Advocate or Admin)

**Goal:** Access victim data for unauthorized purposes
**Capability:** Dashboard access, database queries, server admin
**Motivation:** Curiosity, blackmail, data sale

**Note:** This threat is **out of scope for Phase 1** because VERA has no backend. However, it becomes critical in Phase 2.

**Mitigations (Phase 1):**

- ✓ Data lives only on victim device (not on advocate system yet)
- ✓ No backend to compromise
- ✗ Plaintext handoff export can be misused by advocate

**Phase 2 Mitigations:**

- [ ] End-to-end encryption (advocate receives encrypted packets only)
- [ ] Audit logging (track all access)
- [ ] Role-based access control
- [ ] Signed consent records

---

### 6. Weak Passphrase

**Goal:** Unlock vault by guessing passphrase
**Capability:** Dictionary attack, brute-force
**Motivation:** Any of above (once encryption is bypassed)

**Threats:**

- Dictionary attack (common passphrases)
- Brute-force (if hardware allows)
- Rainbow table (if salt is weak or reused)

**Mitigations:**

- ✓ PBKDF2-SHA-256 with 600,000 iterations (raises cost of brute-force)
- ✓ Cryptographic random salt (unique per vault)
- ✓ Passphrase strength meter (in UI, not enforced)
- ✗ No minimum length requirement
- ✗ No character set enforcement

**Residual Risk:** User chooses weak passphrase (e.g., "password", "12345"). With 600,000 iterations, attacking `password` on GPU cluster is still feasible in hours to days.

**Recommendation:** Enforce minimum 12 characters or pass entropy check (Phase 2).

---

## Attack Vectors by Likelihood & Impact

| Vector | Likelihood | Impact | Residual Risk |
|--------|-----------|--------|---------------|
| Device theft (vault locked) | Medium | High | Low |
| Device theft (vault unlocked) | Low | Critical | High |
| Malicious extension | Medium | High | High |
| XSS injection | Low | Critical | High |
| Forensic memory dump | Low | High | Medium |
| Weak passphrase brute-force | Medium | Critical | Medium |
| Insider access (Phase 2) | Low | Critical | N/A |
| Subpoena / court order | Low | Critical | Unavoidable |

## Defense in Depth

### Layer 1: Device Security (OS)

- Full-disk encryption (BitLocker, FileVault, dm-crypt)
- OS-level screen lock
- Password manager for passphrase storage (e.g., Bitwarden)
- Regular OS updates
- Antivirus / anti-malware

→ **Outside VERA scope, but critical**

### Layer 2: Browser Security

- Keep browser updated
- Disable untrusted extensions
- Use privacy-focused browser (Firefox, Chromium without Google sync)
- Disable JavaScript for untrusted sites (if practical)
- Use Content Security Policy headers

→ **Partially in VERA scope (auto-lock helps)**

### Layer 3: VERA Application

- ✓ Encrypt all sensitive data (AES-256-GCM)
- ✓ Strong key derivation (PBKDF2-SHA-256 600k iterations)
- ✓ Auto-lock after inactivity
- ✓ Clear key from memory on lock
- ✓ No plaintext logging
- ✓ Secure random IV per encryption
- ✓ Authentication tag verification (GCM)
- ✗ No code integrity verification (trust browser)
- ✗ No tampering detection

→ **This layer is robust for its scope**

### Layer 4: Victim Behavior

- Choose strong passphrase (12+ chars, high entropy)
- Lock vault before stepping away
- Don't share passphrase
- Don't reuse passphrase across sites
- Verify handoff before sending
- Delete plaintext exports after sending
- Keep device physically secure

→ **Critical, but user-dependent**

## Assumptions & Limitations

### Assumptions

1. Browser crypto API is correctly implemented (crypto.subtle)
2. Operating system crypto RNG is strong
3. Browser JavaScript isolation is enforced
4. User has authority to use victim data
5. Passphrase is not logged or recorded elsewhere

### Limitations

1. **No guarantee against XSS:** Malicious JavaScript can still read decrypted data
2. **No guarantee against malware:** Keylogger can capture passphrase
3. **No guarantee against compromised device:** Firmware-level malware bypasses everything
4. **No guarantee against lawful process:** Court can compel disclosure
5. **No guarantee against memory forensics:** Key may be recoverable from RAM with sophisticated tools
6. **No guarantee of integrity:** Encryption provides confidentiality, not authenticity (though GCM includes MAC)

## Risk Acceptance

**This Phase 1 is acceptable only if:**

1. Understood and disclosed as prototype
2. Not marketed as HIPAA-compliant or zero-knowledge
3. Clear warnings displayed in UI
4. No backend yet (Phase 2 introduces shared risks)
5. Audit scheduled before Phase 2 deployment

---

## Phase 2 Threat Model Updates

When VERA moves to backend deployment, add threats:

- Network eavesdropping (mitigate: TLS 1.3)
- Server compromise (mitigate: end-to-end encryption)
- Insider threat (mitigate: audit logging, RBAC)
- Data breach disclosure (mitigate: breach notification policy)
- Cross-tenant leaks (mitigate: strong isolation)
- Subpoena responses (mitigate: legal review, data minimization)
