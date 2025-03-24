import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock, Trash2, Edit, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getTrainerSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getStudentsForScheduling
} from "@/services/trainerService";

// Define form schema for schedule
const scheduleFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  student_id: z.string({
    required_error: "Please select a student.",
  }),
  scheduled_date: z.date({
    required_error: "Please select a date.",
  }),
  scheduled_time: z.string({
    required_error: "Please select a time.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
});

// Schedule type definition
interface Schedule {
  id: number;
  title: string;
  description: string;
  student_id: number;
  student_name: string;
  scheduled_time: string;
  location: string;
  created_at: string;
}

// Student type definition
interface Student {
  id: number;
  name: string;
  email: string;
}

const ScheduleManager: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "Main Gym",
    },
  });

  // Load schedules and students data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, studentsData] = await Promise.all([
          getTrainerSchedules(),
          getStudentsForScheduling()
        ]);
        setSchedules(schedulesData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading schedule data:", error);
        toast.error("Failed to load schedules");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!openDialog) {
      form.reset({
        title: "",
        description: "",
        student_id: "",
        location: "Main Gym",
      });
      setCurrentSchedule(null);
    }
  }, [openDialog, form]);

  // Set form values when editing
  useEffect(() => {
    if (currentSchedule) {
      const scheduledDateTime = new Date(currentSchedule.scheduled_time);
      form.reset({
        title: currentSchedule.title,
        description: currentSchedule.description || "",
        student_id: currentSchedule.student_id.toString(),
        scheduled_date: scheduledDateTime,
        scheduled_time: format(scheduledDateTime, "HH:mm"),
        location: currentSchedule.location,
      });
    }
  }, [currentSchedule, form]);

  const onSubmit = async (values: z.infer<typeof scheduleFormSchema>) => {
    try {
      // Combine date and time
      const scheduledDate = values.scheduled_date;
      const [hours, minutes] = values.scheduled_time.split(':').map(Number);
      scheduledDate.setHours(hours, minutes);

      const scheduleData = {
        title: values.title,
        description: values.description || "",
        student_id: parseInt(values.student_id),
        scheduled_time: scheduledDate.toISOString(),
        location: values.location,
      };

      if (currentSchedule) {
        // Update existing schedule
        await updateSchedule({
          ...scheduleData,
          schedule_id: currentSchedule.id
        });
        toast.success("Schedule updated successfully");
      } else {
        // Create new schedule
        await createSchedule(scheduleData);
        toast.success("Schedule created successfully");
      }

      // Refresh schedules
      const updatedSchedules = await getTrainerSchedules();
      setSchedules(updatedSchedules);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      try {
        setIsDeleting(true);
        await deleteSchedule(id);
        toast.success("Schedule deleted successfully");
        
        // Remove from state
        setSchedules(schedules.filter(schedule => schedule.id !== id));
      } catch (error) {
        console.error("Error deleting schedule:", error);
        toast.error("Failed to delete schedule");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Filter schedules based on search query
  const filteredSchedules = schedules.filter(schedule => 
    schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <CardTitle className="text-indigo-800">Schedule Management</CardTitle>
        <CardDescription>Create and manage training sessions for students</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search schedules..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Schedule
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{currentSchedule ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
                <DialogDescription>
                  {currentSchedule 
                    ? "Update the training session details below." 
                    : "Create a new training session for a student."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. HIIT Training" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter session details..." 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem 
                                key={student.id} 
                                value={student.id.toString()}
                              >
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduled_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduled_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-gray-500" />
                              <Input
                                type="time"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Main Gym" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {currentSchedule ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No schedules found. Create your first schedule!</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all scheduled training sessions</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.title}</TableCell>
                  <TableCell>{schedule.student_name}</TableCell>
                  <TableCell>
                    {new Date(schedule.scheduled_time).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>{schedule.location}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(schedule.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleManager; 