import type { AdvancedMetrics, TestResult, UserProfile } from "@/types";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8001/api/v1";

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data as any)?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as T;
};

const request = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  return parseResponse<T>(response);
};

export const authApi = {
  login: async (email: string, password: string) => {
    return request<{ success: boolean; user: any; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (name: string, email: string, password: string) => {
    return request<{ success: boolean; user: any; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  logout: async () => request<{ success: boolean; message: string }>("/auth/logout", { method: "POST" }),
};

export const profileApi = {
  fetchProfile: async () => {
    return request<{ success: boolean; profile: UserProfile }>("/profile");
  },
  saveResult: async (result: TestResult) => {
    return request<{ success: boolean; profile: UserProfile }>("/profile/results", {
      method: "POST",
      body: JSON.stringify(result),
    });
  },
  saveMetrics: async (metrics: AdvancedMetrics) => {
    return request<{ success: boolean; profile: UserProfile }>("/profile/metrics", {
      method: "POST",
      body: JSON.stringify(metrics),
    });
  },
  clearData: async () => {
    return request<{ success: boolean; profile: UserProfile }>("/profile/data", {
      method: "DELETE",
    });
  },
};

export const getApiBase = () => API_BASE;
