// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Therapy from "./pages/Therapy";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

// const isAuthenticated = () => localStorage.getItem("access") !== null;

// const ProtectedRoute = ({ children }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" replace />;
// };

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}

        {/* Protected with nested layout */}
        <Route
          path="/"
          element={
            // <ProtectedRoute>
              <Layout />
            // </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="therapy" element={<Therapy />} />
          <Route path="resources" element={<Resources />} />
          <Route path="profile" element={<Profile />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
