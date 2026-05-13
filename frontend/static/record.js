(() => {
    const recordBtn = document.getElementById('recordBtn');
    const canvas = document.getElementById('waveformCanvas');
    const recordingStatusDiv = document.getElementById('recordingStatus');
    const recordingMessageDiv = document.getElementById('recordingMessage');
    const recordingPlayback = document.getElementById('recordingPlayback');

    if (!recordBtn || !canvas || !recordingStatusDiv || !recordingMessageDiv || !recordingPlayback) return;

    const state = (window.appState = window.appState || {});

    const canvasCtx = canvas.getContext('2d');

    let audioContext = null;
    let analyser = null;
    let mediaStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let animationId = null;
    let waveformHistory = [];
    const MAX_HISTORY = 60;
    const MAX_DURATION_MS = 5 * 60 * 1000;
    const MAX_STORAGE_BYTES = 4_500_000;
    let recordingTimerId = null;
    let recordingStartedAt = 0;

    // Initialize audio graph for visualization
    async function initializeAudioContext() {
        if (audioContext) return;

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioContext.createMediaStreamSource(mediaStream);
            source.connect(analyser);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            recordingStatusDiv.classList.add('show', 'error');
            recordingMessageDiv.textContent = '✗ Microphone access denied';
            isRecording = false;
            recordBtn.classList.remove('recording');
            throw error;
        }
    }

    // Select the best available recording MIME type
    function getSupportedMimeType() {
        const candidates = [
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus',
            'audio/webm',
            'audio/ogg',
        ];

        for (const type of candidates) {
            if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return '';
    }

    // Persist the recording as a data URL in sessionStorage
    function saveRecordingToSession(blob, durationMs, mimeType) {
        if (blob.size > MAX_STORAGE_BYTES) {
            recordingStatusDiv.classList.add('error');
            recordingMessageDiv.textContent = '✗ Recording is too large for session storage. Try a shorter recording.';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            const meta = {
                mimeType,
                durationMs,
                createdAt: new Date().toISOString(),
            };

            try {
                sessionStorage.setItem('recordingDataUrl', dataUrl);
                sessionStorage.setItem('recordingMeta', JSON.stringify(meta));
                state.recordingDataUrl = dataUrl;
                state.recordingMeta = meta;
                updatePlaybackSource(dataUrl);
            } catch (error) {
                recordingStatusDiv.classList.add('error');
                recordingMessageDiv.textContent = '✗ Recording could not be stored. Storage limit reached.';
            }
        };

        reader.readAsDataURL(blob);
    }

    // Load the latest stored recording into the player
    function updatePlaybackSource(dataUrl) {
        recordingPlayback.src = dataUrl;
        recordingPlayback.classList.add('is-visible');
        recordingPlayback.load();
    }

    const storedRecording = sessionStorage.getItem('recordingDataUrl');
    if (storedRecording) {
        updatePlaybackSource(storedRecording);
    }

    // Draw the live waveform visualization on the canvas
    function drawWaveform() {
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;

        waveformHistory.push(average);
        if (waveformHistory.length > MAX_HISTORY) {
            waveformHistory.shift();
        }

        canvasCtx.fillStyle = '#1a1a1a';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = Math.max(1, canvas.width / MAX_HISTORY);
        const barGap = 1;
        const maxBarHeight = canvas.height * 0.85;
        const centerY = canvas.height / 2;

        waveformHistory.forEach((level, index) => {
            const barHeight = (level / 255) * maxBarHeight;
            const x = (index / MAX_HISTORY) * canvas.width;
            const barY = centerY - barHeight / 2;

            const gradient = canvasCtx.createLinearGradient(x, barY, x, barY + barHeight);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');

            const alpha = index / MAX_HISTORY;
            canvasCtx.globalAlpha = Math.max(0.3, alpha);
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, barY, barWidth - barGap, barHeight);
            canvasCtx.globalAlpha = 1;
        });

        if (isRecording) {
            animationId = requestAnimationFrame(drawWaveform);
        }
    }

    // Start or stop local recording and store result in sessionStorage
    async function toggleRecording() {
        if (!isRecording) {
            try {
                recordBtn.disabled = true;
                recordingStatusDiv.classList.remove('error', 'success');
                recordingStatusDiv.classList.add('show');
                recordingMessageDiv.textContent = 'Starting recording...';

                await initializeAudioContext();

                const mimeType = getSupportedMimeType();
                mediaStream = mediaStream || (await navigator.mediaDevices.getUserMedia({ audio: true }));
                mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
                recordedChunks = [];

                mediaRecorder.addEventListener('dataavailable', (event) => {
                    if (event.data && event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                });

                mediaRecorder.addEventListener('stop', () => {
                    const blob = new Blob(recordedChunks, { type: mimeType || 'audio/webm' });
                    const durationMs = Math.max(0, Date.now() - recordingStartedAt);
                    saveRecordingToSession(blob, durationMs, blob.type || 'audio/webm');
                });

                isRecording = true;
                recordingStartedAt = Date.now();
                recordBtn.style.display = 'none';
                canvas.classList.add('show');
                recordBtn.disabled = false;
                recordingStatusDiv.classList.add('success');
                recordingMessageDiv.textContent = '🔴 Recording... (click to stop)';
                waveformHistory = [];

                mediaRecorder.start();
                recordingTimerId = window.setTimeout(() => {
                    if (isRecording) {
                        toggleRecording();
                    }
                }, MAX_DURATION_MS);

                drawWaveform();
            } catch (error) {
                console.error('Error:', error);
                recordingStatusDiv.classList.add('error');
                recordingMessageDiv.textContent = `✗ Error: ${error.message}`;
                recordBtn.disabled = false;
                isRecording = false;
            }
        } else {
            try {
                recordBtn.disabled = true;
                recordingMessageDiv.textContent = 'Stopping recording and saving file...';

                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }

                isRecording = false;
                canvas.classList.remove('show');
                recordBtn.style.display = 'flex';
                recordingStatusDiv.classList.remove('error');
                recordingStatusDiv.classList.add('success');
                recordingMessageDiv.textContent = '✓ Recording saved in this session.';
                recordBtn.disabled = false;

                if (recordingTimerId) {
                    clearTimeout(recordingTimerId);
                    recordingTimerId = null;
                }

                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }

                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    mediaStream = null;
                }
                if (audioContext && audioContext.state !== 'closed') {
                    audioContext.close();
                    audioContext = null;
                }
            } catch (error) {
                console.error('Error:', error);
                recordingStatusDiv.classList.add('error');
                recordingStatusDiv.classList.remove('success');
                recordingMessageDiv.textContent = `✗ Error: ${error.message}`;
                isRecording = false;
                canvas.classList.remove('show');
                recordBtn.style.display = 'flex';
                recordBtn.disabled = false;
            }
        }
    }

    recordBtn.addEventListener('click', toggleRecording);
    canvas.addEventListener('click', toggleRecording);
})();
