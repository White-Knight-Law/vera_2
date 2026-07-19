/**
 * VERA Crypto Utils Tests
 * Tests for encryption, decryption, key derivation, and security properties
 */

const assert = (condition, message) => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
};

const assertEquals = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}: ${message}`);
  }
};

const assertThrows = async (fn, message) => {
  try {
    await fn();
    throw new Error(`Expected error but none was thrown: ${message}`);
  } catch (e) {
    if (e.message.includes('Expected error')) throw e;
    // Error was thrown as expected
  }
};

const TestSuite = {
  async run() {
    console.log('Starting VERA Crypto Utils Tests...');
    
    try {
      await this.testEncryptDecryptRoundTrip();
      await this.testUniqueIVGeneration();
      await this.testWrongPassphraseRejection();
      await this.testKeyDerivation();
      await this.testEmptyPassphraseRejection();
      await this.testTamperedCiphertextRejection();
      await this.testInitializeVault();
      await this.testJSONEncryption();
      
      console.log('✅ All tests passed!');
      return true;
    } catch (err) {
      console.error('❌ Test failed:', err.message);
      return false;
    }
  },

  async testEncryptDecryptRoundTrip() {
    console.log('Test: Encrypt/Decrypt Round Trip');
    
    const passphrase = 'test-passphrase-12345';
    const plaintext = 'This is secret victim information';
    
    const vault = await CryptoUtils.initializeVault(passphrase);
    const encrypted = await CryptoUtils.encrypt(plaintext, vault.key);
    const decrypted = await CryptoUtils.decrypt(encrypted, vault.key);
    
    assertEquals(decrypted, plaintext, 'Decrypted text should match plaintext');
  },

  async testUniqueIVGeneration() {
    console.log('Test: Unique IV Generation');
    
    const passphrase = 'test-passphrase-12345';
    const plaintext = 'Same text, different IVs';
    
    const vault = await CryptoUtils.initializeVault(passphrase);
    const encrypted1 = await CryptoUtils.encrypt(plaintext, vault.key);
    const encrypted2 = await CryptoUtils.encrypt(plaintext, vault.key);
    
    // IVs should be different
    assert(
      encrypted1.iv !== encrypted2.iv,
      'IVs should be unique for each encryption'
    );
    
    // Ciphertexts should be different (due to different IVs)
    assert(
      encrypted1.ciphertext !== encrypted2.ciphertext,
      'Ciphertexts should be different (different IVs)'
    );
    
    // Both should decrypt to same plaintext
    const decrypted1 = await CryptoUtils.decrypt(encrypted1, vault.key);
    const decrypted2 = await CryptoUtils.decrypt(encrypted2, vault.key);
    
    assertEquals(decrypted1, plaintext, 'First decryption should match');
    assertEquals(decrypted2, plaintext, 'Second decryption should match');
  },

  async testWrongPassphraseRejection() {
    console.log('Test: Wrong Passphrase Rejection');
    
    const passphrase = 'correct-passphrase';
    const wrongPassphrase = 'wrong-passphrase';
    const plaintext = 'Secret data';
    
    const vault = await CryptoUtils.initializeVault(passphrase);
    const encrypted = await CryptoUtils.encrypt(plaintext, vault.key);
    
    // Try to decrypt with wrong key
    const wrongKey = await CryptoUtils.deriveKeyFromPassphrase(
      wrongPassphrase,
      new Uint8Array(atob(vault.salt).split('').map(c => c.charCodeAt(0)))
    );
    
    await assertThrows(
      () => CryptoUtils.decrypt(encrypted, wrongKey),
      'Wrong passphrase should fail to decrypt'
    );
  },

  async testKeyDerivation() {
    console.log('Test: Key Derivation Consistency');
    
    const passphrase = 'consistent-passphrase';
    const salt = new Uint8Array(16);
    salt[0] = 42; // Non-zero salt
    
    const key1 = await CryptoUtils.deriveKeyFromPassphrase(passphrase, salt);
    const key2 = await CryptoUtils.deriveKeyFromPassphrase(passphrase, salt);
    
    // Keys should produce identical results (deterministic KDF)
    const plaintext = 'Test data';
    const encrypted1 = await CryptoUtils.encrypt(plaintext, key1);
    const decrypted2 = await CryptoUtils.decrypt(encrypted1, key2);
    
    assertEquals(decrypted2, plaintext, 'Same passphrase + salt should derive consistent key');
  },

  async testEmptyPassphraseRejection() {
    console.log('Test: Empty Passphrase Rejection');
    
    const salt = new Uint8Array(16);
    
    await assertThrows(
      () => CryptoUtils.deriveKeyFromPassphrase('', salt),
      'Empty passphrase should be rejected'
    );
  },

  async testTamperedCiphertextRejection() {
    console.log('Test: Tampered Ciphertext Rejection');
    
    const passphrase = 'test-passphrase';
    const plaintext = 'Important data';
    
    const vault = await CryptoUtils.initializeVault(passphrase);
    const encrypted = await CryptoUtils.encrypt(plaintext, vault.key);
    
    // Tamper with ciphertext
    const tamperedCiphertext = atob(encrypted.ciphertext);
    const tamperedBytes = tamperedCiphertext.split('');
    tamperedBytes[0] = String.fromCharCode(tamperedBytes[0].charCodeAt(0) ^ 0xFF);
    encrypted.ciphertext = btoa(tamperedBytes.join(''));
    
    await assertThrows(
      () => CryptoUtils.decrypt(encrypted, vault.key),
      'Tampered ciphertext should fail GCM authentication'
    );
  },

  async testInitializeVault() {
    console.log('Test: Initialize Vault');
    
    const passphrase = 'new-vault-passphrase';
    const vault = await CryptoUtils.initializeVault(passphrase);
    
    assert(vault.salt, 'Vault should have salt');
    assert(vault.key, 'Vault should have derived key');
    assert(vault.timestamp, 'Vault should have timestamp');
    
    // Verify salt can be decoded
    const saltBytes = atob(vault.salt);
    assertEquals(saltBytes.length, 16, 'Salt should be 16 bytes');
  },

  async testJSONEncryption() {
    console.log('Test: JSON Encryption');
    
    const passphrase = 'json-test';
    const plainObject = {
      victim_name: 'Jane Doe',
      incident_date: '2026-07-15',
      evidence: ['photo1.jpg', 'report.pdf'],
      urgent: true
    };
    
    const vault = await CryptoUtils.initializeVault(passphrase);
    const encrypted = await CryptoUtils.encrypt(plainObject, vault.key);
    const decrypted = await CryptoUtils.decrypt(encrypted, vault.key, true);
    
    assertEquals(
      JSON.stringify(decrypted),
      JSON.stringify(plainObject),
      'Encrypted/decrypted JSON should match'
    );
  }
};

// Export for browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestSuite;
}
