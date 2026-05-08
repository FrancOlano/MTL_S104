(() => {
    const midiControls = document.getElementById('midiControls');
    const downloadMidiLink = document.getElementById('downloadMidiLink');

    if (!midiControls) return;

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

    function clearMidiDownload() {
        if (downloadMidiLink) {
            downloadMidiLink.style.display = 'none';
            downloadMidiLink.removeAttribute('href');
        }

        if (currentMidiUrl) {
            URL.revokeObjectURL(currentMidiUrl);
            currentMidiUrl = null;
        }

        currentMidiBlob = null;
        midiIsScheduled = false;
        updatePlaybackControls();
    }

    function setMidiBlob(blob, selectedModel) {
        currentMidiBlob = blob;
        currentMidiUrl = URL.createObjectURL(currentMidiBlob);

        if (downloadMidiLink) {
            downloadMidiLink.href = currentMidiUrl;
            downloadMidiLink.download = `transcription_${selectedModel}.mid`;
            downloadMidiLink.style.display = 'inline-block';
        }

        updatePlaybackControls();
    }

    async function loadMidiFromBlob(midiBlob) {
        const arrayBuffer = await midiBlob.arrayBuffer();
        return new Midi(arrayBuffer);
    }

    function stopMidiPlayback() {
        Tone.Transport.stop();
        Tone.Transport.cancel();

        if (synth) {
            synth.releaseAll();
        }

        midiIsScheduled = false;
        updatePlaybackControls();
    }

    async function playMidi() {
        if (!currentMidiBlob) {
            if (typeof window.setTranscriptionMessage === 'function') {
                window.setTranscriptionMessage('Generate a MIDI file first.', 'error');
            }
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

    function pauseMidiPlayback() {
        Tone.Transport.pause();
        updatePlaybackControls();
    }

    playBtn.addEventListener('click', playMidi);
    pauseBtn.addEventListener('click', pauseMidiPlayback);
    stopBtn.addEventListener('click', stopMidiPlayback);

    updatePlaybackControls();

    window.midiMenu = {
        setMidiBlob,
        clearMidiDownload,
        updatePlaybackControls,
        stopMidiPlayback,
        pauseMidiPlayback,
        playMidi,
        getCurrentMidiBlob: () => currentMidiBlob,
    };
})();
