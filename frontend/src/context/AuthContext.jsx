import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ca_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ca_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('ca_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('ca_token', data.access_token);
    localStorage.setItem('ca_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (registrationData) => {
    const data = await authService.register(registrationData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('ca_token', data.access_token);
    localStorage.setItem('ca_user', JSON.stringify(data.user));
    return data.user;
  };

  const demoLogin = async () => {
    const data = await authService.seedDemo();
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('ca_token', data.access_token);
    localStorage.setItem('ca_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ca_token');
    localStorage.removeItem('ca_user');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('ca_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      demoLogin,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
