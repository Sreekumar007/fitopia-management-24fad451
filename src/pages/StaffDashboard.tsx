
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
  Building2,
  FileSpreadsheet,
  Users,
  HeartPulse,
  BookOpen,
  Clipboard,
  BarChart3,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import TrainingVideoList from "@/components/dashboard/TrainingVideoList";
import DietPlanList from "@/components/dashboard/DietPlanList";

// Mock data for staff dashboard
const mockStaffData = {
  profile: {
    name: "Emily Wilson",
    department: "Physical Education",
    position: "Fitness Coordinator",
    gender: "Female",
    blood_group: "B+",
    height: 165,
    weight: 60
  },
  stats: {
    workoutsCompleted: 56,
    attendance: "92%",
    sessionsScheduled: 12,
    facultyMembers: 28
  },
  activities: [
    { title: "Faculty Fitness Session", date: "Today, 4:00 PM", participants: 12 },
    { title: "Staff Yoga Class", date: "Tomorrow, 8:30 AM", participants: 8 },
    { title: "Department Meeting", date: "Friday, 2:00 PM", participants: 15 }
  ]
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(mockStaffData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is staff
    if (!user || user.role !== "staff") {
      toast.error("Unauthorized: Staff access required");
      navigate("/login");
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setData({
        ...mockStaffData,
        profile: {
          ...mockStaffData.profile,
          name: user.name || mockStaffData.profile.name
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
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex">
      <Helmet>
        <title>Staff Dashboard | FitWell Gym</title>
        <meta name="description" content="College Staff dashboard for FitWell Gym management system." />
      </Helmet>
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-teal-700 text-white p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">FitWell</h2>
          <p className="text-teal-200 text-sm mt-1">Staff Dashboard</p>
          <div className="mt-2 p-2 bg-teal-800 rounded-md text-sm">
            <p className="font-medium text-teal-100">Logged in as:</p>
            <p className="text-white">{user?.name}</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "overview" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Building2 className="mr-2 h-5 w-5" />
            College Staff Hub
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "faculty" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("faculty")}
          >
            <Users className="mr-2 h-5 w-5" />
            Faculty Fitness
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "schedule" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "videos" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            <Video className="mr-2 h-5 w-5" />
            Training Videos
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "diet" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("diet")}
          >
            <Utensils className="mr-2 h-5 w-5" />
            Diet Plans
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "wellness" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("wellness")}
          >
            <HeartPulse className="mr-2 h-5 w-5" />
            Wellness Program
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "records" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Fitness Records
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-teal-800 ${activeTab === "resources" ? "bg-teal-800" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Resources
          </Button>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-teal-600 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-teal-800"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-teal-800"
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
          <h1 className="text-3xl font-bold text-teal-900">College Staff Dashboard</h1>
          <p className="text-teal-600">
            Manage faculty fitness programs and departmental wellness initiatives
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px] bg-teal-100 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white border-teal-100 shadow-sm">
                    <CardHeader className="bg-teal-50 border-b border-teal-100">
                      <CardTitle className="flex items-center text-teal-800">
                        <Building2 className="mr-2 h-5 w-5 text-teal-600" />
                        Staff Profile
                      </CardTitle>
                      <CardDescription>Your department and position</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 text-xl font-bold">
                          {user?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user?.name || data.profile.name}</h3>
                          <p className="text-teal-600 text-sm">{data.profile.position}</p>
                          <p className="text-teal-500 text-xs">{data.profile.department}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-teal-400">Gender</p>
                            <p className="font-medium">{user?.gender || data.profile.gender}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-teal-400">Blood Group</p>
                            <p className="font-medium">{user?.blood_group || data.profile.blood_group}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-teal-400">Height</p>
                            <p className="font-medium">{user?.height || data.profile.height} cm</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-teal-400">Weight</p>
                            <p className="font-medium">{user?.weight || data.profile.weight} kg</p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-teal-100">
                          <p className="text-sm font-medium text-teal-700 mb-2">Contact Information</p>
                          <p className="text-sm">{user?.email}</p>
                          <p className="text-sm text-teal-500">Ext. 4567 • Office 302B</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-teal-100 shadow-sm">
                    <CardHeader className="bg-teal-50 border-b border-teal-100">
                      <CardTitle className="flex items-center text-teal-800">
                        <BarChart3 className="mr-2 h-5 w-5 text-teal-600" />
                        Department Stats
                      </CardTitle>
                      <CardDescription>Faculty participation and wellness metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-teal-50 rounded-lg p-4 text-center">
                          <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                          <p className="text-xl font-bold text-teal-900">{data.stats.facultyMembers}</p>
                          <p className="text-xs text-teal-600">Registered Faculty</p>
                        </div>
                        
                        <div className="bg-teal-50 rounded-lg p-4 text-center">
                          <Clipboard className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                          <p className="text-xl font-bold text-teal-900">{data.stats.sessionsScheduled}</p>
                          <p className="text-xs text-teal-600">Sessions Scheduled</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">Faculty Participation</p>
                            <p className="text-sm font-bold text-teal-700">78%</p>
                          </div>
                          <div className="h-2 bg-teal-100 rounded-full">
                            <div className="h-2 bg-teal-600 rounded-full w-[78%]"></div>
                          </div>
                          <p className="text-xs text-teal-400">Percentage of faculty participating in wellness programs</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">Staff Attendance Rate</p>
                            <p className="text-sm font-bold text-teal-700">{data.stats.attendance}</p>
                          </div>
                          <div className="h-2 bg-teal-100 rounded-full">
                            <div className="h-2 bg-teal-600 rounded-full w-[92%]"></div>
                          </div>
                          <p className="text-xs text-teal-400">Attendance rate for scheduled fitness sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card className="md:col-span-2 bg-white border-teal-100 shadow-sm">
                    <CardHeader className="bg-teal-50 border-b border-teal-100">
                      <CardTitle className="flex items-center text-teal-800">
                        <Calendar className="mr-2 h-5 w-5 text-teal-600" />
                        Upcoming Activities
                      </CardTitle>
                      <CardDescription>Scheduled events and sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {data.activities.map((activity, index) => (
                          <div key={index} className="p-4 rounded-lg border border-teal-100 bg-white hover:bg-teal-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-teal-900">{activity.title}</h4>
                                <p className="text-sm text-teal-600">{activity.participants} participants</p>
                              </div>
                              <div className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">
                                {activity.date.split(',')[0]}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <p className="text-sm text-teal-500">{activity.date}</p>
                              <Button size="sm" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-100">
                                Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-teal-100 shadow-sm">
                    <CardHeader className="bg-teal-50 border-b border-teal-100">
                      <CardTitle className="flex items-center text-teal-800">
                        <Bell className="mr-2 h-5 w-5 text-teal-600" />
                        Department Updates
                      </CardTitle>
                      <CardDescription>Recent announcements</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {[
                          { title: "Wellness Week Announcement", time: "2 hours ago" },
                          { title: "New Fitness Equipment Arrived", time: "Yesterday" },
                          { title: "Faculty Yoga Session Reminder", time: "2 days ago" },
                          { title: "Departmental Fitness Challenge", time: "3 days ago" }
                        ].map((update, index) => (
                          <div key={index} className="flex items-center gap-3 py-2 border-b border-teal-50 last:border-0">
                            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                            <div>
                              <p className="text-sm font-medium">{update.title}</p>
                              <p className="text-xs text-teal-400">{update.time}</p>
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
          
          <TabsContent value="faculty">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Faculty Fitness</CardTitle>
                <CardDescription>Manage faculty wellness programs</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Users className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Faculty Fitness Programs</h3>
                  <p className="text-teal-600">
                    Create and manage wellness programs for faculty members.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Department Schedule</CardTitle>
                <CardDescription>Manage fitness sessions and events</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Calendar className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Department Schedule</h3>
                  <p className="text-teal-600">
                    Schedule and manage fitness sessions and wellness events.
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
          
          <TabsContent value="wellness">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Wellness Program</CardTitle>
                <CardDescription>Manage your department's wellness initiatives</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <HeartPulse className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Wellness Program</h3>
                  <p className="text-teal-600">
                    Create and manage comprehensive wellness initiatives for your department.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="records">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Fitness Records</CardTitle>
                <CardDescription>Manage departmental fitness data</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Fitness Records</h3>
                  <p className="text-teal-600">
                    Track and manage fitness records and participation data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Resources</CardTitle>
                <CardDescription>Access fitness and wellness resources</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <BookOpen className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Resources</h3>
                  <p className="text-teal-600">
                    Access educational materials and resources for departmental wellness.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Settings className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Account Settings</h3>
                  <p className="text-teal-600">
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

export default StaffDashboard;
