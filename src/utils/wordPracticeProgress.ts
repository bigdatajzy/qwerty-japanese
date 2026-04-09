/** 单词练习本地进度（仅顺序出题，按词集 id 存一份） */

const STORAGE_V2 = 2 as const
const STORAGE_V1 = 1 as const

export interface WordPracticeStored {
  v: typeof STORAGE_V2
  setId: string
  currentIndex: number
  totalWords: number
  updatedAt: number
}

function keyV2(setId: string): string {
  return `qwerty-jp-word-progress:${STORAGE_V2}:${setId}`
}

/** 旧版顺序进度（迁移用） */
function keyV1Sequential(setId: string): string {
  return `qwerty-jp-word-progress:${STORAGE_V1}:${setId}:sequential`
}

function keyV1Random(setId: string): string {
  return `qwerty-jp-word-progress:${STORAGE_V1}:${setId}:random`
}

function tryParseV2(raw: string, setId: string): WordPracticeStored | null {
  try {
    const j = JSON.parse(raw) as Partial<WordPracticeStored>
    if (j.v !== STORAGE_V2 || j.setId !== setId) return null
    if (typeof j.currentIndex !== 'number' || typeof j.totalWords !== 'number') return null
    if (j.currentIndex < 0 || j.currentIndex > j.totalWords) return null
    return j as WordPracticeStored
  } catch {
    return null
  }
}

/** 读取 v1 顺序存档并转为 v2 内存结构（不写回，由 save 时自然升级） */
function tryMigrateV1Sequential(raw: string, setId: string): WordPracticeStored | null {
  try {
    const j = JSON.parse(raw) as {
      v?: number
      setId?: string
      mode?: string
      currentIndex?: number
      totalWords?: number
    }
    if (j.v !== STORAGE_V1 || j.setId !== setId || j.mode !== 'sequential') return null
    if (typeof j.currentIndex !== 'number' || typeof j.totalWords !== 'number') return null
    if (j.currentIndex < 0 || j.currentIndex > j.totalWords) return null
    return {
      v: STORAGE_V2,
      setId,
      currentIndex: j.currentIndex,
      totalWords: j.totalWords,
      updatedAt: Date.now(),
    }
  } catch {
    return null
  }
}

export function loadWordPracticeProgress(setId: string): WordPracticeStored | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const k2 = keyV2(setId)
    const raw2 = localStorage.getItem(k2)
    if (raw2) {
      const p = tryParseV2(raw2, setId)
      if (p) return p
    }
    const raw1 = localStorage.getItem(keyV1Sequential(setId))
    if (raw1) {
      return tryMigrateV1Sequential(raw1, setId)
    }
    return null
  } catch {
    return null
  }
}

export function saveWordPracticeProgress(
  payload: Omit<WordPracticeStored, 'v' | 'updatedAt'>,
): void {
  if (typeof localStorage === 'undefined') return
  const full: WordPracticeStored = {
    v: STORAGE_V2,
    ...payload,
    updatedAt: Date.now(),
  }
  try {
    localStorage.setItem(keyV2(payload.setId), JSON.stringify(full))
  } catch {
    /* 配额满等 */
  }
}

export function clearWordPracticeProgress(setId: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(keyV2(setId))
    localStorage.removeItem(keyV1Sequential(setId))
    localStorage.removeItem(keyV1Random(setId))
  } catch {
    /* noop */
  }
}

/** 词表列表页：单行「上次进度」文案，无则空串 */
export function getWordPracticeResumeLabel(setId: string): string {
  const p = loadWordPracticeProgress(setId)
  if (!p || p.totalWords <= 0 || p.currentIndex >= p.totalWords) return ''
  return `${p.currentIndex + 1}/${p.totalWords}`
}
