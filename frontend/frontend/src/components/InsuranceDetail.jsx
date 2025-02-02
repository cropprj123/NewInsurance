// InsuranceDetail.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// If you're using any icon libraries, import them here, e.g., FontAwesome
import { FaArrowLeft, FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaMapMarkerAlt, FaFileInvoiceDollar, FaTemperatureHigh, FaCloudRain, FaSeedling } from 'react-icons/fa';

const InsuranceDetail = () => {
  // Static data representing the insurance policy
  const insurance = {
    name: 'Comprehensive Crop Protection Plan',
    policyNumber: 'CROP-123456789',
    description: 'This policy offers extensive coverage for a variety of crops against natural calamities, pests, and diseases. It is designed to provide financial support and stability to farmers, ensuring that unexpected events do not hinder their livelihood.',
    cropSeason: 'Kharif',
    cropType: 'Paddy',
    seasonDates: {
      startDate: '2023-06-01',
      endDate: '2023-11-30',
    },
    premium: 5000,
    sumInsured: 200000,
    risks: ['Drought', 'Flood', 'Pests', 'Diseases'],
    thresholds: {
      temperature: {
        minTemperature: 15,
      },
      rainfall: {
        minRainfall: 100,
      },
    },
    eligibility: {
      minLandArea: 1,
      maxLandArea: 10,
      requiredDocuments: ['Land Ownership Document', 'Identification Proof', 'Bank Statement'],
    },
    claimCriteria: [
      {
        damageType: 'Crop Loss',
        minimumDamagePercentage: 30,
        compensationPercentage: 70,
      },
      {
        damageType: 'Yield Reduction',
        minimumDamagePercentage: 20,
        compensationPercentage: 50,
      },
    ],
    regions: [
      {
        state: 'Maharashtra',
        district: 'Pune',
      },
      {
        state: 'Karnataka',
        district: 'Bangalore Rural',
      },
    ],
    status: 'Active',
    createdBy: 'Admin User',
    lastModifiedAt: '2023-10-10',
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-screen-lg mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/insurance" className="text-blue-500 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Insurance Plans
          </Link>
        </div>

        {/* Policy Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{insurance.name}</h1>
          <p className="text-gray-600 mb-6">{insurance.description}</p>
          <div className="flex flex-wrap items-center text-gray-700">
            <div className="flex items-center mr-6 mb-2">
              <FaShieldAlt className="text-green-500 mr-2" />
              <span className="font-semibold">Policy Number:</span>&nbsp;{insurance.policyNumber}
            </div>
            <div className="flex items-center mr-6 mb-2">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <span className="font-semibold">Status:</span>&nbsp;
              <span
                className={`${
                  insurance.status === 'Active' ? 'text-green-500' : 'text-red-500'
                } font-semibold`}
              >
                {insurance.status}
              </span>
            </div>
            <div className="flex items-center mb-2">
              <FaFileInvoiceDollar className="text-yellow-500 mr-2" />
              <span className="font-semibold">Premium:</span>&nbsp;&#8377; {insurance.premium.toLocaleString()}
            </div>

            
              
          </div>
        </div>

        {/* Policy Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Coverage Details */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaSeedling className="text-green-500 mr-2" />
                Coverage Details
              </h2>
              <ul className="space-y-4 text-gray-700">
                <li>
                  <strong>Crop Season:</strong>&nbsp;{insurance.cropSeason}
                </li>
                <li>
                  <strong>Crop Type:</strong>&nbsp;{insurance.cropType}
                </li>
                <li>
                  <strong>Season Dates:</strong>&nbsp;
                  {new Date(insurance.seasonDates.startDate).toLocaleDateString()} -{' '}
                  {new Date(insurance.seasonDates.endDate).toLocaleDateString()}
                </li>
                <li>
                  <strong>Risks Covered:</strong>&nbsp;{insurance.risks.join(', ')}
                </li>
                <li>
                  <strong>Sum Insured:</strong>&nbsp;&#8377; {insurance.sumInsured.toLocaleString()}
                </li>
              </ul>
            </div>

            {/* Eligibility */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaFileInvoiceDollar className="text-yellow-500 mr-2" />
                Eligibility
              </h2>
              <ul className="space-y-4 text-gray-700">
                <li>
                  <strong>Minimum Land Area:</strong>&nbsp;{insurance.eligibility.minLandArea} acres
                </li>
                <li>
                  <strong>Maximum Land Area:</strong>&nbsp;{insurance.eligibility.maxLandArea} acres
                </li>
                <li>
                  <strong>Required Documents:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {insurance.eligibility.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>

            {/* Regions Covered */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="text-red-500 mr-2" />
                Regions Covered
              </h2>
              <ul className="space-y-2 text-gray-700">
                {insurance.regions.map((region, index) => (
                  <li key={index}>
                    <strong>{region.state}</strong> - {region.district}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Thresholds */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaTemperatureHigh className="text-red-500 mr-2" />
                Thresholds
              </h2>
              <ul className="space-y-4 text-gray-700">
                <li>
                  <strong>Minimum Temperature:</strong>&nbsp;{insurance.thresholds.temperature.minTemperature}°C
                </li>
                <li>
                  <strong>Minimum Rainfall:</strong>&nbsp;{insurance.thresholds.rainfall.minRainfall} mm
                </li>
              </ul>
            </div>

            {/* Claim Criteria */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaShieldAlt className="text-blue-500 mr-2" />
                Claim Criteria
              </h2>
              <div className="space-y-6">
                {insurance.claimCriteria.map((criteria, index) => (
                  <div key={index} className="border-b pb-4">
                    <div>
                      <strong>Damage Type:</strong>&nbsp;{criteria.damageType}
                    </div>
                    <div>
                      <strong>Minimum Damage Percentage:</strong>&nbsp;{criteria.minimumDamagePercentage}%
                    </div>
                    <div>
                      <strong>Compensation Percentage:</strong>&nbsp;{criteria.compensationPercentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="text-green-500 mr-2" />
                Additional Details
              </h2>
              <ul className="space-y-4 text-gray-700">
                <li>
                  <strong>Created By:</strong>&nbsp;{insurance.createdBy}
                </li>
                <li>
                  <strong>Last Modified At:</strong>&nbsp;
                  {new Date(insurance.lastModifiedAt).toLocaleDateString()}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 flex justify-center">
          <button className="bg-blue-600 text-white px-12 py-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold flex items-center">
            <FaFileInvoiceDollar className="mr-2" /> Apply for This Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetail;





//   useEffect(() => {
//     const getinsurance?ById = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get(`http://127.0.0.1:3000/api/v1/insurance?/${id}`);
//         if (response.status !== 200) {
//           throw new Error("Failed to fetch insurance? details");
//         }
//         setinsurance?(response.data.data.policy); // Adjust based on your API response structure
//         setIsLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setIsLoading(false);
//       }
//     };

//     getinsurance?ById();
//   }, [id]);