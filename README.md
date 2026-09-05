# VGC Score for Steam

Unofficial [Chrome](https://developer.chrome.com/docs/extensions) and [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons) extension that shows the [VideoGamesCritic](https://videogamescritic.com) **VGC Score** on Steam store game pages.

Steam AppIDs and VGC IDs are the same:

- Steam: `https://store.steampowered.com/app/2713000/Resonance_A_Plague_Tale_Legacy/`
- VGC: `https://videogamescritic.com/game/2713000`

Not affiliated with Valve or VideoGamesCritic.

```bash
git clone https://github.com/Rafacv23/videogamescritic-steam-extension.git
cd videogamescritic-steam-extension
```

## What it shows

On `store.steampowered.com/app/{id}` only (not search, wishlist, or bundles):

- VGC Score (0–100), confidence, and trend
- At launch, Steam all-time, press, players, recent sentiment
- HowLongToBeat when VGC publishes it
- Link to the full VGC page
- Empty state if that AppID is not tracked

## Install from source

The `extension/` folder is a Manifest V3 add-on. No build step.

**Chrome / Edge:** `chrome://extensions` → Developer mode → Load unpacked → `extension/`.

**Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `extension/manifest.json`.

Then open any Steam app page, for example [Resonance](https://store.steampowered.com/app/2713000/).

## Local demo

Same parser and panel, on a Steam mock that fetches live VGC HTML:

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

```bash
npm test
```

## How it works

VideoGamesCritic has no public JSON API. The extension’s service worker fetches the public game HTML (CORS blocks a page-level fetch from Steam), parses JSON-LD plus labeled fields, and caches the result for 15 minutes. The content script injects a Shadow DOM panel above the purchase block.

```
Steam /app/{id}  →  content script  →  service worker
                                          ↓
                         GET videogamescritic.com/game/{id}
                                          ↓
                         parse HTML / JSON-LD  →  panel
```

## License

[MIT](LICENSE). VideoGamesCritic and Steam are trademarks of their owners.
