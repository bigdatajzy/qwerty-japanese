import { describe, it, expect } from 'vitest'
import { romajiToKana, isValidRomaji } from './romaji'

describe('romajiToKana', () => {
  it('基础元音', () => {
    expect(romajiToKana('a')).toBe('あ')
    expect(romajiToKana('I')).toBe('い')
  })

  it('し行与浊音', () => {
    expect(romajiToKana('shi')).toBe('し')
    expect(romajiToKana('tsu')).toBe('つ')
  })
})

describe('isValidRomaji', () => {
  it('识别已收录键', () => {
    expect(isValidRomaji('ka')).toBe(true)
    expect(isValidRomaji('xyz')).toBe(false)
  })
})
