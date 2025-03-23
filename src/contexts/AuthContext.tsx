
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

// Mock users for demo (normally this would come from the backend)
const MOCK_USERS = [
  {
    id: 1,
    name: "Test Student",
    email: "student@fitwell.com",
    password: "student",
    role: "student",
    gender: "Male",
    blood_group: "O+",
    height: 175,
    weight: 70,
    payment_method: "Credit Card"
  },
  {
    id: 2,
    name: "Test Staff",
    email: "staff@fitwell.com",
    password: "staff",
    role: "staff",
    gender: "Female",
    blood_group: "A+",
    height: 165,
    weight: 60,
    payment_method: "Bank Transfer"
  },
  {
    id: 3,
    name: "Test Trainer",
    email: "trainer@fitwell.com",
    password: "trainer",
    role: "trainer",
    gender: "Male",
    blood_group: "B+",
    height: 180,
    weight: 75,
    payment_method: "Direct Debit"
  },
  {
    id: 4,
    name: "Admin",
    email: "admin@fitwell.com",
    password: "admin",
    role: "admin",
    gender: "Non-binary",
    blood_group: "AB+",
    height: 170,
    weight: 65,
    payment_method: "Cash"
  }
];

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
      
      // Instead of API call, use local mock data
      const foundUser = MOCK_USERS.find(user => 
        user.email === email && 
        user.password === password && 
        (!role || user.role === role)
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Create a user object without the password
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Create a fake token (just for demo)
      const fakeToken = `demo-token-${Date.now()}-${foundUser.role}`;
      
      // Save token and user data
      localStorage.setItem("token", fakeToken);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      setToken(fakeToken);
      setUser(userWithoutPassword);
      
      toast.success("Successfully logged in");
      
      // Redirect based on role
      if (foundUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (foundUser.role === "trainer") {
        navigate("/trainer/dashboard");
      } else if (foundUser.role === "staff") {
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
      // Check if email already exists
      if (MOCK_USERS.some(user => user.email === email)) {
        throw new Error("Email already registered");
      }
      
      // Create a new user (in a real app, this would be sent to the server)
      const newUser = {
        id: MOCK_USERS.length + 1,
        name,
        email,
        password,
        role: role as "student" | "staff" | "admin" | "trainer",
        gender,
        blood_group: bloodGroup,
        height,
        weight,
        payment_method: paymentMethod
      };
      
      // In a real app, we would add this user to the database
      // For demo, we'll just show a success message
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
      // In a real app, we would verify the token with the server
      // For demo purposes, we'll just consider having a token as being authenticated
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
