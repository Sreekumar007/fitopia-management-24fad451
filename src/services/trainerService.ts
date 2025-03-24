import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set up axios instance with auth headers
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your connection.';
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || errorMessage;
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage
    });
  }
);

// Trainer profile
export const getTrainerProfile = async () => {
  try {
    const response = await apiClient.get('/trainer/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching trainer profile:', error);
    throw error;
  }
};

export const updateTrainerProfile = async (profileData) => {
  try {
    const response = await apiClient.post('/trainer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating trainer profile:', error);
    throw error;
  }
};

// Students
export const getStudents = async () => {
  try {
    const response = await apiClient.get('/trainer/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Training videos
export const getTrainerVideos = async () => {
  try {
    const response = await apiClient.get('/trainer/videos');
    return response.data;
  } catch (error) {
    console.error('Error fetching training videos:', error);
    throw error;
  }
};

export const uploadTrainingVideo = async (videoData) => {
  try {
    const response = await apiClient.post('/trainer/videos', videoData);
    return response.data;
  } catch (error) {
    console.error('Error uploading training video:', error);
    throw error;
  }
};

// Workout plans
export const getWorkoutPlans = async () => {
  try {
    const response = await apiClient.get('/trainer/workouts');
    return response.data;
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    throw error;
  }
};

export const createWorkoutPlan = async (workoutData) => {
  try {
    const response = await apiClient.post('/trainer/workouts', workoutData);
    return response.data;
  } catch (error) {
    console.error('Error creating workout plan:', error);
    throw error;
  }
};

// Diet plans
export const getDietPlans = async () => {
  try {
    const response = await apiClient.get('/trainer/diet-plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    throw error;
  }
};

export const createDietPlan = async (dietPlanData) => {
  try {
    const response = await apiClient.post('/trainer/diet-plans', dietPlanData);
    return response.data;
  } catch (error) {
    console.error('Error creating diet plan:', error);
    throw error;
  }
};

export const updateDietPlan = async (dietPlanData) => {
  try {
    const response = await apiClient.put('/trainer/diet-plans', dietPlanData);
    return response.data;
  } catch (error) {
    console.error('Error updating diet plan:', error);
    throw error;
  }
};

export const deleteDietPlan = async (planId) => {
  try {
    const response = await apiClient.delete(`/trainer/diet-plans?plan_id=${planId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting diet plan:', error);
    throw error;
  }
};

export const assignDietPlan = async (assignmentData) => {
  try {
    const response = await apiClient.post('/trainer/assign-diet', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error assigning diet plan:', error);
    throw error;
  }
};

export const getStudentDietPlans = async (studentId = null) => {
  try {
    const url = studentId ? `/trainer/student-diet-plans?student_id=${studentId}` : '/trainer/student-diet-plans';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student diet plans:', error);
    throw error;
  }
};

export const getStudentsForAssignment = async () => {
  try {
    const response = await apiClient.get('/trainer/students-for-assignment');
    return response.data;
  } catch (error) {
    console.error('Error fetching students for assignment:', error);
    throw error;
  }
};

// Schedule management
export const getTrainerSchedules = async (studentId = null) => {
  try {
    const url = studentId ? `/trainer/schedule?student_id=${studentId}` : '/trainer/schedule';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const response = await apiClient.post('/trainer/schedule', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

export const updateSchedule = async (scheduleData) => {
  try {
    const response = await apiClient.put('/trainer/schedule', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await apiClient.delete(`/trainer/schedule?schedule_id=${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

export const getStudentsForScheduling = async () => {
  try {
    const response = await apiClient.get('/trainer/students-for-scheduling');
    return response.data;
  } catch (error) {
    console.error('Error fetching students for scheduling:', error);
    throw error;
  }
}; 