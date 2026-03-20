/**
 * Copy Cursor/chat-exported frame PNGs (long filenames) into public/frames/*.png
 *
 * Usage:
 *   node scripts/import-chat-frames.mjs "C:\path\to\folder\with\exports"
 *   node scripts/import-chat-frames.mjs   (uses default guess paths below)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const OUT = path.join(root, 'public', 'frames')

/** First matching substring wins; copy to public/frames/<to>.png */
const MAP = [
  { match: 'green-bunting', to: 'green-bunting' },
  { match: 'blue-bunting', to: 'blue-bunting' },
  { match: 'white-decorative', to: 'white-decorative' },
  { match: 'postage-stamp', to: 'postage-stamp' },
]

function defaultSearchRoots() {
  const home = process.env.USERPROFILE || process.env.HOME || ''
  return [
    path.join(root, 'user-frame-exports'),
    path.join(home, '.cursor', 'projects', 'c-Users-HP-OneDrive-Desktop-eid-photo-booth', 'assets'),
  ].filter(Boolean)
}

function collectPngs(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) collectPngs(p, acc)
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.png')) acc.push(p)
  }
  return acc
}

function pickMapping(filePath) {
  const base = path.basename(filePath).toLowerCase()
  for (const { match, to } of MAP) {
    if (base.includes(match)) return to
  }
  return null
}

const argDir = process.argv.find((a) => a.startsWith('--from='))?.slice('--from='.length)
const roots = argDir ? [path.resolve(argDir)] : defaultSearchRoots()

const pngs = roots.flatMap((r) => collectPngs(r))
const usedTargets = new Set()

if (!pngs.length) {
  console.error('No PNG files found. Pass a folder:')
  console.error('  node scripts/import-chat-frames.mjs --from="C:\\path\\to\\exports"')
  console.error('Or create', path.join('user-frame-exports'), 'and drop your six PNGs there.')
  process.exit(1)
}

fs.mkdirSync(OUT, { recursive: true })
let copied = 0
for (const file of pngs) {
  const to = pickMapping(file)
  if (!to || usedTargets.has(to)) continue
  const dest = path.join(OUT, `${to}.png`)
  fs.copyFileSync(file, dest)
  usedTargets.add(to)
  console.log('copied', path.basename(file), '->', path.relative(root, dest))
  copied++
}

if (copied === 0) {
  console.error('PNG files found but no names matched. Filenames should include:', MAP.map((m) => m.match).join(', '))
  process.exit(1)
}

console.log(`Done. ${copied} file(s). Update photoArea in src/app/utils/frames.ts if holes look misaligned.`)
