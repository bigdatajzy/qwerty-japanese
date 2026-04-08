<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSound } from '@/composables/useSound'
import { useSettingsStore } from '@/stores/settings'
import { orderedWordsForMode } from '@/utils/practiceWords'
import type { TypingMode } from '@/types/typing'
import { normalizeWordRomaji } from '@/utils/wordRomaji'
import type { PracticeWord } from '@/types/word'
import { loadWordsForSet } from '@/api/wordsData'
import { recordPracticeSession } from '@/utils/practiceStatsDb'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const { playCorrect, playError, playComplete } = useSound()

const words = ref<PracticeWord[]>([])
const sessionWords = ref<PracticeWord[]>([])
const isLoading = ref(true)
const loadError = ref(false)

const currentIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const inputStatus = ref<'default' | 'correct' | 'error'>('default')
const showErrorHint = ref(false)
const showReadingHint = ref(false)

const correctCount = ref(0)
const errorCount = ref(0)
const errors = ref<{ word: string; expected: string; actual: string }[]>([])

const startTime = ref<number | null>(null)
const isStarted = ref(false)

const level = computed(() => route.params.level as string)

function resolveOrderMode(): TypingMode {
  const m = route.query.mode
  const raw = typeof m === 'string' ? m : Array.isArray(m) ? m[0] : ''
  if (raw === 'order' || raw === 'sequential') return 'sequential'
  return 'random'
}

const currentWord = computed(() => sessionWords.value[currentIndex.value] || null)
const nextWord = computed(() => sessionWords.value[currentIndex.value + 1] || null)
const totalWords = computed(() => sessionWords.value.length)
const progress = computed(() =>
  totalWords.value > 0 ? (currentIndex.value / totalWords.value) * 100 : 0,
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

const inputMode = computed(() => settingsStore.settings.inputMode ?? 'romaji')

function displayTarget(w: PracticeWord | null): string {
  if (!w) return '?'
  const k = w.kanji?.trim()
  return k || w.hiragana
}

function settings() {
  return settingsStore.settings
}

function toggleSound() {
  const s = settings()
  if (!s.sound) {
    s.sound = { enabled: true, correctSound: true, errorSound: true, completeSound: true, volume: 70 }
  }
  s.sound.enabled = !s.sound.enabled
}

function toggleInputMode() {
  settingsStore.toggleInputMode()
  inputValue.value = ''
  inputRef.value?.focus()
}

async function loadWords() {
  isLoading.value = true
  loadError.value = false
  words.value = []
  try {
    words.value = await loadWordsForSet(level.value)
  } catch {
    loadError.value = true
  }
  if (words.value.length === 0) loadError.value = true
  sessionWords.value = orderedWordsForMode(words.value, resolveOrderMode())
  isLoading.value = false
}

function startSession() {
  if (isStarted.value) return
  isStarted.value = true
  startTime.value = Date.now()
}

async function finishPractice() {
  const endTime = Date.now()
  playComplete()
  const durationSec = startTime.value ? (endTime - startTime.value) / 1000 : 0
  const durMin = durationSec / 60
  const wpmFinal = durMin > 0 ? Math.round(correctCount.value / durMin) : 0
  const acc =
    correctCount.value + errorCount.value > 0
      ? Math.round((correctCount.value / (correctCount.value + errorCount.value)) * 100)
      : 0
  sessionStorage.setItem(
    'word-result',
    JSON.stringify({
      totalWords: totalWords.value,
      correctCount: correctCount.value,
      errorCount: errorCount.value,
      level: level.value,
      practiceMode: resolveOrderMode(),
      wpm: wpmFinal,
      duration: durationSec,
      accuracy: acc,
      errors: errors.value,
    }),
  )
  await recordPracticeSession({
    type: 'word',
    sourceId: level.value,
    sourceName: `${level.value.toUpperCase()} 单词`,
    startedAt: startTime.value || endTime,
    endedAt: endTime,
    durationSec,
    unitsTotal: totalWords.value,
    unitsCorrect: correctCount.value,
    unitsError: errorCount.value,
    accuracy: acc,
    wpm: wpmFinal,
  })
  router.push({ name: 'result' })
}

function advanceOrFinish() {
  currentIndex.value++
  if (currentIndex.value >= totalWords.value) finishPractice()
}

function handleInput() {
  const w = currentWord.value
  if (!w || loadError.value) return

  startSession()

  const mode = inputMode.value
  const userRaw = inputValue.value

  if (mode === 'romaji') {
    const userN = normalizeWordRomaji(userRaw)
    const expN = normalizeWordRomaji(w.romaji)
    if (userN === expN) {
      inputStatus.value = 'correct'
      showErrorHint.value = false
      inputValue.value = ''
      playCorrect()
      setTimeout(() => {
        inputStatus.value = 'default'
        advanceOrFinish()
      }, 200)
      return
    }
    if (userRaw.length > 0 && expN.startsWith(userN)) return

    errorCount.value++
    errors.value.push({ word: displayTarget(w), expected: w.romaji, actual: userRaw })
    inputStatus.value = 'error'
    showErrorHint.value = true
    playError()
    setTimeout(() => {
      inputStatus.value = 'default'
      inputValue.value = ''
      showErrorHint.value = false
    }, 800)
    return
  }

  const expK = w.hiragana
  if (userRaw === expK) {
    inputStatus.value = 'correct'
    showErrorHint.value = false
    inputValue.value = ''
    playCorrect()
    setTimeout(() => {
      inputStatus.value = 'default'
      advanceOrFinish()
    }, 200)
    return
  }
  if (userRaw.length > 0 && expK.startsWith(userRaw)) return

  errorCount.value++
  errors.value.push({ word: displayTarget(w), expected: expK, actual: userRaw })
  inputStatus.value = 'error'
  showErrorHint.value = true
  playError()
  setTimeout(() => {
    inputStatus.value = 'default'
    inputValue.value = ''
    showErrorHint.value = false
  }, 800)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') router.push({ name: 'words' })
}

watch(
  () => [level.value, route.query.mode] as const,
  async () => {
    currentIndex.value = 0
    inputValue.value = ''
    correctCount.value = 0
    errorCount.value = 0
    errors.value = []
    isStarted.value = false
    startTime.value = null
    inputStatus.value = 'default'
    showErrorHint.value = false
    await loadWords()
    await nextTick()
    inputRef.value?.focus()
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 dark:text-slate-400">加载词库...</p>
      </div>
    </div>

    <template v-else-if="loadError">
      <div class="flex flex-col items-center justify-center min-h-screen px-4">
        <p class="text-slate-600 dark:text-slate-300 mb-4">暂无该等级词库或加载失败</p>
        <button
          type="button"
          class="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium"
          @click="router.push({ name: 'words' })"
        >
          返回
        </button>
      </div>
    </template>

    <template v-else>
      <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
            @click="router.push({ name: 'words' })"
          >
            <span class="text-xl">←</span><span>退出</span>
          </button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-white">
            {{ level.toUpperCase() }} 单词打字
          </h1>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
              :class="showReadingHint ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-700'"
              @click="showReadingHint = !showReadingHint"
            >
              {{ showReadingHint ? '隐藏读音' : '显示读音' }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              :class="settings().sound?.enabled ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
              @click="toggleSound"
            >
              {{ settings().sound?.enabled ? '🔊' : '🔇' }}
            </button>
            <button
              type="button"
              class="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
              :class="inputMode === 'romaji' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'"
              @click="toggleInputMode"
            >
              {{ inputMode === 'romaji' ? '罗马字' : '假名' }}
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-8">
        <div class="mb-8">
          <div class="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <div class="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">
            {{ currentIndex + 1 }} / {{ totalWords }}
          </div>
        </div>

        <div class="flex justify-center mb-10">
          <div
            class="min-w-[8rem] min-h-[8rem] px-6 flex items-center justify-center rounded-3xl text-4xl sm:text-5xl font-bold shadow-xl transition-all"
            :class="
              inputStatus === 'correct'
                ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                : inputStatus === 'error'
                  ? 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
            "
          >
            {{ displayTarget(currentWord) }}
          </div>
        </div>

        <div v-if="showReadingHint && currentWord" class="text-center mb-4 space-y-1">
          <div class="text-lg text-slate-600 dark:text-slate-300">{{ currentWord.hiragana }}</div>
          <div v-if="inputMode === 'romaji'" class="text-sm text-slate-500 dark:text-slate-400">
            {{ currentWord.romaji }}
          </div>
        </div>

        <div v-if="showErrorHint && currentWord" class="text-center mb-4">
          <span class="text-red-500 font-medium">
            正确: {{ inputMode === 'romaji' ? currentWord.romaji : currentWord.hiragana }}
          </span>
        </div>

        <div class="mb-8">
          <input
            ref="inputRef"
            v-model="inputValue"
            type="text"
            class="w-full px-6 py-5 text-center text-2xl font-mono rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 caret-indigo-600 dark:caret-indigo-400 border-2 outline-none transition-all shadow-lg"
            :class="
              inputStatus === 'correct'
                ? 'border-green-500'
                : inputStatus === 'error'
                  ? 'border-red-500'
                  : 'border-indigo-500 focus:border-purple-500'
            "
            :placeholder="inputMode === 'romaji' ? '输入读音（罗马字）…' : '输入假名…'"
            autocomplete="off"
            autofocus
            @input="handleInput"
          />
        </div>

        <div v-if="nextWord" class="text-center mb-8 text-sm text-slate-400 dark:text-slate-500">
          下一个:
          <span class="text-slate-600 dark:text-slate-300">{{ displayTarget(nextWord) }}</span>
        </div>

        <div class="flex justify-center gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ wpm }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">WPM</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-500">{{ accuracy }}%</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">正确率</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-slate-700 dark:text-slate-300">{{ correctCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">正确</div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
