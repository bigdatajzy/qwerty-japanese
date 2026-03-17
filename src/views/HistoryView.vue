<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

function goPractice() {
  router.push('/practice')
}
</script>

<template>
  <div class="history-view">
    <div class="header">
      <h1>📊 练习历史</h1>
      <button class="btn btn-secondary" @click="goPractice">开始练习</button>
    </div>

    <!-- 统计摘要 -->
    <div class="summary-cards" v-if="summary.totalPractice > 0">
      <div class="summary-card">
        <div class="value">{{ summary.totalPractice }}</div>
        <div class="label">总练习次数</div>
      </div>
      <div class="summary-card">
        <div class="value">{{ summary.averageWpm }}</div>
        <div class="label">平均 WPM</div>
      </div>
      <div class="summary-card">
        <div class="value">{{ summary.averageAccuracy }}%</div>
        <div class="label">平均正确率</div>
      </div>
      <div class="summary-card">
        <div class="value">{{ formatDuration(summary.totalTime) }}</div>
        <div class="label">总练习时长</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions" v-if="history.length > 0">
      <button class="btn btn-secondary" @click="handleExport">📥 导出记录</button>
      <button class="btn btn-danger" @click="showClearConfirm = true">🗑️ 清除历史</button>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list" v-if="history.length > 0">
      <div class="history-item" v-for="record in history" :key="record.id">
        <div class="item-header">
          <span class="date">{{ record.date }}</span>
          <span class="dict-name">{{ record.dictName }}</span>
          <span class="mode" :class="record.mode">{{ record.mode === 'random' ? '随机' : '顺序' }}</span>
        </div>
        <div class="item-stats">
          <span class="stat">
            <span class="stat-value">{{ record.wpm }}</span>
            <span class="stat-label">WPM</span>
          </span>
          <span class="stat">
            <span class="stat-value">{{ record.accuracy }}%</span>
            <span class="stat-label">正确率</span>
          </span>
          <span class="stat">
            <span class="stat-value">{{ record.correctChars }}/{{ record.totalChars }}</span>
            <span class="stat-label">字符</span>
          </span>
          <span class="stat">
            <span class="stat-value">{{ formatDuration(record.duration) }}</span>
            <span class="stat-label">时长</span>
          </span>
        </div>
        <div class="item-actions">
          <button class="btn-icon" @click="handleDelete(record.id)" title="删除">🗑️</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">📝</div>
      <p>暂无练习记录</p>
      <button class="btn btn-primary" @click="goPractice">开始你的第一次练习</button>
    </div>

    <!-- 清除确认弹窗 -->
    <div class="modal-overlay" v-if="showClearConfirm" @click.self="showClearConfirm = false">
      <div class="modal">
        <h3>确认清除</h3>
        <p>确定要清除所有练习记录吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showClearConfirm = false">取消</button>
          <button class="btn btn-danger" @click="handleClear">确认清除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.history-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow);
  
  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary);
  }
  
  .label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
  position: relative;
  
  .item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .date {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .dict-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .mode {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--bg-secondary);
      color: var(--text-secondary);
      
      &.random {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
    }
  }
  
  .item-stats {
    display: flex;
    gap: 24px;
    
    .stat {
      display: flex;
      align-items: baseline;
      gap: 4px;
      
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
  
  .item-actions {
    position: absolute;
    top: 16px;
    right: 16px;
    
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      opacity: 0.5;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 1;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  &-primary {
    background: var(--primary);
    color: white;
    
    &:hover {
      filter: brightness(1.1);
    }
  }
  
  &-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    
    &:hover {
      background: var(--border);
    }
  }
  
  &-danger {
    background: #ef4444;
    color: white;
    
    &:hover {
      filter: brightness(1.1);
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  
  h3 {
    margin: 0 0 12px;
    font-size: 18px;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>
