from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, TrainingVideo, WorkoutPlan, MedicalRecord, Trainer, StudentProfile, DietPlan, StudentDietPlan, Schedule
from middleware.auth_middleware import trainer_required
import traceback
from datetime import datetime, timedelta

trainer_bp = Blueprint('trainer', __name__)

@trainer_bp.route('/profile', methods=['GET', 'POST'])
@trainer_required
def trainer_profile():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get trainer profile
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            
            if not trainer:
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
                'id': trainer.id,
                'user_id': current_user['id'],
                'specialization': trainer.specialization,
                'experience_years': trainer.experience_years,
                'bio': trainer.bio,
                'schedule': trainer.schedule,
                'profile_status': 'created'
            }), 200
        
        elif request.method == 'POST':
            # Create or update trainer profile
            data = request.get_json()
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            
            if not trainer:
                trainer = Trainer(user_id=current_user['id'])
                db.session.add(trainer)
            
            # Update profile fields
            if 'specialization' in data:
                trainer.specialization = data['specialization']
            if 'experience_years' in data:
                trainer.experience_years = data['experience_years']
            if 'bio' in data:
                trainer.bio = data['bio']
            if 'schedule' in data:
                trainer.schedule = data['schedule']
                
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
    
    except Exception as e:
        print(f"Trainer profile error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/members', methods=['GET'])
@trainer_required
def get_members():
    try:
        # Get all students and staff
        members = User.query.filter(User.role.in_(['student', 'staff'])).all()
        
        result = []
        for member in members:
            result.append({
                'id': member.id,
                'name': member.name,
                'email': member.email,
                'role': member.role,
                'gender': member.gender,
                'blood_group': member.blood_group,
                'height': member.height,
                'weight': member.weight
            })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get members error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/videos', methods=['GET', 'POST'])
@trainer_required
def manage_videos():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get all videos uploaded by this trainer
            videos = TrainingVideo.query.filter_by(uploaded_by=current_user['id']).all()
            
            result = []
            for video in videos:
                result.append({
                    'id': video.id,
                    'title': video.title,
                    'description': video.description,
                    'video_url': video.video_url,
                    'category': video.category,
                    'created_at': video.created_at.isoformat()
                })
            
            return jsonify(result), 200
        
        elif request.method == 'POST':
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ['title', 'video_url', 'category']):
                return jsonify({'error': 'Missing required fields'}), 400
                
            # Create new video
            new_video = TrainingVideo(
                title=data['title'],
                description=data.get('description', ''),
                video_url=data['video_url'],
                category=data['category'],
                uploaded_by=current_user['id']
            )
            
            db.session.add(new_video)
            db.session.commit()
            
            return jsonify({
                'message': 'Video uploaded successfully',
                'id': new_video.id
            }), 201
    except Exception as e:
        print(f"Manage videos error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/workout-plans', methods=['GET', 'POST'])
@trainer_required
def manage_workout_plans():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get all workout plans created by this trainer
            plans = WorkoutPlan.query.filter_by(created_by=current_user['id']).all()
            
            result = []
            for plan in plans:
                assignee = User.query.get(plan.assigned_to)
                result.append({
                    'id': plan.id,
                    'title': plan.title,
                    'description': plan.description,
                    'assigned_to': {
                        'id': assignee.id,
                        'name': assignee.name,
                        'role': assignee.role
                    },
                    'created_at': plan.created_at.isoformat()
                })
            
            return jsonify(result), 200
        
        elif request.method == 'POST':
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ['title', 'assigned_to']):
                return jsonify({'error': 'Missing required fields'}), 400
                
            # Check if assigned user exists
            assigned_user = User.query.get(data['assigned_to'])
            if not assigned_user:
                return jsonify({'error': 'Assigned user not found'}), 404
                
            # Create new workout plan
            new_plan = WorkoutPlan(
                title=data['title'],
                description=data.get('description', ''),
                created_by=current_user['id'],
                assigned_to=data['assigned_to']
            )
            
            db.session.add(new_plan)
            db.session.commit()
            
            return jsonify({
                'message': 'Workout plan created successfully',
                'id': new_plan.id
            }), 201
    except Exception as e:
        print(f"Manage workout plans error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/medical-records', methods=['GET', 'POST'])
@trainer_required
def manage_medical_records():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Optional filter by user ID
            user_id = request.args.get('user_id', type=int)
            
            query = MedicalRecord.query
            if user_id:
                query = query.filter_by(user_id=user_id)
                
            records = query.all()
            
            result = []
            for record in records:
                user = User.query.get(record.user_id)
                result.append({
                    'id': record.id,
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'role': user.role
                    },
                    'record_type': record.record_type,
                    'description': record.description,
                    'date': record.date.isoformat(),
                    'created_at': record.created_at.isoformat()
                })
            
            return jsonify(result), 200
        
        elif request.method == 'POST':
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ['user_id', 'record_type', 'description', 'date']):
                return jsonify({'error': 'Missing required fields'}), 400
                
            # Check if user exists
            user = User.query.get(data['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            # Create new medical record
            new_record = MedicalRecord(
                user_id=data['user_id'],
                record_type=data['record_type'],
                description=data['description'],
                date=data['date']
            )
            
            db.session.add(new_record)
            db.session.commit()
            
            return jsonify({
                'message': 'Medical record created successfully',
                'id': new_record.id
            }), 201
    except Exception as e:
        print(f"Manage medical records error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/students', methods=['GET'])
@trainer_required
def get_students():
    try:
        # Get all students
        students = User.query.filter_by(role='student').all()
        
        result = []
        for student in students:
            profile = StudentProfile.query.filter_by(user_id=student.id).first()
            student_data = {
                'id': student.id,
                'name': student.name,
                'email': student.email
            }
            
            if profile:
                student_data.update({
                    'age': profile.age,
                    'fitness_goal': profile.fitness_goal,
                    'medical_conditions': profile.medical_conditions,
                    'admission_date': profile.admission_date.isoformat() if profile.admission_date else None
                })
                
            result.append(student_data)
            
        return jsonify(result), 200
    except Exception as e:
        print(f"Get students error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/workouts', methods=['GET', 'POST'])
@trainer_required
def manage_workouts():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get all workouts created by this trainer
            workouts = WorkoutPlan.query.filter_by(created_by=current_user['id']).all()
            
            result = []
            for workout in workouts:
                # Get the student this workout is assigned to
                student = User.query.get(workout.assigned_to)
                
                result.append({
                    'id': workout.id,
                    'title': workout.title,
                    'description': workout.description,
                    'student_id': workout.assigned_to,
                    'student_name': student.name if student else 'Unknown',
                    'created_at': workout.created_at.isoformat() if workout.created_at else None
                })
                
            return jsonify(result), 200
            
        elif request.method == 'POST':
            # Create a new workout plan
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ('title', 'assigned_to')):
                return jsonify({'error': 'Missing required fields (title, assigned_to)'}), 400
                
            # Verify the student exists
            student = User.query.filter_by(id=data['assigned_to'], role='student').first()
            if not student:
                return jsonify({'error': 'Student not found'}), 404
                
            # Create the workout plan
            workout = WorkoutPlan(
                title=data['title'],
                description=data.get('description', ''),
                created_by=current_user['id'],
                assigned_to=data['assigned_to'],
                created_at=datetime.utcnow()
            )
            
            db.session.add(workout)
            db.session.commit()
            
            return jsonify({
                'message': 'Workout plan created successfully',
                'workout_id': workout.id
            }), 201
    
    except Exception as e:
        print(f"Manage workouts error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/diet-plans', methods=['GET', 'POST', 'PUT', 'DELETE'])
@trainer_required
def manage_diet_plans():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get all diet plans
            diet_plans = DietPlan.query.all()
            
            result = [{
                'id': plan.id,
                'title': plan.title,
                'description': plan.description,
                'calories': plan.calories,
                'protein': plan.protein,
                'carbs': plan.carbs,
                'fat': plan.fat,
                'created_at': plan.created_at.isoformat() if plan.created_at else None
            } for plan in diet_plans]
            
            return jsonify(result), 200
            
        elif request.method == 'POST':
            # Create a new diet plan
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ('title', 'description')):
                return jsonify({'error': 'Missing required fields (title, description)'}), 400
                
            # Create the diet plan
            diet_plan = DietPlan(
                title=data['title'],
                description=data['description'],
                calories=data.get('calories'),
                protein=data.get('protein'),
                carbs=data.get('carbs'),
                fat=data.get('fat'),
                created_by=current_user['id'],
                created_at=datetime.utcnow()
            )
            
            db.session.add(diet_plan)
            db.session.commit()
            
            return jsonify({
                'message': 'Diet plan created successfully',
                'diet_plan_id': diet_plan.id
            }), 201
            
        elif request.method == 'PUT':
            # Update an existing diet plan
            data = request.get_json()
            
            # Validate plan_id is provided
            if 'plan_id' not in data:
                return jsonify({'error': 'plan_id is required'}), 400
                
            # Find the diet plan
            diet_plan = DietPlan.query.get(data['plan_id'])
            if not diet_plan:
                return jsonify({'error': 'Diet plan not found'}), 404
                
            # Update fields
            if 'title' in data:
                diet_plan.title = data['title']
            if 'description' in data:
                diet_plan.description = data['description']
            if 'calories' in data:
                diet_plan.calories = data['calories']
            if 'protein' in data:
                diet_plan.protein = data['protein']
            if 'carbs' in data:
                diet_plan.carbs = data['carbs']
            if 'fat' in data:
                diet_plan.fat = data['fat']
            
            db.session.commit()
            
            return jsonify({
                'message': 'Diet plan updated successfully'
            }), 200
            
        elif request.method == 'DELETE':
            # Delete a diet plan
            plan_id = request.args.get('plan_id', type=int)
            if not plan_id:
                return jsonify({'error': 'plan_id is required'}), 400
                
            # Find the diet plan
            diet_plan = DietPlan.query.get(plan_id)
            if not diet_plan:
                return jsonify({'error': 'Diet plan not found'}), 404
                
            # First, delete any assignments of this diet plan
            student_diet_plans = StudentDietPlan.query.filter_by(diet_plan_id=plan_id).all()
            for sdp in student_diet_plans:
                db.session.delete(sdp)
                
            # Then delete the diet plan
            db.session.delete(diet_plan)
            db.session.commit()
            
            return jsonify({
                'message': 'Diet plan deleted successfully'
            }), 200
    
    except Exception as e:
        print(f"Manage diet plans error: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/assign-diet', methods=['POST'])
@trainer_required
def assign_diet_plan():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ('student_id', 'diet_plan_id')):
            return jsonify({'error': 'Missing required fields (student_id, diet_plan_id)'}), 400
            
        # Verify the student exists
        student = User.query.filter_by(id=data['student_id'], role='student').first()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
            
        # Verify the diet plan exists
        diet_plan = DietPlan.query.get(data['diet_plan_id'])
        if not diet_plan:
            return jsonify({'error': 'Diet plan not found'}), 404
            
        # Check if student already has this diet plan
        existing_assignment = StudentDietPlan.query.filter_by(
            student_id=data['student_id'], 
            diet_plan_id=data['diet_plan_id']
        ).first()
        
        if existing_assignment:
            # Update status if needed
            if 'status' in data:
                existing_assignment.status = data['status']
            if 'notes' in data:
                existing_assignment.notes = data['notes']
                
            db.session.commit()
            return jsonify({'message': 'Diet plan assignment updated'}), 200
        
        # Create new assignment
        student_diet = StudentDietPlan(
            student_id=data['student_id'],
            diet_plan_id=data['diet_plan_id'],
            assigned_by=current_user['id'],
            status=data.get('status', 'active'),
            notes=data.get('notes', ''),
            assigned_at=datetime.utcnow()
        )
        
        db.session.add(student_diet)
        db.session.commit()
        
        return jsonify({
            'message': 'Diet plan assigned successfully',
            'assignment_id': student_diet.id
        }), 201
    
    except Exception as e:
        print(f"Assign diet plan error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/student-diet-plans', methods=['GET'])
@trainer_required
def get_student_diet_plans():
    try:
        student_id = request.args.get('student_id')
        
        query = StudentDietPlan.query
        if student_id:
            query = query.filter_by(student_id=student_id)
            
        assignments = query.all()
        
        result = []
        for assignment in assignments:
            diet_plan = DietPlan.query.get(assignment.diet_plan_id)
            student = User.query.get(assignment.student_id)
            trainer = User.query.get(assignment.assigned_by)
            
            if diet_plan and student:
                result.append({
                    'id': assignment.id,
                    'student_id': student.id,
                    'student_name': student.name,
                    'diet_plan_id': diet_plan.id,
                    'diet_plan_title': diet_plan.title,
                    'diet_description': diet_plan.description,
                    'calories': diet_plan.calories,
                    'protein': diet_plan.protein,
                    'carbs': diet_plan.carbs,
                    'fat': diet_plan.fat,
                    'status': assignment.status,
                    'notes': assignment.notes,
                    'assigned_by': trainer.name if trainer else 'Unknown',
                    'assigned_at': assignment.assigned_at.isoformat() if assignment.assigned_at else None
                })
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Get student diet plans error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/schedule', methods=['GET', 'POST', 'PUT', 'DELETE'])
@trainer_required
def manage_schedule():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get schedules created by this trainer
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            
            # Auto-create trainer profile if it doesn't exist
            if not trainer:
                trainer = Trainer(
                    user_id=current_user['id'],
                    specialization="General Training",
                    experience_years=1,
                    bio="Trainer profile"
                )
                db.session.add(trainer)
                db.session.commit()
                print(f"Created trainer profile for user {current_user['id']}")
                
            # Get all schedules associated with this trainer
            schedules = Schedule.query.filter_by(trainer_id=trainer.id).all()
            
            # Get schedules by student filter if provided
            student_id = request.args.get('student_id', type=int)
            if student_id:
                schedules = [s for s in schedules if s.user_id == student_id]
            
            result = []
            for schedule in schedules:
                student = User.query.get(schedule.user_id)
                result.append({
                    'id': schedule.id,
                    'title': schedule.title,
                    'description': schedule.description,
                    'student_id': schedule.user_id,
                    'student_name': student.name if student else 'Unknown',
                    'scheduled_time': schedule.scheduled_time.isoformat() if schedule.scheduled_time else None,
                    'location': schedule.location,
                    'created_at': schedule.created_at.isoformat() if schedule.created_at else None
                })
                
            return jsonify(result), 200
            
        elif request.method == 'POST':
            # Create a new schedule
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ('title', 'student_id', 'scheduled_time')):
                return jsonify({'error': 'Missing required fields (title, student_id, scheduled_time)'}), 400
                
            # Verify the student exists
            student = User.query.filter_by(id=data['student_id'], role='student').first()
            if not student:
                return jsonify({'error': 'Student not found'}), 404
                
            # Get the trainer ID - auto-create if needed
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            if not trainer:
                trainer = Trainer(
                    user_id=current_user['id'],
                    specialization="General Training",
                    experience_years=1,
                    bio="Trainer profile"
                )
                db.session.add(trainer)
                db.session.commit()
                
            # Parse the scheduled time
            try:
                scheduled_time = datetime.fromisoformat(data['scheduled_time'])
            except ValueError:
                return jsonify({'error': 'Invalid date format for scheduled_time, use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
                
            # Create the schedule
            new_schedule = Schedule(
                title=data['title'],
                description=data.get('description', ''),
                user_id=data['student_id'],
                trainer_id=trainer.id,
                scheduled_time=scheduled_time,
                location=data.get('location', 'Main Gym'),
                created_at=datetime.utcnow()
            )
            
            db.session.add(new_schedule)
            db.session.commit()
            
            return jsonify({
                'message': 'Schedule created successfully',
                'schedule_id': new_schedule.id
            }), 201
            
        elif request.method == 'PUT':
            # Update an existing schedule
            data = request.get_json()
            
            # Validate schedule_id is provided
            if 'schedule_id' not in data:
                return jsonify({'error': 'schedule_id is required'}), 400
                
            # Find the schedule
            schedule = Schedule.query.get(data['schedule_id'])
            if not schedule:
                return jsonify({'error': 'Schedule not found'}), 404
                
            # Get the trainer ID - auto-create if needed
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            if not trainer:
                trainer = Trainer(
                    user_id=current_user['id'],
                    specialization="General Training",
                    experience_years=1,
                    bio="Trainer profile"
                )
                db.session.add(trainer)
                db.session.commit()
            elif schedule.trainer_id != trainer.id:
                return jsonify({'error': 'Not authorized to update this schedule'}), 403
                
            # Update fields
            if 'title' in data:
                schedule.title = data['title']
            if 'description' in data:
                schedule.description = data['description']
            if 'location' in data:
                schedule.location = data['location']
            if 'scheduled_time' in data:
                try:
                    schedule.scheduled_time = datetime.fromisoformat(data['scheduled_time'])
                except ValueError:
                    return jsonify({'error': 'Invalid date format for scheduled_time, use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
            
            db.session.commit()
            
            return jsonify({
                'message': 'Schedule updated successfully'
            }), 200
            
        elif request.method == 'DELETE':
            # Delete a schedule
            schedule_id = request.args.get('schedule_id', type=int)
            if not schedule_id:
                return jsonify({'error': 'schedule_id is required'}), 400
                
            # Find the schedule
            schedule = Schedule.query.get(schedule_id)
            if not schedule:
                return jsonify({'error': 'Schedule not found'}), 404
                
            # Get or create the trainer
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            if not trainer:
                trainer = Trainer(
                    user_id=current_user['id'],
                    specialization="General Training",
                    experience_years=1,
                    bio="Trainer profile"
                )
                db.session.add(trainer)
                db.session.commit()
            elif schedule.trainer_id != trainer.id:
                return jsonify({'error': 'Not authorized to delete this schedule'}), 403
                
            db.session.delete(schedule)
            db.session.commit()
            
            return jsonify({
                'message': 'Schedule deleted successfully'
            }), 200
    
    except Exception as e:
        print(f"Manage schedule error: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/students-for-scheduling', methods=['GET'])
@trainer_required
def get_students_for_scheduling():
    try:
        # Get all students
        students = User.query.filter_by(role='student').all()
        
        result = []
        for student in students:
            result.append({
                'id': student.id,
                'name': student.name,
                'email': student.email
            })
            
        return jsonify(result), 200
    except Exception as e:
        print(f"Get students for scheduling error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/students-for-assignment', methods=['GET'])
@trainer_required
def get_students_for_assignment():
    try:
        # Get all students
        students = User.query.filter_by(role='student').all()
        
        result = []
        for student in students:
            result.append({
                'id': student.id,
                'name': student.name,
                'email': student.email
            })
            
        return jsonify(result), 200
    except Exception as e:
        print(f"Get students for assignment error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/requests', methods=['GET'])
@trainer_required
def get_trainer_requests():
    try:
        current_user = get_jwt_identity()
        
        # In a real app, this would retrieve membership requests, workout plan change requests, etc.
        # For now, just return mock data for the dashboard
        result = {
            'pending': 7,
            'approved': 18,
            'rejected': 3,
            'requests': [
                {
                    'id': 1,
                    'type': 'membership',
                    'student_name': 'Alex Johnson',
                    'details': 'New membership request',
                    'status': 'pending',
                    'created_at': datetime.utcnow().isoformat()
                },
                {
                    'id': 2,
                    'type': 'workout_change',
                    'student_name': 'Maria Garcia',
                    'details': 'Requesting change to workout plan due to injury',
                    'status': 'pending',
                    'created_at': datetime.utcnow().isoformat()
                },
                {
                    'id': 3,
                    'type': 'diet_modification',
                    'student_name': 'James Wilson',
                    'details': 'Requesting diet plan modification',
                    'status': 'pending',
                    'created_at': datetime.utcnow().isoformat()
                }
            ]
        }
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Get trainer requests error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/workout-sessions', methods=['GET', 'POST', 'PUT', 'DELETE'])
@trainer_required
def manage_workout_sessions():
    try:
        current_user = get_jwt_identity()
        
        if request.method == 'GET':
            # Get workout sessions created by this trainer
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            
            # Auto-create trainer profile if it doesn't exist
            if not trainer:
                trainer = Trainer(
                    user_id=current_user['id'],
                    specialization="General Training",
                    experience_years=1,
                    bio="Trainer profile"
                )
                db.session.add(trainer)
                db.session.commit()
                print(f"Created trainer profile for user {current_user['id']}")
            
            # Get all workout sessions associated with this trainer
            # In a real app, you would query a WorkoutSession model
            # For now, we'll mock some data
            tomorrow = datetime.utcnow() + timedelta(days=1)
            
            mock_sessions = [
                {
                    'id': 1,
                    'title': 'Full Body Workout',
                    'description': 'Comprehensive workout targeting all major muscle groups',
                    'student_id': 14,
                    'student_name': 'student',
                    'scheduled_time': datetime.utcnow().isoformat(),
                    'duration': 60,  # minutes
                    'location': 'Main Gym',
                    'status': 'completed',
                    'notes': 'Student performed well, increase weights next time',
                    'created_at': datetime.utcnow().isoformat()
                },
                {
                    'id': 2,
                    'title': 'Cardio Session',
                    'description': 'High intensity cardio workout',
                    'student_id': 16,
                    'student_name': 'sreeekumar',
                    'scheduled_time': tomorrow.isoformat(),
                    'duration': 45,  # minutes
                    'location': 'Track Field',
                    'status': 'scheduled',
                    'notes': 'Focus on improving endurance',
                    'created_at': datetime.utcnow().isoformat()
                }
            ]
            
            # Filter by student if provided
            student_id = request.args.get('student_id', type=int)
            if student_id:
                mock_sessions = [s for s in mock_sessions if s['student_id'] == student_id]
                
            return jsonify(mock_sessions), 200
            
        elif request.method == 'POST':
            # Create a new workout session
            data = request.get_json()
            
            # Validate required fields
            if not all(k in data for k in ('title', 'student_id', 'scheduled_time')):
                return jsonify({'error': 'Missing required fields (title, student_id, scheduled_time)'}), 400
                
            # Verify the student exists
            student = User.query.filter_by(id=data['student_id'], role='student').first()
            if not student:
                return jsonify({'error': 'Student not found'}), 404
                
            # Get the trainer ID - auto-create if needed
            trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
            if not trainer:
                trainer = Trainer(
                    user_id=current_user['id'],
                    specialization="General Training",
                    experience_years=1,
                    bio="Trainer profile"
                )
                db.session.add(trainer)
                db.session.commit()
                
            # Mock creating a new workout session (in a real app, you would save to database)
            mock_response = {
                'message': 'Workout session created successfully',
                'session_id': 3  # Mock ID
            }
            
            return jsonify(mock_response), 201
            
        elif request.method == 'PUT':
            # Update an existing workout session
            data = request.get_json()
            
            # Validate session_id is provided
            if 'session_id' not in data:
                return jsonify({'error': 'session_id is required'}), 400
                
            # Mock finding and updating the session
            # In a real app, you would update the database record
            
            return jsonify({
                'message': 'Workout session updated successfully'
            }), 200
            
        elif request.method == 'DELETE':
            # Delete a workout session
            session_id = request.args.get('session_id', type=int)
            if not session_id:
                return jsonify({'error': 'session_id is required'}), 400
                
            # Mock deleting the session
            # In a real app, you would delete from the database
            
            return jsonify({
                'message': 'Workout session deleted successfully'
            }), 200
    
    except Exception as e:
        print(f"Manage workout sessions error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
