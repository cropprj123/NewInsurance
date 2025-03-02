import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";

const FarmerList = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await axios.get("/api/v1/users/farmers");
        setFarmers(response.data.data.farmers);
        setLoading(false);
      } catch (err) {
        setError("Failed to load farmers data");
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleRoleChange = async (farmerId, newRole) => {
    try {
      await axios.patch(`/api/v1/users/${farmerId}/role`, { role: newRole });
      setFarmers((prev) =>
        prev.map((farmer) =>
          farmer._id === farmerId ? { ...farmer, role: newRole } : farmer
        )
      );
    } catch (err) {
      setError("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-mycol-mint mx-auto mb-4" />
        <p className="text-gray-600">Loading farmers data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Farmers List</h1>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Farmer Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map((farmer) => (
            <tr key={farmer._id}>
              <td className="py-2 px-4 border-b">{farmer.name}</td>
              <td className="py-2 px-4 border-b">{farmer.email}</td>
              <td className="py-2 px-4 border-b">
                <select
                  value={farmer.role}
                  onChange={(e) => handleRoleChange(farmer._id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                </select>
              </td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-500 hover:underline">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FarmerList; 