import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("access")));

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("access")));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <img src="/favicon.ico" alt="logo" className={styles.navbarLogo} />
        <span className={styles.navbarTitle}>CivicLink</span>
      </div>

      <div className={styles.navbarCenter}>
        <Link to="/" className={styles.navbarLink}>Home</Link>
        <Link to="/report" className={styles.navbarLink}>Report Issue</Link>
        <Link to="/issues-map" className={styles.navbarLink}> Map</Link>
        <Link to="/my-issues" className={styles.navbarLink}>MyIssues</Link>
        <Link to="/api/public-issues" className={styles.navbarLink}>Community</Link>
      </div>

      <div className={styles.navbarRight}>
        {isLoggedIn ? (
          <button onClick={handleLogout} className={`${styles.navbarBtn} ${styles.logoutBtn}`}>Logout</button>
        ) : (
          <Link to="/login" className={`${styles.navbarBtn} ${styles.loginBtn}`}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
