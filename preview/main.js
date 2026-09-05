import "../extension/lib/parse-vgc.js";
import "../extension/lib/widget.js";

const { parseVgcHtml, createVgcHost, updateVgcHost } = globalThis;

const DEFAULTS = {
  2713000: {
    title: "Resonance: A Plague Tale Legacy",
    blurb:
      "Embark on an original story, prequel to the award-winning games: A Plague Tale. As Sophia, journey to the Minotaur’s Island.",
  },
  620: {
    title: "Portal 2",
    blurb: "The sequel to Portal, with cooperative campaign and new puzzles.",
  },
  730: {
    title: "Counter-Strike 2",
    blurb: "The legendary competitive shooter, rebuilt on Source 2.",
  },
  1145350: {
    title: "Hades II",
    blurb: "Rogue-like dungeon crawler sequel from Supergiant Games.",
  },
};

const titleEl = document.getElementById("game-title");
const blurbEl = document.getElementById("game-blurb");
const glanceTitle = document.getElementById("glance-title");
const glanceId = document.getElementById("glance-id");
const liveId = document.getElementById("live-id");
const vgcLink = document.getElementById("vgc-link");
const buyName = document.getElementById("buy-name");
const headerArt = document.getElementById("header-art");
const capsule = document.getElementById("capsule");
const appInput = document.getElementById("app-id");
const slot = document.getElementById("vgc-slot");

let host = null;

function steamArt(appId) {
  return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/header.jpg";
}

function applyChrome(appId, title) {
  const meta = DEFAULTS[appId];
  const resolved = title || (meta && meta.title) || "Steam App " + appId;
  titleEl.textContent = resolved;
  glanceTitle.textContent = resolved;
  buyName.textContent = resolved;
  blurbEl.textContent =
    (meta && meta.blurb) ||
    "Steam store mock. The panel below is built from live VideoGamesCritic HTML.";
  glanceId.textContent = appId;
  liveId.textContent = appId;
  vgcLink.href = "https://videogamescritic.com/game/" + appId;
  vgcLink.textContent = "videogamescritic.com/game/" + appId;
  headerArt.src = steamArt(appId);
  capsule.src = steamArt(appId);
  document.title = resolved + " — demo VGC Score";
}

function ensureHost() {
  if (host && host.isConnected) return host;
  host = createVgcHost();
  slot.replaceChildren(host);
  return host;
}

async function loadGame(rawId) {
  const appId = String(rawId || "").replace(/\D/g, "");
  if (!appId) return;

  appInput.value = appId;
  applyChrome(appId);
  const card = ensureHost();
  updateVgcHost(card, { state: "loading" });

  try {
    const response = await fetch("/vgc-game/" + appId, {
      headers: { Accept: "text/html" },
    });

    if (response.status === 404) {
      updateVgcHost(card, {
        state: "empty",
        extra: { url: "https://videogamescritic.com/game/" + appId },
      });
      return;
    }

    if (!response.ok) {
      throw new Error("VGC returned HTTP " + response.status);
    }

    const html = await response.text();
    const data = parseVgcHtml(html, appId);

    if (!data.found) {
      updateVgcHost(card, {
        state: "empty",
        extra: { url: "https://videogamescritic.com/game/" + appId },
      });
      return;
    }

    if (data.name) applyChrome(appId, data.name);
    updateVgcHost(card, { state: "ready", data });
  } catch (error) {
    updateVgcHost(card, {
      state: "error",
      extra: error && error.message ? error.message : String(error),
    });
  }
}

document.getElementById("load-game").addEventListener("click", () => {
  loadGame(appInput.value);
});

appInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loadGame(appInput.value);
});

document.querySelectorAll("[data-app]").forEach((button) => {
  button.addEventListener("click", () => loadGame(button.getAttribute("data-app")));
});

const params = new URLSearchParams(location.search);
loadGame(params.get("app") || appInput.value || "2713000");
