from flask import Flask, render_template

app = Flask(__name__)

TRANSCRIPTION_MODELS = [
    {"value": "transkun", "label": "Transkun"},
    {"value": "onsets_and_frames", "label": "Onsets and Frames"},
]
DEFAULT_TRANSCRIPTION_MODEL = "transkun"


@app.route('/')
def index():
    return render_template(
        'index.html',
        transcription_models=TRANSCRIPTION_MODELS,
        default_transcription_model=DEFAULT_TRANSCRIPTION_MODEL,
    )

if __name__ == '__main__':
    app.run(debug=True)
