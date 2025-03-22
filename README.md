
# FitWell Gym Management System

A full-stack web application for managing a gym with different user roles (student, staff, admin) and features.

## Project Overview

This project consists of:
- **Frontend**: React-based UI with Typescript, Tailwind CSS, and shadcn/ui components
- **Backend**: Flask API with MySQL database integration

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MySQL Server

### Running the Backend

1. **Set up MySQL Database**
   ```sql
   CREATE DATABASE gym_management;
   ```

2. **Configure Backend**
   ```bash
   cd backend
   # Optional: Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Configure .env file with your database credentials
   # Edit the .env file to match your MySQL setup
   ```

3. **Start the Backend Server**
   ```bash
   python app.py
   ```
   The backend will run at http://localhost:5000

### Running the Frontend

1. **Install Dependencies**
   ```bash
   # In the project root directory
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The frontend will run at http://localhost:8080 (or another port if 8080 is in use)

## Features

- **Authentication System**: Register and login with role-based access
- **Student Features**: Profile management, training videos, diet plans, equipment listings
- **Staff Features**: Trainer profile, video management, diet plan creation, student management
- **Admin Features**: User management, equipment inventory, statistics dashboard

## Project Structure

```
.
├── backend/               # Flask API
│   ├── models.py          # Database models
│   ├── routes/            # API endpoints
│   ├── app.py             # Main application entry
│   └── ...
├── src/                   # Frontend React code
│   ├── components/        # UI components
│   ├── pages/             # Page components
│   └── ...
└── ...
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints.

## User Guide

See [USER_GUIDE.md](./USER_GUIDE.md) for detailed usage instructions.

## Development

### Backend Development

- Models are defined in `backend/models.py`
- Routes are organized in blueprint modules in the `backend/routes/` directory
- Database configuration is in `backend/app.py` and `.env`

### Frontend Development

- Pages are in `src/pages/`
- Components are in `src/components/`
- Authentication logic is handled in `src/components/AuthForm.tsx`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
