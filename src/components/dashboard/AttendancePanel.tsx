import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
}

interface AttendanceData {
  attendance_records: AttendanceRecord[];
  attendance_percentage: number;
  days_present: number;
  total_days: number;
}

interface AttendancePanelProps {
  attendanceData: AttendanceData;
  isLoading: boolean;
}

const AttendancePanel: React.FC<AttendancePanelProps> = ({ attendanceData, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
          <CardTitle className="flex items-center text-indigo-800">
            <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
            Attendance Record
          </CardTitle>
          <CardDescription>Your attendance over the past 30 days</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { attendance_records, attendance_percentage, days_present, total_days } = attendanceData;

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <CardTitle className="flex items-center text-indigo-800">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          Attendance Record
        </CardTitle>
        <CardDescription>Your attendance over the past 30 days</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Attendance Rate</p>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-indigo-600">{attendance_percentage}%</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Days Present</p>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-green-600">{days_present}</span>
              <span className="text-gray-500 ml-1 mb-0.5">/ {total_days}</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            <div>
              {attendance_percentage >= 80 ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>
              ) : attendance_percentage >= 60 ? (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Good</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Needs Improvement</Badge>
              )}
            </div>
          </div>
        </div>
        
        {attendance_records.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No attendance records available.</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance_records.slice(0, 10).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.status === 'present' ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="mr-1 h-4 w-4" />
                          Absent
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendancePanel; 