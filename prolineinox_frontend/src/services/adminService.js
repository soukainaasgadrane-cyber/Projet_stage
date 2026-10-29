import api from './api';

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminCommercials = (params) => api.get('/admin/commercials', { params });
export const suspendCommercial = (id, reason) => api.patch(`/admin/commercials/${id}/suspend`, { reason });
export const blockCommercialWithReason = (id, reason) => api.patch(`/admin/commercials/${id}/block`, { reason });
export const activateCommercial = (id) => api.patch(`/admin/commercials/${id}/activate`);
export const getAdminClients = (params) => api.get('/admin/clients', { params });
export const getAdminQuotes = (params) => api.get('/admin/devis', { params });
export const getAdminOrders = (params) => api.get('/admin/commandes', { params });
export const getAdminInvoices = (params) => api.get('/admin/factures', { params });
export const getAdminPayments = (params) => api.get('/admin/paiements', { params });
export const getAdminActivities = (params) => api.get('/admin/activities', { params });
export const getAdminNotifications = () => api.get('/admin/notifications');
export const getAdminReports = (params) => api.get('/admin/reports', { params });
export const exportAdminReports = (params) => api.get('/admin/reports/export', { params, responseType: 'blob' });
export const getAdminProfile = () => api.get('/admin/profile');
export const updateAdminProfile = (data) => api.put('/admin/profile', data);
