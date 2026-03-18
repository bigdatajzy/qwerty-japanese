export interface KanaWord {
  id: string
  kana: string      // 假名: あ
  romaji: string   // 罗马字: a
  meaning?: string // 释义（可选）
}

export interface Dict {
  id: string
  name: string
  description: string
  type: 'hiragana' | 'katakana' | 'jlpt' | 'kanji'
  words: KanaWord[]
}

export interface DictCategory {
  id: string
  name: string
  description: string
  dicts: Dict[]
}
