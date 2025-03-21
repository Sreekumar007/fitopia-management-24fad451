
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, Calendar, Video, Clipboard, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

// Just a mock data for visualization purposes
const mockStudents = [
  { id: 1, name: "Alex Johnson", program: "Weight Training", attendance: "85%", progress: "Good" },
  { id: 2, name: "Sarah Williams", program: "Cardio Focus", attendance: "92%", progress: "Excellent" },
  { id: 3, name: "Michael Brown", program: "Mixed Fitness", attendance: "78%", progress: "Average" },
  { id: 4, name: "Emily Davis", program: "Yoga", attendance: "95%", progress: "Excellent" },
];

// Mock training videos
const mockVideos = [
  { id: 1, title: "Proper Squat Technique", duration: "5:30", category: "Strength Training" },
  { id: 2, title: "HIIT Workout Routine", duration: "15:45", category: "Cardio" },
  { id: 3, title: "Full Body Stretch", duration: "8:20", category: "Flexibility" },
  { id: 4, title: "Advanced Deadlift Guide", duration: "7:15", category: "Strength Training" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Extract role from the URL path
  const path = location.pathname;
  const role = path.includes("admin") 
    ? "admin" 
    : path.includes("staff") 
      ? "staff" 
      : "student";
  
  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">FitWell</h2>
          <p className="text-muted-foreground text-sm mt-1">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</p>
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
            className={`w-full justify-start ${activeTab === "students" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <Users className="mr-2 h-5 w-5" />
            {role === "student" ? "Members" : "Students"}
          </Button>
          
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
            className={`w-full justify-start ${activeTab === "programs" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setActiveTab("programs")}
          >
            <Clipboard className="mr-2 h-5 w-5" />
            Programs
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
          <TabsList className="grid grid-cols-5 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">{role === "student" ? "Members" : "Students"}</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">+3 new this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Training Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">215</div>
                  <p className="text-xs text-muted-foreground">+18 new uploads</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest updates from the gym</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Upcoming Classes</CardTitle>
                  <CardDescription>Your schedule for the next few days</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{role === "student" ? "Fellow Members" : "Students"}</CardTitle>
                <CardDescription>
                  {role === "student" 
                    ? "Other members training at the gym" 
                    : "Manage and view all student information"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 bg-muted/50 p-3 font-medium">
                    <div>Name</div>
                    <div>Program</div>
                    <div>Attendance</div>
                    <div>Progress</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {mockStudents.map((student) => (
                    <div key={student.id} className="grid grid-cols-5 p-3 border-t items-center">
                      <div>{student.name}</div>
                      <div>{student.program}</div>
                      <div>{student.attendance}</div>
                      <div>{student.progress}</div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Videos</CardTitle>
                <CardDescription>Watch instructional videos and tutorials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockVideos.map((video) => (
                    <div key={video.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-muted relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="pill bg-primary/10 text-primary mb-2">{video.category}</div>
                        <h3 className="font-semibold">{video.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Schedule</CardTitle>
                <CardDescription>Upcoming classes and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  Schedule component will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fitness Programs</CardTitle>
                <CardDescription>View and manage training programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  Programs component will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
