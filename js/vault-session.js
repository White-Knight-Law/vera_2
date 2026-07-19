/**
 * VERA Vault Session Manager
 * Handles vault locking, unlocking, and automatic timeout
 */

const VaultSession = (() => {
  const DEFAULT_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
  const SESSION_ACTIVITY_KEY = 'vera_last_activity';

  let inactivityTimer = null;
  let inactivityTimeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS;
  let isLocked = true;

  function initSession(timeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS) {
    inactivityTimeoutMs = timeoutMs;
    updateActivity();
    setupActivityListener();
  }

  function updateActivity() {
    localStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());
    resetInactivityTimer();
  }

  function setupActivityListener() {
    const activities = ['mousedown', 'keydown', 'touchstart', 'click'];
    activities.forEach(activity => {
      document.addEventListener(activity, updateActivity, true);
    });
  }

  function resetInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    if (isLocked) {
      return;
    }

    inactivityTimer = setTimeout(() => {
      lockVault('inactivity');
    }, inactivityTimeoutMs);
  }

  function unlockVault() {
    isLocked = false;
    updateActivity();
  }

  function lockVault(reason = 'user') {
    isLocked = true;
    StorageAdapter.clearVaultKey();
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    const event = new CustomEvent('vault-locked', { detail: { reason } });
    document.dispatchEvent(event);
  }

  function isVaultLocked() {
    return isLocked;
  }

  function setInactivityTimeout(ms) {
    inactivityTimeoutMs = ms;
    resetInactivityTimer();
  }

  function getTimeUntilLock() {
    if (isLocked) return 0;
    const lastActivityStr = localStorage.getItem(SESSION_ACTIVITY_KEY);
    if (!lastActivityStr) return inactivityTimeoutMs;
    const lastActivity = parseInt(lastActivityStr, 10);
    const elapsed = Date.now() - lastActivity;
    const remaining = Math.max(0, inactivityTimeoutMs - elapsed);
    return remaining;
  }

  function clearOnUnload() {
    window.addEventListener('beforeunload', () => {
      lockVault('page-unload');
    });
  }

  return {
    DEFAULT_INACTIVITY_TIMEOUT_MS,
    initSession,
    updateActivity,
    resetInactivityTimer,
    unlockVault,
    lockVault,
    isVaultLocked,
    setInactivityTimeout,
    getTimeUntilLock,
    clearOnUnload
  };
})();