import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import Dashboard from "../pages/Dashboard";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/registration/",
        formData
      );

      // Save tokens in localStorage
      localStorage.setItem("access", response.data.access_token || response.data.access);
      localStorage.setItem("refresh", response.data.refresh_token || response.data.refresh);

      // Redirect to dashboard or home page
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please check your inputs.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>
      <p>Create your account to begin your care journey.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: "20px",
          maxWidth: "400px",
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#2d3e50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
