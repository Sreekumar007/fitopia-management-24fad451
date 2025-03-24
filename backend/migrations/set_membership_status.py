import sys
import os
import traceback

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import db
from models import StudentProfile
from datetime import datetime

def run_migration():
    """Set membership_status for all existing student profiles"""
    try:
        # Initialize the database connection
        from app import app
        with app.app_context():
            # Get all student profiles
            profiles = StudentProfile.query.all()
            print(f"Found {len(profiles)} student profiles to update")
            
            # Update each profile with a default 'active' status
            updated_count = 0
            for profile in profiles:
                # Check if the column exists in the database but value is None
                if not hasattr(profile, 'membership_status') or profile.membership_status is None:
                    print(f"Updating profile ID {profile.id} for user {profile.user_id} to 'active'")
                    profile.membership_status = 'active'
                    updated_count += 1
            
            # Commit the changes
            db.session.commit()
            print(f"Migration successful. Updated {updated_count} student profiles.")
            return True
    
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("Membership status migration completed successfully")
    else:
        print("Membership status migration failed")
        sys.exit(1) 