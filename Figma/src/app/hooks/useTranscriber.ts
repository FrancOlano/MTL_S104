import { useState, useCallback } from "react";

export type TranscriptionModel = "transkun" | "own";

interface UseTranscriberOptions {
  apiUrl?: string;
}

export interface TranscriptionState {
  isLoading: boolean;
  progress: number;
  status: "idle" | "processing" | "success" | "error";
  statusMessage: string;
  midiBlob: Blob | null;
  midiUrl: string | null;
}

export function useTranscriber(options: UseTranscriberOptions = {}) {
  const apiUrl = options.apiUrl || "http://localhost:8001";
  const [state, setState] = useState<TranscriptionState>({
    isLoading: false,
    progress: 0,
    status: "idle",
    statusMessage: "",
    midiBlob: null,
    midiUrl: null,
  });

  const transcribe = useCallback(
    async (audioFile: File, model: TranscriptionModel = "transkun") => {
      setState({
        isLoading: true,
        progress: 0,
        status: "processing",
        statusMessage: "Transcribing audio to MIDI...",
        midiBlob: null,
        midiUrl: null,
      });

      try {
        const formData = new FormData();
        formData.append("audio", audioFile);
        formData.append("model", model);

        const response = await fetch(`${apiUrl}/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(
            `Transcription failed: ${response.status} ${response.statusText}`
          );
        }

        const midiBlob = await response.blob();

        // Create a URL for the MIDI blob
        const midiUrl = URL.createObjectURL(midiBlob);

        setState({
          isLoading: false,
          progress: 100,
          status: "success",
          statusMessage: `✓ Transcription complete (${model})`,
          midiBlob,
          midiUrl,
        });

        return { midiBlob, midiUrl };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        setState({
          isLoading: false,
          progress: 0,
          status: "error",
          statusMessage: `✗ ${errorMessage}`,
          midiBlob: null,
          midiUrl: null,
        });

        throw error;
      }
    },
    [apiUrl]
  );

  const reset = useCallback(() => {
    // Clean up blob URL if it exists
    if (state.midiUrl) {
      URL.revokeObjectURL(state.midiUrl);
    }

    setState({
      isLoading: false,
      progress: 0,
      status: "idle",
      statusMessage: "",
      midiBlob: null,
      midiUrl: null,
    });
  }, [state.midiUrl]);

  return {
    ...state,
    transcribe,
    reset,
  };
}
