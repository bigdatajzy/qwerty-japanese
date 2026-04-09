import type { WordsManifest } from '@/types/dataManifest'
import type { PracticeWord } from '@/types/word'

const base = import.meta.env.BASE_URL

function assetUrl(relativePath: string): string {
  const p = relativePath.replace(/^\//, '')
  return `${base}${p}`
}

let manifestCache: WordsManifest | null = null

export function clearWordsManifestCache(): void {
  manifestCache = null
}

export async function fetchWordsManifest(): Promise<WordsManifest> {
  if (manifestCache) return manifestCache
  const res = await fetch(assetUrl('data/words/manifest.json'))
  if (!res.ok) throw new Error(`words manifest: ${res.status}`)
  manifestCache = (await res.json()) as WordsManifest
  return manifestCache
}

function parseWordChunkPayload(data: unknown): PracticeWord[] {
  if (Array.isArray(data)) return data as PracticeWord[]
  if (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: PracticeWord[] }).items
  }
  return []
}

/** 拉取单个分片 JSON 并解析为词条（供渐进加载或并行加载复用） */
export async function fetchWordChunk(chunkPath: string): Promise<PracticeWord[]> {
  const res = await fetch(assetUrl(chunkPath))
  if (!res.ok) return []
  const raw = await res.json()
  return parseWordChunkPayload(raw)
}

/** 拉取某词集下全部 chunk 并合并为词条列表（各分片并行请求） */
export async function loadWordsForSet(setId: string): Promise<PracticeWord[]> {
  const m = await fetchWordsManifest()
  const set = m.sets.find((s) => s.id === setId)
  if (!set?.chunks?.length) return []

  const parts = await Promise.all(set.chunks.map((p) => fetchWordChunk(p)))
  return parts.flat()
}

export interface WordSetLoadMeta {
  wordCount: number
  chunkPaths: string[]
}

/**
 * 先拉取第一个分片并回调，其余分片在 Promise 内顺序拉取并在每次合并后 onAppend。
 * 用于尽快进入练习页，后续词条在后台继续加载。
 */
export async function loadWordsForSetProgressive(
  setId: string,
  options: {
    onFirstChunk: (words: PracticeWord[], meta: WordSetLoadMeta) => void | Promise<void>
    onAppend: (allWords: PracticeWord[]) => void | Promise<void>
    /** 返回 false 时中止后续分片（例如路由已离开） */
    shouldContinue?: () => boolean
  },
): Promise<PracticeWord[]> {
  const m = await fetchWordsManifest()
  const set = m.sets.find((s) => s.id === setId)
  if (!set?.chunks?.length) return []

  const meta: WordSetLoadMeta = {
    wordCount: set.wordCount,
    chunkPaths: set.chunks,
  }

  const first = await fetchWordChunk(set.chunks[0])
  await options.onFirstChunk(first, meta)

  let merged = [...first]
  const cont = options.shouldContinue ?? (() => true)

  for (let i = 1; i < set.chunks.length; i++) {
    if (!cont()) break
    const chunk = await fetchWordChunk(set.chunks[i])
    merged = merged.concat(chunk)
    await options.onAppend(merged)
  }

  return merged
}
