export type TypingMode = 'sequential' | 'random' | 'blind'

export interface TypingState {
  dictId: string
  mode: TypingMode
  currentIndex: number
  totalWords: number
  correctCount: number
  errorCount: number
  startTime: number | null
  endTime: number | null
  errors: TypingError[]
}

export interface TypingError {
  word: string
  expected: string
  actual: string
  timestamp: number
}

export interface TypingResult {
  wpm: number
  accuracy: number
  totalWords: number
  correctCount: number
  errorCount: number
  duration: number
  errors: TypingError[]
}
