// src/components/Layout/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import styles from "./Layout.module.css"; // import CSS module

const Layout = () => {
  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Navbar />
        <div className={styles.pageContent}>
          <Outlet /> {/* This is where child routes render */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
