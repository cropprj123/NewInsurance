import os
import json
import numpy as np
import cv2
import base64
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from sklearn.exceptions import InconsistentVersionWarning
import warnings
from googletrans import Translator
import pandas as pd
from typing import Union, List, Dict, Any
import google.generativeai as genai
from PIL import Image
import logging
from moviepy.video.io.VideoFileClip import VideoFileClip
import tempfile
from datetime import datetime
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
# Suppress warnings
warnings.simplefilter("ignore", InconsistentVersionWarning)

app = Flask(__name__)
CORS(app)
translator = Translator()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Load machine learning models
RF_model = joblib.load('crop.joblib')
lg_model = joblib.load('logistic_regression_model.joblib')

df = pd.read_csv('Crop_recommendation.csv')
desired = pd.read_csv('Crop_NPK.csv')

disease_model = YOLO('best.pt')  # Crop disease detection model
with open('description.json', 'r') as file:
    fertilizer_dict = json.load(file)

# Load disease information
with open('diseasedescription.json', 'r') as file:
    disease_info = json.load(file)

@app.route('/detect_crop_disease_video', methods=['POST'])
def detect_crop_disease_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video provided', 'message': 'No video uploaded'}), 400
        
        video_file = request.files['video']
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        video_file.save(temp_video.name)
        temp_video.close()

        cap = cv2.VideoCapture(temp_video.name)
        if not cap.isOpened():
            return jsonify({'error': 'Failed to open video', 'message': 'Invalid video file'}), 400

        unique_diseases = {}  # Track count, max confidence, and info
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = disease_model.predict(source=frame, conf=0.25)

            for result in results:
                for box in result.boxes:
                    disease_class = disease_model.names[int(box.cls)]
                    confidence = box.conf.item()
                    disease_info = get_disease_info(disease_class)

                    # Update count and max confidence
                    if disease_class in unique_diseases:
                        unique_diseases[disease_class]['count'] += 1
                        if confidence > unique_diseases[disease_class]['max_confidence']:
                            unique_diseases[disease_class]['max_confidence'] = confidence
                    else:
                        unique_diseases[disease_class] = {
                            'count': 1,
                            'max_confidence': confidence,
                            'info': disease_info
                        }

        cap.release()
        os.unlink(temp_video.name)

        # Convert to list and sort by count (descending), then confidence (descending)
        unique_predictions = [
            {
                'disease': disease,
                'count': details['count'],
                'confidence': details['max_confidence'],
                'info': details['info']
            }
            for disease, details in unique_diseases.items()
        ]

        # Sort by most frequent, then by highest confidence
        sorted_predictions = sorted(
            unique_predictions,
            key=lambda x: (-x['count'], -x['confidence'])
        )

        return jsonify({
            'predictions': sorted_predictions,
            'message': 'Crop disease detection from video completed'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Crop disease detection from video failed'}), 500

def translate_batch(texts: Union[str, List[str]], dest: str = 'mr') -> Union[str, List[str]]:
    """
    Translate a single text or list of texts to the target language.
    
    Args:
        texts: Single string or list of strings to translate
        dest: Target language code (default: 'mr' for Marathi)
    
    Returns:
        Translated string or list of translated strings
    """
    try:
        if isinstance(texts, str):
            translation = translator.translate(texts, dest=dest)
            return translation.text
        elif isinstance(texts, list):
            if not texts:  # Handle empty list
                return texts
            translations = translator.translate(texts, dest=dest)
            # Handle both single and multiple translations
            if isinstance(translations, list):
                return [t.text for t in translations]
            else:
                return [translations.text]
    except Exception as e:
        print(f"Translation error: {e}")
        return texts

def translate_recursive(obj: Any, dest: str = 'mr') -> Any:
    """
    Recursively translate all strings in a nested structure.
    
    Args:
        obj: Object to translate (dict, list, or string)
        dest: Target language code
    
    Returns:
        Translated object maintaining the original structure
    """
    if isinstance(obj, dict):
        return {k: translate_recursive(v, dest) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_recursive(item, dest) for item in obj]
    elif isinstance(obj, str):
        if len(obj) > 1 and not obj.isupper() and not obj.isdigit():
            return translate_batch(obj, dest)
    return obj


@app.route('/translate', methods=['POST'])
def translate_endpoint():
    try:
        data = request.json.get('text')
        target_language = request.json.get('lang', 'en')
        
        # Parse JSON if it's a JSON string
        try:
            parsed_data = json.loads(data)
        except:
            parsed_data = data
        
        # Translate the data
        translated_data = translate_recursive(parsed_data, dest=target_language)
        
        return jsonify({
            'original_text': data,
            'translated_text': json.dumps(translated_data)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Load disease information
with open('diseasedescription.json', 'r') as file:
    disease_info = json.load(file)

def get_disease_info(disease_name):
    # Normalize the disease name for comparison
    disease_name = disease_name.strip().lower()
    for disease in disease_info:
        if disease['name'].strip().lower() == disease_name:
            return disease
    return None

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
            return jsonify({'error': 'No image provided', 'message': 'No image uploaded'}), 400
        
        # Run inference (assuming disease_model is defined elsewhere)
        results = disease_model.predict(source=image, conf=0.25)
        
        # Prepare response
        disease_predictions = []
        for result in results:
            for box in result.boxes:
                disease_class = disease_model.names[int(box.cls)]
                confidence = box.conf.item()
                disease_info = get_disease_info(disease_class)
                disease_predictions.append({
                    'disease': disease_class,
                    'confidence': float(confidence),
                    'info': disease_info
                })
        
        return jsonify({
            'predictions': disease_predictions,
            'message': 'Crop disease detection completed'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Crop disease detection failed'}), 500

@app.route('/withinfo_predict_crop', methods=['POST'])
def withinfo_predict_crop():
    try:
        if 'data' not in request.json or len(request.json['data']) < 7:
            return jsonify({
                'error': 'Insufficient input data',
                'message': 'Provide at least 7 input features'
            }), 400

        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = RF_model.predict(input_data)
        predicted_crop = prediction[0]

        crop_data = desired[desired['Crop'] == predicted_crop]
        
        if crop_data.empty:
            return jsonify({
                'error': 'Crop data not found',
                'message': f'No data available for crop: {predicted_crop}'
            }), 404

        n_diff = crop_data['N'].values[0] - input_data[0][0]
        p_diff = crop_data['P'].values[0] - input_data[0][1]
        k_diff = crop_data['K'].values[0] - input_data[0][2]

        def get_nutrient_description(diff, nutrient):
            if diff < 0:
                return fertilizer_dict.get(f'{nutrient}High', '')
            elif diff > 0:
                return fertilizer_dict.get(f'{nutrient}low', '')
            else:
                return fertilizer_dict.get(f'{nutrient}No', '')

        n_desc = get_nutrient_description(n_diff, 'N')
        p_desc = get_nutrient_description(p_diff, 'P')
        k_desc = get_nutrient_description(k_diff, 'K')

        return jsonify({
            'prediction': prediction.tolist(),
            'n_desc': n_desc,
            'p_desc': p_desc,
            'k_desc': k_desc,
            'message': 'Crop prediction and fertilizer recommendation completed'
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Crop prediction failed'
        }), 500


@app.route('/predict_crop', methods=['POST'])
def predict_crop():
    try:
        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = RF_model.predict(input_data)
        return jsonify({
            'prediction': prediction.tolist(),
            'message': 'Crop prediction completed'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Crop prediction failed'
        }), 500

@app.route('/singlecrop', methods=['POST'])
def single_crop():
    try:
        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = RF_model.predict(input_data)
        return jsonify({
            'prediction': prediction.tolist(),
            'message': 'Single crop prediction completed'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Single crop prediction failed'
        }), 500

@app.route('/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        input_data = np.array(request.json['data']).reshape(1, -1)
        prediction = lg_model.predict(input_data)
        return jsonify({
            'prediction': prediction.tolist(),
            'message': 'Fertilizer prediction completed'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Fertilizer prediction failed'
        }), 500


# Add the forecast endpoint
@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        data = request.json
        target_year = int(data.get('year'))
        target_month = int(data.get('month'))
        
        if not target_year or not target_month:
            return jsonify({'error': 'Year and month are required'}), 400
            
        target_date = datetime(target_year, target_month, 1)
        
        # Load and preprocess data
        try:
            df = pd.read_excel("uniform_3year_bookings.xlsx")
        except FileNotFoundError:
            logger.error("Sales data file not found")
            return jsonify({
                'error': 'Sales data file not found',
                'message': 'The required historical sales data is missing'
            }), 500
        
        df['Date'] = pd.to_datetime(df['Date & Time']).dt.date
        df_aggregated = df.groupby(['Product Name', 'Date']).size().reset_index(name='Sales')
        
        # Forecast for all products
        all_predictions = {}
        products = df_aggregated['Product Name'].unique()
        
        for product in products:
            product_data = df_aggregated[df_aggregated['Product Name'] == product]
            df_prophet = product_data[['Date', 'Sales']].rename(columns={'Date': 'ds', 'Sales': 'y'})
            df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])
            
            # Sanitize product name for filename
            sanitized_product = "".join([c if c.isalnum() else "_" for c in product])
            model_path = f"picklemodels/{sanitized_product}_prophet_model.pkl"
            
            try:
                # Train new model
                model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
                model.fit(df_prophet)
                print(f"Trained model for: {product}")
                
                # Calculate forecast period
                last_date = df_prophet['ds'].max()
                periods = (target_date - last_date).days + 30
                if periods < 0:
                    periods = 30
                
                # Generate forecast
                future = model.make_future_dataframe(periods=periods)
                forecast = model.predict(future)
                
                # Filter predictions for target month
                target_month_data = forecast[
                    (forecast['ds'].dt.month == target_date.month) & 
                    (forecast['ds'].dt.year == target_date.year)
                ]
                total_predicted_sales = target_month_data['yhat'].sum()
                all_predictions[product] = max(0, round(total_predicted_sales))
                
            except Exception as e:
                print(f"Error processing {product}: {str(e)}")
                all_predictions[product] = None
        
        # Calculate restock quantities with 20% buffer
        predictions_df = pd.DataFrame(
            list(all_predictions.items()), 
            columns=['Product', 'Predicted_Sales']
        )
        predictions_df['Restock_Quantity'] = (predictions_df['Predicted_Sales'] * 1.2).round().astype(int)
        predictions_df = predictions_df.sort_values(by='Predicted_Sales', ascending=False)
        
        # Cross-validation for each product
        evaluation_results = {}
        
        for product in products:
            product_data = df_aggregated[df_aggregated['Product Name'] == product]
            
            # Skip products with too little data
            if len(product_data) < 30:
                print(f"Skipping {product} - insufficient data")
                continue
                
            df_prophet = product_data[['Date', 'Sales']].rename(columns={'Date': 'ds', 'Sales': 'y'})
            df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])
            
            # Get the last 20% of data for testing
            cutoff_point = int(len(df_prophet) * 0.8)
            training_data = df_prophet.iloc[:cutoff_point]
            testing_data = df_prophet.iloc[cutoff_point:]
            
            if len(testing_data) < 7:  # Need at least a week of data to test
                print(f"Skipping {product} - insufficient test data")
                continue
            
            # Train on training data
            model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
            model.fit(training_data)
            
            # Predict for the test period
            future = model.make_future_dataframe(periods=len(testing_data))
            forecast = model.predict(future)
            
            # Extract the predictions for the test period
            predictions = forecast.iloc[-len(testing_data):]
            
            # Calculate error metrics
            y_true = testing_data['y'].values
            y_pred = predictions['yhat'].values
            
            mae = mean_absolute_error(y_true, y_pred)
            rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            
            # Handle zeros in MAPE calculation
            nonzero_indices = y_true != 0
            if np.sum(nonzero_indices) > 0:
                mape = mean_absolute_percentage_error(y_true[nonzero_indices], y_pred[nonzero_indices]) * 100
            else:
                mape = np.nan
            
            evaluation_results[product] = {
                'MAE': mae,
                'RMSE': rmse,
                'MAPE': mape
            }
        
        # Calculate overall metrics
        if evaluation_results:
            avg_mae = np.mean([metrics['MAE'] for metrics in evaluation_results.values()])
            avg_rmse = np.mean([metrics['RMSE'] for metrics in evaluation_results.values()])
            avg_mape = np.nanmean([metrics['MAPE'] for metrics in evaluation_results.values()])
        else:
            avg_mae = avg_rmse = avg_mape = None
        
        # Prepare response
        predictions_list = []
        for _, row in predictions_df.iterrows():
            product = row['Product']
            predictions_list.append({
                'product': product,
                'predicted_sales': int(row['Predicted_Sales']),
                'restock_quantity': int(row['Restock_Quantity']),
                'evaluation': evaluation_results.get(product, {
                    'MAE': None,
                    'RMSE': None,
                    'MAPE': None
                })
            })
        
        # Save results to CSV
        output_filename = f"forecast_results_{target_date.strftime('%Y%m')}.csv"
        # predictions_df.to_csv(output_filename, index=False)
        
        return jsonify({
            'target_date': target_date.strftime('%B %Y'),
            'predictions': predictions_list,
            'top_product': predictions_list[0] if predictions_list else None,
            'output_file': output_filename,
            'overall_metrics': {
                'average_mae': float(avg_mae) if avg_mae is not None else None,
                'average_rmse': float(avg_rmse) if avg_rmse is not None else None,
                'average_mape': float(avg_mape) if avg_mape is not None else None
            }
        })
        
    except Exception as e:
        print("Forecast Error:", str(e))  # For debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)