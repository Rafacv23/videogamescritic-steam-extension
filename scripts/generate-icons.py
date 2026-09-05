#!/usr/bin/env python3
"""Regenerate the circular VGC extension icons next to this script's ../extension/icons."""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


def write_png(path: Path, size: int) -> None:
    cx = cy = size / 2
    r_outer = size * 0.46
    r_inner = size * 0.34
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            d = math.hypot(dx, dy)
            aa = 1.2
            if d <= r_inner:
                row.extend((15, 23, 42, 255))
            elif d <= r_outer:
                t = (d - r_inner) / (r_outer - r_inner)
                green = int(180 + 40 * (1 - t))
                row.extend((16, green, 120, 255))
            elif d <= r_outer + aa:
                alpha = int(255 * max(0, 1 - (d - r_outer) / aa))
                row.extend((5, 7, 13, alpha))
            else:
                row.extend((0, 0, 0, 0))
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def main() -> None:
    icons = Path(__file__).resolve().parent.parent / "extension" / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48, 128):
        dest = icons / f"icon{size}.png"
        write_png(dest, size)
        print("wrote", dest)


if __name__ == "__main__":
    main()
