
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Define response types for better type safety
export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff" | "trainer" | "student";
    gender?: string;
    blood_group?: string;
    height?: number;
    weight?: number;
  };
  message?: string;
}

export interface TokenVerificationResponse {
  valid: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff" | "trainer" | "student";
    gender?: string;
    blood_group?: string;
    height?: number;
    weight?: number;
  };
}

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
  (response) => response.data, // This returns the response.data directly instead of the whole response
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth services - Note that these return direct data objects, not AxiosResponse objects
export const authService = {
  login: async (email: string, password: string, role?: string): Promise<AuthResponse> => {
    const data = role ? { email, password, role } : { email, password };
    return api.post<AuthResponse>("/auth/login", data);
  },
  register: async (userData: any): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/auth/register", userData);
  },
  verifyToken: async (): Promise<TokenVerificationResponse> => {
    return api.get<TokenVerificationResponse>("/auth/verify");
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
