
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, TrainingVideo, DietPlan, Equipment, Trainer, StudentProfile

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/profile', methods=['GET', 'POST'])
@jwt_required()
def staff_profile():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff' and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get trainer profile if exists
        trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
        
        if not trainer:
            return jsonify({'message': 'Trainer profile not created yet'}), 404
            
        return jsonify({
            'specialization': trainer.specialization,
            'experience_years': trainer.experience_years,
            'bio': trainer.bio,
            'schedule': trainer.schedule
        }), 200
    
    elif request.method == 'POST':
        # Create or update trainer profile
        data = request.get_json()
        trainer = Trainer.query.filter_by(user_id=current_user['id']).first()
        
        if not trainer:
            trainer = Trainer(user_id=current_user['id'])
            db.session.add(trainer)
        
        # Update trainer fields
        if 'specialization' in data:
            trainer.specialization = data['specialization']
        if 'experience_years' in data:
            trainer.experience_years = data['experience_years']
        if 'bio' in data:
            trainer.bio = data['bio']
        if 'schedule' in data:
            trainer.schedule = data['schedule']
            
        db.session.commit()
        return jsonify({'message': 'Trainer profile updated successfully'}), 200

@staff_bp.route('/videos', methods=['GET', 'POST'])
@jwt_required()
def manage_videos():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff' and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get all videos or filter by uploader
        videos = TrainingVideo.query.filter_by(uploaded_by=current_user['id']).all()
        
        result = [{
            'id': video.id,
            'title': video.title,
            'description': video.description,
            'video_url': video.video_url,
            'category': video.category,
            'created_at': video.created_at
        } for video in videos]
        
        return jsonify(result), 200
    
    elif request.method == 'POST':
        # Add new video
        data = request.get_json()
        
        if not all(k in data for k in ['title', 'video_url', 'category']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        new_video = TrainingVideo(
            title=data['title'],
            description=data.get('description', ''),
            video_url=data['video_url'],
            category=data['category'],
            uploaded_by=current_user['id']
        )
        
        db.session.add(new_video)
        db.session.commit()
        
        return jsonify({'message': 'Video added successfully', 'id': new_video.id}), 201

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

@staff_bp.route('/diet-plans', methods=['GET', 'POST'])
@jwt_required()
def manage_diet_plans():
    current_user = get_jwt_identity()
    
    # Verify user is staff
    if current_user['role'] != 'staff' and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get all diet plans created by this staff
        plans = DietPlan.query.filter_by(created_by=current_user['id']).all()
        
        result = [{
            'id': plan.id,
            'title': plan.title,
            'description': plan.description,
            'calories': plan.calories,
            'protein': plan.protein,
            'carbs': plan.carbs,
            'fat': plan.fat,
            'created_at': plan.created_at
        } for plan in plans]
        
        return jsonify(result), 200
    
    elif request.method == 'POST':
        # Add new diet plan
        data = request.get_json()
        
        if not all(k in data for k in ['title']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        new_plan = DietPlan(
            title=data['title'],
            description=data.get('description', ''),
            calories=data.get('calories'),
            protein=data.get('protein'),
            carbs=data.get('carbs'),
            fat=data.get('fat'),
            created_by=current_user['id']
        )
        
        db.session.add(new_plan)
        db.session.commit()
        
        return jsonify({'message': 'Diet plan added successfully', 'id': new_plan.id}), 201

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
                'height': profile.height,
                'weight': profile.weight,
                'fitness_goal': profile.fitness_goal,
                'admission_date': profile.admission_date
            }
        
        result.append(student_data)
    
    return jsonify(result), 200
