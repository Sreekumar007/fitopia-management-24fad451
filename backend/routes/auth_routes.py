
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

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
