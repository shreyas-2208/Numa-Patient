// src/components/Layout/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const Layout = () => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          <Outlet /> {/* 👈 this is where child routes (Dashboard, Appointments, etc.) render */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
