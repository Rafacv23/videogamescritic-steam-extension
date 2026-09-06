/**
 * Parse a VideoGamesCritic game HTML page into the fields the Steam panel needs.
 * Shared by the extension service worker, the preview demo, and tests.
 */
(function (root) {
  function decodeEntities(value) {
    if (!value) return value;
    return value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
  }

  function toNumber(value) {
    if (value == null || value === "") return null;
    const n = Number(String(value).replace("%", "").trim());
    return Number.isFinite(n) ? n : null;
  }

  function extractJsonLdGames(html) {
    const blocks = [];
    const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = re.exec(html))) {
      try {
        blocks.push(JSON.parse(match[1]));
      } catch {
        // ignore malformed JSON-LD
      }
    }
    return blocks;
  }

  function findVideoGame(blocks) {
    for (const block of blocks) {
      if (!block) continue;
      if (block["@type"] === "VideoGame") return block;
      if (Array.isArray(block["@graph"])) {
        const nested = findVideoGame(block["@graph"]);
        if (nested) return nested;
      }
    }
    return null;
  }

  function labeled(html, label, valueRe, map) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = html.match(
      new RegExp(">" + valueRe + "<\\/div>\\s*<div[^>]*>\\s*" + escaped + "\\s*<\\/div>", "i")
    );
    return match ? map(match[1]) : null;
  }

  function extractConfidence(html) {
    const match = html.match(/\b(high|medium|low)(?:<!--\s*-->)?\s*confidence\b/i);
    return match ? match[1].toLowerCase() : null;
  }

  function extractTrend(html) {
    if (/No trend data/i.test(html)) return "none";
    if (/\bStable\b/i.test(html)) return "stable";
    if (/\bRising\b/i.test(html) || /Comeback/i.test(html)) return "rising";
    if (/\bFalling\b/i.test(html)) return "falling";
    return null;
  }

  function extractMetacritic(html) {
    const match = html.match(/Metacritic(?:<!--\s*-->)?\s*(\d+)(?:<!--\s*-->)?\s*·\s*users\s*([0-9.]+)/i);
    if (!match) {
      const scoreOnly = html.match(/Metacritic(?:<!--\s*-->)?\s*(\d+)/i);
      return scoreOnly ? { score: Number(scoreOnly[1]), users: null } : null;
    }
    return { score: Number(match[1]), users: Number(match[2]) };
  }

  function extractCircleScore(html) {
    const match = html.match(/title="VGC Score"[^>]*>\s*(\d+)\s*</i);
    return match ? Number(match[1]) : null;
  }

  function extractTitle(html) {
    const match = html.match(/<title>([^<]+)<\/title>/i);
    return match ? decodeEntities(match[1].trim()) : null;
  }

  function isNotFoundPage(html) {
    return (
      /This page doesn't exist/i.test(html) &&
      (/text-7xl[^>]*>\s*404/.test(html) || /<title>[^<]*404/i.test(html))
    );
  }

  function parseVgcHtml(html, appId) {
    const id = String(appId);
    if (!html || isNotFoundPage(html)) {
      return { found: false, appId: id };
    }

    const game = findVideoGame(extractJsonLdGames(html));
    const title = extractTitle(html);
    const titleScore = title && title.match(/review score:\s*(\d+)\s*\/\s*100\s*VGC Score/i);

    const score =
      toNumber(game && game.aggregateRating && game.aggregateRating.ratingValue) ??
      (titleScore ? Number(titleScore[1]) : null) ??
      extractCircleScore(html);

    const name =
      (game && game.name) ||
      (title ? title.replace(/\s+review score:.*$/i, "").trim() : null);

    const result = {
      found: Boolean(name || score != null),
      appId: id,
      name: name || null,
      score,
      ratingCount: toNumber(game && game.aggregateRating && game.aggregateRating.ratingCount),
      url: "https://videogamescritic.com/game/" + id,
      confidence: extractConfidence(html),
      trend: extractTrend(html),
      atLaunch: labeled(html, "At launch", "(\\d+)\\s*%", Number),
      steamAllTime: labeled(html, "Steam all-time", "(\\d+)\\s*%", Number),
      press: labeled(html, "Press", "(\\d+)\\s*%", Number),
      playerSentiment: labeled(html, "Player sentiment", "(\\d+)\\s*%", Number),
      recentSentiment: labeled(html, "Recent sentiment", "(\\d+)\\s*%", Number),
      hltb: {
        main: labeled(html, "Main story", "(\\d+(?:\\.\\d+)?)h", (v) => v + "h"),
        extras: labeled(html, "Main + extras", "(\\d+(?:\\.\\d+)?)h", (v) => v + "h"),
        completionist: labeled(html, "Completionist", "(\\d+(?:\\.\\d+)?)h", (v) => v + "h"),
      },
      metacritic: extractMetacritic(html),
    };

    if (!result.found) {
      return { found: false, appId: id };
    }
    return result;
  }

  function extractSteamAppId(url) {
    if (!url) return null;
    const match = String(url).match(/\/app\/(\d+)/i);
    return match ? match[1] : null;
  }

  root.parseVgcHtml = parseVgcHtml;
  root.extractSteamAppId = extractSteamAppId;
})(globalThis);
