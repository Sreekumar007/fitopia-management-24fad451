
from flask import Flask
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
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables based on models
        create_default_admin()  # Create default admin user
    app.run(debug=True, port=5000)
