<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadArticle } from '@/api/articles'
import type { Article } from '@/types/article'

const route = useRoute()
const router = useRouter()

const articleId = computed(() => route.params.articleId as string)
const article = ref<Article | null>(null)
const charData = ref<{ char: string; kana: string[]; status: 'pending' | 'current' | 'correct' }[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const currentIndex = ref(0)
const startTime = ref<number | null>(null)
const correctChars = ref(0)
const errorChars = ref(0)
const isLoading = ref(true)

// 扩展词典 - 支持多音字
const dictionary: Record<string, string[]> = {
  '日本語': ['に', 'ほん', 'ご'],
  '英語': ['えい', 'ご'],
  '中国語': ['ちゅう', 'ごく', 'ご'],
  '韓国語': ['かん', 'こく', 'ご'],
  '勉強': ['べん', 'きょう'],
  '練習': ['れ', 'ん', 'しゅう'],
  '学習': ['がく', 'しゅう'],
  '今日': ['きょ', 'う'],
  '明日': ['あ', 'した'],
  '昨日': ['き', 'の', 'う'],
  '今年': ['こ', 'と', 'し'],
  '来年': ['ら', 'い', 'ねん'],
  '毎日': ['ま', 'い', 'に', 'ち'],
  '日本': ['に', 'ほん'],
  '東京': ['と', 'う', 'きょう'],
  '大阪': ['お', 'お', 'さ', 'か'],
  '京都': ['きょ', 'う', 'と'],
  '旅行': ['りょ', 'こう'],
  '料理': ['りょう', 'り'],
  '映画': ['えい', 'が'],
  '電話': ['で', 'ん', 'わ'],
  '病院': ['びょう', 'いん'],
  '銀行': ['ぎん', 'こう'],
  '勉強する': ['べん', 'きょう', 'する'],
  '練習する': ['れ', 'ん', 'しゅう', 'する'],
}

// 解析文本，生成注音
function parseText(text: string) {
  const result: { char: string; kana: string[] }[] = []
  let i = 0
  
  while (i < text.length) {
    let matched = false
    
    // 尝试匹配最长词（2-6个字符）
    for (let len = Math.min(6, text.length - i); len >= 2; len--) {
      const word = text.slice(i, i + len)
      if (dictionary[word]) {
        const kanaList = dictionary[word]
        // 将每个词拆分，每个字符对应一个或多个假名
        for (let j = 0; j < word.length; j++) {
          // 简化处理：每个汉字对应一个假名单元
          const startIdx = j < kanaList.length ? j : kanaList.length - 1
          const kana = kanaList.slice(startIdx).join('')
          result.push({ char: word[j], kana: kanaList[j] ? [kanaList[j]] : [word[j]] })
        }
        i += len
        matched = true
        break
      }
    }
    
    if (!matched) {
      // 未匹配，单字符
      result.push({ char: text[i], kana: [text[i]] })
      i++
    }
  }
  return result
}

async function loadArticleData() {
  isLoading.value = true
  const id = articleId.value
  
  if (!id) {
    console.warn('articleId is missing, waiting for route params...')
    return
  }
  
  console.log('Loading article:', id)
  const found = await loadArticle(id)
  
  if (found) {
    article.value = found
    charData.value = parseText(found.content).map(c => ({ ...c, status: 'pending' as const }))
    isLoading.value = false
  } else {
    console.error('Failed to load article:', id)
    router.push({ name: 'articles' })
  }
}

// 监听路由参数变化
watch(articleId, (newId) => {
  if (newId) {
    loadArticleData()
  }
}, { immediate: true })

const progress = computed(() => charData.value.length === 0 ? 0 : (currentIndex.value / charData.value.length) * 100)
const wpm = computed(() => {
  if (!startTime.value || correctChars.value === 0) return 0
  const minutes = (Date.now() - startTime.value) / 60000
  if (minutes < 0.01) return 0
  return Math.round(correctChars.value / minutes)
})
const accuracy = computed(() => {
  const total = correctChars.value + errorChars.value
  if (total === 0) return 100
  return Math.round((correctChars.value / total) * 100)
})
const currentChar = computed(() => charData.value[currentIndex.value]?.char || '')
const currentKana = computed(() => charData.value[currentIndex.value]?.kana?.join('') || '')

function handleInput() {
  if (!startTime.value) startTime.value = Date.now()
  
  if (inputValue.value.length > 0) {
    const lastChar = inputValue.value[inputValue.value.length - 1]
    const expectedChar = charData.value[currentIndex.value]?.char
    
    if (lastChar === expectedChar) {
      correctChars.value++
      charData.value[currentIndex.value].status = 'correct'
      currentIndex.value++
    } else {
      errorChars.value++
    }
    inputValue.value = ''
  }

  if (currentIndex.value >= charData.value.length) {
    finishPractice()
  }
}

function finishPractice() {
  sessionStorage.setItem('article-result', JSON.stringify({
    wpm: wpm.value,
    accuracy: accuracy.value,
    totalChars: charData.value.length,
    correctChars: correctChars.value,
    errorChars: errorChars.value,
  }))
  router.push({ name: 'result' })
}

function handleKeydown(e: KeyboardEvent) { if (e.key === 'Escape') router.push({ name: 'articles' }) }

onMounted(() => { loadArticleData().then(() => inputRef.value?.focus()) })
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="router.push({ name: 'articles' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
          <span class="text-xl">←</span><span>退出</span>
        </button>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-white truncate max-w-xs">{{ article?.title || '文章练习' }}</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <!-- 进度条 -->
      <div class="mb-6">
        <div class="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">{{ currentIndex }} / {{ charData.length }} 字符</div>
      </div>

      <!-- 文章内容 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6 font-medium text-lg leading-loose">
        <div class="flex flex-wrap gap-x-2 gap-y-1">
          <span v-for="(item, index) in charData" :key="index" class="ruby-char" :class="{ 'text-green-500': item.status === 'correct', 'bg-indigo-500 text-white rounded px-1': item.status === 'current', 'opacity-40': item.status === 'pending' }">
            <span class="ruby-kana">{{ item.kana.join('') }}</span>
            <span class="ruby-base">{{ item.char }}</span>
          </span>
        </div>
      </div>

      <!-- 输入框 -->
      <input ref="inputRef" v-model="inputValue" @input="handleInput" type="text" 
        class="w-full px-6 py-5 text-center text-xl font-mono rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500 focus:border-purple-500 outline-none shadow-lg mb-6" 
        placeholder="请输入当前高亮的字符..." autocomplete="off" autofocus />

      <!-- 当前输入提示 -->
      <div class="text-center mb-6">
        <span class="text-slate-500 dark:text-slate-400">当前输入: <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ currentChar }}</span></span>
      </div>

      <!-- 统计 -->
      <div class="flex justify-center gap-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ wpm }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">WPM</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-500">{{ accuracy }}%</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">正确率</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-700 dark:text-slate-300">{{ correctChars }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">正确</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-500">{{ errorChars }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">错误</div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ruby-char { display: inline-flex; flex-direction: column; align-items: center; line-height: 1.2; margin: 2px 4px; }
.ruby-kana { font-size: 9px; color: #6366f1; }
.ruby-base { font-size: 20px; font-weight: 500; }
</style>
