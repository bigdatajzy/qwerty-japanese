import { describe, expect, it } from 'vitest'
import { normalizeWordRomaji } from './wordRomaji'

describe('normalizeWordRomaji', () => {
  it('去重音并小写', () => {
    expect(normalizeWordRomaji('Tōkyō')).toBe('tokyo')
  })

  it('去首尾空白', () => {
    expect(normalizeWordRomaji('  a  ')).toBe('a')
  })

  it('空字符串', () => {
    expect(normalizeWordRomaji('')).toBe('')
  })
})
