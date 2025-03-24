import api from './api';

// Define interfaces for the data shapes
export interface StaffProfile {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  gender: string;
  blood_group: string;
  height: number;
  weight: number;
}

export interface StaffStats {
  workoutsCompleted: number;
  attendance: string;
  sessionsScheduled: number;
  facultyMembers: number;
  participationRate: number;
}

export interface Activity {
  id: number;
  title: string;
  date: string;
  time: string;
  participants: number;
  location: string;
}

export interface DepartmentUpdate {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface FacultyMember {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  participation: string;
  joined_date: string;
}

export interface TrainingVideo {
  id: number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface DietPlan {
  id: number;
  title: string;
  description: string;
  target: string;
  meals: {
    name: string;
    items: string[];
    time: string;
  }[];
  created_by: string;
  created_at: string;
}

// Staff API service functions
const staffService = {
  // Profile management
  getProfile: async (): Promise<StaffProfile> => {
    const response = await api.get('staff/profile');
    return response;
  },

  updateProfile: async (profileData: Partial<StaffProfile>): Promise<StaffProfile> => {
    const response = await api.put('staff/profile', profileData);
    return response;
  },

  // Stats and metrics
  getStats: async (): Promise<StaffStats> => {
    const response = await api.get('staff/stats');
    return response;
  },

  // Activities and schedules
  getActivities: async (): Promise<Activity[]> => {
    const response = await api.get('staff/activities');
    return response;
  },

  addActivity: async (activityData: Omit<Activity, 'id'>): Promise<Activity> => {
    const response = await api.post('staff/activities', activityData);
    return response;
  },

  deleteActivity: async (activityId: number): Promise<void> => {
    await api.delete(`staff/activities/${activityId}`);
  },

  // Department management
  getDepartmentUpdates: async (): Promise<DepartmentUpdate[]> => {
    const response = await api.get('staff/updates');
    return response;
  },

  addDepartmentUpdate: async (updateData: Omit<DepartmentUpdate, 'id' | 'timestamp' | 'is_read'>): Promise<DepartmentUpdate> => {
    const response = await api.post('staff/updates', updateData);
    return response;
  },

  // Faculty management
  getFacultyMembers: async (): Promise<FacultyMember[]> => {
    const response = await api.get('staff/faculty');
    return response;
  },

  addFacultyMember: async (facultyData: { name: string; email: string; department: string; position: string }): Promise<FacultyMember> => {
    try {
      console.log('staffService.addFacultyMember called with:', facultyData);
      
      // Verify all required data is present
      if (!facultyData.name || !facultyData.email) {
        throw new Error('Missing required fields: name and email');
      }
      
      const response = await api.post('staff/faculty', facultyData);
      console.log('Faculty member added successfully:', response);
      
      return response;
    } catch (error: any) {
      console.error('staffService.addFacultyMember error:', error);
      throw error;
    }
  },

  // Training videos
  getVideos: async (): Promise<TrainingVideo[]> => {
    try {
      console.log('Fetching training videos');
      const response = await api.get('staff/videos');
      console.log('Videos response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  addVideo: async (videoData: Partial<TrainingVideo>): Promise<TrainingVideo> => {
    try {
      const response = await api.post('staff/videos', videoData);
      return response;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  },

  // Diet plans
  getDietPlans: async (): Promise<DietPlan[]> => {
    try {
      console.log('Fetching diet plans');
      const response = await api.get('staff/diet-plans');
      console.log('Diet plans response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      throw error;
    }
  },

  addDietPlan: async (dietPlanData: Partial<DietPlan>): Promise<DietPlan> => {
    try {
      const response = await api.post('staff/diet-plans', dietPlanData);
      return response;
    } catch (error) {
      console.error('Error adding diet plan:', error);
      throw error;
    }
  }
};

export default staffService; 