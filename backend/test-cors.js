// Quick test script to verify CORS is working
import axios from 'axios';

const testCORS = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/health', {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ CORS test passed!');
    console.log('Response:', response.data);
    console.log('CORS Headers:', response.headers);
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
};

testCORS();

