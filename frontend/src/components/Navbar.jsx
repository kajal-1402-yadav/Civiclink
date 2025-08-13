import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import Symbol from "../assets/Symbol.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map pathnames to your link keys
  const pathToLink = {
    '/dashboard': 'dashboard',
    '/my-issues': 'my-issues',
    '/report': 'report',
    '/analytics': 'analytics',
    '/user/info/': 'profile',
  };

  const [clickedLink, setClickedLink] = useState(pathToLink[location.pathname] || null);

  // Update clickedLink when path changes (e.g. on page load or back/forward)
  useEffect(() => {
    setClickedLink(pathToLink[location.pathname] || null);
  }, [location.pathname]);

  const handleClick = (linkName) => {
    setClickedLink(linkName);
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
        <Link
          to="/dashboard"
          onClick={() => handleClick('dashboard')}
          className={clickedLink === 'dashboard' ? styles.clickedNavLink : ''}
        >
          My Stats
        </Link>
        <Link
          to="/my-issues"
          onClick={() => handleClick('my-issues')}
          className={clickedLink === 'my-issues' ? styles.clickedNavLink : ''}
        >
          My Issues
        </Link>
        <Link
          to="/report"
          onClick={() => handleClick('report')}
          className={clickedLink === 'report' ? styles.clickedNavLink : ''}
        >
          Report Issue
        </Link>
        <Link
          to="/analytics"
          onClick={() => handleClick('analytics')}
          className={clickedLink === 'analytics' ? styles.clickedNavLink : ''}
        >
          Analytics
        </Link>
        <Link
          to="/user/info/"
          onClick={() => handleClick('profile')}
          className={clickedLink === 'profile' ? styles.clickedNavLink : ''}
        >
          Profile
        </Link>

        <button className={styles.backBtn} onClick={() => navigate("/home")}>
          Back
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
