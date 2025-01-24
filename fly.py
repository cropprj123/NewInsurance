import os
import numpy as np
import cv2
import base64
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from sklearn.exceptions import InconsistentVersionWarning
import warnings

# Suppress warnings
warnings.simplefilter("ignore", InconsistentVersionWarning)

app = Flask(__name__)
CORS(app)

# Load machine learning models
RF_model = joblib.load('crop.joblib')
lg_model = joblib.load('logistic_regression_model.joblib')
disease_model = YOLO('best.pt')  # Crop disease detection model

@app.route('/detect_crop_disease', methods=['POST'])
def detect_crop_disease():
    try:
        # Receive base64 encoded image or file upload
        if 'image' in request.files:
            # File upload method
            file = request.files['image']
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif request.json and 'image' in request.json:
            # Base64 encoded image method
            image_base64 = request.json.get('image')
            image_bytes = base64.b64decode(image_base64)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            return jsonify({'error': 'No image provided'}), 400
        
        # Run inference
        results = disease_model.predict(source=image, conf=0.25)
        
        # Prepare response
        disease_predictions = []
        for result in results:
            for box in result.boxes:
                disease_class = disease_model.names[int(box.cls)]
                confidence = box.conf.item()
                disease_predictions.append({
                    'disease': disease_class,
                    'confidence': float(confidence)
                })
        
        return jsonify({
            'predictions': disease_predictions
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict_crop', methods=['POST'])
def predict_crop():
    try:
        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = RF_model.predict(input_data)
        return jsonify({'prediction': prediction.tolist()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/singlecrop', methods=['POST'])
def single_crop():
    try:
        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = RF_model.predict(input_data)
        return jsonify({'prediction': prediction.tolist()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = lg_model.predict(input_data)
        return jsonify({'prediction': prediction.tolist()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)