import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TypingMode, TypingError, TypingResult } from '@/types/typing'
import type { KanaWord } from '@/types/dict'
import { getDictById } from '@/data/dicts'
import { createLogger } from '@/utils/logger'
import { orderedWordsForMode } from '@/utils/practiceWords'

const logger = createLogger('TypingStore')

export const useTypingStore = defineStore('typing', () => {
  const dictId = ref<string>('')
  const mode = ref<TypingMode>('random')
  const words = ref<KanaWord[]>([])
  const shuffledWords = ref<KanaWord[]>([])
  const currentIndex = ref(0)
  const correctCount = ref(0)
  const errorCount = ref(0)
  const errors = ref<TypingError[]>([])
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)
  const inputValue = ref('')
  const isStarted = ref(false)
  const isCompleted = ref(false)

  const currentWord = computed(() => shuffledWords.value[currentIndex.value] || null)
  const nextWord = computed(() => shuffledWords.value[currentIndex.value + 1] || null)
  const totalWords = computed(() => shuffledWords.value.length)
  const progress = computed(() => 
    totalWords.value > 0 ? (currentIndex.value / totalWords.value) * 100 : 0
  )
  const wpm = computed(() => {
    if (!startTime.value || correctCount.value === 0) return 0
    const elapsed = (Date.now() - startTime.value) / 1000 / 60
    return Math.round(correctCount.value / elapsed) || 0
  })
  const accuracy = computed(() => {
    const total = correctCount.value + errorCount.value
    return total > 0 ? Math.round((correctCount.value / total) * 100) : 0
  })

  function initPractice(selectedDictId: string, selectedMode: TypingMode = 'random') {
    const dict = getDictById(selectedDictId)
    if (!dict) {
      logger.error('词典不存在', { dictId: selectedDictId })
      return
    }

    dictId.value = selectedDictId
    mode.value = selectedMode
    words.value = dict.words
    shuffledWords.value = orderedWordsForMode(dict.words, selectedMode)
    
    currentIndex.value = 0
    correctCount.value = 0
    errorCount.value = 0
    errors.value = []
    startTime.value = null
    endTime.value = null
    inputValue.value = ''
    isStarted.value = false
    isCompleted.value = false

    logger.info('练习初始化', { dictId: selectedDictId, mode: selectedMode, wordCount: dict.words.length })
  }

  function startPractice() {
    isStarted.value = true
    startTime.value = Date.now()
    logger.info('练习开始')
  }

  function handleInput(input: string, inputMode: 'romaji' | 'kana' = 'romaji'): { correct: boolean; expected: string } | null {
    if (!currentWord.value || !isStarted.value) return null

    const expected = currentWord.value.romaji.toLowerCase()
    const expectedKana = currentWord.value.kana
    const userInput = input.toLowerCase().trim()

    let isCorrect = false
    
    if (inputMode === 'romaji') {
      // 罗马字输入模式
      isCorrect = userInput === expected
    } else {
      // 假名输入模式
      isCorrect = input === expectedKana
    }

    if (isCorrect) {
      correctCount.value++
      logger.debug('输入正确', { 
        word: currentWord.value.kana, 
        expected: inputMode === 'romaji' ? expected : expectedKana, 
        userInput 
      })
      
      inputValue.value = ''
      currentIndex.value++

      if (currentIndex.value >= totalWords.value) {
        completePractice()
      }

      return { correct: true, expected: inputMode === 'romaji' ? expected : expectedKana }
    } else if ((inputMode === 'romaji' && expected.startsWith(userInput)) || 
               (inputMode === 'kana' && expectedKana.startsWith(input))) {
      // 输入中，继续等待
      return null
    } else {
      errorCount.value++
      errors.value.push({
        word: currentWord.value.kana,
        expected: inputMode === 'romaji' ? expected : expectedKana,
        actual: userInput,
        timestamp: Date.now()
      })
      logger.debug('输入错误', { 
        word: currentWord.value.kana, 
        expected: inputMode === 'romaji' ? expected : expectedKana, 
        userInput 
      })
      
      return { correct: false, expected: inputMode === 'romaji' ? expected : expectedKana }
    }
  }

  function completePractice() {
    endTime.value = Date.now()
    isCompleted.value = true
    logger.info('练习完成', { 
      total: totalWords.value, 
      correct: correctCount.value, 
      errors: errorCount.value 
    })
  }

  function getResult(): TypingResult {
    const duration = startTime.value && endTime.value 
      ? (endTime.value - startTime.value) / 1000 
      : 0

    return {
      wpm: wpm.value,
      accuracy: accuracy.value,
      totalWords: totalWords.value,
      correctCount: correctCount.value,
      errorCount: errorCount.value,
      duration,
      errors: errors.value
    }
  }

  function reset() {
    currentIndex.value = 0
    correctCount.value = 0
    errorCount.value = 0
    errors.value = []
    inputValue.value = ''
    isStarted.value = false
    isCompleted.value = false
    startTime.value = null
    endTime.value = null
  }

  return {
    dictId,
    mode,
    words,
    shuffledWords,
    currentIndex,
    correctCount,
    errorCount,
    errors,
    startTime,
    endTime,
    inputValue,
    isStarted,
    isCompleted,
    currentWord,
    nextWord,
    totalWords,
    progress,
    wpm,
    accuracy,
    initPractice,
    startPractice,
    handleInput,
    getResult,
    reset
  }
})
