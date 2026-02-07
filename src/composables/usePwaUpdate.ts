import { useRegisterSW } from "virtual:pwa-register/vue";
import type { Ref } from "vue";

export interface UsePwaUpdateOptions {
  /** Called when a new service worker has been installed and is waiting to activate. Show "Update now?" UI. */
  onNeedRefresh?: () => void;
  /** Called when the app is ready to work offline (first SW install). Optional toast. */
  onOfflineReady?: () => void;
  /** Check for updates every N ms (e.g. 60 * 60 * 1000 for hourly). Only applies when using prompt. */
  checkIntervalMs?: number;
}

export interface UsePwaUpdateReturn {
  /** True when a new version is available and user has not yet chosen to update. */
  needRefresh: Ref<boolean>;
  /** True when app is ready to work offline (first install). */
  offlineReady: Ref<boolean>;
  /** Call to activate the waiting worker and optionally reload. Pass `true` to reload after skipWaiting. */
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  /** Clear needRefresh and offlineReady (e.g. after user dismisses the prompt). */
  close: () => void;
}

/**
 * PWA update handling with user confirmation (no auto-refresh).
 * Use with registerType: "prompt" in vite-plugin-pwa.
 * Works after "Add to Home Screen" because it uses the same SW registration.
 */
export function usePwaUpdate(options: UsePwaUpdateOptions = {}): UsePwaUpdateReturn {
  const {
    onNeedRefresh,
    onOfflineReady,
    checkIntervalMs,
  } = options;

  const {
    needRefresh,
    offlineReady,
    updateServiceWorker: _updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      onNeedRefresh?.();
    },
    onOfflineReady() {
      onOfflineReady?.();
    },
    onRegistered(registration) {
      if (checkIntervalMs != null && registration != null) {
        setInterval(() => {
          registration.update();
        }, checkIntervalMs);
      }
    },
  });

  async function updateServiceWorker(reloadPage = false) {
    await _updateServiceWorker(reloadPage);
  }

  function close() {
    needRefresh.value = false;
    offlineReady.value = false;
  }

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    close,
  };
}
