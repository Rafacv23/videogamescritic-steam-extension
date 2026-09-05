/**
 * Build the VGC panel that gets injected into Steam (and the preview mock).
 */
(function (root) {
  const CSS = `
    :host {
      all: initial;
      display: block;
      font-family: "Motiva Sans", Arial, Helvetica, sans-serif;
      color: #c7d5e0;
    }
    * { box-sizing: border-box; }
    .card {
      margin: 12px 0 16px;
      padding: 14px 16px 12px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      background: linear-gradient(180deg, #16202d 0%, #121922 100%);
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }
    .card[data-state="loading"],
    .card[data-state="error"],
    .card[data-state="empty"] {
      padding: 12px 16px;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .score {
      flex: 0 0 auto;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: #0b1220;
      border: 4px solid #334155;
      color: #94a3b8;
    }
    .score.tier-great { border-color: rgba(52, 211, 153, 0.75); color: #34d399; }
    .score.tier-good { border-color: rgba(74, 222, 128, 0.7); color: #4ade80; }
    .score.tier-mixed { border-color: rgba(251, 191, 36, 0.7); color: #fbbf24; }
    .score.tier-poor { border-color: rgba(248, 113, 113, 0.7); color: #f87171; }
    .heading {
      min-width: 0;
      flex: 1;
    }
    .brand {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px 10px;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.25);
      background: rgba(15,23,42,0.55);
      font-size: 11px;
      color: #94a3b8;
      text-transform: lowercase;
    }
    .sub {
      margin-top: 4px;
      font-size: 12px;
      color: #8f98a0;
      line-height: 1.4;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .metric {
      padding: 8px 8px 7px;
      border-radius: 6px;
      background: rgba(0,0,0,0.28);
      border: 1px solid rgba(255,255,255,0.06);
      min-width: 0;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: #34d399;
      line-height: 1.1;
    }
    .metric-value.muted { color: #64748b; }
    .metric-label {
      margin-top: 3px;
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #8b9bb4;
    }
    .footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .hltb {
      font-size: 12px;
      color: #9fb0c4;
    }
    .hltb strong { color: #e2e8f0; font-weight: 650; }
    a.link {
      color: #66c0f4;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
    }
    a.link:hover { text-decoration: underline; }
    .status {
      font-size: 13px;
      color: #9fb0c4;
    }
    .status.error { color: #fca5a5; }
    .spin {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(102,192,244,0.25);
      border-top-color: #66c0f4;
      border-radius: 50%;
      animation: vgcspin 0.7s linear infinite;
      vertical-align: -1px;
      margin-right: 8px;
    }
    @keyframes vgcspin { to { transform: rotate(360deg); } }
    @media (max-width: 720px) {
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .score { width: 60px; height: 60px; font-size: 24px; }
    }
  `;

  const COPY = {
    brand: "VGC Score",
    loading: "Loading VideoGamesCritic…",
    error: "Could not reach VideoGamesCritic. Try again later.",
    empty: "This AppID is not on VideoGamesCritic.",
    emptyLink: "Search VGC",
    open: "Open full page on VideoGamesCritic →",
    blurb: "Living score, weighted by patches and review confidence. Not Metacritic.",
    atLaunch: "At launch",
    steamAllTime: "Steam all-time",
    press: "Press",
    players: "Players",
    recent: "Recent",
    na: "—",
    confidence: {
      high: "high confidence",
      medium: "medium confidence",
      low: "low confidence",
    },
    trend: {
      none: "no trend",
      stable: "stable",
      rising: "rising",
      falling: "falling",
    },
    hltb: "HowLongToBeat",
    main: "main",
    extras: "extras",
    completionist: "100%",
  };

  function scoreTier(score) {
    if (score == null) return "";
    if (score >= 90) return "tier-great";
    if (score >= 75) return "tier-good";
    if (score >= 60) return "tier-mixed";
    return "tier-poor";
  }

  function el(tag, attrs) {
    const node = document.createElement(tag);
    if (!attrs) return node;
    for (const key of Object.keys(attrs)) {
      const value = attrs[key];
      if (value == null || value === false) continue;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }
    return node;
  }

  function httpUrl(value) {
    try {
      const url = new URL(String(value), "https://videogamescritic.com/");
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch {
      // ignore invalid URLs from VGC HTML
    }
    return "https://videogamescritic.com/";
  }

  function externalLink(href, text) {
    const link = el("a", {
      className: "link",
      href: httpUrl(href),
      target: "_blank",
      rel: "noopener noreferrer",
      text,
    });
    return link;
  }

  function metric(value, label, suffix) {
    const box = el("div", { className: "metric" });
    const shown = value == null ? COPY.na : String(value) + (suffix || "");
    box.appendChild(
      el("div", { className: value == null ? "metric-value muted" : "metric-value", text: shown })
    );
    box.appendChild(el("div", { className: "metric-label", text: label }));
    return box;
  }

  function pillsFor(data) {
    const wrap = el("div", { className: "pills" });
    const pills = [];
    if (data.trend && COPY.trend[data.trend]) pills.push(COPY.trend[data.trend]);
    if (data.confidence && COPY.confidence[data.confidence]) {
      pills.push(COPY.confidence[data.confidence]);
    }
    if (data.metacritic && data.metacritic.score != null) {
      pills.push("Metacritic " + data.metacritic.score);
    }
    for (const text of pills) wrap.appendChild(el("span", { className: "pill", text }));
    return wrap;
  }

  function hltbLine(hltb) {
    if (!hltb || (!hltb.main && !hltb.extras && !hltb.completionist)) return null;
    const line = el("div", { className: "hltb" });
    line.appendChild(document.createTextNode(COPY.hltb + ": "));
    const parts = [];
    if (hltb.main) parts.push([COPY.main, hltb.main]);
    if (hltb.extras) parts.push([COPY.extras, hltb.extras]);
    if (hltb.completionist) parts.push([COPY.completionist, hltb.completionist]);
    parts.forEach((pair, index) => {
      if (index) line.appendChild(document.createTextNode(" · "));
      line.appendChild(document.createTextNode(pair[0] + " "));
      line.appendChild(el("strong", { text: pair[1] }));
    });
    return line;
  }

  function renderState(state, extra) {
    if (state === "loading") {
      const card = el("div", { className: "card", "data-state": "loading" });
      const status = el("div", { className: "status" });
      status.appendChild(el("span", { className: "spin" }));
      status.appendChild(document.createTextNode(COPY.loading));
      card.appendChild(status);
      return card;
    }
    if (state === "error") {
      const card = el("div", { className: "card", "data-state": "error" });
      card.appendChild(el("div", { className: "status error", text: extra || COPY.error }));
      return card;
    }
    if (state === "empty") {
      const card = el("div", { className: "card", "data-state": "empty" });
      const status = el("div", { className: "status" });
      status.appendChild(document.createTextNode(COPY.empty + " "));
      status.appendChild(externalLink(extra && extra.url, COPY.emptyLink));
      card.appendChild(status);
      return card;
    }
    return el("div");
  }

  function renderData(data) {
    const scoreLabel = data.score == null ? COPY.na : String(data.score);
    const card = el("div", { className: "card", "data-state": "ready" });
    const top = el("div", { className: "top" });
    const score = el("div", {
      className: ("score " + scoreTier(data.score)).trim(),
      title: "VGC Score",
      text: scoreLabel,
    });
    const heading = el("div", { className: "heading" });
    const brand = el("div", { className: "brand" });
    brand.appendChild(el("span", { className: "brand-name", text: COPY.brand }));
    brand.appendChild(pillsFor(data));
    heading.appendChild(brand);
    heading.appendChild(el("div", { className: "sub", text: COPY.blurb }));
    top.appendChild(score);
    top.appendChild(heading);
    card.appendChild(top);

    const metrics = el("div", { className: "metrics" });
    metrics.appendChild(metric(data.atLaunch, COPY.atLaunch, "%"));
    metrics.appendChild(metric(data.steamAllTime, COPY.steamAllTime, "%"));
    metrics.appendChild(metric(data.press, COPY.press, "%"));
    metrics.appendChild(metric(data.playerSentiment, COPY.players, "%"));
    metrics.appendChild(metric(data.recentSentiment, COPY.recent, "%"));
    card.appendChild(metrics);

    const footer = el("div", { className: "footer" });
    const hltb = hltbLine(data.hltb);
    if (hltb) footer.appendChild(hltb);
    footer.appendChild(externalLink(data.url, COPY.open));
    card.appendChild(footer);
    return card;
  }

  function createVgcHost() {
    const host = document.createElement("div");
    host.id = "vgc-steam-root";
    host.setAttribute("data-vgc-extension", "1");
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);
    const mount = document.createElement("div");
    mount.className = "mount";
    shadow.appendChild(mount);
    host._vgcMount = mount;
    return host;
  }

  function updateVgcHost(host, payload) {
    const mount = host._vgcMount;
    if (!mount) return;
    const next =
      payload.state === "ready" ? renderData(payload.data) : renderState(payload.state, payload.extra);
    mount.replaceChildren(next);
  }

  root.createVgcHost = createVgcHost;
  root.updateVgcHost = updateVgcHost;
  root.VgcWidget = { createVgcHost, updateVgcHost, renderData, COPY };
})(typeof globalThis !== "undefined" ? globalThis : self);
