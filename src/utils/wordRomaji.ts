/**
 * 词库 JSON 中罗马字可能含长音符号（如 tōkyō），与用户 ASCII 输入对齐比较用。
 */
export function normalizeWordRomaji(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}
