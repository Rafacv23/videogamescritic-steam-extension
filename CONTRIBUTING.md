# Contributing

Issues and pull requests are welcome.

- Keep the scope on Steam **app pages**. No wishlist, search, or other stores unless that is an agreed feature.
- UI copy is English and should stay aligned with VideoGamesCritic labels (`At launch`, `Steam all-time`, `Press`).
- The parser in `extension/lib/parse-vgc.js` is the fragile piece. Add a fixture or live assertion in `tests/` if you change what it reads.
- Do not add analytics, accounts, or extra host permissions.
- `npm test` should stay green.

Load the unpacked `extension/` folder to try a change on a real Steam page. Use `npm run dev` for the mock store page.
