import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createSalt, decryptJson, deriveVaultKey, encryptJson } from "../js/crypto-utils.js";
import { EncryptedStorageAdapter, LEGACY_CASE_KEY } from "../js/storage-adapter.js";
import { VaultSession } from "../js/vault-session.js";

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
}

async function testKey(passphrase = "correct horse battery staple") {
  return deriveVaultKey(passphrase, createSalt(), 1_000);
}

test("encrypts and decrypts a JSON record", async () => {
  const key = await testKey();
  const source = { narrative: "sensitive", timeline: [{ date: "2026-01-01" }] };
  assert.deepEqual(await decryptJson(await encryptJson(source, key), key), source);
});

test("rejects an incorrect passphrase", async () => {
  const salt = createSalt();
  const key = await deriveVaultKey("correct horse battery staple", salt, 1_000);
  const wrong = await deriveVaultKey("different secure passphrase", salt, 1_000);
  const payload = await encryptJson({ secret: true }, key);
  await assert.rejects(() => decryptJson(payload, wrong), /incorrect|changed/i);
});

test("rejects tampered ciphertext", async () => {
  const key = await testKey();
  const payload = await encryptJson({ secret: true }, key);
  payload.ciphertext = `${payload.ciphertext.slice(0, -2)}AA`;
  await assert.rejects(() => decryptJson(payload, key), /incorrect|changed/i);
});

test("uses a fresh IV for every record", async () => {
  const key = await testKey();
  const first = await encryptJson({ same: true }, key);
  const second = await encryptJson({ same: true }, key);
  assert.notEqual(first.iv, second.iv);
  assert.notEqual(first.ciphertext, second.ciphertext);
});

test("migrates plaintext only after verification and deletes the old value", async () => {
  const storage = new MemoryStorage();
  const adapter = new EncryptedStorageAdapter(storage);
  const legacy = { caseId: "VERA-TEST", evidence: [], timeline: [], messages: [] };
  storage.setItem(LEGACY_CASE_KEY, JSON.stringify(legacy));
  const key = await testKey();
  assert.deepEqual(await adapter.migrateLegacyCase(key), legacy);
  assert.equal(storage.getItem(LEGACY_CASE_KEY), null);
  assert.deepEqual(await adapter.loadCase(key), legacy);
});

test("locking clears the in-memory key", async () => {
  const session = new VaultSession();
  const config = { salt: createSalt(), iterations: 1_000, inactivityMinutes: 10 };
  await session.unlock("correct horse battery staple", config);
  assert.equal(session.isLocked, false);
  session.lock();
  assert.equal(session.isLocked, true);
  assert.throws(() => session.key, /locked/i);
});

test("session automatically locks after inactivity", async () => {
  const session = new VaultSession();
  const config = { salt: createSalt(), iterations: 1_000, inactivityMinutes: 0.001 };
  await session.unlock("correct horse battery staple", config);
  await new Promise((resolve) => setTimeout(resolve, 90));
  assert.equal(session.isLocked, true);
});

test("source does not log case data or cryptographic material", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const files = ["index.html", "js/crypto-utils.js", "js/storage-adapter.js", "js/vault-session.js"];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(source, /console\.(log|debug|info)\s*\(/, `${file} contains a debug log`);
    assert.doesNotMatch(source, /console\.error\([^\n]*(caseData|passphrase|ciphertext|plaintext)/i, `${file} may log sensitive data`);
  }
});

