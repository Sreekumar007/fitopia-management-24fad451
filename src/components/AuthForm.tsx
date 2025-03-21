
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type AuthType = "login" | "register";
type UserRole = "student" | "staff" | "admin";

interface AuthFormProps {
  type: AuthType;
}

const API_URL = "http://localhost:5000/api";

const AuthForm = ({ type }: AuthFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "login") {
        // Handle login with actual API
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        // Save token and user data to localStorage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast.success("Successfully logged in");
        
        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "staff") {
          navigate("/staff/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        // Handle registration with actual API
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        toast.success("Successfully registered");
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(`Authentication failed: ${error instanceof Error ? error.message : "Please try again"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {type === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {type === "login" ? "Logging in..." : "Registering..."}
            </span>
          ) : (
            <span>{type === "login" ? "Login" : "Register"}</span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
