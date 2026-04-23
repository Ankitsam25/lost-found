import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (data) => API.post('/register', data);
export const loginUser = (data) => API.post('/login', data);

// Item APIs
export const getAllItems = () => API.get('/items');
export const getItemById = (id) => API.get(`/items/${id}`);
export const addItem = (data) => API.post('/items', data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const searchItems = (params) => API.get('/items/search', { params });

export default API;
