import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit2, Check, Home, Building2, MapPinned } from 'lucide-react';

const UserProfile = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        // Add your API call to update user data here
        setIsEditing(false);
    };

    return (
        <div className="flex-1 p-8 bg-mycol-nyanza/20 min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-mycol-brunswick_green">Profile Details</h1>
                {!isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="flex items-center space-x-2 bg-mycol-mint text-white px-4 py-2 rounded-lg hover:bg-mycol-mint-2 transition-colors"
                    >
                        <Edit2 className="h-5 w-5" />
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-mycol-sea_green text-white px-4 py-2 rounded-lg hover:bg-mycol-dartmouth_green transition-colors"
                    >
                        <Check className="h-5 w-5" />
                        <span>Save Changes</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Profile Info */}
                <div className="col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <img
                                    src={user.photo !== "default.jpg" ? user.photo : "https://via.placeholder.com/100"}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-mycol-celadon"
                                />
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 bg-mycol-mint text-white p-1 rounded-full">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                                <div className="flex items-center space-x-2 text-mycol-sea_green mb-4">
                                    <Shield className="h-5 w-5" />
                                    <span className="capitalize">{user.role}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-mycol-sea_green" />
                                        <span className="text-gray-600">{user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-mycol-sea_green" />
                                        <span className="text-gray-600">{user.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <MapPin className="h-6 w-6 text-mycol-sea_green mr-2" />
                            Address Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-mycol-mint focus:border-mycol-mint"
                                            defaultValue={user.address?.street}
                                        />
                                    </div>
                                    {/* Add more editable fields */}
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start space-x-3">
                                        <Home className="h-5 w-5 text-mycol-sea_green mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Street</p>
                                            <p className="text-gray-700">{user.address?.street || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Building2 className="h-5 w-5 text-mycol-sea_green mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">City</p>
                                            <p className="text-gray-700">{user.address?.city || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <MapPinned className="h-5 w-5 text-mycol-sea_green mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">State</p>
                                            <p className="text-gray-700">{user.address?.state || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-mycol-sea_green mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Pincode</p>
                                            <p className="text-gray-700">{user.address?.pincode || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Information */}
                <div className="space-y-6">
                    {/* Account Status */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Account Type</span>
                                <span className="px-3 py-1 bg-mycol-nyanza text-mycol-sea_green rounded-full capitalize">
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Member Since</span>
                                <span className="text-gray-800">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Status</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-mycol-nyanza rounded-lg transition-colors">
                                View Insurance Policies
                            </button>
                            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-mycol-nyanza rounded-lg transition-colors">
                                Check Claims Status
                            </button>
                            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-mycol-nyanza rounded-lg transition-colors">
                                Download Documents
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;