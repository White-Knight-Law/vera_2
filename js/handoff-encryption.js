import { encryptJson } from "./crypto-utils.js";

export async function createEncryptedExport(data, key, config, purpose = "case-backup") {
  const encrypted = await encryptJson(data, key);
  return {
    format: "VERA encrypted export",
    version: 1,
    purpose,
    createdAt: new Date().toISOString(),
    encryption: {
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA-256",
      iterations: config.iterations,
      salt: config.salt,
      keyLocation: "User passphrase; not included"
    },
    payload: encrypted
  };
}

export function isEncryptedExport(value) {
  return value?.format === "VERA encrypted export" && value?.version === 1;
}

