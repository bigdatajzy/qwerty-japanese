<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTypingStore } from '@/stores/typing'
import { useSettingsStore } from '@/stores/settings'
import { getDictById } from '@/data/dicts'
import { useSound } from '@/composables/useSound'
import { addHistoryRecord } from '@/utils/storage'
import type { TypingMode } from '@/types/typing'
import Keyboard from '@/components/keyboard/Keyboard.vue'
import { recordPracticeSession } from '@/utils/practiceStatsDb'

const route = useRoute()
const router = useRouter()
const typingStore = useTypingStore()
const settingsStore = useSettingsStore()
const { playCorrect, playError, playComplete } = useSound()

const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const inputStatus = ref<'default' | 'correct' | 'error'>('default')
const showErrorHint = ref(false)

const dictId = computed(() => route.params.dictId as string)
const dict = computed(() => getDictById(dictId.value))

// 盲打模式配置 - 添加安全访问
const blindConfig = computed(() => settingsStore.settings?.blindMode ?? { enabled: false, level: 1, showNextRomaji: true })
const isBlindMode = computed(() => blindConfig.value?.enabled ?? false)

// 根据盲打等级决定是否显示假名
const showKana = computed(() => {
  if (!isBlindMode.value) return true
  return blindConfig.value?.level === 1
})

// 根据盲打等级和配置决定是否显示罗马字
const showRomaji = computed(() => {
  if (!isBlindMode.value) return settingsStore.settings?.showRomaji ?? true
  if (blindConfig.value?.level === 3) return false
  return true
})

// 下一个词的显示
const showNextWord = computed(() => {
  if (!isBlindMode.value) return true
  if (blindConfig.value?.level === 3) return false
  if (blindConfig.value?.level === 2 && !blindConfig.value?.showNextRomaji) return false
  return true
})

// 便捷访问 - 直接从 store 获取
const settings = () => settingsStore.settings
const inputMode = computed(() => settings().inputMode ?? 'romaji')
const showRomajiSetting = computed(() => settings().showRomaji ?? true)
const showMeaningSetting = computed(() => settings().showMeaning ?? false)

function resolvePracticeMode(): TypingMode {
  const m = route.query.mode
  const raw = typeof m === 'string' ? m : Array.isArray(m) ? m[0] : ''
  if (raw === 'order' || raw === 'sequential') return 'sequential'
  return 'random'
}

watch(
  () => [dictId.value, route.query.mode] as const,
  async () => {
    if (!dictId.value) return
    typingStore.initPractice(dictId.value, resolvePracticeMode())
    inputValue.value = ''
    inputStatus.value = 'default'
    showErrorHint.value = false
    await nextTick()
    inputRef.value?.focus()
  },
  { immediate: true },
)

function handleInput() {
  if (!typingStore.isStarted) typingStore.startPractice()
  const result = typingStore.handleInput(inputValue.value, inputMode.value)
  if (result) {
    if (result.correct) {
      inputStatus.value = 'correct'
      showErrorHint.value = false
      inputValue.value = ''
      playCorrect()
      setTimeout(() => inputStatus.value = 'default', 200)
    } else {
      inputStatus.value = 'error'
      showErrorHint.value = true
      playError()
      setTimeout(() => {
        inputStatus.value = 'default'
        inputValue.value = ''
        showErrorHint.value = false
      }, 800)
    }
  }
}

function handleKeydown(e: KeyboardEvent) { if (e.key === 'Escape') router.push({ name: 'home' }) }

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

// 练习完成时保存记录并跳转
watch(() => typingStore.isCompleted, async (completed) => { 
  if (completed) {
    playComplete()
    const result = typingStore.getResult()
    const dictInfo = getDictById(typingStore.dictId)
    addHistoryRecord({
      timestamp: Date.now(),
      dictId: typingStore.dictId,
      dictName: dictInfo?.name || typingStore.dictId,
      mode: typingStore.mode === 'random' ? 'random' : 'order',
      totalChars: result.totalWords,
      correctChars: result.correctCount,
      wrongChars: result.errorCount,
      accuracy: result.accuracy,
      wpm: result.wpm,
      duration: result.duration,
      errors: result.errors
    })
    sessionStorage.setItem(
      'typing-practice-result',
      JSON.stringify({
        dictId: typingStore.dictId,
        dictName: dictInfo?.name || typingStore.dictId,
        totalWords: result.totalWords,
        correctCount: result.correctCount,
        errorCount: result.errorCount,
        accuracy: result.accuracy,
        wpm: result.wpm,
        duration: result.duration,
      }),
    )
    await recordPracticeSession({
      type: 'kana',
      sourceId: typingStore.dictId,
      sourceName: dictInfo?.name || typingStore.dictId,
      startedAt: typingStore.startTime || Date.now(),
      durationSec: result.duration,
      unitsTotal: result.totalWords,
      unitsCorrect: result.correctCount,
      unitsError: result.errorCount,
      accuracy: result.accuracy,
      wpm: result.wpm,
    })
    router.push({ name: 'result' }) 
  }
})

function toggleInputMode() {
  settingsStore.toggleInputMode()
  inputValue.value = ''
  inputRef.value?.focus()
}

// 切换盲打模式
function toggleBlindMode() {
  settingsStore.toggleBlindMode()
}

// 切换音效
function toggleSound() {
  const s = settings()
  if (!s.sound) {
    s.sound = { enabled: true, correctSound: true, errorSound: true, completeSound: true, volume: 70 }
  }
  s.sound.enabled = !s.sound.enabled
}

// 切换盲打等级
function setBlindLevel(level: 1 | 2 | 3) {
  settingsStore.setBlindLevel(level)
}

function toggleKeyboard() {
  settingsStore.toggleShowKeyboard()
}

const currentWord = computed(() => typingStore.currentWord)
const nextWord = computed(() => typingStore.nextWord)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600">
          <span class="text-xl">←</span><span>退出</span>
        </button>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-white">{{ dict?.name || '练习中' }}</h1>
        <div class="flex items-center gap-2 flex-wrap justify-end">
          <button type="button" title="键盘指引" @click="toggleKeyboard" class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors" :class="settings().showKeyboard ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'">
            ⌨️
          </button>
          <button type="button" @click="toggleSound" class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors" :class="settings().sound?.enabled ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'">
            {{ settings().sound?.enabled ? '🔊' : '🔇' }}
          </button>
          <button type="button" @click="toggleInputMode" class="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors" :class="inputMode === 'romaji' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'">
            {{ inputMode === 'romaji' ? '罗马字' : '假名' }}
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-8">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" :style="{ width: typingStore.progress + '%' }"></div>
        </div>
        <div class="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">{{ typingStore.currentIndex + 1 }} / {{ typingStore.totalWords }}</div>
      </div>

      <!-- Kana Display -->
      <div class="flex justify-center mb-12">
        <div v-if="showKana || isBlindMode" class="w-32 h-32 flex items-center justify-center rounded-3xl text-6xl font-bold shadow-xl transition-all" 
          :class="inputStatus === 'correct' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' : inputStatus === 'error' ? 'bg-gradient-to-br from-red-400 to-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'">
          {{ currentWord?.kana || '?' }}
        </div>
        <!-- 盲打模式 L2/L3 时只显示罗马字 -->
        <div v-else class="w-32 h-32 flex items-center justify-center rounded-3xl text-4xl font-bold shadow-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 text-amber-700 dark:text-amber-200">
          {{ currentWord?.romaji || '?' }}
        </div>
      </div>

      <!-- Hint -->
      <div v-if="inputMode === 'romaji' && showRomaji && currentWord" class="text-center mb-4">
        <span class="text-xl text-slate-600 dark:text-slate-300">{{ currentWord.romaji }}</span>
      </div>

      <!-- Meaning -->
      <div v-if="showMeaningSetting && currentWord?.meaning" class="text-center mb-4">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ currentWord.meaning }}</span>
      </div>

      <!-- Error Hint -->
      <div v-if="showErrorHint" class="text-center mb-4">
        <span class="text-red-500 font-medium">正确: {{ currentWord?.romaji }}</span>
      </div>

      <!-- Input -->
      <div class="mb-8">
        <input ref="inputRef" v-model="inputValue" @input="handleInput" type="text" 
          class="w-full px-6 py-5 text-center text-2xl font-mono rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 caret-indigo-600 dark:caret-indigo-400 border-2 outline-none transition-all shadow-lg"
          :class="inputStatus === 'correct' ? 'border-green-500' : inputStatus === 'error' ? 'border-red-500' : 'border-indigo-500 focus:border-purple-500'"
          :placeholder="inputMode === 'romaji' ? '输入罗马字...' : '直接输入假名...'" autocomplete="off" autofocus />
      </div>

      <!-- Next Word -->
      <div v-if="nextWord && showNextWord" class="text-center mb-8">
        <span class="text-sm text-slate-400 dark:text-slate-500">
          下一个: 
          <template v-if="isBlindMode && blindConfig.level >= 2">{{ nextWord.romaji }}</template>
          <template v-else>{{ nextWord.kana }}</template>
        </span>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ typingStore.wpm }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">WPM</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-500">{{ typingStore.accuracy }}%</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">正确率</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-700 dark:text-slate-300">{{ typingStore.correctCount }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">正确</div>
        </div>
      </div>

      <Keyboard />
    </main>
  </div>
</template>
