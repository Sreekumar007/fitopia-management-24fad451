
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell, Users, Calendar, BookOpen, Clock, BarChart3, Utensils, Video } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="heading-lg mb-4">Designed for Everyone in Your Fitness Community</h2>
              <p className="text-lg text-muted-foreground">
                Our platform offers specialized features for students, staff, and administrators to create a seamless fitness experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Users size={24} />}
                title="For Students"
                description="Access personalized workout plans, nutrition guidance, track progress, and book sessions with trainers. Everything you need for your fitness journey."
              />
              
              <FeatureCard 
                icon={<Dumbbell size={24} />}
                title="For Staff"
                description="Manage client schedules, create and assign workout plans, track student progress, and communicate efficiently with the entire team."
              />
              
              <FeatureCard 
                icon={<BarChart3 size={24} />}
                title="For Administrators"
                description="Oversee all operations, manage memberships, analyze performance metrics, and ensure smooth functioning of the entire facility."
              />
            </div>
          </div>
        </section>
        
        {/* Detailed Features */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="heading-lg mb-4">Comprehensive Platform Features</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to run a modern, efficient fitness facility
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <Calendar className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Schedule Management</h3>
                <p className="text-muted-foreground mb-4">Effortlessly manage class schedules, appointments, and facility bookings in one place.</p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <Video className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Training Videos</h3>
                <p className="text-muted-foreground mb-4">Access a library of professional training videos for proper form and technique guidance.</p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <Utensils className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nutrition Planning</h3>
                <p className="text-muted-foreground mb-4">Create and track personalized nutrition plans aligned with fitness goals.</p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Equipment Database</h3>
                <p className="text-muted-foreground mb-4">Comprehensive information about available equipment and proper usage instructions.</p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <Clock className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Attendance Tracking</h3>
                <p className="text-muted-foreground mb-4">Monitor student attendance and engagement across all programs and classes.</p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
                <p className="text-muted-foreground mb-4">Detailed analytics and reporting to measure performance and track improvements.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="heading-lg mb-6">Ready to Transform Your Fitness Management?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of fitness facilities already using our platform to streamline operations and enhance the experience for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="px-8">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
