import api from './api';

export const getDocuments = (params) => {
  return api.get('/documents', { params });
};

export const getNextDocumentReference = (type) => {
  return api.get(`/documents/next-reference/${type}`);
};

export const createDocument = (data) => {
  return api.post('/documents', data);
};

export const updateDocument = (id, data) => {
  return api.put(`/documents/${id}`, data);
};

export const convertDocument = (id, targetType, data = {}) => {
  return api.post(`/documents/${id}/convert/${targetType}`, data);
};

export const deleteDocument = (id) => {
  return api.delete(`/documents/${id}`);
};

export const getDocumentPDF = (id, type) => {
  return api.get(`/documents/${id}/pdf`, {
    params: { type, _: Date.now() },
    responseType: 'blob',
  });
};
