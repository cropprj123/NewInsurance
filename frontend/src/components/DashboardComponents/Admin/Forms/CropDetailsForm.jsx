// CropDetailsForm.jsx
const CropDetailsForm = ({ cropDetails, setCropDetails, errors }) => {
    const cropCategories = {
        Cereals: ["Wheat", "Rice", "Maize", "Barley", "Sorghum"],
        Pulses: ["Chickpea", "Lentil", "Pea", "PigeonPea"],
        Oilseeds: ["Mustard", "Sunflower", "Groundnut", "Soybean"],
        Vegetables: ["Tomato", "Potato", "Onion", "Cabbage", "Carrot"],
        Fruits: ["Mango", "Banana", "Apple", "Citrus", "Grapes"],
        FiberCrops: ["Cotton", "Jute"],
        SpicesAndPlantationCrops: ["Tea", "Coffee", "Pepper", "Cardamom"]
    };

    const addCropCategory = () => {
        setCropDetails([
            ...cropDetails,
            {
                cropCategory: '',
                crops: [{
                    cropType: '',
                    sumInsured: '',
                    premium: ''
                }]
            }
        ]);
    };

    const addCropToCategoryDetails = (categoryIndex) => {
        const newCropDetails = [...cropDetails];
        newCropDetails[categoryIndex].crops.push({
            cropType: '',
            sumInsured: '',
            premium: ''
        });
        setCropDetails(newCropDetails);
    };

    const removeCropCategory = (index) => {
        setCropDetails(cropDetails.filter((_, i) => i !== index));
    };

    const removeCrop = (categoryIndex, cropIndex) => {
        const newCropDetails = [...cropDetails];
        newCropDetails[categoryIndex].crops = newCropDetails[categoryIndex].crops.filter((_, i) => i !== cropIndex);
        setCropDetails(newCropDetails);
    };

    return (
        <div className="space-y-6">
            {cropDetails.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            Crop Category {categoryIndex + 1}
                        </h3>
                        {cropDetails.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeCropCategory(categoryIndex)}
                                className="text-red-600 hover:text-red-700"
                            >
                                Remove Category
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Category
                            </label>
                            <select
                                value={category.cropCategory}
                                onChange={(e) => {
                                    const newCropDetails = [...cropDetails];
                                    newCropDetails[categoryIndex].cropCategory = e.target.value;
                                    newCropDetails[categoryIndex].crops = [{
                                        cropType: '',
                                        sumInsured: '',
                                        premium: ''
                                    }];
                                    setCropDetails(newCropDetails);
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
                            >
                                <option value="">Select a category</option>
                                {Object.keys(cropCategories).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Crops in Category */}
                        {category.cropCategory && (
                            <div className="space-y-4">
                                {category.crops.map((crop, cropIndex) => (
                                    <div key={cropIndex} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Crop {cropIndex + 1}
                                            </h4>
                                            {category.crops.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCrop(categoryIndex, cropIndex)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Crop Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Crop Type
                                                </label>
                                                <select
                                                    value={crop.cropType}
                                                    onChange={(e) => {
                                                        const newCropDetails = [...cropDetails];
                                                        newCropDetails[categoryIndex].crops[cropIndex].cropType = e.target.value;
                                                        setCropDetails(newCropDetails);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
                                                >
                                                    <option value="">Select crop</option>
                                                    {cropCategories[category.cropCategory]?.map((cropType) => (
                                                        <option key={cropType} value={cropType}>
                                                            {cropType}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sum Insured */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Sum Insured (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={crop.sumInsured}
                                                    onChange={(e) => {
                                                        const newCropDetails = [...cropDetails];
                                                        newCropDetails[categoryIndex].crops[cropIndex].sumInsured = e.target.value;
                                                        setCropDetails(newCropDetails);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
                                                    placeholder="Enter amount"
                                                />
                                            </div>

                                            {/* Premium */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Premium (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={crop.premium}
                                                    onChange={(e) => {
                                                        const newCropDetails = [...cropDetails];
                                                        newCropDetails[categoryIndex].crops[cropIndex].premium = e.target.value;
                                                        setCropDetails(newCropDetails);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
                                                    placeholder="Enter amount"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addCropToCategoryDetails(categoryIndex)}
                                    className="mt-4 text-mycol-mint hover:text-mycol-mint-2 font-medium"
                                >
                                    + Add Another Crop
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addCropCategory}
                className="w-full py-3 border-2 border-dashed border-mycol-celadon text-mycol-sea_green rounded-lg hover:bg-mycol-nyanza/50 transition-colors"
            >
                + Add Another Category
            </button>
        </div>
    );
};

export default CropDetailsForm;