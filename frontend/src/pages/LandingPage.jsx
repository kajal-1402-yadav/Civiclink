import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';
import Symbol from '../assets/Symbol.png';

const LandingPage = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/login" className={styles.signInLink}>Sign In</Link>
        </nav>
      </header>
      
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <div className={styles.gridContainer}>
            <div className={styles.textSection}>
              <h1 className={styles.title}>
                <span className={styles.gradientText}>
                  CivicLink:<br />Empowering <br />Citizens, Enabling Changes
                </span>
              </h1>
              <p className={styles.description}>
                CivicLink is a platform that helps residents report and track community issues in real-time and connect with local authorities for timely resolutions.
              </p>
              <div className={styles.signupSection}>
                <h2 className={styles.signupTitle}>Create an Account</h2>
                <Link to="/register">
                  <button className={styles.signupButton}>
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
            
            <div className={styles.imageSection}>
              <img 
                alt="A woman using smartphone" 
                className={styles.mainImage}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4Ry6lzNZitapFIkHh6BAa2I8H6llbE9mapkq5Ic7VlIQ1jBivAlU5VRJAcFm6Wt6zHvqkODd8pl4Jko8l_qnlR_8WPZRLQi0CeqA0XdyEnw3U59ynZAtHYOrLGB1HDMzRsuOJBtXTwGGggG2VPD0Y6B86lObm9_ztMTB0dURY5Qt9iZuuqtiyUn86b49dE0Bh1CjpJIbtdC8DKTepsV8eOIQwUT5Y2Y_DqgZ5Z7G9Zdc2AUDDRNQlDJrxIQkj-RwE6QWDNrdg7A"
              />
              <div className={styles.iconContainer}>
                <div className={styles.iconCircle}>
                  <img src={Symbol} alt="CivicLink Logo" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
