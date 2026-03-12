const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  register: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  // User Profile
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Exam
  requestExam: async (domain: string) => {
    const response = await fetch(`${API_URL}/exam/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ domain }),
    });
    return response.json();
  },

  getExamStatus: async () => {
    const response = await fetch(`${API_URL}/exam/status`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  getQuestions: async (requestId: string) => {
    const response = await fetch(`${API_URL}/exam/questions/${requestId}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  saveAnswer: async (attemptId: string, questionId: string, answer: string) => {
    const response = await fetch(`${API_URL}/exam/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ attemptId, questionId, answer }),
    });
    return response.json();
  },

  submitExam: async (attemptId: string) => {
    const response = await fetch(`${API_URL}/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ attemptId }),
    });
    return response.json();
  },

  logViolation: async (attemptId: string, type: string, details: string) => {
    const response = await fetch(`${API_URL}/exam/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ attemptId, type, details }),
    });
    return response.json();
  },

  getResult: async (attemptId: string) => {
    const response = await fetch(`${API_URL}/exam/result/${attemptId}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  // Admin
  getAdminStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  getAdminRequests: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/requests?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  approveRequest: async (requestId: string, examAvailableAt?: string) => {
    const response = await fetch(`${API_URL}/admin/requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ action: 'approve', examAvailableAt }),
    });
    return response.json();
  },

  rejectRequest: async (requestId: string, reason: string) => {
    const response = await fetch(`${API_URL}/admin/requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
    });
    return response.json();
  },

  getCandidates: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/candidates?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  getCandidateDetails: async (candidateId: string) => {
    const response = await fetch(`${API_URL}/admin/candidates/${candidateId}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  deleteCandidate: async (candidateId: string) => {
    const response = await fetch(`${API_URL}/admin/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  getResults: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/results?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  // Exam Timing
  getExamTiming: async () => {
    const response = await fetch(`${API_URL}/admin/exam-timing`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  updateExamTiming: async (data: any) => {
    const response = await fetch(`${API_URL}/admin/exam-timing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  bulkScheduleExam: async (examAvailableAt: string) => {
    const response = await fetch(`${API_URL}/admin/exam/bulk-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ examAvailableAt }),
    });
    return response.json();
  },

  scheduleIndividualExam: async (requestId: string, examAvailableAt: string) => {
    const response = await fetch(`${API_URL}/admin/requests/${requestId}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ examAvailableAt }),
    });
    return response.json();
  },

  getResultDetails: async (attemptId: string) => {
    const response = await fetch(`${API_URL}/admin/results/${attemptId}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  getAdminQuestions: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/questions?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  addQuestion: async (data: any) => {
    const response = await fetch(`${API_URL}/admin/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateQuestion: async (questionId: string, data: any) => {
    const response = await fetch(`${API_URL}/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteQuestion: async (questionId: string) => {
    const response = await fetch(`${API_URL}/admin/questions/${questionId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  bulkUploadQuestions: async (questions: any[]) => {
    const response = await fetch(`${API_URL}/admin/questions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ questions }),
    });
    return response.json();
  },

  getCutoffs: async () => {
    const response = await fetch(`${API_URL}/admin/cutoffs`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  updateCutoff: async (domain: string, data: any) => {
    const response = await fetch(`${API_URL}/admin/cutoffs/${domain}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  exportResults: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/export?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.blob();
  },

  exportProof: async (attemptId: string) => {
    const response = await fetch(`${API_URL}/admin/export/${attemptId}`, {
      headers: { ...getAuthHeaders() },
    });
    return response.blob();
  }
};

export default api;
