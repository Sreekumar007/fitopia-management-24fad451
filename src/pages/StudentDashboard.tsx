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
import ProgressChart from "@/components/dashboard/ProgressChart";
import WorkoutList from "@/components/dashboard/WorkoutList";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import SchedulePanel from "@/components/dashboard/SchedulePanel";
import AttendancePanel from "@/components/dashboard/AttendancePanel";
import AttendanceMarker from "@/components/dashboard/AttendanceMarker";

// Import services
import {
  getStudentProfile,
  getTrainingVideos,
  getDietPlans,
  getWorkouts,
  getAttendance,
  getProgress,
  getNotifications,
  getSchedule
} from "@/services/studentService";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  
  // State for various data
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    attendance_records: [],
    attendance_percentage: 0,
    days_present: 0,
    total_days: 0
  });
  const [progressData, setProgressData] = useState({
    last_month: 0,
    this_month: 0,
    streak: 0,
    workouts_completed: 0,
    hours_logged: 0,
    monthly_progress: []
  });
  const [notifications, setNotifications] = useState([]);
  const [schedule, setSchedule] = useState([]);
  
  // Loading states
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingDietPlans, setLoadingDietPlans] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    // Check if user is student
    if (!user || user.role !== "student") {
      toast.error("Unauthorized: Student access required");
      navigate("/login");
      return;
    }

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Try loading profile data
        try {
          const profileData = await getStudentProfile();
          setProfile(profileData);
        } catch (error) {
          console.error("Error loading profile:", error);
          // Don't show toast here as we'll show a general error message
        }
        
        // Try loading other initial data independently so one failure doesn't stop others
        const progressPromise = loadProgressData().catch(err => {
          console.error("Error in progress data loading:", err);
          // Default values set in the loadProgressData function
        });
        
        const schedulePromise = loadScheduleData().catch(err => {
          console.error("Error in schedule data loading:", err);
          // Default values set in the loadScheduleData function
        });
        
        const attendancePromise = loadAttendanceData().catch(err => {
          console.error("Error in attendance data loading:", err);
          // Default values set in the loadAttendanceData function
        });
        
        // Wait for all promises to settle (whether fulfilled or rejected)
        await Promise.allSettled([progressPromise, schedulePromise, attendancePromise]);
        
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load dashboard data. Some features may be unavailable.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [navigate, user]);

  // Load data based on active tab
  useEffect(() => {
    const loadTabData = async () => {
      switch (activeTab) {
        case "videos":
          if (videos.length === 0) {
            await loadVideosData();
          }
          break;
          
        case "diet":
          if (dietPlans.length === 0) {
            await loadDietPlansData();
          }
          break;
          
        case "workouts":
          if (workouts.length === 0) {
            await loadWorkoutsData();
          }
          break;
          
        case "progress":
          if (!progressData.monthly_progress.length) {
            await loadProgressData();
          }
          await loadAttendanceData();
          break;
          
        case "notifications":
          if (notifications.length === 0) {
            await loadNotificationsData();
          }
          break;
          
        case "schedule":
          if (schedule.length === 0) {
            await loadScheduleData();
          }
          break;
          
        default:
          break;
      }
    };

    loadTabData();
  }, [activeTab]);

  // Data loading functions
  const loadVideosData = async () => {
    try {
      setLoadingVideos(true);
      const data = await getTrainingVideos();
      setVideos(data);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load training videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadDietPlansData = async () => {
    try {
      setLoadingDietPlans(true);
      const data = await getDietPlans();
      setDietPlans(data);
    } catch (error) {
      console.error("Error loading diet plans:", error);
      toast.error("Failed to load diet plans");
    } finally {
      setLoadingDietPlans(false);
    }
  };

  const loadWorkoutsData = async () => {
    try {
      setLoadingWorkouts(true);
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Error loading workouts:", error);
      toast.error("Failed to load workouts");
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoadingAttendance(true);
      const data = await getAttendance();
      setAttendanceData(data);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Failed to load attendance data");
      // Set default values for attendance data
      setAttendanceData({
        attendance_records: [],
        attendance_percentage: 0,
        days_present: 0,
        total_days: 0
      });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadProgressData = async () => {
    try {
      setLoadingProgress(true);
      const data = await getProgress();
      setProgressData(data);
    } catch (error) {
      console.error("Error loading progress:", error);
      toast.error("Failed to load progress data");
      // Set default values
      setProgressData({
        last_month: 0,
        this_month: 0,
        streak: 0,
        workouts_completed: 0,
        hours_logged: 0,
        monthly_progress: []
      });
    } finally {
      setLoadingProgress(false);
    }
  };

  const loadNotificationsData = async () => {
    try {
      setLoadingNotifications(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadScheduleData = async () => {
    try {
      setLoadingSchedule(true);
      const data = await getSchedule();
      setSchedule(data);
    } catch (error) {
      console.error("Error loading schedule:", error);
      toast.error("Failed to load schedule");
      setSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Handle attendance marking
  const handleAttendanceMarked = async () => {
    await loadAttendanceData();
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                            <p className="text-indigo-500">{profile?.department || "Computer Science"}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium">{profile?.age || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fitness Goal</p>
                            <p className="font-medium">{profile?.fitness_goal || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Attendance</p>
                            <p className="font-medium">{attendanceData.attendance_percentage}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium text-green-600">Active</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-indigo-100 shadow-sm">
                      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                        <CardTitle className="flex items-center text-indigo-800">
                          <ActivitySquare className="mr-2 h-5 w-5 text-indigo-600" />
                          Fitness Stats
                        </CardTitle>
                        <CardDescription>Your workout performance</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Award className="h-5 w-5 text-indigo-600" />
                              <p className="text-sm font-medium text-indigo-600">Current Streak</p>
                            </div>
                            <p className="text-2xl font-bold mt-2">{progressData.streak} days</p>
                          </div>
                          
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Dumbbell className="h-5 w-5 text-indigo-600" />
                              <p className="text-sm font-medium text-indigo-600">Workouts</p>
                            </div>
                            <p className="text-2xl font-bold mt-2">{progressData.workouts_completed}</p>
                          </div>
                          
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-5 w-5 text-indigo-600" />
                              <p className="text-sm font-medium text-indigo-600">Attendance</p>
                            </div>
                            <p className="text-2xl font-bold mt-2">{attendanceData.attendance_percentage}%</p>
                          </div>
                          
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-indigo-600" />
                              <p className="text-sm font-medium text-indigo-600">Hours Logged</p>
                            </div>
                            <p className="text-2xl font-bold mt-2">{progressData.hours_logged}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <AttendanceMarker onAttendanceMarked={handleAttendanceMarked} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="col-span-2 bg-white border-indigo-100 shadow-sm">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="flex items-center text-indigo-800">
                        <BarChart4 className="mr-2 h-5 w-5 text-indigo-600" />
                        Progress Overview
                      </CardTitle>
                      <CardDescription>Your fitness improvement over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Last Month</p>
                          <p className="text-lg font-semibold text-gray-800">{progressData.last_month}%</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div>
                          <p className="text-sm text-gray-500">This Month</p>
                          <p className="text-lg font-semibold text-indigo-600">{progressData.this_month}%</p>
                          <div className="flex items-center text-green-600 text-xs">
                            <span className="mr-1">↑</span>
                            <span>{progressData.this_month - progressData.last_month}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <ProgressChart data={progressData.monthly_progress || []} />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-indigo-100 shadow-sm">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="flex items-center text-indigo-800">
                        <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                        Upcoming Sessions
                      </CardTitle>
                      <CardDescription>Your scheduled activities</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {loadingSchedule ? (
                          <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                          </div>
                        ) : schedule.length > 0 ? (
                          schedule.slice(0, 3).map((item, index) => (
                            <div key={item.id} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{item.title}</h4>
                                <p className="text-sm text-gray-500">Trainer: {item.trainer}</p>
                                <p className="text-xs text-indigo-600">{item.time}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-2">No upcoming sessions</p>
                        )}
                        
                        {schedule.length > 0 && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => setActiveTab("schedule")}
                          >
                            View All Sessions
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border-indigo-100 shadow-sm">
                <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                  <CardTitle className="flex items-center text-indigo-800">
                    <BarChart4 className="mr-2 h-5 w-5 text-indigo-600" />
                    Monthly Progress
                  </CardTitle>
                  <CardDescription>Your fitness improvement over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingProgress ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : (
                    <ProgressChart data={progressData.monthly_progress || []} />
                  )}
                </CardContent>
              </Card>
              
              <AttendancePanel 
                attendanceData={attendanceData} 
                isLoading={loadingAttendance}
              />
            </div>
            
            <Card className="bg-white border-indigo-100 shadow-sm">
              <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                <CardTitle className="flex items-center text-indigo-800">
                  <ActivitySquare className="mr-2 h-5 w-5 text-indigo-600" />
                  Fitness Stats
                </CardTitle>
                <CardDescription>Summary of your fitness metrics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-600">Current Streak</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{progressData.streak} days</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Dumbbell className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-600">Workouts</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{progressData.workouts_completed}</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-600">Attendance</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{attendanceData.attendance_percentage}%</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-600">Hours Logged</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{progressData.hours_logged}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <SchedulePanel 
              scheduleItems={schedule} 
              isLoading={loadingSchedule}
            />
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-4">
            <TrainingVideoList 
              videos={videos} 
              isLoading={loadingVideos}
            />
          </TabsContent>
          
          <TabsContent value="diet" className="space-y-4">
            <DietPlanList 
              dietPlans={dietPlans} 
              isLoading={loadingDietPlans}
            />
          </TabsContent>
          
          <TabsContent value="workouts" className="space-y-4">
            <WorkoutList 
              workouts={workouts} 
              isLoading={loadingWorkouts}
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <NotificationPanel 
              notifications={notifications}
              isLoading={loadingNotifications}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white border-indigo-100 shadow-sm">
              <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                <CardTitle className="flex items-center text-indigo-800">
                  <Settings className="mr-2 h-5 w-5 text-indigo-600" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 py-8">Account settings functionality coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
