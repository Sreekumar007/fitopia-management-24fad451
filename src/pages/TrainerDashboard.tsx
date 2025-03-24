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
  Settings, 
  LogOut,
  UserCheck,
  FilePieChart,
  ClipboardCheck,
  Utensils
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import ScheduleManager from "@/components/trainer/ScheduleManager";
import DietPlanManager from "@/components/trainer/DietPlanManager";
import { 
  getTrainerProfile, 
  getStudents, 
  getTrainerSchedules, 
  getTrainerVideos, 
  getDietPlans
} from "@/services/trainerService";
import VideoUploader from "@/components/trainer/VideoUploader";
import VideoPlayer from "@/components/trainer/VideoPlayer";

// Dashboard data interface
interface DashboardData {
  members: {
    total: number;
    students: number;
    staff: number;
    active: number;
  };
  sessions: {
    today: number;
    upcoming: number;
    completed: number;
  };
  videos: {
    total: number;
    popular: number;
  };
}

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<DashboardData>({
    members: { total: 0, students: 0, staff: 0, active: 0 },
    sessions: { today: 0, upcoming: 0, completed: 0 },
    videos: { total: 0, popular: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);

  useEffect(() => {
    // Check if user is trainer
    if (!user || user.role !== "trainer") {
      toast.error("Unauthorized: Trainer access required");
      navigate("/login");
      return;
    }

    loadDashboardData();
  }, [navigate, user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load profile data
      const profileData = await getTrainerProfile();
      setProfile(profileData);
      
      // Load students data
      const studentsData = await getStudents();
      setStudents(studentsData);
      
      // Load schedules
      const schedulesData = await getTrainerSchedules();
      setSchedules(schedulesData);
      
      // Load videos
      const videosData = await getTrainerVideos();
      setVideos(videosData);
      
      // Load diet plans
      const dietPlansData = await getDietPlans();
      setDietPlans(dietPlansData);
      
      // Calculate dashboard metrics from actual data
      const staffCount = studentsData.filter(s => s.role === 'staff').length;
      const studentCount = studentsData.filter(s => s.role === 'student').length;
      const totalMembers = staffCount + studentCount;
      
      // Calculate active members based on recent activity
      // A member is considered active if they have had a session in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      // Get all student IDs who had a session in the last 30 days
      const activeStudentIds = new Set(
        schedulesData
          .filter(s => s.scheduled_time > thirtyDaysAgoStr)
          .map(s => s.student_id)
      );
      
      // Count active members
      const activeMembers = activeStudentIds.size;
      
      // Calculate session stats from actual data
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = schedulesData.filter(s => 
        s.scheduled_time.startsWith(today)
      ).length;
      
      const upcomingSessions = schedulesData.filter(s => 
        s.scheduled_time > today
      ).length;
      
      // Assume a session is completed if it's in the past and not today
      const completedSessions = schedulesData.filter(s => 
        s.scheduled_time < today
      ).length;
      
      // Update dashboard data
      setData({
        members: {
          total: totalMembers,
          students: studentCount,
          staff: staffCount,
          active: activeMembers
        },
        sessions: {
          today: todaySessions,
          upcoming: upcomingSessions,
          completed: completedSessions
        },
        videos: {
          total: videosData.length,
          popular: Math.min(videosData.length, 3) // Top 3 are considered popular
        }
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoPlayerOpen(true);
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
            Workout Sessions
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
          <TabsList className="grid grid-cols-4 md:w-[500px] bg-slate-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
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
                        {data.members.total > 0 
                          ? `${Math.round((data.members.active / data.members.total) * 100)}% of total members`
                          : 'No members yet'
                        }
                      </div>
                      <div className="text-xs text-emerald-100 mt-1">
                        Based on last 30 days activity
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
                        {data.sessions.upcoming} upcoming sessions scheduled
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Video className="mr-2 h-5 w-5" />
                        Training Videos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.videos.total}</div>
                      <div className="text-xs text-amber-100 mt-2">
                        {data.videos.total > 0 
                          ? `${data.videos.popular} featured videos available`
                          : 'No videos uploaded yet'
                        }
                      </div>
                      <div className="text-xs text-amber-100 mt-1">
                        Click "Videos" tab to upload more
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
                        {schedules.length === 0 ? (
                          <div className="text-center p-4 text-gray-500">
                            <p>No upcoming sessions scheduled.</p>
                          </div>
                        ) : (
                          schedules.slice(0, 4).map((session, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                {session.student_name?.charAt(0) || 'S'}
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium">{session.student_name}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(session.scheduled_time).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} • {session.title}
                                </p>
                              </div>
                              <Button size="sm" variant="outline">Details</Button>
                            </div>
                          ))
                        )}
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
                        {schedules.length === 0 && videos.length === 0 && dietPlans.length === 0 ? (
                          <div className="text-center p-4 text-gray-500">
                            <p>No recent activity found.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Recent schedules */}
                            {schedules.slice(0, 2).map((session, index) => (
                              <div key={`schedule-${index}`} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                                  <Calendar className="text-indigo-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Added workout session for {session.student_name}</p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(session.created_at).toLocaleString('en-US', {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Recent videos */}
                            {videos.slice(0, 2).map((video, index) => (
                              <div key={`video-${index}`} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                                  <Video className="text-indigo-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Uploaded "{video.title}" video</p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(video.created_at).toLocaleString('en-US', {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Recent diet plans */}
                            {dietPlans.slice(0, 2).map((plan, index) => (
                              <div key={`diet-${index}`} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                                  <Utensils className="text-amber-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Created "{plan.title}" diet plan</p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(plan.created_at).toLocaleString('en-US', {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p>No members found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                          {student.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-slate-500">{student.email} • {student.role}</p>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle>Workout Sessions</CardTitle>
                <CardDescription>Manage your scheduled workout sessions</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ScheduleManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <Card>
              <CardHeader className="bg-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Training Videos</CardTitle>
                  <CardDescription>Manage and upload training videos</CardDescription>
                </div>
                <VideoUploader onVideoUploaded={loadDashboardData} />
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <Video className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p>No training videos found. Upload your first video.</p>
                    <VideoUploader onVideoUploaded={loadDashboardData} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video, index) => (
                      <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
                        <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                          {video.video_url ? (
                            <video 
                              src={video.video_url} 
                              className="w-full h-full object-cover" 
                              poster={video.thumbnail_url}
                              onMouseOver={e => (e.target as HTMLVideoElement).play()}
                              onMouseOut={e => (e.target as HTMLVideoElement).pause()}
                            />
                          ) : (
                            <Video className="h-10 w-10 text-slate-400" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-slate-800">{video.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{video.category}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-slate-500">
                              {new Date(video.created_at).toLocaleDateString()}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleWatchVideo(video)}
                            >
                              Watch
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <DietPlanManager />
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
      
      {/* Add VideoPlayer component */}
      {selectedVideo && (
        <VideoPlayer 
          isOpen={videoPlayerOpen} 
          onClose={() => setVideoPlayerOpen(false)} 
          video={selectedVideo} 
        />
      )}
    </div>
  );
};

export default TrainerDashboard;
