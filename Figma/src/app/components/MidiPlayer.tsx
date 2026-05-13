import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Download, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";

interface MidiPlayerProps {
  midiUrl: string;
  fileName?: string;
  onClose?: () => void;
}

interface MidiNote {
  note: number;
  startTime: number;
  duration: number;
  velocity: number;
}

export function MidiPlayer({
  midiUrl,
  fileName = "transcription.mid",
  onClose,
}: MidiPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [midiNotes, setMidiNotes] = useState<MidiNote[]>([]);
  const synthRef = useRef<any>(null);
  const toneLoadedRef = useRef(false);

  // Parse MIDI file and extract notes
  useEffect(() => {
    const loadAndParseMidi = async () => {
      try {
        const response = await fetch(midiUrl);
        const arrayBuffer = await response.arrayBuffer();
        const notes = parseMidiFile(arrayBuffer);
        setMidiNotes(notes);

        // Calculate duration from notes
        if (notes.length > 0) {
          const maxEndTime = Math.max(
            ...notes.map((n) => n.startTime + n.duration)
          );
          setDuration(maxEndTime);
        }
      } catch (error) {
        console.error("Error loading MIDI:", error);
      }
    };

    loadAndParseMidi();
  }, [midiUrl]);

  // Load Tone.js dynamically
  useEffect(() => {
    const loadToneJs = async () => {
      if (toneLoadedRef.current || (window as any).Tone) return;

      try {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js";
        script.onload = () => {
          toneLoadedRef.current = true;
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error("Error loading Tone.js:", error);
      }
    };

    loadToneJs();
  }, []);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlay = async () => {
    const Tone = (window as any).Tone;
    if (!Tone) {
      console.error("Tone.js not loaded");
      return;
    }

    try {
      if (isPlaying) {
        Tone.Transport.pause();
        setIsPlaying(false);
      } else {
        // Initialize synth if needed
        if (!synthRef.current) {
          synthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: {
              attack: 0.005,
              decay: 0.1,
              sustain: 0.3,
              release: 1,
            },
          }).toDestination();
        }

        // Schedule notes
        if (Tone.Transport.state === "started") {
          Tone.Transport.resume();
        } else {
          // Schedule all notes
          midiNotes.forEach((note) => {
            Tone.Transport.schedule((time) => {
              const freq = midiNoteToFrequency(note.note);
              synthRef.current.triggerAttackRelease(
                freq,
                note.duration,
                time
              );
            }, note.startTime);
          });

          // Start transport
          await Tone.start();
          Tone.Transport.start();
        }

        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing MIDI:", error);
    }
  };

  const handleStop = () => {
    const Tone = (window as any).Tone;
    if (Tone) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.seconds = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = midiUrl;
    a.download = fileName;
    a.click();
  };

  const noteCount = midiNotes.length;
  const estimatedDuration = duration > 0 ? formatTime(duration) : "--:--";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-4 p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-lg border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Music2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{fileName}</h3>
            <p className="text-xs text-slate-400">
              {noteCount} notes • {estimatedDuration}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          onClick={handlePlay}
          size="sm"
          className="gap-2"
          variant={isPlaying ? "destructive" : "default"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          )}
        </Button>

        <Button
          onClick={handleStop}
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={!isPlaying}
        >
          <Square className="w-4 h-4" />
          Stop
        </Button>

        <Button
          onClick={handleDownload}
          size="sm"
          variant="outline"
          className="gap-2 ml-auto"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      {/* Info */}
      <div className="text-xs text-slate-400 space-y-1 px-2">
        <p>• Click play to hear your transcription</p>
        <p>• Download to save the MIDI file</p>
      </div>
    </motion.div>
  );
}

// Helper functions
function midiNoteToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function parseMidiFile(arrayBuffer: ArrayBuffer): MidiNote[] {
  // Simple MIDI parser - extracts note on/off events
  // For production use, consider using a library like tone-midi or midi-parser-js
  const view = new DataView(arrayBuffer);
  const notes: MidiNote[] = [];

  try {
    // Check for MIDI header
    const headerChunk = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    );

    if (headerChunk !== "MThd") {
      console.warn("Not a valid MIDI file");
      return [];
    }

    // For now, return empty array - full MIDI parsing is complex
    // In production, use a library like https://github.com/jsmidgen/jsmidgen
    return [];
  } catch (error) {
    console.error("Error parsing MIDI:", error);
    return [];
  }
}
