
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User, Equipment, DietPlan, TrainingVideo, StudentProfile
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

# Create default admin user if it doesn't exist
@auth_bp.route('/create-default-admin', methods=['GET'])
def create_default_admin():
    admin = User.query.filter_by(email="admin@fitwell.com").first()
    if not admin:
        default_admin = User(
            name="Admin",
            email="admin@fitwell.com",
            role="admin"
        )
        default_admin.set_password("admin")
        
        db.session.add(default_admin)
        db.session.commit()
        return jsonify({'message': 'Default admin created successfully'}), 201
    return jsonify({'message': 'Default admin already exists'}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if required fields exist
    if not all(k in data for k in ['name', 'email', 'password', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Validate role
    if data['role'] not in ['student', 'staff', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        role=data['role']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create access token with role included
    access_token = create_access_token(
        identity={
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        },
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role
    }), 200

# Equipment routes
@auth_bp.route('/equipment', methods=['GET'])
@jwt_required()
def get_equipment():
    equipment = Equipment.query.all()
    
    equipment_list = []
    for item in equipment:
        equipment_list.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'quantity': item.quantity,
            'condition': item.condition,
            'purchase_date': item.purchase_date.isoformat() if item.purchase_date else None,
            'last_maintenance': item.last_maintenance.isoformat() if item.last_maintenance else None
        })
    
    return jsonify(equipment_list), 200

# Diet plans routes
@auth_bp.route('/diet-plans', methods=['GET'])
@jwt_required()
def get_diet_plans():
    diet_plans = DietPlan.query.all()
    
    diet_plans_list = []
    for plan in diet_plans:
        diet_plans_list.append({
            'id': plan.id,
            'title': plan.title,
            'description': plan.description,
            'calories': plan.calories,
            'protein': plan.protein,
            'carbs': plan.carbs,
            'fat': plan.fat,
            'created_by': plan.created_by,
            'created_at': plan.created_at.isoformat()
        })
    
    return jsonify(diet_plans_list), 200

# Training videos routes
@auth_bp.route('/training-videos', methods=['GET'])
@jwt_required()
def get_training_videos():
    videos = TrainingVideo.query.all()
    
    videos_list = []
    for video in videos:
        videos_list.append({
            'id': video.id,
            'title': video.title,
            'description': video.description,
            'video_url': video.video_url,
            'category': video.category,
            'uploaded_by': video.uploaded_by,
            'created_at': video.created_at.isoformat()
        })
    
    return jsonify(videos_list), 200

