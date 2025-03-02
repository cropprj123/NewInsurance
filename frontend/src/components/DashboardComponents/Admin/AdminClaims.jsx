import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Camera,
  ThermometerSun,
  Droplets,
  Wind,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Search,
  BarChart4,
  Loader2,
  User,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { saveAs } from 'file-saver';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
  });
  const [expandedClaim, setExpandedClaim] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    averageProcessingTime: 0,
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get("/api/v1/claim/getallclaims");
      setClaims(response.data.data.claims);
      calculateAnalytics(response.data.data.claims);
      setLoading(false);
    } catch (err) {
      setError("Failed to load claims data");
      setLoading(false);
    }
  };

  const calculateAnalytics = (claimsData) => {
    const analytics = {
      totalClaims: claimsData.length,
      pendingClaims: claimsData.filter((claim) => claim.status === "pending").length,
      approvedClaims: claimsData.filter((claim) => claim.status === "approved").length,
      rejectedClaims: claimsData.filter((claim) => claim.status === "rejected").length,
      averageProcessingTime: 0,
    };

    // Calculate average processing time
    const processedClaims = claimsData.filter(
      (claim) => claim.status !== "pending"
    );
    if (processedClaims.length > 0) {
      const totalProcessingTime = processedClaims.reduce((acc, claim) => {
        const createDate = new Date(claim.createdAt);
        const updateDate = new Date(claim.updatedAt);
        return acc + (updateDate - createDate);
      }, 0);
      analytics.averageProcessingTime =
        totalProcessingTime / (processedClaims.length * 86400000); // Convert to days
    }

    setAnalytics(analytics);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-6 h-6" />;
      case "rejected":
        return <XCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        claim.farmer?.name?.toLowerCase().includes(searchLower) ||
        claim.policyEnrollmentId?.policyDetails?.policyNumber
          ?.toLowerCase()
          .includes(searchLower);

      const matchesStatus =
        filters.status === "all" || claim.status === filters.status;

      let matchesDate = true;
      const claimDate = new Date(claim.createdAt);
      const now = new Date();
      switch (filters.dateRange) {
        case "today":
          matchesDate = claimDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          matchesDate = claimDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
          matchesDate = claimDate >= monthAgo;
          break;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [claims, searchTerm, filters]);

  const chartData = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [
          analytics.approvedClaims,
          analytics.rejectedClaims,
          analytics.pendingClaims,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
      },
    ],
  };

  const monthlyClaimsData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, "MMM yyyy");
    }).reverse();

    const monthlyData = last6Months.map((month) => {
      return claims.filter(
        (claim) =>
          format(new Date(claim.createdAt), "MMM yyyy") === month
      ).length;
    });

    return {
      labels: last6Months,
      datasets: [
        {
          label: "Claims",
          data: monthlyData,
          backgroundColor: "#0ea5e9",
        },
      ],
    };
  }, [claims]);

  const exportToCSV = () => {
    const headers = [
      "Claim ID",
      "Farmer Name",
      "Policy Number",
      "Status",
      "Submitted On",
      "Location",
      "Notes",
      "Temperature",
      "Rainfall",
      "Humidity",
    ];

    const csvData = filteredClaims.map((claim) => [
      claim._id,
      claim.farmer?.name,
      claim.policyEnrollmentId?.policyDetails?.policyNumber,
      claim.status,
      format(new Date(claim.createdAt), "dd/MM/yyyy"),
      claim.geolocation?.coordinates.join(", "),
      claim.note,
      claim.weatherData?.temperature?.toFixed(1),
      claim.weatherData?.rainfall,
      claim.weatherData?.humidity,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "claims_data.csv");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-mycol-mint mx-auto mb-4" />
          <p className="text-gray-600">Loading claims data...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Claims Management</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage insurance claims across the platform
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

      {/* Analytics Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-2xl font-bold text-gray-800">
                  {analytics.totalClaims}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart4 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Claims</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {analytics.pendingClaims}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved Claims</p>
                <p className="text-2xl font-bold text-green-500">
                  {analytics.approvedClaims}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Processing Time</p>
                <p className="text-2xl font-bold text-purple-500">
                  {analytics.averageProcessingTime.toFixed(1)} days
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Claims Distribution
            </h3>
            <div className="h-64">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Monthly Claims Trend
            </h3>
            <div className="h-64">
              <Bar
                data={monthlyClaimsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by farmer name or policy number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {filteredClaims.map((claim) => (
            <motion.div
              key={claim._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedClaim(
                    expandedClaim === claim._id ? null : claim._id
                  )
                }
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {getStatusIcon(claim.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {claim.farmer?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Policy: {claim.policyEnrollmentId?.policyDetails?.policyNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p
                        className={`font-semibold ${
                          claim.status === "approved"
                            ? "text-green-600"
                            : claim.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {claim.status.charAt(0).toUpperCase() +
                          claim.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted On</p>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(claim.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                    {expandedClaim === claim._id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedClaim === claim._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Location and Photos */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Claim Evidence
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>
                              Location: {claim.geolocation?.coordinates.join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-gray-400" />
                            <span>{claim.photos?.length || 0} photos submitted</span>
                          </div>
                          {claim.photos && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {claim.photos.map((photo, idx) => (
                                <img
                                  key={idx}
                                  src={photo}
                                  alt={`Claim photo ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Weather Data */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Weather Conditions
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ThermometerSun className="w-5 h-5 text-gray-400" />
                            <span>
                              Temperature:{" "}
                              {claim.weatherData?.temperature?.toFixed(1)}°C
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-gray-400" />
                            <span>
                              Rainfall: {claim.weatherData?.rainfall} mm
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="w-5 h-5 text-gray-400" />
                            <span>
                              Humidity: {claim.weatherData?.humidity}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assessment Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Assessment Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Location Check</p>
                            <p
                              className={`font-medium ${
                                claim.thresholdResults?.locationVerified
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {claim.thresholdResults?.locationVerified
                                ? "Within Farm Boundaries"
                                : "Outside Farm Boundaries"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Weather Impact</p>
                            <p
                              className={`font-medium ${
                                claim.thresholdResults?.thresholdSatisfied
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {claim.thresholdResults?.thresholdSatisfied
                                ? "Threshold Conditions Met"
                                : "Normal Weather Conditions"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-gray-700">{claim.note}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No claims found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClaims; 