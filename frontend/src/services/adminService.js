import api from './api';

const adminService = {

  getAllMembers: async ({ search = '', field = 'all', status = '', department = '', page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams();
    if (search)     params.append('search',     search);
    if (field)      params.append('field',      field);
    if (status)     params.append('status',     status);
    if (department) params.append('department', department);
    params.append('page',  page);
    params.append('limit', limit);
    const { data } = await api.get('/admin/members?' + params);
    return data;
  },

  createMember: async (payload) => {
    const { data } = await api.post('/admin/members', payload);
    return data;
  },

  getMemberRecords: async (id) => {
    const { data } = await api.get('/admin/members/' + id + '/records');
    return data;
  },

  toggleMemberStatus: async (id) => {
    const { data } = await api.put('/admin/members/' + id + '/toggle-status');
    return data;
  },

  adminDeleteRecord: async (id, reason) => {
    const { data } = await api.delete('/admin/records/' + id, { data: { reason } });
    return data;
  },

  sendMessage: async (payload) => {
    const { data } = await api.post('/messages', payload);
    return data;
  },

  getSentMessages: async () => {
    const { data } = await api.get('/messages/sent');
    return data;
  },
};

export default adminService;
