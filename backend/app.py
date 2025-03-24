from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from models import db, User, StudentProfile, Trainer
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.staff_routes import staff_bp
from routes.admin_routes import admin_bp
from routes.trainer_routes import trainer_bp
import traceback
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Set up logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/app.log')
    ]
)
logger = logging.getLogger(__name__)

# Configure CORS with simpler approach
CORS(app, 
    origins=["http://localhost:8081", "http://127.0.0.1:8081"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
    supports_credentials=True
)

# Request logger
@app.before_request
def log_request_info():
    if request.path.startswith('/api'):
        print(f"\n>>> Request: {request.method} {request.path}")
        if request.is_json:
            try:
                print(f">>> Body: {request.get_json()}")
            except:
                print(">>> Body: [Could not parse JSON]")

# Response logger only - NO CORS header management here
@app.after_request
def log_response_info(response):
    if request.path.startswith('/api'):
        print(f"<<< Response: {response.status}")
        try:
            content = response.get_data().decode()
            print(f"<<< Body: {content[:200]}{'...' if len(content) > 200 else ''}\n")
            print(f"<<< Headers: {dict(response.headers)}\n")  # Log headers for debugging
        except:
            print("<<< Body: [Could not decode response]\n")
    return response

# Remove duplicate OPTIONS handlers - flask-cors will handle these automatically

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
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
app.register_blueprint(trainer_bp, url_prefix='/api/trainer')

@app.route('/')
def index():
    return {'message': 'Gym Management API is running'}

# Add a special handler for API endpoints with debug info
@app.route('/api/cors-test', methods=['GET', 'POST', 'OPTIONS'])
def cors_test():
    if request.method == 'OPTIONS':
        print("Received OPTIONS request for CORS preflight")
        return jsonify({'status': 'preflight ok'}), 200
        
    return jsonify({
        'message': 'CORS test successful',
        'method': request.method,
        'headers': dict(request.headers),
        'timestamp': str(datetime.now())
    }), 200

# Set up file logging
if not os.path.exists('logs'):
    os.makedirs('logs')

# Set up file handler
file_handler = RotatingFileHandler(
    'logs/app.log', 
    maxBytes=10240, 
    backupCount=10
)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)

app.logger.setLevel(logging.INFO)
app.logger.info('FitWell Gym startup')

# User creation helper functions
def create_default_admin():
    # Check if admin exists
    admin = User.query.filter_by(email="admin@fitwell.com").first()
    if not admin:
        admin = User(
            name="Admin User",
            email="admin@fitwell.com",
            role="admin",
            created_at=datetime.utcnow()
        )
        admin.set_password("admin")
        db.session.add(admin)
        db.session.commit()
        print("Created default admin user")
    return admin

def create_test_student():
    # Check if test student exists
    student = User.query.filter_by(email="student@fitwell.com").first()
    if not student:
        student = User(
            name="Test Student",
            email="student@fitwell.com",
            role="student",
            gender="Male",
            blood_group="A+",
            height=175,
            weight=70,
            created_at=datetime.utcnow()
        )
        student.set_password("student")
        db.session.add(student)
        db.session.flush()
        
        # Create student profile
        profile = StudentProfile(
            user_id=student.id,
            age=20,
            fitness_goal="Stay fit and healthy",
            medical_conditions="None",
            admission_date=datetime.utcnow(),
            department="Computer Science",
            membership_status="active"
        )
        db.session.add(profile)
        db.session.commit()
        print("Created test student user")
    return student

def create_test_staff():
    # Check if test staff exists
    staff = User.query.filter_by(email="staff@fitwell.com").first()
    if not staff:
        staff = User(
            name="Staff Member",
            email="staff@fitwell.com",
            role="staff",
            gender="Female",
            blood_group="B+",
            height=165,
            weight=60,
            created_at=datetime.utcnow()
        )
        staff.set_password("staff")
        db.session.add(staff)
        db.session.commit()
        print("Created test staff user")
    return staff

def create_test_trainer():
    # Check if test trainer exists
    trainer = User.query.filter_by(email="trainer@fitwell.com").first()
    if not trainer:
        trainer = User(
            name="Fitness Trainer",
            email="trainer@fitwell.com",
            role="trainer",
            gender="Male",
            blood_group="O+",
            height=180,
            weight=75,
            created_at=datetime.utcnow()
        )
        trainer.set_password("trainer")
        db.session.add(trainer)
        db.session.flush()
        
        # Create trainer profile
        profile = Trainer(
            user_id=trainer.id,
            specialization="Weight Training",
            experience_years=5,
            bio="Experienced fitness trainer with focus on strength training",
            schedule="Monday-Friday, 9 AM - 5 PM"
        )
        db.session.add(profile)
        db.session.commit()
        print("Created test trainer user")
    return trainer

# Initialize database function
def init_database():
    try:
        with app.app_context():
            db.create_all()  # Create tables based on models
            print("Database tables created successfully")
            
            # Create default users
            create_default_admin()
            create_test_student()
            create_test_staff()
            create_test_trainer()
            
            print("Database initialization completed")
    except Exception as e:
        print(f"Database initialization error: {str(e)}")
        traceback.print_exc()

if __name__ == '__main__':
    init_database()  # Initialize database before running the app
    app.run(debug=True, host='0.0.0.0', port=5000)






