import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Edit2,
  UserCheck,
  X,
  ChevronDown,
  Save,
  Loader2,
  Filter,
  RefreshCw,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import userPhoto from "../../assets/avatars/user3.jpg";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [updating, setUpdating] = useState(false);

  const roles = ["user", "agent", "admin"];
  
  const roleStyles = {
    admin: {
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      hoverBg: "hover:bg-purple-50",
      icon: "👑"
    },
    agent: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      hoverBg: "hover:bg-blue-50",
      icon: "🔍"
    },
    user: {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      hoverBg: "hover:bg-gray-50",
      icon: "👤"
    },
    farmer: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-50",
      icon: "🌱"
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/v1/users");
      setUsers(response.data.users.data);
      setFilteredUsers(response.data.users.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users data: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(term) || 
        user.email?.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term))
      );
    }
    
    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const startEditingRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setShowRoleDropdown(false);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setNewRole("");
  };

  const updateUserRole = async () => {
    if (!editingUser || newRole === editingUser.role) {
      cancelEditing();
      return;
    }

    try {
      setUpdating(true);
      const response = await axios.patch(`/api/v1/users/update-role/${editingUser._id}`, {
        role: newRole
      });

      if (response.data.status === 'success') {
        // Update local state
        const updatedUsers = users.map(user => {
          if (user._id === editingUser._id) {
            return { ...user, role: newRole };
          }
          return user;
        });
        
        setUsers(updatedUsers);
        toast.success(`${editingUser.name}'s role updated to ${newRole}`);
      } else {
        toast.error("Failed to update user role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error(err.response?.data?.message || "Failed to update user role");
    } finally {
      setUpdating(false);
      cancelEditing();
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mycol-sea_green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-mycol-brunswick_green mb-8 flex items-center">
          <Users className="mr-2 h-8 w-8 text-mycol-mint" />
          User Management
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button 
                className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded flex items-center"
                onClick={fetchUsers}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-mycol-sea_green mb-2">Total Users</h2>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-mycol-sea_green mb-2">Farmers</h2>
            <p className="text-3xl font-bold">
              {users.filter(user => user.role === 'farmer').length}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-mycol-sea_green mb-2">Agents</h2>
            <p className="text-3xl font-bold">
              {users.filter(user => user.role === 'agent').length}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-mycol-sea_green mb-2">Admins</h2>
            <p className="text-3xl font-bold">
              {users.filter(user => user.role === 'admin').length}
            </p>
          </div>
        </div>

        {/* User Table Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select 
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint appearance-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">👥 All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {roleStyles[role]?.icon || '👤'} {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                  {/* Keep farmer in the filter even though we don't allow changing to farmer */}
                  <option value="farmer">🌱 Farmer</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-mycol-sea_green" />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.photo || userPhoto}
                                alt={`${user.name}'s avatar`}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone || "No phone"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.address?.city || user.address?.state ? 
                              `${user.address.city || ''} ${user.address.state ? ', ' + user.address.state : ''}` : 
                              "Location not specified"
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser && editingUser._id === user._id ? (
                            <div className="relative">
                              <button
                                type="button"
                                className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mycol-mint"
                                id="role-menu"
                                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                              >
                                <span className="flex items-center">
                                  <span className="mr-2">{roleStyles[newRole]?.icon || '👤'}</span>
                                  {newRole.charAt(0).toUpperCase() + newRole.slice(1)}
                                </span>
                                <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                              </button>

                              {showRoleDropdown && (
                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="role-menu">
                                    {roles.map((role) => (
                                      <button
                                        key={role}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${roleStyles[role]?.hoverBg || 'hover:bg-gray-100'} ${role === newRole ? 'bg-gray-100 font-medium' : ''}`}
                                        role="menuitem"
                                        onClick={() => {
                                          setNewRole(role);
                                          setShowRoleDropdown(false);
                                        }}
                                      >
                                        <span className="mr-2">{roleStyles[role]?.icon || '👤'}</span>
                                        <span className={roleStyles[role]?.textColor || 'text-gray-700'}>
                                          {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full
                              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                                  user.role === 'farmer' ? 'bg-green-100 text-green-800' : 
                                    'bg-gray-100 text-gray-800'}`}
                            >
                              <span className="mr-1">{roleStyles[user.role]?.icon || '👤'}</span>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingUser && editingUser._id === user._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={cancelEditing}
                                className="text-red-600 hover:text-red-900 p-1"
                                disabled={updating}
                              >
                                <X className="h-5 w-5" />
                              </button>
                              <button
                                onClick={updateUserRole}
                                className="text-green-600 hover:text-green-900 p-1"
                                disabled={updating}
                              >
                                {updating ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Save className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => startEditingRole(user)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit Role"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <a
                                href={`/profile/user/${user._id}`}
                                className="text-mycol-sea_green hover:text-mycol-mint p-1"
                                title="View Profile"
                              >
                                <UserCheck className="h-5 w-5" />
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 