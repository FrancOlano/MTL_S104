// DOM Elements
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const responseDiv = document.getElementById('response');
const messageDiv = document.getElementById('message');
const recordBtn = document.getElementById('recordBtn');
const canvas = document.getElementById('waveformCanvas');
const canvasCtx = canvas.getContext('2d');
const modelSelect = document.getElementById('modelSelect');
const recordingStatusDiv = document.getElementById('recordingStatus');
const recordingMessageDiv = document.getElementById('recordingMessage');

// Configuration
const API_URL = 'http://localhost:8000';
let selectedModel = modelSelect.value;

// Audio visualization variables
let audioContext = null;
let analyser = null;
let mediaStream = null;
let isRecording = false;
let animationId = null;
let waveformHistory = [];
const MAX_HISTORY = 60;

// Expose selected model for the transcribe flow integration
window.selectedModel = selectedModel;

modelSelect.addEventListener('change', (event) => {
    selectedModel = event.target.value;
    window.selectedModel = selectedModel;
});


/**
 * Initializes the Web Audio API for waveform visualization
 */
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

/**
 * Draws the waveform on the canvas
 */
function drawWaveform() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const average = sum / bufferLength;

    // Add to history
    waveformHistory.push(average);
    if (waveformHistory.length > MAX_HISTORY) {
        waveformHistory.shift();
    }

    // Clear canvas
    canvasCtx.fillStyle = '#1a1a1a';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scrolling waveform bars
    const barWidth = Math.max(1, canvas.width / MAX_HISTORY);
    const barGap = 1;
    const maxBarHeight = canvas.height * 0.85;
    const centerY = canvas.height / 2;

    waveformHistory.forEach((level, index) => {
        const barHeight = (level / 255) * maxBarHeight;
        const x = (index / MAX_HISTORY) * canvas.width;
        const barY = centerY - barHeight / 2;

        // Create gradient for each bar
        const gradient = canvasCtx.createLinearGradient(x, barY, x, barY + barHeight);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        // Add fade effect on left side
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

/**
 * Toggles recording on/off
 */
async function toggleRecording() {
    if (!isRecording) {
        // Start recording
        try {
            recordBtn.disabled = true;
            recordingStatusDiv.classList.remove('error', 'success');
            recordingStatusDiv.classList.add('show');
            recordingMessageDiv.textContent = 'Starting recording...';

            // Initialize audio context
            await initializeAudioContext();

            // Start backend recording
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

            // Start waveform animation
            drawWaveform();

        } catch (error) {
            console.error('Error:', error);
            recordingStatusDiv.classList.add('error');
            recordingMessageDiv.textContent = `✗ Error: ${error.message}`;
            recordBtn.disabled = false;
            isRecording = false;
        }

    } else {
        // Stop recording
        try {
            recordBtn.disabled = true;
            recordingMessageDiv.textContent = 'Stopping recording and saving file...';

            // Stop waveform animation
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            // Stop backend recording
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

            // Clean up audio context
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

// Add event listeners
recordBtn.addEventListener('click', toggleRecording);
canvas.addEventListener('click', toggleRecording);
