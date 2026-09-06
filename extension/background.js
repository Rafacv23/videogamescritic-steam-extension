/* global parseVgcHtml */

if (typeof importScripts === "function") {
  importScripts("lib/parse-vgc.js");
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map();

function cacheGet(appId) {
  const hit = cache.get(appId);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(appId);
    return null;
  }
  return hit.data;
}

async function fetchVgcGame(appId) {
  const cached = cacheGet(appId);
  if (cached) return cached;

  const url = "https://videogamescritic.com/game/" + encodeURIComponent(appId);
  const response = await fetch(url, {
    headers: { Accept: "text/html" },
  });

  if (response.status === 404) {
    const data = { found: false, appId: String(appId), url };
    cache.set(appId, { at: Date.now(), data });
    return data;
  }

  if (!response.ok) {
    throw new Error("VGC returned HTTP " + response.status);
  }

  const html = await response.text();
  const data = parseVgcHtml(html, appId);
  cache.set(appId, { at: Date.now(), data });
  return data;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "VGC_FETCH") return undefined;

  fetchVgcGame(String(message.appId))
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: String(error && error.message ? error.message : error) }));

  return true;
});
