// src/pages/AuthPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login, googleLogin } from "../api/auth";
import { GoogleLogin } from "@react-oauth/google";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isSignUp) {
        if (registerForm.password1 !== registerForm.password2) {
          setMessage("❌ Passwords do not match");
          return;
        }

        const payload = {
        //   username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password1, // backend expects `password`
        };        

        res = await register(payload);
        // Save access token
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);

        // Redirect to onboarding for all new users
        navigate("/onboarding");
      } else {
        // Login existing user
        res = await login(loginForm);
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        navigate("/dashboard"); 
      }
      
      setMessage("Success! Redirecting...");
    } catch (err) {
      if (err.response) {
        setMessage(
          err.response.data.detail ||
            err.response.data.error ||
            "❌ Something went wrong"
        );
      } else {
        setMessage("❌ Network error, please try again");
      }
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await googleLogin(credentialResponse.credential);
        localStorage.setItem("access_token", res.access);
        localStorage.setItem("refresh_token", res.refresh);
    //   localStorage.setItem("access_token", res.access || res.key);
      setMessage("Google login success! Redirecting...");
      navigate("/dashboard");
    } catch (err) {
      setMessage("Google login failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleSubmit}>
        {isSignUp ? (
          <>
            <input
              name="username"
              placeholder="Username"
              value={registerForm.username}
              onChange={handleRegisterChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={handleRegisterChange}
            />
            <input
              name="password1"
              type="password"
              placeholder="Password"
              value={registerForm.password1}
              onChange={handleRegisterChange}
            />
            <input
              name="password2"
              type="password"
              placeholder="Confirm Password"
              value={registerForm.password2}
              onChange={handleRegisterChange}
            />
          </>
        ) : (
          <>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
            />
          </>
        )}

        <button type="submit">{isSignUp ? "Register" : "Login"}</button>
      </form>

      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => setMessage("Google login failed")}
      />

      <p className="toggle-text" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </p>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AuthPage;
