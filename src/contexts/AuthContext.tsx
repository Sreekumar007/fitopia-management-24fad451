import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api, { authService, AuthResponse, TokenVerificationResponse } from "@/services/api";
import { toast } from "sonner";

const API_URL = "http://localhost:5000/api";

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
  isAuthenticated: boolean;
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

  useEffect(() => {
    console.log("AuthProvider initialized with:", {
      user,
      hasToken: !!token,
      storageToken: localStorage.getItem("token"),
      storageUser: localStorage.getItem("user")
    });
  }, [user, token]);

  const login = (newToken: string, newUser: User) => {
    console.log("Setting login data:", { token: newToken, user: newUser }); // Debug log
    
    // Make sure user has expected structure
    if (!newUser || !newUser.role) {
      console.error("Invalid user data in login:", newUser);
      toast.error("Invalid user data received"); 
      return;
    }
    
    // Store in state
    setToken(newToken);
    setUser(newUser);
    
    // Store in localStorage
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    // Set default Authorization header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    
    console.log("Login completed successfully"); // Debug log
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear default Authorization header
    delete axios.defaults.headers.common["Authorization"];
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token, 
        login,
        logout,
        checkAuth,
        register
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
