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
  Settings, 
  LogOut,
  Building2,
  Users,
  Clipboard,
  BarChart3,
  Bell,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import TrainingVideoList from "@/components/dashboard/TrainingVideoList";
import DietPlanList from "@/components/dashboard/DietPlanList";
import staffService, { StaffProfile, StaffStats, Activity, DepartmentUpdate, FacultyMember } from "@/services/staffService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [updates, setUpdates] = useState<DepartmentUpdate[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Add Faculty Modal State
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [newFacultyMember, setNewFacultyMember] = useState({
    name: "",
    email: "",
    department: "Physical Education",
    position: "Trainer",
  });
  
  // Add Schedule Activity Modal State
  const [isScheduleActivityModalOpen, setIsScheduleActivityModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0], // Default to today
    time: "09:00 AM",
    location: "Main Gym",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add an edit activity modal state
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFacultyMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNewFacultyMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleAddFacultyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!newFacultyMember.name || !newFacultyMember.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API call to add faculty member
      console.log("Submitting faculty member:", newFacultyMember);
      
      // Log the actual API request for debugging
      console.log("API Request to:", "staff/faculty");
      console.log("API Request method:", "POST");
      console.log("API Request body:", JSON.stringify(newFacultyMember));
      
      const response = await staffService.addFacultyMember(newFacultyMember);
      console.log("Response from add faculty member:", response);
      
      // Force a refetch of faculty members to ensure up-to-date data
      console.log("Fetching updated faculty list...");
      const updatedFacultyData = await staffService.getFacultyMembers();
      console.log("Updated faculty list:", updatedFacultyData);
      setFacultyMembers(updatedFacultyData);
      
      // Close modal and reset form
      setIsAddFacultyModalOpen(false);
      setNewFacultyMember({
        name: "",
        email: "",
        department: "Physical Education",
        position: "Trainer",
      });
      
      toast.success("Faculty member added successfully");
    } catch (err: any) {
      console.error("Error adding faculty member:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Response error data:", err.response.data);
        console.error("Response error status:", err.response.status);
        console.error("Response error headers:", err.response.headers);
        toast.error(`Failed to add faculty member: ${err.response.data?.error || "Server error"}`);
      } else if (err.request) {
        console.error("Request error:", err.request);
        toast.error("Network error. Please check your connection");
      } else {
        console.error("General error:", err.message);
        toast.error(`Failed to add faculty member: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh faculty members function
  const refreshFacultyMembers = async () => {
    try {
      setIsLoading(true);
      console.log("Refreshing faculty members list...");
      const updatedFaculty = await staffService.getFacultyMembers();
      console.log("Refreshed faculty list:", updatedFaculty);
      setFacultyMembers(updatedFaculty);
      toast.success("Faculty list refreshed");
    } catch (error: any) {
      console.error("Error refreshing faculty list:", error);
      toast.error("Failed to refresh faculty list");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh activities function
  const refreshActivities = async () => {
    try {
      setIsLoading(true);
      console.log("Refreshing activities list...");
      const updatedActivities = await staffService.getActivities();
      console.log("Refreshed activities list:", updatedActivities);
      setActivities(updatedActivities);
      toast.success("Activities list refreshed");
    } catch (error: any) {
      console.error("Error refreshing activities list:", error);
      toast.error("Failed to refresh activities list");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scheduling a new activity
  const handleScheduleActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!newActivity.title || !newActivity.date || !newActivity.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API call to schedule activity
      console.log("Scheduling new activity:", newActivity);
      
      // Log the actual API request for debugging
      console.log("API Request to:", "staff/activities");
      console.log("API Request method:", "POST");
      console.log("API Request body:", JSON.stringify(newActivity));
      
      const response = await staffService.addActivity(newActivity);
      console.log("Response from add activity:", response);
      
      // Force a refetch of activities to ensure up-to-date data
      console.log("Refreshing activities list...");
      await refreshActivities();
      
      // Close modal and reset form
      setIsScheduleActivityModalOpen(false);
      setNewActivity({
        title: "",
        date: new Date().toISOString().split('T')[0],
        time: "09:00 AM",
        location: "Main Gym",
        description: ""
      });
      
      toast.success("Activity scheduled successfully");
    } catch (err: any) {
      console.error("Error scheduling activity:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Response error data:", err.response.data);
        console.error("Response error status:", err.response.status);
        console.error("Response error headers:", err.response.headers);
        toast.error(`Failed to schedule activity: ${err.response.data?.error || "Server error"}`);
      } else if (err.request) {
        console.error("Request error:", err.request);
        toast.error("Network error. Please check your connection");
      } else {
        console.error("General error:", err.message);
        toast.error(`Failed to schedule activity: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open the edit modal for a specific activity
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivity({
      title: activity.title,
      date: activity.date,
      time: activity.time,
      location: activity.location || "Main Gym",
      description: ""
    });
    setIsEditActivityModalOpen(true);
  };

  // Handle updating an activity
  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingActivity) return;
    
    // Simple validation
    if (!newActivity.title || !newActivity.date || !newActivity.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API call to update activity
      console.log("Updating activity:", newActivity);
      
      // We don't have an update endpoint yet, so we'll delete and recreate
      // First delete the existing activity
      await staffService.deleteActivity(editingActivity.id);
      
      // Then create a new one with the updated data
      const response = await staffService.addActivity(newActivity);
      console.log("Response from update activity:", response);
      
      // Force a refetch of activities to ensure up-to-date data
      console.log("Refreshing activities list...");
      await refreshActivities();
      
      // Close modal and reset form
      setIsEditActivityModalOpen(false);
      setEditingActivity(null);
      setNewActivity({
        title: "",
        date: new Date().toISOString().split('T')[0],
        time: "09:00 AM",
        location: "Main Gym",
        description: ""
      });
      
      toast.success("Activity updated successfully");
    } catch (err: any) {
      console.error("Error updating activity:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Response error data:", err.response.data);
        console.error("Response error status:", err.response.status);
        console.error("Response error headers:", err.response.headers);
        toast.error(`Failed to update activity: ${err.response.data?.error || "Server error"}`);
      } else if (err.request) {
        console.error("Request error:", err.request);
        toast.error("Network error. Please check your connection");
      } else {
        console.error("General error:", err.message);
        toast.error(`Failed to update activity: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check if user is staff
    if (!user || user.role !== "staff") {
      toast.error("Unauthorized: Staff access required");
      navigate("/login");
      return;
    }

    // Fetch data from backend
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        console.log("Starting staff dashboard data fetch...");
        
        // First, attempt to get the user profile separately, which can help detect auth issues early
        try {
          const profileData = await staffService.getProfile();
          setProfile(profileData || null);
          console.log("Staff profile loaded successfully", profileData);
        } catch (profileErr: any) {
          console.error("Error loading profile data:", profileErr);
          
          // If it's an auth issue (401/403), it will trigger logout in the component
          if (profileErr.response && (profileErr.response.status === 401 || profileErr.response.status === 403)) {
            console.log("Auth issue detected, clearing token and redirecting", profileErr.response.status);
            logout();
            navigate("/login", { state: { message: "Session expired. Please log in again." } });
            return; // Stop further execution
          }
          
          // For 404, we'll create a default profile to prevent cascading errors
          if (profileErr.response && profileErr.response.status === 404) {
            setProfile({
              id: user?.id || 0,
              name: user?.name || "Staff User",
              email: user?.email || "staff@example.com",
              department: "Physical Education",
              position: "Fitness Coordinator",
              gender: "",
              blood_group: "",
              height: 0,
              weight: 0
            });
          }
        }
        
        // Fetch remaining data in parallel
        const [statsData, activitiesData, updatesData, facultyData] = await Promise.all([
          staffService.getStats().catch(e => {
            console.error("Error fetching stats:", e);
            return null;
          }),
          staffService.getActivities().catch(e => {
            console.error("Error fetching activities:", e);
            return [];
          }),
          staffService.getDepartmentUpdates().catch(e => {
            console.error("Error fetching updates:", e);
            return [];
          }),
          staffService.getFacultyMembers().catch(e => {
            console.error("Error fetching faculty members:", e);
            return [];
          })
        ]);
        
        console.log("Data fetched from backend:", {
          stats: statsData,
          activities: activitiesData,
          updates: updatesData,
          faculty: facultyData
        });
        
        // Ensure proper data types are set to state
        setStats(statsData || null);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setUpdates(Array.isArray(updatesData) ? updatesData : []);
        setFacultyMembers(Array.isArray(facultyData) ? facultyData : []);
      } catch (err: any) {
        console.error("Error fetching staff data:", err);
        let errorMessage = "Failed to load dashboard data";
        
        if (err.response) {
          // The request was made and the server responded with a status code outside the 2xx range
          errorMessage = `Server error (${err.response.status}): ${err.response.data?.error || err.message}`;
          
          // Handle auth errors
          if (err.response.status === 401 || err.response.status === 403) {
            logout();
            navigate("/login", { state: { message: "Session expired. Please log in again." } });
            return;
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = "Could not connect to the server. Please check if the backend is running.";
        } else {
          // Something happened in setting up the request
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, user, logout]);

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
      
      {/* Add Faculty Modal */}
      {isAddFacultyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-teal-900">Add New Faculty Member</h3>
              <button 
                onClick={() => setIsAddFacultyModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddFacultyMember}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={newFacultyMember.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newFacultyMember.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={newFacultyMember.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physical Education">Physical Education</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={newFacultyMember.position}
                    onValueChange={(value) => handleSelectChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trainer">Trainer</SelectItem>
                      <SelectItem value="Professor">Professor</SelectItem>
                      <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                      <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                      <SelectItem value="Instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddFacultyModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Faculty Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Schedule Activity Modal */}
      {isScheduleActivityModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-teal-900">Schedule New Activity</h3>
              <button 
                onClick={() => setIsScheduleActivityModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleScheduleActivity}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Activity Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                    placeholder="Fitness Session, Meeting, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
                  <Select 
                    value={newActivity.time}
                    onValueChange={(value) => setNewActivity({...newActivity, time: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                      <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                      <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                      <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                      <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                      <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={newActivity.location}
                    onValueChange={(value) => setNewActivity({...newActivity, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Gym">Main Gym</SelectItem>
                      <SelectItem value="Wellness Center">Wellness Center</SelectItem>
                      <SelectItem value="Conference Room A">Conference Room A</SelectItem>
                      <SelectItem value="Conference Room B">Conference Room B</SelectItem>
                      <SelectItem value="Outdoor Field">Outdoor Field</SelectItem>
                      <SelectItem value="Faculty Lounge">Faculty Lounge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    placeholder="Brief description of the activity"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsScheduleActivityModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Activity"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Activity Modal */}
      {isEditActivityModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-teal-900">Edit Activity</h3>
              <button 
                onClick={() => setIsEditActivityModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateActivity}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Activity Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                    placeholder="Fitness Session, Meeting, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
                  <Select 
                    value={newActivity.time}
                    onValueChange={(value) => setNewActivity({...newActivity, time: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                      <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                      <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                      <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                      <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                      <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={newActivity.location}
                    onValueChange={(value) => setNewActivity({...newActivity, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Gym">Main Gym</SelectItem>
                      <SelectItem value="Wellness Center">Wellness Center</SelectItem>
                      <SelectItem value="Conference Room A">Conference Room A</SelectItem>
                      <SelectItem value="Conference Room B">Conference Room B</SelectItem>
                      <SelectItem value="Outdoor Field">Outdoor Field</SelectItem>
                      <SelectItem value="Faculty Lounge">Faculty Lounge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    placeholder="Brief description of the activity"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditActivityModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Activity"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="flex-grow p-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="videos">Training Videos</TabsTrigger>
            <TabsTrigger value="diet">Diet Plans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Overview</CardTitle>
                <CardDescription>Your current progress and statistics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Statistics</h3>
                    <p className="text-sm font-medium mb-1">Total Activities</p>
                    <p className="text-teal-700 font-bold">{stats?.totalActivities || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Completed Activities</p>
                    <p className="text-teal-700 font-bold">{stats?.completedActivities || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Incomplete Activities</p>
                    <p className="text-teal-700 font-bold">{stats?.incompleteActivities || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faculty">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Faculty</CardTitle>
                <CardDescription>Manage your faculty members</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Faculty Members</h3>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-teal-700 hover:bg-teal-100"
                      onClick={() => setIsAddFacultyModalOpen(true)}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Add Faculty Member
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(facultyMembers) && facultyMembers.length > 0 ? (
                      facultyMembers.map((member) => (
                        <div key={member.id} className="border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium">{member.name}</h4>
                            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                              {member.position}
                            </span>
                          </div>
                          <p className="text-sm text-teal-600 mb-3">
                            <span className="font-medium">Email:</span> {member.email}
                          </p>
                          <p className="text-sm text-teal-600 mb-3">
                            <span className="font-medium">Department:</span> {member.department}
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-teal-700 hover:bg-teal-100"
                              onClick={() => handleEditActivity(member)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-teal-500 border border-dashed border-teal-200 rounded-lg">
                        No faculty members added. Click "Add Faculty Member" to add one.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Manage your activities</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Activities</h3>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-teal-700 hover:bg-teal-100"
                      onClick={() => setIsScheduleActivityModalOpen(true)}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule New Activity
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(activities) && activities.length > 0 ? (
                      activities.map((activity) => (
                        <div key={activity.id} className="border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium">{activity.title}</h4>
                          </div>
                          <p className="text-sm text-teal-600 mb-3">
                            <span className="font-medium">Date:</span> {activity.date || 'N/A'}
                          </p>
                          <p className="text-sm text-teal-600 mb-3">
                            <span className="font-medium">Time:</span> {activity.time || 'N/A'}
                          </p>
                          <p className="text-sm text-teal-600 mb-4">
                            <span className="font-medium">Location:</span> {activity.location || 'N/A'}
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-teal-700 hover:bg-teal-100"
                              onClick={() => handleEditActivity(activity)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-teal-500 border border-dashed border-teal-200 rounded-lg">
                        No activities scheduled. Click "Schedule New Activity" to add one.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <VideoSection />
          </TabsContent>
          
          <TabsContent value="diet">
            <DietPlanSection />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Email Notifications</p>
                        <div className="flex items-center">
                          <input type="checkbox" id="email-notifications" className="mr-2" />
                          <label htmlFor="email-notifications" className="text-sm">Receive email notifications</label>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Two-Factor Authentication</p>
                        <div className="flex items-center">
                          <input type="checkbox" id="2fa" className="mr-2" />
                          <label htmlFor="2fa" className="text-sm">Enable two-factor authentication</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-teal-100">
                    <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
                    <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-100">
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Component to fetch and display training videos
const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log("Fetching training videos...");
        setIsLoading(true);
        const data = await staffService.getVideos();
        console.log("Training videos data:", data);
        // Ensure data is properly formatted for our component
        const formattedVideos = Array.isArray(data) ? data.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description || "",
          video_url: video.url || "", // Handle different field name from backend
          category: video.category || "General",
          created_at: video.created_at || new Date().toISOString()
        })) : [];
        
        setVideos(formattedVideos);
      } catch (err: any) {
        console.error("Error fetching training videos:", err);
        let errorMessage = "Failed to load training videos";
        
        if (err.response) {
          errorMessage = `Server error (${err.response.status}): ${err.response.data?.error || err.message}`;
        } else if (err.request) {
          errorMessage = "Could not connect to the server. Please check if the backend is running.";
        } else {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        // Set videos as empty array on error
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return <TrainingVideoList videos={videos} isLoading={isLoading} />;
};

// Component to fetch and display diet plans
const DietPlanSection = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        console.log("Fetching diet plans...");
        setIsLoading(true);
        const data = await staffService.getDietPlans();
        console.log("Diet plans data:", data);
        
        // Ensure data is properly formatted for our component
        const formattedDietPlans = Array.isArray(data) ? data.map(plan => ({
          id: plan.id,
          title: plan.title,
          description: plan.description || "",
          calories: plan.calories || 2000, // Provide defaults for macro values
          protein: plan.protein || 140,
          carbs: plan.carbs || 200,
          fat: plan.fat || 65,
          assigned_by: plan.created_by || "Staff Nutritionist",
          status: "active", // Default status for staff view
          created_at: plan.created_at || new Date().toISOString()
        })) : [];
        
        setDietPlans(formattedDietPlans);
      } catch (err: any) {
        console.error("Error fetching diet plans:", err);
        let errorMessage = "Failed to load diet plans";
        
        if (err.response) {
          errorMessage = `Server error (${err.response.status}): ${err.response.data?.error || err.message}`;
        } else if (err.request) {
          errorMessage = "Could not connect to the server. Please check if the backend is running.";
        } else {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        // Set diet plans as empty array on error
        setDietPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDietPlans();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return <DietPlanList dietPlans={dietPlans} isLoading={isLoading} />;
};

export default StaffDashboard;
