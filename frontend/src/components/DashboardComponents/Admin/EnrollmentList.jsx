import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaFileDownload, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import axios from 'axios';

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    state: '',
    district: '',
    cropCategory: '',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, enrollments]);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('/api/v1/policy-enrollments');
      setEnrollments(response.data.data.all);
      setFilteredEnrollments(response.data.data.all);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...enrollments];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(enrollment => 
        enrollment.farmerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.policyDetails.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(enrollment => enrollment.status === filters.status);
    }
    if (filters.state) {
      filtered = filtered.filter(enrollment => 
        enrollment.farmerDetails.address.state.toLowerCase() === filters.state.toLowerCase()
      );
    }
    if (filters.district) {
      filtered = filtered.filter(enrollment => 
        enrollment.farmerDetails.address.district.toLowerCase() === filters.district.toLowerCase()
      );
    }
    if (filters.cropCategory) {
      filtered = filtered.filter(enrollment => 
        enrollment.cropDetails.some(detail => 
          detail.cropCategory.toLowerCase() === filters.cropCategory.toLowerCase()
        )
      );
    }

    // Apply date range filter
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(enrollment => 
          new Date(enrollment.createdAt).toDateString() === now.toDateString()
        );
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(enrollment => 
          new Date(enrollment.createdAt) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(enrollment => 
          new Date(enrollment.createdAt) >= monthAgo
        );
        break;
      default:
        break;
    }

    setFilteredEnrollments(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      'Enrollment Date',
      'Policy Number',
      'Farmer Name',
      'State',
      'District',
      'Crop Category',
      'Area Size',
      'Premium',
      'Status'
    ];

    const csvData = filteredEnrollments.map(enrollment => [
      format(new Date(enrollment.enrollmentDate), 'dd/MM/yyyy'),
      enrollment.policyDetails.policyNumber,
      enrollment.farmerDetails.name,
      enrollment.farmerDetails.address.state,
      enrollment.farmerDetails.address.district,
      enrollment.cropDetails[0]?.cropCategory || 'N/A',
      enrollment.farmDetails.areaSize,
      enrollment.policyDetails.premium,
      enrollment.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments-${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Policy Enrollments</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaFileDownload />
          Export to CSV
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by farmer name or policy number..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaFilter />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <select
              className="p-2 border rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="p-2 border rounded-lg"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <input
              type="text"
              placeholder="State"
              className="p-2 border rounded-lg"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            />

            <input
              type="text"
              placeholder="District"
              className="p-2 border rounded-lg"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">No enrollments found</td>
              </tr>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <tr key={enrollment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(enrollment.enrollmentDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {enrollment.policyDetails.policyNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.farmerDetails.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.farmerDetails.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {enrollment.farmerDetails.address.district}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.farmerDetails.address.state}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {enrollment.cropDetails[0]?.cropCategory}
                    </div>
                    <div className="text-sm text-gray-500">
                      Area: {enrollment.farmDetails.areaSize} acres
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    ₹{enrollment.policyDetails.premium.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedEnrollment(enrollment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enrollment Details Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Enrollment Details</h2>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Policy Details</h3>
                    <p>Number: {selectedEnrollment.policyDetails.policyNumber}</p>
                    <p>Premium: ₹{selectedEnrollment.policyDetails.premium.toLocaleString()}</p>
                    <p>Sum Insured: ₹{selectedEnrollment.policyDetails.sumInsured.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Farmer Details</h3>
                    <p>Name: {selectedEnrollment.farmerDetails.name}</p>
                    <p>Phone: {selectedEnrollment.farmerDetails.phone}</p>
                    <p>Email: {selectedEnrollment.farmerDetails.email}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Farm Details</h3>
                  <p>Area Size: {selectedEnrollment.farmDetails.areaSize} acres</p>
                  <p>Irrigation Type: {selectedEnrollment.farmDetails.irrigationType}</p>
                  <p>Location: {selectedEnrollment.farmerDetails.address.district}, {selectedEnrollment.farmerDetails.address.state}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Crop Details</h3>
                  {selectedEnrollment.cropDetails.map((crop, index) => (
                    <div key={index} className="ml-4">
                      <p>Category: {crop.cropCategory}</p>
                      <p>Types: {crop.crops.map(c => c.cropType).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentList; 