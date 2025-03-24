import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Utensils, Search, AlertCircle, Calendar, ArrowUpDown, User, CheckCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDietPlans } from "@/services/studentService";

interface DietPlan {
  id: number;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  assigned_by: string;
  assignment_id?: number;
  status: string;
  notes?: string;
  assigned_at?: string;
  created_at: string;
}

interface DietPlanListProps {
  dietPlans: DietPlan[];
  isLoading: boolean;
}

const DietPlanList: React.FC<DietPlanListProps> = ({ dietPlans, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredDietPlans = dietPlans.filter((plan) => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      case 'none':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">None</Badge>;
      default:
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
          <CardTitle className="flex items-center text-indigo-800">
            <Utensils className="mr-2 h-5 w-5 text-indigo-600" />
            Diet Plans
          </CardTitle>
          <CardDescription>Nutrition plans for your fitness goals</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <CardTitle className="flex items-center text-indigo-800">
          <Utensils className="mr-2 h-5 w-5 text-indigo-600" />
          Diet Plans
        </CardTitle>
        <CardDescription>Nutrition plans for your fitness goals</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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
        
        {dietPlans.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Utensils className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No diet plans available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDietPlans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-indigo-900 text-lg">{plan.title}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(plan.status)}
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                      {plan.calories} kcal
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">Macronutrients</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Protein</p>
                      <p className="font-medium">{plan.protein}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carbs</p>
                      <p className="font-medium">{plan.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fat</p>
                      <p className="font-medium">{plan.fat}g</p>
                    </div>
                  </div>
                </div>
                
                {/* Nutrition bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-600">Protein</span>
                      <span className="text-gray-500">{Math.round((plan.protein * 4 / (plan.calories || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.round((plan.protein * 4 / (plan.calories || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-600">Carbs</span>
                      <span className="text-gray-500">{Math.round((plan.carbs * 4 / (plan.calories || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.round((plan.carbs * 4 / (plan.calories || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-yellow-600">Fat</span>
                      <span className="text-gray-500">{Math.round((plan.fat * 9 / (plan.calories || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-yellow-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.round((plan.fat * 9 / (plan.calories || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {plan.notes && (
                  <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-100">
                    <h4 className="font-medium text-yellow-800 mb-1 text-sm flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      Trainer Notes
                    </h4>
                    <p className="text-sm text-yellow-700">{plan.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {plan.assigned_at 
                        ? `Assigned: ${new Date(plan.assigned_at).toLocaleDateString()}`
                        : `Created: ${new Date(plan.created_at).toLocaleDateString()}`
                      }
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center cursor-pointer">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>By: {plan.assigned_by}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Diet plan assigned by {plan.assigned_by}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DietPlanList;
