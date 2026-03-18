<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface WordLevel {
  id: string
  name: string
  level: string
  wordCount: number
  description: string
}

const levels = ref<WordLevel[]>([
  { id: 'n5', name: 'N5词汇', level: 'N5', wordCount: 50, description: '入门级，约800词' },
  { id: 'n4', name: 'N4词汇', level: 'N4', wordCount: 0, description: '基础级，约1200词（待添加）' },
  { id: 'n3', name: 'N3词汇', level: 'N3', wordCount: 0, description: '中级，约1500词（待添加）' },
  { id: 'n2', name: 'N2词汇', level: 'N2', wordCount: 0, description: '中高级，约2000词（待添加）' },
  { id: 'n1', name: 'N1词汇', level: 'N1', wordCount: 0, description: '高级，约2500词（待添加）' },
])

const availableLevels = ref<string[]>(['n5'])

function startPractice(level: WordLevel) {
  if (level.wordCount > 0) {
    router.push({ name: 'word-practice', params: { level: level.id, fileIndex: 1, wordIndex: 0 } })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
          <span class="text-xl">←</span><span>返回</span>
        </button>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-white">单词练习</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <div class="grid gap-4">
        <div v-for="item in levels" :key="item.id"
          @click="startPractice(item)"
          class="p-6 rounded-2xl transition-all cursor-pointer"
          :class="item.wordCount > 0 
            ? 'bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.02] border border-slate-200 dark:border-slate-700' 
            : 'bg-slate-100 dark:bg-slate-800/50 opacity-50 cursor-not-allowed'">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold text-slate-800 dark:text-white">{{ item.name }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ item.description }}</p>
            </div>
            <div class="text-right">
              <span v-if="item.wordCount > 0" class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold">
                {{ item.wordCount }}
              </span>
              <span v-else class="text-slate-400 dark:text-slate-500">🔒</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
