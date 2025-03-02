import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Users,
  UserCheck,
  FileText,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  Map,
  BarChart2
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/v1/dashboard/stats');
      setDashboardData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-mycol-mint mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const { overview, performance, trends, distribution } = dashboardData;

  // Chart configurations
  const enrollmentChartConfig = {
    labels: trends.enrollments.labels,
    datasets: [
      {
        label: 'Policy Enrollments',
        data: trends.enrollments.data,
        fill: true,
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const revenueChartConfig = {
    labels: trends.revenue.labels,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: trends.revenue.data,
        backgroundColor: '#0d9488',
        borderColor: '#0d9488',
        borderWidth: 1,
      },
    ],
  };

  const policyDistributionConfig = {
    labels: Object.keys(distribution.policies),
    datasets: [
      {
        data: Object.values(distribution.policies),
        backgroundColor: [
          '#2dd4bf',
          '#0d9488',
          '#115e59',
          '#134e4a',
          '#042f2e',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of insurance policies, claims, and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[
          {
            title: 'Total Farmers',
            value: overview.totalFarmers,
            icon: Users,
            color: 'blue',
          },
          {
            title: 'Total Agents',
            value: overview.totalAgents,
            icon: UserCheck,
            color: 'green',
          },
          {
            title: 'Active Policies',
            value: overview.totalPolicies,
            icon: FileText,
            color: 'yellow',
          },
          {
            title: 'Total Revenue',
            value: `₹${overview.totalRevenue.toLocaleString()}`,
            icon: IndianRupee,
            color: 'purple',
          },
          {
            title: 'Pending Claims',
            value: overview.pendingClaims,
            icon: AlertTriangle,
            color: 'orange',
          },
          {
            title: 'Approved Claims',
            value: overview.approvedClaims,
            icon: CheckCircle,
            color: 'emerald',
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-mycol-mint mr-2" />
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-mycol-mint">
                {performance.completionRate}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Average Premium</p>
              <p className="text-2xl font-bold text-mycol-mint">
                ₹{performance.averagePremium}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold text-mycol-mint">
                {performance.activeAssignments}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-mycol-mint">
                {performance.totalEnrollments}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center mb-4">
            <Map className="w-6 h-6 text-mycol-mint mr-2" />
            <h2 className="text-xl font-semibold">Regional Distribution</h2>
          </div>
          <div className="h-[250px]">
            <Pie
              data={policyDistributionConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center mb-4">
            <BarChart2 className="w-6 h-6 text-mycol-mint mr-2" />
            <h2 className="text-xl font-semibold">Monthly Trends</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <Line
                data={enrollmentChartConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Policy Enrollments',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="h-[300px]">
              <Bar
                data={revenueChartConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Monthly Revenue',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${value.toLocaleString()}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard; 