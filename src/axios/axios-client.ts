import axios from 'axios';
import { Logger } from '../utils/logger.utils';

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

        Logger.debug(`Making ${config.method?.toUpperCase()} request to: ${config.url}`, 'AxiosClient');
        return config;
    },
    (error) => {
        Logger.error('Request interceptor error', error, 'AxiosClient');
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        Logger.debug(`Response received from: ${response.config.url} - Status: ${response.status}`, 'AxiosClient');
        return response;
    },
    (error) => {
        Logger.error(`Response error from ${error.config?.url} - Status: ${error.response?.status}`, error, 'AxiosClient');

        // Handle common error cases
        if (error.response?.status === 401) {
            Logger.error('Unauthorized access detected', undefined, 'AxiosClient');
        } else if (error.response?.status === 404) {
            Logger.error('Resource not found', undefined, 'AxiosClient');
        } else if (error.response?.status >= 500) {
            Logger.error('Server error detected', undefined, 'AxiosClient');
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
