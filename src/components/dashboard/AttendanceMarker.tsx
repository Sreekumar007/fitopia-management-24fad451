import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { registerAttendance, getAttendance } from "@/services/studentService";

interface AttendanceMarkerProps {
  onAttendanceMarked: () => void;
}

const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({ onAttendanceMarked }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkTodayAttendance();
  }, []);

  const checkTodayAttendance = async () => {
    setIsCheckingStatus(true);
    setError(null);
    try {
      // Get attendance records
      const attendanceData = await getAttendance();
      
      // Check if attendance records exist (they might be empty)
      if (!attendanceData || !attendanceData.attendance_records) {
        setIsMarked(false);
        console.log("No attendance data available");
        return;
      }
      
      // Check if there's a record for today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const todayRecord = attendanceData.attendance_records.find(
        (record: any) => record && record.date && record.date.startsWith(today)
      );
      
      if (todayRecord) {
        setIsMarked(true);
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      setError("Failed to check attendance status. Please try again later.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (isMarked) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerAttendance();
      
      if (response && response.message && response.message.includes('already registered')) {
        toast.info("You've already marked your attendance for today");
        setIsMarked(true);
      } else {
        toast.success("Attendance marked successfully!");
        setIsMarked(true);
      }
      
      onAttendanceMarked();
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      const errorMessage = error.message || "Failed to mark attendance";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Limit retry attempts to prevent excessive requests
    if (retryCount >= 3) {
      toast.error("Maximum retry attempts reached. Please reload the page or try again later.");
      return;
    }
    
    setRetryCount(prevCount => prevCount + 1);
    setError(null);
    
    if (isMarked) {
      checkTodayAttendance();
    } else {
      handleMarkAttendance();
    }
  };

  return (
    <Card className="shadow-sm bg-white border-indigo-100">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <CardTitle className="flex items-center text-indigo-800">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          Daily Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-4">
          {isCheckingStatus ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Checking status...</span>
            </div>
          ) : error ? (
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-red-500 mb-3">{error}</p>
              <Button onClick={handleRetry} size="sm" variant="outline" disabled={retryCount >= 3}>
                {retryCount >= 3 ? "Too many attempts" : "Retry"}
              </Button>
            </div>
          ) : isMarked ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-medium text-green-600 mb-1">Attendance Marked!</p>
              <p className="text-sm text-gray-500">You're all set for today.</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-6">
                Mark your attendance for today's session
              </p>
              <Button
                onClick={handleMarkAttendance}
                disabled={isLoading || isMarked}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark Present
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceMarker; 