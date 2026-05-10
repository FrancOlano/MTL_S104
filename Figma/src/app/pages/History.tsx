import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Trash2,
  RefreshCw,
  Music2,
  Clock,
  Cpu,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  FileAudio,
  Calendar,
  ChevronDown,
} from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: number;
  fileName: string;
  date: string;
  model: "TransKun" | "Onsets & Frames";
  duration: string;
  notes: number;
  size: string;
  status: "completed" | "failed" | "processing";
}

const mockHistory: HistoryEntry[] = [
  { id: 1, fileName: "beethoven_moonlight_sonata.wav", date: "2026-05-04 14:23", model: "TransKun", duration: "2:47", notes: 342, size: "3.2 MB", status: "completed" },
  { id: 2, fileName: "chopin_nocturne_op9.mp4", date: "2026-05-04 11:08", model: "Onsets & Frames", duration: "1:32", notes: 198, size: "18.6 MB", status: "completed" },
  { id: 3, fileName: "bach_invention_no1.wav", date: "2026-05-03 16:45", model: "TransKun", duration: "0:58", notes: 124, size: "1.1 MB", status: "completed" },
  { id: 4, fileName: "piano_improvisation_may3.wav", date: "2026-05-03 09:12", model: "Onsets & Frames", duration: "3:14", notes: 0, size: "4.7 MB", status: "failed" },
  { id: 5, fileName: "debussy_clair_de_lune.wav", date: "2026-05-02 20:31", model: "TransKun", duration: "1:48", notes: 267, size: "2.6 MB", status: "completed" },
  { id: 6, fileName: "recording_20260502.wav", date: "2026-05-02 15:17", model: "TransKun", duration: "0:34", notes: 67, size: "0.8 MB", status: "completed" },
  { id: 7, fileName: "schubert_impromptu_op90.mp4", date: "2026-05-01 22:04", model: "Onsets & Frames", duration: "4:02", notes: 531, size: "41.2 MB", status: "completed" },
  { id: 8, fileName: "piano_practice_session.wav", date: "2026-05-01 18:55", model: "TransKun", duration: "1:15", notes: 145, size: "1.8 MB", status: "completed" },
  { id: 9, fileName: "mozart_sonata_k331.wav", date: "2026-04-30 13:40", model: "TransKun", duration: "3:22", notes: 488, size: "4.9 MB", status: "completed" },
  { id: 10, fileName: "late_night_recording.wav", date: "2026-04-30 01:12", model: "Onsets & Frames", duration: "0:48", notes: 0, size: "1.1 MB", status: "failed" },
];

const stats = [
  { label: "Total Conversions", value: "10", icon: <Music2 size={16} />, color: "#8b5cf6" },
  { label: "Successful", value: "8", icon: <CheckCircle2 size={16} />, color: "#10b981" },
  { label: "Total Notes", value: "2,162", icon: <Activity size={16} />, color: "#3b82f6" },
  { label: "Avg Duration", value: "1:58", icon: <Clock size={16} />, color: "#f59e0b" },
];

export function History() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "failed">("all");
  const [filterModel, setFilterModel] = useState<"all" | "TransKun" | "Onsets & Frames">("all");
  const [sortBy, setSortBy] = useState<"date" | "notes" | "duration">("date");
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = mockHistory
    .filter((e) => !deletedIds.has(e.id))
    .filter((e) => filterStatus === "all" || e.status === filterStatus)
    .filter((e) => filterModel === "all" || e.model === filterModel)
    .filter((e) => e.fileName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "notes") return b.notes - a.notes;
      if (sortBy === "duration") return b.duration.localeCompare(a.duration);
      return b.date.localeCompare(a.date);
    });

  const handleDelete = (id: number) => {
    setDeletedIds((prev) => new Set([...prev, id]));
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-5 pt-4 pb-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 40, height: 40,
                background: `${stat.color}18`,
                border: `1px solid ${stat.color}33`,
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f8", lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-3 mb-3 shrink-0 rounded-xl px-3 py-2"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 rounded-lg px-3 py-1.5"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={13} color="#6b7280" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 12, color: "#e5e7eb", width: "100%",
            }}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["all", "completed", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                background: filterStatus === s ? "rgba(139,92,246,0.2)" : "transparent",
                color: filterStatus === s ? "#a78bfa" : "#6b7280",
                border: filterStatus === s ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Model filter */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["all", "TransKun", "Onsets & Frames"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterModel(m)}
              style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                background: filterModel === m ? "rgba(59,130,246,0.15)" : "transparent",
                color: filterModel === m ? "#93c5fd" : "#6b7280",
                border: filterModel === m ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {m === "all" ? "All Models" : m}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
          >
            <Filter size={12} color="#6b7280" />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </span>
            <ChevronDown size={11} color="#6b7280" />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scaleY: 0.9 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
                  background: "rgba(12,12,22,0.97)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, overflow: "hidden", backdropFilter: "blur(20px)",
                  minWidth: 130, transformOrigin: "top",
                }}
              >
                {(["date", "notes", "duration"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSortBy(s); setSortOpen(false); }}
                    className="w-full px-4 py-2.5 text-left"
                    style={{
                      fontSize: 12,
                      color: sortBy === s ? "#a78bfa" : "#9ca3af",
                      background: sortBy === s ? "rgba(139,92,246,0.12)" : "transparent",
                      cursor: "pointer",
                      borderBottom: s !== "duration" ? "1px solid rgba(255,255,255,0.05)" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => sortBy !== s && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => sortBy !== s && (e.currentTarget.style.background = "transparent")}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <div
        className="flex-1 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Table header */}
        <div
          className="grid px-4 py-2.5 shrink-0"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {["File Name", "Date", "Model", "Duration", "Notes", "Size", ""].map((h) => (
            <span key={h} style={{ fontSize: 10, color: "#4b5563", fontWeight: 600, letterSpacing: "0.06em" }}>
              {h.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className="flex items-center justify-center rounded-2xl mb-3"
                  style={{ width: 56, height: 56, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <FileAudio size={24} color="#374151" />
                </div>
                <p style={{ fontSize: 14, color: "#6b7280" }}>No conversions found</p>
                <p style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>Try adjusting your filters</p>
              </div>
            ) : (
              filtered.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="grid px-4 py-3 items-center group"
                  style={{
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* File name */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <div
                      className="flex items-center justify-center rounded-lg shrink-0"
                      style={{
                        width: 30, height: 30,
                        background: entry.status === "completed"
                          ? "rgba(139,92,246,0.12)"
                          : "rgba(239,68,68,0.1)",
                        border: entry.status === "completed"
                          ? "1px solid rgba(139,92,246,0.2)"
                          : "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      <FileAudio size={13} color={entry.status === "completed" ? "#a78bfa" : "#f87171"} />
                    </div>
                    <span
                      className="truncate"
                      style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}
                      title={entry.fileName}
                    >
                      {entry.fileName}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} color="#4b5563" />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                      {entry.date.split(" ")[0].replace("2026-", "")}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="flex items-center gap-1.5">
                    {entry.model === "TransKun" ? (
                      <Cpu size={11} color="#818cf8" />
                    ) : (
                      <Activity size={11} color="#60a5fa" />
                    )}
                    <span style={{ fontSize: 11, color: entry.model === "TransKun" ? "#818cf8" : "#60a5fa" }}>
                      {entry.model === "TransKun" ? "TransKun" : "O&F"}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} color="#4b5563" />
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{entry.duration}</span>
                  </div>

                  {/* Notes */}
                  <div className="flex items-center gap-1.5">
                    <Music2 size={11} color="#4b5563" />
                    <span style={{ fontSize: 11, color: entry.notes > 0 ? "#9ca3af" : "#4b5563" }}>
                      {entry.notes > 0 ? entry.notes.toLocaleString() : "—"}
                    </span>
                  </div>

                  {/* Size */}
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{entry.size}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Status pill */}
                    <div
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 mr-1"
                      style={{
                        background: entry.status === "completed" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        border: entry.status === "completed" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      {entry.status === "completed" ? (
                        <CheckCircle2 size={9} color="#10b981" />
                      ) : (
                        <XCircle size={9} color="#ef4444" />
                      )}
                      <span style={{ fontSize: 9, color: entry.status === "completed" ? "#10b981" : "#ef4444" }}>
                        {entry.status}
                      </span>
                    </div>

                    {entry.status === "completed" && (
                      <button
                        title="Download MIDI"
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: 28, height: 28,
                          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                          cursor: "pointer", color: "#60a5fa",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.1)")}
                      >
                        <Download size={12} />
                      </button>
                    )}
                    {entry.status === "failed" && (
                      <button
                        title="Retry"
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: 28, height: 28,
                          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                          cursor: "pointer", color: "#fbbf24",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
                      >
                        <RefreshCw size={12} />
                      </button>
                    )}
                    <button
                      title="Delete"
                      onClick={() => handleDelete(entry.id)}
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 28, height: 28,
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                        cursor: "pointer", color: "#f87171",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
        >
          <span style={{ fontSize: 11, color: "#4b5563" }}>
            {filtered.length} of {mockHistory.length - deletedIds.size} entries
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className="rounded-full" style={{ width: 6, height: 6, background: "#10b981" }} />
              <span style={{ fontSize: 10, color: "#6b7280" }}>Completed</span>
            </div>
            <span style={{ color: "#374151", fontSize: 10 }}>·</span>
            <div className="flex items-center gap-1">
              <div className="rounded-full" style={{ width: 6, height: 6, background: "#ef4444" }} />
              <span style={{ fontSize: 10, color: "#6b7280" }}>Failed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
