import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';
import Symbol from '../assets/Symbol.png';
import Civic from '../assets/Civic.png';

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
                src={Civic}
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
