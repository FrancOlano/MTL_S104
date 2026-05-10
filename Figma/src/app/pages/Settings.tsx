import { useState } from "react";
import { motion } from "motion/react";
import {
  Mic,
  Cpu,
  Activity,
  Music2,
  Sliders,
  Volume2,
  Bell,
  Info,
  CheckCircle2,
  RotateCcw,
  Waves,
  Shield,
  HardDrive,
  Gauge,
} from "lucide-react";

// ─── Primitives ────────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{title}</span>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}>{label}</p>
        {description && <p style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.1)",
        border: value ? "none" : "1px solid rgba(255,255,255,0.15)",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.25s",
        boxShadow: value ? "0 0 10px rgba(139,92,246,0.4)" : "none",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          position: "absolute", top: 3,
          width: 16, height: 16, borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}

function SelectControl({
  value, options, onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        color: "#d1d5db",
        fontSize: 12,
        padding: "5px 28px 5px 10px",
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#0f0f1a" }}>{o}</option>
      ))}
    </select>
  );
}

function SliderControl({
  value, min, max, step, unit, onChange,
}: {
  value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          appearance: "none", width: 120, height: 4, borderRadius: 2,
          background: `linear-gradient(to right, #8b5cf6 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
          outline: "none", cursor: "pointer",
        }}
      />
      <span style={{ fontSize: 12, color: "#a78bfa", minWidth: 40, textAlign: "right" }}>
        {value}{unit}
      </span>
    </div>
  );
}

function ModelPill({ model, selected, onClick }: { model: string; selected: boolean; onClick: () => void }) {
  const isTransKun = model === "TransKun";
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{
        background: selected ? (isTransKun ? "rgba(139,92,246,0.18)" : "rgba(59,130,246,0.15)") : "rgba(255,255,255,0.03)",
        border: selected
          ? `1px solid ${isTransKun ? "rgba(139,92,246,0.4)" : "rgba(59,130,246,0.35)"}`
          : "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: selected ? `0 0 12px ${isTransKun ? "rgba(139,92,246,0.2)" : "rgba(59,130,246,0.15)"}` : "none",
      }}
    >
      {isTransKun ? <Cpu size={13} color={selected ? "#a78bfa" : "#6b7280"} /> : <Activity size={13} color={selected ? "#60a5fa" : "#6b7280"} />}
      <span style={{ fontSize: 12, fontWeight: selected ? 600 : 400, color: selected ? (isTransKun ? "#c4b5fd" : "#93c5fd") : "#9ca3af" }}>
        {model}
      </span>
      {selected && <CheckCircle2 size={11} color={isTransKun ? "#a78bfa" : "#60a5fa"} />}
    </button>
  );
}

// ─── Settings ──────────────────────────────────────────────────────────────────
export function Settings() {
  // Audio settings
  const [inputDevice, setInputDevice] = useState("Default Microphone");
  const [sampleRate, setSampleRate] = useState("44100 Hz");
  const [bitDepth, setBitDepth] = useState("24-bit");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [silenceTrim, setSilenceTrim] = useState(true);

  // Model settings
  const [defaultModel, setDefaultModel] = useState<"TransKun" | "Onsets & Frames">("TransKun");
  const [processingQuality, setProcessingQuality] = useState("High");
  const [autoConvert, setAutoConvert] = useState(false);

  // MIDI export
  const [velocitySensitivity, setVelocitySensitivity] = useState(80);
  const [quantization, setQuantization] = useState("1/16");
  const [includeSustain, setIncludeSustain] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState("MIDI Type 1");
  const [tempoDetection, setTempoDetection] = useState(true);

  // App settings
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [storageLimit, setStorageLimit] = useState("5 GB");
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleReset = () => {
    setInputDevice("Default Microphone");
    setSampleRate("44100 Hz");
    setBitDepth("24-bit");
    setNoiseReduction(true);
    setSilenceTrim(true);
    setDefaultModel("TransKun");
    setProcessingQuality("High");
    setAutoConvert(false);
    setVelocitySensitivity(80);
    setQuantization("1/16");
    setIncludeSustain(true);
    setDefaultFormat("MIDI Type 1");
    setTempoDetection(true);
    setAutoSave(true);
    setNotifications(true);
    setStorageLimit("5 GB");
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f8", lineHeight: 1 }}>Settings</h1>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Configure audio, model, and export preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer", fontSize: 12, color: "#9ca3af",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            >
              <RotateCcw size={13} />
              Reset to defaults
            </button>
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: savedMsg ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                border: savedMsg ? "1px solid rgba(16,185,129,0.35)" : "none",
                cursor: "pointer", fontSize: 12, color: savedMsg ? "#6ee7b7" : "white",
                fontWeight: 600,
                boxShadow: savedMsg ? "none" : "0 0 16px rgba(139,92,246,0.4)",
                transition: "all 0.3s",
              }}
            >
              {savedMsg ? <CheckCircle2 size={13} /> : <Sliders size={13} />}
              {savedMsg ? "Saved!" : "Save Changes"}
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* ── Audio Input ─────────────────────────────── */}
          <SectionCard title="Audio Input" icon={<Mic size={15} />}>
            <SettingRow label="Input Device" description="Select your recording microphone or audio interface">
              <SelectControl
                value={inputDevice}
                options={["Default Microphone", "Built-in Microphone", "USB Audio Interface", "Line In"]}
                onChange={setInputDevice}
              />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Sample Rate" description="Higher rates capture more audio detail">
              <SelectControl
                value={sampleRate}
                options={["22050 Hz", "44100 Hz", "48000 Hz", "96000 Hz"]}
                onChange={setSampleRate}
              />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Bit Depth" description="Audio resolution per sample">
              <SelectControl value={bitDepth} options={["16-bit", "24-bit", "32-bit float"]} onChange={setBitDepth} />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Noise Reduction" description="Automatically filter background noise before processing">
              <Toggle value={noiseReduction} onChange={setNoiseReduction} />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Auto-trim Silence" description="Remove leading and trailing silence from recordings">
              <Toggle value={silenceTrim} onChange={setSilenceTrim} />
            </SettingRow>
          </SectionCard>

          {/* ── AI Model ──────────────────────────────── */}
          <SectionCard title="AI Model Preferences" icon={<Cpu size={15} />}>
            <SettingRow label="Default Model" description="Model used for new conversion sessions">
              <div className="flex items-center gap-2">
                <ModelPill model="TransKun" selected={defaultModel === "TransKun"} onClick={() => setDefaultModel("TransKun")} />
                <ModelPill model="Onsets & Frames" selected={defaultModel === "Onsets & Frames"} onClick={() => setDefaultModel("Onsets & Frames")} />
              </div>
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Processing Quality" description="Higher quality increases accuracy but takes longer">
              <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {["Standard", "High", "Ultra"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setProcessingQuality(q)}
                    style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                      background: processingQuality === q ? "rgba(139,92,246,0.2)" : "transparent",
                      color: processingQuality === q ? "#a78bfa" : "#6b7280",
                      border: processingQuality === q ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Auto-convert on Upload" description="Start conversion immediately after file upload">
              <Toggle value={autoConvert} onChange={setAutoConvert} />
            </SettingRow>
          </SectionCard>

          {/* ── MIDI Export ──────────────────────────── */}
          <SectionCard title="MIDI Export" icon={<Music2 size={15} />}>
            <SettingRow label="Default Format">
              <SelectControl
                value={defaultFormat}
                options={["MIDI Type 0", "MIDI Type 1", "MIDI Type 2"]}
                onChange={setDefaultFormat}
              />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Velocity Sensitivity" description="How strongly note dynamics are mapped to MIDI velocity">
              <SliderControl value={velocitySensitivity} min={0} max={127} step={1} onChange={setVelocitySensitivity} />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Quantization" description="Snap notes to the nearest beat subdivision">
              <SelectControl
                value={quantization}
                options={["Off", "1/32", "1/16", "1/8", "1/4"]}
                onChange={setQuantization}
              />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Include Sustain Pedal" description="Detect and export sustain pedal events (CC64)">
              <Toggle value={includeSustain} onChange={setIncludeSustain} />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Automatic Tempo Detection" description="Analyse audio to estimate BPM and set MIDI tempo">
              <Toggle value={tempoDetection} onChange={setTempoDetection} />
            </SettingRow>
          </SectionCard>

          {/* ── App Preferences ──────────────────────── */}
          <SectionCard title="App Preferences" icon={<Sliders size={15} />}>
            <SettingRow label="Auto-save Conversions" description="Automatically save completed MIDI files to history">
              <Toggle value={autoSave} onChange={setAutoSave} />
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Conversion Notifications" description="Get notified when processing is complete">
              <div className="flex items-center gap-2">
                <Bell size={13} color={notifications ? "#a78bfa" : "#4b5563"} />
                <Toggle value={notifications} onChange={setNotifications} />
              </div>
            </SettingRow>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <SettingRow label="Storage Limit" description="Maximum space allocated for conversion history">
              <SelectControl value={storageLimit} options={["1 GB", "2 GB", "5 GB", "10 GB", "Unlimited"]} onChange={setStorageLimit} />
            </SettingRow>
          </SectionCard>

          {/* ── About ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 0 20px rgba(139,92,246,0.35)" }}
                >
                  <Waves size={20} color="white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f8" }}>WidiAI</span>
                    <span
                      className="rounded px-1.5 py-0.5"
                      style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", background: "rgba(139,92,246,0.2)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}
                    >
                      BETA
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "#6b7280" }}>Wave MIDI AI · Version 0.9.2</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-right">
                {[
                  { icon: <Gauge size={11} />, text: "TransKun v2.1" },
                  { icon: <Activity size={11} />, text: "Onsets & Frames v1.14" },
                  { icon: <HardDrive size={11} />, text: "Storage: 1.2 GB / 5 GB" },
                  { icon: <Shield size={11} />, text: "All processing is local" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center justify-end gap-1.5">
                    <span style={{ color: "#4b5563" }}>{item.icon}</span>
                    <span style={{ fontSize: 11, color: "#4b5563" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

            <div className="flex items-center gap-2">
              <Info size={12} color="#4b5563" />
              <p style={{ fontSize: 11, color: "#4b5563" }}>
                WidiAI uses state-of-the-art transformer and frame-based models to convert piano audio to MIDI.
                All audio processing is performed locally — no audio data leaves your device.
              </p>
            </div>
          </motion.div>
        </div>

        <style>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none; width: 14px; height: 14px;
            border-radius: 50%; background: #8b5cf6;
            box-shadow: 0 0 8px rgba(139,92,246,0.8); cursor: pointer;
          }
          input[type='range']::-moz-range-thumb {
            width: 14px; height: 14px; border: none;
            border-radius: 50%; background: #8b5cf6; cursor: pointer;
          }
          select option { background: #0f0f1a; color: #d1d5db; }
        `}</style>
      </div>
    </div>
  );
}
