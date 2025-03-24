from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, TrainingVideo, DietPlan, Equipment, Trainer, StudentProfile, Notification, Schedule
from datetime import datetime, timedelta
import json
import random

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def staff_profile():
    try:
        current_user = get_jwt_identity()
        print(f"Processing staff profile request for user: {current_user}")
        
        # Verify user is staff
        if not current_user or 'role' not in current_user or current_user['role'] != 'staff':
            print(f"Unauthorized access: {current_user}")
            return jsonify({'error': 'Unauthorized access'}), 403
        
        if request.method == 'GET':
            # Get user data
            user = User.query.get(current_user['id'])
            print(f"Found user: {user}")
            
            if not user:
                # For development - if the user doesn't exist but should, create a test staff user
                print(f"User not found in DB, creating test staff user")
                user = User(
                    id=current_user['id'],
                    name="Staff Member",
                    email="staff@fitwell.com",
                    role="staff",
                    gender="Female",
                    blood_group="B+",
                    height=165,
                    weight=60,
                    created_at=datetime.utcnow()
                )
                user.set_password("staff")
                db.session.add(user)
                db.session.commit()
            
            return jsonify({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'department': 'Physical Education',  # This would come from a staff_profile table in a real app
                'position': 'Fitness Coordinator',  # This would come from a staff_profile table in a real app
                'gender': user.gender or '',
                'blood_group': user.blood_group or '',
                'height': user.height or 0,
                'weight': user.weight or 0
            }), 200
        
        elif request.method == 'PUT':
            # Update user profile
            data = request.get_json()
            user = User.query.get(current_user['id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Update fields
            if 'name' in data:
                user.name = data['name']
            if 'gender' in data:
                user.gender = data['gender']
            if 'blood_group' in data:
                user.blood_group = data['blood_group']
            if 'height' in data:
                user.height = data['height']
            if 'weight' in data:
                user.weight = data['weight']
            
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        print(f"Error in staff_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@staff_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Count trainers (faculty members)
    faculty_members = User.query.filter_by(role='trainer').count()
    
    # Count sessions scheduled for current user
    sessions_scheduled = Schedule.query.filter_by(user_id=current_user['id']).count()
    
    # Calculate attendance rate based on schedules - in a real app, this would be based on actual attendance records
    total_schedules = sessions_scheduled if sessions_scheduled > 0 else 1
    # For simplicity, we'll count past schedules as attended
    now = datetime.utcnow()
    attended_sessions = Schedule.query.filter(
        Schedule.user_id == current_user['id'],
        Schedule.scheduled_time < now
    ).count()
    attendance_rate = (attended_sessions / total_schedules) * 100 if total_schedules > 0 else 0
    
    # Count total workouts completed (for demonstration, we'll use attended sessions plus some extra)
    workouts_completed = attended_sessions + (sessions_scheduled // 2)  # Some fraction of current sessions
    
    # Calculate participation rate based on faculty member activity
    trainers = User.query.filter_by(role='trainer').all()
    active_trainers = 0
    for trainer in trainers:
        # A trainer is considered active if they have any schedule entries
        if Schedule.query.filter_by(trainer_id=trainer.id).count() > 0:
            active_trainers += 1
    
    participation_rate = (active_trainers / faculty_members) * 100 if faculty_members > 0 else 0
    # If no active trainers yet, set a reasonable default
    if participation_rate == 0 and faculty_members > 0:
        participation_rate = 35  # Default starting value
    
    stats = {
        'workoutsCompleted': workouts_completed,
        'attendance': f"{round(attendance_rate)}%",
        'sessionsScheduled': sessions_scheduled,
        'facultyMembers': faculty_members,
        'participationRate': round(participation_rate)
    }
    
    return jsonify(stats), 200

@staff_bp.route('/activities', methods=['GET', 'POST'])
@jwt_required()
def manage_activities():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get all scheduled activities for a wider date range
        now = datetime.utcnow()
        # Show activities from 7 days ago to 60 days in the future
        start_date = now - timedelta(days=7)
        end_date = now + timedelta(days=60)
        
        activities = Schedule.query.filter(
            Schedule.user_id == current_user['id'],
            Schedule.scheduled_time >= start_date,
            Schedule.scheduled_time <= end_date
        ).order_by(Schedule.scheduled_time).all()
        
        # Also get any recently created activities (last 10)
        recent_activities = Schedule.query.filter(
            Schedule.user_id == current_user['id']
        ).order_by(Schedule.id.desc()).limit(10).all()
        
        # Combine both sets (removing duplicates)
        activity_ids = set()
        result = []
        
        # Process activities in date range
        for activity in activities:
            if activity.id not in activity_ids:
                scheduled_time = activity.scheduled_time
                activity_ids.add(activity.id)
                result.append({
                    'id': activity.id,
                    'title': activity.title,
                    'date': scheduled_time.strftime('%Y-%m-%d'),
                    'time': scheduled_time.strftime('%I:%M %p'),
                    'participants': 8,  # This would be calculated from participants in a real app
                    'location': activity.location or 'Main Gym'
                })
        
        # Process recent activities
        for activity in recent_activities:
            if activity.id not in activity_ids:
                scheduled_time = activity.scheduled_time
                activity_ids.add(activity.id)
                result.append({
                    'id': activity.id,
                    'title': activity.title,
                    'date': scheduled_time.strftime('%Y-%m-%d'),
                    'time': scheduled_time.strftime('%I:%M %p'),
                    'participants': 8,  # This would be calculated from participants in a real app
                    'location': activity.location or 'Main Gym'
                })
        
        # If no activities, create actual database records instead of just returning mock data
        if not result:
            # Get current timestamp for sample data
            now = datetime.utcnow()
            tomorrow = now + timedelta(days=1)
            next_week = now + timedelta(days=7)
            
            # Create real database records for sample activities
            sample_activities = [
                {
                    'title': 'Faculty Fitness Session',
                    'description': 'Regular fitness session for faculty members',
                    'scheduled_time': now.replace(hour=16, minute=0, second=0, microsecond=0),  # 4:00 PM today
                    'location': 'Main Gym',
                    'user_id': current_user['id']
                },
                {
                    'title': 'Staff Yoga Class',
                    'description': 'Morning yoga class for staff wellness',
                    'scheduled_time': tomorrow.replace(hour=8, minute=30, second=0, microsecond=0),  # 8:30 AM tomorrow
                    'location': 'Wellness Center',
                    'user_id': current_user['id']
                },
                {
                    'title': 'Department Meeting',
                    'description': 'Regular department coordination meeting',
                    'scheduled_time': next_week.replace(hour=14, minute=0, second=0, microsecond=0),  # 2:00 PM next week
                    'location': 'Conference Room B',
                    'user_id': current_user['id']
                }
            ]
            
            # Insert sample activities into database
            for activity_data in sample_activities:
                new_activity = Schedule(
                    user_id=activity_data['user_id'],
                    title=activity_data['title'],
                    description=activity_data['description'],
                    scheduled_time=activity_data['scheduled_time'],
                    location=activity_data['location']
                )
                db.session.add(new_activity)
            
            # Commit the changes
            db.session.commit()
            
            # Fetch the newly created activities
            activities = Schedule.query.filter(
                Schedule.user_id == current_user['id'],
                Schedule.scheduled_time >= now,
                Schedule.scheduled_time <= end_date
            ).order_by(Schedule.scheduled_time).all()
            
            # Convert to JSON response
            result = []
            for activity in activities:
                scheduled_time = activity.scheduled_time
                
                result.append({
                    'id': activity.id,
                    'title': activity.title,
                    'date': scheduled_time.strftime('%Y-%m-%d'),
                    'time': scheduled_time.strftime('%I:%M %p'),
                    'participants': 8,  # This would be calculated from participants in a real app
                    'location': activity.location or 'Main Gym'
                })
        
        return jsonify(result), 200
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not all(k in data for k in ['title', 'date', 'time']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Parse date and time
        try:
            date_str = data['date']
            time_str = data['time']
            scheduled_time = datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %I:%M %p')
        except ValueError:
            return jsonify({'error': 'Invalid date or time format'}), 400
        
        # Create new activity
        new_activity = Schedule(
            user_id=current_user['id'],
            title=data['title'],
            description=data.get('description', ''),
            scheduled_time=scheduled_time,
            location=data.get('location', 'Main Gym')
        )
        
        db.session.add(new_activity)
        db.session.commit()
        
        return jsonify({
            'id': new_activity.id,
            'title': new_activity.title,
            'date': scheduled_time.strftime('%Y-%m-%d'),
            'time': scheduled_time.strftime('%I:%M %p'),
            'participants': 0,
            'location': new_activity.location
        }), 201

@staff_bp.route('/updates', methods=['GET', 'POST'])
@jwt_required()
def department_updates():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get all notifications
        notifications = Notification.query.filter_by(user_id=current_user['id']).order_by(Notification.created_at.desc()).limit(10).all()
        
        result = []
        for notification in notifications:
            result.append({
                'id': notification.id,
                'title': notification.title,
                'content': notification.message,
                'timestamp': notification.created_at.isoformat(),
                'is_read': notification.read
            })
        
        # If no notifications, create actual database records instead of just returning mock data
        if not result:
            now = datetime.utcnow()
            
            # Create real database records for sample updates
            sample_updates = [
                {
                    'title': 'Wellness Week Announcement',
                    'message': 'Join us for a week of wellness activities starting next Monday.',
                    'user_id': current_user['id'],
                    'read': False
                },
                {
                    'title': 'New Fitness Equipment Arrived',
                    'message': 'Check out our new treadmills and weights in the gym.',
                    'user_id': current_user['id'],
                    'read': True
                },
                {
                    'title': 'Faculty Yoga Session Reminder',
                    'message': 'Don\'t forget the yoga session tomorrow morning.',
                    'user_id': current_user['id'],
                    'read': True
                }
            ]
            
            # Insert sample updates into database
            for update_data in sample_updates:
                new_notification = Notification(
                    user_id=update_data['user_id'],
                    title=update_data['title'],
                    message=update_data['message'],
                    read=update_data['read'],
                    created_at=datetime.utcnow()
                )
                db.session.add(new_notification)
            
            # Commit the changes
            db.session.commit()
            
            # Fetch the newly created notifications
            notifications = Notification.query.filter_by(user_id=current_user['id']).order_by(Notification.created_at.desc()).limit(10).all()
            
            # Convert to JSON response
            result = []
            for notification in notifications:
                result.append({
                    'id': notification.id,
                    'title': notification.title,
                    'content': notification.message,
                    'timestamp': notification.created_at.isoformat(),
                    'is_read': notification.read
                })
        
        return jsonify(result), 200
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not all(k in data for k in ['title', 'content']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create new notification
        new_notification = Notification(
            user_id=current_user['id'],
            title=data['title'],
            message=data['content'],
            read=False,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_notification)
        db.session.commit()
        
        return jsonify({
            'id': new_notification.id,
            'title': new_notification.title,
            'content': new_notification.message,
            'timestamp': new_notification.created_at.isoformat(),
            'is_read': new_notification.read
        }), 201

@staff_bp.route('/faculty', methods=['GET', 'POST'])
@jwt_required()
def get_faculty_members():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get all trainers
        trainers = User.query.filter_by(role='trainer').all()
        
        result = []
        for trainer in trainers:
            # Get trainer profile if exists
            trainer_profile = Trainer.query.filter_by(user_id=trainer.id).first()
            
            # Calculate random participation percentage for demonstration
            import random
            participation = f"{random.randint(30, 95)}%"
            
            result.append({
                'id': trainer.id,
                'name': trainer.name,
                'email': trainer.email,
                'department': 'Physical Education',  # This would come from a staff_profile table in a real app
                'position': trainer_profile.specialization if trainer_profile else 'Trainer',
                'participation': participation,
                'joined_date': trainer.created_at.strftime('%Y-%m-%d')
            })
        
        # If no trainers, create actual database records instead of just returning mock data
        if not result:
            # Create sample faculty user accounts
            sample_faculty = [
                {
                    'name': 'John Smith',
                    'email': 'john.smith@example.com',
                    'department': 'Computer Science',
                    'position': 'Professor'
                },
                {
                    'name': 'Sarah Johnson',
                    'email': 'sarah.johnson@example.com',
                    'department': 'Mathematics',
                    'position': 'Associate Professor'
                },
                {
                    'name': 'Michael Brown',
                    'email': 'michael.brown@example.com',
                    'department': 'Physics',
                    'position': 'Assistant Professor'
                }
            ]
            
            # Insert sample faculty into database
            for faculty_data in sample_faculty:
                # Check if user with this email already exists
                existing_user = User.query.filter_by(email=faculty_data['email']).first()
                if existing_user:
                    continue
                
                # Create new user with trainer role
                new_user = User(
                    name=faculty_data['name'],
                    email=faculty_data['email'],
                    role='trainer',
                    created_at=datetime.utcnow()
                )
                
                # Set password using model method
                new_user.set_password('changeme')
                
                # Add to session
                db.session.add(new_user)
                db.session.flush()  # Get the ID without committing yet
                
                # Create trainer profile
                new_trainer = Trainer(
                    user_id=new_user.id,
                    specialization=faculty_data['position'],
                    experience_years=3,  # Default
                    bio="",
                    schedule=""
                )
                db.session.add(new_trainer)
            
            # Commit all changes
            db.session.commit()
            
            # Fetch all trainers again
            trainers = User.query.filter_by(role='trainer').all()
            
            # Convert to JSON response
            result = []
            for trainer in trainers:
                # Get trainer profile
                trainer_profile = Trainer.query.filter_by(user_id=trainer.id).first()
                
                # Generate random participation for demonstration
                import random
                participation = f"{random.randint(30, 95)}%"
                
                result.append({
                    'id': trainer.id,
                    'name': trainer.name,
                    'email': trainer.email,
                    'department': 'Physical Education',  # This would come from a staff_profile table in a real app
                    'position': trainer_profile.specialization if trainer_profile else 'Trainer',
                    'participation': participation,
                    'joined_date': trainer.created_at.strftime('%Y-%m-%d')
                })
        
        return jsonify(result), 200
    
    elif request.method == 'POST':
        try:
            # Get JSON data from request
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided or invalid JSON format'}), 400
            
            # Debug incoming data
            print(f"Received faculty data: {data}")
            
            # Validate required fields
            if not data.get('name') or not data.get('email'):
                return jsonify({'error': 'Name and email are required'}), 400
                
            # Check if user with this email already exists
            existing_user = User.query.filter_by(email=data.get('email')).first()
            if existing_user:
                return jsonify({'error': 'A user with this email already exists'}), 409
            
            # Create a new user with trainer role
            try:
                # Create new user
                new_user = User(
                    name=data.get('name'),
                    email=data.get('email'),
                    role='trainer',
                    created_at=datetime.utcnow()
                )
                
                # Set the password using the model method (not manually creating hash)
                new_user.set_password('changeme')
                
                # Add to session
                db.session.add(new_user)
                db.session.flush()  # Get the ID without committing yet
                
                # Create trainer profile with provided data
                new_trainer = Trainer(
                    user_id=new_user.id,
                    specialization=data.get('position', 'Trainer'),
                    experience_years=0,
                    bio="",
                    schedule=""
                )
                db.session.add(new_trainer)
                
                # Commit to database
                db.session.commit()
                
                # Calculate random participation for demonstration
                import random
                participation = f"{random.randint(30, 95)}%"
                
                # Prepare response data
                result = {
                    'id': new_user.id,
                    'name': new_user.name,
                    'email': new_user.email,
                    'department': data.get('department', 'Physical Education'),
                    'position': data.get('position', 'Trainer'),
                    'participation': participation,
                    'joined_date': new_user.created_at.strftime('%Y-%m-%d')
                }
                
                print(f"Created new faculty member: {result}")
                return jsonify(result), 201
                
            except Exception as e:
                db.session.rollback()
                error_msg = f"Error creating faculty member: {str(e)}"
                print(error_msg)
                return jsonify({'error': error_msg}), 500
                
        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 400

@staff_bp.route('/videos', methods=['GET', 'POST'])
@jwt_required()
def manage_videos():
    try:
        current_user = get_jwt_identity()
        
        # Verify user is staff
        if current_user['role'] != 'staff':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        if request.method == 'GET':
            print("Fetching videos for staff member")
            
            # Get all videos from database
            videos = TrainingVideo.query.all()
            
            # Convert to JSON response
            result = []
            for video in videos:
                # Get uploader name
                uploader = User.query.get(video.uploaded_by)
                uploader_name = uploader.name if uploader else "Unknown"
                
                result.append({
                    'id': video.id,
                    'title': video.title,
                    'description': video.description or '',
                    'duration': '10:30',  # This would be stored in the database in a real app
                    'thumbnail': 'https://via.placeholder.com/300x200',  # This would be a real URL in a real app
                    'url': video.video_url,
                    'category': video.category,
                    'tags': video.category.split(','),  # This would be a separate table in a real app
                    'created_at': video.created_at.isoformat()
                })
            
            # IMPORTANT: Create actual database records if none exist
            if not result:
                print("No videos found in database, creating initial records")
                
                # Create real database records instead of just returning mock data
                sample_videos = [
                    {
                        'title': 'Basic Strength Training',
                        'description': 'Learn the fundamentals of strength training with this comprehensive guide.',
                        'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        'category': 'Strength,Beginner',
                        'uploaded_by': current_user['id']
                    },
                    {
                        'title': 'Cardio Workout for Beginners',
                        'description': 'A gentle introduction to cardio exercises for beginners.',
                        'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        'category': 'Cardio,Beginner',
                        'uploaded_by': current_user['id']
                    },
                    {
                        'title': 'Advanced Yoga Poses',
                        'description': 'Master challenging yoga poses with this detailed tutorial.',
                        'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        'category': 'Yoga,Advanced',
                        'uploaded_by': current_user['id']
                    }
                ]
                
                # Insert sample videos into database
                for video_data in sample_videos:
                    new_video = TrainingVideo(
                        title=video_data['title'],
                        description=video_data['description'],
                        video_url=video_data['video_url'],
                        category=video_data['category'],
                        uploaded_by=video_data['uploaded_by'],
                        created_at=datetime.utcnow()
                    )
                    db.session.add(new_video)
                
                # Commit the changes
                db.session.commit()
                
                # Fetch the newly created videos
                videos = TrainingVideo.query.all()
                
                # Convert to JSON response
                result = []
                for video in videos:
                    result.append({
                        'id': video.id,
                        'title': video.title,
                        'description': video.description or '',
                        'duration': '10:30',
                        'thumbnail': 'https://via.placeholder.com/300x200',
                        'url': video.video_url,
                        'category': video.category,
                        'tags': video.category.split(','),
                        'created_at': video.created_at.isoformat()
                    })
            
            print(f"Returning {len(result)} videos")
            return jsonify(result), 200
        
        elif request.method == 'POST':
            # Add new video to database
            data = request.get_json()
            
            if not all(k in data for k in ['title', 'url', 'category']):
                return jsonify({'error': 'Missing required fields'}), 400
            
            new_video = TrainingVideo(
                title=data['title'],
                description=data.get('description', ''),
                video_url=data['url'],
                category=data['category'],
                uploaded_by=current_user['id'],
                created_at=datetime.utcnow()
            )
            
            db.session.add(new_video)
            db.session.commit()
            
            return jsonify({
                'id': new_video.id,
                'title': new_video.title,
                'description': new_video.description,
                'duration': '10:30',  # This would be calculated in a real app
                'thumbnail': 'https://via.placeholder.com/300x200',  # This would be generated in a real app
                'url': new_video.video_url,
                'category': new_video.category,
                'tags': new_video.category.split(','),
                'created_at': new_video.created_at.isoformat()
            }), 201
    except Exception as e:
        print(f"Error in manage_videos: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@staff_bp.route('/diet-plans', methods=['GET', 'POST'])
@jwt_required()
def manage_diet_plans():
    try:
        current_user = get_jwt_identity()
        
        # Verify user is staff
        if current_user['role'] != 'staff':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        if request.method == 'GET':
            print("Fetching diet plans for staff member")
            
            # Fetch actual diet plans from database
            plans = DietPlan.query.all()
            
            # Convert to JSON response
            result = []
            for plan in plans:
                # Get creator name
                creator = User.query.get(plan.created_by)
                creator_name = creator.name if creator else "Unknown"
                
                # Create sample meal structure - in a real app this would be stored in a separate table
                sample_meals = [
                    {
                        "name": "Breakfast",
                        "items": ["Oatmeal", "Fresh fruit", "Greek yogurt"],
                        "time": "8:00 AM"
                    },
                    {
                        "name": "Lunch",
                        "items": ["Grilled chicken salad", "Whole grain bread", "Avocado"],
                        "time": "12:30 PM"
                    },
                    {
                        "name": "Dinner",
                        "items": ["Salmon", "Brown rice", "Steamed vegetables"],
                        "time": "7:00 PM"
                    }
                ]
                
                result.append({
                    'id': plan.id,
                    'title': plan.title,
                    'description': plan.description or '',
                    'target': 'Weight management',  # This would come from the database in a real app
                    'meals': sample_meals,
                    'created_by': creator_name,
                    'created_at': plan.created_at.isoformat()
                })
            
            # IMPORTANT: Create actual database records if none exist
            if not result:
                print("No diet plans found in database, creating initial records")
                
                # Create real database records instead of just returning mock data
                sample_plans = [
                    {
                        'title': 'Weight Loss Plan',
                        'description': 'A balanced diet plan designed for healthy weight loss.',
                        'calories': 1800,
                        'protein': 150,
                        'carbs': 150,
                        'fat': 60,
                        'created_by': current_user['id']
                    },
                    {
                        'title': 'Muscle Building Plan',
                        'description': 'High-protein diet plan to support muscle growth and recovery.',
                        'calories': 2500,
                        'protein': 200,
                        'carbs': 250,
                        'fat': 70,
                        'created_by': current_user['id']
                    },
                    {
                        'title': 'Vegetarian Plan',
                        'description': 'Balanced vegetarian diet rich in plant-based proteins.',
                        'calories': 2000,
                        'protein': 120,
                        'carbs': 220,
                        'fat': 65,
                        'created_by': current_user['id']
                    }
                ]
                
                # Insert sample diet plans into database
                for plan_data in sample_plans:
                    new_plan = DietPlan(
                        title=plan_data['title'],
                        description=plan_data['description'],
                        calories=plan_data['calories'],
                        protein=plan_data['protein'],
                        carbs=plan_data['carbs'],
                        fat=plan_data['fat'],
                        created_by=plan_data['created_by'],
                        created_at=datetime.utcnow()
                    )
                    db.session.add(new_plan)
                
                # Commit the changes
                db.session.commit()
                
                # Fetch the newly created diet plans
                plans = DietPlan.query.all()
                
                # Convert to JSON response
                result = []
                for plan in plans:
                    # Get creator name
                    creator = User.query.get(plan.created_by)
                    creator_name = creator.name if creator else "Unknown"
                    
                    # Define meal structures based on plan type
                    if 'Weight Loss' in plan.title:
                        meals = [
                            {
                                "name": "Breakfast",
                                "items": ["Egg white omelet", "Whole grain toast", "Fresh berries"],
                                "time": "7:30 AM"
                            },
                            {
                                "name": "Lunch",
                                "items": ["Grilled chicken salad", "Quinoa", "Lemon water"],
                                "time": "12:00 PM"
                            },
                            {
                                "name": "Dinner",
                                "items": ["Baked fish", "Steamed vegetables", "Brown rice"],
                                "time": "6:30 PM"
                            }
                        ]
                    elif 'Muscle Building' in plan.title:
                        meals = [
                            {
                                "name": "Breakfast",
                                "items": ["Protein shake", "Banana", "Oatmeal"],
                                "time": "7:00 AM"
                            },
                            {
                                "name": "Lunch",
                                "items": ["Chicken breast", "Sweet potato", "Broccoli"],
                                "time": "1:00 PM"
                            },
                            {
                                "name": "Dinner",
                                "items": ["Lean beef", "Quinoa", "Mixed vegetables"],
                                "time": "7:00 PM"
                            }
                        ]
                    else:
                        meals = [
                            {
                                "name": "Breakfast",
                                "items": ["Tofu scramble", "Avocado toast", "Fruit smoothie"],
                                "time": "8:00 AM"
                            },
                            {
                                "name": "Lunch",
                                "items": ["Lentil soup", "Whole grain bread", "Green salad"],
                                "time": "12:30 PM"
                            },
                            {
                                "name": "Dinner",
                                "items": ["Bean curry", "Brown rice", "Roasted vegetables"],
                                "time": "6:30 PM"
                            }
                        ]
                    
                    result.append({
                        'id': plan.id,
                        'title': plan.title,
                        'description': plan.description or '',
                        'target': 'Weight management',
                        'meals': meals,
                        'created_by': creator_name,
                        'created_at': plan.created_at.isoformat()
                    })
            
            print(f"Returning {len(result)} diet plans")
            return jsonify(result), 200
        
        elif request.method == 'POST':
            # Add new diet plan
            data = request.get_json()
            
            if not all(k in data for k in ['title']):
                return jsonify({'error': 'Missing required fields'}), 400
            
            # Handle meals data - in a real app this would be stored in a separate table
            meals_data = data.get('meals', [])
            
            new_plan = DietPlan(
                title=data['title'],
                description=data.get('description', ''),
                calories=data.get('calories'),
                protein=data.get('protein'),
                carbs=data.get('carbs'),
                fat=data.get('fat'),
                created_by=current_user['id'],
                created_at=datetime.utcnow()
            )
            
            db.session.add(new_plan)
            db.session.commit()
            
            return jsonify({
                'id': new_plan.id,
                'title': new_plan.title,
                'description': new_plan.description,
                'target': data.get('target', 'Weight management'),
                'meals': meals_data,
                'created_by': User.query.get(current_user['id']).name,
                'created_at': new_plan.created_at.isoformat()
            }), 201
    except Exception as e:
        print(f"Error in manage_diet_plans: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Legacy endpoints - keep these for backward compatibility
@staff_bp.route('/videos/<int:video_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_video(video_id):
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff' and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    video = TrainingVideo.query.get(video_id)
    
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    
    # Only allow staff who uploaded the video or admin to modify/delete
    if video.uploaded_by != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({'error': 'You do not have permission to modify this video'}), 403
    
    if request.method == 'PUT':
        data = request.get_json()
        
        if 'title' in data:
            video.title = data['title']
        if 'description' in data:
            video.description = data['description']
        if 'video_url' in data:
            video.video_url = data['video_url']
        if 'category' in data:
            video.category = data['category']
            
        db.session.commit()
        return jsonify({'message': 'Video updated successfully'}), 200
    
    elif request.method == 'DELETE':
        db.session.delete(video)
        db.session.commit()
        return jsonify({'message': 'Video deleted successfully'}), 200

@staff_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff' and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get all students
    students = User.query.filter_by(role='student').all()
    
    result = []
    for student in students:
        profile = StudentProfile.query.filter_by(user_id=student.id).first()
        student_data = {
            'id': student.id,
            'name': student.name,
            'email': student.email,
            'profile': None
        }
        
        if profile:
            student_data['profile'] = {
                'age': profile.age,
                'height': student.height,
                'weight': student.weight,
                'fitness_goal': profile.fitness_goal,
                'admission_date': profile.admission_date.isoformat() if profile.admission_date else None
            }
        
        result.append(student_data)
    
    return jsonify(result), 200

@staff_bp.route('/activities/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Find the activity
    activity = Schedule.query.get(activity_id)
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    # Verify the activity belongs to the current user
    if activity.user_id != current_user['id']:
        return jsonify({'error': 'You do not have permission to delete this activity'}), 403
    
    # Delete the activity
    db.session.delete(activity)
    db.session.commit()
    
    return jsonify({'message': 'Activity deleted successfully'}), 200
