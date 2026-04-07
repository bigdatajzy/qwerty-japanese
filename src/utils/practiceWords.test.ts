import { describe, it, expect } from 'vitest'
import { orderedWordsForMode, shuffleArray } from './practiceWords'

describe('orderedWordsForMode', () => {
  it('顺序模式保持词表原始顺序', () => {
    const words = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(orderedWordsForMode(words, 'sequential')).toEqual(words)
  })

  it('随机模式长度与元素与输入一致（多重集）', () => {
    const words = ['a', 'b', 'c', 'd', 'e']
    const out = orderedWordsForMode(words, 'random')
    expect(out).toHaveLength(words.length)
    expect([...out].sort()).toEqual([...words].sort())
  })
})

describe('shuffleArray', () => {
  it('不修改原数组', () => {
    const a = [1, 2, 3]
    shuffleArray(a)
    expect(a).toEqual([1, 2, 3])
  })
})
