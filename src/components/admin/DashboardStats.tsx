import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, Dumbbell, CalendarClock, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  data: any;
  isLoading: boolean;
  onRefresh: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, isLoading, onRefresh }) => {
  if (!data && !isLoading) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground mb-4">Failed to load dashboard data</p>
        <Button onClick={onRefresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quick Statistics</h2>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students */}
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{data?.total_students || 0}</h3>
              )}
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Staff Members</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{data?.total_staff || 0}</h3>
              )}
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Trainers */}
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Trainers</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{data?.total_trainers || 0}</h3>
              )}
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Equipment</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{data?.total_equipment || 0}</h3>
              )}
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership stats and recent members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Overview</CardTitle>
            <CardDescription>Current membership status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-xl font-semibold">{data?.membership_stats?.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expired</p>
                    <p className="text-xl font-semibold">{data?.membership_stats?.expired || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-semibold">{data?.membership_stats?.pending || 0}</p>
                  </div>
                </div>
                
                {/* Progress bars for visual representation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-green-500 rounded" style={{ width: `${data?.membership_stats?.active || 0}%` }}></div>
                    <span className="text-xs">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-red-500 rounded" style={{ width: `${data?.membership_stats?.expired || 0}%` }}></div>
                    <span className="text-xs">Expired</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-yellow-500 rounded" style={{ width: `${data?.membership_stats?.pending || 0}%` }}></div>
                    <span className="text-xs">Pending</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
            <CardDescription>Latest members who joined</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recent_members && data.recent_members.length > 0 ? (
                  data.recent_members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.join_date}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No recent members found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
          <CardDescription>Summary of today's gym activity</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CalendarClock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Attendance</p>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{data?.today_attendance || 0}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Registrations</p>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{data?.new_registrations || 0}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats; 