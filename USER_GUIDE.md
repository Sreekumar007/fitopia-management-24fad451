
# User Guide - FitWell Gym Management System

This document provides detailed instructions on how to use the FitWell Gym Management System for different user roles.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Student Guide](#student-guide)
3. [Staff Guide](#staff-guide)
4. [Admin Guide](#admin-guide)
5. [Common Features](#common-features)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Registration

1. Navigate to the registration page by clicking "Sign up" on the homepage
2. Fill in your personal details:
   - Full Name
   - Email address
   - Password
   - Select your role (Student, Staff, or Admin)
3. Click the "Register" button
4. You will be redirected to the login page upon successful registration

### Login

1. Navigate to the login page
2. Enter your email and password
3. Select your role
4. Click the "Login" button
5. Upon successful login, you will be redirected to your role-specific dashboard

## Student Guide

As a student, you have access to the following features:

### Profile Management

1. Navigate to "Profile" in the dashboard menu
2. Fill in your details:
   - Age
   - Height
   - Weight
   - Fitness Goals
   - Medical Conditions (if any)
3. Save your profile information

### Training Videos

1. Access the "Training Videos" section from the dashboard
2. Browse videos by category (Beginner, Intermediate, Advanced)
3. Click on a video to view details and watch the training

### Diet Plans

1. Access the "Diet Plans" section from the dashboard
2. Browse available diet plans
3. View details including calorie count, macronutrients, and recommendations

### Equipment Guide

1. Access the "Equipment" section from the dashboard
2. Browse the list of available gym equipment
3. View details and instructions for proper use

### Trainers List

1. Access the "Trainers" section from the dashboard
2. Browse the list of available trainers
3. View trainer specializations, experience, and bio

## Staff Guide

As a staff member, you have access to the following features:

### Trainer Profile Management

1. Navigate to "Profile" in the staff dashboard
2. Fill in your professional details:
   - Specialization
   - Years of Experience
   - Professional Bio
   - Weekly Schedule
3. Save your profile information

### Training Video Management

1. Access the "Videos" section from the staff dashboard
2. View a list of videos you've uploaded
3. Add new videos:
   - Title
   - Description
   - Video URL
   - Category
4. Edit or delete existing videos

### Diet Plan Management

1. Access the "Diet Plans" section from the staff dashboard
2. View a list of diet plans you've created
3. Add new diet plans:
   - Title
   - Description
   - Calorie Count
   - Macronutrients (Protein, Carbs, Fat)
4. Edit or delete existing diet plans

### Student Management

1. Access the "Students" section from the staff dashboard
2. View a list of registered students
3. View student profiles and fitness goals

## Admin Guide

As an administrator, you have access to all staff features plus the following:

### User Management

1. Access the "Users" section from the admin dashboard
2. View a list of all users in the system
3. Filter users by role
4. Edit user details:
   - Name
   - Email
   - Role
   - Reset Password
5. Delete users if necessary

### Equipment Management

1. Access the "Equipment" section from the admin dashboard
2. View a list of all gym equipment
3. Add new equipment:
   - Name
   - Description
   - Quantity
   - Condition
   - Purchase Date
   - Last Maintenance Date
4. Edit or delete existing equipment

### System Statistics

1. View system statistics on the admin dashboard
2. Monitor user count by role
3. Track equipment inventory

## Common Features

### Password Management

1. Click on your profile icon in the top-right corner
2. Select "Change Password"
3. Enter your current password
4. Enter and confirm your new password
5. Click "Save" to update your password

### Logout

1. Click on your profile icon in the top-right corner
2. Select "Logout"
3. You will be redirected to the login page

## Troubleshooting

### Login Issues

If you can't log in:
1. Verify your email and password are correct
2. Ensure you're selecting the correct role
3. Check if the backend server is running
4. Try clearing your browser cache or using incognito mode

### API Connection Errors

If you see API connection errors:
1. Verify the backend server is running at http://localhost:5000
2. Check your network connection
3. Ensure your API calls have the correct format

### Missing Features

If certain features are not working:
1. Verify you have the correct permissions for your role
2. Check if you need to complete your profile first
3. Contact an administrator for assistance

### Database Issues

If database-related errors occur:
1. Ensure MySQL server is running
2. Verify the database connection details in the backend .env file
3. Check that the database schema is correctly set up
