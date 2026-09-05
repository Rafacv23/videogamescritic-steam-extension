import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = createContext({ console });
runInContext(readFileSync(join(root, "extension/lib/parse-vgc.js"), "utf8"), sandbox);
const { parseVgcHtml, extractSteamAppId } = sandbox;

const fixture = readFileSync(join(root, "tests/fixtures/resonance-snippet.html"), "utf8");

test("extracts Steam AppID from store URLs", () => {
  assert.equal(
    extractSteamAppId("https://store.steampowered.com/app/2713000/Resonance_A_Plague_Tale_Legacy/"),
    "2713000"
  );
  assert.equal(extractSteamAppId("https://store.steampowered.com/app/620"), "620");
  assert.equal(extractSteamAppId("https://example.com/"), null);
});

test("parses VGC score and satellite metrics from the public HTML", () => {
  const data = parseVgcHtml(fixture, "2713000");
  assert.equal(data.found, true);
  assert.equal(data.name, "Resonance: A Plague Tale Legacy");
  assert.equal(data.score, 87);
  assert.equal(data.ratingCount, 9731);
  assert.equal(data.atLaunch, 87);
  assert.equal(data.steamAllTime, 93);
  assert.equal(data.press, 82);
  assert.equal(data.playerSentiment, 82);
  assert.equal(data.recentSentiment, 94);
  assert.equal(data.confidence, "high");
  assert.equal(data.trend, "none");
  assert.equal(data.hltb.main, "12h");
  assert.equal(data.hltb.extras, "13h");
  assert.equal(data.hltb.completionist, "16h");
  assert.equal(data.metacritic.score, 78);
  assert.equal(data.metacritic.users, 8.1);
  assert.equal(data.url, "https://videogamescritic.com/game/2713000");
});

test("treats a VGC 404 page as not found", () => {
  const html = `<html><body><div class="text-7xl">404</div><h1>This page doesn't exist</h1></body></html>`;
  const data = parseVgcHtml(html, "1");
  assert.equal(data.found, false);
  assert.equal(data.appId, "1");
});

test("parses a live VGC page when the network is available", async (t) => {
  let html;
  try {
    const response = await fetch("https://videogamescritic.com/game/2713000", {
      headers: { Accept: "text/html" },
    });
    assert.equal(response.ok, true);
    html = await response.text();
  } catch (error) {
    t.skip("no network: " + error.message);
    return;
  }

  const data = parseVgcHtml(html, "2713000");
  assert.equal(data.found, true);
  assert.match(data.name, /Resonance/i);
  assert.equal(typeof data.score, "number");
  assert.ok(data.score >= 0 && data.score <= 100);
  assert.equal(typeof data.steamAllTime, "number");
});
