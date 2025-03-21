
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, StudentProfile, TrainingVideo, DietPlan, Equipment, Trainer

student_bp = Blueprint('student', __name__)

@student_bp.route('/profile', methods=['GET', 'POST'])
@jwt_required()
def student_profile():
    current_user = get_jwt_identity()
    
    # Verify user is a student
    if current_user['role'] != 'student':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if request.method == 'GET':
        # Get student profile
        profile = StudentProfile.query.filter_by(user_id=current_user['id']).first()
        
        if not profile:
            return jsonify({'message': 'Profile not created yet'}), 404
            
        return jsonify({
            'age': profile.age,
            'height': profile.height,
            'weight': profile.weight,
            'fitness_goal': profile.fitness_goal,
            'medical_conditions': profile.medical_conditions,
            'admission_date': profile.admission_date
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

@student_bp.route('/videos', methods=['GET'])
@jwt_required()
def get_training_videos():
    current_user = get_jwt_identity()
    
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
        'created_at': video.created_at
    } for video in videos]
    
    return jsonify(result), 200

@student_bp.route('/diet-plans', methods=['GET'])
@jwt_required()
def get_diet_plans():
    diet_plans = DietPlan.query.all()
    
    result = [{
        'id': plan.id,
        'title': plan.title,
        'description': plan.description,
        'calories': plan.calories,
        'protein': plan.protein,
        'carbs': plan.carbs,
        'fat': plan.fat,
        'created_at': plan.created_at
    } for plan in diet_plans]
    
    return jsonify(result), 200

@student_bp.route('/equipment', methods=['GET'])
@jwt_required()
def get_equipment():
    equipment_list = Equipment.query.all()
    
    result = [{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'quantity': item.quantity,
        'condition': item.condition
    } for item in equipment_list]
    
    return jsonify(result), 200

@student_bp.route('/trainers', methods=['GET'])
@jwt_required()
def get_trainers():
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
