<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchWordsManifest } from '@/api/wordsData'

const router = useRouter()

/** 与 word-practice 路由 query.mode 对齐：order → 顺序，其它 → 随机 */
const practiceOrder = ref<'random' | 'sequential'>('random')

interface WordLevel {
  id: string
  name: string
  level: string
  wordCount: number
  description: string
}

const levels = ref<WordLevel[]>([])
const listLoadError = ref(false)
const manifestLoading = ref(true)

onMounted(async () => {
  manifestLoading.value = true
  listLoadError.value = false
  try {
    const m = await fetchWordsManifest()
    levels.value = m.sets.map((s) => ({
      id: s.id,
      name: s.title,
      level: s.level,
      wordCount: s.wordCount,
      description: s.description,
    }))
  } catch {
    listLoadError.value = true
    levels.value = []
  } finally {
    manifestLoading.value = false
  }
})

function startPractice(level: WordLevel) {
  if (level.wordCount > 0) {
    router.push({
      name: 'word-practice',
      params: { level: level.id, fileIndex: 1, wordIndex: 0 },
      query: { mode: practiceOrder.value === 'sequential' ? 'order' : 'random' },
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600">
          <span class="text-xl">←</span><span>返回</span>
        </button>
        <h1 class="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">单词打字</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
        看汉字/词，用设置中的输入方式（罗马字或假名）打出读音。完成一轮后可在结果页查看 WPM 与错题。
      </p>
      <p v-if="listLoadError" class="text-sm text-red-600 dark:text-red-400 mb-4">
        词库清单加载失败，请刷新页面或检查 <code class="text-xs">public/data/words/manifest.json</code> 是否可访问。
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
      <div v-if="manifestLoading" class="text-center py-12 text-slate-500 dark:text-slate-400">
        正在加载词库列表…
      </div>
      <div v-else-if="!listLoadError" class="grid gap-4">
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
              <span v-if="item.wordCount > 0" class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 font-bold">
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
