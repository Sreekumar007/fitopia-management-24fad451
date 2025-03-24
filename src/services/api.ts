
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

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  verifyToken: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  }
};

// Admin services
export const adminService = {
  getUsers: async (role?: string) => {
    const params = role ? { role } : {};
    const response = await api.get("/admin/users", { params });
    return response.data;
  },
  getUserById: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getEquipment: async () => {
    const response = await api.get("/admin/equipment");
    return response.data;
  },
  addEquipment: async (equipmentData: any) => {
    const response = await api.post("/admin/equipment", equipmentData);
    return response.data;
  }
};

// Student services
export const studentService = {
  getProfile: async () => {
    const response = await api.get("/student/profile");
    return response.data;
  },
  getWorkouts: async () => {
    const response = await api.get("/student/workouts");
    return response.data;
  },
  getVideos: async () => {
    const response = await api.get("/student/videos");
    return response.data;
  }
};

// Staff services
export const staffService = {
  getProfile: async () => {
    const response = await api.get("/staff/profile");
    return response.data;
  },
  getDepartmentMembers: async () => {
    const response = await api.get("/staff/department");
    return response.data;
  }
};

// Trainer services
export const trainerService = {
  getProfile: async () => {
    const response = await api.get("/trainer/profile");
    return response.data;
  },
  getAssignedMembers: async () => {
    const response = await api.get("/trainer/members");
    return response.data;
  },
  addWorkoutPlan: async (planData: any) => {
    const response = await api.post("/trainer/workout-plans", planData);
    return response.data;
  }
};

export default api;
