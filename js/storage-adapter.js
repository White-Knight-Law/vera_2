import { decryptJson, encryptJson } from "./crypto-utils.js";

export const LEGACY_CASE_KEY = "vera_case_v1";
export const ENCRYPTED_CASE_KEY = "vera_vault_case_v1";
export const VAULT_CONFIG_KEY = "vera_vault_config_v1";

export class EncryptedStorageAdapter {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.pendingWrite = Promise.resolve();
  }

  getConfig() {
    const raw = this.storage.getItem(VAULT_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  setConfig(config) {
    this.storage.setItem(VAULT_CONFIG_KEY, JSON.stringify(config));
  }

  hasEncryptedCase() {
    return Boolean(this.storage.getItem(ENCRYPTED_CASE_KEY));
  }

  hasLegacyCase() {
    return Boolean(this.storage.getItem(LEGACY_CASE_KEY));
  }

  readLegacyCase() {
    const raw = this.storage.getItem(LEGACY_CASE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  readLegacyText() {
    return this.storage.getItem(LEGACY_CASE_KEY);
  }

  deleteLegacyCase() {
    this.storage.removeItem(LEGACY_CASE_KEY);
  }

  rollbackPartialMigration() {
    this.storage.removeItem(ENCRYPTED_CASE_KEY);
    this.storage.removeItem(VAULT_CONFIG_KEY);
  }

  async loadCase(key) {
    const raw = this.storage.getItem(ENCRYPTED_CASE_KEY);
    if (!raw) return null;
    return decryptJson(JSON.parse(raw), key);
  }

  saveCase(caseData, key) {
    const snapshot = structuredClone(caseData);
    this.pendingWrite = this.pendingWrite.then(async () => {
      const encrypted = await encryptJson(snapshot, key);
      this.storage.setItem(ENCRYPTED_CASE_KEY, JSON.stringify(encrypted));
    });
    return this.pendingWrite;
  }

  async migrateLegacyCase(key) {
    const legacy = this.readLegacyCase();
    if (!legacy) throw new Error("No plaintext VERA data was found.");

    await this.saveCase(legacy, key);
    const verified = await this.loadCase(key);
    if (JSON.stringify(verified) !== JSON.stringify(legacy)) {
      throw new Error("Migration verification failed. Plaintext data was not removed.");
    }

    this.deleteLegacyCase();
    if (this.hasLegacyCase()) {
      throw new Error("Plaintext deletion could not be verified.");
    }
    return verified;
  }

  async flush() {
    await this.pendingWrite;
  }

  clearAll() {
    this.storage.removeItem(LEGACY_CASE_KEY);
    this.storage.removeItem(ENCRYPTED_CASE_KEY);
    this.storage.removeItem(VAULT_CONFIG_KEY);
  }

  storedCategories() {
    return this.hasEncryptedCase()
      ? ["Intake answers", "Conversation", "Timeline", "Evidence inventory", "Handoff status"]
      : [];
  }
}
