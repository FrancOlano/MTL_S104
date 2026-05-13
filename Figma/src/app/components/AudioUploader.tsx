import { useRef, useState } from "react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export function AudioUploader({ onFileSelected, isLoading = false }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const allowedFormats = [".wav", ".mp3", ".flac", ".ogg", ".m4a"];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedFormats.includes(fileExt)) {
      setStatus("error");
      setStatusMessage(`Invalid format. Allowed: ${allowedFormats.join(", ")}`);
      return;
    }

    setStatus("success");
    setStatusMessage(`✓ ${file.name} ready for transcription`);
    onFileSelected(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedFormats.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className="w-full gap-2 py-6"
          variant="outline"
        >
          <Upload className="w-5 h-5" />
          {isLoading ? "Processing..." : "Select Audio File"}
        </Button>
      </motion.div>

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
