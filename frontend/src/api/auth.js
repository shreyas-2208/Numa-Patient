import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/";

export const register = (data) => {
  return axios.post(`${API_URL}api/users/register/`, data);
};

export const login = (data) => {
  return axios.post(`${API_URL}api/users/login/`, data);
};

export const googleLogin = async (token) => {
  const res = await axios.post(`${API_URL}api/users/google-login/`, { token });
  return res.data;
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};
