import React from "react";
import styles from "./Sidebar.module.css";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.logo}>NUMA Care</h2>
      <ul>
        {/* <li><NavLink to="/register" className={({ isActive }) => (isActive ? styles.active : "")}>Register</NavLink></li>
        <li><NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : "")}>Login</NavLink></li>
        <li><NavLink to="/profile" className={({ isActive }) => (isActive ? styles.active : "")}>Profile</NavLink></li> */}
        <li><NavLink to="/profile" className={({ isActive }) => (isActive ? styles.active : "")}>Profile</NavLink></li>
        <li><NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : "")}>Dashboard</NavLink></li> 
        <li><NavLink to="/appointments" className={({ isActive }) => (isActive ? styles.active : "")}>Appointments</NavLink></li>
        <li><NavLink to="/therapy" className={({ isActive }) => (isActive ? styles.active : "")}>Therapy</NavLink></li>
        <li><NavLink to="/resources" className={({ isActive }) => (isActive ? styles.active : "")}>Resources</NavLink></li>
      </ul>
    </div>
  );
}

export default Sidebar;
