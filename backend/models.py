from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'staff', 'student', 'trainer'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New fields
    gender = db.Column(db.String(20), nullable=True)
    blood_group = db.Column(db.String(10), nullable=True)
    height = db.Column(db.Float, nullable=True)  # in cm
    weight = db.Column(db.Float, nullable=True)  # in kg
    payment_method = db.Column(db.String(50), nullable=True)
    
    # Relationships
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    schedules = db.relationship('Schedule', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    fitness_goal = db.Column(db.String(100), nullable=True)
    medical_conditions = db.Column(db.Text, nullable=True)
    admission_date = db.Column(db.DateTime, default=datetime.utcnow)
    department = db.Column(db.String(100), nullable=True)
    
    # Fix relationship to explicitly define the foreign key
    attendances = db.relationship('Attendance', 
                                 backref='student_profile', 
                                 lazy=True, 
                                 foreign_keys='Attendance.student_id')
    
    # No direct relationship to StudentDietPlan to avoid circular references

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'present', 'absent'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
    
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_diet_plans')
    # Explicitly define relationship with a different backref name
    student_assignments = db.relationship('StudentDietPlan', backref='diet_plan_ref', lazy=True)

class StudentDietPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    diet_plan_id = db.Column(db.Integer, db.ForeignKey('diet_plan.id'), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'cancelled'
    notes = db.Column(db.Text, nullable=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Rename and specify foreign keys explicitly with different backref names
    trainer = db.relationship('User', foreign_keys=[assigned_by], backref='assigned_diet_plans')
    student = db.relationship('User', foreign_keys=[student_id], backref='student_diet_plans')
    # The diet_plan relationship is handled by the backref from DietPlan

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

class WorkoutPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_workout_plans')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_workout_plans')

class MedicalRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)  # 'injury', 'medical condition'
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='medical_records')

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(100), nullable=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainer.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    trainer = db.relationship('Trainer', backref='training_sessions')
