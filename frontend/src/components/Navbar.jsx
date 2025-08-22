import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import Symbol from "../assets/Symbol.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const headerRef = useRef(null);

  
  const navSections = {
    home: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/all-issues', label: 'Community' },
    ],
    dashboard: [
      { to: '/dashboard', label: 'My Stats' },
      { to: '/my-issues', label: 'My Issues' },
      { to: '/report', label: 'Report Issue' },
      { to: '/user/info', label: 'Profile' },
    ],
    community: [
      { to: '/all-issues', label: 'Community Issues' },
      { to: '/analytics', label: 'Analytics' },
    ]
  };

  
  const getCurrentSection = () => {
    if (location.pathname.startsWith('/all-issues') || location.pathname.startsWith('/analytics')) {
      return 'community';
    }
    if (location.pathname === '/home') return 'home';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();
  const [clickedLink, setClickedLink] = useState(location.pathname);

  
  useEffect(() => {
    setClickedLink(location.pathname);
    setMenuOpen(false); 
  }, [location.pathname]);

  

  const handleBack = () => {
    if (currentSection === 'dashboard' || currentSection === 'community') {
      navigate('/home');
    } else {
      navigate(-1); 
    }
  };

  return (
    <>
      <header ref={headerRef} className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.iconContainer}>
            <div className={styles.iconCircle}>
              <img src={Symbol} alt="CivicLink Logo" />
            </div>
          </div>
          <div className={styles.navTitle}>CivicLink</div>
        </div>
        {/* Mobile menu toggle */}
        <button
          className={styles.menuToggle}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
        </button>
        
        <nav
          id="primary-navigation"
          ref={navRef}
          className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}
        >
          {navSections[currentSection].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={clickedLink === item.to ? styles.clickedNavLink : ''}
              onClick={() => setClickedLink(item.to)}
            >
              {item.label}
            </Link>
          ))}
          <button className={styles.backBtn} onClick={handleBack}>
            Back
          </button>
        </nav>
      </header>
    </>
  );
};

export default Navbar;

