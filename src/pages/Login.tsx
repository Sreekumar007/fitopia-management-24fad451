import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/api";

// Add this line to define API_URL
const API_URL = "http://localhost:5000/api";

// Form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "staff", "admin", "trainer"], {
    required_error: "Please select a role",
  }),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student"
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", values);
      
      // Using the authService instead of direct axios call
      const response = await authService.login(values.email, values.password, values.role);
      
      console.log("Login response:", response);

      // Store the token and user data
      login(response.access_token, response.user);
      
      toast.success(`${response.user.role.charAt(0).toUpperCase() + response.user.role.slice(1)} login successful`);

      // Navigate based on role
      switch(response.user.role) {
        case 'admin':
          navigate("/admin/dashboard", { replace: true });
          break;
        case 'student':
          navigate("/student/dashboard", { replace: true });
          break;
        case 'staff':
          navigate("/staff/dashboard", { replace: true });
          break;
        case 'trainer':
          navigate("/trainer/dashboard", { replace: true });
          break;
        default:
          navigate("/dashboard", { replace: true });
      }
      
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Login failed";
        console.log("Server error:", error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error("Failed to connect to the server. Please check your network connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const directLogin = async () => {
    try {
      setIsLoading(true);
      // Use hardcoded credentials for now
      const credentials = {
        email: "admin@fitwell.com",
        password: "admin",
        role: "admin"
      };
      
      console.log("Sending login request to:", `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      console.log("Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
      
      const data = await response.json();
      console.log("Login response data:", data);
      
      // Explicitly check for required fields
      if (!data.access_token || !data.user || !data.user.id || !data.user.role) {
        console.error("Invalid response format:", data);
        toast.error("Invalid response from server");
        return;
      }
      
      // Store data first in localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Then call the context login function
      login(data.access_token, data.user);
      
      toast.success("Login successful!");
      
      // Add a small delay before navigation to ensure state updates
      setTimeout(() => {
        navigate(`/${data.user.role}/dashboard`);
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Login | FitWell Gym</title>
        <meta name="description" content="Login to your FitWell Gym account" />
      </Helmet>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center bg-primary text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">FitWell Gym</CardTitle>
          <CardDescription className="text-primary-foreground">
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Logging in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          <div className="text-sm text-center mt-4">
            <div className="text-gray-500">Demo Accounts:</div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="bg-gray-100 p-2 rounded">
                <div className="font-semibold">Admin</div>
                <div>admin@fitwell.com</div>
                <div>Password: admin</div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <div className="font-semibold">Student</div>
                <div>student@fitwell.com</div>
                <div>Password: student</div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <div className="font-semibold">Staff</div>
                <div>staff@fitwell.com</div>
                <div>Password: staff</div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <div className="font-semibold">Trainer</div>
                <div>trainer@fitwell.com</div>
                <div>Password: trainer</div>
              </div>
            </div>
          </div>
          <Button 
            type="button" 
            onClick={directLogin}
            className="w-full mt-4 bg-green-500 hover:bg-green-600"
          >
            Direct Login (Admin)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link to="/admin/login" className="text-primary hover:underline">
              Admin Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
