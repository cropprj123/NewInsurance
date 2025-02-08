/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Link, Routes, Route } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  AlertCircle,
  Check,
  Loader2,
  Leaf,
  Cloud,
  ShoppingCart,
  Sprout,
  BarChart3,
} from "lucide-react";

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/crops/detect-crop-disease",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            lang: selectedLanguage,
          },
        }
      );

      setPrediction(response.data.predictions[0]);
    } catch (error) {
      console.error("Error detecting crop disease:", error);
      setError("Failed to detect crop disease. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Crop Disease Detection
        </h1>
        <p className="mt-2 text-gray-600">
          Upload images of your crops for instant disease analysis
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Easy Upload</h3>
          <p className="mt-2 text-sm text-gray-600">
            Upload your crop images securely for instant analysis
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Quick Detection</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get results within seconds using our AI technology
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Expert Analysis</h3>
          <p className="mt-2 text-sm text-gray-600">
            Receive detailed insights and treatment recommendations
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Disease Detection Tool
          </h2>
          <p className="mt-1 text-gray-600">
            Upload a clear image of your crop for analysis
          </p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-gray-600 font-medium">
                    {isLoading ? "Processing..." : "Click to upload"}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    or drag and drop
                  </span>
                </label>
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {prediction && !error && (
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Analysis Result
                    </h3>
                    <p className="text-green-600">{prediction.disease}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              {selectedImage ? (
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Uploaded Crop"
                    className="w-full h-full object-cover"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Language Selection Dropdown */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
              <option value="gu">ગુજરાતી</option>
              <option value="de">German</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>

      {prediction && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {prediction.disease}
            </h2>
            <p className="mt-2 text-gray-600">
              {prediction.info.scientificName}
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-800">
                {prediction.info.detailedDescription}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Causes Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Causes
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {prediction.info.causes.map((cause, index) => (
                  <li key={index} className="p-3 bg-gray-50 rounded-lg">
                    {cause}
                  </li>
                ))}
              </ul>
            </div>

            {/* Spreading Conditions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Spreading Conditions
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {prediction.info.spreadingConditions.map((condition, index) => (
                  <li key={index} className="p-3 bg-gray-50 rounded-lg">
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Crop Info Section */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800">
                Affected Crop
              </h4>
              <p className="mt-2 text-gray-600">
                {prediction.info.cropAffected}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800">
                Scientific Name
              </h4>
              <p className="mt-2 text-gray-600">
                {prediction.info.scientificName}
              </p>
            </div>
          </div>

          {/* Existing Symptoms and Prevention Sections */}
          {/* ... Keep previous symptoms and prevention sections here ... */}

          {/* Updated Treatment Section with Cultural Methods */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Treatment Options
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Chemical Treatments */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Chemical
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {prediction.info.treatment.chemical.map(
                    (treatment, index) => (
                      <li key={index} className="p-3 bg-gray-50 rounded-lg">
                        {treatment}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Cultural Practices */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Cultural
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {prediction.info.treatment.cultural.map((practice, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-lg">
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organic Treatments */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Organic
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {prediction.info.treatment.organic.map((treatment, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-lg">
                      {treatment}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Prevention Section */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Prevention
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {prediction.info.prevention.map((measure, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg flex items-start"
                >
                  <span className="text-green-600 mr-2">✓</span>
                  <p className="text-gray-800">{measure}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Products Section */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recommended Products
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prediction.info.recommendedProducts.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-green-200 flex items-center"
                >
                  <ShoppingCart className="w-5 h-5 text-green-600 mr-3" />
                  <p className="text-gray-800">{product}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// Soil Analysis Component
const SoilAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    pH: "",
    rainfall: "",
  });
  const [prediction, setPrediction] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const resultsRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { N, P, K, temperature, humidity, pH, rainfall } = inputData;

    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/v1/crops/infopredict",
        {
          params: {
            data: [N, P, K, temperature, humidity, pH, rainfall].map(
              parseFloat
            ),
            lang: selectedLanguage,
          },
        }
      );
      setPrediction(response.data);
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Soil Analysis & Crop Recommendation
        </h1>
        <p className="mt-2 text-gray-600">
          Enter your soil parameters to get personalized crop recommendations
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Soil Parameters
            </h2>
            <p className="mt-1 text-gray-600">
              Enter accurate measurements for best results
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nitrogen (N)
                </label>
                <input
                  type="number"
                  name="N"
                  value={inputData.N}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter N value"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phosphorus (P)
                </label>
                <input
                  type="number"
                  name="P"
                  value={inputData.P}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter P value"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potassium (K)
                </label>
                <input
                  type="number"
                  name="K"
                  value={inputData.K}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter K value"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={inputData.temperature}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter temperature"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  value={inputData.humidity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter humidity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  pH Level
                </label>
                <input
                  type="number"
                  name="pH"
                  value={inputData.pH}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter pH"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="rainfall"
                  value={inputData.rainfall}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter rainfall"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="mr">मराठी</option>
                  <option value="hi">हिंदी</option>
                  <option value="gu">ગુજરાતી</option>
                  <option value="de">German</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Soil"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Quick Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• Enter values in their respective units</li>
              <li>• Ensure all measurements are recent</li>
              <li>• pH should be between 0-14</li>
              <li>• Temperature in Celsius</li>
              <li>• Humidity in percentage</li>
              <li>• Rainfall in millimeters</li>
            </ul>
          </div>
        </div>
      </div>

      {prediction.crop && (
        <div
          ref={resultsRef}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Analysis Results
            </h2>
            <p className="mt-1 text-gray-600">
              Recommended crop and soil improvements
            </p>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Recommended Crop:{" "}
                <span className="text-gray-800">{prediction.crop}</span>
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Nitrogen (N) Analysis
                </h4>
                <p className="text-gray-600">
                  {prediction.nitrogen?.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Phosphorus (P) Analysis
                </h4>
                <p className="text-gray-600">
                  {prediction.phosphorus?.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Potassium (K) Analysis
                </h4>
                <p className="text-gray-600">
                  {prediction.potassium?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main Features Page Component
const FeaturesPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-green-600 to-green-700 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Smart Farming</h2>
          <nav className="space-y-2">
            <Link
              to="/features"
              className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/20 border border-green-500/30"
            >
              <Leaf className="w-5 h-5" />
              <span>Disease Detection</span>
            </Link>
            <Link
              to="/features/soil"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Sprout className="w-5 h-5" />
              <span>Soil Analysis</span>
            </Link>
            <Link
              to="/features/weather"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Cloud className="w-5 h-5" />
              <span>Weather Forecast</span>
            </Link>
            <Link
              to="/features/market"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Market Prices</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Routes>
            <Route path="/" element={<DiseaseDetection />} />
            <Route path="/soil" element={<SoilAnalysis />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
