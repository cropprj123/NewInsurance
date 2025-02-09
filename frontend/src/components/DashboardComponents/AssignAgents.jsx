import React, { useState } from "react";

// Sample data for demonstration purposes
const sampleData = [
    {
        policyName: "Crop Insurance",
        region: { state: "California", district: "Los Angeles" },
        farmer: { name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
        createdAt: "2023-10-01T10:00:00Z",
    },
    {
        policyName: "Livestock Insurance",
        region: { state: "Texas", district: "Houston" },
        farmer: { name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210" },
        createdAt: "2023-10-02T11:30:00Z",
    },
    // Add more sample data as needed
];

// Sample agents data
const agentsData = [
    { agentId: "A001", name: "Alice Johnson", location: "California" },
    { agentId: "A002", name: "Bob Smith", location: "Texas" },
    { agentId: "A003", name: "Carlos Martinez", location: "Florida" },
    // Add more agents as needed
];

const AssignAgents = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [agentId, setAgentId] = useState("");
    const [visitDate, setVisitDate] = useState("");

    const handleOpenModal = (data) => {
        setSelectedData(data);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedData(null);
        setShowModal(false);
        setAgentId("");
        setVisitDate("");
    };

    const handleAssignAgent = () => {
        // Implement the logic to assign the agent here
        console.log("Agent assigned:", { agentId, visitDate, selectedData });
        // Close the modal after assigning
        handleCloseModal();
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {sampleData.map((data, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br from-white to-gray-100 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">{data.policyName}</h3>
                        <div className="mb-4">
                            <p className="text-gray-600">
                                <strong>Region:</strong> {data.region.state}, {data.region.district}
                            </p>
                            <p className="text-gray-600">
                                <strong>Farmer:</strong> {data.farmer.name}
                            </p>
                            <p className="text-gray-600">
                                <strong>Email:</strong> {data.farmer.email}
                            </p>
                            <p className="text-gray-600">
                                <strong>Phone:</strong> {data.farmer.phone}
                            </p>
                            <p className="text-gray-600">
                                <strong>Application Date:</strong> {new Date(data.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal(data)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            Assign Agent
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && selectedData && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Modal overlay */}
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal content */}
                    <div className="relative bg-white w-full max-w-4xl mx-auto rounded-lg shadow-lg p-8 z-10 overflow-y-auto max-h-screen">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            onClick={handleCloseModal}
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <h2 className="text-2xl font-semibold mb-6">Assign Agent</h2>

                        {/* Context Information */}
                        <div className="mb-6">
                            <p className="text-gray-700">
                                <strong>Insurance Name:</strong> {selectedData.policyName}
                            </p>
                            <p className="text-gray-700">
                                <strong>Farmer Name:</strong> {selectedData.farmer.name}
                            </p>
                            <p className="text-gray-700">
                                <strong>Region:</strong> {selectedData.region.state},{" "}
                                {selectedData.region.district}
                            </p>
                            <p className="text-gray-700">
                                <strong>Application Date:</strong>{" "}
                                {new Date(selectedData.createdAt).toLocaleString()}
                            </p>
                        </div>

                        {/* Input Fields */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Agent ID
                            </label>
                            <input
                                type="text"
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter Agent ID"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Agent Visit Date
                            </label>
                            <input
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Available Agents Table */}
                        <div className="mb-6 overflow-x-auto">
                            <h3 className="text-xl font-semibold mb-4">Available Agents</h3>
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border-b">Agent ID</th>
                                        <th className="px-4 py-2 border-b">Name</th>
                                        <th className="px-4 py-2 border-b">Location</th>
                                        <th className="px-4 py-2 border-b">Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agentsData.map((agent) => (
                                        <tr key={agent.agentId}>
                                            <td className="px-4 py-2 border-b text-center">
                                                {agent.agentId}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                {agent.name}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                {agent.location}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                <button
                                                    onClick={() => setAgentId(agent.agentId)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignAgent}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
                            >
                                Assign Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignAgents;