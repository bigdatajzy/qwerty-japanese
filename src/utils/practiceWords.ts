import type { TypingMode } from '@/types/typing'

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 按练习模式生成题目顺序（顺序 = 词表原始顺序，随机 = Fisher–Yates 打乱） */
export function orderedWordsForMode<T>(words: T[], mode: TypingMode): T[] {
  if (mode === 'random') return shuffleArray([...words])
  return [...words]
}
