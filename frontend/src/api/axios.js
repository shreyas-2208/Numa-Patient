import axios from "axios";

const API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login/auth page
      window.location.href = "/auth"; // or "/login"
      // Optionally, you can also clear local storage tokens
      localStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
