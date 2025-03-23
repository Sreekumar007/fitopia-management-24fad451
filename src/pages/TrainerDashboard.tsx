
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
  Users, 
  Video, 
  Calendar, 
  ClipboardList, 
  Settings, 
  LogOut,
  Dumbbell,
  UserCheck,
  FilePieChart,
  ClipboardCheck,
  HeartPulse,
  Utensils
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for trainer dashboard
const mockTrainerData = {
  members: {
    total: 125,
    students: 98,
    staff: 27,
    active: 78
  },
  sessions: {
    today: 8,
    upcoming: 24,
    completed: 156
  },
  videos: {
    total: 45,
    popular: 12
  },
  requests: {
    pending: 7,
    approved: 18,
    rejected: 3
  }
};

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(mockTrainerData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is trainer
    if (!user || user.role !== "trainer") {
      toast.error("Unauthorized: Trainer access required");
      navigate("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setData(mockTrainerData);
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
        <title>Trainer Dashboard | FitWell Gym</title>
        <meta name="description" content="Trainer dashboard for FitWell Gym management system." />
      </Helmet>
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 text-white p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">FitWell</h2>
          <p className="text-slate-300 text-sm mt-1">Trainer Dashboard</p>
          <div className="mt-2 p-2 bg-slate-700 rounded-md text-sm">
            <p className="font-medium text-slate-200">Logged in as:</p>
            <p className="text-white">{user?.name}</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "overview" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FilePieChart className="mr-2 h-5 w-5" />
            Overview
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "members" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="mr-2 h-5 w-5" />
            Members
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "sessions" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("sessions")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Training Sessions
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "workout" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("workout")}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Workout Plans
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "videos" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            <Video className="mr-2 h-5 w-5" />
            Training Videos
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "nutrition" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("nutrition")}
          >
            <Utensils className="mr-2 h-5 w-5" />
            Diet & Nutrition
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "medical" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("medical")}
          >
            <HeartPulse className="mr-2 h-5 w-5" />
            Medical Records
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-slate-700 ${activeTab === "requests" ? "bg-slate-700" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Pending Requests
          </Button>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-700 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-700"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log out
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-grow p-6 bg-slate-50">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Trainer Dashboard</h1>
          <p className="text-slate-600">
            Manage your members, training sessions, and resources
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 md:w-[600px] bg-slate-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="workout">Workouts</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Total Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.members.total}</div>
                      <div className="flex justify-between mt-2 text-xs text-slate-300">
                        <span>Students: {data.members.students}</span>
                        <span>Staff: {data.members.staff}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <UserCheck className="mr-2 h-5 w-5" />
                        Active Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.members.active}</div>
                      <div className="text-xs text-emerald-100 mt-2">
                        {Math.round((data.members.active / data.members.total) * 100)}% of total members
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Today's Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.sessions.today}</div>
                      <div className="text-xs text-indigo-100 mt-2">
                        {data.sessions.upcoming} upcoming in the next 7 days
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-rose-600 to-rose-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <ClipboardList className="mr-2 h-5 w-5" />
                        Pending Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.requests.pending}</div>
                      <div className="text-xs text-rose-100 mt-2">
                        Requires your attention
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <Card className="col-span-1">
                    <CardHeader className="bg-slate-100">
                      <CardTitle>Upcoming Sessions</CardTitle>
                      <CardDescription>Training sessions for today and tomorrow</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {[
                          { name: "John Doe", time: "Today, 10:00 AM", type: "Weight Training" },
                          { name: "Jane Smith", time: "Today, 11:30 AM", type: "Cardio" },
                          { name: "Mike Johnson", time: "Today, 2:15 PM", type: "Yoga" },
                          { name: "Sarah Williams", time: "Tomorrow, 9:00 AM", type: "HIIT" }
                        ].map((session, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                              {session.name.charAt(0)}
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{session.name}</p>
                              <p className="text-sm text-slate-500">{session.time} • {session.type}</p>
                            </div>
                            <Button size="sm" variant="outline">Details</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader className="bg-slate-100">
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your recent actions and updates</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {[
                          { icon: <Video className="text-indigo-500" />, title: "Uploaded a new workout video", time: "Today, 9:30 AM" },
                          { icon: <ClipboardCheck className="text-emerald-500" />, title: "Updated John's workout plan", time: "Yesterday, 4:15 PM" },
                          { icon: <Utensils className="text-amber-500" />, title: "Created new nutrition guide", time: "Yesterday, 2:00 PM" },
                          { icon: <UserCheck className="text-blue-500" />, title: "Approved membership request", time: "2 days ago, 11:30 AM" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-slate-500">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-4">
                  <CardHeader className="bg-slate-100">
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Member progress and engagement</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-500">Session Completion Rate</h3>
                        <div className="text-2xl font-bold">92%</div>
                        <div className="h-2 bg-slate-200 rounded-full">
                          <div className="h-2 bg-emerald-500 rounded-full w-[92%]"></div>
                        </div>
                        <p className="text-xs text-slate-500">Members attending scheduled sessions</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-500">Member Satisfaction</h3>
                        <div className="text-2xl font-bold">4.8/5</div>
                        <div className="h-2 bg-slate-200 rounded-full">
                          <div className="h-2 bg-indigo-500 rounded-full w-[96%]"></div>
                        </div>
                        <p className="text-xs text-slate-500">Average rating from member feedback</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-500">Goal Achievement</h3>
                        <div className="text-2xl font-bold">87%</div>
                        <div className="h-2 bg-slate-200 rounded-full">
                          <div className="h-2 bg-amber-500 rounded-full w-[87%]"></div>
                        </div>
                        <p className="text-xs text-slate-500">Members reaching fitness goals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="members">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Member Management</CardTitle>
                <CardDescription>View and manage your assigned members</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Member Management</h3>
                  <p className="text-slate-500">
                    View member profiles, track their progress, and manage their workout plans.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Training Sessions</CardTitle>
                <CardDescription>Manage your scheduled training sessions</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Training Sessions</h3>
                  <p className="text-slate-500">
                    Schedule, view, and manage your training sessions with members.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workout">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Workout Plans</CardTitle>
                <CardDescription>Create and manage workout plans for members</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Workout Plans</h3>
                  <p className="text-slate-500">
                    Create personalized workout plans for members and track their progress.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Training Videos</CardTitle>
                <CardDescription>Manage and upload training videos</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Video className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Training Videos</h3>
                  <p className="text-slate-500">
                    Upload and manage training videos for members to follow.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nutrition">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Diet & Nutrition</CardTitle>
                <CardDescription>Create and manage nutrition plans</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Utensils className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Diet & Nutrition</h3>
                  <p className="text-slate-500">
                    Create personalized diet plans and nutrition guides for members.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medical">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>Manage member medical and injury records</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <HeartPulse className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Medical Records</h3>
                  <p className="text-slate-500">
                    View and update member medical information and injury records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>View and manage pending member requests</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Pending Requests</h3>
                  <p className="text-slate-500">
                    Review and approve new membership requests and training plan changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center p-8">
                  <Settings className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Settings</h3>
                  <p className="text-slate-500">
                    Update your profile, preferences, and notification settings.
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

export default TrainerDashboard;
