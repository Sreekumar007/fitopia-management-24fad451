import { useState } from 'react';
import { toast } from 'sonner';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const fetchData = async (endpoint: string, options: RequestInit = {}) => {
    if (!token) {
      toast.error("Authentication token missing");
      throw new Error("Authentication token missing");
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch data from ${endpoint}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchData,
    API_URL
  };
} 