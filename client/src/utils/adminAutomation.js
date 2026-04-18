import axios from 'axios';
import { API_URL } from './api';

/**
 * Automation utility to fetch product data from the backend AI service.
 * Supports both Gemini AI and a sophisticated internal fallback brain.
 */
export const autoDetectProductData = async (name, token) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        };

        const { data } = await axios.post(`${API_URL}/products/detect`, { name }, config);
        
        return data; 
    } catch (error) {
        console.error('Automation Error:', error.message);
        throw error;
    }
};


