import axios from 'axios';

const axiosInstanceAPI = axios.create({
  baseURL: import.meta.env.VITE_GP_EDV_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosInstanceAPI;