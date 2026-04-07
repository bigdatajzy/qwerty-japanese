import type { Dict, DictCategory } from '@/types/dict'
import { hiraganaDicts } from './hiragana'
import { katakanaDicts } from './katakana'
import { e2eSmokeDict } from './e2e-smoke'

export const allDicts: Dict[] = [...hiraganaDicts, ...katakanaDicts, e2eSmokeDict]

export const dictCategories: DictCategory[] = [
  {
    id: 'hiragana',
    name: '平假名',
    description: '日语基础假名',
    dicts: hiraganaDicts
  },
  {
    id: 'katakana',
    name: '片假名',
    description: '片假名练习',
    dicts: katakanaDicts
  }
]

export function getDictById(id: string): Dict | undefined {
  return allDicts.find(dict => dict.id === id)
}

export function getDictsByType(type: 'hiragana' | 'katakana' | 'jlpt' | 'kanji'): Dict[] {
  return allDicts.filter(dict => dict.type === type)
}
