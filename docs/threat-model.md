# VERA Phase 1 threat model

## Protected asset

The protected asset is the structured case record: intake answers, chat content, timeline entries, evidence inventory, summaries, and handoff metadata stored on the current device.

## Security boundary

The security boundary is the browser's Web Crypto implementation and local storage for one origin. Ciphertext is stored locally; the decryption key exists in memory while the vault is unlocked.

## Threats reduced

- Casual inspection of browser local storage while the vault is locked.
- Disclosure through the legacy plaintext storage key after verified migration.
- Accidental readable exports without an explicit warning.
- Continued exposure after inactivity through automatic locking.

## Threats not resolved

- Cross-site scripting or compromised third-party code executing in the origin.
- Malicious browser extensions, malware, screen capture, or an unlocked device.
- Browser history, autofill, operating-system swap, memory inspection, backups, or developer tools.
- Clipboard exposure after the user approves a readable copy.
- Metadata leakage, including the existence of a vault, timestamps, and approximate record size.
- Multi-user identity, authorization, tenant isolation, secure sharing, recovery, or server-side audit records.
- Legal process. Encryption reduces readable data held by the application but cannot prevent lawful requests.

## Trust assumptions

- The browser and Web Crypto implementation are not compromised.
- The deployed JavaScript matches the reviewed repository commit.
- The user chooses a strong, unique passphrase and locks the device.
- No future code path bypasses `EncryptedStorageAdapter` for sensitive persistence.

## Remaining exposure review

- `localStorage`: limited to ciphertext and non-secret KDF/timeout configuration; the legacy key is read only for explicit migration.
- `sessionStorage`: not used.
- Console output: generic operational errors remain; case content, passphrases, keys, plaintext, and ciphertext are not logged.
- Exported JSON: encrypted case backup is the default; readable summary, case, and handoff exports remain available only after explicit warnings because existing functionality is preserved.
- Query strings and URL fragments: no sensitive case data is read from or written to them.
- DOM: decrypted case data is rendered while unlocked and cleared when the vault locks. It remains observable to scripts executing in the page.
- Network: the pre-existing dashboard submission control can attempt `/api/intakes`; the static deployment has no backend. Phase 1 does not add a network integration.

