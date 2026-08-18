import api from './api';

const userService = {
  getDashboard: async () => {
    const { data } = await api.get('/users/dashboard');
    return data;
  },
  getMessages: async () => {
    const { data } = await api.get('/messages');
    return data;
  },
  markMessageRead: async (id) => {
    const { data } = await api.put('/messages/' + id + '/read');
    return data;
  },
};

export default userService;
