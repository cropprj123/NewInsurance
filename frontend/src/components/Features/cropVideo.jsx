import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Leaf,
  TestTube,
  Sprout,
  Shield,
  AlertCircle,
  Loader2,
  Play,
  ShoppingCart,
  ExternalLink
} from "lucide-react";
import axios from "axios";
import DiseasesPanel from "./DiseasesPanel";

const VideoAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("symptoms");
  const videoRef = useRef(null);
  const primaryDisease = result?.predictions?.[0];

  // Fetch products by name
  const fetchProductsByName = async (name) => {
    try {
      // Search for the exact product name
      const response = await axios.get(`http://localhost:5173/api/v1/crops/search?name=${encodeURIComponent(name)}`);
      console.log('Search response for:', name, response.data);
      
      // Filter products to match exact name (case-insensitive)
      const exactMatches = response.data.data.crop.filter(product => 
        product.name.toLowerCase() === name.toLowerCase()
      );
      
      return exactMatches;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/detect_crop_disease_video",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setResult(data);
      
      // Fetch recommended products if disease is detected
      if (data.predictions && data.predictions[0]) {
        // Check if recommendedProducts field exists, otherwise use chemical treatments
        const productNames = data.predictions[0]?.info?.recommendedProducts || 
                           data.predictions[0]?.info?.treatment?.chemical || [];
                            
        const productResults = await Promise.all(
          productNames.map(productName => fetchProductsByName(productName))
        );
        setSuggestedProducts(productResults.flat().filter(Boolean));
      }
    } catch (err) {
      setError("Failed to analyze video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Tab switcher for results
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <DiseasesPanel />
      
      <div className="max-w-7xl mx-auto md:pr-80">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-emerald-900 mb-4 flex items-center justify-center gap-3">
            <Leaf className="w-12 h-12 text-emerald-600" />
            CropGuard AI
          </h1>
          <p className="text-xl text-emerald-700/90">
            Advanced AI-Powered Crop Disease Detection System
          </p>
        </div>

        {/* Main Content Grid */}
        <div
          className={`grid ${
            primaryDisease ? "lg:grid-cols-2" : ""
          } gap-8 items-start`}
        >
          {/* Left Column - Upload Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-md border border-emerald-100 p-5 max-w-md mx-auto lg:mx-0">
            <label className="block cursor-pointer space-y-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-2 py-5 rounded-lg border-2 border-dashed border-emerald-200 hover:border-emerald-300 transition-colors">
                <UploadCloud className="w-12 h-12 text-emerald-500/80 mb-2" />
                <p className="text-base font-medium text-emerald-800">
                  {file ? "Video Selected" : "Upload Plant Video"}
                </p>
                <p className="text-xs text-emerald-600/70">
                  {file ? file.name : "MP4, MOV, or AVI • Max 5 minutes"}
                </p>
              </div>

              {preview && (
                <div className="relative group mt-4">
                  <video
                    ref={videoRef}
                    src={preview}
                    className="w-full rounded-lg shadow-md border border-emerald-100 aspect-video bg-gray-900/5 max-h-56 object-cover"
                  />
                  <button
                    onClick={() => videoRef.current?.play()}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-emerald-600" />
                    </div>
                  </button>
                </div>
              )}

              {file && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full mt-4 py-2.5 rounded-lg font-medium text-base transition-all
                    ${
                      loading
                        ? "bg-emerald-300 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    }
                    text-white flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Detect Diseases"
                  )}
                </button>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50/90 rounded-lg border border-red-100 flex gap-2 items-start text-red-800">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-0.5 text-sm">Analysis Error</h3>
                    <p className="text-red-700/90 text-xs">{error}</p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Right Column - Results */}
          {primaryDisease && (
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-100 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-emerald-600/10 p-3 rounded-xl">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald-900">
                    {primaryDisease.disease}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      {(primaryDisease.confidence * 100).toFixed(1)}% Confidence
                    </span>
                    <span className="text-emerald-700/80 text-sm">
                      • Detected {primaryDisease.count || 1} times
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs for results */}
              <div className="flex border-b border-emerald-100 mb-6">
                <button
                  onClick={() => handleTabChange("symptoms")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "symptoms"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-emerald-800/70 hover:text-emerald-600"
                  }`}
                >
                  Symptoms
                </button>
                <button
                  onClick={() => handleTabChange("products")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "products"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-emerald-800/70 hover:text-emerald-600"
                  }`}
                >
                  Products
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "symptoms" && primaryDisease.info?.symptoms && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-800">
                    <TestTube className="w-5 h-5" />
                    Key Symptoms
                  </h3>
                  <div className="grid gap-3">
                    {primaryDisease.info.symptoms.map((symptom, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                        <span className="text-emerald-800/90">{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Tab Content */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  {suggestedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {suggestedProducts.map((product, index) => (
                        <a
                          key={index}
                          href={`/crops/${product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg border border-emerald-100 transition-colors"
                        >
                          <div className="flex items-start">
                            <ShoppingCart className="w-5 h-5 text-emerald-600 mr-3 mt-1" />
                            <div>
                              <p className="font-medium text-emerald-900">{product.name}</p>
                              <p className="text-sm text-emerald-800 mt-1">₹{product.price}</p>
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
                      <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <ShoppingCart className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-medium text-emerald-800 mb-2">No Products Found</h3>
                      <p className="text-emerald-700 max-w-md mx-auto">
                        We couldn't find specific products for this disease. Try the recommended treatments instead.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-emerald-50/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                      Recommended Treatments
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {primaryDisease.info.treatment.chemical.map((product, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-emerald-100"
                        >
                          <p className="text-emerald-800">{product}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Treatment Section - Below Both Columns */}
        {primaryDisease?.info && activeTab !== "products" && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {/* Chemical Treatment */}
            <div className="bg-red-50/90 p-6 rounded-2xl border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600/10 p-2 rounded-lg">
                  <TestTube className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">
                  Chemical Solutions
                </h3>
              </div>
              <ul className="space-y-2">
                {primaryDisease.info.treatment.chemical.map((t, i) => (
                  <li
                    key={i}
                    className="text-red-800/90 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Organic Treatment */}
            <div className="bg-green-50/90 p-6 rounded-2xl border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600/10 p-2 rounded-lg">
                  <Sprout className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900">
                  Organic Solutions
                </h3>
              </div>
              <ul className="space-y-2">
                {primaryDisease.info.treatment.organic.map((t, i) => (
                  <li
                    key={i}
                    className="text-green-800/90 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prevention */}
            <div className="bg-blue-50/90 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600/10 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Prevention
                </h3>
              </div>
              <ul className="space-y-2">
                {primaryDisease.info.prevention.map((p, i) => (
                  <li
                    key={i}
                    className="text-blue-800/90 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Products Display (Only shown on small screens) */}
      {primaryDisease && suggestedProducts.length > 0 && (
        <div className="mt-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-100 p-6 md:hidden">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-emerald-100">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-semibold text-emerald-800">Recommended Products</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestedProducts.map((product, index) => (
              <a
                key={index}
                href={`/crops/${product._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
              >
                <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-white border border-emerald-200">
                  <img 
                    src={product.image || 'https://placehold.co/200x200?text=Product'} 
                    alt={product.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-emerald-800 truncate">{product.name}</h4>
                  <p className="text-emerald-600 font-medium">₹{product.price}</p>
                  <div className="flex items-center text-xs text-blue-600 mt-1">
                    <span>View details</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products Panel (Fixed on the right) */}
      {primaryDisease && suggestedProducts.length > 0 && (
        <div className="fixed right-6 top-[calc(24rem+1.5rem)] w-72 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 overflow-hidden z-10 hidden md:block">
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Recommended Products
            </h3>
            <p className="text-sm text-white/80 mt-1">
              Treatments for {primaryDisease.disease}
            </p>
          </div>
          
          <div className="p-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            <div className="space-y-3">
              {suggestedProducts.map((product, index) => (
                <a
                  key={index}
                  href={`/crops/${product._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-emerald-50">
                    <img 
                      src={product.image || 'https://placehold.co/200x200?text=Product'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-emerald-800 truncate mb-1">{product.name}</h4>
                    <p className="text-emerald-600 font-semibold">₹{product.price}</p>
                    <div className="flex items-center text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
};

export default VideoAnalysisPage;
