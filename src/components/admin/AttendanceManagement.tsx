import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Check, 
  Clock, 
  Download, 
  RefreshCw, 
  Search, 
  UserCheck, 
  X 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker"; // You may need to create this component

const API_URL = "http://localhost:5000/api";

interface Attendance {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  check_in: string;
  check_out: string | null;
  date: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    
    try {
      let url = `${API_URL}/admin/attendance`;
      const queryParams = [];
      
      if (dateRange.from) {
        queryParams.push(`start_date=${format(dateRange.from, 'yyyy-MM-dd')}`);
      }
      
      if (dateRange.to) {
        queryParams.push(`end_date=${format(dateRange.to, 'yyyy-MM-dd')}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendances(data.attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendance();
  };

  const exportToCsv = () => {
    if (filteredAttendance.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = ["ID", "User", "Role", "Check In", "Check Out", "Date"];
    
    const csvRows = [
      headers.join(','),
      ...filteredAttendance.map(item => {
        return [
          item.id,
          `"${item.user_name}"`, // Quote names to handle commas
          item.user_role,
          item.check_in ? new Date(item.check_in).toLocaleString() : '',
          item.check_out ? new Date(item.check_out).toLocaleString() : '',
          new Date(item.date).toLocaleDateString()
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create filename with current date
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    
    link.href = url;
    link.setAttribute('download', `attendance-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter attendance based on search term
  const filteredAttendance = attendances.filter(item => 
    item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A";
    
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch (e) {
      return dateTimeStr;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Attendance Management</CardTitle>
            <CardDescription>View and manage attendance records</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchAttendance}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFilterSubmit} className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 w-full"
              />
            </div>
            
            <div className="relative flex-1">
              <div className="flex items-center border rounded-md p-2">
                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                <DateRangePicker 
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </div>
            </div>
            
            <Button type="submit">Filter</Button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="text-center py-12 border rounded-md">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium text-lg">No attendance records found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm || (dateRange.from && dateRange.to)
                ? "Try adjusting your search or date filters" 
                : "No attendance has been recorded yet"}
            </p>
            {(searchTerm || (dateRange.from && dateRange.to)) && (
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
                setDateRange({ from: undefined, to: undefined });
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>{attendance.id}</TableCell>
                    <TableCell className="font-medium">{attendance.user_name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        attendance.user_role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        attendance.user_role === 'staff' ? 'bg-blue-100 text-blue-800' :
                        attendance.user_role === 'trainer' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {attendance.user_role.charAt(0).toUpperCase() + attendance.user_role.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDateTime(attendance.check_in)}</TableCell>
                    <TableCell>{formatDateTime(attendance.check_out)}</TableCell>
                    <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {attendance.check_in && attendance.check_out ? (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600 text-xs">Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-amber-600 text-xs">In Progress</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="text-sm text-muted-foreground">
          Total Records: {filteredAttendance.length}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AttendanceManagement; 