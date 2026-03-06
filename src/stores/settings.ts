import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type InputMode = 'romaji' | 'kana'

export interface Settings {
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  showRomaji: boolean
  showMeaning: boolean
  inputMode: InputMode
}

const STORAGE_KEY = 'qwerty-japanese-settings'

export const useSettingsStore = defineStore('settings', () => {
  function loadSettings(): Settings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载设置失败', e)
    }
    return {
      theme: 'dark',
      soundEnabled: true,
      showRomaji: true,
      showMeaning: false,
      inputMode: 'romaji'
    }
  }

  const settings = ref<Settings>(loadSettings())

  watch(settings, (newSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    applyTheme(newSettings.theme)
  }, { deep: true })

  function applyTheme(theme: 'light' | 'dark' | 'auto') {
    const isDark = theme === 'dark' || 
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function initTheme() {
    applyTheme(settings.value.theme)
  }

  function setTheme(theme: 'light' | 'dark' | 'auto') {
    settings.value.theme = theme
  }

  function toggleSound() {
    settings.value.soundEnabled = !settings.value.soundEnabled
  }

  function toggleRomaji() {
    settings.value.showRomaji = !settings.value.showRomaji
  }

  function toggleMeaning() {
    settings.value.showMeaning = !settings.value.showMeaning
  }

  function setInputMode(mode: InputMode) {
    settings.value.inputMode = mode
  }

  function toggleInputMode() {
    settings.value.inputMode = settings.value.inputMode === 'romaji' ? 'kana' : 'romaji'
  }

  return {
    settings,
    initTheme,
    setTheme,
    toggleSound,
    toggleRomaji,
    toggleMeaning,
    setInputMode,
    toggleInputMode
  }
})
