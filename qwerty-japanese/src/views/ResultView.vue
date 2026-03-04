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
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <!-- Header -->
    <header class="text-center mb-12">
      <div class="text-4xl mb-4">🎉</div>
      <h1 class="text-3xl font-bold">练习完成!</h1>
    </header>

    <!-- Stats -->
    <div class="bg-[var(--color-card)] rounded-xl p-8 shadow-md mb-8">
      <div class="grid grid-cols-2 gap-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-primary">{{ result.wpm }}</div>
          <div class="text-[var(--color-text-secondary)]">WPM</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-success">{{ result.accuracy }}%</div>
          <div class="text-[var(--color-text-secondary)]">正确率</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-semibold">{{ result.totalWords }}</div>
          <div class="text-[var(--color-text-secondary)]">总词数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-semibold">{{ formatTime(result.duration) }}</div>
          <div class="text-[var(--color-text-secondary)]">用时</div>
        </div>
      </div>
    </div>

    <!-- Errors -->
    <div 
      v-if="result.errors.length > 0"
      class="bg-[var(--color-card)] rounded-xl p-6 shadow-md mb-8"
    >
      <h2 class="text-lg font-semibold mb-4">错误列表</h2>
      <div class="space-y-2">
        <div 
          v-for="(error, index) in result.errors" 
          :key="index"
          class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
        >
          <span class="font-medium">{{ error.word }}</span>
          <span class="text-[var(--color-text-secondary)]">
            输入: {{ error.actual }} → 正确: {{ error.expected }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-4">
      <button
        @click="retry"
        class="flex-1 py-4 bg-primary text-white rounded-lg font-semibold
               hover:bg-primary-dark transition-colors"
      >
        重新练习
      </button>
      <button
        @click="goHome"
        class="flex-1 py-4 bg-[var(--color-card)] text-[var(--color-text)] rounded-lg font-semibold
               hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        返回首页
      </button>
    </div>
  </div>
</template>
