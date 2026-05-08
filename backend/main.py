from __future__ import annotations

import os
import subprocess
import sys
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool

from backend.custom_transcriber import (
    transcribe_with_own_model as transcribe_with_onsets_and_frames,
)


app = FastAPI()

# Setup static files
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECORDINGS_DIR = "recordings"


UPLOADS_DIR = Path("uploads")
MIDI_DIR = Path("midi_outputs")

UPLOADS_DIR.mkdir(exist_ok=True)
MIDI_DIR.mkdir(exist_ok=True)

# Create recordings directory if it doesn't exist
if not os.path.exists(RECORDINGS_DIR):
    os.makedirs(RECORDINGS_DIR)

@app.get("/")
async def index():
    return FileResponse("frontend/templates/index.html")

def cleanup_files(paths: list[str]):
    """Delete temporary files after sending response."""
    for path in paths:
        try:
            Path(path).unlink(missing_ok=True)
        except Exception:
            pass



async def save_upload_file(upload_file: UploadFile, destination: Path):
    """Save uploaded audio file to disk."""
    destination.parent.mkdir(parents=True, exist_ok=True)

    with destination.open("wb") as buffer:
        while True:
            chunk = await upload_file.read(1024 * 1024)
            if not chunk:
                break
            buffer.write(chunk)


def run_transkun(audio_path: Path, output_path: Path):
    """
    Run TransKun.

    First tries:
        transkun input.wav output.mid

    If that command is not found, tries:
        python -m transkun input.wav output.mid
    """

    audio_path = str(audio_path)
    output_path = str(output_path)

    try:
        subprocess.run(
            ["transkun", audio_path, output_path],
            check=True,
            capture_output=True,
            text=True,
        )

    except FileNotFoundError:
        try:
            subprocess.run(
                [sys.executable, "-m", "transkun", audio_path, output_path],
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            raise RuntimeError(
                f"TransKun failed:\n{e.stderr or e.stdout}"
            )

    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"TransKun failed:\n{e.stderr or e.stdout}"
        )

    if not Path(output_path).exists():
        raise RuntimeError("TransKun finished but no MIDI file was created.")



@app.post("/transcribe")
async def transcribe_audio(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    model_name: str = Form(..., alias="model"),
):
    """
    Convert uploaded audio to MIDI.

    Required form-data:
        audio: audio file
        model: onsets_and_frames OR transkun
    """

    selected_model = model_name.strip().lower()

    if selected_model not in {"onsets_and_frames", "transkun"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid model. Use 'onsets_and_frames' or 'transkun'.",
        )

    original_suffix = Path(audio.filename or "input.wav").suffix.lower()
    allowed_suffixes = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}

    if original_suffix in allowed_suffixes:
        suffix = original_suffix
    else:
        suffix = ".wav"

    job_id = uuid.uuid4().hex

    input_path = UPLOADS_DIR / f"{job_id}{suffix}"
    output_path = MIDI_DIR / f"{job_id}_{selected_model}.mid"

    try:
        await save_upload_file(audio, input_path)

        if selected_model == "onsets_and_frames":
            await run_in_threadpool(
                transcribe_with_onsets_and_frames,
                input_path,
                output_path,
            )
        else:
            await run_in_threadpool(
                run_transkun,
                input_path,
                output_path,
            )

        background_tasks.add_task(
            cleanup_files,
            [str(input_path), str(output_path)],
        )

        return FileResponse(
            path=str(output_path),
            media_type="audio/midi",
            filename=f"transcription_{selected_model}.mid",
            background=background_tasks,
        )

    except Exception as e:
        cleanup_files([str(input_path), str(output_path)])
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )



@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file"""
    try:
        # Validate file type
        allowed_extensions = {'.wav', '.mp3', '.flac', '.ogg', '.m4a'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return JSONResponse(
                {"status": "error", "message": f"File type not supported. Allowed: {', '.join(allowed_extensions)}"},
                status_code=400,
            )
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{RECORDINGS_DIR}/uploaded_{timestamp}{file_ext}"
        
        # Save uploaded file
        with open(filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return JSONResponse(
            {
                "status": "success",
                "message": "Audio file uploaded successfully",
                "filename": filename,
            }
        )
    except Exception as e:
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500,
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
