
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, TrainingVideo, WorkoutPlan, MedicalRecord
from middleware.auth_middleware import trainer_required
import traceback

trainer_bp = Blueprint('trainer', __name__)

@trainer_bp.route('/profile', methods=['GET', 'POST'])
@trainer_required
def trainer_profile():
    try:
        current_user = get_jwt_identity()
        
        # Get full user information
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Return user info
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'gender': user.gender,
            'specialization': user.trainer_profile.specialization if user.trainer_profile else None,
            'experience_years': user.trainer_profile.experience_years if user.trainer_profile else None,
            'bio': user.trainer_profile.bio if user.trainer_profile else None
        }), 200
    except Exception as e:
        print(f"Trainer profile error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

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
