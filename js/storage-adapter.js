/**
 * VERA Encrypted Storage Adapter
 * Wraps localStorage with transparent encryption/decryption
 */

const StorageAdapter = (() => {
  const STORAGE_PREFIX = 'vera_encrypted_';
  const VAULT_METADATA_KEY = 'vera_vault_metadata';
  const PLAINTEXT_DETECTION_KEYS = [
    'vera_urgent_concerns',
    'vera_evidence',
    'vera_timeline',
    'vera_resources',
    'vera_chat',
    'vera_narrative'
  ];

  let currentKey = null;

  function isVaultUnlocked() {
    return currentKey !== null;
  }

  function setVaultKey(key) {
    currentKey = key;
  }

  function clearVaultKey() {
    currentKey = CryptoUtils.clearKey(currentKey);
    currentKey = null;
  }

  async function setEncrypted(key, value) {
    if (!currentKey) {
      throw new Error('Vault is locked. Cannot write encrypted data.');
    }

    const encryptedPayload = await CryptoUtils.encrypt(value, currentKey);
    const storageKey = STORAGE_PREFIX + key;
    localStorage.setItem(storageKey, JSON.stringify(encryptedPayload));
  }

  async function getEncrypted(key, defaultValue = null) {
    if (!currentKey) {
      throw new Error('Vault is locked. Cannot read encrypted data.');
    }

    const storageKey = STORAGE_PREFIX + key;
    const storedValue = localStorage.getItem(storageKey);

    if (!storedValue) {
      return defaultValue;
    }

    try {
      const encryptedPayload = JSON.parse(storedValue);
      return await CryptoUtils.decrypt(encryptedPayload, currentKey, true);
    } catch (err) {
      console.error(`Failed to decrypt key '${key}':`, err);
      throw new Error(`Decryption failed for key '${key}': ${err.message}`);
    }
  }

  function removeEncrypted(key) {
    const storageKey = STORAGE_PREFIX + key;
    localStorage.removeItem(storageKey);
  }

  function detectPlaintextData() {
    const plaintextKeys = [];
    for (const key of PLAINTEXT_DETECTION_KEYS) {
      if (localStorage.getItem(key)) {
        plaintextKeys.push(key);
      }
    }
    return plaintextKeys;
  }

  async function migratePlaintextData(keysToMigrate) {
    if (!currentKey) {
      throw new Error('Vault must be unlocked to migrate data.');
    }

    const result = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const key of keysToMigrate) {
      try {
        const plaintextValue = localStorage.getItem(key);
        if (plaintextValue) {
          let value = plaintextValue;
          try {
            value = JSON.parse(plaintextValue);
          } catch (e) {}
          const encryptedKey = key.replace('vera_', '');
          await setEncrypted(encryptedKey, value);
          result.successful++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push({ key, error: err.message });
      }
    }

    return result;
  }

  function deletePlaintextData(keysToDelete) {
    let deletedCount = 0;
    for (const key of keysToDelete) {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  function getVaultMetadata() {
    const metadata = localStorage.getItem(VAULT_METADATA_KEY);
    return metadata ? JSON.parse(metadata) : null;
  }

  function setVaultMetadata(metadata) {
    localStorage.setItem(VAULT_METADATA_KEY, JSON.stringify(metadata));
  }

  function clearAllEncryptedData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(VAULT_METADATA_KEY);
    return keysToRemove.length;
  }

  return {
    STORAGE_PREFIX,
    VAULT_METADATA_KEY,
    PLAINTEXT_DETECTION_KEYS,
    isVaultUnlocked,
    setVaultKey,
    clearVaultKey,
    setEncrypted,
    getEncrypted,
    removeEncrypted,
    detectPlaintextData,
    migratePlaintextData,
    deletePlaintextData,
    getVaultMetadata,
    setVaultMetadata,
    clearAllEncryptedData
  };
})();