
# Setup Checklist for FitWell Gym Management System

Use this checklist to ensure you've properly set up the entire application.

## Backend Setup

### MySQL Setup
- [ ] MySQL Server is installed and running
- [ ] Created `gym_management` database
- [ ] Created a MySQL user with appropriate permissions (or using root)

### Python Environment
- [ ] Python 3.8+ is installed
- [ ] Virtual environment created (optional but recommended)
- [ ] All dependencies installed from `requirements.txt`

### Configuration
- [ ] Copied and configured `.env` file with correct database credentials
- [ ] Set a secure JWT secret key
- [ ] Database connection tested successfully

### Backend Server
- [ ] Run `python app.py` from the backend directory
- [ ] Verify server is running at http://localhost:5000
- [ ] Test `/api` endpoint returns "Gym Management API is running"

## Frontend Setup

### Node.js Environment
- [ ] Node.js and npm are installed
- [ ] All dependencies installed using `npm install`

### Configuration
- [ ] Verify API URL is correctly set to `http://localhost:5000/api` in components

### Frontend Server
- [ ] Run `npm run dev` from the project root
- [ ] Verify application is running at localhost (typically port 8080)
- [ ] Test navigation to Register and Login pages

## Application Testing

### User Registration
- [ ] Create a student account
- [ ] Create a staff account
- [ ] Create an admin account

### User Login
- [ ] Test login with each account type
- [ ] Verify correct dashboard redirection based on role

### Feature Testing by Role

#### Student Features
- [ ] Create/update profile
- [ ] View training videos
- [ ] View diet plans
- [ ] View equipment list
- [ ] View trainers list

#### Staff Features
- [ ] Create/update trainer profile
- [ ] Add/edit training videos
- [ ] Add/edit diet plans
- [ ] View student list

#### Admin Features
- [ ] View/edit all users
- [ ] Add/edit equipment
- [ ] View system statistics

## Common Issues and Solutions

### Backend Issues
- Database connection errors: Verify MySQL credentials and server status
- Module import errors: Check virtual environment activation and package installation
- Port conflicts: Change port in `app.py` if port 5000 is already in use

### Frontend Issues
- API connection errors: Ensure backend is running and CORS is properly configured
- Dependency issues: Run `npm install` again or clear npm cache
- Build errors: Check console for specific errors

## Final Verification
- [ ] Backend API is accessible and responding to requests
- [ ] Frontend can register new users
- [ ] Frontend can log in existing users
- [ ] All role-specific features are working correctly
