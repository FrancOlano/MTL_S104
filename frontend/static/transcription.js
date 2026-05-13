(() => {
    const convertBtn = document.getElementById('convertBtn');
    const transcriptionStatusDiv = document.getElementById('transcriptionStatus');
    const transcriptionMessageDiv = document.getElementById('transcriptionMessage');

    if (!convertBtn || !transcriptionStatusDiv || !transcriptionMessageDiv) return;

    const state = (window.appState = window.appState || {});
    const API_URL = state.apiUrl || 'http://localhost:8000';

    function setTranscriptionMessage(message, type = '') {
        transcriptionStatusDiv.classList.remove('error', 'success', 'loading');
        transcriptionStatusDiv.classList.add('show');

        if (type) {
            transcriptionStatusDiv.classList.add(type);
        }

        transcriptionMessageDiv.textContent = message;
    }

    window.setTranscriptionMessage = setTranscriptionMessage;

    async function transcribeAudio() {
        if (window.midiMenu) {
            window.midiMenu.clearMidiDownload();
        }

        const audioFile = state.audioFileForTranscription;
        if (!audioFile) {
            setTranscriptionMessage(
                'No audio file selected yet. The upload component must provide the file first.',
                'error'
            );
            return;
        }

        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('model', state.selectedModel || window.selectedModel || 'transkun');

        convertBtn.disabled = true;
        setTranscriptionMessage('Converting audio to MIDI...', 'loading');

        try {
            const response = await fetch(`${API_URL}/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Transcription failed.';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch {
                    errorMessage = await response.text();
                }

                throw new Error(errorMessage);
            }

            const midiBlob = await response.blob();
            if (window.midiMenu) {
                window.midiMenu.setMidiBlob(
                    midiBlob,
                    state.selectedModel || window.selectedModel || 'transkun'
                );
            }

            setTranscriptionMessage('✓ MIDI generated successfully.', 'success');
        } catch (error) {
            console.error('Transcription error:', error);
            setTranscriptionMessage(`✗ Error: ${error.message}`, 'error');
        } finally {
            convertBtn.disabled = false;
        }
    }

    convertBtn.addEventListener('click', transcribeAudio);
})();
