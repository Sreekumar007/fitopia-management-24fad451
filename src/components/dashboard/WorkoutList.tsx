import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, User } from "lucide-react";

interface Workout {
  id: number;
  title: string;
  description: string;
  created_at: string;
  creator: string;
}

interface WorkoutListProps {
  workouts: Workout[];
  isLoading: boolean;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
          <CardTitle className="flex items-center text-indigo-800">
            <Dumbbell className="mr-2 h-5 w-5 text-indigo-600" />
            My Workouts
          </CardTitle>
          <CardDescription>Your assigned workout routines</CardDescription>
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
          <Dumbbell className="mr-2 h-5 w-5 text-indigo-600" />
          My Workouts
        </CardTitle>
        <CardDescription>Your assigned workout routines</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {workouts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Dumbbell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No workout plans assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div 
                key={workout.id} 
                className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-indigo-900">{workout.title}</h3>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    Workout
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">
                  {workout.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>Created by: {workout.creator}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(workout.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutList; 