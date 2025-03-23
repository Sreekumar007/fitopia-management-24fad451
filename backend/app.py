
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
from routes.trainer_routes import trainer_bp
from models import User

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

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

# Allow all OPTIONS requests for CORS preflight
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return {'status': 'ok'}, 200

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
                role="student",
                gender="Male",
                blood_group="O+",
                height=175,
                weight=70
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
                role="staff",
                gender="Female",
                blood_group="A+",
                height=165,
                weight=60
            )
            test_staff.set_password("staff")
            
            db.session.add(test_staff)
            db.session.commit()
            print("Test staff created successfully")
        else:
            print("Test staff already exists")

# Create test trainer account for demo purposes
def create_test_trainer():
    with app.app_context():
        trainer = User.query.filter_by(email="trainer@fitwell.com").first()
        if not trainer:
            test_trainer = User(
                name="Test Trainer",
                email="trainer@fitwell.com",
                role="trainer",
                gender="Male",
                blood_group="B+",
                height=180,
                weight=75
            )
            test_trainer.set_password("trainer")
            
            db.session.add(test_trainer)
            db.session.commit()
            print("Test trainer created successfully")
        else:
            print("Test trainer already exists")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables based on models
        create_default_admin()  # Create default admin user
        create_test_student()  # Create test student user
        create_test_staff()  # Create test staff user
        create_test_trainer()  # Create test trainer user
    app.run(debug=True, host='0.0.0.0', port=5000)
