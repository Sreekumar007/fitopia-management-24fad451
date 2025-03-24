
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

// Form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", values);
      
      // For demo/testing - hardcoded credentials
      if (values.email === "admin@fitwell.com" && values.password === "admin") {
        login("demo-token-admin", { id: 1, name: "Admin User", email: values.email, role: "admin" });
        toast.success("Admin login successful");
        navigate("/admin/dashboard");
        return;
      }
      
      if (values.email === "student@fitwell.com" && values.password === "student") {
        login("demo-token-student", { id: 2, name: "Test Student", email: values.email, role: "student" });
        toast.success("Student login successful");
        navigate("/student/dashboard");
        return;
      }
      
      if (values.email === "staff@fitwell.com" && values.password === "staff") {
        login("demo-token-staff", { id: 3, name: "Test Staff", email: values.email, role: "staff" });
        toast.success("Staff login successful");
        navigate("/staff/dashboard");
        return;
      }
      
      if (values.email === "trainer@fitwell.com" && values.password === "trainer") {
        login("demo-token-trainer", { id: 4, name: "Test Trainer", email: values.email, role: "trainer" });
        toast.success("Trainer login successful");
        navigate("/trainer/dashboard");
        return;
      }
      
      // Actual API call
      const response = await axios.post("http://localhost:5000/api/auth/login", values);
      
      // Handle successful login
      const { token, user } = response.data;
      login(token, user);
      
      toast.success("Login successful");
      
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "staff") {
        navigate("/staff/dashboard");
      } else if (user.role === "trainer") {
        navigate("/trainer/dashboard");
      } else {
        navigate("/student/dashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
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
