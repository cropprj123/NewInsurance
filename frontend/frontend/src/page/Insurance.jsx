// Insurance.jsx
/* eslint-disable no-unused-vars */
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Utility function to truncate text
const truncateText = (text, limit) => {
  if (!text) return ""; // Handle cases where text might be undefined
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};

const Insurance = () => {
  const [insurances, setInsurances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getInsurances() {
      try {
        setIsLoading(true);
        setError("");
        // Fetch data from API
        const response = await axios.get(`http://127.0.0.1:3000/api/v1/insurance`);
        if (response.status !== 200) throw new Error("Something went wrong with fetching insurances");
        const insurancesData = response.data.data.policies;
        if (insurancesData.length === 0) throw new Error("No insurance policies found");
        setInsurances(insurancesData);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
    getInsurances();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className=" py-2">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Crop Insurance Plans</h1>
          <p className="text-black text-lg">Protect your crops with our comprehensive insurance policies.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-gray-700">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 cursor-pointer">
            {insurances.map((insurance) => (
              <div key={insurance._id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* Image Placeholder */}
                {/*<div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('https://source.unsplash.com/featured/?farm,crops')` }}>
                  {/* You can use a static image or a placeholder 
                </div>*/}

                {/* Policy Content */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-green-600 mb-2 flex items-center">
                    <FaLeaf className="mr-2" /> {insurance.policy_name}
                  </h2>
                  <p className="text-gray-700 mb-4">{truncateText(insurance.terms_conditions, 120)}</p>

                  {/* Key Details */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" /> Key Details
                    </h3>
                    <ul className="text-gray-700">
                      <li>
                        <strong>Crop Type:</strong> {insurance.coverage_details.crop_type}
                      </li>
                      <li>
                        <strong>Max Coverage:</strong> {insurance.coverage_details.max_coverage}
                      </li>
                      <li>
                        <strong>Duration:</strong> {insurance.coverage_details.duration_months} months
                      </li>
                    </ul>
                  </div>

                  {/* Key Benefits */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaMoneyBillWave className="mr-2 text-yellow-500" /> Key Benefits
                    </h3>
                    <ul className="text-gray-700">
                      <li>
                        <strong>Premium:</strong> &#8377; {insurance.premium.toLocaleString()}
                      </li>
                      <li>
                        <strong>Agent Visit Fee:</strong> &#8377; {insurance.agent_visit_fee.toLocaleString()}
                      </li>
                    </ul>
                  </div>

                  {/* Status */}
                  <div className="flex items-center mb-4">
                    {insurance.active ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <FaTimesCircle className="mr-1" /> Inactive
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">
                      Created on: {new Date(insurance.createdAt).toLocaleDateString("en-GB")}
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
                        Buy Now
                      </button>
                      <Link to={`/insurance/${insurance._id}`}>
                        <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300">
                          View More
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* If no insurances are available */}
            {insurances.length === 0 && (
              <div className="col-span-full text-center text-gray-700">No insurance policies available at the moment.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insurance;