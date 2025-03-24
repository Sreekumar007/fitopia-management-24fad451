import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, User, MapPin } from "lucide-react";

interface ScheduleItem {
  id: number;
  title: string;
  trainer: string;
  time: string;
  location: string;
}

interface SchedulePanelProps {
  scheduleItems: ScheduleItem[];
  isLoading: boolean;
}

const SchedulePanel: React.FC<SchedulePanelProps> = ({ scheduleItems, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
          <CardTitle className="flex items-center text-indigo-800">
            <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
            Upcoming Schedule
          </CardTitle>
          <CardDescription>Your upcoming training sessions</CardDescription>
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
    <Card className="shadow-sm">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <CardTitle className="flex items-center text-indigo-800">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          Upcoming Schedule
        </CardTitle>
        <CardDescription>Your upcoming training sessions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {scheduleItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No upcoming sessions scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduleItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-indigo-900 mb-2">{item.title}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>{item.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>Trainer: {item.trainer}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>{item.location}</span>
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

export default SchedulePanel; 