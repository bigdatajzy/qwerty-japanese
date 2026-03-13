<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.initTheme()
})
</script>

<template>
  <div class="min-h-screen">
    <router-view />
  </div>
</template>
