import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => apiClient.getToken());
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    async function loadUser() {
      const storedToken = apiClient.getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.getProfile();
        if (res.success && res.data) {
          setUser(res.data);
          setToken(storedToken);
        } else {
          apiClient.setToken(null);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session check failed, clearing token:', err);
        apiClient.setToken(null);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Listen for auth expiration events from API client
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.login(email, password);
    if (res.success && res.token) {
      apiClient.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setToken(null);
  };

  // RBAC Permission Flags
  const role = user?.role || 'VIEWER';
  const isViewer = role === 'VIEWER';
  const isOperator = role === 'OPERATOR';
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
  const isSuperadmin = role === 'SUPERADMIN';

  // Specific Functional Permissions
  const canEdit = !isViewer; // Operator and Admins can edit
  const canPublish = isAdmin; // Only Admin / Superadmin can publish to KG

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        role,
        isViewer,
        isOperator,
        isAdmin,
        isSuperadmin,
        canEdit,
        canPublish,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
