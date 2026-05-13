import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { WaveformDisplay } from "./WaveformDisplay";

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);
  const waveformHistoryRef = useRef<number[]>([]);

  const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  const MAX_HISTORY = 80;

  const drawWaveform = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength / 255;

    waveformHistoryRef.current.push(average);
    if (waveformHistoryRef.current.length > MAX_HISTORY) {
      waveformHistoryRef.current.shift();
    }

    setWaveformData([...waveformHistoryRef.current]);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  };

  const startRecording = async () => {
    try {
      setStatus("idle");
      setStatusMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const mimeType = getSupportedMimeType();
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      recordedChunksRef.current = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        handleRecordingStop(mimeType);
      });

      mediaRecorderRef.current.start();
      recordingStartRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);
      setWaveformData([]);
      waveformHistoryRef.current = [];

      // Start drawing waveform
      animationFrameRef.current = requestAnimationFrame(drawWaveform);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartRef.current;
        setDuration(Math.floor(elapsed / 1000));

        if (elapsed >= MAX_DURATION_MS) {
          stopRecording();
        }
      }, 100);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setStatus("error");
      setStatusMessage("✗ Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Clean up timers
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop all tracks
    if (mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  };

  const handleRecordingStop = (mimeType: string) => {
    const blob = new Blob(recordedChunksRef.current, {
      type: mimeType || "audio/webm",
    });

    const now = new Date();
    const timeStr = now.toISOString().slice(0, 19).replace(/[-:]/g, "");
    const file = new File([blob], `recording_${timeStr}.webm`, {
      type: blob.type,
    });

    setStatus("success");
    setStatusMessage(`✓ Recording saved (${duration}s)`);
    onRecordingComplete(file);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {isRecording && waveformData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-950/50 rounded-lg p-3 overflow-hidden"
        >
          <WaveformDisplay
            data={waveformData}
            currentTime={0}
            duration={0}
            isRecording={true}
          />
        </motion.div>
      )}

      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={toggleRecording}
          disabled={false}
          className={`w-full gap-2 py-6 ${
            isRecording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5 animate-pulse" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Recording
            </>
          )}
        </Button>
      </motion.div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-red-500"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <Clock className="w-4 h-4" />
          <span>{formatDuration(duration)}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              status === "success"
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSupportedMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/webm",
    "audio/ogg",
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}
