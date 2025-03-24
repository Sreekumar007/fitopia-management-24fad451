import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Calendar,
  ClipboardCheck,
  Dumbbell,
  Clock,
  UserCircle,
  MapPin,
  CheckCircle,
  FileEdit,
  Trash2,
  PlusCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  getTrainerWorkoutSessions, 
  createWorkoutSession, 
  updateWorkoutSession, 
  deleteWorkoutSession,
  getStudentsForScheduling 
} from "@/services/trainerService";

interface WorkoutSession {
  id: number;
  title: string;
  description: string;
  student_id: number;
  student_name: string;
  scheduled_time: string;
  duration: number;
  location: string;
  status: string;
  notes: string;
  created_at: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

const WorkoutSessionManager = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  
  useEffect(() => {
    loadSessions();
    loadStudents();
  }, []);
  
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await getTrainerWorkoutSessions();
      setSessions(data);
    } catch (error) {
      console.error("Error loading workout sessions:", error);
      toast.error("Failed to load workout sessions");
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStudents = async () => {
    try {
      const data = await getStudentsForScheduling();
      setStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
    }
  };
  
  const handleCreateSession = async (data) => {
    try {
      await createWorkoutSession({
        title: data.title,
        description: data.description,
        student_id: parseInt(data.student_id),
        scheduled_time: data.scheduled_time,
        duration: parseInt(data.duration),
        location: data.location,
        status: "scheduled",
        notes: data.notes || ""
      });
      
      toast.success("Workout session created successfully");
      loadSessions();
      setOpenDialog(false);
      reset();
    } catch (error) {
      console.error("Error creating workout session:", error);
      toast.error("Failed to create workout session");
    }
  };
  
  const handleUpdateSession = async (data) => {
    try {
      if (!selectedSession) return;
      
      await updateWorkoutSession({
        session_id: selectedSession.id,
        title: data.title,
        description: data.description,
        scheduled_time: data.scheduled_time,
        duration: parseInt(data.duration),
        location: data.location,
        status: data.status,
        notes: data.notes
      });
      
      toast.success("Workout session updated successfully");
      loadSessions();
      setOpenDialog(false);
      setSelectedSession(null);
      reset();
    } catch (error) {
      console.error("Error updating workout session:", error);
      toast.error("Failed to update workout session");
    }
  };
  
  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm("Are you sure you want to delete this workout session?")) return;
    
    try {
      await deleteWorkoutSession(sessionId);
      toast.success("Workout session deleted successfully");
      loadSessions();
    } catch (error) {
      console.error("Error deleting workout session:", error);
      toast.error("Failed to delete workout session");
    }
  };
  
  const openEditDialog = (session: WorkoutSession) => {
    setSelectedSession(session);
    setIsEditMode(true);
    
    setValue("title", session.title);
    setValue("description", session.description);
    setValue("student_id", session.student_id.toString());
    setValue("scheduled_time", session.scheduled_time?.split("T")[0]);
    setValue("duration", session.duration);
    setValue("location", session.location);
    setValue("status", session.status);
    setValue("notes", session.notes);
    
    setOpenDialog(true);
  };
  
  const openCreateDialog = () => {
    setSelectedSession(null);
    setIsEditMode(false);
    reset();
    setOpenDialog(true);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const filteredSessions = () => {
    const now = new Date();
    
    switch(activeTab) {
      case "upcoming":
        return sessions.filter(session => 
          session.status === "scheduled" && new Date(session.scheduled_time) > now
        );
      case "completed":
        return sessions.filter(session => session.status === "completed");
      case "all":
        return sessions;
      default:
        return sessions;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Workout Sessions</h2>
          <p className="text-sm text-slate-500">
            Create and manage workout sessions for your students
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Workout Session" : "Create New Workout Session"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(isEditMode ? handleUpdateSession : handleCreateSession)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="title">Session Title</label>
                  <Input
                    id="title"
                    placeholder="e.g., Strength Training"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="description">Description</label>
                  <Textarea
                    id="description"
                    placeholder="Describe the workout session"
                    {...register("description")}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="student_id">Student</label>
                    <select
                      id="student_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      {...register("student_id", { required: "Student is required" })}
                      disabled={isEditMode}
                    >
                      <option value="">Select a student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                    {errors.student_id && (
                      <p className="text-xs text-red-500">{errors.student_id.message as string}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="scheduled_time">Date</label>
                    <Input
                      id="scheduled_time"
                      type="date"
                      {...register("scheduled_time", { required: "Date is required" })}
                    />
                    {errors.scheduled_time && (
                      <p className="text-xs text-red-500">{errors.scheduled_time.message as string}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="duration">Duration (minutes)</label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g., 60"
                      {...register("duration", { 
                        required: "Duration is required",
                        min: { value: 5, message: "Minimum 5 minutes" },
                        max: { value: 180, message: "Maximum 180 minutes" }
                      })}
                    />
                    {errors.duration && (
                      <p className="text-xs text-red-500">{errors.duration.message as string}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="location">Location</label>
                    <Input
                      id="location"
                      placeholder="e.g., Main Gym"
                      {...register("location", { required: "Location is required" })}
                    />
                    {errors.location && (
                      <p className="text-xs text-red-500">{errors.location.message as string}</p>
                    )}
                  </div>
                </div>
                
                {isEditMode && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="status">Status</label>
                    <select
                      id="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      {...register("status", { required: "Status is required" })}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="notes">Notes</label>
                  <Textarea
                    id="notes"
                    placeholder="Any special notes or instructions"
                    {...register("notes")}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {isEditMode ? "Update Session" : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex space-x-2 border-b pb-2">
        <Button 
          variant={activeTab === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </Button>
        <Button 
          variant={activeTab === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </Button>
        <Button 
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
        >
          All Sessions
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
        </div>
      ) : filteredSessions().length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <Dumbbell className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p>No workout sessions found.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={openCreateDialog}
          >
            Create your first workout session
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions().map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-4 flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{session.title}</h3>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace("_", " ")}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-slate-500 mb-3">
                      {session.description}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-1 text-slate-400" />
                        {session.student_name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                        {format(new Date(session.scheduled_time), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-slate-400" />
                        {session.duration} minutes
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                        {session.location}
                      </div>
                    </div>
                    
                    {session.notes && (
                      <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600">
                        <span className="font-medium">Notes:</span> {session.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex sm:flex-col justify-around border-t sm:border-t-0 sm:border-l border-slate-200 p-2 sm:p-4 bg-slate-50 sm:w-32">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(session)}
                      className="flex flex-col items-center h-auto py-2 text-blue-600"
                    >
                      <FileEdit className="h-4 w-4 mb-1" />
                      <span className="text-xs">Edit</span>
                    </Button>
                    
                    {session.status === "scheduled" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setValue("status", "completed");
                          handleUpdateSession({ ...session, status: "completed" });
                        }}
                        className="flex flex-col items-center h-auto py-2 text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mb-1" />
                        <span className="text-xs">Complete</span>
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="flex flex-col items-center h-auto py-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mb-1" />
                      <span className="text-xs">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutSessionManager; 