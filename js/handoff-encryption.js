/**
 * VERA Handoff Packet Encryption
 * Handles encrypted and plaintext export with confirmation
 */

const HandoffEncryption = (() => {
  async function createEncryptedHandoff(handoffData, encryptionKey) {
    const encryptedPayload = await CryptoUtils.encrypt(handoffData, encryptionKey);

    return {
      format: 'vera-encrypted-handoff',
      formatVersion: 1,
      encryptionAlgorithm: CryptoUtils.ALGORITHM,
      pbkdf2Iterations: CryptoUtils.PBKDF2_ITERATIONS,
      createdAt: new Date().toISOString(),
      encrypted: encryptedPayload,
      warning: 'This file contains encrypted victim information. Keep it secure.'
    };
  }

  function createPlaintextHandoff(handoffData) {
    return {
      format: 'vera-plaintext-handoff',
      formatVersion: 1,
      createdAt: new Date().toISOString(),
      warning: 'WARNING: This handoff packet contains unencrypted victim information. Handle with care.',
      legalNotice: 'This information may be protected by attorney-client privilege, victim privacy laws, or other confidentiality obligations.',
      data: handoffData
    };
  }

  async function decryptHandoff(handoffPayload, decryptionKey) {
    if (!handoffPayload.encrypted) {
      throw new Error('Invalid encrypted handoff format');
    }
    return await CryptoUtils.decrypt(handoffPayload.encrypted, decryptionKey, true);
  }

  function exportHandoffFile(handoffData, filename = 'vera-handoff.json') {
    const json = JSON.stringify(handoffData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyHandoffToClipboard(handoffData) {
    const json = JSON.stringify(handoffData, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  return {
    createEncryptedHandoff,
    createPlaintextHandoff,
    decryptHandoff,
    exportHandoffFile,
    copyHandoffToClipboard
  };
})();