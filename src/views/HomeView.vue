<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  clearPracticeStats,
  getOverviewStats,
  getRecentSessions,
  getTodayStats,
  type PracticeSession,
} from '@/utils/practiceStatsDb'

const router = useRouter()
const loadingStats = ref(true)
const loadStatsError = ref(false)
const todayStats = ref({
  sessionCount: 0,
  durationSec: 0,
  unitsTotal: 0,
  unitsCorrect: 0,
  unitsError: 0,
  avgWpm: 0,
  avgAccuracy: 0,
})
const allStats = ref({
  sessionCount: 0,
  durationSec: 0,
  unitsTotal: 0,
  unitsCorrect: 0,
  unitsError: 0,
  avgWpm: 0,
  avgAccuracy: 0,
})
const recentSessions = ref<PracticeSession[]>([])
const clearingStats = ref(false)
const showClearConfirm = ref(false)

function startPractice(dictId: string) {
  router.push({ name: 'practice', params: { dictId }, query: { mode: 'random' } })
}

function goToDictSelection() {
  router.push({ name: 'dict' })
}

function goToArticles() {
  router.push({ name: 'articles' })
}

function goToHistory() {
  router.push({ name: 'history' })
}

function goToWords() {
  router.push({ name: 'words' })
}

const todayDurationLabel = computed(() => formatDuration(todayStats.value.durationSec))
const allDurationLabel = computed(() => formatDuration(allStats.value.durationSec))

function formatDuration(sec: number): string {
  const mins = Math.floor(sec / 60)
  const hours = Math.floor(mins / 60)
  if (hours > 0) return `${hours}h ${mins % 60}m`
  return `${mins}m`
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sessionTypeLabel(t: PracticeSession['type']): string {
  if (t === 'kana') return '假名'
  if (t === 'word') return '单词'
  return '文章'
}

async function loadDashboard() {
  loadingStats.value = true
  loadStatsError.value = false
  try {
    const [today, overall, recent] = await Promise.all([
      getTodayStats(),
      getOverviewStats(),
      getRecentSessions(10),
    ])
    todayStats.value = today
    allStats.value = overall
    recentSessions.value = recent
  } catch {
    loadStatsError.value = true
  } finally {
    loadingStats.value = false
  }
}

onMounted(() => {
  void loadDashboard()
})

async function clearAllStats() {
  if (clearingStats.value) return
  clearingStats.value = true
  try {
    await clearPracticeStats()
    await loadDashboard()
    showClearConfirm.value = false
  } finally {
    clearingStats.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 text-center">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          日语打字练习
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Japanese Typing Practice
        </p>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">个人练习看板</h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
              @click="loadDashboard"
            >
              刷新
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 disabled:opacity-60"
              :disabled="clearingStats"
              @click="showClearConfirm = true"
            >
              {{ clearingStats ? '清空中...' : '清空统计' }}
            </button>
          </div>
        </div>
        <div v-if="loadStatsError" class="mb-4 text-sm text-red-600 dark:text-red-400">
          统计数据读取失败（IndexedDB）。
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">今日练习次数</div>
            <div class="text-2xl font-bold text-slate-800 dark:text-white">
              {{ loadingStats ? '-' : todayStats.sessionCount }}
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">今日用时</div>
            <div class="text-2xl font-bold text-slate-800 dark:text-white">
              {{ loadingStats ? '-' : todayDurationLabel }}
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">今日完成题数</div>
            <div class="text-2xl font-bold text-slate-800 dark:text-white">
              {{ loadingStats ? '-' : todayStats.unitsTotal }}
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">今日平均正确率</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ loadingStats ? '-' : `${todayStats.avgAccuracy}%` }}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">累计练习次数</div>
            <div class="text-2xl font-bold text-slate-800 dark:text-white">
              {{ loadingStats ? '-' : allStats.sessionCount }}
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">累计用时</div>
            <div class="text-2xl font-bold text-slate-800 dark:text-white">
              {{ loadingStats ? '-' : allDurationLabel }}
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">累计平均 WPM</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ loadingStats ? '-' : allStats.avgWpm }}
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 dark:text-slate-400">累计平均正确率</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ loadingStats ? '-' : `${allStats.avgAccuracy}%` }}
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-slate-100 dark:border-slate-700">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-3">最近练习记录</h3>
          <div v-if="!loadingStats && recentSessions.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
            还没有练习记录，先开始一次练习吧。
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="s in recentSessions"
              :key="s.id"
              class="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700/40"
            >
              <div class="min-w-0">
                <div class="font-medium text-slate-700 dark:text-slate-200 truncate">
                  [{{ sessionTypeLabel(s.type) }}] {{ s.sourceName }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatTime(s.endedAt) }} · {{ Math.round(s.durationSec) }}s
                </div>
              </div>
              <div class="text-right shrink-0 ml-3">
                <div class="font-semibold text-indigo-600 dark:text-indigo-400">{{ s.wpm }} WPM</div>
                <div class="text-xs text-emerald-600 dark:text-emerald-400">{{ s.accuracy }}%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 练习入口卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div @click="goToDictSelection" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl mb-4 shadow-lg">
            🎯
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">假名练习</h3>
          <p class="text-slate-500 dark:text-slate-400">学习平假名、片假名</p>
        </div>

        <div @click="goToWords" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-3xl mb-4 shadow-lg">
            📚
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">单词练习</h3>
          <p class="text-slate-500 dark:text-slate-400">JLPT N5-N1 词汇</p>
        </div>

        <div @click="goToArticles" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl mb-4 shadow-lg">
            📄
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">文章练习</h3>
          <p class="text-slate-500 dark:text-slate-400">阅读短文，提升速度</p>
        </div>

        <div @click="goToHistory" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl mb-4 shadow-lg">
            📊
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">历史记录</h3>
          <p class="text-slate-500 dark:text-slate-400">查看练习统计</p>
        </div>
      </div>

    </main>

    <div
      v-if="showClearConfirm"
      class="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showClearConfirm = false"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-2xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-white mb-2">确认清空统计</h3>
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-5">
          将删除所有本地练习统计数据（IndexedDB），该操作不可撤销。
        </p>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
            :disabled="clearingStats"
            @click="showClearConfirm = false"
          >
            取消
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white disabled:opacity-60"
            :disabled="clearingStats"
            @click="clearAllStats"
          >
            {{ clearingStats ? '清空中...' : '确认清空' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
