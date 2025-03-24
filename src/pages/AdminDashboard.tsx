import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import {
  BarChart,
  Users,
  Dumbbell,
  FileClock,
  UserCog,
  LogOut,
  Home,
  Settings,
  Calendar
} from "lucide-react";

// Import admin components
import DashboardStats from "@/components/admin/DashboardStats";
import UserManagement from "@/components/admin/UserManagement";
import EquipmentManagement from "@/components/admin/EquipmentManagement";
import AttendanceManagement from "@/components/admin/AttendanceManagement";
import MembershipStats from "@/components/admin/MembershipStats";

const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify user is admin
    if (!user || user.role !== "admin") {
      toast.error("Unauthorized: Admin access required");
      navigate("/login");
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      
      // Set some default data for development/demo purposes
      setDashboardData({
        total_students: 15,
        total_trainers: 5,
        total_staff: 3,
        total_equipment: 25,
        recent_members: [
          { id: 1, name: "John Doe", email: "john@example.com", role: "student", join_date: "2023-01-15" },
          { id: 2, name: "Jane Smith", email: "jane@example.com", role: "student", join_date: "2023-01-20" }
        ],
        membership_stats: {
          active: 12,
          expired: 3,
          pending: 2
        },
        today_attendance: [
          { id: 1, user_name: "Alice Cooper", check_in: "2023-05-01T08:30:00", check_out: "2023-05-01T10:30:00" },
          { id: 2, user_name: "Bob Dylan", check_in: "2023-05-01T09:15:00", check_out: null }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Helmet>
        <title>Admin Dashboard | FitWell Gym</title>
        <meta name="description" content="Admin dashboard for FitWell Gym management system." />
      </Helmet>
      
      {/* Top Navigation */}
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Dumbbell className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">FitWell Gym Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="opacity-75">Logged in as:</span> {user?.name || "Admin"}
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4 flex flex-col">
          <nav className="space-y-1">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard Overview
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button
              variant={activeTab === "equipment" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("equipment")}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Equipment
            </Button>
            <Button
              variant={activeTab === "attendance" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("attendance")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Attendance
            </Button>
            <Button
              variant={activeTab === "membership" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("membership")}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Membership Stats
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
          
          <div className="mt-auto pt-4 text-xs text-muted-foreground">
            <p>FitWell Gym Management System</p>
            <p>Version 1.0</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === "overview" && (
              <>
                <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                <DashboardStats 
                  data={dashboardData} 
                  isLoading={isLoading} 
                  onRefresh={fetchDashboardData} 
                />
              </>
            )}
            
            {activeTab === "users" && (
              <>
                <h2 className="text-2xl font-bold mb-6">User Management</h2>
                <UserManagement />
              </>
            )}
            
            {activeTab === "equipment" && (
              <>
                <h2 className="text-2xl font-bold mb-6">Equipment Management</h2>
                <EquipmentManagement />
              </>
            )}
            
            {activeTab === "attendance" && (
              <>
                <h2 className="text-2xl font-bold mb-6">Attendance Management</h2>
                <AttendanceManagement />
              </>
            )}
            
            {activeTab === "membership" && (
              <>
                <h2 className="text-2xl font-bold mb-6">Membership Statistics</h2>
                <MembershipStats />
              </>
            )}
            
            {activeTab === "settings" && (
              <>
                <h2 className="text-2xl font-bold mb-6">System Settings</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>Configure system-wide settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-2">General Settings</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>System Notifications</span>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Email Templates</span>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Backup Database</span>
                          <Button variant="outline" size="sm">Run Backup</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-2">Gym Settings</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Opening Hours</span>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Membership Plans</span>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Holiday Schedule</span>
                          <Button variant="outline" size="sm">Set Dates</Button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      Settings panel is under development. More options will be available soon.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
