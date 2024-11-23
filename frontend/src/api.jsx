import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: 'https://backend-4g4p.onrender.com:3000', // Replace with your API base URL
    timeout: 10000,                  // Set a timeout for requests (optional)
});

// Request Interceptor: Add Authorization Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
    (response) => response, // Pass successful responses
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data.message || error.response.statusText);
        } else {
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
