import axios from 'axios';

// Create axios instance with default configuration
const axiosClient = axios.create({
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // You can add authentication tokens here
        const token = process.env.API_TOKEN;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        console.log(`Response received from: ${response.config.url}`, response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);

        // Handle common error cases
        if (error.response?.status === 401) {
            console.error('Unauthorized access');
        } else if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status >= 500) {
            console.error('Server error');
        }

        return Promise.reject(error);
    }
);

// Export the configured axios instance
export default axiosClient;
