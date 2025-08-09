import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import Symbol from "../assets/Symbol.png";


const Navbar = () => {
   const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };
  return (
    <header className={styles.navbar}>
            <div className={styles.navLeft}>
              <div className={styles.iconContainer}>
                <div className={styles.iconCircle}>
                  <img src={Symbol} alt="CivicLink Logo" />
                </div>
              </div>
              <div className={styles.navTitle}>CivicLink</div>
            </div>
            <nav className={styles.navLinks}>
              <Link to="/home">Home</Link>
              <Link to="/my-issues">My Issues</Link>
              <Link to="/report">Report Issue</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/user/info/">Profile</Link>
             <button onClick={handleLogout} className={styles.logoutBtn}>
                         Logout
                       </button>
              
            </nav>
          </header>
  );
};

export default Navbar;
