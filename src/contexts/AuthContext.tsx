import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "trainer" | "student";
  gender?: string;
  blood_group?: string;
  height?: number;
  weight?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    // Set default Authorization header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear default Authorization header
    delete axios.defaults.headers.common["Authorization"];
  };

  const checkAuth = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      // For demo purposes - if using demo tokens, just validate the existing data
      if (token.startsWith('demo-token-')) {
        setIsLoading(false);
        return;
      }
      
      // In a real app, verify token with the backend
      const response = await axios.get("http://localhost:5000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.valid) {
        // Token is valid, update user if needed
        if (response.data.user) {
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      } else {
        // Token is invalid, logout
        logout();
      }
    } catch (error) {
      console.error("Auth verification error:", error);
      // On error, keep the user logged in if using demo tokens
      if (!token.startsWith('demo-token-')) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
