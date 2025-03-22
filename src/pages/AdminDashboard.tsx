
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Users, 
  Dumbbell, 
  UserCog, 
  Settings, 
  LogOut 
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import UserManagement from "@/components/admin/UserManagement";

interface DashboardStats {
  users: {
    total: number;
    students: number;
    staff: number;
    admins: number;
  };
  equipment: number;
}

const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get token from localStorage
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  
  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      toast.error("Unauthorized: Admin access required");
      navigate("/login");
      return;
    }

    fetchDashboardStats();
  }, [navigate, user]);
  
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-muted/20 flex">
      <Helmet>
        <title>Admin Dashboard | FitWell Gym</title>
        <meta name="description" content="Administrative dashboard for FitWell Gym management system." />
      </Helmet>
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">FitWell</h2>
          <p className="text-muted-foreground text-sm mt-1">Admin Dashboard</p>
          <div className="mt-2 p-2 bg-muted rounded-md text-sm">
            <p className="font-medium">Logged in as:</p>
            <p>{user?.name}</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "overview" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart className="mr-2 h-5 w-5" />
            Overview
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "users" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-5 w-5" />
            User Management
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "equipment" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("equipment")}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Equipment
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "trainers" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("trainers")}
          >
            <UserCog className="mr-2 h-5 w-5" />
            Trainers
          </Button>
        </nav>
        
        <div className="mt-auto pt-4 border-t space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log out
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-grow p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your gym, staff, and students
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
                      <p className="text-xs text-muted-foreground">Combined students, staff, and admins</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.users.students || 0}</div>
                      <p className="text-xs text-muted-foreground">Registered gym members</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.users.staff || 0}</div>
                      <p className="text-xs text-muted-foreground">Trainers and employees</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Equipment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.equipment || 0}</div>
                      <p className="text-xs text-muted-foreground">Total gym equipment</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                      <CardDescription>System uptime and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">API Server</span>
                            <span className="text-sm text-green-500">Online</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Database</span>
                            <span className="text-sm text-green-500">Online</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Storage</span>
                            <span className="text-sm">60% Used</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Memory</span>
                            <span className="text-sm">40% Used</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full w-2/5"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest system events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {item % 2 === 0 ? (
                                <Users size={20} />
                              ) : (
                                <Dumbbell size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {item % 2 === 0 
                                  ? "New user registered" 
                                  : "Equipment maintenance scheduled"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(Date.now() - item * 3600000).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Management</CardTitle>
                <CardDescription>Manage gym equipment inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  Equipment management component will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trainers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trainer Management</CardTitle>
                <CardDescription>Manage gym trainers and staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  Trainer management component will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  Settings component will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
