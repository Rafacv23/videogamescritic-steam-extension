#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const preview = join(root, "preview");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function under(base, rel) {
  const full = normalize(join(base, rel));
  return full.startsWith(base + "/") || full === base ? full : null;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname.startsWith("/vgc-game/")) {
      const upstream = await fetch(
        "https://videogamescritic.com/game/" + url.pathname.slice("/vgc-game/".length),
        { headers: { Accept: "text/html" } }
      );
      res.writeHead(upstream.status, { "content-type": "text/html; charset=utf-8" });
      res.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }
    const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).slice(1);
    const file = rel.startsWith("extension/") ? under(root, rel) : under(preview, rel);
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch (err) {
    res.writeHead(err.code === "ENOENT" ? 404 : 500).end(String(err));
  }
}).listen(43173, "127.0.0.1", () => {
  console.log("http://127.0.0.1:43173");
});
