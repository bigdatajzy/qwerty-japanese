import { useSettingsStore } from '@/stores/settings'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export function useSound() {
  const settingsStore = useSettingsStore()

  // 播放正确音效 - 清脆的上升音
  function playCorrect() {
    const sound = settingsStore.settings.sound
    if (!sound?.enabled || !sound.correctSound) return
    
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08)
      
      const volume = (sound.volume || 70) / 100
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
    const sound = settingsStore.settings.sound
    if (!sound?.enabled || !sound.errorSound) return
    
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15)
      
      const volume = (sound.volume || 70) / 100
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
    const sound = settingsStore.settings.sound
    if (!sound?.enabled || !sound.completeSound) return
    
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime
      const volume = (sound.volume || 70) / 100
      
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(1000, now + i * 0.1)
        
        gainNode.gain.setValueAtTime(volume * 0.2, now + i * 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1)
        
        oscillator.start(now + i * 0.1)
        oscillator.stop(now + i * 0.1 + 0.1)
      }
    } catch (e) {
      console.error('播放音效失败:', e)
    }
  }

  return {
    playCorrect,
    playError,
    playComplete,
    getAudioContext
  }
}
