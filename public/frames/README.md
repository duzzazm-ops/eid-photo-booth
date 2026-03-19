# Frame PNG assets (transparent photo openings)

The app loads **real PNG files** from this folder (served at `/frames/*.png`).

## Your custom frames

Replace any file here with your **original Figma-exported PNGs** (keep the **same filename**).  
Use exactly **one** `.png` suffix (not `myframe.png.png`).

| File | Frame id |
|------|-----------|
| `film-landscape.png` | `film-landscape` |
| `green-bunting.png` | `green-bunting` |
| `blue-bunting.png` | `blue-bunting` |
| `white-decorative.png` | `white-decorative` |
| `postage-stamp.png` | `postage-stamp` |
| `film-strip.png` | `film-strip` |

Requirements:

- **PNG with alpha** — the picture opening(s) must be **fully transparent** so the camera/video shows through.
- Recommended canvas: **900×1200** (or keep your export size consistent with `photoArea` in `src/app/utils/frames.ts`).
- After replacing assets, ensure `photoArea` / `photoAreas` percentages still match your artwork.

## Regenerate from SVG (optional dev only)

If the SVG sources under `src/assets/frames/` are updated, you can rasterize and punch holes to match `photoArea`:

```bash
npm run frames:build
```

Do **not** run this if you have already placed your real artwork here — it will overwrite these PNGs.

## Import PNGs from Cursor chat exports (long filenames)

If Cursor saved attachments under a folder with names like `...frame-square-film-eid....png`, either:

1. **Run the importer** (pass the folder that contains the six PNGs):

   ```bash
   npm run frames:import -- --from="C:\path\to\that\folder"
   ```

   It matches keywords in the filename (`film-strip`, `green-bunting`, `blue-bunting`, `white-decorative`, `postage-stamp`, `frame-square-film` / `film-eid` → `film-landscape`).

2. Or create **`user-frame-exports/`** in the project root, drop the six PNGs there, then:

   ```bash
   npm run frames:import
   ```

After importing, open each PNG and confirm transparent holes line up with `photoArea` / `photoAreas` in `src/app/utils/frames.ts` (adjust percentages and `ratio` = **image width ÷ height** if needed).
