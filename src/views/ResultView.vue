<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface ArticleResult {
  wpm: number
  totalUnits: number
  correctUnits: number
  totalChars: number
}

interface WordResult {
  totalWords: number
  correctCount: number
  errorCount: number
  level: string
}

const result = computed(() => {
  // 尝试获取单词练习结果
  const wordStored = sessionStorage.getItem('word-result')
  if (wordStored) {
    try {
      const data = JSON.parse(wordStored) as WordResult
      return {
        type: 'word',
        accuracy: data.totalWords > 0 ? Math.round((data.correctCount / data.totalWords) * 100) : 0,
        totalWords: data.totalWords || 0,
        correctCount: data.correctCount || 0,
        errorCount: data.errorCount || 0,
        level: data.level || '',
        errors: []
      }
    } catch (e) {
      console.error('Failed to parse word result:', e)
    }
  }
  
  // 尝试获取文章练习结果
  const articleStored = sessionStorage.getItem('article-result')
  if (articleStored) {
    try {
      const data = JSON.parse(articleStored) as ArticleResult
      return {
        type: 'article',
        wpm: data.wpm || 0,
        accuracy: data.totalUnits > 0 ? Math.round((data.correctUnits / data.totalUnits) * 100) : 0,
        totalWords: data.totalUnits || 0,
        correctCount: data.correctUnits || 0,
        errorCount: 0,
        errors: []
      }
    } catch (e) {
      console.error('Failed to parse article result:', e)
    }
  }
  
  // 默认返回值
  return {
    type: 'unknown',
    wpm: 0,
    accuracy: 0,
    totalWords: 0,
    correctCount: 0,
    errorCount: 0,
    errors: []
  }
})

function retry() {
  sessionStorage.removeItem('article-result')
  sessionStorage.removeItem('word-result')
  if (result.value.type === 'word') {
    router.push({ name: 'words' })
  } else {
    router.push({ name: 'articles' })
  }
}

function goHome() {
  sessionStorage.removeItem('article-result')
  sessionStorage.removeItem('word-result')
  router.push({ name: 'home' })
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <main class="max-w-2xl mx-auto px-4 py-12">
      <!-- 庆祝 -->
      <div class="text-center mb-8">
        <div class="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 class="text-4xl font-bold text-slate-800 dark:text-white">练习完成!</h2>
      </div>

      <!-- 统计卡片 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl mb-8">
        <div v-if="result.type === 'word'" class="text-center mb-4">
          <span class="inline-block px-4 py-1 bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-full text-sm font-medium">
            {{ result.level?.toUpperCase() }} 单词练习
          </span>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="text-center p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div class="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{{ result.accuracy }}%</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">正确率</div>
          </div>
          <div class="text-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
            <div class="text-3xl font-bold text-slate-700 dark:text-slate-300">{{ result.totalWords }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">总题数</div>
          </div>
          <div class="text-center p-5 rounded-2xl bg-green-50 dark:bg-green-900/20">
            <div class="text-3xl font-bold text-green-500">{{ result.correctCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">正确</div>
          </div>
          <div class="text-center p-5 rounded-2xl bg-red-50 dark:bg-red-900/20">
            <div class="text-3xl font-bold text-red-500">{{ result.errorCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">错误</div>
          </div>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-4">
        <button @click="retry" class="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
          再次练习
        </button>
        <button @click="goHome" class="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          返回首页
        </button>
      </div>
    </main>
  </div>
</template>
