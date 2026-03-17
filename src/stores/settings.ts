import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type InputMode = 'romaji' | 'kana'

export interface Settings {
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  showRomaji: boolean
  showMeaning: boolean
  inputMode: InputMode
  showKeyboard: boolean
  showRuby: boolean
  // 盲打模式
  blindMode: {
    enabled: boolean
    level: 1 | 2 | 3
    showNextRomaji: boolean
  }
}

const STORAGE_KEY = 'qwerty-japanese-settings'

export const useSettingsStore = defineStore('settings', () => {
  function loadSettings(): Settings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) { console.error(e) }
    return {
      theme: 'dark',
      soundEnabled: true,
      showRomaji: true,
      showMeaning: false,
      inputMode: 'romaji',
      showKeyboard: true,
      showRuby: true,
      blindMode: {
        enabled: false,
        level: 1,
        showNextRomaji: true
      }
    }
  }

  const settings = ref<Settings>(loadSettings())

  watch(settings, (s) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    applyTheme(s.theme)
  }, { deep: true })

  function applyTheme(theme: 'light' | 'dark' | 'auto') {
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  function initTheme() { applyTheme(settings.value.theme) }
  function setTheme(t: 'light' | 'dark' | 'auto') { settings.value.theme = t }
  function toggleSound() { settings.value.soundEnabled = !settings.value.soundEnabled }
  function toggleRomaji() { settings.value.showRomaji = !settings.value.showRomaji }
  function toggleMeaning() { settings.value.showMeaning = !settings.value.showMeaning }
  function setInputMode(m: InputMode) { settings.value.inputMode = m }
  function toggleInputMode() { settings.value.inputMode = settings.value.inputMode === 'romaji' ? 'kana' : 'romaji' }
  function toggleShowKeyboard() { settings.value.showKeyboard = !settings.value.showKeyboard }
  function toggleShowRuby() { settings.value.showRuby = !settings.value.showRuby }
  
  // 盲打模式
  function toggleBlindMode() { 
    settings.value.blindMode.enabled = !settings.value.blindMode.enabled 
  }
  function setBlindLevel(level: 1 | 2 | 3) {
    settings.value.blindMode.level = level
  }
  function toggleBlindNextRomaji() {
    settings.value.blindMode.showNextRomaji = !settings.value.blindMode.showNextRomaji
  }

  return { settings, initTheme, setTheme, toggleSound, toggleRomaji, toggleMeaning, setInputMode, toggleInputMode, toggleShowKeyboard, toggleShowRuby, toggleBlindMode, setBlindLevel, toggleBlindNextRomaji }
})
