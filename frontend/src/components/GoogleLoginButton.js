import React from "react";
import { googleLogin, setAuthToken } from "../api/auth";
import { GoogleLogin } from "@react-oauth/google";

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin(credentialResponse.credential);
      const { access, refresh } = res.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setAuthToken(access);
      alert("Google login successful!");
    } catch (err) {
      alert("Google login failed");
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Login Failed")} />;
};

export default GoogleLoginButton;
