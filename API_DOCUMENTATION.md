
# API Documentation - FitWell Gym Management System

This document provides details on all API endpoints available in the FitWell Gym Management System.

## Base URL

All endpoints are prefixed with: `http://localhost:5000/api`

## Authentication

### Register a New User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "role": "student" // "student", "staff", or "admin"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "User registered successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing required fields
  - `409 Conflict`: Email already registered
  - `400 Bad Request`: Invalid role

### User Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "student" // Optional, for role validation
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "access_token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "role": "student"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password
  - `401 Unauthorized`: Invalid email or password

### Get User Profile

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Authentication**: JWT token in Authorization header
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "student"
  }
  ```
- **Error Response**: `404 Not Found`: User not found

## Student Endpoints

All student endpoints require authentication with a JWT token and student role.

### Student Profile

- **URL**: `/student/profile`
- **Methods**: `GET`, `POST`
- **Authentication**: JWT token (student role)
- **GET Response**: `200 OK`
  ```json
  {
    "age": 25,
    "height": 180,
    "weight": 75,
    "fitness_goal": "Build muscle",
    "medical_conditions": "None",
    "admission_date": "2023-01-01T00:00:00"
  }
  ```
- **POST Request Body**:
  ```json
  {
    "age": 25,
    "height": 180,
    "weight": 75,
    "fitness_goal": "Build muscle",
    "medical_conditions": "None"
  }
  ```
- **POST Response**: `200 OK`
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

### Training Videos

- **URL**: `/student/videos`
- **Method**: `GET`
- **Authentication**: JWT token (student role)
- **Query Parameters**: 
  - `category` (optional): Filter videos by category
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "Beginner Workout",
      "description": "Easy workout for beginners",
      "video_url": "https://example.com/video1",
      "category": "beginner",
      "created_at": "2023-01-01T00:00:00"
    }
  ]
  ```

### Diet Plans

- **URL**: `/student/diet-plans`
- **Method**: `GET`
- **Authentication**: JWT token (student role)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "Weight Loss Diet",
      "description": "Diet plan for weight loss",
      "calories": 1800,
      "protein": 120,
      "carbs": 150,
      "fat": 60,
      "created_at": "2023-01-01T00:00:00"
    }
  ]
  ```

### Equipment List

- **URL**: `/student/equipment`
- **Method**: `GET`
- **Authentication**: JWT token (student role)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Dumbbell Set",
      "description": "Set of various weight dumbbells",
      "quantity": 5,
      "condition": "good"
    }
  ]
  ```

### Trainers List

- **URL**: `/student/trainers`
- **Method**: `GET`
- **Authentication**: JWT token (student role)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Trainer Name",
      "specialization": "Strength Training",
      "experience_years": 5,
      "bio": "Experienced trainer specialized in strength training"
    }
  ]
  ```

## Staff Endpoints

All staff endpoints require authentication with a JWT token and staff role.

### Staff/Trainer Profile

- **URL**: `/staff/profile`
- **Methods**: `GET`, `POST`
- **Authentication**: JWT token (staff role)
- **GET Response**: `200 OK`
  ```json
  {
    "specialization": "Strength Training",
    "experience_years": 5,
    "bio": "Experienced trainer specialized in strength training",
    "schedule": "Monday to Friday, 9 AM - 5 PM"
  }
  ```
- **POST Request Body**:
  ```json
  {
    "specialization": "Strength Training",
    "experience_years": 5,
    "bio": "Experienced trainer specialized in strength training",
    "schedule": "Monday to Friday, 9 AM - 5 PM"
  }
  ```
- **POST Response**: `200 OK`
  ```json
  {
    "message": "Trainer profile updated successfully"
  }
  ```

### Training Videos Management

- **URL**: `/staff/videos`
- **Methods**: `GET`, `POST`
- **Authentication**: JWT token (staff role)
- **GET Response**: `200 OK` (Returns videos created by the staff)
- **POST Request Body**:
  ```json
  {
    "title": "Advanced Workout",
    "description": "Advanced workout routine",
    "video_url": "https://example.com/video2",
    "category": "advanced"
  }
  ```
- **POST Response**: `201 Created`
  ```json
  {
    "message": "Video added successfully",
    "id": 2
  }
  ```

### Video Update/Delete

- **URL**: `/staff/videos/:video_id`
- **Methods**: `PUT`, `DELETE`
- **Authentication**: JWT token (staff role)
- **PUT Request Body**:
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "video_url": "https://example.com/updated",
    "category": "intermediate"
  }
  ```
- **Success Responses**:
  - `200 OK`: `{"message": "Video updated successfully"}`
  - `200 OK`: `{"message": "Video deleted successfully"}`
- **Error Responses**:
  - `404 Not Found`: Video not found
  - `403 Forbidden`: No permission to modify this video

### Diet Plans Management

- **URL**: `/staff/diet-plans`
- **Methods**: `GET`, `POST`
- **Authentication**: JWT token (staff role)
- **GET Response**: `200 OK` (Returns diet plans created by the staff)
- **POST Request Body**:
  ```json
  {
    "title": "Muscle Building Diet",
    "description": "Diet plan for building muscle",
    "calories": 2500,
    "protein": 180,
    "carbs": 250,
    "fat": 70
  }
  ```
- **POST Response**: `201 Created`
  ```json
  {
    "message": "Diet plan added successfully",
    "id": 2
  }
  ```

### Students List

- **URL**: `/staff/students`
- **Method**: `GET`
- **Authentication**: JWT token (staff role)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 3,
      "name": "Student Name",
      "email": "student@example.com",
      "profile": {
        "age": 25,
        "height": 180,
        "weight": 75,
        "fitness_goal": "Build muscle",
        "admission_date": "2023-01-01T00:00:00"
      }
    }
  ]
  ```

## Admin Endpoints

All admin endpoints require authentication with a JWT token and admin role.

### User Management

- **URL**: `/admin/users`
- **Method**: `GET`
- **Authentication**: JWT token (admin role)
- **Query Parameters**:
  - `role` (optional): Filter users by role
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "role": "student",
      "created_at": "2023-01-01T00:00:00"
    }
  ]
  ```

### User Update/Delete

- **URL**: `/admin/users/:user_id`
- **Methods**: `PUT`, `DELETE`
- **Authentication**: JWT token (admin role)
- **PUT Request Body**:
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "staff",
    "password": "newpassword123" // Optional
  }
  ```
- **Success Responses**:
  - `200 OK`: `{"message": "User updated successfully"}`
  - `200 OK`: `{"message": "User deleted successfully"}`
- **Error Response**: `404 Not Found`: User not found

### Equipment Management

- **URL**: `/admin/equipment`
- **Methods**: `GET`, `POST`
- **Authentication**: JWT token (admin role)
- **GET Response**: `200 OK` (Returns all equipment)
- **POST Request Body**:
  ```json
  {
    "name": "Treadmill",
    "description": "Commercial grade treadmill",
    "quantity": 3,
    "condition": "new",
    "purchase_date": "2023-01-01T00:00:00",
    "last_maintenance": "2023-06-01T00:00:00"
  }
  ```
- **POST Response**: `201 Created`
  ```json
  {
    "message": "Equipment added successfully",
    "id": 2
  }
  ```

### Equipment Update/Delete

- **URL**: `/admin/equipment/:equipment_id`
- **Methods**: `PUT`, `DELETE`
- **Authentication**: JWT token (admin role)
- **PUT Request Body**:
  ```json
  {
    "name": "Updated Treadmill",
    "description": "Updated description",
    "quantity": 4,
    "condition": "good",
    "purchase_date": "2023-01-01T00:00:00",
    "last_maintenance": "2023-06-01T00:00:00"
  }
  ```
- **Success Responses**:
  - `200 OK`: `{"message": "Equipment updated successfully"}`
  - `200 OK`: `{"message": "Equipment deleted successfully"}`
- **Error Response**: `404 Not Found`: Equipment not found

### Trainers List

- **URL**: `/admin/trainers`
- **Method**: `GET`
- **Authentication**: JWT token (admin role)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 2,
      "user_id": 5,
      "name": "Trainer Name",
      "email": "trainer@example.com",
      "specialization": "Strength Training",
      "experience_years": 5,
      "bio": "Experienced trainer",
      "schedule": "Monday to Friday, 9 AM - 5 PM"
    }
  ]
  ```

### System Statistics

- **URL**: `/admin/stats`
- **Method**: `GET`
- **Authentication**: JWT token (admin role)
- **Success Response**: `200 OK`
  ```json
  {
    "users": {
      "total": 10,
      "students": 7,
      "staff": 2,
      "admins": 1
    },
    "equipment": 5
  }
  ```
