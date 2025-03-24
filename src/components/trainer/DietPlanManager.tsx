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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Trash2, Edit, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  getStudentsForAssignment,
  assignDietPlan
} from "@/services/trainerService";

// Define form schema for diet plan
const dietPlanFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  calories: z.coerce.number().min(0, {
    message: "Calories must be a positive number.",
  }),
  protein: z.coerce.number().min(0, {
    message: "Protein must be a positive number.",
  }),
  carbs: z.coerce.number().min(0, {
    message: "Carbs must be a positive number.",
  }),
  fat: z.coerce.number().min(0, {
    message: "Fat must be a positive number.",
  }),
});

// Define schema for assigning a diet plan
const assignmentFormSchema = z.object({
  student_id: z.string({
    required_error: "Please select a student.",
  }),
  notes: z.string().optional(),
});

// DietPlan type definition
interface DietPlan {
  id: number;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

// Student type definition
interface Student {
  id: number;
  name: string;
  email: string;
}

const DietPlanManager: React.FC = () => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDietPlan, setCurrentDietPlan] = useState<DietPlan | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Form for creating/editing diet plans
  const form = useForm<z.infer<typeof dietPlanFormSchema>>({
    resolver: zodResolver(dietPlanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  // Form for assigning diet plans
  const assignForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      student_id: "",
      notes: "",
    },
  });

  // Load diet plans and students data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [dietPlansData, studentsData] = await Promise.all([
          getDietPlans(),
          getStudentsForAssignment()
        ]);
        setDietPlans(dietPlansData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading diet plan data:", error);
        toast.error("Failed to load diet plans");
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
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      setCurrentDietPlan(null);
    }
  }, [openDialog, form]);

  // Set form values when editing
  useEffect(() => {
    if (currentDietPlan) {
      form.reset({
        title: currentDietPlan.title,
        description: currentDietPlan.description,
        calories: currentDietPlan.calories,
        protein: currentDietPlan.protein,
        carbs: currentDietPlan.carbs,
        fat: currentDietPlan.fat,
      });
    }
  }, [currentDietPlan, form]);

  // Reset assignment form when dialog closes
  useEffect(() => {
    if (!openAssignDialog) {
      assignForm.reset({
        student_id: "",
        notes: "",
      });
    }
  }, [openAssignDialog, assignForm]);

  const onSubmit = async (values: z.infer<typeof dietPlanFormSchema>) => {
    try {
      if (currentDietPlan) {
        // Update existing diet plan
        await updateDietPlan({
          ...values,
          plan_id: currentDietPlan.id
        });
        toast.success("Diet plan updated successfully");
      } else {
        // Create new diet plan
        await createDietPlan(values);
        toast.success("Diet plan created successfully");
      }

      // Refresh diet plans
      const updatedDietPlans = await getDietPlans();
      setDietPlans(updatedDietPlans);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving diet plan:", error);
      toast.error("Failed to save diet plan");
    }
  };

  const handleAssign = async (values: z.infer<typeof assignmentFormSchema>) => {
    if (!currentDietPlan) return;

    try {
      await assignDietPlan({
        plan_id: currentDietPlan.id,
        student_id: parseInt(values.student_id),
        notes: values.notes || ""
      });
      
      toast.success(`Diet plan assigned to student successfully`);
      setOpenAssignDialog(false);
    } catch (error) {
      console.error("Error assigning diet plan:", error);
      toast.error("Failed to assign diet plan");
    }
  };

  const handleEdit = (dietPlan: DietPlan) => {
    setCurrentDietPlan(dietPlan);
    setOpenDialog(true);
  };

  const handleAssignClick = (dietPlan: DietPlan) => {
    setCurrentDietPlan(dietPlan);
    setOpenAssignDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this diet plan?")) {
      try {
        setIsDeleting(true);
        await deleteDietPlan(id);
        toast.success("Diet plan deleted successfully");
        
        // Remove from state
        setDietPlans(dietPlans.filter(plan => plan.id !== id));
      } catch (error) {
        console.error("Error deleting diet plan:", error);
        toast.error("Failed to delete diet plan");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Filter diet plans based on search query
  const filteredDietPlans = dietPlans.filter(plan => 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="text-amber-800">Diet Plan Management</CardTitle>
        <CardDescription>Create and manage nutrition plans for students</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search diet plans..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Diet Plan
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{currentDietPlan ? "Edit Diet Plan" : "Create New Diet Plan"}</DialogTitle>
                <DialogDescription>
                  {currentDietPlan 
                    ? "Update the diet plan details below." 
                    : "Create a new nutrition plan for students."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. High Protein Diet" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter plan details..." 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories (kcal)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="protein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protein (g)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbohydrates (g)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fat (g)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                      {currentDietPlan ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Assignment dialog */}
        <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Assign Diet Plan to Student</DialogTitle>
              <DialogDescription>
                Assign "{currentDietPlan?.title}" to a student
              </DialogDescription>
            </DialogHeader>

            <Form {...assignForm}>
              <form onSubmit={assignForm.handleSubmit(handleAssign)} className="space-y-4">
                <FormField
                  control={assignForm.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
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

                <FormField
                  control={assignForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes for this assignment..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Add any specific instructions or customizations for this student.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenAssignDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    Assign
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredDietPlans.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Utensils className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No diet plans found. Create your first diet plan!</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all diet plans</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Macros (P/C/F)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDietPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell>{plan.calories} kcal</TableCell>
                  <TableCell>{plan.protein}g / {plan.carbs}g / {plan.fat}g</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAssignClick(plan)}
                      title="Assign to student"
                    >
                      <Users className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(plan)}
                      title="Edit diet plan"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(plan.id)}
                      disabled={isDeleting}
                      title="Delete diet plan"
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

export default DietPlanManager; 