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

  function metric(value, label, suffix) {
    const shown = value == null ? COPY.na : String(value) + (suffix || "");
    const muted = value == null ? " muted" : "";
    return (
      '<div class="metric"><div class="metric-value' +
      muted +
      '">' +
      escapeHtml(shown) +
      '</div><div class="metric-label">' +
      escapeHtml(label) +
      "</div></div>"
    );
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pillsFor(data) {
    const pills = [];
    if (data.trend && COPY.trend[data.trend]) {
      pills.push(COPY.trend[data.trend]);
    }
    if (data.confidence && COPY.confidence[data.confidence]) {
      pills.push(COPY.confidence[data.confidence]);
    }
    if (data.metacritic && data.metacritic.score != null) {
      pills.push("Metacritic " + data.metacritic.score);
    }
    return pills
      .map((text) => '<span class="pill">' + escapeHtml(text) + "</span>")
      .join("");
  }

  function hltbLine(hltb) {
    if (!hltb || (!hltb.main && !hltb.extras && !hltb.completionist)) return "";
    const parts = [];
    if (hltb.main) parts.push(COPY.main + " <strong>" + escapeHtml(hltb.main) + "</strong>");
    if (hltb.extras) parts.push(COPY.extras + " <strong>" + escapeHtml(hltb.extras) + "</strong>");
    if (hltb.completionist) {
      parts.push(COPY.completionist + " <strong>" + escapeHtml(hltb.completionist) + "</strong>");
    }
    return '<div class="hltb">' + COPY.hltb + ": " + parts.join(" · ") + "</div>";
  }

  function renderState(state, extra) {
    if (state === "loading") {
      return (
        '<div class="card" data-state="loading"><div class="status"><span class="spin"></span>' +
        escapeHtml(COPY.loading) +
        "</div></div>"
      );
    }
    if (state === "error") {
      return (
        '<div class="card" data-state="error"><div class="status error">' +
        escapeHtml(extra || COPY.error) +
        "</div></div>"
      );
    }
    if (state === "empty") {
      const url = extra && extra.url ? extra.url : "https://videogamescritic.com/";
      return (
        '<div class="card" data-state="empty"><div class="status">' +
        escapeHtml(COPY.empty) +
        ' <a class="link" href="' +
        escapeHtml(url) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(COPY.emptyLink) +
        "</a></div></div>"
      );
    }
    return "";
  }

  function renderData(data) {
    const scoreLabel = data.score == null ? COPY.na : String(data.score);
    return (
      '<div class="card" data-state="ready">' +
      '<div class="top">' +
      '<div class="score ' +
      scoreTier(data.score) +
      '" title="VGC Score">' +
      escapeHtml(scoreLabel) +
      "</div>" +
      '<div class="heading">' +
      '<div class="brand"><span class="brand-name">' +
      escapeHtml(COPY.brand) +
      '</span><div class="pills">' +
      pillsFor(data) +
      "</div></div>" +
      '<div class="sub">' +
      escapeHtml(COPY.blurb) +
      "</div>" +
      "</div></div>" +
      '<div class="metrics">' +
      metric(data.atLaunch, COPY.atLaunch, "%") +
      metric(data.steamAllTime, COPY.steamAllTime, "%") +
      metric(data.press, COPY.press, "%") +
      metric(data.playerSentiment, COPY.players, "%") +
      metric(data.recentSentiment, COPY.recent, "%") +
      "</div>" +
      '<div class="footer">' +
      hltbLine(data.hltb) +
      '<a class="link" href="' +
      escapeHtml(data.url) +
      '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(COPY.open) +
      "</a></div></div>"
    );
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
    if (payload.state === "ready") {
      mount.innerHTML = renderData(payload.data);
      return;
    }
    mount.innerHTML = renderState(payload.state, payload.extra);
  }

  root.createVgcHost = createVgcHost;
  root.updateVgcHost = updateVgcHost;
  root.VgcWidget = { createVgcHost, updateVgcHost, renderData, COPY };
})(typeof globalThis !== "undefined" ? globalThis : self);
