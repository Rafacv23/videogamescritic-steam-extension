import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "preview",
  publicDir: false,
  server: {
    host: "127.0.0.1",
    port: 43173,
    strictPort: true,
    fs: {
      allow: [path.resolve(".")],
    },
    proxy: {
      "/vgc-game": {
        target: "https://videogamescritic.com",
        changeOrigin: true,
        rewrite: (urlPath) => urlPath.replace(/^\/vgc-game/, "/game"),
      },
    },
  },
});
