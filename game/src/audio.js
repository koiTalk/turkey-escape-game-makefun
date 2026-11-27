// Gobble Dash — Web Audio sound effects, synthesised, no audio files.
// One clear job: every sound the game makes (gobble, jump, coin, hit,
// dash, fanfare) from oscillators and filtered noise. Created lazily on
// the first user gesture so browsers allow it; M mutes everything.

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
      return true;
    } catch (e) {
      return false;
    }
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, filterFreq) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
  }

  return {
    unlock() {
      ensure();
    },
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.5;
      return muted;
    },
    click() {
      tone(660, 0.07, 'square', 0.12);
    },
    jump() {
      noise(0.16, 0.12, 900);
      tone(300, 0.18, 'sine', 0.14, 620);
    },
    dash() {
      noise(0.22, 0.16, 2400);
    },
    coin() {
      tone(988, 0.09, 'sine', 0.18);
      setTimeout(() => tone(1319, 0.14, 'sine', 0.18), 70);
    },
    hit() {
      tone(140, 0.25, 'sawtooth', 0.25, 60);
      noise(0.2, 0.2, 300);
    },
    gobble() {
      // A turkey gobble: four fast low blips, descending.
      const notes = [320, 280, 240, 190];
      notes.forEach((f, i) => setTimeout(() => tone(f, 0.09, 'square', 0.16, f * 0.8), i * 90));
    },
    escape() {
      // Little victory fanfare: rising major arpeggio.
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.2), i * 130));
      setTimeout(() => this.gobble(), 560);
    },
    caught() {
      // Sad descending trombone-ish slide.
      tone(392, 0.5, 'sawtooth', 0.16, 110);
      setTimeout(() => tone(311, 0.5, 'sawtooth', 0.14, 98), 420);
    },
  };
}
