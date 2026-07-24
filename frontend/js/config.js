// Production/Development API Base URL Router
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001'
  : 'https://travel-blog-backend-o0aw.onrender.com'; // Live Render Backend Service URL
