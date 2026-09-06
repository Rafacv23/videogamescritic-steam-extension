# VGC Score for Steam

[![Test](https://github.com/Rafacv23/videogamescritic-steam-extension/actions/workflows/test.yml/badge.svg)](https://github.com/Rafacv23/videogamescritic-steam-extension/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The [VideoGamesCritic](https://videogamescritic.com) **VGC Score** on Steam game pages. Open source, no account, no analytics.

Steam AppIDs and VGC IDs match, so [Resonance on Steam](https://store.steampowered.com/app/2713000/) is [the same game on VGC](https://videogamescritic.com/game/2713000).

Not affiliated with Valve or VideoGamesCritic. Scores belong to VideoGamesCritic; this add-on only displays them.

## Demo

[DEMO.mp4](DEMO.mp4) is a 33-second screen recording of the unpacked extension on live Steam store pages.

<video src="DEMO.mp4" controls width="720" title="VGC Score for Steam on store.steampowered.com">
  <a href="DEMO.mp4">Watch DEMO.mp4</a>
</video>

What the clip shows:

1. A Steam `/app/{id}` page (Subnautica) with the VGC Score panel already injected above the purchase block.
2. Steam search used to open another title (**Onimusha: Way of the Sword**).
3. The same panel on the new page: VGC Score, at launch / Steam all-time / press / players / recent, and **Open full page on VideoGamesCritic**.

That is the real store, not the local mock. For a Steam-shaped page you can reload without the extension, see [Develop](#develop).

## Trust

- **MIT** licensed. Read the code in `extension/`.
- **No accounts, ads, or trackers.** Nothing is sent anywhere except a GET of the public VGC page for the AppID you opened.
- **Steam inventory, wishlist, friends, and cookies are not read.** The content script only runs on `/app/{id}` store pages.
- **[Privacy policy](PRIVACY.md)** is the full list of what it does and does not do.
- Pull requests run `npm test` on GitHub Actions before merge.

## Install

Not on the Chrome Web Store or Firefox Add-ons yet. Load it unpacked:

1. Clone this repo.
2. **Chrome / Edge:** `chrome://extensions` → Developer mode → Load unpacked → `extension/`.
3. **Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `extension/manifest.json`.
4. Open a Steam app page, for example [Resonance](https://store.steampowered.com/app/2713000/).

The panel sits above the purchase block. If VGC has no page for that AppID, it says so instead of guessing.

## What it shows

On `store.steampowered.com/app/{id}` only (not search, wishlist, or bundles):

- VGC Score (0–100), confidence, and trend
- At launch, Steam all-time, press, players, recent sentiment
- HowLongToBeat when VGC publishes it
- Link to the full VGC page

## How it works

VideoGamesCritic has no public JSON API. The extension fetches the public HTML (a page-level fetch from Steam is blocked by CORS), parses JSON-LD plus labeled fields, and caches the result in memory for 15 minutes.

```
Steam /app/{id}  →  content script  →  service worker
                                          ↓
                         GET videogamescritic.com/game/{id}
                                          ↓
                         parse HTML / JSON-LD  →  panel
```

Permissions: Steam (inject the panel) and videogamescritic.com (load the score). That is the whole list.

## Develop

```bash
git clone https://github.com/Rafacv23/videogamescritic-steam-extension.git
cd videogamescritic-steam-extension
npm test
npm run dev
```

The local preview is a Steam mock at [http://127.0.0.1:43173](http://127.0.0.1:43173) that uses the same parser and panel. [DEMO.mp4](DEMO.mp4) is the extension on the real store.

Pack for AMO / Chrome with `npm run pack` and `npm run pack:chrome` (zip root must be `manifest.json`). See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## License

[MIT](LICENSE). VideoGamesCritic and Steam are trademarks of their owners.
