/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ProcessingAnimation from "../ProcessingAnimation";
import DiseasesPanel from "./DiseasesPanel";
import axios from "axios";
import Webcam from "react-webcam"; // Add this import
import {
  Upload,
  AlertCircle,
  Check,
  Loader2,
  ShoppingCart,
  Sprout,
  Camera,
  X,
  RefreshCw,
  ExternalLink,
  Layers,
  Info,
  Zap,
  ShieldAlert,
  Shield,
} from "lucide-react";

// todo : disease panel hidden on small screen

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [processingStep, setProcessingStep] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Add this array for processing steps
  const processingSteps = [
    { id: 1, text: "Uploading image...", delay: 1000 },
    { id: 2, text: "Processing image...", delay: 2000 },
    { id: 3, text: "Analyzing image...", delay: 2000 },
    { id: 4, text: "Translating results...", delay: 1500 },
  ];

  // Function to start camera
  const startCamera = () => {
    setIsUsingCamera(true);
    setSelectedImage(null);
    setError("");
  };

  // Function to stop camera
  const stopCamera = () => {
    setIsUsingCamera(false);
  };

  // Function to capture photo from camera
  const handleCameraCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc)
    {
      setSelectedImage(imageSrc);
      setIsUsingCamera(false);
    }
  }, [webcamRef]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setIsUsingCamera(false); // Stop camera if it's running
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPrediction(null);
    setIsSubmitted(false);
  };

  const fetchProductsByName = async (name) => {
    try
    {
      // Search for the exact product name
      const response = await axios.get(`http://localhost:5173/api/v1/crops/search?name=${encodeURIComponent(name)}`);
      console.log('Search response for:', name, response.data);

      // Filter products to match exact name (case-insensitive)
      const exactMatches = response.data.data.crop.filter(product =>
        product.name.toLowerCase() === name.toLowerCase()
      );

      return exactMatches;
    } catch (error)
    {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage)
    {
      setError("Please select or capture an image first");
      return;
    }

    setIsSubmitted(true);
    setError("");
    setProcessingStep(1);

    const formData = new FormData();
    const file = await fetch(selectedImage)
      .then((r) => r.blob())
      .then(
        (blobFile) => new File([blobFile], "image.jpg", { type: "image/jpeg" })
      );

    formData.append("image", file);

    try
    {
      // Simulate steps with delays
      for (let step of processingSteps)
      {
        setProcessingStep(step.id);
        await new Promise((resolve) => setTimeout(resolve, step.delay));
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // Only add language parameter if it's not English
      if (selectedLanguage !== "en")
      {
        config.params = { lang: selectedLanguage };
      }

      const response = await axios.post(
        "/api/v1/crops/detect-crop-disease",
        formData,
        config
      );

      setPrediction(response.data.predictions[0]);
      setActiveTab('overview');

      // Fetch product recommendations if available
      if (response.data.predictions[0]?.info?.recommendedProducts)
      {
        const recommendedProducts = response.data.predictions[0].info.recommendedProducts;
        const productResults = await Promise.all(
          recommendedProducts.map(productName => fetchProductsByName(productName))
        );
        setSuggestedProducts(productResults.flat().filter(Boolean));
      }
    } catch (error)
    {
      console.error("Error detecting crop disease:", error);
      setError("Failed to detect crop disease. Please try again.");
    } finally
    {
      setIsSubmitted(false);
      setProcessingStep(null);
    }
  };

  const TabButton = ({ id, label, active, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-mycol-mint text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  // Render confidence indicator
  const renderConfidenceIndicator = (confidence) => {
    const percentage = Math.round(confidence * 100);
    const getColor = () => {
      if (percentage > 85) return "bg-green-500";
      if (percentage > 70) return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <div className="flex items-center space-x-4">
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${getColor()}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
    );
  };

  return (
    <>
      <div className="h-[calc(100vh-64px)] overflow-y-auto p-6 md:pr-80 pr-0 flex flex-col">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Crop Disease Detection
            </h1>
            <p className="mt-2 text-gray-800">
              Upload or capture images of your crops for instant disease analysis
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-mycol-nyanza rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-mycol-mint" />
              </div>
              <h3 className="font-semibold text-gray-800">Easy Upload</h3>
              <p className="mt-2 text-sm text-gray-800">
                Upload your crop images securely for instant analysis
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-mycol-nyanza rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-mycol-mint" />
              </div>
              <h3 className="font-semibold text-gray-800">Quick Detection</h3>
              <p className="mt-2 text-sm text-gray-800">
                Get results within seconds using our AI technology
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-mycol-nyanza rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-mycol-mint" />
              </div>
              <h3 className="font-semibold text-gray-800">Expert Analysis</h3>
              <p className="mt-2 text-sm text-gray-800">
                Receive detailed insights and treatment recommendations
              </p>
            </div>
          </div>

          {/* Main Detection Tool */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Disease Detection Tool
              </h2>
              <p className="mt-1 text-gray-800">
                Upload or capture a clear image of your crop for analysis
              </p>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Upload and Controls */}
                <div className="space-y-6">
                  {!isSubmitted ? (
                    <>
                      {/* Upload Area - Only shown when camera is not active and no image selected */}
                      {!isUsingCamera && !selectedImage && (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            ref={fileInputRef}
                          />
                          <label
                            htmlFor="image-upload"
                            className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-mycol-celadon rounded-lg bg-mycol-nyanza/20 hover:bg-mycol-nyanza/30 transition-colors duration-200 cursor-pointer"
                          >
                            <Upload className="w-12 h-12 text-gray-800 mb-4 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-gray-800 font-medium">
                              Click to upload
                            </span>
                            <span className="text-sm text-gray-800 mt-2">
                              or drag and drop
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Camera and Upload Buttons */}
                      {!isUsingCamera && !selectedImage && (
                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={startCamera}
                            className="px-5 py-3 bg-mycol-celadon text-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-2"
                          >
                            <Camera className="w-5 h-5" />
                            <span>Use Camera</span>
                          </button>
                        </div>
                      )}

                      {/* Language Selection */}
                      {selectedImage && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                              Select Language for Results
                            </label>
                            <select
                              value={selectedLanguage}
                              onChange={(e) =>
                                setSelectedLanguage(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-mycol-celadon rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
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
                      )}
                    </>
                  ) : (
                    <ProcessingAnimation currentStep={processingStep} />
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center p-4 bg-red-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Image Preview */}
                <div className="relative">
                  {/* Camera View - Moved to right column */}
                  {isUsingCamera ? (
                    <div className="relative h-64">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-64 rounded-lg border border-mycol-celadon"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                        <button
                          onClick={handleCameraCapture}
                          className="px-4 py-2 bg-mycol-mint text-white rounded-lg flex items-center space-x-2"
                        >
                          <Camera className="w-5 h-5" />
                          <span>Capture</span>
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : selectedImage ? (
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Uploaded Crop"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={resetImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {isSubmitted && (
                        <div className="absolute inset-0 bg-mycol-brunswick_green/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-white text-center">
                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <p>Processing...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 rounded-lg bg-mycol-nyanza/20 flex items-center justify-center">
                      <p className="text-gray-800">Preview will appear here</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {selectedImage && !isSubmitted && (
                    <button
                      onClick={handleSubmit}
                      className="w-full py-3 mt-6 px-4 bg-mycol-mint text-white rounded-lg hover:bg-mycol-mint-2 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Sprout className="w-5 h-5" />
                      <span>Analyze Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {prediction && !isSubmitted && (
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {prediction.disease}
                </h2>
                <p className="text-gray-600">{prediction.info.scientificName}</p>

                {/* Confidence Indicator */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Detection Confidence</p>
                  {renderConfidenceIndicator(prediction.confidence)}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex space-x-2 mb-6 overflow-x-auto py-2">
                <TabButton
                  id="overview"
                  label="Overview"
                  active={activeTab === 'overview'}
                  icon={Info}
                />
                <TabButton
                  id="treatment"
                  label="Treatment"
                  active={activeTab === 'treatment'}
                  icon={Shield}
                />
                <TabButton
                  id="prevention"
                  label="Prevention"
                  active={activeTab === 'prevention'}
                  icon={ShieldAlert}
                />
                <TabButton
                  id="products"
                  label="Recommended Products"
                  active={activeTab === 'products'}
                  icon={ShoppingCart}
                />
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-800">
                        {prediction.info.detailedDescription}
                      </p>
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
                          {prediction.info.spreadingConditions.map(
                            (condition, index) => (
                              <li key={index} className="p-3 bg-gray-50 rounded-lg">
                                {condition}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Crop Info Section */}
                    <div className="grid md:grid-cols-2 gap-4">
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
                  </div>
                )}

                {/* Treatment Tab */}
                {activeTab === 'treatment' && (
                  <div className="space-y-6">
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
                          {prediction.info.treatment.cultural.map(
                            (practice, index) => (
                              <li key={index} className="p-3 bg-gray-50 rounded-lg">
                                {practice}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Organic Treatments */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Organic
                        </h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                          {prediction.info.treatment.organic.map(
                            (treatment, index) => (
                              <li key={index} className="p-3 bg-gray-50 rounded-lg">
                                {treatment}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prevention Tab */}
                {activeTab === 'prevention' && (
                  <div className="space-y-6">
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
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    {suggestedProducts.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestedProducts.map((product, index) => (
                          <a
                            key={index}
                            href={`http://localhost:5173/crops/${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                          >
                            <div className="flex items-start">
                              <ShoppingCart className="w-5 h-5 text-green-600 mr-3 mt-1" />
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-600 mt-1">₹{product.price}</p>
                                <div className="flex items-center space-x-1 mt-2 text-blue-600 hover:text-blue-800">
                                  <span className="text-xs">View on Shop</span>
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No Products Found</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          We couldn't find specific products for this disease. Try the recommended treatments instead.
                        </p>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Recommended Products
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {prediction.info.recommendedProducts.map((product, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white rounded-lg border border-blue-100"
                          >
                            <p className="text-gray-800">{product}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side Panels */}
        <div>
          <DiseasesPanel />

          {/* Recommended Products Panel */}
          {prediction && suggestedProducts.length > 0 && (
            <div className="fixed right-6 top-[calc(50%+80px)] w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 hidden md:block">
              <div className="p-4 bg-mycol-mint text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Recommended Products
                </h3>
                <p className="text-sm text-white/80 mt-1">Products for this disease</p>
              </div>

              <div className="p-3 max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {suggestedProducts.map((product, index) => (
                    <a
                      key={index}
                      href={`http://localhost:5173/crops/${product._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-mycol-mint hover:shadow-md transition-all duration-200"
                    >
                      <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={product.image || 'https://placehold.co/200x200?text=Product'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
                        <p className="text-mycol-sea_green font-medium">₹{product.price}</p>
                        <div className="flex items-center text-xs text-blue-600 mt-1">
                          <span>View details</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Products Display (Only shown on small screens) */}
          {prediction && suggestedProducts.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:hidden">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-mycol-mint" />
                <h3 className="font-semibold text-gray-800">Recommended Products</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedProducts.map((product, index) => (
                  <a
                    key={index}
                    href={`http://localhost:5173/crops/${product._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-mycol-mint hover:shadow-md transition-all duration-200"
                  >
                    <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={product.image || 'https://placehold.co/200x200?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
                      <p className="text-mycol-sea_green font-medium">₹{product.price}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default DiseaseDetection;
