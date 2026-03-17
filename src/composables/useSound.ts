import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const STORAGE_KEY = 'qwerty-japanese-sound'

export interface SoundSettings {
  enabled: boolean
  correctSound: boolean
  errorSound: boolean
  completeSound: boolean
  volume: number
}

function loadSoundSettings(): SoundSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) { console.error(e) }
  return {
    enabled: true,
    correctSound: true,
    errorSound: true,
    completeSound: true,
    volume: 70
  }
}

export function useSound() {
  const settingsStore = useSettingsStore()
  const soundSettings = ref<SoundSettings>(loadSoundSettings())
  
  // AudioContext 延迟初始化（需要用户交互后才能创建）
  let audioContext: AudioContext | null = null

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContext
  }

  // 保存设置
  watch(soundSettings, (s) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  }, { deep: true })

  // 播放正确音效 - 清脆的上升音
  function playCorrect() {
    if (!soundSettings.value.enabled || !soundSettings.value.correctSound) return
    
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // 上升音调：800Hz → 1200Hz
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08)
      
      // 音量渐变
      const volume = soundSettings.value.volume / 100
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.08)
    } catch (e) {
      console.error('播放音效失败:', e)
    }
  }

  // 播放错误音效 - 低沉的嗡声
  function playError() {
    if (!soundSettings.value.enabled || !soundSettings.value.errorSound) return
    
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // 低频嗡声
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15)
      
      const volume = soundSettings.value.volume / 100
      gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.15)
    } catch (e) {
      console.error('播放音效失败:', e)
    }
  }

  // 播放完成音效 - 三连响
  function playComplete() {
    if (!soundSettings.value.enabled || !soundSettings.value.completeSound) return
    
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime
      
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(1000, now + i * 0.1)
        
        const volume = soundSettings.value.volume / 100
        gainNode.gain.setValueAtTime(volume * 0.2, now + i * 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1)
        
        oscillator.start(now + i * 0.1)
        oscillator.stop(now + i * 0.1 + 0.1)
      }
    } catch (e) {
      console.error('播放音效失败:', e)
    }
  }

  // 切换音效总开关
  function toggleEnabled() {
    soundSettings.value.enabled = !soundSettings.value.enabled
  }

  // 调整音量
  function setVolume(volume: number) {
    soundSettings.value.volume = Math.max(0, Math.min(100, volume))
  }

  return {
    soundSettings,
    playCorrect,
    playError,
    playComplete,
    toggleEnabled,
    setVolume,
    getAudioContext
  }
}
