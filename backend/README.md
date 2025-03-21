
# Gym Management Backend

This is a Flask backend for the Gym Management application with MySQL database integration.

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- MySQL Server
- pip (Python package manager)

### Step 1: Create a MySQL Database

```sql
CREATE DATABASE gym_management;
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Edit the `.env` file with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=gym_management
DB_PORT=3306

JWT_SECRET_KEY=your-secret-key-change-in-production
```

### Step 4: Run the Application

```bash
python app.py
```

The server will start at http://localhost:5000

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Log in a user
- GET `/api/auth/profile` - Get current user profile

### Student Routes

- GET/POST `/api/student/profile` - Get or update student profile
- GET `/api/student/videos` - Get training videos
- GET `/api/student/diet-plans` - Get diet plans
- GET `/api/student/equipment` - Get equipment list
- GET `/api/student/trainers` - Get trainers list

### Staff Routes

- GET/POST `/api/staff/profile` - Get or update staff profile
- GET/POST `/api/staff/videos` - Get or add training videos
- PUT/DELETE `/api/staff/videos/<video_id>` - Update or delete a video
- GET/POST `/api/staff/diet-plans` - Get or add diet plans
- GET `/api/staff/students` - Get students list

### Admin Routes

- GET `/api/admin/users` - Get all users
- PUT/DELETE `/api/admin/users/<user_id>` - Update or delete a user
- GET/POST `/api/admin/equipment` - Get or add equipment
- PUT/DELETE `/api/admin/equipment/<equipment_id>` - Update or delete equipment
- GET `/api/admin/trainers` - Get all trainers
- GET `/api/admin/stats` - Get system statistics
