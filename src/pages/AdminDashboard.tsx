
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  DollarSign, 
  ClipboardList, 
  UserCheck,
  Settings, 
  LogOut,
  PlusCircle,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

// Mock data for admin dashboard
const mockData = {
  stats: {
    activeMembers: 145,
    totalMembers: 210,
    totalEarnings: 42500,
    totalTrainers: 8,
    totalStaff: 27,
    equipmentCount: 35
  },
  members: [
    { id: 1, name: "John Smith", email: "john@example.com", role: "student", status: "active", joined: "2023-01-15" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "student", status: "active", joined: "2023-02-10" },
    { id: 3, name: "Robert Davis", email: "robert@example.com", role: "student", status: "inactive", joined: "2023-01-05" },
    { id: 4, name: "Emily Wilson", email: "emily@example.com", role: "staff", status: "active", joined: "2023-03-20" },
    { id: 5, name: "Michael Brown", email: "michael@example.com", role: "staff", status: "active", joined: "2023-02-28" }
  ],
  trainers: [
    { id: 1, name: "James Rodriguez", email: "james@example.com", specialization: "Strength Training", experience: "5 years" },
    { id: 2, name: "Emma Thompson", email: "emma@example.com", specialization: "Yoga", experience: "8 years" },
    { id: 3, name: "David Wilson", email: "david@example.com", specialization: "HIIT", experience: "3 years" }
  ],
  equipment: [
    { id: 1, name: "Treadmill", quantity: 10, condition: "Good", lastMaintenance: "2023-06-15" },
    { id: 2, name: "Dumbbells Set", quantity: 15, condition: "Excellent", lastMaintenance: "2023-08-10" },
    { id: 3, name: "Yoga Mats", quantity: 25, condition: "Good", lastMaintenance: "2023-07-20" },
    { id: 4, name: "Bench Press", quantity: 5, condition: "Fair", lastMaintenance: "2023-05-30" }
  ],
  attendance: [
    { id: 1, name: "John Smith", role: "student", lastAttended: "2023-09-15", frequency: "85%" },
    { id: 2, name: "Sarah Johnson", role: "student", lastAttended: "2023-09-16", frequency: "92%" },
    { id: 3, name: "Emily Wilson", role: "staff", lastAttended: "2023-09-14", frequency: "78%" }
  ]
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      toast.error("Unauthorized: Admin access required");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be actual API calls
        // const membersResponse = await axios.get('/api/admin/members', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const trainersResponse = await axios.get('/api/admin/trainers', {...});
        // ... more API calls
        
        // For now, use mock data
        setTimeout(() => {
          setData(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to fetch dashboard data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredMembers = data.members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const addMember = () => {
    toast.success("This would open a form to add a new member");
  };

  const deleteMember = (id: number) => {
    toast.success(`Member with ID ${id} would be deleted`);
  };

  const addTrainer = () => {
    toast.success("This would open a form to add a new trainer");
  };

  const deleteTrainer = (id: number) => {
    toast.success(`Trainer with ID ${id} would be deleted`);
  };

  const addEquipment = () => {
    toast.success("This would open a form to add new equipment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Helmet>
        <title>Admin Dashboard | FitWell Gym</title>
        <meta name="description" content="Admin dashboard for FitWell Gym management system." />
      </Helmet>
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">FitWell Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Management Portal</p>
          <div className="mt-2 p-2 bg-gray-800 rounded-md text-sm">
            <p className="font-medium text-gray-300">Logged in as:</p>
            <p className="text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "overview" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard Overview
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "members" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="mr-2 h-5 w-5" />
            Member Management
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "trainers" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("trainers")}
          >
            <UserCheck className="mr-2 h-5 w-5" />
            Trainer Management
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "staff" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            <Building2 className="mr-2 h-5 w-5" />
            College Staff
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "equipment" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("equipment")}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Equipment Inventory
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "attendance" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Attendance Records
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-white hover:bg-gray-800 ${activeTab === "finances" ? "bg-gray-800" : ""}`}
            onClick={() => setActiveTab("finances")}
          >
            <DollarSign className="mr-2 h-5 w-5" />
            Financial Reports
          </Button>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-700 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-grow p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage your gym members, trainers, equipment, and more
          </p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Active Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.stats.activeMembers}</div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>Total: {data.stats.totalMembers}</span>
                        <span>{Math.round((data.stats.activeMembers / data.stats.totalMembers) * 100)}% active</span>
                      </div>
                      <div className="h-1 w-full bg-blue-200/30 mt-2 rounded-full">
                        <div 
                          className="h-1 bg-white rounded-full" 
                          style={{width: `${(data.stats.activeMembers / data.stats.totalMembers) * 100}%`}}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Total Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">${data.stats.totalEarnings}</div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>Avg. $200/member</span>
                        <span>+12% from last month</span>
                      </div>
                      <div className="h-1 w-full bg-emerald-200/30 mt-2 rounded-full">
                        <div className="h-1 bg-white rounded-full w-[75%]" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <UserCheck className="mr-2 h-5 w-5" />
                        Active Trainers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{data.stats.totalTrainers}</div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>College Staff: {data.stats.totalStaff}</span>
                        <span>Equipment: {data.stats.equipmentCount}</span>
                      </div>
                      <div className="h-1 w-full bg-purple-200/30 mt-2 rounded-full">
                        <div className="h-1 bg-white rounded-full w-[90%]" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle>Recent Member Activity</CardTitle>
                      <CardDescription>Latest member registrations and updates</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.members.slice(0, 5).map(member => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">{member.name}</TableCell>
                              <TableCell className="capitalize">{member.role}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {member.status}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(member.joined).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="p-4 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("members")}>
                          View All Members
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle>Equipment Status</CardTitle>
                      <CardDescription>Current inventory and maintenance</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Last Maintenance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.equipment.slice(0, 4).map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.condition === 'Excellent' ? 'bg-green-100 text-green-800' : 
                                  item.condition === 'Good' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {item.condition}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(item.lastMaintenance).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="p-4 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("equipment")}>
                          View All Equipment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-4">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle>Active Trainers</CardTitle>
                    <CardDescription>Your gym's training staff</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Experience</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.trainers.map(trainer => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.name}</TableCell>
                            <TableCell>{trainer.email}</TableCell>
                            <TableCell>{trainer.specialization}</TableCell>
                            <TableCell>{trainer.experience}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("trainers")}>
                        Manage Trainers
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Member Management</CardTitle>
                  <CardDescription>View and manage all gym members</CardDescription>
                </div>
                <Button onClick={addMember}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search members..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 border rounded-md text-sm"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="staff">Staff</option>
                    </select>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map(member => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.id}</TableCell>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell className="capitalize">{member.role}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(member.joined).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => deleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trainers" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Trainer Management</CardTitle>
                  <CardDescription>View and manage gym trainers</CardDescription>
                </div>
                <Button onClick={addTrainer}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Trainer
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.trainers.map(trainer => (
                        <TableRow key={trainer.id}>
                          <TableCell className="font-medium">{trainer.id}</TableCell>
                          <TableCell>{trainer.name}</TableCell>
                          <TableCell>{trainer.email}</TableCell>
                          <TableCell>{trainer.specialization}</TableCell>
                          <TableCell>{trainer.experience}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => deleteTrainer(trainer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>College Staff Management</CardTitle>
                <CardDescription>View and manage college staff members</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.members.filter(m => m.role === "staff").map(staff => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">{staff.name}</TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>Physical Education</TableCell>
                          <TableCell>Fitness Coordinator</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {staff.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Equipment Inventory</CardTitle>
                  <CardDescription>Manage gym equipment and maintenance</CardDescription>
                </div>
                <Button onClick={addEquipment}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Equipment
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Last Maintenance</TableHead>
                        <TableHead>Next Maintenance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.equipment.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.condition === 'Excellent' ? 'bg-green-100 text-green-800' : 
                              item.condition === 'Good' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.condition}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(item.lastMaintenance).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {new Date(new Date(item.lastMaintenance).setMonth(
                              new Date(item.lastMaintenance).getMonth() + 3
                            )).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Track member attendance and frequency</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div className="flex items-center gap-2">
                      <Input type="date" className="w-full" defaultValue="2023-09-01" />
                      <span>to</span>
                      <Input type="date" className="w-full" defaultValue="2023-09-30" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by</label>
                    <select className="px-3 py-2 border rounded-md text-sm w-full">
                      <option value="all">All Members</option>
                      <option value="student">Students</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div className="self-end">
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Attended</TableHead>
                        <TableHead>Attendance Frequency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.attendance.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell className="capitalize">{record.role}</TableCell>
                          <TableCell>{new Date(record.lastAttended).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-blue-600 rounded-full" 
                                  style={{width: record.frequency}}
                                />
                              </div>
                              <span className="text-sm font-medium">{record.frequency}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="finances" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Gym revenue and financial metrics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${data.stats.totalEarnings}</div>
                      <p className="text-xs text-green-600">+15% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Average Revenue per Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$200</div>
                      <p className="text-xs text-green-600">+5% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$2,450</div>
                      <p className="text-xs text-red-600">12 members with pending payments</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Revenue (2023)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md border">
                      <p className="text-gray-500 text-sm">Revenue chart visualization would go here</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Account Settings</h3>
                    <p className="text-sm text-gray-500">Manage your admin account details</p>
                    <div className="mt-4 grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <Input defaultValue={user?.name || "Admin User"} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input defaultValue={user?.email || "admin@example.com"} />
                        </div>
                      </div>
                      <Button className="w-auto">Save Changes</Button>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium">System Settings</h3>
                    <p className="text-sm text-gray-500">Configure global system settings</p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Send email notifications for new registrations</p>
                        </div>
                        <div>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Maintenance Mode</p>
                          <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                        </div>
                        <div>
                          <input type="checkbox" className="toggle" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
