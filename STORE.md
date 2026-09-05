# Store listing copy

Use this text when submitting to the Chrome Web Store and addons.mozilla.org.
Attach screenshots of a Steam app page with the panel visible, plus the empty state.

## Name

VGC Score for Steam

## Short description (132 characters max)

Shows the VideoGamesCritic VGC Score on Steam game pages, with launch, press, and player signals.

## Full description

VGC Score for Steam adds the VideoGamesCritic living score to Steam store game pages.

When you open store.steampowered.com/app/{id}, the extension fetches videogamescritic.com/game/{id} — the IDs match — and injects a compact panel above the purchase block:

- VGC Score (0–100)
- Confidence and trend
- At launch, Steam all-time, press, players, recent sentiment
- HowLongToBeat times when VGC publishes them
- A link to the full VideoGamesCritic page

If VideoGamesCritic has no page for that AppID, the panel says so instead of guessing.

This is an unofficial, open-source community project. It is not affiliated with Valve or VideoGamesCritic. Scores belong to VideoGamesCritic; this extension only displays them.

Permissions:

- Access Steam store pages so the panel can be inserted.
- Access videogamescritic.com so the score can be loaded.

No account. No analytics. Source is on GitHub.

## Category

Productivity / Shopping (Chrome). Steam / Games (AMO, closest match).

## Privacy policy URL

https://github.com/Rafacv23/videogamescritic-steam-extension/blob/main/PRIVACY.md

## AMO

- Firefox add-on ID: `vgc-score-for-steam@rafacv23` (do not change after the first upload).
- Minimum Firefox: 142 (needed for `data_collection_permissions`). Desktop only; do not tick Android.
- Data collection: none.
- Notes for reviewers: content script matches `https://store.steampowered.com/app/*`. Background `fetch` of `https://videogamescritic.com/game/{appId}`. Test with AppID 2713000. No login. Zip is unminified source.
