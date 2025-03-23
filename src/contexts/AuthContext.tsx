
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "trainer";
  gender?: string;
  blood_group?: string;
  height?: number;
  weight?: number;
  payment_method?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
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
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const API_URL = "http://localhost:5000/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user data from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { email, role });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      
      console.log("Login response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save token and user data
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setToken(data.access_token);
      setUser(data.user);
      
      toast.success("Successfully logged in");
      
      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "trainer") {
        navigate("/trainer/dashboard");
      } else if (data.user.role === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : "Please try again"}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          gender,
          blood_group: bloodGroup,
          height,
          weight,
          payment_method: paymentMethod
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(`Registration failed: ${error instanceof Error ? error.message : "Please try again"}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Successfully logged out");
    navigate("/");
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      
      // Update user data with latest from server
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      logout();
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
