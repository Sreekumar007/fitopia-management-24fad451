
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown } from "lucide-react";

const NavLinks = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/" className="text-md hover:text-primary transition-colors">
          Home
        </Link>
        <Link to="/about" className="text-md hover:text-primary transition-colors">
          About
        </Link>
        <Link to="/features" className="text-md hover:text-primary transition-colors">
          Features
        </Link>
        <Link to="/contact" className="text-md hover:text-primary transition-colors">
          Contact
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {user?.name}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={
                  user?.role === "admin" 
                    ? "/admin/dashboard" 
                    : user?.role === "staff" 
                      ? "/staff/dashboard" 
                      : "/student/dashboard"
                }>
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex gap-2">
                  Login
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/login">User Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/login">Admin Login</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button className="hidden sm:flex" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavLinks;
