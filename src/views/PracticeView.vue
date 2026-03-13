<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTypingStore } from '@/stores/typing'
import { useSettingsStore } from '@/stores/settings'
import { getDictById } from '@/data/dicts'

const route = useRoute()
const router = useRouter()
const typingStore = useTypingStore()
const settingsStore = useSettingsStore()

const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const inputStatus = ref<'default' | 'correct' | 'error'>('default')
const showErrorHint = ref(false)

const dictId = computed(() => route.params.dictId as string)
const dict = computed(() => getDictById(dictId.value))

onMounted(() => {
  if (dictId.value) typingStore.initPractice(dictId.value)
  inputRef.value?.focus()
})

function handleInput() {
  if (!typingStore.isStarted) typingStore.startPractice()
  const result = typingStore.handleInput(inputValue.value, settingsStore.settings.inputMode)
  if (result) {
    if (result.correct) {
      inputStatus.value = 'correct'
      showErrorHint.value = false
      inputValue.value = ''
      setTimeout(() => inputStatus.value = 'default', 200)
    } else {
      inputStatus.value = 'error'
      showErrorHint.value = true
      setTimeout(() => {
        inputStatus.value = 'default'
        inputValue.value = ''
        showErrorHint.value = false
      }, 800)
    }
  }
}

function handleKeydown(e: KeyboardEvent) { if (e.key === 'Escape') router.push({ name: 'home' }) }

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

watch(() => typingStore.isCompleted, (completed) => { if (completed) router.push({ name: 'result' }) })

function toggleInputMode() {
  settingsStore.toggleInputMode()
  inputValue.value = ''
  inputRef.value?.focus()
}

const currentWord = computed(() => typingStore.currentWord)
const nextWord = computed(() => typingStore.nextWord)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
          <span class="text-xl">←</span><span>退出</span>
        </button>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-white">{{ dict?.name || '练习中' }}</h1>
        <button @click="toggleInputMode" class="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors" :class="settingsStore.settings.inputMode === 'romaji' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'">
          {{ settingsStore.settings.inputMode === 'romaji' ? '罗马字' : '假名' }}
        </button>
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
        <div class="w-32 h-32 flex items-center justify-center rounded-3xl text-6xl font-bold shadow-xl transition-all" 
          :class="inputStatus === 'correct' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' : inputStatus === 'error' ? 'bg-gradient-to-br from-red-400 to-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'">
          {{ currentWord?.kana || '?' }}
        </div>
      </div>

      <!-- Hint -->
      <div v-if="settingsStore.settings.inputMode === 'romaji' && settingsStore.settings.showRomaji && currentWord" class="text-center mb-4">
        <span class="text-xl text-slate-600 dark:text-slate-300">{{ currentWord.romaji }}</span>
      </div>

      <!-- Meaning -->
      <div v-if="settingsStore.settings.showMeaning && currentWord?.meaning" class="text-center mb-4">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ currentWord.meaning }}</span>
      </div>

      <!-- Error Hint -->
      <div v-if="showErrorHint" class="text-center mb-4">
        <span class="text-red-500 font-medium">正确: {{ currentWord?.romaji }}</span>
      </div>

      <!-- Input -->
      <div class="mb-8">
        <input ref="inputRef" v-model="inputValue" @input="handleInput" type="text" 
          class="w-full px-6 py-5 text-center text-2xl font-mono rounded-2xl bg-white dark:bg-slate-800 border-2 outline-none transition-all shadow-lg"
          :class="inputStatus === 'correct' ? 'border-green-500' : inputStatus === 'error' ? 'border-red-500' : 'border-indigo-500 focus:border-purple-500'"
          :placeholder="settingsStore.settings.inputMode === 'romaji' ? '输入罗马字...' : '直接输入假名...'" autocomplete="off" autofocus />
      </div>

      <!-- Next Word -->
      <div v-if="nextWord" class="text-center mb-8">
        <span class="text-sm text-slate-400 dark:text-slate-500">下一个: {{ nextWord.kana }}</span>
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
    </main>
  </div>
</template>
