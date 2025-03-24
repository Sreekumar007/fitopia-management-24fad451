from flask import Flask, jsonify, request
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

# For development only - allow all origins (replace with specific origins in production)
CORS(app, 
     resources={r"/api/*": {
         "origins": "*",  # Allow all origins during development
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "expose_headers": ["Content-Type", "Authorization"]
     }})

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






