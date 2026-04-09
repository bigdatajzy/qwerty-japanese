<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { dictCategories } from '@/data/dicts'
import type { Dict } from '@/types/dict'

const router = useRouter()

/** 与 word-practice / practice 路由 query.mode 对齐：order → 顺序，其它 → 随机 */
const practiceOrder = ref<'random' | 'sequential'>('random')

function startPractice(dict: Dict) {
  if (dict.words.length === 0) return
  router.push({
    name: 'practice',
    params: { dictId: dict.id },
    query: { mode: practiceOrder.value === 'sequential' ? 'order' : 'random' },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600">
          <span class="text-xl">←</span><span>返回</span>
        </button>
        <h1 class="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">假名打字</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
        选择平假名或片假名词表，用设置中的输入方式打出对应读音。点击词库卡片即开始练习。
      </p>

      <div class="flex flex-wrap gap-3 mb-6">
        <span class="text-sm text-slate-500 dark:text-slate-400 self-center">出题顺序</span>
        <button
          type="button"
          @click="practiceOrder = 'sequential'"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="
            practiceOrder === 'sequential'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
          "
        >
          顺序
        </button>
        <button
          type="button"
          @click="practiceOrder = 'random'"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="
            practiceOrder === 'random'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
          "
        >
          随机
        </button>
      </div>

      <div class="space-y-8">
        <section v-for="category in dictCategories" :key="category.id">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shrink-0"
            >
              {{ category.id === 'hiragana' ? 'あ' : 'ア' }}
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-800 dark:text-white">{{ category.name }}</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ category.description }}</p>
            </div>
          </div>

          <div class="grid gap-4">
            <div
              v-for="dict in category.dicts"
              :key="dict.id"
              @click="startPractice(dict)"
              class="p-6 rounded-2xl transition-all"
              :class="
                dict.words.length > 0
                  ? 'bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.02] border border-slate-200 dark:border-slate-700 cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800/50 opacity-50 cursor-not-allowed'
              "
            >
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="text-xl font-semibold text-slate-800 dark:text-white">{{ dict.name }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ dict.description }}</p>
                </div>
                <div class="shrink-0 text-right">
                  <span
                    v-if="dict.words.length > 0"
                    class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 font-bold"
                  >
                    {{ dict.words.length }}
                  </span>
                  <span v-else class="text-slate-400 dark:text-slate-500">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
