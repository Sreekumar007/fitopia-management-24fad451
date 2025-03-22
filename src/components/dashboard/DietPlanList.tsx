
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Utensils, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DietPlan {
  id: number;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_by: number;
  created_at: string;
}

const API_URL = "http://localhost:5000/api";

const DietPlanList = () => {
  const { token } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDietPlans();
  }, [token]);

  const fetchDietPlans = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/diet-plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch diet plans");
      }

      const data = await response.json();
      setDietPlans(data);
    } catch (error) {
      console.error("Error fetching diet plans:", error);
      toast.error("Failed to load diet plans");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredDietPlans = dietPlans.filter((plan) => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Utensils className="mr-2 h-5 w-5" />
              Diet Plans
            </CardTitle>
            <CardDescription>Browse nutrition plans for different fitness goals</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search diet plans..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredDietPlans.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein (g)</TableHead>
                  <TableHead>Carbs (g)</TableHead>
                  <TableHead>Fat (g)</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDietPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>{plan.calories}</TableCell>
                    <TableCell>{plan.protein}</TableCell>
                    <TableCell>{plan.carbs}</TableCell>
                    <TableCell>{plan.fat}</TableCell>
                    <TableCell>{formatDate(plan.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-muted/10">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium">No diet plans found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm ? "Try adjusting your search" : "No diet plan records available"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DietPlanList;
