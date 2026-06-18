import api from './api';

export const getTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (data) => api.post('/transactions', data);
export const getUnpaidInvoices = () => api.get('/recouvrement/unpaid');
export const sendReminder = (invoiceId) => api.post(`/recouvrement/relance/${invoiceId}`);