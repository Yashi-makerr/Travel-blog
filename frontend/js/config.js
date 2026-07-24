// Production/Development API Base URL Router
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001'
  : 'https://travel-blog-backend-yashi.onrender.com'; // 🔴 REPLACE this URL with your actual Render Web Service URL after deployment
