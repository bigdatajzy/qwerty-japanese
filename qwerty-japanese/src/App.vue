<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
    <router-view />
  </div>
</template>
