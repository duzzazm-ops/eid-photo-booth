/**
 * Rasterizes src/assets/frames/*.svg to public/frames/*.png (RGBA),
 * then punches fully transparent holes using the same photoArea % as frames.ts.
 *
 * To use YOUR real Figma PNGs: replace the files in public/frames/ (same filenames)
 * with transparent-center PNGs — you can delete this script from prebuild if unused.
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SVG_DIR = path.join(root, 'src', 'assets', 'frames')
const OUT_DIR = path.join(root, 'public', 'frames')
const W = 900
const H = 1200

/** @type {{ svg: string, png: string, holes: [number, number, number, number][] }[]} */
const FRAMES = [
  { svg: 'film-landscape.svg', png: 'film-landscape.png', holes: [[12, 12, 76, 76]] },
  { svg: 'green-bunting.svg', png: 'green-bunting.png', holes: [[4, 6, 92, 83]] },
  { svg: 'blue-bunting.svg', png: 'blue-bunting.png', holes: [[4, 6, 92, 83]] },
  { svg: 'white-decorative.svg', png: 'white-decorative.png', holes: [[8, 6, 84, 74]] },
  { svg: 'postage-stamp.svg', png: 'postage-stamp.png', holes: [[6, 6, 88, 72]] },
  {
    svg: 'film-strip.svg',
    png: 'film-strip.png',
    holes: [
      [15, 15, 70, 17.5],
      [15, 32.5, 70, 17.5],
      [15, 50, 70, 17.5],
      [15, 67.5, 70, 17.5],
    ],
  },
]

/**
 * @param {Buffer} data
 * @param {import('sharp').RawMetadata} info
 * @param {[number, number, number, number][]} holes percent x,y,w,h
 */
function punchHoles(data, info, holes) {
  const { width, height, channels } = info
  if (channels < 4) throw new Error('Expected RGBA')
  for (const [px, py, pw, ph] of holes) {
    const x0 = Math.max(0, Math.floor((px / 100) * width))
    const y0 = Math.max(0, Math.floor((py / 100) * height))
    const x1 = Math.min(width, Math.ceil(((px + pw) / 100) * width))
    const y1 = Math.min(height, Math.ceil(((py + ph) / 100) * height))
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * width + x) * channels + 3
        data[i] = 0
      }
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const f of FRAMES) {
  const svgPath = path.join(SVG_DIR, f.svg)
  if (!fs.existsSync(svgPath)) {
    console.warn('skip (missing svg):', svgPath)
    continue
  }
  const outPath = path.join(OUT_DIR, f.png)
  const { data, info } = await sharp(svgPath)
    .resize(W, H)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  punchHoles(data, info, f.holes)

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(outPath)

  console.log('wrote', path.relative(root, outPath))
}
