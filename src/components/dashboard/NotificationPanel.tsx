import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, isLoading }) => {
  // Format time to relative format (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
          <CardTitle className="flex items-center text-indigo-800">
            <Bell className="mr-2 h-5 w-5 text-indigo-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-indigo-800">
            <Bell className="mr-2 h-5 w-5 text-indigo-600" />
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-indigo-600">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-medium ${!notification.read ? 'text-indigo-900' : 'text-gray-800'}`}>
                    {notification.title}
                  </h3>
                  {notification.read ? (
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatRelativeTime(notification.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel; 