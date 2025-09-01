import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import the decoder

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Add state for user info

  // On initial app load, check localStorage for a token
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        // Check if token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decodedUser);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('authToken');
        }
      } catch (e) {
        console.error("Invalid token found in localStorage", e);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = (newToken) => {
    try {
      const decodedUser = jwtDecode(newToken);
      setToken(newToken);
      setUser(decodedUser);
      localStorage.setItem('authToken', newToken);
    } catch (e) {
      console.error("Failed to decode token on login", e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null); // Clear user state on logout
    localStorage.removeItem('authToken');
  };

  return (
    // Expose the user object to the rest of the app
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};