import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login, resetPassword, googleLogin } from "../api/auth"; // add resetPassword API
import { GoogleLogin } from "@react-oauth/google";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false); // for forgot password
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "", password1: "", password2: "" });
  const [message, setMessage] = useState("");

  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleForgotChange = (e) =>
    setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isForgot) {
        // Simple inline password reset flow
        if (forgotForm.password1 !== forgotForm.password2) {
          setMessage("❌ Passwords do not match");
          return;
        }
        res = await resetPassword(forgotForm); // call backend API
        setMessage(res.data.message || "Password reset successfully");
        setIsForgot(false);
        setForgotForm({ email: "", password1: "", password2: "" });
      } else if (isSignUp) {
        // Register flow
        if (registerForm.password1 !== registerForm.password2) {
          setMessage("❌ Passwords do not match");
          return;
        }
        const payload = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password1,
        };
        res = await register(payload);
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        navigate("/onboarding");
      } else {
        // Login flow
        res = await login(loginForm);
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        navigate("/dashboard");
      }
      setMessage("Success! Redirecting...");
    } catch (err) {
      setMessage(err.response?.data.error || "❌ Something went wrong");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await googleLogin(credentialResponse.credential);
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      setMessage("Google login success! Redirecting...");
      navigate(res.is_new_user ? "/onboarding" : "/dashboard");
    } catch (err) {
      setMessage("Google login failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>
        {isForgot ? "Reset Password" : isSignUp ? "Sign Up" : "Sign In"}
      </h2>
      <form onSubmit={handleSubmit}>
        {isForgot ? (
          <>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={forgotForm.email}
              onChange={handleForgotChange}
              required
            />
            <input
              name="password1"
              type="password"
              placeholder="New password"
              value={forgotForm.password1}
              onChange={handleForgotChange}
              required
            />
            <input
              name="password2"
              type="password"
              placeholder="Confirm new password"
              value={forgotForm.password2}
              onChange={handleForgotChange}
              required
            />
          </>
        ) : isSignUp ? (
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
            <p
              className="forgot-password"
              onClick={() => setIsForgot(true)}
            >
              Forgot Password?
            </p>
          </>
        )}
        <button type="submit">
          {isForgot ? "Reset Password" : isSignUp ? "Register" : "Login"}
        </button>
      </form>

      {!isForgot && (
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setMessage("Google login failed")}
        />
      )}

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
