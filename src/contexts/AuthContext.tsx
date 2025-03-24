import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from "axios";
import api, { authService, AuthResponse, TokenVerificationResponse } from "../services/api";
import { toast } from "sonner";

const API_URL = "http://localhost:5000/api";

interface User {
  id: string | number;
  email: string;
  role: string;
  [key: string]: any; // Allow for additional user properties
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    gender?: string,
    bloodGroup?: string,
    height?: number,
    weight?: number,
    paymentMethod?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    gender?: string,
    bloodGroup?: string,
    height?: number,
    weight?: number,
    paymentMethod?: string
  ) => {
    try {
      setIsLoading(true);
      
      // For demo purposes - simulate registration success
      if (email.includes("demo") || email.includes("test")) {
        const demoUser = {
          id: Math.floor(Math.random() * 1000),
          name,
          email,
          role: role as "admin" | "staff" | "trainer" | "student",
          gender,
          blood_group: bloodGroup,
          height,
          weight
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        login(`demo-token-${role}`, demoUser);
        return;
      }
      
      // In a real app, send registration data to the backend
      const userData = {
        name,
        email,
        password,
        role,
        gender,
        blood_group: bloodGroup,
        height,
        weight,
        payment_method: paymentMethod
      };
      
      try {
        // API service returns response data directly (due to interceptor in api.ts)
        const response: AuthResponse = await authService.register(userData);
        
        if (response && response.user && response.access_token) {
          login(response.access_token, response.user);
        }
      } catch (error) {
        console.error("API registration error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('No stored token');
      }

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Verify response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Token verification failed');
      }

      if (data.valid && data.user) {
        setUser(data.user);
        setToken(storedToken);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  const value = {
    isAuthenticated: !!token,
    token,
    user,
    isLoading,
    login,
    logout,
    checkAuth,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
