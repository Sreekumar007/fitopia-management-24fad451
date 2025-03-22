
from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'staff', 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    height = db.Column(db.Float, nullable=True)  # in cm
    weight = db.Column(db.Float, nullable=True)  # in kg
    fitness_goal = db.Column(db.String(100), nullable=True)
    medical_conditions = db.Column(db.Text, nullable=True)
    admission_date = db.Column(db.DateTime, default=datetime.utcnow)

class TrainingVideo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    video_url = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    uploader = db.relationship('User', backref='videos')

class DietPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    calories = db.Column(db.Integer, nullable=True)
    protein = db.Column(db.Float, nullable=True)  # in grams
    carbs = db.Column(db.Float, nullable=True)    # in grams
    fat = db.Column(db.Float, nullable=True)      # in grams
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User', backref='diet_plans')

class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    condition = db.Column(db.String(50), nullable=True)  # 'new', 'good', 'fair', 'needs repair'
    purchase_date = db.Column(db.DateTime, nullable=True)
    last_maintenance = db.Column(db.DateTime, nullable=True)
    
class Trainer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialization = db.Column(db.String(100), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True)
    bio = db.Column(db.Text, nullable=True)
    schedule = db.Column(db.Text, nullable=True)  # JSON string of weekly schedule
    
    user = db.relationship('User', backref='trainer_profile')
