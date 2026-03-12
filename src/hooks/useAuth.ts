import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  crn: string;
  urn: string;
  course: string;
  semester: string;
  city: string;
  applicationId: string;
  role: string;
}

export interface ExamRequest {
  _id: string;
  requestedDomain: string;
  requestStatus: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  examAvailableAt?: string;
}

export interface ExamAttempt {
  _id: string;
  domain: string;
  attemptNumber: number;
  status: 'in_progress' | 'completed' | 'disqualified';
  aptitudeScore: number;
  technicalScore: number;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  startedAt: string;
  submittedAt?: string;
  disqualified: boolean;
  disqualifiedReason?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getMe();
      if (response.user) {
        setUser(response.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true, user: response.user };
    }
    return { success: false, message: response.message };
  };

  const adminLogin = async (email: string, password: string) => {
    const response = await api.adminLogin(email, password);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true, user: response.user };
    }
    return { success: false, message: response.message };
  };

  const register = async (data: any) => {
    const response = await api.register(data);
    return response;
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return { 
    user, 
    loading, 
    login, 
    adminLogin, 
    register, 
    signOut, 
    isAdmin,
    refetch: fetchUser 
  };
}
