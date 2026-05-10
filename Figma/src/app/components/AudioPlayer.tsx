import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AudioPlayerProps {
  audioUrl: string;
  fileName: string;
}

const fmt = (s: number) => {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
};

export function AudioPlayer({ audioUrl, fileName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Build / tear-down the Audio element whenever the URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onMeta = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = fileName;
    a.click();
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -6, height: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div
          className="rounded-xl p-3 mt-2"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.18)",
          }}
        >
          {/* Label */}
          <p
            className="mb-2 truncate"
            style={{ fontSize: 10, color: "#60a5fa", letterSpacing: "0.05em" }}
            title={fileName}
          >
            🎵 {fileName}
          </p>

          {/* Seek bar */}
          <div className="mb-2">
            <div className="relative w-full" style={{ height: 4 }}>
              {/* Track */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              {/* Fill */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg,#3b82f6,#8b5cf6)",
                  boxShadow: "0 0 6px rgba(139,92,246,0.6)",
                  transition: "width 0.05s linear",
                }}
              />
              {/* Invisible range input on top */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.01}
                value={currentTime}
                onChange={handleSeek}
                disabled={!isLoaded}
                className="absolute inset-0 w-full opacity-0"
                style={{ height: "100%", cursor: isLoaded ? "pointer" : "default", margin: 0 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 9, color: "#6b7280" }}>{fmt(currentTime)}</span>
              <span style={{ fontSize: 9, color: "#6b7280" }}>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <motion.button
                onClick={handlePlayPause}
                disabled={!isLoaded}
                whileHover={isLoaded ? { scale: 1.08 } : {}}
                whileTap={isLoaded ? { scale: 0.92 } : {}}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 34,
                  height: 34,
                  background: isLoaded
                    ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                    : "rgba(255,255,255,0.05)",
                  border: "none",
                  cursor: isLoaded ? "pointer" : "not-allowed",
                  opacity: isLoaded ? 1 : 0.4,
                  boxShadow: isLoaded
                    ? `0 0 ${isPlaying ? 18 : 10}px rgba(139,92,246,${isPlaying ? 0.7 : 0.35})`
                    : "none",
                  transition: "all 0.25s",
                }}
              >
                {isPlaying ? (
                  <Pause size={14} color="white" />
                ) : (
                  <Play size={14} color="white" style={{ marginLeft: 1 }} />
                )}
              </motion.button>

              {/* Stop */}
              <motion.button
                onClick={handleStop}
                disabled={!isLoaded}
                whileHover={isLoaded ? { scale: 1.06 } : {}}
                whileTap={isLoaded ? { scale: 0.93 } : {}}
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 28,
                  height: 28,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: isLoaded ? "pointer" : "not-allowed",
                  opacity: isLoaded ? 1 : 0.4,
                  transition: "all 0.2s",
                }}
              >
                <Square size={11} color="#9ca3af" />
              </motion.button>

              {/* Playback indicator */}
              {isPlaying && (
                <motion.div
                  className="flex items-center gap-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      style={{ width: 2, background: "#3b82f6" }}
                      animate={{ height: [4, 10, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Download */}
            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.25)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.2)";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)";
              }}
            >
              <Download size={11} color="#93c5fd" />
              <span style={{ fontSize: 10, color: "#93c5fd" }}>Download</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
