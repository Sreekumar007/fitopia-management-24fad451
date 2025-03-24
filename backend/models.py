from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    role = db.Column(db.String(20), nullable=False)  # admin, staff, trainer, student
    # Additional profile fields
    gender = db.Column(db.String(10))
    blood_group = db.Column(db.String(5))
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define explicit relationship to StudentProfile
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, foreign_keys='StudentProfile.user_id')
    # Keep other relationships
    notifications = db.relationship('Notification', backref='user')

    def __repr__(self):
        return f'<User {self.name}>'
    
    def set_password(self, password):
        """Set the password hash from a plaintext password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hash"""
        if self.password_hash:
            return check_password_hash(self.password_hash, password)
        return False
        
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'height': self.height,
            'weight': self.weight
        }

class StudentProfile(db.Model):
    __tablename__ = 'student_profile'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    fitness_goal = db.Column(db.String(100), nullable=True)
    medical_conditions = db.Column(db.Text, nullable=True)
    admission_date = db.Column(db.DateTime, default=datetime.utcnow)
    department = db.Column(db.String(100), nullable=True)
    membership_status = db.Column(db.String(20), default='active')  # 'active', 'expired', 'pending'
    
    # Fix relationship to explicitly define the foreign key
    attendances = db.relationship('Attendance', 
                                 backref='student_profile', 
                                 lazy=True, 
                                 foreign_keys='Attendance.student_id')

class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'present', 'absent'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TrainingVideo(db.Model):
    __tablename__ = 'training_video'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    video_url = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    uploader = db.relationship('User', backref='videos')

class DietPlan(db.Model):
    __tablename__ = 'diet_plan'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    calories = db.Column(db.Integer, nullable=True)
    protein = db.Column(db.Float, nullable=True)  # in grams
    carbs = db.Column(db.Float, nullable=True)    # in grams
    fat = db.Column(db.Float, nullable=True)      # in grams
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_diet_plans')
    # Explicitly define relationship with a different backref name
    student_assignments = db.relationship('StudentDietPlan', backref='diet_plan_ref', lazy=True)

class StudentDietPlan(db.Model):
    __tablename__ = 'student_diet_plan'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    diet_plan_id = db.Column(db.Integer, db.ForeignKey('diet_plan.id'), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'cancelled'
    notes = db.Column(db.Text, nullable=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Rename and specify foreign keys explicitly with different backref names
    trainer = db.relationship('User', foreign_keys=[assigned_by], backref='assigned_diet_plans')
    student = db.relationship('User', foreign_keys=[student_id], backref='student_diet_plans')
    # The diet_plan relationship is handled by the backref from DietPlan

class Equipment(db.Model):
    __tablename__ = 'equipment'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    condition = db.Column(db.String(50), nullable=True)  # 'new', 'good', 'fair', 'needs repair'
    purchase_date = db.Column(db.DateTime, nullable=True)
    last_maintenance = db.Column(db.DateTime, nullable=True)
    
class Trainer(db.Model):
    __tablename__ = 'trainer'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialization = db.Column(db.String(100), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True)
    bio = db.Column(db.Text, nullable=True)
    schedule = db.Column(db.Text, nullable=True)  # JSON string of weekly schedule
    
    user = db.relationship('User', backref='trainer_profile')

class WorkoutPlan(db.Model):
    __tablename__ = 'workout_plan'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_workout_plans')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_workout_plans')

class MedicalRecord(db.Model):
    __tablename__ = 'medical_record'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)  # 'injury', 'medical condition'
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='medical_records')

class Notification(db.Model):
    __tablename__ = 'notification'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Schedule(db.Model):
    __tablename__ = 'schedule'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(100), nullable=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainer.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    trainer = db.relationship('Trainer', backref='training_sessions')
