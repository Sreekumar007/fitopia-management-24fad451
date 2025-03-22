
import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About | FitWell Gym Management</title>
        <meta name="description" content="Learn about FitWell Gym Management System and our mission" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-6">About FitWell</h1>
            <p className="text-lg text-muted-foreground mb-8">
              FitWell is a comprehensive gym management system designed to streamline operations for fitness facilities of all sizes.
            </p>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
              <p>
                At FitWell, our mission is to empower fitness facilities with the tools they need to operate efficiently, 
                provide exceptional service to their members, and achieve sustainable growth. We believe that well-managed 
                gyms create better experiences for everyone involved – from students to staff to administrators.
              </p>
              
              <h2 className="text-2xl font-semibold mt-10 mb-4">Our Story</h2>
              <p>
                FitWell was founded in 2020 by a team of fitness enthusiasts and technology experts who recognized the need 
                for better management solutions in the fitness industry. After working with dozens of gyms and fitness centers, 
                we identified common pain points and developed a platform that addresses these challenges head-on.
              </p>
              
              <h2 className="text-2xl font-semibold mt-10 mb-4">Our Approach</h2>
              <p>
                We take a user-centered approach to software development, focusing on the unique needs of different user roles 
                within a fitness organization. Our platform is designed to be intuitive and accessible for everyone, from tech-savvy 
                administrators to instructors who may have limited technical experience.
              </p>
              
              <h2 className="text-2xl font-semibold mt-10 mb-4">Our Team</h2>
              <p>
                FitWell is built by a diverse team of developers, designers, and fitness industry veterans who are passionate 
                about creating technology that makes a difference. We're constantly learning from our users and evolving our 
                platform to meet their changing needs.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
