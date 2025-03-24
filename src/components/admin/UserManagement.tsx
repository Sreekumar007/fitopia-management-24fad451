import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  TableCaption
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  UserRoundCheck,
  UserRoundX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

type UserRole = "student" | "staff" | "admin" | "trainer";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  gender?: string;
  blood_group?: string;
  height?: number;
  weight?: number;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for editing/adding user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    gender: "",
    blood_group: "",
    height: "",
    weight: "",
    password: "" // Required for new users, optional for updates
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Check if user is admin - only do this once when component mounts
  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Unauthorized: Admin access required");
      navigate("/login");
    }
  }, []);

  // Separate effect for fetching users - only run when relevant filters change
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [currentPage, roleFilter]); // Only depend on page and role filter

  const fetchUsers = async () => {
    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(
        `${API_URL}/admin/users?page=${currentPage}&per_page=10&role=${roleFilter}`, 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender || "",
      blood_group: user.blood_group || "",
      height: user.height?.toString() || "",
      weight: user.weight?.toString() || "",
      password: "" // Clear password field for editing
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      role: "student",
      gender: "",
      blood_group: "",
      height: "",
      weight: "",
      password: ""
    });
    setIsAddDialogOpen(true);
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          gender: formData.gender,
          blood_group: formData.blood_group,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          password: formData.password || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.password) {
        toast.error("Password is required for new users");
        return;
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          gender: formData.gender,
          blood_group: formData.blood_group,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }

      toast.success("User added successfully");
      setIsAddDialogOpen(false);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage users in the system</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 w-full"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 border rounded-md">
            <UserRoundX className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium text-lg">No users found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm || roleFilter !== "all" 
                ? "Try adjusting your search or filter" 
                : "No users have been added to the system yet"}
            </p>
            {(searchTerm || roleFilter !== "all") && (
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'trainer' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
                  <span className="font-medium">{totalUsers}</span> users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAddForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-gender">Gender</Label>
                <Input
                  id="add-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  placeholder="Gender"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-blood-group">Blood Group</Label>
                <Input
                  id="add-blood-group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  placeholder="Blood Group"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-height">Height (cm)</Label>
                <Input
                  id="add-height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="Height in cm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-weight">Weight (kg)</Label>
                <Input
                  id="add-weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Weight in kg"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEditForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Password <span className="text-xs text-muted-foreground">(Leave blank to keep current)</span>
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Input
                  id="edit-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  placeholder="Gender"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-blood-group">Blood Group</Label>
                <Input
                  id="edit-blood-group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  placeholder="Blood Group"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-height">Height (cm)</Label>
                <Input
                  id="edit-height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="Height in cm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-weight">Weight (kg)</Label>
                <Input
                  id="edit-weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Weight in kg"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-md mb-4">
            <p><strong>Name:</strong> {selectedUser?.name}</p>
            <p><strong>Email:</strong> {selectedUser?.email}</p>
            <p><strong>Role:</strong> {selectedUser?.role}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
