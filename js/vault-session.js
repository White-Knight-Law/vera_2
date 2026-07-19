import { deriveVaultKey } from "./crypto-utils.js";

export const DEFAULT_INACTIVITY_MINUTES = 10;

export class VaultSession {
  #key = null;
  #timer = null;
  #timeoutMinutes = DEFAULT_INACTIVITY_MINUTES;
  #onLock = () => {};

  get key() {
    if (!this.#key) throw new Error("The VERA vault is locked.");
    return this.#key;
  }

  get isLocked() {
    return !this.#key;
  }

  get timeoutMinutes() {
    return this.#timeoutMinutes;
  }

  async unlock(passphrase, config) {
    this.#key = await deriveVaultKey(passphrase, config.salt, config.iterations);
    this.#timeoutMinutes = Number(config.inactivityMinutes) || DEFAULT_INACTIVITY_MINUTES;
    this.touch();
    return this.#key;
  }

  configure({ timeoutMinutes, onLock }) {
    if (Number.isFinite(Number(timeoutMinutes))) this.#timeoutMinutes = Number(timeoutMinutes);
    if (typeof onLock === "function") this.#onLock = onLock;
    if (!this.isLocked) this.touch();
  }

  touch() {
    if (this.isLocked) return;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.lock("inactivity"), this.#timeoutMinutes * 60_000);
  }

  lock(reason = "manual") {
    clearTimeout(this.#timer);
    this.#timer = null;
    this.#key = null;
    this.#onLock(reason);
  }
}

