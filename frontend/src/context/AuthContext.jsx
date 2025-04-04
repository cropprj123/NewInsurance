import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try
        {
            const res = await api.get('/users/user');
            setUser(res.data.user);
        } catch (err)
        {
            setUser(null);
            console.log("error in AuthProvider", err.message)
        } finally
        {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // Add updateUser function to handle profile updates
    const updateUser = async (userData, isFormData = false) => {
        try
        {
            const config = {
                headers: {
                    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
                }
            };

            const response = await api.patch('/users/updateme', userData, config);

            if (response.data.status === 'success')
            {
                // Update the user state with the new data
                setUser(response.data.data.user);
                return { success: true, user: response.data.data.user };
            }

            return { success: false, message: response.data.message || 'Update failed' };
        } catch (err)
        {
            console.error("Error in AuthProvider updateUser", err.message);
            return {
                success: false,
                message: err.response?.data?.message || 'Update failed'
            };
        }
    };

    const login = async (emailOrPhone, password) => {
        try
        {
            const response = await api.post('/users/login', {
                emailOrPhone,
                password
            });
            if (response.data.status === 'success')
            {
                await fetchUser();
                return true;
            }
            return false;
        } catch (err)
        {
            console.log("error in AuthProvider login", err.message);
            return false;
        }
    };

    const signup = async (userData) => {
        try
        {
            const response = await api.post('/users/signup', userData);
            if (response.data.status === 'success')
            {
                await fetchUser();
                return { success: true };
            }
            return { success: false, error: 'Signup failed' };
        } catch (err)
        {
            console.log("error in AuthProvider signup", err.message);
            return {
                success: false,
                error: err.response?.data?.message || 'Signup failed'
            };
        }
    };

    const logout = async () => {
        try
        {
            await api.get('/users/logout');
            setUser(null);
        } catch (err)
        {
            console.error("error in AuthProvider logout", err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};