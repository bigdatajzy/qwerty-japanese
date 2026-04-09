/**
 * 将 Bluskyo JLPT_Vocabulary parsedData CSV（Kanji,Reading）转为 PracticeWord JSON 切片并更新 manifest。
 * CSV 无释义：meaning 置空；romaji 由读音列用 wanakana 转写。
 *
 * 用法：
 *   node scripts/import-jlpt-csv.mjs --csv "D:/path/n3_vocab_cleaned.csv" --level N3 --id jlpt-n3-vocabulary --prefix n3-vocab
 *
 * 各等级：改 --csv、--level、--id、--prefix（如 N5 → n5-vocab、jlpt-n5-vocabulary）。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { toRomaji } from 'wanakana'

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseArgs(argv) {
  const o = { csv: '', level: 'N3', id: '', prefix: 'n3-vocab', chunk: 50 }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--csv' && argv[i + 1]) {
      o.csv = argv[++i]
    } else if (a === '--level' && argv[i + 1]) {
      o.level = argv[++i]
    } else if (a === '--id' && argv[i + 1]) {
      o.id = argv[++i]
    } else if (a === '--prefix' && argv[i + 1]) {
      o.prefix = argv[++i]
    } else if (a === '--chunk' && argv[i + 1]) {
      o.chunk = Math.max(1, parseInt(argv[++i], 10) || 50)
    }
  }
  if (!o.csv) {
    console.error('必须指定 --csv <文件路径>')
    process.exit(1)
  }
  if (!o.id) {
    o.id = `jlpt-${o.level.toLowerCase()}-vocabulary`
  }
  return o
}

/** @returns { { kanji: string, hiragana: string, romaji: string, meaning: string }[] } */
function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const header = lines[0].toLowerCase()
  if (!header.includes('kanji') || !header.includes('reading')) {
    console.warn('表头非预期 Kanji,Reading，仍按首行后解析')
  }
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const comma = line.indexOf(',')
    if (comma < 0) continue
    const kanji = line.slice(0, comma).trim()
    const reading = line.slice(comma + 1).trim()
    if (!reading && !kanji) continue
    let romaji = ''
    try {
      romaji = toRomaji(reading || kanji).toLowerCase()
    } catch {
      romaji = ''
    }
    rows.push({
      kanji,
      hiragana: reading || kanji,
      romaji,
      meaning: '',
    })
  }
  return rows
}

const args = parseArgs(process.argv)
const CHUNK = args.chunk
const outDir = join(__dirname, '..', 'public', 'data', 'words', 'jlpt')

const raw = readFileSync(args.csv, 'utf8')
const items = parseCsv(raw)

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
  const name = `${args.prefix}-${String(idx + 1).padStart(2, '0')}.json`
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
  id: args.id,
  title: `JLPT ${args.level} 单词`,
  level: args.level,
  description: 'JLPT_Vocabulary',
  wordCount: items.length,
  chunks: chunkPaths,
}

manifest.sets = [...manifest.sets.filter((s) => s.id !== args.id), newSet]
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

console.log(
  JSON.stringify(
    {
      setId: args.id,
      total: items.length,
      chunks: chunks.length,
      chunkPaths,
      outDir,
    },
    null,
    2,
  ),
)
