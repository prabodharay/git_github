import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    try {
      if (!localStorage.getItem('loadex_access_token')) {
        setLoading(false);
        return;
      }

      const response = await authApi.me();
      setUser(response.data.data.profile || null);
    } catch {
      localStorage.removeItem('loadex_access_token');
      localStorage.removeItem('loadex_refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const loginWithTokens = (tokens, profile) => {
    localStorage.setItem('loadex_access_token', tokens.accessToken);
    localStorage.setItem('loadex_refresh_token', tokens.refreshToken);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('loadex_access_token');
    localStorage.removeItem('loadex_refresh_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, loginWithTokens, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
