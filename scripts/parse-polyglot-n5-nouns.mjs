/**
 * 解析 polyglot101 N5 名词页 HTML（含主表 + 片假名词汇表），输出 PracticeWord 切片。
 * 用法：node scripts/parse-polyglot-n5-nouns.mjs [path/to/n5-nouns.html]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const htmlPath = process.argv[2]
if (!htmlPath) {
  console.error('用法: node scripts/parse-polyglot-n5-nouns.mjs <下载的 n5-nouns.html 路径>')
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
    const tds = [...tr.matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]))
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

const parts = content.split('<h2>片假名词汇</h2>')
const mainTableHtml = parts[0] || ''
const katakanaSection = parts[1] || ''

/** @type {{ kanji: string, hiragana: string, romaji: string, meaning: string }[]} */
const items = []

// 主表：名词 | 假名 | 读音 | 中文 | 英文
const mainRows = parseTrTds(mainTableHtml)
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

// 片假名表：假名 | 读音 | 中文 | 英文
const kataRows = parseTrTds(katakanaSection)
for (const cols of kataRows) {
  if (cols.length < 4) continue
  const [kana, romaji, meaning] = cols
  if (!kana) continue
  items.push({
    kanji: kana,
    hiragana: kana,
    romaji: romaji,
    meaning: meaning,
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
  const name = `n5-nouns-${String(idx + 1).padStart(2, '0')}.json`
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
  id: 'jlpt-n5-nouns',
  title: 'JLPT N5 名词',
  level: 'N5',
  description: '来源：polyglot101.com N5 名词页（含片假名词汇）',
  wordCount: items.length,
  chunks: chunkPaths,
}

const others = manifest.sets.filter((s) => s.id !== 'jlpt-n5-nouns')
manifest.sets = [...others, newSet]
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

console.log(JSON.stringify({ total: items.length, chunks: chunks.length, chunkPaths, outDir }, null, 2))
