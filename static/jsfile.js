// File upload and translation (Speech to Text in English)
document.getElementById('upload-file-btn').addEventListener('click', async () => {
    const audioFile = document.getElementById('audio-file').files[0];
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch('/stt-translate', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    document.getElementById('file-upload-result').innerText = result.transcript;
});

// Text to Speech (TTS) in English
document.getElementById('tts-button').addEventListener('click', async () => {
    const text = document.getElementById('tts-text').value;
    const response = await fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const result = await response.json();
    document.getElementById('tts-audio').src = result.audio_url;
    document.getElementById('tts-audio').play();
});

// Recording functionality with timer
let mediaRecorder;
let audioChunks = [];
let recordingStartTime;
let recordingInterval;

document.getElementById('start-record-btn').addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    recordingStartTime = Date.now();
    recordingInterval = setInterval(updateTimer, 1000);

    document.getElementById('start-record-btn').disabled = true;
    document.getElementById('stop-record-btn').disabled = false;

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);
        document.getElementById('recorded-audio').src = audioURL;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recorded.wav');
        fetch('/stt-translate', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            document.getElementById('record-result').innerText = result.transcript;
        });

        clearInterval(recordingInterval);
        document.getElementById('timer').innerText = "00:00";
        document.getElementById('start-record-btn').disabled = false;
        document.getElementById('stop-record-btn').disabled = true;
    };
});

document.getElementById('stop-record-btn').addEventListener('click', () => {
    mediaRecorder.stop();
    audioChunks = [];
});

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - recordingStartTime) / 1000);
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${minutes}:${seconds}`;
}
