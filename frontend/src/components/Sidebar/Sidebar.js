import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, isCollapsed, isMobile, onClose, onToggle }) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const mainNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/appointments", label: "Appointments", icon: "📅" },
    { path: "/contact-us", label: "Contact Us", icon: "💬" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${
        isMobile
          ? isOpen
            ? styles.mobileOpen
            : styles.mobileClosed
          : isCollapsed
          ? styles.collapsed
          : styles.expanded
      }`}>
        
        {/* Brand Section */}
        <div className={styles.brand}>
          <div className={styles.logoContainer}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <span className={styles.logoEmoji}>🧠</span>
              </div>
              <div className={styles.logoGlow}></div>
            </div>
            
            {/* Brand Text */}
            <div className={`${styles.brandText} ${
              isCollapsed && !isMobile ? styles.brandTextHidden : ''
            }`}>
              <span className={styles.brandName}>Numa</span>
              <span className={styles.brandSub}>Mindcare</span>
            </div>
          </div>

          {/* Collapse Toggle - Enhanced */}
          <button
            onClick={onToggle}
            className={`${styles.collapseToggle} ${
              isCollapsed ? styles.collapseToggleCollapsed : ''
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className={`${styles.toggleIcon} ${isCollapsed ? styles.toggleIconRotated : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" 
                      d={isCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
              </svg>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {mainNavItems.map((item, index) => (
              <li key={item.path} 
                  className={styles.navItem}
                  style={{ animationDelay: `${index * 100}ms` }}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? item.label : ""}
                >
                  {/* Background Gradient on Hover */}
                  <div className={`${styles.navBackground} ${
                    hoveredItem === item.path ? styles.navBackgroundVisible : ''
                  }`} />
                  
                  {/* Icon */}
                  <div className={styles.navIcon}>
                    <span className={styles.navEmoji}>{item.icon}</span>
                  </div>
                  
                  {/* Label */}
                  <div className={`${styles.navLabel} ${
                    isCollapsed && !isMobile ? styles.navLabelHidden : ''
                  }`}>
                    <span>{item.label}</span>
                  </div>
                  
                  {/* Active Indicator */}
                  <div className={styles.navIndicator} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions - Fixed Layout */}
        <div className={styles.bottomActions}>
          <div className={`${styles.actionButtons} ${
            isCollapsed && !isMobile ? styles.actionButtonsCollapsed : ''
          }`}>
            {/* Icon Buttons */}
            <div className={`${styles.iconButtons} ${
              isCollapsed && !isMobile ? styles.iconButtonsCollapsed : ''
            }`}>
              <button
                onClick={() => handleNavClick("/profile")}
                className={styles.iconBtn}
                title="Profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              <button
                onClick={() => handleNavClick("/settings")}
                className={styles.iconBtn}
                title="Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`${styles.logoutBtn} ${
                isCollapsed && !isMobile ? styles.logoutBtnCollapsed : ''
              }`}
              title="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className={`${styles.logoutText} ${
                isCollapsed && !isMobile ? styles.logoutTextHidden : ''
              }`}>
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
