(() => {
    const uploadBtn = document.getElementById('uploadBtn');
    const audioFileInput = document.getElementById('audioFileInput');
    const uploadStatusDiv = document.getElementById('uploadStatus');
    const uploadMessageDiv = document.getElementById('uploadMessage');

    if (!uploadBtn || !audioFileInput || !uploadStatusDiv || !uploadMessageDiv) return;

    const state = (window.appState = window.appState || {});
    const API_URL = state.apiUrl || 'http://localhost:8000';

    async function uploadAudioFile(file) {
        try {
            uploadBtn.disabled = true;
            uploadStatusDiv.classList.remove('error', 'success');
            uploadStatusDiv.classList.add('show');
            uploadMessageDiv.textContent = 'Uploading file...';

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/upload-audio`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload audio file');
            }

            state.audioFileForTranscription = file;
            if (typeof window.setAudioFileForTranscription === 'function') {
                window.setAudioFileForTranscription(file);
            }

            uploadStatusDiv.classList.add('success');
            uploadMessageDiv.textContent = `✓ File uploaded successfully: ${data.filename}`;
            uploadBtn.disabled = false;
            audioFileInput.value = '';
        } catch (error) {
            console.error('Upload error:', error);
            uploadStatusDiv.classList.add('error');
            uploadMessageDiv.textContent = `✗ Upload failed: ${error.message}`;
            uploadBtn.disabled = false;
        }
    }

    audioFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadAudioFile(file);
        }
    });

    uploadBtn.addEventListener('click', () => {
        audioFileInput.click();
    });
})();
