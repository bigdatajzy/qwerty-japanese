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

/** 拉取某词集下全部 chunk 并合并为词条列表 */
export async function loadWordsForSet(setId: string): Promise<PracticeWord[]> {
  const m = await fetchWordsManifest()
  const set = m.sets.find((s) => s.id === setId)
  if (!set?.chunks?.length) return []

  const out: PracticeWord[] = []
  for (const chunkPath of set.chunks) {
    const res = await fetch(assetUrl(chunkPath))
    if (!res.ok) break
    const raw = await res.json()
    out.push(...parseWordChunkPayload(raw))
  }
  return out
}
