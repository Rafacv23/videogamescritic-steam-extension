#!/usr/bin/env python3
"""Zip extension/ with manifest.json at the archive root."""
import json
import sys
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "extension"
firefox = "--firefox" in sys.argv
dest = root / ("vgc-score-for-steam-firefox.zip" if firefox else "vgc-score-for-steam.zip")


def payload(path: Path) -> bytes:
    data = path.read_bytes()
    if firefox and path.name == "manifest.json":
        manifest = json.loads(data)
        scripts = (manifest.get("background") or {}).get("scripts")
        if not scripts:
            raise SystemExit("Firefox pack needs background.scripts")
        manifest["background"] = {"scripts": scripts}
        data = (json.dumps(manifest, indent=2) + "\n").encode()
    return data


with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as zf:
    for path in sorted(p for p in src.rglob("*") if p.is_file()):
        zf.writestr(path.relative_to(src).as_posix(), payload(path))
print("wrote", dest)
