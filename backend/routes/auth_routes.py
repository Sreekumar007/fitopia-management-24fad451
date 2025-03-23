
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from database import db
from models import User, Equipment, DietPlan, TrainingVideo
from datetime import timedelta
from middleware.auth_middleware import jwt_required_custom
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if required fields exist
        if not all(k in data for k in ['name', 'email', 'password', 'role']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            role=data['role'],
            gender=data.get('gender', ''),
            blood_group=data.get('blood_group', ''),
            height=data.get('height'),
            weight=data.get('weight'),
            payment_method=data.get('payment_method', '')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Simple validation
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 401
            
        if not user.check_password(password):
            return jsonify({'error': 'Invalid password'}), 401
        
        # Check role if provided
        role = data.get('role')
        if role and user.role != role:
            return jsonify({'error': f'This account is not registered as a {role}'}), 401
        
        # Create access token
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
                'role': user.role,
                'gender': user.gender,
                'blood_group': user.blood_group,
                'height': user.height,
                'weight': user.weight
            }
        }), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required_custom
def get_profile():
    try:
        current_user = get_jwt_identity()
        
        # Get full user information
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Return user info with additional fields
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'gender': user.gender,
            'blood_group': user.blood_group,
            'height': user.height,
            'weight': user.weight,
            'payment_method': user.payment_method
        }), 200
    except Exception as e:
        print(f"Profile error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

# Equipment routes
@auth_bp.route('/equipment', methods=['GET'])
@jwt_required_custom
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
@jwt_required_custom
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
@jwt_required_custom
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
