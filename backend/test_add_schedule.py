from database import db
from models import User, Trainer, Schedule
from datetime import datetime, timedelta
import sys

def add_test_schedule():
    try:
        # Find a student user
        student = User.query.filter_by(role='student').first()
        if not student:
            print("No student found in the database")
            return
            
        # Find a trainer
        trainer_user = User.query.filter_by(role='trainer').first()
        if not trainer_user:
            print("No trainer found in the database")
            return
        
        trainer = Trainer.query.filter_by(user_id=trainer_user.id).first()
        if not trainer:
            print("Creating new trainer profile for trainer user")
            trainer = Trainer(
                user_id=trainer_user.id,
                specialization="General Fitness",
                experience_years=5,
                bio="Professional fitness trainer with expertise in strength and conditioning.",
                schedule="Weekdays 8 AM - 6 PM"
            )
            db.session.add(trainer)
            db.session.commit()
            
        # Create a schedule for tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow = tomorrow.replace(hour=10, minute=30, second=0, microsecond=0)
        
        new_schedule = Schedule(
            title="Personal Training Session",
            description="Strength and conditioning workout",
            user_id=student.id,
            trainer_id=trainer.id,
            scheduled_time=tomorrow,
            location="Fitness Studio",
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_schedule)
        db.session.commit()
        
        print(f"Added schedule for student {student.name} (ID: {student.id}) with trainer {trainer_user.name}")
        print(f"Schedule time: {tomorrow}")
        
    except Exception as e:
        print(f"Error adding test schedule: {str(e)}")
        db.session.rollback()

if __name__ == "__main__":
    # Initialize app context
    from app import app
    with app.app_context():
        add_test_schedule() 