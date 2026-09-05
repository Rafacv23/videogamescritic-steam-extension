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

The `extension/` folder is a Manifest V3 add-on. Generate the toolbar PNGs first (either command writes the same files):

```bash
python3 scripts/generate-icons.py
# or
node scripts/write-icons.mjs
```

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

## Publish

Listing copy lives in [STORE.md](STORE.md). Privacy text lives in [PRIVACY.md](PRIVACY.md). License is [MIT](LICENSE).

1. Point the store privacy-policy URL at [PRIVACY.md](https://github.com/Rafacv23/videogamescritic-steam-extension/blob/main/PRIVACY.md).
2. Pack `extension/` (zip the folder contents, not the parent).
3. Submit to the [Chrome Web Store](https://developer.chrome.com/docs/webstore/register) and [addons.mozilla.org](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/).
4. After AMO assigns a permanent add-on ID, replace the temporary `browser_specific_settings.gecko.id` in `manifest.json`.

Pack a zip (`npm run pack` regenerates icons first):

```bash
npm run pack
```

## Contacting VideoGamesCritic

The site has no `/contact` page. Thomas Mahler launched it from [@thomasmahler](https://x.com/thomasmahler). A short public reply or DM on that account is the realistic channel. Be clear it is unofficial, that you only show public scores and link back, and that a small JSON endpoint would be welcome.

## License

[MIT](LICENSE). VideoGamesCritic and Steam are trademarks of their owners.
