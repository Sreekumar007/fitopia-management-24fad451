import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "staff" | "admin" | "trainer")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ["student", "staff", "admin", "trainer"] 
}) => {
  const { user, token, checkAuth, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Try to load from localStorage directly if context is empty
    const init = async () => {
      try {
        // If context doesn't have user/token, try localStorage
        if (!user || !token) {
          const storedToken = localStorage.getItem("token");
          const storedUser = localStorage.getItem("user");
          
          console.log("ProtectedRoute - localStorage check:", { 
            hasToken: !!storedToken, 
            hasUser: !!storedUser 
          });
          
          if (storedToken && storedUser) {
            try {
              // Verify token with backend if possible
              await checkAuth();
            } catch (error) {
              console.error("Token verification failed:", error);
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setIsChecking(false);
              return;
            }
          }
        }
      } finally {
        setIsChecking(false);
      }
    };
    
    init();
  }, [user, token, checkAuth]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="ml-2">Checking authentication...</p>
      </div>
    );
  }

  // Try getting from localStorage again as a fallback
  const userFromStorage = !user ? JSON.parse(localStorage.getItem("user") || "null") : user;
  const tokenFromStorage = !token ? localStorage.getItem("token") : token;

  if (!userFromStorage || !tokenFromStorage) {
    console.log('No user or token found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userFromStorage.role)) {
    console.log('User role not allowed:', userFromStorage.role);
    return <Navigate to={`/${userFromStorage.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
