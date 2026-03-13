<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTypingStore } from '@/stores/typing'

const router = useRouter()
const typingStore = useTypingStore()
const result = computed(() => typingStore.getResult())

function retry() {
  typingStore.reset()
  router.push({ name: 'practice', params: { dictId: typingStore.dictId } })
}

function goHome() {
  typingStore.reset()
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
        <div class="grid grid-cols-2 gap-6">
          <div class="text-center p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <div class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ result.wpm }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">WPM</div>
          </div>
          <div class="text-center p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div class="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{{ result.accuracy }}%</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">正确率</div>
          </div>
          <div class="text-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
            <div class="text-3xl font-bold text-slate-700 dark:text-slate-300">{{ result.totalWords }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">总词数</div>
          </div>
          <div class="text-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
            <div class="text-3xl font-bold text-slate-700 dark:text-slate-300">{{ formatTime(result.duration) }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">用时</div>
          </div>
        </div>
      </div>

      <!-- 错误列表 -->
      <div v-if="result.errors.length > 0" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">错误列表</h3>
        <div class="space-y-2">
          <div v-for="(error, index) in result.errors" :key="index" class="flex justify-between items-center py-3 px-4 rounded-xl bg-red-50 dark:bg-red-900/20">
            <span class="font-medium text-slate-800 dark:text-white">{{ error.word }}</span>
            <span class="text-sm text-red-600 dark:text-red-400">输入: {{ error.actual }} → 正确: {{ error.expected }}</span>
          </div>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-4">
        <button @click="retry" class="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:opacity-90 shadow-lg transition-all hover:scale-[1.02]">
          重新练习
        </button>
        <button @click="goHome" class="flex-1 py-5 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-600 shadow-lg transition-all">
          返回首页
        </button>
      </div>
    </main>
  </div>
</template>
