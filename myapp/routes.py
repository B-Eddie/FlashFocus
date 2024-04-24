from flask import render_template, request, jsonify
from app import app
import os
import uuid
from datetime import datetime

def generate_unique_filename(filename):
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    random_string = uuid.uuid4().hex[:6]  # Generate a random string
    filename_without_extension, file_extension = os.path.splitext(filename)
    return f"{filename_without_extension}_{timestamp}_{random_string}{file_extension}"


UPLOAD_FOLDER = "myapp/static/uploads"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about-us.html')

@app.route('/highlightify')
def highlightify():
    return render_template('highlightify.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        filename = generate_unique_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({'filename': file.filename})
    else:
        return jsonify({'error': 'Upload failed'})
    