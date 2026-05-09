import { useEffect, useRef, useCallback } from "react";

export interface MidiNote {
  note: number;
  startTime: number;
  duration: number;
  velocity: number;
}

interface PianoRollProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
}

const MIDI_MIN = 21;
const MIDI_MAX = 108;
const BLACK_SEMITONES = new Set([1, 3, 6, 8, 10]);
const KEY_H = 130;
const BK_RATIO = 0.62;

const isBlack = (midi: number) => BLACK_SEMITONES.has(midi % 12);

const lerpColor = (
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): string => {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const getNoteColor = (midi: number): string => {
  const t = (midi - MIDI_MIN) / (MIDI_MAX - MIDI_MIN);
  const blue: [number, number, number] = [59, 130, 246];
  const purple: [number, number, number] = [139, 92, 246];
  const pink: [number, number, number] = [236, 72, 153];
  if (t < 0.5) return lerpColor(blue, purple, t * 2);
  return lerpColor(purple, pink, (t - 0.5) * 2);
};

type KeyLayout = {
  midi: number;
  x: number;
  w: number;
  isBlack: boolean;
};

const buildKeyLayout = (totalW: number): KeyLayout[] => {
  const keys: KeyLayout[] = [];
  const wkw = totalW / 52;
  const bkw = wkw * 0.62;
  let wki = 0;
  for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
    if (!isBlack(midi)) {
      keys.push({ midi, x: wki * wkw, w: wkw, isBlack: false });
      wki++;
    } else {
      const prevX = (wki - 1) * wkw;
      keys.push({ midi, x: prevX + wkw - bkw / 2, w: bkw, isBlack: true });
    }
  }
  return keys;
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
};

/** Hit-test a CSS-pixel coordinate against the key layout. Black keys win. */
const hitTestKey = (
  cx: number,
  cy: number,
  keys: KeyLayout[],
  canvasH: number
): KeyLayout | null => {
  const ROLL_H = canvasH - KEY_H;
  if (cy < ROLL_H) return null;
  const relY = cy - ROLL_H;
  const bkh = KEY_H * BK_RATIO;
  // Black keys first (rendered on top)
  if (relY <= bkh) {
    for (const key of keys) {
      if (key.isBlack && cx >= key.x && cx <= key.x + key.w) return key;
    }
  }
  // White keys
  for (const key of keys) {
    if (!key.isBlack && cx >= key.x && cx <= key.x + key.w) return key;
  }
  return null;
};

// ─── Web Audio helpers ─────────────────────────────────────────────────────────

const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// Harmonics: [partial ratio, relative amplitude]
const HARMONICS: [number, number][] = [
  [1, 1.0],
  [2, 0.45],
  [3, 0.2],
  [4, 0.08],
  [5, 0.04],
  [6, 0.02],
];

export const PianoRoll = ({
  notes,
  currentTime,
  isPlaying,
  totalDuration,
}: PianoRollProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const internalTimeRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const currentTimeRef = useRef(currentTime);

  // Keyboard interaction
  const keysLayoutRef = useRef<KeyLayout[]>([]);
  const canvasHRef = useRef<number>(350);
  const pressedKeysRef = useRef<Set<number>>(new Set());

  // Web Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeGainsRef = useRef<Map<number, GainNode>>(new Map());

  const getAudioCtx = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopNote = useCallback((midi: number) => {
    const master = activeGainsRef.current.get(midi);
    if (!master) return;
    const ac = audioCtxRef.current;
    if (ac) {
      const now = ac.currentTime;
      try {
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      } catch (_) { /* ignore */ }
    }
    activeGainsRef.current.delete(midi);
  }, []);

  const playNote = useCallback((midi: number) => {
    stopNote(midi); // cut any ringing instance
    const ac = getAudioCtx();
    const freq = midiToFreq(midi);
    const now = ac.currentTime;

    // Velocity-sensitive master gain (fake it slightly louder for higher notes)
    const baseGain = 0.18 + (midi - MIDI_MIN) / (MIDI_MAX - MIDI_MIN) * 0.08;
    const master = ac.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(baseGain, now + 0.006);
    master.connect(ac.destination);

    // Soft low-pass to warm up the tone
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = Math.min(8000, freq * 8);
    lp.Q.value = 0.3;
    lp.connect(master);

    const decayTime = 1.8 + (midi - MIDI_MIN) / (MIDI_MAX - MIDI_MIN) * 1.2;

    HARMONICS.forEach(([ratio, amp]) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * ratio;
      // Each harmonic decays at a different rate (higher harmonics faster)
      const hDecay = decayTime / (ratio * 0.7);
      g.gain.setValueAtTime(amp, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + hDecay);
      osc.connect(g);
      g.connect(lp);
      osc.start(now);
      osc.stop(now + hDecay + 0.05);
    });

    activeGainsRef.current.set(midi, master);
  }, [stopNote]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
    if (!isPlaying) {
      internalTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      W: number,
      H: number,
      time: number,
      keys: KeyLayout[]
    ) => {
      const ROLL_H = H - KEY_H;
      const VISIBLE_TIME = 3.5;
      const PPS = ROLL_H / VISIBLE_TIME;
      const keyMap = new Map(keys.map((k) => [k.midi, k]));

      // Active notes from playback
      const activeNotes = new Set<number>();
      notes.forEach((n) => {
        if (time >= n.startTime && time < n.startTime + n.duration) {
          activeNotes.add(n.note);
        }
      });
      // Merge in manually pressed keys
      pressedKeysRef.current.forEach((m) => activeNotes.add(m));

      // Background
      ctx.fillStyle = "#08080f";
      ctx.fillRect(0, 0, W, H);

      // Black key column shading
      keys.forEach((key) => {
        if (key.isBlack) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(key.x, 0, key.w, ROLL_H);
        }
      });

      // C note markers
      for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
        if (midi % 12 === 0) {
          const key = keyMap.get(midi);
          if (key) {
            ctx.fillStyle = "rgba(139,92,246,0.06)";
            ctx.fillRect(key.x, 0, key.w, ROLL_H);
          }
        }
      }

      // Horizontal time grid
      const beat = 0.5;
      for (let t = 0; t <= VISIBLE_TIME; t += beat) {
        const y = ROLL_H - t * PPS;
        const isBar = Math.round(t / (beat * 4)) * beat * 4 === t;
        ctx.strokeStyle = isBar ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)";
        ctx.lineWidth = isBar ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Vertical key dividers (white keys only)
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      keys
        .filter((k) => !k.isBlack)
        .forEach((key) => {
          ctx.beginPath();
          ctx.moveTo(key.x, 0);
          ctx.lineTo(key.x, ROLL_H);
          ctx.stroke();
        });

      // Draw falling notes
      notes.forEach((n) => {
        const key = keyMap.get(n.note);
        if (!key) return;

        const noteBottom = ROLL_H - (n.startTime - time) * PPS;
        const noteTop = noteBottom - n.duration * PPS;

        if (noteBottom < 0 || noteTop > ROLL_H) return;

        const color = getNoteColor(n.note);
        const x = key.x + 1;
        const w = key.w - 2;
        const y = Math.max(0, noteTop);
        const h = Math.min(noteBottom, ROLL_H) - y;

        if (h <= 0) return;

        const velAlpha = 0.7 + (n.velocity / 127) * 0.3;

        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        ctx.fillStyle = color;
        ctx.globalAlpha = velAlpha;

        drawRoundRect(ctx, x, y, w, h, 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Bright top edge
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(x, y, w, 2);
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Separator glow line
      const sepGrad = ctx.createLinearGradient(0, ROLL_H - 1, W, ROLL_H - 1);
      sepGrad.addColorStop(0, "rgba(59,130,246,0.15)");
      sepGrad.addColorStop(0.3, "rgba(139,92,246,0.6)");
      sepGrad.addColorStop(0.7, "rgba(139,92,246,0.6)");
      sepGrad.addColorStop(1, "rgba(59,130,246,0.15)");
      ctx.strokeStyle = sepGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, ROLL_H);
      ctx.lineTo(W, ROLL_H);
      ctx.stroke();

      // White keys
      keys
        .filter((k) => !k.isBlack)
        .forEach((key) => {
          const active = activeNotes.has(key.midi);
          const y = ROLL_H;

          if (active) {
            ctx.shadowColor = getNoteColor(key.midi);
            ctx.shadowBlur = 18;
            const grad = ctx.createLinearGradient(key.x, y, key.x, y + KEY_H);
            grad.addColorStop(0, "#c4b5fd");
            grad.addColorStop(0.35, "#818cf8");
            grad.addColorStop(1, "#3b82f6");
            ctx.fillStyle = grad;
          } else {
            const grad = ctx.createLinearGradient(key.x, y, key.x, y + KEY_H);
            grad.addColorStop(0, "#e2e2ea");
            grad.addColorStop(1, "#c8c8d8");
            ctx.fillStyle = grad;
          }

          drawRoundRect(ctx, key.x + 0.5, y + 1, key.w - 1.5, KEY_H - 2, 3);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.strokeStyle = "#1a1a2e";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Key label (C notes)
          if (key.midi % 12 === 0 && !active) {
            const octave = Math.floor(key.midi / 12) - 1;
            ctx.fillStyle = "rgba(80,80,100,0.7)";
            ctx.font = "8px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`C${octave}`, key.x + key.w / 2, y + KEY_H - 8);
          }
        });

      // Black keys on top
      keys
        .filter((k) => k.isBlack)
        .forEach((key) => {
          const active = activeNotes.has(key.midi);
          const y = ROLL_H;
          const bkh = KEY_H * BK_RATIO;

          if (active) {
            ctx.shadowColor = getNoteColor(key.midi);
            ctx.shadowBlur = 14;
            const grad = ctx.createLinearGradient(key.x, y, key.x, y + bkh);
            grad.addColorStop(0, "#7c3aed");
            grad.addColorStop(1, "#1d4ed8");
            ctx.fillStyle = grad;
          } else {
            const grad = ctx.createLinearGradient(key.x, y, key.x, y + bkh);
            grad.addColorStop(0, "#1e1e30");
            grad.addColorStop(0.6, "#111118");
            grad.addColorStop(1, "#0a0a12");
            ctx.fillStyle = grad;
          }

          drawRoundRect(ctx, key.x, y + 1, key.w, bkh - 1, 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
    },
    [notes]
  );

  // ── Canvas setup + animation loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const setup = () => {
      cancelAnimationFrame(animRef.current);
      lastTimestampRef.current = null;

      const dpr = window.devicePixelRatio || 1;
      const W = container.clientWidth || 800;
      const H = container.clientHeight || 350;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const keys = buildKeyLayout(W);
      keysLayoutRef.current = keys;
      canvasHRef.current = H;

      const animate = (timestamp: number) => {
        if (lastTimestampRef.current !== null) {
          const delta = (timestamp - lastTimestampRef.current) / 1000;
          if (isPlayingRef.current) {
            internalTimeRef.current = currentTimeRef.current;
          } else {
            internalTimeRef.current =
              (internalTimeRef.current + delta * 0.22) % (totalDuration || 48);
          }
        }
        lastTimestampRef.current = timestamp;
        drawFrame(ctx, W, H, internalTimeRef.current, keys);
        animRef.current = requestAnimationFrame(animate);
      };

      animRef.current = requestAnimationFrame(animate);
    };

    setup();

    const ro = new ResizeObserver(() => setup());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [drawFrame, totalDuration]);

  // ── Mouse / Touch interaction ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasXY = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const pressKey = (midi: number) => {
      if (pressedKeysRef.current.has(midi)) return;
      pressedKeysRef.current.add(midi);
      playNote(midi);
    };

    const releaseKey = (midi: number) => {
      pressedKeysRef.current.delete(midi);
      stopNote(midi);
    };

    const releaseAll = () => {
      pressedKeysRef.current.forEach((m) => stopNote(m));
      pressedKeysRef.current.clear();
    };

    // ── Mouse ──
    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = getCanvasXY(e.clientX, e.clientY);
      const key = hitTestKey(x, y, keysLayoutRef.current, canvasHRef.current);
      if (key) pressKey(key.midi);
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getCanvasXY(e.clientX, e.clientY);
      const inKeyboard = y >= canvasHRef.current - KEY_H;
      canvas.style.cursor = inKeyboard ? "pointer" : "default";

      if (e.buttons !== 1) return; // only while dragging
      const key = hitTestKey(x, y, keysLayoutRef.current, canvasHRef.current);
      if (!key) return;
      // Slide to new key
      if (!pressedKeysRef.current.has(key.midi)) {
        releaseAll();
        pressKey(key.midi);
      }
    };

    const onMouseUp = () => releaseAll();
    const onMouseLeave = () => releaseAll();

    // ── Touch ──
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      releaseAll();
      Array.from(e.touches).forEach((t) => {
        const { x, y } = getCanvasXY(t.clientX, t.clientY);
        const key = hitTestKey(x, y, keysLayoutRef.current, canvasHRef.current);
        if (key) pressKey(key.midi);
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      releaseAll();
      Array.from(e.touches).forEach((t) => {
        const { x, y } = getCanvasXY(t.clientX, t.clientY);
        const key = hitTestKey(x, y, keysLayoutRef.current, canvasHRef.current);
        if (key) pressKey(key.midi);
      });
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      // Release keys no longer touched
      const stillActive = new Set<number>();
      Array.from(e.touches).forEach((t) => {
        const { x, y } = getCanvasXY(t.clientX, t.clientY);
        const key = hitTestKey(x, y, keysLayoutRef.current, canvasHRef.current);
        if (key) stillActive.add(key.midi);
      });
      pressedKeysRef.current.forEach((m) => {
        if (!stillActive.has(m)) releaseKey(m);
      });
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [playNote, stopNote]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};