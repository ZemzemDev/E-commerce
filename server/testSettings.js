const axios = require('axios');

const testEndpoint = async () => {
    try {
        const { data } = await axios.get('http://localhost:5000/api/settings/hero-backgrounds');
        console.log('Success:', data);
    } catch (error) {
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data);
    }
};

testEndpoint();
