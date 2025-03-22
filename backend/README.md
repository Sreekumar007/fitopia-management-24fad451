
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

## Database Models

### User Model
- Basic user information and authentication
- Relationships to profiles based on role

### StudentProfile Model
- Student-specific information
- Connected to User model via user_id

### TrainingVideo Model
- Details about training videos
- Tracking of uploader via user_id

### DietPlan Model
- Nutritional information and diet plan details
- Tracking of creator via user_id

### Equipment Model
- Equipment inventory management
- Tracking condition and maintenance

### Trainer Model
- Staff-specific information for trainers
- Connected to User model via user_id

## Authentication System

The backend uses JWT (JSON Web Tokens) for authentication:

1. When users register or login, a JWT token is generated containing their ID, name, email, and role
2. This token must be included in the Authorization header for protected routes
3. Routes are protected based on user roles (student, staff, admin)

## API Response Format

All API responses follow a consistent format:

- Success responses include status codes 200 (OK) or 201 (Created)
- Error responses include appropriate status codes (400, 401, 403, 404) and error messages
- JSON data is returned in a standardized structure

## Development

### Adding New Routes

1. Create new route files in the `routes/` directory
2. Define blueprint and route handlers
3. Register blueprints in `app.py`

### Adding New Models

1. Define new models in `models.py`
2. Create relationships to existing models if needed
3. Implement database migrations if schema changes

### Database Migrations

For database changes after initial setup:

1. Create a backup of your database
2. Update model definitions in `models.py`
3. Use Flask-Migrate or manual SQL statements to apply changes

## Testing

Manual testing can be performed using tools like Postman or curl:

```bash
# Example registration request
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MySQL is running
   - Check credentials in `.env` file
   - Ensure database exists and is accessible

2. **JWT Issues**
   - Check JWT_SECRET_KEY in `.env`
   - Verify token expiration settings

3. **Route Access Denied**
   - Check if correct JWT token is included in request
   - Verify user has correct role for the requested endpoint
