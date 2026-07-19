/**
 * VERA Cryptographic Utilities
 * Uses native Web Crypto API for AES-256-GCM encryption
 * No third-party cryptography libraries.
 */

const CryptoUtils = (() => {
  const ALGORITHM = 'AES-GCM';
  const KEY_LENGTH = 256;
  const IV_LENGTH = 12;
  const TAG_LENGTH = 128;
  const PBKDF2_ITERATIONS = 600000;
  const SALT_LENGTH = 16;
  const VERSION = 1;

  async function generateIV() {
    return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  }

  async function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  async function deriveKeyFromPassphrase(passphrase, salt) {
    if (!passphrase || passphrase.length === 0) {
      throw new Error('Passphrase cannot be empty');
    }

    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passphraseKey,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  }

  async function encrypt(plaintext, key) {
    if (!key) {
      throw new Error('Encryption key is required');
    }

    const iv = await generateIV();
    const encodedPlaintext = new TextEncoder().encode(
      typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext)
    );

    let ciphertext;
    try {
      ciphertext = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv: iv },
        key,
        encodedPlaintext
      );
    } catch (err) {
      throw new Error(`Encryption failed: ${err.message}`);
    }

    return {
      version: VERSION,
      algorithm: ALGORITHM,
      iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      timestamp: new Date().toISOString()
    };
  }

  async function decrypt(encryptedPayload, key, parseJSON = false) {
    if (!key) {
      throw new Error('Decryption key is required');
    }

    if (!encryptedPayload.iv || !encryptedPayload.ciphertext) {
      throw new Error('Invalid encrypted payload format');
    }

    const iv = new Uint8Array(
      atob(encryptedPayload.iv)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const ciphertext = new Uint8Array(
      atob(encryptedPayload.ciphertext)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    let plaintext;
    try {
      plaintext = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv },
        key,
        ciphertext
      );
    } catch (err) {
      throw new Error(`Decryption failed: ${err.message}`);
    }

    const decodedText = new TextDecoder().decode(plaintext);

    if (parseJSON) {
      try {
        return JSON.parse(decodedText);
      } catch (err) {
        return decodedText;
      }
    }

    return decodedText;
  }

  async function initializeVault(passphrase) {
    const salt = await generateSalt();
    const key = await deriveKeyFromPassphrase(passphrase, salt);

    return {
      salt: btoa(String.fromCharCode(...salt)),
      key: key,
      timestamp: new Date().toISOString()
    };
  }

  function clearKey(keyObject) {
    if (keyObject && typeof keyObject === 'object') {
      return null;
    }
  }

  return {
    ALGORITHM,
    KEY_LENGTH,
    IV_LENGTH,
    TAG_LENGTH,
    PBKDF2_ITERATIONS,
    SALT_LENGTH,
    VERSION,
    generateIV,
    generateSalt,
    deriveKeyFromPassphrase,
    encrypt,
    decrypt,
    initializeVault,
    clearKey
  };
})();