from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pyaudio
import wave
import threading
from datetime import datetime
import os

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audio recording configuration
CHUNK = 1024
FORMAT = pyaudio.paInt16 
CHANNELS = 1
RATE = 44100
RECORDINGS_DIR = "recordings"

# Create recordings directory if it doesn't exist
if not os.path.exists(RECORDINGS_DIR):
    os.makedirs(RECORDINGS_DIR)

# Global recording state
recording_state = {
    "is_recording": False,
    "stream": None,
    "audio": None,
    "frames": [],
    "filename": None,
}

def record_audio():
    """Background thread function to record audio"""
    try:
        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )
        
        recording_state["audio"] = audio
        recording_state["stream"] = stream
        recording_state["frames"] = []
        
        while recording_state["is_recording"]:
            data = stream.read(CHUNK)
            recording_state["frames"].append(data)
    except Exception as e:
        print(f"Recording error: {e}")

@app.get("/")
def hello():
    return JSONResponse({"message": "Hello World"})

@app.post("/start-recording")
def start_recording():
    """Start audio recording in a background thread"""
    if recording_state["is_recording"]:
        return JSONResponse(
            {"status": "error", "message": "Recording already in progress"},
            status_code=400,
        )
    
    recording_state["is_recording"] = True
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    recording_state["filename"] = f"{RECORDINGS_DIR}/recording_{timestamp}.wav"
    
    # Start recording in a background thread
    thread = threading.Thread(target=record_audio)
    thread.daemon = True
    thread.start()
    
    return JSONResponse({"status": "success", "message": "Recording started"})

@app.post("/stop-recording")
def stop_recording():
    """Stop audio recording and save the file"""
    if not recording_state["is_recording"]:
        return JSONResponse(
            {"status": "error", "message": "No recording in progress"},
            status_code=400,
        )
    
    recording_state["is_recording"] = False
    
    try:
        # Stop the stream
        if recording_state["stream"]:
            recording_state["stream"].stop_stream()
            recording_state["stream"].close()
        
        # Close PyAudio
        if recording_state["audio"]:
            recording_state["audio"].terminate()
        
        # Save the recording to a WAV file
        if recording_state["frames"] and recording_state["filename"]:
            with wave.open(recording_state["filename"], "wb") as wf:
                wf.setnchannels(CHANNELS)
                wf.setsampwidth(pyaudio.PyAudio().get_sample_size(FORMAT))
                wf.setframerate(RATE)
                wf.writeframes(b"".join(recording_state["frames"]))
            
            return JSONResponse(
                {
                    "status": "success",
                    "message": "Recording saved",
                    "filename": recording_state["filename"],
                }
            )
        else:
            return JSONResponse(
                {"status": "error", "message": "No audio data recorded"},
                status_code=400,
            )
    except Exception as e:
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500,
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
