from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, StudentProfile, TrainingVideo, DietPlan, Equipment, Trainer, WorkoutPlan, Attendance, MedicalRecord, Notification, Schedule, StudentDietPlan
from middleware.auth_middleware import student_required
import traceback
from datetime import datetime, timedelta
import json

student_bp = Blueprint('student', __name__)

@student_bp.route('/profile', methods=['GET', 'POST'])
@student_required
def student_profile():
    try:
        current_user = get_jwt_identity()
        
        # Verify user is a student or has the appropriate access
        if current_user['role'] not in ['student', 'staff', 'admin']:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        if request.method == 'GET':
            # Get student profile
            profile = StudentProfile.query.filter_by(user_id=current_user['id']).first()
            
            if not profile:
                # Return basic info if no detailed profile exists yet
                user = User.query.get(current_user['id'])
                return jsonify({
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'profile_status': 'not_created'
                }), 200
                
            return jsonify({
                'id': current_user['id'],
                'age': profile.age,
                'height': profile.height,
                'weight': profile.weight,
                'fitness_goal': profile.fitness_goal,
                'medical_conditions': profile.medical_conditions,
                'admission_date': profile.admission_date.isoformat() if profile.admission_date else None,
                'membership_status': profile.membership_status,
                'profile_status': 'created'
            }), 200
        
        elif request.method == 'POST':
            # Create or update student profile
            data = request.get_json()
            profile = StudentProfile.query.filter_by(user_id=current_user['id']).first()
            
            if not profile:
                profile = StudentProfile(user_id=current_user['id'])
                db.session.add(profile)
            
            # Update profile fields
            if 'age' in data:
                profile.age = data['age']
            if 'height' in data:
                profile.height = data['height']
            if 'weight' in data:
                profile.weight = data['weight']
            if 'fitness_goal' in data:
                profile.fitness_goal = data['fitness_goal']
            if 'medical_conditions' in data:
                profile.medical_conditions = data['medical_conditions']
                
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
    
    except Exception as e:
        print(f"Student profile error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/videos', methods=['GET'])
@student_required
def get_training_videos():
    try:
        # Optional category filter
        category = request.args.get('category')
        
        query = TrainingVideo.query
        if category:
            query = query.filter_by(category=category)
            
        videos = query.all()
        
        result = [{
            'id': video.id,
            'title': video.title,
            'description': video.description,
            'video_url': video.video_url,
            'category': video.category,
            'created_at': video.created_at.isoformat() if video.created_at else None
        } for video in videos]
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get videos error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/diet-plans', methods=['GET'])
@student_required
def get_diet_plans():
    try:
        current_user = get_jwt_identity()
        
        # Get diet plans assigned to this student
        assigned_diet_plans = StudentDietPlan.query.filter_by(student_id=current_user['id']).all()
        
        result = []
        for assignment in assigned_diet_plans:
            # Use the diet_plan_ref relationship instead of diet_plan
            diet_plan = DietPlan.query.get(assignment.diet_plan_id)
            if diet_plan:
                # Get trainer who assigned this plan
                trainer_name = "Staff"
                trainer = User.query.get(assignment.assigned_by)
                if trainer:
                    trainer_name = trainer.name
                
                plan_data = {
                    'id': diet_plan.id,
                    'title': diet_plan.title,
                    'description': diet_plan.description,
                    'calories': diet_plan.calories,
                    'protein': diet_plan.protein,
                    'carbs': diet_plan.carbs,
                    'fat': diet_plan.fat,
                    'assigned_by': trainer_name,
                    'assignment_id': assignment.id,
                    'status': assignment.status,
                    'notes': assignment.notes,
                    'assigned_at': assignment.assigned_at.isoformat() if assignment.assigned_at else None,
                    'created_at': diet_plan.created_at.isoformat() if diet_plan.created_at else None
                }
                result.append(plan_data)
        
        # If no assigned diet plans, return a default message
        if not result:
            return jsonify([{
                'id': 0,
                'title': 'No Diet Plan Assigned',
                'description': 'Please consult with your trainer to get a diet plan assigned to you.',
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0,
                'status': 'none',
                'notes': '',
                'assigned_by': 'None',
                'assigned_at': None
            }]), 200
            
        return jsonify(result), 200
    except Exception as e:
        print(f"Get diet plans error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/equipment', methods=['GET'])
@student_required
def get_equipment():
    try:
        equipment_list = Equipment.query.all()
        
        result = [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'quantity': item.quantity,
            'condition': item.condition
        } for item in equipment_list]
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get equipment error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/trainers', methods=['GET'])
@student_required
def get_trainers():
    try:
        trainers = Trainer.query.all()
        
        result = []
        for trainer in trainers:
            user_data = User.query.get(trainer.user_id)
            if user_data:
                result.append({
                    'id': trainer.id,
                    'name': user_data.name,
                    'specialization': trainer.specialization,
                    'experience_years': trainer.experience_years,
                    'bio': trainer.bio
                })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get trainers error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/workouts', methods=['GET'])
@student_required
def get_workouts():
    try:
        current_user = get_jwt_identity()
        
        workouts = WorkoutPlan.query.filter_by(assigned_to=current_user['id']).all()
        
        result = [{
            'id': workout.id,
            'title': workout.title,
            'description': workout.description,
            'created_at': workout.created_at.isoformat() if workout.created_at else None,
            'creator': User.query.get(workout.created_by).name
        } for workout in workouts]
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get workouts error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/attendance', methods=['GET', 'POST'])
@student_required
def get_attendance():
    try:
        current_user = get_jwt_identity()
        
        # Get student profile - make sure to create one if it doesn't exist
        profile = StudentProfile.query.filter_by(user_id=current_user['id']).first()
        if not profile:
            # Create a new profile if it doesn't exist
            profile = StudentProfile(
                user_id=current_user['id'],
                admission_date=datetime.utcnow()
            )
            db.session.add(profile)
            db.session.commit()
            print(f"Created new student profile for user {current_user['id']}")
        
        if request.method == 'GET':
            try:
                # Get attendance for the last 30 days
                end_date = datetime.now().date()
                start_date = end_date - timedelta(days=30)
                
                attendances = Attendance.query.filter_by(student_id=profile.id)\
                    .filter(Attendance.date >= start_date, Attendance.date <= end_date)\
                    .order_by(Attendance.date.desc())\
                    .all()
                
                result = [{
                    'id': attendance.id,
                    'date': attendance.date.isoformat(),
                    'status': attendance.status
                } for attendance in attendances]
                
                # Calculate attendance percentage
                present_count = sum(1 for a in attendances if a.status == 'present')
                total_count = len(attendances)
                percentage = (present_count / total_count * 100) if total_count > 0 else 0
                
                return jsonify({
                    'attendance_records': result,
                    'attendance_percentage': round(percentage, 2),
                    'days_present': present_count,
                    'total_days': total_count
                }), 200
            except Exception as e:
                print(f"Error in GET attendance: {str(e)}")
                traceback.print_exc()
                return jsonify({
                    'attendance_records': [],
                    'attendance_percentage': 0,
                    'days_present': 0,
                    'total_days': 0,
                    'error': str(e)
                }), 200  # Return 200 with empty data and error message
        
        elif request.method == 'POST':
            try:
                # Register attendance for the current day
                today = datetime.now().date()
                
                # Check if attendance for today is already registered
                existing_attendance = Attendance.query.filter_by(
                    student_id=profile.id, 
                    date=today
                ).first()
                
                if existing_attendance:
                    return jsonify({'message': 'Attendance already registered for today', 'status': existing_attendance.status}), 200
                
                # Create new attendance record
                new_attendance = Attendance(
                    student_id=profile.id,
                    date=today,
                    status='present'  # When a student marks their own attendance, it's always present
                )
                
                db.session.add(new_attendance)
                db.session.commit()
                print(f"Registered attendance for student {profile.id} on {today}")
                
                return jsonify({'message': 'Attendance registered successfully', 'status': 'present'}), 201
            except Exception as e:
                print(f"Error in POST attendance: {str(e)}")
                traceback.print_exc()
                db.session.rollback()
                return jsonify({'error': f'Failed to register attendance: {str(e)}'}), 500
            
    except Exception as e:
        print(f"General attendance error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/progress', methods=['GET', 'POST'])
@student_required
def workout_progress():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get student profile
            profile = StudentProfile.query.filter_by(user_id=current_user['id']).first()
            if not profile:
                # Create a profile if it doesn't exist
                profile = StudentProfile(
                    user_id=current_user['id'],
                    admission_date=datetime.utcnow()
                )
                db.session.add(profile)
                db.session.commit()
                print(f"Created new student profile for progress tracking: {current_user['id']}")
            
            # Calculate streak by analyzing consecutive attendance days
            today = datetime.now().date()
            start_date = today - timedelta(days=90)  # Check up to 90 days back
            
            # Get attendance records in descending order
            attendances = Attendance.query.filter_by(student_id=profile.id)\
                .filter(Attendance.date >= start_date)\
                .order_by(Attendance.date.desc())\
                .all()
                
            # Calculate streak
            streak = 0
            if attendances:
                # Check if most recent attendance is today or yesterday
                if attendances[0].date == today or attendances[0].date == today - timedelta(days=1):
                    streak = 1
                    for i in range(len(attendances) - 1):
                        # If dates are consecutive, increment streak
                        if attendances[i].date - attendances[i+1].date == timedelta(days=1):
                            streak += 1
                        else:
                            break
            
            # Calculate workouts completed
            workouts_completed = WorkoutPlan.query.filter_by(assigned_to=current_user['id']).count()
            
            # Calculate hours logged (placeholder - in a real app would be from a workout log)
            hours_logged = workouts_completed * 2  # Assuming 2 hours per workout
            
            # Calculate monthly progress (in a real app, this would be from actual progress tracking)
            # Using attendance percentage as a proxy for progress
            monthly_progress = []
            
            # Get data for the last 4 months
            for i in range(4):
                month_date = datetime.now().replace(day=1) - timedelta(days=30*i)
                month_name = month_date.strftime('%b')
                month_start = month_date.replace(day=1)
                next_month = month_start.replace(month=month_start.month % 12 + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
                month_end = next_month - timedelta(days=1)
                
                # Get attendance for this month
                month_attendances = Attendance.query.filter_by(student_id=profile.id)\
                    .filter(Attendance.date >= month_start.date(), Attendance.date <= month_end.date())\
                    .all()
                
                # Calculate attendance percentage
                month_present = sum(1 for a in month_attendances if a.status == 'present')
                month_total = len(month_attendances)
                month_percentage = round((month_present / month_total * 100) if month_total > 0 else 0)
                
                monthly_progress.append({
                    'month': month_name,
                    'value': month_percentage
                })
            
            # Reverse to get chronological order
            monthly_progress.reverse()
            
            # Get last month and this month percentages
            last_month = monthly_progress[-2]['value'] if len(monthly_progress) >= 2 else 0
            this_month = monthly_progress[-1]['value'] if monthly_progress else 0
            
            progress_data = {
                'last_month': last_month,
                'this_month': this_month,
                'streak': streak,
                'workouts_completed': workouts_completed,
                'hours_logged': hours_logged,
                'monthly_progress': monthly_progress
            }
            
            return jsonify(progress_data), 200
        
        elif request.method == 'POST':
            # In a real app, we would update progress data here
            # For now, just return success
            return jsonify({'message': 'Progress updated successfully'}), 200
    
    except Exception as e:
        print(f"Workout progress error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/notifications', methods=['GET'])
@student_required
def get_notifications():
    try:
        current_user = get_jwt_identity()
        
        # Get notifications for this user
        notifications = Notification.query.filter_by(user_id=current_user['id'])\
            .order_by(Notification.created_at.desc())\
            .limit(10)\
            .all()
        
        result = [{
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'created_at': notification.created_at.isoformat() if notification.created_at else None,
            'read': notification.read
        } for notification in notifications]
        
        # If no notifications, add a welcome notification for demo purposes
        if not result:
            result = [{
                'id': 0,
                'title': 'Welcome to FitWell Gym',
                'message': 'Thank you for joining our fitness platform. Start exploring your dashboard!',
                'created_at': datetime.utcnow().isoformat(),
                'read': False
            }]
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get notifications error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/schedule', methods=['GET'])
@student_required
def get_schedule():
    try:
        current_user = get_jwt_identity()
        
        # Get schedule entries for this user
        schedule_entries = Schedule.query.filter_by(user_id=current_user['id'])\
            .order_by(Schedule.scheduled_time)\
            .all()
        
        result = []
        for entry in schedule_entries:
            # Get trainer info if available
            trainer_name = "Staff"
            if entry.trainer_id:
                trainer = Trainer.query.get(entry.trainer_id)
                if trainer:
                    trainer_user = User.query.get(trainer.user_id)
                    if trainer_user:
                        trainer_name = trainer_user.name
            
            # Format the time
            scheduled_time = entry.scheduled_time
            if scheduled_time:
                if scheduled_time.date() == datetime.now().date():
                    time_str = f"Today, {scheduled_time.strftime('%I:%M %p')}"
                elif scheduled_time.date() == (datetime.now() + timedelta(days=1)).date():
                    time_str = f"Tomorrow, {scheduled_time.strftime('%I:%M %p')}"
                else:
                    time_str = scheduled_time.strftime('%A, %I:%M %p')
            else:
                time_str = "Not specified"
            
            result.append({
                'id': entry.id,
                'title': entry.title,
                'trainer': trainer_name,
                'time': time_str,
                'location': entry.location or "Main Gym"
            })
        
        # Return actual data from database, even if it's empty
        return jsonify(result), 200
    except Exception as e:
        print(f"Get schedule error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
