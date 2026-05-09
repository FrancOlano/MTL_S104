(() => {
    const MIN_PIANO_MIDI = 21; // A0
    const MAX_PIANO_MIDI = 108; // C8
    const BLACK_KEY_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

    function isBlackKey(midi) {
        return BLACK_KEY_PITCH_CLASSES.has(((midi % 12) + 12) % 12);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function nearestWhiteLower(midi) {
        let value = midi;
        while (value > MIN_PIANO_MIDI && isBlackKey(value)) {
            value -= 1;
        }
        return value;
    }

    function nearestWhiteUpper(midi) {
        let value = midi;
        while (value < MAX_PIANO_MIDI && isBlackKey(value)) {
            value += 1;
        }
        return value;
    }

    class FallingNotesDisplay {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas ? canvas.getContext('2d') : null;
            this.notes = [];
            this.playing = false;
            this.rafId = null;
            this.lookAheadSeconds = 6;
            this.playedSeconds = 1.25;
            this.currentTimeSeconds = 0;

            this.minMidi = MIN_PIANO_MIDI;
            this.maxMidi = MAX_PIANO_MIDI;
            this.keyGeometry = {
                whiteWidth: 0,
                blackWidth: 0,
                whiteCount: 0,
                keyboardTop: 0,
                keyboardHeight: 0,
            };
            this.keyLayoutByMidi = new Map();

            this.boundResize = this.resize.bind(this);
            this.boundAnimate = this.animate.bind(this);

            if (this.canvas && this.ctx) {
                window.addEventListener('resize', this.boundResize);
                this.resize();
            }
        }

        destroy() {
            this.stop();
            window.removeEventListener('resize', this.boundResize);
        }

        resize() {
            if (!this.canvas || !this.ctx) return;

            const cssWidth = Math.max(320, this.canvas.clientWidth || 320);
            const cssHeight = Math.max(220, this.canvas.clientHeight || 220);
            const dpr = window.devicePixelRatio || 1;

            this.canvas.width = Math.floor(cssWidth * dpr);
            this.canvas.height = Math.floor(cssHeight * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            this.computeKeyGeometry(cssWidth, cssHeight);
            this.draw(this.currentTimeSeconds);
        }

        computeKeyGeometry(width, height) {
            const keyboardHeight = Math.max(56, Math.round(height * 0.2));
            const keyboardTop = height - keyboardHeight;

            const whiteMidis = [];
            for (let midi = this.minMidi; midi <= this.maxMidi; midi += 1) {
                if (!isBlackKey(midi)) {
                    whiteMidis.push(midi);
                }
            }

            const whiteCount = whiteMidis.length || 1;
            const whiteWidth = width / whiteCount;
            const blackWidth = whiteWidth * 0.62;

            this.keyGeometry = {
                whiteWidth,
                blackWidth,
                whiteCount,
                keyboardTop,
                keyboardHeight,
            };

            this.keyLayoutByMidi.clear();

            let whiteIndex = 0;
            for (let midi = this.minMidi; midi <= this.maxMidi; midi += 1) {
                if (isBlackKey(midi)) {
                    const x = whiteIndex * whiteWidth - blackWidth / 2;
                    this.keyLayoutByMidi.set(midi, {
                        x,
                        width: blackWidth,
                        black: true,
                    });
                    continue;
                }

                const x = whiteIndex * whiteWidth;
                this.keyLayoutByMidi.set(midi, {
                    x,
                    width: whiteWidth,
                    black: false,
                });
                whiteIndex += 1;
            }
        }

        setMidi(midi) {
            if (!midi || !Array.isArray(midi.tracks)) {
                this.notes = [];
                this.currentTimeSeconds = 0;
                this.draw(0);
                return;
            }

            const extracted = [];

            midi.tracks.forEach((track, trackIndex) => {
                if (!track || !Array.isArray(track.notes)) return;

                track.notes.forEach(note => {
                    const midiNumber = Number.isFinite(note.midi) ? note.midi : null;

                    if (!Number.isFinite(midiNumber)) return;

                    const start = Number(note.time) || 0;
                    const duration = Math.max(0.02, Number(note.duration) || 0);
                    const end = start + duration;

                    extracted.push({
                        midi: midiNumber,
                        start,
                        end,
                        velocity: Number.isFinite(note.velocity) ? note.velocity : 0.8,
                        trackIndex,
                    });
                });
            });

            this.notes = extracted.sort((a, b) => a.start - b.start);

            const inRange = this.notes
                .map(n => n.midi)
                .filter(m => Number.isFinite(m));

            if (inRange.length > 0) {
                const rangeMin = Math.min(...inRange);
                const rangeMax = Math.max(...inRange);

                this.minMidi = nearestWhiteLower(
                    clamp(rangeMin - 2, MIN_PIANO_MIDI, MAX_PIANO_MIDI)
                );
                this.maxMidi = nearestWhiteUpper(
                    clamp(rangeMax + 2, MIN_PIANO_MIDI, MAX_PIANO_MIDI)
                );

                if (this.minMidi >= this.maxMidi) {
                    this.minMidi = MIN_PIANO_MIDI;
                    this.maxMidi = MAX_PIANO_MIDI;
                }
            } else {
                this.minMidi = MIN_PIANO_MIDI;
                this.maxMidi = MAX_PIANO_MIDI;
            }

            this.currentTimeSeconds = 0;
            const cssWidth = this.canvas ? this.canvas.clientWidth || 320 : 320;
            const cssHeight = this.canvas ? this.canvas.clientHeight || 220 : 220;
            this.computeKeyGeometry(cssWidth, cssHeight);
            this.draw(0);
        }

        start() {
            if (this.playing) return;
            this.playing = true;
            this.animate();
        }

        pause() {
            this.playing = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.draw(this.currentTimeSeconds);
        }

        stop() {
            this.playing = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.currentTimeSeconds = 0;
            this.draw(0);
        }

        setPlaybackTime(seconds) {
            this.currentTimeSeconds = Math.max(0, Number(seconds) || 0);
            if (!this.playing) {
                this.draw(this.currentTimeSeconds);
            }
        }

        animate() {
            if (!this.playing) return;

            if (window.Tone && window.Tone.Transport) {
                this.currentTimeSeconds = Math.max(0, window.Tone.Transport.seconds || 0);
            }

            this.draw(this.currentTimeSeconds);
            this.rafId = requestAnimationFrame(this.boundAnimate);
        }

        draw(currentTime) {
            if (!this.ctx || !this.canvas) return;

            const width = this.canvas.clientWidth || 320;
            const height = this.canvas.clientHeight || 220;
            const { keyboardTop, keyboardHeight } = this.keyGeometry;

            this.ctx.clearRect(0, 0, width, height);

            const bgGradient = this.ctx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, 'rgba(20, 18, 30, 0.98)');
            bgGradient.addColorStop(1, 'rgba(10, 10, 16, 0.96)');
            this.ctx.fillStyle = bgGradient;
            this.ctx.fillRect(0, 0, width, height);

            this.drawTimeGrid(width, keyboardTop, currentTime);
            this.drawNotes(width, keyboardTop, currentTime);
            this.drawKeyboard(width, keyboardTop, keyboardHeight, currentTime);
        }

        drawTimeGrid(width, keyboardTop, currentTime) {
            const gridStep = 1;
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            this.ctx.lineWidth = 1;

            for (let i = 0; i <= this.lookAheadSeconds; i += gridStep) {
                const t = currentTime + i;
                const y = this.timeToY(t, currentTime, keyboardTop);
                if (y < 0 || y > keyboardTop) continue;

                this.ctx.beginPath();
                this.ctx.moveTo(0, y + 0.5);
                this.ctx.lineTo(width, y + 0.5);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        drawNotes(width, keyboardTop, currentTime) {
            if (!this.notes.length) return;

            const minTime = currentTime - this.playedSeconds;
            const maxTime = currentTime + this.lookAheadSeconds;

            for (let i = 0; i < this.notes.length; i += 1) {
                const note = this.notes[i];

                if (note.end < minTime) continue;
                if (note.start > maxTime) break;
                if (note.midi < this.minMidi || note.midi > this.maxMidi) continue;

                const key = this.keyLayoutByMidi.get(note.midi);
                if (!key) continue;

                const yTop = this.timeToY(note.end, currentTime, keyboardTop);
                const yBottom = this.timeToY(note.start, currentTime, keyboardTop);

                const clampedTop = clamp(yTop, 0, keyboardTop);
                const clampedBottom = clamp(yBottom, 0, keyboardTop);
                const height = clampedBottom - clampedTop;

                if (height <= 0) continue;

                const baseHue = (note.trackIndex * 67 + note.midi * 2) % 360;
                const alpha = clamp(0.35 + note.velocity * 0.65, 0.35, 0.95);
                const fill = `hsla(${baseHue}, 78%, ${key.black ? 60 : 66}%, ${alpha})`;
                const stroke = `hsla(${baseHue}, 90%, 82%, ${Math.min(1, alpha + 0.15)})`;

                this.ctx.fillStyle = fill;
                this.ctx.strokeStyle = stroke;
                this.ctx.lineWidth = 1;

                const radius = key.black ? 3 : 4;
                this.drawRoundedRect(
                    key.x + 1,
                    clampedTop,
                    Math.max(2, key.width - 2),
                    height,
                    radius
                );
                this.ctx.fill();
                this.ctx.stroke();
            }
        }

        drawKeyboard(width, keyboardTop, keyboardHeight, currentTime) {
            const pressedKeys = new Set();
            for (let i = 0; i < this.notes.length; i += 1) {
                const note = this.notes[i];
                if (note.start <= currentTime && note.end >= currentTime) {
                    if (note.midi >= this.minMidi && note.midi <= this.maxMidi) {
                        pressedKeys.add(note.midi);
                    }
                }
                if (note.start > currentTime + 0.2) break;
            }

            this.ctx.fillStyle = 'rgba(8, 9, 14, 0.95)';
            this.ctx.fillRect(0, keyboardTop, width, keyboardHeight);

            for (let midi = this.minMidi; midi <= this.maxMidi; midi += 1) {
                const key = this.keyLayoutByMidi.get(midi);
                if (!key || key.black) continue;

                const isPressed = pressedKeys.has(midi);
                this.ctx.fillStyle = isPressed ? 'rgba(138, 196, 255, 0.96)' : 'rgba(248, 250, 255, 0.95)';
                this.ctx.strokeStyle = 'rgba(18, 20, 30, 0.5)';
                this.ctx.lineWidth = 1;

                this.ctx.fillRect(key.x, keyboardTop, key.width, keyboardHeight);
                this.ctx.strokeRect(key.x + 0.5, keyboardTop + 0.5, key.width - 1, keyboardHeight - 1);
            }

            const blackHeight = keyboardHeight * 0.62;
            for (let midi = this.minMidi; midi <= this.maxMidi; midi += 1) {
                const key = this.keyLayoutByMidi.get(midi);
                if (!key || !key.black) continue;

                const isPressed = pressedKeys.has(midi);
                const grad = this.ctx.createLinearGradient(0, keyboardTop, 0, keyboardTop + blackHeight);
                if (isPressed) {
                    grad.addColorStop(0, 'rgba(100, 164, 245, 0.98)');
                    grad.addColorStop(1, 'rgba(38, 94, 188, 0.98)');
                } else {
                    grad.addColorStop(0, 'rgba(38, 41, 56, 0.98)');
                    grad.addColorStop(1, 'rgba(14, 16, 24, 0.98)');
                }

                this.ctx.fillStyle = grad;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                this.drawRoundedRect(key.x, keyboardTop, key.width, blackHeight, 3);
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, keyboardTop + 0.5);
            this.ctx.lineTo(width, keyboardTop + 0.5);
            this.ctx.stroke();
        }

        timeToY(timePoint, currentTime, keyboardTop) {
            const delta = timePoint - currentTime;
            if (delta >= 0) {
                const ratio = delta / this.lookAheadSeconds;
                return keyboardTop - ratio * keyboardTop;
            }

            const ratio = Math.abs(delta) / this.playedSeconds;
            return keyboardTop + ratio * keyboardTop;
        }

        drawRoundedRect(x, y, width, height, radius) {
            const r = Math.max(0, Math.min(radius, width / 2, height / 2));
            this.ctx.beginPath();
            this.ctx.moveTo(x + r, y);
            this.ctx.lineTo(x + width - r, y);
            this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
            this.ctx.lineTo(x + width, y + height - r);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
            this.ctx.lineTo(x + r, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
            this.ctx.lineTo(x, y + r);
            this.ctx.quadraticCurveTo(x, y, x + r, y);
            this.ctx.closePath();
        }
    }

    const canvas = document.getElementById('fallingNotesCanvas');

    window.fallingNotesDisplay = canvas
        ? new FallingNotesDisplay(canvas)
        : {
            setMidi() {},
            start() {},
            pause() {},
            stop() {},
            setPlaybackTime() {},
            destroy() {},
        };
})();
