// DOM Elements
const midiControls = document.getElementById('midiControls');
const playBtn = document.createElement('button');
const pauseBtn = document.createElement('button');
const stopBtn = document.createElement('button');

playBtn.id = 'playBtn';
playBtn.type = 'button';
playBtn.setAttribute('aria-label', 'Play');
playBtn.title = 'Play';
playBtn.textContent = '▶';

pauseBtn.id = 'pauseBtn';
pauseBtn.type = 'button';
pauseBtn.setAttribute('aria-label', 'Pause');
pauseBtn.title = 'Pause';
pauseBtn.textContent = '||';

stopBtn.id = 'stopBtn';
stopBtn.type = 'button';
stopBtn.setAttribute('aria-label', 'Stop');
stopBtn.title = 'Stop';
stopBtn.textContent = '■';

midiControls.appendChild(playBtn);
midiControls.appendChild(pauseBtn);
midiControls.appendChild(stopBtn);
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



// Audio to MIDI Transcription Code

const convertBtn = document.getElementById('convertBtn');
const transcriptionStatusDiv = document.getElementById('transcriptionStatus');
const transcriptionMessageDiv = document.getElementById('transcriptionMessage');
const downloadMidiLink = document.getElementById('downloadMidiLink');

let audioFileForTranscription = null;
let currentMidiBlob = null;
let currentMidiUrl = null;
let synth = null;
let midiIsScheduled = false;

function updatePlaybackControls() {
    const hasMidi = Boolean(currentMidiBlob);

    playBtn.disabled = !hasMidi;
    pauseBtn.disabled = !hasMidi || Tone.Transport.state !== 'started';
    stopBtn.disabled = !hasMidi;
}



window.setAudioFileForTranscription = function(file) {
    audioFileForTranscription = file;
};


/**
 * Shows transcription status messages.
 */
function setTranscriptionMessage(message, type = '') {
    transcriptionStatusDiv.classList.remove('error', 'success', 'loading');
    transcriptionStatusDiv.classList.add('show');

    if (type) {
        transcriptionStatusDiv.classList.add(type);
    }

    transcriptionMessageDiv.textContent = message;
}


/**
 * Clears the previous MIDI file.
 */
function clearMidiDownload() {
    downloadMidiLink.style.display = 'none';
    downloadMidiLink.removeAttribute('href');

    if (currentMidiUrl) {
        URL.revokeObjectURL(currentMidiUrl);
        currentMidiUrl = null;
    }

    currentMidiBlob = null;
    midiIsScheduled = false;
    updatePlaybackControls();
}


/**
 * Calls FastAPI /transcribe endpoint.
 */
async function transcribeAudio() {
    clearMidiDownload();

    if (!audioFileForTranscription) {
        setTranscriptionMessage(
            'No audio file selected yet. The upload component must provide the file first.',
            'error'
        );
        return;
    }

    const selectedModel = modelSelect.value;

    const formData = new FormData();
    formData.append('audio', audioFileForTranscription);
    formData.append('model', selectedModel);

    convertBtn.disabled = true;
    setTranscriptionMessage('Converting audio to MIDI...', 'loading');

    try {
        const response = await fetch(`${API_URL}/transcribe`, {
            method: 'POST',
            body: formData
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

        currentMidiBlob = await response.blob();
        currentMidiUrl = URL.createObjectURL(currentMidiBlob);

        downloadMidiLink.href = currentMidiUrl;
        downloadMidiLink.download = `transcription_${selectedModel}.mid`;
        downloadMidiLink.style.display = 'inline-block';

        setTranscriptionMessage('✓ MIDI generated successfully.', 'success');
        updatePlaybackControls();

    } catch (error) {
        console.error('Transcription error:', error);
        setTranscriptionMessage(`✗ Error: ${error.message}`, 'error');
    } finally {
        convertBtn.disabled = false;
    }
}


/**
 * Loads a MIDI file from the generated Blob.
 */
async function loadMidiFromBlob(midiBlob) {
    const arrayBuffer = await midiBlob.arrayBuffer();
    return new Midi(arrayBuffer);
}


/**
 * Stops MIDI playback.
 */
function stopMidiPlayback() {
    Tone.Transport.stop();
    Tone.Transport.cancel();

    if (synth) {
        synth.releaseAll();
    }

    midiIsScheduled = false;
    updatePlaybackControls();
}


/**
 * Plays the generated MIDI.
 */
async function playMidi() {
    if (!currentMidiBlob) {
        setTranscriptionMessage('Generate a MIDI file first.', 'error');
        return;
    }

    await Tone.start();

    if (Tone.Transport.state === 'paused') {
        Tone.Transport.start();
        updatePlaybackControls();
        return;
    }

    stopMidiPlayback();

    const midi = await loadMidiFromBlob(currentMidiBlob);

    synth = new Tone.PolySynth(Tone.Synth).toDestination();

    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            Tone.Transport.schedule(time => {
                synth.triggerAttackRelease(
                    note.name,
                    note.duration,
                    time,
                    note.velocity
                );
            }, note.time);
        });
    });

    midiIsScheduled = true;
    Tone.Transport.start();
    updatePlaybackControls();
}


/**
 * Pauses MIDI playback.
 */
function pauseMidiPlayback() {
    Tone.Transport.pause();
    updatePlaybackControls();
}

function handlePlayClick() {
    playMidi();
}

function handlePauseClick() {
    pauseMidiPlayback();
}

function handleStopClick() {
    stopMidiPlayback();
}

playBtn.addEventListener('click', handlePlayClick);
pauseBtn.addEventListener('click', handlePauseClick);
stopBtn.addEventListener('click', handleStopClick);

updatePlaybackControls();


// Event listeners
convertBtn.addEventListener('click', transcribeAudio);
playBtn.addEventListener('click', playMidi);
pauseBtn.addEventListener('click', pauseMidiPlayback);
stopBtn.addEventListener('click', stopMidiPlayback);
// Audio Upload Functionality
const uploadBtn = document.getElementById('uploadBtn');
const audioFileInput = document.getElementById('audioFileInput');
const uploadStatusDiv = document.getElementById('uploadStatus');
const uploadMessageDiv = document.getElementById('uploadMessage');

/**
 * Handle audio file upload
 */
async function uploadAudioFile(file) {
    try {
        uploadBtn.disabled = true;
        uploadStatusDiv.classList.remove('error', 'success');
        uploadStatusDiv.classList.add('show');
        uploadMessageDiv.textContent = 'Uploading file...';

        // Create FormData and append the file
        const formData = new FormData();
        formData.append('file', file);

        // Send to backend
        const response = await fetch(`${API_URL}/upload-audio`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload audio file');
        }

        uploadStatusDiv.classList.add('success');
        uploadMessageDiv.textContent = `✓ File uploaded successfully: ${data.filename}`;
        uploadBtn.disabled = false;
        audioFileInput.value = ''; // Reset file input

    } catch (error) {
        console.error('Upload error:', error);
        uploadStatusDiv.classList.add('error');
        uploadMessageDiv.textContent = `✗ Upload failed: ${error.message}`;
        uploadBtn.disabled = false;
    }
}

/**
 * Handle file input change
 */
audioFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadAudioFile(file);
    }
});

/**
 * Handle upload button click
 */
uploadBtn.addEventListener('click', () => {
    audioFileInput.click();
});
