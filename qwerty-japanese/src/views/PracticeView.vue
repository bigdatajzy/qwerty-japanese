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
  if (dictId.value) {
    typingStore.initPractice(dictId.value)
  }
  inputRef.value?.focus()
})

function handleInput() {
  if (!typingStore.isStarted) {
    typingStore.startPractice()
  }

  const result = typingStore.handleInput(inputValue.value, settingsStore.settings.inputMode)
  
  if (result) {
    if (result.correct) {
      inputStatus.value = 'correct'
      showErrorHint.value = false
      inputValue.value = ''
      setTimeout(() => {
        inputStatus.value = 'default'
      }, 200)
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

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    router.push({ name: 'home' })
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(() => typingStore.isCompleted, (completed) => {
  if (completed) {
    router.push({ name: 'result' })
  }
})

function toggleInputMode() {
  settingsStore.toggleInputMode()
  inputValue.value = ''
  inputRef.value?.focus()
}

const currentWord = computed(() => typingStore.currentWord)
const nextWord = computed(() => typingStore.nextWord)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8">
      <button 
        @click="router.push({ name: 'home' })"
        class="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        ← 退出
      </button>
      <h1 class="text-lg font-semibold">{{ dict?.name || '练习中' }}</h1>
      <button
        @click="toggleInputMode"
        class="px-3 py-1 text-sm rounded-lg transition-colors"
        :class="settingsStore.settings.inputMode === 'romaji' 
          ? 'bg-indigo-600 text-white' 
          : 'bg-green-500 text-white'"
      >
        {{ settingsStore.settings.inputMode === 'romaji' ? '罗马字' : '假名' }}
      </button>
    </header>

    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="h-2 bg-[var(--color-card)] rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          :style="{ width: `${typingStore.progress}%` }"
        ></div>
      </div>
      <div class="text-center mt-2 text-sm text-[var(--color-text-secondary)]">
        {{ typingStore.currentIndex + 1 }} / {{ typingStore.totalWords }}
      </div>
    </div>

    <!-- Kana Display -->
    <div class="flex justify-center mb-12">
      <div 
        class="kana-card"
        :class="{
          'correct': inputStatus === 'correct',
          'error': inputStatus === 'error'
        }"
      >
        {{ currentWord?.kana || '?' }}
      </div>
    </div>

    <!-- Hint -->
    <div 
      v-if="settingsStore.settings.inputMode === 'romaji' && settingsStore.settings.showRomaji && currentWord"
      class="text-center mb-4"
    >
      <span class="text-lg text-[var(--color-text-secondary)]">
        {{ currentWord.romaji }}
      </span>
    </div>

    <!-- Meaning -->
    <div 
      v-if="settingsStore.settings.showMeaning && currentWord?.meaning"
      class="text-center mb-4"
    >
      <span class="text-sm text-[var(--color-text-secondary)]">
        {{ currentWord.meaning }}
      </span>
    </div>

    <!-- Error Hint -->
    <div 
      v-if="showErrorHint"
      class="text-center mb-4"
    >
      <span class="text-error font-medium">
        正确: {{ currentWord?.romaji }}
      </span>
    </div>

    <!-- Input -->
    <div class="mb-8">
      <input
        ref="inputRef"
        v-model="inputValue"
        @input="handleInput"
        type="text"
        class="w-full px-6 py-4 text-center text-2xl font-mono rounded-xl
               bg-[var(--color-card)] border-2 border-transparent
               focus:border-primary outline-none
               transition-colors"
        :class="{
          'border-success': inputStatus === 'correct',
          'border-error': inputStatus === 'error'
        }"
        :placeholder="settingsStore.settings.inputMode === 'romaji' ? '输入罗马字...' : '直接输入假名...'"
        autocomplete="off"
        autofocus
      />
    </div>

    <!-- Next Word Preview -->
    <div 
      v-if="nextWord"
      class="text-center mb-8"
    >
      <span class="text-sm text-[var(--color-text-secondary)]">
        下一个: {{ nextWord.kana }}
      </span>
    </div>

    <!-- Stats -->
    <div class="flex justify-center gap-8">
      <div class="text-center">
        <div class="text-2xl font-bold text-primary">{{ typingStore.wpm }}</div>
        <div class="text-sm text-[var(--color-text-secondary)]">WPM</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-success">{{ typingStore.accuracy }}%</div>
        <div class="text-sm text-[var(--color-text-secondary)]">正确率</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold">{{ typingStore.correctCount }}</div>
        <div class="text-sm text-[var(--color-text-secondary)]">正确</div>
      </div>
    </div>
  </div>
</template>
