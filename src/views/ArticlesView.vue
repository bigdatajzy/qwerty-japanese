<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Article } from '@/types/article'
import type { ArticleListEntry } from '@/types/dataManifest'
import { loadPresetArticlesList } from '@/api/articles'

const router = useRouter()

const presetArticles = ref<ArticleListEntry[]>([])
const presetLoadError = ref(false)
const presetLoading = ref(true)

onMounted(async () => {
  presetLoading.value = true
  presetLoadError.value = false
  try {
    presetArticles.value = await loadPresetArticlesList()
  } catch {
    presetLoadError.value = true
    presetArticles.value = []
  } finally {
    presetLoading.value = false
  }
})

const customArticles = ref<Article[]>([])
const showUploadModal = ref(false)

function loadCustomArticles() {
  try {
    const stored = localStorage.getItem('custom-articles')
    if (stored) customArticles.value = JSON.parse(stored)
  } catch (e) { console.error(e) }
}
loadCustomArticles()

function startPractice(id: string) {
  router.push({ name: 'article-practice', params: { articleId: id } })
}

function getDifficultyStyle(difficulty: string) {
  if (difficulty === 'beginner') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  if (difficulty === 'intermediate') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
}

function getDifficultyLabel(difficulty: string) {
  if (difficulty === 'beginner') return '入门'
  if (difficulty === 'intermediate') return '初级'
  return '中级'
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (ev) => {
    const content = ev.target?.result as string
    try {
      const json = JSON.parse(content)
      if (json.title && json.content) {
        customArticles.value.push({
          id: 'custom-' + Date.now(),
          title: json.title,
          content: json.content,
          difficulty: json.difficulty || 'beginner',
          source: 'custom'
        })
        localStorage.setItem('custom-articles', JSON.stringify(customArticles.value))
      }
    } catch {
      const lines = content.split('\n').filter(l => l.trim())
      if (lines.length > 0) {
        customArticles.value.push({
          id: 'custom-' + Date.now(),
          title: file.name.replace(/\.(txt|json)$/, ''),
          content: lines.join('\n'),
          difficulty: 'beginner',
          source: 'custom'
        })
        localStorage.setItem('custom-articles', JSON.stringify(customArticles.value))
      }
    }
    showUploadModal.value = false
  }
  reader.readAsText(file)
}

function deleteArticle(id: string) {
  customArticles.value = customArticles.value.filter(a => a.id !== id)
  localStorage.setItem('custom-articles', JSON.stringify(customArticles.value))
}

function downloadUploadTemplate(kind: 'json' | 'txt') {
  const content =
    kind === 'json'
      ? JSON.stringify(
          {
            title: '示例文章标题',
            content: '日本語を勉強するのは楽しいです。\n毎日の練習が大切です。',
            difficulty: 'beginner',
          },
          null,
          2,
        )
      : '第一段内容\n第二段内容\n第三段内容'

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = kind === 'json' ? 'article-template.json' : 'article-template.txt'
  a.click()
  URL.revokeObjectURL(url)
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
        <h1 class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">文章练习</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <!-- 预制文章 -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-lg shadow-lg">📚</div>
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">预制文章</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">精选日语短文</p>
          </div>
        </div>
        
        <p v-if="presetLoadError" class="text-sm text-red-600 dark:text-red-400 mb-4">
          预制文章清单加载失败，请检查 <code class="text-xs">public/data/articles/manifest.json</code>。
        </p>
        <div v-else-if="presetLoading" class="text-center py-8 text-slate-500 dark:text-slate-400">
          正在加载文章列表…
        </div>
        <div v-else class="grid gap-4">
          <div v-for="article in presetArticles" :key="article.id" @click="startPractice(article.id)" 
            class="group bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ article.title }}</h3>
                  <span :class="getDifficultyStyle(article.difficulty)" class="px-2.5 py-1 rounded-full text-xs font-medium">{{ getDifficultyLabel(article.difficulty) }}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ article.description }}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">→</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 自定义文章 -->
      <section>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-lg shadow-lg">📝</div>
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">自定义文章</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">上传自己的日语文章</p>
          </div>
        </div>

        <div v-if="customArticles.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl">📄</div>
          <p class="text-slate-500 dark:text-slate-400 mb-4">还没有自定义文章</p>
          <button @click="showUploadModal = true" class="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:opacity-90">上传第一篇文章</button>
        </div>

        <div v-else class="grid gap-4">
          <div v-for="article in customArticles" :key="article.id" @click="startPractice(article.id)" 
            class="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
            <div class="flex items-start justify-between pr-12">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600">{{ article.title }}</h3>
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">自定义</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ article.content.substring(0, 100) }}...</p>
              </div>
            </div>
            <button @click.stop="deleteArticle(article.id)" class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
          </div>
        </div>
      </section>
    </main>

    <!-- 上传弹窗 -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showUploadModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">上传文章</h2>
          <button @click="showUploadModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">选择文件</label>
          <input
            type="file"
            accept=".txt,.json"
            @change="handleFileUpload"
            class="w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300"
          />
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">支持格式：</p>
          <div class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <p>• 纯文本 (.txt)：每一行会作为一段，最终按换行合并为文章正文。</p>
            <p>• JSON（对象）必须包含：<code class="text-xs">title</code>、<code class="text-xs">content</code>。</p>
            <p>• JSON 可选字段：<code class="text-xs">difficulty</code>（默认 <code class="text-xs">beginner</code>）。</p>
            <pre class="mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg text-xs overflow-x-auto">{
  "title": "示例文章标题",
  "content": "第一段...\n第二段...",
  "difficulty": "beginner"
}</pre>
            <div class="pt-2 flex gap-2">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                @click="downloadUploadTemplate('json')"
              >
                下载 JSON 模板
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                @click="downloadUploadTemplate('txt')"
              >
                下载 TXT 模板
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
