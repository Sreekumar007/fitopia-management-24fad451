
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigationType } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if we can access router functionality
  let location;
  try {
    location = useLocation();
  } catch (e) {
    // If useLocation throws an error, we're outside a Router context
    // Use a default location object
    location = { pathname: "/" };
  }

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-bold text-primary transition-all hover:opacity-80"
        >
          FitWell
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/")
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${
              isActive("/about")
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            About
          </Link>
          <Link
            to="/features"
            className={`text-sm font-medium transition-colors ${
              isActive("/features")
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Features
          </Link>
          <Link
            to="/contact"
            className={`text-sm font-medium transition-colors ${
              isActive("/contact")
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Contact
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 top-[57px] bg-background/95 backdrop-blur-sm z-50 p-6 flex flex-col animate-fade-in md:hidden"
          >
            <nav className="flex flex-col gap-6 pt-8">
              <Link
                to="/"
                className={`text-xl font-medium transition-colors ${
                  isActive("/") ? "text-primary" : "text-foreground/80"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`text-xl font-medium transition-colors ${
                  isActive("/about") ? "text-primary" : "text-foreground/80"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/features"
                className={`text-xl font-medium transition-colors ${
                  isActive("/features") ? "text-primary" : "text-foreground/80"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/contact"
                className={`text-xl font-medium transition-colors ${
                  isActive("/contact") ? "text-primary" : "text-foreground/80"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-4 mt-6">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
