import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Droplets,
  Thermometer,
  Wind,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Tractor,
  User,
  Mail,
  Phone,
  Leaf,
  IndianRupee,
} from "lucide-react";
import { format } from "date-fns";

const AllEnrollment = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    cropCategory: "all",
    state: "all",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "enrollmentDate",
    direction: "desc",
  });
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [availableStates, setAvailableStates] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    // Extract unique states from policies
    if (policies.length > 0) {
      const states = [...new Set(policies.map(policy => 
        policy.farmerDetails.address.state
      ))].sort();
      setAvailableStates(states);
    }
  }, [policies]);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get("/api/v1/track");
      setPolicies(response.data.data.all);
      setLoading(false);
    } catch (err) {
      setError("Failed to load enrollment data");
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const exportToCSV = () => {
    const headers = [
      "Policy Number",
      "Farmer Name",
      "Crop Category",
      "Area Size",
      "Premium",
      "Status",
      "Enrollment Date",
    ];
    
    const csvData = filteredPolicies.map((policy) => [
      policy.policyDetails.policyNumber,
      policy.farmerDetails.name,
      policy.cropDetails[0]?.cropCategory,
      policy.farmDetails.areaSize,
      policy.policyDetails.premium,
      policy.status,
      format(new Date(policy.enrollmentDate), "dd/MM/yyyy"),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredPolicies = policies
    .filter((policy) => {
      const searchQuery = searchTerm.toLowerCase().trim();
      const matchesSearch =
        policy.farmerDetails.name.toLowerCase().includes(searchQuery) ||
        policy.policyDetails.policyNumber.toLowerCase().includes(searchQuery) ||
        policy.policyDetails.policyName.toLowerCase().includes(searchQuery);

      const matchesFilters =
        (filters.status === "all" || policy.status === filters.status) &&
        (filters.cropCategory === "all" ||
          policy.cropDetails.some(
            (cat) => cat.cropCategory === filters.cropCategory
          )) &&
        (filters.state === "all" ||
          policy.farmerDetails.address.state === filters.state);

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.direction === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : bValue > aValue
        ? 1
        : -1;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-mycol-mint mx-auto mb-4" />
          <p className="text-gray-600">Loading enrollment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Policy Enrollments
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all insurance policy enrollments
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-mycol-mint text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by farmer name, policy number or insurance name"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.cropCategory}
              onChange={(e) => handleFilterChange("cropCategory", e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
            >
              <option value="all">All Crop Categories</option>
              <option value="Cereals">Cereals</option>
              <option value="Pulses">Pulses</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Commercial">Commercial</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => handleFilterChange("state", e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
            >
              <option value="all">All States</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enrollment Cards */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {filteredPolicies.map((policy) => (
            <motion.div
              key={policy._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedPolicy(
                    expandedPolicy === policy._id ? null : policy._id
                  )
                }
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        policy.status === "approved"
                          ? "bg-green-100 text-green-600"
                          : policy.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <Tractor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {policy.farmerDetails.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <p className="text-sm text-gray-500">
                          Policy No: {policy.policyDetails.policyNumber}
                        </p>
                        <div className="hidden sm:block text-gray-400">•</div>
                        <p className="text-sm font-medium text-mycol-mint">
                          {policy.policyDetails.policyName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p
                        className={`font-semibold ${
                          policy.status === "approved"
                            ? "text-green-600"
                            : policy.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {policy.status.charAt(0).toUpperCase() +
                          policy.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Enrollment Date</p>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(policy.enrollmentDate), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Premium</p>
                      <p className="font-semibold text-gray-800">
                        ₹{policy.policyDetails.premium.toLocaleString()}
                      </p>
                    </div>
                    {expandedPolicy === policy._id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedPolicy === policy._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Farmer Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Farmer Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <span>{policy.farmerDetails.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>{policy.farmerDetails.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>{policy.farmerDetails.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>
                              {policy.farmerDetails.address.district},{" "}
                              {policy.farmerDetails.address.state}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Farm Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Farm Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-gray-400" />
                            <span>Area: {policy.farmDetails.areaSize} hectares</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-gray-400" />
                            <span>
                              Irrigation: {policy.farmDetails.irrigationType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>
                              Soil Type: {policy.farmDetails.soilType || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Crop Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Crop Details
                        </h4>
                        <div className="space-y-4">
                          {policy.cropDetails.map((category, idx) => (
                            <div key={idx}>
                              <h5 className="font-medium text-gray-700 mb-2">
                                {category.cropCategory}
                              </h5>
                              <div className="space-y-2">
                                {category.crops.map((crop, cropIdx) => (
                                  <div
                                    key={cropIdx}
                                    className="bg-white p-3 rounded-md shadow-sm"
                                  >
                                    <p className="font-medium text-gray-800 mb-2">
                                      {crop.cropType}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Thermometer className="w-4 h-4 text-red-400" />
                                        <span>
                                          {crop.thresholds.temperature.minTemperature}
                                          °-
                                          {crop.thresholds.temperature.maxTemperature}
                                          °C
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Droplets className="w-4 h-4 text-blue-400" />
                                        <span>
                                          {crop.thresholds.rainfall.minRainfall}-
                                          {crop.thresholds.rainfall.maxRainfall}mm
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Wind className="w-4 h-4 text-green-400" />
                                        <span>
                                          {crop.thresholds.humidity.minHumidity}-
                                          {crop.thresholds.humidity.maxHumidity}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No enrollments found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEnrollment;
