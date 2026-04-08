<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { dictCategories } from '@/data/dicts'

const router = useRouter()
const selectedDictId = ref('')
/** URL query：random | order（order 对应练习 store 的 sequential） */
const practiceOrder = ref<'random' | 'order'>('random')

function startPractice() {
  if (selectedDictId.value) {
    router.push({
      name: 'practice',
      params: { dictId: selectedDictId.value },
      query: { mode: practiceOrder.value },
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600">
          <span class="text-xl">←</span>
          <span>返回</span>
        </button>
        <h1 class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">选择词库</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <div class="space-y-6 mb-8">
        <div v-for="category in dictCategories" :key="category.id" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
              {{ category.id === 'hiragana' ? 'あ' : 'ア' }}
            </div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">{{ category.name }}</h2>
          </div>
          
          <div class="space-y-2">
            <label v-for="dict in category.dicts" :key="dict.id" class="flex items-center p-4 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              <input type="radio" :value="dict.id" v-model="selectedDictId" class="w-5 h-5 text-indigo-600" />
              <div class="ml-4 flex-1">
                <div class="font-medium text-slate-800 dark:text-white">{{ dict.name }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400">{{ dict.words.length }} 词 · {{ dict.description }}</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="mb-6 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md">
        <div class="font-medium text-slate-800 dark:text-white mb-3">练习顺序</div>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input v-model="practiceOrder" type="radio" value="random" class="w-4 h-4 text-indigo-600" />
            随机
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input v-model="practiceOrder" type="radio" value="order" class="w-4 h-4 text-indigo-600" />
            顺序（按词表）
          </label>
        </div>
      </div>

      <button @click="startPractice" :disabled="!selectedDictId" class="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        开始练习
      </button>
    </main>
  </div>
</template>
