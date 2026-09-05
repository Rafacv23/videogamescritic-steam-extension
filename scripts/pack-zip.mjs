#!/usr/bin/env node
/** Zip extension/ so manifest.json is at the archive root (AMO/Chrome requirement). */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function listFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

function u16(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "extension");
const dest = join(root, "vgc-score-for-steam.zip");
const files = listFiles(src).sort();

const locals = [];
const centrals = [];
let offset = 0;

for (const full of files) {
  const data = readFileSync(full);
  const name = relative(src, full).split(sep).join("/");
  const nameBuf = Buffer.from(name, "utf8");
  const compressed = deflateRawSync(data, { level: 9 });
  const crc = crc32(data);
  const local = Buffer.concat([
    Buffer.from("PK\u0003\u0004", "binary"),
    u16(20),
    u16(0),
    u16(8),
    u16(0),
    u16(0),
    u32(crc),
    u32(compressed.length),
    u32(data.length),
    u16(nameBuf.length),
    u16(0),
    nameBuf,
    compressed,
  ]);
  const central = Buffer.concat([
    Buffer.from("PK\u0001\u0002", "binary"),
    u16(20),
    u16(20),
    u16(0),
    u16(8),
    u16(0),
    u16(0),
    u32(crc),
    u32(compressed.length),
    u32(data.length),
    u16(nameBuf.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(offset),
    nameBuf,
  ]);
  locals.push(local);
  centrals.push(central);
  offset += local.length;
}

const centralDir = Buffer.concat(centrals);
const end = Buffer.concat([
  Buffer.from("PK\u0005\u0006", "binary"),
  u16(0),
  u16(0),
  u16(files.length),
  u16(files.length),
  u32(centralDir.length),
  u32(offset),
  u16(0),
]);

writeFileSync(dest, Buffer.concat([...locals, centralDir, end]));
const sha = createHash("sha256").update(readFileSync(dest)).digest("hex").slice(0, 12);
console.log("wrote", dest, `(${files.length} files, sha256 ${sha}…)`);
