
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors and directly return data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string, role?: string) => {
    const data = role ? { email, password, role } : { email, password };
    return api.post("/auth/login", data);
  },
  register: async (userData: any) => {
    return api.post("/auth/register", userData);
  },
  verifyToken: async () => {
    return api.get("/auth/verify");
  }
};

// Admin services
export const adminService = {
  getUsers: async (role?: string) => {
    const params = role ? { role } : {};
    return api.get("/admin/users", { params });
  },
  getUserById: async (id: number) => {
    return api.get(`/admin/users/${id}`);
  },
  updateUser: async (id: number, userData: any) => {
    return api.put(`/admin/users/${id}`, userData);
  },
  deleteUser: async (id: number) => {
    return api.delete(`/admin/users/${id}`);
  },
  getEquipment: async () => {
    return api.get("/admin/equipment");
  },
  addEquipment: async (equipmentData: any) => {
    return api.post("/admin/equipment", equipmentData);
  }
};

// Student services
export const studentService = {
  getProfile: async () => {
    return api.get("/student/profile");
  },
  getWorkouts: async () => {
    return api.get("/student/workouts");
  },
  getVideos: async () => {
    return api.get("/student/videos");
  }
};

// Staff services
export const staffService = {
  getProfile: async () => {
    return api.get("/staff/profile");
  },
  getDepartmentMembers: async () => {
    return api.get("/staff/department");
  }
};

// Trainer services
export const trainerService = {
  getProfile: async () => {
    return api.get("/trainer/profile");
  },
  getAssignedMembers: async () => {
    return api.get("/trainer/members");
  },
  addWorkoutPlan: async (planData: any) => {
    return api.post("/trainer/workout-plans", planData);
  },
  getVideos: async () => {
    return api.get("/trainer/videos");
  },
  addVideo: async (videoData: any) => {
    return api.post("/trainer/videos", videoData);
  },
  getMedicalRecords: async (userId?: number) => {
    const params = userId ? { user_id: userId } : {};
    return api.get("/trainer/medical-records", { params });
  },
  addMedicalRecord: async (recordData: any) => {
    return api.post("/trainer/medical-records", recordData);
  }
};

export default api;
