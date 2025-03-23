
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
  Calendar, 
  Video, 
  Utensils, 
  Dumbbell, 
  Settings, 
  LogOut,
  ActivitySquare,
  Award,
  Heart,
  BarChart4,
  GraduationCap,
  Bell,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import TrainingVideoList from "@/components/dashboard/TrainingVideoList";
import DietPlanList from "@/components/dashboard/DietPlanList";

// Mock data for student dashboard
const mockStudentData = {
  profile: {
    name: "John Smith",
    age: 22,
    department: "Computer Science",
    gender: "Male",
    blood_group: "A+",
    height: 175,
    weight: 70
  },
  stats: {
    streak: 14,
    workoutsCompleted: 42,
    attendance: "85%",
    hoursLogged: 56
  },
  progress: {
    lastMonth: 75,
    thisMonth: 85
  },
  upcoming: [
    { title: "HIIT Training", trainer: "Mike Jones", time: "Tomorrow, 10:00 AM" },
    { title: "Yoga Class", trainer: "Sarah Williams", time: "Wednesday, 4:30 PM" },
    { title: "Weight Training", trainer: "Robert Davis", time: "Friday, 2:00 PM" }
  ]
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(mockStudentData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is student
    if (!user || user.role !== "student") {
      toast.error("Unauthorized: Student access required");
      navigate("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setData({
        ...mockStudentData,
        profile: {
          ...mockStudentData.profile,
          name: user.name || mockStudentData.profile.name
        }
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex">
      <Helmet>
        <title>Student Dashboard | FitWell Gym</title>
        <meta name="description" content="Student dashboard for FitWell Gym fitness tracking." />
      </Helmet>
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-indigo-600 text-white p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">FitWell</h2>
          <p className="text-indigo-200 text-sm mt-1">Student Dashboard</p>
          <div className="mt-2 p-2 bg-indigo-700 rounded-md text-sm">
            <p className="font-medium text-indigo-100">Logged in as:</p>
            <p className="text-white">{user?.name}</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "overview" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Overview
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "progress" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            <BarChart4 className="mr-2 h-5 w-5" />
            My Progress
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "schedule" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "videos" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            <Video className="mr-2 h-5 w-5" />
            Training Videos
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "diet" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("diet")}
          >
            <Utensils className="mr-2 h-5 w-5" />
            Diet Plans
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "workouts" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("workouts")}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            My Workouts
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "health" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("health")}
          >
            <Heart className="mr-2 h-5 w-5" />
            Health Stats
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-indigo-700 ${activeTab === "notifications" ? "bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </Button>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-indigo-500 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-indigo-700"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-indigo-700"
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
          <h1 className="text-3xl font-bold text-indigo-900">Hi, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-indigo-600">
            Track your fitness journey and stay on top of your workout routine
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px] bg-indigo-100 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white border-indigo-100 shadow-sm">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="flex items-center text-indigo-800">
                        <GraduationCap className="mr-2 h-5 w-5 text-indigo-600" />
                        Your Profile
                      </CardTitle>
                      <CardDescription>Personal details and stats</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xl font-bold">
                          {user?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user?.name || data.profile.name}</h3>
                          <p className="text-indigo-600 text-sm">{data.profile.department} Student</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-indigo-400">Age</p>
                            <p className="font-medium">{data.profile.age} years</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-indigo-400">Gender</p>
                            <p className="font-medium">{user?.gender || data.profile.gender}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-indigo-400">Blood Group</p>
                            <p className="font-medium">{user?.blood_group || data.profile.blood_group}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-indigo-400">Height</p>
                            <p className="font-medium">{user?.height || data.profile.height} cm</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-indigo-400">Weight</p>
                            <p className="font-medium">{user?.weight || data.profile.weight} kg</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-indigo-100 shadow-sm">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="flex items-center text-indigo-800">
                        <Award className="mr-2 h-5 w-5 text-indigo-600" />
                        Your Progress
                      </CardTitle>
                      <CardDescription>Workout and fitness achievements</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-indigo-50 rounded-lg p-4 text-center">
                          <ActivitySquare className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                          <p className="text-xl font-bold text-indigo-900">{data.stats.workoutsCompleted}</p>
                          <p className="text-xs text-indigo-600">Workouts Completed</p>
                        </div>
                        
                        <div className="bg-indigo-50 rounded-lg p-4 text-center">
                          <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                          <p className="text-xl font-bold text-indigo-900">{data.stats.hoursLogged}</p>
                          <p className="text-xs text-indigo-600">Hours Logged</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">Workout Streak</p>
                            <p className="text-sm font-bold text-indigo-700">{data.stats.streak} days</p>
                          </div>
                          <div className="h-2 bg-indigo-100 rounded-full">
                            <div className="h-2 bg-indigo-600 rounded-full" style={{ width: `${(data.stats.streak / 30) * 100}%` }}></div>
                          </div>
                          <p className="text-xs text-indigo-400">Keep it up! You're on your way to a 30-day streak</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">Attendance Rate</p>
                            <p className="text-sm font-bold text-indigo-700">{data.stats.attendance}</p>
                          </div>
                          <div className="h-2 bg-indigo-100 rounded-full">
                            <div className="h-2 bg-indigo-600 rounded-full w-[85%]"></div>
                          </div>
                          <p className="text-xs text-indigo-400">Great attendance! Try to maintain this consistency</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card className="md:col-span-2 bg-white border-indigo-100 shadow-sm">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="flex items-center text-indigo-800">
                        <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                        Upcoming Sessions
                      </CardTitle>
                      <CardDescription>Your scheduled training sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {data.upcoming.map((session, index) => (
                          <div key={index} className="p-4 rounded-lg border border-indigo-100 bg-white hover:bg-indigo-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-indigo-900">{session.title}</h4>
                                <p className="text-sm text-indigo-600">with {session.trainer}</p>
                              </div>
                              <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                                {session.time.split(',')[0]}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <p className="text-sm text-indigo-500">{session.time}</p>
                              <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                                Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-indigo-100 shadow-sm">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="flex items-center text-indigo-800">
                        <Bell className="mr-2 h-5 w-5 text-indigo-600" />
                        Notifications
                      </CardTitle>
                      <CardDescription>Recent updates and alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {[
                          { title: "New workout plan assigned", time: "1 hour ago" },
                          { title: "New training video available", time: "Yesterday" },
                          { title: "Session reminder: HIIT Training", time: "2 days ago" },
                          { title: "Monthly progress report ready", time: "3 days ago" }
                        ].map((notification, index) => (
                          <div key={index} className="flex items-center gap-3 py-2 border-b border-indigo-50 last:border-0">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <div>
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-indigo-400">{notification.time}</p>
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
          
          <TabsContent value="progress">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle>My Progress</CardTitle>
                <CardDescription>Track your fitness journey and achievements</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <BarChart4 className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Progress Tracking</h3>
                  <p className="text-indigo-600">
                    View your fitness progress, achievements, and goals.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle>My Schedule</CardTitle>
                <CardDescription>View your upcoming training sessions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Calendar className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Training Schedule</h3>
                  <p className="text-indigo-600">
                    Your upcoming sessions, classes, and appointments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <TrainingVideoList />
          </TabsContent>
          
          <TabsContent value="diet">
            <DietPlanList />
          </TabsContent>
          
          <TabsContent value="workouts">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle>My Workouts</CardTitle>
                <CardDescription>View your assigned workout plans</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Workout Plans</h3>
                  <p className="text-indigo-600">
                    View your personalized workout plans and track your progress.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="health">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle>Health Stats</CardTitle>
                <CardDescription>Track your health metrics and progress</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Heart className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Health Monitoring</h3>
                  <p className="text-indigo-600">
                    Track your health metrics like weight, BMI, and other important stats.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle>Notifications</CardTitle>
                <CardDescription>View all your notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Bell className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Notifications Center</h3>
                  <p className="text-indigo-600">
                    Stay updated with all your gym notifications and alerts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Settings className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Account Settings</h3>
                  <p className="text-indigo-600">
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

export default StudentDashboard;
