<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHistory, clearHistory, deleteHistoryRecord, getHistorySummary, exportHistory, type HistoryRecord } from '@/utils/storage'

const router = useRouter()
const history = ref<HistoryRecord[]>([])
const summary = ref({ totalPractice: 0, averageWpm: 0, averageAccuracy: 0, totalTime: 0 })
const showClearConfirm = ref(false)

onMounted(() => {
  loadHistory()
})

function loadHistory() {
  history.value = getHistory()
  summary.value = getHistorySummary()
}

function handleDelete(id: string) {
  deleteHistoryRecord(id)
  loadHistory()
}

function handleClear() {
  clearHistory()
  loadHistory()
  showClearConfirm.value = false
}

function handleExport() {
  const data = exportHistory()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `qwerty-japanese-history-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleExportSingle(record: HistoryRecord) {
  const data = JSON.stringify(record, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = String(record.date || '').replace(/[^\d]/g, '').slice(0, 8) || new Date().toISOString().slice(0, 10).replace(/-/g, '')
  a.href = url
  a.download = `qwerty-japanese-record-${record.id}-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function formatDuration(seconds: number): string {
  const wholeSeconds = Math.round(seconds)
  if (wholeSeconds < 60) return `${wholeSeconds}秒`
  const mins = Math.floor(wholeSeconds / 60)
  const secs = wholeSeconds % 60
  return `${mins}分${secs}秒`
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
          <span class="text-xl">←</span><span>返回</span>
        </button>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-white">📊 练习历史</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <!-- 统计摘要 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" v-if="summary.totalPractice > 0">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg">
          <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ summary.totalPractice }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">总练习次数</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg">
          <div class="text-3xl font-bold text-green-500">{{ summary.averageWpm }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">平均 WPM</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg">
          <div class="text-3xl font-bold text-amber-500">{{ summary.averageAccuracy }}%</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">平均正确率</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg">
          <div class="text-3xl font-bold text-purple-500">{{ formatDuration(summary.totalTime) }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">总练习时长</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 mb-6" v-if="history.length > 0">
        <button @click="handleExport" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl shadow hover:shadow-lg transition-all">
          <span>📥</span>
          <span class="text-sm font-medium">全部导出</span>
        </button>
        <button @click="showClearConfirm = true" class="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl shadow hover:shadow-lg transition-all">
          <span>🗑️</span>
          <span class="text-sm font-medium">清除历史</span>
        </button>
      </div>

      <!-- 历史记录列表 -->
      <div class="space-y-4" v-if="history.length > 0">
        <div v-for="record in history" :key="record.id" 
          class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ record.date }}</span>
              <span class="px-2 py-1 text-xs font-medium rounded-full" 
                :class="record.mode === 'random' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'">
                {{ record.mode === 'random' ? '随机' : '顺序' }}
              </span>
              <span class="font-medium text-slate-700 dark:text-slate-200">{{ record.dictName }}</span>
            </div>
            <button @click="handleDelete(record.id)" class="text-slate-400 hover:text-red-500 transition-colors p-1">
              ✕
            </button>
          </div>
          
          <div class="flex items-center gap-8">
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ record.wpm }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">WPM</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold" :class="record.accuracy >= 90 ? 'text-green-500' : record.accuracy >= 70 ? 'text-amber-500' : 'text-red-500'">
                {{ record.accuracy }}%
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">正确率</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-slate-700 dark:text-slate-300">{{ record.correctChars }}/{{ record.totalChars }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">字符</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-slate-700 dark:text-slate-300">{{ formatDuration(record.duration) }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">时长</div>
            </div>
            <div class="ml-auto">
              <button
                type="button"
                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                @click="handleExportSingle(record)"
              >
                导出
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span class="text-4xl">📝</span>
        </div>
        <h3 class="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">暂无练习记录</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6">完成练习后，这里会显示你的历史记录</p>
        <button @click="router.push({ name: 'home' })" class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
          返回首页
        </button>
      </div>
    </main>

    <!-- 清除确认弹窗 -->
    <div v-if="showClearConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showClearConfirm = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div class="text-center mb-6">
          <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">确认清除</h3>
          <p class="text-slate-500 dark:text-slate-400 mt-2">确定要清除所有练习记录吗？此操作不可恢复。</p>
        </div>
        <div class="flex gap-3">
          <button @click="showClearConfirm = false" class="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            取消
          </button>
          <button @click="handleClear" class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors">
            确认清除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
