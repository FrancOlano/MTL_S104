from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import librosa
import numpy as np
import pretty_midi
import torch
import torch.nn as nn


class AcousticModel(nn.Module):
    def __init__(self, params: dict):
        super().__init__()

        temporal_sizes = params.get("temporal_sizes", [3, 3, 3])
        freq_sizes = params.get("freq_sizes", [3, 3, 3])
        out_channels = params.get("out_channels", [32, 32, 64])
        pool_sizes = params.get("pool_sizes", [1, 2, 2])
        dropout_probs = params.get("dropout_probs", [0, 0.25, 0.25])
        dropout_fc = params.get("dropout_fc", 0.5)
        fc_size = params.get("fc_size", 512)
        in_features = params.get("in_features", 229)

        self.conv_blocks = nn.ModuleList()

        for i in range(len(temporal_sizes)):
            if i == 0:
                in_channels = 1
            else:
                in_channels = out_channels[i - 1]

            conv_block = nn.Sequential(
                nn.Conv2d(
                    in_channels=in_channels,
                    out_channels=out_channels[i],
                    kernel_size=(temporal_sizes[i], freq_sizes[i]),
                    padding="same",
                ),
                nn.BatchNorm2d(out_channels[i]),
                nn.ReLU(),
                nn.MaxPool2d(kernel_size=(1, pool_sizes[i]))
                if pool_sizes[i] > 1
                else nn.Identity(),
                nn.Dropout(p=dropout_probs[i])
                if dropout_probs[i] > 0
                else nn.Identity(),
            )

            self.conv_blocks.append(conv_block)

        self.fc = nn.Sequential(
            nn.Linear(
                in_features=out_channels[-1] * (in_features // 4),
                out_features=fc_size,
            ),
            nn.Dropout(p=dropout_fc),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x.view(x.shape[0], 1, x.shape[1], x.shape[2])

        for conv_block in self.conv_blocks:
            x = conv_block(x)

        x = x.transpose(1, 2).flatten(-2)

        return self.fc(x)


class BiLSTM(nn.Module):
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            bidirectional=True,
            batch_first=True,
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x, _ = self.lstm(x)
        return x


class TranscriptionModel(nn.Module):
    def __init__(self, params: dict):
        super().__init__()

        out_features = params.get("out_features", 88)
        fc_size = params.get("fc_size", 512)
        onset_lstm_units = params.get("onset_lstm_units", 128)
        combined_lstm_units = params.get("combined_lstm_units", 128)

        self.onset_stack = nn.Sequential(
            AcousticModel(params),
            BiLSTM(
                input_size=fc_size,
                hidden_size=onset_lstm_units,
            ),
            nn.Linear(
                onset_lstm_units * 2,
                out_features,
            ),
        )

        self.frame_stack = nn.Sequential(
            AcousticModel(params),
            nn.Linear(
                fc_size,
                out_features,
            ),
        )

        self.combined_stack = nn.Sequential(
            BiLSTM(
                input_size=out_features * 2,
                hidden_size=combined_lstm_units,
            ),
            nn.Linear(
                combined_lstm_units * 2,
                out_features,
            ),
        )

        self.velocity_stack = nn.Sequential(
            AcousticModel(params),
            nn.Linear(
                fc_size,
                out_features,
            ),
        )

    def forward(self, x: torch.Tensor):
        onset_pred = self.onset_stack(x)
        activation_pred = self.frame_stack(x)

        combined_pred = torch.cat(
            [
                torch.sigmoid(onset_pred).detach(),
                torch.sigmoid(activation_pred),
            ],
            dim=-1,
        )

        frame_pred = self.combined_stack(combined_pred)
        velocity_pred = self.velocity_stack(x)

        return onset_pred, activation_pred, frame_pred, velocity_pred


class MelSpectrogram:
    def __init__(
        self,
        sample_rate: int = 16000,
        window_size: float = 20.0,
        frame_rate: float = 31.25,
    ):
        self.sample_rate = sample_rate
        self.window_size = window_size
        self.frame_rate = frame_rate

    def compute_mel(
        self,
        audio: np.ndarray,
        n_mels: int = 229,
        n_fft: int = 2048,
        hop_length: Optional[int] = None,
        power_db: bool = False,
    ) -> np.ndarray:
        if hop_length is None:
            numerator = self.window_size * self.sample_rate
            denominator = (self.frame_rate * self.window_size) - 1
            hop_length = int(numerator / denominator)

        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=self.sample_rate,
            n_mels=n_mels,
            n_fft=n_fft,
            hop_length=hop_length,
        )

        if power_db:
            return librosa.power_to_db(mel, ref=np.max)

        mel = np.abs(mel) ** 2
        mel = np.clip(mel, a_min=1e-10, a_max=None)

        return np.log(mel)


CONFIG_INFERENCE = {
    "frame_rate": 31.25,
    "in_features": 229,
    "out_features": 88,
    "threshold": 0.5,
    "temporal_sizes": [3, 3, 3],
    "freq_sizes": [3, 3, 3],
    "out_channels": [32, 32, 64],
    "pool_sizes": [1, 2, 2],
    "dropout_probs": [0, 0.25, 0.25],
    "dropout_fc": 0.5,
    "fc_size": 512,
    "onset_lstm_units": 128,
    "combined_lstm_units": 128,
    "pitch_offset": 21,
    "checkpoint_path": os.getenv("OWN_MODEL_CHECKPOINT", "./checkpoint_50000.pt"),
    "sample_rate": 16000,
    "window_size": 20.0,
    "mel_n_fft": 2048,
    "hop_length": 512,
}


_MODEL: Optional[TranscriptionModel] = None


def get_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def load_own_model(config: dict = CONFIG_INFERENCE) -> TranscriptionModel:
    global _MODEL

    if _MODEL is not None:
        return _MODEL

    checkpoint_path = Path(config["checkpoint_path"])

    if not checkpoint_path.exists():
        raise FileNotFoundError(
            f"Checkpoint not found: {checkpoint_path.resolve()}"
        )

    device = get_device()

    model = TranscriptionModel(config).to(device)

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device,
    )

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        state_dict = checkpoint["state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)
    model.eval()

    _MODEL = model

    return _MODEL


def get_mel(
    audio_frame: np.ndarray,
    melspec: MelSpectrogram,
    n_mels: int,
    n_fft: int,
    hop_length: int,
) -> torch.Tensor:
    mel = melspec.compute_mel(
        audio_frame,
        n_mels=n_mels,
        n_fft=n_fft,
        hop_length=hop_length,
    )

    device = get_device()

    mel = torch.tensor(mel, dtype=torch.float32).to(device)
    mel = mel.T

    return mel.unsqueeze(0)


def note_extract(
    onset_roll: torch.Tensor,
    frame_roll: torch.Tensor,
    velocity_roll: torch.Tensor,
    onset_thresh: float = 0.5,
    frame_thresh: float = 0.5,
):
    onsets = (onset_roll > onset_thresh).cpu().int()
    frames = (frame_roll > frame_thresh).cpu().int()

    onset_events = (
        torch.cat([onsets[:1, :], onsets[1:, :] - onsets[:-1, :]], dim=0) == 1
    ).nonzero()

    notes = []
    intervals = []
    velocities = []

    for loc in onset_events:
        time = loc[0].item()
        note = loc[1].item()

        onset = time
        offset = time
        note_velocities = []

        while offset < onsets.shape[0] and (
            onsets[offset, note].item() or frames[offset, note].item()
        ):
            # Collect velocity at every active frame, not just onset frames
            note_velocities.append(velocity_roll[offset, note].item())
            offset += 1

        if offset > onset:
            notes.append(note)
            intervals.append([onset, offset])
            velocities.append(np.mean(note_velocities) if note_velocities else 0.5)

    return np.array(notes), np.array(intervals), np.array(velocities)


def transcribe_with_own_model(
    audio_path: str | Path,
    midi_path: str | Path,
    config_override: Optional[dict] = None,
) -> Path:
    config = CONFIG_INFERENCE.copy()
    if config_override:
        config.update(config_override)

    audio_path = Path(audio_path)
    midi_path = Path(midi_path)
    midi_path.parent.mkdir(parents=True, exist_ok=True)

    audio, sample_rate = librosa.load(str(audio_path), sr=config["sample_rate"], mono=True)

    melspec = MelSpectrogram(
        sample_rate=sample_rate,
        window_size=config["window_size"],
        frame_rate=config["frame_rate"],
    )

    model = load_own_model(config)

    feature = get_mel(
        audio_frame=audio,
        melspec=melspec,
        n_mels=config["in_features"],
        n_fft=config["mel_n_fft"],
        hop_length=config["hop_length"],
    )

    with torch.inference_mode():
        onset_preds, _, frame_preds, velocity_preds = model(feature)

        onset_preds = torch.sigmoid(onset_preds)[0]
        frame_preds = torch.sigmoid(frame_preds)[0]
        # Fix: apply sigmoid to velocity logits before use
        velocity_preds = torch.sigmoid(velocity_preds)[0]

    note_preds, interval_preds, velocities = note_extract(
        onset_roll=onset_preds,
        frame_roll=frame_preds,
        velocity_roll=velocity_preds,
        onset_thresh=config["threshold"],
        frame_thresh=config["threshold"],
    )

    velocities = np.clip(velocities, 0, 1)
    velocities = 80 * velocities + 10

    note_preds = note_preds + config["pitch_offset"]

    midi_obj = pretty_midi.PrettyMIDI()
    program = pretty_midi.instrument_name_to_program("Acoustic Grand Piano")
    piano = pretty_midi.Instrument(program=program)

    for index in range(len(note_preds)):
        pitch = int(note_preds[index])
        onset, offset = interval_preds[index] / config["frame_rate"]
        velocity = int(velocities[index])

        if offset <= onset:
            offset = onset + 0.01

        piano.notes.append(
            pretty_midi.Note(
                velocity=velocity,
                pitch=pitch,
                start=float(onset),
                end=float(offset),
            )
        )

    midi_obj.instruments.append(piano)
    midi_obj.write(str(midi_path))

    return midi_path