import type { KanaWord } from '@/types/dict'
import type { TypingError } from '@/types/typing'

const STORAGE_KEY = 'qwerty-japanese-history'
const MAX_RECORDS = 50

export interface HistoryRecord {
  id: string
  timestamp: number
  date: string
  
  // 练习信息
  dictId: string
  dictName: string
  mode: 'order' | 'random'
  
  // 统计
  totalChars: number
  correctChars: number
  wrongChars: number
  accuracy: number
  wpm: number
  duration: number
  
  // 错误详情
  errors: TypingError[]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取所有历史记录
export function getHistory(): HistoryRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (e) {
    console.error('读取历史记录失败:', e)
    return []
  }
}

// 保存历史记录
export function addHistoryRecord(record: Omit<HistoryRecord, 'id' | 'date'>): HistoryRecord {
  const history = getHistory()
  
  const newRecord: HistoryRecord = {
    ...record,
    id: generateId(),
    date: formatDate(record.timestamp)
  }
  
  // 添加到开头（最新的在前）
  history.unshift(newRecord)
  
  // 超出容量时删除最旧的
  while (history.length > MAX_RECORDS) {
    history.pop()
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  
  return newRecord
}

// 删除单条记录
export function deleteHistoryRecord(id: string): void {
  const history = getHistory()
  const filtered = history.filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

// 清除所有历史
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// 导出为 JSON
export function exportHistory(): string {
  const history = getHistory()
  return JSON.stringify(history, null, 2)
}

// 导入 JSON
export function importHistory(jsonString: string): boolean {
  try {
    const records = JSON.parse(jsonString)
    if (!Array.isArray(records)) return false
    
    const history = getHistory()
    const merged = [...records, ...history]
    
    // 去重
    const unique = merged.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique.slice(0, MAX_RECORDS)))
    return true
  } catch (e) {
    console.error('导入历史记录失败:', e)
    return false
  }
}

// 获取统计摘要
export function getHistorySummary(): {
  totalPractice: number
  averageWpm: number
  averageAccuracy: number
  totalTime: number
} {
  const history = getHistory()
  
  if (history.length === 0) {
    return { totalPractice: 0, averageWpm: 0, averageAccuracy: 0, totalTime: 0 }
  }
  
  const totalPractice = history.length
  const averageWpm = Math.round(history.reduce((sum, r) => sum + r.wpm, 0) / totalPractice)
  const averageAccuracy = Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / totalPractice)
  const totalTime = Math.round(history.reduce((sum, r) => sum + r.duration, 0))
  
  return { totalPractice, averageWpm, averageAccuracy, totalTime }
}
