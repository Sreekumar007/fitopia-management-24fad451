
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps
import traceback

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            
            if not current_user or 'role' not in current_user:
                return jsonify({'error': 'Invalid token payload'}), 401
                
            if current_user['role'] != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
                
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"Admin middleware error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': 'Authentication failed'}), 401
    return wrapper

def staff_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            
            if not current_user or 'role' not in current_user:
                return jsonify({'error': 'Invalid token payload'}), 401
                
            if current_user['role'] not in ['admin', 'staff']:
                return jsonify({'error': 'Staff access required'}), 403
                
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"Staff middleware error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': 'Authentication failed'}), 401
    return wrapper

def student_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            
            if not current_user or 'role' not in current_user:
                return jsonify({'error': 'Invalid token payload'}), 401
                
            if current_user['role'] not in ['admin', 'staff', 'student']:
                return jsonify({'error': 'Student access required'}), 403
                
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"Student middleware error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': 'Authentication failed'}), 401
    return wrapper

def jwt_required_custom(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            
            if not current_user or 'id' not in current_user:
                return jsonify({'error': 'Invalid token payload'}), 401
                
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"JWT middleware error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': 'Authentication failed'}), 401
    return wrapper
