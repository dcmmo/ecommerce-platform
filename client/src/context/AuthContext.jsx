import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  }

  async function register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
