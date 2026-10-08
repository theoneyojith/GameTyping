/**
 * Synthetic Mechanical Keyboard Audio Generator using Web Audio API
 */

class SoundController {
  private ctx: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.2

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typecraft_sound_enabled')
      if (saved !== null) {
        this.enabled = saved === 'true'
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('typecraft_sound_enabled', String(this.enabled))
    }
    return this.enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public playKeyClick(isError: boolean = false) {
    if (!this.enabled) return
    try {
      this.initContext()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      if (isError) {
        // Thud sound for error
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(120, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08)

        gain.gain.setValueAtTime(this.volume * 0.9, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      } else {
        // Crisp mechanical click
        osc.type = 'sine'
        const pitch = 700 + Math.random() * 200
        osc.frequency.setValueAtTime(pitch, now)
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04)

        gain.gain.setValueAtTime(this.volume, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
      }

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + (isError ? 0.08 : 0.04))
    } catch {
      // Audio autoplay policy or inactive context
    }
  }

  public playCompleteSound() {
    if (!this.enabled) return
    try {
      this.initContext()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const notes = [440, 554.37, 659.25, 880] // A major chord arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)

        gain.gain.setValueAtTime(this.volume * 0.7, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25)

        osc.connect(gain)
        gain.connect(this.ctx!.destination)

        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.25)
      })
    } catch {
      // Audio fallback
    }
  }
}

export const soundManager = new SoundController()
