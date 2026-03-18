<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import JapaneseKeyboard from './JapaneseKeyboard.vue'

const settingsStore = useSettingsStore()

const showKeyboard = computed(() => settingsStore.settings.showKeyboard)
</script>

<template>
  <div v-if="showKeyboard" class="keyboard-wrapper">
    <JapaneseKeyboard />
  </div>
</template>

<style scoped>
.keyboard-wrapper {
  width: 100%;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
  margin-top: 2rem;
}
</style>
