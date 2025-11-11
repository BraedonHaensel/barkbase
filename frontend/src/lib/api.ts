import axios from 'axios';

// Axios instance to communicate with the backend API
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
});

export default api;
