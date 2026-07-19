const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const CRYPTO_VERSION = 1;
export const DEFAULT_PBKDF2_ITERATIONS = 600_000;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function randomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function createSalt() {
  return bytesToBase64(randomBytes(16));
}

export async function deriveVaultKey(passphrase, salt, iterations = DEFAULT_PBKDF2_ITERATIONS) {
  if (typeof passphrase !== "string" || passphrase.length < 12) {
    throw new Error("Use a vault passphrase with at least 12 characters.");
  }

  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(salt),
      iterations
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(value, key) {
  const iv = randomBytes(12);
  const plaintext = encoder.encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  return {
    format: "vera-encrypted-record",
    version: CRYPTO_VERSION,
    algorithm: "AES-256-GCM",
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    createdAt: new Date().toISOString()
  };
}

export async function decryptJson(payload, key) {
  if (!payload || payload.format !== "vera-encrypted-record" || payload.version !== CRYPTO_VERSION) {
    throw new Error("Unsupported encrypted record format.");
  }

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
      key,
      base64ToBytes(payload.ciphertext)
    );
    return JSON.parse(decoder.decode(plaintext));
  } catch {
    throw new Error("The passphrase is incorrect or the encrypted data was changed.");
  }
}

export function encodeBytes(bytes) {
  return bytesToBase64(bytes);
}

