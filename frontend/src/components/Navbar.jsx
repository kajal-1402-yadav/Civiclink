import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.css";
import Symbol from "../assets/Symbol.png";

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
      {/* Left Logo */}
      <div className={styles.navbarLeft}>
        <div className={styles.iconContainer}>
          <div className={styles.iconCircle}>
            <img src={Symbol} alt="CivicLink Logo" />
          </div>
        </div>
        <span className={styles.navbarTitle}>CivicLink</span>
      </div>

      {/* Center Links */}
      <div className={styles.navbarCenter}>
        <Link to="/home" className={styles.navbarLink}>Home</Link>
        <Link to="/report" className={styles.navbarLink}>Report Issue</Link>
        <Link to="/issues-map" className={styles.navbarLink}>Map</Link>
        <Link to="/my-issues" className={styles.navbarLink}>My Issues</Link>
        <Link to="/api/public-issues" className={styles.navbarLink}>Community</Link>
      </div>

      {/* Right Auth */}
      <div className={styles.navbarRight}>
        {isLoggedIn ? (
          <button onClick={handleLogout} className={`${styles.navbarBtn} ${styles.logoutBtn}`}>
            Logout
          </button>
        ) : (
          <Link to="/login" className={`${styles.navbarBtn} ${styles.loginBtn}`}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
