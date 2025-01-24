import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import warnings
from sklearn.exceptions import InconsistentVersionWarning

warnings.simplefilter("ignore", InconsistentVersionWarning)

app = Flask(__name__)
CORS(app)

# Load the models
RF_model = joblib.load('crop.joblib')
lg_model = joblib.load('logistic_regression_model.joblib')

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
    app.run(debug=True)