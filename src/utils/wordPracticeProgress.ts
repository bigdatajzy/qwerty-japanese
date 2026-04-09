import type { TypingMode } from '@/types/typing'

const STORAGE_VERSION = 1 as const

export interface WordPracticeStoredV1 {
  v: typeof STORAGE_VERSION
  setId: string
  mode: TypingMode
  /** 当前要打的题在 session 中的下标 */
  currentIndex: number
  totalWords: number
  /** 随机模式：本次练习的固定顺序（词条 id） */
  wordIds?: string[]
  updatedAt: number
}

function key(setId: string, mode: TypingMode): string {
  return `qwerty-jp-word-progress:${STORAGE_VERSION}:${setId}:${mode}`
}

export function loadWordPracticeProgress(
  setId: string,
  mode: TypingMode,
): WordPracticeStoredV1 | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key(setId, mode))
    if (!raw) return null
    const j = JSON.parse(raw) as Partial<WordPracticeStoredV1>
    if (j.v !== STORAGE_VERSION || j.setId !== setId || j.mode !== mode) return null
    if (typeof j.currentIndex !== 'number' || typeof j.totalWords !== 'number') return null
    if (j.currentIndex < 0 || j.currentIndex > j.totalWords) return null
    return j as WordPracticeStoredV1
  } catch {
    return null
  }
}

export function saveWordPracticeProgress(
  payload: Omit<WordPracticeStoredV1, 'v' | 'updatedAt'>,
): void {
  if (typeof localStorage === 'undefined') return
  const full: WordPracticeStoredV1 = {
    v: STORAGE_VERSION,
    ...payload,
    updatedAt: Date.now(),
  }
  try {
    localStorage.setItem(key(payload.setId, payload.mode), JSON.stringify(full))
  } catch {
    // 配额满等：忽略
  }
}

export function clearWordPracticeProgress(setId: string, mode: TypingMode): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(key(setId, mode))
  } catch {
    /* noop */
  }
}

/** 词表列表页：展示各模式是否有未完成的进度 */
export function getWordPracticeResumeLabels(setId: string): {
  sequential?: string
  random?: string
} {
  const out: { sequential?: string; random?: string } = {}
  for (const mode of ['sequential', 'random'] as const) {
    const p = loadWordPracticeProgress(setId, mode)
    if (p && p.totalWords > 0 && p.currentIndex < p.totalWords) {
      out[mode] = `${p.currentIndex + 1}/${p.totalWords}`
    }
  }
  return out
}
