/**
 * 解析 polyglot101 JLPT N4 名词页 HTML（单表：名词 | 平假名 | 罗马化 | 中文 | 英文）
 * 用法：node scripts/parse-polyglot-n4-nouns.mjs <path/to/n4-nouns.html>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const htmlPath = process.argv[2]
if (!htmlPath) {
  console.error('用法: node scripts/parse-polyglot-n4-nouns.mjs <下载的 n4-nouns.html 路径>')
  process.exit(1)
}
const outDir = join(__dirname, '..', 'public', 'data', 'words', 'jlpt')
const CHUNK = 50

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

/** @returns {string[][]} */
function parseTrTds(tableHtml) {
  const rows = []
  const trs = tableHtml.match(/<tr>[\s\S]*?<\/tr>/g) || []
  for (const tr of trs) {
    const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]))
    if (tds.length > 0) rows.push(tds)
  }
  return rows
}

const raw = readFileSync(htmlPath, 'utf8')
const m = raw.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
if (!m) throw new Error('__NEXT_DATA__ not found')
const data = JSON.parse(m[1])
const content = data.props?.pageProps?.content
if (typeof content !== 'string') throw new Error('pageProps.content missing')

const mainRows = parseTrTds(content)
/** @type {{ kanji: string, hiragana: string, romaji: string, meaning: string }[]} */
const items = []

for (const cols of mainRows) {
  if (cols.length < 4) continue
  const [c0, c1, c2, c3] = cols
  if (!c1 && !c0) continue
  items.push({
    kanji: c0 || '',
    hiragana: c1,
    romaji: c2,
    meaning: c3,
  })
}

const chunks = []
for (let i = 0; i < items.length; i += CHUNK) {
  const slice = items.slice(i, i + CHUNK).map((r, j) => ({
    id: String(i + j + 1),
    hiragana: r.hiragana,
    kanji: r.kanji,
    meaning: r.meaning,
    romaji: r.romaji,
  }))
  chunks.push(slice)
}

mkdirSync(outDir, { recursive: true })

const chunkPaths = []
chunks.forEach((chunk, idx) => {
  const name = `n4-nouns-${String(idx + 1).padStart(2, '0')}.json`
  const rel = `data/words/jlpt/${name}`
  chunkPaths.push(rel)
  writeFileSync(join(outDir, name), JSON.stringify(chunk, null, 2), 'utf8')
})

const manifestPath = join(__dirname, '..', 'public', 'data', 'words', 'manifest.json')
let manifest
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
} catch {
  manifest = { schemaVersion: 1, kind: 'words-manifest', sets: [] }
}

const newSet = {
  id: 'jlpt-n4-nouns',
  title: 'JLPT N4 名词',
  level: 'N4',
  description: '来源：polyglot101.com N4 名词页',
  wordCount: items.length,
  chunks: chunkPaths,
}

manifest.sets = [...manifest.sets.filter((s) => s.id !== 'jlpt-n4-nouns'), newSet]
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

console.log(JSON.stringify({ total: items.length, chunks: chunks.length, chunkPaths, outDir }, null, 2))
