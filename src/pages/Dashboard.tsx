
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, Calendar, Video, Utensils, Dumbbell, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import EquipmentList from "@/components/dashboard/EquipmentList";
import DietPlanList from "@/components/dashboard/DietPlanList";
import TrainingVideoList from "@/components/dashboard/TrainingVideoList";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Extract role from the URL path
  const path = location.pathname;
  const role = path.includes("admin") 
    ? "admin" 
    : path.includes("staff") 
      ? "staff" 
      : "student";
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">FitWell</h2>
          <p className="text-muted-foreground text-sm mt-1">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</p>
          <div className="mt-2 p-2 bg-muted rounded-md text-sm">
            <p className="font-medium">Logged in as:</p>
            <p>{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
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
          
          {(role === "staff" || role === "admin") && (
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${activeTab === "students" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setActiveTab("students")}
            >
              <Users className="mr-2 h-5 w-5" />
              Students
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "schedule" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "videos" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            <Video className="mr-2 h-5 w-5" />
            Training Videos
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "diet" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("diet")}
          >
            <Utensils className="mr-2 h-5 w-5" />
            Diet Plans
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "equipment" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("equipment")}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Equipment
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
          <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">
            {role === "admin" 
              ? "Manage your gym, staff and students" 
              : role === "staff" 
                ? "Manage your students and classes" 
                : "Track your fitness journey"}
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(role === "staff" || role === "admin") && (
              <TabsTrigger value="students">Students</TabsTrigger>
            )}
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border rounded-lg p-6 flex flex-col">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Total Students</h3>
                <p className="text-3xl font-bold mb-1">1,234</p>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
                <div className="h-1 w-full bg-muted mt-4 mb-2 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-6 flex flex-col">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Active Programs</h3>
                <p className="text-3xl font-bold mb-1">42</p>
                <p className="text-xs text-muted-foreground">+3 new this week</p>
                <div className="h-1 w-full bg-muted mt-4 mb-2 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-primary rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-6 flex flex-col">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Training Videos</h3>
                <p className="text-3xl font-bold mb-1">215</p>
                <p className="text-xs text-muted-foreground">+18 new uploads</p>
                <div className="h-1 w-full bg-muted mt-4 mb-2 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-6 flex flex-col">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Average Attendance</h3>
                <p className="text-3xl font-bold mb-1">87%</p>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
                <div className="h-1 w-full bg-muted mt-4 mb-2 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-medium mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {item % 2 === 0 ? (
                          <Users size={20} />
                        ) : (
                          <Video size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {item % 2 === 0 
                            ? "New student registration" 
                            : "New training video uploaded"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() - item * 3600000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-medium mb-4">Upcoming Classes</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">
                          {item === 1 
                            ? "HIIT Training" 
                            : item === 2 
                              ? "Yoga Class" 
                              : item === 3 
                                ? "Weight Training" 
                                : "Cardio Session"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() + item * 86400000).toLocaleDateString()} • {item + 8}:00 AM
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-medium mb-4">Student Management</h3>
              <p className="text-muted-foreground">
                This feature will be implemented soon. As a {role}, you'll be able to manage student profiles,
                track their progress, and assign personalized training programs.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="videos">
            <TrainingVideoList />
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-medium mb-4">Class Schedule</h3>
              <p className="text-muted-foreground">
                This feature will be implemented soon. You'll be able to view and manage your class schedule,
                book sessions, and set reminders for upcoming classes.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="diet">
            <DietPlanList />
          </TabsContent>
          
          <TabsContent value="equipment">
            <EquipmentList />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-medium mb-4">Account Settings</h3>
              <p className="text-muted-foreground">
                This feature will be implemented soon. You'll be able to update your profile information,
                change your password, and manage notification preferences.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
