/**
 * WidiAI — Vanilla JavaScript App
 * Wave MIDI AI · Piano-to-MIDI converter
 * No React · No JSX · No frameworks — plain ES6+ DOM APIs
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════════════════

function svgIcon(path, size, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const ICON = {
  waves:       (s,c) => svgIcon(`<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>`, s, c),
  mic:         (s,c) => svgIcon(`<path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>`, s, c),
  micOff:      (s,c) => svgIcon(`<line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 9.64 6.61"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>`, s, c),
  upload:      (s,c) => svgIcon(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`, s, c),
  play:        (s,c) => svgIcon(`<polygon points="5 3 19 12 5 21 5 3"/>`, s, c),
  pause:       (s,c) => svgIcon(`<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`, s, c),
  stop:        (s,c) => svgIcon(`<rect x="3" y="3" width="18" height="18" rx="2"/>`, s, c),
  download:    (s,c) => svgIcon(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`, s, c),
  zap:         (s,c) => svgIcon(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`, s, c),
  cpu:         (s,c) => svgIcon(`<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`, s, c),
  activity:    (s,c) => svgIcon(`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`, s, c),
  chevronDown: (s,c) => svgIcon(`<polyline points="6 9 12 15 18 9"/>`, s, c),
  music2:      (s,c) => svgIcon(`<circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/>`, s, c),
  checkCircle: (s,c) => svgIcon(`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`, s, c),
  clock:       (s,c) => svgIcon(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, s, c),
  search:      (s,c) => svgIcon(`<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`, s, c),
  filter:      (s,c) => svgIcon(`<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`, s, c),
  trash:       (s,c) => svgIcon(`<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>`, s, c),
  refresh:     (s,c) => svgIcon(`<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`, s, c),
  fileAudio:   (s,c) => svgIcon(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6"/><path d="M9 17h6"/>`, s, c),
  calendar:    (s,c) => svgIcon(`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`, s, c),
  sliders:     (s,c) => svgIcon(`<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`, s, c),
  bell:        (s,c) => svgIcon(`<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`, s, c),
  info:        (s,c) => svgIcon(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`, s, c),
  rotateCcw:   (s,c) => svgIcon(`<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.7"/>`, s, c),
  shield:      (s,c) => svgIcon(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`, s, c),
  hardDrive:   (s,c) => svgIcon(`<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>`, s, c),
  gauge:       (s,c) => svgIcon(`<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>`, s, c),
  xCircle:     (s,c) => svgIcon(`<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`, s, c),
};

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_TOTAL_DURATION = 48;

function buildMidi() {
  const notes = [], beat = 0.5;
  const chords = [
    { bass: 50, inner: [62, 65, 69], melody: [74, 72, 69, 72, 74, 74, 72, 69] },
    { bass: 45, inner: [60, 64, 69], melody: [72, 72, 72, 74, 72, 69, 67, 69] },
    { bass: 46, inner: [58, 62, 65], melody: [69, 72, 74, 76, 74, 72, 69, 72] },
    { bass: 53, inner: [60, 65, 69], melody: [74, 72, 69, 67, 65, 67, 69, 72] },
  ];
  let s = 1;
  const r = () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 0xffffffff; };
  for (let rep = 0; rep < 3; rep++) {
    chords.forEach((chord, ci) => {
      const ps = (rep * chords.length + ci) * beat * 8;
      notes.push({ note: chord.bass, startTime: ps, duration: beat * 7.8, velocity: 72 });
      [0, 4].forEach(off => chord.inner.forEach((n, i) =>
        notes.push({ note: n, startTime: ps + off * beat + i * 0.045, duration: beat * 1.6, velocity: 58 + Math.floor(r() * 10) })));
      chord.melody.forEach((n, i) => n && notes.push({ note: n, startTime: ps + i * beat, duration: beat * 0.82, velocity: 78 + Math.floor(r() * 18) }));
    });
  }
  return notes;
}

const MIDI_NOTES = buildMidi();

const HISTORY = [
  { id: 1, fileName: 'beethoven_moonlight_sonata.wav', date: '2026-05-04 14:23', model: 'TransKun', duration: '2:47', notes: 342, size: '3.2 MB', status: 'completed' },
  { id: 2, fileName: 'chopin_nocturne_op9.mp4', date: '2026-05-04 11:08', model: 'Onsets & Frames', duration: '1:32', notes: 198, size: '18.6 MB', status: 'completed' },
  { id: 3, fileName: 'bach_invention_no1.wav', date: '2026-05-03 16:45', model: 'TransKun', duration: '0:58', notes: 124, size: '1.1 MB', status: 'completed' },
  { id: 4, fileName: 'piano_improvisation_may3.wav', date: '2026-05-03 09:12', model: 'Onsets & Frames', duration: '3:14', notes: 0, size: '4.7 MB', status: 'failed' },
  { id: 5, fileName: 'debussy_clair_de_lune.wav', date: '2026-05-02 20:31', model: 'TransKun', duration: '1:48', notes: 267, size: '2.6 MB', status: 'completed' },
  { id: 6, fileName: 'recording_20260502.wav', date: '2026-05-02 15:17', model: 'TransKun', duration: '0:34', notes: 67, size: '0.8 MB', status: 'completed' },
  { id: 7, fileName: 'schubert_impromptu_op90.mp4', date: '2026-05-01 22:04', model: 'Onsets & Frames', duration: '4:02', notes: 531, size: '41.2 MB', status: 'completed' },
  { id: 8, fileName: 'piano_practice_session.wav', date: '2026-05-01 18:55', model: 'TransKun', duration: '1:15', notes: 145, size: '1.8 MB', status: 'completed' },
  { id: 9, fileName: 'mozart_sonata_k331.wav', date: '2026-04-30 13:40', model: 'TransKun', duration: '3:22', notes: 488, size: '4.9 MB', status: 'completed' },
  { id: 10, fileName: 'late_night_recording.wav', date: '2026-04-30 01:12', model: 'Onsets & Frames', duration: '0:48', notes: 0, size: '1.1 MB', status: 'failed' },
];

// ═══════════════════════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════════════════════

const state = {
  page: 'dashboard',
  apiUrl: window.location.origin,
  // Dashboard
  stage: 'idle',   // idle | loaded | processing | ready
  isRecording: false,
  selectedModel: 'transkun',
  progress: 0,
  midiPlaying: false,
  midiTime: 0,
  fileName: null,
  audioUrl: null,
  audioFile: null,
  midiBlob: null,
  midiUrl: null,
  midiNotes: [],
  midiDuration: 0,
  midiTempo: null,
  noteEditMode: false,
  statusMessage: '',
  statusType: 'info',
  modelDropdownOpen: false,
  // History
  histSearch: '', histStatus: 'all', histModel: 'all', histSort: 'date',
  histDeleted: new Set(), histSortOpen: false,
  // Settings
  inputDevice: 'Default Microphone', sampleRate: '44100 Hz', bitDepth: '24-bit',
  noiseReduction: true, silenceTrim: true, defaultModel: 'TransKun',
  processingQuality: 'High', autoConvert: false, velocitySensitivity: 80,
  quantization: '1/16', includeSustain: true, defaultFormat: 'MIDI Type 1',
  tempoDetection: true, autoSave: true, notificationsOn: true,
  storageLimit: '5 GB', settingsSaved: false,
};

// Mutable references (not state, just handles)
let _midiRaf = 0;
let _recTimer = null, _progressTimer = null;
let _mediaRecorder = null, _audioChunks = [];
let _audioUrlRef = null;
let _pianoRoll = null, _audioPlayer = null, _waveform = null;
let _recordWaveCtx = null, _recordWaveAnalyser = null, _recordWaveSource = null, _recordWaveData = null, _recordWaveRaf = 0;
let _nativeAudioCtx = null, _nativeMasterGain = null;
let _nativeTimers = [], _nativeNodes = new Set();
let _nativeStartPerf = 0, _nativeStartOffset = 0;
let _audioUnlockBound = false;

const fmtTime = s => (!isFinite(s) || isNaN(s)) ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const getMidiDuration = () => state.midiDuration > 0 ? state.midiDuration : DEFAULT_TOTAL_DURATION;
const getNotesForRoll = () => state.midiNotes.length ? state.midiNotes : MIDI_NOTES;
const getBackendModel = () => state.selectedModel === 'transkun' ? 'transkun' : 'own';
const setStatusMessage = (message, type = 'info') => {
  state.statusMessage = message;
  state.statusType = type;
};
const clearStatusMessage = () => {
  state.statusMessage = '';
  state.statusType = 'info';
};

function resetMidiData() {
  cancelAnimationFrame(_midiRaf);
  state.midiPlaying = false;
  stopNativePlayback();

  if (state.midiUrl) {
    URL.revokeObjectURL(state.midiUrl);
    state.midiUrl = null;
  }
  state.midiBlob = null;
  state.midiNotes = [];
  state.midiDuration = 0;
  state.midiTempo = null;
  state.midiTime = 0;
  state.noteEditMode = false;
}

function getNativeAudioContext() {
  if (_nativeAudioCtx) return _nativeAudioCtx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error('Web Audio API is not available in this browser.');
  try {
    _nativeAudioCtx = new AudioCtx({ latencyHint: 'interactive' });
  } catch (_) {
    _nativeAudioCtx = new AudioCtx();
  }
  _nativeMasterGain = _nativeAudioCtx.createGain();
  _nativeMasterGain.gain.value = 0.8;
  _nativeMasterGain.connect(_nativeAudioCtx.destination);
  return _nativeAudioCtx;
}

function bindAudioUnlock() {
  if (_audioUnlockBound) return;
  _audioUnlockBound = true;

  const unlock = async () => {
    try {
      await ensureNativeAudioReady();
    } catch (_) {
      // Ignore unlock errors here; explicit playback actions will report them.
    }
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
  };

  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('keydown', unlock, { once: true, capture: true });
}

async function ensureNativeAudioReady() {
  let ctx = getNativeAudioContext();
  if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
    await ctx.resume();
  }

  // Safari can keep a context in a bad state after output device changes.
  // Recreate once if resume did not move it to running.
  if (ctx.state !== 'running') {
    try { await ctx.close(); } catch (_) {}
    _nativeAudioCtx = null;
    _nativeMasterGain = null;
    ctx = getNativeAudioContext();
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      await ctx.resume();
    }
  }

  return ctx;
}

async function playPreviewNote(noteNumber, durationSec = 0.5, velocityNorm = 0.9) {
  await ensureNativeAudioReady();
  triggerNativeNote(noteNumber, durationSec, velocityNorm);
}

function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function stopNativePlayback() {
  _nativeTimers.forEach(id => clearTimeout(id));
  _nativeTimers = [];
  _nativeNodes.forEach(node => {
    try { node.stop(); } catch (_) {}
    try { node.disconnect(); } catch (_) {}
  });
  _nativeNodes.clear();
}

function triggerNativeNote(noteNumber, durationSec, velocityNorm = 0.85) {
  if (!_nativeAudioCtx || !_nativeMasterGain) return;
  const ctx = _nativeAudioCtx;
  const now = ctx.currentTime;
  const freq = midiToFrequency(noteNumber);
  const velocity = Math.min(1, Math.max(0.08, velocityNorm));

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(9000, freq * 6), now);
  filter.Q.setValueAtTime(0.35, now);

  const peak = Math.min(0.48, 0.1 + velocity * 0.28);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, durationSec) + 0.14);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(_nativeMasterGain);

  osc.start(now);
  osc.stop(now + Math.max(0.03, durationSec) + 0.16);
  _nativeNodes.add(osc);
  osc.onended = () => {
    try { osc.disconnect(); } catch (_) {}
    try { filter.disconnect(); } catch (_) {}
    try { gain.disconnect(); } catch (_) {}
    _nativeNodes.delete(osc);
  };
}

function scheduleNativePlayback(fromSec) {
  stopNativePlayback();
  const notes = state.midiNotes || [];
  notes.forEach(note => {
    const start = Number(note.startTime) || 0;
    const duration = Math.max(0.03, Number(note.duration) || 0.12);
    const relativeStart = start - fromSec;
    if (relativeStart + duration <= 0) return;

    const effectiveStart = Math.max(0, relativeStart);
    const clipHead = Math.max(0, -relativeStart);
    const effectiveDuration = Math.max(0.03, duration - clipHead);
    const velocityNorm = Math.min(1, Math.max(0, (Number(note.velocity) || 96) / 127));

    const timerId = setTimeout(() => {
      triggerNativeNote(note.note, effectiveDuration, velocityNorm);
    }, Math.max(0, effectiveStart * 1000));
    _nativeTimers.push(timerId);
  });

  _nativeStartPerf = performance.now();
  _nativeStartOffset = fromSec;
}

function _stopRecordingWaveform() {
  if (_recordWaveRaf) {
    cancelAnimationFrame(_recordWaveRaf);
    _recordWaveRaf = 0;
  }
  if (_recordWaveSource) {
    try { _recordWaveSource.disconnect(); } catch (_) {}
    _recordWaveSource = null;
  }
  if (_recordWaveAnalyser) {
    try { _recordWaveAnalyser.disconnect(); } catch (_) {}
    _recordWaveAnalyser = null;
  }
  if (_recordWaveCtx) {
    try { _recordWaveCtx.close(); } catch (_) {}
    _recordWaveCtx = null;
  }
  _recordWaveData = null;
}

function _renderRecordingWaveformFrame() {
  if (!state.isRecording || !_waveform || !_recordWaveAnalyser || !_recordWaveData) return;

  _recordWaveAnalyser.getByteTimeDomainData(_recordWaveData);
  const bars = 110;
  const chunkSize = Math.max(1, Math.floor(_recordWaveData.length / bars));
  const levels = new Array(bars);

  for (let i = 0; i < bars; i += 1) {
    let peak = 0;
    const start = i * chunkSize;
    const end = Math.min(_recordWaveData.length, start + chunkSize);
    for (let j = start; j < end; j += 1) {
      const normalized = (_recordWaveData[j] - 128) / 128;
      const amp = Math.abs(normalized);
      if (amp > peak) peak = amp;
    }
    levels[i] = Math.min(1, Math.max(0.02, peak * 1.9));
  }

  _waveform.update(levels, 0, 1, true);
  _recordWaveRaf = requestAnimationFrame(_renderRecordingWaveformFrame);
}

function _startRecordingWaveform(stream) {
  _stopRecordingWaveform();

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || !stream) return;

  try {
    _recordWaveCtx = new AudioCtx();
    _recordWaveAnalyser = _recordWaveCtx.createAnalyser();
    _recordWaveAnalyser.fftSize = 2048;
    _recordWaveSource = _recordWaveCtx.createMediaStreamSource(stream);
    _recordWaveSource.connect(_recordWaveAnalyser);
    _recordWaveData = new Uint8Array(_recordWaveAnalyser.fftSize);
    _renderRecordingWaveformFrame();
  } catch (error) {
    console.error('Waveform setup error:', error);
    _stopRecordingWaveform();
  }
}

// ═══════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════

function injectCSS(container) {
  const style = document.createElement('style');
  style.textContent = `
/* Base reset & layout */
.widi-app,.widi-app *,.widi-app *::before,.widi-app *::after{box-sizing:border-box;}
.widi-app *{margin:0;padding:0;}
.widi-app{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;background:#07070f;color:#e5e7eb;overflow:hidden;display:flex;flex-direction:column;position:relative;}
.widi-app button{cursor:pointer;font-family:inherit;}
.widi-app input,.widi-app select,.widi-app textarea{font-family:inherit;}

/* Header - Premium Navigation Bar */
.w-header{display:flex;align-items:center;justify-content:space-between;padding:12px 28px;flex-shrink:0;position:relative;z-index:100;border-bottom:1px solid rgba(255,255,255,0.08);background:linear-gradient(180deg,rgba(10,10,18,0.95),rgba(7,7,15,0.92));backdrop-filter:blur(24px) saturate(180%);box-shadow:0 4px 16px rgba(0,0,0,0.3),0 1px 0 rgba(255,255,255,0.04) inset;}
.w-logo{display:flex;align-items:center;gap:14px;}
.w-logo-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);box-shadow:0 4px 12px rgba(139,92,246,0.4),0 0 24px rgba(139,92,246,0.2),0 1px 0 rgba(255,255,255,0.2) inset;flex-shrink:0;position:relative;}
.w-logo-icon::before{content:'';position:absolute;inset:0;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,0.15),transparent);pointer-events:none;}
.w-logo-name{font-size:20px;font-weight:700;letter-spacing:-0.03em;background:linear-gradient(135deg,#60a5fa 0%,#c4b5fd 50%,#a78bfa 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(139,92,246,0.3);}
.w-logo-sub{font-size:10px;color:#6b7280;margin-top:2px;letter-spacing:0.06em;text-transform:uppercase;}
.w-beta{font-size:9px;font-weight:600;letter-spacing:0.1em;background:rgba(139,92,246,0.18);color:#c4b5fd;border:1px solid rgba(139,92,246,0.35);border-radius:6px;padding:3px 8px;box-shadow:0 0 8px rgba(139,92,246,0.2);}

/* Navigation Buttons */
.w-nav{display:flex;align-items:center;gap:6px;}
.w-nav-btn{font-size:12px;font-weight:500;padding:7px 16px;border-radius:10px;background:transparent;border:1px solid transparent;color:#6b7280;cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;}
.w-nav-btn::before{content:'';position:absolute;inset:0;border-radius:10px;background:rgba(255,255,255,0.04);opacity:0;transition:opacity 0.25s;}
.w-nav-btn:hover{color:#9ca3af;}
.w-nav-btn:hover::before{opacity:1;}
.w-nav-btn.active{font-weight:600;color:#c4b5fd;background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.3);box-shadow:0 0 12px rgba(139,92,246,0.15),0 1px 0 rgba(255,255,255,0.05) inset;}

/* Ambient Orbs */
.w-orb{position:fixed;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);filter:blur(80px);opacity:0.12;width:480px;height:480px;animation:float 20s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translate(-50%,-50%) scale(1);}50%{transform:translate(-50%,-50%) scale(1.15);}}

/* Layout */
.w-content{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;z-index:1;min-width:0;}

/* Premium Glass Panels */
.w-panel{border-radius:20px;padding:20px;background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(16px) saturate(160%);box-shadow:0 8px 32px rgba(0,0,0,0.35),0 1px 0 rgba(255,255,255,0.06) inset,0 -1px 0 rgba(0,0,0,0.2) inset;position:relative;min-width:0;}
.w-panel::before{content:'';position:absolute;inset:0;border-radius:20px;background:radial-gradient(600px circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(139,92,246,0.08),transparent 40%);opacity:0;transition:opacity 0.3s;pointer-events:none;}
.w-panel:hover::before{opacity:1;}
.w-panel-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:11px;color:#a1a1aa;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}

/* Dashboard Layout */
.w-dashboard{display:flex;flex-direction:column;flex:1;padding:20px 24px 0;gap:14px;overflow:hidden;min-width:0;}
.w-top-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:14px;min-width:0;}
.w-top-grid > .w-panel{min-width:0;}

/* Record Button - Professional */
.w-rec-btn{width:64px;height:64px;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.35);box-shadow:0 4px 16px rgba(239,68,68,0.12),0 1px 0 rgba(255,255,255,0.05) inset;}
.w-rec-btn:hover:not(.recording){background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.45);box-shadow:0 6px 20px rgba(239,68,68,0.2);}
.w-rec-btn.recording{background:radial-gradient(circle at 30% 30%,#f87171,#ef4444,#b91c1c);border-color:#f87171;box-shadow:0 0 30px rgba(239,68,68,0.7),0 0 60px rgba(239,68,68,0.25),0 2px 0 rgba(255,255,255,0.15) inset;}
@keyframes pulse-ring{0%{transform:scale(1);opacity:0.7;}100%{transform:scale(1.6);opacity:0;}}
.w-rec-pulse{position:absolute;inset:-2px;border-radius:50%;border:3px solid rgba(239,68,68,0.5);animation:pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite;}

/* Upload Button */
.w-upload-btn{display:flex;align-items:center;gap:10px;width:100%;border-radius:10px;padding:10px 14px;font-size:11px;font-weight:500;color:#93c5fd;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);transition:all 0.25s;box-shadow:0 2px 8px rgba(59,130,246,0.05);}
.w-upload-btn:hover{background:rgba(59,130,246,0.18);border-color:rgba(59,130,246,0.4);box-shadow:0 4px 12px rgba(59,130,246,0.15);transform:translateY(-1px);}
.w-upload-btn:active{transform:translateY(0);}

/* File Badge */
.w-file-badge{display:flex;align-items:center;gap:10px;border-radius:10px;padding:8px 14px;margin-bottom:14px;background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06));border:1px solid rgba(16,185,129,0.25);box-shadow:0 2px 8px rgba(16,185,129,0.08);}

/* Waveform Container */
.w-waveform{width:100%;height:72px;min-width:0;border-radius:10px;overflow:hidden;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06);box-shadow:0 2px 8px rgba(0,0,0,0.2) inset;}
.w-waveform canvas{display:block;width:100%!important;height:100%!important;max-width:100%;}

/* Audio Player - Premium Design */
.w-audio-player{border-radius:14px;padding:14px;margin-top:10px;background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.04));border:1px solid rgba(59,130,246,0.2);box-shadow:0 4px 12px rgba(59,130,246,0.08),0 1px 0 rgba(255,255,255,0.04) inset;}
.w-audio-filename{font-size:10px;font-weight:500;color:#93c5fd;letter-spacing:0.06em;margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.w-audio-track{position:relative;height:5px;margin-bottom:5px;cursor:pointer;}
.w-audio-track-bg{position:absolute;inset:0;border-radius:3px;background:rgba(255,255,255,0.1);}
.w-audio-track-fill{position:absolute;left:0;top:0;height:100%;border-radius:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);box-shadow:0 0 10px rgba(139,92,246,0.6);transition:width 0.05s linear;}
.w-audio-track input[type=range]{position:absolute;inset:0;width:100%;opacity:0;height:100%;cursor:pointer;margin:0;}
.w-audio-times{display:flex;justify-content:space-between;font-size:9px;color:#6b7280;margin-top:3px;font-variant-numeric:tabular-nums;}
.w-audio-controls{display:flex;align-items:center;justify-content:space-between;}
.w-audio-btns{display:flex;align-items:center;gap:10px;}
.w-ap-play{width:38px;height:38px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b82f6,#8b5cf6);box-shadow:0 4px 12px rgba(139,92,246,0.4),0 1px 0 rgba(255,255,255,0.15) inset;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);cursor:pointer;}
.w-ap-play:hover:not(:disabled){box-shadow:0 6px 16px rgba(139,92,246,0.5);transform:translateY(-1px);}
.w-ap-play:active:not(:disabled){transform:translateY(0);}
.w-ap-play:disabled{background:rgba(255,255,255,0.04);box-shadow:none;opacity:0.35;cursor:not-allowed;}
.w-ap-play.active{box-shadow:0 0 20px rgba(139,92,246,0.7),0 4px 12px rgba(139,92,246,0.4);}
.w-ap-stop{width:30px;height:30px;border-radius:9px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.25s;}
.w-ap-stop:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.18);}
.w-ap-dl{display:flex;align-items:center;gap:7px;border-radius:9px;padding:7px 11px;font-size:10px;font-weight:500;color:#93c5fd;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.28);cursor:pointer;transition:all 0.25s;}
.w-ap-dl:hover{background:rgba(59,130,246,0.22);border-color:rgba(59,130,246,0.45);box-shadow:0 2px 8px rgba(59,130,246,0.2);}

/* Animated Bars */
@keyframes bar-bounce{0%,100%{height:5px;}50%{height:12px;}}
.w-vis-bar{width:3px;background:linear-gradient(180deg,#60a5fa,#3b82f6);border-radius:2px;height:5px;box-shadow:0 0 6px rgba(59,130,246,0.4);}
.w-vis-bar:nth-child(1){animation:bar-bounce 0.6s 0s infinite ease-in-out;}
.w-vis-bar:nth-child(2){animation:bar-bounce 0.6s 0.15s infinite ease-in-out;}
.w-vis-bar:nth-child(3){animation:bar-bounce 0.6s 0.3s infinite ease-in-out;}

/* Model Selector */
.w-model-btn{width:100%;display:flex;align-items:center;justify-content:space-between;border-radius:14px;padding:14px 18px;cursor:pointer;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);transition:all 0.25s;box-shadow:0 2px 8px rgba(139,92,246,0.08);}
.w-model-btn:hover{background:rgba(139,92,246,0.18);border-color:rgba(139,92,246,0.4);box-shadow:0 4px 12px rgba(139,92,246,0.15);}
.w-model-dropdown{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:50;background:rgba(12,12,22,0.98);border:1px solid rgba(139,92,246,0.35);border-radius:14px;backdrop-filter:blur(24px) saturate(180%);overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 1px 0 rgba(255,255,255,0.05) inset;}
@keyframes fadeInDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
.w-model-opt{width:100%;display:flex;align-items:center;gap:14px;padding:14px 18px;cursor:pointer;transition:background 0.2s;background:transparent;border:none;text-align:left;}
.w-model-opt:hover{background:rgba(255,255,255,0.05);}
.w-model-opt.active{background:rgba(139,92,246,0.18);}

/* Progress Bar */
.w-progress-bar{width:100%;border-radius:3px;height:7px;overflow:hidden;background:rgba(255,255,255,0.08);margin:8px 0;box-shadow:0 1px 3px rgba(0,0,0,0.2) inset;}
.w-progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);box-shadow:0 0 12px rgba(139,92,246,0.7);transition:width 0.1s;position:relative;overflow:hidden;}
.w-progress-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:shimmer 2s infinite;}
@keyframes shimmer{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}
.w-step{display:flex;align-items:center;gap:5px;border-radius:6px;padding:3px 8px;}

/* MIDI Player Controls */
.w-ctrl-btn{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.25s;color:#9ca3af;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
.w-ctrl-btn:hover:not(:disabled){background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.18);box-shadow:0 3px 10px rgba(0,0,0,0.15);}
.w-ctrl-btn:disabled{opacity:0.25;cursor:not-allowed;}
.w-ctrl-btn.accent{background:rgba(59,130,246,0.14);border-color:rgba(59,130,246,0.35);color:#93c5fd;}
.w-ctrl-btn.accent:hover:not(:disabled){background:rgba(59,130,246,0.24);border-color:rgba(59,130,246,0.5);}
.w-midi-play{width:56px;height:56px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);cursor:pointer;background:linear-gradient(135deg,#3b82f6,#8b5cf6);box-shadow:0 6px 20px rgba(139,92,246,0.4),0 2px 0 rgba(255,255,255,0.15) inset;}
.w-midi-play:hover:not(:disabled){box-shadow:0 8px 24px rgba(139,92,246,0.5);transform:translateY(-2px);}
.w-midi-play:active:not(:disabled){transform:translateY(0);}
.w-midi-play:disabled{background:rgba(255,255,255,0.04)!important;opacity:0.3!important;cursor:not-allowed!important;box-shadow:none!important;}

/* Seek Slider */
.w-seek{width:100%;height:5px;border-radius:3px;outline:none;appearance:none;cursor:pointer;background:rgba(255,255,255,0.1);}
.w-seek:disabled{cursor:default;}
.w-seek::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#8b5cf6);box-shadow:0 0 12px rgba(139,92,246,0.8),0 2px 6px rgba(0,0,0,0.3);cursor:pointer;transition:all 0.2s;}
.w-seek::-webkit-slider-thumb:hover{transform:scale(1.15);}
.w-seek:disabled::-webkit-slider-thumb{background:#374151;box-shadow:none;}
.w-seek::-moz-range-thumb{width:16px;height:16px;border:none;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#8b5cf6);box-shadow:0 0 12px rgba(139,92,246,0.8);cursor:pointer;}
.w-stat-box{border-radius:10px;padding:10px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);box-shadow:0 2px 6px rgba(0,0,0,0.1) inset;}

/* Convert Button */
.w-convert-btn{width:100%;border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:13px;font-weight:600;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);}

/* Piano Roll - Premium Container */
.w-piano-wrap{border-radius:20px 20px 0 0;overflow:hidden;flex-shrink:0;height:330px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.08);border-bottom:none;box-shadow:0 -4px 24px rgba(0,0,0,0.3),0 1px 0 rgba(255,255,255,0.04) inset;}
.w-piano-wrap.edit-mode{height:460px;}
.w-piano-header{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,0.06);background:linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.3));backdrop-filter:blur(12px);}
.w-piano-body{height:calc(100% - 41px);}
.w-live-badge{display:flex;align-items:center;gap:7px;border-radius:24px;padding:5px 12px;background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.3);box-shadow:0 0 12px rgba(16,185,129,0.15);}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.25;}}
.w-live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.8);animation:blink 1.2s infinite;}
.w-piano-meta{display:flex;align-items:center;gap:10px;}
.w-note-edit-btn{border-radius:8px;padding:6px 10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:#9ca3af;font-size:10px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.2s;}
.w-note-edit-btn:hover:not(:disabled){background:rgba(139,92,246,0.14);border-color:rgba(139,92,246,0.34);color:#c4b5fd;}
.w-note-edit-btn.active{background:rgba(139,92,246,0.2);border-color:rgba(139,92,246,0.44);color:#ddd6fe;box-shadow:0 0 12px rgba(139,92,246,0.22);}
.w-note-edit-btn:disabled{opacity:0.45;cursor:not-allowed;}

/* History Page */
.w-history{display:flex;flex-direction:column;flex:1;overflow:hidden;padding:20px 24px;gap:14px;}
.w-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;flex-shrink:0;}
.w-stat-card{border-radius:20px;padding:18px;display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(16px);box-shadow:0 4px 16px rgba(0,0,0,0.2),0 1px 0 rgba(255,255,255,0.05) inset;}
.w-toolbar{display:flex;align-items:center;gap:14px;border-radius:14px;padding:10px 14px;flex-shrink:0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);box-shadow:0 2px 8px rgba(0,0,0,0.15);}
.w-search{display:flex;align-items:center;gap:10px;flex:1;border-radius:10px;padding:8px 14px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);transition:all 0.25s;}
.w-search:focus-within{border-color:rgba(139,92,246,0.4);box-shadow:0 0 12px rgba(139,92,246,0.15);}
.w-search input{background:transparent;border:none;outline:none;font-size:12px;color:#e5e7eb;width:100%;}
.w-search input::placeholder{color:#6b7280;}
.w-filter-group{display:flex;align-items:center;gap:5px;border-radius:10px;padding:5px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);}
.w-filter-btn{font-size:11px;font-weight:500;padding:5px 12px;border-radius:7px;cursor:pointer;transition:all 0.2s;border:1px solid transparent;background:transparent;color:#6b7280;white-space:nowrap;}
.w-filter-btn:hover:not(.active-p):not(.active-b){background:rgba(255,255,255,0.04);}
.w-filter-btn.active-p{background:rgba(139,92,246,0.22);color:#c4b5fd;border-color:rgba(139,92,246,0.35);box-shadow:0 0 8px rgba(139,92,246,0.15);}
.w-filter-btn.active-b{background:rgba(59,130,246,0.18);color:#93c5fd;border-color:rgba(59,130,246,0.35);box-shadow:0 0 8px rgba(59,130,246,0.12);}
.w-sort-wrap{position:relative;}
.w-sort-btn{display:flex;align-items:center;gap:9px;border-radius:10px;padding:8px 14px;cursor:pointer;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);font-size:11px;color:#9ca3af;transition:all 0.25s;}
.w-sort-btn:hover{background:rgba(0,0,0,0.45);border-color:rgba(255,255,255,0.15);}
.w-sort-dropdown{position:absolute;top:calc(100% + 8px);right:0;z-index:50;min-width:140px;background:rgba(12,12,22,0.98);border:1px solid rgba(255,255,255,0.12);border-radius:12px;overflow:hidden;backdrop-filter:blur(24px);animation:fadeInDown 0.2s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
.w-sort-opt{width:100%;padding:11px 18px;font-size:12px;text-align:left;cursor:pointer;border:none;background:transparent;color:#9ca3af;transition:all 0.15s;border-bottom:1px solid rgba(255,255,255,0.06);}
.w-sort-opt:last-child{border-bottom:none;}
.w-sort-opt.active{background:rgba(139,92,246,0.15);color:#c4b5fd;}
.w-sort-opt:hover:not(.active){background:rgba(255,255,255,0.05);}

/* Table - Premium Design */
.w-table{flex:1;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;background:linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 16px rgba(0,0,0,0.25),0 1px 0 rgba(255,255,255,0.04) inset;}
.w-table-head{display:grid;padding:12px 18px;flex-shrink:0;background:rgba(0,0,0,0.25);border-bottom:1px solid rgba(255,255,255,0.08);grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr auto;}
.w-table-head span{font-size:10px;color:#6b7280;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}
.w-table-body{flex:1;overflow-y:auto;}
.w-table-row{display:grid;padding:12px 18px;align-items:center;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr auto;border-bottom:1px solid rgba(255,255,255,0.04);transition:all 0.2s;}
.w-table-row:hover{background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06);}
.w-row-actions{opacity:0;transition:opacity 0.2s;display:flex;align-items:center;gap:7px;}
.w-table-row:hover .w-row-actions{opacity:1;}
.w-table-foot{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;flex-shrink:0;border-top:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.25);}
.w-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;}

/* Icon Buttons */
.w-icon-btn{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;border:1px solid;}
.w-icon-btn-dl{background:rgba(59,130,246,0.12);border-color:rgba(59,130,246,0.25);color:#60a5fa;}
.w-icon-btn-dl:hover{background:rgba(59,130,246,0.22);box-shadow:0 2px 8px rgba(59,130,246,0.2);}
.w-icon-btn-retry{background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.25);color:#fbbf24;}
.w-icon-btn-retry:hover{background:rgba(245,158,11,0.22);box-shadow:0 2px 8px rgba(245,158,11,0.2);}
.w-icon-btn-del{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);color:#f87171;}
.w-icon-btn-del:hover{background:rgba(239,68,68,0.2);box-shadow:0 2px 8px rgba(239,68,68,0.15);}

/* Status Pills */
.w-status-pill{display:flex;align-items:center;gap:5px;border-radius:24px;padding:3px 10px;font-size:9px;font-weight:600;border:1px solid;}
.w-status-ok{background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.25);color:#10b981;}
.w-status-fail{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.25);color:#ef4444;}

/* Settings Page */
.w-settings{flex:1;overflow-y:auto;padding:20px 24px 32px;}
.w-settings-inner{max-width:800px;margin:0 auto;}
.w-section-card{border-radius:20px;padding:24px;margin-bottom:18px;background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(16px);box-shadow:0 4px 16px rgba(0,0,0,0.2),0 1px 0 rgba(255,255,255,0.05) inset;}
.w-section-title{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
.w-section-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.18);border:1px solid rgba(139,92,246,0.3);color:#c4b5fd;flex-shrink:0;box-shadow:0 2px 8px rgba(139,92,246,0.15);}
.w-setting-row{display:flex;align-items:center;justify-content:space-between;gap:18px;}
.w-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);margin:18px 0;}

/* Toggle Switch */
.w-toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:all 0.3s;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.15) inset;}
.w-toggle-thumb{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:left 0.3s cubic-bezier(0.4,0,0.2,1);}

/* Select Dropdown */
.w-select{background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#d1d5db;font-size:12px;padding:7px 32px 7px 12px;cursor:pointer;outline:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;transition:all 0.25s;}
.w-select:hover{background:rgba(0,0,0,0.55);border-color:rgba(255,255,255,0.18);}
.w-select option{background:#0f0f1a;padding:8px;}

/* Slider */
.w-slider{appearance:none;width:130px;height:5px;border-radius:3px;outline:none;cursor:pointer;background:rgba(255,255,255,0.1);}
.w-slider::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#8b5cf6);box-shadow:0 0 10px rgba(139,92,246,0.8),0 2px 6px rgba(0,0,0,0.3);cursor:pointer;transition:all 0.2s;}
.w-slider::-webkit-slider-thumb:hover{transform:scale(1.12);}
.w-slider::-moz-range-thumb{width:16px;height:16px;border:none;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#8b5cf6);box-shadow:0 0 10px rgba(139,92,246,0.8);cursor:pointer;}

/* Model Pills */
.w-model-pill{display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:14px;cursor:pointer;transition:all 0.25s;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);font-size:12px;color:#9ca3af;}
.w-model-pill:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.12);box-shadow:0 2px 8px rgba(0,0,0,0.15);}

/* Quality Tabs */
.w-quality-tab{font-size:11px;font-weight:500;padding:6px 14px;border-radius:8px;cursor:pointer;transition:all 0.2s;border:1px solid transparent;background:transparent;color:#6b7280;}
.w-quality-tab:hover:not(.active){background:rgba(255,255,255,0.04);}
.w-quality-tab.active{background:rgba(139,92,246,0.22);color:#c4b5fd;border-color:rgba(139,92,246,0.35);box-shadow:0 0 10px rgba(139,92,246,0.15);}

/* Scrollbar */
.widi-app ::-webkit-scrollbar{width:6px;}
.widi-app ::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);}
.widi-app ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px;transition:background 0.25s;}
.widi-app ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.22);}

/* Animations */
@keyframes fadeIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
.w-fade-in{animation:fadeIn 0.25s ease;}

@media (max-width: 1480px){
  .w-top-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
}
@media (max-width: 1040px){
  .w-top-grid{grid-template-columns:minmax(0,1fr);}
}
  `;
  container.appendChild(style);
}

// ═══════════════════════════════════════════════════════════════════
// PIANO ROLL CLASS (Canvas + Web Audio)
// ═══════════════════════════════════════════════════════════════════

const MIDI_LO = 21, MIDI_HI = 108;
const BLACK_S = new Set([1, 3, 6, 8, 10]);
const KEY_H = 130, BK_RATIO = 0.62;

class PianoRoll {
  constructor(container, notes, options = {}) {
    this.container = container;
    this.notes = notes;
    this.editMode = Boolean(options.editMode);
    this.onNotesChange = typeof options.onNotesChange === 'function' ? options.onNotesChange : null;
    this.onEditCommit = typeof options.onEditCommit === 'function' ? options.onEditCommit : null;
    this.currentTime = 0;
    this.isPlaying = false;
    this.pressedKeys = new Set();
    this.noteHitboxes = [];
    this.hoverNoteIndex = -1;
    this.hoverNoteMode = null;
    this.draggingNote = null;
    this.animId = 0;
    this.lastTs = null;
    this.internalTime = 0;
    this.W = 0; this.H = 0;
    this.keys = [];

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;';
    container.appendChild(this.canvas);

    this._ro = new ResizeObserver(() => this._setup());
    this._ro.observe(container);
    this._setup();
    this._bindEvents();
  }

  _playNote(midi) {
    playPreviewNote(midi).catch(error => {
      console.error('Preview note error:', error);
    });
  }

  _setCursor(y, noteMode = null) {
    if (this.draggingNote) {
      this.canvas.style.cursor = this.draggingNote.mode === 'duration' ? 'ns-resize' : 'ew-resize';
      return;
    }
    if (this.editMode && !this.isPlaying && y < this.H - KEY_H && noteMode) {
      this.canvas.style.cursor = noteMode === 'duration' ? 'ns-resize' : 'ew-resize';
      return;
    }
    this.canvas.style.cursor = y >= this.H - KEY_H ? 'pointer' : 'default';
  }

  _getRollPixelsPerSecond() {
    const rollHeight = Math.max(60, this.H - KEY_H);
    return rollHeight / 3.5;
  }

  _resolveNoteDragMode(box, y) {
    if (!box) return null;
    const topHandle = Math.min(10, Math.max(4, box.h * 0.35));
    if (y <= box.y + topHandle) return 'duration';
    return 'pitch';
  }

  _hitNote(x, y) {
    for (let i = this.noteHitboxes.length - 1; i >= 0; i -= 1) {
      const box = this.noteHitboxes[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        return { ...box, mode: this._resolveNoteDragMode(box, y) };
      }
    }
    return null;
  }

  _startNoteDrag(hit, clientY) {
    if (!hit || !hit.noteRef) return false;
    this.draggingNote = {
      index: hit.index,
      noteRef: hit.noteRef,
      mode: hit.mode || 'pitch',
      startDuration: Math.max(0.03, Number(hit.noteRef.duration) || 0.12),
      startClientY: clientY,
      changed: false,
    };
    this.hoverNoteIndex = hit.index;
    this.hoverNoteMode = this.draggingNote.mode;
    this.canvas.style.cursor = this.draggingNote.mode === 'duration' ? 'ns-resize' : 'ew-resize';
    return true;
  }

  _keyAtX(x) {
    const clamped = Math.max(0, Math.min(this.W - 1, x));
    for (const key of this.keys) {
      if (key.isBlack && clamped >= key.x && clamped <= key.x + key.w) {
        return key;
      }
    }
    for (const key of this.keys) {
      if (!key.isBlack && clamped >= key.x && clamped <= key.x + key.w) {
        return key;
      }
    }
    let closest = null;
    let closestDist = Number.POSITIVE_INFINITY;
    for (const key of this.keys) {
      const cx = key.x + key.w / 2;
      const d = Math.abs(cx - clamped);
      if (d < closestDist) {
        closestDist = d;
        closest = key;
      }
    }
    return closest;
  }

  _updateNoteDrag(clientX, clientY) {
    if (!this.draggingNote || !this.draggingNote.noteRef) return;

    if (this.draggingNote.mode === 'duration') {
      const pps = this._getRollPixelsPerSecond();
      const deltaSec = (this.draggingNote.startClientY - clientY) / pps;
      const nextDuration = Math.max(0.03, this.draggingNote.startDuration + deltaSec);

      if (Math.abs(nextDuration - this.draggingNote.noteRef.duration) > 0.0001) {
        this.draggingNote.noteRef.duration = nextDuration;
        this.draggingNote.changed = true;
        if (this.onNotesChange) this.onNotesChange(this.notes);
      }
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const localX = clientX - rect.left;
    const key = this._keyAtX(localX);
    if (!key) return;
    const nextMidi = key.midi;

    if (nextMidi !== this.draggingNote.noteRef.note) {
      this.draggingNote.noteRef.note = nextMidi;
      this.draggingNote.changed = true;
      if (this.onNotesChange) this.onNotesChange(this.notes);
    }
  }

  _finishNoteDrag(shouldCommit = true) {
    if (!this.draggingNote) return;
    const changed = Boolean(this.draggingNote.changed);
    this.draggingNote = null;
    this.hoverNoteMode = null;
    if (shouldCommit && changed && this.onEditCommit) this.onEditCommit(this.notes);
  }

  _buildKeys(W) {
    const keys = [], wkw = W / 52, bkw = wkw * 0.62;
    let wki = 0;
    for (let m = MIDI_LO; m <= MIDI_HI; m++) {
      if (!BLACK_S.has(m % 12)) { keys.push({ midi: m, x: wki * wkw, w: wkw, isBlack: false }); wki++; }
      else keys.push({ midi: m, x: (wki - 1) * wkw + wkw - bkw / 2, w: bkw, isBlack: true });
    }
    return keys;
  }

  _hitTest(x, y) {
    const ROLL_H = this.H - KEY_H, bkh = KEY_H * BK_RATIO;
    if (y < ROLL_H) return null;
    if (y - ROLL_H <= bkh) for (const k of this.keys) if (k.isBlack && x >= k.x && x <= k.x + k.w) return k;
    for (const k of this.keys) if (!k.isBlack && x >= k.x && x <= k.x + k.w) return k;
    return null;
  }

  _bindEvents() {
    const c = this.canvas;
    const xy = e => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const press = m => { if (!this.pressedKeys.has(m)) { this.pressedKeys.add(m); this._playNote(m); } };
    const release = m => { this.pressedKeys.delete(m); };
    const releaseAll = () => { this.pressedKeys.clear(); };

    this._h = {
      md: e => {
        const { x, y } = xy(e);
        if (this.editMode && !this.isPlaying && y < this.H - KEY_H) {
          const hit = this._hitNote(x, y);
          if (hit) {
            this._startNoteDrag(hit, e.clientY);
            return;
          }
        }
        const k = this._hitTest(x, y);
        if (k) press(k.midi);
      },
      mm: e => {
        const { x, y } = xy(e);
        if (this.draggingNote) {
          this._updateNoteDrag(e.clientX, e.clientY);
          this._setCursor(y, this.draggingNote.mode);
          return;
        }

        const noteHit = this.editMode && !this.isPlaying && y < this.H - KEY_H
          ? this._hitNote(x, y)
          : null;
        this.hoverNoteIndex = noteHit ? noteHit.index : -1;
        this.hoverNoteMode = noteHit ? noteHit.mode : null;
        this._setCursor(y, noteHit ? noteHit.mode : null);

        if (e.buttons !== 1) return;
        const k = this._hitTest(x, y);
        if (k && !this.pressedKeys.has(k.midi)) { releaseAll(); press(k.midi); }
      },
      mu: () => { this._finishNoteDrag(); releaseAll(); },
      ml: () => {
        if (this.draggingNote) return;
        releaseAll();
        this.hoverNoteIndex = -1;
        this.hoverNoteMode = null;
        this.canvas.style.cursor = 'default';
      },
      wm: e => {
        if (!this.draggingNote) return;
        this._updateNoteDrag(e.clientX, e.clientY);
      },
      wu: () => { this._finishNoteDrag(); releaseAll(); },
      wb: () => { this._finishNoteDrag(); releaseAll(); this.canvas.style.cursor = 'default'; },
      ts: e => { e.preventDefault(); releaseAll(); Array.from(e.touches).forEach(t => { const r = c.getBoundingClientRect(); const k = this._hitTest(t.clientX - r.left, t.clientY - r.top); if (k) press(k.midi); }); },
      tm: e => { e.preventDefault(); releaseAll(); Array.from(e.touches).forEach(t => { const r = c.getBoundingClientRect(); const k = this._hitTest(t.clientX - r.left, t.clientY - r.top); if (k) press(k.midi); }); },
      te: e => { e.preventDefault(); const still = new Set(); Array.from(e.touches).forEach(t => { const r = c.getBoundingClientRect(); const k = this._hitTest(t.clientX - r.left, t.clientY - r.top); if (k) still.add(k.midi); }); this.pressedKeys.forEach(m => { if (!still.has(m)) release(m); }); },
    };
    c.addEventListener('mousedown', this._h.md);
    c.addEventListener('mousemove', this._h.mm);
    c.addEventListener('mouseup', this._h.mu);
    c.addEventListener('mouseleave', this._h.ml);
    c.addEventListener('touchstart', this._h.ts, { passive: false });
    c.addEventListener('touchmove', this._h.tm, { passive: false });
    c.addEventListener('touchend', this._h.te, { passive: false });
    window.addEventListener('mousemove', this._h.wm);
    window.addEventListener('mouseup', this._h.wu);
    window.addEventListener('blur', this._h.wb);
  }

  _setup() {
    cancelAnimationFrame(this.animId);
    this.lastTs = null;
    const dpr = window.devicePixelRatio || 1;
    const W = this.container.clientWidth || 800;
    const H = this.container.clientHeight || 330;
    this.W = W; this.H = H;
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.canvas.style.width = W + 'px'; this.canvas.style.height = H + 'px';
    const ctx = this.canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    this.keys = this._buildKeys(W);
    const loop = ts => {
      if (this.lastTs !== null) {
        const d = (ts - this.lastTs) / 1000;
        if (this.isPlaying || (this.notes && this.notes.length)) {
          this.internalTime = this.currentTime;
        } else {
          this.internalTime = (this.internalTime + d * 0.22) % 48;
        }
      }
      this.lastTs = ts;
      this._draw(ctx, W, H, this.internalTime);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  _noteColor(midi) {
    const t = (midi - MIDI_LO) / (MIDI_HI - MIDI_LO);
    const lr = ([r1,g1,b1],[r2,g2,b2],t) => [r1+(r2-r1)*t,g1+(g2-g1)*t,b1+(b2-b1)*t].map(Math.round);
    const B=[59,130,246],P=[139,92,246],K=[236,72,153];
    const [r,g,b] = t<0.5 ? lr(B,P,t*2) : lr(P,K,(t-0.5)*2);
    return `rgb(${r},${g},${b})`;
  }

  _rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w/2, h/2);
    ctx.beginPath(); ctx.moveTo(x+rad,y);
    ctx.arcTo(x+w,y,x+w,y+h,rad); ctx.arcTo(x+w,y+h,x,y+h,rad);
    ctx.arcTo(x,y+h,x,y,rad); ctx.arcTo(x,y,x+w,y,rad); ctx.closePath();
  }

  _draw(ctx, W, H, time) {
    const ROLL_H = H - KEY_H, PPS = ROLL_H / 3.5;
    const km = new Map(this.keys.map(k => [k.midi, k]));
    const active = new Set();
    this.notes.forEach(n => { if (time >= n.startTime && time < n.startTime + n.duration) active.add(n.note); });
    this.pressedKeys.forEach(m => active.add(m));

    ctx.fillStyle = '#08080f'; ctx.fillRect(0, 0, W, H);
    this.keys.forEach(k => { if (k.isBlack) { ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(k.x,0,k.w,ROLL_H); } });
    for (let m=MIDI_LO;m<=MIDI_HI;m++) { if (m%12===0) { const k=km.get(m); if(k){ctx.fillStyle='rgba(139,92,246,0.06)';ctx.fillRect(k.x,0,k.w,ROLL_H);} } }
    for (let t=0;t<=3.5;t+=0.5) { const y=ROLL_H-t*PPS,isBar=Math.round(t/2)*2===t; ctx.strokeStyle=isBar?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.025)'; ctx.lineWidth=isBar?1:0.5; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=0.5;
    this.keys.filter(k=>!k.isBlack).forEach(k=>{ctx.beginPath();ctx.moveTo(k.x,0);ctx.lineTo(k.x,ROLL_H);ctx.stroke();});

    this.noteHitboxes = [];
    this.notes.forEach((n, index) => {
      const k=km.get(n.note); if(!k) return;
      const nb=ROLL_H-(n.startTime-time)*PPS, nt=nb-n.duration*PPS;
      if(nb<0||nt>ROLL_H) return;
      const color=this._noteColor(n.note), x=k.x+1, w=k.w-2, y=Math.max(0,nt), h=Math.min(nb,ROLL_H)-y;
      if(h<=0) return;

      this.noteHitboxes.push({ index, x, y, w, h, noteRef: n });
      const selected = this.draggingNote && this.draggingNote.index === index;
      const hovered = !selected && this.hoverNoteIndex === index;
      const hoverMode = hovered ? this.hoverNoteMode : null;
      const selectedMode = selected && this.draggingNote ? this.draggingNote.mode : null;

      ctx.shadowColor=color; ctx.shadowBlur=10; ctx.fillStyle=color; ctx.globalAlpha=0.7+(n.velocity/127)*0.3;
      this._rr(ctx,x,y,w,h,2); ctx.fill(); ctx.globalAlpha=1; ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.fillRect(x,y,w,2);

      if (selected || hovered) {
        ctx.strokeStyle = selected ? 'rgba(196,181,253,0.95)' : 'rgba(196,181,253,0.7)';
        ctx.lineWidth = selected ? 1.6 : 1.2;
        this._rr(ctx, x, y, w, h, 2);
        ctx.stroke();
      }

      if (this.editMode && (selected || hovered)) {
        const durationMode = (selectedMode === 'duration') || (hoverMode === 'duration');
        ctx.fillStyle = durationMode ? 'rgba(196,181,253,0.95)' : 'rgba(196,181,253,0.55)';
        ctx.fillRect(x + 1, y + 1, Math.max(2, w - 2), 2);
      }
    });
    ctx.shadowBlur=0; ctx.globalAlpha=1;

    const sg=ctx.createLinearGradient(0,ROLL_H,W,ROLL_H);
    sg.addColorStop(0,'rgba(59,130,246,0.15)');sg.addColorStop(0.3,'rgba(139,92,246,0.6)');sg.addColorStop(0.7,'rgba(139,92,246,0.6)');sg.addColorStop(1,'rgba(59,130,246,0.15)');
    ctx.strokeStyle=sg; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,ROLL_H); ctx.lineTo(W,ROLL_H); ctx.stroke();

    this.keys.filter(k=>!k.isBlack).forEach(k => {
      const act=active.has(k.midi), y=ROLL_H;

      // White key shadow/depth layer
      ctx.shadowColor='rgba(0,0,0,0.3)'; ctx.shadowBlur=4; ctx.shadowOffsetY=2;
      ctx.fillStyle='rgba(0,0,0,0.12)';
      this._rr(ctx,k.x+0.8,y+3,k.w-1.6,KEY_H-3,2.5); ctx.fill();

      if(act){
        // Active white key - glowing state
        ctx.shadowColor=this._noteColor(k.midi);ctx.shadowBlur=20;ctx.shadowOffsetY=0;
        const g=ctx.createLinearGradient(k.x,y,k.x,y+KEY_H);
        g.addColorStop(0,'#ddd6fe');g.addColorStop(0.12,'#c4b5fd');
        g.addColorStop(0.5,'#a78bfa');g.addColorStop(1,'#8b5cf6');
        ctx.fillStyle=g;
        this._rr(ctx,k.x+0.8,y+2,k.w-1.6,KEY_H-3,2.5); ctx.fill();

        // Highlight on active key
        ctx.shadowBlur=0;
        const hg=ctx.createLinearGradient(k.x,y,k.x,y+KEY_H*0.25);
        hg.addColorStop(0,'rgba(255,255,255,0.5)');hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=hg;
        this._rr(ctx,k.x+1.2,y+3,k.w-2.4,KEY_H*0.22,2); ctx.fill();
      }
      else{
        // Inactive white key - realistic ivory
        ctx.shadowColor='rgba(0,0,0,0.15)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;
        const g=ctx.createLinearGradient(k.x,y,k.x,y+KEY_H);
        g.addColorStop(0,'#fafafa');g.addColorStop(0.08,'#f5f5f7');
        g.addColorStop(0.85,'#e8e8ec');g.addColorStop(1,'#d4d4d9');
        ctx.fillStyle=g;
        this._rr(ctx,k.x+0.8,y+2,k.w-1.6,KEY_H-3,2.5); ctx.fill();

        // Subtle highlight at top
        ctx.shadowBlur=0;
        const hg=ctx.createLinearGradient(k.x,y,k.x,y+KEY_H*0.15);
        hg.addColorStop(0,'rgba(255,255,255,0.8)');hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=hg;
        this._rr(ctx,k.x+1.2,y+3,k.w-2.4,KEY_H*0.12,2); ctx.fill();

        // Subtle shadow on sides for depth
        ctx.fillStyle='rgba(0,0,0,0.04)';
        ctx.fillRect(k.x+0.8,y+2,1.5,KEY_H-3);
        ctx.fillRect(k.x+k.w-2.3,y+2,1.5,KEY_H-3);
      }

      // Border
      ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      ctx.strokeStyle=act?'rgba(139,92,246,0.3)':'rgba(0,0,0,0.15)';
      ctx.lineWidth=act?1.2:0.8;
      this._rr(ctx,k.x+0.8,y+2,k.w-1.6,KEY_H-3,2.5); ctx.stroke();

      // Octave labels
      if(k.midi%12===0&&!act){
        const oct=Math.floor(k.midi/12)-1;
        ctx.fillStyle='rgba(100,100,110,0.5)';
        ctx.font='7.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign='center';ctx.fillText(`C${oct}`,k.x+k.w/2,y+KEY_H-7);
      }
    });

    this.keys.filter(k=>k.isBlack).forEach(k => {
      const act=active.has(k.midi), y=ROLL_H, bkh=KEY_H*BK_RATIO;

      // Black key shadow
      ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=6; ctx.shadowOffsetY=3;
      ctx.fillStyle='rgba(0,0,0,0.25)';
      this._rr(ctx,k.x+0.5,y+4,k.w-1,bkh-2,2); ctx.fill();

      if(act){
        // Active black key - glowing
        ctx.shadowColor=this._noteColor(k.midi);ctx.shadowBlur=16;ctx.shadowOffsetY=0;
        const g=ctx.createLinearGradient(k.x,y,k.x,y+bkh);
        g.addColorStop(0,'#8b5cf6');g.addColorStop(0.5,'#7c3aed');g.addColorStop(1,'#6d28d9');
        ctx.fillStyle=g;
        this._rr(ctx,k.x+0.5,y+2,k.w-1,bkh-2,2); ctx.fill();

        // Subtle highlight
        ctx.shadowBlur=0;
        const hg=ctx.createLinearGradient(k.x,y,k.x,y+bkh*0.3);
        hg.addColorStop(0,'rgba(255,255,255,0.3)');hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=hg;
        this._rr(ctx,k.x+1,y+3,k.w-2,bkh*0.25,1.5); ctx.fill();
      }
      else{
        // Inactive black key - realistic ebony
        ctx.shadowColor='rgba(0,0,0,0.3)';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
        const g=ctx.createLinearGradient(k.x,y,k.x,y+bkh);
        g.addColorStop(0,'#2a2a35');g.addColorStop(0.15,'#1e1e28');
        g.addColorStop(0.7,'#14141d');g.addColorStop(1,'#0c0c12');
        ctx.fillStyle=g;
        this._rr(ctx,k.x+0.5,y+2,k.w-1,bkh-2,2); ctx.fill();

        // Very subtle highlight for realism
        ctx.shadowBlur=0;
        const hg=ctx.createLinearGradient(k.x,y,k.x,y+bkh*0.25);
        hg.addColorStop(0,'rgba(255,255,255,0.12)');hg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=hg;
        this._rr(ctx,k.x+1,y+3,k.w-2,bkh*0.2,1.5); ctx.fill();

        // Bevel effect on sides
        ctx.fillStyle='rgba(255,255,255,0.03)';
        ctx.fillRect(k.x+0.8,y+3,0.8,bkh*0.6);
        ctx.fillStyle='rgba(0,0,0,0.15)';
        ctx.fillRect(k.x+k.w-1.6,y+3,0.8,bkh*0.6);
      }

      // Border
      ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      ctx.strokeStyle=act?'rgba(139,92,246,0.4)':'rgba(0,0,0,0.4)';
      ctx.lineWidth=act?1:0.6;
      this._rr(ctx,k.x+0.5,y+2,k.w-1,bkh-2,2); ctx.stroke();
    });
  }

  setTime(t) { this.currentTime = t; }
  setPlaying(p) { this.isPlaying = p; }
  setEditMode(enabled) {
    this.editMode = Boolean(enabled);
    this.hoverNoteIndex = -1;
    this.hoverNoteMode = null;
    if (!this.editMode) this._finishNoteDrag();
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    this._ro.disconnect();
    const c = this.canvas;
    c.removeEventListener('mousedown', this._h.md);
    c.removeEventListener('mousemove', this._h.mm);
    c.removeEventListener('mouseup', this._h.mu);
    c.removeEventListener('mouseleave', this._h.ml);
    c.removeEventListener('touchstart', this._h.ts);
    c.removeEventListener('touchmove', this._h.tm);
    c.removeEventListener('touchend', this._h.te);
    window.removeEventListener('mousemove', this._h.wm);
    window.removeEventListener('mouseup', this._h.wu);
    window.removeEventListener('blur', this._h.wb);
    this._finishNoteDrag(false);
    this.pressedKeys.clear();
    c.remove();
  }
}

// ═══════════════════════════════════════════════════════════════════
// WAVEFORM CLASS
// ═══════════════════════════════════════════════════════════════════

class Waveform {
  constructor(container) {
    this.container = container;
    this.data = []; this.currentTime = 0; this.duration = 48; this.isRecording = false;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(this.canvas);
    this._ro = new ResizeObserver(() => this._draw());
    this._ro.observe(container);
    this._draw();
  }

  update(data, currentTime, duration, isRecording) {
    this.data = data; this.currentTime = currentTime; this.duration = duration; this.isRecording = isRecording;
    this._draw();
  }

  _draw() {
    const dpr = window.devicePixelRatio || 1, W = this.container.clientWidth || 300, H = this.container.clientHeight || 72;
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.canvas.style.width = W + 'px'; this.canvas.style.height = H + 'px';
    const ctx = this.canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    if (!this.data.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.isRecording ? 'Recording...' : 'No audio loaded', W / 2, H / 2 + 4);
      return;
    }
    const bw = W / this.data.length, px = this.duration > 0 ? (this.currentTime / this.duration) * W : 0;
    this.data.forEach((v, i) => {
      const x = i * bw, h = v * (H * 0.8), y = (H - h) / 2;
      ctx.fillStyle = x < px ? '#8b5cf6' : 'rgba(255,255,255,0.18)';
      ctx.fillRect(x + 0.5, y, Math.max(1, bw - 1), h);
    });
  }

  destroy() { this._ro.disconnect(); this.canvas.remove(); }
}

// ═══════════════════════════════════════════════════════════════════
// AUDIO PLAYER CLASS
// ═══════════════════════════════════════════════════════════════════

class AudioPlayerWidget {
  constructor(container, url, fileName) {
    this.container = container;
    this.fileName = fileName;
    this.isPlaying = false; this.duration = 0; this.currentTime = 0; this.loaded = false;
    this.audio = new Audio(url);
    this.audio.addEventListener('loadedmetadata', () => { this.duration = this.audio.duration; this.loaded = true; this._update(); });
    this.audio.addEventListener('timeupdate', () => { this.currentTime = this.audio.currentTime; this._update(); });
    this.audio.addEventListener('ended', () => { this.isPlaying = false; this.currentTime = 0; this.audio.currentTime = 0; this._update(); });
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="w-audio-player w-fade-in">
        <p class="w-audio-filename">🎵 ${this.fileName}</p>
        <div class="w-audio-track">
          <div class="w-audio-track-bg"></div>
          <div class="w-audio-track-fill" id="ap-fill" style="width:0%"></div>
          <input type="range" min="0" max="1" step="0.001" value="0" id="ap-range">
        </div>
        <div class="w-audio-times"><span id="ap-cur">0:00</span><span id="ap-dur">0:00</span></div>
        <div class="w-audio-controls">
          <div class="w-audio-btns">
            <button class="w-ap-play" id="ap-play" disabled>${ICON.play(14, 'white')}</button>
            <button class="w-ap-stop" id="ap-stop">${ICON.stop(11, '#9ca3af')}</button>
            <div id="ap-vis" style="display:flex;align-items:center;gap:2px;opacity:0;">
              <div class="w-vis-bar"></div><div class="w-vis-bar"></div><div class="w-vis-bar"></div>
            </div>
          </div>
          <button class="w-ap-dl" id="ap-dl">${ICON.download(11, '#93c5fd')} <span>Download</span></button>
        </div>
      </div>`;
    this.container.querySelector('#ap-play').addEventListener('click', () => this._togglePlay());
    this.container.querySelector('#ap-stop').addEventListener('click', () => this._stop());
    this.container.querySelector('#ap-dl').addEventListener('click', () => { const a = document.createElement('a'); a.href = this.audio.src; a.download = this.fileName; a.click(); });
    this.container.querySelector('#ap-range').addEventListener('input', e => {
      const t = parseFloat(e.target.value) * this.duration;
      this.audio.currentTime = t; this.currentTime = t; this._update();
    });
  }

  async _togglePlay() {
    if (!this.loaded) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this._update();
      return;
    }

    try {
      const playPromise = this.audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise;
      }
      this.isPlaying = true;
    } catch (error) {
      this.isPlaying = false;
      console.error('Audio playback error:', error);
    }

    this._update();
  }

  _stop() { this.audio.pause(); this.audio.currentTime = 0; this.isPlaying = false; this.currentTime = 0; this._update(); }

  _update() {
    const pct = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
    const fill = this.container.querySelector('#ap-fill'); if (fill) fill.style.width = pct + '%';
    const range = this.container.querySelector('#ap-range'); if (range) range.value = this.duration > 0 ? this.currentTime / this.duration : 0;
    const cur = this.container.querySelector('#ap-cur'); if (cur) cur.textContent = fmtTime(this.currentTime);
    const dur = this.container.querySelector('#ap-dur'); if (dur) dur.textContent = fmtTime(this.duration);
    const play = this.container.querySelector('#ap-play');
    if (play) { play.innerHTML = this.isPlaying ? ICON.pause(14, 'white') : ICON.play(14, 'white'); play.className = 'w-ap-play' + (this.isPlaying ? ' active' : ''); play.disabled = !this.loaded; }
    const vis = this.container.querySelector('#ap-vis'); if (vis) vis.style.opacity = this.isPlaying ? '1' : '0';
  }

  destroy() { this.audio.pause(); this.audio.src = ''; }
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function destroyInstances() {
  if (_pianoRoll) { _pianoRoll.destroy(); _pianoRoll = null; }
  if (_audioPlayer) { _audioPlayer.destroy(); _audioPlayer = null; }
  if (_waveform) { _waveform.destroy(); _waveform = null; }
  _stopRecordingWaveform();
  stopNativePlayback();
  cancelAnimationFrame(_midiRaf);
  state.midiPlaying = false;
}

function renderDashboard(content) {
  destroyInstances();
  const aM = state.selectedModel;
  const playbackDuration = getMidiDuration();
  const rollNotes = getNotesForRoll();
  const safeProgress = playbackDuration > 0 ? (state.midiTime / playbackDuration) * 100 : 0;

  content.innerHTML = `
    <div class="w-dashboard">
      <div class="w-top-grid">

        <!-- Audio Input -->
        <div class="w-panel">
          <div class="w-panel-header">${ICON.mic(13,'#6b7280')} AUDIO INPUT</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <button class="w-rec-btn${state.isRecording?' recording':''}" id="rec-btn" style="position:relative;">
              <span id="rec-icon">${state.isRecording ? ICON.micOff(22,'white') : ICON.mic(22,'#ef4444')}</span>
              ${state.isRecording ? '<div class="w-rec-pulse"></div>' : ''}
            </button>
            <div style="flex:1;min-width:0;">
              <p id="rec-label" style="font-size:11px;color:${state.isRecording?'#ef4444':'#6b7280'};margin-bottom:4px;">${state.isRecording ? '● Recording...' : 'Record piano audio'}</p>
              <button class="w-upload-btn" id="upload-btn">${ICON.upload(12,'#93c5fd')} <span>Upload audio file</span></button>
              <input type="file" id="file-input" accept=".wav,.mp3,.flac,.ogg,.m4a" style="display:none;">
            </div>
          </div>
          ${state.fileName ? `<div class="w-file-badge w-fade-in" style="margin-bottom:12px;">${ICON.checkCircle(11,'#10b981')} <span style="font-size:11px;color:#6ee7b7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${state.fileName}</span></div>` : ''}
          ${state.isRecording ? '<div class="w-waveform" id="wf-wrap"></div>' : ''}
          <div id="ap-wrap"></div>
        </div>

        <!-- AI Model -->
        <div class="w-panel">
          <div class="w-panel-header">${ICON.cpu(13,'#6b7280')} AI MODEL</div>
          <div style="position:relative;margin-bottom:12px;">
            <button class="w-model-btn" id="model-btn">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b82f6,#8b5cf6);">${aM==='transkun'?ICON.cpu(14,'white'):ICON.activity(14,'white')}</div>
                <div style="text-align:left;">
                  <p style="font-size:13px;color:#e5e7eb;font-weight:600;">${aM==='transkun'?'TransKun':'Onsets & Frames'}</p>
                  <p style="font-size:10px;color:#6b7280;">${aM==='transkun'?'Transformer-based model':'Google Magenta model'}</p>
                </div>
              </div>
              <span id="m-chev" style="transition:transform 0.2s;${state.modelDropdownOpen?'transform:rotate(180deg);':''}">${ICON.chevronDown(15,'#6b7280')}</span>
            </button>
            <div id="model-dd" style="display:${state.modelDropdownOpen?'block':'none'};" class="w-model-dropdown">
              ${['transkun','onsets'].map(m=>`
                <button class="w-model-opt${state.selectedModel===m?' active':''}" data-model="${m}">
                  <div style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:${state.selectedModel===m?'linear-gradient(135deg,#3b82f6,#8b5cf6)':'rgba(255,255,255,0.06)'};">
                    ${m==='transkun'?ICON.cpu(14,'white'):ICON.activity(14,'#9ca3af')}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:12px;color:#e5e7eb;font-weight:600;">${m==='transkun'?'TransKun':'Onsets & Frames'}</span>
                      ${m==='transkun'?'<span style="font-size:9px;color:#10b981;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:4px;padding:1px 6px;font-weight:600;">Recommended</span>':''}
                    </div>
                    <p style="font-size:10px;color:#6b7280;">${m==='transkun'?'Transformer-based model. High accuracy':'Google Magenta model. Optimal for clean recordings'}</p>
                  </div>
                </button>
              `).join('<div style="height:1px;background:rgba(255,255,255,0.05);"></div>')}
            </div>
          </div>
          <div class="w-stat-box" style="margin-bottom:12px;">
            <p style="font-size:16px;font-weight:700;color:#10b981;">${aM==='transkun'?'97%':'94%'}</p>
            <p style="font-size:10px;color:#6b7280;">Accuracy</p>
          </div>
          <button id="convert-btn" class="w-convert-btn" ${state.stage!=='loaded'?'disabled':''} style="background:${state.stage==='loaded'?'linear-gradient(135deg,#3b82f6,#8b5cf6)':'rgba(255,255,255,0.04)'};border:${state.stage==='loaded'?'none':'1px solid rgba(255,255,255,0.08)'};color:${state.stage==='loaded'?'white':'#4b5563'};cursor:${state.stage==='loaded'?'pointer':'not-allowed'};opacity:${state.stage==='loaded'?1:0.45};box-shadow:${state.stage==='loaded'?'0 0 25px rgba(139,92,246,0.45)':'none'};">
            ${ICON.zap(14,state.stage==='loaded'?'white':'#4b5563')} Convert to MIDI
          </button>
          ${state.statusMessage ? `
            <div class="w-file-badge w-fade-in" style="margin-top:12px;background:${state.statusType==='error'?'linear-gradient(135deg,rgba(239,68,68,0.14),rgba(239,68,68,0.08))':'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))'};border:1px solid ${state.statusType==='error'?'rgba(239,68,68,0.35)':'rgba(16,185,129,0.25)'};">
              ${state.statusType==='error' ? ICON.xCircle(13,'#f87171') : ICON.checkCircle(13,'#10b981')}
              <span style="font-size:11px;color:${state.statusType==='error'?'#fecaca':'#6ee7b7'};">${state.statusMessage}</span>
            </div>` : ''}
          <div id="proc-wrap" style="display:${state.stage==='processing'?'block':'none'};margin-top:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:11px;color:#a78bfa;" id="proc-lbl">Processing…</span>
              <span style="font-size:11px;color:#6b7280;" id="proc-pct">${Math.round(state.progress)}%</span>
            </div>
            <div class="w-progress-bar"><div class="w-progress-fill" id="proc-bar" style="width:${state.progress}%"></div></div>
            <div style="display:flex;gap:6px;margin-top:8px;">
              ${['Onset detection','Frame analysis','MIDI mapping'].map((s,i)=>`<div class="w-step" style="background:${state.progress>(i+1)*30?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.04)'};border:1px solid ${state.progress>(i+1)*30?'rgba(16,185,129,0.25)':'rgba(255,255,255,0.06)'};" data-step="${i}"><div style="width:5px;height:5px;border-radius:50%;background:${state.progress>(i+1)*30?'#10b981':'#374151'};"></div><span style="font-size:9px;color:${state.progress>(i+1)*30?'#6ee7b7':'#4b5563'};">${s}</span></div>`).join('')}
            </div>
          </div>
          ${state.stage==='ready'?`<div class="w-file-badge w-fade-in" style="margin-top:12px;">${ICON.checkCircle(13,'#10b981')} <span style="font-size:11px;color:#6ee7b7;">MIDI conversion complete!</span></div>`:''}
        </div>

        <!-- MIDI Player -->
        <div class="w-panel">
          <div class="w-panel-header">${ICON.music2(13,'#6b7280')} MIDI PLAYER</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;">
            <button class="w-ctrl-btn" id="midi-stop" ${state.stage!=='ready'?'disabled':''}>${ICON.stop(14,'#9ca3af')}</button>
            <button class="w-midi-play" id="midi-play" ${state.stage!=='ready'?'disabled':''} style="background:${state.stage==='ready'?'linear-gradient(135deg,#3b82f6,#8b5cf6)':'rgba(255,255,255,0.05)'};box-shadow:${state.stage==='ready'?`0 0 ${state.midiPlaying?30:15}px rgba(139,92,246,${state.midiPlaying?0.7:0.4})`:'none'};">
              ${state.midiPlaying?ICON.pause(20,'white'):ICON.play(20,'white')}
            </button>
            <button class="w-ctrl-btn accent" id="midi-dl" ${state.stage!=='ready'?'disabled':''}>${ICON.download(14,'#93c5fd')}</button>
            <button class="w-ctrl-btn" id="demo-midi-btn" title="Load demo MIDI" style="width:auto;padding:0 10px;border-radius:12px;display:flex;gap:6px;">
              ${ICON.music2(14,'#9ca3af')}
              <span style="font-size:11px;color:#9ca3af;">Demo</span>
            </button>
          </div>
          <div style="margin-bottom:12px;">
            <input type="range" class="w-seek" id="midi-seek" min="0" max="${playbackDuration}" step="0.05" value="${state.midiTime}" ${state.stage!=='ready'?'disabled':''} style="background:linear-gradient(to right,#8b5cf6 ${safeProgress}%,rgba(255,255,255,0.1) ${safeProgress}%);">
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span style="font-size:10px;color:#6b7280;" id="midi-cur">${fmtTime(state.midiTime)}</span>
              <span style="font-size:10px;color:#6b7280;">${fmtTime(playbackDuration)}</span>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
            <div class="w-stat-box"><div style="color:#6b7280;margin-bottom:2px;">${ICON.music2(11,'#6b7280')}</div><p style="font-size:12px;color:#e5e7eb;font-weight:600;">${state.stage==='ready'?rollNotes.length:'—'}</p><p style="font-size:9px;color:#4b5563;">Notes</p></div>
            <div class="w-stat-box"><div style="color:#6b7280;margin-bottom:2px;">${ICON.clock(11,'#6b7280')}</div><p style="font-size:12px;color:#e5e7eb;font-weight:600;">${state.stage==='ready'?fmtTime(playbackDuration):'—'}</p><p style="font-size:9px;color:#4b5563;">Duration</p></div>
            <div class="w-stat-box"><div style="color:#6b7280;margin-bottom:2px;">${ICON.activity(11,'#6b7280')}</div><p style="font-size:12px;color:#e5e7eb;font-weight:600;">${state.stage==='ready' && state.midiTempo ? `${Math.round(state.midiTempo)} BPM` : '—'}</p><p style="font-size:9px;color:#4b5563;">Tempo</p></div>
          </div>
          <button id="export-btn" ${state.stage!=='ready'?'disabled':''} style="width:100%;border-radius:12px;padding:10px;display:flex;align-items:center;justify-content:center;gap:8px;background:${state.stage==='ready'?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)'};border:${state.stage==='ready'?'1px solid rgba(59,130,246,0.35)':'1px solid rgba(255,255,255,0.06)'};cursor:${state.stage==='ready'?'pointer':'not-allowed'};opacity:${state.stage==='ready'?1:0.35};transition:all 0.3s;">
            ${ICON.download(13,state.stage==='ready'?'#93c5fd':'#4b5563')} <span style="font-size:12px;color:${state.stage==='ready'?'#93c5fd':'#4b5563'};font-weight:500;">Export .mid file</span>
          </button>
        </div>
      </div>

      <!-- Piano Roll -->
      <div class="w-piano-wrap${state.noteEditMode ? ' edit-mode' : ''}">
        <div class="w-piano-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:3px;height:14px;border-radius:2px;background:linear-gradient(180deg,#3b82f6,#8b5cf6);"></div>
            <span style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:0.06em;">PIANO ROLL</span>
            <span style="font-size:9px;color:#6b7280;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:2px 6px;">88 KEYS · SYNTHESIA VIEW</span>
          </div>
          <div class="w-piano-meta">
            <button
              id="note-edit-toggle"
              class="w-note-edit-btn ${state.noteEditMode ? 'active' : ''}"
              ${state.stage!=='ready' ? 'disabled' : ''}
            >
              ${state.noteEditMode ? 'Editing On' : 'Edit Notes'}
            </button>
            <div id="piano-status">
              ${state.midiPlaying
                ? `<div class="w-live-badge"><div class="w-live-dot"></div><span style="font-size:10px;color:#6ee7b7;">LIVE</span></div>`
                : `<span style="font-size:10px;color:#4b5563;">${state.noteEditMode && state.stage==='ready' ? 'Edit mode · L/R pitch · top edge U/D duration' : (state.stage==='ready' ? 'Ready · Press play' : 'Demo preview')}</span>`}
            </div>
          </div>
        </div>
        <div class="w-piano-body" id="piano-body"></div>
      </div>
    </div>`;

  // Init canvas instances
  const wfWrap = content.querySelector('#wf-wrap');
  if (wfWrap) _waveform = new Waveform(wfWrap);

  const pianoBody = content.querySelector('#piano-body');
  if (pianoBody) {
    _pianoRoll = new PianoRoll(pianoBody, rollNotes, {
      editMode: state.noteEditMode && state.stage === 'ready',
      onNotesChange: notes => {
        if (state.stage === 'ready') state.midiNotes = notes;
      },
      onEditCommit: notes => {
        if (state.stage === 'ready') state.midiNotes = notes;
        const rebuilt = _rebuildMidiBlobFromEditedNotes();
        setStatusMessage(
          rebuilt
            ? 'Note updated. Playback and MIDI export were refreshed.'
            : 'Note updated for playback, but MIDI export refresh failed.',
          rebuilt ? 'success' : 'error'
        );
        renderDashboard(content);
      },
    });
    _pianoRoll.setTime(state.midiTime);
    _pianoRoll.setPlaying(state.midiPlaying);
    _pianoRoll.setEditMode(state.noteEditMode && state.stage === 'ready' && !state.midiPlaying);
  }

  if (state.audioUrl && state.fileName) {
    const apWrap = content.querySelector('#ap-wrap');
    if (apWrap) _audioPlayer = new AudioPlayerWidget(apWrap, state.audioUrl, state.fileName);
  }

  // Bind events
  content.querySelector('#rec-btn').addEventListener('click', _handleRecord);
  content.querySelector('#upload-btn').addEventListener('click', () => content.querySelector('#file-input').click());
  content.querySelector('#file-input').addEventListener('change', _handleUpload);

  const modelBtn = content.querySelector('#model-btn');
  modelBtn.addEventListener('click', () => {
    state.modelDropdownOpen = !state.modelDropdownOpen;
    const dd = content.querySelector('#model-dd'), chev = content.querySelector('#m-chev');
    if (dd) dd.style.display = state.modelDropdownOpen ? 'block' : 'none';
    if (chev) chev.style.transform = state.modelDropdownOpen ? 'rotate(180deg)' : '';
  });
  content.querySelectorAll('.w-model-opt').forEach(btn => {
    btn.addEventListener('click', () => { state.selectedModel = btn.dataset.model; state.modelDropdownOpen = false; renderDashboard(content); });
  });

  content.querySelector('#convert-btn').addEventListener('click', _handleConvert.bind(null, content));
  content.querySelector('#midi-play').addEventListener('click', () => _midiPlayPause(content));
  content.querySelector('#midi-stop').addEventListener('click', () => _midiStop(content));
  content.querySelector('#midi-dl').addEventListener('click', _downloadMidi);
  content.querySelector('#demo-midi-btn').addEventListener('click', () => _loadDemoMidi(content));
  content.querySelector('#export-btn').addEventListener('click', _downloadMidi);
  content.querySelector('#note-edit-toggle')?.addEventListener('click', () => {
    if (state.stage !== 'ready') return;
    state.noteEditMode = !state.noteEditMode;
    setStatusMessage(
      state.noteEditMode
        ? 'Edit mode enabled. Left/right changes pitch. Drag the top edge up/down to change duration.'
        : 'Edit mode disabled.',
      'success'
    );
    renderDashboard(content);
  });
  content.querySelector('#midi-seek').addEventListener('input', e => {
    state.midiTime = parseFloat(e.target.value);
    if (_pianoRoll) _pianoRoll.setTime(state.midiTime);
    if (state.midiPlaying) {
      scheduleNativePlayback(state.midiTime);
    }
    _updateSeek(content);
  });
}

function _updateSeek(content) {
  const duration = getMidiDuration();
  const seek = content.querySelector('#midi-seek'), cur = content.querySelector('#midi-cur');
  if (seek) {
    seek.max = duration;
    seek.value = state.midiTime;
    const p = duration > 0 ? (state.midiTime / duration) * 100 : 0;
    seek.style.background = `linear-gradient(to right,#8b5cf6 ${p}%,rgba(255,255,255,0.1) ${p}%)`;
  }
  if (cur) cur.textContent = fmtTime(state.midiTime);
  const ps = content.querySelector('#piano-status');
  if (ps) {
    if (state.midiPlaying) {
      ps.innerHTML = `<div class="w-live-badge"><div class="w-live-dot"></div><span style="font-size:10px;color:#6ee7b7;">LIVE</span></div>`;
    } else if (state.noteEditMode && state.stage === 'ready') {
      ps.innerHTML = `<span style="font-size:10px;color:#a78bfa;">Edit mode · L/R pitch · top edge U/D duration</span>`;
    } else {
      ps.innerHTML = `<span style="font-size:10px;color:#4b5563;">${state.stage==='ready'?'Ready · Press play':'Demo preview'}</span>`;
    }
  }
  if (_pianoRoll) {
    _pianoRoll.setTime(state.midiTime);
    _pianoRoll.setPlaying(state.midiPlaying);
    _pianoRoll.setEditMode(state.noteEditMode && state.stage === 'ready' && !state.midiPlaying);
  }
}

function _midiTick(content) {
  if (!state.midiPlaying) return;
  const t = _nativeStartOffset + ((performance.now() - _nativeStartPerf) / 1000);
  const duration = getMidiDuration();
  if (t >= duration) {
    _midiStop(content);
    return;
  }
  state.midiTime = t;
  _updateSeek(content);
  _midiRaf = requestAnimationFrame(() => _midiTick(content));
}

function _midiPlayPause(content) {
  if (state.stage !== 'ready') return;
  if (!state.midiNotes.length) {
    setStatusMessage('The loaded MIDI contains no note events to play.', 'error');
    renderDashboard(content);
    return;
  }

  if (state.midiPlaying) {
    state.midiPlaying = false;
    stopNativePlayback();
    cancelAnimationFrame(_midiRaf);
    const btn = content.querySelector('#midi-play');
    if (btn) {
      btn.innerHTML = ICON.play(20, 'white');
      btn.style.boxShadow = `0 0 15px rgba(139,92,246,0.4)`;
    }
    return;
  }

  // Create context synchronously within the click handler
  let ctx;
  try {
    ctx = getNativeAudioContext();
  } catch (error) {
    setStatusMessage(`Audio error: ${error.message}`, 'error');
    renderDashboard(content);
    return;
  }

  const startPlayback = () => {
    scheduleNativePlayback(state.midiTime);
    state.midiPlaying = true;
    _midiRaf = requestAnimationFrame(() => _midiTick(content));
    const btn = content.querySelector('#midi-play');
    if (btn) {
      btn.innerHTML = ICON.pause(20, 'white');
      btn.style.boxShadow = `0 0 30px rgba(139,92,246,0.7)`;
    }
    _updateSeek(content);
  };

  // If already running start immediately, otherwise resume then start
  if (ctx.state === 'running') {
    startPlayback();
  } else {
    ctx.resume()
      .then(startPlayback)
      .catch(error => {
        setStatusMessage(`Playback error: ${error.message}`, 'error');
        renderDashboard(content);
      });
  }
}

function _midiStop(content) {
  state.midiPlaying = false;
  state.midiTime = 0;
  cancelAnimationFrame(_midiRaf);
  stopNativePlayback();

  _updateSeek(content);
  const btn = content.querySelector('#midi-play');
  if (btn) btn.innerHTML = ICON.play(20,'white');
}

function _downloadMidi() {
  if (state.stage !== 'ready') return;
  if (!state.midiBlob) return;
  const url = URL.createObjectURL(state.midiBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcription_${getBackendModel()}.mid`;
  a.click();
  URL.revokeObjectURL(url);
}

async function _extractMidiData(midiBlob) {
  if (!window.Midi) {
    throw new Error('MIDI parser is not available.');
  }

  const arrayBuffer = await midiBlob.arrayBuffer();
  const parsed = new window.Midi(arrayBuffer);
  const notes = [];

  parsed.tracks.forEach(track => {
    track.notes.forEach(note => {
      notes.push({
        note: note.midi,
        startTime: note.time,
        duration: note.duration,
        velocity: Math.round((note.velocity ?? 0.8) * 127),
      });
    });
  });

  notes.sort((a, b) => a.startTime - b.startTime);

  const tempo = parsed.header && Array.isArray(parsed.header.tempos) && parsed.header.tempos.length
    ? parsed.header.tempos[0].bpm
    : null;

  const notesDuration = notes.length
    ? Math.max(...notes.map(note => note.startTime + note.duration))
    : 0;
  const resolvedDuration = Math.max(Number(parsed.duration) || 0, notesDuration);

  return {
    parsed,
    notes,
    duration: resolvedDuration,
    tempo,
  };
}

async function _applyMidiBlob(midiBlob, successMessage) {
  const midiData = await _extractMidiData(midiBlob);

  resetMidiData();
  state.midiBlob = midiBlob;
  state.midiUrl = URL.createObjectURL(midiBlob);
  state.midiNotes = midiData.notes;
  state.midiDuration = midiData.duration;
  state.midiTempo = midiData.tempo;

  state.stage = 'ready';
  state.progress = 0;
  state.midiTime = 0;
  setStatusMessage(successMessage, 'success');
}

function _rebuildMidiBlobFromEditedNotes() {
  if (!window.Midi || !state.midiNotes.length) return false;

  try {
    const midi = new window.Midi();
    if (state.midiTempo && midi.header && typeof midi.header.setTempo === 'function') {
      midi.header.setTempo(Math.max(30, Math.min(300, Number(state.midiTempo) || 120)));
    }

    const track = midi.addTrack();
    const orderedNotes = [...state.midiNotes].sort((a, b) => a.startTime - b.startTime);
    orderedNotes.forEach(note => {
      const midiNote = Math.round(Number(note.note));
      const startTime = Math.max(0, Number(note.startTime) || 0);
      const duration = Math.max(0.03, Number(note.duration) || 0.12);
      const velocity = Math.min(1, Math.max(0.05, (Number(note.velocity) || 96) / 127));

      if (!Number.isFinite(midiNote) || midiNote < MIDI_LO || midiNote > MIDI_HI) return;
      track.addNote({
        midi: midiNote,
        time: startTime,
        duration,
        velocity,
      });
    });

    const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
    if (state.midiUrl) URL.revokeObjectURL(state.midiUrl);
    state.midiBlob = blob;
    state.midiUrl = URL.createObjectURL(blob);
    state.midiDuration = state.midiNotes.length
      ? Math.max(...state.midiNotes.map(note => (Number(note.startTime) || 0) + Math.max(0.03, Number(note.duration) || 0)))
      : 0;
    return true;
  } catch (error) {
    console.error('MIDI rebuild error:', error);
    return false;
  }
}

function _buildDemoMidiBlob() {
  if (!window.Midi) {
    throw new Error('MIDI library is not available.');
  }

  const midi = new window.Midi();
  if (midi.header && typeof midi.header.setTempo === 'function') {
    midi.header.setTempo(112);
  }

  const rightHand = midi.addTrack();
  const leftHand = midi.addTrack();

  const progression = [
    { bass: 48, chord: [60, 64, 67], melody: [72, 74, 76, 79] }, // C
    { bass: 45, chord: [57, 60, 64], melody: [71, 72, 74, 76] }, // Am
    { bass: 41, chord: [53, 57, 60], melody: [69, 71, 72, 74] }, // F
    { bass: 43, chord: [55, 59, 62], melody: [67, 69, 71, 72] }, // G
  ];

  const beat = 0.48;
  let phraseStart = 0;

  for (let repeat = 0; repeat < 2; repeat += 1) {
    progression.forEach(block => {
      leftHand.addNote({
        midi: block.bass,
        time: phraseStart,
        duration: beat * 3.8,
        velocity: 0.75,
      });

      block.chord.forEach((note, index) => {
        rightHand.addNote({
          midi: note,
          time: phraseStart + index * 0.06,
          duration: beat * 1.7,
          velocity: 0.7,
        });
      });

      block.melody.forEach((note, index) => {
        rightHand.addNote({
          midi: note,
          time: phraseStart + index * beat,
          duration: beat * 0.82,
          velocity: 0.88,
        });
      });

      phraseStart += beat * 4;
    });
  }

  return new Blob([midi.toArray()], { type: 'audio/midi' });
}

async function _loadDemoMidi(content) {
  // Unlock audio context synchronously on this click
  try { getNativeAudioContext(); } catch (_) {}

  try {
    const demoBlob = _buildDemoMidiBlob();
    await _applyMidiBlob(demoBlob, 'Demo MIDI loaded. Press Play to preview the piano.');
  } catch (error) {
    setStatusMessage(`Demo MIDI error: ${error.message}`, 'error');
  }

  renderDashboard(content);
}

function _updateProcessingUI(content) {
  const bar = content.querySelector('#proc-bar');
  const pct = content.querySelector('#proc-pct');
  if (bar) bar.style.width = state.progress + '%';
  if (pct) pct.textContent = Math.round(state.progress) + '%';

  content.querySelectorAll('[data-step]').forEach((el, i) => {
    const ok = state.progress > (i + 1) * 30;
    el.style.background = ok ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)';
    el.style.border = `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`;
    const dot = el.querySelector('div');
    const sp = el.querySelector('span');
    if (dot) dot.style.background = ok ? '#10b981' : '#374151';
    if (sp) sp.style.color = ok ? '#6ee7b7' : '#4b5563';
  });
}

async function _handleRecord() {
  const content = document.getElementById('w-content');
  if (state.isRecording) {
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') _mediaRecorder.stop();
    _stopRecordingWaveform();
    state.isRecording = false;
    if (_recTimer) clearTimeout(_recTimer);
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg'];
      const mimeType = mimeCandidates.find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) || '';
      _mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      _audioChunks = [];

      _mediaRecorder.ondataavailable = e => { if (e.data.size > 0) _audioChunks.push(e.data); };
      _mediaRecorder.onstop = () => {
        _stopRecordingWaveform();
        stream.getTracks().forEach(t => t.stop());
        const blobType = _mediaRecorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(_audioChunks, { type: blobType });
        const extension = blobType.includes('ogg') ? 'ogg' : 'webm';
        const recordedFile = new File([blob], `recording.${extension}`, { type: blobType });

        if (_audioUrlRef) URL.revokeObjectURL(_audioUrlRef);
        _audioUrlRef = URL.createObjectURL(blob);
        resetMidiData();
        state.audioUrl = _audioUrlRef;
        state.audioFile = recordedFile;
        state.fileName = recordedFile.name;
        state.stage = 'loaded';
        clearStatusMessage();
        renderDashboard(content);
      };
      _mediaRecorder.start();
      state.isRecording = true;
      state.stage = 'idle';
      clearStatusMessage();
      renderDashboard(content);
      _startRecordingWaveform(stream);
      return;
    } catch (error) {
      state.isRecording = false;
      setStatusMessage(`Microphone error: ${error.message}`, 'error');
    }
  }
  renderDashboard(content);
}

async function _handleUpload(e) {
  const file = e.target.files?.[0]; if (!file) return;
  if (_mediaRecorder && _mediaRecorder.state !== 'inactive') _mediaRecorder.stop();
  _stopRecordingWaveform();
  state.isRecording = false;
  if (_recTimer) clearTimeout(_recTimer);
  if (_audioUrlRef) URL.revokeObjectURL(_audioUrlRef);

  resetMidiData();
  _audioUrlRef = URL.createObjectURL(file);
  state.audioUrl = _audioUrlRef;
  state.audioFile = file;
  state.fileName = file.name;
  state.stage = 'loaded';
  clearStatusMessage();
  e.target.value = '';

  const content = document.getElementById('w-content');
  renderDashboard(content);

  try {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await fetch(`${state.apiUrl}/upload-audio`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Upload endpoint failed');
    }

    setStatusMessage(`Loaded: ${file.name}`, 'success');
  } catch (error) {
    setStatusMessage(`Loaded locally. Server upload warning: ${error.message}`, 'error');
  }

  renderDashboard(content);
}

async function _handleConvert(content) {
  if (state.stage !== 'loaded') return;
  if (!state.audioFile) {
    setStatusMessage('Select or record an audio file first.', 'error');
    renderDashboard(content);
    return;
  }

  state.stage = 'processing';
  state.progress = 3;
  clearStatusMessage();
  renderDashboard(content);

  let p = 3;
  _progressTimer = setInterval(() => {
    p += Math.random() * 4 + 1.5;
    state.progress = Math.min(90, p);
    _updateProcessingUI(content);
  }, 180);

  try {
    const formData = new FormData();
    formData.append('audio', state.audioFile, state.audioFile.name || 'input.wav');
    formData.append('model', getBackendModel());

    const response = await fetch(`${state.apiUrl}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Transcription failed.';
      try {
        const data = await response.json();
        errorMessage = data.detail || data.message || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const midiBlob = await response.blob();

    if (_progressTimer) {
      clearInterval(_progressTimer);
      _progressTimer = null;
    }

    await _applyMidiBlob(midiBlob, 'MIDI conversion complete.');
    renderDashboard(content);
  } catch (error) {
    state.stage = 'loaded';
    state.progress = 0;
    setStatusMessage(`Conversion error: ${error.message}`, 'error');
    renderDashboard(content);
  } finally {
    if (_progressTimer) {
      clearInterval(_progressTimer);
      _progressTimer = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════════════

function renderHistory(content) {
  destroyInstances();
  const s = state;
  const rows = HISTORY
    .filter(e => !s.histDeleted.has(e.id))
    .filter(e => s.histStatus === 'all' || e.status === s.histStatus)
    .filter(e => s.histModel === 'all' || e.model === s.histModel)
    .filter(e => e.fileName.toLowerCase().includes(s.histSearch.toLowerCase()))
    .sort((a, b) => s.histSort === 'notes' ? b.notes - a.notes : s.histSort === 'duration' ? b.duration.localeCompare(a.duration) : b.date.localeCompare(a.date));
  const total = HISTORY.filter(e => !s.histDeleted.has(e.id)).length;

  const statsHtml = [
    { label: 'Total Conversions', value: '10', color: '#8b5cf6', icon: ICON.music2(16, '#8b5cf6') },
    { label: 'Successful', value: '8', color: '#10b981', icon: ICON.checkCircle(16, '#10b981') },
    { label: 'Total Notes', value: '2,162', color: '#3b82f6', icon: ICON.activity(16, '#3b82f6') },
    { label: 'Avg Duration', value: '1:58', color: '#f59e0b', icon: ICON.clock(16, '#f59e0b') },
  ].map(c => `<div class="w-stat-card"><div style="width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${c.color}18;border:1px solid ${c.color}33;flex-shrink:0;">${c.icon}</div><div><p style="font-size:20px;font-weight:700;color:#f0f0f8;line-height:1;">${c.value}</p><p style="font-size:11px;color:#6b7280;margin-top:2px;">${c.label}</p></div></div>`).join('');

  const sfb = v => v === s.histStatus ? 'active-p' : '';
  const mfb = v => v === s.histModel ? 'active-b' : '';

  const rowsHtml = rows.length === 0 ? `<div class="w-empty"><div style="width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);margin-bottom:12px;">${ICON.fileAudio(24,'#374151')}</div><p style="font-size:14px;color:#6b7280;">No conversions found</p><p style="font-size:12px;color:#374151;margin-top:4px;">Try adjusting your filters</p></div>`
    : rows.map(e => `
    <div class="w-table-row">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;padding-right:16px;">
        <div style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${e.status==='completed'?'rgba(139,92,246,0.12)':'rgba(239,68,68,0.1)'};border:1px solid ${e.status==='completed'?'rgba(139,92,246,0.2)':'rgba(239,68,68,0.2)'};">${ICON.fileAudio(13,e.status==='completed'?'#a78bfa':'#f87171')}</div>
        <span style="font-size:12px;color:#d1d5db;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e.fileName}">${e.fileName}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">${ICON.calendar(11,'#4b5563')}<span style="font-size:11px;color:#6b7280;">${e.date.split(' ')[0].replace('2026-','')}</span></div>
      <div style="display:flex;align-items:center;gap:6px;">${e.model==='TransKun'?ICON.cpu(11,'#818cf8'):ICON.activity(11,'#60a5fa')}<span style="font-size:11px;color:${e.model==='TransKun'?'#818cf8':'#60a5fa'};">${e.model==='TransKun'?'TransKun':'O&F'}</span></div>
      <div style="display:flex;align-items:center;gap:6px;">${ICON.clock(11,'#4b5563')}<span style="font-size:11px;color:#9ca3af;">${e.duration}</span></div>
      <div style="display:flex;align-items:center;gap:6px;">${ICON.music2(11,'#4b5563')}<span style="font-size:11px;color:${e.notes>0?'#9ca3af':'#4b5563'};">${e.notes>0?e.notes.toLocaleString():'—'}</span></div>
      <span style="font-size:11px;color:#6b7280;">${e.size}</span>
      <div class="w-row-actions">
        <div class="w-status-pill ${e.status==='completed'?'w-status-ok':'w-status-fail'}">${e.status==='completed'?ICON.checkCircle(9,'#10b981'):ICON.xCircle(9,'#ef4444')}<span>${e.status}</span></div>
        ${e.status==='completed'?`<button class="w-icon-btn w-icon-btn-dl" title="Download">${ICON.download(12,'#60a5fa')}</button>`:''}
        ${e.status==='failed'?`<button class="w-icon-btn w-icon-btn-retry" title="Retry">${ICON.refresh(12,'#fbbf24')}</button>`:''}
        <button class="w-icon-btn w-icon-btn-del" data-del="${e.id}" title="Delete">${ICON.trash(12,'#f87171')}</button>
      </div>
    </div>`).join('');

  content.innerHTML = `
    <div class="w-history">
      <div class="w-stats-grid">${statsHtml}</div>
      <div class="w-toolbar">
        <div class="w-search">${ICON.search(13,'#6b7280')}<input id="h-search" placeholder="Search files..." value="${s.histSearch}"></div>
        <div class="w-filter-group">
          ${['all','completed','failed'].map(v=>`<button class="w-filter-btn ${sfb(v)}" data-hs="${v}">${v==='all'?'All':v.charAt(0).toUpperCase()+v.slice(1)}</button>`).join('')}
        </div>
        <div class="w-filter-group">
          ${['all','TransKun','Onsets & Frames'].map(v=>`<button class="w-filter-btn ${mfb(v)}" data-hm="${v}">${v==='all'?'All Models':v}</button>`).join('')}
        </div>
        <div class="w-sort-wrap">
          <button class="w-sort-btn" id="sort-btn">${ICON.filter(12,'#6b7280')} Sort: ${s.histSort.charAt(0).toUpperCase()+s.histSort.slice(1)} ${ICON.chevronDown(11,'#6b7280')}</button>
          <div id="sort-dd" style="display:none;" class="w-sort-dropdown">
            ${['date','notes','duration'].map(v=>`<button class="w-sort-opt${s.histSort===v?' active':''}" data-sort="${v}">${v.charAt(0).toUpperCase()+v.slice(1)}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="w-table">
        <div class="w-table-head">${['File Name','Date','Model','Duration','Notes','Size',''].map(h=>`<span>${h.toUpperCase()}</span>`).join('')}</div>
        <div class="w-table-body">${rowsHtml}</div>
        <div class="w-table-foot">
          <span style="font-size:11px;color:#4b5563;">${rows.length} of ${total} entries</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="display:flex;align-items:center;gap:4px;"><div style="width:6px;height:6px;border-radius:50%;background:#10b981;"></div><span style="font-size:10px;color:#6b7280;">Completed</span></div>
            <span style="color:#374151;font-size:10px;">·</span>
            <div style="display:flex;align-items:center;gap:4px;"><div style="width:6px;height:6px;border-radius:50%;background:#ef4444;"></div><span style="font-size:10px;color:#6b7280;">Failed</span></div>
          </div>
        </div>
      </div>
    </div>`;

  content.querySelector('#h-search').addEventListener('input', e => { s.histSearch = e.target.value; renderHistory(content); });
  content.querySelectorAll('[data-hs]').forEach(b => b.addEventListener('click', () => { s.histStatus = b.dataset.hs; renderHistory(content); }));
  content.querySelectorAll('[data-hm]').forEach(b => b.addEventListener('click', () => { s.histModel = b.dataset.hm; renderHistory(content); }));
  content.querySelector('#sort-btn').addEventListener('click', e => { e.stopPropagation(); const dd = content.querySelector('#sort-dd'); if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none'; });
  content.querySelectorAll('[data-sort]').forEach(b => b.addEventListener('click', () => { s.histSort = b.dataset.sort; renderHistory(content); }));
  content.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { s.histDeleted.add(parseInt(b.dataset.del)); renderHistory(content); }));
  document.addEventListener('click', e => { const dd = content.querySelector('#sort-dd'); if (dd && !e.target.closest('#sort-btn')) dd.style.display = 'none'; }, { once: false });
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

function renderSettings(content) {
  destroyInstances();
  const s = state;

  const tgl = (id, val) => `<button class="w-toggle" data-tgl="${id}" style="background:${val?'linear-gradient(135deg,#3b82f6,#8b5cf6)':'rgba(255,255,255,0.1)'};border:${val?'none':'1px solid rgba(255,255,255,0.15)'};box-shadow:${val?'0 0 10px rgba(139,92,246,0.4)':'none'};"><div class="w-toggle-thumb" style="left:${val?'20px':'2px'};"></div></button>`;
  const sel = (id, val, opts) => `<select class="w-select" data-sel="${id}">${opts.map(o=>`<option${o===val?' selected':''}>${o}</option>`).join('')}</select>`;
  const vp = ((s.velocitySensitivity) / 127) * 100;

  content.innerHTML = `
    <div class="w-settings">
      <div class="w-settings-inner">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div><h1 style="font-size:20px;font-weight:700;color:#f0f0f8;line-height:1;">Settings</h1><p style="font-size:12px;color:#6b7280;margin-top:4px;">Configure audio, model, and export preferences</p></div>
          <div style="display:flex;gap:8px;">
            <button id="reset-btn" style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);cursor:pointer;font-size:12px;color:#9ca3af;">${ICON.rotateCcw(13,'#9ca3af')} Reset to defaults</button>
            <button id="save-btn" style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:12px;background:${s.settingsSaved?'rgba(16,185,129,0.2)':'linear-gradient(135deg,#3b82f6,#8b5cf6)'};border:${s.settingsSaved?'1px solid rgba(16,185,129,0.35)':'none'};cursor:pointer;font-size:12px;color:${s.settingsSaved?'#6ee7b7':'white'};font-weight:600;box-shadow:${s.settingsSaved?'none':'0 0 16px rgba(139,92,246,0.4)'};">${s.settingsSaved?ICON.checkCircle(13,'#6ee7b7'):ICON.sliders(13,'white')} ${s.settingsSaved?'Saved!':'Save Changes'}</button>
          </div>
        </div>

        <div class="w-section-card">
          <div class="w-section-title"><div class="w-section-icon">${ICON.mic(15,'#a78bfa')}</div><span style="font-size:13px;color:#e5e7eb;font-weight:600;">Audio Input</span></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Input Device</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Select your recording microphone or audio interface</p></div>${sel('inputDevice',s.inputDevice,['Default Microphone','Built-in Microphone','USB Audio Interface','Line In'])}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Sample Rate</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Higher rates capture more audio detail</p></div>${sel('sampleRate',s.sampleRate,['22050 Hz','44100 Hz','48000 Hz','96000 Hz'])}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Bit Depth</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Audio resolution per sample</p></div>${sel('bitDepth',s.bitDepth,['16-bit','24-bit','32-bit float'])}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Noise Reduction</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Automatically filter background noise</p></div>${tgl('noiseReduction',s.noiseReduction)}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Auto-trim Silence</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Remove leading and trailing silence</p></div>${tgl('silenceTrim',s.silenceTrim)}</div>
        </div>

        <div class="w-section-card">
          <div class="w-section-title"><div class="w-section-icon">${ICON.cpu(15,'#a78bfa')}</div><span style="font-size:13px;color:#e5e7eb;font-weight:600;">AI Model Preferences</span></div>
          <div class="w-setting-row">
            <div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Default Model</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Model used for new conversion sessions</p></div>
            <div style="display:flex;gap:8px;">
              <button class="w-model-pill" data-pill="TransKun" style="${s.defaultModel==='TransKun'?'background:rgba(139,92,246,0.18);border-color:rgba(139,92,246,0.4);color:#c4b5fd;':''}">${ICON.cpu(13,s.defaultModel==='TransKun'?'#a78bfa':'#6b7280')} TransKun ${s.defaultModel==='TransKun'?ICON.checkCircle(11,'#a78bfa'):''}</button>
              <button class="w-model-pill" data-pill="Onsets & Frames" style="${s.defaultModel==='Onsets & Frames'?'background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.35);color:#93c5fd;':''}">${ICON.activity(13,s.defaultModel==='Onsets & Frames'?'#60a5fa':'#6b7280')} Onsets & Frames ${s.defaultModel==='Onsets & Frames'?ICON.checkCircle(11,'#60a5fa'):''}</button>
            </div>
          </div>
          <div class="w-divider"></div>
          <div class="w-setting-row">
            <div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Processing Quality</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Higher quality increases accuracy but takes longer</p></div>
            <div style="display:flex;gap:4px;padding:4px;border-radius:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);">
              ${['Standard','High','Ultra'].map(q=>`<button class="w-quality-tab${s.processingQuality===q?' active':''}" data-q="${q}">${q}</button>`).join('')}
            </div>
          </div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Auto-convert on Upload</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Start conversion immediately after file upload</p></div>${tgl('autoConvert',s.autoConvert)}</div>
        </div>

        <div class="w-section-card">
          <div class="w-section-title"><div class="w-section-icon">${ICON.music2(15,'#a78bfa')}</div><span style="font-size:13px;color:#e5e7eb;font-weight:600;">MIDI Export</span></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Default Format</p></div>${sel('defaultFormat',s.defaultFormat,['MIDI Type 0','MIDI Type 1','MIDI Type 2'])}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row">
            <div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Velocity Sensitivity</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">How strongly note dynamics are mapped to MIDI velocity</p></div>
            <div style="display:flex;align-items:center;gap:12px;">
              <input type="range" class="w-slider" data-sl="velocitySensitivity" min="0" max="127" step="1" value="${s.velocitySensitivity}" style="background:linear-gradient(to right,#8b5cf6 ${vp}%,rgba(255,255,255,0.1) ${vp}%);">
              <span id="vel-disp" style="font-size:12px;color:#a78bfa;min-width:40px;text-align:right;">${s.velocitySensitivity}</span>
            </div>
          </div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Quantization</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Snap notes to the nearest beat subdivision</p></div>${sel('quantization',s.quantization,['Off','1/32','1/16','1/8','1/4'])}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Include Sustain Pedal</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Detect and export sustain pedal events (CC64)</p></div>${tgl('includeSustain',s.includeSustain)}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Automatic Tempo Detection</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Analyse audio to estimate BPM and set MIDI tempo</p></div>${tgl('tempoDetection',s.tempoDetection)}</div>
        </div>

        <div class="w-section-card">
          <div class="w-section-title"><div class="w-section-icon">${ICON.sliders(15,'#a78bfa')}</div><span style="font-size:13px;color:#e5e7eb;font-weight:600;">App Preferences</span></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Auto-save Conversions</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Automatically save completed MIDI files to history</p></div>${tgl('autoSave',s.autoSave)}</div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Conversion Notifications</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Get notified when processing is complete</p></div><div style="display:flex;align-items:center;gap:8px;">${ICON.bell(13,s.notificationsOn?'#a78bfa':'#4b5563')}${tgl('notificationsOn',s.notificationsOn)}</div></div>
          <div class="w-divider"></div>
          <div class="w-setting-row"><div><p style="font-size:12px;color:#d1d5db;font-weight:500;">Storage Limit</p><p style="font-size:11px;color:#4b5563;margin-top:2px;">Maximum space allocated for conversion history</p></div>${sel('storageLimit',s.storageLimit,['1 GB','2 GB','5 GB','10 GB','Unlimited'])}</div>
        </div>

        <div class="w-section-card" style="background:rgba(255,255,255,0.015);">
          <div style="display:flex;align-items:start;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b82f6,#8b5cf6);box-shadow:0 0 20px rgba(139,92,246,0.35);">${ICON.waves(20,'white')}</div>
              <div><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:16px;font-weight:700;color:#f0f0f8;">WidiAI</span><span class="w-beta">BETA</span></div><p style="font-size:11px;color:#6b7280;">Wave MIDI AI · Version 0.9.2</p></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;text-align:right;">
              ${[['gauge','TransKun v2.1'],['activity','Onsets & Frames v1.14'],['hardDrive','Storage: 1.2 GB / 5 GB'],['shield','All processing is local']].map(([ic,tx])=>`<div style="display:flex;align-items:center;justify-content:flex-end;gap:6px;"><span style="color:#4b5563;">${ICON[ic](11,'#4b5563')}</span><span style="font-size:11px;color:#4b5563;">${tx}</span></div>`).join('')}
            </div>
          </div>
          <div class="w-divider"></div>
          <div style="display:flex;align-items:center;gap:8px;">${ICON.info(12,'#4b5563')}<p style="font-size:11px;color:#4b5563;">WidiAI uses state-of-the-art transformer and frame-based models to convert piano audio to MIDI. All audio processing is performed locally — no audio data leaves your device.</p></div>
        </div>
      </div>
    </div>`;

  // Bind all settings events
  content.querySelectorAll('[data-tgl]').forEach(btn => btn.addEventListener('click', () => { s[btn.dataset.tgl] = !s[btn.dataset.tgl]; renderSettings(content); }));
  content.querySelectorAll('[data-sel]').forEach(sel => sel.addEventListener('change', () => { s[sel.dataset.sel] = sel.value; }));
  content.querySelectorAll('[data-pill]').forEach(btn => btn.addEventListener('click', () => { s.defaultModel = btn.dataset.pill; renderSettings(content); }));
  content.querySelectorAll('[data-q]').forEach(btn => btn.addEventListener('click', () => { s.processingQuality = btn.dataset.q; renderSettings(content); }));
  content.querySelector('[data-sl]')?.addEventListener('input', e => {
    s.velocitySensitivity = parseInt(e.target.value);
    const disp = content.querySelector('#vel-disp'); if (disp) disp.textContent = s.velocitySensitivity;
    const p = (s.velocitySensitivity / 127) * 100;
    e.target.style.background = `linear-gradient(to right,#8b5cf6 ${p}%,rgba(255,255,255,0.1) ${p}%)`;
  });
  content.querySelector('#save-btn').addEventListener('click', () => { s.settingsSaved = true; renderSettings(content); setTimeout(() => { s.settingsSaved = false; renderSettings(content); }, 2500); });
  content.querySelector('#reset-btn').addEventListener('click', () => {
    Object.assign(s, { inputDevice: 'Default Microphone', sampleRate: '44100 Hz', bitDepth: '24-bit', noiseReduction: true, silenceTrim: true, defaultModel: 'TransKun', processingQuality: 'High', autoConvert: false, velocitySensitivity: 80, quantization: '1/16', includeSustain: true, defaultFormat: 'MIDI Type 1', tempoDetection: true, autoSave: true, notificationsOn: true, storageLimit: '5 GB' });
    renderSettings(content);
  });
}

// ═══════════════════════════════════════════════════════════════════
// ROUTER + LAYOUT + INIT
// ═══════════════════════════════════════════════════════════════════

function renderPage(content) {
  if (state.page === 'dashboard') renderDashboard(content);
  else if (state.page === 'history') renderHistory(content);
  else if (state.page === 'settings') renderSettings(content);
}

export function init(container) {
  injectCSS(container);
  container.className = 'widi-app';
  bindAudioUnlock();

  // Background glow orbs
  const orbLayer = document.createElement('div');
  orbLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0;';
  [['15%','30%','#3b82f6'], ['80%','20%','#8b5cf6'], ['50%','80%','#6366f1']].forEach(([x,y,c]) => {
    const o = document.createElement('div');
    o.className = 'w-orb';
    o.style.cssText += `left:${x};top:${y};background:radial-gradient(circle,${c} 0%,transparent 70%);`;
    orbLayer.appendChild(o);
  });
  container.appendChild(orbLayer);

  // Header
  const header = document.createElement('header');
  header.className = 'w-header';
  header.innerHTML = `
    <div class="w-logo">
      <div class="w-logo-icon">${ICON.waves(18,'white')}</div>
      <div>
        <div style="display:flex;align-items:center;gap:8px;line-height:1;">
          <span class="w-logo-name">WidiAI</span>
          <span class="w-beta">BETA</span>
        </div>
        <p class="w-logo-sub">Wave MIDI AI</p>
      </div>
    </div>
    <nav class="w-nav">
      <button class="w-nav-btn active" data-nav="dashboard">Dashboard</button>
      <button class="w-nav-btn" data-nav="history">History</button>
      <button class="w-nav-btn" data-nav="settings">Settings</button>
    </nav>`;
  header.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = btn.dataset.nav;
      header.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === state.page));
      renderPage(content);
    });
  });
  container.appendChild(header);

  // Content
  const wrap = document.createElement('div');
  wrap.className = 'w-content';
  const content = document.createElement('div');
  content.id = 'w-content';
  content.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;';
  wrap.appendChild(content);
  container.appendChild(wrap);

  renderPage(content);

  // Cleanup on unmount
  return () => {
    destroyInstances();
    if (_recTimer) clearTimeout(_recTimer);
    if (_progressTimer) clearInterval(_progressTimer);
    if (_audioUrlRef) URL.revokeObjectURL(_audioUrlRef);
    if (state.midiUrl) URL.revokeObjectURL(state.midiUrl);
  };
}
