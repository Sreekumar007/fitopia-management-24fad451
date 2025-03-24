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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  RefreshCw, 
  Dumbbell,
  AlertCircle
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

interface Equipment {
  id: number;
  name: string;
  description: string;
  quantity: number;
  condition: string;
  purchase_date: string | null;
  last_maintenance: string | null;
}

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for editing/adding equipment
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    condition: "excellent",
    purchase_date: "",
    last_maintenance: ""
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/equipment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch equipment");
      }

      const data = await response.json();
      setEquipment(data.equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Failed to load equipment data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item);
    setFormData({
      name: item.name,
      description: item.description,
      quantity: item.quantity.toString(),
      condition: item.condition,
      purchase_date: item.purchase_date || "",
      last_maintenance: item.last_maintenance || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      quantity: "",
      condition: "excellent",
      purchase_date: "",
      last_maintenance: ""
    });
    setIsAddDialogOpen(true);
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipment) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/equipment/${selectedEquipment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          condition: formData.condition,
          purchase_date: formData.purchase_date || null,
          last_maintenance: formData.last_maintenance || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update equipment");
      }

      toast.success("Equipment updated successfully");
      setIsEditDialogOpen(false);
      fetchEquipment(); // Refresh equipment list
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast.error("Failed to update equipment: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.name) {
        toast.error("Equipment name is required");
        return;
      }

      const response = await fetch(`${API_URL}/admin/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          quantity: parseInt(formData.quantity || "0"),
          condition: formData.condition,
          purchase_date: formData.purchase_date || null,
          last_maintenance: formData.last_maintenance || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add equipment");
      }

      toast.success("Equipment added successfully");
      setIsAddDialogOpen(false);
      fetchEquipment(); // Refresh equipment list
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast.error("Failed to add equipment: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const confirmDelete = async () => {
    if (!selectedEquipment) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/equipment/${selectedEquipment.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete equipment");
      }

      toast.success("Equipment deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchEquipment(); // Refresh equipment list
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
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

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Equipment Management</CardTitle>
            <CardDescription>View and manage gym equipment</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchEquipment}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex mb-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-12 border rounded-md">
            <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium text-lg">No equipment found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm 
                ? "Try adjusting your search" 
                : "No equipment has been added yet"}
            </p>
            {searchTerm && (
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
              }}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                        item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        item.condition === 'fair' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
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
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="text-sm text-muted-foreground">
          Total Equipment: {filteredEquipment.length}
        </div>
      </CardFooter>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Add a new equipment to the gym inventory
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAddForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Equipment Name</Label>
              <Input
                id="add-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter equipment name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-description">Description</Label>
              <Input
                id="add-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-quantity">Quantity</Label>
              <Input
                id="add-quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-condition">Condition</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(value) => handleSelectChange("condition", value)}
              >
                <SelectTrigger id="add-condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-purchase-date">Purchase Date</Label>
                <Input
                  id="add-purchase-date"
                  name="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-maintenance">Last Maintenance</Label>
                <Input
                  id="add-maintenance"
                  name="last_maintenance"
                  type="date"
                  value={formData.last_maintenance}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Equipment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update equipment information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEditForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Equipment Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter equipment name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condition</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(value) => handleSelectChange("condition", value)}
              >
                <SelectTrigger id="edit-condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-purchase-date">Purchase Date</Label>
                <Input
                  id="edit-purchase-date"
                  name="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-maintenance">Last Maintenance</Label>
                <Input
                  id="edit-maintenance"
                  name="last_maintenance"
                  type="date"
                  value={formData.last_maintenance}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Equipment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Equipment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-md mb-4">
            <p><strong>Name:</strong> {selectedEquipment?.name}</p>
            <p><strong>Description:</strong> {selectedEquipment?.description}</p>
            <p><strong>Quantity:</strong> {selectedEquipment?.quantity}</p>
            <p><strong>Condition:</strong> {selectedEquipment?.condition}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EquipmentManagement; 