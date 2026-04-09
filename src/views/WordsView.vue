<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWordsManifest } from '@/api/wordsData'
import { getWordPracticeResumeLabel } from '@/utils/wordPracticeProgress'

const router = useRouter()
const route = useRoute()

/** 从练习页返回时刷新本页展示的「上次进度」 */
const resumeTick = ref(0)
watch(
  () => route.name,
  (n) => {
    if (n === 'words') resumeTick.value++
  },
  { immediate: true },
)

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
    })
  }
}

const resumeHints = computed(() => {
  void resumeTick.value
  const o: Record<string, string> = {}
  for (const l of levels.value) {
    const label = getWordPracticeResumeLabel(l.id)
    o[l.id] = label ? `上次进度：${label}` : ''
  }
  return o
})
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
              <p
                v-if="resumeHints[item.id]"
                class="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5"
              >
                {{ resumeHints[item.id] }}
              </p>
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
