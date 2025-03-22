
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Search, Filter, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Equipment {
  id: number;
  name: string;
  description: string;
  quantity: number;
  condition: string;
  purchase_date: string | null;
  last_maintenance: string | null;
}

const API_URL = "http://localhost:5000/api";

const EquipmentList = () => {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState("");

  useEffect(() => {
    fetchEquipment();
  }, [token]);

  const fetchEquipment = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch equipment");
      }

      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Failed to load equipment");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "needs repair":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEquipment = equipment
    .filter((item) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => 
      filterCondition ? item.condition?.toLowerCase() === filterCondition.toLowerCase() : true
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5" />
              Equipment Inventory
            </CardTitle>
            <CardDescription>Manage gym equipment and maintenance</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search equipment..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
          >
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs repair">Needs Repair</option>
          </select>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredEquipment.length > 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(item.purchase_date)}</TableCell>
                    <TableCell>{formatDate(item.last_maintenance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-muted/10">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium">No equipment found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm || filterCondition ? "Try adjusting your search or filters" : "No equipment records available"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentList;
