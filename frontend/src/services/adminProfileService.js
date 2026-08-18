import api from './api';

const adminProfileService = {
  getProfile: async () => {
    const { data } = await api.get('/admin/profile');
    return data;
  },
  upsertProfile: async (formData) => {
    const { data } = await api.put('/admin/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default adminProfileService;
