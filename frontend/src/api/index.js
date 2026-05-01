import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const workspaceApi = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  addMember: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/members`, data),
  removeMember: (workspaceId, userId) => api.delete(`/workspaces/${workspaceId}/members/${userId}`),
};

export const ticketApi = {
  getAll: (workspaceId) => api.get(`/workspaces/${workspaceId}/tickets`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/tickets`, data),
  update: (workspaceId, ticketId, data) => api.patch(`/workspaces/${workspaceId}/tickets/${ticketId}`, data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};
