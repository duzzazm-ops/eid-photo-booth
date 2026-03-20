# Frame PNG assets (transparent photo openings)

The app loads **real PNG files** from this folder (served at `/frames/*.png`).

## Your custom frames

Replace any file here with your **original Figma-exported PNGs** (keep the **same filename**).  
Use exactly **one** `.png` suffix (not `myframe.png.png`).

| File | Frame id |
|------|-----------|
| `green-bunting.png` | `green-bunting` |
| `blue-bunting.png` | `blue-bunting` |
| `white-decorative.png` | `white-decorative` |
| `postage-stamp.png` | `postage-stamp` |

Requirements:

- **PNG with alpha** — the picture opening must be **fully transparent** so the camera/video shows through.
- Keep export aspect ratio consistent with `ratio` and `photoArea` in `src/app/utils/frames.ts`.
- Exported downloads use a **white** mat under the frame; holes in the artwork should match `photoArea`.

## Regenerate from SVG (optional dev only)

If the SVG sources under `src/assets/frames/` are updated, you can rasterize and punch holes to match `photoArea`:

```bash
npm run frames:build
```

Do **not** run this if you have already placed your real artwork here — it will overwrite these PNGs.

## Import PNGs from Cursor chat exports (long filenames)

If Cursor saved attachments under a folder with names like `...frame-square-film-eid....png`, either:

1. **Run the importer** (pass the folder that contains your PNGs):

   ```bash
   npm run frames:import -- --from="C:\path\to\that\folder"
   ```

   It matches keywords in the filename (`green-bunting`, `blue-bunting`, `white-decorative`, `postage-stamp`).

2. Or create **`user-frame-exports/`** in the project root, drop your PNGs there, then:

   ```bash
   npm run frames:import
   ```

After importing, open each PNG and confirm transparent holes line up with `photoArea` in `src/app/utils/frames.ts` (adjust percentages and `ratio` = **image width ÷ height** if needed).
