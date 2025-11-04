import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging.
// This interceptor is executed before every request is sent.
// This is useful for debugging and monitoring API calls and also completely optional.
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('Request data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
// This interceptor is executed before every response is received.
// This is useful for debugging and monitoring API calls and also completely optional.
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Get demo products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data.products;
  },

  // Create Klarna payment session
  createSession: (sessionData) => api.post('/create-session', sessionData),

  // Create order after authorization
  createOrder: (orderData) => api.post('/create-order', orderData),

  // Get order details
  getOrder: (orderId) => api.get(`/order/${orderId}`),

  // Get all orders (for demo purposes)
  getAllOrders: () => api.get('/orders'),
};

export default api;