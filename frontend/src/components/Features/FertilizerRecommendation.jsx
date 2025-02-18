import React, { useState, useRef } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const FertilizerRecommendation = ({ cart, setCart }) => {
    const [loading, setLoading] = useState(false);
    const [inputData, setInputData] = useState({
        temperature: "",
        humidity: "",
        moisture: "",
        soilType: "",
        cropType: "",
        nitrogen: "",
        potassium: "",
        phosphorus: "",
    });
    const [crop, setCrop] = useState("");
    const [fert, setFert] = useState(null);
    const [got, setGot] = useState(false);
    const resultsRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "soilType" && (isNaN(value) || value < 0 || value > 4))
        {
            return;
        }

        if (name === "cropType" && (isNaN(value) || value < 0 || value > 10))
        {
            return;
        }

        setInputData({ ...inputData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const {
            temperature,
            humidity,
            moisture,
            soilType,
            cropType,
            nitrogen,
            potassium,
            phosphorus,
        } = inputData;

        try
        {
            const response = await axios.get("http://localhost:3000/api/v1/crops/predictfertilizer", {
                params: {
                    data: [
                        temperature,
                        humidity,
                        moisture,
                        soilType,
                        cropType,
                        nitrogen,
                        potassium,
                        phosphorus,
                    ].map(parseFloat),
                },
            });
            setCrop(response.data.prediction);

            const searchResponse = await axios.get(
                `http://localhost:3000/api/v1/crops/search?name=${response.data.prediction[0]}`
            );
            setFert(searchResponse.data.data.crop);
            setGot(true);

            if (resultsRef.current)
            {
                resultsRef.current.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error)
        {
            console.error("Prediction Error:", error);
        } finally
        {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Fertilizer Recommendation
                </h1>
                <p className="mt-2 text-gray-600">
                    Enter your field parameters to get personalized fertilizer recommendations
                </p>
            </div>

            {got ? (
                <div ref={resultsRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Recommended Fertilizer
                        </h2>
                        <p className="text-lg text-green-600 mt-2">{crop}</p>
                    </div>

                    {fert && (
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Available Products
                            </h3>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Field Parameters
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Enter accurate measurements for best results
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { name: "temperature", label: "Temperature" },
                                    { name: "humidity", label: "Humidity" },
                                    { name: "moisture", label: "Moisture" },
                                    { name: "soilType", label: "Soil Type (0-4)" },
                                    { name: "cropType", label: "Crop Type (0-10)" },
                                    { name: "nitrogen", label: "Nitrogen" },
                                    { name: "potassium", label: "Potassium" },
                                    { name: "phosphorus", label: "Phosphorus" },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            type="number"
                                            name={field.name}
                                            value={inputData[field.name]}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Recommend Fertilizer"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
                                    <h3 className="font-semibold text-gray-800">Soil Type Guide</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Soil Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Value
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {[
                                                ["Black", "0"],
                                                ["Clayey", "1"],
                                                ["Loamy", "2"],
                                                ["Red", "3"],
                                                ["Sandy", "4"],
                                            ].map(([type, value]) => (
                                                <tr key={value}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-4">
                                    <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
                                    <h3 className="font-semibold text-gray-800">Crop Type Guide</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Crop Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Value
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {[
                                                ["Barley", "0"],
                                                ["Cotton", "1"],
                                                ["Ground Nut", "2"],
                                                ["Maize", "3"],
                                                ["Millets", "4"],
                                                ["Oilseeds", "5"],
                                                ["Paddy", "6"],
                                                ["Pulses", "7"],
                                                ["Sugarcane", "8"],
                                                ["Tobacco", "9"],
                                                ["Wheat", "10"],
                                            ].map(([type, value]) => (
                                                <tr key={value}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FertilizerRecommendation;