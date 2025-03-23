
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
  LogOut,
  BookUser,
  Coins,
  CalendarCheck,
  ListChecks
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import UserManagement from "@/components/admin/UserManagement";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for the admin dashboard
const mockStats = {
  users: {
    total: 842,
    students: 620,
    staff: 178,
    admins: 4,
    activeMembers: 345,
    registeredMembers: 798
  },
  trainers: {
    total: 28,
    active: 24
  },
  equipment: 75,
  earnings: {
    total: 125000,
    monthly: 12500,
    yearly: 125000
  },
  attendance: {
    today: 125,
    week: 875,
    month: 3450
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      toast.error("Unauthorized: Admin access required");
      navigate("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, user]);
  
  const handleLogout = () => {
    logout();
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
            className={`w-full justify-start ${activeTab === "members" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="mr-2 h-5 w-5" />
            Member Management
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "trainers" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("trainers")}
          >
            <UserCog className="mr-2 h-5 w-5" />
            Trainer Management
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
            className={`w-full justify-start ${activeTab === "attendance" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <CalendarCheck className="mr-2 h-5 w-5" />
            Attendance
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
            Manage your gym, staff, and members
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2 bg-blue-50">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Users className="mr-2 h-5 w-5 text-blue-500" />
                        Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Members</span>
                          <span className="font-bold">{stats.users.total}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Active Members</span>
                          <span className="font-bold text-green-600">{stats.users.activeMembers}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Registered Members</span>
                          <span className="font-bold">{stats.users.registeredMembers}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 bg-purple-50">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <BookUser className="mr-2 h-5 w-5 text-purple-500" />
                        User Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Students</span>
                          <span className="font-bold">{stats.users.students}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">College Staff</span>
                          <span className="font-bold">{stats.users.staff}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Trainers</span>
                          <span className="font-bold">{stats.trainers.total}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 bg-green-50">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Coins className="mr-2 h-5 w-5 text-green-500" />
                        Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Earnings</span>
                          <span className="font-bold">${stats.earnings.total.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monthly Revenue</span>
                          <span className="font-bold">${stats.earnings.monthly.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Yearly Revenue</span>
                          <span className="font-bold">${stats.earnings.yearly.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2 bg-amber-50">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <CalendarCheck className="mr-2 h-5 w-5 text-amber-500" />
                        Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Today's Attendance</span>
                          <span className="font-bold">{stats.attendance.today}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Weekly Attendance</span>
                          <span className="font-bold">{stats.attendance.week}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monthly Attendance</span>
                          <span className="font-bold">{stats.attendance.month}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 bg-red-50">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Dumbbell className="mr-2 h-5 w-5 text-red-500" />
                        Equipment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Equipment</span>
                          <span className="font-bold">{stats.equipment}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Functional</span>
                          <span className="font-bold text-green-600">{Math.floor(stats.equipment * 0.9)}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Under Maintenance</span>
                          <span className="font-bold text-amber-600">{Math.floor(stats.equipment * 0.1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 bg-cyan-50">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <UserCog className="mr-2 h-5 w-5 text-cyan-500" />
                        Trainer Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Trainers</span>
                          <span className="font-bold">{stats.trainers.total}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Active Trainers</span>
                          <span className="font-bold text-green-600">{stats.trainers.active}</span>
                        </div>
                        <div className="h-px bg-muted" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">On Leave</span>
                          <span className="font-bold text-amber-600">{stats.trainers.total - stats.trainers.active}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <Card className="col-span-1">
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="flex items-center">
                        <ListChecks className="mr-2 h-5 w-5 text-slate-500" />
                        Recent Activities
                      </CardTitle>
                      <CardDescription>Latest system events</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {[
                          { icon: <Users className="text-blue-500" />, title: "New student registered", time: "Today, 10:30 AM" },
                          { icon: <UserCog className="text-purple-500" />, title: "Trainer schedule updated", time: "Today, 09:15 AM" },
                          { icon: <Dumbbell className="text-red-500" />, title: "Equipment maintenance completed", time: "Yesterday, 04:45 PM" },
                          { icon: <CalendarCheck className="text-green-500" />, title: "Monthly attendance report generated", time: "Yesterday, 02:30 PM" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="flex items-center">
                        <BarChart className="mr-2 h-5 w-5 text-slate-500" />
                        System Health
                      </CardTitle>
                      <CardDescription>System uptime and status</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
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
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="members">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="trainers" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle>Trainer Management</CardTitle>
                <CardDescription>Manage gym trainers and staff</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <UserCog className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Trainer Management</h3>
                  <p className="text-muted-foreground">
                    Add, edit, or remove trainers. Assign trainers to members and manage their schedules.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle>Equipment Management</CardTitle>
                <CardDescription>Manage gym equipment inventory</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Equipment Management</h3>
                  <p className="text-muted-foreground">
                    Track equipment inventory, maintenance schedules, and usage statistics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle>Attendance Tracking</CardTitle>
                <CardDescription>Monitor member attendance and engagement</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <CalendarCheck className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Attendance Management</h3>
                  <p className="text-muted-foreground">
                    View and track attendance records for all members. Generate reports and analyze patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Settings className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Settings</h3>
                  <p className="text-muted-foreground">
                    Configure system settings, manage access permissions, and customize the platform.
                  </p>
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
