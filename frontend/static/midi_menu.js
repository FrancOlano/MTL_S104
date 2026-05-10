(() => {
    const midiControls = document.getElementById('midiControls');
    const downloadMidiLink = document.getElementById('downloadMidiLink');

    if (!midiControls) return;

    const playBtn = document.createElement('button');
    const pauseBtn = document.createElement('button');
    const stopBtn = document.createElement('button');
    const demoBtn = document.createElement('button');

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

    demoBtn.id = 'demoMidiBtn';
    demoBtn.type = 'button';
    demoBtn.setAttribute('aria-label', 'Load demo MIDI');
    demoBtn.title = 'Load demo MIDI';
    demoBtn.textContent = 'Demo MIDI';

    midiControls.appendChild(playBtn);
    midiControls.appendChild(pauseBtn);
    midiControls.appendChild(stopBtn);
    midiControls.appendChild(demoBtn);

    let currentMidiBlob = null;
    let currentMidiUrl = null;
    let currentMidiData = null;
    let synth = null;
    let midiIsScheduled = false;

    const visualizer = window.fallingNotesDisplay || null;

    function updatePlaybackControls() {
        const hasMidi = Boolean(currentMidiBlob);
        playBtn.disabled = !hasMidi;
        pauseBtn.disabled = !hasMidi || Tone.Transport.state !== 'started';
        stopBtn.disabled = !hasMidi;
    }

    function disposeSynth() {
        if (!synth) return;
        synth.releaseAll();
        synth.dispose();
        synth = null;
    }

    function clearMidiDownload() {
        stopMidiPlayback();

        if (downloadMidiLink) {
            downloadMidiLink.style.display = 'none';
            downloadMidiLink.removeAttribute('href');
        }

        if (currentMidiUrl) {
            URL.revokeObjectURL(currentMidiUrl);
            currentMidiUrl = null;
        }

        currentMidiBlob = null;
        currentMidiData = null;
        midiIsScheduled = false;

        if (visualizer && typeof visualizer.setMidi === 'function') {
            visualizer.setMidi(null);
        }

        updatePlaybackControls();
    }

    async function loadMidiFromBlob(midiBlob) {
        const arrayBuffer = await midiBlob.arrayBuffer();
        return new Midi(arrayBuffer);
    }

    async function ensureMidiData() {
        if (!currentMidiBlob) return null;
        if (!currentMidiData) {
            currentMidiData = await loadMidiFromBlob(currentMidiBlob);
        }
        return currentMidiData;
    }

    function scheduleCurrentMidi(midi) {
        Tone.Transport.cancel();
        Tone.Transport.seconds = 0;

        disposeSynth();
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

        Tone.Transport.scheduleOnce(() => {
            stopMidiPlayback();
        }, Math.max(0.05, Number(midi.duration) || 0));

        midiIsScheduled = true;
    }

    async function setMidiBlob(blob, selectedModel) {
        stopMidiPlayback();

        if (currentMidiUrl) {
            URL.revokeObjectURL(currentMidiUrl);
            currentMidiUrl = null;
        }

        currentMidiBlob = blob;
        currentMidiData = null;
        currentMidiUrl = URL.createObjectURL(currentMidiBlob);

        if (downloadMidiLink) {
            downloadMidiLink.href = currentMidiUrl;
            downloadMidiLink.download = `transcription_${selectedModel}.mid`;
            downloadMidiLink.style.display = 'inline-block';
        }

        try {
            const midi = await ensureMidiData();
            if (visualizer && typeof visualizer.setMidi === 'function') {
                visualizer.setMidi(midi);
                visualizer.setPlaybackTime(0);
            }
        } catch (error) {
            console.error('MIDI parse error:', error);
            if (typeof window.setTranscriptionMessage === 'function') {
                window.setTranscriptionMessage('MIDI generated, but visualization could not be loaded.', 'error');
            }
        }

        updatePlaybackControls();
    }

    async function loadDemoMidi() {
        try {
            const demoMidi = new Midi();
            const track = demoMidi.addTrack();
            const notes = [60, 62, 64, 65, 67, 69, 71, 72, 76, 79, 84];

            notes.forEach((midiNote, index) => {
                track.addNote({
                    midi: midiNote,
                    time: index * 0.33,
                    duration: 0.26 + (index % 3) * 0.08,
                    velocity: 0.85,
                });
            });

            const blob = new Blob([demoMidi.toArray()], { type: 'audio/midi' });
            await setMidiBlob(blob, 'demo');

            if (typeof window.setTranscriptionMessage === 'function') {
                window.setTranscriptionMessage('Demo MIDI loaded. Press Play to test falling notes.', 'success');
            }
        } catch (error) {
            console.error('Demo MIDI error:', error);
            if (typeof window.setTranscriptionMessage === 'function') {
                window.setTranscriptionMessage(`Could not load demo MIDI: ${error.message}`, 'error');
            }
        }
    }

    function stopMidiPlayback() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.seconds = 0;

        disposeSynth();

        midiIsScheduled = false;

        if (visualizer && typeof visualizer.stop === 'function') {
            visualizer.stop();
        }

        updatePlaybackControls();
    }

    async function playMidi() {
        if (!currentMidiBlob) {
            if (typeof window.setTranscriptionMessage === 'function') {
                window.setTranscriptionMessage('Generate a MIDI file first.', 'error');
            }
            return;
        }

        try {
            await Tone.start();

            if (Tone.Transport.state === 'paused') {
                Tone.Transport.start();
                if (visualizer && typeof visualizer.start === 'function') {
                    visualizer.start();
                }
                updatePlaybackControls();
                return;
            }

            if (Tone.Transport.state === 'started') {
                updatePlaybackControls();
                return;
            }

            const midi = await ensureMidiData();
            if (!midi) return;

            if (!midiIsScheduled) {
                scheduleCurrentMidi(midi);
            }

            Tone.Transport.start();
            if (visualizer && typeof visualizer.start === 'function') {
                visualizer.start();
            }
            updatePlaybackControls();
        } catch (error) {
            console.error('Playback error:', error);
            if (typeof window.setTranscriptionMessage === 'function') {
                window.setTranscriptionMessage(`Playback error: ${error.message}`, 'error');
            }
        }
    }

    function pauseMidiPlayback() {
        Tone.Transport.pause();

        if (visualizer && typeof visualizer.pause === 'function') {
            visualizer.setPlaybackTime(Tone.Transport.seconds || 0);
            visualizer.pause();
        }

        updatePlaybackControls();
    }

    playBtn.addEventListener('click', playMidi);
    pauseBtn.addEventListener('click', pauseMidiPlayback);
    stopBtn.addEventListener('click', stopMidiPlayback);
    demoBtn.addEventListener('click', loadDemoMidi);

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
