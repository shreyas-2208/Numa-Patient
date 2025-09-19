import {jwtDecode} from "jwt-decode";

export const isTokenValid = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    // Check expiry
    return decoded.exp * 1000 > Date.now();
  } catch (err) {
    return false;
  }
};
