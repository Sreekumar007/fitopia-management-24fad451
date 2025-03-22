
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from database import db
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.staff_routes import staff_bp
from routes.admin_routes import admin_bp
from models import User

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Simple CORS configuration

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')  # Default key for development
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Add error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({'error': 'Authorization required'}), 401

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(staff_bp, url_prefix='/api/staff')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/')
def index():
    return {'message': 'Gym Management API is running'}

# Create default admin user
def create_default_admin():
    with app.app_context():
        admin = User.query.filter_by(email="admin@fitwell.com").first()
        if not admin:
            default_admin = User(
                name="Admin",
                email="admin@fitwell.com",
                role="admin"
            )
            default_admin.set_password("admin")
            
            db.session.add(default_admin)
            db.session.commit()
            print("Default admin created successfully")
        else:
            print("Default admin already exists")

# Create test student account for demo purposes
def create_test_student():
    with app.app_context():
        student = User.query.filter_by(email="student@fitwell.com").first()
        if not student:
            test_student = User(
                name="Test Student",
                email="student@fitwell.com",
                role="student"
            )
            test_student.set_password("student")
            
            db.session.add(test_student)
            db.session.commit()
            print("Test student created successfully")
        else:
            print("Test student already exists")

# Create test staff account for demo purposes
def create_test_staff():
    with app.app_context():
        staff = User.query.filter_by(email="staff@fitwell.com").first()
        if not staff:
            test_staff = User(
                name="Test Staff",
                email="staff@fitwell.com",
                role="staff"
            )
            test_staff.set_password("staff")
            
            db.session.add(test_staff)
            db.session.commit()
            print("Test staff created successfully")
        else:
            print("Test staff already exists")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables based on models
        create_default_admin()  # Create default admin user
        create_test_student()  # Create test student user
        create_test_staff()  # Create test staff user
    app.run(debug=True, port=5000)
