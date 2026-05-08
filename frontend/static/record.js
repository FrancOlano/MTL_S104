(() => {
    const recordBtn = document.getElementById('recordBtn');
    const canvas = document.getElementById('waveformCanvas');
    const recordingStatusDiv = document.getElementById('recordingStatus');
    const recordingMessageDiv = document.getElementById('recordingMessage');

    if (!recordBtn || !canvas || !recordingStatusDiv || !recordingMessageDiv) return;

    const state = (window.appState = window.appState || {});
    const API_URL = state.apiUrl || 'http://localhost:8000';

    const canvasCtx = canvas.getContext('2d');

    let audioContext = null;
    let analyser = null;
    let mediaStream = null;
    let isRecording = false;
    let animationId = null;
    let waveformHistory = [];
    const MAX_HISTORY = 60;

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

    async function toggleRecording() {
        if (!isRecording) {
            try {
                recordBtn.disabled = true;
                recordingStatusDiv.classList.remove('error', 'success');
                recordingStatusDiv.classList.add('show');
                recordingMessageDiv.textContent = 'Starting recording...';

                await initializeAudioContext();

                const response = await fetch(`${API_URL}/start-recording`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to start recording');
                }

                isRecording = true;
                recordBtn.style.display = 'none';
                canvas.classList.add('show');
                recordBtn.disabled = false;
                recordingStatusDiv.classList.add('success');
                recordingMessageDiv.textContent = '🔴 Recording... (click to stop)';
                waveformHistory = [];

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

                const response = await fetch(`${API_URL}/stop-recording`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to stop recording');
                }

                isRecording = false;
                canvas.classList.remove('show');
                recordBtn.style.display = 'flex';
                recordingStatusDiv.classList.remove('error');
                recordingStatusDiv.classList.add('success');
                recordingMessageDiv.textContent = `✓ Recording saved: ${data.filename}`;
                recordBtn.disabled = false;

                state.lastRecordingFilename = data.filename;
                sessionStorage.setItem('lastRecordingFilename', data.filename);

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
