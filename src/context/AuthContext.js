import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userSession');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error cargando sesión:", error);
      }
    };
    loadSession();
  }, []);

  const login = async (username, role) => {
    const session = { username, role };
    setUser(session);
    await AsyncStorage.setItem('userSession', JSON.stringify(session));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('userSession');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};