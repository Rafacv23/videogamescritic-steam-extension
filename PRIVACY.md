# Privacy policy

VGC Score for Steam is a browser extension. It has no account system and no backend of its own.

## What it accesses

- `store.steampowered.com` — only to read the Steam AppID from the URL and inject the score panel on `/app/{id}` pages.
- `videogamescritic.com` — to fetch the matching public game page (`/game/{id}`).

## What it does not do

- It does not collect, store, or sell personal data.
- It does not read your Steam inventory, wishlist, friends, or login cookies.
- It does not send data to any server other than VideoGamesCritic when loading a game page.
- It does not use analytics, advertising, or third-party trackers.

## Local cache

The extension keeps a short in-memory cache of the last VGC responses (about 15 minutes) so the same game is not fetched on every tab refresh. That cache lives in the extension process and is discarded when the browser restarts.

## Contact

Open an issue at [Rafacv23/videogamescritic-steam-extension](https://github.com/Rafacv23/videogamescritic-steam-extension/issues) if you have a privacy question.
