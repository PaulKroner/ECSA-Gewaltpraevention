import axios from 'axios';

const axiosInstanceAPI = axios.create({
  baseURL: import.meta.env.VITE_GP_EDV_API_URL,
  withCredentials: false,
});

axiosInstanceAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstanceAPI;