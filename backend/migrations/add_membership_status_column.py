import sys
import os
import traceback

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def run_migration():
    """Add membership_status column to student_profile table"""
    try:
        # Initialize the database connection
        from app import app
        from database import db
        from sqlalchemy import text
        
        with app.app_context():
            # Execute raw SQL to add the column if it doesn't exist
            add_column_sql = text("""
            ALTER TABLE student_profile
            ADD COLUMN membership_status VARCHAR(20) DEFAULT 'active'
            """)
            
            # Check if column already exists
            check_column_sql = text("""
            SELECT COUNT(*) as count
            FROM information_schema.columns 
            WHERE table_name = 'student_profile'
            AND column_name = 'membership_status'
            AND table_schema = DATABASE()
            """)
            
            result = db.session.execute(check_column_sql)
            column_exists = result.scalar() > 0
            
            if column_exists:
                print("Column 'membership_status' already exists in student_profile table")
                return True
            
            # Add the column if it doesn't exist
            print("Adding 'membership_status' column to student_profile table")
            db.session.execute(add_column_sql)
            db.session.commit()
            
            print("Migration successful. Column added.")
            return True
    
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("Database schema migration completed successfully")
    else:
        print("Database schema migration failed")
        sys.exit(1) 