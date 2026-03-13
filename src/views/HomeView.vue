<script setup lang="ts">
import { useRouter } from 'vue-router'
import { dictCategories } from '@/data/dicts'

const router = useRouter()

function startPractice(dictId: string) {
  router.push({ name: 'practice', params: { dictId } })
}

function goToDictSelection() {
  router.push({ name: 'dict' })
}

function goToArticles() {
  router.push({ name: 'articles' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 text-center">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          日语打字练习
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Japanese Typing Practice
        </p>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <!-- 练习入口卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div @click="goToDictSelection" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl mb-4 shadow-lg">
            🎯
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">假名单词</h3>
          <p class="text-slate-500 dark:text-slate-400">学习平假名、片假名和词汇</p>
        </div>

        <div @click="goToArticles" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl mb-4 shadow-lg">
            📄
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">文章练习</h3>
          <p class="text-slate-500 dark:text-slate-400">阅读短文，提升打字速度</p>
        </div>
      </div>

      <!-- 词库分类 -->
      <section>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg shadow-lg">
            📖
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">词库</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">选择你想练习的内容</p>
          </div>
        </div>

        <div class="grid gap-6">
          <div v-for="category in dictCategories" :key="category.id" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {{ category.name }}
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="dict in category.dicts" :key="dict.id" @click="startPractice(dict.id)" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-left hover:bg-emerald-500 hover:text-white transition-all duration-200 group">
                <div class="font-medium text-slate-800 dark:text-white mb-1 group-hover:text-white">{{ dict.name }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400 group-hover:text-white/70">{{ dict.words.length }} 词</div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
      <p>输入罗马字转换为假名</p>
    </footer>
  </div>
</template>
