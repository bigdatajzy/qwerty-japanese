<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSound } from '@/composables/useSound'

const route = useRoute()
const router = useRouter()
const { playCorrect, playError, playComplete } = useSound()

/** 与 GitHub Pages 子路径部署一致，需带 Vite base（同 articles.ts） */
const wordJsonBase = `${import.meta.env.BASE_URL}words/`

interface Word {
  id: string
  hiragana: string
  kanji: string
  meaning: string
  romaji: string
}

const level = computed(() => route.params.level as string)
const wordIndex = ref(parseInt(route.params.wordIndex as string) || 0)
const fileIndex = ref(parseInt(route.params.fileIndex as string) || 1)

const words = ref<Word[]>([])
const isLoading = ref(true)
const practiceMode = ref<'jp2cn' | 'cn2jp'>('jp2cn')
const showSettings = ref(false)
const hasMoreFiles = ref(true)
const selectedAnswer = ref<string | null>(null)
const options = ref<{ text: string; isCorrect: boolean }[]>([])

// 统计
const correctCount = ref(0)
const errorCount = ref(0)

const currentWord = computed(() => words.value[wordIndex.value])
const totalWords = computed(() => words.value.length)
const progress = computed(() => {
  if (totalWords.value === 0) return 0
  return (wordIndex.value / totalWords.value) * 100
})

async function loadWords() {
  isLoading.value = true
  words.value = []
  
  const startFile = fileIndex.value
  
  // 尝试加载多个文件（每文件最多200词）
  for (let i = startFile; i < startFile + 10; i++) {
    try {
      const response = await fetch(`${wordJsonBase}${level.value}-${i}.json`)
      if (!response.ok) break
      const data = await response.json()
      if (data && data.length > 0) {
        words.value.push(...data)
        fileIndex.value = i
      } else {
        break
      }
    } catch (e) {
      break
    }
  }
  
  // 打乱顺序
  words.value = [...words.value].sort(() => Math.random() - 0.5)
  hasMoreFiles.value = words.value.length >= 200
  isLoading.value = false
  
  // 生成选项
  generateOptions()
}

function setPracticeMode(mode: 'jp2cn' | 'cn2jp') {
  if (practiceMode.value !== mode) {
    // 重置练习
    wordIndex.value = 0
    correctCount.value = 0
    errorCount.value = 0
    router.replace({ name: 'word-practice', params: { level: level.value, fileIndex: 1, wordIndex: 0 } })
    practiceMode.value = mode
    loadWords()
  }
}

function generateOptions() {
  if (!currentWord.value) return
  
  const correct = practiceMode.value === 'jp2cn' 
    ? currentWord.value.meaning 
    : currentWord.value.hiragana
  
  // 获取其他词作为干扰项
  const otherWords = words.value.filter(w => w.id !== currentWord.value?.id)
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3)
  
  const wrongOptions = shuffled.map(w => 
    practiceMode.value === 'jp2cn' ? w.meaning : w.hiragana
  )
  
  // 合并并打乱
  const allOptions = [
    { text: correct, isCorrect: true },
    ...wrongOptions.map(text => ({ text, isCorrect: false }))
  ]
  
  options.value = allOptions.sort(() => Math.random() - 0.5)
}

function selectAnswer(option: { text: string; isCorrect: boolean }) {
  if (selectedAnswer.value !== null) return // 已选择
  
  selectedAnswer.value = option.text
  
  if (option.isCorrect) {
    playCorrect()
    correctCount.value++
    setTimeout(() => {
      nextWord()
    }, 500)
  } else {
    playError()
    errorCount.value++
    // 显示正确答案
    setTimeout(() => {
      nextWord()
    }, 1000)
  }
}

function nextWord() {
  selectedAnswer.value = null
  wordIndex.value++
  
  // 检查是否需要加载下一个文件
  if (wordIndex.value >= totalWords.value && hasMoreFiles.value) {
    // 跳转到下一个文件
    const nextFileIndex = fileIndex.value + 1
    router.replace({ name: 'word-practice', params: { level: level.value, fileIndex: nextFileIndex, wordIndex: 0 } })
    // 重新加载
    loadWords().then(() => {
      wordIndex.value = 0
    })
  } else if (wordIndex.value >= totalWords.value) {
    finishPractice()
  } else {
    // 更新 URL
    router.replace({ name: 'word-practice', params: { level: level.value, wordIndex: wordIndex.value, fileIndex: fileIndex.value } })
    // 生成新选项
    generateOptions()
  }
}

function finishPractice() {
  playComplete()
  sessionStorage.setItem('word-result', JSON.stringify({
    totalWords: totalWords.value,
    correctCount: correctCount.value,
    errorCount: errorCount.value,
    level: level.value,
    fileIndex: fileIndex.value,
  }))
  router.push({ name: 'result' })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') router.push({ name: 'words' })
}

onMounted(() => {
  loadWords()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 dark:text-slate-400">加载词库...</p>
      </div>
    </div>

    <template v-else>
      <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button @click="router.push({ name: 'words' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
            <span class="text-xl">←</span><span>退出</span>
          </button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-white">{{ level.toUpperCase() }} 单词练习 ({{ fileIndex }})</h1>
          <button @click="showSettings = !showSettings" class="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
            ⚙️
          </button>
        </div>
      </header>

      <!-- 设置面板 -->
      <div v-if="showSettings" class="max-w-3xl mx-auto px-4 pt-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg mb-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">练习方向</label>
            <div class="flex gap-2 flex-wrap">
              <button @click="setPracticeMode('jp2cn')" class="px-4 py-2 rounded-lg text-sm" :class="practiceMode === 'jp2cn' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700'">看日文选中文</button>
              <button @click="setPracticeMode('cn2jp')" class="px-4 py-2 rounded-lg text-sm" :class="practiceMode === 'cn2jp' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700'">看中文选日文</button>
            </div>
          </div>
        </div>
      </div>

      <main class="max-w-3xl mx-auto px-4 py-8">
        <!-- 进度条 -->
        <div class="mb-6">
          <div class="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">{{ wordIndex }} / {{ totalWords }}</div>
        </div>

        <!-- 题目显示 -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-6 text-center">
          <div v-if="practiceMode === 'jp2cn'">
            <!-- 看日文选中文：显示假名和汉字 -->
            <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{{ currentWord?.hiragana }}</div>
            <div class="text-3xl font-bold text-slate-800 dark:text-white">{{ currentWord?.kanji }}</div>
          </div>
          <div v-else>
            <!-- 看中文选日文：显示中文 -->
            <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{{ currentWord?.meaning }}</div>
          </div>
        </div>

        <!-- 选项 -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <button v-for="(option, index) in options" :key="index"
            @click="selectAnswer(option)"
            :disabled="selectedAnswer !== null"
            class="p-4 rounded-2xl text-lg font-medium transition-all shadow-lg"
            :class="{
              'bg-green-500 text-white': selectedAnswer === option.text && option.isCorrect,
              'bg-red-500 text-white': selectedAnswer === option.text && !option.isCorrect,
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30': selectedAnswer === null,
              'bg-slate-200 dark:bg-slate-700 text-slate-400': selectedAnswer !== null && option.isCorrect && selectedAnswer !== option.text
            }">
            {{ option.text }}
          </button>
        </div>

        <!-- 统计 -->
        <div class="flex justify-center gap-8 mt-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-500">{{ correctCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">正确</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-500">{{ errorCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">错误</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-indigo-500">{{ correctCount + errorCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">已答</div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
