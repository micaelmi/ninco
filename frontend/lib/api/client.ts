import axios from 'axios';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Clerk user ID
apiClient.interceptors.request.use(
  async (config) => {
    // For server-side requests
    if (typeof window === 'undefined') {
      const { userId } = await auth();
      if (userId) {
        config.headers['x-user-id'] = userId;
      }
    } else {
      // For client-side requests, we'll need to get the user ID differently
      // This will be handled by passing it explicitly or using a client-side hook
      const userId = (window as any).__CLERK_USER_ID__;
      if (userId) {
        config.headers['x-user-id'] = userId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.message;
      console.error('API Error:', message);
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Helper function to set user ID for client-side requests
export function setClientUserId(userId: string) {
  if (typeof window !== 'undefined') {
    (window as any).__CLERK_USER_ID__ = userId;
  }
}
