from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from middleware.admin_required import admin_required
from database import db
from models import User, Equipment, Trainer, StudentProfile, Attendance, DietPlan
from sqlalchemy import func
from datetime import datetime, timedelta
import traceback

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@admin_required
def admin_dashboard_stats():
    """Get admin dashboard stats"""
    try:
        # Get counts
        students_count = User.query.filter_by(role='student').count()
        trainers_count = User.query.filter_by(role='trainer').count()
        staff_count = User.query.filter_by(role='staff').count()
        equipment_count = Equipment.query.count()
        
        # Get recent members (last 10)
        recent_members = User.query.order_by(User.created_at.desc()).limit(10).all()
        recent_members_data = [{
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'join_date': user.created_at.strftime('%Y-%m-%d') if user.created_at else None
        } for user in recent_members]
        
        # Get today's attendance
        today = datetime.now().date()
        today_attendance = Attendance.query.filter(
            func.date(Attendance.date) == today
        ).all()
        
        today_attendance_data = [{
            'id': attendance.id,
            'user_id': attendance.user_id,
            'user_name': User.query.get(attendance.user_id).name if User.query.get(attendance.user_id) else 'Unknown',
            'check_in': attendance.check_in.strftime('%Y-%m-%dT%H:%M:%S') if attendance.check_in else None,
            'check_out': attendance.check_out.strftime('%Y-%m-%dT%H:%M:%S') if attendance.check_out else None
        } for attendance in today_attendance]
        
        # Get membership stats
        student_profiles = StudentProfile.query.all()
        active_count = sum(1 for profile in student_profiles if profile.membership_status == 'active')
        expired_count = sum(1 for profile in student_profiles if profile.membership_status == 'expired')
        pending_count = sum(1 for profile in student_profiles if profile.membership_status == 'pending')
        
        return jsonify({
            'total_students': students_count,
            'total_trainers': trainers_count,
            'total_staff': staff_count,
            'total_equipment': equipment_count,
            'recent_members': recent_members_data,
            'today_attendance': today_attendance_data,
            'membership_stats': {
                'active': active_count,
                'expired': expired_count,
                'pending': pending_count
            }
        }), 200
    except Exception as e:
        print(f"Error in admin dashboard stats: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to get dashboard stats: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users with pagination and optional role filter"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        role = request.args.get('role', None)
        
        query = User.query
        
        if role and role != 'all':
            query = query.filter_by(role=role)
            
        paginated_users = query.paginate(page=page, per_page=per_page)
        
        users_data = [{
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else None,
            'gender': user.gender,
            'blood_group': user.blood_group,
            'height': user.height,
            'weight': user.weight
        } for user in paginated_users.items]
        
        return jsonify({
            'users': users_data,
            'total': paginated_users.total,
            'pages': paginated_users.pages,
            'page': page
        }), 200
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to get users: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_user(user_id):
    """Get, update, or delete a specific user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if request.method == 'GET':
            user_data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else None,
                'gender': user.gender,
                'blood_group': user.blood_group,
                'height': user.height,
                'weight': user.weight
            }
            
            # If student, include profile info
            if user.role == 'student' and user.student_profile:
                user_data['profile'] = {
                    'membership_status': user.student_profile.membership_status,
                    'admission_date': user.student_profile.admission_date.strftime('%Y-%m-%d') if user.student_profile.admission_date else None,
                    'fitness_goal': user.student_profile.fitness_goal
                }
                
            return jsonify(user_data), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            
            # Update basic user details
            if 'name' in data:
                user.name = data['name']
            if 'email' in data:
                user.email = data['email']
            if 'role' in data:
                user.role = data['role']
            if 'gender' in data:
                user.gender = data['gender']
            if 'blood_group' in data:
                user.blood_group = data['blood_group']
            if 'height' in data:
                user.height = data['height']
            if 'weight' in data:
                user.weight = data['weight']
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                
            db.session.commit()
            
            return jsonify({'message': 'User updated successfully'}), 200
            
        elif request.method == 'DELETE':
            db.session.delete(user)
            db.session.commit()
            
            return jsonify({'message': 'User deleted successfully'}), 200
            
    except Exception as e:
        print(f"Error managing user: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Failed to manage user: {str(e)}'}), 500

@admin_bp.route('/equipment', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def manage_equipment():
    """Get all equipment or add new equipment"""
    try:
        if request.method == 'GET':
            equipment_list = Equipment.query.all()
            equipment_data = [{
                'id': eq.id,
                'name': eq.name,
                'description': eq.description,
                'quantity': eq.quantity,
                'condition': eq.condition,
                'purchase_date': eq.purchase_date.strftime('%Y-%m-%d') if eq.purchase_date else None,
                'last_maintenance': eq.last_maintenance.strftime('%Y-%m-%d') if eq.last_maintenance else None
            } for eq in equipment_list]
            
            return jsonify({'equipment': equipment_data}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            
            new_equipment = Equipment(
                name=data['name'],
                description=data.get('description', ''),
                quantity=data['quantity'],
                condition=data.get('condition', 'good'),
                purchase_date=datetime.strptime(data['purchase_date'], '%Y-%m-%d') if data.get('purchase_date') else None,
                last_maintenance=datetime.strptime(data['last_maintenance'], '%Y-%m-%d') if data.get('last_maintenance') else None
            )
            
            db.session.add(new_equipment)
            db.session.commit()
            
            return jsonify({
                'message': 'Equipment added successfully',
                'equipment': {
                    'id': new_equipment.id,
                    'name': new_equipment.name
                }
            }), 201
            
    except Exception as e:
        print(f"Error managing equipment: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Failed to manage equipment: {str(e)}'}), 500

@admin_bp.route('/equipment/<int:equipment_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_specific_equipment(equipment_id):
    """Get, update, or delete specific equipment"""
    try:
        equipment = Equipment.query.get(equipment_id)
        
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
            
        if request.method == 'GET':
            equipment_data = {
                'id': equipment.id,
                'name': equipment.name,
                'description': equipment.description,
                'quantity': equipment.quantity,
                'condition': equipment.condition,
                'purchase_date': equipment.purchase_date.strftime('%Y-%m-%d') if equipment.purchase_date else None,
                'last_maintenance': equipment.last_maintenance.strftime('%Y-%m-%d') if equipment.last_maintenance else None
            }
            
            return jsonify(equipment_data), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            
            if 'name' in data:
                equipment.name = data['name']
            if 'description' in data:
                equipment.description = data['description']
            if 'quantity' in data:
                equipment.quantity = data['quantity']
            if 'condition' in data:
                equipment.condition = data['condition']
            if 'purchase_date' in data and data['purchase_date']:
                equipment.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d')
            if 'last_maintenance' in data and data['last_maintenance']:
                equipment.last_maintenance = datetime.strptime(data['last_maintenance'], '%Y-%m-%d')
                
            db.session.commit()
            
            return jsonify({'message': 'Equipment updated successfully'}), 200
            
        elif request.method == 'DELETE':
            db.session.delete(equipment)
            db.session.commit()
            
            return jsonify({'message': 'Equipment deleted successfully'}), 200
            
    except Exception as e:
        print(f"Error managing specific equipment: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Failed to manage equipment: {str(e)}'}), 500

@admin_bp.route('/attendance', methods=['GET'])
@jwt_required()
@admin_required
def get_attendance():
    """Get attendance records with optional date and user filters"""
    try:
        start_date = request.args.get('start_date', None)
        end_date = request.args.get('end_date', None)
        user_id = request.args.get('user_id', None, type=int)
        
        query = Attendance.query
        
        if start_date:
            query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d'))
        if end_date:
            query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d'))
        if user_id:
            query = query.filter_by(user_id=user_id)
            
        attendance_list = query.order_by(Attendance.date.desc(), Attendance.check_in.desc()).all()
        
        attendance_data = []
        for attendance in attendance_list:
            user = User.query.get(attendance.user_id)
            if user:
                attendance_data.append({
                    'id': attendance.id,
                    'user_id': attendance.user_id,
                    'user_name': user.name,
                    'user_role': user.role,
                    'check_in': attendance.check_in.strftime('%Y-%m-%dT%H:%M:%S') if attendance.check_in else None,
                    'check_out': attendance.check_out.strftime('%Y-%m-%dT%H:%M:%S') if attendance.check_out else None,
                    'date': attendance.date.strftime('%Y-%m-%d')
                })
        
        return jsonify({'attendance': attendance_data}), 200
        
    except Exception as e:
        print(f"Error getting attendance: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to get attendance: {str(e)}'}), 500
