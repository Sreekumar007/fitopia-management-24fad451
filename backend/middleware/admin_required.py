from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

def admin_required(fn):
    """
    A decorator to check if the current user has admin privileges
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Get the identity from the JWT token
        current_user = get_jwt_identity()
        
        # Check if the user exists and has admin role
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        # If user is admin, proceed with the original function
        return fn(*args, **kwargs)
    
    return wrapper 