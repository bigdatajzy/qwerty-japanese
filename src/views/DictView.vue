<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { dictCategories } from '@/data/dicts'

const router = useRouter()
const selectedDictId = ref('')

function startPractice() {
  if (selectedDictId.value) {
    router.push({ name: 'practice', params: { dictId: selectedDictId.value } })
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8">
      <button 
        @click="router.push({ name: 'home' })"
        class="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        ← 返回
      </button>
      <h1 class="text-xl font-semibold">选择词库</h1>
      <div class="w-12"></div>
    </header>

    <!-- Dict List -->
    <div class="space-y-6 mb-8">
      <div 
        v-for="category in dictCategories" 
        :key="category.id"
        class="bg-[var(--color-card)] rounded-xl p-6 shadow-md"
      >
        <h2 class="text-lg font-semibold mb-4">{{ category.name }}</h2>
        <div class="space-y-2">
          <label
            v-for="dict in category.dicts"
            :key="dict.id"
            class="flex items-center p-3 rounded-lg cursor-pointer
                   hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
          >
            <input
              type="radio"
              :value="dict.id"
              v-model="selectedDictId"
              class="w-4 h-4 text-primary"
            />
            <div class="ml-3 flex-1">
              <div class="font-medium">{{ dict.name }}</div>
              <div class="text-sm text-[var(--color-text-secondary)]">
                {{ dict.words.length }} 词 · {{ dict.description }}
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <button
      @click="startPractice"
      :disabled="!selectedDictId"
      class="w-full py-4 bg-primary text-white rounded-lg font-semibold
             hover:bg-primary-dark transition-colors
             disabled:opacity-50 disabled:cursor-not-allowed"
    >
      开始练习
    </button>
  </div>
</template>
