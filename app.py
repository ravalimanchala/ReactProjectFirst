from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

SARVAM_API_BASE_URL = "https://api.sarvam.ai"
API_KEY = "c6e31ee2-0155-4640-99f1-5fb0c012bc87"  # Replace with your actual API key

# Speech to Text Translate (Multilingual to English)
@app.route('/stt-translate', methods=['POST'])
def speech_to_text_translate():
    audio = request.files['audio']
    files = {'file': (audio.filename, audio, 'audio/wav')}
    payload = {'model': 'saaras:v1', 'prompt': ''}  # 'saaras:v1' model for multilingual STT to English
    
    response = requests.post(f'{SARVAM_API_BASE_URL}/speech-to-text-translate', headers={'api-subscription-key': API_KEY}, data=payload, files=files)
    
    return jsonify(response.json())

# Text to Speech (TTS) - Always outputs in English
@app.route('/tts', methods=['POST'])
def text_to_speech():
    text = request.json.get('text')
    payload = {
        "inputs": [text],
        "target_language_code": "en-IN",  # Output in English only
        "speaker": "meera",
        "model": "bulbul:v1",
        "speech_sample_rate": 8000,
        "enable_preprocessing": True
    }
    response = requests.post(f'{SARVAM_API_BASE_URL}/text-to-speech', json=payload, headers={'api-subscription-key': API_KEY})
    # Ensure we return the 'audio_url' key from Sarvam's response
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Text-to-Speech failed"}), response.status_code

# Render UI
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
