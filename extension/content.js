/* global createVgcHost, updateVgcHost */

(function () {
  const ROOT_ID = "vgc-steam-root";
  let currentAppId = null;
  let inFlight = null;

  function extractSteamAppId(url) {
    const match = String(url).match(/\/app\/(\d+)/i);
    return match ? match[1] : null;
  }

  function findInjectionPoint() {
    return (
      document.querySelector("#game_area_purchase") ||
      document.querySelector(".glance_ctn") ||
      document.querySelector("#game_highlights") ||
      document.querySelector("#appHubAppName") ||
      document.querySelector(".page_content")
    );
  }

  function ensureHost() {
    let host = document.getElementById(ROOT_ID);
    if (host) return host;

    const anchor = findInjectionPoint();
    if (!anchor) return null;

    host = createVgcHost();
    if (anchor.id === "game_area_purchase" || anchor.classList.contains("glance_ctn")) {
      anchor.parentNode.insertBefore(host, anchor);
    } else {
      anchor.insertAdjacentElement("afterend", host);
    }
    return host;
  }

  async function renderFor(appId) {
    if (!appId || inFlight === appId) return;
    inFlight = appId;
    currentAppId = appId;

    const host = ensureHost();
    if (!host) {
      inFlight = null;
      return;
    }

    updateVgcHost(host, { state: "loading" });

    let response;
    try {
      response = (await chrome.runtime.sendMessage({ type: "VGC_FETCH", appId })) || {
        ok: false,
        error: "No response from the extension",
      };
    } catch (error) {
      response = { ok: false, error: error.message };
    }
    if (currentAppId !== appId) return;

    if (!response.ok) {
      updateVgcHost(host, { state: "error", extra: response.error });
      inFlight = null;
      return;
    }

    if (!response.data || !response.data.found) {
      updateVgcHost(host, {
        state: "empty",
        extra: { url: "https://videogamescritic.com/game/" + appId },
      });
      inFlight = null;
      return;
    }

    updateVgcHost(host, { state: "ready", data: response.data });
    inFlight = null;
  }

  function syncFromLocation() {
    const appId = extractSteamAppId(location.href);
    const existing = document.getElementById(ROOT_ID);

    if (!appId) {
      if (existing) existing.remove();
      currentAppId = null;
      return;
    }

    if (appId === currentAppId && existing) return;
    if (existing && appId !== currentAppId) existing.remove();
    renderFor(appId);
  }

  const originalPush = history.pushState;
  history.pushState = function () {
    const result = originalPush.apply(this, arguments);
    queueMicrotask(syncFromLocation);
    return result;
  };
  window.addEventListener("popstate", syncFromLocation);

  const observer = new MutationObserver(() => {
    if (extractSteamAppId(location.href) && !document.getElementById(ROOT_ID)) {
      syncFromLocation();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncFromLocation);
  } else {
    syncFromLocation();
  }
})();
