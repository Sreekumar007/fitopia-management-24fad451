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

// Student profile
export const getStudentProfile = async () => {
  try {
    const response = await apiClient.get('/student/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }
};

export const updateStudentProfile = async (profileData) => {
  try {
    const response = await apiClient.post('/student/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating student profile:', error);
    throw error;
  }
};

// Training videos
export const getTrainingVideos = async (category = '') => {
  try {
    const response = await apiClient.get(`/student/videos${category ? `?category=${category}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training videos:', error);
    throw error;
  }
};

// Diet plans
export const getDietPlans = async () => {
  try {
    const response = await apiClient.get('/student/diet-plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    throw error;
  }
};

// Workouts
export const getWorkouts = async () => {
  try {
    const response = await apiClient.get('/student/workouts');
    return response.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

// Attendance
export const getAttendance = async () => {
  try {
    const response = await apiClient.get('/student/attendance');
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const registerAttendance = async () => {
  try {
    const response = await apiClient.post('/student/attendance');
    return response.data;
  } catch (error) {
    console.error('Error registering attendance:', error);
    throw error;
  }
};

// Progress
export const getProgress = async () => {
  try {
    const response = await apiClient.get('/student/progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

// Notifications
export const getNotifications = async () => {
  try {
    const response = await apiClient.get('/student/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Schedule
export const getSchedule = async () => {
  try {
    const response = await apiClient.get('/student/schedule');
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
}; 