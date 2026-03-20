/**
 * Detect photo opening: flood-fill transparent pixels from image center.
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '..', 'public', 'frames')
const ALPHA_OPAQUE = 128

function toPct(b, w, h) {
  if (!b) return null
  const x = (b.minX / w) * 100
  const y = (b.minY / h) * 100
  const width = ((b.maxX - b.minX + 1) / w) * 100
  const height = ((b.maxY - b.minY + 1) / h) * 100
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
  }
}

/**
 * @param marginFrac ignore pixels outside [margin*w, (1-margin)*w] etc. when set — avoids
 *   outer-canvas transparency merging with the photo hole (e.g. square film frame on transparent PNG).
 */
function floodTransparentBBox(data, width, height, channels, seedX, seedY, clipY0, clipY1, marginFrac) {
  const clip = clipY0 != null && clipY1 != null
  const mx0 = marginFrac != null ? Math.floor(width * marginFrac) : 0
  const mx1 = marginFrac != null ? Math.ceil(width * (1 - marginFrac)) : width
  const my0 = marginFrac != null ? Math.floor(height * marginFrac) : 0
  const my1 = marginFrac != null ? Math.ceil(height * (1 - marginFrac)) : height
  const isTrans = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    if (x < mx0 || x >= mx1 || y < my0 || y >= my1) return false
    if (clip && (y < clipY0 || y >= clipY1)) return false
    const a = data[(y * width + x) * channels + 3]
    return a < ALPHA_OPAQUE
  }
  if (!isTrans(seedX, seedY)) return null

  const seen = new Uint8Array(width * height)
  const q = [[seedX, seedY]]
  const idx = (x, y) => y * width + x
  let qi = 0
  let minX = seedX
  let maxX = seedX
  let minY = seedY
  let maxY = seedY
  seen[idx(seedX, seedY)] = 1

  while (qi < q.length) {
    const [x, y] = q[qi++]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      if (nx < mx0 || nx >= mx1 || ny < my0 || ny >= my1) continue
      if (clip && (ny < clipY0 || ny >= clipY1)) continue
      const ii = idx(nx, ny)
      if (seen[ii]) continue
      if (!isTrans(nx, ny)) continue
      seen[ii] = 1
      q.push([nx, ny])
    }
  }
  return { minX, minY, maxX, maxY }
}

async function holeFromCenter(file, marginFrac = 0.08) {
  const p = path.join(dir, file)
  const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const sx = Math.floor(width / 2)
  const sy = Math.floor(height / 2)
  const b = floodTransparentBBox(data, width, height, channels, sx, sy, undefined, undefined, marginFrac)
  return { file, hole: toPct(b, width, height) }
}

const FILES = [
  'film-landscape.png',
  'green-bunting.png',
  'blue-bunting.png',
  'white-decorative.png',
  'postage-stamp.png',
]

for (const f of FILES) {
  if (!fs.existsSync(path.join(dir, f))) continue
  console.log(JSON.stringify(await holeFromCenter(f)))
}
