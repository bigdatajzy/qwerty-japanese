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
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <!-- Header -->
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-2">
        日语打字练习
      </h1>
      <p class="text-[var(--color-text-secondary)]">
        Japanese Typing Practice
      </p>
    </header>

    <!-- Start Button -->
    <div class="text-center mb-12">
      <button
        @click="goToDictSelection"
        class="px-8 py-4 bg-indigo-600 text-white rounded-lg text-xl font-semibold
               hover:bg-indigo-700 transition-colors shadow-lg"
      >
        🎯 开始练习
      </button>
    </div>

    <!-- Dict Categories -->
    <div class="space-y-6">
      <div 
        v-for="category in dictCategories" 
        :key="category.id"
        class="bg-[var(--color-card)] rounded-xl p-6 shadow-md"
      >
        <h2 class="text-xl font-semibold mb-4">
          {{ category.name }}
        </h2>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="dict in category.dicts"
            :key="dict.id"
            @click="startPractice(dict.id)"
            class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 
                   text-gray-900 dark:text-white
                   hover:bg-emerald-500 hover:text-white
                   transition-colors text-left font-medium"
          >
            <div>{{ dict.name }}</div>
            <div class="text-sm opacity-70">{{ dict.words.length }} 词</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="text-center mt-12 text-[var(--color-text-secondary)] text-sm">
      <p>按空格键开始，输入罗马字转换为假名</p>
    </footer>
  </div>
</template>
