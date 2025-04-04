// // Insurance.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import farmingIllustration from '../assets/image.png'; // You'll need to add this
import heroImage from '../assets/hero-image.jpg'; // You'll need to add this
import axios from "axios";

const Insurance = () => {
  // States for data
  const [insurances, setInsurances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  // States for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredInsurances, setFilteredInsurances] = useState([]);

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Crops", icon: "🌾" },
    { id: "cereals", name: "Cereals", icon: "🌾" },
    { id: "pulses", name: "Pulses", icon: "🫘" },
    { id: "vegetables", name: "Vegetables", icon: "🥬" },
    { id: "fruits", name: "Fruits", icon: "🍎" },
  ];
  // // Utility function to truncate text
  const truncateText = (text, limit) => {
    if (!text) return ""; // Handle cases where text might be undefined
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  // Helper function to get crop type from insurance
  const getCropType = (insurance) => {
    if (!insurance.cropDetails || insurance.cropDetails.length === 0) return "";

    // Get the first crop category
    const firstCategory = insurance.cropDetails[0];

    // Return the category name or the first crop type if available
    if (firstCategory.crops && firstCategory.crops.length > 0)
    {
      return firstCategory.crops[0].cropType;
    }

    return firstCategory.cropCategory || "";
  };

  // Helper function to check if insurance matches the category filter
  const matchesCategory = (insurance, categoryId) => {
    if (categoryId === 'all') return true;

    if (!insurance.cropDetails || insurance.cropDetails.length === 0) return false;

    return insurance.cropDetails.some(detail =>
      detail.cropCategory && detail.cropCategory.toLowerCase() === categoryId.toLowerCase()
    );
  };

  // Search and filter logic
  useEffect(() => {
    if (!insurances.length) return;

    let filtered = [...insurances];

    // Search filter with null checks
    if (searchTerm)
    {
      filtered = filtered.filter(insurance => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (insurance.name?.toLowerCase() || '').includes(searchLower) ||
          (insurance.description?.toLowerCase() || '').includes(searchLower) ||
          (getCropType(insurance).toLowerCase() || '').includes(searchLower) ||
          (insurance.cropSeason?.toLowerCase() || '').includes(searchLower) ||
          (insurance.regions?.some(region =>
            (region.state?.toLowerCase() || '').includes(searchLower) ||
            (region.district?.toLowerCase() || '').includes(searchLower)
          )) || false
        );
      });
    }

    // Category filter - updated to use matchesCategory helper
    if (activeFilter !== 'all')
    {
      filtered = filtered.filter(insurance =>
        matchesCategory(insurance, activeFilter)
      );
    }

    // Price range filter
    filtered = filtered.filter(insurance =>
      insurance.premium <= priceRange[1] && insurance.premium >= priceRange[0]
    );

    setFilteredInsurances(filtered);
  }, [searchTerm, activeFilter, priceRange, insurances]);

  // FAQ data
  const faqData = [
    {
      q: "How does crop insurance work?",
      a: "Crop insurance provides financial protection against losses due to natural calamities, pests, or diseases. When an insured event occurs, farmers can claim compensation based on their policy terms."
    },
    {
      q: "What crops are covered under insurance?",
      a: "We cover a wide range of crops including cereals (wheat, rice), pulses (lentils, beans), vegetables (tomatoes, potatoes), and fruits (mangoes, apples). Coverage varies by region and season."
    },
    {
      q: "How are premiums calculated?",
      a: "Premiums are calculated based on factors like crop type, area of cultivation, historical risk data, and coverage amount. Government subsidies may reduce the premium burden on farmers."
    },
    {
      q: "What is the claim process?",
      a: "Claims can be filed through our mobile app or website. Our agent will visit for assessment, and approved claims are typically processed within 7-14 working days."
    }
  ];

  // Stats data
  const statsData = [
    {
      label: "Active Policies",
      value: "10,000+",
      icon: "📋",
      description: "Trusted by farmers across India"
    },
    {
      label: "Claims Processed",
      value: "5,000+",
      icon: "✅",
      description: "Quick and hassle-free settlements"
    },
    {
      label: "Farmer Trust Rating",
      value: "4.8/5",
      icon: "⭐",
      description: "Based on 2,000+ reviews"
    },
    {
      label: "Total Coverage",
      value: "₹500Cr+",
      icon: "💰",
      description: "Protecting farmers' investments"
    }
  ];

  // Search and filter logic
  // Search and filter logic - REMOVE THIS DUPLICATE useEffect BLOCK
  // useEffect(() => {
  //   if (!insurances.length) return;

  //   let filtered = [...insurances];

  //   // Search filter with null checks
  //   if (searchTerm)
  //   {
  //     filtered = filtered.filter(insurance => {
  //       const searchLower = searchTerm.toLowerCase();
  //       return (
  //         (insurance.name?.toLowerCase() || '').includes(searchLower) ||
  //         (insurance.description?.toLowerCase() || '').includes(searchLower) ||
  //         (getCropType(insurance).toLowerCase() || '').includes(searchLower) ||
  //         (insurance.cropSeason?.toLowerCase() || '').includes(searchLower) ||
  //         (insurance.regions?.some(region =>
  //           (region.state?.toLowerCase() || '').includes(searchLower) ||
  //           (region.district?.toLowerCase() || '').includes(searchLower)
  //         )) || false
  //       );
  //     });
  //   }

  //   // Category filter
  //   if (activeFilter !== 'all')
  //   {
  //     filtered = filtered.filter(insurance =>
  //       insurance.cropType.toLowerCase() === activeFilter.toLowerCase()
  //     );
  //   }

  //   // Price range filter
  //   filtered = filtered.filter(insurance =>
  //     insurance.premium <= priceRange[1] && insurance.premium >= priceRange[0]
  //   );

  //   setFilteredInsurances(filtered);
  // }, [searchTerm, activeFilter, priceRange, insurances]);

  // Remove this duplicate useEffect block completely (lines 147-169 in original code)
  // useEffect(() => {
  //   if (!insurances.length) return;
  //   let filtered = [...insurances];
  //   // ... duplicate logic ...
  // }, [searchTerm, activeFilter, priceRange, insurances]);

  // Remove the duplicate useEffect hook below (lines 147-169)
  // Fetch data
  useEffect(() => {
    async function getInsurances() {
      try
      {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`/api/v1/insurance`);
        if (response.status !== 200) throw new Error("Something went wrong with fetching insurances");
        const insurancesData = response.data.data.policies;
        if (insurancesData.length === 0) throw new Error("No insurance policies found");
        console.log(response)
        setInsurances(insurancesData);
        setFilteredInsurances(insurancesData);
        setIsLoading(false);
      } catch (err)
      {
        setError(err.message);
        setIsLoading(false);
      }
    }
    getInsurances();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2">
      {/* Hero Section */}
      <div className="relative bg-mycol-brunswick_green text-white py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <motion.h1
                className="text-4xl md:text-5xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Secure Your Harvest,
                <span className="text-mycol-mint block">Ensure Your Future</span>
              </motion.h1>

              <motion.p
                className="text-lg text-mycol-celadon"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Choose from our range of comprehensive crop insurance policies designed
                specifically for Indian farmers. Protect your agricultural investment
                against uncertainties.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button className="bg-mycol-mint hover:bg-mycol-mint-2 text-white px-8 py-3 rounded-lg transition-colors flex items-center space-x-2">
                  <FaLeaf />
                  <span>Get Started</span>
                </button>
                <button className="border-2 border-mycol-celadon text-mycol-celadon hover:bg-mycol-celadon hover:text-white px-8 py-3 rounded-lg transition-colors">
                  Learn More
                </button>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center">
                  <FaCheckCircle className="text-mycol-mint mr-2" />
                  <span>Instant Approval</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-mycol-mint mr-2" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-mycol-mint mr-2" />
                  <span>Easy Claims</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <img
                src={heroImage}
                alt="Farming illustration"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by crop type, policy name..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-mycol-mint focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-mycol-nyanza text-mycol-brunswick_green rounded-lg hover:bg-mycol-celadon hover:text-white transition-all"
            >
              <FaFilter className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <div className="flex justify-between items-start gap-8">
                  {/* Categories */}
                  <div className="flex-1">
                    <h3 className="text-md font-medium text-gray-700 mb-4">Crop Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setActiveFilter(category.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${activeFilter === category.id
                            ? 'bg-mycol-mint text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="w-72">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-medium text-gray-700">Premium Range</h3>
                        <span className="text-sm text-mycol-mint">
                          ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                        </span>
                      </div>
                      <div className="relative pt-5">
                        <input
                          type="range"
                          min="0"
                          max="100000"
                          step="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mycol-mint"
                        />
                        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                          <span>₹0</span>
                          <span>₹50,000</span>
                          <span>₹100,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(activeFilter !== 'all' || searchTerm || priceRange[1] < 100000) && (
                  <div className="mt-6 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeFilter !== 'all' && (
                        <span className="px-3 py-1 bg-mycol-mint/10 text-mycol-mint rounded-full text-sm">
                          {categories.find(c => c.id === activeFilter)?.name}
                        </span>
                      )}
                      {searchTerm && (
                        <span className="px-3 py-1 bg-mycol-mint/10 text-mycol-mint rounded-full text-sm">
                          Search: {searchTerm}
                        </span>
                      )}
                      {priceRange[1] < 100000 && (
                        <span className="px-3 py-1 bg-mycol-mint/10 text-mycol-mint rounded-full text-sm">
                          Up to ₹{priceRange[1].toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setSearchTerm('');
                        setPriceRange([0, 100000]);
                      }}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <div className="bg-mycol-nyanza/50 w-12 h-12 rounded-full flex items-center justify-center">
                    <div className="bg-mycol-mint/20 w-8 h-8 rounded-full flex items-center justify-center">
                      <div className="bg-mycol-mint w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-mycol-brunswick_green mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/*  */}
      {/* Insurance Cards Section */}
      <div className="max-w-7xl mx-auto px-4 mb-16 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-mycol-mint border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-mycol-sea_green">Loading insurance plans...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 rounded-lg p-6 inline-block">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-mycol-brunswick_green">
                Available Insurance Plans
                {filteredInsurances.length > 0 && (
                  <span className="ml-2 text-lg text-mycol-sea_green">
                    ({filteredInsurances.length} plans)
                  </span>
                )}
              </h2>

            </div>

            {filteredInsurances.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-mycol-nyanza/50 rounded-lg p-8 inline-block">
                  <img
                    src="/path-to-your-no-results-illustration.svg"
                    alt="No results"
                    className="w-48 h-48 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-mycol-brunswick_green mb-2">
                    No Insurance Plans Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter('all');
                      setPriceRange([0, 100000]);
                    }}
                    className="text-mycol-mint hover:text-mycol-mint-2 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredInsurances.map((insurance, index) => (
                  <motion.div
                    key={insurance._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    {/* Header */}
                    <div className="bg-mycol-brunswick_green p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaLeaf /> {insurance.name}
                          </h2>
                          <p className="text-mycol-celadon text-sm mt-1">
                            Policy Number: {insurance.policyNumber}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${insurance.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {insurance.status.charAt(0).toUpperCase() + insurance.status.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Description */}
                      <div className="mb-6">
                        <p className="text-gray-600">{insurance.description}</p>
                      </div>

                      {/* Season Info */}
                      <div className="bg-mycol-nyanza/20 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Season</p>
                            <p className="font-semibold text-mycol-brunswick_green capitalize">
                              {insurance.cropSeason} Season
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Crop Type</p>
                            <p className="font-semibold text-mycol-brunswick_green capitalize">
                              {getCropType(insurance)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-mycol-brunswick_green">
                              {new Date(insurance.seasonDates.startDate).toLocaleDateString()} - {new Date(insurance.seasonDates.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Coverage Area</p>
                            <p className="font-semibold text-mycol-brunswick_green">
                              {insurance.eligibility.minLandArea} - {insurance.eligibility.maxLandArea} Acres
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Coverage & Benefits */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Coverage Details */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-mycol-brunswick_green flex items-center gap-2">
                            <FaCalendarAlt className="text-mycol-mint" /> Coverage
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Sum Insured:</span>
                              <span className="font-semibold text-mycol-sea_green">
                                ₹{insurance.sumInsured.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Risks Covered:</span>
                              <span className="text-mycol-sea_green capitalize">
                                {insurance.risks.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Premium Details */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-mycol-brunswick_green flex items-center gap-2">
                            <FaMoneyBillWave className="text-mycol-mint" /> Premium Details
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Premium Amount:</span>
                              <span className="font-semibold text-mycol-sea_green">
                                ₹{insurance.premium.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Agent Fee:</span>
                              <span className="font-semibold text-mycol-sea_green">
                                ₹{insurance.agentFee.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Required Documents */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Required Documents:</h3>
                        <div className="flex flex-wrap gap-2">
                          {insurance.eligibility.requiredDocuments.map((doc, index) => (
                            <span key={index} className="px-3 py-1 bg-mycol-nyanza/30 text-mycol-sea_green rounded-full text-sm">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          Created: {new Date(insurance.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-3">
                          <Link to={`/insurance/${insurance._id}`}>
                            <button className="px-4 py-2 text-mycol-sea_green hover:bg-mycol-nyanza/50 rounded-lg transition-colors">
                              View Details
                            </button>
                          </Link>
                          <button
                            className="px-6 py-2 bg-mycol-mint text-white rounded-lg hover:bg-mycol-mint-2 transition-colors"
                            onClick={() => {/* Add buy logic */ }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Insurance;



