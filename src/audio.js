/** Soft kids music-box loop + light SFX (Web Audio, no mp3). */

let ctx
let muted = localStorage.getItem('anabia-muted') === '1'
let musicNodes = null
let started = false

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function isMuted() {
  return muted
}

export function setMuted(v) {
  muted = v
  localStorage.setItem('anabia-muted', v ? '1' : '0')
  if (musicNodes) {
    musicNodes.gain.gain.setTargetAtTime(v ? 0 : 0.045, ac().currentTime, 0.08)
  }
}

export async function unlock() {
  const c = ac()
  if (c.state === 'suspended') await c.resume()
  started = true
  if (!muted && !musicNodes) startMusic()
}

function playTone(c, dest, freq, start, dur, peak = 0.22) {
  const osc = c.createOscillator()
  const g = c.createGain()
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2400
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(peak, start + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(filter)
  filter.connect(g)
  g.connect(dest)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function startMusic() {
  const c = ac()
  const master = c.createGain()
  master.gain.value = muted ? 0 : 0.045
  master.connect(c.destination)

  // Gentle G-major pentatonic “music box” phrase (no buzz, no drone)
  const melody = [
    392.0, 440.0, 493.88, 587.33, 523.25, 493.88, 440.0, 392.0, // G A B D C B A G
    349.23, 392.0, 440.0, 493.88, 440.0, 392.0, 349.23, 329.63, // F G A B A G F E
  ]
  const step = 0.42
  let i = 0

  const tick = () => {
    if (!musicNodes) return
    const t = c.currentTime + 0.02
    const freq = melody[i % melody.length]
    playTone(c, master, freq, t, step * 1.35, 0.2)
    // soft harmony a fifth below on every other note
    if (i % 2 === 0) playTone(c, master, freq * 0.5, t + 0.02, step * 1.5, 0.08)
    i++
    musicNodes.timer = setTimeout(tick, step * 1000)
  }

  musicNodes = { gain: master, timer: null }
  tick()
}

export function sfx(kind) {
  if (muted || !started) return
  const c = ac()
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)

  if (kind === 'meow') {
    o.type = 'triangle'
    o.frequency.setValueAtTime(520, t)
    o.frequency.exponentialRampToValueAtTime(340, t + 0.2)
    g.gain.setValueAtTime(0.09, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24)
    o.start(t)
    o.stop(t + 0.26)
  } else if (kind === 'chime') {
    playTone(c, c.destination, 659.25, t, 0.35, 0.12)
    playTone(c, c.destination, 987.77, t + 0.06, 0.4, 0.08)
  } else if (kind === 'whoosh') {
    o.type = 'sine'
    o.frequency.setValueAtTime(240, t)
    o.frequency.exponentialRampToValueAtTime(480, t + 0.18)
    g.gain.setValueAtTime(0.06, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    o.start(t)
    o.stop(t + 0.24)
  } else {
    playTone(c, c.destination, 523.25, t, 0.12, 0.08)
  }
}
