// src/services/examService.js — FIXED: all filter params

import api from './api';

const examService = {

  createExam: async (payload) => {
    const { data } = await api.post('/exams', payload);
    return data;
  },

  getMyExams: async ({ search='', field='all', role='', status='', date='', page=1, limit=10 } = {}) => {
    const params = new URLSearchParams();
    if (search)  params.append('search', search);
    if (field)   params.append('field',  field);
    if (role)    params.append('role',   role);
    if (status)  params.append('status', status);
    if (date)    params.append('date',   date);
    params.append('page',  page);
    params.append('limit', limit);
    const { data } = await api.get(`/exams?${params}`);
    return data;
  },

  getExamById: async (id) => {
    const { data } = await api.get(`/exams/${id}`);
    return data;
  },

  updateExam: async (id, payload) => {
    const { data } = await api.put(`/exams/${id}`, payload);
    return data;
  },

  deleteExam: async (id, reason) => {
    const { data } = await api.delete(`/exams/${id}`, { data: { reason } });
    return data;
  },
};

export default examService;
