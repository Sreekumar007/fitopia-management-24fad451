
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, Equipment, Trainer

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    # Optional role filter
    role = request.args.get('role')
    
    query = User.query
    if role:
        query = query.filter_by(role=role)
        
    users = query.all()
    
    result = [{
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at
    } for user in users]
    
    return jsonify(result), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if request.method == 'PUT':
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data and data['role'] in ['student', 'staff', 'admin']:
            user.role = data['role']
        if 'password' in data:
            user.set_password(data['password'])
            
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200

@admin_bp.route('/equipment', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def manage_equipment():
    if request.method == 'GET':
        equipment_list = Equipment.query.all()
        
        result = [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'quantity': item.quantity,
            'condition': item.condition,
            'purchase_date': item.purchase_date,
            'last_maintenance': item.last_maintenance
        } for item in equipment_list]
        
        return jsonify(result), 200
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'quantity']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        new_equipment = Equipment(
            name=data['name'],
            description=data.get('description', ''),
            quantity=data['quantity'],
            condition=data.get('condition'),
            purchase_date=data.get('purchase_date'),
            last_maintenance=data.get('last_maintenance')
        )
        
        db.session.add(new_equipment)
        db.session.commit()
        
        return jsonify({'message': 'Equipment added successfully', 'id': new_equipment.id}), 201

@admin_bp.route('/equipment/<int:equipment_id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_equipment_item(equipment_id):
    equipment = Equipment.query.get(equipment_id)
    
    if not equipment:
        return jsonify({'error': 'Equipment not found'}), 404
    
    if request.method == 'PUT':
        data = request.get_json()
        
        if 'name' in data:
            equipment.name = data['name']
        if 'description' in data:
            equipment.description = data['description']
        if 'quantity' in data:
            equipment.quantity = data['quantity']
        if 'condition' in data:
            equipment.condition = data['condition']
        if 'purchase_date' in data:
            equipment.purchase_date = data['purchase_date']
        if 'last_maintenance' in data:
            equipment.last_maintenance = data['last_maintenance']
            
        db.session.commit()
        return jsonify({'message': 'Equipment updated successfully'}), 200
    
    elif request.method == 'DELETE':
        db.session.delete(equipment)
        db.session.commit()
        return jsonify({'message': 'Equipment deleted successfully'}), 200

@admin_bp.route('/trainers', methods=['GET'])
@jwt_required()
@admin_required
def get_all_trainers():
    trainers = Trainer.query.all()
    
    result = []
    for trainer in trainers:
        user_data = User.query.get(trainer.user_id)
        if user_data:
            result.append({
                'id': trainer.id,
                'user_id': trainer.user_id,
                'name': user_data.name,
                'email': user_data.email,
                'specialization': trainer.specialization,
                'experience_years': trainer.experience_years,
                'bio': trainer.bio,
                'schedule': trainer.schedule
            })
    
    return jsonify(result), 200

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_system_stats():
    # Get counts for dashboard stats
    student_count = User.query.filter_by(role='student').count()
    staff_count = User.query.filter_by(role='staff').count()
    admin_count = User.query.filter_by(role='admin').count()
    equipment_count = Equipment.query.count()
    
    return jsonify({
        'users': {
            'total': student_count + staff_count + admin_count,
            'students': student_count,
            'staff': staff_count,
            'admins': admin_count
        },
        'equipment': equipment_count
    }), 200
