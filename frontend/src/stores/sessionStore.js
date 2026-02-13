import { create } from "zustand";

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours default (fallback, actual from backend)

export const useSessionStore = create((set, get) => ({
  // Session expiry timestamp (milliseconds since epoch)
  expiresAt: parseInt(localStorage.getItem("sessionExpiresAt")) || null,
  // Whether the extend session dialog is showing
  showExtendDialog: false,
  // Remaining seconds
  remainingSeconds: null,
  // Timer interval id
  _intervalId: null,

  /**
   * Start session with a given duration
   */
  startSession: (durationMs = SESSION_DURATION_MS) => {
    // Show dialog 30s before JWT actually expires, so token is still valid for refresh
    const bufferMs = Math.min(30000, durationMs * 0.3);
    const expiresAt = Date.now() + durationMs - bufferMs;
    localStorage.setItem("sessionExpiresAt", expiresAt.toString());
    set({ expiresAt, showExtendDialog: false });
    get()._startCountdown();
  },

  /**
   * Extend session with new token
   */
  extendSession: (durationMs = SESSION_DURATION_MS) => {
    const bufferMs = Math.min(30000, durationMs * 0.3);
    const expiresAt = Date.now() + durationMs - bufferMs;
    localStorage.setItem("sessionExpiresAt", expiresAt.toString());
    set({ expiresAt, showExtendDialog: false });
    get()._startCountdown();
  },

  /**
   * Clear session (on logout)
   */
  clearSession: () => {
    const { _intervalId } = get();
    if (_intervalId) clearInterval(_intervalId);
    localStorage.removeItem("sessionExpiresAt");
    set({
      expiresAt: null,
      showExtendDialog: false,
      remainingSeconds: null,
      _intervalId: null,
    });
  },

  /**
   * Start the countdown timer
   */
  _startCountdown: () => {
    const { _intervalId } = get();
    if (_intervalId) clearInterval(_intervalId);

    const intervalId = setInterval(() => {
      const { expiresAt } = get();
      if (!expiresAt) return;

      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      set({ remainingSeconds: remaining });

      if (remaining <= 0) {
        set({ showExtendDialog: true });
      }
    }, 1000);

    set({ _intervalId: intervalId });

    // Calculate initial remaining
    const { expiresAt } = get();
    if (expiresAt) {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      set({ remainingSeconds: remaining });
    }
  },

  /**
   * Resume session on page load (if session exists)
   */
  resumeSession: () => {
    const expiresAt = parseInt(localStorage.getItem("sessionExpiresAt"));
    if (!expiresAt) return;

    const remaining = Math.floor((expiresAt - Date.now()) / 1000);
    if (remaining <= 0) {
      // Already expired - show extend dialog
      set({ expiresAt, showExtendDialog: true, remainingSeconds: 0 });
      return;
    }

    set({ expiresAt, remainingSeconds: remaining });
    get()._startCountdown();
  },

  /**
   * Dismiss dialog (will trigger logout)
   */
  dismissExtendDialog: () => {
    set({ showExtendDialog: false });
  },
}));
