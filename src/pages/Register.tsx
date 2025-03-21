
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { Helmet } from "react-helmet";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Register | FitWell Gym</title>
        <meta name="description" content="Create your FitWell Gym account and start your fitness journey today." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join FitWell Gym</h1>
            <p className="text-muted-foreground">
              Create an account to get started
            </p>
          </div>
          
          <div className="bg-card border rounded-xl p-8 shadow-sm">
            <AuthForm type="register" />
            
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
