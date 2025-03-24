from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User
from werkzeug.security import check_password_hash
from datetime import timedelta, datetime
import traceback
import logging

auth_bp = Blueprint('auth', __name__)

logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['name', 'email', 'password', 'role']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
            
        # Validate role
        valid_roles = ['student', 'staff', 'trainer', 'admin']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400
            
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            role=data['role'],
            gender=data.get('gender'),
            blood_group=data.get('blood_group'),
            height=data.get('height'),
            weight=data.get('weight'),
            payment_method=data.get('payment_method')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity={'id': new_user.id, 'role': new_user.role},
            expires_delta=timedelta(days=1)
        )
        
        # Return user data and token
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email,
                'role': new_user.role
            }
        }), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(f"Received login data: {data}")  # Debug log
        
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        if 'email' not in data or 'password' not in data:
            print("Missing email or password")
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            print(f"User not found: {data['email']}")
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Verify password for demo accounts
        if (user.email == "admin@fitwell.com" and data['password'] == "admin") or \
           (user.email == "student@fitwell.com" and data['password'] == "student") or \
           (user.email == "staff@fitwell.com" and data['password'] == "staff") or \
           (user.email == "trainer@fitwell.com" and data['password'] == "trainer"):
            password_valid = True
            print(f"Demo account login: {user.email}")
        else:
            password_valid = user.check_password(data['password'])
            
        if not password_valid:
            print(f"Invalid password for user: {user.email}")
            return jsonify({'error': 'Invalid email or password'}), 401

        # Create access token
        access_token = create_access_token(
            identity={'id': user.id, 'role': user.role},
            expires_delta=timedelta(days=1)
        )
        
        print(f"Login successful for {user.email} with role {user.role}")
        
        # Ensure the complete response is returned correctly
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Authentication failed'}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user = get_jwt_identity()
        logger.info(f"Token verification request for user: {current_user}")
        
        # Get full user information
        user = User.query.get(current_user['id'])
        if not user:
            logger.warning(f"Token verification failed: User not found for id {current_user['id']}")
            return jsonify({'valid': False, 'error': 'User not found'}), 401
            
        logger.info(f"Token verification successful for user {user.email}")
        return jsonify({
            'valid': True,
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
        logger.error(f"Token verification error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'valid': False, 'error': str(e)}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
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
            'blood_group': user.blood_group,
            'height': user.height,
            'weight': user.weight
        }), 200
    except Exception as e:
        print(f"Get profile error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/test', methods=['GET'])
def test_route():
    try:
        return jsonify({
            'status': 'success',
            'message': 'Backend is running!',
            'timestamp': str(datetime.now())
        }), 200
    except Exception as e:
        print(f"Test route error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'}), 200
