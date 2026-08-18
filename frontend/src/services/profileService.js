import api from './api';

const profileService = {
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },
  upsertProfile: async (formData) => {
    const { data } = await api.put('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default profileService;
