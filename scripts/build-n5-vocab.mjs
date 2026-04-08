/**
 * 从 polyglot101 N5 词汇页整理的数据（结构与 public 单词切片一致）
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'data', 'words', 'jlpt')

/** @type {{ hiragana: string, kanji: string, romaji: string, meaning: string }[]} */
const rows = []

// —— 主表（与页面「日语 | 日语 | 读音 | 中文 | 英文」列一致）——
const main = [
  ['', 'ちょっと', 'chotto', '有一点'],
  ['丁度', 'ちょうど', 'choudo', '只是'],
  ['大丈夫', 'だいじょうぶ', 'daijoubu', '不用担心'],
  ['', 'だんだん', 'dandan', '逐步地'],
  ['', 'どう', 'dou', '铜'],
  ['', 'どうも', 'doumo', '谢谢'],
  ['', 'どうして', 'doushite', '为什么'],
  ['', 'どうぞ', 'douzo', '请'],
  ['初めて', 'はじめて', 'hajimete', '第一次'],
  ['', 'いかが', 'ikaga', '怎么样？'],
  ['', 'いくら', 'ikura', '多少'],
  ['', 'いくつ', 'ikutsu', '多少'],
  ['色々', 'いろいろ', 'iroiro', '各种各样的'],
  ['一緒に', 'いっしょに', 'issho ni', '一起'],
  ['', 'いつも', 'itsumo', '每次'],
  ['結構', 'けっこう', 'kekkou', '相当'],
  ['', 'まだ', 'mada', '仍然'],
  ['', 'まだ～ていません', 'mada~te imasen', '还没有'],
  ['前に', 'まえに', 'mae ni', '前'],
  ['真っ直ぐ', 'まっすぐ', 'massugu', '直的'],
  ['', 'みんな', 'minna', '每个人'],
  ['', 'もっと', 'motto', '更多的'],
  ['', 'もう', 'mou', '已经'],
  ['何故', 'なぜ', 'naze', '为什么'],
  ['同じ', 'おなじ', 'onaji', '相同的'],
  ['直ぐに', 'すぐに', 'sugu ni', '立即地'],
  ['少し', 'すこし', 'sukoshi', '一点'],
  ['多分', 'たぶん', 'tabun', '也许'],
  ['大変', 'たいへん', 'taihen', '非常'],
  ['時々', 'ときどき', 'tokidoki', '有时'],
  ['', 'とても', 'totemo', '非常'],
  ['', 'よく', 'yoku', '经常'],
  ['', 'ゆっくり', 'yukkuri', '慢慢地'],
]
for (const [kanji, hiragana, romaji, meaning] of main) {
  rows.push({ kanji: kanji || '', hiragana, romaji, meaning })
}

// —— 颜色（专题表拆成词条；无中文列时用常见释义）——
const colors = [
  ['赤', 'あか', 'aka', '红色'],
  ['赤い', 'あかい', 'akai', '红色的'],
  ['青', 'あお', 'ao', '蓝色'],
  ['青い', 'あおい', 'aoi', '蓝色的'],
  ['黄色い', 'きいろい', 'kiiroi', '黄色的'],
  ['黒', 'くろ', 'kuro', '黑色'],
  ['黒い', 'くろい', 'kuroi', '黑色的'],
  ['白', 'しろ', 'shiro', '白色'],
  ['白い', 'しろい', 'shiroi', '白色的'],
  ['茶色', 'ちゃいろ', 'chairo', '茶色'],
  ['緑', 'みどり', 'midori', '绿色'],
]
for (const [kanji, hiragana, romaji, meaning] of colors) {
  rows.push({ kanji, hiragana, romaji, meaning })
}

// —— 数字（与页面中文列一致）——
const numbers = [
  ['零', 'れい', 'rei', '零'],
  ['一', 'いち', 'ichi', '一'],
  ['一番', 'いちばん', 'ichiban', '第一；最'],
  ['一階', 'いっかい', 'ikkai', '一楼'],
  ['一日', 'いちにち', 'ichinichi', '一天'],
  ['一日', 'ついたち', 'tsuitachi', '(每月)一号'],
  ['一人', 'ひとり', 'hitori', '一人；一个人'],
  ['一つ', 'ひとつ', 'hitotsu', '一个（通用量词）'],
  ['二', 'に', 'ni', '二'],
  ['二階', 'にかい', 'nikai', '二楼'],
  ['二人', 'ふたり', 'futari', '两人；两个人'],
  ['二つ', 'ふたつ', 'futatsu', '两个'],
  ['二日', 'ふつか', 'futsuka', '(每月)二号'],
  ['三', 'さん', 'san', '三'],
  ['三つ', 'みっつ', 'mittsu', '三个'],
  ['三日', 'みっか', 'mikka', '(每月)三号'],
  ['四', 'し', 'shi', '四'],
  ['四つ', 'よつ', 'yotsu', '四个'],
  ['四日', 'よっか', 'yokka', '(每月)四号'],
  ['五', 'ご', 'go', '五'],
  ['五日', 'いつか', 'itsuka', '(每月)五号'],
  ['五つ', 'いつつ', 'itsutsu', '五个'],
  ['六', 'ろく', 'roku', '六'],
  ['六日', 'むいか', 'muika', '(每月)六号'],
  ['六つ', 'むっつ', 'muttsu', '六个'],
  ['七', 'しち', 'shichi', '七'],
  ['七つ', 'ななつ', 'nanatsu', '七个'],
  ['七日', 'なのか', 'nanoka', '(每月)七号'],
  ['八', 'はち', 'hachi', '八'],
  ['八つ', 'やっつ', 'yattsu', '八个'],
  ['八日', 'ようか', 'youka', '(每月)八号'],
  ['九日', 'ここのか', 'kokonoka', '(每月)九号'],
  ['九つ', 'ここのつ', 'kokonotsu', '九个'],
  ['十', 'じゅう', 'juu', '十'],
  ['十日', 'とおか', 'tooka', '(每月)十号'],
  ['二十歳', 'はたち', 'hatachi', '二十岁'],
  ['二十日', 'はつか', 'hatsuka', '(每月)二十号'],
  ['千', 'せん', 'sen', '千'],
  ['万', 'まん', 'man', '万'],
]
for (const [kanji, hiragana, romaji, meaning] of numbers) {
  rows.push({ kanji, hiragana, romaji, meaning })
}

// —— 星期 ——
const weekdays = [
  ['月曜日', 'げつようび', 'getsuyoubi', '星期一'],
  ['火曜日', 'かようび', 'kayoubi', '星期二'],
  ['水曜日', 'すいようび', 'suiyoubi', '星期三'],
  ['木曜日', 'もくようび', 'mokuyoubi', '星期四'],
  ['金曜日', 'きんようび', 'kinyoubi', '星期五'],
  ['土曜日', 'どようび', 'doyoubi', '星期六'],
  ['日曜日', 'にちようび', 'nichiyoubi', '星期日'],
]
for (const [kanji, hiragana, romaji, meaning] of weekdays) {
  rows.push({ kanji, hiragana, romaji, meaning })
}

const CHUNK = 50
const chunks = []
for (let i = 0; i < rows.length; i += CHUNK) {
  const slice = rows.slice(i, i + CHUNK).map((r, j) => ({
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
  const name = `n5-vocabulary-${String(idx + 1).padStart(2, '0')}.json`
  const rel = `data/words/jlpt/${name}`
  chunkPaths.push(rel)
  writeFileSync(join(outDir, name), JSON.stringify(chunk, null, 2), 'utf8')
})

const manifest = {
  schemaVersion: 1,
  kind: 'words-manifest',
  sets: [
    {
      id: 'jlpt-n5-vocabulary',
      title: 'JLPT N5 词汇',
      level: 'N5',
      description: '来源：polyglot101.com N5 词汇页（含专题与星期）',
      wordCount: rows.length,
      chunks: chunkPaths,
    },
  ],
}

writeFileSync(join(__dirname, '..', 'public', 'data', 'words', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')

console.log(`Wrote ${rows.length} words in ${chunks.length} chunk(s) -> ${outDir}`)
