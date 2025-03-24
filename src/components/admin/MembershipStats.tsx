import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Users, Clock, Activity, AlertTriangle } from "lucide-react";

const API_URL = "http://localhost:5000/api";

interface MembershipStats {
  active: number;
  expired: number;
  pending: number;
}

const MembershipStats = () => {
  const [stats, setStats] = useState<MembershipStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMembershipStats();
  }, []);

  const fetchMembershipStats = async () => {
    if (!token) {
      setError("Authentication token missing");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch membership statistics");
      }

      const data = await response.json();
      setStats(data.membership_stats);
    } catch (error) {
      console.error("Error fetching membership stats:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast.error(`Failed to load membership statistics: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total and percentages
  const totalMembers = stats ? stats.active + stats.expired + stats.pending : 0;
  const activePercentage = stats && totalMembers > 0 ? Math.round((stats.active / totalMembers) * 100) : 0;
  const expiredPercentage = stats && totalMembers > 0 ? Math.round((stats.expired / totalMembers) * 100) : 0;
  const pendingPercentage = stats && totalMembers > 0 ? Math.round((stats.pending / totalMembers) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Membership Statistics</h2>
        <Button variant="outline" size="sm" onClick={fetchMembershipStats} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">
          <p>{error}</p>
          <Button onClick={fetchMembershipStats} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Active Memberships</p>
                    <h3 className="text-2xl font-bold text-green-900">{stats?.active || 0}</h3>
                    <p className="text-sm text-green-600">{activePercentage}% of total</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Pending Memberships</p>
                    <h3 className="text-2xl font-bold text-amber-900">{stats?.pending || 0}</h3>
                    <p className="text-sm text-amber-600">{pendingPercentage}% of total</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Expired Memberships</p>
                    <h3 className="text-2xl font-bold text-red-900">{stats?.expired || 0}</h3>
                    <p className="text-sm text-red-600">{expiredPercentage}% of total</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Membership Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Distribution</CardTitle>
              <CardDescription>Breakdown of membership status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress bars for visual representation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active</span>
                    <span className="text-sm font-medium">{activePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${activePercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-sm font-medium">{pendingPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full"
                      style={{ width: `${pendingPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expired</span>
                    <span className="text-sm font-medium">{expiredPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-red-600 h-2.5 rounded-full"
                      style={{ width: `${expiredPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-2">Total Members: {totalMembers}</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly follow up with expired members to encourage renewals. 
                  Remember to process pending memberships in a timely manner.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Recommendations</CardTitle>
              <CardDescription>Actions to improve membership rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats && stats.expired > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-md bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Expired Memberships Alert</h4>
                      <p className="text-xs text-red-700 mt-1">
                        You have {stats.expired} expired memberships. Consider sending renewal 
                        reminders to increase your active membership count.
                      </p>
                    </div>
                  </div>
                )}
                
                {stats && stats.pending > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-900">Pending Memberships</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        There are {stats.pending} pending memberships awaiting approval. 
                        Process these to convert them into active members.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Membership Growth</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      To increase memberships, consider running promotional campaigns, 
                      offering referral bonuses, or creating special membership tiers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="w-full">Generate Membership Report</Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default MembershipStats; 