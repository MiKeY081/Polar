import type { AdvancedMetrics, TestResult, UserProfile } from "@/types";


const STORAGE_KEY = 'neurometric_data';

const defaultProfile: UserProfile = {
  name: 'Guest User',
  results: [],
};

export const getProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultProfile;
  } catch (error) {
    console.error("Failed to load profile from storage:", error);
    return defaultProfile;
  }
};

export const saveResult = (result: TestResult): UserProfile => {
  try {
    const profile = getProfile();
    const newProfile = {
      ...profile,
      results: [...profile.results, result]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  } catch (error) {
    console.error("Failed to save result:", error);
    return getProfile();
  }
};

export const saveMetrics = (metrics: AdvancedMetrics): UserProfile => {
  try {
    const profile = getProfile();
    const newProfile = {
      ...profile,
      latestMetrics: metrics
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  } catch (error) {
    console.error("Failed to save metrics:", error);
    return getProfile();
  }
};

export const clearData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
};