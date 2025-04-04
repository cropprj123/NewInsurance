import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { useNavigate } from 'react-router-dom';

const MapWithLocation = ({ location }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

    if (!location) return;

    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [location.longitude, location.latitude],
        zoom: 14
      });

      // Add marker
      new maptilersdk.Marker({ color: "#DD5746" })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new maptilersdk.Popup().setHTML("Your Location"))
        .addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location]);

  return (
    <div
      ref={mapContainer}
      className="h-[500px] w-full rounded-lg overflow-hidden"
    />
  );
};

const DiseaseLocationReport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          console.error('Location Error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    if (!location) {
      setError('Location data is required. Please enable location services.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);

    try {
      const response = await axios.post('/api/v1/farmer-disease-locations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);

      // Show success message with disease prediction
      const prediction = response.data.data.prediction;
      setSuccess(`Successfully reported ${prediction.disease} with ${(prediction.confidence * 100).toFixed(1)}% confidence`);
    } catch (error) {
      console.error('Submission Error:', error);
      setError(error.response?.data?.message || 'Failed to submit disease report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Report Disease Location
          </h1>

          {locationError && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{locationError}</p>
            </div>
          )}

          {location && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
            </div>
          )}

          {/* Map Container */}
          <div className="mb-6">
            {location ? (
              <MapWithLocation location={location} />
            ) : (
              <div className="h-[500px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Waiting for location...</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-6 text-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[300px] object-contain mx-auto"
                />
              </div>
            )}

            {/* Upload Button */}
            <div className="text-center mb-6">
              <input
                accept="image/*"
                type="file"
                id="image-upload"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label 
                htmlFor="image-upload" 
                className="bg-mycol-mint hover:bg-mycol-mint-2 text-white px-6 py-3 rounded-lg shadow-md inline-flex items-center space-x-2 cursor-pointer transition-all hover:shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>Select Image</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>{success}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate('/features/disease-reports')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Check Reports
                </motion.button>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!selectedFile || loading || !location}
                className="bg-gradient-to-r from-mycol-mint to-mycol-mint-2 text-white px-10 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      <div className="h-px bg-gray-200 w-full my-8"></div>
    </div>
  );
};

export default DiseaseLocationReport; 