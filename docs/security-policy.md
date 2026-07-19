# VERA Security Policy

## Phase 1: Encrypted Local Vault (Prototype)

**Status:** Prototype. Not production-ready.

### What This Is

VERA Phase 1 implements **encrypted local storage** using the browser's native Web Crypto API. Sensitive victim data is encrypted with AES-256-GCM before being stored in browser localStorage.

### What This Does NOT Guarantee

**VERA is not and does not claim to be:**

- ✗ Zero-knowledge
- ✗ End-to-end encrypted
- ✗ HIPAA compliant
- ✗ Attorney-client privileged
- ✗ Subpoena-proof
- ✗ Production-ready
- ✗ Secure against compromised devices
- ✗ Secure against malicious browser extensions
- ✗ Secure against malicious JavaScript
- ✗ Secure against lawful process or court orders

### Encryption Architecture

#### Algorithm

- **Cipher:** AES-256-GCM (authenticated encryption)
- **Key derivation:** PBKDF2-SHA-256 with 600,000 iterations
- **IV:** 96-bit random, unique per encryption
- **Authentication tag:** 128-bit (16 bytes)
- **Implementation:** Browser Web Crypto API (native, no third-party crypto)

#### Key Management

1. **Passphrase → Key Derivation**
   - User creates a vault passphrase
   - Passphrase + random salt → PBKDF2-SHA-256 → 256-bit AES key
   - Salt is stored in localStorage unencrypted (required for decryption)

2. **Key Storage**
   - Derived key lives **only in memory** while vault is unlocked
   - Key is cleared from memory when vault locks
   - No plaintext key is ever written to storage

3. **Passphrase Storage**
   - Passphrase is **never** stored
   - User must re-enter passphrase after vault locks or browser closes
   - Passphrase is not hashed; it is used only for key derivation

#### Data Encryption

Sensitive records are encrypted individually:

```json
{
  "version": 1,
  "algorithm": "AES-GCM",
  "iv": "[base64 96-bit random IV]",
  "ciphertext": "[base64 encrypted data + auth tag]",
  "timestamp": "2026-07-19T03:42:58Z"
}
```

Each record has a unique IV. **IV reuse with the same key breaks GCM security.** VERA generates a fresh cryptographic random IV for every encryption.

### Protected Data Categories

The following are encrypted before storage:

- Urgent concerns / crisis escalation notes
- Evidence inventory
- Timeline events
- Chat transcript
- Narrative / victim statement
- Medical information
- Legal information
- Personal contact details
- Financial information
- Case notes and observations

### What Remains Unencrypted

- Vault salt (required for key derivation)
- Vault metadata (creation timestamp)
- Session activity timestamp (used for inactivity timeout)
- UI state (active tab, form visibility)

### Vault Locking

**Auto-Lock on:**

- 15 minutes of inactivity (configurable, default is privacy-preserving)
- Browser close or tab refresh
- User clicks "Lock VERA"
- Session timeout
- Page unload

**When locked:**

- In-memory key is cleared
- All encrypted records remain stored but inaccessible
- User must re-enter passphrase to unlock
- UI shows lock screen

### Threat Model

#### What This Protects Against

✓ **At-rest exposure:** If device is stolen or localStorage is exported, encrypted records remain inaccessible without the passphrase.

✓ **Accidental plaintext exposure:** Victim data is not visible in browser dev tools, localStorage dumps, or memory forensics (to a degree).

✓ **Passive observation:** Someone looking over the user's shoulder while vault is locked sees nothing but a lock screen.

#### What This Does NOT Protect Against

✗ **Active session compromise:** If an attacker gains JavaScript execution (XSS, malicious extension), they can read decrypted data while vault is unlocked.

✗ **Weak passphrase:** If user chooses a weak passphrase, an offline attacker can brute-force it with PBKDF2 (though 600,000 iterations raises the cost).

✗ **Keylogger:** Malware that captures keystrokes during passphrase entry defeats encryption.

✗ **Clipboard access:** If user copies handoff packet to clipboard, malicious code can read it.

✗ **Browser extension:** Malicious or compromised extensions have full access to page data and localStorage.

✗ **Compromised device:** Full device compromise (rootkit, firmware malware) can access memory or observe user input.

✗ **Lawful process:** Courts, law enforcement, or regulatory bodies can compel victim to unlock vault or disclose passphrase.

✗ **Memory forensics:** While key is in memory, forensic analysis could potentially extract it from RAM (difficult but not impossible).

### Inactivity Timeout

Vault auto-locks after 15 minutes of inactivity (no mouse, keyboard, or touch). This reduces exposure if:

- User steps away from device
- Device is left unattended
- Attacker gains brief physical access

**Limitations:**

- Does not protect against simultaneous access (if attacker is already in the browser)
- Does not protect against keylogger or malware
- Can be configured or disabled (reduces privacy)

### Handoff Exports

#### Encrypted Handoff

User can export handoff packet as **encrypted file**:

- Encrypted with same AES-256-GCM key
- Can be sent to advocate or stored securely
- Requires passphrase to decrypt
- File format: `vera-encrypted-handoff-{timestamp}.json`

#### Plaintext Handoff

User can export as **plaintext JSON** (for dashboard import):

- Requires explicit confirmation dialog
- Dialog warns: "This file contains unencrypted victim information"
- File format: `vera-plaintext-handoff-{timestamp}.json`
- Include legal notice about confidentiality

**Plaintext exports should be:**

- Deleted after import to advocate system
- Not stored on shared devices
- Marked confidential
- Handled per victim privacy law and attorney-client privilege rules

### Known Limitations & Future Work

#### Phase 1 Limitations

1. **No user authentication:** Anyone with browser access can attempt passphrase unlock
2. **No encrypted sharing:** Cannot securely share data between victim and advocate without plaintext handoff
3. **No audit trail:** No record of who accessed data or when
4. **No backup recovery:** Lost passphrase = lost data (no recovery phrase)
5. **No tamper detection:** User cannot verify data integrity beyond decryption success
6. **Browser-only:** Data is not synced across devices
7. **No server backup:** If browser cache clears, encrypted data is lost

#### Phase 2 Roadmap

- [ ] User authentication (account system)
- [ ] Encrypted sharing with advocate (public-key cryptography)
- [ ] Backend storage (end-to-end encrypted)
- [ ] Google Cloud deployment (Cloud Run, Cloud Storage)
- [ ] Audit logging (encrypted, append-only)
- [ ] Recovery phrases (BIP39-style backup)
- [ ] Cross-device sync (encrypted)
- [ ] Argon2id key derivation (after audit)
- [ ] Hardware security key support
- [ ] Independent security audit

### Plaintext Data Detection & Migration

On first load, VERA detects existing plaintext victim data:

```javascript
const plaintextKeys = StorageAdapter.detectPlaintextData();
// ['vera_urgent_concerns', 'vera_evidence', ...]
```

User is presented with three options:

1. **Encrypt now:** Create vault passphrase, migrate and encrypt all plaintext data, delete plaintext
2. **Export and delete:** Export existing data as JSON, then delete from localStorage
3. **Delete:** Permanently delete all plaintext data (no recovery)

**VERA never silently migrates or deletes data.**

### Testing Requirements

- [ ] Encrypt/decrypt round-trip with known plaintext
- [ ] Wrong passphrase rejection (decryption fails)
- [ ] Tampered ciphertext rejection (auth tag verification fails)
- [ ] Unique IV generation (no IV reuse)
- [ ] Plaintext migration (copy → encrypt → verify → delete)
- [ ] Plaintext deletion (confirm no plaintext remains)
- [ ] Vault locking (key cleared, inaccessible)
- [ ] Session expiration (auto-lock after timeout)
- [ ] No plaintext logging (grep repository for sensitive keys)

### Browser Compatibility

Requires:

- `crypto.subtle.encrypt()` (AES-GCM)
- `crypto.subtle.decrypt()`
- `crypto.subtle.deriveKey()` (PBKDF2-SHA-256)
- `crypto.getRandomValues()`

**Supported:**

- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+
- (Not IE11)

### Transparency & Disclosure

**VERA includes a visible prototype notice:**

> "VERA is currently a prototype. Encrypted local storage reduces exposure of information stored on this device, but it does not protect information while the vault is unlocked or guarantee protection from compromised devices, malicious browser extensions, software vulnerabilities, subpoenas, or lawful process."

This notice is shown:

- On every page load
- In the Trust Center
- Before handoff export
- In onboarding flow

### Regulatory & Legal Notes

- **Not HIPAA:** Does not meet HIPAA requirements for healthcare data (requires encryption in transit, access controls, audit logging, BAA)
- **Not attorney-client privileged:** Encryption status does not confer legal privilege; depends on lawyer-client relationship and other factors
- **Privacy laws:** Victim data may be protected by state crime victims' rights laws, confidentiality statutes, or federal law (varies by jurisdiction)
- **Subpoena:** Court can order disclosure of unencrypted data or passphrase

**White Knight Law must consult counsel on:**

- Data retention obligations
- Victim privacy law compliance
- Attorney-client privilege claims
- Victim identity protection
- Response to legal process

---

## Contact & Reporting

For security questions or to report a vulnerability:

1. **Do not post publicly**
2. **Email:** security@whiteknightlaw.org
3. **Include:** Description, steps to reproduce, impact

For this Phase 1 prototype, focus on:

- Plaintext data leaks
- IV reuse
- Key exposure in memory
- Unencrypted logging
- Weak key derivation
