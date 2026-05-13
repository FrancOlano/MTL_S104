import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Upload,
  Play,
  Pause,
  Square,
  Download,
  Zap,
  Activity,
  ChevronDown,
  Music2,
  CheckCircle2,
  Clock,
  Cpu,
} from "lucide-react";
import { WaveformDisplay } from "../components/WaveformDisplay";
import { PianoRoll } from "../components/PianoRoll";
import { AudioPlayer } from "../components/AudioPlayer";
import type { MidiNote } from "../components/PianoRoll";

// ─── Mock data ────────────────────────────────────────────────────────────────

const generateFakeWaveform = (): number[] => {
  let s = 42;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
  return Array.from({ length: 220 }, (_, i) => {
    const t = i / 220;
    const v = Math.abs(
      Math.sin(t * Math.PI * 14) * 0.38 +
        Math.sin(t * Math.PI * 37) * 0.28 +
        Math.sin(t * Math.PI * 89) * 0.18 +
        (rand() - 0.5) * 0.16
    );
    return Math.min(1, Math.max(0.04, v));
  });
};

const generateMockMidi = (): MidiNote[] => {
  const notes: MidiNote[] = [];
  const beat = 0.5;
  const chords = [
    { bass: 50, inner: [62, 65, 69], melody: [74, 72, 69, 72, 74, 74, 72, 69] },
    { bass: 45, inner: [60, 64, 69], melody: [72, 72, 72, 74, 72, 69, 67, 69] },
    { bass: 46, inner: [58, 62, 65], melody: [69, 72, 74, 76, 74, 72, 69, 72] },
    { bass: 53, inner: [60, 65, 69], melody: [74, 72, 69, 67, 65, 67, 69, 72] },
  ];
  const REPEATS = 3;
  let s = 1;
  const r = () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
  for (let rep = 0; rep < REPEATS; rep++) {
    chords.forEach((chord, ci) => {
      const phraseStart = (rep * chords.length + ci) * beat * 8;
      notes.push({ note: chord.bass, startTime: phraseStart, duration: beat * 7.8, velocity: 72 });
      [0, 4].forEach((beatOffset) => {
        chord.inner.forEach((n, i) => {
          notes.push({
            note: n,
            startTime: phraseStart + beatOffset * beat + i * 0.045,
            duration: beat * 1.6,
            velocity: 58 + Math.floor(r() * 10),
          });
        });
      });
      chord.melody.forEach((n, i) => {
        if (n === 0) return;
        notes.push({
          note: n,
          startTime: phraseStart + i * beat,
          duration: beat * 0.82,
          velocity: 78 + Math.floor(r() * 18),
        });
      });
    });
  }
  return notes;
};

// ─── Types ─────────────────────────────────────────────────────────────────────
type Stage = "idle" | "loaded" | "processing" | "ready";
type Model = "transkun" | "onsets";
const TOTAL_DURATION = 48;

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [stage, setStage] = useState<Stage>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("transkun");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const startTimestampRef = useRef<number>(0);
  const startPlaybackRef = useRef<number>(0);
  const recTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);

  const waveformData = useMemo(() => generateFakeWaveform(), []);
  const midiNotes = useMemo(() => generateMockMidi(), []);

  const tick = useCallback(
    (timestamp: number) => {
      if (!isPlayingRef.current) return;
      const elapsed = (timestamp - startTimestampRef.current) / 1000;
      const newTime = startPlaybackRef.current + elapsed;
      if (newTime >= TOTAL_DURATION) {
        setIsPlaying(false);
        setCurrentTime(0);
        isPlayingRef.current = false;
        return;
      }
      setCurrentTime(newTime);
      rafRef.current = requestAnimationFrame(tick);
    },
    []
  );

  const handlePlay = useCallback(() => {
    if (stage !== "ready") return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    startTimestampRef.current = performance.now();
    startPlaybackRef.current = currentTime;
    rafRef.current = requestAnimationFrame(tick);
  }, [stage, currentTime, tick]);

  const handlePause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const handleStop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (isPlaying) {
      startTimestampRef.current = performance.now();
      startPlaybackRef.current = t;
    }
  };

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recTimerRef.current) clearTimeout(recTimerRef.current);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        audioChunksRef.current = [];

        mr.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mr.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          // Revoke previous URL
          if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;
          setAudioUrl(url);
          setFileName("recording.wav");
          setStage("loaded");
        };

        mr.start();
        setIsRecording(true);
        setStage("idle");
      } catch (_) {
        // Permission denied — fall back to simulated behaviour (no real audio)
        setIsRecording(true);
        setStage("idle");
        recTimerRef.current = setTimeout(() => {
          setIsRecording(false);
          setStage("loaded");
          setFileName("piano_recording.wav");
        }, 7000);
      }
    }
  }, [isRecording]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsRecording(false);
    if (recTimerRef.current) clearTimeout(recTimerRef.current);
    // Stop any active recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    // Revoke old URL
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const url = URL.createObjectURL(file);
    audioUrlRef.current = url;
    setAudioUrl(url);
    setStage("loaded");
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleConvert = useCallback(() => {
    if (stage !== "loaded") return;
    setStage("processing");
    setProgress(0);
    let p = 0;
    progressTimerRef.current = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) {
        p = 100;
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setTimeout(() => {
          setStage("ready");
          setProgress(0);
          setCurrentTime(0);
        }, 400);
      }
      setProgress(Math.min(100, p));
    }, 120);
  }, [stage]);

  const handleDownload = () => {
    const blob = new Blob(["MIDI placeholder"], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "widi_output.mid";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (recTimerRef.current) clearTimeout(recTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  const modelInfo = {
    transkun: {
      label: "TransKun",
      badge: "Recommended",
      badgeColor: "#10b981",
      desc: "Transformer-based model. High accuracy for complex passages.",
      icon: <Cpu size={14} />,
      accuracy: "97%",
    },
    onsets: {
      label: "Onsets & Frames",
      badge: "",
      badgeColor: "",
      desc: "Google Magenta model. Optimal for clean recordings.",
      icon: <Activity size={14} />,
      accuracy: "94%",
    },
  };

  const activeModel = modelInfo[selectedModel];

  return (
    <main className="flex flex-col flex-1 px-5 pt-4 pb-0 gap-3 overflow-hidden">
      {/* Top 3-column grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* ── AUDIO INPUT ─────────────────────────── */}
        <Panel label="Audio Input" icon={<Mic size={13} />}>
          <div className="flex items-center gap-3 mb-3">
            <motion.button
              onClick={handleRecord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 60, height: 60,
                background: isRecording
                  ? "radial-gradient(circle, #ef4444, #b91c1c)"
                  : "rgba(239,68,68,0.12)",
                border: isRecording
                  ? "2px solid #ef4444"
                  : "2px solid rgba(239,68,68,0.4)",
                boxShadow: isRecording
                  ? "0 0 25px rgba(239,68,68,0.8), 0 0 50px rgba(239,68,68,0.3)"
                  : "0 0 10px rgba(239,68,68,0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {isRecording ? <MicOff size={22} color="white" /> : <Mic size={22} color="#ef4444" />}
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "2px solid rgba(239,68,68,0.6)" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </motion.button>

            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 11, color: isRecording ? "#ef4444" : "#6b7280", marginBottom: 4 }}>
                {isRecording ? "● Recording..." : "Record piano audio"}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#93c5fd",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)";
                }}
              >
                <Upload size={12} />
                <span>Upload .wav / .mp4</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.mp3,.mp4,.ogg,.flac,.aiff"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </div>

          <AnimatePresence>
            {fileName && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 mb-3"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <CheckCircle2 size={11} color="#10b981" />
                <span style={{ fontSize: 11, color: "#6ee7b7" }} className="truncate">
                  {fileName}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="w-full rounded-lg overflow-hidden"
            style={{ height: 72, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <WaveformDisplay
              data={stage !== "idle" ? waveformData : []}
              currentTime={currentTime}
              duration={TOTAL_DURATION}
              isRecording={isRecording}
            />
          </div>

          {/* ── Audio Player ── */}
          {audioUrl && fileName && (
            <AudioPlayer audioUrl={audioUrl} fileName={fileName} />
          )}
        </Panel>

        {/* ── AI MODEL ─────────────────────────────── */}
        <Panel label="AI Model" icon={<Cpu size={13} />}>
          <div className="relative mb-3">
            <button
              onClick={() => setModelOpen((v) => !v)}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.3)",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 30, height: 30, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                >
                  {activeModel.icon}
                </div>
                <div className="text-left">
                  <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{activeModel.label}</p>
                  <p style={{ fontSize: 10, color: "#6b7280" }}>{activeModel.desc.split(".")[0]}</p>
                </div>
              </div>
              <motion.div animate={{ rotate: modelOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={15} color="#6b7280" />
              </motion.div>
            </button>

            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -6, scaleY: 0.9 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0, right: 0, zIndex: 50,
                    background: "rgba(12,12,22,0.97)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: 12,
                    backdropFilter: "blur(20px)",
                    overflow: "hidden",
                    transformOrigin: "top",
                  }}
                >
                  {(["transkun", "onsets"] as Model[]).map((m) => {
                    const info = modelInfo[m];
                    const active = selectedModel === m;
                    return (
                      <button
                        key={m}
                        onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                        style={{
                          background: active ? "rgba(139,92,246,0.15)" : "transparent",
                          borderBottom: m === "transkun" ? "1px solid rgba(255,255,255,0.05)" : "none",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          className="flex items-center justify-center rounded-lg shrink-0"
                          style={{
                            width: 28, height: 28,
                            background: active ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : "rgba(255,255,255,0.06)",
                          }}
                        >
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>{info.label}</span>
                            {info.badge && (
                              <span
                                className="rounded px-1.5"
                                style={{
                                  fontSize: 9, fontWeight: 600,
                                  color: info.badgeColor,
                                  background: `${info.badgeColor}22`,
                                  border: `1px solid ${info.badgeColor}44`,
                                }}
                              >
                                {info.badge}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 10, color: "#6b7280" }}>{info.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accuracy stat */}
          <div className="grid grid-cols-1 gap-2 mb-3">
            <div
              className="rounded-lg p-2.5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{activeModel.accuracy}</p>
              <p style={{ fontSize: 10, color: "#6b7280" }}>Accuracy</p>
            </div>
          </div>

          {/* Convert Button */}
          <motion.button
            onClick={handleConvert}
            disabled={stage !== "loaded"}
            whileHover={stage === "loaded" ? { scale: 1.02 } : {}}
            whileTap={stage === "loaded" ? { scale: 0.97 } : {}}
            className="w-full rounded-xl py-3 flex items-center justify-center gap-2"
            style={{
              background: stage === "loaded" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.04)",
              border: stage === "loaded" ? "none" : "1px solid rgba(255,255,255,0.08)",
              cursor: stage === "loaded" ? "pointer" : "not-allowed",
              opacity: stage === "loaded" ? 1 : 0.45,
              boxShadow: stage === "loaded" ? "0 0 25px rgba(139,92,246,0.45)" : "none",
              transition: "all 0.3s",
            }}
          >
            <Zap size={14} color="white" />
            <span style={{ fontSize: 13, color: "white", fontWeight: 600 }}>Convert to MIDI</span>
          </motion.button>

          <AnimatePresence>
            {stage === "processing" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: 11, color: "#a78bfa" }}>Processing with {activeModel.label}…</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{Math.round(progress)}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.07)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                      boxShadow: "0 0 8px rgba(139,92,246,0.7)",
                      width: `${progress}%`,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {["Onset detection", "Frame analysis", "MIDI mapping"].map((s, i) => (
                    <div
                      key={s}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5"
                      style={{
                        background: progress > (i + 1) * 30 ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${progress > (i + 1) * 30 ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{ width: 5, height: 5, background: progress > (i + 1) * 30 ? "#10b981" : "#374151" }}
                      />
                      <span style={{ fontSize: 9, color: progress > (i + 1) * 30 ? "#6ee7b7" : "#4b5563" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stage === "ready" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-3 rounded-lg px-3 py-2"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <CheckCircle2 size={13} color="#10b981" />
                <span style={{ fontSize: 11, color: "#6ee7b7" }}>MIDI conversion complete!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>

        {/* ── MIDI PLAYER ──────────────────────────── */}
        <Panel label="MIDI Player" icon={<Music2 size={13} />}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <ControlBtn onClick={handleStop} disabled={stage !== "ready"} title="Stop">
              <Square size={14} />
            </ControlBtn>
            <motion.button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={stage !== "ready"}
              whileHover={stage === "ready" ? { scale: 1.08 } : {}}
              whileTap={stage === "ready" ? { scale: 0.93 } : {}}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 52, height: 52,
                background: stage === "ready" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.05)",
                border: "none",
                cursor: stage === "ready" ? "pointer" : "not-allowed",
                opacity: stage === "ready" ? 1 : 0.35,
                boxShadow: stage === "ready" ? `0 0 ${isPlaying ? 30 : 15}px rgba(139,92,246,${isPlaying ? 0.7 : 0.4})` : "none",
                transition: "all 0.3s",
              }}
            >
              {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" style={{ marginLeft: 2 }} />}
            </motion.button>
            <ControlBtn onClick={handleDownload} disabled={stage !== "ready"} title="Download MIDI" accent>
              <Download size={14} />
            </ControlBtn>
          </div>

          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={TOTAL_DURATION}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              disabled={stage !== "ready"}
              className="w-full"
              style={{
                appearance: "none",
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(to right, #8b5cf6 ${(currentTime / TOTAL_DURATION) * 100}%, rgba(255,255,255,0.1) ${(currentTime / TOTAL_DURATION) * 100}%)`,
                cursor: stage === "ready" ? "pointer" : "default",
                outline: "none",
              }}
            />
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 10, color: "#6b7280" }}>{fmtTime(currentTime)}</span>
              <span style={{ fontSize: 10, color: "#6b7280" }}>{fmtTime(TOTAL_DURATION)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Music2 size={11} />, label: "Notes", value: stage === "ready" ? `${midiNotes.length}` : "—" },
              { icon: <Clock size={11} />, label: "Duration", value: stage === "ready" ? "0:48" : "—" },
              { icon: <Activity size={11} />, label: "Tempo", value: stage === "ready" ? "120 BPM" : "—" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg p-2 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex justify-center mb-0.5" style={{ color: "#6b7280" }}>{item.icon}</div>
                <p style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>{item.value}</p>
                <p style={{ fontSize: 9, color: "#4b5563" }}>{item.label}</p>
              </div>
            ))}
          </div>

          <motion.button
            onClick={handleDownload}
            disabled={stage !== "ready"}
            whileHover={stage === "ready" ? { scale: 1.02 } : {}}
            whileTap={stage === "ready" ? { scale: 0.97 } : {}}
            className="w-full mt-3 rounded-xl py-2.5 flex items-center justify-center gap-2"
            style={{
              background: stage === "ready" ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
              border: stage === "ready" ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.06)",
              cursor: stage === "ready" ? "pointer" : "not-allowed",
              opacity: stage === "ready" ? 1 : 0.35,
              transition: "all 0.3s",
            }}
          >
            <Download size={13} color={stage === "ready" ? "#93c5fd" : "#4b5563"} />
            <span style={{ fontSize: 12, color: stage === "ready" ? "#93c5fd" : "#4b5563", fontWeight: 500 }}>
              Export .mid file
            </span>
          </motion.button>
        </Panel>
      </div>

      {/* ── PIANO ROLL ─────────────────────────────────────────── */}
      <div
        className="rounded-t-2xl overflow-hidden shrink-0 relative"
        style={{
          height: 330,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex items-center gap-2">
            <div className="rounded" style={{ width: 3, height: 14, background: "linear-gradient(180deg, #3b82f6, #8b5cf6)" }} />
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em" }}>PIANO ROLL</span>
            <span
              className="rounded px-1.5"
              style={{ fontSize: 9, color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              88 KEYS · SYNTHESIA VIEW
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <motion.div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: "#10b981" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <span style={{ fontSize: 10, color: "#6ee7b7" }}>LIVE</span>
              </motion.div>
            ) : (
              <span style={{ fontSize: 10, color: "#4b5563" }}>
                {stage === "ready" ? "Ready · Press play" : "Demo preview"}
              </span>
            )}
          </div>
        </div>
        <div style={{ height: "calc(100% - 37px)" }}>
          <PianoRoll notes={midiNotes} currentTime={currentTime} isPlaying={isPlaying} totalDuration={TOTAL_DURATION} />
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none; width: 14px; height: 14px;
          border-radius: 50%; background: #8b5cf6;
          box-shadow: 0 0 8px rgba(139,92,246,0.8); cursor: pointer;
        }
        input[type='range']:disabled::-webkit-slider-thumb { background: #374151; box-shadow: none; }
        input[type='range']::-moz-range-thumb {
          width: 14px; height: 14px; border: none;
          border-radius: 50%; background: #8b5cf6; cursor: pointer;
        }
      `}</style>
    </main>
  );
}

// ─── Panel ─────────────────────────────────────────────────────────────────────
function Panel({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color: "#6b7280" }}>{icon}</div>
        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em" }}>
          {label.toUpperCase()}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── ControlBtn ────────────────────────────────────────────────────────────────
function ControlBtn({
  onClick, disabled, title, accent, children,
}: {
  onClick: () => void; disabled?: boolean; title?: string; accent?: boolean; children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.08 } : {}}
      whileTap={!disabled ? { scale: 0.93 } : {}}
      title={title}
      className="flex items-center justify-center rounded-full"
      style={{
        width: 36, height: 36,
        background: accent ? (disabled ? "rgba(255,255,255,0.04)" : "rgba(59,130,246,0.12)") : "rgba(255,255,255,0.06)",
        border: accent ? (disabled ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(59,130,246,0.3)") : "1px solid rgba(255,255,255,0.1)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        color: accent && !disabled ? "#93c5fd" : "#9ca3af",
        transition: "all 0.2s",
      }}
    >
      {children}
    </motion.button>
  );
}