<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadArticle } from '@/api/articles'
import type { Article } from '@/types/article'
import { useSound } from '@/composables/useSound'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const { playCorrect, playError, playComplete } = useSound()

const articleId = computed(() => route.params.articleId as string)
const article = ref<Article | null>(null)
const units = ref<{ text: string; status: 'pending' | 'current' | 'correct' | 'error' }[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const inputStatus = ref<'default' | 'correct' | 'error'>('default')
const currentIndex = ref(0)
const startTime = ref<number | null>(null)
const correctUnits = ref(0)
const errorUnits = ref(0)
const isLoading = ref(true)
const showTranslation = ref(false)
const showRuby = ref(true)

// 词典和其他函数保持不变...
const dictionary: Record<string, string[]> = {
  '日本語': ['に', 'ほん', 'ご'],
  '英語': ['えい', 'ご'],
  '中国語': ['ちゅう', 'ごく', 'ご'],
  '韓国語': ['かん', 'こく', 'ご'],
  '日本語を': ['に', 'ほん', 'ご', 'を'],
  '勉強': ['べん', 'きょう'],
  '練習': ['れ', 'ん', 'しゅう'],
  '学習': ['がく', 'しゅう'],
  '新しい': ['あたら', 'しい'],
  '単語': ['たん', 'ご'],
  '覚える': ['おぼ', 'える'],
  '嬉しい': ['られ', 'しい'],
  '文章': ['ぶん', 'しょう'],
  '書く': ['か', 'く'],
  '読む': ['よ', 'む'],
  '話す': ['はな', 'す'],
  '聞く': ['き', 'く'],
  '見る': ['み', 'る'],
  '言う': ['い', 'う'],
  '行う': ['おこ', 'なう'],
  'なる': ['な', 'る'],
  'する': ['する'],
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
  '友達': ['とも', 'だち'],
  '番組': ['ばん', 'ぐみ'],
  '文化': ['ぶん', 'か'],
  '技術': ['ぎ', 'じゅつ'],
  '自動': ['じ', 'どう'],
  '運転': ['う', 'ん', 'てん'],
  '可能': ['か', 'のう'],
  '倫理': ['りん', 'り'],
  '問題': ['もん', 'だい'],
  '保護': ['ほ', 'ご'],
  '雇用': ['こ', 'よう'],
  '今後': ['こん', 'ご'],
  '人間': ['に', 'ん', 'げん'],
  '中心': ['ちゅ', 'う', 'しん'],
  '便利': ['べん', 'り'],
  '勉強する': ['べん', 'きょう', 'する'],
  '練習する': ['れ', 'ん', 'しゅう', 'する'],
  '楽しい': ['た', 'の', 'しい'],
  '難しい': ['む', 'ず', 'か', 'しい'],
  ' 일자리': ['い', 'し', 'ろ'],
  'やりがい': ['や', 'がい'],
  '上達': ['じょ', 'う', 'たつ'],
  '耳': ['み', 'み'],
  '慣れる': ['な', 'れる'],
  '漢字': ['かん', 'じ'],
  '大変': ['たい', 'へん'],
  '必要': ['ひつ', 'よう'],
  '学ぶ': ['まな', 'ぶ'],
  '面白い': ['おも', 'しろ', 'い'],
  'マスター': ['ます', 'たー'],
  '努力': ['どり', 'ょく'],
  '続ける': ['つづけ', 'る'],
  '感じる': ['かん', 'じる'],
}

function parseTextToUnits(text: string) {
  const delimiters = ['。', '！', '？', '、', '，', ' ']
  const result: { text: string; status: 'pending' | 'current' | 'correct' | 'error' }[] = []
  let currentUnit = ''
  
  for (const char of text) {
    currentUnit += char
    if (delimiters.includes(char)) {
      if (currentUnit.trim()) {
        result.push({ text: currentUnit, status: 'pending' })
      }
      currentUnit = ''
    }
  }
  
  if (currentUnit.trim()) {
    result.push({ text: currentUnit, status: 'pending' })
  }
  
  if (result.length > 0) {
    result[0].status = 'current'
  }
  
  return result
}

function addRubyToText(text: string): { char: string; ruby?: string }[] {
  const result: { char: string; ruby?: string }[] = []
  let i = 0
  
  while (i < text.length) {
    const char = text[i]
    
    if (['。', '！', '？', '、', '，', ' ', '　'].includes(char)) {
      result.push({ char })
      i++
      continue
    }
    
    const code = char.codePointAt(0) || 0
    const isHiragana = code >= 0x3040 && code <= 0x309F
    const isKatakana = code >= 0x30A0 && code <= 0x30FF
    if (isHiragana || isKatakana) {
      result.push({ char })
      i++
      continue
    }
    
    let matched = false
    for (let len = Math.min(6, text.length - i); len >= 2; len--) {
      const word = text.slice(i, i + len)
      if (dictionary[word]) {
        const kanaList = dictionary[word]
        for (let j = 0; j < word.length; j++) {
          if (j < kanaList.length) {
            result.push({ char: word[j], ruby: kanaList[j] })
          } else {
            result.push({ char: word[j] })
          }
        }
        i += len
        matched = true
        break
      }
    }
    
    if (!matched) {
      result.push({ char })
      i++
    }
  }
  
  return result
}

async function loadArticleData() {
  isLoading.value = true
  const id = articleId.value
  
  if (!id) return
  
  const found = await loadArticle(id)
  
  if (found) {
    article.value = found
    units.value = parseTextToUnits(found.content)
    isLoading.value = false
  } else {
    router.push({ name: 'articles' })
  }
}

watch(articleId, (newId) => {
  if (newId) loadArticleData()
}, { immediate: true })

const currentUnit = computed(() => units.value[currentIndex.value]?.text || '')

const articleWithRuby = computed(() => {
  if (!article.value) return []
  return addRubyToText(article.value.content)
})

const progress = computed(() => units.value.length === 0 ? 0 : (currentIndex.value / units.value.length) * 100)

const wpm = computed(() => {
  if (!startTime.value || correctUnits.value === 0) return 0
  const minutes = (Date.now() - startTime.value) / 60000
  if (minutes < 0.01) return 0
  let correctChars = 0
  for (let i = 0; i < currentIndex.value; i++) {
    correctChars += units.value[i].text.length
  }
  return Math.round(correctChars / minutes)
})

// 输入处理 - 修复版
function handleInput() {
  if (!startTime.value) {
    startTime.value = Date.now()
  }
  
  const target = currentUnit.value
  const input = inputValue.value
  
  if (input === target) {
    // 完全匹配
    inputStatus.value = 'correct'
    playCorrect()
    handleCorrect()
  } else if (!target.startsWith(input)) {
    // 输入不匹配 - 只显示错误提示，不删除已输入内容
    inputStatus.value = 'error'
    playError()
    errorUnits.value++
    units.value[currentIndex.value].status = 'error'
    
    setTimeout(() => {
      inputStatus.value = 'default'
      // 不清空 inputValue，让用户可以继续修改
      if (units.value[currentIndex.value]) {
        units.value[currentIndex.value].status = 'current'
      }
    }, 500)
  } else {
    // 输入正确但未完成，清除错误状态
    if (inputStatus.value === 'error') {
      inputStatus.value = 'default'
      units.value[currentIndex.value].status = 'current'
    }
  }
}

function handleCorrect() {
  correctUnits.value++
  units.value[currentIndex.value].status = 'correct'
  inputValue.value = ''
  inputStatus.value = 'default'
  
  currentIndex.value++
  
  if (currentIndex.value >= units.value.length) {
    finishPractice()
  } else {
    units.value[currentIndex.value].status = 'current'
  }
}

function finishPractice() {
  playComplete()
  const totalChars = units.value.reduce((sum, unit) => sum + unit.text.length, 0)
  
  sessionStorage.setItem('article-result', JSON.stringify({
    wpm: wpm.value,
    totalUnits: units.value.length,
    correctUnits: correctUnits.value,
    errorUnits: errorUnits.value,
    totalChars: totalChars,
  }))
  router.push({ name: 'result' })
}

function handleKeydown(e: KeyboardEvent) { 
  if (e.key === 'Escape') router.push({ name: 'articles' }) 
}

// 切换音效
function toggleSound() {
  settingsStore.settings.sound.enabled = !settingsStore.settings.sound.enabled
}

onMounted(() => { 
  loadArticleData().then(() => inputRef.value?.focus())
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 dark:text-slate-400">加载中...</p>
      </div>
    </div>

    <template v-else>
      <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button @click="router.push({ name: 'articles' })" class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
            <span class="text-xl">←</span><span>退出</span>
          </button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-white truncate max-w-xs">{{ article?.title || '文章练习' }}</h1>
          <div class="flex items-center gap-2">
            <button @click="toggleSound" class="px-3 py-1.5 text-sm rounded-lg transition-colors" :class="settingsStore.settings.sound?.enabled ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'">
              {{ settingsStore.settings.sound?.enabled ? '🔊 音效' : '🔇 静音' }}
            </button>
            <button @click="showRuby = !showRuby" class="px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors">
              {{ showRuby ? '隐藏注音' : '显示注音' }}
            </button>
            <button v-if="article?.translation" @click="showTranslation = !showTranslation" class="px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
              {{ showTranslation ? '隐藏翻译' : '显示翻译' }}
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 py-8">
        <!-- 进度条 -->
        <div class="mb-6">
          <div class="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">{{ currentIndex }} / {{ units.length }} 单元</div>
        </div>

        <!-- 文章内容 -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6 font-medium text-lg leading-relaxed">
          <div class="flex flex-wrap gap-2">
            <span v-for="(unit, index) in units" :key="index" 
              class="px-3 py-2 rounded-lg transition-all duration-200"
              :class="{
                'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400': unit.status === 'correct',
                'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500': unit.status === 'current',
                'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400': unit.status === 'error',
                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400': unit.status === 'pending'
              }">
              <span v-for="(item, charIndex) in addRubyToText(unit.text)" :key="charIndex" class="inline-block mx-0.5">
                <span v-if="showRuby && item.ruby && item.ruby.length > 0" class="ruby-wrapper">
                  <span class="ruby-text">{{ item.ruby }}</span>
                  <span class="base-text">{{ item.char }}</span>
                </span>
                <span v-else-if="showRuby" class="ruby-wrapper">
                  <span class="ruby-text">&nbsp;</span>
                  <span class="base-text">{{ item.char }}</span>
                </span>
                <span v-else class="base-text">{{ item.char }}</span>
              </span>
            </span>
          </div>
        </div>

        <!-- 翻译内容 -->
        <div v-if="showTranslation && article?.translation" class="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">📖</span>
            <span class="font-medium text-amber-800 dark:text-amber-200">翻译</span>
          </div>
          <p class="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{{ article.translation }}</p>
        </div>

        <!-- 输入框 -->
        <div class="flex items-center justify-center gap-2 mb-3">
          <span class="inline-flex flex-col items-center">
            <span class="ruby-text">&nbsp;</span>
            <span class="text-slate-600 dark:text-slate-300">请输入：</span>
          </span>
          <span v-if="currentUnit" class="inline-flex flex-wrap items-center justify-center gap-0.5">
            <span v-for="(item, charIndex) in addRubyToText(currentUnit)" :key="charIndex" class="ruby-wrapper">
              <span v-if="showRuby && item.ruby && item.ruby.length > 0" class="ruby-text">{{ item.ruby }}</span>
              <span v-else-if="showRuby" class="ruby-text">&nbsp;</span>
              <span class="base-text text-indigo-700 dark:text-indigo-300">{{ item.char }}</span>
            </span>
          </span>
        </div>
        <input ref="inputRef" v-model="inputValue" @input="handleInput" type="text" 
          class="w-full px-6 py-5 text-center text-xl font-mono rounded-2xl bg-white dark:bg-slate-800 border-2 outline-none transition-all shadow-lg text-slate-800 dark:text-white"
          :class="inputStatus === 'correct' ? 'border-green-500' : inputStatus === 'error' ? 'border-red-500' : 'border-indigo-500 focus:border-purple-500'"
          placeholder="输入上方高亮的文本..." autocomplete="off" autofocus />

        <!-- 统计 -->
        <div class="flex justify-center gap-8 mt-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ wpm }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">WPM</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-500">{{ correctUnits }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">完成</div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.ruby-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: bottom;
}
.ruby-text {
  font-size: 9px;
  color: #6366f1;
  line-height: 1;
}
.base-text {
  font-size: inherit;
  line-height: 1;
}
</style>
