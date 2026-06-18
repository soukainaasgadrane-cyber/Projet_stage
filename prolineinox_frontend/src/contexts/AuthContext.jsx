import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSettings } from './SettingsContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('token_expires_at');

    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      clearSession();
      setLoading(false);
      return;
    }

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/user');
      setUser(data);
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const payload = { email: email?.trim(), password };
    const { data } = await api.post('/login', payload);
    localStorage.setItem('token', data.token);
    if (data.expires_at) {
      localStorage.setItem('token_expires_at', data.expires_at);
    }
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    toast.success(t.loginSuccess);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Session can already be expired; local cleanup is still required.
    } finally {
      clearSession();
      toast.success(t.logoutSuccess);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
